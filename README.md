# Luna Tuition Center Management System (MERN Stack)

A production-ready full-stack Tuition Management System built using React 19, Tailwind CSS v4, Node.js, Express.js, and MongoDB. The application implements automated gamified rewards (Luna Stars), role-based parent portals, worksheets distribution, and automated credential notifications.

---

## 🚀 Key Features

*   **Secure Authentication System:**
    *   JWT-based session authentication with `bcryptjs` password hashing.
    *   Role-Based Access Control (RBAC) separating **Teacher** controls from **Parent** views.
*   **Automatic Student-Parent Provisioning:**
    *   Enrolling a student automatically provisions a Parent account and sends an automated welcome email with login details.
*   **Centralized Luna Rewards Center:**
    *   A teacher-controlled queue system that deep-scans historical records to find eligible students for awards.
    *   🟢 **Green Luna (Full Marks):** Auto-queued when a student scores 100% in a Daily or Saturday test.
    *   🟣 **Purple Luna (Attendance):** Evaluated and queued for perfect Monday-Saturday attendance.
    *   🟠 **Orange Luna (2-Line Handwriting):** Queued when Grades 1-5 students complete 2-Line writing strictly from Monday to Friday.
    *   🔵 **Blue Luna (4-Line Handwriting):** Queued when Grades 1-5 students complete 4-Line writing strictly from Monday to Friday.
*   **Analytics & Visual Leaderboards:**
    *   Recharts line progress graphs for test performance accuracy.
    *   Leaderboard tracking with Gold, Silver, and Bronze badges.
*   **Fee Billing Management:**
    *   Standard monthly billing tiers: Grades 1-5 (₹200), Grades 6-7 (₹300), Grades 8-9 (₹400).
    *   Bulk invoice batch generator.
*   **Resource Distribution & Bulletin Board:**
    *   PDF worksheets uploads and downloads.
    *   Bulletin board announcements.

---

## 🛠️ Tech Stack

*   **Frontend:** React 19, Vite, Tailwind CSS v4, Axios, React Hook Form, Recharts, Lucide React.
*   **Backend:** Node.js, Express.js, MongoDB Atlas (via Mongoose), JWT, bcryptjs, Nodemailer, Multer.

---

## 📁 Directory Structure

```text
luna-tuition-center/
├── package.json               # Orchestrates both front and backend execution
├── client/                    # Vite + React 19 frontend
│   ├── src/
│   │   ├── components/        # Reusable Sidebar, Navbar, StatCards
│   │   ├── context/           # AuthContext login session persistence
│   │   ├── pages/             # Route pages (public pages & dashboard routes)
│   │   ├── utils/             # Axios API client instances
│   │   └── App.jsx            # Routing layouts & Protected Guards
│   └── package.json
└── server/                    # Node.js + Express backend
    ├── config/                # Database connection
    ├── controllers/           # REST Route business logic handlers
    ├── middleware/            # JWT authorization & Multer file handlers
    ├── models/                # MongoDB Schema specifications
    ├── routes/                # REST endpoints routing
    ├── utils/                 # Nodemailer transport services
    ├── uploads/               # Profile photos & PDF worksheets storage
    └── server.js              # Application entry point & seeder
```

---

## ⚙️ Setup & Configuration

### 1. Database Setup
Make sure you have MongoDB running locally at `mongodb://127.0.0.1:27017/luna_tuition` or provide a MongoDB Atlas connection string.

### 2. Environment Variables configuration
Create `server/.env` with the following variables:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/luna_tuition
JWT_SECRET=luna_super_secret_session_token_key_123!
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

---

## 🏁 How to Run

1.  **Clone / Navigate** to the workspace root:
    ```bash
    cd d:/luna-tuition-center
    ```
2.  **Install all dependencies** for both backend and frontend:
    ```bash
    npm run install-all
    ```
3.  **Launch the MERN stack** concurrently (runs client on port `5173` and server on port `5000`):
    ```bash
    npm run dev
    ```

---

## 🔐 Credentials for testing

*   **Teacher Portal Logins:**
    *   **Email:** `teacher@luna.com`
    *   **Password:** `password123`
    *(Automatically seeded on database startup if no teacher records exist)*
*   **Parent Portal Logins:**
    *   Created dynamically by enrolling students in the Teacher registry page. Check console logs or your mock SMTP inbox for credentials.
