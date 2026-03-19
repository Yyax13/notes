Executar o que estiver dentro do código somente quando todo o HTML (DOM) da página estiver sido carregado:

```js
document.addEventListener("DOMContentLoaded", function () {
  // código aqui
});
```

Exemplo básico de um Ajax (JS):

```js
document
  .getElementById("enterpriseSelect")
  .addEventListener("change", function () {
    // Quando o usuário selecionar a empresa

    let enterpriseId = this.value; // Captura o ID da empresa selecionada, ou seja, o valor do campo que foi selecionado
    let branchSelect = document.getElementById("branchSelect"); // Captura o ID do select do campo filial

    branchSelect.innerHTML = "<option>Carregando...</option>"; // Quando o usuário está selecionando a empresa o campo da filial aparece essa mensagem.

    fetch(`users/branchs/by-enterprise/${enterpriseId}`)
      .then((response) => response.json())
      .then((data) => {
        /* O fetch faz uma requisição http ao Laravel, através desta rota (branchs/by-enterprise/${enterpriseId}), para receber os dados, que retorna um json, depois o js recebe este json e o transforma em um objeto js (then(response => response.json())) */

        // O then recebe a resposta da requisição anterior e a atribui, neste caso atribuiu o resultado do fetch e o transformou em um json
        branchSelect.innerHTML = '<option value="">Selecione:</option>';

        data.forEach((branch) => {
          // Depois, data (que contem um array com as informações obtidas), é lida pelo forEach, onde as informações de cada lida é passada para 'branch'

          let option = document.createElement("option"); // document.createElement cria um elemento (option), mas ele fica só na memória, não vai para o DOM

          option.value = branch.id; // Value do option recebe o ID da branch (branch aqui é o parâmetro do forEach)
          option.text = branch.city; // Value do option recebe o ID da cidade (branch aqui é o parâmetro do forEach)

          branchSelect.appendChild(option); // appendChild faz o elemento ir para o DOM
        });
      })
      .catch((error) => {
        console.error(error);
        branchSelect.innerHTML = "<option>Erro!</option>";
      });
  });
```

<hr>
<hr>
<hr>

### TYPESCRIPT REQUISITOS

- Node JS 22 ou superior;
- MySql última versão.

<hr>

### TYPESCRIPT ANOTAÇÕES

Criar o package.json:

```bash
npm init
```

Instalar o TypeScript como uma dependência de desenvolvimento:

```bash
npm install --save-dev typescript
```

Criar o arquivo 'tsconfig.json', executar quando o TypeScript foi instalado somente no projeto:

```bash
npx tsc --init
```

Compilar os arquivos TypeScript:

```bash
npx tsc
```

Fazer com que o compilador fique monitorando os arquivos TypeScript e compile-os automaticamente a partir de qualquer alteraçaõ feita:

```bash
npx tsc -watch
```

Executar o arquivo JavaScript compilado:

```bash
node CAMINHO_DO_ARQUIVO
```

Diferença de var, const e let:

```js
var exemplo = "exemplo"; // Pode ter o valor alterado e pode ser usada em qualquer local.
const exemplo = "exemplo"; // Não pode ter o valor alterado e funciona em qualquer local.
let exemplo = "exemplo"; // Pode ter o valor alterado mas funciona somente dentro da função que tiver.
```

Criar objeto:

```js
// Criar variável do tipo objeto
interface Client {
    name: string;
    amount: number;
}

let client: Client {
    name: 'Lucas',
    amount: 20
};
```

<hr>

### PASSOS PARA RODAR O PROJETO TYPESCRIPT (depois de tê-lo clonado)

Instalar o restante das dependencias necessárias (isto instala todas as dependencias que estiverem listadas no arquivo package.json):

```bash
npm install
```

<hr>

### PASSOS PARA ATUALIZAR AS DEPENDENCIAS DO PROJETO

Para atualizar as dependencias de forma interativa, basta dar este comando no terminal:

```bash
npx npm-check-updates -i
```

<hr>

### REACT REQUISITOS

- Node JS 22 ou superior;
- NPX última versão.

<hr>

### PASSOS PARA RODAR O PROJETO REACT (depois de tê-lo clonado)

Instalar o restante das dependencias necessárias:

```bash
npm install
```

<hr>

### REACT ANOTAÇÕES

Criar o projeto com React e Next JS:

```bash
npx create-next-app@latest .
```

