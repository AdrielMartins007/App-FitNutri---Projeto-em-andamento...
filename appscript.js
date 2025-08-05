

const registros = [
  { quantidade: 250, data_e_hora: "2025-07-22T08:30:00" },
  { quantidade: 500, data_e_hora: "2025-07-22T12:00:00" },
  { quantidade: 300, data_e_hora: "2025-07-22T15:45:00" },
];

// Referência à tabela
const tabela = document.querySelector("#tabela-registros tbody");

// Função para formatar data
function formatarDataHora(isoString) {
  const data = new Date(isoString);
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();
  const hora = String(data.getHours()).padStart(2, "0");
  const minuto = String(data.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}

// Adiciona os registros na tabela
registros.forEach((registro) => {
  const linha = document.createElement("tr");

  const colunaQuantidade = document.createElement("td");
  colunaQuantidade.textContent = registro.quantidade;

  const colunaData = document.createElement("td");
  colunaData.textContent = formatarDataHora(registro.data_e_hora);

  linha.appendChild(colunaQuantidade);
  linha.appendChild(colunaData);

  tabela.appendChild(linha);
});

// Navigation
document.querySelectorAll(".bottom-nav-item").forEach((item) => {
  item.addEventListener("click", function () {
    // Update active nav item
    document.querySelectorAll(".bottom-nav-item").forEach((navItem) => {
      navItem.classList.remove("active");
    });

    this.classList.add("active");

    // Show selected screen
    const screenId = this.getAttribute("data-screen");
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.remove("active");
    });
    document.getElementById(screenId).classList.add("active");
    document.getElementById(screenId).classList.add("page-transition");

    // Scroll to top when changing screens
    document.querySelector(".app-container").scrollTop = 0;
  });
});

// Meal tabs
document.querySelectorAll("[data-meal-tab]").forEach((tab) => {
  tab.addEventListener("click", function () {
    const tabId = this.getAttribute("data-meal-tab");

    // Update active tab
    document.querySelectorAll("[data-meal-tab]").forEach((t) => {
      t.classList.remove("active");
      t.classList.add("text-gray-500");
    });
    this.classList.add("active");
    this.classList.remove("text-gray-500");

    // Show selected tab content
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active");
    });
    document.getElementById(tabId + "-tab").classList.add("active");
  });
});

// Water buttons
document.getElementById("add-water").addEventListener("click", function () {
  alert("250ml de água adicionado!");
});

document
  .getElementById("register-water")
  .addEventListener("click", function () {
   
  });
/*
// Workout button
document.getElementById("start-workout").addEventListener("click", function () {
  alert("Iniciando treino de força!");
});
*/

// Recipe view
document
  .getElementById("view-featured-recipe")
  .addEventListener("click", function () {
    alert("Visualizando receita: Bowl de Proteína");
  });
/*
// Workout buttons
document
  .getElementById("start-workout-btn")
  .addEventListener("click", function () {
    alert("Iniciando treino de força!");
  });

/*
document
  .getElementById("view-workout-details")
  .addEventListener("click", function () {
    alert("Visualizando detalhes do treino de cardio");
  });
*/

/*
document.getElementById("add-workout").addEventListener("click", function () {
  alert("Adicionar novo treino");
});
*/


