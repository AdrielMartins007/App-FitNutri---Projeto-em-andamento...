document.addEventListener('dataReady', () => {
console.log("Login.js pronto para operar.");

// Armazena temporariamente os dados da etapa 1
let dadosEtapa1 = {};

// Navegação entre login e cadastro
document.getElementById("back-to-login").addEventListener("click", () => {
  document.getElementById("register-step1").classList.add("hidden");
  document.getElementById("register-step2").classList.add("hidden");
  document.getElementById("login-screen").classList.remove("hidden");
});

document.getElementById("go-to-register").addEventListener("click", () => {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("register-step1").classList.remove("hidden");
});

/*
// Avançar para etapa 2
document.getElementById("step1-form").addEventListener("submit", function (e) {
  e.preventDefault();
  document.getElementById("register-step1").classList.add("hidden");
  document.getElementById("register-step2").classList.remove("hidden");
});
*/

// Voltar para etapa 1
document.getElementById("back-to-step1").addEventListener("click", () => {
  document.getElementById("register-step2").classList.add("hidden");
  document.getElementById("register-step1").classList.remove("hidden");
});





//lógica de login

 document.getElementById("login-button").addEventListener("click", function (e) {
        e.preventDefault();
        const email = document.getElementById("login-email").value.trim();
        const senha = document.getElementById("login-password").value.trim();

        const usuario = dataService.login(email, senha); // Usa o serviço

        if (usuario) {
            console.log("Login bem-sucedido para:", usuario.email);
            concluirAutenticacao(usuario);
        } else {
            const errorDiv = document.getElementById("login-error");
            errorDiv.textContent = "E-mail ou senha incorretos.";
            errorDiv.classList.remove("hidden");
        }
    });


    // Avançar para etapa 2
document.getElementById("step1-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const inputs = e.target.querySelectorAll("input, select");
  dadosEtapa1 = {};
  inputs.forEach((input) => {
    if (input.type !== "submit") {
      dadosEtapa1[input.placeholder?.toLowerCase() || input.name] = input.value;
    }
  });

  document.getElementById("register-step1").classList.add("hidden");
  document.getElementById("register-step2").classList.remove("hidden");
});


// Concluir Cadastro e Salvar
document.getElementById("step2-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    // 1. Monta o objeto do novo usuário com os dados do formulário
    const dadosEtapa2 = {};
    // ... (seu código para ler os dados do form continua igual) ...
    for (let el of e.target.elements) {
      if (el.type === "checkbox" || el.type === "radio") {
        if (el.checked) {
          if (!dadosEtapa2[el.name]) dadosEtapa2[el.name] = [];
          dadosEtapa2[el.name].push(el.nextSibling.textContent.trim());
        }
      } else if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        if (el.name || el.placeholder) {
          dadosEtapa2[el.name || el.placeholder?.toLowerCase()] = el.value;
        }
      }
    }

    const emailNovo = dadosEtapa1.email;
        const usuariosExistentes = dataService.getUsuarios();
        if (usuariosExistentes.find(u => u.email === emailNovo)) {
            alert("Este e-mail já está cadastrado.");
            return;
        }

        const novoUsuario = {
            id: dataService.getProximoIdUsuario(), // Usa o serviço
            ...dadosEtapa1,
            ...dadosEtapa2,
        };

    const usuarioCadastrado = dataService.cadastrarUsuario(novoUsuario); // Usa o serviço
        
        alert("Cadastro realizado com sucesso!");
        concluirAutenticacao(usuarioCadastrado);
  });


});///


// Esta função agora recebe o usuário como parâmetro
function concluirAutenticacao(usuario) {
    if (!usuario) {
        console.error("Tentativa de concluir autenticação sem um usuário válido.");
        return;
    }

    // Atualiza o nome do usuário na tela
    const nomeUsuario = usuario["nome completo"] || "Usuário";
    document.querySelectorAll(".user-nome").forEach((span) => {
        span.textContent = nomeUsuario;
    });

    // Dispara um evento para que 'refeicoes.js' saiba que pode renderizar
    document.dispatchEvent(new CustomEvent('loginSuccess', { detail: { usuario } }));

    // Mostra a tela principal do app
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("register-step1").classList.add("hidden");
    document.getElementById("register-step2").classList.add("hidden");
    document.querySelector(".app-container").classList.remove("hidden");
    document.querySelector(".bottom-nav").classList.remove("hidden");
}


