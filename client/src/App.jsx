import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import logoImg from './assets/lunalogo.png';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ScrollToTop from './components/ScrollToTop';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import ClassesAndFees from './pages/public/ClassesAndFees';
import LunaRewards from './pages/public/LunaRewards';
import Leaderboard from './pages/public/Leaderboard';
import Contact from './pages/public/Contact';
import LoginPage from './pages/LoginPage';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import StudentManagement from './pages/teacher/StudentManagement';
import StudentProfile from './pages/teacher/StudentProfile';
import AttendanceManagement from './pages/teacher/AttendanceManagement';
import TestManagement from './pages/teacher/TestManagement';
import HandwritingManagement from './pages/teacher/HandwritingManagement';
import FeeManagement from './pages/teacher/FeeManagement';
import StudyMaterials from './pages/teacher/StudyMaterials';
import Announcements from './pages/teacher/Announcements';
import LunaRewardsCenter from './pages/teacher/LunaRewardsCenter';

// Parent Pages
import ParentDashboard from './pages/parent/ParentDashboard';
import ParentAttendance from './pages/parent/ParentAttendance';
import ParentTests from './pages/parent/ParentTests';
import ParentLunas from './pages/parent/ParentLunas';
import ParentLeaderboard from './pages/parent/ParentLeaderboard';
import ParentMaterials from './pages/parent/ParentMaterials';
import ParentFees from './pages/parent/ParentFees';

// Protected Route Guard
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400 font-bold">
        Verifying user credentials...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role === 'parent' ? 'student' : user.role;
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// Layout for Dashboards
const DashboardLayout = () => {
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-slate-50 dark:bg-[#0f172a] text-[#0f172a] dark:text-[#f8fafc] transition-colors duration-200">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-[#0f172a]/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Layout for Public Pages
const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#0f172a] text-[#0f172a] dark:text-[#f8fafc] transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {/* Footer */}
      <footer className="bg-white dark:bg-[#070a13] border-t border-slate-200 dark:border-white/5 pt-16 pb-12 text-slate-500 dark:text-slate-300 transition-colors duration-200">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-slate-200/60 dark:border-white/5 items-start text-left">
            {/* Logo and Info Column */}
            <div className="md:col-span-5 space-y-4">
              <a href="/" className="flex items-center gap-2.5">
                <img src={logoImg} alt="Luna Tuition Center Logo" className="w-9 h-9 object-contain" />
                <div className="flex flex-col">
                  <span className="text-[#1e3a8a] dark:text-white text-base font-black tracking-tight leading-none">
                    Luna Tuition
                  </span>
                  <span className="text-amber-550 dark:text-amber-400 text-[9px] font-black tracking-widest uppercase mt-0.5">
                    Learn & Grow
                  </span>
                </div>
              </a>
              <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed font-semibold max-w-sm">
                A friendly local tuition center combining daily tests, attendance rewards, neat handwriting books, and monthly prizes.
              </p>
            </div>

            {/* Quick Links Column */}
            <div className="md:col-span-3 space-y-3.5">
              <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                Quick Links
              </h4>
              <ul className="space-y-2.5 text-xs font-bold">
                <li>
                  <a href="/about" className="hover:text-[#1e3a8a] dark:hover:text-amber-400 transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/classes" className="hover:text-[#1e3a8a] dark:hover:text-amber-400 transition-colors">
                    Classes & Fees
                  </a>
                </li>
              </ul>
            </div>

            {/* Support Column */}
            <div className="md:col-span-2 space-y-3.5">
              <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                Support
              </h4>
              <ul className="space-y-2.5 text-xs font-bold">
                <li>
                  <a href="/contact" className="hover:text-[#1e3a8a] dark:hover:text-amber-400 transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="/login" className="hover:text-[#1e3a8a] dark:hover:text-amber-400 transition-colors">
                    Portal Access
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div className="md:col-span-2 space-y-3.5">
              <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                Legal
              </h4>
              <ul className="space-y-2.5 text-xs font-bold">
                <li>
                  <a href="/" className="hover:text-[#1e3a8a] dark:hover:text-amber-400 transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/" className="hover:text-[#1e3a8a] dark:hover:text-amber-400 transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-450 dark:text-slate-300">
            <p>© {new Date().getFullYear()} Luna Tuition Center. All rights reserved.</p>
            <div className="flex gap-4 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1e3a8a] dark:bg-amber-400"></span>
              <span>Shining Bright Every Day</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/classes" element={<ClassesAndFees />} />
              <Route path="/rewards" element={<LunaRewards />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* Teacher Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                <Route path="/teacher/students" element={<StudentManagement />} />
                <Route path="/teacher/students/:id" element={<StudentProfile />} />
                <Route path="/teacher/attendance" element={<AttendanceManagement />} />
                <Route path="/teacher/tests" element={<TestManagement />} />
                <Route path="/teacher/handwriting" element={<HandwritingManagement />} />
                <Route path="/teacher/fees" element={<FeeManagement />} />
                <Route path="/teacher/materials" element={<StudyMaterials />} />
                <Route path="/teacher/announcements" element={<Announcements />} />
                <Route path="/teacher/luna-rewards" element={<LunaRewardsCenter />} />
                <Route path="/teacher/leaderboard" element={<Leaderboard />} />
              </Route>
            </Route>

            {/* Student Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/student/dashboard" element={<ParentDashboard />} />
                <Route path="/student/attendance" element={<ParentAttendance />} />
                <Route path="/student/tests" element={<ParentTests />} />
                <Route path="/student/lunas" element={<ParentLunas />} />
                <Route path="/student/leaderboard" element={<ParentLeaderboard />} />
                <Route path="/student/materials" element={<ParentMaterials />} />
                <Route path="/student/fees" element={<ParentFees />} />
              </Route>
            </Route>

            {/* Redirect all unmatched routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
