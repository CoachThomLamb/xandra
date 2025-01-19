import React, { useState } from 'react';
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
  const [meals, setMeals] = useState([]);

  const addFoodItem = () => {
    const newFoodItem = {
      foodItem,
      servingSize,
      protein,
      carbs,
      calories,
      fat,
    };
    setMeals([...meals, { mealName, foodItems: [newFoodItem] }]);
    setFoodItem('');
    setServingSize('');
    setProtein('');
    setCarbs('');
    setCalories('');
    setFat('');
    setMealName('');
  };

  const saveMeals = async () => {
    try {
      await setDoc(doc(db, 'users', userId, 'food', 'meals'), { meals });
    } catch (error) {
      console.error('Error saving meals:', error);
    }
  };

  return (
    <div className="user-food-container">
      <h1>Food Plan {userId}</h1>
      <div>
        <table className="food-table">
          <thead>
            <tr>
              <td><input type="text" placeholder="Food Item" value={foodItem} onChange={(e) => setFoodItem(e.target.value)} /></td>
            </tr>
            <tr>
              <th>Serving Size (g)</th>
              <th>Protein (g)</th>
              <th>Carbs (g)</th>
              <th>Calories</th>
              <th>Fat (g)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><input type="text" placeholder="Serving Size (g)" value={servingSize} onChange={(e) => setServingSize(e.target.value)} /></td>
              <td><input type="text" placeholder="Protein (g)" value={protein} onChange={(e) => setProtein(e.target.value)} /></td>
              <td><input type="text" placeholder="Carbs (g)" value={carbs} onChange={(e) => setCarbs(e.target.value)} /></td>
            
            
              <td><input type="text" placeholder="Calories" value={calories} onChange={(e) => setCalories(e.target.value)} /></td>
              <td><input type="text" placeholder="Fat (g)" value={fat} onChange={(e) => setFat(e.target.value)} /></td>
            </tr>
            <tr>
              <td><button onClick={addFoodItem}>Add Food Item</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <h2>Meals</h2>
        <table className="meals-table">
          <thead>
            <tr>
              <th>Meal Name</th>
              <th>Food Item</th>
              <th>Serving Size (g)</th>
              <th>Protein (g)</th>
              <th>Carbs (g)</th>
              <th>Calories</th>
              <th>Fat (g)</th>
            </tr>
          </thead>
          <tbody>
            {meals.map((meal, index) => (
              <React.Fragment key={index}>
                {meal.foodItems.map((item, idx) => (
                  <tr key={idx}>
                    {idx === 0 && (
                      <td rowSpan={meal.foodItems.length}>{meal.mealName}</td>
                    )}
                    <td>{item.foodItem}</td>
                    <td>{item.servingSize}</td>
                    <td>{item.protein}</td>
                    <td>{item.carbs}</td>
                    <td>{item.calories}</td>
                    <td>{item.fat}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        <button onClick={saveMeals}>Save Meals</button>
      </div>
    </div>
  );
};

export default UserFood;
