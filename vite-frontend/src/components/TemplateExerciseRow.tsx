import React, { ChangeEvent } from 'react';
import { ExerciseInstance, Set } from '../types/workout';
import ExerciseAutoComplete from './ExerciseAutoComplete';

interface TemplateExerciseRowProps {
  exercise: ExerciseInstance;
  index: number;
  onExerciseChange: (index: number, field: keyof ExerciseInstance, value: string) => void;
  updateSet: (exerciseIndex: number, setIndex: number, field: keyof Set, value: number) => void;
  addSet: (exerciseIndex: number) => void;
  setExercises: React.Dispatch<React.SetStateAction<ExerciseInstance[]>>;
}

const TemplateExerciseRow: React.FC<TemplateExerciseRowProps> = ({
  exercise,
  index,
  onExerciseChange,
  updateSet,
  addSet,
  setExercises,
}) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '10px' }}>
        <tbody>
          <tr>
            <td colSpan={3} style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f5f5f5' }}>
              <ExerciseAutoComplete
                exercise={exercise}
                index={index}
                onExerciseChange={onExerciseChange}
              />
            </td>
          </tr>
          <tr>
            <td colSpan={3} style={{ border: '1px solid black', padding: '8px' }}>
              <label>Coach Notes for Exercise: </label>
              <textarea
                value={exercise.coachNotes || ''}
                onChange={(e) => {
                  const updated = (prev: ExerciseInstance[]) => {
                    const newExercises = [...prev];
                    newExercises[index] = { ...newExercises[index], coachNotes: e.target.value };
                    return newExercises;
                  };
                  setExercises(updated);
                }}
                style={{ width: '100%', marginTop: '5px' }}
              />
            </td>
          </tr>
          <tr>
            <th style={{ border: '1px solid black', padding: '8px' }}>Set</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Reps</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Load</th>
          </tr>
          {exercise.sets.map((set, j) => (
            <tr key={j}>
              <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                {set.setNumber}
              </td>
              <td style={{ border: '1px solid black', padding: '8px' }}>
                <input
                  type="number"
                  value={set.reps || ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateSet(index, j, 'reps', Number(e.target.value))}
                  style={{ width: '70px' }}
                />
              </td>
              <td style={{ border: '1px solid black', padding: '8px' }}>
                <input
                  type="number"
                  value={set.load || ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateSet(index, j, 'load', Number(e.target.value))}
                  style={{ width: '70px' }}
                />
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={3} style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
              <button onClick={() => addSet(index)}>Add Set</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TemplateExerciseRow;
