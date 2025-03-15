import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { assignTemplateToUser } from './assignWorkoutTemplate';

// Initialize Firebase Admin SDK
admin.initializeApp();
const templateId: string = '24HGcYNxcjpDjrHhYV11';

/**
 * Firebase function that triggers when a new user is created in Firebase Auth
 * Performs additional tasks like creating a client account and assigning a workout
 */
export const onUserCreate = functions.auth.user().onCreate(async (user: admin.auth.UserRecord) => {
  try {
    // Log the new user creation
    console.log(`New user created: ${user.uid}, email: ${user.email}`);
    const dueDate = new Date(); // Due date is today, can be customized 
    
    // Create a client account in your backend
    await createClientAccount(user);
    
    // Assign initial workout to the user
    console.log(`Assigning workout template ${templateId} to user: ${user.uid}`);
    await assignTemplateToUser(templateId, user.uid, dueDate);
    
    // Additional post-registration tasks can be added here
    
    return { success: true, message: "User onboarding completed successfully" };
  } catch (error) {
    console.error('Error processing new user:', error);
    return { success: false, message: "Failed to complete user onboarding" }; 
  }
});

/**
 * Create a client account on your backend system
 */
async function createClientAccount(user: admin.auth.UserRecord): Promise<void> {
  // Example implementation - replace with your actual API call
  console.log(`Creating client account for user: ${user.uid}`);
  await admin.firestore().collection('users').doc(user.uid).set({
    email: user.email,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    // Add any other fields you need to store for the user
  });

  
}

/**
 * Assign an initial workout to the new user
 */
/**
 * Assign an initial workout to the new user
 */
