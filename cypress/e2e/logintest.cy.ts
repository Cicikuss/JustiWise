describe('Login Sayfası Testi', () => {
  beforeEach(() => {
   
    cy.visit('/login');
  });

  it('Login formu render ediliyor', () => {
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('Geçerli bilgilerle giriş yapılabiliyor', () => {
    cy.get('input[name="email"]').type('ahmetbyk49@gmail.com');
    cy.get('input[name="password"]').type('Hardalla!2002');
    cy.get('button[type="submit"]').click();

    // Girişten sonra yönlendirme kontrolü
    cy.url().should('include', '/');

  });

 it('Geçersiz bilgilerle toast mesajı gösteriliyor', () => {
    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('wrongpass');
    cy.get('button[type="submit"]').click();

    // Toastify mesajının DOM'da çıktığını kontrol et
    cy.get('.Toastify__toast--error')
      .should('be.visible')
      .and('contain', 'Invalid login credentials'); // Hatanın içeriği
  });
});
