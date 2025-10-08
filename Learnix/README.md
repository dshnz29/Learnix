# Learnix Project

Learnix is an interactive learning platform designed to enhance user performance through quizzes, analytics, and AI tutoring. The system is built using a combination of frontend and backend technologies, leveraging Firestore for data storage and management.

## Features

- **Quiz Generation**: Create and manage quizzes tailored to user needs.
- **Performance Tracking**: Analyze user performance over time with detailed reports and analytics.
- **AI Tutor**: Engage with an AI tutor for personalized learning experiences and recommendations.
- **Adaptive Learning**: Generate quizzes that adapt to user performance, targeting areas for improvement.
- **Analytics and Reporting**: Access comprehensive analytics and reports to track progress and performance.

## Project Structure

### Client

The client-side application is built using React and Next.js, organized as follows:

- **src/app**: Contains the main application pages.
  - **dashboard**: Overview of user performance and access to features.
    - **analytics**: Visualizations of user performance.
    - **reports**: Generates and displays performance reports.
    - **tutor**: Access to AI tutor features.
    - **adaptive-quiz**: Manages adaptive quiz generation.
  - **quiz**: Handles quiz interfaces and results.

- **src/components**: Reusable components for analytics, tutor interactions, quizzes, and reports.

- **src/services**: Services for handling interactions with analytics, attempts, AI tutor, adaptive quizzes, and report generation.

- **src/utils**: Utility functions for performance calculations, difficulty adjustments, and learning path generation.

### Backend

The backend is structured into two parts: Node.js and Python services.

#### Node.js

- **routes**: Defines API routes for analytics, attempts, tutor interactions, adaptive quizzes, and reports.
- **services**: Contains logic for processing analytics, tracking attempts, managing AI tutor interactions, and generating reports.
- **models**: Defines data models for quiz attempts, user progress, tutor conversations, and learning analytics.
- **utils**: Utility functions for performance analysis and difficulty calculations.

#### Python

- **ai_services**: Contains AI-related services for tutoring, quiz generation, performance analysis, and adaptive learning.
- **analytics**: Handles learning analytics and user progress tracking.
- **models**: Defines data models for quizzes and users.

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/Learnix.git
   ```

2. Navigate to the client directory and install dependencies:
   ```
   cd client
   npm install
   ```

3. Set up environment variables in `.env.local` for Firebase configuration.

4. Start the client application:
   ```
   npm run dev
   ```

5. Navigate to the backend directory and install dependencies:
   ```
   cd backend-node
   npm install
   ```

6. Start the backend server:
   ```
   node server.js
   ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.