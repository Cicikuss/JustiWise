describe('Document Summary Chat Tests', () => {
  beforeEach(() => {
    // Login before each test
    cy.login();
    
    // Navigate to document summary chat page
    cy.visit('/summarize'); // URL'yi projenize göre güncelleyin
    
    // Wait for page to load
    cy.contains('📤 Belge Yükle').should('be.visible');
  });

  describe('Initial Page Load', () => {
    it('should display all main components', () => {
      // Check document upload section
      cy.contains('📤 Belge Yükle').should('be.visible');
      cy.contains('button', 'Belge Seç (.pdf, .docx)').should('be.visible');
      
      // Check AI summary section
      cy.contains('📄 AI Özet').should('be.visible');
      cy.contains('📄 Henüz bir belge yüklenmedi.').should('be.visible');
      
      // Check message input section
      cy.get('textarea[placeholder*="Belge hakkında soru sorun"]').should('be.visible');
      cy.contains('button', 'Gönder').should('be.visible').and('be.disabled');
      
      // Check message history area exists
      cy.get('[data-testid="message-history"]').should('exist')
        .or(cy.get('.MuiPaper-root').contains('max-height').should('exist'));
    });

    it('should have proper initial state', () => {
      // Summary should show initial message
      cy.contains('📄 Henüz bir belge yüklenmedi.').should('be.visible');
      
      // Message input should be empty
      cy.get('textarea[placeholder*="Belge hakkında soru sorun"]').should('have.value', '');
      
      // Send button should be disabled
      cy.contains('button', 'Gönder').should('be.disabled');
      
      // No messages should be displayed initially
      cy.get('.MuiBox-root[style*="background-color"]').should('not.exist');
    });

    it('should display upload icon in button', () => {
      cy.get('button').contains('Belge Seç')
        .find('svg')
        .should('exist');
    });
  });

  describe('File Upload Functionality', () => {
    it('should handle PDF file upload', () => {
      const fileName = 'test-document.pdf';
      
      // Create a mock PDF file
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('Mock PDF content'),
        fileName: fileName,
        mimeType: 'application/pdf'
      }, { force: true });
      
      // Check if file name is displayed
      cy.contains(`Seçilen belge: ${fileName}`).should('be.visible');
      
      // Check if loading message appears
      cy.contains('⏳ AI özet çıkarıyor...').should('be.visible');
      
      // Wait for summary to load
      cy.contains(`📄 Yüklenen belge: ${fileName}`, { timeout: 2000 }).should('be.visible');
      cy.contains('AI tarafından çıkarılan özet').should('be.visible');
    });

    it('should handle DOCX file upload', () => {
      const fileName = 'test-document.docx';
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('Mock DOCX content'),
        fileName: fileName,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }, { force: true });
      
      cy.contains(`Seçilen belge: ${fileName}`).should('be.visible');
      cy.contains('⏳ AI özet çıkarıyor...').should('be.visible');
      cy.contains(`📄 Yüklenen belge: ${fileName}`, { timeout: 2000 }).should('be.visible');
    });

    it('should handle DOC file upload', () => {
      const fileName = 'test-document.doc';
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('Mock DOC content'),
        fileName: fileName,
        mimeType: 'application/msword'
      }, { force: true });
      
      cy.contains(`Seçilen belge: ${fileName}`).should('be.visible');
      cy.contains('⏳ AI özet çıkarıyor...').should('be.visible');
    });

    it('should accept only specified file types', () => {
      cy.get('input[type="file"]').should('have.attr', 'accept', '.pdf,.doc,.docx');
    });

    it('should update summary content after file upload', () => {
      const fileName = 'legal-document.pdf';
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('Legal document content'),
        fileName: fileName,
        mimeType: 'application/pdf'
      }, { force: true });
      
      // Wait for summary to update
      cy.contains('hukuk sisteminde yer alan kavramlar', { timeout: 2000 }).should('be.visible');
      cy.contains('AI tarafından çıkarılan özet').should('be.visible');
    });

    it('should handle multiple file uploads', () => {
      // Upload first file
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('First document'),
        fileName: 'first.pdf',
        mimeType: 'application/pdf'
      }, { force: true });
      
      cy.contains('Seçilen belge: first.pdf').should('be.visible');
      
      // Upload second file (should replace first)
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('Second document'),
        fileName: 'second.pdf',
        mimeType: 'application/pdf'
      }, { force: true });
      
      cy.contains('Seçilen belge: second.pdf').should('be.visible');
      cy.contains('Seçilen belge: first.pdf').should('not.exist');
    });
  });

  describe('Chat Functionality', () => {
    beforeEach(() => {
      // Upload a file first for chat functionality
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('Test document content'),
        fileName: 'test.pdf',
        mimeType: 'application/pdf'
      }, { force: true });
      
      // Wait for file to be processed
      cy.contains('📄 Yüklenen belge: test.pdf', { timeout: 2000 }).should('be.visible');
    });

    it('should enable send button when message is typed', () => {
      const message = 'Bu belge hakkında ne düşünüyorsun?';
      
      // Initially disabled
      cy.contains('button', 'Gönder').should('be.disabled');
      
      // Type message
      cy.get('textarea[placeholder*="Belge hakkında soru sorun"]').type(message);
      
      // Should be enabled
      cy.contains('button', 'Gönder').should('not.be.disabled');
    });

    it('should send user message and receive AI response', () => {
      const userMessage = 'Bu belgede hangi konular var?';
      
      // Type and send message
      cy.get('textarea[placeholder*="Belge hakkında soru sorun"]').type(userMessage);
      cy.contains('button', 'Gönder').click();
      
      // Check user message appears
      cy.contains(userMessage).should('be.visible');
      cy.get('.MuiBox-root[style*="background-color: rgb(25, 118, 210)"]')
        .should('contain.text', userMessage);
      
      // Wait for AI response
      cy.contains('AI cevabı:', { timeout: 1000 }).should('be.visible');
      cy.get('.MuiBox-root[style*="background-color: rgb(224, 224, 224)"]')
        .should('contain.text', 'AI cevabı:');
      
      // Input should be cleared
      cy.get('textarea[placeholder*="Belge hakkında soru sorun"]').should('have.value', '');
    });

    it('should handle multiple messages in conversation', () => {
      const messages = [
        'İlk sorum bu',
        'İkinci sorum da bu',
        'Üçüncü ve son sorum'
      ];
      
      messages.forEach((message, index) => {
        cy.get('textarea[placeholder*="Belge hakkında soru sorun"]').type(message);
        cy.contains('button', 'Gönder').click();
        
        // Wait for AI response before sending next message
        if (index < messages.length - 1) {
          cy.contains('AI cevabı:', { timeout: 1000 }).should('be.visible');
        }
      });
      
      // Check all messages are displayed
      messages.forEach(message => {
        cy.contains(message).should('be.visible');
      });
      
      // Should have 6 message boxes (3 user + 3 AI)
      cy.get('.MuiBox-root[style*="background-color"]').should('have.length', 6);
    });

    it('should not send empty messages', () => {
      // Try to send empty message
      cy.contains('button', 'Gönder').should('be.disabled');
      
      // Try with only whitespace
      cy.get('textarea[placeholder*="Belge hakkında soru sorun"]').type('   ');
      cy.contains('button', 'Gönder').should('be.disabled');
      
      // Clear and try with actual content
      cy.get('textarea[placeholder*="Belge hakkında soru sorun"]').clear().type('Gerçek mesaj');
      cy.contains('button', 'Gönder').should('not.be.disabled');
    });

    it('should handle long messages', () => {
      const longMessage = 'Bu çok uzun bir mesaj. '.repeat(20);
      
      cy.get('textarea[placeholder*="Belge hakkında soru sorun"]').type(longMessage);
      cy.contains('button', 'Gönder').click();
      
      // Message should be displayed with proper styling
      cy.contains(longMessage.substring(0, 50)).should('be.visible');
      
      // Should have max-width styling
      cy.get('.MuiBox-root[style*="max-width: 70%"]').should('exist');
    });

    it('should scroll message history when many messages', () => {
      // Send multiple messages to test scrolling
      for (let i = 1; i <= 8; i++) {
        cy.get('textarea[placeholder*="Belge hakkında soru sorun"]').type(`Mesaj ${i}`);
        cy.contains('button', 'Gönder').click();
        cy.contains('AI cevabı:', { timeout: 1000 }).should('be.visible');
      }
      
      // Check if message container has scroll
      cy.get('.MuiPaper-root[style*="max-height"]').should('exist');
      cy.get('.MuiPaper-root[style*="overflow-y: auto"]').should('exist');
    });
  });

  describe('Alert and Warning Messages', () => {
    it('should show warning when trying to send message without uploading file', () => {
      const message = 'Bu mesajı dosya yüklemeden göndermeye çalışıyorum';
      
      // Type message
      cy.get('textarea[placeholder*="Belge hakkında soru sorun"]').type(message);
      cy.contains('button', 'Gönder').click();
      
      // Should show warning alert
      cy.contains('Önce bir belge yüklemelisiniz!').should('be.visible');
      cy.get('.MuiAlert-root[role="alert"]').should('be.visible');
      
      // Message should not be sent
      cy.get('.MuiBox-root[style*="background-color: rgb(25, 118, 210)"]').should('not.exist');
    });

    it('should auto-hide warning alert after 3 seconds', () => {
      cy.get('textarea[placeholder*="Belge hakkında soru sorun"]').type('Test mesajı');
      cy.contains('button', 'Gönder').click();
      
      // Alert should be visible
      cy.contains('Önce bir belge yüklemelisiniz!').should('be.visible');
      
      // Wait for auto-hide
      cy.contains('Önce bir belge yüklemelisiniz!', { timeout: 4000 }).should('not.exist');
    });

    it('should close warning alert when close button is clicked', () => {
      cy.get('textarea[placeholder*="Belge hakkında soru sorun"]').type('Test mesajı');
      cy.contains('button', 'Gönder').click();
      
      // Alert should be visible
      cy.contains('Önce bir belge yüklemelisiniz!').should('be.visible');
      
      // Click close button
      cy.get('.MuiAlert-root button').click();
      
      // Alert should be hidden
      cy.contains('Önce bir belge yüklemelisiniz!').should('not.exist');
    });
  });

  describe('User Interface and Styling', () => {
    it('should display user and AI messages with different styles', () => {
      // Upload file and send message
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('Test content'),
        fileName: 'test.pdf',
        mimeType: 'application/pdf'
      }, { force: true });
      
      cy.contains('📄 Yüklenen belge: test.pdf', { timeout: 2000 }).should('be.visible');
      
      cy.get('textarea[placeholder*="Belge hakkında soru sorun"]').type('Test mesajı');
      cy.contains('button', 'Gönder').click();
      
      // Wait for both messages
      cy.contains('AI cevabı:', { timeout: 1000 }).should('be.visible');
      
      // Check user message styling (blue background, white text, right-aligned)
      cy.get('.MuiBox-root[style*="background-color: rgb(25, 118, 210)"]')
        .should('have.css', 'color', 'rgb(255, 255, 255)')
        .and('have.css', 'align-self', 'flex-end');
      
      // Check AI message styling (gray background, black text, left-aligned)
      cy.get('.MuiBox-root[style*="background-color: rgb(224, 224, 224)"]')
        .should('have.css', 'color', 'rgb(0, 0, 0)')
        .and('have.css', 'align-self', 'flex-start');
    });

    it('should have proper card layout and spacing', () => {
      // Check cards have proper elevation and spacing
      cy.get('.MuiCard-root').should('have.length.at.least', 2);
      cy.get('.MuiCardHeader-root').should('contain', '📤 Belge Yükle');
      cy.get('.MuiCardHeader-root').should('contain', '📄 AI Özet');
      
      // Check proper spacing between sections
      cy.get('.MuiBox-root[maxwidth="md"]').should('exist');
    });

    it('should handle textarea multiline properly', () => {
      cy.get('textarea[placeholder*="Belge hakkında soru sorun"]')
        .should('have.attr', 'rows')
        .and('match', /\d+/);
      
      // Test multiline input
      const multilineText = 'İlk satır\nİkinci satır\nÜçüncü satır';
      cy.get('textarea[placeholder*="Belge hakkında soru sorun"]').type(multilineText);
      cy.get('textarea[placeholder*="Belge hakkında soru sorun"]').should('contain.value', 'İlk satır');
    });
  });

  describe('Responsive Design', () => {
    it('should work properly on mobile devices', () => {
      cy.viewport('iphone-6');
      
      // All main components should be visible
      cy.contains('📤 Belge Yükle').should('be.visible');
      cy.contains('📄 AI Özet').should('be.visible');
      cy.get('textarea[placeholder*="Belge hakkında soru sorun"]').should('be.visible');
      
      // Test file upload on mobile
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('Mobile test'),
        fileName: 'mobile.pdf',
        mimeType: 'application/pdf'
      }, { force: true });
      
      cy.contains('Seçilen belge: mobile.pdf').should('be.visible');
    });

    it('should work properly on tablet devices', () => {
      cy.viewport('ipad-2');
      
      // Test full functionality on tablet
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('Tablet test'),
        fileName: 'tablet.pdf',
        mimeType: 'application/pdf'
      }, { force: true });
      
      cy.contains('📄 Yüklenen belge: tablet.pdf', { timeout: 2000 }).should('be.visible');
      
      cy.get('textarea[placeholder*="Belge hakkında soru sorun"]').type('Tablet mesajı');
      cy.contains('button', 'Gönder').click();
      
      cy.contains('Tablet mesajı').should('be.visible');
    });

    it('should maintain proper layout on different screen sizes', () => {
      const viewports = ['macbook-15', 'ipad-2', 'iphone-6'];
      
      viewports.forEach(viewport => {
        cy.viewport(viewport);
        
        // Check layout integrity
        cy.get('.MuiBox-root[maxwidth="md"]').should('be.visible');
        cy.contains('button', 'Belge Seç (.pdf, .docx)').should('be.visible');
        cy.get('textarea[placeholder*="Belge hakkında soru sorun"]').should('be.visible');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      // Check for proper roles
      cy.get('[role="alert"]').should('not.exist'); // Initially no alerts
      
      // Check form accessibility
      cy.get('textarea[placeholder*="Belge hakkında soru sorun"]')
        .should('have.attr', 'aria-label')
        .or('be.labelled');
      
      // Check button accessibility
      cy.contains('button', 'Gönder').should('be.visible');
      cy.contains('button', 'Belge Seç').should('be.visible');
    });

    it('should be keyboard navigable', () => {
      // Tab through interactive elements
      cy.get('body').tab();
      cy.focused().should('contain', 'Belge Seç').or('be.visible');
      
      cy.get('body').tab();
      cy.focused().should('have.attr', 'placeholder').or('be.visible');
      
      cy.get('body').tab();
      cy.focused().should('contain', 'Gönder').or('be.visible');
    });

    it('should support screen readers with proper headings', () => {
      // Check for proper heading structure
      cy.get('h1, h2, h3, h4, h5, h6, .MuiCardHeader-title').should('exist');
      
      // Check for proper content structure
      cy.contains('📤 Belge Yükle').should('be.visible');
      cy.contains('📄 AI Özet').should('be.visible');
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle rapid button clicks gracefully', () => {
      // Upload file first
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('Performance test'),
        fileName: 'perf.pdf',
        mimeType: 'application/pdf'
      }, { force: true });
      
      cy.contains('📄 Yüklenen belge: perf.pdf', { timeout: 2000 }).should('be.visible');
      
      // Type message and rapidly click send
      cy.get('textarea[placeholder*="Belge hakkında soru sorun"]').type('Hızlı tıklama testi');
      
      cy.contains('button', 'Gönder')
        .click()
        .click()
        .click();
      
      // Should only send one message
      cy.get('.MuiBox-root[style*="background-color: rgb(25, 118, 210)"]')
        .should('have.length', 1);
    });

    it('should handle large file names properly', () => {
      const longFileName = 'very-long-file-name-that-might-cause-layout-issues-in-the-ui-component.pdf';
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('Long name test'),
        fileName: longFileName,
        mimeType: 'application/pdf'
      }, { force: true });
      
      // Should display truncated or wrapped filename
      cy.contains('Seçilen belge:').should('be.visible');
      cy.contains(longFileName.substring(0, 20)).should('be.visible');
    });

    it('should maintain state during rapid interactions', () => {
      // Upload file
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('State test'),
        fileName: 'state.pdf',
        mimeType: 'application/pdf'
      }, { force: true });
      
      // Rapidly type and clear message multiple times
      const message = 'Test mesajı';
      for (let i = 0; i < 3; i++) {
        cy.get('textarea[placeholder*="Belge hakkında soru sorun"]')
          .type(message)
          .clear();
      }
      
      // Final message
      cy.get('textarea[placeholder*="Belge hakkında soru sorun"]').type(message);
      cy.contains('button', 'Gönder').should('not.be.disabled');
    });
  });
});