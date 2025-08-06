document.addEventListener('DOMContentLoaded', ( ) => {
    const user = JSON.parse(localStorage.getItem('bolaoUser'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const rankingBody = document.getElementById('rankingBody');
    const API_URL = 'api/tabela.php';

    // Função para renderizar a tabela de classificação
    // ... (dentro de tabela.js)
    function renderRanking(rankingData) {
        rankingBody.innerHTML = ''; 

        if (!rankingData || rankingData.length === 0) {
            rankingBody.innerHTML = '<tr><td colspan="3" class="empty-state">Nenhum participante encontrado.</td></tr>';
            return;
        }

        let position = 1; // Usaremos uma variável de posição manual
        rankingData.forEach((player) => {
            // PULA O ADMIN: Se o ID do jogador for do admin, não renderiza e vai para o próximo
            if (player.is_admin == 1) { // Adicionamos a verificação aqui
                return; 
            }

            const row = document.createElement('tr');
            
            if (player.id == user.id) {
                row.className = 'current-user';
            }

            let positionIcon = `<span class="position-number">${position}º</span>`;
            if (position === 1) positionIcon = '<i class="fas fa-trophy gold"></i>';
            if (position === 2) positionIcon = '<i class="fas fa-trophy silver"></i>';
            if (position === 3) positionIcon = '<i class="fas fa-trophy bronze"></i>';

            row.innerHTML = `
                <td class="col-pos">${positionIcon}</td>
                <td class="col-user">${player.nome}</td>
                <td class="col-pts">${player.pontos_total}</td>
            `;
            rankingBody.appendChild(row);
            position++; // Incrementa a posição apenas se o jogador for renderizado
        });
    }

    // Função para carregar os dados do ranking da API
    async function loadRanking() {
        try {
            const response = await fetch(`${API_URL}?action=get_ranking`);
            const result = await response.json();

            if (result.status === 'success') {
                renderRanking(result.ranking);
            } else {
                rankingBody.innerHTML = `<tr><td colspan="3" class="error-state">Erro ao carregar o ranking: ${result.message}</td></tr>`;
            }
        } catch (error) {
            rankingBody.innerHTML = '<tr><td colspan="3" class="error-state">Erro de conexão. Não foi possível carregar o ranking.</td></tr>';
        }
    }

    // Inicia o carregamento dos dados
    loadRanking();
});
