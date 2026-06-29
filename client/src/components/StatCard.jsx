import React from 'react';

const StatCard = ({ title, value, icon: Icon, description, colorClass = 'bg-luna-blue/5 text-luna-blue' }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">{title}</span>
        <h3 className="text-3xl font-extrabold text-slate-800">{value}</h3>
        {description && (
          <p className="text-xs text-slate-400 font-semibold">{description}</p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

export default StatCard;
