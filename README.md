# Unilink-student-network
UniLink is a full-stack university student networking platform. Students can sign in, create profiles, connect with other students, create posts, join groups, register for events, and receive notifications. Admin users can manage users, reported posts, and pending events.

## Tech Stack

- Frontend: React, React Router, Axios
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Authentication: JWT

## Project Structure

```text
unilink/
  backend/
    controllers/     Request handling and business logic
    middleware/      Authentication and upload middleware
    models/          Mongoose database models
    routes/          API route definitions
    seed.js          Sample data seeding script
    server.js        Express server entry point
  frontend/
    public/          Static public files
    src/
      components/    Reusable React components
      context/       React context providers
      pages/         Application pages
      utils/         API helper files
```

## Prerequisites

Install these before running the project:

- Node.js v18 or above
- MongoDB Community Server
- VS Code

## Environment Files

Create these files if they are missing.

Backend: `backend/.env`

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/unilink
JWT_SECRET=unilink_super_secret_jwt_key_2024
NODE_ENV=development
```

Frontend: `frontend/.env`

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Install Dependencies

Open a terminal in the project root:

```powershell
cd "C:\Users\peera\OneDrive\Documents\unilink"
```

Install backend dependencies:

```powershell
cd backend
npm.cmd install
```

Install frontend dependencies:

```powershell
cd ..\frontend
npm.cmd install
```

If plain `npm` works on your system, you can use `npm` instead of `npm.cmd`.

## Start MongoDB

Open PowerShell as Administrator and run:

```powershell
net start MongoDB
```

If MongoDB is already running, Windows will tell you the service has already started.

## Seed the Database

Run this once from the backend folder:

```powershell
cd "C:\Users\peera\OneDrive\Documents\unilink\backend"
node seed.js
```

This creates sample users, posts, groups, and events.

## Run the App

Terminal 1 - Backend:

```powershell
cd "C:\Users\peera\OneDrive\Documents\unilink\backend"
npm.cmd run dev
```

Backend URL:

```text
http://localhost:5000
```

Terminal 2 - Frontend:

```powershell
cd "C:\Users\peera\OneDrive\Documents\unilink\frontend"
npm.cmd start
```

Frontend URL:

```text
http://localhost:3000
```

## Demo Login

Student:

```text
Email: rahul@unilink.com
Password: password123
```

Admin:

```text
Email: admin@unilink.com
Password: admin123
```


=======
