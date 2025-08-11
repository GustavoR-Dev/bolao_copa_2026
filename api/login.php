<?php
// Inclui o arquivo de conexão com o banco de dados
require 'db.php';

// Inicia a sessão para armazenar informações do usuário logado
session_start();

// Recebe os dados enviados pelo front-end (em formato JSON)
$input = json_decode(file_get_contents('php://input'), true);

// Verifica se a ação foi definida
if (!isset($input['action'])) {
    echo json_encode(['status' => 'error', 'message' => 'Ação não especificada.']);
    exit();
}

$action = $input['action'];

// --- AÇÃO DE REGISTRO ---
if ($action == 'register') {
    if (empty($input['nome']) || empty($input['email']) || empty($input['telefone']) || empty($input['senha'])) {
        echo json_encode(['status' => 'error', 'message' => 'Por favor, preencha todos os campos.']);
        exit();
    }

    $nome = $conn->real_escape_string($input['nome']);
    $email = $conn->real_escape_string($input['email']);
    $telefone = $conn->real_escape_string($input['telefone']);
    $senha = password_hash($conn->real_escape_string($input['senha']), PASSWORD_BCRYPT);
    
    // Gera PIN aleatório de 6 dígitos
    $pin = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

    $sql_check = "SELECT id FROM usuarios WHERE email = ?";
    $stmt_check = $conn->prepare($sql_check);
    $stmt_check->bind_param("s", $email);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();

    if ($result_check->num_rows > 0) {
        echo json_encode(['status' => 'error', 'message' => 'Este e-mail já está em uso.']);
    } else {
        $sql_insert = "INSERT INTO usuarios (nome, email, telefone, senha, pagamento, pin) VALUES (?, ?, ?, ?, 0, ?)";
        $stmt_insert = $conn->prepare($sql_insert);
        $stmt_insert->bind_param("sssss", $nome, $email, $telefone, $senha, $pin);

        if ($stmt_insert->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Cadastro realizado com sucesso! Seu PIN de redefinição: ' . $pin]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Erro ao realizar o cadastro.']);
        }
    }
}

// --- AÇÃO DE Redefinir Senha ---
elseif ($action == 'reset_password') {
    if (empty($input['email']) || empty($input['pin']) || empty($input['nova_senha'])) {
        echo json_encode(['status' => 'error', 'message' => 'Preencha todos os campos.']);
        exit();
    }

    $email = $conn->real_escape_string($input['email']);
    $pin = $conn->real_escape_string($input['pin']);
    $nova_senha = password_hash($conn->real_escape_string($input['nova_senha']), PASSWORD_BCRYPT);

    // Verifica se o e-mail e o PIN correspondem
    $sql = "SELECT id FROM usuarios WHERE email = ? AND pin = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $email, $pin);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows == 1) {
        // Gera novo PIN
        $novo_pin = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

        // Atualiza senha e PIN
        $sql_update = "UPDATE usuarios SET senha = ?, pin = ? WHERE email = ?";
        $stmt_update = $conn->prepare($sql_update);
        $stmt_update->bind_param("sss", $nova_senha, $novo_pin, $email);

        if ($stmt_update->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Senha redefinida com sucesso! Novo PIN gerado.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Erro ao redefinir a senha.']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'E-mail ou PIN inválidos.']);
    }
}


// --- AÇÃO DE LOGIN ---
elseif ($action == 'login') {
    if (empty($input['email']) || empty($input['senha'])) {
        echo json_encode(['status' => 'error', 'message' => 'Por favor, preencha e-mail e senha.']);
        exit();
    }

    $email = $conn->real_escape_string($input['email']);
    $senha_input = $input['senha'];

    // Busca o usuário pelo e-mail
    $sql = "SELECT id, nome, email, senha, is_admin, pagamento FROM usuarios WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows == 1) {
        $user = $result->fetch_assoc();

        if (password_verify($senha_input, $user['senha'])) {

            // Bloqueia se pagamento = 0
            if ($user['pagamento'] == 0) {
                echo json_encode(['status' => 'error', 'message' => 'Pagamento em aberto.']);
                exit();
            }

            // Armazena dados do usuário na sessão
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['nome'];
            $_SESSION['is_admin'] = $user['is_admin'];

            echo json_encode([
                'status' => 'success',
                'message' => 'Login bem-sucedido!',
                'user' => [
                    'id' => $user['id'],
                    'nome' => $user['nome'],
                    'email' => $user['email'],
                    'is_admin' => $user['is_admin']
                ]
            ]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Senha incorreta.']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Usuário não encontrado.']);
    }
}

// --- AÇÃO DE LOGOUT ---
elseif ($action == 'logout') {
    // Destrói a sessão
    session_destroy();
    echo json_encode(['status' => 'success', 'message' => 'Logout realizado com sucesso.']);
}

// --- AÇÃO PARA VERIFICAR SESSÃO ---
elseif ($action == 'check_session') {
    if (isset($_SESSION['user_id'])) {
        echo json_encode([
            'status' => 'success',
            'loggedIn' => true,
            'user' => [
                'id' => $_SESSION['user_id'],
                'nome' => $_SESSION['user_name'],
                'is_admin' => $_SESSION['is_admin']
            ]
        ]);
    } else {
        echo json_encode(['status' => 'success', 'loggedIn' => false]);
    }
}

else {
    echo json_encode(['status' => 'error', 'message' => 'Ação inválida.']);
}

// Fecha a conexão com o banco de dados
$conn->close();
?>
