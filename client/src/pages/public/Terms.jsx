import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft, Home, FileText, ChevronRight } from 'lucide-react';

const Terms = () => {
  useEffect(() => {
    document.title = "Terms of Service | Luna Tuition Center";
  }, []);

  const sections = [
    {
      title: "1 Introduction",
      content: "Welcome to Luna Tuition Center.\n\nBy accessing this website or Parent Portal, you agree to follow these Terms of Service."
    },
    {
      title: "2 Student Enrollment",
      content: "Students are enrolled only by the teacher.\nEach student receives a unique Portal Username (Roll Number).\nLogin credentials are created during enrollment.\nParents should keep credentials secure."
    },
    {
      title: "3 Parent Portal",
      content: "Explain parents can access:\n\n• Attendance\n• Test Results\n• Luna Rewards\n• Study Materials\n• Fee Information\n\nParents must not share their login credentials."
    },
    {
      title: "4 Attendance & Academic Records",
      content: "Attendance\nTest marks\nLuna rewards\nAcademic information\n\nThese are entered by teachers. Parents should contact the tuition center if any record appears incorrect."
    },
    {
      title: "5 Study Materials",
      content: "Study materials are intended only for enrolled students.\nDo not redistribute or copy materials."
    },
    {
      title: "6 Tuition Fees",
      content: "Fee information shown inside the Parent Portal is for informational purposes.\nPayments should follow the tuition center's official instructions."
    },
    {
      title: "7 User Responsibilities",
      content: "Users must not:\n\n• Share accounts\n• Attempt unauthorized access\n• Modify records\n• Upload malicious files\n• Abuse the platform"
    },
    {
      title: "8 Service Changes",
      content: "Luna Tuition Center may improve or modify the platform at any time."
    },
    {
      title: "9 Contact",
      content: "Phone Number: +91 82201 53507\nAddress: Luna Tuition center, Kuttaikkulam, Aranthangi-614616\nWorking Hours: Monday – Sunday, 9:00 AM – 7:00 PM"
    }
  ];

  return (
    <div className="bg-[#f8fafc] dark:bg-[#0f172a] min-h-screen text-[#0f172a] dark:text-[#f8fafc] relative overflow-hidden transition-colors duration-200 pt-8 pb-16">
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      
      <div className="max-w-[900px] mx-auto px-4 md:px-8 relative space-y-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-800 dark:text-slate-200">Terms of Service</span>
        </div>

        {/* Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-semibold max-w-2xl mx-auto leading-relaxed">
            Please read these terms carefully before using the Luna Tuition Center Parent Portal and Website.
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
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
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

export default Terms;
