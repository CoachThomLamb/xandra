const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized elsewhere
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Internal function for assigning a workout template to a user
 * Not exposed as an HTTP endpoint - can only be called from other Firebase functions
 * 
 * @param {string} templateId - The ID of the workout template to assign
 * @param {string} userId - The user ID to assign the workout to
 * @param {string} dueDate - ISO string for the workout due date
 * @returns {Promise<{success: boolean, workoutId: string}>} Result object with the new workout ID
 */
async function assignTemplateToUser(templateId, userId, dueDate) {
  if (!templateId || !userId || !dueDate) {
    throw new Error('Missing required parameters: templateId, userId, or dueDate');
  }

  try {
    const db = admin.firestore();
    
    // Get the template document
    const templateDoc = await db.collection('workout-templates').doc(templateId).get();
    if (!templateDoc.exists) {
      throw new Error('Workout template not found');
    }
    
    const templateData = templateDoc.data();

    // Create the new workout for the user
    const programmingRef = db.collection('users').doc(userId).collection('workouts');
    const newWorkoutRef = await programmingRef.add({
      title: templateData.title,
      coachNotes: templateData.coachNotes || '',
      completed: false,
      assignedDate: new Date().toISOString(),
      dueDate: new Date(dueDate).toISOString()
    });

    // Copy exercises from the template
    const exercisesCollection = db.collection('workout-templates').doc(templateId).collection('exercises');
    const exercisesSnapshot = await exercisesCollection.get();
    
    for (const exerciseDoc of exercisesSnapshot.docs) {
      const exerciseData = exerciseDoc.data();
      
      if (exerciseData.id === undefined) {
        throw new Error('Invalid exercise data: exerciseId is undefined');
      }
      
      // Add the exercise to the user's workout
      const newExerciseRef = await newWorkoutRef.collection('exercises').add({
        name: exerciseData.name,
        orderBy: exerciseData.orderBy || 0,
        exerciseId: exerciseData.id,
        videoURL: exerciseData.videoURL || '',
        coachNotes: exerciseData.coachNotes || ''
      });
      
      // Copy sets for this exercise
      const setsCollection = exerciseDoc.ref.collection('sets');
      const setsSnapshot = await setsCollection.get();
      
      for (const setDoc of setsSnapshot.docs) {
        const setData = setDoc.data();
        await newExerciseRef.collection('sets').add(setData);
      }
    }
    
    return { 
      success: true, 
      workoutId: newWorkoutRef.id
    };
  } catch (error) {
    console.error('Error assigning workout template:', error);
    throw error;
  }
}

// Export the function to be used by other Firebase functions
module.exports = {
  assignTemplateToUser
};