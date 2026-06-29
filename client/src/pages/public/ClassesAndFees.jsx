import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  CalendarCheck, 
  PenTool, 
  Star, 
  Check, 
  Sparkles,
  BarChart2,
  Calendar,
  Download,
  CreditCard,
  GraduationCap
} from 'lucide-react';

import writingToolsImg from '../../assets/rewards/writing-tools.webp';
import paperBooksImg from '../../assets/rewards/paper-books.webp';
import measuringDrawingImg from '../../assets/rewards/measuring-drawing.webp';
import organisationImg from '../../assets/rewards/organisation.webp';
import creativeSupplyImg from '../../assets/rewards/creative-supply.webp';

import fullMarkLunaImg from '../../assets/lunas/FullMarkLuna.webp';
import attendanceLunaImg from '../../assets/lunas/AttendanceLuna.webp';
import twoLineLunaImg from '../../assets/lunas/2LineLuna.webp';
import fourLineLunaImg from '../../assets/lunas/4LineLuna.webp';

const ClassesAndFees = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [highlightedIndex, setHighlightedIndex] = React.useState(null);

  React.useEffect(() => {
    if (location.state && location.state.highlightGrade) {
      const grade = location.state.highlightGrade;
      let cardIdx = -1;
      if (grade >= 1 && grade <= 5) {
        cardIdx = 0;
      } else if (grade >= 6 && grade <= 7) {
        cardIdx = 1;
      } else if (grade >= 8 && grade <= 9) {
        cardIdx = 2;
      }

      if (cardIdx !== -1) {
        setHighlightedIndex(cardIdx);

        // Scroll to the card
        setTimeout(() => {
          const element = document.getElementById(`class-card-${cardIdx}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);

        const timer = setTimeout(() => {
          setHighlightedIndex(null);
          // clear state so it doesn't re-trigger on refresh/back navigation
          navigate(location.pathname, { replace: true, state: {} });
        }, 1500);

        return () => clearTimeout(timer);
      }
    }
  }, [location.state, navigate, location.pathname]);

  const classCards = [
    {
      title: 'Grades 1 - 5',
      fee: '₹200',
      period: 'Per Month',
      desc: 'Strong foundation learning with daily practice and handwriting improvement.',
      features: [
        'Daily Tests',
        'Handwriting Practice',
        'Attendance Tracking',
        'Luna Rewards',
        'Study Materials',
        'Parent Progress Updates'
      ],
      color: 'border-blue-200 hover:border-blue-400 dark:border-white/10 dark:hover:border-blue-500/50',
      badgeColor: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
      btnColor: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    {
      title: 'Grades 6 - 7',
      fee: '₹300',
      period: 'Per Month',
      desc: 'Regular tests and practice sessions to improve learning and confidence.',
      features: [
        'Daily Tests',
        'Weekly Tests',
        'Attendance Tracking',
        'Luna Rewards',
        'Study Materials',
        'Parent Progress Updates'
      ],
      color: 'border-purple-200 hover:border-purple-400 dark:border-white/10 dark:hover:border-purple-500/50',
      badgeColor: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400',
      btnColor: 'bg-purple-600 hover:bg-purple-700 text-white'
    },
    {
      title: 'Grades 8 - 9',
      fee: '₹400',
      period: 'Per Month',
      desc: 'Focused preparation through tests, practice and regular progress tracking.',
      features: [
        'Daily Tests',
        'Weekly Tests',
        'Attendance Tracking',
        'Luna Rewards',
        'Study Materials',
        'Parent Progress Updates'
      ],
      color: 'border-emerald-200 hover:border-emerald-400 dark:border-white/10 dark:hover:border-emerald-500/50',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white'
    }
  ];

  const schedule = [
    { day: 'Monday', label: 'Class', test: 'Daily Test', icon: BookOpen, type: 'daily' },
    { day: 'Tuesday', label: 'Class', test: 'Daily Test', icon: BookOpen, type: 'daily' },
    { day: 'Wednesday', label: 'Class', test: 'Daily Test', icon: BookOpen, type: 'daily' },
    { day: 'Thursday', label: 'Class', test: 'Daily Test', icon: BookOpen, type: 'daily' },
    { day: 'Friday', label: 'Class', test: 'Daily Test', icon: BookOpen, type: 'daily' },
    { day: 'Saturday', label: 'Class', test: 'Weekly Test', extra: 'Luna Awards', icon: Star, type: 'weekly' }
  ];

  const whatStudentsGet = [
    { title: 'Study Materials', desc: 'Notes and worksheets for learning.', icon: BookOpen, color: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400' },
    { title: 'Daily Tests', desc: 'Short tests to improve learning.', icon: BookOpen, color: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400' },
    { title: 'Handwriting Practice', desc: '2-Line and 4-Line writing activities.', icon: PenTool, color: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' },
    { title: 'Attendance Tracking', desc: 'Regular attendance monitoring.', icon: CalendarCheck, color: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400' },
    { title: 'Luna Rewards', desc: 'Earn Lunas through effort and consistency.', icon: Star, color: 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450' },
    { title: 'Monthly Rewards', desc: 'Win useful school items every month.', icon: Sparkles, color: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400' }
  ];

  const lunaRewards = [
    { name: 'Full Marks Luna', desc: 'Get full marks in any daily or weekly test.', image: fullMarkLunaImg, borderHover: 'hover:border-emerald-400' },
    { name: 'Attendance Luna', desc: 'Attend all classes in a week.', image: attendanceLunaImg, borderHover: 'hover:border-purple-400' },
    { name: '2-Line Writing Luna', desc: 'Complete weekly 2-line handwriting practice book.', image: twoLineLunaImg, borderHover: 'hover:border-orange-400' },
    { name: '4-Line Writing Luna', desc: 'Complete weekly 4-line cursive writing practice book.', image: fourLineLunaImg, borderHover: 'hover:border-blue-400' }
  ];

  const monthlyRewards = [
    { name: 'Writing Tools', image: writingToolsImg },
    { name: 'Paper & Books', image: paperBooksImg },
    { name: 'Measuring & Drawing', image: measuringDrawingImg },
    { name: 'Organization', image: organisationImg },
    { name: 'Creative Supplies', image: creativeSupplyImg }
  ];

  const parentBenefits = [
    { title: 'Test Marks', desc: 'Check test scores daily.', icon: BarChart2, color: 'text-indigo-555 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400' },
    { title: 'Attendance', desc: 'View regular attendance logs.', icon: Calendar, color: 'text-purple-555 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400' },
    { title: 'Lunas Earned', desc: 'Track points and monthly progress.', icon: Star, color: 'text-amber-555 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400' },
    { title: 'Fee Details', desc: 'Track payments and receipt bills.', icon: CreditCard, color: 'text-blue-555 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400' }
  ];

  return (
    <div className="bg-[#f8fafc] dark:bg-[#0f172a] min-h-screen text-[#0f172a] dark:text-[#f8fafc] relative overflow-hidden transition-colors duration-200">
      
      {/* Background Star Glow */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      {/* HERO SECTION */}
      <section className="py-10 px-4 md:px-8 lg:px-12 max-w-[1440px] mx-auto w-full text-center">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-[#1e3a8a] dark:text-blue-400">
            <span>📚 Grades 1 to 9</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight">
            Classes & Fees
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
            We provide classes from Grade 1 to Grade 9 with daily tests, handwriting practice, attendance tracking and Luna rewards.
          </p>
        </motion.div>
      </section>

      {/* CLASS GROUPS SECTION */}
      <section className="py-10 px-4 md:px-8 lg:px-12 max-w-[1440px] mx-auto w-full border-t border-slate-200/60 dark:border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {classCards.map((card, idx) => (
            <motion.div
              key={idx}
              id={`class-card-${idx}`}
              whileHover={{ y: -8 }}
              animate={highlightedIndex === idx ? {
                scale: [1, 1.04, 0.98, 1.02, 1],
                boxShadow: [
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                  idx === 0 
                    ? "0 0 25px 6px rgba(59, 130, 246, 0.65)" 
                    : idx === 1 
                      ? "0 0 25px 6px rgba(168, 85, 247, 0.65)" 
                      : "0 0 25px 6px rgba(16, 185, 129, 0.65)",
                  "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
                  idx === 0 
                    ? "0 0 20px 4px rgba(59, 130, 246, 0.45)" 
                    : idx === 1 
                      ? "0 0 20px 4px rgba(168, 85, 247, 0.45)" 
                      : "0 0 20px 4px rgba(16, 185, 129, 0.45)",
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
                ]
              } : {}}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className={`bg-white dark:bg-[#1e293b] p-8 rounded-[32px] border ${
                highlightedIndex === idx 
                  ? idx === 0 
                    ? 'border-blue-500 dark:border-blue-500 ring-4 ring-blue-500/30' 
                    : idx === 1 
                      ? 'border-purple-500 dark:border-purple-500 ring-4 ring-purple-500/30' 
                      : 'border-emerald-500 dark:border-emerald-500 ring-4 ring-emerald-500/30'
                  : card.color
              } shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-left`}
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className={`px-3 py-1 text-xs font-bold rounded-lg ${card.badgeColor}`}>
                      {card.title}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-slate-900 dark:text-white block">{card.fee}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-300 font-bold uppercase">{card.period}</span>
                  </div>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-300 font-semibold leading-relaxed">
                  {card.desc}
                </p>

                {/* Features List */}
                <ul className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/5">
                  {card.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-450 shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  to="/contact"
                  className={`block w-full py-4 text-center font-black rounded-2xl text-sm transition-all shadow-sm ${card.btnColor}`}
                >
                  Join Now
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* WEEKLY ACTIVITIES SECTION */}
      <section className="py-10 px-4 md:px-8 lg:px-12 max-w-[1440px] mx-auto w-full border-t border-slate-200/60 dark:border-white/5">
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Weekly Activities</h2>
            <p className="text-sm text-slate-500 dark:text-slate-300 font-semibold">
              Students learn, practice and earn Lunas every week.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1e293b] p-6 sm:p-8 rounded-[36px] border border-slate-200 dark:border-white/10 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {schedule.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`p-5 rounded-2xl border text-left flex flex-col justify-between min-h-[140px] ${
                    item.type === 'weekly'
                      ? 'bg-yellow-50/50 dark:bg-yellow-950/10 border-yellow-200 dark:border-yellow-900/20'
                      : 'bg-slate-50/40 dark:bg-slate-900/20 border-slate-200 dark:border-white/5'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-xs font-black uppercase text-slate-450 dark:text-slate-300">{item.day}</span>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-1.5 mt-1">
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      {item.label}
                    </h3>
                  </div>

                  <div className="space-y-1 mt-4">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
                      {item.test}
                    </span>
                    {item.extra && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-550 dark:text-amber-400">
                        <Star className="w-3 h-3 fill-current" />
                        {item.extra}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHAT STUDENTS GET SECTION */}
      <section className="py-10 px-4 md:px-8 lg:px-12 max-w-[1440px] mx-auto w-full border-t border-slate-200/60 dark:border-white/5">
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">What Students Get</h2>
            <p className="text-sm text-slate-500 dark:text-slate-300 font-semibold">
              Everything required to learn and make writing and studies better.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whatStudentsGet.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4 hover:shadow-md transition-all text-left flex gap-4 items-start"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${card.color}`}>
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{card.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 font-semibold leading-relaxed">{card.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>



      {/* PARENT BENEFITS SECTION */}
      <section className="py-10 px-4 md:px-8 lg:px-12 max-w-[1440px] mx-auto w-full border-t border-slate-200/60 dark:border-white/5">
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Parents Can Easily Check</h2>
            <p className="text-sm text-slate-500 dark:text-slate-300 font-semibold">
              Track progress, marks, classes and invoice details in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {parentBenefits.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4 text-left"
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${card.color}`}>
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">{card.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-300 font-semibold leading-relaxed">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ADMISSION SECTION */}
      <section className="py-10 px-4 md:px-8 lg:px-12 max-w-[1440px] mx-auto w-full border-t border-slate-200/60 dark:border-white/5">
        <div className="bg-gradient-to-br from-[#1E3A8A] to-[#1e40af] dark:from-[#0d1b40] dark:to-[#0f2157] text-white p-10 sm:p-16 rounded-[40px] text-center space-y-8 relative overflow-hidden shadow-lg">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black leading-tight">
              Admission Open
            </h2>
            <p className="text-sm sm:text-base text-blue-100 font-semibold leading-relaxed">
              Join Luna Tuition Center and help your child learn, practice and earn rewards every month.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link 
              to="/contact" 
              className="w-full sm:w-auto px-8 py-4 bg-[#FBBF24] hover:bg-[#f59e0b] text-[#1E3A8A] font-black rounded-2xl text-sm transition-all shadow-md text-center"
            >
              Join Now
            </Link>
            <Link 
              to="/contact" 
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-extrabold rounded-2xl border border-white/20 text-sm transition-all text-center"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClassesAndFees;
