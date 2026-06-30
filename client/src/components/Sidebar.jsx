import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  UserCheck,
  CalendarDays,
  GraduationCap,
  PenTool,
  Coins,
  FileText,
  Megaphone,
  Award,
  Star,
  Moon,
  Trophy,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!user) return null;

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
        { label: 'Academic Marks', path: '/teacher/tests', icon: GraduationCap },
        { label: 'Handwriting', path: '/teacher/handwriting', icon: PenTool },
        { label: 'Luna Rewards', path: '/teacher/luna-rewards', icon: Moon },
      ]
    },
    {
      title: 'Finance',
      items: [
        { label: 'Fees Manager', path: '/teacher/fees', icon: Coins },
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

  ];

  const groups = user.role === 'teacher' ? teacherGroups : studentGroups;

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white dark:bg-[#0b1329] border-r border-slate-200 dark:border-white/5 flex flex-col justify-between shrink-0 hidden md:flex h-full relative transition-colors duration-200"
    >
      <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-100px)] custom-scrollbar">
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-3 w-6 h-6 rounded-full bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-slate-805 dark:hover:text-white shadow-sm z-10 cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        <div className="space-y-6">
          {groups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!isCollapsed && (
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest block px-3 mb-2">
                  {group.title}
                </span>
              )}
              {isCollapsed && <div className="border-b border-slate-100 dark:border-white/5 my-2 mx-2"></div>}
              <nav className="space-y-1">
                {group.items.map((route) => {
                  const Icon = route.icon;
                  return (
                    <NavLink
                      key={route.path}
                      to={route.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative group ${
                          isActive
                            ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm'
                            : 'text-slate-500 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <motion.span
                              layoutId="active-sidebar-indicator"
                              className="absolute left-0 top-2 bottom-2 w-1 bg-[#1e3a8a] dark:bg-luna-gold rounded-full shadow-[0_0_8px_rgba(30,58,138,0.3)] dark:shadow-[0_0_10px_#f59e0b]"
                            />
                          )}
                          <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[#1e3a8a] dark:text-luna-gold' : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`} />
                          {!isCollapsed && <span className="truncate">{route.label}</span>}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
