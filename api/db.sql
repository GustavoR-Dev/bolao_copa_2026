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

INSERT INTO jogos (grupo, time_casa, time_visitante, data_jogo, placar_casa, placar_visitante, status) VALUES

-- Quinta-feira, 11 de junho de 2026
('A', 'México', 'África do Sul', '2026-06-11 16:00:00', NULL, NULL, 'AGENDADO'),
('A', 'Coreia do Sul', 'Europa D', '2026-06-11 23:00:00', NULL, NULL, 'AGENDADO'),

-- Sexta-feira, 12 de junho de 2026
('B', 'Canadá', 'Europa A', '2026-06-12 16:00:00', NULL, NULL, 'AGENDADO'),
('D', 'Estados Unidos', 'Paraguai', '2026-06-12 22:00:00', NULL, NULL, 'AGENDADO'),

-- Sábado, 13 de junho de 2026
('D', 'Austrália', 'Europa C', '2026-06-13 01:00:00', NULL, NULL, 'AGENDADO'),
('B', 'Qatar', 'Suíça', '2026-06-13 16:00:00', NULL, NULL, 'AGENDADO'),
('C', 'Brasil', 'Marrocos', '2026-06-13 19:00:00', NULL, NULL, 'AGENDADO'),
('C', 'Haiti', 'Escócia', '2026-06-13 22:00:00', NULL, NULL, 'AGENDADO'),

-- Domingo, 14 de junho de 2026
('E', 'Alemanha', 'Curaçao', '2026-06-14 14:00:00', NULL, NULL, 'AGENDADO'),
('F', 'Holanda', 'Japão', '2026-06-14 17:00:00', NULL, NULL, 'AGENDADO'),
('E', 'Costa do Marfim', 'Equador', '2026-06-14 20:00:00', NULL, NULL, 'AGENDADO'),
('F', 'Europa B', 'Tunísia', '2026-06-14 23:00:00', NULL, NULL, 'AGENDADO'),

-- Segunda-feira, 15 de junho de 2026
('H', 'Espanha', 'Cabo Verde', '2026-06-15 13:00:00', NULL, NULL, 'AGENDADO'),
('G', 'Bélgica', 'Egito', '2026-06-15 16:00:00', NULL, NULL, 'AGENDADO'),
('H', 'Arábia Saudita', 'Uruguai', '2026-06-15 19:00:00', NULL, NULL, 'AGENDADO'),
('G', 'Irã', 'Nova Zelândia', '2026-06-15 22:00:00', NULL, NULL, 'AGENDADO'),

-- Terça-feira, 16 de junho de 2026
('I', 'França', 'Senegal', '2026-06-16 16:00:00', NULL, NULL, 'AGENDADO'),
('I', 'Intercontinental 2', 'Noruega', '2026-06-16 19:00:00', NULL, NULL, 'AGENDADO'),
('J', 'Argentina', 'Argélia', '2026-06-16 22:00:00', NULL, NULL, 'AGENDADO'),

-- Quarta-feira, 17 de junho de 2026
('J', 'Áustria', 'Jordânia', '2026-06-17 01:00:00', NULL, NULL, 'AGENDADO'),
('K', 'Portugal', 'Intercontinental 1', '2026-06-17 14:00:00', NULL, NULL, 'AGENDADO'),
('L', 'Inglaterra', 'Croácia', '2026-06-17 17:00:00', NULL, NULL, 'AGENDADO'),
('L', 'Gana', 'Panamá', '2026-06-17 20:00:00', NULL, NULL, 'AGENDADO'),
('K', 'Uzbequistão', 'Colômbia', '2026-06-17 23:00:00', NULL, NULL, 'AGENDADO'),

-- Quinta-feira, 18 de junho de 2026
('A', 'Europa D', 'África do Sul', '2026-06-18 13:00:00', NULL, NULL, 'AGENDADO'),
('B', 'Suíça', 'Europa A', '2026-06-18 16:00:00', NULL, NULL, 'AGENDADO'),
('B', 'Canadá', 'Qatar', '2026-06-18 19:00:00', NULL, NULL, 'AGENDADO'),
('A', 'México', 'Coreia do Sul', '2026-06-18 22:00:00', NULL, NULL, 'AGENDADO'),

-- Sexta-feira, 19 de junho de 2026
('D', 'Europa C', 'Paraguai', '2026-06-19 01:00:00', NULL, NULL, 'AGENDADO'),
('D', 'Estados Unidos', 'Austrália', '2026-06-19 16:00:00', NULL, NULL, 'AGENDADO'),
('C', 'Escócia', 'Marrocos', '2026-06-19 19:00:00', NULL, NULL, 'AGENDADO'),
('C', 'Brasil', 'Haiti', '2026-06-19 22:00:00', NULL, NULL, 'AGENDADO'),

-- Sábado, 20 de junho de 2026
('F', 'Holanda', 'Europa B', '2026-06-20 14:00:00', NULL, NULL, 'AGENDADO'),
('E', 'Alemanha', 'Costa do Marfim', '2026-06-20 17:00:00', NULL, NULL, 'AGENDADO'),
('E', 'Equador', 'Curaçao', '2026-06-20 21:00:00', NULL, NULL, 'AGENDADO'),

