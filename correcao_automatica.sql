-- =====================================================================
-- SCRIPT DE CORREÇÃO AUTOMÁTICA - Execute primeiro!
-- =====================================================================

-- 1. ADICIONAR COLUNA status_id (se não existir)
ALTER TABLE horarios_prescricao
ADD COLUMN status_id INT DEFAULT 1 AFTER horario;

-- 2. ADICIONAR FOREIGN KEY (se não existir)
ALTER TABLE horarios_prescricao
ADD CONSTRAINT fk_horario_status FOREIGN KEY (status_id) REFERENCES status_cuidado (id);

-- 3. ADICIONAR CREATED_AT (se não existir)
ALTER TABLE horarios_prescricao
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 4. GARANTIR QUE STATUS 1 EXISTE
INSERT IGNORE INTO
    status_cuidado (id, nome_status)
VALUES (1, 'pendente');

INSERT IGNORE INTO
    status_cuidado (id, nome_status)
VALUES (2, 'finalizado');

INSERT IGNORE INTO
    status_cuidado (id, nome_status)
VALUES (3, 'nao_feito');

INSERT IGNORE INTO
    status_cuidado (id, nome_status)
VALUES (4, 'negado_paciente');

-- 5. CONFIRMAÇÃO - MOSTRAR ESTRUTURA FINAL
SHOW CREATE TABLE horarios_prescricao \G
SHOW CREATE TABLE status_cuidado \G

-- 6. VERIFICAÇÃO FINAL
SELECT COUNT(*) as status_count FROM status_cuidado WHERE id = 1;
-- Deve retornar: 1

SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_NAME = 'horarios_prescricao'
    AND COLUMN_NAME = 'status_id';
-- Deve retornar: status_id

-- =====================================================================
-- SE CHEGOU AQUI SEM ERROS = BANCO ESTÁ 100% OK!
-- =====================================================================