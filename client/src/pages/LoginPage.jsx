import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, RefreshCw, XCircle, Eye, EyeOff } from 'lucide-react';
import lunaLogo from '../assets/lunalogo.png';

const LoginPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('student'); // 'student' or 'teacher'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If user session is already verified, redirect immediately to their dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'teacher') {
        navigate('/teacher/dashboard', { replace: true });
      } else if (user.role === 'student' || user.role === 'parent') {
        navigate('/student/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(email, password, role);
    if (res.success) {
      const userRole = res.user?.role;
      if (userRole === 'teacher') {
        navigate('/teacher/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } else {
      setError(res.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f8fafc] dark:bg-[#0f172a] min-h-[calc(100vh-80px)] text-[#0f172a] dark:text-[#f8fafc] flex items-center justify-center px-4 relative overflow-hidden text-left transition-colors duration-200">
      
      {/* Background Star Glow */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-yellow-500/5 rounded-full blur-[90px] pointer-events-none -z-10"></div>

      <div className="w-full max-w-md space-y-6 relative">
        <div className="text-center space-y-2">
          <div className="inline-flex p-2 bg-transparent rounded-2xl">
            <img src={lunaLogo} alt="Luna Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Enter The Portal</h1>
          <p className="text-xs text-slate-500 dark:text-slate-300 font-semibold">
            Input authorization credentials to access student stats.
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white dark:bg-[#1e293b] p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl space-y-6">
          {/* Role Toggle Selector */}
          <div className="grid grid-cols-2 bg-slate-100 dark:bg-[#0a0e1a] p-1 rounded-xl border border-slate-200 dark:border-white/5">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                role === 'student' 
                  ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm dark:shadow-none' 
                  : 'text-slate-500 dark:text-slate-300'
              }`}
            >
              Student Login
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                role === 'teacher' 
                  ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm dark:shadow-none' 
                  : 'text-slate-500 dark:text-slate-300'
              }`}
            >
              Teacher Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4.5 h-4.5 text-slate-400 absolute left-4 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0a0e1a] border border-slate-200 dark:border-white/15 pl-11 pr-4 py-2.5 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-luna-gold focus:bg-white dark:focus:bg-[#0f1526]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4.5 h-4.5 text-slate-400 absolute left-4 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0a0e1a] border border-slate-200 dark:border-white/15 pl-11 pr-12 py-2.5 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-luna-gold focus:bg-white dark:focus:bg-[#0f1526]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1e3a8a] hover:bg-[#152a66] dark:bg-gradient-to-r dark:from-luna-gold dark:to-yellow-500 text-white dark:text-slate-900 rounded-xl text-xs font-extrabold shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4.5 h-4.5" />
              )}
              Authenticate Session
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
