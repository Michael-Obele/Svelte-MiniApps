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

    budgetState.current = [...budgetState.current, newBudget];
}

export function updateBudget(id: string, name: string, amount: number, currency: string) {
    const budgets = [...budgetState.current];
    const index = budgets.findIndex((b) => b.id === id);
    
    if (index !== -1) {
        budgets[index] = { ...budgets[index], name, amount, currency };
        budgetState.current = budgets;
    }
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
    
    budgetState.current = updatedBudgets;
}

export function updateExpense(budgetId: string, expenseId: string, description: string, amount: number) {
    // Create a new array to maintain immutability
    const updatedBudgets = budgetState.current.map((budget) => {
        if (budget.id === budgetId) {
            // Create new budget object with updated expenses
            return {
                ...budget,
                expenses: budget.expenses.map((expense) => {
                    if (expense.id === expenseId) {
                        // Create new expense object with updated values
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

    budgetState.current = updatedBudgets;
}

export function deleteBudget(id: string) {
    budgetState.current = budgetState.current.filter((b) => b.id !== id);
}

export function deleteExpense(budgetId: string, expenseId: string) {
    const updatedBudgets = budgetState.current.map((budget) =>
        budget.id === budgetId
            ? { ...budget, expenses: budget.expenses.filter((e) => e.id !== expenseId) }
            : budget
    );
    
    budgetState.current = updatedBudgets;
}

// Export the budget state
export const budgets = {
    subscribe: (callback: (value: Budget[]) => void) => {
        // Initial call with current value
        callback(budgetState.current);
        
        // Set up the event listener for changes
        const updateListener = () => callback(budgetState.current);
        
        // Use a custom event for state updates
        window.addEventListener('budgetState-updated', updateListener);
        
        // Return unsubscribe function
        return () => {
            window.removeEventListener('budgetState-updated', updateListener);
        };
    },
    get current() {
        return budgetState.current;
    }
};

// When budgetState changes, dispatch an event
const originalBudgetStateSetter = Object.getOwnPropertyDescriptor(budgetState, 'current')?.set;
if (originalBudgetStateSetter) {
    Object.defineProperty(budgetState, 'current', {
        set(value) {
            originalBudgetStateSetter.call(budgetState, value);
            window.dispatchEvent(new CustomEvent('budgetState-updated'));
        },
        get() {
            return budgetState.current;
        }
    });
}
