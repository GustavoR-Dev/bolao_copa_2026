<?php
require 'db.php'; // Inclui a conexão com o banco

// Decodifica o JSON recebido do front-end
$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? $_GET['action'] ?? null;

if (!$action) {
    echo json_encode(['status' => 'error', 'message' => 'Ação não especificada.']);
    exit();
}

// --- FUNÇÃO AUXILIAR PARA CALCULAR PONTOS ---
function calcularPontos($palpite_casa, $palpite_visitante, $resultado_casa, $resultado_visitante) {
    if (is_null($resultado_casa) || is_null($resultado_visitante)) {
        return null; // Pontuação pendente
    }
    if ($palpite_casa == $resultado_casa && $palpite_visitante == $resultado_visitante) {
        return 100;
    }
    if ($palpite_casa == $resultado_casa || $palpite_visitante == $resultado_visitante) {
        return 50;
    }
    return 0;
}

// --- AÇÃO PARA BUSCAR TODOS OS JOGOS ---
if ($action == 'get_jogos') {
    $sql = "SELECT id, grupo, time_casa, time_visitante, data_jogo FROM jogos ORDER BY data_jogo, grupo";
    $result = $conn->query($sql);

    $jogos = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $row['data_formatada'] = (new DateTime($row['data_jogo']))->format('d/m H:i');
            $jogos[] = $row;
        }
    }
    
    echo json_encode(['status' => 'success', 'jogos' => $jogos]);
}

// --- NOVA AÇÃO BUSCAR JOGOS DE HOJE ---
elseif ($action == 'get_jogos_hoje') {
    $hoje = date('Y-m-d'); // Data de hoje no formato YYYY-MM-DD
    
    $sql = "SELECT id, grupo, time_casa, time_visitante, data_jogo 
            FROM jogos 
            WHERE DATE(data_jogo) = ? 
            ORDER BY data_jogo";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $hoje);
    $stmt->execute();
    $result = $stmt->get_result();

    $jogos = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $row['data_formatada'] = (new DateTime($row['data_jogo']))->format('d/m H:i');
            $jogos[] = $row;
        }
    }
    
    echo json_encode(['status' => 'success', 'jogos' => $jogos, 'total' => count($jogos)]);
}

// --- AÇÃO PARA SALVAR OS PALPITES ---
elseif ($action == 'salvar_palpites') {
    if (!isset($input['usuario_id']) || !isset($input['palpites']) || !is_array($input['palpites'])) {
        echo json_encode(['status' => 'error', 'message' => 'Dados de entrada inválidos.']);
        exit();
    }

    $usuario_id = $input['usuario_id'];
    $palpites = $input['palpites'];

    // Verificação crítica de segurança
    $check_sql = "SELECT palpites_enviados FROM usuarios WHERE id = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("i", $usuario_id);
    $check_stmt->execute();
    $result = $check_stmt->get_result()->fetch_assoc();

    if ($result && $result['palpites_enviados'] == 1) {
        http_response_code(403 );
        echo json_encode(['status' => 'error', 'message' => 'Ação bloqueada: Seus palpites já foram publicados anteriormente.']);
        exit();
    }

    $conn->begin_transaction();

    try {
        $sql = "INSERT INTO palpites (usuario_id, jogo_id, placar_casa, placar_visitante) VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE placar_casa = VALUES(placar_casa), placar_visitante = VALUES(placar_visitante)";
        
        $stmt = $conn->prepare($sql);

        foreach ($palpites as $palpite) {
            if (isset($palpite['jogo_id'], $palpite['placar_casa'], $palpite['placar_visitante'])) {
                $stmt->bind_param("iiii", 
                    $usuario_id, 
                    $palpite['jogo_id'], 
                    $palpite['placar_casa'], 
                    $palpite['placar_visitante']
                );
                $stmt->execute();
            }
        }

        $update_sql = "UPDATE usuarios SET palpites_enviados = 1 WHERE id = ?";
        $update_stmt = $conn->prepare($update_sql);
        $update_stmt->bind_param("i", $usuario_id);
        $update_stmt->execute();

        $conn->commit();
        echo json_encode(['status' => 'success', 'message' => 'Palpites salvos com sucesso!']);

    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['status' => 'error', 'message' => 'Ocorreu um erro crítico ao salvar os palpites.']);
    }
}