// Workout button
function abrirModalTreinos() {
  let treinoModal = document.getElementById('treino-modal');
  const phoneScreen = document.querySelector('.phone-screen');

  if (!treinoModal) {
    treinoModal = document.createElement('div');
    treinoModal.id = 'treino-modal';
    treinoModal.style.position = 'absolute';
    treinoModal.style.top = '0';
    treinoModal.style.left = '0';
    treinoModal.style.width = '100%';
    treinoModal.style.height = '100%';
    treinoModal.style.background = 'rgba(0,0,0,0.7)';
    treinoModal.style.zIndex = '9999';
    treinoModal.style.display = 'flex';
    treinoModal.style.alignItems = 'center';
    treinoModal.style.justifyContent = 'center';
    treinoModal.style.borderRadius = '30px';
    treinoModal.innerHTML = `
      <div style="
        background: #fff;
        width: 100%;
        height: 100%;
        border-radius: 30px;
        padding: 0;
        box-shadow: none;
        position: relative;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
      ">
        <h2 style="text-align:center;color:#15803d;margin-top:40px;margin-bottom:24px;font-size:24px;">Exercícios do Treino</h2>
        <div id="treino-exercicios"></div>
        <div style="display:flex;justify-content:space-between;gap:0;margin-top:22px;width:100%;">
          <button id="pular-exercicios" style="width:48%; background:#f59e42; color:#fff; padding:12px 0; border:none; border-radius:12px; font-size:18px;">Pular Exercícios</button>
          <button id="concluir-treino" style="width:48%; background:#15803d; color:#fff; padding:12px 0; border:none; border-radius:12px; font-size:18px;">Concluir Treino</button>
        </div>
        <div style="width:100%;display:flex;justify-content:center;">
          <button id="fechar-treino" style="width:170px;margin-top:12px;background:#666;color:#fff;padding:10px 0;border:none;border-radius:12px;font-size:17px;">Fechar</button>
        </div>
      </div>
    `;
    phoneScreen.appendChild(treinoModal);
  }
  treinoModal.style.display = 'flex';

  fetch('treinos.json')
    .then(res => res.json())
    .then(treinos => {
      const nomesTreinos = Object.keys(treinos);
      let treinoAtual = 0;

      function mostrarTreinoAtual() {
        const container = document.getElementById('treino-exercicios');
        container.innerHTML = '';

        const nomeTreino = nomesTreinos[treinoAtual];
        const listaExercicios = treinos[nomeTreino];

        // Exibe o nome do treino
        const titulo = document.createElement('h3');
        titulo.textContent = nomeTreino;
        titulo.style = "color:#15803d;font-size:20px;margin:12px 0 18px 0;text-align:center; font-weight:700;";
        container.appendChild(titulo);

        // Exibe até 5 exercícios desse treino
        for (let i = 0; i < 5 && i < listaExercicios.length; i++) {
          const exercicio = listaExercicios[i];
          const div = document.createElement('div');
          div.className = 'exercicio';
          div.style = "display:flex;align-items:center;margin-bottom:14px;";
          div.innerHTML = `
            <img src="${exercicio.imagem}" alt="${exercicio.nome}" style="width:90px;height:90px;border-radius:14px;margin-right:16px;object-fit:cover;background:#eee;">
            <div>
              <span style="font-size:17px;font-weight:600;">${exercicio.nome}</span><br>
              <span style="font-size:15px;color:#15803d;">Repetições: ${exercicio.repeticoes}</span><br>
              <span style="font-size:15px;color:#f59e42;">Tempo: ${exercicio.tempo} min</span>
            </div>
          `;
          container.appendChild(div);
        }
      }

      mostrarTreinoAtual();
      treinoModal.style.display = 'flex';

      // Pular para o próximo treino
      document.getElementById('pular-exercicios').onclick = () => {
        if (treinoAtual < nomesTreinos.length - 1) {
          treinoAtual++;
          mostrarTreinoAtual();
        } else {
          alert('Não há mais treinos para pular!');
        }
      };

      // Concluir treino
      document.getElementById('concluir-treino').onclick = () => {
        const nomeTreino = nomesTreinos[treinoAtual];
        const listaExercicios = treinos[nomeTreino];
        const exerciciosExibidos = listaExercicios.slice(0, 5);

        const tempoTotal = exerciciosExibidos.reduce((soma, ex) => soma + (ex.tempo || 0), 0);
        const calorias = exerciciosExibidos.length * 40;
        const massa = (exerciciosExibidos.length * 0.02).toFixed(2);

        const container = document.getElementById('treino-exercicios');
        container.innerHTML = `
          <div style="text-align:center;margin-top:30px;">
            <h3 style="color:#15803d;">Treino Concluído!</h3>
            <p style="margin-top:16px;font-size:17px;">Tempo total: <b>${tempoTotal} min</b></p>
            <p style="margin-top:8px;font-size:17px;">Calorias perdidas: <b>${calorias} kcal</b></p>
            <p style="margin-top:8px;font-size:17px;">Massa muscular ganha: <b>${massa} kg</b></p>
            <p style="margin-top:16px;font-size:17px;">Parabéns por concluir todos os treinos!</p>
          </div>
        `;
        document.getElementById('pular-exercicios').disabled = true;
        document.getElementById('concluir-treino').disabled = true;
      };

      // Fechar modal
      document.getElementById('fechar-treino').onclick = () => {
        treinoModal.style.display = 'none';
      };
    });
}

// Use a mesma função para ambos os botões:
document.getElementById("start-workout").addEventListener("click", abrirModalTreinos);
document.getElementById("start-workout-btn").addEventListener("click", abrirModalTreinos);
