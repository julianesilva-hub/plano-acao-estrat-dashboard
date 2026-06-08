// =============================================================
//  PLANO DE AÇÃO — GOOGLE APPS SCRIPT  v5
//  Publicar como Web App: Execute as: "Me"
//                         Who has access: "Anyone"
//  IMPORTANTE: Sempre criar um novo Deploy após alterações.
// =============================================================

var SHEET_ACOES    = 'Página1';  // ← nome exato da aba de ações
var SHEET_USUARIOS = 'Usuário';  // ← nome exato da aba de usuários (mantida para leitura)

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

    // FASE FUTURA: update via GET (fallback do front-end)
    if (action === 'update' && e.parameter.payload) {
      var payload = JSON.parse(decodeURIComponent(e.parameter.payload));
      return processUpdate(payload);
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

// --- Retorna cadastro de usuários ---
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
//  FASE ATUAL: sem validação de OAuth/e-mail.
//  A permissão é controlada exclusivamente pelo front-end ("Você é").
// =============================================================
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    return processUpdate(payload);
  } catch (err) {
    return jsonResponse({ success: false, message: 'Erro ao processar requisição: ' + err.message });
  }
}

// --- Processamento central de update (usado por doPost e doGet fallback) ---
function processUpdate(payload) {
  try {
    var id             = String(payload.ID || '').trim();
    var novoStatus     = String(payload.Status || '').trim();
    var novaObservacao = String(payload['Observação'] || payload['Observacao'] || '').trim();
    var novoPrazo      = String(payload.Prazo || '').trim();
    var atualizadoPor  = String(payload.AtualizadoPor || '').trim();
    var dataAtual      = String(payload.UltimaAtualizacao || new Date().toLocaleString('pt-BR'));

    // Validações básicas (sem verificar autenticação)
    if (!id)         throw new Error('ID não informado.');
    if (!novoStatus) throw new Error('Status não pode ser vazio.');

    var sheet = getSheet(SHEET_ACOES);
    var data  = sheet.getDataRange().getValues();
    var rowIndex = -1;

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][COL.ID - 1]).trim() === id) {
        rowIndex = i + 1; // +1 porque getRange é 1-based
        break;
      }
    }

    if (rowIndex === -1) throw new Error('Ação ID "' + id + '" não encontrada na planilha.');

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
    if (atualizadoPor) {
      sheet.getRange(rowIndex, COL.ATUALIZADO_POR).setValue(atualizadoPor);
    }

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
  if (!sheet) throw new Error('Aba "' + name + '" não encontrada na planilha.');
  return sheet;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
