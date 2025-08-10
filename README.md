# Chat AI - Full-Stack Web Application

A modern full-stack web application featuring Firebase authentication with Google login and AI-powered chat functionality using OpenRouter API.

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd "Chat AI"

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install

# 4. Setup Firebase and environment variables (see detailed setup below)

# 5. Start the backend server
cd ../backend
npm run dev

# 6. Start the frontend (in a new terminal)
cd frontend
npm start

# 7. Open http://localhost:3000
```

**Firebase Authentication with Google Login is now integrated!** ✨

## 🚀 Features

- **Firebase Authentication**
  - Google OAuth login integration
  - Email/password authentication
  - Password reset functionality
  - Firebase Admin SDK for backend verification
  - Protected routes and middleware
  - Beautiful modern UI design with custom Google login button

- **AI Chat Interface**
  - Real-time chat with OpenRouter AI (GPT-4.1-mini)
  - Conversation history and context
  - Responsive chat UI with message timestamps
  - Loading states and error handling
  - Detailed API call logging

- **Modern Tech Stack**
  - Frontend: React 18 with React Router
  - Backend: Node.js with Express
  - Database: PostgreSQL with connection pooling
  - Authentication: Firebase Auth + JWT tokens
  - AI Integration: OpenRouter API
  - **Dual Server Setup**: Frontend (port 3000) + Backend (port 5000)

## 📁 Project Structure

```
Chat AI/
├── backend/
│   ├── config/
│   │   ├── database.js              # PostgreSQL configuration
│   │   ├── firebase-admin.js        # Firebase Admin SDK setup
│   │   └── firebase-service-account.json  # Firebase service account key
│   ├── controllers/
│   │   ├── authController.js        # Firebase authentication logic
│   │   └── chatController.js        # OpenRouter AI integration
│   ├── middleware/
│   │   └── auth.js                  # Firebase token verification middleware
│   ├── models/
│   │   └── User.js                  # User model with Firebase fields
│   ├── routes/
│   │   ├── auth.js                  # Auth routes (Firebase integration)
│   │   └── chat.js                  # Chat routes
│   ├── .env                         # Backend environment variables
│   ├── .env.example                 # Environment template
│   ├── package.json
│   └── server.js                    # Express server
├── frontend/
│   ├── build/                       # Production build (auto-generated)
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.js    # Route protection
│   │   ├── config/
│   │   │   └── firebase.js          # Firebase client configuration
│   │   ├── context/
│   │   │   └── AuthContext.js       # Firebase auth context
│   │   ├── pages/
│   │   │   ├── Auth.css             # Beautiful auth form styles
│   │   │   ├── Chat.js              # Chat interface
│   │   │   ├── Login.js             # Login with Google button
│   │   │   └── Signup.js            # Signup form
│   │   ├── App.js
│   │   └── index.js
│   ├── .env                         # Frontend environment variables
│   └── package.json
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (local installation or cloud service)
- Firebase project with Authentication enabled
- OpenRouter API key

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd "Chat AI"
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Setup Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password" provider
   - Enable "Google" provider and configure OAuth consent screen
4. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll down to "Your apps" and click "Web app" icon
   - Copy the Firebase configuration object

### 4. Setup Firebase Admin SDK

1. Go to Project Settings > Service accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Place it in `backend/config/` directory as `firebase-service-account.json`

### 5. Setup PostgreSQL Database

Make sure PostgreSQL is running and create a database:

```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE chatai;
CREATE USER chatai_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE chatai TO chatai_user;
```

Or use the default postgres user (the app will auto-create the database).

### 6. Environment Configuration

#### Backend Environment (.env)

Create or update `backend/.env` file:

```env
# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chatai
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_12345

# OpenRouter API (UPDATE THIS WITH YOUR KEY)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
```

#### Frontend Environment

Create `frontend/.env` file with your Firebase config:

```env
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 7. Get OpenRouter API Key

1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for an account
3. Navigate to the API Keys section
4. Create a new API key
5. Update `OPENROUTER_API_KEY` in the backend `.env` file

### 8. Run the Application

#### Option 1: Run Both Servers Separately (Recommended for Development)

```bash
# Terminal 1: Start backend server
cd backend
npm run dev

# Terminal 2: Start frontend server
cd frontend
npm start
```

#### Option 2: Production Build

```bash
# Build frontend for production
cd frontend
npm run build

