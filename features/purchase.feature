@smoke @purchase
Feature: Purchase
  Scenario: Successful purchase of a single product
    Given I login as a standard user
    When I add "Sauce Labs Backpack" to the cart
    Then the cart badge should show 1
    When I open the cart
    Then the cart should contain "Sauce Labs Backpack"
    When I checkout with valid customer details
    Then I should see the order confirmation page