// --- AÇÃO PARA VERIFICAR SE O USUÁRIO JÁ ENVIOU OS PALPITES ---
elseif ($action == 'verificar_palpites_enviados') {
    $usuario_id = $_GET['usuario_id'] ?? null;
    if (!$usuario_id) {
        echo json_encode(['status' => 'error', 'message' => 'ID do usuário não fornecido.']);
        exit();
    }

    $sql = "SELECT palpites_enviados FROM usuarios WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $usuario_id);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();

    echo json_encode(['status' => 'success', 'enviados' => (bool)$result['palpites_enviados']]);
}

// --- AÇÃO PARA BUSCAR PALPITES E RESULTADOS DO USUÁRIO ---
elseif ($action == 'get_meus_resultados') {
    $usuario_id = $_GET['usuario_id'] ?? null;
    if (!$usuario_id) {
        echo json_encode(['status' => 'error', 'message' => 'ID do usuário não fornecido.']);
        exit();
    }

    $sql = "SELECT 
                j.id, j.grupo, j.time_casa, j.time_visitante, j.data_jogo,
                j.placar_casa AS resultado_casa, 
                j.placar_visitante AS resultado_visitante,
                p.placar_casa AS palpite_casa,
                p.placar_visitante AS palpite_visitante
            FROM jogos j
            LEFT JOIN palpites p ON j.id = p.jogo_id AND p.usuario_id = ?
            ORDER BY j.data_jogo, j.grupo";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $usuario_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $dados = [];
    while ($row = $result->fetch_assoc()) {
        $row['data_formatada'] = (new DateTime($row['data_jogo']))->format('d/m H:i');
        $row['pontos_obtidos'] = calcularPontos(
            $row['palpite_casa'], $row['palpite_visitante'],
            $row['resultado_casa'], $row['resultado_visitante']
        );
        $dados[] = $row;
    }

    echo json_encode(['status' => 'success', 'dados' => $dados]);
}

// --- AÇÃO PARA ATUALIZAR RESULTADO OFICIAL (SOMENTE ADMIN) ---
elseif ($action == 'atualizar_resultado') {
    if (!isset($input['is_admin']) || $input['is_admin'] != 1) {
        echo json_encode(['status' => 'error', 'message' => 'Acesso negado.']);
        exit();
    }

    $jogo_id = $input['jogo_id'];
    $placar_casa = $input['placar_casa'];
    $placar_visitante = $input['placar_visitante'];

    $sql_jogo = "UPDATE jogos SET placar_casa = ?, placar_visitante = ?, status = 'FINALIZADO' WHERE id = ?";
    $stmt_jogo = $conn->prepare($sql_jogo);
    $stmt_jogo->bind_param("iii", $placar_casa, $placar_visitante, $jogo_id);
    $stmt_jogo->execute();

    $sql_palpites = "SELECT id, usuario_id, placar_casa, placar_visitante FROM palpites WHERE jogo_id = ?";
    $stmt_palpites = $conn->prepare($sql_palpites);
    $stmt_palpites->bind_param("i", $jogo_id);
    $stmt_palpites->execute();
    $result_palpites = $stmt_palpites->get_result();

    $sql_update_pontos = "UPDATE palpites SET pontos_obtidos = ? WHERE id = ?";
    $stmt_update_pontos = $conn->prepare($sql_update_pontos);

    while ($palpite = $result_palpites->fetch_assoc()) {
        $pontos = calcularPontos($palpite['placar_casa'], $palpite['placar_visitante'], $placar_casa, $placar_visitante);
        $stmt_update_pontos->bind_param("ii", $pontos, $palpite['id']);
        $stmt_update_pontos->execute();
    }

    $sql_recalc_total = "UPDATE usuarios u SET u.pontos_total = (SELECT SUM(p.pontos_obtidos) FROM palpites p WHERE p.usuario_id = u.id)";
    $conn->query($sql_recalc_total);

    echo json_encode(['status' => 'success', 'message' => 'Resultado atualizado e pontos recalculados!']);
}

