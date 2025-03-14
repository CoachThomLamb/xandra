import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

/**
 * Firebase function that triggers when a new user is created in Firebase Auth
 * Performs additional tasks like creating a client account and assigning a workout
 */
export const onUserCreate = functions.auth.user().onCreate(async (user: admin.auth.UserRecord) => {
  try {
    // Log the new user creation
    console.log(`New user created: ${user.uid}, email: ${user.email}`);
    
    // Create a client account in your backend
    await createClientAccount(user);
    
    // Assign initial workout to the user
    await assignInitialWorkout(user.uid);
    
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
async function assignInitialWorkout(userId: string): Promise<void> {
  // Example implementation - replace with your actual logic
  console.log(`Assigning initial workout to user: ${userId}`);
  
  // TODO: Implement API call to assign a workout
  // Example:
  //lets fetch the workout template we want to assign to a new user 
  // then reproduce the assignement logic here
  
  const defaultWorkoutId = 'workout-beginner-001';
  await admin.firestore().collection('users').doc(userId).collection('workouts').add({
    workoutId: defaultWorkoutId,
    assignedAt: admin.firestore.FieldValue.serverTimestamp(),
    completed: false
  });
}