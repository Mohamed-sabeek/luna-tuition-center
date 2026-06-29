import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {
  Plus, Search, Filter, User, Edit, Trash2, Eye, EyeOff, Mail, Phone, MapPin, 
  Calendar, X, RefreshCw, Camera, LayoutGrid, List, ChevronLeft, ChevronRight,
  Download, Printer, FileText, Bookmark, CheckSquare, Square, TrendingUp, Moon
} from 'lucide-react';

const StudentManagement = () => {
  const navigate = useNavigate();
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStandard, setSelectedStandard] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // View Mode
  const [viewMode, setViewMode] = useState(localStorage.getItem('rosterViewMode') || 'card');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [standard, setStandard] = useState(1);
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [address, setAddress] = useState('');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [parentPassword, setParentPassword] = useState('');
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [modalError, setModalError] = useState('');
  
  // Alert logs
  const [alertMsg, setAlertMsg] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const url = `/students/roster?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}&grade=${selectedStandard}&sort=${sortBy}`;
      const { data } = await api.get(url);
      setStudents(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalStudents(data.total || 0);
    } catch (error) {
      setAlertMsg({ text: 'Failed to fetch student list.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery, selectedStandard, sortBy]);

  // Debounce search and filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // reset to page 1 on filter change
      fetchStudents();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedStandard, sortBy, limit]);

  // Handle page changes without resetting
  useEffect(() => {
    fetchStudents();
  }, [page]);

  // Responsive View Mode
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === 'list') {
        setViewMode('card');
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  const handleViewToggle = (mode) => {
    setViewMode(mode);
    localStorage.setItem('rosterViewMode', mode);
  };

  const clearForm = () => {
    setName('');
    setStandard(1);
    setParentName('');
    setParentEmail('');
    setParentPhone('');
    setAddress('');
    setJoiningDate(new Date().toISOString().split('T')[0]);
    setParentPassword('');
    setProfilePhotoFile(null);
    setFatherName('');
    setMotherName('');
    setRollNo('');
    setShowPassword(false);
    setModalError('');
    setSelectedStudentId(null);
    setEditMode(false);
  };

  const handleOpenAdd = () => {
    clearForm();
    setModalError('');
    setEditMode(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditMode(true);
    setModalError('');
    setSelectedStudentId(student._id);
    setName(student.name);
    setStandard(student.standard);
    setParentName(student.parentName);
    setParentEmail(student.parentEmail);
    setParentPhone(student.parentPhone);
    setAddress(student.address);
    setJoiningDate(student.joiningDate ? student.joiningDate.split('T')[0] : '');
    setParentPassword(''); 
    setFatherName(student.fatherName || student.parentName || '');
    setMotherName(student.motherName || '');
    setRollNo(student.rollNo || '');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('WARNING: Deleting a student will completely wipe their parent account, attendance records, test marks, fee logs, and lunas. Proceed?')) {
      return;
    }
    try {
      await api.delete(`/students/${id}`);
      setAlertMsg({ text: 'Student and related records wiped successfully.', type: 'success' });
      fetchStudents();
    } catch (error) {
      setAlertMsg({ text: 'Failed to delete student.', type: 'error' });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhotoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(parentEmail)) {
      setModalError('Please enter a valid email address for the parent.');
      setSubmitting(false);
      return;
    }

    if (!editMode && !parentPassword) {
      setModalError('Parent portal password is required for new students.');
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('standard', standard);
    formData.append('parentName', fatherName || motherName || 'Parent');
    formData.append('parentEmail', parentEmail);
    formData.append('parentPhone', parentPhone);
    formData.append('address', address);
    formData.append('joiningDate', joiningDate);
    formData.append('fatherName', fatherName);
    formData.append('motherName', motherName);
    formData.append('rollNo', rollNo.trim().toUpperCase());
    if (parentPassword) {
      formData.append('parentPassword', parentPassword);
    }
    if (profilePhotoFile) {
      formData.append('profilePhoto', profilePhotoFile);
    }

    try {
      if (editMode) {
        await api.put(`/students/${selectedStudentId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setAlertMsg({ text: 'Student details updated successfully.', type: 'success' });
      } else {
        await api.post('/students', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setAlertMsg({ text: 'Student added & parent portal credentials sent.', type: 'success' });
      }
      setModalOpen(false);
      clearForm();
      fetchStudents();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to submit form details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(students.map(s => s._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (e, id) => {
    if (e.target.checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(sid => sid !== id));
    }
  };

  const handleBulkExportCSV = () => {
    try {
      const headers = ['Roll No', 'Name', 'Grade', 'Parent Name', 'Parent Phone', 'Attendance %', 'Average Marks', 'Luna Count'];
      const dataToExport = selectedIds.length > 0 ? students.filter(s => selectedIds.includes(s._id)) : students;
      
      const rows = dataToExport.map(s => [
        s.rollNo || '-',
        s.name,
        `Grade ${s.standard}`,
        s.parentName,
        s.parentPhone,
        s.attendancePercentage !== null ? `${s.attendancePercentage}%` : '-',
        s.averageMarks !== null ? `${s.averageMarks}%` : '-',
        s.lunaCount || 0
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + 
        [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Luna_Students_Export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setAlertMsg({ text: 'CSV Export generated successfully.', type: 'success' });
      setSelectedIds([]);
    } catch (e) {
      setAlertMsg({ text: 'Export failed.', type: 'error' });
    }
  };



  return (
    <div className="flex-1 p-6 space-y-6 text-left max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-white/5 p-6 rounded-3xl shadow-sm transition-colors duration-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Student Roster</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            Manage admissions, monitor academic performance, and organize bulk operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-[#0f172a] rounded-xl p-1 border border-slate-200 dark:border-white/10">
            <button
              onClick={() => handleViewToggle('card')}
              className={`p-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${
                viewMode === 'card' 
                  ? 'bg-white dark:bg-slate-700 text-luna-blue shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> Card
            </button>
            <button
              onClick={() => handleViewToggle('list')}
              className={`p-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-slate-700 text-luna-blue shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <List className="w-4 h-4" /> List
            </button>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-3 bg-luna-blue text-white rounded-2xl text-sm font-bold hover:bg-luna-blue/90 shadow-md shadow-luna-blue/10 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Add Student
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {alertMsg.text && (
        <div className={`p-4 rounded-2xl border font-semibold text-sm flex justify-between items-center ${
            alertMsg.type === 'success'
              ? 'bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20 text-green-700 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-700 dark:text-red-400'
          }`}>
          <span>{alertMsg.text}</span>
          <button onClick={() => setAlertMsg({ text: '', type: '' })} className="p-1 rounded hover:bg-slate-200/55 dark:hover:bg-white/10 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Panel */}
      <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-white/5 p-4 rounded-2xl shadow-sm transition-colors duration-200 space-y-4">
        
        {/* Bulk Actions Toolbar (Only show if items selected) */}
        {selectedIds.length > 0 && viewMode === 'list' && (
          <div className="flex flex-wrap items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl">
            <span className="text-sm font-bold text-blue-700 dark:text-blue-400 mr-2">
              {selectedIds.length} Selected
            </span>
            <button onClick={handleBulkExportCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            <button onClick={() => alert('Bulk Delete coming soon')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>

          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4 top-3" />
            <input
              type="text"
              placeholder="Search Name, Roll, Parent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 pl-12 pr-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-luna-blue text-sm transition-colors"
            />
          </div>
          <div>
            <select
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 font-semibold focus:outline-none focus:border-luna-blue text-sm transition-colors"
            >
              <option value="all">All Grades</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((std) => (
                <option key={std} value={std}>Grade {std}</option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-1 md:col-span-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 font-semibold focus:outline-none focus:border-luna-blue text-sm transition-colors"
            >
              <option value="newest">Newest Admission</option>
              <option value="oldest">Oldest Admission</option>
              <option value="roll">Roll Number</option>
              <option value="name">Student Name</option>
              <option value="highest_attendance">Highest Attendance</option>
              <option value="highest_luna">Highest Luna</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-semibold flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-luna-blue dark:text-blue-400" />
          <span>Syncing student files...</span>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-white/5 rounded-3xl p-12 text-center text-slate-400 font-semibold shadow-sm">
          No students found matching your criteria.
        </div>
      ) : viewMode === 'list' ? (
        /* ======================== LIST VIEW ======================== */
        <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-[#0f172a] text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="p-4 w-10">
                    <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === students.length && students.length > 0} className="w-4 h-4 rounded text-luna-blue border-slate-300 focus:ring-luna-blue" />
                  </th>
                  <th className="p-4">Profile</th>
                  <th className="p-4">Roll No</th>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Grade</th>
                  <th className="p-4">Parent Details</th>
                  <th className="p-4 text-center">Attendance</th>
                  <th className="p-4 text-center">Average</th>
                  <th className="p-4 text-center">Lunas</th>

                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(student._id)} 
                        onChange={(e) => handleSelectOne(e, student._id)}
                        className="w-4 h-4 rounded text-luna-blue border-slate-300 focus:ring-luna-blue" 
                      />
                    </td>
                    <td className="p-4">
                      <div className="w-10 h-10 rounded-xl bg-luna-blue/5 border border-luna-blue/10 overflow-hidden flex items-center justify-center text-luna-blue shrink-0">
                        {student.profilePhoto ? (
                          <img src={`http://localhost:5000${student.profilePhoto}`} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.onerror=null; e.target.src=''; }} />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-[#0f172a] rounded-lg font-bold text-slate-600 dark:text-slate-300 text-xs">
                        {student.rollNo || '-'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-extrabold text-slate-800 dark:text-white">{student.name}</div>
                      <div className="text-[10px] text-slate-400 font-semibold truncate max-w-[150px]" title={student.address}>{student.address}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded text-xs font-bold">
                        Grade {student.standard}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-700 dark:text-slate-300">{student.parentName}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">{student.parentPhone}</div>
                    </td>
                    <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      {student.attendancePercentage !== null ? `${student.attendancePercentage}%` : '-'}
                    </td>
                    <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      {student.averageMarks !== null ? `${student.averageMarks}%` : '-'}
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold">
                        🌙 {student.lunaCount || 0}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 transition-opacity">
                        <button onClick={() => navigate(`/teacher/students/${student._id}`)} className="p-1.5 text-slate-400 hover:text-luna-blue hover:bg-blue-50 rounded-lg transition-colors" title="View Profile">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => navigate(`/teacher/tests?student=${student._id}`)} className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" title="Performance">
                          <TrendingUp className="w-4 h-4" />
                        </button>
                        <button onClick={() => navigate(`/teacher/luna-rewards`)} className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Luna History">
                          <Moon className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleOpenEdit(student)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(student._id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ======================== CARD VIEW ======================== */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {students.map((student) => (
            <div key={student._id} className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-white/5 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-250 dark:hover:border-white/10 transition-all flex flex-col justify-between relative overflow-hidden group">
              


              <div>
                <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-100 dark:border-white/5">
                  <div className="w-14 h-14 rounded-2xl bg-luna-blue/5 border border-luna-blue/10 overflow-hidden flex items-center justify-center text-luna-blue shrink-0">
                    {student.profilePhoto ? (
                      <img src={`http://localhost:5000${student.profilePhoto}`} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = ''; }} />
                    ) : <User className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-lg leading-tight pr-12">{student.name}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <span className="inline-block px-2 py-0.5 bg-luna-blue/5 text-luna-blue text-xs font-bold rounded-md">Grade {student.standard}</span>
                      {student.rollNo && (
                        <span className="inline-block px-2 py-0.5 bg-purple-50 text-purple-655 text-xs font-bold rounded-md">{student.rollNo}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-400" /><span>Parent: <strong className="text-slate-700 dark:text-slate-300">{student.parentName}</strong></span></div>
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /><span className="truncate" title={student.parentEmail}>{student.parentEmail}</span></div>
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /><span>{student.parentPhone}</span></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
                <button onClick={() => navigate(`/teacher/students/${student._id}`)} className="flex items-center justify-center gap-1.5 py-2.5 border border-slate-100 dark:border-white/5 hover:border-slate-200 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 text-xs font-bold transition-all" title="View Profile Stats">
                  <Eye className="w-4 h-4" /> Stats
                </button>
                <button onClick={() => handleOpenEdit(student)} className="flex items-center justify-center gap-1.5 py-2.5 border border-slate-100 dark:border-white/5 hover:border-slate-200 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 text-xs font-bold transition-all" title="Edit details">
                  <Edit className="w-4 h-4 text-luna-blue" /> Edit
                </button>
                <button onClick={() => handleDelete(student._id)} className="flex items-center justify-center gap-1.5 py-2.5 border border-red-100 hover:border-red-200 text-red-500 rounded-xl hover:bg-red-50 text-xs font-bold transition-all" title="Remove student">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
          <div className="text-sm font-semibold text-slate-500">
            {(() => {
              if (totalStudents === 0) return "No students found";
              if (totalStudents === 1) return "Showing 1 student";
              const start = (page - 1) * limit + 1;
              const end = Math.min(page * limit, totalStudents);
              return (
                <>
                  Showing <span className="font-extrabold text-slate-700 dark:text-slate-300">{start}</span>–<span className="font-extrabold text-slate-700 dark:text-slate-300">{end}</span> of <span className="font-extrabold text-slate-700 dark:text-slate-300">{totalStudents}</span> students
                </>
              );
            })()}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-500">Rows per page:</span>
              <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 border border-slate-200 dark:border-white/10 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-slate-600 dark:text-slate-400">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-4 text-sm font-bold text-slate-700 dark:text-slate-300">
                Page {page} of {totalPages}
              </div>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-2 border border-slate-200 dark:border-white/10 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-slate-600 dark:text-slate-400">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-150 dark:border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col text-left relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 relative shrink-0">
              <button onClick={() => setModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl absolute top-5 right-6 cursor-pointer"><X className="w-5 h-5" /></button>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{editMode ? 'Edit Student Details' : 'Enroll New Student'}</h3>
              <p className="text-xs text-slate-400 font-semibold mt-1">{editMode ? 'Update academic or parent contact details' : 'Creates student logs and generates parent portal credentials.'}</p>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                {modalError && <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-xs font-bold animate-in fade-in">{modalError}</div>}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-805 border-b border-slate-50 dark:border-white/5 pb-2 text-sm dark:text-slate-200">Student Academic Info</h4>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Student Name</label>
                      <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Aditya Sharma" className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-luna-blue focus:bg-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Grade Standard</label>
                      <select value={standard} onChange={(e) => setStandard(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-luna-blue font-semibold">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((std) => (<option key={std} value={std}>Grade {std}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Roll Number</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 text-xs font-extrabold text-slate-400 select-none">LUNA{standard}</span>
                        <input type="text" value={rollNo.startsWith(`LUNA${standard}`) ? rollNo.slice(`LUNA${standard}`.length) : rollNo} onChange={(e) => { const val = e.target.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, ''); if (val.startsWith('LUNA')) setRollNo(val); else setRollNo(val ? `LUNA${standard}${val}` : ''); }} placeholder="e.g. 01" className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 pl-16 pr-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-luna-blue font-bold" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Joining Date</label>
                      <input type="date" required value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-slate-850 dark:text-slate-200 text-sm focus:outline-none focus:border-luna-blue" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Profile Photo (Optional)</label>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 text-slate-650 dark:text-slate-300 hover:bg-slate-200/55 rounded-xl cursor-pointer text-xs font-bold transition-colors"><Camera className="w-4 h-4" /> Choose Photo <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" /></label>
                        <span className="text-xs text-slate-400 truncate max-w-[150px]">{profilePhotoFile ? profilePhotoFile.name : 'No file chosen'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-805 border-b border-slate-50 dark:border-white/5 pb-2 text-sm dark:text-slate-200">Parent Portal Account</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Father Name</label><input type="text" value={fatherName} onChange={(e) => setFatherName(e.target.value)} placeholder="Father Name" className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-slate-805 dark:text-slate-200 text-sm focus:outline-none focus:border-luna-blue" /></div>
                      <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Mother Name</label><input type="text" value={motherName} onChange={(e) => setMotherName(e.target.value)} placeholder="Mother Name" className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-slate-805 dark:text-slate-200 text-sm focus:outline-none focus:border-luna-blue" /></div>
                    </div>
                    <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Parent Email (Username)</label><input type="email" required value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} placeholder="parent@example.com" className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-luna-blue" /></div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Parent Password</label>
                      <div className="relative flex items-center">
                        <input type={showPassword ? 'text' : 'password'} required={!editMode} value={parentPassword} onChange={(e) => setParentPassword(e.target.value)} placeholder={editMode ? 'Leave blank to keep same' : '••••••••'} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 pl-4 pr-12 py-2.5 rounded-xl text-slate-805 dark:text-slate-200 text-sm focus:outline-none focus:border-luna-blue" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-slate-450 hover:text-slate-700 dark:hover:text-white cursor-pointer">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                      </div>
                    </div>
                    <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Parent Phone</label><input type="tel" required value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="+91 99999 88888" className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-luna-blue" /></div>
                  </div>
                </div>
                <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Address Details</label><textarea required rows="2" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street name, house no, area..." className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-luna-blue resize-none" /></div>
              </div>
              <div className="px-6 sm:px-8 py-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3 rounded-b-3xl shrink-0">
                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-350 rounded-xl hover:bg-slate-100 text-xs font-bold cursor-pointer">Cancel</button>
                <button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-750 text-white rounded-xl text-xs font-bold disabled:bg-slate-300 cursor-pointer">{submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />} {editMode ? 'Save Changes' : 'Enroll Student'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
