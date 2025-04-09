function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById("https://docs.google.com/spreadsheets/d/1UzzuE4kERhznDw76NuAaHjXxMbWYqNXshLle5ZZ4eHo");
    const wsAlunos = ss.getSheetByName("Aluno");
    const wsDados = ss.getSheetByName("Dados");

    const data = JSON.parse(e.postData.contents);
    const imagemBase64 = data.image;

    if (!imagemBase64) {
      return ContentService.createTextOutput(JSON.stringify({ message: "Imagem não recebida." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const alunos = wsAlunos.getDataRange().getValues();
    let alunoReconhecido = null;

    // Simulação de comparação facial: procuramos a imagem na coluna A (índice 0)
    for (let i = 1; i < alunos.length; i++) {
      const urlImagem = alunos[i][0];
      if (imagemBase64.includes(urlImagem.split("/").pop())) { // Checagem por similaridade simples
        alunoReconhecido = {
          imagem: urlImagem,
          nome: alunos[i][1],
          turma: alunos[i][2],
          entradaEsperada: alunos[i][3],
          saidaEsperada: alunos[i][4]
        };
        break;
      }
    }

    if (!alunoReconhecido) {
      return ContentService.createTextOutput(JSON.stringify({ message: "Aluno não reconhecido." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Pega a data e hora atual
    const agora = new Date();
    const dataFormatada = Utilities.formatDate(agora, "GMT-3", "dd/MM/yyyy");
    const horaFormatada = Utilities.formatDate(agora, "GMT-3", "HH:mm:ss");

    // Verifica se já tem entrada ou saída hoje
    const registros = wsDados.getDataRange().getValues();
    let entradaHoje = null;
    let saidaHoje = null;
    for (let i = 1; i < registros.length; i++) {
      if (
        registros[i][2] === alunoReconhecido.nome &&
        registros[i][4] === dataFormatada
      ) {
        if (registros[i][5]) entradaHoje = registros[i][5];
        if (registros[i][6]) saidaHoje = registros[i][6];
      }
    }

    let tipoRegistro = "";
    if (!entradaHoje) {
      tipoRegistro = "entrada";
    } else if (!saidaHoje) {
      tipoRegistro = "saida";
    } else {
      return ContentService.createTextOutput(JSON.stringify({ message: "Aluno já registrou entrada e saída hoje." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Monta nova linha para salvar
    const novaLinha = [
      new Date().getTime(), // ID
      alunoReconhecido.imagem,
      alunoReconhecido.nome,
      alunoReconhecido.turma,
      dataFormatada,
      tipoRegistro === "entrada" ? horaFormatada : "",
      tipoRegistro === "saida" ? horaFormatada : "",
      tipoRegistro === "entrada" ? "ENTRADA REGISTRADA" : "SAÍDA REGISTRADA"
    ];

    wsDados.appendRow(novaLinha);

    return ContentService
      .createTextOutput(JSON.stringify({ message: `Registro de ${tipoRegistro} feito para ${alunoReconhecido.nome}` }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ message: "Erro: " + err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
