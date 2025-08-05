const dataService = {
    // Propriedades privadas (iniciadas com _) para guardar os dados em memória.
    _usuarios: [],
    _usuarioLogado: null,
    _alimentos: [],
    _refeicoesPredefinidas: {},

    // Função de inicialização: Carrega tudo do localStorage e dos JSONs para a memória.
    async init() {
        // Carrega dados dos usuários
        this._usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        this._usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado")) || null;

        // Carrega os JSONs de forma assíncrona
        try {
            const [alimentosResponse, refeicoesResponse] = await Promise.all([
                fetch('alimentos.json'),
                fetch('refeicoes.json')
            ]);
            this._alimentos = await alimentosResponse.json();
            this._refeicoesPredefinidas = (await refeicoesResponse.json()).refeicoes;
            console.log("Serviço de dados inicializado com sucesso.");
        } catch (error) {
            console.error("Falha ao carregar dados base (JSONs):", error);
        }
    },

    // Função privada para salvar o estado atual da memória no localStorage.
    _commit() {
        localStorage.setItem("usuarios", JSON.stringify(this._usuarios));
        localStorage.setItem("usuarioLogado", JSON.stringify(this._usuarioLogado));
        console.log("Dados salvos no localStorage.");
    },

    // --- MÉTODOS PÚBLICOS (O que o resto do app vai usar) ---

    // Seção de Autenticação e Usuários
    getUsuarios() {
        return this._usuarios;
    },

    getUsuarioLogado() {
        return this._usuarioLogado;
    },

    getProximoIdUsuario() {
        const ultimoId = parseInt(localStorage.getItem("ultimoIdUsuario")) || 0;
        const proximoId = ultimoId + 1;
        localStorage.setItem("ultimoIdUsuario", proximoId);
        return proximoId;
    },

    login(email, senha) {
        const usuarioEncontrado = this._usuarios.find(
            user => user.email === email && user.senha === senha
        );
        if (usuarioEncontrado) {
            this._usuarioLogado = usuarioEncontrado;
            this._commit(); // Salva o estado de login
            return usuarioEncontrado;
        }
        return null;
    },

    cadastrarUsuario(dadosUsuario) {
        // Atribui refeições aleatórias ao novo usuário
        dadosUsuario.refeicoes = {
            cafe_da_manha: this._refeicoesPredefinidas.cafe_da_manha[Math.floor(Math.random() * this._refeicoesPredefinidas.cafe_da_manha.length)],
            almoco: this._refeicoesPredefinidas.almoco[Math.floor(Math.random() * this._refeicoesPredefinidas.almoco.length)],
            jantar: this._refeicoesPredefinidas.jantar[Math.floor(Math.random() * this._refeicoesPredefinidas.jantar.length)],
        };
        
        this._usuarios.push(dadosUsuario);
        this._usuarioLogado = dadosUsuario; // Loga automaticamente
        this._commit();
        return dadosUsuario;
    },

    // Seção de Refeições
    atualizarAlimento(tipoRefeicao, indiceAlimento, campo, novoValor) {
        if (!this._usuarioLogado) return;

        const alimento = this._usuarioLogado.refeicoes[tipoRefeicao]?.alimentos[indiceAlimento];
        if (alimento) {
            alimento[campo] = novoValor;
            this._commit();
            console.log(`Alimento [${indiceAlimento}] da refeição "${tipoRefeicao}" atualizado.`);
        }
    },

    removerAlimento(tipoRefeicao, indiceAlimento) {
        if (!this._usuarioLogado) return;

        const alimentos = this._usuarioLogado.refeicoes[tipoRefeicao]?.alimentos;
        if (alimentos && alimentos[indiceAlimento]) {
            alimentos.splice(indiceAlimento, 1);
            this._commit();
            console.log(`Alimento [${indiceAlimento}] da refeição "${tipoRefeicao}" removido.`);
        }
    },

    adicionarAlimento(tipoRefeicao, novoAlimento) {
        if (!this._usuarioLogado) return;

        if (!this._usuarioLogado.refeicoes[tipoRefeicao]) {
            // Se a refeição não existir (ex: um lanche novo), cria a estrutura
            this._usuarioLogado.refeicoes[tipoRefeicao] = { alimentos: [] };
        }
        
        this._usuarioLogado.refeicoes[tipoRefeicao].alimentos.push(novoAlimento);
        this._commit();
        console.log(`Alimento adicionado à refeição "${tipoRefeicao}".`);
    },
    
    // Seção de Busca
    buscarAlimentos(termo) {
        if (!termo) return [];
        const termoLower = termo.toLowerCase();
        return this._alimentos.filter(alimento => 
            alimento.nome.toLowerCase().includes(termoLower)
        );
    },

     /**
     * Adiciona uma nova refeição customizada ao usuário logado.
     * @returns {string|null} A chave da nova refeição (ex: 'custom_1662586953213') ou null se falhar.
     */
    adicionarNovaRefeicao() {
        if (!this._usuarioLogado) return null;

        // Gera uma chave única para a nova refeição usando o timestamp.
        // Isso garante que nunca haverá duas refeições com o mesmo nome de chave.
        const novaChaveRefeicao = `custom_${Date.now()}`;

        // Cria o objeto da nova refeição, já com a estrutura correta.
        this._usuarioLogado.refeicoes[novaChaveRefeicao] = {
            nome: "Nova Refeição", // Um nome padrão
            horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            alimentos: [] // Começa com a lista de alimentos vazia
        };

        // Salva as mudanças no localStorage
        this._commit();
        console.log(`Nova refeição vazia adicionada com a chave: ${novaChaveRefeicao}`);
        
        return novaChaveRefeicao;
    },
    /**
     * Adiciona um novo registro de consumo de água para o usuário logado.
     * @param {number} quantidade - A quantidade de água em ml.
     */
    registrarConsumoAgua(quantidade) {
        if (!this._usuarioLogado) {
            console.error("Nenhum usuário logado para registrar consumo de água.");
            return;
        }

        // Se o array 'consumo_agua' não existir no usuário, crie-o.
        if (!this._usuarioLogado.consumo_agua) {
            this._usuarioLogado.consumo_agua = [];
        }

        // Cria o novo registro com a quantidade e a data/hora atual.
        const novoRegistro = {
            quantidade: quantidade,
            data_e_hora: new Date().toISOString() // Formato padrão ISO 8601
        };

        // Adiciona o novo registro ao início do array (para aparecer no topo da lista)
        this._usuarioLogado.consumo_agua.unshift(novoRegistro);

        // Salva as mudanças no localStorage
        this._commit();
        console.log(`Consumo de ${quantidade}ml de água registrado com sucesso.`);
    }
};

// Inicializa o serviço assim que o script é carregado.
// Usamos um evento para garantir que o resto do código só rode depois que o serviço estiver pronto.
document.addEventListener('DOMContentLoaded', async () => {
    await dataService.init();
    // Dispara um evento customizado para avisar que os dados estão prontos.
    document.dispatchEvent(new CustomEvent('dataReady'));
});