Executar o que estiver dentro do código somente quando todo o HTML (DOM) da página estiver sido carregado:
````
document.addEventListener('DOMContentLoaded', function () {
    // código aqui
});
````

Exemplo básico de um Ajax (JS):
````
document.getElementById('enterpriseSelect').addEventListener('change', function() { // Quando o usuário selecionar a empresa

            let enterpriseId = this.value; // Captura o ID da empresa selecionada, ou seja, o valor do campo que foi selecionado
            let branchSelect = document.getElementById('branchSelect'); // Captura o ID do select do campo filial

            branchSelect.innerHTML =
                '<option>Carregando...</option>'; // Quando o usuário está selecionando a empresa o campo da filial aparece essa mensagem.

            fetch(`users/branchs/by-enterprise/${enterpriseId}`).then(response => response.json()).then(data => {

                    /* O fetch faz uma requisição http ao Laravel, através desta rota (branchs/by-enterprise/${enterpriseId}), para receber os dados, que retorna um json, depois o js recebe este json e o transforma em um objeto js (then(response => response.json())) */

                    // O then recebe a resposta da requisição anterior e a atribui, neste caso atribuiu o resultado do fetch e o transformou em um json
                    branchSelect.innerHTML = '<option value="">Selecione:</option>';

                    data.forEach(
                        branch => { // Depois, data (que contem um array com as informações obtidas), é lida pelo forEach, onde as informações de cada lida é passada para 'branch'

                            let option = document.createElement(
                                'option'
                            ); // document.createElement cria um elemento (option), mas ele fica só na memória, não vai para o DOM

                            option.value = branch
                                .id; // Value do option recebe o ID da branch (branch aqui é o parâmetro do forEach)
                            option.text = branch
                                .city; // Value do option recebe o ID da cidade (branch aqui é o parâmetro do forEach)

                            branchSelect.appendChild(option); // appendChild faz o elemento ir para o DOM

                        });

                })
                .catch(error => {
                    console.error(error);
                    branchSelect.innerHTML = '<option>Erro!</option>';
                })
        });
````
