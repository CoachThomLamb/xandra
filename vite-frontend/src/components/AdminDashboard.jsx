import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import withAdminProtection from './withAdminProtection';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    };

    const fetchWorkouts = async () => {
      const querySnapshot = await getDocs(collection(db, 'workouts'));
      const workoutsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWorkouts(workoutsData);
    };

    fetchUsers();
    fetchWorkouts();
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h2>Users</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.email} - {user.role}</li>
        ))}
      </ul>
      <h2>Workouts</h2>
      <ul>
        {workouts.map(workout => (
          <li key={workout.id}>{workout.title} - {workout.date}</li>
        ))}
      </ul>
    </div>
  );
};

export default withAdminProtection(AdminDashboard);
