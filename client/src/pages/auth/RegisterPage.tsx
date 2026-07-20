import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Cpu, Loader2, GraduationCap, BookOpen } from 'lucide-react';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    rollNo: '', department: '', course: '', semester: '1', year: String(new Date().getFullYear()),
    employeeId: '', designation: 'Assistant Professor',
  });
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload: any = { name: form.name, email: form.email, password: form.password, role, phone: form.phone };
      if (role === 'student') {
        payload.rollNo = form.rollNo; payload.department = form.department;
        payload.course = form.course; payload.semester = Number(form.semester); payload.year = Number(form.year);
      } else {
        // Employee ID is optional for faculty
        if (form.employeeId) payload.employeeId = form.employeeId;
        payload.department = form.department; 
        payload.designation = form.designation;
      }
      const res = await authApi.register(payload);
      if (res.success && res.user && res.token) {
        setAuth(res.user, res.token);
        toast.success('Account created successfully!');
        navigate(res.user.role === 'faculty' ? '/faculty' : '/student');
      }
    } catch { } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-lg relative">
        <div className="glass-card p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center shadow-glow mb-3">
              <Cpu size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Join Smart Attendance System</p>
          </div>

          {/* Role toggle */}
          <div className="flex bg-gray-100 dark:bg-dark-600 rounded-xl p-1 mb-6">
            {(['student', 'faculty'] as const).map((r) => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${role === r ? 'bg-gradient-to-r from-primary-600 to-violet-600 text-white shadow-glow' : 'text-gray-500 dark:text-gray-400'}`}>
                {r === 'student' ? <GraduationCap size={16} /> : <BookOpen size={16} />}
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Full Name</label>
                <input id="reg-name" className="input-field" placeholder="John Doe" value={form.name} onChange={set('name')} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
                <input id="reg-email" type="email" className="input-field" placeholder="email@example.com" value={form.email} onChange={set('email')} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Phone</label>
                <input id="reg-phone" className="input-field" placeholder="+91 XXXXXXXXXX" value={form.phone} onChange={set('phone')} />
              </div>
              <div className="col-span-2 relative">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Password</label>
                <input id="reg-password" type={showPassword ? 'text' : 'password'} className="input-field pr-10" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 bottom-3 text-gray-400">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Department</label>
                <input id="reg-department" className="input-field" placeholder="Computer Science" value={form.department} onChange={set('department')} required />
              </div>
              {role === 'student' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Roll Number</label>
                    <input id="reg-rollno" className="input-field" placeholder="CS2024001" value={form.rollNo} onChange={set('rollNo')} required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Course</label>
                    <input id="reg-course" className="input-field" placeholder="B.Tech" value={form.course} onChange={set('course')} required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Semester</label>
                    <select id="reg-semester" className="input-field" value={form.semester} onChange={set('semester')}>
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Employee ID <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input id="reg-employeeid" className="input-field" placeholder="FAC2024001" value={form.employeeId} onChange={set('employeeId')} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Designation</label>
                    <select id="reg-designation" className="input-field" value={form.designation} onChange={set('designation')}>
                      {['Assistant Professor', 'Associate Professor', 'Professor', 'Head of Department'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </>
              )}
            </div>

            <button id="reg-submit" type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 mt-4">
              {isLoading ? <><Loader2 size={18} className="animate-spin" /> Creating...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
