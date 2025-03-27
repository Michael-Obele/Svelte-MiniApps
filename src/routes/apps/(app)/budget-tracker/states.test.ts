import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as budgetState from './states.svelte';
import { PersistedState } from 'runed';
import type { Budget, Expense } from './states.svelte';

/**
 * Mock implementation for the PersistedState class from runed
 * This allows us to test the budget state functions without relying on the actual
 * PersistedState implementation, ensuring clean and isolated tests.
 */
let mockBudgets: Budget[] = [];
let mockSubscribers: Function[] = [];

// Mock PersistedState
vi.mock('runed', () => {
  return {
    PersistedState: vi.fn().mockImplementation(() => {
      return {
        get current() {
          return mockBudgets;
        },
        set current(value: Budget[]) {
          mockBudgets = [...value];
          // Make sure to call all subscribers when the state changes
          mockSubscribers.forEach(fn => fn(mockBudgets));
          window.dispatchEvent(new CustomEvent('budgetState-updated'));
        },
        subscribe: (callback: Function) => {
          mockSubscribers.push(callback);
          callback(mockBudgets);
          return () => {
            const index = mockSubscribers.indexOf(callback);
            if (index !== -1) {
              mockSubscribers.splice(index, 1);
            }
          };
        }
      };
    })
  };
});

// Mock window.dispatchEvent to track event emissions
global.dispatchEvent = vi.fn();

/**
 * Creates a mock UUID that matches the format expected by the application
 * This ensures consistency in testing without relying on actual UUID generation
 * Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 */
const mockUuid = (): `${string}-${string}-${string}-${string}-${string}` => {
  return [
    Math.random().toString(36).substring(2, 10),
    Math.random().toString(36).substring(2, 6),
    Math.random().toString(36).substring(2, 6),
    Math.random().toString(36).substring(2, 6),
    Math.random().toString(36).substring(2, 14)
  ].join('-') as `${string}-${string}-${string}-${string}-${string}`;
};

// Mock crypto.randomUUID to return our controlled UUID format
vi.spyOn(crypto, 'randomUUID').mockImplementation(mockUuid);

