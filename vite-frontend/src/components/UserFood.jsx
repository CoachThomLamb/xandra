import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './UserFood.css';

const UserFood = () => {
  const { userId } = useParams();
  const [foodItem, setFoodItem] = useState('');
  const [servingSize, setServingSize] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [calories, setCalories] = useState('');
  const [fat, setFat] = useState('');
  const [mealName, setMealName] = useState('');
  const [foodEntries, setFoodEntries] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [clientName, setClientName] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setClientName(`${userData.firstName} ${userData.lastName}`);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const addFoodItem = () => {
    const newFoodItem = {
      foodItem,
      servingSize,
      protein,
      carbs,
      calories,
      fat,
      date,
    };
    setFoodEntries([...foodEntries, newFoodItem]);
    setFoodItem('');
    setServingSize('');
    setProtein('');
    setCarbs('');
    setCalories('');
    setFat('');
  };

  const saveFoodEntries = async () => {
    try {
      await setDoc(doc(db, 'users', userId, 'foodEntries'), { foodEntries });
    } catch (error) {
      console.error('Error saving food entries:', error);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); // Adjust for timezone offset
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <div className="user-food-container">
      <h1>Food for {clientName}  {formatDate(date)}</h1>
      <div>
        <table className="food-table">
          <thead>
            <tr>
              <td colSpan="4"><input type="text" placeholder="Food Item" value={foodItem} onChange={(e) => setFoodItem(e.target.value)} /></td>
            </tr>
            <tr>
              <th>Size</th>
              <th>Pro</th>
              <th>Carb</th>
              <th>Cals</th>
              <th>Fat</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><input type="number" placeholder="Serving Size (g)" value={servingSize} onChange={(e) => setServingSize(e.target.value)} /></td>
              <td><input type="number" placeholder="Protein (g)" value={protein} onChange={(e) => setProtein(e.target.value)} /></td>
              <td><input type="number" placeholder="Carbs (g)" value={carbs} onChange={(e) => setCarbs(e.target.value)} /></td>
              <td><input type="number" placeholder="Fat (g)" value={fat} onChange={(e) => setFat(e.target.value)} /></td>
              <td><input type="number" placeholder="Calories" value={calories} onChange={(e) => setCalories(e.target.value)} /></td>
            </tr>
            <tr>
              <td colSpan="4"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></td>
            </tr>
            <tr>
              <td colSpan="4" ><button onClick={addFoodItem}>Add Food Item</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <h2>Food (g)</h2>
        <table className="meals-table">
          <thead>
            <tr>
              <th>Food</th>
              <th>Size</th>
              <th>Prot</th>
              <th>Carbs</th>
              <th>Cals</th>
              <th>Fat</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {foodEntries.map((entry, index) => (
              <tr key={index}>
                <td>{entry.foodItem}</td>
                <td>{entry.servingSize}</td>
                <td>{entry.protein}</td>
                <td>{entry.carbs}</td>
                <td>{entry.calories}</td>
                <td>{entry.fat}</td>
                <td>{formatDate(entry.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={saveFoodEntries}>Save Food Entries</button>
      </div>
    </div>
  );
};

export default UserFood;
