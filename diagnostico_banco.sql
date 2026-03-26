-- =====================================================================
-- DIAGNÓSTICO COMPLETO DO BANCO PARA PRESCRICOES
-- =====================================================================

-- 1. VERIFICAR SE TABELAS EXISTEM
SHOW TABLES LIKE '%prescricao%';

SHOW TABLES LIKE 'horarios%';

-- 2. VERIFICAR ESTRUTURA DA TABELA PRESCRICOES
DESCRIBE prescricoes;

-- 3. VERIFICAR ESTRUTURA DA TABELA ITENS_PRESCRICAO
DESCRIBE itens_prescricao;

-- 4. VERIFICAR ESTRUTURA DA TABELA HORARIOS_PRESCRICAO
DESCRIBE horarios_prescricao;
-- ⚠️ IMPORTANTE: Deve mostrar as colunas:
-- - id
-- - item_prescricao_id
-- - horario
-- - status_id ✅ (OBRIGATÓRIO!)
-- - created_at

-- 5. VERIFICAR TABELA STATUS_CUIDADO
DESCRIBE status_cuidado;

SELECT * FROM status_cuidado;
-- ⚠️ Deve ter id=1 com nome_status='pendente'

-- 6. VERIFICAR SE EXISTEM MEDICAMENTOS
SELECT COUNT(*) as total_medicamentos FROM medicamentos;

SELECT id, nome_medicamento FROM medicamentos LIMIT 5;

-- 7. VERIFICAR SE EXISTEM PACIENTES
SELECT COUNT(*) as total_pacientes FROM pacientes;

SELECT id, nome_paciente FROM pacientes LIMIT 5;

-- 8. VERIFICAR CHAVES ESTRANGEIRAS
SELECT
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE
    TABLE_NAME IN (
        'prescricoes',
        'itens_prescricao',
        'horarios_prescricao'
    )
    AND REFERENCED_TABLE_NAME IS NOT NULL;

-- 9. VERIFICAR SE MIGRAÇÃO FOI APLICADA
SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_NAME = 'horarios_prescricao'
    AND COLUMN_NAME = 'status_id';
-- ⚠️ Se retornar vazio = MIGRAÇÃO NÃO FOI EXECUTADA!

-- 10. TESTAR INSERT MANUAL (SEGURO - sem dados reais)
-- Copie e execute SOMENTE se quiser testar:
/*
BEGIN;

-- Inserir prescrição de teste
INSERT INTO prescricoes (paciente_id, usuario_id, observacao, data_prescricao)
VALUES (1, 1, 'Teste de sintaxe', NOW());

-- Pegar o ID gerado
SELECT LAST_INSERT_ID() as prescricao_id;

-- Inserir item de teste (ajuste o paciente_id e medicamento_id conforme necessário)
INSERT INTO itens_prescricao (prescricao_id, medicamento_id, dosagem, via, frequencia)
VALUES (LAST_INSERT_ID(), 1, 500, 'Oral', 2);

-- Pegar o ID gerado
SELECT LAST_INSERT_ID() as item_id;

-- Inserir horário de teste (ajuste conforme necessário)
INSERT INTO horarios_prescricao (item_prescricao_id, horario, status_id)
VALUES (LAST_INSERT_ID(), '08:00', 1);

-- Se chegou aqui sem erro = BD está OK!
-- Se deu erro antes = mostra exatamente onde falha

ROLLBACK;  -- Desfaz as mudanças de teste
*/

-- =====================================================================
-- FIM DO DIAGNÓSTICO
-- =====================================================================