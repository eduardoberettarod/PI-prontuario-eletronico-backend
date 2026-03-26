const express = require('express')
const router = express.Router()
const autorizar = require('../middlewares/autorizar')
const db = require('../conexao')

//======================================
//         PRESCRICOES - [ GET ]
//======================================

router.get(
    "/paciente/:id",
    autorizar("aluno", "docente", "admin"),
    function (req, res) {
        const { id } = req.params;

        // ✅ Validar se id é um número válido
        if (!Number.isInteger(Number(id)) || id <= 0) {
            return res.status(400).json({ erro: "paciente_id inválido" });
        }

        db.query(
            `
            SELECT 
                p.id AS prescricao_id,
                p.observacao,
                p.data_prescricao,
                ip.id AS item_id,
                ip.medicamento_id,
                ip.dosagem,
                ip.via,
                ip.frequencia,
                m.nome_medicamento,
                m.unidade,
                hp.id AS horario_id,
                hp.horario,
                hp.status_id
            FROM prescricoes p
            LEFT JOIN itens_prescricao ip ON ip.prescricao_id = p.id
            LEFT JOIN medicamentos m ON m.id = ip.medicamento_id
            LEFT JOIN horarios_prescricao hp ON hp.item_prescricao_id = ip.id
            WHERE p.paciente_id = ?
            ORDER BY p.id DESC, ip.id, hp.horario
            `,
            [id],
            function (erro, resultados) {
                if (erro) {
                    console.error("Erro ao carregar prescrições:", erro);
                    return res.status(500).json({ erro: "Erro ao carregar prescrições" });
                }

                // ✅ Retorna array vazio se não encontrar
                if (!resultados || resultados.length === 0) {
                    return res.json([]);
                }

                const prescricoes = [];

                resultados.forEach(row => {
                    let prescricao = prescricoes.find(p => p.id === row.prescricao_id);

                    if (!prescricao) {
                        prescricao = {
                            id: row.prescricao_id,
                            observacao: row.observacao,
                            data: row.data_prescricao,
                            itens: []
                        };
                        prescricoes.push(prescricao);
                    }

                    let item = prescricao.itens.find(i => i.id === row.item_id);

                    if (!item && row.item_id) {
                        item = {
                            id: row.item_id,
                            medicamento_id: row.medicamento_id,
                            medicamento: row.nome_medicamento,
                            unidade: row.unidade,
                            dosagem: row.dosagem,
                            via: row.via,
                            frequencia: row.frequencia,
                            horarios: []
                        };
                        prescricao.itens.push(item);
                    }

                    // ✅ Valida se horario_id e status_id existem
                    if (item && row.horario_id && row.status_id) {
                        item.horarios.push({
                            id: row.horario_id,
                            horario: row.horario,
                            status_id: row.status_id
                        });
                    }
                });

                res.json(prescricoes);
            }
        );
    }
);

//======================================
//      PRESCRICOES - [ POST ]
//======================================

