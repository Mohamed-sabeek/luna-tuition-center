import React from 'react';
import { Moon, Star, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

import fullMarkLunaImg from '../../assets/lunas/FullMarkLuna.webp';
import attendanceLunaImg from '../../assets/lunas/AttendanceLuna.webp';
import twoLineLunaImg from '../../assets/lunas/2LineLuna.webp';
import fourLineLunaImg from '../../assets/lunas/4LineLuna.webp';

import writingToolsImg from '../../assets/rewards/writing-tools.webp';
import paperBooksImg from '../../assets/rewards/paper-books.webp';
import measuringDrawingImg from '../../assets/rewards/measuring-drawing.webp';
import organisationImg from '../../assets/rewards/organisation.webp';
import creativeSupplyImg from '../../assets/rewards/creative-supply.webp';

const LunaRewards = () => {
  const rewards = [
    { 
      name: 'Full Marks Luna', 
      color: 'Green Luna',
      desc: 'Earned when a student gets full marks in any daily or weekly test.', 
      image: fullMarkLunaImg, 
      ringColor: 'ring-emerald-400/60 dark:ring-emerald-500/50',
      bgColor: 'bg-emerald-50/50 dark:bg-emerald-950/10',
      borderHover: 'hover:border-emerald-400 dark:hover:border-emerald-400/60',
      label: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
    },
    { 
      name: 'Attendance Luna',
      color: 'Purple Luna',
      desc: 'Earned when a student attends class every day from Monday to Saturday.', 
      image: attendanceLunaImg, 
      ringColor: 'ring-purple-400/60 dark:ring-purple-500/50',
      bgColor: 'bg-purple-50/50 dark:bg-purple-950/10',
      borderHover: 'hover:border-purple-400 dark:hover:border-purple-400/60',
      label: 'bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400'
    },
    { 
      name: '2-Line Writing Luna',
      color: 'Orange Luna',
      desc: 'Earned by completing a weekly 2-line handwriting practice book.', 
      image: twoLineLunaImg, 
      ringColor: 'ring-orange-400/60 dark:ring-orange-500/50',
      bgColor: 'bg-orange-50/50 dark:bg-orange-950/10',
      borderHover: 'hover:border-orange-400 dark:hover:border-orange-400/60',
      label: 'bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400'
    },
    { 
      name: '4-Line Writing Luna',
      color: 'Blue Luna',
      desc: 'Earned by completing a weekly 4-line cursive writing practice book.', 
      image: fourLineLunaImg, 
      ringColor: 'ring-blue-400/60 dark:ring-blue-500/50',
      bgColor: 'bg-blue-50/50 dark:bg-blue-950/10',
      borderHover: 'hover:border-blue-400 dark:hover:border-blue-400/60',
      label: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
    }
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
    <div className="bg-[#f8fafc] dark:bg-[#0f172a] min-h-screen text-[#0f172a] dark:text-[#f8fafc] py-10 px-4 md:px-8 lg:px-12 relative overflow-hidden text-left transition-colors duration-200">
      {/* Background Star Glow */}
      <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="max-w-[1440px] mx-auto space-y-10 relative">
        {/* Title */}
        <div className="space-y-4">
          <span className="text-xs font-black text-[#1e3a8a] dark:text-blue-400 uppercase tracking-widest block font-sans">Rewards System</span>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white leading-tight">Luna Rewards System</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-semibold leading-relaxed max-w-2xl">
            We make learning fun! Students earn Lunas for doing well in tests, attending daily, and writing neatly, which they can trade for real prizes.
          </p>
        </div>

        {/* Reward cards breakdown — 2-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {rewards.map((r, idx) => (
            <motion.div 
              key={idx} 
              whileHover={{ y: -5 }}
              className={`border rounded-[32px] bg-white dark:bg-[#1e293b] border-slate-200 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 text-left group overflow-hidden ${r.borderHover}`}
            >
              {/* Top accent strip */}
              <div className={`w-full h-1.5 ${r.bgColor.replace('/50', '').replace('/10', '')}`}></div>

              <div className="p-6 flex items-center gap-5">
                {/* Circular Luna image with colour ring */}
                <div className={`w-24 h-24 rounded-full ring-4 ${r.ringColor} ${r.bgColor} flex items-center justify-center shrink-0 relative overflow-hidden`}>
                  <img 
                    src={r.image} 
                    alt={r.name} 
                    className="w-20 h-20 object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                <div className="space-y-2 flex-1">
                  {/* Color label badge */}
                  <span className={`inline-block px-2.5 py-0.5 text-[10px] font-black rounded-full ${r.label}`}>
                    {r.color}
                  </span>
                  <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg leading-tight">{r.name}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 font-semibold leading-relaxed">{r.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Monthly Rewards Category Showcase */}
        <div className="space-y-8 pt-12 border-t border-slate-200 dark:border-white/5">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <Gift className="w-6 h-6 text-[#1e3a8a] dark:text-luna-gold" />
              Monthly Rewards
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 font-semibold leading-relaxed">
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
          <div className="text-center pt-6 max-w-xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 dark:bg-yellow-950/40 text-[#FBBF24] border border-yellow-100 dark:border-yellow-900/30 text-xs font-black rounded-full">
              🏆 Top Luna Earners
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-300 font-semibold leading-relaxed">
              Students with the highest Luna count at the end of the month will receive rewards from these categories.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LunaRewards;
