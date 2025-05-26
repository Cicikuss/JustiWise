// cypress/e2e/courtroomPage.cy.ts

describe('CourtroomPage Bileşeni Testleri', () => {
  beforeEach(() => {
    // 1. Kullanıcı girişi yap
    cy.login(); // Assuming you have a login command

    // 2. Mahkeme Simülasyonu sayfasına git
    // URL'niz http://localhost:3000/courtroom ise burayı ayarlayın
    cy.visit('/courtroom');

    // 3. Sayfanın yüklendiğinden ve ana başlığın göründüğünden emin ol
    cy.contains('h4', 'Mahkeme Simülasyonu').should('be.visible');
  });

  // Test 1: Başlangıç durumunu kontrol et
  it('Başlangıçtaki UI elemanlarını doğru şekilde göstermeli', () => {
    cy.contains('h4', 'Mahkeme Simülasyonu').should('be.visible');
    cy.contains('Rolünüzü seçin ve duruşmayı başlatın.').should('be.visible');

    // Rol seçim radyo butonlarını kontrol et
    cy.get('input[type="radio"][value="Sanık"]').should('be.visible');
    cy.get('input[type="radio"][value="Avukat"]').should('be.visible');
    cy.get('input[type="radio"][value="Tanık"]').should('be.visible');

    // "Duruşmayı Başlat" butonu başlangıçta devre dışı olmalı
    cy.contains('button', 'Duruşmayı Başlat').should('be.disabled');

    // "Duruşma Kaydı" bölümü başlangıçta görünmemeli
    cy.contains('Duruşma Kaydı').should('not.exist');
    cy.contains('Cevapla').should('not.exist');
  });

  // Test 2: Rol seçimi "Duruşmayı Başlat" butonunu etkinleştirmeli
  it('Bir rol seçildiğinde "Duruşmayı Başlat" butonunu etkinleştirmeli', () => {
    // "Sanık" rolünü seç
    cy.get('input[type="radio"][value="Sanık"]').check();
    cy.contains('button', 'Duruşmayı Başlat').should('be.enabled');

    // Farklı bir rol seçerek tekrar kontrol et
    cy.get('input[type="radio"][value="Avukat"]').check();
    cy.contains('button', 'Duruşmayı Başlat').should('be.enabled');
  });

  // Test 3: Duruşmayı başlatma ve ilk logları kontrol etme
  it('Duruşmayı Başlat butonuna tıklandığında simülasyonu başlatmalı ve ilk logları göstermeli', () => {
    const selectedRole = 'Avukat';
    cy.get(`input[type="radio"][value="${selectedRole}"]`).check();
    cy.contains('button', 'Duruşmayı Başlat').click();

    // UI değişikliklerini kontrol et
    cy.contains('Rolünüzü seçin ve duruşmayı başlatın.').should('not.exist'); // Eski metin kaybolmalı
    cy.contains('Duruşma Kaydı').should('be.visible'); // Yeni bölüm görünmeli

    // İlk logları kontrol et
    // Logların listelendiği Box'ı seçelim ve içindeki Typography (p) elementlerini kontrol edelim
    cy.get('div[style*="max-height: 300px"] p').eq(0).should('have.text', 'Hakim: Duruşma başlamıştır.');
    cy.get('div[style*="max-height: 300px"] p').eq(1).should('have.text', `Hakim: ${selectedRole} hazır mısınız?`);

    // "Cevapla" butonu görünür ve etkin olmalı
    cy.contains('button', 'Cevapla').should('be.enabled');
  });

  // Test 4: Cevaplama ve butonun devre dışı kalması
  it('Cevapla butonuna tıklandığında loglara yanıt eklemeli ve butonu devre dışı bırakmalı', () => {
    const selectedRole = 'Tanık';
    cy.get(`input[type="radio"][value="${selectedRole}"]`).check();
    cy.contains('button', 'Duruşmayı Başlat').click();

    // "Cevapla" butonuna tıkla
    cy.contains('button', 'Cevapla').click();

    // Yeni logun eklenmiş olduğunu kontrol et
    cy.get('div[style*="max-height: 300px"] p').eq(2).should('have.text', `${selectedRole}: Hazırım, Sayın Hakim.`);

    // "Cevapla" butonu artık devre dışı olmalı
    cy.contains('button', 'Cevapla').should('be.disabled');

    // Tekrar tıklama girişiminde bulun ve yeni log eklenmediğini doğrula
    cy.contains('button', 'Cevapla').click(); // Devre dışı olduğu için bir etkisi olmamalı
    cy.get('div[style*="max-height: 300px"] p').should('have.length', 3); // Log sayısı hala 3 olmalı
  });

  // Test 5: Tüm roller için simülasyon akışını kontrol etme
  ['Sanık', 'Avukat', 'Tanık'].forEach((role) => {
    it(`should correctly simulate the process for the role: ${role}`, () => {
      cy.get(`input[type="radio"][value="${role}"]`).check();
      cy.contains('button', 'Duruşmayı Başlat').click();

      // Hakimin ilk mesajını kontrol et
      cy.get('div[style*="max-height: 300px"] p').eq(1).should('have.text', `Hakim: ${role} hazır mısınız?`);

      // Cevapla butonuna tıkla
      cy.contains('button', 'Cevapla').click();

      // Rolün yanıtını kontrol et
      cy.get('div[style*="max-height: 300px"] p').eq(2).should('have.text', `${role}: Hazırım, Sayın Hakim.`);

      // Cevapla butonunun devre dışı olduğunu kontrol et
      cy.contains('button', 'Cevapla').should('be.disabled');

      // Toplam log sayısının 3 olduğunu doğrula
      cy.get('div[style*="max-height: 300px"] p').should('have.length', 3);
    });
  });

  it('Duruşmayı Başlat butonuna tıklandığında simülasyonu başlatmalı ve ilk logları göstermeli', () => {
  const selectedRole = 'Avukat';
  cy.get(`input[type="radio"][value="${selectedRole}"]`).check();
  cy.contains('button', 'Duruşmayı Başlat').click();

  // UI'ın tamamen değişmesini ve logların görünmesini beklemek için (en sağlam yol)
  cy.contains('Duruşma Kaydı').should('be.visible'); // Yeni başlığın görünmesini bekle
  cy.pause(); // <<< BURAYA EKLEYİN VE DOM'U İNCELEYİN

  // İlk logları kontrol et
  cy.get('div[style*="max-height: 300px"] p').eq(0).should('have.text', 'Hakim: Duruşma başlamıştır.');
  // ...
});
});