import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Award,
  CalendarCheck,
  PenTool,
  GraduationCap,
  Sparkles,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Rocket,
  Gift,
  Compass,
  ChevronLeft,
  Mail,
  Send,
  MessageCircle,
  HelpCircle,
  Trophy,
  RefreshCw,
  Moon,
  Clock,
  Briefcase,
  BookOpen
} from 'lucide-react';
import api from '../../utils/api';
import heroImg from '../../assets/hero.png';
import writingToolsImg from '../../assets/rewards/writing-tools.webp';
import paperBooksImg from '../../assets/rewards/paper-books.webp';
import measuringDrawingImg from '../../assets/rewards/measuring-drawing.webp';
import organisationImg from '../../assets/rewards/organisation.webp';
import creativeSupplyImg from '../../assets/rewards/creative-supply.webp';

const Home = () => {
  // Contact State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });


  // Public Stats State
  const [stats, setStats] = useState({
    testsConducted: 0,
    attendanceRate: 0,
    lunasAwarded: 0,
    topRewardsCount: 3
  });

  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        const { data } = await api.get('/dashboard/public-stats');
        setStats({
          testsConducted: data.testsConducted || 0,
          attendanceRate: data.attendanceRate || 0,
          lunasAwarded: data.lunasAwarded || 0,
          topRewardsCount: data.topRewardsCount || 3
        });
      } catch (err) {
        console.warn('Failed to fetch public stats, using defaults', err);
      }
    };
    fetchPublicStats();
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg({ text: '', type: '' });
    try {
      await api.post('/contact', { name, email, message });
      setStatusMsg({ text: 'Inquiry transmitted successfully! A center manager will contact you.', type: 'success' });
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setStatusMsg({ text: 'Transmission failed. Please double-check details.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const earningSteps = [
    {
      title: 'Full Marks reward',
      description: 'Score 100% in daily tests to receive the Green Full Marks Luna.',
      color: 'text-luna-green bg-luna-green/10 border-luna-green/20',
      icon: GraduationCap,
      label: 'Full Marks',
      starColor: 'text-luna-green'
    },
    {
      title: 'Perfect Attendance',
      description: 'Maintain attendance Mon-Sat to receive the Purple streak Luna.',
      color: 'text-luna-purple bg-luna-purple/10 border-luna-purple/20',
      icon: CalendarCheck,
      label: 'Perfect Week',
      starColor: 'text-luna-purple'
    },
    {
      title: '2-Line Handwriting',
      description: 'Complete the weekly 2-line drill booklet for the Orange Luna.',
      color: 'text-luna-orange bg-luna-orange/10 border-luna-orange/20',
      icon: PenTool,
      label: '2-Line Drill',
      starColor: 'text-luna-orange'
    },
    {
      title: '4-Line Calligraphy',
      description: 'Finish the weekly 4-line calligraphy drills for the Blue Luna.',
      color: 'text-luna-blue bg-luna-blue/10 border-luna-blue/20',
      icon: Sparkles,
      label: '4-Line Drill',
      starColor: 'text-luna-blue'
    }
  ];

  const milestones = [
    { label: 'Grades 1-5', title: 'Primary Classes', focus: 'Handwriting, math basics, and spelling.', reward: 'Sticker Packs & notebooks' },
    { label: 'Grades 6-7', title: 'Middle Classes', focus: 'Math basics, reading, and spelling tests.', reward: 'Pens & keychain sets' },
    { label: 'Grades 8-9', title: 'High Classes', focus: 'School exam preparation and subject practice.', reward: 'Science Kits' }
  ];

  const rewardsList = [
    {
      name: 'Writing Tools',
      image: writingToolsImg,
      desc: 'Writing tools for everyday learning and practice.',
      items: ['Pencils', 'Pens', 'Markers', 'Highlighters']
    },
    {
      name: 'Paper & Books',
      image: paperBooksImg,
      desc: 'Useful books and paper items for study and creativity.',
      items: ['Notebooks', 'Drawing Books', 'A4 Sheets', 'Sticky Notes']
    },
    {
      name: 'Measuring & Drawing',
      image: measuringDrawingImg,
      desc: 'Essential tools for maths, drawing and school work.',
      items: ['Scale', 'Geometry Box', 'Sharpener', 'Eraser']
    },
    {
      name: 'Organization',
      image: organisationImg,
      desc: 'Keep study materials neat and organized.',
      items: ['Files', 'Folders', 'Clipboards', 'Index Cards']
    },
    {
      name: 'Creative Supplies',
      image: creativeSupplyImg,
      desc: 'Fun art supplies to encourage creativity.',
      items: ['Crayons', 'Watercolors', 'Sketch Pens', 'Craft Paper']
    }
  ];



  return (
    <div className="bg-[#f8fafc] dark:bg-[#0f172a] text-[#0f172a] dark:text-[#f8fafc] min-h-screen overflow-x-hidden relative transition-colors duration-200 text-left">

      {/* Subtle Glowing Background Elements */}
      <div className="absolute top-20 left-1/4 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-yellow-500/5 rounded-full blur-[90px] pointer-events-none -z-10"></div>

      {/* 1. HERO SECTION (Simple, default light) */}
      <section className="relative pt-6 pb-12 md:pt-10 md:pb-20 px-4 md:px-8 lg:px-12 max-w-[1440px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Hero Left: Simple Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-[#1e3a8a] dark:text-blue-400">
              <Sparkles className="w-4 h-4 text-luna-gold" />
              <span>Learn • Practice • Earn Lunas • Shine Bright</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] text-[#1e3a8a] dark:text-white">
              Making Learning Fun,<br />
              <span className="inline-block bg-gradient-to-r from-amber-600 to-orange-500 dark:from-luna-gold dark:to-yellow-400 bg-clip-text text-transparent">Rewarding</span> & Meaningful.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-semibold leading-relaxed max-w-xl">
              Daily tests, attendance rewards, handwriting growth and monthly prizes that motivate students to improve every single day.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/contact"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-[#1e3a8a] hover:bg-[#152a66] text-white dark:bg-gradient-to-r dark:from-luna-gold dark:to-yellow-500 dark:text-slate-900 rounded-2xl text-sm font-extrabold shadow-md hover:shadow-lg transition-all"
              >
                <Rocket className="w-5 h-5" />
                Join Now
              </Link>
              <Link
                to="/leaderboard"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-white/5 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 rounded-2xl text-sm font-extrabold transition-all"
              >
                <Trophy className="w-4.5 h-4.5 text-luna-gold" />
                View Leaderboard
              </Link>
            </div>

            {/* Quick stats highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-20 pt-8 border-t border-slate-200 dark:border-white/5">
              <div>
                <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white block">Classes 1 to 9</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-300 font-bold uppercase tracking-wider block mt-1">Student Scope</span>
              </div>
              <div>
                <span className="text-lg sm:text-xl font-black text-[#1e3a8a] dark:text-blue-400 block">Mon - Sat Classes</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-300 font-bold uppercase tracking-wider block mt-1">Class Availability</span>
              </div>
              <div>
                <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 block">Daily Tests</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-300 font-bold uppercase tracking-wider block mt-1">Consistency Check</span>
              </div>
              <div>
                <span className="text-lg sm:text-xl font-black text-luna-gold block">Monthly Rewards</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-300 font-bold uppercase tracking-wider block mt-1">Active Motivation</span>
              </div>
            </div>
          </div>

          {/* Hero Right: Brand Hero Image */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-lg flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-luna-gold/20 to-luna-purple/20 rounded-full blur-[80px] opacity-70 dark:opacity-40 -z-10 animate-pulse-glow"></div>
              <img
                src={heroImg}
                alt="Luna Tuition Center Hero"
                className="w-full max-w-md object-contain rounded-3xl animate-float drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHY LUNA? (Why Parents Choose Luna) */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white dark:from-[#0d1527] dark:to-[#0f172a] border-y border-slate-200 dark:border-white/5 px-4 md:px-8 lg:px-12 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/10 w-[400px] h-[400px] bg-luna-blue/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-glow"></div>
        <div className="absolute bottom-1/4 right-1/10 w-[400px] h-[400px] bg-luna-gold/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

        <div className="max-w-[1440px] mx-auto space-y-16 relative">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight">
              Why Parents Choose Luna
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-semibold leading-relaxed max-w-2xl mx-auto">
              We help students learn regularly through daily tests, attendance tracking, handwriting practice, and Luna rewards.
            </p>
          </div>

          {/* 2x2 Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: BookOpen,
                emoji: '📚',
                title: 'Daily Tests',
                desc: 'Short daily tests that help students learn regularly and improve their marks.',
                badges: ['10 Marks Daily', 'Monday to Friday'],
                colorClasses: {
                  iconBg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400',
                  badgeBg: 'bg-blue-50/70 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-100/50 dark:border-blue-900/20'
                }
              },
              {
                icon: CalendarCheck,
                emoji: '✅',
                title: 'Attendance',
                desc: 'Students who attend all classes for the week earn an Attendance Luna.',
                badges: ['6 Days Per Week', '1 Attendance Luna'],
                colorClasses: {
                  iconBg: 'bg-purple-50 dark:bg-purple-950/50 border-purple-100 dark:border-purple-900/30 text-purple-600 dark:text-purple-400',
                  badgeBg: 'bg-purple-50/70 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-100/50 dark:border-purple-900/20'
                }
              },
              {
                icon: PenTool,
                emoji: '✍️',
                title: 'Handwriting Practice',
                desc: 'Students practice 2-line and 4-line writing every week to improve handwriting.',
                badges: ['2-Line Writing', '4-Line Writing'],
                colorClasses: {
                  iconBg: 'bg-orange-50 dark:bg-orange-950/50 border-orange-100 dark:border-orange-900/30 text-orange-600 dark:text-orange-400',
                  badgeBg: 'bg-orange-50/70 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-100/50 dark:border-orange-900/20'
                }
              },
              {
                icon: Star,
                emoji: '🌙',
                title: 'Luna Rewards',
                desc: 'Students earn Lunas for full marks, attendance, and handwriting practice.',
                badges: ['Monthly Rewards', 'Student Leaderboard'],
                colorClasses: {
                  iconBg: 'bg-yellow-50 dark:bg-yellow-950/50 border-yellow-100 dark:border-yellow-900/30 text-yellow-600 dark:text-yellow-400',
                  badgeBg: 'bg-yellow-50/70 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300 border-yellow-100/50 dark:border-yellow-900/20'
                }
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-white dark:bg-[#1e293b] p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-md hover:shadow-xl hover:border-slate-300 dark:hover:border-white/20 flex flex-col justify-between transition-all duration-300 text-left min-h-[240px]"
                >
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${item.colorClasses.iconBg}`}>
                        <Icon className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <h3 className="font-black text-slate-900 dark:text-white text-xl">{item.title}</h3>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2.5 pt-6 mt-6 border-t border-slate-100 dark:border-white/5">
                    {item.badges.map((badge, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1 border text-xs font-bold rounded-lg ${item.colorClasses.badgeBg}`}
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. MONTHLY REWARDS */}
      <section className="py-20 px-4 md:px-8 lg:px-12 max-w-[1440px] mx-auto w-full">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Monthly Rewards</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
              Students who earn more Lunas can win useful school items every month.
            </p>
          </div>

          {/* Cards Grid: 5 columns on desktop, 2 on tablet, 1 on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {rewardsList.map((reward, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -6, scale: 1.015 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-yellow-500/5 hover:border-[#FBBF24] dark:hover:border-[#FBBF24]/50 transition-all duration-300 flex flex-col justify-between text-left group"
              >
                <div className="p-5 space-y-4 flex flex-col justify-between h-full">
                  {/* Category Image container */}
                  <div className="w-full h-32 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-2xl p-2 relative overflow-hidden">
                    <img
                      src={reward.image}
                      alt={reward.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                        {reward.name}
                      </h4>

                      <p className="text-xs text-slate-500 dark:text-slate-300 font-semibold leading-relaxed">
                        {reward.desc}
                      </p>
                    </div>

                    {/* Item tags */}
                    <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100 dark:border-white/5">
                      {reward.items.map((item, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 text-[10px] font-bold rounded-md text-slate-600 dark:text-slate-300"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom Note */}
          <div className="text-center pt-4 max-w-xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 dark:bg-yellow-950/40 text-[#FBBF24] border border-yellow-100 dark:border-yellow-900/30 text-xs font-black rounded-full">
              🏆 Top Luna Earners
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-300 font-semibold leading-relaxed">
              Students with the highest Luna count at the end of the month will receive rewards from these categories.
            </p>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="py-20 bg-slate-50 dark:bg-[#0b1329]/30 border-y border-slate-200 dark:border-white/5 px-4 md:px-8 lg:px-12">
        <div className="max-w-[1440px] mx-auto space-y-16">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight">
              What Parents Say About Luna
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
              See what parents think about our teaching, daily tests, attendance system, handwriting practice and Luna rewards.
            </p>
          </div>

          {/* Grid Layout: 3 on desktop, 2 on tablet, 1 on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                text: "My daughter enjoys earning Lunas and now studies every day.",
                name: "Meera Deshmukh",
                relation: "Parent of Grade 4 Student",
                avatar: "MD"
              },
              {
                text: "The attendance reward helped my son attend classes regularly.",
                name: "Amit Verma",
                relation: "Parent of Grade 7 Student",
                avatar: "AV"
              },
              {
                text: "The handwriting practice has improved my child's writing.",
                name: "Sarah Joseph",
                relation: "Parent of Grade 2 Student",
                avatar: "SJ"
              }
            ].map((t, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-white dark:bg-[#1e293b] p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative text-left"
              >
                <div className="space-y-4">
                  {/* Stars & Quote Icon */}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4.5 h-4.5 fill-current text-luna-gold" />
                      ))}
                    </div>
                    {/* Small quote icon */}
                    <span className="text-4xl font-serif text-slate-200 dark:text-slate-700 leading-none select-none">“</span>
                  </div>

                  {/* Feedback */}
                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-semibold italic">
                    "{t.text}"
                  </p>
                </div>

                {/* Avatar & Name */}
                <div className="flex items-center gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-white/5">
                  <div className="w-10 h-10 rounded-full bg-[#1e3a8a]/10 dark:bg-white/5 border border-[#1e3a8a]/20 dark:border-white/10 flex items-center justify-center font-bold text-xs text-[#1e3a8a] dark:text-luna-gold shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm block">
                      {t.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-300 font-bold block mt-0.5">
                      {t.relation}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>


        </div>
      </section>
    </div>
  );
};

export default Home;
