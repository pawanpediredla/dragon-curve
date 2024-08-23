describe('My Dragon Curve E2E', () => {
    it('should load and display correctly', () => {
      cy.visit('/');
      cy.get('canvas').should('be.visible');
    });
  });
  