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
