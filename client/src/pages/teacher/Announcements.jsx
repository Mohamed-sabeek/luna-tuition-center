import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Megaphone, Plus, Trash2, Calendar, RefreshCw, X } from 'lucide-react';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Post states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/announcements');
      setAnnouncements(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return;

    setSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      await api.post('/announcements', { title, content });
      setMessage({ text: 'Announcement broadcast posted successfully.', type: 'success' });
      setTitle('');
      setContent('');
      fetchAnnouncements();
    } catch (error) {
      setMessage({ text: 'Failed to post announcement notice.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Wipe this broadcast notice permanent?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      setMessage({ text: 'Announcement notice deleted.', type: 'success' });
      fetchAnnouncements();
    } catch (error) {
      setMessage({ text: 'Failed to delete announcement.', type: 'error' });
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 text-left max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
        <h1 className="text-2xl font-extrabold text-luna-blue">Class Announcements</h1>
        <p className="text-sm text-slate-500 font-semibold mt-0.5">
          Broadcast alerts, mock calendar revisions, and notices to parents.
        </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Post Form */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-moon-gold" />
            Publish Broadcast
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Notice Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Saturday Mock Rescheduled"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-luna-blue focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Broadcast Description
              </label>
              <textarea
                required
                rows="5"
                placeholder="Write description text details here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-luna-blue focus:bg-white resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-luna-blue text-white rounded-xl text-sm font-bold shadow-md shadow-luna-blue/10 hover:bg-luna-blue/90 disabled:bg-slate-350"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Broadcast Notice
                </>
              )}
            </button>
          </form>
        </div>

        {/* Announcements List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 px-2">Recent Broadcasts Timeline</h3>
          
          {loading ? (
            <div className="text-center py-12 bg-white border border-slate-105 rounded-3xl text-slate-400 font-semibold flex flex-col items-center justify-center gap-3 shadow-sm">
              <RefreshCw className="w-6 h-6 animate-spin text-luna-blue" />
              <span>Checking notice board archives...</span>
            </div>
          ) : announcements.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 font-semibold shadow-sm">
              No notices published on the bulletin board.
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((a) => (
                <div key={a._id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex justify-between items-start hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-extrabold text-slate-805 text-base">{a.title}</h4>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed whitespace-pre-line">{a.content}</p>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(a._id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                    title="Delete notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Announcements;
