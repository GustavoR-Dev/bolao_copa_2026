<?php
require 'db.php'; // Inclui a conexão com o banco

$action = $_GET['action'] ?? null;

if ($action == 'get_ranking') {
    // Seleciona os dados necessários dos usuários, ordenando por pontos totais.
    // O segundo critério de ordenação (nome) serve para desempate alfabético.
    $sql = "SELECT 
                id, 
                nome, 
                pontos_total,
                is_admin
            FROM usuarios 
            ORDER BY pontos_total DESC, nome ASC";
    
    $result = $conn->query($sql);

    $ranking = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $ranking[] = $row;
        }
    }

    echo json_encode(['status' => 'success', 'ranking' => $ranking]);
}

// --- AÇÃO PARA CONTAR PARTICIPANTES ---
elseif ($action == 'get_participantes_count') {
    // Conta apenas usuários que não são admin
    $sql = "SELECT COUNT(*) as total_participantes FROM usuarios WHERE is_admin = 0";
    $result = $conn->query($sql);
    
    $count = 0;
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $count = $row['total_participantes'];
    }

    echo json_encode(['status' => 'success', 'total_participantes' => $count]);
}

else {
    echo json_encode(['status' => 'error', 'message' => 'Ação inválida.']);
}

$conn->close();
?>
