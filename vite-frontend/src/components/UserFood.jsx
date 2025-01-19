import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const UserFood = () => {
  const { userId } = useParams();
  // const [food, setFood] = useState(null);
  // const [error, setError] = useState(null);

  // useEffect(() => {
  //   const fetchFood = async () => {
  //     try {
  //       const foodDoc = await getDoc(doc(db, 'users', userId, 'food'));
  //       if (foodDoc.exists()) {
  //         setFood(foodDoc.data());
  //       } else {
  //         setError('Food data not found');
  //       }
  //     } catch (error) {
  //       console.error('Error fetching food data:', error);
  //       setError('Error fetching food data. Please try again later.');
  //     }
  //   };

  //   fetchFood();
  // }, [userId]);

  // if (error) {
  //   return <div>{error}</div>;
  // }

  // if (!food) {
  //   return <div>Loading...</div>;
  // }

  return (
    <div>
      <h1>Food Plan {userId}</h1>
      {/* <p>{food.plan}</p> */}
    </div>
  );
};

export default UserFood;
