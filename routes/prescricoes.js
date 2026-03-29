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

                    if (item && row.horario_id) {
                        item.horarios.push({
                            id: row.horario_id,
                            horario: row.horario,
                            status_id: row.status_id || 1
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

        if (!usuario_id) {
            return res.status(401).json({ erro: "Usuário não autenticado" });
        }

        if (!paciente_id || !Number.isInteger(Number(paciente_id)) || Number(paciente_id) <= 0) {
            return res.status(400).json({ erro: "paciente_id deve ser um número válido" });
        }

        if (!Array.isArray(itens) || itens.length === 0) {
            return res.status(400).json({ erro: "Deve incluir pelo menos 1 medicamento" });
        }

        if (itens.length > 20) {
            return res.status(400).json({ erro: "Máximo de 20 medicamentos por prescrição" });
        }

        if (observacao && typeof observacao === 'string' && observacao.length > 500) {
            return res.status(400).json({ erro: "Observação muito longa (máx 500 caracteres)" });
        }

        // ========== VALIDAÇÕES DE ITENS ==========
        // Nota: horarios NÃO são enviados pelo frontend.
        // São gerados no backend com base em data_prescricao + frequencia (intervalo em horas).

        for (let i = 0; i < itens.length; i++) {
            const item = itens[i];
            const idx = i + 1;

            if (!item.medicamento_id) {
                return res.status(400).json({ erro: `Medicamento ${idx}: medicamento_id obrigatório` });
            }

            const med_id = parseInt(item.medicamento_id);
            if (isNaN(med_id) || med_id <= 0) {
                return res.status(400).json({ erro: `Medicamento ${idx}: medicamento_id inválido` });
            }

            if (!item.dosagem) {
                return res.status(400).json({ erro: `Medicamento ${idx}: dosagem obrigatória` });
            }

            const dosagem = parseFloat(item.dosagem);
            if (isNaN(dosagem) || dosagem <= 0) {
                return res.status(400).json({ erro: `Medicamento ${idx}: dosagem deve ser > 0` });
            }

            if (dosagem > 10000) {
                return res.status(400).json({ erro: `Medicamento ${idx}: dosagem muito alta (máx 10000)` });
            }

            if (!item.via || typeof item.via !== 'string') {
                return res.status(400).json({ erro: `Medicamento ${idx}: via obrigatória` });
            }

            if (item.via.trim().length === 0 || item.via.length > 50) {
                return res.status(400).json({ erro: `Medicamento ${idx}: via inválida` });
            }

            if (!item.frequencia) {
                return res.status(400).json({ erro: `Medicamento ${idx}: frequência obrigatória` });
            }

            // frequencia = intervalo em horas (1 = a cada 1h, 4 = a cada 4h, etc.)
            const freq = parseInt(item.frequencia);
            if (isNaN(freq) || freq <= 0 || freq > 24) {
                return res.status(400).json({
                    erro: `Medicamento ${idx}: intervalo de frequência deve estar entre 1h e 24h`
                });
            }
        }

        // ========== VALIDAÇÕES DO BANCO ==========

        console.log("Iniciando validações do banco...");

        validarPacienteExiste(paciente_id, (erro, pacienteValido) => {
            if (erro) {
                console.error("Erro ao validar paciente:", erro);
                return res.status(500).json({ erro: "Erro ao validar paciente" });
            }

            if (!pacienteValido) {
                return res.status(404).json({ erro: "Paciente não encontrado" });
            }

            validarStatusExiste((erro, statusValido) => {
                if (erro) {
                    console.error("Erro ao validar status:", erro);
                    return res.status(500).json({ erro: "Erro ao validar status" });
                }

                if (!statusValido) {
                    return res.status(500).json({ erro: "Status inicial não configurado no sistema" });
                }

                validarMedicamentosExistem(itens, (erro, todosExistem) => {
                    if (erro) {
                        console.error("Erro ao validar medicamentos:", erro);
                        return res.status(500).json({ erro: "Erro ao validar medicamentos" });
                    }

                    if (!todosExistem) {
                        return res.status(400).json({ erro: "Um ou mais medicamentos não foram encontrados" });
                    }

                    // Captura o momento exato no Node.js para usar tanto
                    // no INSERT da prescrição quanto na geração dos horários
                    const dataPrescricao = new Date();

                    inserirPrescricaoComItensHorarios(
                        paciente_id, usuario_id, observacao, itens, dataPrescricao, res
                    );
                });
            });
        });
    }
);

//======================================
//   HORARIOS PRESCRICAO - [ PUT ]
//======================================

router.put(
    "/horario/:id",
    autorizar("aluno", "docente", "admin"),
    function (req, res) {
        const { id } = req.params;
        const { status_id } = req.body;

        if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
            return res.status(400).json({ erro: "ID do horário inválido" });
        }

        // status válidos: 1=pendente, 2=finalizado, 3=nao_feito, 4=negado_paciente
        const statusValidos = [1, 2, 3, 4];
        const statusIdParsed = parseInt(status_id);

        if (!status_id || !statusValidos.includes(statusIdParsed)) {
            return res.status(400).json({
                erro: "status_id inválido. Use: 1 (pendente), 2 (finalizado), 3 (nao_feito) ou 4 (negado_paciente)"
            });
        }

        db.query(
            "UPDATE horarios_prescricao SET status_id = ? WHERE id = ?",
            [statusIdParsed, parseInt(id)],
            function (erro, resultado) {
                if (erro) {
                    console.error("Erro ao atualizar status do horário:", erro);
                    return res.status(500).json({ erro: "Erro ao atualizar status" });
                }

                if (resultado.affectedRows === 0) {
                    return res.status(404).json({ erro: "Horário não encontrado" });
                }

                return res.json({ sucesso: true, mensagem: "Status atualizado com sucesso" });
            }
        );
    }
);