/*
function atualizarRefeicoesNaTela() {
  console.log("Atualizando refeições na tela...");
  const id_user = usuario.id;
  console.log(id_user);
  refeicoes = []
  for (let item of users) {
    if (item.id === id_user) {
       refeicoes = item.refeicoes || null;
      // console.log
    }
  }

  console.log('refeicoes:', refeicoes);

  if (!refeicoes) {
    console.error("Nenhuma refeição para exibir.");
    return;
  }

  const titulosParaEncontrar = {
    cafe_da_manha: "Café da Manhã",
    almoco: "Almoço",
    jantar: "Jantar",
  };

  for (const tipoRefeicao in titulosParaEncontrar) {
    const titulo = titulosParaEncontrar[tipoRefeicao];
    const refeicaoSorteada = refeicoes[tipoRefeicao];

    if (!refeicaoSorteada) continue;

    const cardRefeicao = document.querySelector(
      `[data-meal-title="${titulo}"]`
    );

    if (cardRefeicao) {
      const containerPai = cardRefeicao.closest(".slide-in");
      const containerAlimentos = containerPai.querySelector(
        "[data-food-container]"
      );

      containerAlimentos.innerHTML = "";

      // **PASSO 1: INICIA UMA VARIÁVEL PARA SOMAR AS CALORIAS**
      let totalCaloriasDaRefeicao = 0;
      let position = 0;

      refeicaoSorteada.alimentos.forEach((alimento) => {
        // **PASSO 2: SOMA AS CALORIAS DE CADA ALIMENTO**
        // Usamos `parseFloat` para garantir que estamos somando números.
        totalCaloriasDaRefeicao += parseFloat(alimento.calorias) || 0;

        const novoItemHTML = `
    <div class="flex justify-between items-center" data-food-item data-food-id="${
      alimento.nome
    }">
      <div class="flex items-center flex-grow">
        <button class="remover-alimento-btn" onclick="removerItemRefeicao('${position}|${tipoRefeicao}')">x</button>

        <div class="w-10 h-10 bg-gray-100 rounded-lg mr-3 flex items-center justify-center">
          <span class="text-xl">${alimento.icone || "🍽️"}</span>
        </div>
        <div class="flex-grow">
          <input type="text" id="${position}|${tipoRefeicao}|nome"  class="font-medium" value="${
          alimento.nome
        }" onchange="updateRefeicao(${position}, '${tipoRefeicao}', 'nome')"></input>
          <p class="text-xs text-gray-500">
            <input type="text" id="${position}|${tipoRefeicao}|porcao" class="porcao-editavel" value=${
          alimento.porcao
        } onchange="updateRefeicao(${position}, '${tipoRefeicao}', 'porcao')"></input>• 
            <span contenteditable="false" class="calorias-editaveis">${
              alimento.calorias || 0
            }</span> kcal
          </p>
        </div>
  `;
        containerAlimentos.insertAdjacentHTML("beforeend", novoItemHTML);
        position += 1;
      });

      // **PASSO 3: ATUALIZA O TOTAL DE CALORIAS NO CABEÇALHO DO CARD**
      const elementoCalorias = containerPai.querySelector(
        "[data-meal-time-calories]"
      );
      if (elementoCalorias) {
        // Pega a parte do horário (ex: "07:30") para não perdê-la
        const horario = elementoCalorias.textContent.split("•")[0].trim();
        // Atualiza o texto com o novo total de calorias calculado
        elementoCalorias.textContent = `${horario} • ${totalCaloriasDaRefeicao} kcal`;
      }
    } else {
      console.warn(`Card para "${titulo}" não foi encontrado no HTML.`);
    }
  }
  ativarManipuladoresDeRefeicao();
}
  */

