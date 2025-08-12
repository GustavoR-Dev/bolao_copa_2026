document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('bolaoUser'));

    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // --- ELEMENTOS DINÂMICOS ---
    // Cabeçalho
    const linkMeusPalpites = document.querySelector('a[href="jogos.html"]');
    // Botão de Ação Rápida na index.html
    const btnFazerPalpite = document.querySelector('.action-btn.primary');

    // --- LÓGICA DE ADMIN ---
    if (user.is_admin) {
        // 1. Altera o link no header de "Meus Palpites" para "Jogos"
        if (linkMeusPalpites) {
            linkMeusPalpites.textContent = 'Jogos';
        }
        
        // 2. Altera o botão "Fazer Palpite" para "Ver Jogos" na index.html
        if (btnFazerPalpite) {
            btnFazerPalpite.querySelector('span').textContent = 'Ver Jogos';
            btnFazerPalpite.querySelector('i').className = 'fas fa-calendar-alt';
            // O onclick já leva para jogos.html, que é o comportamento desejado para o admin
            btnFazerPalpite.setAttribute('onclick', "window.location.href='jogos.html'");
        }

        const adminLinkContainer = document.getElementById('adminLinkContainer');
        if (adminLinkContainer) {
            adminLinkContainer.style.display = 'inline'; // 'inline' ou 'list-item' dependendo do seu CSS
        }
    } else {
        // Lógica para usuário comum (verifica se já palpitou)
        fetch(`api/jogos.php?action=verificar_palpites_enviados&usuario_id=${user.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.enviados && btnFazerPalpite) {
                    btnFazerPalpite.querySelector('span').textContent = 'Ver Meus Palpites';
                    btnFazerPalpite.querySelector('i').className = 'fas fa-list-check';
                    btnFazerPalpite.setAttribute('onclick', "window.location.href='jogos.html'");
                }
            });
    }

    // --- ELEMENTOS DO DOM ---
    const userNameElement = document.getElementById('userName');
    const userInfoElement = document.getElementById('userInfo');
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutBtnMobile = document.getElementById('logoutBtnMobile');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMobile = document.querySelector('.nav-mobile');

    // --- INICIALIZAÇÃO DA PÁGINA ---
    // Preenche as informações do usuário no cabeçalho
    if (userNameElement) {
        userNameElement.textContent = user.nome;
    }

    // Adiciona funcionalidade de dropdown ao clicar no nome/avatar
    if (userInfoElement) {
        userInfoElement.addEventListener('click', (event) => {
            // Evita que o clique no botão de logout feche o dropdown imediatamente
            if (event.target.id !== 'logoutBtn' && !event.target.closest('#logoutBtn')) {
                const dropdown = userInfoElement.querySelector('.user-dropdown');
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            }
        });
    }
    
    // Fecha o dropdown se clicar fora dele
    document.addEventListener('click', function(event) {
        if (userInfoElement && !userInfoElement.contains(event.target)) {
            const dropdown = userInfoElement.querySelector('.user-dropdown');
            if (dropdown) {
                dropdown.style.display = 'none';
            }
        }
    });


    // --- FUNÇÃO DE LOGOUT ---
    const handleLogout = async () => {
        // Limpa os dados do usuário do localStorage
        localStorage.removeItem('bolaoUser');

        // Opcional: notificar o back-end sobre o logout para destruir a sessão PHP
        try {
            await fetch('api/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'logout' })
            });
        } catch (error) {
            console.error("Erro ao notificar o servidor sobre o logout:", error);
        }

        // Redireciona para a página de login
        window.location.href = 'login.html';
    };

    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (logoutBtnMobile) logoutBtnMobile.addEventListener('click', handleLogout);


    // --- CONTROLES DO MENU MOBILE ---
    if (mobileMenuBtn && navMobile) {
        mobileMenuBtn.addEventListener('click', function() {
            navMobile.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }

    // --- ALERTAS DE AJUDA E CONTATO (SweetAlert2) ---
    const linkAjuda = document.querySelector('a[href="#ajuda"]');
    const linkContato = document.querySelector('a[href="#contato"]');

    if (linkAjuda) {
        linkAjuda.addEventListener('click', (e) => {
            e.preventDefault();
            Swal.fire({
                title: 'Precisa de Ajuda?',
                text: 'Para obter ajuda, entre em contato com o administrador ou consulte as regras do bolão.',
                icon: 'info',
                confirmButtonText: 'Entendi',
                confirmButtonColor: '#259a3f'
            });
        });
    }

    if (linkContato) {
        linkContato.addEventListener('click', (e) => {
            e.preventDefault();
            Swal.fire({
                title: 'Fale Conosco',
                html: `
                    <p>Email: <a href="mailto:gustavo.rossi2612@gmail.com">gustavo.rossi2612@gmail.com</a></p>
                    <p>WhatsApp: <a href="https://wa.me/5585992376342" target="_blank">(85) 99237-6342</a></p>
                `,
                icon: 'success',
                confirmButtonText: 'Ok',
                confirmButtonColor: '#259a3f'
            });
        });
    }
});