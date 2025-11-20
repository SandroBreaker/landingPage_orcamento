// script.gs

// 1. Recebe o post do formulário de orçamento
// 2. Salva uma cópia do formulário para o cliente
// 3. Envia e-mail de confirmação
// 4. Salva a linha no Google Sheet
// 5. Planeja a data para salvar os dados
// FUNÇÃO PRINCIPAL: handleFormSubmit (chamada por doPost(e))
// DADOS ENVIADOS: e.postData.contents (JSON com dados do formulário)

// FUNÇÃO PRINCIPAL
function doPost(e) {
  // 1. Recebe o post do formulário de orçamento em JSON
  const data = JSON.parse(e.postData.contents);

  // Desestruturar dados para variáveis
  const timestamp = new Date();
  const nome = data.nome;
  const email = data.email;
  const telefone = data.telefone || "";
  const servico = data.servico;
  const mensagem = data.mensagem;
  
  // Refatoração Zero-Bug: ID UNICIDADE ROBUSTA (baseado em timestamp + hash curto)
  const dataFormatada = Utilities.formatDate(timestamp, SpreadsheetApp.getActive().getSpreadsheetTimeZone(), "yyyyMMddHHmmss");
  const hashCurto = Math.random().toString(36).substring(2, 5).toUpperCase();
  const idOrcamento = `ORC-${dataFormatada}-${hashCurto}`; // Garante unicidade e rastreabilidade fácil

  // 2. SALVAR DADOS DE PLANILHA
  try {
    const ss = SpreadsheetApp.openById("19BBxBVglWkWXkkiq1GQPryyVTX8aaEKWFGoblHn1rNs"); // Substitua pelo ID REAL da sua Planilha
    const sheet = ss.getSheetByName("Orcamentos");

    if (!sheet) {
      throw new Error("Planilha 'Orcamentos' não encontrada.");
    }

    // Adiciona nova linha com os dados
    sheet.appendRow([
      timestamp,
      idOrcamento,
      nome,
      email,
      telefone,
      servico,
      mensagem
    ]);

    Logger.log(`Linha adicionada. ID: ${idOrcamento} e-mail: ${email} encontrada na planilha.`);

  } catch (error) {
    Logger.log(`ERRO ao salvar dados na planilha: ${error.toString()}`);
    // Falha crítica, enviar erro ao cliente ou logar sem enviar mensagem.
    return ContentService.createTextOutput(JSON.stringify({
      sucesso: false,
      mensagem: "Falha ao registrar seu orçamento. Tente novamente ou entre em contato direto."
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // 3. ENVIAR E-MAIL
  try {
    // Monta o corpo do e-mail em HTML
    const htmlBody = `
      <p>Prezado(a) ${nome},</p>
      <p>Recebemos sua solicitação de orçamento. Segue um resumo dos dados:</p>
      <hr>
      <ul>
        <li><strong>Protocolo de Orçamento:</strong> ${idOrcamento}</li>
        <li><strong>Nome:</strong> ${nome}</li>
        <li><strong>E-mail:</strong> ${email}</li>
        <li><strong>Telefone:</strong> ${telefone || 'Não fornecido'}</li>
        <li><strong>Serviço Solicitado:</strong> ${servico}</li>
        <li><strong>Mensagem:</strong> ${mensagem}</li>
      </ul>
      <hr>
      <p>Em breve entraremos em contato para discutir os detalhes e formalizar a proposta.</p>
      <p>Obrigado(a) por seu interesse.</p>
      <br>
      <p>Atenciosamente,</p>
      <p><strong>Carlos Marcador de Negócios</strong></p>
      <br>
      <small>Este é um e-mail automático, por favor, não responda diretamente.</small>
    `;

    // 4. Envia e-mail de confirmação para o cliente
    MailApp.sendEmail({
      to: email,
      subject: `[Orçamento Recebido] Protocolo ${idOrcamento}`,
      htmlBody: htmlBody
    });

    Logger.log(`E-mail de confirmação enviado para: ${email}`);

    // ENVIE E-MAIL PARA O DONO/ADMIN AQUI SE NECESSÁRIO
    // Exemplo: MailApp.sendEmail({ to: "admin@seuemail.com", subject: `NOVO Orçamento: ${nome}`, htmlBody: htmlBody });

  } catch (error) {
    Logger.log(`ERRO ao enviar e-mail de confirmação: ${error.toString()}`);
    // A falha no envio de e-mail não é crítica. A linha já foi salva.
  }

  // 5. RESPOSTA PARA O FRONT-END
  // Retorna sucesso ao cliente
  return ContentService.createTextOutput(JSON.stringify({
    sucesso: true,
    mensagem: `Seu orçamento foi registrado com o protocolo ${idOrcamento}. Enviamos um e-mail de confirmação.`
  })).setMimeType(ContentService.MimeType.JSON);
}

// FUNÇÃO DE TESTE
// Deve ser executada manualmente no Apps Script (Run) para simular o formulário
function test_doPost() {
  const fakeEvent = {
    postData: {
      contents: JSON.stringify({
        nome: "Teste Contato",
        email: "ale.gomessilva97@gmail.com", // Mude para seu e-mail de teste
        telefone: "(11) 99999-0000",
        servico: "Website Institucional",
        mensagem: "Solicitação de orçamento"
      })
    }
  };

  // Para testar corretamente, deve ser só a linha acima adicionada
  Logger.log(doPost(fakeEvent).getContent());
}
