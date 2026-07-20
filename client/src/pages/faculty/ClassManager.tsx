import { useEffect, useState } from 'react';
import { facultyApi } from '../../api/faculty.api';
import type { CreateClassPayload } from '../../api/faculty.api';
import { studentApi } from '../../api/student.api';
import { attendanceApi } from '../../api/attendance.api';
import type { ClassData, StudentProfile } from '../../types';
import { Loader2, Plus, Users, Play, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function ClassManager() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateClassPayload>({
    name: '', subject: '', subjectCode: '', department: '', semester: 1
  });
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [classStudents, setClassStudents] = useState<StudentProfile[]>([]);
  const [allStudents, setAllStudents] = useState<StudentProfile[]>([]);
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [classRes, sessionRes] = await Promise.all([
        facultyApi.getClasses(),
        attendanceApi.getFacultySessions({ limit: 50 })
      ]);
      setClasses(classRes?.data || []);
      setSessions(sessionRes?.data || []);
    } catch (e: any) {
      console.error(e);
      setError(e.response?.data?.message || 'Failed to load classes.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await facultyApi.createClass(formData);
      toast.success('Class created!');
      setShowForm(false);
      fetchData();
    } catch (e) { }
  };

  const handleStartSession = async (classId: string) => {
    try {
      const res = await attendanceApi.startSession({ classId, topic: 'Lecture' });
      navigate(`/faculty/session/${res.data._id}`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Unable to create attendance session. Please try again.');
    }
  };

  const handleDeleteClass = async (classId: string, className: string) => {
    if (!confirm(`Are you sure you want to delete "${className}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await facultyApi.deleteClass(classId);
      toast.success('Class deleted successfully');
      fetchData();
    } catch (e) {
      toast.error('Failed to delete class');
    }
  };

  const loadStudents = async (classId: string) => {
    setSelectedClass(classId);
    try {
      const [classRes, allRes] = await Promise.all([
        facultyApi.getClassStudents(classId),
        studentApi.getAllStudents()
      ]);
      const classData = classRes?.data || [];
      const allData = allRes?.data || [];
      
      setClassStudents(classData);
      
      // Filter out already enrolled students
      const enrolledIds = new Set(classData.map(s => (s.userId as any)?._id || s.userId));
      setAllStudents(allData.filter(s => !enrolledIds.has((s.userId as any)?._id || s.userId)));
    } catch (e) {
      toast.error('Failed to load students.');
    }
  };

  const enrollStudent = async (studentId: string) => {
    if (!selectedClass) return;
    try {
      await facultyApi.addStudents(selectedClass, [studentId]);
      toast.success('Student enrolled');
      loadStudents(selectedClass);
    } catch (e) {}
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title">Manage Classes</h1>
          <p className="page-subtitle">Create classes and manage enrollments</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New Class
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6 mb-8 animate-fade-in">
          <h2 className="text-lg font-bold mb-4">Create New Class</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Class Name</label><input className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. CS Section A" required /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Subject</label><input className="input-field" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} placeholder="Database Systems" required /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Subject Code</label><input className="input-field" value={formData.subjectCode} onChange={e => setFormData({...formData, subjectCode: e.target.value})} placeholder="CS301" required /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Department</label><input className="input-field" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="Computer Science" required /></div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Semester</label>
              <select className="input-field" value={formData.semester} onChange={e => setFormData({...formData, semester: Number(e.target.value)})}>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-end"><button type="submit" className="btn-primary w-full h-11">Save Class</button></div>
          </form>
        </div>
      )}

      {loading ? <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary-500" size={32} /></div> : error ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 dark:bg-dark-900 rounded-xl border border-red-200 dark:border-red-900/50">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={fetchData} className="btn-primary">Retry</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {classes?.map(cls => {
            const classSessions = sessions?.filter(s => s?.classId?._id === cls?._id || s?.classId === cls?._id) || [];
            const activeSession = classSessions.find(s => s?.status === 'active');
            
            // Check if any session was completed today
            const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
            const completedToday = classSessions.find(s => 
              s.status === 'closed' && 
              new Date(s.date).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) === todayStr
            );

            return (
              <div key={cls?._id} className="glass-card flex flex-col overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-dark-600 relative">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">{cls?.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded font-medium">{cls?.subjectCode}</span>
                      <button
                        onClick={() => handleDeleteClass(cls?._id, cls?.name)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-colors"
                        title="Delete class"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{cls?.subject}</p>
                  
                  <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 items-center justify-between">
                     <div className="flex items-center gap-1"><Users size={16} /> {cls?.students?.length || 0} Enrolled</div>
                     {completedToday ? (
                       <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                         Attendance Completed
                       </span>
                     ) : (
                       <span className="text-xs font-semibold text-gray-500">
                         Status: Ready
                       </span>
                     )}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-dark-600/50 flex gap-2">
                  <button onClick={() => loadStudents(cls?._id)} className="btn-secondary flex-1 text-sm py-2 text-center">Manage</button>
                  {completedToday ? (
                    <button onClick={() => navigate('/faculty/reports')} className="btn-secondary flex-1 flex items-center justify-center gap-2 py-2 text-sm">
                      View Report
                    </button>
                  ) : (
                    <button onClick={() => handleStartSession(cls?._id)} className="btn-primary flex-1 flex items-center justify-center gap-2 py-2 text-sm">
                      <Play size={16} /> Start Class
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-card w-full max-w-4xl max-h-[85vh] flex flex-col animate-fade-in bg-white dark:bg-dark-800">
            <div className="p-5 border-b border-gray-200 dark:border-dark-600 flex justify-between items-center">
              <h2 className="text-xl font-bold">Manage Students</h2>
              <button onClick={() => setSelectedClass(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Enrolled */}
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Users size={18} className="text-emerald-500" /> Enrolled Students ({classStudents.length})
                </h3>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                  {classStudents?.map(s => (
                    <div key={s?._id} className="p-3 border border-gray-200 dark:border-dark-600 rounded-lg flex justify-between items-center bg-gray-50 dark:bg-dark-700">
                       <div>
                         <p className="font-medium text-sm">{(s?.userId as any)?.name || 'Unknown'}</p>
                         <p className="text-xs text-gray-500">{s?.rollNo}</p>
                       </div>
                    </div>
                  ))}
                  {classStudents.length === 0 && <p className="text-sm text-gray-500 italic">No students enrolled yet.</p>}
                </div>
              </div>

              {/* Available */}
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Plus size={18} className="text-primary-500" /> Available to Enroll
                </h3>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                  {allStudents?.map(s => (
                    <div key={s?._id} className="p-3 border border-gray-200 dark:border-dark-600 rounded-lg flex justify-between items-center">
                       <div>
                         <p className="font-medium text-sm">{(s?.userId as any)?.name || 'Unknown'}</p>
                         <p className="text-xs text-gray-500">{s?.rollNo}</p>
                       </div>
                       <button onClick={() => enrollStudent((s?.userId as any)?._id || (s?.userId as any))} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-md text-xs font-semibold hover:bg-primary-200">
                         Add
                       </button>
                    </div>
                  ))}
                  {allStudents.length === 0 && <p className="text-sm text-gray-500 italic">No available students.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
