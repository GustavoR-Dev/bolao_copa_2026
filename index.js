document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('bolaoUser'));
    if (!user) {
        // Se não houver usuário logado, não faz nada ou redireciona
        // A verificação principal já está em script.js, então aqui só garantimos
        return;
    }

    const rankingContainer = document.getElementById('ranking-list-container');
    const myBetsContainer = document.getElementById('my-bets-list-container');
    const API_URL_RANKING = 'api/tabela.php';
    const API_URL_JOGOS = 'api/jogos.php';

    // --- Funções para o Ranking (já implementadas) ---
    function createRankingItem(player, position, isCurrentUser = false) {
        const icons = {
            1: '<i class="fas fa-crown"></i>',
            2: '<i class="fas fa-medal"></i>',
            3: '<i class="fas fa-award"></i>'
        };
        const icon = isCurrentUser ? '<i class="fas fa-user"></i>' : (icons[position] || '<i class="fas fa-user"></i>');
        const name = isCurrentUser ? 'Você' : player.nome;
        
        let itemClass = 'ranking-item';
        if (position === 1) itemClass += ' destaque';
        if (isCurrentUser) itemClass += ' atual';

        return `
            <div class="${itemClass}">
                <div class="posicao">${position}º</div>
                <div class="usuario">
                    <div class="avatar">${icon}</div>
                    <div class="info">
                        <span class="nome">${name}</span>
                    </div>
                </div>
                <div class="pontos">${player.pontos_total}</div>
            </div>
        `;
    }

    async function loadRankingSummary() {
        try {
            const response = await fetch(`${API_URL_RANKING}?action=get_ranking`);
            const result = await response.json();

            if (result.status !== 'success' || !result.ranking) {
                rankingContainer.innerHTML = '<p class="error-state">Não foi possível carregar o ranking.</p>';
                return;
            }

            const rankingData = result.ranking.filter(p => p.is_admin != 1);
            
            if (rankingData.length === 0) {
                rankingContainer.innerHTML = '<p>Ainda não há participantes no ranking.</p>';
                return;
            }

            let currentUserData = null;
            let currentUserPosition = -1;
            rankingData.forEach((player, index) => {
                if (player.id == user.id) {
                    currentUserData = player;
                    currentUserPosition = index + 1;
                }
            });

            let htmlContent = '';
            const top3 = rankingData.slice(0, 3);
            top3.forEach((player, index) => {
                const position = index + 1;
                const isCurrentUserInTop3 = player.id == user.id;
                htmlContent += createRankingItem(player, position, isCurrentUserInTop3);
            });

            const isUserInTop3 = currentUserPosition > 0 && currentUserPosition <= 3;
            if (currentUserData && !isUserInTop3) {
                if (rankingData.length > 4 && currentUserPosition > 4) {
                    htmlContent += '<div class="ranking-separator">...</div>';
                }
                htmlContent += createRankingItem(currentUserData, currentUserPosition, true);
            }

            rankingContainer.innerHTML = htmlContent;

        } catch (error) {
            console.error("Erro ao carregar o resumo do ranking:", error);
            rankingContainer.innerHTML = '<p class="error-state">Erro de conexão ao buscar o ranking.</p>';
        }
    }

    // --- Novas Funções para Meus Palpites Recentes ---
    function getIconForPoints(points) {
        if (points === 100) return 'fa-check'; // Acertou em cheio
        if (points === 50) return 'fa-star-half-alt'; // Acertou o resultado (vitória/empate/derrota)
        if (points === 0) return 'fa-times'; // Errou
        return 'fa-clock'; // Pendente
    }

    function getLabelForPoints(points) {
        if (points === 100) return 'Acertou!';
        if (points === 50) return 'Parcial!';
        if (points === 0) return 'Errou!';
        return 'Pendente';
    }

    function getClassForPoints(points) {
        if (points === 100) return 'acertou';
        if (points === 50) return 'acertou-parcial';
        if (points === 0) return 'errou';
        return ''; // Para pendente
    }

    async function loadMyRecentBets() {
        try {
            const response = await fetch(`${API_URL_JOGOS}?action=get_meus_resultados&usuario_id=${user.id}`);
            const result = await response.json();

            if (result.status !== 'success' || !result.dados) {
                myBetsContainer.innerHTML = '<p class="error-state">Não foi possível carregar seus palpites.</p>';
                return;
            }

            // Filtra apenas jogos com resultado oficial e ordena do mais recente para o mais antigo
            const completedGames = result.dados.filter(game => game.resultado_casa !== null && game.resultado_visitante !== null)
                                                .sort((a, b) => new Date(b.data_jogo) - new Date(a.data_jogo));

            if (completedGames.length === 0) {
                myBetsContainer.innerHTML = '<p>Nenhum palpite com resultado oficial ainda.</p>';
                return;
            }

            // Pega os 3 últimos jogos com resultado
            const recentBets = completedGames.slice(0, 3);

            let htmlContent = '';
            recentBets.forEach(bet => {
                const palpiteClass = getClassForPoints(bet.pontos_obtidos);
                const icon = getIconForPoints(bet.pontos_obtidos);
                const label = getLabelForPoints(bet.pontos_obtidos);
                const pointsText = bet.pontos_obtidos !== null ? `+${bet.pontos_obtidos} pts` : '';

                htmlContent += `
                    <div class="palpite-item ${palpiteClass}">
                        <div class="jogo-resumo">
                            <span class="times">${bet.time_casa} ${bet.placar_casa ?? '-'} x ${bet.placar_visitante ?? '-'} ${bet.time_visitante}</span>
                            <span class="data">${bet.data_formatada.split(' ')[0]}</span>
                        </div>
                        <div class="palpite-info">
                            <span class="palpite">Seu palpite: ${bet.palpite_casa ?? '?'} x ${bet.palpite_visitante ?? '?'}</span>
                            <span class="resultado ${palpiteClass}">
                                <i class="fas ${icon}"></i>
                                ${pointsText}
                            </span>
                        </div>
                    </div>
                `;
            });

            myBetsContainer.innerHTML = htmlContent;

        } catch (error) {
            console.error("Erro ao carregar os palpites recentes:", error);
            myBetsContainer.innerHTML = '<p class="error-state">Erro de conexão ao buscar seus palpites.</p>';
        }
    }

    // --- Inicialização ---
    loadRankingSummary();
    loadMyRecentBets();
});


