## Introdução

Durante o desenvolvimento do [ScorpionC2](https://github.com/ScorpionC2/ScorpionC2), optei por desenvolver meu próprio algorítimo de hashing customizado, a qual posteriormente nomeei como ***ScorpionX*** (originalmente, o nome seria *Scorpion1024*, *Scorpion128*, e por aí vai, mas com a implementação de *settings* mutáveis, decidi resumir para ScorpionX e realocar o tamanho para as configurações). A criação de hashes se dava por um algorítimo de cerca de 680 linhas, que surpreendentemente tinha resultados bons em testes (como visto no PR [#26](https://github.com/ScorpionC2/ScorpionC2/pull/26#issuecomment-4069647725)).

Recentemente, ao analisar o código utilizando o [SonarQube/Cloud](https://www.sonarsource.com/products/sonarqube/cloud/), percebi uma complexidade cognitiva elevada na função de hashing, o que me levou a refatorar o código.

Grande parte da refatoração está pronta, já limpei a função bem, restando apenas um *for loop* que contém lógica de mixing e um *for loop* que constrói o payload no output. No entanto, o loop restante adequa-se em **361** LOCs (lines of code), possuindo no pior caso, lógica aninhada em um loop aninhado dentro de quatro outros loops. O maior sub-loop ocupa **106** linhas que realizam o mixing dentro da word sob iteração (quebrar o `uint32_t` em vários `uint16_t` e `uint8_t`, realizar mixing internamente e remontar o `uint32_t` original).

## Refatorando o maior sub-loop

Para realizar a refatoração do sub-loop, eu precisaria alcançar um resultado semelhante em nos testes (de avalanche, entropia, difusão, etc) desacoplando a lógica e utilizando tanto de funções auxiliares quanto de funções de mixing (presentes em `shared/utils/mixing`) separadas da função principal, incrementando a velocidade em ao menos 25% com margem de degradação da qualidade criptográfica de até 10%.

Agora que já estabeleci o escopo da refatoração, bora por a mão na massa (ou no teclado se você não quiser codar usando farinha de trigo e água)! Eu já tenho uma função que faz mixing interno (quebra um `uint32_t` em quatro `uint8_t` e realiza mixing simples e passa as mini-words processadas para a função `arxmix8`:

```c
void arxmix8(uint8_t *word, uint32_t srcWord) {
    uint8_t msw0 = srcWord & 0xFF;
    uint8_t msw1 = (srcWord >> 8) & 0xFF;
    uint8_t msw2 = (srcWord >> 16) & 0xFF;
    uint8_t msw3 = (srcWord >> 24) & 0xFF;

    uint8_t old = *word;

    *word += rotl8(msw0, *word);
    *word ^= rotr8(msw1, *word);
    *word *= msw2 ^ rotl8(*word, msw0);
    *word ^= msw3 * rotr8(msw1, *word + 1);
    *word *= rotl8(*word, msw0);

    *word ^= rotr8(*word, old);
}

void minimix32(const struct minimix_src src, uint32_t *pword) {
    uint32_t curByte = src.src[0];
    uint32_t word = *pword;

    uint8_t mw0 = word & 0xFF;
    uint8_t mw1 = (word >> 8) & 0xFF;
    uint8_t mw2 = (word >> 16) & 0xFF;
    uint8_t mw3 = (word >> 24) & 0xFF;

    mw0 ^= rotl8(src.src[1], 3) + mw2;
    mw1 ^= rotr8(curByte, 5) + src.src[2];
    mw2 ^= mw0 * (curByte & 0xFF);
    mw3 ^= mw1 ^ 0xC3;

    arxmix8(&mw0, src.src[1]);
    arxmix8(&mw1, src.src[0]);
    arxmix8(&mw2, src.src[2]);
    arxmix8(&mw3, word);

    *pword = mw0 | (mw1 << 8) | (mw2 << 16) | (mw3 << 24);
}
```

Eu poderia muito bem apenas utilizar isso, mas vou pelo jeito mais difícil, criar um `minimix16` e um `arxmix16` para replicar a "lógica" do sub-loop inicial.

Não seria muito difícil criar um `minimix16` simplesmente quebrando o `uint16_t *pword` em dois `uint8_t`, mas se fizermos isso termos menos margem para derivar os bytes menores e misturá-los de forma correta, para resolver, decidi então criar uma versão de 16 bits do `flavourmix32`:

```c
void flavourmix32(uint32_t *word, uint32_t flavour) {
    uint32_t w = *word;

    for (int i = 0; i < 32; i++) {
        smallmix32(&w);
        smallmix32(&flavour);

        w ^= flavour;
        w *= rotl(flavour, w);
        w ^= rotr(w, flavour);

        flavour ^= *word;

        w *= w ^ rotl(flavour, 0xDEADBEEF);
        w ^= w * rotr(flavour, w);
        w *= w << (rotl(flavour, 0x13371337) & 0x1F);

        w ^= *word;
    }

    *word = w;
}
```

### Idealizando o flavourmix16

A ideia é simples: eu utilizaria o novo `flavourmix16` para gerar outro `uint16_t` que seria quebrado novamente em dois `uint8_t`, dessa forma, eu teria a quantidade original de bytes para realizar um mixing similar ao `minimix32`. Mas o que eu passaria para o `flavourmix16` para gerar as words novas sem me preocupar com words identicas ou semelhantes? Isso é simples: o `src`, que é um array estático, com capacidade 3, de 32 bits por membro.

Para começar, eu vou criar o `flavourmix16` que, por decisão própria e 85% aleatória, receberá o protótipo `void flavourmix16(uint16 *word, uint16_t flavour);`, seguindo o padrão e evitando perda de dados ao introduzir tipos maiores no mixing de tipos menores.

### Criando o smallmix16

Para o funcionamento do `flavourmix16`, eu preciso de um `smallmix16`, que recebe apenas a word inicial e realiza o mixing utilizando apenas a word inicial, sem nada externo:

```c
void smallmix16(uint16_t *word) {
    uint16_t w = *word;

    for (int i = 0; i < 16; i++) {
        w ^= 0x1337;
        w *= rotr16(w, 0xDEAD);
        w ^= rotl16(w, 0xBEEF);

        w *= w ^ rotl16(w, 0x0539);
        w ^= w * rotr16(w, 0xF00F);
        w *= w >> (rotl16(w, 0xABCD) & 0xF);

        w ^= *word;
    }

    *word = w;
}
```

Explicarei o algoritimo de forma resumida. Ele realiza 16 iterações (muito mais iterações não tem utilidade real), divididas em três estágios:

1.  Mixing com constantes rotacionadas: O algorítimo faz mixing utilizando constantes através das funções `rotl16` e `rotr16`, sempre seguindo o padrão de quebra de linearidade, adicionando multiplicações entre as operações xor;
2.  Mixing com estado e constantes: O algoritmo faz mixing com o estado anterior, atualizando a word com uma derivação de seu estado anterior e uma operação que utiliza constantes (geralmente rotações);
3.  Xor com o estado inicial: O estado inicial da word, dereferenciada do ponteiro `*word`, é introduzido ao final de cada iteração através de uma operação xor que dereferencia o ponteiro dinamicamente.


### Criando o flavourmix16

Agora que a função `smallmix16` já existe, podemos implementar o `flavourmix16`:

```c
void flavourmix16(uint16_t *word, uint16_t flavour) {
    uint16_t w = *word;

    for (int i = 0; i < 16; i++) {
        smallmix16(&w);
        smallmix16(&flavour);

        w ^= flavour;
        w *= rotr16(flavour, w);
        w ^= rotl16(w, flavour);

        flavour ^= *word;

        w *= w ^ rotr16(flavour, 0xDEAD);
        w ^= w * rotl16(flavour, w);
        w *= w << (rotr16(flavour, 0x1337) & 0xF);

        w ^= *word;
    }

    *word = w;
};
```

Um rápido overview da implementação: a função consiste de 16 iterações divididas em cinco etapas:

1.  Mixing do flavour e da word utilizando o estado atual: A word e o flavour em seu estado no início da iteração passam pelo algorítimo `smallmix16`;
    
2.  Mixing da word com o flavour: É realizado o mixing da word com o flavour e suas rotações com constantes, sempre seguindo a ideia de não-linearidade da alternância de operações;
    
3.  Mixing do flavour com a word em seu estado inicial: Para alternar o estado do flavour antes do fim da iteração, com o objetivo de reduzir a linearidade de utilizar a mesma seed em várias operações, utiliza-se a word em seu estado inicial diretamente da dereferência do ponteiro;
    
4.  Mixing da word com estado e rotações com constantes: A word é misturada com um valor derivado do estado anterior, este valor vem de mixing do estado com o resultado de rotações que utilizam o flavour e constantes;
    
5.  Xor com o estado do ponteiro dereferenciado em runtime: Para finalizar cada iteração, a word recebe, através da operação xor, seu estado inicial, utilizando o valor dereferenciado do ponteiro em runtime.
    

### Hora da verdade: idealizando o minimix16

Após criarmos todas as dependências do `minimix16`, podemos iniciar sua implementação. Retomando rapidamente, iremos utilizar o `flavourmix16` para criar uma nova word de 16 bits, que será utilizada no mixing das mini-words de 8 bits. O ideal seria ter mais words de 32 bits no input (`struct minimix_src src`), para aumentar a variabilidade dos inputs e entropia do output, mas isso é inviável, então teremos que depender do seed em até 60% para a criação da nova word.

A utilização de seeding para criação da nova word, consiste em derivar uma word do produto de seed e source, sem incluir a `pword` em sua geração. Para isso, deveremos inserir a seed na nova word, passando-a como flavour para o `flavourmix16`, reservando o espaço de word para uma rotação entre diferentes indíces do source:

```c
uint16_t nWord = rotl16(src.src[1], src.src[2]);
flavourmix16(&nWord, 0x9FB6);
```

Vale a pena ressaltar que a função de rotação sanitiza o dado de forma correta, evitando overflow, underflow ou promoções de tipo indesejadas, através do masking dos valores passados pelo usuário.

### Finalmente? Implementando o minimix16

Após criarmos a nossa `nWord` a implementação segue o padrão já demonstrado anteriormente, quebrar as words em mini-words de tamanho menor (8 bits, a.k.a. 1 byte) e passar esse dado para o `arxmix8`:

```c
void minimix16(const struct minimix_src src, uint16_t *pword) {
    uint32_t curByte = src.src[0];
    uint16_t word = *pword;

    uint16_t nWord = rotl16(src.src[1], src.src[2]);
    flavourmix16(&nWord, 0x9FB6);

    uint8_t mw0 = word & 0xFF;
    uint8_t mw1 = (word >> 8) & 0xFF;
    uint8_t mnw0 = nWord & 0xFF;
    uint8_t mnw1 = (nWord >> 8) & 0xFF;

    mw0 ^= rotr8(src.src[1], 4) + mnw1;
    mw1 ^= rotl8(curByte, 3) + src.src[2];
    mnw0 ^= mw0 * (curByte & 0xFF);
    mnw1 ^= mw1 ^ 0xBB;

    arxmix8(&mw0, src.src[1]);
    arxmix8(&mw1, src.src[0]);
    arxmix8(&mnw0, src.src[2]);
    arxmix8(&mnw1, word);

}
```

### Implementando o summarize16

Perceba que não atribuí o valor de volta a `*pword`, isso se deve ao fato de que eu tenho 32 bits espalhados entre quatro words de 8 bits, mas tenho que retornar estes 32 bits para uma word de 16 bits, para isso, vou implementar um novo algorítimo chamado `summarize16`, que recebe uma word de 32 bits e retorna uma de 16 bits mantendo difusão e entropia.

```c
uint16_t summarize16(uint32_t word) {
    uint16_t a = word & 0xFFFF;
    uint16_t b = (word >> 16) & 0xFFFF;

    smallmix16(&a);
    smallmix16(&b);

    uint8_t a0 = a & 0xFF;
    uint8_t a1 = (a >> 8) & 0xFF;
    uint8_t b0 = b & 0xFF;
    uint8_t b1 = (b >> 8) & 0xFF;

    arxmix8(&a0, word);
    arxmix8(&a1, word);
    arxmix8(&b0, word);
    arxmix8(&b1, word);

    uint16_t out = 0;

    for (int i = 7; i >= 1; i -= 2) {
        out <<= 1;
        out |= (a0 >> i) & 1;

        out <<= 1;
        out |= (b1 >> i) & 1;

        out <<= 1;
        out |= (a1 >> i) & 1;

        out <<= 1;
        out |= (b0 >> i) & 1;
    }

    return out;
}
```

Explicando de forma rápida a função, ele separa a word de 32 bits em duas words de 16 bits, roda o `smallmix16` em a e b, seguido da divisão das words de 16 bits em 4 words de 8 bits, seguidos de `arxmix8` utilizando a word original (de 32 bits), e em seguida descarta metade dos bits, retornando uma "mistura" de bits dos corners das words.

### Atribuindo o valor de retorno do minimix16

Agora que podemos atribuir o valor de retorno de forma independente sem necessáriamente perder tantos dados (utilizando cerca de 4 bits de cada word, especificamente dos corners), podemos atribuir o valor vindo do `summarize16` ao ponteiro `*pword` dereferenciado em runtime:

```c
*pword = summarize16(mw0 | (mw1 << 8) | (mnw0 << 16) | (mnw1 << 24));
```

## Escrevendo o for que vai substituir o sub-loop

Agora temos todos os recursos necessários, então já podemos refatorar o loop que causa 80% do problema de complexidade cognitiva. Este loop ficará dentro da função `_finalizer`, que será o substituto do loop principal:

```c
void _finalizer(int wordLen, uint32_t *state) {
    uint32_t mask = wordLen - 1;

    for (int i = 0; i < wordLen; i++) {
        struct minimix_src mixSrc = {
            .src = { 
                state[(i + 83) & mask],
                state[(i + 17) & mask],
                state[(i + 27) & mask]
            }
        };
        
        minimix32(mixSrc, &state[i]);

        uint16_t a = state[i] & 0xFFFF;
        uint16_t b = (state[(i + 5) & mask] >> 16) & 0xFFFF;

        minimix16(mixSrc, &a);
        minimix16(mixSrc, &b);

        state[i] = a | b;
    }
}
```

Explicando rapidamente, o for em questão, cria a estrutura `struct minimix_src mixSrc` que será utilizada ao longo dos três mixings, utilizando os mesmos índices do for original. Logo em seguida, um `minimix32` é executado no `state[i]`, que é uma word de 32 bits do estado do hash, utilizando o `mixSrc`. Após isso, utilizando metade do `state[i]`, como `a`, e metade do state\[i + 5\], como b, utilizamos o `minimix16` em ambas as words e então reconstruímos o `state[i]` utilizando-as como base.

## Conclusão

Vimos nesse artigo, que nem sempre a lógica mais complexa é a melhor. Após refatorar **106** linhas em apenas **19**, vimos como manter um código simples e legível é simples, caracterizando-se falta de vontade quando não querem realizar refatorações de melhora de manutenibilidade.

Agradeço a leitura, aguardo vocês novamente no próximo artigo, até mais!