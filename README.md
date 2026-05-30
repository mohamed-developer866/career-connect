# Career Connect

AI-powered job placement platform for students, employers, and colleges.

## Features

- 🎓 Student Dashboard with learning progress
- 💼 Job Board with AI-powered matching
- 🏢 Employer Portal for job posting
- 🏛️ College Admin Panel for approval workflow
- 💬 Real-time messaging system
- 📄 Resume builder and tracking

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** SQLite + Prisma ORM
- **Real-time:** Socket.io

## Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/career-connect.git

# Install dependencies
cd career-connect
npm install --prefix client
npm install --prefix server

# Setup database
cd server
npx prisma migrate dev

# Run both servers
npm run dev --prefix client
npm run dev --prefix server