//======================================
//      PRESCRICOES - [ DELETE ]
//======================================

router.delete(
    "/:id",
    autorizar("aluno", "docente", "admin"),
    function (req, res) {
        const { id } = req.params;
        const prescricao_id = parseInt(id);

        if (!id || isNaN(prescricao_id) || prescricao_id <= 0) {
            return res.status(400).json({ erro: "ID da prescrição inválido" });
        }

        // 1. Verificar se a prescrição existe
        db.query(
            "SELECT id FROM prescricoes WHERE id = ?",
            [prescricao_id],
            function (erro, resultado) {
                if (erro) {
                    console.error("Erro ao buscar prescrição:", erro);
                    return res.status(500).json({ erro: "Erro ao buscar prescrição" });
                }

                if (!resultado || resultado.length === 0) {
                    return res.status(404).json({ erro: "Prescrição não encontrada" });
                }

                // 2. Deletar itens_prescricao
                // horarios_prescricao são removidos automaticamente via ON DELETE CASCADE
                // (FK: horarios_prescricao_ibfk_1 → itens_prescricao ON DELETE CASCADE)
                db.query(
                    "DELETE FROM itens_prescricao WHERE prescricao_id = ?",
                    [prescricao_id],
                    function (erroItens) {
                        if (erroItens) {
                            console.error("Erro ao deletar itens da prescrição:", erroItens);
                            return res.status(500).json({ erro: "Erro ao deletar itens da prescrição" });
                        }

                        console.log(`Itens da prescrição ${prescricao_id} deletados`);

                        // 3. Deletar a prescrição principal
                        db.query(
                            "DELETE FROM prescricoes WHERE id = ?",
                            [prescricao_id],
                            function (erroPrescricao) {
                                if (erroPrescricao) {
                                    console.error("Erro ao deletar prescrição:", erroPrescricao);
                                    return res.status(500).json({ erro: "Erro ao deletar prescrição" });
                                }

                                console.log(`Prescrição ${prescricao_id} deletada com sucesso`);
                                return res.json({
                                    sucesso: true,
                                    mensagem: "Prescrição deletada com sucesso"
                                });
                            }
                        );
                    }
                );
            }
        );
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

    let verificados = 0;
    let encontrados = 0;

    if (medIds.length === 0) {
        return callback(null, false);
    }

    medIds.forEach((med_id) => {
        db.query(
            "SELECT id FROM medicamentos WHERE id = ?",
            [med_id],
            function (erro, result) {
                verificados++;

                if (!erro && result && result.length > 0) {
                    encontrados++;
                }

                if (verificados === medIds.length) {
                    callback(null, encontrados === medIds.length);
                }
            }
        );
    });
}

// ─── Geração de horários (backend) ─────────────────────────────────────────
//
// Regra:
//   dataPrescricao = momento da criação (ex: 19:00)
//   frequenciaHoras = intervalo em horas (ex: 4 → a cada 4h)
//   1ª dose = dataPrescricao + frequenciaHoras (ex: 23:00)
//   Ciclo completa 24 horas → último horário = dataPrescricao + 24h
//
// Exemplos:
//   Criado às 19:00, freq=1h → 20:00, 21:00, ..., 19:00 (24 doses)
//   Criado às 19:00, freq=4h → 23:00, 03:00, 07:00, 11:00, 15:00, 19:00 (6 doses)
//   Criado às 19:00, freq=6h → 01:00, 07:00, 13:00, 19:00 (4 doses)

function gerarHorariosParaItem(dataPrescricao, frequenciaHoras) {
    const horarios = [];
    const seenHorarios = new Set();

    const startMinutes = dataPrescricao.getHours() * 60 + dataPrescricao.getMinutes();
    const intervalMinutes = frequenciaHoras * 60;
    const limiteMinutes = 24 * 60; // 1440 min = 24h

    let i = 1;

    while (true) {
        const elapsedMinutes = i * intervalMinutes;

        // Inclui exatamente 24h (fecha o ciclo no mesmo horário do dia seguinte)
        if (elapsedMinutes > limiteMinutes) break;

        const totalMins = (startMinutes + elapsedMinutes) % limiteMinutes;
        const horas = Math.floor(totalMins / 60);
        const minutos = totalMins % 60;

        const hh = horas.toString().padStart(2, '0');
        const mm = minutos.toString().padStart(2, '0');
        const timeStr = `${hh}:${mm}`;

        // Evita duplicatas (frequências que não dividem 24 exatamente)
        if (!seenHorarios.has(timeStr)) {
            seenHorarios.add(timeStr);
            horarios.push({ horario: timeStr, status_id: 1 });
        }

        i++;
    }

    console.log(
        `Horários gerados para freq=${frequenciaHoras}h` +
        ` (início: ${dataPrescricao.toTimeString().slice(0, 5)}):`,
        horarios.map(h => h.horario).join(', ')
    );

    return horarios;
}

function inserirPrescricaoComItensHorarios(paciente_id, usuario_id, observacao, itens, dataPrescricao, res) {
    console.log("Inserindo prescrição para paciente_id:", paciente_id);

    // Formata para MySQL: YYYY-MM-DD HH:MM:SS
    const dataFormatada = dataPrescricao.toISOString().slice(0, 19).replace('T', ' ');

    db.query(
        `INSERT INTO prescricoes (paciente_id, usuario_id, observacao, data_prescricao) 
         VALUES (?, ?, ?, ?)`,
        [paciente_id, usuario_id, observacao || null, dataFormatada],
        function (erro, resultado) {
            if (erro) {
                console.error("Erro ao inserir prescrição:", erro);
                return res.status(500).json({ erro: "Erro ao criar prescrição", detalhes: erro.message });
            }

            const prescricao_id = resultado.insertId;
            console.log("Prescrição criada com ID:", prescricao_id);

            inserirItensEHorarios(prescricao_id, itens, dataPrescricao, res);
        }
    );
}

function inserirItensEHorarios(prescricao_id, itens, dataPrescricao, res) {
    let indiceAtual = 0;
    const erros = [];

    function processarProximoItem() {
        if (indiceAtual >= itens.length) {
            if (erros.length > 0) {
                console.error("Erros ao salvar prescrição:", JSON.stringify(erros, null, 2));
                return res.status(500).json({
                    erro: "Erro ao salvar alguns itens da prescrição",
                    detalhes: erros
                });
            }

            console.log("Prescrição completa com sucesso! ID:", prescricao_id);
            return res.status(201).json({
                sucesso: true,
                prescricao_id,
                mensagem: "Prescrição criada com sucesso"
            });
        }

        const item = itens[indiceAtual];
        const idxItem = indiceAtual + 1;
        indiceAtual++;

        const medicamento_id = parseInt(item.medicamento_id);
        const dosagem = parseFloat(item.dosagem);
        const frequencia = parseInt(item.frequencia);

        db.query(
            `INSERT INTO itens_prescricao 
             (prescricao_id, medicamento_id, dosagem, via, frequencia) 
             VALUES (?, ?, ?, ?, ?)`,
            [prescricao_id, medicamento_id, dosagem, item.via, frequencia],
            function (erro, resultadoItem) {
                if (erro) {
                    console.error(`Erro ao inserir item ${idxItem}:`, erro);
                    erros.push({ medicamento: idxItem, erro: erro.message || "Erro desconhecido" });
                    processarProximoItem();
                    return;
                }

                const item_id = resultadoItem.insertId;
                console.log(`Item ${idxItem} criado com ID: ${item_id}`);

                // Gera os horários no backend com base em dataPrescricao + intervalo
                const horariosGerados = gerarHorariosParaItem(dataPrescricao, frequencia);

                if (horariosGerados.length > 0) {
                    inserirHorariosItem(item_id, horariosGerados, idxItem, (errosHorarios) => {
                        if (errosHorarios.length > 0) {
                            erros.push({ medicamento: idxItem, horarios: errosHorarios });
                        }
                        processarProximoItem();
                    });
                } else {
                    console.warn(`Item ${idxItem} — nenhum horário gerado (freq: ${frequencia}h)`);
                    processarProximoItem();
                }
            }
        );
    }

    processarProximoItem();
}

function inserirHorariosItem(item_id, horarios, idxMedicamento, callback) {
    let indiceHorario = 0;
    const errosHorarios = [];

    function processarProximoHorario() {
        if (indiceHorario >= horarios.length) {
            return callback(errosHorarios);
        }

        const h = horarios[indiceHorario];
        const idxHorario = indiceHorario + 1;
        indiceHorario++;

        if (!h.horario || typeof h.horario !== 'string') {
            errosHorarios.push({ horario: idxHorario, erro: "Formato de horário inválido" });
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
                    console.error(`Erro ao inserir horário ${idxHorario} do medicamento ${idxMedicamento}:`, erroH);
                    errosHorarios.push({
                        horario: idxHorario,
                        horario_valor: h.horario,
                        erro: erroH.message || "Erro desconhecido"
                    });
                }
                processarProximoHorario();
            }
        );
    }

    processarProximoHorario();
}

module.exports = router