import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as budgetState from './states.svelte';
import { PersistedState } from 'runed';
import type { Budget, Expense } from './states.svelte';

// Mock implementation for PersistedState
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

// Mock window.dispatchEvent
global.dispatchEvent = vi.fn();

// Create a UUID that matches the expected format
const mockUuid = (): `${string}-${string}-${string}-${string}-${string}` => {
  return [
    Math.random().toString(36).substring(2, 10),
    Math.random().toString(36).substring(2, 6),
    Math.random().toString(36).substring(2, 6),
    Math.random().toString(36).substring(2, 6),
    Math.random().toString(36).substring(2, 14)
  ].join('-') as `${string}-${string}-${string}-${string}-${string}`;
};

// Mock crypto.randomUUID
vi.spyOn(crypto, 'randomUUID').mockImplementation(mockUuid);

describe('Budget State', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Reset mock state
    mockBudgets = [];
    mockSubscribers = [];
  });

  afterEach(() => {
    // Reset any mocks after each test
    vi.resetAllMocks();
  });

  it('should add a budget', () => {
    // Add a budget
    budgetState.addBudget('Groceries', 200, 'USD');
    
    // Check that the budget was added
    const budgets = budgetState.budgets.current;
    expect(budgets.length).toBe(1);
    expect(budgets[0].name).toBe('Groceries');
    expect(budgets[0].amount).toBe(200);
    expect(budgets[0].currency).toBe('USD');
    expect(budgets[0].expenses).toEqual([]);
  });

  it('should update a budget', () => {
    // Add a budget
    budgetState.addBudget('Groceries', 200, 'USD');
    const budgetId = budgetState.budgets.current[0].id;
    
    // Update the budget
    budgetState.updateBudget(budgetId, 'Food', 300, 'EUR');
    
    // Check that the budget was updated
    const budgets = budgetState.budgets.current;
    expect(budgets.length).toBe(1);
    expect(budgets[0].name).toBe('Food');
    expect(budgets[0].amount).toBe(300);
    expect(budgets[0].currency).toBe('EUR');
  });

  it('should add an expense to a budget', () => {
    // Add a budget
    budgetState.addBudget('Groceries', 200, 'USD');
    const budgetId = budgetState.budgets.current[0].id;
    
    // Add an expense
    budgetState.addExpense(budgetId, 'Milk', 5);
    
    // Check that the expense was added
    const budgets = budgetState.budgets.current;
    expect(budgets[0].expenses.length).toBe(1);
    expect(budgets[0].expenses[0].description).toBe('Milk');
    expect(budgets[0].expenses[0].amount).toBe(5);
  });

  it('should update an expense in a budget', () => {
    // Add a budget with an expense
    budgetState.addBudget('Groceries', 200, 'USD');
    const budgetId = budgetState.budgets.current[0].id;
    budgetState.addExpense(budgetId, 'Milk', 5);
    const expenseId = budgetState.budgets.current[0].expenses[0].id;
    
    // Update the expense
    budgetState.updateExpense(budgetId, expenseId, 'Organic Milk', 8);
    
    // Check that the expense was updated
    const budgets = budgetState.budgets.current;
    expect(budgets[0].expenses.length).toBe(1);
    expect(budgets[0].expenses[0].description).toBe('Organic Milk');
    expect(budgets[0].expenses[0].amount).toBe(8);
  });

  it('should delete a budget', () => {
    // Add two budgets
    budgetState.addBudget('Groceries', 200, 'USD');
    budgetState.addBudget('Entertainment', 100, 'USD');
    const budgetId = budgetState.budgets.current[0].id;
    
    // Delete the first budget
    budgetState.deleteBudget(budgetId);
    
    // Check that the budget was deleted
    const budgets = budgetState.budgets.current;
    expect(budgets.length).toBe(1);
    expect(budgets[0].name).toBe('Entertainment');
  });

  it('should delete an expense from a budget', () => {
    // Add a budget with two expenses
    budgetState.addBudget('Groceries', 200, 'USD');
    const budgetId = budgetState.budgets.current[0].id;
    budgetState.addExpense(budgetId, 'Milk', 5);
    budgetState.addExpense(budgetId, 'Bread', 3);
    const expenseId = budgetState.budgets.current[0].expenses[0].id;
    
    // Delete the first expense
    budgetState.deleteExpense(budgetId, expenseId);
    
    // Check that the expense was deleted
    const budgets = budgetState.budgets.current;
    expect(budgets[0].expenses.length).toBe(1);
    expect(budgets[0].expenses[0].description).toBe('Bread');
  });
});

describe('Budgets Subscribe', () => {
  let unsubscribe: () => void;
  let callback: any;

  beforeEach(() => {
    callback = vi.fn();
    localStorage.clear();
    vi.clearAllMocks();
    mockBudgets = [];
    mockSubscribers = [];
  });

  afterEach(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  it('should call the callback when subscribed', () => {
    // Add a budget first
    budgetState.addBudget('Test Budget', 100, 'USD');

    // Subscribe to budgets
    unsubscribe = budgetState.budgets.subscribe(callback);
    
    // The callback should be called with the current budgets
    expect(callback).toHaveBeenCalledTimes(1);
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

  it('should call the callback when a budget is added', () => {
    // Subscribe to budgets
    unsubscribe = budgetState.budgets.subscribe(callback);
    
    // Reset the mock to clear the initial call
    callback.mockReset();
    
    // Add a budget
    budgetState.addBudget('New Budget', 150, 'USD');
    
    // The callback should be called with updated budgets
    expect(callback).toHaveBeenCalledTimes(1);
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
});
