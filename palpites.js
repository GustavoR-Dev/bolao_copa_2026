document.addEventListener('DOMContentLoaded', async () => { // Tornamos a função async
    // --- AUTENTICAÇÃO E DADOS DO USUÁRIO ---
    const user = JSON.parse(localStorage.getItem('bolaoUser'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    // Garante que o elemento existe antes de tentar modificá-lo
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = user.nome;
    }

    // --- VARIÁVEIS GLOBAIS DO ESCOPO ---
    const API_URL = 'api/jogos.php'; // Declarado APENAS UMA VEZ
    let totalGames = 0;

    // --- VERIFICAÇÃO DE PALPITES JÁ ENVIADOS ---
    try {
        const response = await fetch(`${API_URL}?action=verificar_palpites_enviados&usuario_id=${user.id}`);
        const result = await response.json();

        if (result.status === 'success' && result.enviados) {
            document.body.innerHTML = ''; // Limpa a página para evitar que o conteúdo apareça rapidamente
            showSweetAlert('Acesso Negado', 'Você já publicou seus palpites. Não pode mais editá-los.', 'warning', () => {
                window.location.href = 'jogos.html';
            });
            return; // Interrompe a execução do resto do script
        }
    } catch (error) {
        showSweetAlert('Erro de Conexão', 'Não foi possível verificar o status dos seus palpites. Tente novamente.', 'error');
        return;
    }

    // --- ELEMENTOS DO DOM ---
    const gamesContainer = document.getElementById('gamesContainer');
    const palpitesCount = document.getElementById('palpitesCount');
    const progressFill = document.getElementById('progressFill');
    const publishBtn = document.getElementById('publishBtn');

    // --- FUNÇÕES ---

    // Função para renderizar os jogos na tela
    function renderGames(jogos) {
        if (!jogos || jogos.length === 0) {
            gamesContainer.innerHTML = '<p>Nenhum jogo encontrado ou falha ao carregar.</p>';
            return;
        }
        totalGames = jogos.length;
        gamesContainer.innerHTML = ''; // Limpa o container

        jogos.forEach(jogo => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';
            gameCard.dataset.gameId = jogo.id;

            gameCard.innerHTML = `
                <div class="game-info">
                    <div class="game-date">${jogo.data_formatada} | Grupo ${jogo.grupo}</div>
                    <div class="teams">
                        <div class="team"><span>${jogo.time_casa}</span></div>
                        <div class="score-inputs">
                            <input type="number" min="0" max="99" class="score-input" data-team="home" placeholder="-" required>
                            <span class="vs">X</span>
                            <input type="number" min="0" max="99" class="score-input" data-team="away" placeholder="-" required>
                        </div>
                        <div class="team"><span>${jogo.time_visitante}</span></div>
                    </div>
                </div>
            `;
            gamesContainer.appendChild(gameCard);
        });
        updateProgress();
    }

    // Função para atualizar a contagem e a barra de progresso
    function updateProgress() {
        const inputs = gamesContainer.querySelectorAll('.score-input');
        let filledCount = 0;
        for (let i = 0; i < inputs.length; i += 2) {
            if (inputs[i].value !== '' && inputs[i+1].value !== '') {
                filledCount++;
            }
        }

        palpitesCount.textContent = `${filledCount}/${totalGames} palpites`;
        const percentage = totalGames > 0 ? (filledCount / totalGames) * 100 : 0;
        progressFill.style.width = `${percentage}%`;
        publishBtn.disabled = filledCount !== totalGames;
    }

    // Função para carregar os jogos da API
    async function loadGames() {
        try {
            const response = await fetch(`${API_URL}?action=get_jogos`);
            const data = await response.json();
            if (data.status === 'success') {
                renderGames(data.jogos);
            } else {
                gamesContainer.innerHTML = `<p>Erro: ${data.message}</p>`;
            }
        } catch (error) {
            gamesContainer.innerHTML = '<p>Erro de conexão ao carregar os jogos.</p>';
        }
    }

    // Função para publicar os palpites
    function publishGuesses() { // Não precisa ser async aqui
        Swal.fire({
            title: 'Confirmar Publicação',
            text: "Tem certeza que deseja publicar seus palpites? Esta ação é irreversível!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, publicar!',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => { // A função interna do .then() é async
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Publicando...',
                    text: 'Aguarde enquanto salvamos seus palpites.',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading()
                    }
                });

                // Lógica para coletar os palpites (agora completa)
                const palpites = [];
                const gameCards = gamesContainer.querySelectorAll('.game-card');
                gameCards.forEach(card => {
                    const jogo_id = card.dataset.gameId;
                    const placar_casa = card.querySelector('input[data-team="home"]').value;
                    const placar_visitante = card.querySelector('input[data-team="away"]').value;
                    palpites.push({ jogo_id, placar_casa, placar_visitante });
                });

                // Monta o objeto para enviar à API (agora completo)
                const dataToSend = {
                    action: 'salvar_palpites',
                    usuario_id: user.id,
                    palpites: palpites
                };

                try {
                    const response = await fetch(API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dataToSend)
                    });
                    const result = await response.json();

                    if (result.status === 'success') {
                        Swal.fire('Sucesso!', 'Seus palpites foram publicados.', 'success').then(() => {
                            window.location.href = 'jogos.html';
                        });
                    } else {
                        Swal.fire('Erro!', result.message, 'error');
                    }
                } catch (error) {
                    Swal.fire('Erro de Conexão', 'Não foi possível publicar seus palpites.', 'error');
                }
            }
        });
    }

    // Função auxiliar para os alertas bonitos
    function showSweetAlert(title, text, icon, callback) {
        // Verifica se o SweetAlert já está carregado para não adicionar o script múltiplas vezes
        if (typeof Swal === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
            document.head.appendChild(script );
            script.onload = () => {
                Swal.fire({
                    title: title,
                    text: text,
                    icon: icon,
                    confirmButtonText: 'Ok'
                }).then(callback);
            };
        } else {
            Swal.fire({
                title: title,
                text: text,
                icon: icon,
                confirmButtonText: 'Ok'
            }).then(callback);
        }
    }

    // --- EVENT LISTENERS ---
    // Adiciona verificação para garantir que os elementos existem
    if (gamesContainer) {
        gamesContainer.addEventListener('input', updateProgress);
    }
    if (publishBtn) {
        publishBtn.addEventListener('click', publishGuesses);
    }

    // --- INICIALIZAÇÃO ---
    loadGames();
});
