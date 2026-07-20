import { useEffect, useState } from 'react';
import { Users, Search, RefreshCw, Trash2, Camera, ShieldAlert } from 'lucide-react';
import { studentApi } from '../../api/student.api';
import { adminApi } from '../../api/admin.api';
import toast from 'react-hot-toast';

export default function ManageUsers() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentApi.getAllStudents();
      setStudents(res?.data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleResetFace = async (studentId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to reset the face data for ${name}? They will need to re-register their face.`)) {
      return;
    }

    try {
      await adminApi.resetStudentFaceData(studentId);
      toast.success(`Face data for ${name} has been reset.`);
      fetchStudents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset face data');
    }
  };

  const filteredStudents = students?.filter(s => 
    s?.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s?.rollNo?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Users className="text-primary-500" />
            Manage Students
          </h1>
          <p className="page-subtitle">View and manage student face registrations</p>
        </div>
        <button onClick={fetchStudents} className="btn-secondary flex items-center gap-2">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-dark-600 bg-gray-50/50 dark:bg-dark-600/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or register number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Total Students: {students.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-dark-600/50 text-gray-700 dark:text-gray-400 border-b border-gray-200 dark:border-dark-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Student</th>
                <th className="px-6 py-4 font-semibold">Roll No</th>
                <th className="px-6 py-4 font-semibold">Dept</th>
                <th className="px-6 py-4 font-semibold text-center">Face Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-600">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                    Loading students...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student?._id} className="hover:bg-gray-50 dark:hover:bg-dark-600/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {student?.userId?.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {student?.userId?.email || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium">
                      {student?.rollNo}
                    </td>
                    <td className="px-6 py-4">
                      {student?.department}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {student?.isFaceRegistered ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <Camera size={14} /> Registered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                          <ShieldAlert size={14} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {student?.isFaceRegistered && (
                        <button
                          onClick={() => handleResetFace(student?.userId?._id, student?.userId?.name)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 transition-colors"
                          title="Force re-registration"
                        >
                          <Trash2 size={14} /> Reset Face
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
