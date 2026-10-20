@smoke @negative
Feature: Login validation
  Scenario: Invalid login shows an error
    Given I attempt login with invalid credentials
    Then I should see an authentication error message
    And I should remain on the login page