router.post(
    "/",
    autorizar("aluno", "docente", "admin"),
    function (req, res) {
        const { paciente_id, observacao, itens } = req.body;
        const usuario_id = req.session.usuario?.id;

        console.log("POST /prescricoes:", {
            paciente_id,
            usuario_id,
            itens_count: itens?.length,
            observacao_length: observacao?.length
        });

        // ========== VALIDAÇÕES INICIAIS ==========

        // ✅ VALIDAÇÃO 1: Usuário autenticado
        if (!usuario_id) {
            return res.status(401).json({ erro: "Usuário não autenticado" });
        }

        // ✅ VALIDAÇÃO 2: paciente_id válido
        if (!paciente_id || !Number.isInteger(Number(paciente_id)) || Number(paciente_id) <= 0) {
            return res.status(400).json({ erro: "paciente_id deve ser um número válido" });
        }

        // ✅ VALIDAÇÃO 3: itens não vazio
        if (!Array.isArray(itens) || itens.length === 0) {
            return res.status(400).json({ erro: "Deve incluir pelo menos 1 medicamento" });
        }

        if (itens.length > 20) {
            return res.status(400).json({ erro: "Máximo de 20 medicamentos por prescrição" });
        }

        // ✅ VALIDAÇÃO 4: observacao (se presente)
        if (observacao && typeof observacao === 'string' && observacao.length > 500) {
            return res.status(400).json({ erro: "Observação muito longa (máx 500 caracteres)" });
        }

        // ========== VALIDAÇÕES DE ITENS ==========

        for (let i = 0; i < itens.length; i++) {
            const item = itens[i];
            const idx = i + 1;

            // Medicamento ID
            if (!item.medicamento_id) {
                return res.status(400).json({
                    erro: `Medicamento ${idx}: medicamento_id obrigatório`
                });
            }

            const med_id = parseInt(item.medicamento_id);
            if (isNaN(med_id) || med_id <= 0) {
                return res.status(400).json({
                    erro: `Medicamento ${idx}: medicamento_id inválido`
                });
            }

            // Dosagem
            if (!item.dosagem) {
                return res.status(400).json({
                    erro: `Medicamento ${idx}: dosagem obrigatória`
                });
            }

            const dosagem = parseFloat(item.dosagem);
            if (isNaN(dosagem) || dosagem <= 0) {
                return res.status(400).json({
                    erro: `Medicamento ${idx}: dosagem deve ser > 0`
                });
            }

            if (dosagem > 10000) {
                return res.status(400).json({
                    erro: `Medicamento ${idx}: dosagem muito alta (máx 10000)`
                });
            }

            // Via
            if (!item.via || typeof item.via !== 'string') {
                return res.status(400).json({
                    erro: `Medicamento ${idx}: via obrigatória`
                });
            }

            if (item.via.trim().length === 0 || item.via.length > 50) {
                return res.status(400).json({
                    erro: `Medicamento ${idx}: via inválida`
                });
            }

            // Frequência
            if (!item.frequencia) {
                return res.status(400).json({
                    erro: `Medicamento ${idx}: frequência obrigatória`
                });
            }

            const freq = parseInt(item.frequencia);
            if (isNaN(freq) || freq <= 0 || freq > 24) {
                return res.status(400).json({
                    erro: `Medicamento ${idx}: frequência deve estar entre 1 e 24`
                });
            }

            // Horários
            if (!Array.isArray(item.horarios) || item.horarios.length === 0) {
                return res.status(400).json({
                    erro: `Medicamento ${idx}: deve ter pelo menos 1 horário`
                });
            }

            if (item.horarios.length > freq + 2) {
                return res.status(400).json({
                    erro: `Medicamento ${idx}: número de horários incoerente com a frequência`
                });
            }

            // Validar cada horário
            for (let j = 0; j < item.horarios.length; j++) {
                const h = item.horarios[j];
                const hidx = j + 1;

                if (!h.horario || typeof h.horario !== 'string') {
                    return res.status(400).json({
                        erro: `Medicamento ${idx}, Horário ${hidx}: horário inválido`
                    });
                }

                // Validar formato HH:MM
                const formatoHora = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(h.horario);
                if (!formatoHora) {
                    return res.status(400).json({
                        erro: `Medicamento ${idx}, Horário ${hidx}: formato deve ser HH:MM`
                    });
                }

                if (!h.status_id || !Number.isInteger(h.status_id) || h.status_id <= 0) {
                    return res.status(400).json({
                        erro: `Medicamento ${idx}, Horário ${hidx}: status_id inválido`
                    });
                }
            }
        }

        // ========== VALIDAÇÕES DO BANCO ==========

        console.log("🔍 Iniciando validações do banco...");

        validarPacienteExiste(paciente_id, (erro, pacienteValido) => {
            if (erro) {
                console.error("❌ Erro ao validar paciente:", erro);
                return res.status(500).json({ erro: "Erro ao validar paciente" });
            }

            if (!pacienteValido) {
                console.warn("⚠️ Paciente não encontrado:", paciente_id);
                return res.status(404).json({ erro: "Paciente não encontrado" });
            }

            console.log("✅ Paciente validado:", paciente_id);

            validarStatusExiste((erro, statusValido) => {
                if (erro) {
                    console.error("❌ Erro ao validar status:", erro);
                    return res.status(500).json({ erro: "Erro ao validar status" });
                }

                if (!statusValido) {
                    console.error("❌ Status inicial não existe");
                    return res.status(500).json({
                        erro: "Status inicial não configurado no sistema"
                    });
                }

                console.log("✅ Status validado");

                validarMedicamentosExistem(itens, (erro, todosExistem) => {
                    if (erro) {
                        console.error("❌ Erro ao validar medicamentos:", erro);
                        return res.status(500).json({ erro: "Erro ao validar medicamentos" });
                    }

                    if (!todosExistem) {
                        console.warn("⚠️ Um ou mais medicamentos não encontrados");
                        return res.status(400).json({
                            erro: "Um ou mais medicamentos não foram encontrados"
                        });
                    }

                    console.log("✅ Todos os medicamentos validados");
                    console.log("✅ VALIDAÇÕES COMPLETAS - Iniciando inserção...");

                    // ========== TUDO VALIDADO - INSERIR ==========
                    inserirPrescricaoComItensHorarios(
                        paciente_id, usuario_id, observacao, itens, res
                    );
                });
            });
        });
    }
);

