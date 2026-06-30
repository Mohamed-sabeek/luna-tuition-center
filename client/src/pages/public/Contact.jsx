import React from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, Clock, MapPin, ChevronRight } from 'lucide-react';

const PHONE_NUMBER = '8220153507';
const PHONE_DISPLAY = '+91 82201 53507';
const WHATSAPP_MSG = encodeURIComponent(
  'Hello! I would like to know more about Luna Tuition Center classes and fees.'
);

const Contact = () => {
  const contactOptions = [
    {
      id: 'phone',
      title: 'Call Us',
      subtitle: 'Talk to us directly',
      desc: 'Call our number and we will answer your questions about classes, fees and timings.',
      href: `tel:+91${PHONE_NUMBER}`,
      icon: Phone,
      cta: 'Call Now',
      ringColor: 'ring-blue-400/50',
      bgGradient: 'from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10',
      iconBg: 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
      btnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
      borderHover: 'hover:border-blue-400 dark:hover:border-blue-500/60'
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Us',
      subtitle: 'Send a message anytime',
      desc: 'Send us a WhatsApp message about admissions, class schedules or any other questions.',
      href: `https://wa.me/91${PHONE_NUMBER}?text=${WHATSAPP_MSG}`,
      icon: MessageCircle,
      cta: 'Open WhatsApp',
      ringColor: 'ring-emerald-400/50',
      bgGradient: 'from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
      btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      borderHover: 'hover:border-emerald-400 dark:hover:border-emerald-500/60'
    }
  ];

  const infoItems = [
    {
      icon: Phone,
      label: 'Phone & WhatsApp',
      value: PHONE_DISPLAY,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30'
    },
    {
      icon: Clock,
      label: 'Open Hours',
      value: 'Monday – Sunday, 9:00 AM – 7:00 PM',
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30'
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'Luna Tuition center, Kuttaikkulam, Aranthangi-614616',
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30'
    }
  ];

  return (
    <div className="bg-[#f8fafc] dark:bg-[#0f172a] min-h-screen text-[#0f172a] dark:text-[#f8fafc] relative overflow-hidden transition-colors duration-200">
      {/* Background Glow */}
      <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none -z-10"></div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-10 space-y-10 relative">

        {/* HERO TITLE */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <span className="text-xs font-black text-[#1e3a8a] dark:text-blue-400 uppercase tracking-widest block">
            Get In Touch
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight">
            Contact Luna Tuition
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
            Have questions about classes, fees or timings? Call us or send a WhatsApp message — we will reply quickly.
          </p>
        </motion.div>

        {/* CONTACT OPTION CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {contactOptions.map((opt, idx) => {
            const Icon = opt.icon;
            return (
              <motion.div
                key={opt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
                className={`bg-white dark:bg-[#1e293b] rounded-[32px] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${opt.borderHover}`}
              >
                {/* Top gradient strip */}
                <div className={`bg-gradient-to-r ${opt.bgGradient} px-8 pt-8 pb-6`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${opt.iconBg}`}>
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">
                        {opt.subtitle}
                      </p>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white">{opt.title}</h2>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="px-8 pb-8 space-y-5">
                  {/* Phone number display */}
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl ring-2 ${opt.ringColor} bg-white dark:bg-slate-900/50`}>
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span className="font-black text-slate-900 dark:text-white text-base tracking-wide">
                      {PHONE_DISPLAY}
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 dark:text-slate-300 font-semibold leading-relaxed">
                    {opt.desc}
                  </p>

                  <a
                    href={opt.href}
                    target={opt.id === 'whatsapp' ? '_blank' : undefined}
                    rel={opt.id === 'whatsapp' ? 'noopener noreferrer' : undefined}
                    className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-sm transition-all shadow-sm ${opt.btnClass}`}
                  >
                    <Icon className="w-4 h-4" />
                    {opt.cta}
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* INFO STRIP */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {infoItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300">
                        {item.label}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* QUICK TOPICS */}
        <div className="max-w-4xl mx-auto space-y-5">
          <h3 className="text-lg font-black text-slate-900 dark:text-white text-center">
            You Can Ask Us About
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {['Class Timings', 'Monthly Fees', 'Luna Rewards', 'Admissions', 'Test Schedule', 'Study Materials'].map((topic, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-2xl p-3 text-center text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm"
              >
                {topic}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;
