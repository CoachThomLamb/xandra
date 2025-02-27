import React from 'react';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import {Post } from '../types/workout';    



const PostsCollection: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    console.log(userId);
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
              console.log('Fetching posts for user:', userId);
              const postsCollection = collection(db, 'users', userId!, 'workout-posts');
              const postsSnapshot = await getDocs(postsCollection);
              console.log('Posts snapshot:', postsSnapshot.docs);
              const postsList = postsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              })) as Post[];
              console.log('Posts list:', postsList);
              setPosts(postsList);
            } catch (error) {
              console.error('Error fetching posts:', error);
            //   setError('Error fetching posts. Please try again later.');
            }
          };
        fetchPosts();
    }, [userId]);

    return (
        <div>
            {posts.map(post => (
                <div key={post.id}>
                    <h2>{post?.title}</h2>
                    <p>{post?.content}</p>
                </div>
            ))}
        </div>
    );
};
const Posts: React.FC = () => {
    return (
        <div>
            Hello World
        </div>
    );
};

export default PostsCollection;