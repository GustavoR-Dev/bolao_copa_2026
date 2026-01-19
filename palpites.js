document.addEventListener('DOMContentLoaded', async () => {

    // =========================
    // AUTENTICAÇÃO
    // =========================
    const user = JSON.parse(localStorage.getItem('bolaoUser'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const limitarNomeExibido = (nomeCompleto) => {
        const palavras = nomeCompleto.trim().split(/\s+/);
        let nome = palavras[0];
        if (palavras.length > 1) nome += ' ' + palavras[1];
        return nome.length > 20 ? nome.substring(0, 20) + '...' : nome;
    };

    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = limitarNomeExibido(user.nome);
    }

    // =========================
    // BLOQUEIO POR DATA
    // =========================
    const dataLimite = new Date('2026-06-10T23:59:59');
    if (new Date() > dataLimite) {
        document.body.innerHTML = '';
        Swal.fire({
            title: 'Período Encerrado',
            text: 'O prazo para enviar palpites terminou em 10/06/2026.',
            icon: 'error'
        }).then(() => window.location.href = 'index.html');
        return;
    }

    // =========================
    // VARIÁVEIS
    // =========================
    const API_URL = 'api/jogos.php';
    let totalGames = 0;
    let salvarTimeout = null;

    const gamesContainer = document.getElementById('gamesContainer');
    const palpitesCount = document.getElementById('palpitesCount');
    const progressFill = document.getElementById('progressFill');
    const publishBtn = document.getElementById('publishBtn');

    // =========================
    // VERIFICA SE JÁ PUBLICOU
    // =========================
    try {
        const res = await fetch(`${API_URL}?action=verificar_palpites_enviados&usuario_id=${user.id}`);
        const result = await res.json();

        if (result.status === 'success' && result.enviados) {
            document.body.innerHTML = '';
            Swal.fire(
                'Acesso Negado',
                'Você já publicou seus palpites e não pode mais editá-los.',
                'warning'
            ).then(() => window.location.href = 'jogos.html');
            return;
        }
    } catch {
        Swal.fire('Erro', 'Erro ao verificar seus palpites.', 'error');
        return;
    }

    // =========================
    // RENDERIZA JOGOS
    // =========================
    function renderGames(jogos) {
        totalGames = jogos.length;
        gamesContainer.innerHTML = '';

        jogos.forEach(jogo => {
            const card = document.createElement('div');
            card.className = 'game-card';
            card.dataset.gameId = jogo.id;

            card.innerHTML = `
                <div class="game-info">
                    <div class="game-date">${jogo.data_formatada} | Grupo ${jogo.grupo}</div>
                    <div class="teams">
                        <div class="team">${jogo.time_casa}</div>
                        <div class="score-inputs">
                            <input type="number" min="0" class="score-input" data-team="home">
                            <span>X</span>
                            <input type="number" min="0" class="score-input" data-team="away">
                        </div>
                        <div class="team">${jogo.time_visitante}</div>
                    </div>
                </div>
            `;
            gamesContainer.appendChild(card);
        });

        updateProgress();
    }

    // =========================
    // PROGRESSO
    // =========================
    function updateProgress() {
        const inputs = gamesContainer.querySelectorAll('.score-input');
        let filled = 0;

        for (let i = 0; i < inputs.length; i += 2) {
            if (inputs[i].value !== '' && inputs[i + 1].value !== '') {
                filled++;
            }
        }

        palpitesCount.textContent = `${filled}/${totalGames} palpites`;
        progressFill.style.width = totalGames ? `${(filled / totalGames) * 100}%` : '0%';
        publishBtn.disabled = filled !== totalGames;
    }

    // =========================
    // CARREGAR JOGOS
    // =========================
    async function loadGames() {
        const res = await fetch(`${API_URL}?action=get_jogos`);
        const data = await res.json();
        if (data.status === 'success') {
            renderGames(data.jogos);
        }
    }

    // =========================
    // SALVAR RASCUNHO
    // =========================
    async function salvarRascunho() {
        const palpites = [];

        document.querySelectorAll('.game-card').forEach(card => {
            const casa = card.querySelector('[data-team="home"]').value;
            const fora = card.querySelector('[data-team="away"]').value;

            if (casa !== '' || fora !== '') {
                palpites.push({
                    jogo_id: card.dataset.gameId,
                    placar_casa: casa,
                    placar_visitante: fora
                });
            }
        });

        if (!palpites.length) return;

        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'salvar_rascunho',
                usuario_id: user.id,
                palpites
            })
        });
    }

    // =========================
    // CARREGAR PALPITES SALVOS
    // =========================
    async function carregarPalpitesSalvos() {
        const res = await fetch(`${API_URL}?action=get_palpites_usuario&usuario_id=${user.id}`);
        const data = await res.json();
        if (data.status !== 'success') return;

        data.palpites.forEach(p => {
            const card = document.querySelector(`.game-card[data-game-id="${p.jogo_id}"]`);
            if (!card) return;

            card.querySelector('[data-team="home"]').value = p.placar_casa;
            card.querySelector('[data-team="away"]').value = p.placar_visitante;
        });

        updateProgress();
    }

    // =========================
    // PUBLICAR PALPITES
    // =========================
    function publishGuesses() {
        Swal.fire({
            title: 'Confirmar publicação?',
            text: 'Após publicar, não será possível editar.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Publicar'
        }).then(async (result) => {
            if (!result.isConfirmed) return;

            const palpites = [];
            document.querySelectorAll('.game-card').forEach(card => {
                palpites.push({
                    jogo_id: card.dataset.gameId,
                    placar_casa: card.querySelector('[data-team="home"]').value,
                    placar_visitante: card.querySelector('[data-team="away"]').value
                });
            });

            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'salvar_palpites',
                    usuario_id: user.id,
                    palpites
                })
            });

            const data = await res.json();
            if (data.status === 'success') {
                Swal.fire('Sucesso', 'Palpites publicados!', 'success')
                    .then(() => window.location.href = 'jogos.html');
            } else {
                Swal.fire('Erro', data.message, 'error');
            }
        });
    }

    // =========================
    // EVENTOS
    // =========================
    gamesContainer.addEventListener('input', () => {
        updateProgress();
        clearTimeout(salvarTimeout);
        salvarTimeout = setTimeout(salvarRascunho, 800);
    });

    publishBtn.addEventListener('click', publishGuesses);

    // =========================
    // INIT
    // =========================
    await loadGames();
    await carregarPalpitesSalvos();

});
