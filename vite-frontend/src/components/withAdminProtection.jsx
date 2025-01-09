import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, getUserRole } from '../firebaseConfig';

const withAdminProtection = (WrappedComponent) => {
  return (props) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
      const checkAdmin = async () => {
        const user = auth.currentUser;
        if (user) {
          const role = await getUserRole(user.uid);
          if (role === 'admin') {
            setIsAdmin(true);
          } else {
            navigate('/not-authorized');
          }
        } else {
          navigate('/login');
        }
      };

      checkAdmin();
    }, [navigate]);

    return isAdmin ? <WrappedComponent {...props} /> : null;
  };
};

export default withAdminProtection;