// ========== FUNÇÕES HELPER ==========

function validarPacienteExiste(paciente_id, callback) {
    db.query(
        "SELECT id FROM pacientes WHERE id = ?",
        [paciente_id],
        function (erro, result) {
            if (erro) return callback(erro, null);
            callback(null, result && result.length > 0);
        }
    );
}

function validarStatusExiste(callback) {
    db.query(
        "SELECT id FROM status_cuidado WHERE id = 1",
        function (erro, result) {
            if (erro) return callback(erro, null);
            callback(null, result && result.length > 0);
        }
    );
}

function validarMedicamentosExistem(itens, callback) {
    const medIds = itens.map(i => parseInt(i.medicamento_id));

    // ✅ Verificar cada medicamento individualmente
    let verificados = 0;
    let encontrados = 0;

    if (medIds.length === 0) {
        return callback(null, false);
    }

    medIds.forEach((med_id) => {
        db.query(
            `SELECT id FROM medicamentos WHERE id = ?`,
            [med_id],
            function (erro, result) {
                verificados++;

                if (!erro && result && result.length > 0) {
                    encontrados++;
                }

                // Se verificou todos
                if (verificados === medIds.length) {
                    callback(null, encontrados === medIds.length);
                }
            }
        );
    });
}

function inserirPrescricaoComItensHorarios(paciente_id, usuario_id, observacao, itens, res) {
    console.log("📝 Inserindo prescrição para paciente_id:", paciente_id);

    db.query(
        `INSERT INTO prescricoes (paciente_id, usuario_id, observacao, data_prescricao) 
         VALUES (?, ?, ?, NOW())`,
        [paciente_id, usuario_id, observacao || null],
        function (erro, resultado) {
            if (erro) {
                console.error("❌ Erro ao inserir prescrição:", erro);
                return res.status(500).json({
                    erro: "Erro ao criar prescrição",
                    detalhes: erro.message
                });
            }

            const prescricao_id = resultado.insertId;
            console.log("✅ Prescrição criada com ID:", prescricao_id);
            console.log("📝 Inserindo", itens.length, "itens...");

            inserirItensEHorarios(prescricao_id, itens, res);
        }
    );
}

