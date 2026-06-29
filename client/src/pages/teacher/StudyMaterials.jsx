import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FileText, Plus, Search, Trash2, Download, FileUp, X, RefreshCw, BookOpen } from 'lucide-react';

const StudyMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStandard, setSelectedStandard] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Upload modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [standard, setStandard] = useState(1);
  const [file, setFile] = useState(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const url = selectedStandard === 'all' ? '/materials' : `/materials?standard=${selectedStandard}`;
      const { data } = await api.get(url);
      setMaterials(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [selectedStandard]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ text: 'Please select a PDF document to upload.', type: 'error' });
      return;
    }

    setSubmitting(true);
    setMessage({ text: '', type: '' });

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('standard', standard);
    formData.append('file', file);

    try {
      await api.post('/materials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage({ text: 'Study material worksheet uploaded successfully.', type: 'success' });
      setTitle('');
      setDescription('');
      setStandard(1);
      setFile(null);
      setModalOpen(false);
      fetchMaterials();
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to upload study material file.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this study material worksheet permanent?')) return;
    try {
      await api.delete(`/materials/${id}`);
      setMessage({ text: 'Study material entry deleted from classroom.', type: 'success' });
      fetchMaterials();
    } catch (error) {
      setMessage({ text: 'Failed to delete study material.', type: 'error' });
    }
  };

  const filteredMaterials = materials.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 space-y-6 text-left max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-luna-blue">Study Materials</h1>
          <p className="text-sm text-slate-500 font-semibold mt-0.5">
            Distribute notes, homework booklets, worksheets, and syllabus PDFs.
          </p>
        </div>
        
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-luna-blue text-white rounded-2xl text-sm font-bold hover:bg-luna-blue/90 shadow-md shadow-luna-blue/10 transition-all shrink-0"
        >
          <FileUp className="w-5 h-5" />
          Upload Worksheet
        </button>
      </div>

      {/* Message feedback */}
      {message.text && (
        <div
          className={`p-4 rounded-2xl border font-semibold text-sm flex justify-between items-center ${
            message.type === 'success'
              ? 'bg-green-50 border-green-150 text-green-700'
              : 'bg-red-50 border-red-150 text-red-700'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage({ text: '', type: '' })} className="p-1 rounded hover:bg-slate-200/50">
            <X className="w-4 h-4 text-slate-405" />
          </button>
        </div>
      )}

      {/* Filter and Search Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
        <div className="relative md:col-span-2">
          <Search className="w-5 h-5 text-slate-450 absolute left-4 top-3" />
          <input
            type="text"
            placeholder="Search worksheets by title or key description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-2.5 rounded-xl text-slate-800 focus:outline-none focus:border-luna-blue text-sm"
          />
        </div>
        <div>
          <select
            value={selectedStandard}
            onChange={(e) => setSelectedStandard(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-luna-blue text-sm"
          >
            <option value="all">All Grades</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((std) => (
              <option key={std} value={std}>Grade {std}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials List Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 font-semibold flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-luna-blue" />
          <span>Searching syllabus files...</span>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 font-semibold shadow-sm">
          No study materials logged for this criteria. Upload a PDF to start!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((m) => (
            <div key={m._id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="p-3 bg-luna-blue/5 rounded-2xl text-luna-blue flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-605 text-xs font-bold rounded">
                    Grade {m.standard}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-800 text-base leading-tight mb-2 truncate" title={m.title}>
                  {m.title}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mb-6 leading-relaxed line-clamp-2" title={m.description}>
                  {m.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-50 flex justify-between items-center mt-auto">
                <a
                  href={`http://localhost:5000${m.filePath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-luna-blue bg-luna-blue/5 hover:bg-luna-blue/10 px-3.5 py-2 rounded-xl transition-all"
                >
                  <Download className="w-4 h-4" />
                  View Worksheet
                </a>
                
                <button
                  onClick={() => handleDelete(m._id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Delete resource"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload PDF Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full p-6 sm:p-8 text-left relative animate-in fade-in zoom-in-95 duration-205">
            <button
              onClick={() => setModalOpen(false)}
              className="p-2 text-slate-450 hover:text-slate-700 hover:bg-slate-50 rounded-xl absolute top-6 right-6"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-extrabold text-luna-blue mb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-moon-gold" />
              Upload PDF Worksheet
            </h3>
            <p className="text-xs text-slate-450 font-semibold mb-6">
              File size should not exceed 10MB. Only PDF document uploads are supported.
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Resource Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Saturday Fractions Worksheet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-luna-blue focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Brief Description
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="e.g. Homework booklet testing concept clarity on fractions, division and algebra..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-luna-blue focus:bg-white resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Grade Standard Target
                </label>
                <select
                  value={standard}
                  onChange={(e) => setStandard(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-luna-blue focus:bg-white font-semibold"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((std) => (
                    <option key={std} value={std}>Grade {std}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Choose File (PDF)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 text-slate-650 hover:bg-slate-200/50 rounded-xl cursor-pointer text-xs font-bold transition-colors">
                    <FileUp className="w-4 h-4" />
                    Select PDF
                    <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                  </label>
                  <span className="text-xs text-slate-400 truncate max-w-[200px]">
                    {file ? file.name : 'No file chosen'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 bg-luna-blue text-white rounded-xl text-sm font-bold hover:bg-luna-blue/90 disabled:bg-slate-350"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Submit Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyMaterials;
