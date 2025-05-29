describe('JustiWise Chat', () => {
  beforeEach(() => {
    cy.login(); // Giriş yapma komutunu kullan
    cy.visit('/qa'); // Uygulamanın çalıştığı route
  });

  it('Should load the chat interface with welcome message', () => {
    cy.contains('JustiWise Chat');
    cy.contains('Merhaba! Ben JustiWise asistanıyım');
  });

  it('Should allow user to type and send a message', () => {
    const userMessage = 'Merhaba AI!';
    cy.get('textarea').type(userMessage);
    cy.get('button').contains('Gönder').click(); // Eğer "Gönder" yerine sadece ikon varsa alternatif aşağıda
    cy.contains(userMessage);
  });

  it('Should allow file to be attached and previewed', () => {
    const fileName = 'example.txt';
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('Bu test dosyasıdır'),
      fileName,
      mimeType: 'text/plain',
      lastModified: Date.now(),
    });

    cy.contains(fileName);
  });

  it('Should send message with attached file and show AI response placeholder', () => {
    const message = 'Lütfen bu dosyayı analiz et';
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('Dosya içeriği'),
      fileName: 'dosya.txt',
      mimeType: 'text/plain',
    });

    cy.get('textarea').type(message);
    cy.get('button').last().click(); // send button (icon)

    // Kullanıcı mesajları ve dosya görünüyor mu?
    cy.contains('dosya.txt');
    cy.contains(message);

    // Cevap yükleniyor simgesi
    cy.get('[role="progressbar"]').should('exist');
  });
});
