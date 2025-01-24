import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ExerciseManagement = () => {
  const [exercises, setExercises] = useState([]);
  const [newExercise, setNewExercise] = useState({ name: '', videoURL: '' });
  const [videoFile, setVideoFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'exercises'));
      const items = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setExercises(items);
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
    }
  };

  const createExercise = async () => {
    let videoURL = '';
    if (videoFile) {
      const storage = getStorage();
      const storageRef = ref(storage, `exercises/${videoFile.name}`);
      await uploadBytes(storageRef, videoFile);
      videoURL = await getDownloadURL(storageRef);
    }
    await addDoc(collection(db, 'exercises'), { ...newExercise, videoURL });
    setNewExercise({ name: '', videoURL: '' });
    setVideoFile(null);
    fetchExercises();
  };

  const updateExercise = async (exerciseId, updatedData) => {
    await updateDoc(doc(db, 'exercises', exerciseId), updatedData);
    fetchExercises();
  };

  const deleteExercise = async (exerciseId) => {
    await deleteDoc(doc(db, 'exercises', exerciseId));
    fetchExercises();
  };

  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="exercise-container">
      <h2>Exercise Management</h2>
      <div>
        <input
          type="text"
          placeholder="Exercise Name"
          value={newExercise.name}
          onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
        />
        <input 
          type="file"
          accept="video/*"
          onChange={(e) => setVideoFile(e.target.files[0])}
        />
        <button onClick={createExercise}>Create Exercise</button>
      </div>
      <input
        type="text"
        placeholder="Search exercises..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <ul style={{}}>
        {filteredExercises.map((ex) => (
          <li key={ex.id} className="exercise-row-group">
            <span className="exercise-row">{ex.name}</span>
            {ex.videoURL && <a href={ex.videoURL} target="_blank" rel="noreferrer">View Video</a>}
            <button onClick={() => deleteExercise(ex.id)} className='exercise-row'>Delete</button>
            {/* For update, you could use a form or inline editing */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExerciseManagement;
