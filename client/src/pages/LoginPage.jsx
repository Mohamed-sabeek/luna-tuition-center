import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, RefreshCw, XCircle, Eye, EyeOff } from 'lucide-react';
import lunaLogo from '../assets/lunalogo.png';

const LoginPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('student'); // 'student' or 'teacher'
  const [identifier, setIdentifier] = useState('');
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

    const res = await login(identifier, password, role);
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
    <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-[#0f172a] dark:to-indigo-950 min-h-[calc(100vh-80px)] text-[#0f172a] dark:text-[#f8fafc] flex items-center justify-center px-4 relative overflow-hidden transition-colors duration-500">
      
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-pulse duration-10000"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-screen"></div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-white/50 dark:bg-white/5 rounded-2xl shadow-sm backdrop-blur-sm border border-white/20">
            <img src={lunaLogo} alt="Luna Logo" className="w-16 h-16 object-contain drop-shadow-md" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-indigo-800 dark:from-white dark:to-indigo-200">
            Welcome Back
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Enter your credentials to access the portal
          </p>
        </div>

        {/* Login Box - Glassmorphism */}
        <div className="bg-white/70 dark:bg-[#1e293b]/70 backdrop-blur-xl p-8 rounded-[2rem] border border-white/50 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
          
          {/* Role Toggle Selector */}
          <div className="flex p-1 bg-slate-200/50 dark:bg-slate-900/50 rounded-2xl mb-8 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                role === 'student' 
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                role === 'teacher' 
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Teacher
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <XCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider ml-1">
                {role === 'student' ? 'Portal Username' : 'Email Address'}
              </label>
              <div className="relative group">
                <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 absolute left-4 top-1/2 -translate-y-1/2 transition-colors" />
                <input
                  type={role === 'student' ? 'text' : 'email'}
                  required
                  placeholder={role === 'student' ? 'e.g. LUNA305' : 'name@domain.com'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 pl-12 pr-4 py-3.5 rounded-2xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 absolute left-4 top-1/2 -translate-y-1/2 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 pl-12 pr-12 py-3.5 rounded-2xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
