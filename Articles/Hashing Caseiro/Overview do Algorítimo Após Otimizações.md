## Introdução

As últimas alterações registradas nesse blog (este post foi feito originalmente em um blog), retratam a redução de LOCs e complexidade cognitiva. Conseguimos reduzir a quantidade de linhas de código do sub-loop de **106** para apenas **19**. Alterações "em off" consistiram em adicionar mais dois algoritimos ao `_finalizer` (cross lane mixing e lane shuffle), que incrementaram os resultados em robustez do algoritimo, normalizando o chi2 multi-byte e a avalanche.

## Fixes após o último post

Após o último post, decidi realizar alguns testes (utilizando o teste disponibilizado [nesse gist](https://gist.github.com/Yyax13/bb90d152951d7b9e6ce3e4cf346b3188)) que, embora pouco assertivos em velocidade, serviram para identificar problemas estruturais.

O primeiro problema foi a absorção do source não funcionando corretamente, o `_mixStateWithSrc` tinha erros de lógica:

1.  Utilização de words de 8 bits como words de 32 bits: Durante a criação dos indexes (para o `minimix32`) utilizava três words `uint8_t`, onde se esperava as mesmas três words, mas de 32 bits. A utilização de tais tipos resulta em promoções de tipo zeradas ou com lixo de memória (um UB, Undefined Behavior), para exemplificar, suponhemos que de início teriamos o `curByte` com o valor `0xF1`, durante o uso dessas words, já promovidas para 32 bits, o algoritimo utiliza-as como `0x000000F1`. As mutações com bytes tão baixos resultavam em outputs nulos (`0x00000000`) após as mutações;
    
2.  Masking do source: Em algumas rotações (utilizando `rotr/l 32/16/8`) o "source" era mascarado no limite do shift. Legitimamente, mascaramos o shift em `n - 1`, onde `n` é o limite da word (por exemplo, em uma word de 32 bits, utilizamos a máscara com o valor de 31). Quando realizamos o mesmo mask no source (nas rotações, temos o source e o shift, onde ocorre `source << shift`, ou em assembly `shl r1, r2` sendo `r1` o source e `r2` o shift), limitamos a apenas `0x1F`, perdendo a informação restante. Por exemplo, se realizarmos `0xFFFFFFFF & 31`, teremos apenas `0x0000001F`, perdendo até `0xFFFFFFE0` em informação contida na word. Ao realizar o mask, a rotação pode facilmente zerar o valor.
    

### Solucionando o Problema da Mutação Nula

Ambos os erros resultavam em zerar as words sempre que chegavam no `_mixStateWithSrc`, o que resultava em um hash fixo independente do input (gerado pelo `dependency32` e `_finalizer`). Para solucionar, alterei a montagem das words e utilizei o `fmix32` para garantir que mesmo words zeradas seriam mixadas com constantes:

```c
// A mesma lógica se aplica a secByte e trdByte
// apenas alternando os indexes do src
uint32_t curByte =  src.b[i % src.len] |
                    (src.b[(i + 1) % src.len] << 8) |
                    (src.b[(i + 2) % src.len] << 16) |
                    (src.b[(i + 3) % src.len] << 24);

curByte = fmix32(curByte);
```

### Solucionando o Problema de Masking

O problema de masking se introduziu logo após a resolução do problema de promoção de tipos, na implementação original eu realizava:

```c
const struct minimix_src indexes = {
    .src = {
        curByte,
        secByte,
        word ^ rotr(curByte & 0x1F, secByte & 0x1F)
     }
};
```

No patch, eu optei por remover a dependência do state (`word ^ ...`) da estrutura indexes, já que ela seria responsável por introduzir words do source para que o state realizasse a absorção, e para variabilidade na terceira word do array, eu introduzi o produto da operação xor entre `curByte` e `secByte`. Essa alteração solucionou o problema do estado não absorvendo o source, e permitiu que eu iniciasse outras otimizações no código.

Após aplicar o patch, percebi, em testes, que a avalanche tinha diminuído significativamente, então decidi voltar atrás e re-integrar o estado na definição dos indexes (apenas no primeiro). Então a definição final ficou em:

```c
const struct minimix_src indexes = {
    .src = {
        curByte, 
        secByte, 
        word ^ rotr(curByte, secByte & 0x1F)
     }
};

const struct minimix_src secondIndexes = {
    .src = {
        curByte, 
        trdByte, 
        curByte ^ trdByte
    }
};
```

## Otimizações de Velocidade e Throughput

Durante os testes, para validar se tudo estava acontecendo como esperado, notei que a velocidade estava baixa, muito baixa (cerca de 580 hashes gerados por segundo, para inputs de 8 bytes, de acordo com a análise do [PR #47](https://github.com/ScorpionC2/ScorpionC2/pull/47)), e isso despertou uma dúvida: "Por que meu algorítimo é tão lento?".

### Análise Inicial

Durante a análise, eu utilizei *[perf](https://perfwiki.github.io/main/)* como profiler para entender o que estava acontecendo. Após uma rodada de análise superficial, com `perf report`, e otimizações simples, como reduzir rounds de mixers ou remover trechos custosos em cache/paralelismo, eu percebi que o resultado obtido de tais otimizações, não era significativo, e isso só podia ser uma coisa: todos os mixers fazem algo que é custoso.

Então eu decidi utilizar `perf annotate` e o annotate individual por símbolo dentro do `perf report`. O annotate me dava as instruções em hot path, direto em assembly, e para minha meia-surpresa, a instrução mais quente do programa era um `div`!

### Por que `div`?

Para acessar o array de bytes do source, eu utilizava operador módulo, que basicamente retorna o resto de uma divisão inteira (exemplo: 27 / 5 = 5 com resto 2), este operador se traduz em duas instruções assembly, `div` e `xor`. A instrução `div` serve justamente para dividir os inteiros dos registradores, já a `xor` roda antes da divisão, e serve para limpar o output para garantir que a divisão ocorra corretamente:

```plaintext
mov rax, 27
mov rbx, 5

xor rdx, rdx
div rbx

; rdx = 2
```

A divisão com `div` ou `idiv` sempre escreve o resultado em `rdx` (ou `edx` para 32 bits), e é nele em que se escreve o resto da divisão.

A operação `div` é computacionalmente custosa (por isso que em arrays de tamanho potência de dois, utiliza-se a operação bitwise `and`, como no exemplo: `state[i & (len - 1)]`), ao contrário de operações lógicas ou `add`/`sub`, e isso torna o programa que a utiliza mais lento. Após a análise com `perf annotate`, aproximadamente 5% do overhead estava em uma instrução de divisão (considerando a quantidade de instruções de um programa complexo, 5% em apenas uma é algo muito alto).

### Como resolver as divisões sem quebrar nada?

Simplesmente remover os operadores módulo já funcionaria muito bem para otimizar a velocidade, mas isso introduziria um novo problema: BoF e OOB Writing. BoF todos sabem o que é: escrever fora do buffer designado, e isso é OOB Writing (out of bound writing). Então como podemos otimizar isso sem perder a garantia de que vamos utilizar índices de dentro do buffer?

Pensando nisso eu procurei uma alternativa e misturei outras alternativas online para resolver esse problema. A grande parte das opções para contornar esse problema se tratavam de:

```c
// pseudo
if (!(index >= len)) {
    array[index]
}
```

Mas utilizar essa alternativa me priva de um dos benefícios do operador módulo, que seria voltar ao início do array após o overflow. Por exemplo, se eu tiver um array de tamanho 128 e quiser acessar o índice 200, o operador módulo me retorna o resto dessa divisão (nesse caso 72), que é um número dentro do array inicial, e isso funciona para qualquer caso. Outro exemplo, dessa vez com o índice superando o tamanho da array por mais que o dobro, em um array com length de 256, utilizando o operador módulo eu tenho como acessar o índice 83.721, o operador me retorna 9, que é válido dentro dos 256.

Então eu precisava de outra alternativa ao operador módulo, procurando eu encontrei isso:

```c
static inline size_t wrap_idx(size_t idx, size_t len) {
    if (idx >= len)
        idx &= (len - 1);

    return idx;
}
```

Essa função utiliza a operação bit-wise em `idx` com o valor de `len`, e essa abordagem até funciona mas não traz o mesmo resultado do operador módulo. Pensando nisso eu desenvolvi esse wrapper:

```c
static inline size_t wrap_idx(size_t idx, size_t len) {
    while (idx >= len)
        idx -= len;

    return idx;
}
```

Pode parecer estranho, mas utilizando while, o algoritmo ficou mais rápido do que o que utiliza apenas um if. Tirando dúvidas com desenvolvedores low-level experientes que entendem de otimização, entendi que mesmo utilizando while. Para entender isso, precisamos saber que o operador módulo e o `&= len - 1` funcionam muito bem quando `len` é potência de dois, mas em hashing esse nem sempre é o caso, principalmente no tratamento do input, por isso a alternativa com `wrap_idx` quase sempre vai funcionar, ao longo do código o maior índice usado foi `i + 44`, sendo que `i` é `src.len`, o que significa que o máximo de iterações no while do `wrap_idx` será de uma iteração para `src.len >= 44` e duas iterações para `src.len < 44`.

### Substituindo os operadores módulo

Os operadores módulo são utilizados em alguns mixers e no `_mixStateWithSrc`, então eu facilmente usei dois regexps para substituir:

```plaintext
Se src for bytes_t*:

%s/\v\((i \+ [0-9]*)\) \% src-\>len/wrap_idx\(\1, srcLen\)/gc

Se src for bytes_t:

%s/\v\((i \+ \d+)\) \% src.len/wrap_idx(\1, srcLen)/gc
```

## Mudanças Futuras

No futuro, eu gostaria de mudar algumas coisas como:

1.  O uso de `_mixState` antes de absorver o source: É inútil mixar o state, nesse ponto ele é constante baseando-se na seed, a função deveria ser chamada após a absorção ou removida;

2.  Mudar os nomes estranhos: Eu vou mudar `_mixStateWithSrc` para simplesmente `absorb` e mudar `_mixState` para simplesmente `mix`. Outras coisas que poderiam mudar seria o `_getState` e o `_seedState` que podem ter esse prefixo removido;

3.  Refatorar a ordem de execução dos finalizers: Seria melhor eu fazer o lane mixing antes do self mixing, que por sua vez deveria ser refatorado para não descartar metade do `state[i]` como acontece hoje, e definir um chunk (de 4 words por exemplo) como lane, ha que o atual lane mix não faz muito mais do que operações na própria word.


## Conclusão

Eu sou louco, por favor alguém me ensina a usar claude-code.