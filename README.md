# 🌙 Luna Tuition Center Management System

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

A production-ready, full-stack Tuition Management System designed to bridge the gap between educators and parents. The platform features an automated, gamified **Luna Stars Rewards Engine**, role-based portals, digital worksheet distribution, and an integrated tuition fee management system.

---

## 🚀 Live Demo

- **Frontend (Vercel):** [https://luna-tuition-center.vercel.app](https://luna-tuition-center.vercel.app)
- **Backend (Render):** [https://luna-tuition-center.onrender.com](https://luna-tuition-center.onrender.com)

*(Note: The backend is hosted on Render's free tier. It may take 30-50 seconds to spin up on the first request if it has been idle.)*

---

## ✨ Key Features

### 👩‍🏫 Teacher Portal (Admin)
*   **Student Registry:** Manage enrollments. Enrolling a student automatically provisions a secure Parent portal account.
*   **Luna Rewards Center:** A centralized engine that evaluates student records to find eligible candidates for awards. Teachers manually approve and distribute:
    *   🟢 **Green Luna (Full Marks):** For students scoring 100% in Daily/Saturday tests.
    *   🟣 **Purple Luna (Attendance):** For students maintaining perfect Monday-Saturday attendance.
    *   🟠 **Orange Luna (2-Line Handwriting):** For Grades 1-5 students completing weekly 2-line writing tasks.
    *   🔵 **Blue Luna (4-Line Handwriting):** For Grades 1-5 students completing weekly 4-line writing tasks.
*   **Academic & Attendance Logging:** Daily tracking of student presence and test marks.
*   **Fee Management:** Bulk generate monthly invoices. Standard billing tiers automatically apply based on the student's grade (e.g., Grades 1-5 at ₹200, Grades 6-7 at ₹300).
*   **Study Vault:** Upload educational PDF resources and worksheets directly to specific grades.

### 👨‍👩‍👧 Parent / Student Portal
*   **Real-time Academic Dashboard:** View beautifully rendered charts (using Recharts) for score trends and subject averages.
*   **Live Leaderboard:** A premium, gamified podium highlighting top-ranking students based on their total Luna count, complete with "You" badges for instant recognition.
*   **Luna Wallet:** A digital ledger showing exactly how, when, and why the student earned their Luna rewards.
*   **Tuition Fee Portal:** Monitor outstanding dues, download invoices, and view payment instructions (Cash/Google Pay).
*   **Study Vault Access:** Download teacher-provided worksheets instantly.

---

## 🛠️ Tech Stack

### Frontend (Client)
*   **Framework:** React 19 powered by Vite
*   **Styling:** Tailwind CSS (Vanilla CSS structure with utility classes) & Framer Motion (Micro-animations)
*   **Routing:** React Router v6
*   **Data Visualization:** Recharts (Customized Bar and Line charts)
*   **Icons:** Lucide React
*   **HTTP Client:** Axios (Centralized API configuration)

### Backend (Server)
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB Atlas (Mongoose ODM)
*   **Security:** JWT (JSON Web Tokens), `bcryptjs` (Password Hashing), CORS (Strict Origin Allowlist)
*   **Utilities:** Multer (File uploads), Nodemailer (Automated credential emails)

---

## ⚙️ Environment Variables

To run this project locally or deploy it, you must configure the following `.env` files:

### Backend (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/luna_tuition
JWT_SECRET=your_super_secret_jwt_key
```

### Frontend (`client/.env`)
```env
# For local development:
VITE_API_URL=http://localhost:5000/api

# For production deployment (Vercel):
VITE_API_URL=https://luna-tuition-center.onrender.com/api
```

---

## 🏁 Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Mohamed-sabeek/luna-tuition-center.git
   cd luna-tuition-center
   ```

2. **Install all dependencies:**
   *(The root `package.json` contains a script to install both client and server packages)*
   ```bash
   npm run install-all
   ```

3. **Start the Development Servers:**
   *(This launches the Vite frontend on port `5173` and the Express backend on port `5000`)*
   ```bash
   npm run dev
   ```

### 🔐 Default Credentials for Local Testing
On the first run, the database automatically seeds a master teacher account:
*   **Email:** `teacher@luna.com`
*   **Password:** `password123`

*(Parent accounts are created dynamically when you register a new student from the Teacher Portal).*

---

## ☁️ Deployment Guide

### Deploying the Backend (Render)
1. Connect your GitHub repository to Render and create a new **Web Service**.
2. **Root Directory:** `server`
3. **Build Command:** `npm install`
4. **Start Command:** `node server.js`
5. **Environment Variables:** Add `MONGO_URI` and `JWT_SECRET`.
6. *Note: Ensure your MongoDB Atlas Network Access is set to `0.0.0.0/0` (Allow access from anywhere) so Render's dynamic IPs can connect to your database.*

### Deploying the Frontend (Vercel)
1. Connect your GitHub repository to Vercel.
2. **Root Directory:** `client`
3. **Framework Preset:** Vite
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. **Environment Variables:** Add `VITE_API_URL` pointing to your Render backend API (e.g., `https://your-backend.onrender.com/api`).
7. **Routing:** The repository includes a `client/vercel.json` file which automatically rewrites all SPA routes to `index.html` to prevent 404 errors on refresh.

---

## 📁 Project Structure

```text
luna-tuition-center/
├── client/                    # Vite + React Frontend
│   ├── public/                # Static assets & favicons
│   ├── src/
│   │   ├── components/        # Reusable UI (Sidebar, Navbar, Layouts)
│   │   ├── context/           # React Context (AuthContext)
│   │   ├── pages/             # Page components (Teacher & Parent routes)
│   │   └── utils/             # API configuration (axios instances)
│   ├── vercel.json            # Vercel SPA routing configuration
│   └── .env                   # Frontend environment variables
├── server/                    # Node.js + Express Backend
│   ├── config/                # Database connection logic
│   ├── controllers/           # Business logic & endpoints
│   ├── middleware/            # JWT validation & file upload handlers
│   ├── models/                # Mongoose Database Schemas
│   ├── routes/                # Express API routes
│   └── server.js              # Entry point & CORS configuration
└── package.json               # Monorepo task runner scripts
```
