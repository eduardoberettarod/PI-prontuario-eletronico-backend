-- =====================================================================
-- MIGRAÇÃO: Adicionar status_id à tabela horarios_prescricao
-- =====================================================================

-- Verificar se a coluna já existe (evita erro se rodar novamente)
ALTER TABLE horarios_prescricao
ADD COLUMN status_id INT DEFAULT 1 AFTER horario;

-- Adicionar chave estrangeira se não existir
ALTER TABLE horarios_prescricao
ADD CONSTRAINT fk_horario_status FOREIGN KEY (status_id) REFERENCES status_cuidado (id);

-- Opcional: Adicionar data de criação para auditoria
ALTER TABLE horarios_prescricao
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Opcional: Adicionar índice para melhorar performance
ALTER TABLE horarios_prescricao
ADD INDEX idx_item_prescricao (item_prescricao_id);

ALTER TABLE horarios_prescricao ADD INDEX idx_status (status_id);

-- Confirmar estrutura final
DESCRIBE horarios_prescricao;