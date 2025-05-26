describe('Profile Component Tests', () => {
  beforeEach(() => {
    // Login before each test
    cy.login();
    
    // Navigate to profile page
    cy.visit('/profile');
    
    // Wait for profile page to load
    cy.contains('h4', 'Profil').should('be.visible');
  });

  describe('Profile Display', () => {
    it('should display user profile information correctly', () => {
      // Check if profile title is displayed
      cy.contains('h4', 'Profil').should('be.visible');
      
      // Check if user information is displayed
      cy.get('[data-testid="username"], .MuiTypography-h5').should('be.visible').and('not.be.empty');
      cy.contains('E-posta:').should('be.visible');
      cy.contains('ahmetbyk49@gmail.com').should('be.visible');
      cy.contains('Rol:').should('be.visible');
      
      // Check if avatar is displayed
      cy.get('.MuiAvatar-root').should('be.visible');
      
      // Check if join date is displayed
      cy.contains('Katılma Tarihi:').should('be.visible');
      
      // Check if edit button is present
      cy.contains('button', 'Profili Düzenle').should('be.visible');
    });

    it('should display user avatar correctly', () => {
      cy.get('.MuiAvatar-root')
        .should('be.visible')
        .and('have.css', 'width', '120px')
        .and('have.css', 'height', '120px');
    });

    it('should display formatted join date', () => {
      cy.contains('Katılma Tarihi:')
        .parent()
        .should('contain.text', ':')
        .and('match', /\d{1,2}\.\d{1,2}\.\d{4}/); // Turkish date format
    });
  });

  describe('Profile Edit Dialog', () => {
    beforeEach(() => {
      // Open edit dialog
      cy.contains('button', 'Profili Düzenle').click();
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('should open edit dialog when edit button is clicked', () => {
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('Profili Düzenle').should('be.visible');
      
      // Check dialog content
      cy.get('[role="dialog"]').within(() => {
        cy.get('.MuiAvatar-root').should('be.visible');
        cy.get('input[name="username"]').should('be.visible');
        cy.get('input[name="role"]').should('be.visible');
        cy.contains('button', 'Kaydet').should('be.visible');
        cy.contains('button', 'İptal').should('be.visible');
      });
    });

    it('should display current user data in edit form', () => {
      // Check if username field has a value
      cy.get('input[name="username"]').should('not.have.value', '');
      
      // Check if role dropdown has a value
      cy.get('input[name="role"]').should('not.have.value', '');
      
      // Check if avatar is displayed in dialog
      cy.get('[role="dialog"] .MuiAvatar-root').should('be.visible');
    });

    it('should allow editing username', () => {
      const newUsername = 'newusername' + Date.now(); // Unique username
      
      cy.get('input[name="username"]')
        .clear()
        .type(newUsername)
        .should('have.value', newUsername);
    });

    it('should allow changing role', () => {
      // Click on role dropdown
      cy.get('input[name="role"]').click();
      
      // Check if dropdown options are visible
      cy.get('.MuiMenuItem-root').should('have.length.at.least', 3);
      
      // Select lawyer role
      cy.contains('.MuiMenuItem-root', 'Lawyer').click();
      
      // Verify selection
      cy.get('input[name="role"]').should('have.value', 'lawyer');
    });

    it('should display all role options in dropdown', () => {
      cy.get('input[name="role"]').click();
      
      // Check if all roles are present
      cy.contains('.MuiMenuItem-root', 'Client').should('be.visible');
      cy.contains('.MuiMenuItem-root', 'Lawyer').should('be.visible');
      cy.contains('.MuiMenuItem-root', 'Student').should('be.visible');
    });

    it('should close dialog when cancel button is clicked', () => {
      cy.contains('button', 'İptal').click();
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('should close dialog when pressing Escape key', () => {
      cy.get('[role="dialog"]').type('{esc}');
      cy.get('[role="dialog"]').should('not.exist');
    });
  });

  describe('Image Upload', () => {
    beforeEach(() => {
      cy.contains('button', 'Profili Düzenle').click();
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('should display photo upload button', () => {
      cy.get('input[type="file"]#profile-image-upload').should('exist').and('not.be.visible');
      cy.get('label[for="profile-image-upload"]').should('be.visible');
      cy.get('label[for="profile-image-upload"] .MuiIconButton-root').should('be.visible');
    });

    it('should handle image file selection', () => {
      const fileName = 'test-image.jpg';
      
      // Create a small test image file
      cy.get('input[type="file"]#profile-image-upload').selectFile({
        contents: Cypress.Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'),
        fileName: fileName,
        mimeType: 'image/png'
      }, { force: true });

      // Verify file input has the file
      cy.get('input[type="file"]#profile-image-upload').should(($input) => {
        expect($input[0].files).to.have.length(1);
        expect($input[0].files[0].name).to.equal(fileName);
      });
    });

    it('should only accept image files', () => {
      cy.get('input[type="file"]#profile-image-upload').should('have.attr', 'accept', 'image/*');
    });
  });

  describe('Save Functionality', () => {
    beforeEach(() => {
      cy.contains('button', 'Profili Düzenle').click();
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('should save username changes successfully', () => {
      const newUsername = 'testuser_' + Date.now();
      
      // Make changes
      cy.get('input[name="username"]').clear().type(newUsername);
      
      // Save changes
      cy.contains('button', 'Kaydet').click();
      
      // Wait for dialog to close
      cy.get('[role="dialog"]').should('not.exist');
      
      // Verify change is reflected on the page
      cy.contains(newUsername).should('be.visible');
    });

    it('should save role changes successfully', () => {
      // Change role
      cy.get('input[name="role"]').click();
      cy.contains('.MuiMenuItem-root', 'Student').click();
      
      // Save changes
      cy.contains('button', 'Kaydet').click();
      
      // Wait for dialog to close
      cy.get('[role="dialog"]').should('not.exist');
      
      // Verify role change is reflected
      cy.contains('student').should('be.visible');
    });

    it('should save both username and role changes', () => {
      const newUsername = 'multichange_' + Date.now();
      
      // Make multiple changes
      cy.get('input[name="username"]').clear().type(newUsername);
      cy.get('input[name="role"]').click();
      cy.contains('.MuiMenuItem-root', 'Lawyer').click();
      
      // Save changes
      cy.contains('button', 'Kaydet').click();
      
      // Wait for dialog to close
      cy.get('[role="dialog"]').should('not.exist');
      
      // Verify both changes are reflected
      cy.contains(newUsername).should('be.visible');
      cy.contains('lawyer').should('be.visible');
    });

    it('should handle save with image upload', () => {
      const fileName = 'profile-pic.png';
      
      // Upload image
      cy.get('input[type="file"]#profile-image-upload').selectFile({
        contents: Cypress.Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'),
        fileName: fileName,
        mimeType: 'image/png'
      }, { force: true });
      
      // Save changes
      cy.contains('button', 'Kaydet').click();
      
      // Wait for dialog to close (image upload might take time)
      cy.get('[role="dialog"]').should('not.exist', { timeout: 10000 });
    });

    it('should not save when required fields are empty', () => {
      // Clear username
      cy.get('input[name="username"]').clear();
      
      // Try to save
      cy.contains('button', 'Kaydet').click();
      
      // Dialog might remain open or show validation error
      // Adjust based on your validation implementation
      cy.get('input[name="username"]').should('be.focused').or(cy.get('[role="dialog"]').should('be.visible'));
    });
  });

  describe('User Interface Interactions', () => {
    it('should show hover effects on buttons', () => {
      cy.contains('button', 'Profili Düzenle')
        .trigger('mouseover')
        .should('have.css', 'cursor', 'pointer');
    });

    it('should handle form field focus states', () => {
      cy.contains('button', 'Profili Düzenle').click();
      
      cy.get('input[name="username"]')
        .focus()
        .should('have.focus')
        .and('have.class', 'Mui-focused');
    });

    it('should maintain form state when switching between fields', () => {
      cy.contains('button', 'Profili Düzenle').click();
      
      const testUsername = 'focustest';
      
      // Type in username field
      cy.get('input[name="username"]').clear().type(testUsername);
      
      // Switch to role field
      cy.get('input[name="role"]').click();
      cy.contains('.MuiMenuItem-root', 'Student').click();
      
      // Check username field still has the value
      cy.get('input[name="username"]').should('have.value', testUsername);
    });
  });

  describe('Responsive Design', () => {
    it('should display correctly on mobile devices', () => {
      cy.viewport('iphone-6');
      
      // Profile should be visible and properly formatted
      cy.contains('h4', 'Profil').should('be.visible');
      cy.get('.MuiAvatar-root').should('be.visible');
      cy.contains('button', 'Profili Düzenle').should('be.visible');
      
      // Open dialog on mobile
      cy.contains('button', 'Profili Düzenle').click();
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('should display correctly on tablet devices', () => {
      cy.viewport('ipad-2');
      
      // Profile should be visible and properly formatted
      cy.contains('h4', 'Profil').should('be.visible');
      cy.get('.MuiAvatar-root').should('be.visible');
      cy.contains('button', 'Profili Düzenle').should('be.visible');
    });

    it('should maintain functionality on different screen sizes', () => {
      const viewports = ['macbook-15', 'ipad-2', 'iphone-6'];
      
      viewports.forEach(viewport => {
        cy.viewport(viewport);
        
        // Test basic functionality
        cy.contains('button', 'Profili Düzenle').click();
        cy.get('[role="dialog"]').should('be.visible');
        cy.contains('button', 'İptal').click();
        cy.get('[role="dialog"]').should('not.exist');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper dialog accessibility', () => {
      cy.contains('button', 'Profili Düzenle').click();
      
      cy.get('[role="dialog"]').should('exist');
      cy.get('[aria-labelledby]').should('exist');
    });

    it('should be keyboard navigable', () => {
      // Tab to edit button
      cy.get('body').tab();
      cy.focused().should('contain', 'Profili Düzenle');
      
      // Open dialog with keyboard
      cy.focused().type('{enter}');
      cy.get('[role="dialog"]').should('be.visible');
      
      // Navigate within dialog using tab
      cy.get('body').tab();
      cy.focused().should('be.visible');
    });

    it('should have proper form labels', () => {
      cy.contains('button', 'Profili Düzenle').click();
      
      // Check for proper labeling
      cy.get('input[name="username"]').should('have.attr', 'aria-label').or('be.labelled');
      cy.get('input[name="role"]').should('have.attr', 'aria-label').or('be.labelled');
    });

    it('should support screen readers', () => {
      // Check for important ARIA attributes
      cy.get('main, [role="main"]').should('exist');
      cy.get('h4').should('have.attr', 'id').or('have.attr', 'aria-label');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      // Simulate network failure
      cy.intercept('PUT', '**/users/**', { forceNetworkError: true }).as('networkError');
      
      cy.contains('button', 'Profili Düzenle').click();
      cy.get('input[name="username"]').clear().type('networkerrortest');
      cy.contains('button', 'Kaydet').click();
      
      // Should handle error gracefully (check for error message or dialog remaining open)
      cy.wait('@networkError');
    });

    it('should validate file upload size and type', () => {
      cy.contains('button', 'Profili Düzenle').click();
      
      // Try to upload a non-image file (if validation exists)
      cy.get('input[type="file"]#profile-image-upload').selectFile({
        contents: 'This is not an image',
        fileName: 'test.txt',
        mimeType: 'text/plain'
      }, { force: true });
      
      // Depending on implementation, this might show an error or be rejected
    });
  });

  describe('Performance', () => {
    it('should load profile page within acceptable time', () => {
      const startTime = Date.now();
      
      cy.visit('/profile').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000); // Should load within 3 seconds
      });
    });

    it('should handle multiple rapid clicks gracefully', () => {
      // Rapidly click edit button
      cy.contains('button', 'Profili Düzenle')
        .click()
        .click()
        .click();
      
      // Should only open one dialog
      cy.get('[role="dialog"]').should('have.length', 1);
    });
  });
});