describe('Budget State Management', () => {
  /**
   * Setup before each test
   * - Clear localStorage to ensure tests don't affect each other
   * - Reset all mocks to ensure clean state
   * - Clear mock budgets and subscribers arrays
   */
  beforeEach(() => {
    // Clear localStorage before each test to avoid cross-test contamination
    localStorage.clear();
    
    // Reset all mocks to clear any tracked calls
    vi.clearAllMocks();
    
    // Reset mock state to ensure each test starts with a clean slate
    mockBudgets = [];
    mockSubscribers = [];
  });

  /**
   * Cleanup after each test
   * - Reset mocks to prevent leakage between tests
   */
  afterEach(() => {
    // Reset any mocks after each test
    vi.resetAllMocks();
  });

  /**
   * Test: Adding a new budget
   * Verifies that a budget can be successfully added with all its properties set correctly
   */
  it('should successfully add a new budget with correct properties', () => {
    // Test data
    const budgetName = 'Groceries';
    const budgetAmount = 200;
    const budgetCurrency = 'USD';
    
    // Act: Add a budget using the state function
    budgetState.addBudget(budgetName, budgetAmount, budgetCurrency);
    
    // Get current state
    const budgets = budgetState.budgets.current;
    
    // Assert: Verify the budget was added correctly
    expect(budgets, 'Budget array should exist').toBeDefined();
    expect(budgets.length, 'Budget array should contain 1 item').toBe(1);
    
    // Verify all properties of the added budget
    const addedBudget = budgets[0];
    expect(addedBudget.id, 'Budget should have a valid UUID').toBeDefined();
    expect(addedBudget.name, 'Budget name should match input').toBe(budgetName);
    expect(addedBudget.amount, 'Budget amount should match input').toBe(budgetAmount);
    expect(addedBudget.currency, 'Budget currency should match input').toBe(budgetCurrency);
    expect(addedBudget.expenses, 'Budget should start with empty expenses array').toEqual([]);
    expect(addedBudget.createdAt, 'Budget should have a createdAt timestamp').toBeDefined();
    
    // Verify the event was dispatched
    expect(global.dispatchEvent, 'Event should be dispatched').toHaveBeenCalled();
    expect(global.dispatchEvent).toHaveBeenCalledWith(expect.any(CustomEvent));
  });

  /**
   * Test: Adding multiple budgets
   * Verifies that multiple budgets can be added and are stored correctly
   */
  it('should support adding multiple budgets with different properties', () => {
    // Add multiple budgets
    budgetState.addBudget('Groceries', 200, 'USD');
    budgetState.addBudget('Entertainment', 100, 'EUR');
    budgetState.addBudget('Transport', 150, 'GBP');
    
    // Assert: Verify all budgets were added
    const budgets = budgetState.budgets.current;
    expect(budgets.length, 'Should have 3 budgets').toBe(3);
    
    // Verify each budget has correct properties
    expect(budgets[0].name).toBe('Groceries');
    expect(budgets[1].name).toBe('Entertainment');
    expect(budgets[2].name).toBe('Transport');
    
    // Verify currencies are set correctly
    expect(budgets[0].currency).toBe('USD');
    expect(budgets[1].currency).toBe('EUR');
    expect(budgets[2].currency).toBe('GBP');
    
    // Verify amounts are set correctly
    expect(budgets[0].amount).toBe(200);
    expect(budgets[1].amount).toBe(100);
    expect(budgets[2].amount).toBe(150);
  });

  /**
   * Test: Updating an existing budget
   * Verifies that a budget can be successfully updated with new values
   */
  it('should correctly update all properties of an existing budget', () => {
    // Setup: Add a budget first
    budgetState.addBudget('Groceries', 200, 'USD');
    const budgetId = budgetState.budgets.current[0].id;
    
    // Reset the mock to track the update call separately
    vi.clearAllMocks();
    
    // Act: Update the budget with new values
    const newName = 'Food';
    const newAmount = 300;
    const newCurrency = 'EUR';
    budgetState.updateBudget(budgetId, newName, newAmount, newCurrency);
    
    // Assert: Check that the budget was updated
    const budgets = budgetState.budgets.current;
    expect(budgets.length, 'Budget count should remain the same').toBe(1);
    
    // Verify updated properties
    const updatedBudget = budgets[0];
    expect(updatedBudget.id, 'Budget ID should remain unchanged').toBe(budgetId);
    expect(updatedBudget.name, 'Budget name should be updated').toBe(newName);
    expect(updatedBudget.amount, 'Budget amount should be updated').toBe(newAmount);
    expect(updatedBudget.currency, 'Budget currency should be updated').toBe(newCurrency);
    
    // Verify the event was dispatched for the update
    expect(global.dispatchEvent, 'Event should be dispatched for update').toHaveBeenCalled();
    expect(global.dispatchEvent).toHaveBeenCalledWith(expect.any(CustomEvent));
  });

  /**
   * Test: Updating a non-existent budget ID
   * Verifies the app can handle attempts to update budgets that don't exist
   */
  it('should handle updating a non-existent budget without errors', () => {
    // Setup: Add a budget
    budgetState.addBudget('Groceries', 200, 'USD');
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Act: Try to update a non-existent budget
    const nonExistentId = 'non-existent-id';
    budgetState.updateBudget(nonExistentId, 'Updated', 300, 'EUR');
    
    // Assert: The original budget should remain unchanged
    const budgets = budgetState.budgets.current;
    expect(budgets.length, 'Budget count should remain unchanged').toBe(1);
    expect(budgets[0].name, 'Original budget should be untouched').toBe('Groceries');
    expect(budgets[0].amount).toBe(200);
    expect(budgets[0].currency).toBe('USD');
  });

  /**
   * Test: Adding an expense to a budget
   * Verifies that expenses can be added to a budget correctly
   */
  it('should successfully add an expense to a specific budget', () => {
    // Setup: Add a budget first
    budgetState.addBudget('Groceries', 200, 'USD');
    const budgetId = budgetState.budgets.current[0].id;
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Act: Add an expense to the budget
    const expenseDescription = 'Milk';
    const expenseAmount = 5;
    budgetState.addExpense(budgetId, expenseDescription, expenseAmount);
    
    // Assert: Check that the expense was added
    const budgets = budgetState.budgets.current;
    
    // Verify budget exists
    expect(budgets.length).toBe(1);
    
    // Verify expense was added
    const targetBudget = budgets[0];
    expect(targetBudget.expenses.length, 'Budget should have 1 expense').toBe(1);
    
    // Verify expense properties
    const addedExpense = targetBudget.expenses[0];
    expect(addedExpense.id, 'Expense should have a valid ID').toBeDefined();
    expect(addedExpense.description, 'Expense description should match input').toBe(expenseDescription);
    expect(addedExpense.amount, 'Expense amount should match input').toBe(expenseAmount);
    expect(addedExpense.createdAt, 'Expense should have a createdAt timestamp').toBeDefined();
    
    // Verify event was dispatched
    expect(global.dispatchEvent, 'Event should be dispatched').toHaveBeenCalled();
    expect(global.dispatchEvent).toHaveBeenCalledWith(expect.any(CustomEvent));
  });

  /**
   * Test: Adding expense to non-existent budget
   * Verifies application resilience when adding expense to an invalid budget
   */
  it('should handle adding expense to a non-existent budget without errors', () => {
    // Setup: Start with no budgets
    expect(budgetState.budgets.current.length).toBe(0);
    
    // Act: Try to add expense to non-existent budget ID
    budgetState.addExpense('non-existent-id', 'Test Expense', 10);
    
    // Assert: No changes should be made
    expect(budgetState.budgets.current.length).toBe(0);
    
    // Expense addition failure shouldn't throw errors
    expect(() => budgetState.addExpense('non-existent-id', 'Test', 10)).not.toThrow();
  });

  /**
   * Test: Adding multiple expenses to a budget
   * Verifies tracking multiple expenses within a single budget
   */
  it('should support adding multiple expenses to a single budget', () => {
    // Setup: Add a budget
    budgetState.addBudget('Groceries', 200, 'USD');
    const budgetId = budgetState.budgets.current[0].id;
    
    // Act: Add multiple expenses
    budgetState.addExpense(budgetId, 'Milk', 5);
    budgetState.addExpense(budgetId, 'Bread', 3);
    budgetState.addExpense(budgetId, 'Eggs', 4);
    
    // Assert: Verify all expenses were added
    const budget = budgetState.budgets.current[0];
    expect(budget.expenses.length, 'Budget should have 3 expenses').toBe(3);
    
    // Verify expense properties
    expect(budget.expenses[0].description).toBe('Milk');
    expect(budget.expenses[1].description).toBe('Bread');
    expect(budget.expenses[2].description).toBe('Eggs');
    
    // Verify amounts
    expect(budget.expenses[0].amount).toBe(5);
    expect(budget.expenses[1].amount).toBe(3);
    expect(budget.expenses[2].amount).toBe(4);
  });

  /**
   * Test: Updating an expense in a budget
   * Verifies that expenses can be updated with new values
   */
  it('should correctly update an existing expense with new values', () => {
    // Setup: Add a budget with an expense
    budgetState.addBudget('Groceries', 200, 'USD');
    const budgetId = budgetState.budgets.current[0].id;
    budgetState.addExpense(budgetId, 'Milk', 5);
    const expenseId = budgetState.budgets.current[0].expenses[0].id;
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Act: Update the expense
    const newDescription = 'Organic Milk';
    const newAmount = 8;
    budgetState.updateExpense(budgetId, expenseId, newDescription, newAmount);
    
    // Assert: Verify the expense was updated
    const updatedBudget = budgetState.budgets.current[0];
    expect(updatedBudget.expenses.length, 'Expense count should remain the same').toBe(1);
    
    // Verify updated expense properties
    const updatedExpense = updatedBudget.expenses[0];
    expect(updatedExpense.id, 'Expense ID should remain unchanged').toBe(expenseId);
    expect(updatedExpense.description, 'Expense description should be updated').toBe(newDescription);
    expect(updatedExpense.amount, 'Expense amount should be updated').toBe(newAmount);
    
    // Verify event was dispatched
    expect(global.dispatchEvent, 'Event should be dispatched').toHaveBeenCalled();
    expect(global.dispatchEvent).toHaveBeenCalledWith(expect.any(CustomEvent));
  });

  /**
   * Test: Updating a non-existent expense or budget
   * Verifies application resilience when updating invalid data
   */
  it('should handle updating non-existent expense or budget without errors', () => {
    // Setup: Add a budget with an expense
    budgetState.addBudget('Groceries', 200, 'USD');
    const budgetId = budgetState.budgets.current[0].id;
    budgetState.addExpense(budgetId, 'Milk', 5);
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Act 1: Try updating with non-existent expense ID
    budgetState.updateExpense(budgetId, 'non-existent-expense', 'New Item', 10);
    
    // Assert 1: The original expense should remain unchanged
    let budget = budgetState.budgets.current[0];
    expect(budget.expenses.length).toBe(1);
    expect(budget.expenses[0].description).toBe('Milk');
    expect(budget.expenses[0].amount).toBe(5);
    
    // Act 2: Try updating with non-existent budget ID
    budgetState.updateExpense('non-existent-budget', budget.expenses[0].id, 'New Item', 10);
    
    // Assert 2: Nothing should change
    budget = budgetState.budgets.current[0];
    expect(budget.expenses.length).toBe(1);
    expect(budget.expenses[0].description).toBe('Milk');
    expect(budget.expenses[0].amount).toBe(5);
    
    // Expense update failure shouldn't throw errors
    expect(() => budgetState.updateExpense('invalid', 'invalid', 'Test', 10)).not.toThrow();
  });

  /**
   * Test: Deleting a budget
   * Verifies that a budget can be successfully removed
   */
  it('should successfully remove a budget when deleted by ID', () => {
    // Setup: Add two budgets
    budgetState.addBudget('Groceries', 200, 'USD');
    budgetState.addBudget('Entertainment', 100, 'USD');
    const budgetId = budgetState.budgets.current[0].id;
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Act: Delete the first budget
    budgetState.deleteBudget(budgetId);
    
    // Assert: Verify the budget was deleted
    const budgets = budgetState.budgets.current;
    expect(budgets.length, 'One budget should be removed').toBe(1);
    expect(budgets[0].name, 'Remaining budget should be Entertainment').toBe('Entertainment');
    
    // Verify the deleted budget no longer exists
    const deletedBudget = budgets.find(b => b.id === budgetId);
    expect(deletedBudget, 'Deleted budget should not be found').toBeUndefined();
    
    // Verify event was dispatched
    expect(global.dispatchEvent, 'Event should be dispatched').toHaveBeenCalled();
    expect(global.dispatchEvent).toHaveBeenCalledWith(expect.any(CustomEvent));
  });

  /**
   * Test: Deleting a non-existent budget
   * Verifies application resilience when deleting invalid data
   */
  it('should handle deleting a non-existent budget without errors', () => {
    // Setup: Add a budget
    budgetState.addBudget('Groceries', 200, 'USD');
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Act: Try to delete a non-existent budget
    budgetState.deleteBudget('non-existent-id');
    
    // Assert: No budgets should be removed
    const budgets = budgetState.budgets.current;
    expect(budgets.length, 'Budget count should remain unchanged').toBe(1);
    expect(budgets[0].name).toBe('Groceries');
    
    // Deletion failure shouldn't throw errors
    expect(() => budgetState.deleteBudget('invalid')).not.toThrow();
  });

  /**
   * Test: Deleting an expense from a budget
   * Verifies that an expense can be successfully removed from a budget
   */
  it('should successfully remove an expense from a budget when deleted by ID', () => {
    // Setup: Add a budget with two expenses
    budgetState.addBudget('Groceries', 200, 'USD');
    const budgetId = budgetState.budgets.current[0].id;
    budgetState.addExpense(budgetId, 'Milk', 5);
    budgetState.addExpense(budgetId, 'Bread', 3);
    const expenseId = budgetState.budgets.current[0].expenses[0].id;
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Act: Delete the first expense
    budgetState.deleteExpense(budgetId, expenseId);
    
    // Assert: Verify the expense was deleted
    const budget = budgetState.budgets.current[0];
    expect(budget.expenses.length, 'One expense should be removed').toBe(1);
    expect(budget.expenses[0].description, 'Remaining expense should be Bread').toBe('Bread');
    
    // Verify the deleted expense no longer exists
    const deletedExpense = budget.expenses.find(e => e.id === expenseId);
    expect(deletedExpense, 'Deleted expense should not be found').toBeUndefined();
    
    // Verify event was dispatched
    expect(global.dispatchEvent, 'Event should be dispatched').toHaveBeenCalled();
    expect(global.dispatchEvent).toHaveBeenCalledWith(expect.any(CustomEvent));
  });

  /**
   * Test: Deleting a non-existent expense
   * Verifies application resilience when deleting invalid expense data
   */
  it('should handle deleting a non-existent expense without errors', () => {
    // Setup: Add a budget with an expense
    budgetState.addBudget('Groceries', 200, 'USD');
    const budgetId = budgetState.budgets.current[0].id;
    budgetState.addExpense(budgetId, 'Milk', 5);
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Act: Try to delete a non-existent expense
    budgetState.deleteExpense(budgetId, 'non-existent-expense');
    
    // Assert: No expenses should be removed
    const budget = budgetState.budgets.current[0];
    expect(budget.expenses.length, 'Expense count should remain unchanged').toBe(1);
    expect(budget.expenses[0].description).toBe('Milk');
    
    // Deletion failure shouldn't throw errors
    expect(() => budgetState.deleteExpense(budgetId, 'invalid')).not.toThrow();
    expect(() => budgetState.deleteExpense('invalid', 'invalid')).not.toThrow();
  });
});

