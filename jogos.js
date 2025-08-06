document.addEventListener('DOMContentLoaded', () => {
    // --- 1. AUTENTICAÇÃO E CONFIGURAÇÃO INICIAL ---
    const user = JSON.parse(localStorage.getItem('bolaoUser'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const resultsContainer = document.getElementById('resultsContainer');
    const API_URL = 'api/jogos.php';

    // --- 2. LÓGICA DE VISUALIZAÇÃO DO ADMIN ---
    // (Esta parte adapta a interface se o usuário for um administrador)
    if (user.is_admin) {
        // Mostra o container de ações do admin (botão "Adicionar Jogo")
        const adminActionsContainer = document.getElementById('adminActionsContainer');
        if (adminActionsContainer) {
            adminActionsContainer.style.display = 'block';
        }

        // Muda os títulos da página para o contexto de admin
        const pageTitle = document.getElementById('pageTitle');
        const pageSubtitle = document.getElementById('pageSubtitle');
        if (pageTitle) pageTitle.innerHTML = '<i class="fas fa-cogs"></i> Gerenciar Jogos';
        if (pageSubtitle) pageSubtitle.textContent = 'Adicione, edite e atualize os resultados das partidas.';
    }

    // --- 3. FUNÇÕES PRINCIPAIS ---

    // Função para renderizar os dados na tela
    function renderResults(data) {
        resultsContainer.innerHTML = ''; // Limpa o container
        if (!data || data.length === 0) {
            const emptyMessage = user.is_admin ?
                'Nenhum jogo cadastrado. Clique em "Adicionar Novo Jogo" para começar.' :
                'Você ainda não enviou seus palpites. <a href="palpites.html">Clique aqui para palpitar!</a>';
            resultsContainer.innerHTML = `<p class="empty-state">${emptyMessage}</p>`;
            return;
        }

        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'result-card';
            card.dataset.gameId = item.id;

            let pointsClass = 'pending';
            if (item.pontos_obtidos === 100) pointsClass = 'exact';
            else if (item.pontos_obtidos === 50) pointsClass = 'partial';
            else if (item.pontos_obtidos === 0) pointsClass = 'zero';

            card.innerHTML = `
                <div class="card-header">
                    <span>${item.data_formatada} | Grupo ${item.grupo}</span>
                    ${user.is_admin ? `<button class="btn-edit-game" title="Editar Jogo"><i class="fas fa-pencil-alt"></i></button>` : ''}
                </div>
                <div class="card-body">
                    <div class="teams-line">
                        <span class="team-name home">${item.time_casa}</span>
                        <span class="vs-separator">X</span>
                        <span class="team-name away">${item.time_visitante}</span>
                    </div>
                    <div class="scores">
                        <div class="user-guess">
                            <span class="label">Seu Palpite</span>
                            <span class="score">${item.palpite_casa ?? '-'} x ${item.palpite_visitante ?? '-'}</span>
                        </div>
                        <div class="official-result" id="result-${item.id}">
                            <span class="label">Resultado Oficial</span>
                            ${renderOfficialResult(item)}
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="points-badge ${pointsClass}">
                        <i class="fas ${getIconForPoints(item.pontos_obtidos)}"></i>
                        <span>${getLabelForPoints(item.pontos_obtidos)}</span>
                    </div>
                </div>
            `;
            resultsContainer.appendChild(card);
        });
    }

    // Função para renderizar a seção de resultado oficial (diferente para admin)
    function renderOfficialResult(item) {
        if (user.is_admin && item.resultado_casa === null) {
            return `
                <div class="admin-input-group">
                    <input type="number" min="0" class="admin-score-input" data-team="home" placeholder="-">
                    <span>x</span>
                    <input type="number" min="0" class="admin-score-input" data-team="away" placeholder="-">
                    <button class="btn-save-result" title="Salvar Resultado"><i class="fas fa-save"></i></button>
                </div>
            `;
        }
        return `<span class="score">${item.resultado_casa ?? '?'} x ${item.resultado_visitante ?? '?'}</span>`;
    }

    // Função para renderizar uma lista de jogos em um container
    function renderGamesList(jogos, container) {
        container.innerHTML = ''; // Limpa o container

        if (jogos.length === 0) {
            container.innerHTML = `<p class="empty-state">Nenhum jogo disponível.</p>`;
            return;
        }

        jogos.forEach(jogo => {
            const card = document.createElement('div');
            card.className = 'result-card';
            card.innerHTML = `
                <div class="card-header">
                    <span>${jogo.data_formatada} | Grupo ${jogo.grupo}</span>
                </div>
                <div class="card-body">
                    <div class="teams-line">
                        <span class="team-name home">${jogo.time_casa}</span>
                        <span class="vs-separator">X</span>
                        <span class="team-name away">${jogo.time_visitante}</span>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    async function carregarJogosPublicos() {
        const todayContainer = document.getElementById('todayGamesContainer');
        const allContainer = document.getElementById('allGamesContainer');

        try {
            // Primeiro busca jogos de hoje
            const hojeResponse = await fetch(`${API_URL}?action=get_jogos_hoje`);
            const hojeData = await hojeResponse.json();

            if (hojeData.status === 'success' && hojeData.jogos.length > 0) {
                renderGamesList(hojeData.jogos, todayContainer);
            } else {
                document.getElementById('todayGamesSection').style.display = 'none';
            }

            // Agora busca todos os jogos
            const allResponse = await fetch(`${API_URL}?action=get_todos_jogos`);
            const allData = await allResponse.json();

            if (allData.status === 'success') {
                renderGamesList(allData.jogos, allContainer);
            } else {
                allContainer.innerHTML = `<p class="error-state">Erro ao carregar jogos.</p>`;
            }

        } catch (error) {
            todayContainer.innerHTML = `<p class="error-state">Erro ao carregar jogos de hoje.</p>`;
            allContainer.innerHTML = `<p class="error-state">Erro ao carregar todos os jogos.</p>`;
        }
    }

    // Funções auxiliares para ícones e labels de pontos
    function getIconForPoints(points) {
        if (points === 100) return 'fa-star';
        if (points === 50) return 'fa-star-half-alt';
        if (points === 0) return 'fa-times-circle';
        return 'fa-clock';
    }

    function getLabelForPoints(points) {
        if (points !== null) return `${points} pontos`;
        return 'Pendente';
    }

    // Função para carregar os dados da API
    async function loadMyResults() {
        try {
            const response = await fetch(`${API_URL}?action=get_meus_resultados&usuario_id=${user.id}`);
            const result = await response.json();
            if (result.status === 'success') {
                renderResults(result.dados);
            } else {
                resultsContainer.innerHTML = `<p class="error-state">Erro: ${result.message}</p>`;
            }
        } catch (error) {
            resultsContainer.innerHTML = '<p class="error-state">Erro de conexão ao carregar os resultados.</p>';
        }
    }

    // --- 4. EVENT LISTENERS ---

    // Listener único para todos os cliques dentro do container de resultados
    resultsContainer.addEventListener('click', async (e) => {
        const saveButton = e.target.closest('.btn-save-result');
        const editButton = e.target.closest('.btn-edit-game');

        // Lógica para SALVAR RESULTADO
        if (saveButton) {
            const card = saveButton.closest('.result-card');
            const gameId = card.dataset.gameId;
            const placarCasa = card.querySelector('.admin-score-input[data-team="home"]').value;
            const placarVisitante = card.querySelector('.admin-score-input[data-team="away"]').value;

            if (placarCasa === '' || placarVisitante === '') {
                Swal.fire('Atenção!', 'Por favor, preencha ambos os placares.', 'warning');
                return;
            }

            saveButton.disabled = true;
            saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

            const data = {
                action: 'atualizar_resultado',
                jogo_id: gameId,
                placar_casa: placarCasa,
                placar_visitante: placarVisitante,
                is_admin: user.is_admin
            };

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (result.status === 'success') {
                    loadMyResults(); // Recarrega tudo para refletir as novas pontuações
                } else {
                    Swal.fire('Erro!', result.message, 'error');
                    saveButton.disabled = false;
                    saveButton.innerHTML = '<i class="fas fa-save"></i>';
                }
            } catch (error) {
                Swal.fire('Erro de Conexão', 'Não foi possível salvar o resultado.', 'error');
                saveButton.disabled = false;
                saveButton.innerHTML = '<i class="fas fa-save"></i>';
            }
        }

        // Lógica para EDITAR JOGO
        if (editButton) {
            const card = editButton.closest('.result-card');
            const gameId = card.dataset.gameId;

            try {
                const gameDataResponse = await fetch(`${API_URL}?action=get_jogo_details&id=${gameId}`);
                const gameData = await gameDataResponse.json();

                if (gameData.status !== 'success') {
                    Swal.fire('Erro!', 'Não foi possível buscar os detalhes do jogo.', 'error');
                    return;
                }

                const { value: formValues } = await Swal.fire({
                    title: 'Editar Jogo',
                    html: `
                        <input id="swal-time-casa" class="swal2-input" value="${gameData.jogo.time_casa}">
                        <input id="swal-time-visitante" class="swal2-input" value="${gameData.jogo.time_visitante}">
                        <input type="datetime-local" id="swal-data-jogo" class="swal2-input" value="${gameData.jogo.data_jogo.replace(' ', 'T')}">
                    `,
                    focusConfirm: false,
                    preConfirm: () => ({
                        time_casa: document.getElementById('swal-time-casa').value,
                        time_visitante: document.getElementById('swal-time-visitante').value,
                        data_jogo: document.getElementById('swal-data-jogo').value
                    })
                });

                if (formValues) {
                    const dataToSend = {
                        action: 'editar_jogo',
                        is_admin: user.is_admin,
                        jogo_id: gameId,
                        ...formValues
                    };
                    const response = await fetch(API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dataToSend)
                    });
                    const result = await response.json();
                    if (result.status === 'success') {
                        Swal.fire('Sucesso!', 'Jogo atualizado.', 'success');
                        loadMyResults();
                    } else {
                        Swal.fire('Erro!', result.message, 'error');
                    }
                }
            } catch (error) {
                Swal.fire('Erro de Conexão', 'Não foi possível editar o jogo.', 'error');
            }
        }
    });

    // Listener para o botão "Adicionar Jogo" (se ele existir na página)
    const addGameBtn = document.getElementById('addGameBtn');
    if (addGameBtn) {
        addGameBtn.addEventListener('click', async () => {
            const { value: formValues } = await Swal.fire({
                title: 'Adicionar Novo Jogo',
                html: `
                    <input id="swal-grupo" class="swal2-input" placeholder="Grupo (Ex: A)">
                    <input id="swal-time-casa" class="swal2-input" placeholder="Nome do Time da Casa">
                    <input id="swal-time-visitante" class="swal2-input" placeholder="Nome do Time Visitante">
                    <input type="datetime-local" id="swal-data-jogo" class="swal2-input">
                `,
                focusConfirm: false,
                preConfirm: () => ({
                    grupo: document.getElementById('swal-grupo').value,
                    time_casa: document.getElementById('swal-time-casa').value,
                    time_visitante: document.getElementById('swal-time-visitante').value,
                    data_jogo: document.getElementById('swal-data-jogo').value
                })
            });

            if (formValues) {
                if (!formValues.grupo || !formValues.time_casa || !formValues.time_visitante || !formValues.data_jogo) {
                    Swal.fire('Erro!', 'Todos os campos são obrigatórios.', 'error');
                    return;
                }
                const dataToSend = { action: 'adicionar_jogo', is_admin: user.is_admin, ...formValues };
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataToSend)
                });
                const result = await response.json();
                if (result.status === 'success') {
                    Swal.fire('Sucesso!', 'Novo jogo adicionado.', 'success');
                    loadMyResults();
                } else {
                    Swal.fire('Erro!', result.message, 'error');
                }
            }
        });
    }

    // --- 5. INICIALIZAÇÃO ---
    loadMyResults();
});