-- Domingo, 21 de junho de 2026
('F', 'Tunísia', 'Japão', '2026-06-21 01:00:00', NULL, NULL, 'AGENDADO'),
('H', 'Espanha', 'Arábia Saudita', '2026-06-21 13:00:00', NULL, NULL, 'AGENDADO'),
('G', 'Bélgica', 'Irã', '2026-06-21 16:00:00', NULL, NULL, 'AGENDADO'),
('H', 'Uruguai', 'Cabo Verde', '2026-06-21 19:00:00', NULL, NULL, 'AGENDADO'),
('G', 'Nova Zelândia', 'Egito', '2026-06-21 22:00:00', NULL, NULL, 'AGENDADO'),

-- Segunda-feira, 22 de junho de 2026
('J', 'Argentina', 'Áustria', '2026-06-22 14:00:00', NULL, NULL, 'AGENDADO'),
('I', 'França', 'Intercontinental 2', '2026-06-22 18:00:00', NULL, NULL, 'AGENDADO'),
('I', 'Noruega', 'Senegal', '2026-06-22 21:00:00', NULL, NULL, 'AGENDADO'),

-- Terça-feira, 23 de junho de 2026
('J', 'Jordânia', 'Argélia', '2026-06-23 00:00:00', NULL, NULL, 'AGENDADO'),
('K', 'Portugal', 'Uzbequistão', '2026-06-23 14:00:00', NULL, NULL, 'AGENDADO'),
('L', 'Inglaterra', 'Gana', '2026-06-23 17:00:00', NULL, NULL, 'AGENDADO'),
('L', 'Panamá', 'Croácia', '2026-06-23 20:00:00', NULL, NULL, 'AGENDADO'),
('K', 'Colômbia', 'Intercontinental 1', '2026-06-23 23:00:00', NULL, NULL, 'AGENDADO'),

-- Quarta-feira, 24 de junho de 2026
('B', 'Suíça', 'Canadá', '2026-06-24 16:00:00', NULL, NULL, 'AGENDADO'),
('B', 'Europa A', 'Qatar', '2026-06-24 16:00:00', NULL, NULL, 'AGENDADO'),
('C', 'Escócia', 'Brasil', '2026-06-24 19:00:00', NULL, NULL, 'AGENDADO'),
('C', 'Marrocos', 'Haiti', '2026-06-24 19:00:00', NULL, NULL, 'AGENDADO'),
('A', 'Europa D', 'México', '2026-06-24 22:00:00', NULL, NULL, 'AGENDADO'),
('A', 'África do Sul', 'Coreia do Sul', '2026-06-24 22:00:00', NULL, NULL, 'AGENDADO'),

-- Quinta-feira, 25 de junho de 2026
('E', 'Equador', 'Alemanha', '2026-06-25 17:00:00', NULL, NULL, 'AGENDADO'),
('E', 'Curaçao', 'Costa do Marfim', '2026-06-25 17:00:00', NULL, NULL, 'AGENDADO'),
('F', 'Tunísia', 'Holanda', '2026-06-25 20:00:00', NULL, NULL, 'AGENDADO'),
('F', 'Japão', 'Europa B', '2026-06-25 20:00:00', NULL, NULL, 'AGENDADO'),
('D', 'Europa C', 'Estados Unidos', '2026-06-25 23:00:00', NULL, NULL, 'AGENDADO'),
('D', 'Paraguai', 'Austrália', '2026-06-25 23:00:00', NULL, NULL, 'AGENDADO'),

-- Sexta-feira, 26 de junho de 2026
('I', 'Noruega', 'França', '2026-06-26 16:00:00', NULL, NULL, 'AGENDADO'),
('I', 'Senegal', 'Intercontinental 2', '2026-06-26 16:00:00', NULL, NULL, 'AGENDADO'),
('H', 'Uruguai', 'Espanha', '2026-06-26 21:00:00', NULL, NULL, 'AGENDADO'),
('H', 'Cabo Verde', 'Arábia Saudita', '2026-06-26 21:00:00', NULL, NULL, 'AGENDADO'),
('G', 'Egito', 'Irã', '2026-06-26 00:00:00', NULL, NULL, 'AGENDADO'),
('G', 'Nova Zelândia', 'Bélgica', '2026-06-26 00:00:00', NULL, NULL, 'AGENDADO'),

-- Sábado, 27 de junho de 2026
('L', 'Panamá', 'Inglaterra', '2026-06-27 18:00:00', NULL, NULL, 'AGENDADO'),
('L', 'Croácia', 'Gana', '2026-06-27 18:00:00', NULL, NULL, 'AGENDADO'),
('K', 'Colômbia', 'Portugal', '2026-06-27 20:30:00', NULL, NULL, 'AGENDADO'),
('K', 'Intercontinental 1', 'Uzbequistão', '2026-06-27 20:30:00', NULL, NULL, 'AGENDADO'),
('J', 'Jordânia', 'Argentina', '2026-06-27 23:00:00', NULL, NULL, 'AGENDADO'),
('J', 'Argélia', 'Áustria', '2026-06-27 23:00:00', NULL, NULL, 'AGENDADO');

-- --------------------------------------------------------

--
-- Estrutura da tabela `palpites`
--

CREATE TABLE `palpites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `jogo_id` int(11) NOT NULL,
    `placar_casa` int(11) DEFAULT NULL,
  `placar_visitante` int(11) DEFAULT NULL,
  `pontos_obtidos` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_usuario_jogo` (`usuario_id`,`jogo_id`),
  KEY `jogo_id` (`jogo_id`),
  CONSTRAINT `palpites_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `palpites_ibfk_2` FOREIGN KEY (`jogo_id`) REFERENCES `jogos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

