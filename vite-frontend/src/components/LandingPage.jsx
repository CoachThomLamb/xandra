import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => (
  <div className="landing-container">
    <section className="hero">
      <h1>Wilo.ai</h1>
      <p>Trainers create workouts.</p>
      <p>Clients complete them.</p>
      <p>Progress tracked.</p>
      <p>AI learns and suggests.</p>
      <p>Simple as that.</p>
    </section>

    <section className="update">
      <h2>Update Feb 7 - 2025</h2>
      
      <p>Thanks for being a part of Wilo.ai!</p>

      <h3>Today, Wilo allows me to:</h3>
      <ul>
        <li>Create programs and upload coaching videos</li>
        <li>Assign workouts and track completion</li>
        <li>Review client workout videos, performance, and exercise notes to update programs</li>
      </ul>

      <h3>Key Principles:</h3>
      <ul>
        <li>Enhance communication between clients and coaches</li>
        <li>Minimize cognitive load by making it easy for clients to follow and check off workout programs</li>
        <li>Encourage adherence by making program changes a bit more involved, reducing overthinking</li>
      </ul>

      <h3>Client Insights:</h3>
      <p>Maude, a successful triathlete, suggested trainers handle program modifications to enhance communication.</p>

      <h3>Development Focus:</h3>
      <ul>
        <li>Pause on new features to refactor, log, and test the app for resilience</li>
        <li>Explore partnerships with online coaches to refine Wilo's offerings</li>
      </ul>
    </section>
  </div>
);

export default LandingPage;
