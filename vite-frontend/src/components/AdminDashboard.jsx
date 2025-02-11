import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '../firebaseConfig';
import withAdminProtection from './withAdminProtection';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [workoutTemplates, setWorkoutTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [dueDate, setDueDate] = useState(''); // Add this line

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    };

    const fetchWorkoutTemplates = async () => {
      const querySnapshot = await getDocs(collection(db, 'workout-templates'));
      const templatesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWorkoutTemplates(templatesData);
    };

    fetchUsers();
    fetchWorkoutTemplates();
  }, []);

  const assignTemplateToUser = async (templateId, userId, dueDate) => {
    try {
      const templateDoc = await getDoc(doc(db, 'workout-templates', templateId));
      const templateData = templateDoc.data();

      const programmingRef = collection(db, 'users', userId, 'workouts');
      const newWorkoutRef = await addDoc(programmingRef, {
        title: templateData.title,
        coachNotes: templateData.coachNotes,
        completed: false,
        assignedDate: new Date().toISOString(), // Store assigned date in UTC
        dueDate: new Date(dueDate).toISOString() // Convert due date to UTC
      });

      const exercisesCollection = collection(templateDoc.ref, 'exercises');
      const exercisesSnapshot = await getDocs(exercisesCollection);
      for (const exerciseDoc of exercisesSnapshot.docs) {
        const exerciseData = exerciseDoc.data();
        console.log('Copying exercise:', exerciseData);
        if (exerciseData.id === undefined) {
          throw new Error('Invalid exercise data: exerciseId is undefined');
        }
          const newExerciseRef = await addDoc(collection(newWorkoutRef, 'exercises'), {
          name: exerciseData.name,
          orderBy: exerciseData.orderBy, // Ensure orderBy is copied correctly
          exerciseId: exerciseData.id, 
          videoURL: exerciseData.videoURL || '',
          coachNotes: exerciseData.coachNotes || '' // Ensure coachNotes is copied
        });
        // console.log('Copied orderBy:', newExerciseRef.data().orderBy);

        const setsCollection = collection(exerciseDoc.ref, 'sets');
        const setsSnapshot = await getDocs(setsCollection);
        for (const setDoc of setsSnapshot.docs) {
          const setData = setDoc.data();
          await addDoc(collection(newExerciseRef, 'sets'), setData);
        }
      }

      console.log('Workout template assigned to user');
    } catch (error) {
      console.error('Error assigning workout template to user:', error);
      alert(`Error assigning workout template to user: ${error.message}`);
    }
  };

  const handleAssignTemplate = async () => {
    if (selectedTemplate && selectedUser && dueDate) {
      await assignTemplateToUser(selectedTemplate, selectedUser, dueDate); // Update this line
      alert('Workout template assigned successfully');
    } else {
      alert('Please select a user, a workout template, and a due date');
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h2>Assign Workout Template</h2>
      <div>
        <label>Select User:</label>
        <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
          <option value="">Select a user</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.email}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Due Date:</label>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /> {/* Add this line */}
      </div>
      <div>
        <label>Select Workout Template:</label>
        <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
          <option value="">Select a template</option>
          {workoutTemplates.map(template => (
            <option key={template.id} value={template.id}>{template.title}</option>
          ))}
        </select>
      </div>
      <button onClick={handleAssignTemplate}>Assign Template</button>
      <h2>Users</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            <Link to={`/user-workouts/${user.id}`}>
              {user.email} - {user.role}
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/workout-template-builder">
        <button>Create Workout Template</button>
      </Link>
    </div>
  );
};

export default withAdminProtection(AdminDashboard);
