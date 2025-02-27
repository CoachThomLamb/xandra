import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Workout } from '../types/workout'; // Import Workout interface

interface UserWeeklyWorkoutsProps {
    userId: string;
}

const UserWeeklyWorkouts: React.FC<UserWeeklyWorkoutsProps> = ({ userId }) => {
    const [workouts, setWorkouts] = useState<Workout[]>([]);

    useEffect(() => {
        const fetchWorkouts = async () => {
            const workoutsCollection = collection(db, 'users', userId, 'workouts');
            const workoutsQuery = query(
                workoutsCollection,
                orderBy('completedAt', 'desc'),
                limit(6)
            );

            const querySnapshot = await getDocs(workoutsQuery);
            // Ensure typesafety by explicitly destructuring only the fields in Workout
            const workoutsData: Workout[] = querySnapshot.docs.map(doc => {
                const data = doc.data() as Workout;
                const { title, date, completedAt, exercises } = data;
                return { id: doc.id, title, date, completedAt, exercises };
            });
            setWorkouts(workoutsData);
        };

        fetchWorkouts();
    }, [userId]);

    return (
        <div>
            {workouts.length > 0 ? (
                workouts.map(workout => (
                    <div key={workout.id}>
                        <h3>{workout.title || 'Untitled Workout'}</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Exercise</th>
                                    <th>Reps</th>
                                    <th>Sets</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workout.exercises && workout.exercises.length ? (
                                    workout.exercises.map(exercise => (
                                        <tr key={exercise.id}>
                                            <td>
                                                {workout.date 
                                                  ? new Date((workout.date as any).seconds * 1000).toLocaleDateString() 
                                                  : 'No date'}
                                            </td>
                                            <td>{exercise.name || 'Unnamed Exercise'}</td>
                                            <td>{exercise.reps || 'N/A'}</td>
                                            <td>{exercise.sets || 'N/A'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4}>No exercises found for this workout.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ))
            ) : (
                <p>No workouts found.</p>
            )}
        </div>
    );
};

export default UserWeeklyWorkouts;