/*
function updateRefeicao(position, tipoRefeicao, campo) {
  let tex = `${position}|${tipoRefeicao}|${campo}`;

  let item = document.getElementById(tex);
  let novoValor = item.value;
  // querySelector(`[id="${position}|${tipoRefeicao}|${campo}"]`);

  console.log(item.value);
  // -----------------------------------

  // Passo 2: Procurar o usuário pelo ID
  const usuario = listaUsuarios.find((u) => u.id === usuario_.id);
  if (!usuario) {
    console.error("Usuário não encontrado.");
    return;
  }

  // Divide a chave
  const indice = parseInt(position);

  // Verifica se existe a refeição e o alimento
  if (!usuario.refeicoes[tipoRefeicao]) {
    console.error(`Refeição "${tipoRefeicao}" não encontrada.`);
    return;
  }

  const alimentos = usuario.refeicoes[tipoRefeicao].alimentos;
  if (!alimentos || !alimentos[indice]) {
    console.error(`Alimento na posição ${indice} não encontrado.`);
    return;
  }

  // Atualiza o campo desejado
  alimentos[indice][campo] = novoValor;

 
  

  console.log(`Campo "${campo}" atualizado com sucesso!`);

}

function removerItemRefeicao(param){

  let position = param.split("|")[0];
  let tipoRefeicao = param.split("|")[1];

  
  // Procura o usuário logado
  const usuario = listaUsuarios.find((u) => u.id === usuario_.id);
  if (!usuario) {
    console.error("Usuário não encontrado.");
    return;
  }

  // Verifica se a refeição existe
  // if (!usuario.refeicoes[tipoRefeicao]) {
  //   console.error(`Refeição "${tipoRefeicao}" não encontrada.`);
  //   return;
  // }

  // Verifica se a lista de alimentos existe
  const alimentos = usuario.refeicoes[tipoRefeicao].alimentos;
  const indice = parseInt(position);
  // if (!alimentos || !alimentos[indice]) {
  //   console.error(`Alimento na posição ${indice} não encontrado.`);
  //   return;
  // }

  // Remove o item da lista de alimentos
  alimentos.splice(indice, 1);

 
  console.log(`Alimento na posição ${indice} removido com sucesso da refeição "${tipoRefeicao}".`);
  
  atualizarRefeicoesNaTela();
  atualizarResumoDiario(usuario.refeicoes);
  console.log("Alimento removido com sucesso!");

}

function atualizarResumoDiario(refeicoes) {

  console.log("--- Iniciando atualização do Resumo Diário ---");
  if (!refeicoes) {
    console.error(
      "ERRO: A função foi chamada, mas não recebeu nenhuma refeição."
    );
    return;
  }

  const metas = {
    calorias: 2000,
    proteinas: 120,
    carboidratos: 250,
    gorduras: 65,
  };
  let totalCalorias = 0,
    totalProteinas = 0,
    totalCarboidratos = 0,
    totalGorduras = 0;

  // Mapeia as chaves do JSON para os títulos dos cards
  const titulosParaEncontrar = {
    cafe_da_manha: "Café da Manhã",
    almoco: "Almoço",
    jantar: "Jantar",
  };

  // Itera sobre cada tipo de refeição para fazer o cálculo
  for (const tipo in titulosParaEncontrar) {
    const titulo = titulosParaEncontrar[tipo];
    const refeicao = refeicoes[tipo];

    if (refeicao && refeicao.alimentos) {
      // **PASSO 1: ENCONTRA O CARD E O SELETOR DE STATUS**
      // Encontra o card da refeição no HTML para poder ler o status
      const cardRefeicao = document.querySelector(
        `[data-meal-title="${titulo}"]`
      );
      if (!cardRefeicao) continue; // Se não achar o card, pula para o próximo

      const containerPai = cardRefeicao.closest(".slide-in");
      const seletorDeStatus = containerPai.querySelector("[data-meal-status]");

      // **PASSO 2: VERIFICA SE O STATUS É "COMPLETO"**
      // A soma só acontece se o valor do seletor for 'completo'
      if (seletorDeStatus && seletorDeStatus.value === "completo") {
        console.log(`Calculando para a refeição: ${tipo} (Status: Completo)`);

        refeicao.alimentos.forEach((alimento) => {
          totalCalorias += parseFloat(alimento.calorias) || 0;
          totalProteinas += parseFloat(alimento.proteinas) || 0;
          totalCarboidratos += parseFloat(alimento.carboidratos) || 0;
          totalGorduras += parseFloat(alimento.gorduras) || 0;
        });
      } else {
        // Se for pendente, apenas informa no console e não soma nada.
        console.log(`Ignorando refeição: ${tipo} (Status: Pendente)`);
      }
    }
  }

  // --- O restante da função para atualizar o HTML continua exatamente igual ---
  console.log("TOTAIS CALCULADOS (apenas refeições completas):", {
    Calorias: totalCalorias,
    Proteínas: totalProteinas,
    Carboidratos: totalCarboidratos,
    Gorduras: totalGorduras,
  });

  document.getElementById("total-calorias").textContent =
    Math.round(totalCalorias);
  // ... (resto do código para atualizar os elementos HTML) ...
  document.getElementById("total-proteinas").textContent = `${Math.round(
    totalProteinas
  )}g`;
  document.getElementById("total-carboidratos").textContent = `${Math.round(
    totalCarboidratos
  )}g`;
  document.getElementById("total-gorduras").textContent = `${Math.round(
    totalGorduras
  )}g`;

  document.getElementById("proteinas-atual").textContent =
    Math.round(totalProteinas);
  document.getElementById("carboidratos-atual").textContent =
    Math.round(totalCarboidratos);
  document.getElementById("gorduras-atual").textContent =
    Math.round(totalGorduras);

  const percCalorias = Math.round((totalCalorias / metas.calorias) * 100);
  const percProteinas = Math.round((totalProteinas / metas.proteinas) * 100);
  const percCarboidratos = Math.round(
    (totalCarboidratos / metas.carboidratos) * 100
  );
  const percGorduras = Math.round((totalGorduras / metas.gorduras) * 100);

  document.getElementById(
    "perc-calorias"
  ).textContent = `${percCalorias}% da meta`;
  document.getElementById(
    "perc-proteinas"
  ).textContent = `${percProteinas}% da meta`;
  document.getElementById(
    "perc-carboidratos"
  ).textContent = `${percCarboidratos}% da meta`;
  document.getElementById(
    "perc-gorduras"
  ).textContent = `${percGorduras}% da meta`;

  document.getElementById("barra-proteinas").style.width = `${Math.min(
    percProteinas,
    100
  )}%`;
  document.getElementById("barra-carboidratos").style.width = `${Math.min(
    percCarboidratos,
    100
  )}%`;
  document.getElementById("barra-gorduras").style.width = `${Math.min(
    percGorduras,
    100
  )}%`;
}

function ativarManipuladoresDeRefeicao() {
  // --- AÇÃO: CLICAR NO BOTÃO "EDITAR / SALVAR" DE UM CARD ---
  document.querySelectorAll('[data-action="edit"]').forEach((botaoEditar) => {
    if (botaoEditar.onclick) return;

    botaoEditar.onclick = function () {
      const cardRefeicao = this.closest(".slide-in");
      const isEditing = cardRefeicao.classList.contains("modo-edicao");

      // 1. Alterna a classe .modo-edicao no card pai
      cardRefeicao.classList.toggle("modo-edicao");

      // 2. Mostra/esconde os botões de remover
      const botoesRemover = cardRefeicao.querySelectorAll(".remover-alimento-btn");
      botoesRemover.forEach(btn => {
        btn.classList.toggle("hidden", !isEditing);
      });

      // 3. Muda o visual do botão
      this.innerHTML = !isEditing
        ? '<span class="mr-1">💾</span> Salvar'
        : '<span class="mr-1">✏️</span> Editar';

      // 4. Se está salvando, persiste as mudanças
      if (isEditing) {
        salvarMudancasNaRefeicao(cardRefeicao);
      }
    };
  });

  
}



function salvarMudancasNaRefeicao(cardRefeicaoElement) {
  console.log("Salvando mudanças...");
  
  if (!usuario) {
    console.error("Usuário não encontrado");
    return;
  }

  // 2. Identifica qual refeição está sendo alterada
  const titulo = cardRefeicaoElement.querySelector("[data-meal-title]")?.textContent.trim();
  const tipoRefeicaoKey = Object.keys(titulosParaEncontrar).find(
    (key) => titulosParaEncontrar[key] === titulo
  );

  if (!tipoRefeicaoKey) {
    console.error("Tipo de refeição não identificado:", titulo);
    return;
  }

  // 3. Preserva os alimentos existentes que não foram removidos
  const alimentos = [];
  cardRefeicaoElement.querySelectorAll("[data-food-item]").forEach((itemElement) => {
    const nomeElement = itemElement.querySelector("[data-food-name]");
    const detailsElement = itemElement.querySelector("[data-food-details]");
    const proteinElement = itemElement.querySelector("[data-food-protein]");
    const iconeElement = itemElement.querySelector("[data-food-emoji]");

    if (nomeElement && detailsElement) {
      const [porcao, calorias] = detailsElement.textContent.split("•").map(s => s.trim());
      const proteinas = proteinElement ? proteinElement.textContent.replace("g P", "") : "0";

      alimentos.push({
        nome: nomeElement.textContent.trim(),
        porcao: porcao,
        calorias: parseInt(calorias) || 0,
        proteinas: proteinas,
        carboidratos: "0",
        gorduras: "0",
        icone: iconeElement ? iconeElement.textContent : "🍽️"
      });
    }
  });

  // 4. Atualiza apenas os alimentos da refeição específica
  if (!usuario.refeicoes) {
    usuario.refeicoes = {};
  }
  
  if (!usuario.refeicoes[tipoRefeicaoKey]) {
    usuario.refeicoes[tipoRefeicaoKey] = {};
  }

  usuario.refeicoes[tipoRefeicaoKey].alimentos = alimentos;

 

  console.log("Mudanças salvas com sucesso!");

  // 6. Remove a classe modo-edicao
  cardRefeicaoElement.classList.remove("modo-edicao");

  // 7. Atualiza a interface
  atualizarRefeicoesNaTela();
  atualizarResumoDiario(usuario.refeicoes);
}

/*
// Mapeamento de títulos que será usado por várias funções
const titulosParaEncontrar = {
  cafe_da_manha: "Café da Manhã",
  almoco: "Almoço",
  jantar: "Jantar",
};
*/




/*
// Finalizar cadastro
document.getElementById("step2-form").addEventListener("submit", function (e) {
  e.preventDefault();
  alert("Cadastro realizado com sucesso!");
  document.getElementById("register-step2").classList.add("hidden");
  concluirAutenticacao();
});
*/











