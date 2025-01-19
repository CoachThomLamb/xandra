import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const UserNutrition = () => {
  const { userId } = useParams();
//   const [nutrition, setNutrition] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchNutrition = async () => {
//       try {
//         const nutritionDoc = await getDoc(doc(db, 'users', userId, 'nutrition'));
//         if (nutritionDoc.exists()) {
//           setNutrition(nutritionDoc.data());
//         } else {
//           setError('Nutrition data not found');
//         }
//       } catch (error) {
//         console.error('Error fetching nutrition data:', error);
//         setError('Error fetching nutrition data. Please try again later.');
//       }
//     };

//     fetchNutrition();
//   }, [userId]);

//   if (error) {
//     return <div>{error}</div>;
//   }

//   if (!nutrition) {
//     return <div>Loading...</div>;
//   }

  return (
    <div>
      <h1>Nutrition Plan  {userId} </h1>
      {/* <p>{nutrition.plan}</p> */}
    </div>
  );
};

export default UserNutrition;
