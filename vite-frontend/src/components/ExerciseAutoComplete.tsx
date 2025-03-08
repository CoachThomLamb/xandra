import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { ExerciseInstance } from '../types/workout';

interface ExerciseAutoCompleteProps {
  exercise: ExerciseInstance;
  index: number;
  onExerciseChange: (index: number, field: keyof ExerciseInstance, value: string) => void;
}

const ExerciseAutoComplete: React.FC<ExerciseAutoCompleteProps> = ({ exercise, index, onExerciseChange }) => {
  const [exerciseNames, setExerciseNames] = useState<{ id: string; name: string; }[]>([]);
  const [filteredNames, setFilteredNames] = useState<{ id: string; name: string; }[]>([]);

  const handleExerciseNameInput = async (index: number, typed: string) => {
    onExerciseChange(index, 'name', typed);
    onExerciseChange(index, 'id', '');

    const filtered = exerciseNames.filter((ex) =>
      ex.name.toLowerCase().includes(typed.toLowerCase())
    );
    setFilteredNames(filtered);

    const found = filtered.find(
      (ex) => ex.name.toLowerCase() === typed.toLowerCase()
    );
    if (found) {
      onExerciseChange(index, 'id', found.id);
    }
  };

  useEffect(() => {
    const exerciseCollection = collection(db, 'exercises');
    const unsubscribe = onSnapshot(exerciseCollection, (snapshot) => {
      const names = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        name: doc.data().name 
      }));
      setExerciseNames(names);
      setFilteredNames(names);
    });
    
    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <label>Exercise Name: </label>
      <input
        type="text"
        list={`exercise-names-${index}`}
        value={exercise.name}
        onChange={(e) => handleExerciseNameInput(index, e.target.value)}
        style={{ width: '60%', marginLeft: '10px' }}
      />
      <datalist id={`exercise-names-${index}`}>
        {filteredNames.map((item, idx) => (
          <option key={idx} value={item.name} />
        ))}
      </datalist>
    </div>
  );
};

export default ExerciseAutoComplete;