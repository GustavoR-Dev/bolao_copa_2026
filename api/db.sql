--
-- Estrutura do banco de dados: `bolao_copa_2026`
--
CREATE DATABASE IF NOT EXISTS `bolao_copa_2026` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `bolao_copa_2026`;

-- --------------------------------------------------------

--
-- Estrutura da tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefone` varchar(20) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `pagamento` tinyint(1) NOT NULL DEFAULT 0,
  `pin` varchar(6) NOT NULL,
  `is_admin` tinyint(1) NOT NULL DEFAULT 0,
  `pontos_total` int(11) NOT NULL DEFAULT 0,
  `palpites_enviados` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Inserindo um usuário administrador para testes
--

INSERT INTO `usuarios` (`id`, `nome`, `email`, `senha`, `is_admin`, `pontos_total`, `palpites_enviados`) VALUES
(1, 'Admin', 'admin@bolao.com', '$2y$10$3J2.d2b.9Q9Z.E1.Yf1x7uY8Z.A5B.C3D.E6F.G8H.I0J.K2L', 1, 0, 1);


-- --------------------------------------------------------

--
-- Estrutura da tabela `jogos`
--

CREATE TABLE `jogos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `grupo` char(1) NOT NULL,
  `time_casa` varchar(50) NOT NULL,
  `time_visitante` varchar(50) NOT NULL,
  `data_jogo` datetime NOT NULL,
  `placar_casa` int(11) DEFAULT NULL,
  `placar_visitante` int(11) DEFAULT NULL,
  `status` enum('AGENDADO','EM_ANDAMENTO','FINALIZADO') NOT NULL DEFAULT 'AGENDADO',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Inserindo jogos de exemplo para testes (simulando 3 jogos)
--

INSERT INTO `jogos` (`id`, `grupo`, `time_casa`, `time_visitante`, `data_jogo`, `placar_casa`, `placar_visitante`, `status`) VALUES
(1, 'A', 'México', 'Canadá', '2026-06-11 16:00:00', NULL, NULL, 'AGENDADO'),
(2, 'A', 'Estados Unidos', 'País de Gales', '2026-06-11 20:00:00', NULL, NULL, 'AGENDADO'),
(3, 'B', 'Argentina', 'Chile', '2026-06-12 14:00:00', NULL, NULL, 'AGENDADO');

-- --------------------------------------------------------

--
-- Estrutura da tabela `palpites`
--

CREATE TABLE `palpites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `jogo_id` int(11) NOT NULL,
  `placar_casa` int(11) NOT NULL,
  `placar_visitante` int(11) NOT NULL,
  `pontos_obtidos` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_usuario_jogo` (`usuario_id`,`jogo_id`),
  KEY `jogo_id` (`jogo_id`),
  CONSTRAINT `palpites_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `palpites_ibfk_2` FOREIGN KEY (`jogo_id`) REFERENCES `jogos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

