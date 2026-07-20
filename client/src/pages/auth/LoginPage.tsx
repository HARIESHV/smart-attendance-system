import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Cpu, Mail, Lock, Loader2, Shield, Users, Clock, CheckCircle, Sparkles, Zap } from 'lucide-react';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill all fields'); return; }
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      if (res.success && res.user && res.token) {
        setAuth(res.user, res.token);
        toast.success(`Welcome back, ${res.user.name}!`);
        navigate(res.user.role === 'faculty' ? '/faculty' : '/student');
      }
    } catch {
      // Error handled by axios interceptor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center overflow-hidden relative">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Main container */}
      <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8 xl:px-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-screen py-8 lg:py-0">
          
          {/* Left Side - Branding Section (55%) */}
          <div className="hidden lg:flex flex-col justify-center items-center text-center lg:text-left lg:items-start space-y-8 animate-fade-in">
            {/* Logo and Title */}
            <div className="space-y-4">
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-purple-500/30 animate-float">
                  <Cpu size={40} className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white">Smart Attendance</h1>
                  <p className="text-lg text-purple-200 flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-400" />
                    AI Powered Face Recognition
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
              <div className="glass-card p-6 rounded-2xl hover:scale-105 transition-transform duration-300">
                <Shield className="w-10 h-10 text-purple-400 mb-3" />
                <h3 className="text-white font-semibold text-lg mb-2">Secure System</h3>
                <p className="text-purple-200 text-sm">Advanced face recognition technology</p>
              </div>
              <div className="glass-card p-6 rounded-2xl hover:scale-105 transition-transform duration-300">
                <Users className="w-10 h-10 text-blue-400 mb-3" />
                <h3 className="text-white font-semibold text-lg mb-2">Student Management</h3>
                <p className="text-purple-200 text-sm">Efficient attendance tracking</p>
              </div>
              <div className="glass-card p-6 rounded-2xl hover:scale-105 transition-transform duration-300">
                <Clock className="w-10 h-10 text-indigo-400 mb-3" />
                <h3 className="text-white font-semibold text-lg mb-2">Real-time Updates</h3>
                <p className="text-purple-200 text-sm">Instant attendance reports</p>
              </div>
              <div className="glass-card p-6 rounded-2xl hover:scale-105 transition-transform duration-300">
                <Zap className="w-10 h-10 text-violet-400 mb-3" />
                <h3 className="text-white font-semibold text-lg mb-2">Faculty Dashboard</h3>
                <p className="text-purple-200 text-sm">Powerful admin controls</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center lg:justify-start gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">99.9%</div>
                <div className="text-purple-300 text-sm">Accuracy</div>
              </div>
              <div className="w-px h-12 bg-purple-500/30" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white">&lt;2s</div>
                <div className="text-purple-300 text-sm">Recognition</div>
              </div>
              <div className="w-px h-12 bg-purple-500/30" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-purple-300 text-sm">Available</div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Card (45%) */}
          <div className="flex items-center justify-center animate-slide-up">
            <div className="w-full max-w-[480px]">
              {/* Mobile Logo */}
              <div className="lg:hidden flex flex-col items-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-purple-500/30 mb-4 animate-float">
                  <Cpu size={32} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">Smart Attendance</h1>
                <p className="text-sm text-purple-200 mt-1">AI Powered Face Recognition</p>
              </div>

              {/* Login Card */}
              <div className="glass-card p-8 lg:p-10 rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
                <div className="mb-8">
                  <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">Welcome Back</h2>
                  <p className="text-purple-200">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email */}
                  <div>
                    <label htmlFor="login-email" className="block text-sm font-medium text-purple-200 mb-2">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 group-focus-within:text-purple-400 transition-colors" />
                      <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                        placeholder="your@email.com"
                        required
                        aria-label="Email address"
                        aria-required="true"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="login-password" className="block text-sm font-medium text-purple-200 mb-2">
                      Password
                    </label>
                    <div className="relative group">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 group-focus-within:text-purple-400 transition-colors" />
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                        placeholder="••••••••"
                        required
                        aria-label="Password"
                        aria-required="true"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-300 hover:text-purple-400 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-purple-200 cursor-pointer hover:text-purple-100 transition-colors">
                      <input type="checkbox" className="w-4 h-4 rounded border-purple-300 bg-white/10 text-purple-500 focus:ring-purple-500 focus:ring-offset-0" />
                      Remember me
                    </label>
                    <Link to="/forgot-password" className="text-purple-300 hover:text-purple-100 transition-colors">
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button
                    id="login-submit"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <CheckCircle size={20} />
                      </>
                    )}
                  </button>
                </form>

                {/* Register Link */}
                <p className="text-center text-sm text-purple-200 mt-6">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-purple-300 hover:text-purple-100 font-semibold hover:underline transition-colors">
                    Register here
                  </Link>
                </p>
              </div>

              {/* Demo hint */}
              <div className="mt-4 glass-card p-4 rounded-2xl">
                <p className="text-xs text-center text-purple-200">
                  🎓 <strong>Students</strong> and 👨‍🏫 <strong>Faculty</strong> have separate dashboards
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        .glass-card {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
      `}</style>
    </div>
  );
}
