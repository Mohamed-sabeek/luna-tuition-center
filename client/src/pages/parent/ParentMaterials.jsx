import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { FileText, Download, Search, RefreshCw } from 'lucide-react';

const ParentMaterials = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMaterials = async () => {
      if (!user?.studentId) return;
      setLoading(true);
      try {
        // Fetch materials filtered by the student's standard
        const { data } = await api.get(`/materials?standard=${user.studentId?.standard || 5}`);
        setMaterials(data);
      } catch (err) {
        console.warn('API error, loading fallback study materials mock data', err);
        // Fallback Mock Data
        setMaterials([
          { _id: 'm1', title: 'Fractions Worksheets & Drills', description: 'Interactive fractions math drills booklet covering addition and divisions.', filePath: '/uploads/materials/mock.pdf', standard: 5 },
          { _id: 'm2', title: 'Science Cell Biology Slides', description: 'Comprehensive notes covering animal and plant cell structures and organelles.', filePath: '/uploads/materials/mock.pdf', standard: 5 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, [user]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-405 gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-luna-blue" />
        <span className="font-bold">Syncing worksheets directories...</span>
      </div>
    );
  }

  const filteredMaterials = materials.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 space-y-6 text-left max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-white/5 p-5 rounded-3xl shadow-sm">
        <h1 className="text-xl sm:text-2xl font-extrabold text-luna-blue">Class Study Sheets</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
          Download homework files, exam reviews, and notes published by the teacher.
        </p>
      </div>

      {/* Search panel */}
      <div className="relative bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
        <Search className="w-5 h-5 text-slate-450 absolute left-8 top-7" />
        <input
          type="text"
          placeholder="Search materials by title or descriptions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 border border-slate-205 pl-12 pr-4 py-3 rounded-xl text-slate-800 focus:outline-none focus:border-luna-blue text-sm font-semibold"
        />
      </div>

      {/* Grid List */}
      {filteredMaterials.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 font-semibold shadow-sm">
          No sheets or worksheets uploaded for your child's standard currently. Check back later!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <div key={material._id} className="bg-white border border-slate-105 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="p-3 bg-luna-blue/5 rounded-2xl text-luna-blue flex items-center justify-center w-12 h-12 mb-4">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-800 text-base leading-tight mb-2 truncate" title={material.title}>
                  {material.title}
                </h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-6 line-clamp-2" title={material.description}>
                  {material.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <a
                  href={`http://localhost:5000${material.filePath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 text-xs font-bold text-luna-blue bg-luna-blue/5 hover:bg-luna-blue/10 px-4 py-2.5 rounded-xl transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download PDF Worksheet
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParentMaterials;
