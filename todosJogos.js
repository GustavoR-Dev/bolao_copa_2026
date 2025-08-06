document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('bolaoUser'));
    // Bloqueia o acesso se o usuário não for admin
    if (!user || !user.is_admin) {
        window.location.href = 'index.html';
        return;
    }

    const container = document.getElementById('allResultsContainer');
    const API_URL = 'api/jogos.php';

    // Função principal para carregar os dados da API
    async function loadAllGuesses() {
        try {
            const response = await fetch(`${API_URL}?action=get_todos_palpites`);
            const result = await response.json();
            if (result.status === 'success') {
                renderAllGuesses(result.dados);
            } else {
                container.innerHTML = `<p class="error-state">Erro: ${result.message}</p>`;
            }
        } catch (error) {
            container.innerHTML = '<p class="error-state">Erro de conexão.</p>';
        }
    }

    // Função para renderizar todos os jogos e seus palpites
    function renderAllGuesses(data) {
        container.innerHTML = '';
        if (Object.keys(data).length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhum palpite foi encontrado.</p>';
            return;
        }

        for (const jogoId in data) {
            const jogo = data[jogoId];
            const card = document.createElement('div');
            card.className = 'result-card game-card-admin'; // Adiciona classe específica
            card.dataset.gameId = jogoId;

            card.innerHTML = `
                <div class="card-header">
                    <div>
                        <div class="game-title">${jogo.time_casa} vs ${jogo.time_visitante}</div>
                        <div class="game-result">Resultado Oficial: <strong>${jogo.resultado_oficial}</strong></div>
                    </div>
                    <div class="filter-buttons">
                        <button class="filter-btn active" data-filter="all">Todos</button>
                        <button class="filter-btn" data-filter="100">100 pts</button>
                        <button class="filter-btn" data-filter="50">50 pts</button>
                        <button class="filter-btn" data-filter="0">0 pts</button>
                    </div>
                </div>
                <div class="card-body">
                    <ul class="palpite-list">
                        ${jogo.palpites.map(p => `
                            <li class="palpite-item" data-points="${p.pontos_obtidos}">
                                <span><strong>${p.nome_usuario}:</strong> ${p.placar_casa} x ${p.placar_visitante}</span>
                                <span class="points-badge">${p.pontos_obtidos !== null ? p.pontos_obtidos + ' pts' : 'Pendente'}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
            container.appendChild(card);
        }
    }

    // --- LÓGICA DE FILTRAGEM ---
    // Usa delegação de eventos para escutar cliques em todo o container
    container.addEventListener('click', (e) => {
        // Verifica se o clique foi em um botão de filtro
        if (e.target.classList.contains('filter-btn')) {
            const clickedButton = e.target;
            const filterValue = clickedButton.dataset.filter;
            const card = clickedButton.closest('.game-card-admin');
            const palpitesList = card.querySelectorAll('.palpite-item');

            // Atualiza a classe 'active' nos botões
            card.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            clickedButton.classList.add('active');

            // Itera sobre cada item de palpite e mostra/esconde conforme o filtro
            palpitesList.forEach(item => {
                const itemPoints = item.dataset.points;
                
                if (filterValue === 'all' || itemPoints === filterValue) {
                    item.style.display = 'flex'; // Mostra o item
                } else {
                    item.style.display = 'none'; // Esconde o item
                }
            });
        }
    });

    // Inicia o carregamento dos dados
    loadAllGuesses();
});