function inserirItensEHorarios(prescricao_id, itens, res) {
    // ✅ Processar cada item SEQUENCIALMENTE (não em paralelo)
    // Isso evita race conditions com a lib mysql
    let indiceAtual = 0;
    const erros = [];

    function processarProximoItem() {
        // Se processou todos os itens, finalizar
        if (indiceAtual >= itens.length) {
            if (erros.length > 0) {
                console.error("❌ Erros ao salvar prescrição:", JSON.stringify(erros, null, 2));
                return res.status(500).json({
                    erro: "Erro ao salvar alguns itens da prescrição",
                    detalhes: erros
                });
            }

            console.log("✅ Prescrição completa com sucesso! ID:", prescricao_id);
            return res.status(201).json({
                sucesso: true,
                prescricao_id,
                mensagem: "Prescrição criada com sucesso"
            });
        }

        const item = itens[indiceAtual];
        const idxItem = indiceAtual + 1;
        const totalItems = itens.length;
        indiceAtual++;

        console.log(`📝 Processando item ${idxItem}/${totalItems}...`);

        const medicamento_id = parseInt(item.medicamento_id);
        const dosagem = parseFloat(item.dosagem);
        const frequencia = parseInt(item.frequencia);

        // ✅ Inserir item
        db.query(
            `INSERT INTO itens_prescricao 
             (prescricao_id, medicamento_id, dosagem, via, frequencia) 
             VALUES (?, ?, ?, ?, ?)`,
            [prescricao_id, medicamento_id, dosagem, item.via, frequencia],
            function (erro, resultadoItem) {
                if (erro) {
                    console.error(`❌ Erro ao inserir item ${idxItem}:`, erro);
                    erros.push({
                        medicamento: idxItem,
                        medicamento_id: medicamento_id,
                        erro: erro.message || "Erro desconhecido"
                    });
                    // ✅ Continuar processando próximo item
                    processarProximoItem();
                    return;
                }

                const item_id = resultadoItem.insertId;
                console.log(`✅ Item ${idxItem} criado com ID: ${item_id}`);

                // ✅ Inserir horários para este item (SEQUENCIAL)
                if (Array.isArray(item.horarios) && item.horarios.length > 0) {
                    console.log(`📝 Item ${idxItem} tem ${item.horarios.length} horários`);
                    inserirHorariosItem(item_id, item.horarios, idxItem, (errosHorarios) => {
                        if (errosHorarios.length > 0) {
                            console.warn(`⚠️ Item ${idxItem} teve erro nos horários`);
                            erros.push({
                                medicamento: idxItem,
                                horarios: errosHorarios
                            });
                        } else {
                            console.log(`✅ Item ${idxItem} - todos os horários inseridos`);
                        }
                        // ✅ Processar próximo item
                        processarProximoItem();
                    });
                } else {
                    console.log(`⚠️ Item ${idxItem} sem horários`);
                    // ✅ Sem horários, processar próximo item
                    processarProximoItem();
                }
            }
        );
    }

    // ✅ Iniciar processamento do primeiro item
    console.log(`🚀 Iniciando inserção de ${itens.length} itens para prescrição ${prescricao_id}`);
    processarProximoItem();
}

// ✅ Função para inserir horários de um item (SEQUENCIAL)
function inserirHorariosItem(item_id, horarios, idxMedicamento, callback) {
    let indiceHorario = 0;
    const errosHorarios = [];

    function processarProximoHorario() {
        // Se processou todos os horários, finalizar
        if (indiceHorario >= horarios.length) {
            if (errosHorarios.length > 0) {
                console.warn(`⚠️ Medicamento ${idxMedicamento}: ${errosHorarios.length} erro(s) nos horários`);
            }
            return callback(errosHorarios);
        }

        const h = horarios[indiceHorario];
        const idxHorario = indiceHorario + 1;
        indiceHorario++;

        // ✅ Validações extras para segurança
        if (!h.horario || typeof h.horario !== 'string') {
            console.warn(`⚠️ Horário inválido no medicamento ${idxMedicamento}:`, h);
            errosHorarios.push({
                horario: idxHorario,
                erro: "Formato de horário inválido"
            });
            processarProximoHorario();
            return;
        }

        const status_id = h.status_id || 1;

        db.query(
            `INSERT INTO horarios_prescricao 
            (item_prescricao_id, horario, status_id) 
            VALUES (?, ?, ?)`,
            [item_id, h.horario, status_id],
            function (erroH) {
                if (erroH) {
                    console.error(`❌ Erro ao inserir horário ${idxHorario} do medicamento ${idxMedicamento}:`, erroH);
                    errosHorarios.push({
                        horario: idxHorario,
                        horario_valor: h.horario,
                        erro: erroH.message || "Erro desconhecido"
                    });
                } else {
                    console.log(`✅ Horário ${idxHorario} (${h.horario}) inserido para medicamento ${idxMedicamento}`);
                }
                // ✅ Processar próximo horário
                processarProximoHorario();
            }
        );
    }

    // ✅ Iniciar processamento de horários
    processarProximoHorario();
}

module.exports = router