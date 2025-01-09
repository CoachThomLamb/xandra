import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db, assignWorkoutTemplateToUser } from '../firebaseConfig';
import withAdminProtection from './withAdminProtection';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [workoutTemplates, setWorkoutTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

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

  const handleAssignTemplate = async () => {
    if (selectedTemplate && selectedUser) {
      await assignWorkoutTemplateToUser(selectedTemplate, selectedUser);
      alert('Workout template assigned successfully');
    } else {
      alert('Please select a user and a workout template');
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
    </div>
  );
};

export default withAdminProtection(AdminDashboard);
