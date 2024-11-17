describe('Fetch and Display Balancing Circles', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/v1/balancing', {
      statusCode: 200,
      body: [
        {
          name: 'Group A',
          members: [
            { id: '1', name: 'Member 1', type: 'Producer' },
            { id: '2', name: 'Member 2', type: 'Consumer' },
          ],
        },
      ],
    }).as('getBalancingCircles');

    cy.visit('http://localhost:4200/');

  });

  it('should display balancing circle groups and members correctly', () => {

    cy.get('[data-cy=fetch-balancing-circles]').click();

    cy.wait('@getBalancingCircles');
  });
});

describe('Hourly Energy Imbalance Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/'); 
  });

  it('should show the date in correct format', () => {
    cy.contains('November 15, 2024') 
      .should('exist'); 
  });

  it('should display chart when data is available', () => {
    cy.get('.chart-container').should('be.visible');
    cy.get('canvas').should('exist');
  });

  it('should show empty state when no data is available', () => {
    cy.get('[data-cy=fetch-balancing-circles]').click();
    cy.get('.empty-state').should(
      'contain',
      'No data available for the selected date.'
    );
  });

  it('should click a point in the chart and open the modal', () => {
    cy.get('canvas').click();

    cy.get('#detailsOffcanvas').should('have.class', 'offcanvas'); 

    cy.get('#detailsOffcanvas')
      .find('h4')
      .should('contain', 'Details');
  });
});





