document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('bolaoUser'));
    if (!user || !user.is_admin) {
        window.location.href = 'index.html';
        return;
    }

    const container = document.getElementById('allResultsContainer');
    const API_URL = 'api/jogos.php';

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

    function renderAllGuesses(data) {
        container.innerHTML = "";
        if (Object.keys(data).length === 0) {
            container.innerHTML = "<p class=\"empty-state\">Nenhum palpite foi encontrado.</p>";
            return;
        }

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const jogosHoje = [];
        const jogosFuturos = [];
        const jogosPassados = [];

        for (const jogoId in data) {
            const jogo = data[jogoId];

            // Divide data e hora
            const [dataParte, horaParte] = jogo.data_formatada.split(" ");
            const [dia, mes] = dataParte.split("/");
            const [hora, minuto] = horaParte ? horaParte.split(":") : ["00", "00"];

            let ano;

            // Se vier ano do backend, usa ele
            if (jogo.ano) {
                ano = parseInt(jogo.ano);
            } else {
                // Se o mês já passou neste ano, assume próximo ano
                const mesAtual = hoje.getMonth() + 1;
                if (parseInt(mes) < mesAtual) {
                    ano = hoje.getFullYear() + 1;
                } else {
                    ano = hoje.getFullYear();
                }
            }

            const dataJogo = new Date(ano, parseInt(mes) - 1, parseInt(dia), parseInt(hora), parseInt(minuto));
            jogo.dataJogoObj = dataJogo;

            const dataJogoSemHora = new Date(dataJogo);
            dataJogoSemHora.setHours(0, 0, 0, 0);

            const dataJogoStr = dataJogoSemHora.toISOString().split('T')[0];
            const hojeStr = hoje.toISOString().split('T')[0];

            if (dataJogoStr === hojeStr) {
                jogosHoje.push({ id: jogoId, ...jogo });
            } else if (dataJogoSemHora > hoje) {
                jogosFuturos.push({ id: jogoId, ...jogo });
            } else {
                jogosPassados.push({ id: jogoId, ...jogo });
            }
        }

        jogosFuturos.sort((a, b) => a.dataJogoObj - b.dataJogoObj);
        jogosPassados.sort((a, b) => b.dataJogoObj - a.dataJogoObj);

        if (jogosHoje.length > 0) {
            const sectionTitle = document.createElement("h3");
            sectionTitle.className = "section-title";
            sectionTitle.innerHTML = "<i class=\"fas fa-calendar-day\"></i> Jogos de Hoje";
            container.appendChild(sectionTitle);
            jogosHoje.forEach(jogo => container.appendChild(createGameCard(jogo.id, jogo)));
        }

        if (jogosFuturos.length > 0) {
            const sectionTitle = document.createElement("h3");
            sectionTitle.className = "section-title";
            sectionTitle.innerHTML = "<i class=\"fas fa-calendar-plus\"></i> Próximos Jogos";
            container.appendChild(sectionTitle);
            jogosFuturos.forEach(jogo => container.appendChild(createGameCard(jogo.id, jogo)));
        }

        if (jogosPassados.length > 0) {
            const sectionTitle = document.createElement("h3");
            sectionTitle.className = "section-title";
            sectionTitle.innerHTML = "<i class=\"fas fa-history\"></i> Jogos Anteriores";
            container.appendChild(sectionTitle);
            jogosPassados.forEach(jogo => container.appendChild(createGameCard(jogo.id, jogo)));
        }
    }

    function createGameCard(jogoId, jogo) {
        const card = document.createElement('div');
        card.className = 'result-card game-card-admin';
        card.dataset.gameId = jogoId;

        card.innerHTML = `
            <div class="card-header">
                <div>
                    <div class="game-title">${jogo.time_casa} vs ${jogo.time_visitante}</div>
                    <div class="game-result">Resultado Oficial: <strong>${jogo.resultado_oficial}</strong></div>
                </div>
                <div class="filter-buttons">
                    <button class="filter-btn active" data-filter="all">Todos</button>
                    <button class="filter-btn" data-filter="10">10 pts</button>
                    <button class="filter-btn" data-filter="8">8 pts</button>
                    <button class="filter-btn" data-filter="5">5 pts</button>
                    <button class="filter-btn" data-filter="3">3 pts</button>
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

        return card;
    }

    // Filtro por nome do usuário
    document.getElementById('userSearchInput').addEventListener('input', function() {
        const searchValue = this.value.toLowerCase();
        const allPalpiteItems = document.querySelectorAll('.palpite-item');

        allPalpiteItems.forEach(item => {
            const nomeUsuario = item.querySelector('strong').innerText.toLowerCase();
            if (nomeUsuario.includes(searchValue)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });

    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            const clickedButton = e.target;
            const filterValue = clickedButton.dataset.filter;
            const card = clickedButton.closest('.game-card-admin');
            const palpitesList = card.querySelectorAll('.palpite-item');

            card.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            clickedButton.classList.add('active');

            palpitesList.forEach(item => {
                const itemPoints = item.dataset.points;
                if (filterValue === 'all' || itemPoints === filterValue) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        }
    });

    loadAllGuesses();
});
