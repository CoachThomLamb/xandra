import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';


const UserPosts: React.FC = () => {
  const [users, setUsers] = useState<{ id: string, email: string, role: string }[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, email: data.email, role: data.role };
      });
      setUsers(usersData);
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            <Link to={`/view-posts/${user.id}`}>
              {user.email} - {user.role}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserPosts;