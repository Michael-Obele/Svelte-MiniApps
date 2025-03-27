import { PersistedState } from 'runed';

// Types
export interface Expense {
    id: string;
    description: string;
    amount: number;
    createdAt: string;
}

export interface Budget {
    id: string;
    name: string;
    amount: number;
    expenses: Expense[];
    currency: string;
    createdAt: string;
}

// Create a persisted state for budgets with cross-tab synchronization
const budgetState = new PersistedState<Budget[]>('budgets', [], {
    storage: 'local', // Use localStorage
    syncTabs: true, // Sync across tabs
});

// Budget store functions
export function addBudget(name: string, amount: number, currency: string) {
    const newBudget: Budget = {
        id: crypto.randomUUID(),
        name,
        amount,
        currency,
        expenses: [],
        createdAt: new Date().toISOString()
    };

    // Update the persisted state
    budgetState.current = [...budgetState.current, newBudget];
}

export function updateBudget(id: string, name: string, amount: number, currency: string) {
    const updatedBudgets = budgetState.current.map(budget => 
        budget.id === id 
            ? { ...budget, name, amount, currency } 
            : budget
    );
    
    // Update the persisted state
    budgetState.current = updatedBudgets;
}

export function addExpense(budgetId: string, description: string, amount: number) {
    const newExpense: Expense = {
        id: crypto.randomUUID(),
        description,
        amount,
        createdAt: new Date().toISOString()
    };

    const updatedBudgets = budgetState.current.map((budget) =>
        budget.id === budgetId
            ? { ...budget, expenses: [...budget.expenses, newExpense] }
            : budget
    );
    
    // Update the persisted state
    budgetState.current = updatedBudgets;
}

export function updateExpense(budgetId: string, expenseId: string, description: string, amount: number) {
    const updatedBudgets = budgetState.current.map((budget) => {
        if (budget.id === budgetId) {
            return {
                ...budget,
                expenses: budget.expenses.map((expense) => {
                    if (expense.id === expenseId) {
                        return {
                            ...expense,
                            description,
                            amount,
                            createdAt: new Date().toISOString()
                        };
                    }
                    return expense;
                })
            };
        }
        return budget;
    });

    // Update the persisted state
    budgetState.current = updatedBudgets;
}

export function deleteBudget(id: string) {
    budgetState.current = budgetState.current.filter(budget => budget.id !== id);
}

export function deleteExpense(budgetId: string, expenseId: string) {
    const updatedBudgets = budgetState.current.map((budget) =>
        budget.id === budgetId
            ? { ...budget, expenses: budget.expenses.filter((e) => e.id !== expenseId) }
            : budget
    );
    
    // Update the persisted state
    budgetState.current = updatedBudgets;
}

// Export the budget state as a readable store
export const budgets = {
    subscribe: (callback: (value: Budget[]) => void) => {
        // Initial call with current value
        callback(budgetState.current);
        
        // Set up a listener for changes to the persisted state
        const storageHandler = () => {
            callback(budgetState.current);
        };
        
        // Listen for storage events (for cross-tab synchronization)
        window.addEventListener('storage', storageHandler);
        
        // Create a custom event for in-tab updates
        const updateListener = () => callback(budgetState.current);
        window.addEventListener('budgetState-updated', updateListener);
        
        // Return unsubscribe function
        return () => {
            window.removeEventListener('storage', storageHandler);
            window.removeEventListener('budgetState-updated', updateListener);
        };
    },
    get current() {
        return budgetState.current;
    }
};

/**
 * Helper function to find a budget by ID
 * @param id Budget ID to find
 * @returns Budget object if found, undefined otherwise
 */
export function findBudget(id: string): Budget | undefined {
    return budgetState.current.find(budget => budget.id === id);
}

// Enhance the PersistedState to dispatch events when it changes
const originalSetter = Object.getOwnPropertyDescriptor(budgetState, 'current')?.set;
const originalGetter = Object.getOwnPropertyDescriptor(budgetState, 'current')?.get;

if (originalSetter && originalGetter) {
    Object.defineProperty(budgetState, 'current', {
        set(value) {
            originalSetter.call(budgetState, value);
            // Dispatch a custom event to notify subscribers within the same tab
            window.dispatchEvent(new CustomEvent('budgetState-updated'));
        },
        get() {
            return originalGetter.call(budgetState);
        }
    });
}
