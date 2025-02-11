import React, { ChangeEvent } from 'react';
import { ExerciseInstance, Set } from '../types/workout';

interface ExerciseTableProps {
  exercises: ExerciseInstance[];
  isAdmin: boolean;
  notes: Record<number, string>;
  handleInputChange: (exerciseIndex: number, setIndex: number, field: keyof Set, value: any) => void;
  handleNotesChange: (exerciseIndex: number, value: string) => void;
  handleExerciseVideoUpload: (exerciseIndex: number, file: File) => void;
  deleteSet: (exerciseId: string, setId: string) => void;
  addSet: (exerciseId: string) => void;
  removeExercise: (exerciseId: string) => void;
}

const ExerciseTable: React.FC<ExerciseTableProps> = ({
  exercises,
  isAdmin,
  notes,
  handleInputChange,
  handleNotesChange,
  handleExerciseVideoUpload,
  deleteSet,
  addSet,
  removeExercise,
}) => {
  return (
    <div>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <tbody>
          {exercises.map((exercise, exerciseIndex) => (
            <React.Fragment key={exerciseIndex}>
              <tr>
                <td colSpan="4" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                  {exercise.name}
                  {exercise.videoURL != null && exercise.videoURL.trim() !== '' && (
                    <a
                      href={exercise.videoURL}
                      target="_blank"
                      rel="noreferrer"
                      style={{ marginLeft: '10px' }}
                    >
                      View Demo Video
                    </a>
                  )}
                  {isAdmin && (
                    <button onClick={() => removeExercise(exercise.id)} style={{ marginLeft: '10px', color: 'red' }}>Remove Exercise</button>
                  )}
                </td>
              </tr>
              <tr>
                <td colSpan="4" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                  Coach Notes: {exercise.coachNotes}
                </td>
              </tr>
              <tr>
                <th style={{ border: '1px solid black', padding: '8px' }}>Set</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>Reps</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>Load</th>
                <th style={{ border: '1px solid black', padding: '4px' }}></th>
              </tr>
              {exercise.sets.map((set, setIndex) => (
                <React.Fragment key={`${exerciseIndex}-${setIndex}`}>
                  <tr>
                    <td style={{ border: '1px solid black', padding: '8px' }}>{set.setNumber}</td>
                    <td style={{ border: '1px solid black', padding: '8px' }}>
                      <input
                        type="number"
                        value={set.reps || ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(exerciseIndex, setIndex, 'reps', e.target.value)}
                        style={{ width: '90px' }}
                      />
                    </td>
                    <td style={{ border: '1px solid black', padding: '8px'}}>
                      <input
                        type="number"
                        value={set.load || ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(exerciseIndex, setIndex, 'load', e.target.value)}
                        style={{ width: '65px' }}
                      />
                    </td>
                    <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center', width: '25px' }}>
                      <span
                        onClick={() => handleInputChange(exerciseIndex, setIndex, 'completed', !set.completed)}
                        style={{
                          cursor: 'pointer',
                          color: set.completed ? 'green' : 'black',
                        }}
                      >
                        {set.completed ? '✔️' : '⬜'}
                      </span>
                      <button onClick={() => deleteSet(exercise.id, set.id)}>Delete</button>
                    </td>
                  </tr>
                  {setIndex === exercise.sets.length - 1 && (
                    <>
                      <tr>
                        <td colSpan="4" style={{ border: '1px solid black', padding: '8px' }}>
                          <label>Notes:</label>
                          <textarea
                            value={notes[exerciseIndex] || ''}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleNotesChange(exerciseIndex, e.target.value)}
                            style={{ width: '95%' }}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="4" style={{ border: '1px solid black', padding: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center' }}>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const file = e.target.files?.[0];
                                if (file) handleExerciseVideoUpload(exerciseIndex, file);
                              }}
                              style={{ maxWidth: '200px' }}
                            />
                            {exercise.clientVideoURL && (
                              <a
                                href={exercise.clientVideoURL}
                                target="_blank"
                                rel="noreferrer"
                              >
                                View Your Video
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="4" style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                          <button onClick={() => addSet(exercise.id)}>Add Set</button>
                        </td>
                      </tr>
                    </>
                  )}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExerciseTable;