// --- AÇÃO PARA EDITAR UM JOGO (ADMIN) ---
elseif ($action == 'editar_jogo') {
    if (!isset($input['is_admin']) || $input['is_admin'] != 1) {
        echo json_encode(['status' => 'error', 'message' => 'Acesso negado.']);
        exit();
    }

    $sql = "UPDATE jogos SET time_casa = ?, time_visitante = ?, data_jogo = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssi", 
        $input['time_casa'], 
        $input['time_visitante'], 
        $input['data_jogo'], 
        $input['jogo_id']
    );

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Jogo atualizado com sucesso!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Erro ao atualizar o jogo.']);
    }
}

// --- AÇÃO PARA ADICIONAR UM NOVO JOGO (ADMIN) ---
elseif ($action == 'adicionar_jogo') {
    if (!isset($input['is_admin']) || $input['is_admin'] != 1) {
        echo json_encode(['status' => 'error', 'message' => 'Acesso negado.']);
        exit();
    }

    $sql = "INSERT INTO jogos (grupo, time_casa, time_visitante, data_jogo) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", 
        $input['grupo'], 
        $input['time_casa'], 
        $input['time_visitante'], 
        $input['data_jogo']
    );

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Jogo adicionado com sucesso!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Erro ao adicionar o jogo.']);
    }
}

// --- AÇÃO PARA BUSCAR DETALHES DE UM JOGO ---
elseif ($action == 'get_jogo_details') {
    $id = $_GET['id'];
    $sql = "SELECT time_casa, time_visitante, data_jogo FROM jogos WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $jogo = $stmt->get_result()->fetch_assoc();
    echo json_encode(['status' => 'success', 'jogo' => $jogo]);
}

// --- AÇÃO PARA BUSCAR TODOS OS PALPITES DE TODOS OS USUÁRIOS (ADMIN) ---
elseif ($action == 'get_todos_palpites') {
    $sql = "SELECT 
                j.id as jogo_id, j.time_casa, j.time_visitante, j.data_jogo,
                j.placar_casa AS resultado_casa, 
                j.placar_visitante AS resultado_visitante,
                p.placar_casa, p.placar_visitante,
                u.nome as nome_usuario
            FROM palpites p
            JOIN jogos j ON p.jogo_id = j.id
            JOIN usuarios u ON p.usuario_id = u.id
            WHERE u.is_admin = 0
            ORDER BY j.data_jogo, j.id, u.nome";
    
    $result = $conn->query($sql);
    $dados_agrupados = [];

    while($row = $result->fetch_assoc()) {
        $jogo_id = $row['jogo_id'];
        if (!isset($dados_agrupados[$jogo_id])) {
            $dados_agrupados[$jogo_id] = [
                'time_casa' => $row['time_casa'],
                'time_visitante' => $row['time_visitante'],
                'data_formatada' => (new DateTime($row['data_jogo']))->format('d/m H:i'),
                'resultado_oficial' => !is_null($row['resultado_casa']) ? $row['resultado_casa'] . ' x ' . $row['resultado_visitante'] : 'Pendente',
                'palpites' => []
            ];
        }

        $pontos = calcularPontos(
            $row['placar_casa'], $row['placar_visitante'],
            $row['resultado_casa'], $row['resultado_visitante']
        );

        $dados_agrupados[$jogo_id]['palpites'][] = [
            'nome_usuario' => $row['nome_usuario'],
            'placar_casa' => $row['placar_casa'],
            'placar_visitante' => $row['placar_visitante'],
            'pontos_obtidos' => $pontos
        ];
    }

    echo json_encode(['status' => 'success', 'dados' => $dados_agrupados]);
}

else {
    echo json_encode(['status' => 'error', 'message' => 'Ação desconhecida.']);
}

$conn->close();
?>
