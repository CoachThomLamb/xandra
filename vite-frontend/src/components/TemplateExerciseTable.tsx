import React, { ChangeEvent } from 'react';
import { ExerciseInstance, Set } from '../types/workout';
import ExerciseAutoComplete from './ExerciseAutoComplete';

interface TemplateExerciseTableProps {
  exercises: ExerciseInstance[];
  updateSet: (exerciseIndex: number, setIndex: number, field: keyof Set, value: number) => void;
  onExerciseChange: (index: number, field: keyof ExerciseInstance, value: string) => void;
  addSet: (exerciseIndex: number) => void;
}

const TemplateExerciseTable: React.FC<TemplateExerciseTableProps> = ({
  exercises,
  updateSet,
  onExerciseChange,
  addSet,
}) => {
  return (
    <div>
      {exercises.map((exercise, i) => (
        <div key={i} style={{ marginBottom: '20px' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '10px' }}>
            <tbody>
              <tr>
                <td colSpan={3} style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f5f5f5' }}>
                  <ExerciseAutoComplete
                    exercise={exercise}
                    index={i}
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
                      const updated = [...exercises];
                      updated[i] = { ...updated[i], coachNotes: e.target.value };
                      onExerciseChange(i, 'coachNotes', e.target.value);
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
                      onChange={(e: ChangeEvent<HTMLInputElement>) => updateSet(i, j, 'reps', Number(e.target.value))}
                      style={{ width: '50px' }}
                    />
                  </td>
                  <td style={{ border: '1px solid black', padding: '8px' }}>
                    <input
                      type="number"
                      value={set.load || ''}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => updateSet(i, j, 'load', Number(e.target.value))}
                      style={{ width: '50px' }}
                    />
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={3} style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                  <button onClick={() => addSet(i)}>Add Set</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default TemplateExerciseTable;
