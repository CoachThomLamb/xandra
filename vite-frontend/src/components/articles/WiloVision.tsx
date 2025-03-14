import './wiloVision.css';

const WiloVision: React.FC = () => {
  return (
    <div className="wilo-article-container">
      <div className="wilo-article-scrollable">
        <div className="wilo-article">
          <h1>Building Wilo AI: My Journey</h1>

          <h2>Introduction</h2>
          <p>When I started building Wilo AI (Wilo.ai), I wanted to create something that bridged the gap between personalized fitness coaching and technology. As someone passionate about both fitness and software development, I saw an opportunity to make quality fitness guidance accessible to everyone, not just those who could afford personal trainers.</p>

          <h2>The Vision</h2>
          <p>The fitness industry has always been fragmented - expensive personal trainers on one end and generic workout apps on the other. I envisioned Wilo as the middle ground: an AI-powered platform that provides personalized workout plans and feedback at a fraction of the cost of traditional coaching.</p>

          <p>Our core value proposition is simple:</p>
          <ul className="core-value">
            <li>Complete workouts with videos and send to Wilo</li>
            <li>Wilo reviews your performance and sends your next workout</li>
            <li>That's it - no complicated apps or confusing interfaces</li>
          </ul>

          <hr />

          <h2>Technical Architecture</h2>

          <h3>Frontend</h3>
          <ul>
            <li><strong>React with TypeScript:</strong> For type safety and better developer experience</li>
            <li><strong>Vite:</strong> For faster build times and modern development features</li>
            <li><strong>Firebase Authentication:</strong> For seamless user login/signup</li>
            <li><strong>Firestore:</strong> For real-time database capabilities</li>
          </ul>

          <h3>Backend</h3>
          <ul>
            <li><strong>Firebase Functions:</strong> For serverless backend operations</li>
            <li><strong>Firebase Storage:</strong> For storing workout videos and images</li>
            <li><strong>Firebase Hosting:</strong> For deployment</li>
            <li><strong>Github Actions:</strong> To manage CI/CD</li>
          </ul>

          <h3>AI Components</h3>
          <ul>
            <li>Custom trained models for exercise form analysis - In development</li>
            <li>Recommendation system for workout progression - In development</li>
          </ul>

          <hr />

          <h2>Challenges & Solutions</h2>

          <h3>User Onboarding</h3>
          <p>Getting users from signup to their first workout proved challenging. We simplified this by:</p>

          <ul>
            <li>Creating automatic workout assignment upon registration</li>
            <li>Implementing direct redirection to the workout screen after signup</li>
            <li>Designing an intuitive first workout experience with clear instructions and how to videos</li>
          </ul>

          <p>We found that proper strength training forms the essential foundation for all fitness goals. Whether users aim to lose weight, build muscle, improve sports performance, or enhance overall health, strength training is the necessary first step. Many newcomers initially seek specialized programs, but our onboarding process educates them on why building this foundation yields benefits across all fitness objectives while providing accessible entry points tailored to their current abilities.</p>

          <h3>Coach Scaling - In progress</h3>
          <p>Enabling coaches to handle more clients required innovation:</p>

          <ul>
            <li>Built tools for coaches to quickly review multiple workout videos</li>
            <li>Created templates for common feedback scenarios</li>
            <li>Implemented AI assistance to highlight areas needing attention</li>
          </ul>

          <hr />

          <h2>User Journey Design</h2>

          <p>I focused obsessively on the user journey:</p>

          <ol>
            <li><strong>Simple Signup:</strong> One-click Google authentication</li>
            <li><strong>Immediate Value:</strong> First workout available instantly</li>
            <li><strong>Clear Guidance:</strong> Step-by-step instructions for each exercise</li>
            <li><strong>Easy Submission:</strong> Simple video upload process</li>
            <li><strong>Quick Feedback:</strong> Notification when feedback is ready - coming soon!</li>
            <li><strong>Continuous Progression:</strong> Seamless transition to next workout</li>
          </ol>

          <hr />

          <h2>Lessons Learned</h2>

          <h3>Technical Insights</h3>
          <ul>
            <li>Firebase's ecosystem provided a solid foundation but required careful structuring for scale</li>
            <li>While a true mobile app is nice, it slows down development time. Until we have product market fit we use a PWA to provide persistent login and state. This also allows users to install the app on their phone making it more accessible.</li>
            <li>TypeScript paid dividends in maintaining code quality as the project grew</li>
          </ul>

          <h3>Product Insights</h3>
          <ul>
            <li>Users value feedback more than fancy features</li>
            <li>The "coach in your pocket" concept resonated strongly with our target audience</li>
            <li>Simple, focused interactions beat complex dashboards and metrics</li>
          </ul>

          <h3>Business Insights</h3>
          <ul>
            <li>The hybrid model (AI + human coaches) allows for scaling while maintaining quality</li>
            <li>Retention is directly tied to the quality and timeliness of feedback</li>
            <li>Building trust in the first workout experience is crucial for user retention</li>
          </ul>

          <hr />

          <h2>Future Directions</h2>

          <p>As Wilo grows, I'm focused on:</p>

          <ul>
            <li><strong>Enhanced AI Capabilities:</strong> Improving our form detection and feedback algorithms</li>
            <li><strong>Coach Productivity Tools:</strong> Making it easier for coaches to handle more clients</li>
            <li><strong>Mobile Experience:</strong> Developing native apps for iOS and Android</li>
            <li><strong>Integration Ecosystem:</strong> Connecting with wearables and other fitness platforms</li>
            <li><strong>Community Features:</strong> Building supportive communities around fitness goals</li>
          </ul>

          <h2>Conclusion</h2>

          <p>Building Wilo has been a journey of balancing technology and human connection. The platform continues to evolve, but our north star remains the same: making quality fitness coaching accessible to everyone.</p>

          <p>The greatest satisfaction comes from hearing users say, <em>"This feels like having a personal trainer who knows exactly what I need."</em> That's when I know we're on the right track.</p>

          <blockquote>
            "Fitness is a journey, not a destination. We're just making sure you have the right guide along the way."
          </blockquote>
        </div>
      </div>
    </div>
  );
};

export default WiloVision;