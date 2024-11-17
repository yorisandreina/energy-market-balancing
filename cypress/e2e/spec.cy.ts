// A solid test generally covers 3 phases:

// Set up the application state.
// Take an action.
// Make an assertion about the resulting application state.
// You might also see this phrased as "Given, When, Then", or "Arrange, Act, Assert". 
// But the idea is: First you put the application into a specific state, 
// then you take some action in the application that causes it to change, 
// and finally you check the resulting application state.

describe('My First Test', () => {
  it('Visits the Kitchen Sink', () => {
    cy.visit('https://example.cypress.io');
  });
});
