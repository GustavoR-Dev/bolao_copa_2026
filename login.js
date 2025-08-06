document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('loginContainer');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const notification = document.getElementById('notification');

    const API_URL = 'api/login.php';

    // Alternar para o modo de registro
    showRegister.addEventListener('click', () => {
        loginContainer.classList.add('register-mode');
    });

    // Alternar para o modo de login
    showLogin.addEventListener('click', () => {
        loginContainer.classList.remove('register-mode');
    });

    // Função para exibir notificações
    function showNotification(message, type) {
        notification.textContent = message;
        notification.className = type; // 'success' ou 'error'
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 4000);
    }

    // Lidar com o envio do formulário de LOGIN
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const data = {
            action: 'login',
            email: email,
            senha: password
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.status === 'success') {
                // Armazena os dados do usuário no localStorage para usar em outras páginas
                localStorage.setItem('bolaoUser', JSON.stringify(result.user));
                showNotification(result.message, 'success');
                // Redireciona para a página principal após um curto intervalo
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                showNotification(result.message, 'error');
            }
        } catch (error) {
            showNotification('Erro de conexão. Tente novamente.', 'error');
        }
    });

    // Lidar com o envio do formulário de REGISTRO
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        const data = {
            action: 'register',
            nome: name,
            email: email,
            senha: password
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.status === 'success') {
                showNotification(result.message + ' Faça o login para continuar.', 'success');
                // Limpa o formulário e volta para a tela de login
                registerForm.reset();
                loginContainer.classList.remove('register-mode');
            } else {
                showNotification(result.message, 'error');
            }
        } catch (error) {
            showNotification('Erro de conexão. Tente novamente.', 'error');
        }
    });
});
