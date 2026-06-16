# MindfulTrack (Mental Health Tracker)

An AI-powered mental health tracking application that helps users monitor their emotional well-being through journaling, gamified milestones, and advanced AI analysis.

## Features

- **User Authentication & OTP Security**: Secure JWT authentication with an optional in-memory 6-digit OTP verification flow.
- **AI Sentiment Analysis**: Powered by **Google Gemini 2.5 Flash** to analyze mood, sentiment score, tags, and provide customized empathetic feedback.
- **Local Fallback Mode**: Local rule-based keyword matcher that continues working gracefully even if the AI API is rate-limited or offline.
- **Gamified Achievements**: Maintain streaks, earn levels, unlock badges, and set personalized mental health goals.
- **Interactive Sentiment Charts**: Clear, user-friendly graphs mapping sentiment scores (`-1.0` to `1.0`) directly to intuitive emoji ticks (e.g. 😊 Very Positive, 😐 Neutral, 😢 Very Negative).
- **Weekly AI-Generated Summaries**: Context-aware summary of overall trends, recurring themes, positive developments, and self-care recommendations.
- **Server-Side Summary Caching**: Reduces API load and provides consistent summaries across views.

## Tech Stack

- **Frontend**: React + Chart.js + TailwindCSS + Zustand
- **Backend**: Node.js + Express + Mongoose
- **Database**: MongoDB Atlas
- **AI Integration**: Google Generative Language API (Gemini 2.5 Flash)
- **Integration Testing**: Python + requests + `uv` package manager

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas cluster or local MongoDB instance
- Gemini API Key

## Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kartik1003-afs/MindfulTrack.git
   cd MindfulTrack
   ```

2. **Install dependencies**:
   ```bash
   # Install backend dependencies
   npm install

   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Configure Environment Variables**:
   Create a `.env` file inside the `server/` directory:
   ```
   PORT=5000
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-jwt-secret-key
   JWT_REFRESH_SECRET=your-jwt-refresh-secret-key
   GEMINI_API_KEY=your-gemini-api-key
   NODE_ENV=development
   ```

4. **Start the Development Servers**:
   In the root directory, run:
   ```bash
   npm run dev:full
   ```
   This command starts the Node.js API server on port 5000 and the React dev server on port 3000 concurrently.

## Verification & API Testing

The project contains a Python integration test suite to verify the authentication endpoints, OTP flow, journal entry analysis, and weekly summaries.

To run the verification suite using the `uv` package manager:
```bash
uv run test_api.py
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (supports optional `useOTP`)
- `POST /api/auth/login` - Login user (supports optional `useOTP`)
- `POST /api/auth/verify-otp` - Verify 6-digit OTP code
- `POST /api/auth/resend-otp` - Resend verification code
- `POST /api/auth/refresh-token` - Refresh authentication token
- `GET /api/auth/me` - Get current user profile

### Journal & AI
- `POST /api/journal` - Create journal entry (triggers Gemini sentiment analysis)
- `GET /api/journal` - Retrieve all user entries
- `GET /api/journal/weekly-summary` - Generate/Retrieve Cached Weekly AI Summary
- `GET /api/journal/:id` - Fetch specific entry
- `DELETE /api/journal/:id` - Delete entry

## License

This project is licensed under the MIT License.