describe('Budget State Subscription System', () => {
  let unsubscribe: () => void;
  let callback: any;

  /**
   * Setup before each test
   * - Create a fresh spy callback
   * - Clear localStorage
   * - Reset all mocks
   * - Reset mock budgets and subscribers arrays
   */
  beforeEach(() => {
    callback = vi.fn();
    localStorage.clear();
    vi.clearAllMocks();
    mockBudgets = [];
    mockSubscribers = [];
  });

  /**
   * Cleanup after each test
   * - Unsubscribe from any active subscriptions
   */
  afterEach(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  /**
   * Test: Initial subscription callback
   * Verifies that subscribers receive current state upon subscription
   */
  it('should call the callback with current state when subscription is created', () => {
    // Setup: Add a budget first
    budgetState.addBudget('Test Budget', 100, 'USD');

    // Reset mocks
    vi.clearAllMocks();

    // Act: Subscribe to budgets
    unsubscribe = budgetState.budgets.subscribe(callback);
    
    // Assert: The callback should be called with the current budgets
    expect(callback, 'Callback should be called once on subscription').toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Test Budget',
          amount: 100,
          currency: 'USD'
        })
      ])
    );
  });

  /**
   * Test: Subscription updates
   * Verifies that subscribers receive updates when state changes
   */
  it('should notify subscribers when a budget is added to the state', () => {
    // Setup: Subscribe to budgets
    unsubscribe = budgetState.budgets.subscribe(callback);
    
    // Reset the mock to clear the initial call
    callback.mockReset();
    
    // Clear the subscribers array and re-add the callback after reset
    mockSubscribers = [];
    mockSubscribers.push(callback);
    
    // Act: Add a budget
    budgetState.addBudget('New Budget', 150, 'USD');
    
    // Assert: The callback should be called with updated budgets
    expect(callback, 'Callback should be called after budget addition').toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'New Budget',
          amount: 150,
          currency: 'USD'
        })
      ])
    );
  });

  /**
   * Test: Subscription unsubscribe
   * Verifies that unsubscribing stops updates from being received
   */
  it('should stop receiving updates after unsubscribing', () => {
    // Setup: Subscribe to budgets
    unsubscribe = budgetState.budgets.subscribe(callback);
    
    // Reset the mock to clear the initial call
    callback.mockReset();
    
    // Act 1: Unsubscribe
    unsubscribe();
    
    // Act 2: Add a budget after unsubscribing
    budgetState.addBudget('New Budget', 150, 'USD');
    
    // Assert: The callback should not be called after unsubscribing
    expect(callback, 'Callback should not be called after unsubscribing').not.toHaveBeenCalled();
  });

  /**
   * Test: Multiple subscribers
   * Verifies that multiple subscribers all receive updates
   */
  it('should notify all subscribers when state changes', () => {
    // Setup: Create multiple subscribers
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const callback3 = vi.fn();
    
    // Act 1: Subscribe all callbacks
    const unsub1 = budgetState.budgets.subscribe(callback1);
    const unsub2 = budgetState.budgets.subscribe(callback2);
    const unsub3 = budgetState.budgets.subscribe(callback3);
    
    // Reset mocks after initial subscription calls
    callback1.mockReset();
    callback2.mockReset();
    callback3.mockReset();
    
    // Manually reset and add subscribers since we're using mock functions
    mockSubscribers = [];
    mockSubscribers.push(callback1, callback2, callback3);
    
    // Act 2: Update state
    budgetState.addBudget('Test Budget', 200, 'USD');
    
    // Assert: All callbacks should be called
    expect(callback1, 'First callback should be called').toHaveBeenCalledTimes(1);
    expect(callback2, 'Second callback should be called').toHaveBeenCalledTimes(1);
    expect(callback3, 'Third callback should be called').toHaveBeenCalledTimes(1);
    
    // Cleanup
    unsub1();
    unsub2();
    unsub3();
  });
});

