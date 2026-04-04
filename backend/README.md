# Synapse AI Backend

Node.js API server with PostgreSQL database for user authentication and course data persistence.

## Quick Start

### 1. Setup Backend

```bash
cd backend

# Run setup script to create all files
node setup.js

# Install dependencies
npm install
```

### 2. Configure Database

1. Install PostgreSQL if not already installed
2. Create a database:
   ```sql
   CREATE DATABASE synapse_ai;
   ```
3. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```
4. Edit `.env` with your database credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=synapse_ai
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your-secure-random-string
   ```

### 3. Run Migrations

```bash
npm run db:migrate
```

### 4. Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs on http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `PUT /api/auth/profile` - Update profile (requires auth)

### Courses
- `POST /api/courses` - Create new course
- `GET /api/courses` - List user's courses
- `GET /api/courses/:id` - Get course with progress
- `PUT /api/courses/:id` - Update course chapters
- `PUT /api/courses/:id/progress` - Update progress
- `DELETE /api/courses/:id` - Delete course

### Quiz
- `POST /api/quiz` - Save quiz result
- `GET /api/quiz/stats` - Get quiz statistics
- `GET /api/quiz/all` - Get all quiz history
- `GET /api/quiz/course/:courseId` - Get course quiz history

## Database Schema

- **users**: id, email, password_hash, name, avatar_url
- **courses**: id, user_id, title, description, chapters_data (JSONB)
- **course_progress**: id, course_id, current_chapter, visited_chapters
- **quiz_history**: id, course_id, score, total_questions, answers_data

## Frontend Integration

Add to your frontend `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

The frontend uses:
- `src/api/backend.js` - API service layer
- `src/context/AuthContext.jsx` - Authentication state
- `src/hooks/useCourseSync.js` - Course data sync hook
