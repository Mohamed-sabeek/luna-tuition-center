import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Moon,
  Sun,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  UserCheck,
  CalendarDays,
  GraduationCap,
  PenTool,
  Coins,
  FileText,
  Megaphone,
  Star,
  Award,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import lunaLogo from '../assets/lunalogo.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDashboard = location.pathname.startsWith('/teacher') || location.pathname.startsWith('/student');

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Classes & Fees', path: '/classes' },
    { label: 'Luna Rewards', path: '/rewards' },
    { label: 'Leaderboard', path: '/leaderboard' },
    { label: 'Contact', path: '/contact' },
  ];

  const teacherGroups = [
    {
      title: 'Overview',
      items: [
        { label: 'Overview', path: '/teacher/dashboard', icon: LayoutDashboard },
        { label: 'Leaderboard', path: '/teacher/leaderboard', icon: Trophy },
      ]
    },
    {
      title: 'Students & Attendance',
      items: [
        { label: 'Student Roster', path: '/teacher/students', icon: UserCheck },
        { label: 'Attendance', path: '/teacher/attendance', icon: CalendarDays },
      ]
    },
    {
      title: 'Academics',
      items: [
        { label: 'Test Grading', path: '/teacher/tests', icon: GraduationCap },
        { label: 'Handwriting', path: '/teacher/handwriting', icon: PenTool },
      ]
    },
    {
      title: 'Finance',
      items: [
        { label: 'Fees Manager', path: '/teacher/fees', icon: Coins },
      ]
    },
    {
      title: 'Resources',
      items: [
        { label: 'Study Sheets', path: '/teacher/materials', icon: FileText },
      ]
    },
    {
      title: 'Communication',
      items: [
        { label: 'Notice Board', path: '/teacher/announcements', icon: Megaphone },
      ]
    }
  ];

  const studentGroups = [
    {
      title: 'Overview',
      items: [
        { label: 'Overview', path: '/student/dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: 'Attendance',
      items: [
        { label: 'Attendance', path: '/student/attendance', icon: CalendarDays },
      ]
    },
    {
      title: 'Academics & Rewards',
      items: [
        { label: 'Test Results', path: '/student/tests', icon: GraduationCap },
        { label: 'Luna Wallet', path: '/student/lunas', icon: Star },
        { label: 'Leaderboard', path: '/student/leaderboard', icon: Award },
      ]
    },
    {
      title: 'Finance',
      items: [
        { label: 'Tuition Fees', path: '/student/fees', icon: Coins },
      ]
    },
    {
      title: 'Resources',
      items: [
        { label: 'Study Vault', path: '/student/materials', icon: FileText },
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;
  const activeGroups = user && (user.role === 'teacher' ? teacherGroups : studentGroups);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 bg-[#f8fafc]/90 dark:bg-[#070a13]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/5 transition-colors duration-200"
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            {isDashboard ? (
              <div className="flex items-center gap-3 select-none cursor-default">
                <div className="relative p-1 bg-transparent rounded-2xl">
                  <img src={lunaLogo} alt="Luna Logo" className="w-10 h-10 object-contain" />
                </div>
                <div>
                  <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight block">Luna Tuition</span>
                  <span className="text-[9px] text-luna-gold font-bold tracking-widest uppercase block mt-0.5">LEARN & GROW</span>
                </div>
              </div>
            ) : (
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative p-1 bg-transparent rounded-2xl group-hover:scale-105 transition-transform duration-300">
                  <img src={lunaLogo} alt="Luna Logo" className="w-10 h-10 object-contain" />
                </div>
                <div>
                  <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight block">Luna Tuition</span>
                  <span className="text-[9px] text-luna-gold font-bold tracking-widest uppercase block mt-0.5">LEARN & GROW</span>
                </div>
              </Link>
            )}
          </div>

          {/* Desktop Nav Links */}
          {!isDashboard && (
            <div className="hidden md:flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/5">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                    isActive(link.path)
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isActive(link.path) && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white/60 dark:bg-white/10 shadow-sm dark:shadow-none rounded-xl -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Desktop Action controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-white/10 transition-colors"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-luna-gold" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-luna-gold" />
                  <span>{(user.role === 'student' && user.student) ? user.student.name : user.name}</span>
                </div>
                <button
                  onClick={() => navigate(user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-luna-gold to-yellow-500 text-slate-900 rounded-xl text-xs font-extrabold hover:shadow-lg hover:shadow-luna-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Go to Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                  title="Logout Session"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2.5 bg-slate-900 dark:bg-white/5 text-white hover:bg-slate-800 dark:hover:bg-white/10 rounded-xl text-xs font-extrabold border border-slate-800 dark:border-white/10 transition-all shadow-sm flex items-center gap-1.5"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-white/10 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5 text-luna-gold" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2.5 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 transition-colors"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Slide Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-slate-200 dark:border-white/5 bg-[#f8fafc] dark:bg-[#070a13] px-4 pt-2 pb-6 space-y-4 shadow-2xl absolute w-full top-16 left-0 overflow-y-auto max-h-[calc(100vh-64px)]"
          >
            {/* Public Links */}
            {!isDashboard ? (
              <div className="space-y-1.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-bold ${
                      isActive(link.path)
                        ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/15'
                        : 'text-slate-500 dark:text-slate-300 hover:bg-slate-550/5 hover:text-slate-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ) : (
              /* Dashboard Links Grouped for Mobile Drawer */
              <div className="space-y-4">
                {activeGroups && activeGroups.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-3">
                      {group.title}
                    </span>
                    {group.items.map((route) => {
                      const Icon = route.icon;
                      return (
                        <Link
                          key={route.path}
                          to={route.path}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold ${
                            isActive(route.path)
                              ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/15'
                              : 'text-slate-500 dark:text-slate-300 hover:bg-slate-55/5 hover:text-slate-900'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-slate-400 dark:text-slate-400" />
                          <span>{route.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 dark:border-white/5 flex flex-col gap-3">
              {user ? (
                <>
                  <div className="text-xs font-bold text-slate-500 px-2">
                    Active Session: <span className="text-slate-900 dark:text-white font-bold">{(user.role === 'student' && user.student) ? user.student.name : user.name}</span>
                  </div>
                  {isDashboard ? (
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 rounded-xl text-sm font-bold border border-red-500/20 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          navigate(user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard');
                          setMobileOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-luna-gold to-yellow-500 text-slate-900 rounded-xl text-sm font-extrabold"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Go to Dashboard
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center px-4 py-3 bg-slate-900 dark:bg-gradient-to-r dark:from-luna-gold dark:to-yellow-500 dark:text-slate-900 text-white rounded-xl text-sm font-extrabold shadow-lg"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
