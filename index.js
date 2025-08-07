document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('bolaoUser'));
    if (!user) {
        // Se não houver usuário logado, não faz nada ou redireciona
        // A verificação principal já está em script.js, então aqui só garantimos
        return;
    }

    const rankingContainer = document.getElementById('ranking-list-container');
    const API_URL = 'api/tabela.php';

    // Função para criar o HTML de um item do ranking
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

    // Função principal para carregar e renderizar o ranking resumido
    async function loadRankingSummary() {
        try {
            const response = await fetch(`${API_URL}?action=get_ranking`);
            const result = await response.json();

            if (result.status !== 'success' || !result.ranking) {
                rankingContainer.innerHTML = '<p class="error-state">Não foi possível carregar o ranking.</p>';
                return;
            }

            // Filtra o admin do ranking para não contar na posição
            const rankingData = result.ranking.filter(p => p.is_admin != 1);
            
            if (rankingData.length === 0) {
                rankingContainer.innerHTML = '<p>Ainda não há participantes no ranking.</p>';
                return;
            }

            // Encontra a posição e os dados do usuário logado
            let currentUserData = null;
            let currentUserPosition = -1;
            rankingData.forEach((player, index) => {
                if (player.id == user.id) {
                    currentUserData = player;
                    currentUserPosition = index + 1; // Posição real (1-based)
                }
            });

            let htmlContent = '';
            
            // Pega os 3 primeiros colocados
            const top3 = rankingData.slice(0, 3);
            top3.forEach((player, index) => {
                const position = index + 1;
                // Verifica se o usuário atual está no top 3 para não duplicar
                const isCurrentUserInTop3 = player.id == user.id;
                htmlContent += createRankingItem(player, position, isCurrentUserInTop3);
            });

            // Se o usuário logado não estiver no top 3 e foi encontrado, adiciona sua posição
            const isUserInTop3 = currentUserPosition > 0 && currentUserPosition <= 3;
            if (currentUserData && !isUserInTop3) {
                 // Adiciona um separador visual se houver um grande salto
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

    // Inicia o carregamento dos dados
    loadRankingSummary();
});
