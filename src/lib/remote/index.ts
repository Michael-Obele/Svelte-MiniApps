// Remote functions for authentication
export { getCurrentUser, loginUser, registerUser } from './auth.remote';

// Remote functions for mantra management
export { getMantra, likeMantra } from './mantra.remote';

// Remote functions for password management
export { getSavedPasswords, savePassword, deletePassword, editPassword } from './password.remote';

// Remote functions for purchase tracker
export {
	// Queries
	getItems,
	getItem,
	getPurchasesForItem,
	// Forms
	createItemForm,
	updateItemForm,
	createPurchaseForm,
	updatePurchaseForm,
	// Commands & utilities
	loadPurchaseData,
	backupPurchaseData,
	deletePurchaseItem,
	deletePurchaseRecordById,
	syncPurchaseData
} from './purchase-tracker.remote';

// Remote functions for medication tracker
export {
	loadMedicationData,
	backupMedicationData,
	syncMedicationData,
	deleteMedicationSession,
	deleteMedication,
	deleteMedicationLog,
	updateMedicationLog,
	createMedicationLog,
	updateMedicationSession,
	createMedicationSession
} from './medication-tracker.remote';

// Remote functions for smoke-free tracker
export {
	loadSmokeFreeData,
	backupSmokeFreeData,
	syncSmokeFreeData
} from './smoke-free-tracker.remote';

// Remote functions for profile management
export {
	getUserProfile,
	getUserPasswords,
	updateProfile,
	updatePassword,
	deleteAccount
} from './profile.remote';

// Remote functions for note taker
export {
	getNotes,
	createNoteForm,
	updateNoteForm,
	deleteNote,
	syncNoteData
} from './note-taker.remote';

// Remote functions for scenario tracker
export {
	// Query
	getScenarioData,
	// Settings
	updateScenarioSettings,
	// Options
	addScenarioOption,
	updateScenarioOption,
	deleteScenarioOption,
	// Activities
	addScenarioActivity,
	updateScenarioActivity,
	deleteScenarioActivity,
	// Timeline
	addScenarioTimelineEntry,
	updateScenarioTimelineEntry,
	deleteScenarioTimelineEntry,
	// Risks
	addScenarioRisk,
	updateScenarioRisk,
	deleteScenarioRisk,
	// Initialization
	initializeScenarioDefaults
} from './scenario-tracker.remote';

// Remote functions for currency converter
export {
	getCurrencies,
	getCurrencyInfo,
	convertCurrencyForm,
	type CurrencyInfo
} from './currency.remote';
