// Remote functions for authentication
export { getCurrentUser } from './auth.remote';

// Remote functions for password management
export { getSavedPasswords, savePassword, deletePassword } from './password.remote';

// Remote functions for purchase tracker
export {
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

// Remote functions for profile management
export {
	getUserProfile,
	getUserPasswords,
	updateProfile,
	updatePassword,
	deleteAccount
} from './profile.remote';
