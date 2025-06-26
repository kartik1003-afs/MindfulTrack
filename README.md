# Mental Health Tracker

An AI-powered mental health tracking application that helps users monitor their emotional well-being through journaling and AI analysis.

## Features

- User authentication with JWT
- Journal entry system with AI-powered mood analysis
- Sentiment tracking and visualization
- Weekly AI-generated summaries
- Personalized AI suggestions
- Mobile-responsive dashboard

## Tech Stack

- Frontend: React + TailwindCSS
- Backend: Node.js + Express
- Database: MongoDB
- AI: OpenAI GPT-4

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- OpenAI API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd mental-health-tracker
```

2. Install dependencies:
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mental-health-tracker
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
OPENAI_API_KEY=your-openai-api-key
NODE_ENV=development
```

4. Start the development servers:
```bash
# Start both frontend and backend
npm run dev:full

# Or start them separately:
npm run dev     # Backend
npm run client  # Frontend
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/refresh-token` - Refresh access token
- GET `/api/auth/me` - Get current user

### Journal
- POST `/api/journal` - Create new journal entry
- GET `/api/journal` - Get all journal entries
- GET `/api/journal/weekly-summary` - Get weekly summary
- GET `/api/journal/:id` - Get specific entry
- DELETE `/api/journal/:id` - Delete entry

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 