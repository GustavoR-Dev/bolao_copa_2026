<?php
// Definições do banco de dados
define('DB_HOST', 'localhost');
define('DB_USER', 'root'); // Usuário padrão do XAMPP
define('DB_PASS', '');     // Senha padrão do XAMPP é vazia
define('DB_NAME', 'bolao_copa_2026');

// Habilitar CORS (Cross-Origin Resource Sharing) para permitir requisições do front-end
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Define o tipo de conteúdo da resposta como JSON
header('Content-Type: application/json');

// Cria a conexão com o banco de dados usando a extensão MySQLi
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Verifica se a conexão foi bem-sucedida
if ($conn->connect_error) {
    // Se houver um erro, encerra o script e retorna uma mensagem de erro em JSON
    http_response_code(500 ); // Internal Server Error
    echo json_encode([
        'status' => 'error',
        'message' => 'Falha na conexão com o banco de dados: ' . $conn->connect_error
    ]);
    exit();
}

// Define o charset da conexão para UTF-8 para suportar caracteres especiais
$conn->set_charset("utf8mb4");

?>
