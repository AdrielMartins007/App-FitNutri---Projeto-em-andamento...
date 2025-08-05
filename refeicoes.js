let alimentosData = [];

// Aguarda o evento de login bem-sucedido
document.addEventListener("loginSuccess", (event) => {
  const { usuario } = event.detail;
  console.log("Refeicoes.js recebendo usuário:", usuario.email);

  // Renderiza tudo pela primeira vez
  renderizarTelaDeRefeicoes(usuario);

  // Adiciona os listeners para os botões de editar, adicionar, etc.
  configurarListenersDeRefeicoes();
  renderizarConsumoDeAgua(usuario.consumo_agua); 
});

/**
 * Função principal que orquestra a renderização da tela de refeições.
 * @param {object} usuario - O objeto completo do usuário logado.
 */
function renderizarTelaDeRefeicoes(usuario) {
  if (!usuario || !usuario.refeicoes) {
    console.error("Dados de usuário ou refeições inválidos para renderização.");
    return;
  }
  renderizarResumoDiario(usuario.refeicoes);
  renderizarCardsDeRefeicoes(usuario.refeicoes);
}

/**
 * Calcula os totais de nutrientes e atualiza as barras de progresso.
 * @param {object} refeicoes - O objeto de refeições do usuário.
 */
function renderizarResumoDiario(refeicoes) {
  const metas = {
    calorias: 2000,
    proteinas: 120,
    carboidratos: 250,
    gorduras: 65,
  };
  const totais = { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 };

  for (const tipo in refeicoes) {
    const refeicao = refeicoes[tipo];
    // MUDANÇA: A lógica de "completo/pendente" deve vir do objeto de dados,
    // não do DOM. Vamos assumir que todas contam por enquanto.
    // Para implementar o status, você adicionaria `if (refeicao.status === 'completo')`
    if (refeicao && refeicao.alimentos) {
      refeicao.alimentos.forEach((alimento) => {
        totais.calorias += parseFloat(alimento.calorias) || 0;
        totais.proteinas += parseFloat(alimento.proteinas) || 0;
        totais.carboidratos += parseFloat(alimento.carboidratos) || 0;
        totais.gorduras += parseFloat(alimento.gorduras) || 0;
      });
    }
  }

  document.getElementById("total-calorias").textContent = Math.round(
    totais.calorias
  );
  // ... (resto do código para atualizar os elementos HTML) ...
  document.getElementById("total-proteinas").textContent = `${Math.round(
    totais.proteinas
  )}g`;
  document.getElementById("total-carboidratos").textContent = `${Math.round(
    totais.carboidratos
  )}g`;
  document.getElementById("total-gorduras").textContent = `${Math.round(
    totais.gorduras
  )}g`;

  document.getElementById("proteinas-atual").textContent = Math.round(
    totais.proteinas
  );
  document.getElementById("carboidratos-atual").textContent = Math.round(
    totais.carboidratos
  );
  document.getElementById("gorduras-atual").textContent = Math.round(
    totais.gorduras
  );

  const percCalorias = Math.round((totais.calorias / metas.calorias) * 100);
  const percProteinas = Math.round((totais.proteinas / metas.proteinas) * 100);
  const percCarboidratos = Math.round(
    (totais.carboidratos / metas.carboidratos) * 100
  );
  const percGorduras = Math.round((totais.gorduras / metas.gorduras) * 100);

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

function renderizarCardsDeRefeicoes(refeicoes) {
    const titulosParaEncontrar = { cafe_da_manha: "Café da Manhã", almoco: "Almoço", jantar: "Jantar" };
    for (const tipoRefeicao in titulosParaEncontrar) {
        const titulo = titulosParaEncontrar[tipoRefeicao];
        const refeicaoData = refeicoes[tipoRefeicao];
        const cardElement = document.querySelector(`[data-meal-title="${titulo}"]`);
        if (refeicaoData && cardElement) {
            const containerAlimentos = cardElement.closest('.slide-in').querySelector('[data-food-container]');
            containerAlimentos.innerHTML = '';
            let totalCalorias = 0;
            refeicaoData.alimentos.forEach((alimento, index) => {
                totalCalorias += parseFloat(alimento.calorias) || 0;
                const alimentoHTML = criarAlimentoHTML(alimento, tipoRefeicao, index);
                containerAlimentos.insertAdjacentHTML('beforeend', alimentoHTML);
            });
            const elementoCalorias = cardElement.closest('.slide-in').querySelector('[data-meal-time-calories]');
            if (elementoCalorias) {
                const horario = elementoCalorias.textContent.split('•')[0].trim();
                elementoCalorias.textContent = `${horario} • ${Math.round(totalCalorias)} kcal`;
            }
        }
    }
}

/**
 * Função auxiliar que cria o HTML para um único alimento.
 * @param {object} alimento - O objeto do alimento.
 * @param {string} tipoRefeicao - Ex: 'cafe_da_manha'.
 * @param {number} index - A posição do alimento no array.
 * @returns {string} O HTML do elemento.
 */
function criarAlimentoHTML(alimento, tipoRefeicao, index) {
  // Adicionamos data-attributes para identificar o alimento e a ação
  return `
        <div class="flex justify-between items-center" data-food-item>
            <button class="remover-alimento-btn hidden" data-action="remover-alimento" data-tipo-refeicao="${tipoRefeicao}" data-index="${index}">x</button>
            <div class="flex items-center flex-grow">
                <div class="w-10 h-10 bg-gray-100 rounded-lg mr-3 flex items-center justify-center">
                    <span class="text-xl">${alimento.icone || "🍽️"}</span>
                </div>
                <div>
                    <h5 class="font-medium">${alimento.nome}</h5>
                    <p class="text-xs text-gray-500">${alimento.porcao} • ${
    alimento.calorias
  } kcal</p>
                </div>
            </div>
            <div class="text-sm font-medium text-gray-700">${
              alimento.proteinas
            } P</div>
        </div>
    `;
}

// Esta função centraliza a configuração de todos os listeners da tela.

function configurarListenersDeRefeicoes() {
    const containerPrincipal = document.getElementById('meals-screen');

    // Listener de clique principal (delegação de eventos)
    containerPrincipal.addEventListener('click', (e) => {
        // 'e.target' é o elemento exato que foi clicado.
        // 'closest('button')' encontra o botão pai mais próximo.
        const target = e.target.closest('button'); 
        
        // Se o clique não foi em um botão, não faz nada.
        if (!target) return;

        const action = target.dataset.action;

        if (action === 'remover-alimento') {
            const tipoRefeicao = target.dataset.tipoRefeicao;
            const index = parseInt(target.dataset.index, 10);
            dataService.removerAlimento(tipoRefeicao, index);
            renderizarTelaDeRefeicoes(dataService.getUsuarioLogado());
        }

        if (action === 'editar-refeicao') {
            const card = target.closest('.slide-in');
            card.classList.toggle('modo-edicao');
            const isEditing = card.classList.contains('modo-edicao');
            target.innerHTML = isEditing ? '<span class="mr-1">💾</span> Salvar' : '<span class="mr-1">✏️</span> Editar';
            card.querySelectorAll('.remover-alimento-btn').forEach(btn => btn.classList.toggle('hidden', !isEditing));
        }

        // =======================================================
        // AQUI ESTÁ A CORREÇÃO
        // =======================================================
        if (action === 'adicionar-item') {
            // Usamos 'target' que é a referência correta ao botão clicado.
            const containerAlimentos = target.closest('.slide-in').querySelector('[data-food-container]');
            const tipoRefeicao = target.id;

            // Previne adicionar múltiplos campos de busca
            if (containerAlimentos.querySelector('.food-search-item')) {
                return; 
            }

            const novoItemDeBusca = criarItemDeBuscaHTML(tipoRefeicao);
            containerAlimentos.appendChild(novoItemDeBusca);
            novoItemDeBusca.querySelector('input').focus();
        }
    });

    // Listener de digitação (input) - Nenhuma mudança aqui, já está correto.
    containerPrincipal.addEventListener('input', (e) => {
        const input = e.target;
        if (input.dataset.action !== 'buscar-alimento') return;

        const termo = input.value;
        const sugestoesContainer = input.nextElementSibling;

        const resultados = dataService.buscarAlimentos(termo);
        renderizarSugestoes(resultados, sugestoesContainer, input);
    });
}

/**
 * Formata uma data no formato ISO para o padrão brasileiro (dd/mm/aaaa hh:mm).
 * @param {string} isoString - A data em formato ISO.
 * @returns {string} A data formatada.
 */
function formatarDataHora(isoString) {
  if (!isoString) return '';
  const data = new Date(isoString);
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();
  const hora = String(data.getHours()).padStart(2, "0");
  const minuto = String(data.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}


/**
 * Renderiza a tabela de consumo de água e atualiza o resumo.
 * @param {Array} registrosAgua - O array `consumo_agua` do usuário.
 */
function renderizarConsumoDeAgua(registrosAgua = []) {
    const tabelaBody = document.querySelector("#tabela-registros tbody");
    const totalConsumidoEl = document.querySelector("#home-screen .text-sm.text-green-600.font-medium"); // Seletor para o "1.2L / 2.5L"
    const barraProgressoEl = document.querySelector("#home-screen .bg-green-400");
    const percentualEl = document.querySelector("#home-screen .ml-1.font-medium.text-green-700");

    if (!tabelaBody || !totalConsumidoEl || !barraProgressoEl || !percentualEl) {
        console.error("Elementos da UI de consumo de água não encontrados.");
        return;
    }

    // 1. Limpa a tabela atual
    tabelaBody.innerHTML = '';

    // 2. Calcula o total consumido
    const totalConsumidoMl = registrosAgua.reduce((total, registro) => total + registro.quantidade, 0);
    const metaMl = 2500; // 2.5L

    // 3. Preenche a tabela com os novos dados
    registrosAgua.forEach(registro => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${registro.quantidade} ml</td>
            <td>${formatarDataHora(registro.data_e_hora)}</td>
        `;
        tabelaBody.appendChild(linha);
    });

    // 4. Atualiza o resumo (barra de progresso e texto)
    const totalConsumidoL = (totalConsumidoMl / 1000).toFixed(1);
    const metaL = (metaMl / 1000).toFixed(1);
    const percentual = Math.min(Math.round((totalConsumidoMl / metaMl) * 100), 100);

    totalConsumidoEl.textContent = `${totalConsumidoL}L / ${metaL}L`;
    barraProgressoEl.style.width = `${percentual}%`;
    percentualEl.textContent = `${percentual}%`;
}

/**
 * Cria o HTML para um novo item de alimento, com um campo de input para busca.
 * @param {string} tipoRefeicao - O tipo da refeição onde o item será adicionado.
 * @returns {HTMLElement} O elemento DOM do novo item.
 */
function criarItemDeBuscaHTML(tipoRefeicao) {
  const li = document.createElement("li");
  li.className = "food-search-item"; // Uma classe para identificar este item especial
  li.dataset.tipoRefeicao = tipoRefeicao;

  li.innerHTML = `
        <div class="flex items-center">
            <div class="w-10 h-10 bg-gray-200 rounded-lg mr-3 flex items-center justify-center">
                <span class="text-xl">🔍</span>
            </div>
            <div class="relative flex-grow">
                <input 
                    type="text" 
                    placeholder="Digite o nome do alimento..."
                    class="w-full font-medium bg-transparent outline-none border-b border-gray-300 focus:border-green-500"
                    data-action="buscar-alimento"
                />
                <div class="sugestoes-lista hidden absolute top-full left-0 w-full bg-white shadow-lg rounded-b-lg mt-1 z-50 max-h-48 overflow-y-auto">
                    <!-- As sugestões aparecerão aqui -->
                </div>
            </div>
        </div>
    `;
  return li;
}


// Listener para o botão de registrar água na tela inicial
const botaoRegistrarAgua = document.getElementById("register-water");
if (botaoRegistrarAgua) {
    botaoRegistrarAgua.addEventListener("click", function () {
        // Valor fixo de 250ml, pode ser alterado para pegar de um input se desejar.
        const quantidade = 250; 

        // 1. DELEGA a lógica de salvar para o dataService.
        dataService.registrarConsumoAgua(quantidade);

        // 2. RE-RENDERIZA a UI de água com os dados atualizados.
        const usuario = dataService.getUsuarioLogado();
        renderizarConsumoDeAgua(usuario.consumo_agua);

       
    });
}


/**
 * Renderiza a lista de sugestões de alimentos.
 * @param {Array} sugestoes - Array de objetos de alimento retornados pelo dataService.
 * @param {HTMLElement} container - A div onde as sugestões serão inseridas.
 */
function renderizarSugestoes(sugestoes, container, inputElement) { // Adicionado inputElement
    container.innerHTML = ''; 

    if (sugestoes.length === 0) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');

    sugestoes.forEach(alimento => {
        const item = document.createElement('div');
        item.className = 'p-2 hover:bg-gray-100 cursor-pointer border-b';
        item.innerHTML = 
        ` <div class="font-medium text-gray-800">${alimento.nome}</div>
            <div class="text-xs text-gray-500">${alimento.porcao} • ${alimento.calorias} kcal</div>
        `; // Seu código HTML aqui

        item.addEventListener('click', () => {
            const itemDeBusca = container.closest('.food-search-item');
            const tipoRefeicao = itemDeBusca.dataset.tipoRefeicao;

            dataService.adicionarAlimento(tipoRefeicao, alimento);
            
            // Esconde a lista e limpa o input após a seleção
            container.classList.add('hidden');
            inputElement.value = '';

            renderizarTelaDeRefeicoes(dataService.getUsuarioLogado());
        });

        container.appendChild(item);
    });
}

/*
function adicionarAlimentoDoJSON(lista) {
  const novoItem = document.createElement("div");
  novoItem.className = "flex justify-between items-center";
  novoItem.innerHTML = `
        <div class="flex items-center">
            <div class="w-10 h-10 bg-gray-100 rounded-lg mr-3 flex items-center justify-center">
                <span class="text-gray-500">🍽️</span>
            </div>
            <div class="relative">
                <h5 class="font-medium item-name" contenteditable="true">Adicionar alimento</h5>
                <div class="sugestoes-lista hidden absolute top-full left-0 w-64 bg-white shadow-lg rounded-lg mt-1 z-50 max-h-48 overflow-y-auto"></div>
                <p class="text-xs text-gray-500">0g • 0 kcal</p>
            </div>
        </div>
        <div class="text-sm font-medium text-gray-700">0g P</div>
    `;

  lista.appendChild(novoItem);
  const nomeElement = novoItem.querySelector(".item-name");
  const sugestoesLista = novoItem.querySelector(".sugestoes-lista");

  // Evento para quando começar a digitar
  nomeElement.addEventListener("focus", function () {
    if (this.textContent === "Adicionar alimento") {
      this.textContent = "";
    }
  });

  // Evento para mostrar sugestões enquanto digita
  nomeElement.addEventListener("input", function () {
    const texto = this.textContent.trim().toLowerCase();
    if (texto.length >= 1) {
      // Reduzido para 1 caractere
      const sugestoes = alimentosData.filter((alimento) =>
        alimento.nome.toLowerCase().includes(texto)
      );

      // Mostra sugestões mesmo que esteja vazio
      mostrarSugestoes(sugestoes, sugestoesLista, nomeElement, lista);
    } else {
      sugestoesLista.innerHTML = "";
      sugestoesLista.classList.add("hidden");
    }
  });

  // Esconde sugestões quando clicar fora
  document.addEventListener("click", function (e) {
    if (!nomeElement.contains(e.target) && !sugestoesLista.contains(e.target)) {
      sugestoesLista.classList.add("hidden");
    }
  });

  nomeElement.focus(); // Adiciona foco automático
  return novoItem;
}
  

function mostrarSugestoes(sugestoes, sugestoesLista, nomeElement, lista) {
  console.log("asdasda");

  sugestoesLista.innerHTML = "";
  sugestoesLista.classList.remove("hidden");

  // Se não houver sugestões, mostra mensagem
  if (sugestoes.length === 0) {
    const semResultado = document.createElement("div");
    semResultado.className = "p-2 text-gray-500 text-center";
    semResultado.textContent = "Nenhum alimento encontrado";
    sugestoesLista.appendChild(semResultado);
    return;
  }

  // Mostra apenas a primeira sugestão encontrada
  const alimento = sugestoes[0]; // Pega apenas o primeiro alimento
  const sugestaoItem = document.createElement("div");
  sugestaoItem.className =
    "p-2 hover:bg-gray-100 cursor-pointer flex items-center";
  sugestaoItem.innerHTML = `
        <span class="mr-2">${alimento.icone || "🍽️"}</span>
        <div>
            <div class="font-medium">${alimento.nome}</div>
            <div class="text-xs text-gray-500">${alimento.porcao} • ${
    alimento.calorias
  } kcal</div>
        </div>
    `;

    // ACAO FINAL - INSERIR ALIMENTO
  sugestaoItem.addEventListener("click", () => {
    console.log("cliqe");
    const itemContainer = nomeElement.closest(".flex.justify-between");
    if (itemContainer) {
      const icon = itemContainer.querySelector(".text-gray-500");
      const info = nomeElement
        .closest(".relative")
        .querySelector("p.text-xs.text-gray-500");
      const protein = itemContainer.querySelector(".text-sm.font-medium");

      icon.textContent = alimento.icone || "🍽️";
      nomeElement.textContent = alimento.nome;
      info.textContent = `${alimento.porcao} • ${alimento.calorias} kcal`;
      protein.textContent = `${alimento.proteinas} P`;

      nomeElement.removeAttribute("contenteditable");
      sugestoesLista.classList.add("hidden");

      let modelo = {
        nome: alimento.nome,
        porcao: alimento.porcao,
        calorias: alimento.calorias,
        proteinas: alimento.proteinas,
        carboidratos: "0 g",
        gorduras: "0 g",
        icone: alimento.icone,
      };

      inserirRefeicao(modelo);
      
      atualizarRefeicoesNaTela();
      //  atualizarResumoDiario();
    }
  });

  sugestoesLista.appendChild(sugestaoItem);
}

function inserirRefeicao(alimento) {
  // Passo 1: Carregar os dados do localStorage
  let dadosString = localStorage.getItem("usuarios");
  const usuario_ = JSON.parse(localStorage.getItem('usuarioLogado'));

  let tipoDeRefeicao = tipoRefeicaoGlobal;

  if (!dadosString) {
    console.error("Nenhum dado encontrado no localStorage.");
    return;
  }
  let listaUsuarios = JSON.parse(dadosString);

  // Passo 2: Procurar o usuário pelo ID
  const usuario = listaUsuarios.find((u) => u.id === usuario_.id);
  if (!usuario) {
    console.error("Usuário não encontrado.");
    return;
  }

  // Passo 3: Verificar se o campo de refeições e o tipo de refeição existem
  if (!usuario.refeicoes) {
    usuario.refeicoes = {};
  }

  // if (!usuario.refeicoes.tipoDeRefeicao) {
  //   console.error(`Refeição "${tipoDeRefeicao}" não encontrada.`);
  //   return;
  // }

  // Passo 4: Adicionar alimento
  usuario.refeicoes[tipoDeRefeicao].alimentos.push(alimento);

  // Passo 5: Salvar os dados de volta no localStorage
  localStorage.setItem("usuarios", JSON.stringify(listaUsuarios));

  console.log("Alimento adicionado com sucesso!");
}

// Função auxiliar para buscar e atualizar alimento
function buscarEAtualizarAlimento(elemento, nomeAlimento, lista) {
  console.log("XXXX");

  const alimento = alimentosData.find((a) =>
    a.nome.toLowerCase().includes(nomeAlimento.toLowerCase())
  );

  if (alimento) {
    const container = elemento.closest(".flex.justify-between");
    const icon = container.querySelector(".text-gray-500");
    const info = container.querySelector(".text-xs.text-gray-500");
    const protein = container.querySelector(".text-sm.font-medium");

    icon.textContent = alimento.icone;
    elemento.textContent = alimento.nome;
    info.textContent = `${alimento.porcao} • ${alimento.calorias} kcal`;
    protein.textContent = `${alimento.proteinas} P`;

    elemento.removeAttribute("contenteditable");

    atualizarCaloriasRefeicao(lista.closest(".slide-in"));
    atualizarResumoDiario();
  } else {
    alert("Alimento não encontrado!");
    elemento.textContent = "Adicionar alimento";
    elemento.focus();
  }
}

function tornarItensEditaveis(card) {
  const editBtn = card.querySelector(".edit-meal-btn");
  if (!editBtn) return;

  editBtn.addEventListener("click", function (e) {
    const items = card.querySelectorAll(
      ".space-y-3 h5, .space-y-3 p, .space-y-3 .text-sm"
    );
    const isEditing = items[0].getAttribute("contenteditable") === "true";

    items.forEach((item) => {
      item.setAttribute("contenteditable", !isEditing);
      item.classList.toggle("bg-yellow-50", !isEditing);
    });

    // Atualiza o texto do botão
    this.innerHTML = !isEditing
      ? '<span class="mr-1">💾</span> Salvar'
      : '<span class="mr-1">✏️</span> Editar';
  });
}

// Adiciona um listener para cada menu dropdown de status das refeições
document.querySelectorAll("[data-meal-status]").forEach((seletor) => {
  seletor.addEventListener("change", () => {
    console.log("Status da refeição alterado. Recalculando resumo diário...");

    // Pega o usuário logado para acessar suas refeições
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (usuario && usuario.refeicoes) {
      // Chama a função de atualização que está no escopo global (definida em login.js)
      atualizarResumoDiario(usuario.refeicoes);
    }
  });
});

// botoes rodape
document.getElementById("add-meal-btn").addEventListener("click", () => {
  const template = document.querySelector("#meal-template > div");
  const mealList = document.getElementById("meal-list");

  if (template && mealList) {
    const novoCard = template.cloneNode(true);
    novoCard.classList.add("slide-in");
    novoCard.style.animationDelay = "0s";

    // Adiciona hora atual
    const agora = new Date();
    const horaAtual = agora.getHours().toString().padStart(2, "0");
    const minutosAtuais = agora.getMinutes().toString().padStart(2, "0");
    const horaFormatada = `${horaAtual}:${minutosAtuais}`;

    // Atualiza o texto da refeição com a hora atual
    const infoh = novoCard.querySelector("p.text-xs.text-gray-500");
    if (infoh) {
      infoh.textContent = `${horaFormatada} • 0 kcal`;
    }

    // Limpa os alimentos existentes
    const lista = novoCard.querySelector(".space-y-3");
    lista.innerHTML = "";

    // Adiciona um item de alimento editável
    const novoItem = adicionarAlimentoDoJSON(lista);

    // Ativar/Desativar edição da refeição e seus itens
    tornarItensEditaveis(novoCard);

    // Adiciona funcionalidade ao botão "Adicionar item"
    const addItemBtn = novoCard.querySelector(".add-meal-item-btn");
    addItemBtn.addEventListener("click", () => {
      adicionarAlimentoDoJSON(lista);
    });

    mealList.appendChild(novoCard);
  }
});


// Torna os botões Editar e Adicionar item funcionais para todas as refeições existentes
document.querySelectorAll(".meal-item, .slide-in").forEach((card) => {
  const editBtn = card.querySelector(".edit-meal-btn");
  const addItemBtn = card.querySelector(".add-meal-item-btn");
  // let tipo_refeicao = addItemBtn.id;

  const title = card.querySelector(
    "h4.font-medium[contenteditable], h4.font-medium"
  );
  const info = card.querySelector(
    "p.text-xs.text-gray-500[contenteditable], p.text-xs.text-gray-500"
  );

  if (editBtn && title && info) {
    editBtn.addEventListener("click", function (e) {
      const isEditing = title.getAttribute("contenteditable") === "true";
      title.setAttribute("contenteditable", !isEditing);
      info.setAttribute("contenteditable", !isEditing);

      title.classList.toggle("bg-yellow-50", !isEditing);
      info.classList.toggle("bg-yellow-50", !isEditing);

      // Muda botão para "Salvar"
      editBtn.innerHTML = !isEditing
        ? '<span class="mr-1">💾</span> Salvar'
        : '<span class="mr-1">✏️</span> Editar';
    });
  }
  if (addItemBtn) {
    addItemBtn.addEventListener("click", function () {
      const lista = card.querySelector(".space-y-3");
      if (lista) {
        adicionarAlimentoDoJSON(lista);
      }
    });
  }
});

// Aplica a função para todos os cards de refeição existentes
document.querySelectorAll(".slide-in").forEach((card) => {
  tornarItensEditaveis(card);
});
*/
