export {};

declare global {
  interface Window {
    IS_E2E_TEST?: boolean;
  }
}

describe('Register Page E2E Test', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.visit('/register?type=signup', {
      onBeforeLoad(win) {
        (win as any).IS_E2E_TEST = true;
      },
    });

    cy.get('app-register', { timeout: 10000 }).should('exist');

    cy.get('app-register').then(($el) => {
      const comp = ($el[0] as any).__ngContext__?.[8];
      comp?.enableTestingMode?.();
    });
  });

  it('should register new user successfully', () => {
    const uniqueSuffix = Date.now();
    const username = `testuser${uniqueSuffix}`;
    const email = `test${uniqueSuffix}@gmail.com`;

    cy.intercept('POST', '**/api/v1/auth/register').as('registerRequest');

    cy.get('form[data-cy="register-form"]').should('be.visible');

    cy.get('[data-cy="register-username-input"]').type(username);
    cy.get('[data-cy="register-email-input"]').type(email);
    cy.get('[data-cy="register-password-input"]').type('Password123!');
    cy.get('[data-cy="register-agree-terms-checkbox"]').check({ force: true });

    cy.get('[data-cy="register-submit-button"]').click();

    cy.wait('@registerRequest', { timeout: 10000 }).then((interception) => {
      expect(interception).to.have.property('response');
    });
  });
});