# Start backend server (serves built frontend)
cd ../backend
npm start
```

**The application will be available at:**
- **Frontend**: http://localhost:3000 (development) or http://localhost:5000 (production)
- **Backend API**: http://localhost:5000/api/*

## 🔧 API Endpoints

### Authentication Routes

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Chat Routes

- `POST /api/chat` - Send message to AI (protected)
- `GET /api/chat/models` - Get available AI models (protected)

### Health Check

- `GET /api/health` - Server health check

## 🗄️ Database Schema (PostgreSQL)

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),                    -- Optional for Firebase users
  firebase_uid VARCHAR(255) UNIQUE,         -- Firebase user ID
  display_name VARCHAR(255),                -- User's display name
  photo_url TEXT,                          -- Profile picture URL
  provider VARCHAR(50) DEFAULT 'email',    -- Auth provider (email, google)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

The database tables are automatically created when you first run the application!

## 🔐 Security Features

- Firebase Authentication with Google OAuth
- Firebase Admin SDK for server-side token verification
- JWT token authentication for API access
- Protected API routes with Firebase middleware
- Input validation and sanitization
- CORS configuration
- Environment variable protection
- Secure password reset via Firebase

## 🎨 UI Features

- **Beautiful Modern Design**: Inspired by premium UI libraries
- **Custom Google Login Button**: Styled with official Google branding
- **Responsive Design**: Works perfectly on mobile and desktop
- **Gradient Backgrounds**: Stunning visual effects
- **Smooth Animations**: Hover effects and transitions
- **Loading States**: Visual feedback for all operations
- **Toast Notifications**: User-friendly error and success messages
- **Auto-scrolling Chat**: Seamless conversation flow
- **Firebase Integration**: Google OAuth and password reset modals

## 🚀 Deployment

### Production Deployment

1. **Build the frontend**: `cd frontend && npm run build`
2. **Set environment variables** on your hosting platform
3. **Upload Firebase service account key** to backend/config/
4. **Ensure PostgreSQL is accessible**
5. **Deploy to platforms** like Heroku, Railway, DigitalOcean, or AWS

### Environment Variables for Production

#### Backend (.env)
```env
DB_HOST=your_postgres_host
DB_PORT=5432
DB_NAME=chatai
DB_USER=your_db_user
DB_PASSWORD=your_db_password
OPENROUTER_API_KEY=your_openrouter_key
JWT_SECRET=your_long_random_secret
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
```

#### Frontend (.env)
```env
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## 🛠️ Development

### Available Scripts

```bash
# Backend directory
npm start               # Start production server
npm run dev             # Start development server with nodemon

# Frontend directory
npm start               # Start development server (port 3000)
npm run build           # Build for production
npm test                # Run tests
npm run eject           # Eject from Create React App
```

### Code Structure

- **Backend**: RESTful API with Express.js
- **Frontend**: React with functional components and hooks
- **Authentication**: Firebase Auth with Google OAuth
- **State Management**: React Context API + Firebase Auth state
- **Routing**: React Router v6
- **Styling**: Modern CSS with gradients and animations
- **HTTP Client**: Axios
- **Database**: PostgreSQL with connection pooling
- **Architecture**: Separate frontend and backend servers

## 🔍 Troubleshooting

### Common Issues

1. **Firebase Authentication Error**
   - Check Firebase configuration in frontend `.env`
   - Verify Firebase service account key is in `backend/config/`
   - Ensure Google OAuth is enabled in Firebase Console
   - Check browser console for Firebase errors

2. **PostgreSQL Connection Error**
   - Ensure PostgreSQL is running: `pg_ctl status`
   - Check connection details in backend `.env`
   - Verify database exists (app auto-creates it)

3. **OpenRouter API Error**
   - Verify API key is correct in backend `.env`
   - Check API quota and billing at OpenRouter.ai
   - Model used: `openai/gpt-4.1-mini`

4. **Port Already in Use**
   - Kill existing processes: `taskkill /f /im node.exe` (Windows)
   - Or change PORT in backend `.env`

5. **CORS Issues**
   - Ensure FRONTEND_URL in backend `.env` matches frontend URL
   - Check if both servers are running on correct ports

6. **Firebase Token Issues**
   - Clear browser localStorage and login again
   - Check Firebase token expiration
   - Verify Firebase Admin SDK setup

### Debug Mode

The app includes detailed logging for:
- Firebase authentication flow
- OpenRouter API calls (request payload, response, token usage)
- Database operations
- Error details

Check both frontend (browser console) and backend (terminal) logs.

### Quick Reset

If something goes wrong:
```bash
# Kill all Node processes
taskkill /f /im node.exe

# Restart both servers
cd backend && npm run dev
# In another terminal:
cd frontend && npm start
```

## ✨ What's New in This Version

- **🔥 Firebase Authentication**: Google OAuth and email/password login
- **🎨 Custom Google Button**: Official Google branding and styling
- **🔐 Enhanced Security**: Firebase Admin SDK for token verification
- **📱 Password Reset**: Firebase-powered forgot password functionality
- **🐘 PostgreSQL**: Robust database with Firebase user fields
- **📊 Detailed Logging**: Firebase auth flow and OpenRouter API calls
- **📱 Mobile Responsive**: Perfect on all devices

## 🎯 Quick Start (TL;DR)

1. **Clone**: `git clone <repo-url> && cd "Chat AI"`
2. **Install**: `cd backend && npm install && cd ../frontend && npm install`
3. **Setup Firebase**: Create project, enable auth, get config
4. **Setup Environment**: Create `.env` files with Firebase config
5. **Setup PostgreSQL**: Make sure it's running
6. **Add OpenRouter Key**: Update backend `.env` file
7. **Run Backend**: `cd backend && npm run dev`
8. **Run Frontend**: `cd frontend && npm start`
9. **Open**: http://localhost:3000

That's it! 🎉

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions, please open an issue in the repository.

---

**Happy Coding! 🚀**

*Built with ❤️ using React, Node.js, PostgreSQL, and OpenRouter AI*