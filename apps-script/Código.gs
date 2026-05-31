// =============================================================
//  PLANO DE AÇÃO — GOOGLE APPS SCRIPT
//  Cole este código no seu Apps Script e publique como Web App
//  Permissão: "Qualquer pessoa, mesmo anônimas"
// =============================================================

var SHEET_NAME = 'Página1'; // ← Altere para o nome exato da sua aba

// Colunas da planilha (ordem exata, começando em 1)
var COL = {
  ID:                  1,
  EMPRESA:             2,
  REUNIAO:             3,
  ACAO:                4,
  SETOR:               5,
  RESPONSAVEL:         6,
  DT_REUNIAO:          7,
  PRAZO:               8,
  STATUS:              9,
  OBSERVACAO:          10,
  ULTIMA_ATUALIZACAO:  11,  // Adicionar essa coluna na planilha
  ATUALIZADO_POR:      12,  // Adicionar essa coluna na planilha
};

// =============================================================
//  doGet — Leitura de todos os dados
// =============================================================
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Aba "' + SHEET_NAME + '" não encontrada.');

    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var rows = [];

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      // Pula linhas completamente vazias
      if (!row[COL.ID - 1] && !row[COL.ACAO - 1]) continue;

      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        var key = String(headers[j]).trim();
        var val = row[j];
        // Formata datas como dd/mm/yyyy
        if (val instanceof Date) {
          val = Utilities.formatDate(val, Session.getScriptTimeZone(), 'dd/MM/yyyy');
        }
        obj[key] = val !== null && val !== undefined ? String(val) : '';
      }
      rows.push(obj);
    }

    return ContentService
      .createTextOutput(JSON.stringify(rows))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// =============================================================
//  doPost — Atualização de uma ação pelo responsável
// =============================================================
function doPost(e) {
  try {
    // Apps Script recebe o body em e.postData.contents
    var payload = JSON.parse(e.postData.contents);

    var id             = String(payload.ID || '').trim();
    var novoStatus     = String(payload.Status || '').trim();
    var novaObservacao = String(payload['Observação'] || '').trim();
    var novoPrazo      = String(payload.Prazo || '').trim();
    var atualizadoPor  = String(payload.AtualizadoPor || '').trim();
    var dataAtual      = String(payload.UltimaAtualizacao || new Date().toLocaleString('pt-BR'));

    if (!id) throw new Error('ID não informado.');
    if (!novoStatus) throw new Error('Status não pode ser vazio.');
    if (!atualizadoPor) throw new Error('AtualizadoPor não informado.');

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Aba "' + SHEET_NAME + '" não encontrada.');

    var data = sheet.getDataRange().getValues();
    var rowIndex = -1;

    // Busca a linha pelo ID (coluna 1, índice 0)
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][COL.ID - 1]).trim() === id) {
        rowIndex = i + 1; // +1 porque getDataRange começa em 1
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Ação com ID "' + id + '" não encontrada na planilha.');
    }

    // Valida que o usuário é realmente o responsável
    var responsavelNaPlanilha = String(data[rowIndex - 1][COL.RESPONSAVEL - 1]).trim();
    if (responsavelNaPlanilha !== atualizadoPor) {
      throw new Error('Permissão negada: você não é o responsável por esta ação.');
    }

    // Atualiza os campos editáveis
    sheet.getRange(rowIndex, COL.STATUS).setValue(novoStatus);
    sheet.getRange(rowIndex, COL.OBSERVACAO).setValue(novaObservacao);

    // Prazo: só atualiza se informado
    if (novoPrazo) {
      // Converte dd/mm/yyyy para Date
      var partes = novoPrazo.split('/');
      if (partes.length === 3) {
        var dataObj = new Date(
          parseInt(partes[2]),
          parseInt(partes[1]) - 1,
          parseInt(partes[0])
        );
        sheet.getRange(rowIndex, COL.PRAZO).setValue(dataObj);
        // Formata a célula como data
        sheet.getRange(rowIndex, COL.PRAZO).setNumberFormat('dd/MM/yyyy');
      }
    }

    // Atualiza campos de auditoria
    sheet.getRange(rowIndex, COL.ULTIMA_ATUALIZACAO).setValue(dataAtual);
    sheet.getRange(rowIndex, COL.ATUALIZADO_POR).setValue(atualizadoPor);

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Ação "' + id + '" atualizada com sucesso.',
        updatedBy: atualizadoPor,
        updatedAt: dataAtual
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
