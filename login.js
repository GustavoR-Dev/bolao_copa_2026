document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('loginContainer');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const notification = document.getElementById('notification');

    // Novos elementos para redefinição de senha
    const showReset = document.getElementById('showReset');
    const showLoginFromReset = document.getElementById('showLoginFromReset');
    const resetForm = document.getElementById('resetForm');

    const API_URL = 'api/login.php';

    // Alternar para o modo de registro
    showRegister.addEventListener('click', () => {
        loginContainer.classList.add('register-mode');
    });

    // Alternar para o modo de login
    showLogin.addEventListener('click', () => {
        loginContainer.classList.remove('register-mode');
    });

    // Mostrar formulário de redefinição
    if (showReset) {
        showReset.addEventListener('click', () => {
            document.getElementById('login-form-section').style.display = 'none';
            document.getElementById('register-form-section').style.display = 'none';
            document.getElementById('reset-form-section').style.display = 'block';
        });
    }

    // Voltar ao login a partir da redefinição
    if (showLoginFromReset) {
        showLoginFromReset.addEventListener('click', () => {
            document.getElementById('reset-form-section').style.display = 'none';
            document.getElementById('register-form-section').style.display = 'none';
            document.getElementById('login-form-section').style.display = 'block';
        });
    }

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
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        const data = {
            action: "login",
            email: email,
            senha: password
        };

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.status === "success") {
                localStorage.setItem("bolaoUser", JSON.stringify(result.user));
                showNotification(result.message, "success");
                setTimeout(() => {
                    window.location.href = "regras.html"; // Redireciona para regras.html
                }, 1000);
            } else {
                showNotification(result.message, "error");
            }
        } catch (error) {
            showNotification("Erro de conexão. Tente novamente.", "error");
        }
    });

    // Lidar com o envio do formulário de REGISTRO
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const phone = document.getElementById('registerPhone').value;
        const password = document.getElementById('registerPassword').value;

        const data = {
            action: 'register',
            nome: name,
            email: email,
            telefone: phone,
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
                registerForm.reset();
                loginContainer.classList.remove('register-mode');
            } else {
                showNotification(result.message, 'error');
            }
        } catch (error) {
            showNotification('Erro de conexão. Tente novamente.', 'error');
        }
    });

    // Lidar com o envio do formulário de REDEFINIÇÃO DE SENHA
    if (resetForm) {
        resetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('resetEmail').value;
            const pin = document.getElementById('resetPin').value;
            const novaSenha = document.getElementById('resetPassword').value;

            const data = {
                action: 'reset_password',
                email: email,
                pin: pin,
                nova_senha: novaSenha
            };

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                showNotification(result.message, result.status === 'success' ? 'success' : 'error');

                if (result.status === 'success') {
                    resetForm.reset();
                    document.getElementById('reset-form-section').style.display = 'none';
                    document.getElementById('login-form-section').style.display = 'block';
                }
            } catch (error) {
                showNotification('Erro de conexão. Tente novamente.', 'error');
            }
        });
    }
});