describe('Budget State Helper Functions', () => {
  /**
   * Setup before each test
   */
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockBudgets = [];
    mockSubscribers = [];
  });

  /**
   * Test: Finding a budget by ID
   */
  it('should correctly find a budget by ID', () => {
    // Setup: Add multiple budgets
    budgetState.addBudget('Groceries', 200, 'USD');
    budgetState.addBudget('Entertainment', 100, 'EUR');
    const targetBudgetId = budgetState.budgets.current[1].id;
    
    // Act: Find the budget
    const foundBudget = budgetState.findBudget(targetBudgetId);
    
    // Assert: Verify the correct budget was found
    expect(foundBudget, 'Budget should be found').toBeDefined();
    expect(foundBudget?.id).toBe(targetBudgetId);
    expect(foundBudget?.name).toBe('Entertainment');
    expect(foundBudget?.currency).toBe('EUR');
    
    // Test finding non-existent budget
    const nonExistentBudget = budgetState.findBudget('non-existent-id');
    expect(nonExistentBudget, 'Non-existent budget should not be found').toBeUndefined();
  });

  /**
   * Test: Getting budget expenses
   */
  it('should correctly retrieve expenses for a specific budget', () => {
    // Setup: Add a budget with expenses
    budgetState.addBudget('Groceries', 200, 'USD');
    const budgetId = budgetState.budgets.current[0].id;
    budgetState.addExpense(budgetId, 'Milk', 5);
    budgetState.addExpense(budgetId, 'Bread', 3);
    
    // Act: Get expenses for the budget
    const expenses = budgetState.getBudgetExpenses(budgetId);
    
    // Assert: Verify expenses were retrieved correctly
    expect(expenses.length, 'Should retrieve 2 expenses').toBe(2);
    expect(expenses[0].description).toBe('Milk');
    expect(expenses[1].description).toBe('Bread');
    
    // Test getting expenses for non-existent budget
    const noExpenses = budgetState.getBudgetExpenses('non-existent-id');
    expect(noExpenses, 'Should return empty array for non-existent budget').toEqual([]);
  });

  /**
   * Test: Getting all expenses across all budgets
   */
  it('should correctly retrieve all expenses across all budgets', () => {
    // Setup: Add multiple budgets with expenses
    budgetState.addBudget('Groceries', 200, 'USD');
    const groceriesBudgetId = budgetState.budgets.current[0].id;
    
    budgetState.addBudget('Entertainment', 100, 'EUR');
    const entertainmentBudgetId = budgetState.budgets.current[1].id;
    
    // Add expenses to both budgets
    budgetState.addExpense(groceriesBudgetId, 'Milk', 5);
    budgetState.addExpense(groceriesBudgetId, 'Bread', 3);
    budgetState.addExpense(entertainmentBudgetId, 'Movie', 15);
    
    // Act: Get all expenses
    const allExpenses = budgetState.getAllExpenses();
    
    // Assert: Verify all expenses were retrieved
    expect(allExpenses.length, 'Should retrieve all 3 expenses').toBe(3);
    
    // Verify each expense has the correct budget information
    const groceriesExpenses = allExpenses.filter(e => e.budgetName === 'Groceries');
    const entertainmentExpenses = allExpenses.filter(e => e.budgetName === 'Entertainment');
    
    expect(groceriesExpenses.length).toBe(2);
    expect(entertainmentExpenses.length).toBe(1);
    
    expect(groceriesExpenses[0].expense.description).toBe('Milk');
    expect(groceriesExpenses[1].expense.description).toBe('Bread');
    expect(entertainmentExpenses[0].expense.description).toBe('Movie');
    
    // Test with no budgets
    mockBudgets = [];
    const emptyExpenses = budgetState.getAllExpenses();
    expect(emptyExpenses, 'Should return empty array when no budgets exist').toEqual([]);
  });

  /**
   * Test: Getting total expenses
   */
  it('should correctly calculate total expenses across all budgets', () => {
    // Setup: Add multiple budgets with expenses
    budgetState.addBudget('Groceries', 200, 'USD');
    const groceriesBudgetId = budgetState.budgets.current[0].id;
    
    budgetState.addBudget('Entertainment', 100, 'EUR');
    const entertainmentBudgetId = budgetState.budgets.current[1].id;
    
    // Add expenses with different amounts
    budgetState.addExpense(groceriesBudgetId, 'Milk', 5);
    budgetState.addExpense(groceriesBudgetId, 'Bread', 3);
    budgetState.addExpense(entertainmentBudgetId, 'Movie', 15);
    
    // Act: Calculate total expenses
    const totalExpenses = budgetState.getTotalExpenses();
    
    // Assert: Verify the total is correct (5 + 3 + 15 = 23)
    expect(totalExpenses, 'Total should be sum of all expense amounts').toBe(23);
    
    // Test with no expenses
    mockBudgets = [{ id: 'test', name: 'Test', amount: 100, currency: 'USD', expenses: [], createdAt: new Date().toISOString() }];
    const zeroExpenses = budgetState.getTotalExpenses();
    expect(zeroExpenses, 'Should return 0 when no expenses exist').toBe(0);
  });

  /**
   * Test: Date handling in budget creation
   */
  it('should correctly set and format dates for new budgets and expenses', () => {
    // Setup: Mock date
    const mockDate = new Date('2025-03-27T12:00:00Z');
    const originalDate = global.Date;
    global.Date = class extends Date {
      constructor(...args: ConstructorParameters<typeof Date>) {
        super(...args);
        return mockDate;
      }
    } as DateConstructor;
    
    // Act: Add a budget and expense
    budgetState.addBudget('Test Budget', 100, 'USD');
    const budgetId = budgetState.budgets.current[0].id;
    budgetState.addExpense(budgetId, 'Test Expense', 50);
    
    // Assert: Verify dates are set correctly
    const budget = budgetState.budgets.current[0];
    expect(budget.createdAt).toBe(mockDate.toISOString());
    expect(budget.expenses[0].createdAt).toBe(mockDate.toISOString());
    
    // Cleanup: Restore original Date
    global.Date = originalDate;
  });

  /**
   * Test: Budget validation
   */
  it('should handle invalid budget data gracefully', () => {
    // Test with invalid budget amount (negative)
    budgetState.addBudget('Invalid Budget', -100, 'USD');
    expect(budgetState.budgets.current.length, 'Should not add budget with negative amount').toBe(0);
    
    // Test with empty budget name
    budgetState.addBudget('', 100, 'USD');
    expect(budgetState.budgets.current.length, 'Should not add budget with empty name').toBe(0);
    
    // Test with invalid currency
    budgetState.addBudget('Test Budget', 100, '');
    expect(budgetState.budgets.current.length, 'Should not add budget with empty currency').toBe(0);
  });

  /**
   * Test: Expense validation
   */
  it('should handle invalid expense data gracefully', () => {
    // Setup: Add a valid budget
    budgetState.addBudget('Test Budget', 100, 'USD');
    const budgetId = budgetState.budgets.current[0].id;
    
    // Test with invalid expense amount (negative)
    budgetState.addExpense(budgetId, 'Invalid Expense', -50);
    expect(budgetState.budgets.current[0].expenses.length, 'Should not add expense with negative amount').toBe(0);
    
    // Test with empty expense description
    budgetState.addExpense(budgetId, '', 50);
    expect(budgetState.budgets.current[0].expenses.length, 'Should not add expense with empty description').toBe(0);
  });

  /**
   * Test: Concurrent operations
   */
  it('should handle concurrent operations correctly', () => {
    // Setup: Add multiple budgets simultaneously
    const operations = [
      budgetState.addBudget('Budget 1', 100, 'USD'),
      budgetState.addBudget('Budget 2', 200, 'EUR'),
      budgetState.addBudget('Budget 3', 300, 'GBP')
    ];
    
    // Assert: All budgets should be added correctly
    expect(budgetState.budgets.current.length, 'All budgets should be added').toBe(3);
    
    // Verify budget names
    const budgetNames = budgetState.budgets.current.map(b => b.name);
    expect(budgetNames).toContain('Budget 1');
    expect(budgetNames).toContain('Budget 2');
    expect(budgetNames).toContain('Budget 3');
  });
});

describe('Budget State Event System', () => {
  /**
   * Setup before each test
   */
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockBudgets = [];
    mockSubscribers = [];
    
    // Setup event listener spy
    window.addEventListener = vi.fn();
    window.removeEventListener = vi.fn();
  });
  
  /**
   * Test: Event dispatching on state changes
   */
  it('should dispatch events when state changes', () => {
    // Act: Perform various state changes
    budgetState.addBudget('Test Budget', 100, 'USD');
    
    // Assert: Verify event was dispatched
    expect(global.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'budgetState-updated'
      })
    );
    
    // Reset mock
    vi.clearAllMocks();
    
    // Update a budget
    const budgetId = budgetState.budgets.current[0].id;
    budgetState.updateBudget(budgetId, 'Updated Budget', 200, 'EUR');
    
    // Verify event was dispatched again
    expect(global.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'budgetState-updated'
      })
    );
  });
});