Rodar o projeto (acessá-lo em: http://localhost:3000/):

```bash
npm run dev
```

Síntaxe básica para criar uma arrow function:

```js
const Home = () => {
  return (
    <main>
      <h2>Bem-vindo!</h2>
    </main>
  );
};
export default Home;
```

Passar parâmetro para uma função (props) e utilizando children, ou seja, escrever algo dentro do objeto na view.
Criando-a no componente:

```js
import { ReactNode } from "react"; // se for utilizar children precisa importá-lo.

interface UserProps{
    name: string;
    children?: ReactNode; // O "?" informa que o elemento do objeto não é obrigatório.
}

const User = ({name, children}: UserProps) => {
    return (
        <div>
            <p>Usuário: {name}</p>
            {children && <div>{children}</div>}
        </div>
    )
}
export default User;
```

Depois, imprimindo-os na view:

```js
import User from "../components/User";

const Home = () => {
  const userName = "Lucas";

  return (
    <main>
      <User name={userName}>
        <p>Utilizando Children</p>
      </User>
      <h2>Bem-vindo!</h2>
    </main>
  );
};

export default Home;
```

Utilizando o useState,
Precisa informar o 'use client' para importá-lo:

```js
"use client";
import { useState } from "react";

const Home = () => {
  const [nameUser, setNameUser] = useState("Lucas"); // o valor padrão começa com "Lucas".

  return (
    <main>
      <p>Nome: {nameUser}</p>
      <button onClick={() => setNameUser("Messi")}>Alterar</button> // sempre
      que for alterá-lo usa-se o setNameUser passando no parâmetro o novo valor
      que irá receber.
      <h2>Bem-vindo!</h2>
    </main>
  );
};

export default Home;
```

Utilizando o useEffect,
Ele realiza os comportamentos passados para ele caso o seu segundo parâmetro sofra quaisquer alterações:

```js
"use client";

import { useEffect, useState } from "react";

const Home = () => {
  const [productId, setProductId] = useState(1);
  const [nameId, setNameId] = useState("Notebook");
  const [priceId, setPriceId] = useState(1000);
  const [userId, setUser] = useState({
    id: 0,
    name: "Indefinido",
  });

  function searchProduct() {
    setNameId("Notebook atualizado");
    setPriceId(5000);
    setProductId(10);
    setUser({
      id: 10,
      name: "Lucas",
    });
  }

  useEffect(() => {
    searchProduct();
  }, [productId]); // Quando a página recarregar o useEffect será executado, após isto ele será chamado somente se productId sofrer alteração. Caso queira que ele rode somente quando a página carregar usa-se [].

  return (
    <main>
      <p>ID do produto: {productId}</p>
      <p>Nome do produto: {nameId}</p>
      <p>Preço do produto: {priceId}</p>
      <hr />

      <p>ID do usuário: {userId.id}</p>
      <p>Nome do produto: {userId.name}</p>
    </main>
  );
};

export default Home;
```

URL amigável (somente anotação, funcionalidade do Next JS, não do React):

```
 - O nome da pasta define a url (ex.: Dashboard/page.tsx => URL: /dashboard);
 - O nome do arquivo precisa ser um destes para funcionar:
 | - page.tsx => página;
 | - layout.tsx => layout;
 | - loading.tsx => loading;
 | - error.tsx => error.
 - O nome da constante do arquivo NÃO define a URL.

Resumo: o nome do diretório define a URL, contanto que o nome do arquivo seja um dos 4 citados acima, lembrando que eles precisam estar dentro do diretório src/app.
```

Formulário em React (para validá-lo):

```js
Para receber o evento:

const Exemplo = (e) => {
    e.preventDefault();
}

// Utilizar e: any => vulnerável, isto desliga o ts e ele não valida a tipagem deixando o método menos seguro.
// Utilizando e: React.FormEvent<HTMLFormEvent> => seguro, usa o ts e valida a tipagem, deixando o método seguro.
```

Mais anotações formulário em React e TypeScript:

```js
const Home = () => {

  interface formData {
    nameUser: string,
    emailUser: string
  };

  const [data, setData] = useState<formData>({
    nameUser: '',
    emailUser: ''
  });

  /* Recebe os dados dos campos do formulário: */
  /* Obs: "React.ChangeEvent<HTMLInputElement>" espera alguma alteração no evento (React.ChangeEvent) e essa alteração vem de um input de um formulário (<HTMLInputElement>). */
  const valueInput = (e: React.ChangeEvent<HTMLInputElement>) => setData({
    ...data, // isso copia tudo o que há em data, ou seja, é como se valueInput agora possuísse:
    // nameUser: '',
    // emailUser: '',
    // demais campos...

    // E aqui, e.target.name recebe o nome do campo do formulário, se o nome bater com o nome do objeto (de setData) ele o substitui, se não apenas adiciona mais um campo no objeto.
    [e.target.name]: e.target.value
  });


  /* "React.SubmitEvent<HTMLFormElement>" é uma tipagem ts que refere à um evento de um formulário (por estar usando TypeScript não é recomendado usar any.).*/
  const addUser = (e: React.SubmitEvent<HTMLFormElement>) => {

    e.preventDefault();

    // Manipular os dados recebidos:
    console.log("Nome" + data.nameUser);
    console.log("E-mail" + data.emailUser);
  }

  return(
    <main>
        <form onSubmit={addUser}>

          <label htmlFor="name">Nome:</label>
          <input type="text" name="nameUser" placeholder="Ex.: Lucas Vinicius" onChange={valueInput} /><br /><br />

          <label htmlFor="email">E-mail:</label>
          <input type="email" name="emailUser" placeholder="Ex.: exemplo@dominio.com" onChange={valueInput} /><br /><br />

          <input type="submit" value="Cadastrar" />

        </form>
    </main>
  )
}

export default Home;
```

Ligar o servidor em TS usando Express:

```bash
import express, {Request, Response} from "express";

// Utilizando o express como funcão pode-se usar a constante app para gerenciar rotas e ligar o servidor.
const app = express();

// Inicia o servidor na porta 8080.
app.listen(8080, () => {
    console.log("Servidor iniciado na porta 8080.");
});
```
