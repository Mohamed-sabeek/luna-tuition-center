import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  CalendarCheck, 
  PenTool, 
  Star, 
  Trophy, 
  Gift, 
  TrendingUp, 
  Smile, 
  BarChart2, 
  Calendar, 
  Download, 
  CreditCard,
  ArrowRight,
  ArrowDown,
  GraduationCap
} from 'lucide-react';
import heroImg from '../../assets/hero.webp';

const About = () => {
  const navigate = useNavigate();
  // Timeline Data
  const timelineSteps = [
    {
      title: 'Monday - Friday',
      subtitle: 'Daily Classes & Daily Tests',
      desc: 'Students attend their classes every weekday. They write a short test to review what they learned the day before.',
      color: 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
      dotColor: 'bg-blue-500'
    },
    {
      title: 'Saturday',
      subtitle: 'Weekly Test & Special Practice',
      desc: 'Students write a longer weekly test. They practice neat handwriting and earn extra Lunas for their weekly attendance.',
      color: 'border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400',
      dotColor: 'bg-purple-500'
    },
    {
      title: 'Month End',
      subtitle: 'Leaderboard & School Rewards',
      desc: 'We update the leaderboard rankings. Top earners and consistent students win exciting school stationery rewards.',
      color: 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400',
      dotColor: 'bg-amber-500'
    }
  ];

  // Grades list
  const grades = [
    { num: 'Grade 1', color: 'bg-red-50 dark:bg-red-950/25 text-red-600 dark:text-red-450 border-red-100 dark:border-red-900/30' },
    { num: 'Grade 2', color: 'bg-orange-50 dark:bg-orange-950/25 text-orange-600 dark:text-orange-450 border-orange-100 dark:border-orange-900/30' },
    { num: 'Grade 3', color: 'bg-yellow-50 dark:bg-yellow-950/25 text-yellow-600 dark:text-yellow-450 border-yellow-100 dark:border-yellow-900/30' },
    { num: 'Grade 4', color: 'bg-green-50 dark:bg-green-950/25 text-green-600 dark:text-green-450 border-green-100 dark:border-green-900/30' },
    { num: 'Grade 5', color: 'bg-teal-50 dark:bg-teal-950/25 text-teal-600 dark:text-teal-450 border-teal-100 dark:border-teal-900/30' },
    { num: 'Grade 6', color: 'bg-blue-50 dark:bg-blue-950/25 text-blue-600 dark:text-blue-450 border-blue-100 dark:border-blue-900/30' },
    { num: 'Grade 7', color: 'bg-indigo-50 dark:bg-indigo-950/25 text-indigo-600 dark:text-indigo-450 border-indigo-100 dark:border-indigo-900/30' },
    { num: 'Grade 8', color: 'bg-purple-50 dark:bg-purple-950/25 text-purple-600 dark:text-purple-450 border-purple-100 dark:border-purple-900/30' },
    { num: 'Grade 9', color: 'bg-pink-50 dark:bg-pink-950/25 text-pink-600 dark:text-pink-450 border-pink-100 dark:border-pink-900/30' }
  ];

  // Journey steps
  const journeySteps = [
    { title: 'Attend Classes', icon: CalendarCheck, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/20' },
    { title: 'Write Tests', icon: BookOpen, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/20' },
    { title: 'Earn Lunas', icon: Star, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/20' },
    { title: 'Move Up Leaderboard', icon: Trophy, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/20' },
    { title: 'Win Monthly Rewards', icon: Gift, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/20' }
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
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight">
            About Luna Tuition Center
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
            Luna Tuition Center helps students from Grades 1 to 9 learn through daily practice, regular tests, attendance rewards and the Luna Reward System.
          </p>
        </motion.div>
      </section>

      {/* SECTION 1: WHO WE ARE */}
      <section className="py-10 px-4 md:px-8 lg:px-12 max-w-[1440px] mx-auto w-full border-t border-slate-200/60 dark:border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center"
          >
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
              {/* Outer decorative ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#1E3A8A]/10 to-[#FBBF24]/10 dark:from-[#1E3A8A]/20 dark:to-[#FBBF24]/20 scale-110"></div>
              {/* Inner ring border */}
              <div className="absolute inset-0 rounded-full border-4 border-white dark:border-[#1e293b] shadow-xl z-10"></div>
              {/* Circle image */}
              <img 
                src={heroImg} 
                alt="Luna Tuition Classroom" 
                className="w-full h-full object-cover rounded-full relative z-20 shadow-lg"
              />
              {/* Accent dot top-right */}
              <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-[#FBBF24] z-30 shadow-md"></div>
              {/* Accent dot bottom-left */}
              <div className="absolute bottom-6 left-3 w-3 h-3 rounded-full bg-[#1E3A8A]/40 dark:bg-blue-400/40 z-30"></div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Who We Are</h2>
            <div className="space-y-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
              <p>
                Luna Tuition Center is a friendly learning center for students from Grade 1 to Grade 9.
              </p>
              <p>
                We believe learning should be enjoyable and rewarding.
              </p>
              <p>
                Students attend classes, write tests, improve handwriting and earn Lunas for their efforts.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: HOW LUNA WORKS */}
      <section className="py-10 px-4 md:px-8 lg:px-12 max-w-[1440px] mx-auto w-full border-t border-slate-200/60 dark:border-white/5">
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">How Luna Works</h2>
            <p className="text-sm text-slate-500 dark:text-slate-300 font-semibold">
              Our simple and structured routine helps students build consistency.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Daily Tests', icon: BookOpen, desc: 'Students write short tests every day.', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
              { title: 'Attendance', icon: CalendarCheck, desc: 'Students who attend regularly earn Attendance Lunas.', color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' },
              { title: 'Handwriting Practice', icon: PenTool, desc: 'Students complete 2-line and 4-line writing activities.', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
              { title: 'Luna Rewards', icon: Star, desc: 'Students earn Lunas and receive monthly rewards.', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' }
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -6 }}
                  className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4 hover:shadow-md transition-all text-left"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.color}`}>
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{card.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 font-semibold leading-relaxed">{card.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: A STUDENT'S WEEK AT LUNA */}
      <section className="py-10 px-4 md:px-8 lg:px-12 max-w-[1440px] mx-auto w-full border-t border-slate-200/60 dark:border-white/5">
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">A Student's Week at Luna</h2>
            <p className="text-sm text-slate-500 dark:text-slate-300 font-semibold">
              Here is how students learn, test, and grow throughout the week.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {timelineSteps.map((step, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                className={`p-8 rounded-3xl border-l-4 border border-slate-250 dark:border-white/10 shadow-sm ${step.color} transition-all text-left space-y-4 flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${step.dotColor}`}></span>
                    <span className="text-xs font-black uppercase tracking-wider">{step.title}</span>
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white text-lg">{step.subtitle}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: WHY STUDENTS LIKE LUNA */}
      <section className="py-10 px-4 md:px-8 lg:px-12 max-w-[1440px] mx-auto w-full border-t border-slate-200/60 dark:border-white/5">
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Why Students Like Luna</h2>
            <p className="text-sm text-slate-500 dark:text-slate-300 font-semibold">
              We make learning feel like a rewarding game of growth.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Earn Lunas', desc: 'Get stars for doing good homework and writing tests.', icon: Trophy, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
              { title: 'Win Rewards', desc: 'Exchange Lunas for actual pencils, notebooks, and folders.', icon: Gift, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' },
              { title: 'Improve Marks', desc: 'Simple daily preparation helps you score higher at school.', icon: TrendingUp, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
              { title: 'Enjoy Learning', desc: 'Learn with friendly teachers in a supportive local classroom.', icon: Smile, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' }
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-3.5 hover:shadow-md transition-all text-left"
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${card.color}`}>
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{card.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-300 font-semibold leading-relaxed">{card.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 5: WHY PARENTS CHOOSE LUNA */}
      <section className="py-10 px-4 md:px-8 lg:px-12 max-w-[1440px] mx-auto w-full border-t border-slate-200/60 dark:border-white/5">
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Why Parents Choose Luna</h2>
            <p className="text-sm text-slate-500 dark:text-slate-300 font-semibold">
              Stay fully informed about your child's lessons and marks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'View Test Marks', desc: 'See scores for every daily and weekly test instantly.', icon: BarChart2, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20' },
              { title: 'Check Attendance', desc: 'Track your child\'s physical attendance record.', icon: Calendar, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20' },
              { title: 'Download Study Materials', desc: 'Save worksheets, tests, and answer keys.', icon: Download, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' },
              { title: 'Track Fees', desc: 'Review invoices, payment receipts, and due dates.', icon: CreditCard, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20' }
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-3.5 hover:shadow-md transition-all text-left"
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${card.color}`}>
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{card.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-300 font-semibold leading-relaxed">{card.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 6: OUR CLASSES */}
      <section className="py-10 px-4 md:px-8 lg:px-12 max-w-[1440px] mx-auto w-full border-t border-slate-200/60 dark:border-white/5">
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Our Classes</h2>
            <p className="text-sm text-slate-500 dark:text-slate-300 font-semibold">
              We offer dedicated learning support from Grade 1 up to Grade 9.
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-4">
            {grades.map((grade, idx) => {
              const handleGradeClick = () => {
                const num = parseInt(grade.num.replace('Grade ', ''), 10);
                navigate('/classes', { state: { highlightGrade: num } });
              };
              
              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  onClick={handleGradeClick}
                  className={`p-5 rounded-2xl border text-center font-extrabold text-sm sm:text-base shadow-sm cursor-pointer ${grade.color} transition-all`}
                >
                  <GraduationCap className="w-5 h-5 mx-auto mb-2" />
                  <span>{grade.num}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 7: LUNA REWARD JOURNEY */}
      <section className="py-10 px-4 md:px-8 lg:px-12 max-w-[1440px] mx-auto w-full border-t border-slate-200/60 dark:border-white/5">
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Luna Reward Journey</h2>
            <p className="text-sm text-slate-500 dark:text-slate-300 font-semibold">
              How a student progresses and earns exciting school prizes.
            </p>
          </div>

          {/* Desktop Row layout / Mobile Stack layout */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-3">
            {journeySteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <React.Fragment key={idx}>
                  {/* Step Card */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="w-full lg:w-48 bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm text-center space-y-3 flex flex-col items-center"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step.color}`}>
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
                      {step.title}
                    </span>
                  </motion.div>

                  {/* Arrow connector */}
                  {idx < journeySteps.length - 1 && (
                    <div className="text-slate-350 dark:text-slate-700">
                      <ArrowRight className="hidden lg:block w-5 h-5" />
                      <ArrowDown className="block lg:hidden w-5 h-5" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 8: CALL TO ACTION */}
      <section className="py-10 px-4 md:px-8 lg:px-12 max-w-[1440px] mx-auto w-full border-t border-slate-200/60 dark:border-white/5">
        <div className="bg-gradient-to-br from-[#1E3A8A] to-[#1e40af] dark:from-[#0d1b40] dark:to-[#0f2157] text-white p-10 sm:p-16 rounded-[40px] text-center space-y-8 relative overflow-hidden shadow-lg">
          {/* Subtle design circles */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black leading-tight">
              Join Luna Tuition Center
            </h2>
            <p className="text-sm sm:text-base text-blue-100 font-semibold leading-relaxed">
              Help your child learn, grow and earn rewards every month.
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

export default About;
