// =============================================================
//  PLANO DE AÇÃO — GOOGLE APPS SCRIPT  v4
//  Publicar como Web App: "Qualquer pessoa, mesmo anônimas"
// =============================================================

var SHEET_ACOES   = 'Página1';   // ← nome exato da aba de ações
var SHEET_USUARIOS = 'Usuário';  // ← nome exato da aba de usuários

var COL = {
  ID:                 1,
  EMPRESA:            2,
  REUNIAO:            3,
  ACAO:               4,
  SETOR:              5,
  RESPONSAVEL:        6,
  DT_REUNIAO:         7,
  PRAZO:              8,
  STATUS:             9,
  OBSERVACAO:         10,
  ULTIMA_ATUALIZACAO: 11,
  ATUALIZADO_POR:     12,
};

var COL_USR = {
  RESPONSAVEL: 1,
  EMAIL:       2,
  ACESSO:      3,
};

// =============================================================
//  doGet — Leitura de ações e usuários
// =============================================================
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'acoes';

    if (action === 'usuarios') {
      return getUsuarios();
    }
    return getAcoes();

  } catch (err) {
    return jsonResponse({ success: false, message: err.message });
  }
}

// --- Retorna todas as ações ---
function getAcoes() {
  var sheet = getSheet(SHEET_ACOES);
  var data  = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[COL.ID - 1] && !row[COL.ACAO - 1]) continue;
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var key = String(headers[j]).trim();
      var val = row[j];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone(), 'dd/MM/yyyy');
      }
      obj[key] = (val !== null && val !== undefined) ? String(val) : '';
    }
    rows.push(obj);
  }

  return jsonResponse(rows);
}

// --- Retorna cadastro de usuários para autenticação ---
function getUsuarios() {
  var sheet = getSheet(SHEET_USUARIOS);
  var data  = sheet.getDataRange().getValues();
  var usuarios = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var email = String(row[COL_USR.EMAIL - 1] || '').trim();
    if (!email) continue;
    usuarios.push({
      responsavel: String(row[COL_USR.RESPONSAVEL - 1] || '').trim(),
      email:       email.toLowerCase(),
      acesso:      String(row[COL_USR.ACESSO - 1] || 'Usuário').trim(),
    });
  }

  return jsonResponse({ usuarios: usuarios });
}

// =============================================================
//  doPost — Atualização de uma ação
// =============================================================
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);

    var id             = String(payload.ID || '').trim();
    var novoStatus     = String(payload.Status || '').trim();
    var novaObservacao = String(payload['Observação'] || '').trim();
    var novoPrazo      = String(payload.Prazo || '').trim();
    var atualizadoPor  = String(payload.AtualizadoPor || '').trim();
    var dataAtual      = String(payload.UltimaAtualizacao || new Date().toLocaleString('pt-BR'));

    if (!id)            throw new Error('ID não informado.');
    if (!novoStatus)    throw new Error('Status não pode ser vazio.');
    if (!atualizadoPor) throw new Error('AtualizadoPor não informado.');

    var sheet = getSheet(SHEET_ACOES);
    var data  = sheet.getDataRange().getValues();
    var rowIndex = -1;

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][COL.ID - 1]).trim() === id) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) throw new Error('Ação ID "' + id + '" não encontrada.');

    // Valida permissão: verifica se o e-mail existe na aba Usuário e se é ADM ou responsável
    var usuarioSheet = getSheet(SHEET_USUARIOS);
    var usuariosData = usuarioSheet.getDataRange().getValues();
    var perfilUsuario = null;
    var nomeResponsavel = '';

    for (var u = 1; u < usuariosData.length; u++) {
      var emailCadastrado = String(usuariosData[u][COL_USR.EMAIL - 1] || '').trim().toLowerCase();
      if (emailCadastrado === atualizadoPor.trim().toLowerCase()) {
        nomeResponsavel = String(usuariosData[u][COL_USR.RESPONSAVEL - 1] || '').trim();
        perfilUsuario   = String(usuariosData[u][COL_USR.ACESSO - 1] || 'Usuário').trim();
        break;
      }
    }

    if (!perfilUsuario) throw new Error('Usuário não autorizado.');

    // Usuário comum: só pode editar suas próprias ações
    if (perfilUsuario !== 'ADM') {
      var responsavelDaAcao = String(data[rowIndex - 1][COL.RESPONSAVEL - 1]).trim();
      if (responsavelDaAcao !== nomeResponsavel) {
        throw new Error('Permissão negada: você não é o responsável por esta ação.');
      }
    }

    // Atualiza campos editáveis
    sheet.getRange(rowIndex, COL.STATUS).setValue(novoStatus);
    sheet.getRange(rowIndex, COL.OBSERVACAO).setValue(novaObservacao);

    if (novoPrazo) {
      var partes = novoPrazo.split('/');
      if (partes.length === 3) {
        var dateObj = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
        sheet.getRange(rowIndex, COL.PRAZO).setValue(dateObj);
        sheet.getRange(rowIndex, COL.PRAZO).setNumberFormat('dd/MM/yyyy');
      }
    }

    // Campos de auditoria
    sheet.getRange(rowIndex, COL.ULTIMA_ATUALIZACAO).setValue(dataAtual);
    sheet.getRange(rowIndex, COL.ATUALIZADO_POR).setValue(atualizadoPor);

    return jsonResponse({
      success:   true,
      message:   'Ação "' + id + '" atualizada com sucesso.',
      updatedBy: atualizadoPor,
      updatedAt: dataAtual,
    });

  } catch (err) {
    return jsonResponse({ success: false, message: err.message });
  }
}

// =============================================================
//  Funções auxiliares
// =============================================================
function getSheet(name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error('Aba "' + name + '" não encontrada.');
  return sheet;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// =============================================================
//  ESTRUTURA PARA NOTIFICAÇÕES FUTURAS
//  NÃO ATIVAS — apenas estrutura preparada
//  Para ativar: configurar Triggers no Apps Script
// =============================================================

/**
 * TRIGGER FUTURO: Relatório semanal de ações por e-mail
 * Como ativar: Triggers → Baseado em tempo → Semana → Segunda-feira → 8h
 */
function enviarRelatorioSemanal() {
  // TODO: implementar envio semanal
  // 1. Ler todas as ações em aberto
  // 2. Agrupar por responsável
  // 3. Enviar e-mail individual para cada responsável com suas ações
  Logger.log('[FUTURO] enviarRelatorioSemanal — não implementado ainda');
}

/**
 * TRIGGER FUTURO: Alerta de ações vencendo em 7 dias
 * Como ativar: Triggers → Baseado em tempo → Dia → 8h
 */
function alertarAcoesVencendo7Dias() {
  // TODO: implementar alerta de vencimento próximo
  // 1. Verificar ações com prazo entre hoje e hoje+7
  // 2. Notificar responsável e gestores
  Logger.log('[FUTURO] alertarAcoesVencendo7Dias — não implementado ainda');
}

/**
 * TRIGGER FUTURO: Alerta de ações atrasadas
 * Como ativar: Triggers → Baseado em tempo → Dia → 8h
 */
function alertarAcoesAtrasadas() {
  // TODO: implementar alerta de atraso
  // 1. Verificar ações com prazo < hoje e status != Concluído
  // 2. Notificar responsável, gestor e ADM
  Logger.log('[FUTURO] alertarAcoesAtrasadas — não implementado ainda');
}
