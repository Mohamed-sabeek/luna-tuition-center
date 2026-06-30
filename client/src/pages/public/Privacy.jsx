import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Home, Lock, ChevronRight } from 'lucide-react';

const Privacy = () => {
  useEffect(() => {
    document.title = "Privacy Policy | Luna Tuition Center";
  }, []);

  const sections = [
    {
      title: "1 Introduction",
      content: "We respect your privacy and are committed to protecting your information."
    },
    {
      title: "2 Information We Collect",
      content: "• Student Name\n• Parent Name\n• Grade\n• Roll Number\n• Phone Number\n• Parent Email (Optional)\n• Attendance\n• Test Results\n• Luna Rewards\n• Fee Records"
    },
    {
      title: "3 How We Use Information",
      content: "Information is used only for:\n\n• Student Management\n• Attendance Tracking\n• Academic Progress\n• Parent Portal Access\n• Fee Management\n• Parent Communication"
    },
    {
      title: "4 Password Security",
      content: "Passwords are securely encrypted before being stored.\nThey are never stored in plain text."
    },
    {
      title: "5 Parent Email",
      content: "Parent Email is optional.\nIt is NOT used for Parent Portal login. Parent Portal authentication uses Portal Username (Student Roll Number) plus Password.\n\nEmail may be used only for future communication or password recovery."
    },
    {
      title: "6 Third-Party Services",
      content: "These services help securely host the application:\n\n• MongoDB Atlas\n• Render\n• Vercel"
    },
    {
      title: "7 Data Protection",
      content: "Reasonable security measures are used to protect student records."
    },
    {
      title: "8 Contact",
      content: "Phone: +91 82201 53507\nAddress: Luna Tuition center, Kuttaikkulam, Aranthangi-614616\nWorking Hours: Monday – Sunday, 9:00 AM – 7:00 PM"
    }
  ];

  return (
    <div className="bg-[#f8fafc] dark:bg-[#0f172a] min-h-screen text-[#0f172a] dark:text-[#f8fafc] relative overflow-hidden transition-colors duration-200 pt-8 pb-16">
      
      {/* Background Orbs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      
      <div className="max-w-[900px] mx-auto px-4 md:px-8 relative space-y-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-emerald-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-800 dark:text-slate-200">Privacy Policy</span>
        </div>

        {/* Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 mb-2">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-semibold max-w-2xl mx-auto leading-relaxed">
            Your privacy matters to us. Learn how we collect, use and protect your information.
          </p>
          <div className="pt-2">
            <span className="inline-block px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-bold">
              Last Updated: 30 June 2026
            </span>
          </div>
        </motion.div>

        {/* Content Cards */}
        <div className="space-y-6">
          {sections.map((section, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -2 }}
              className="bg-white dark:bg-[#1e293b] p-6 sm:p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all text-left"
            >
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                {section.title}
              </h2>
              <div className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">
                {section.content}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Back Button */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pt-8 text-center"
        >
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#1e293b] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
