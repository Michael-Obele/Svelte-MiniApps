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

// Keep a reactive reference to the current budgets
let currentBudgets = $state<Budget[]>([]);

// Initialize the reactive state with the persisted state
$effect.root(() => {
    currentBudgets = budgetState.current;
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

    // Update both the reactive state and the persisted state
    const updatedBudgets = [...currentBudgets, newBudget];
    currentBudgets = updatedBudgets;
    budgetState.current = updatedBudgets;
}

export function updateBudget(id: string, name: string, amount: number, currency: string) {
    const updatedBudgets = currentBudgets.map(budget => 
        budget.id === id 
            ? { ...budget, name, amount, currency } 
            : budget
    );
    
    // Update both states
    currentBudgets = updatedBudgets;
    budgetState.current = updatedBudgets;
}

export function addExpense(budgetId: string, description: string, amount: number) {
    const newExpense: Expense = {
        id: crypto.randomUUID(),
        description,
        amount,
        createdAt: new Date().toISOString()
    };

    const updatedBudgets = currentBudgets.map((budget) =>
        budget.id === budgetId
            ? { ...budget, expenses: [...budget.expenses, newExpense] }
            : budget
    );
    
    // Update both states
    currentBudgets = updatedBudgets;
    budgetState.current = updatedBudgets;
}

export function updateExpense(budgetId: string, expenseId: string, description: string, amount: number) {
    const updatedBudgets = currentBudgets.map((budget) => {
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

    // Update both states
    currentBudgets = updatedBudgets;
    budgetState.current = updatedBudgets;
}

export function deleteBudget(id: string) {
    const updatedBudgets = currentBudgets.filter(budget => budget.id !== id);
    
    // Update both states
    currentBudgets = updatedBudgets;
    budgetState.current = updatedBudgets;
}

export function deleteExpense(budgetId: string, expenseId: string) {
    const updatedBudgets = currentBudgets.map((budget) =>
        budget.id === budgetId
            ? { ...budget, expenses: budget.expenses.filter((e) => e.id !== expenseId) }
            : budget
    );
    
    // Update both states
    currentBudgets = updatedBudgets;
    budgetState.current = updatedBudgets;
}

// Export the budget state as a readable store
export const budgets = {
    subscribe: (callback: (value: Budget[]) => void) => {
        // Initial call with current value
        callback(currentBudgets);
        
        // Set up an effect to call the callback whenever currentBudgets changes
        const unsubscribe = $effect.root(() => {
            $effect(() => {
                callback(currentBudgets);
            });
            
            // Handle cross-tab synchronization
            const storageHandler = () => {
                // If the storage event is triggered, update currentBudgets
                if (budgetState.current !== currentBudgets) {
                    currentBudgets = budgetState.current;
                }
            };
            
            window.addEventListener('storage', storageHandler);
            
            return () => {
                window.removeEventListener('storage', storageHandler);
            };
        });
        
        // Return unsubscribe function
        return unsubscribe;
    },
    get current() {
        return currentBudgets;
    }
};

/**
 * Helper function to find a budget by ID
 * @param id Budget ID to find
 * @returns Budget object if found, undefined otherwise
 */
export function findBudget(id: string): Budget | undefined {
    return currentBudgets.find(budget => budget.id === id);
}
