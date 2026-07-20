import { Link } from 'react-router-dom';
import { Cpu, Shield, Users, Clock, Zap, ArrowRight, CheckCircle, Sparkles, BarChart3, Smartphone, Lock, Globe, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-4 lg:px-8 xl:px-16 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Cpu size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl">Smart Attendance</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-purple-200 hover:text-white transition-colors">
              Login
            </Link>
            <Link to="/register" className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-purple-500/30">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-4 lg:px-8 xl:px-16 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-200 text-sm mb-8 animate-fade-in">
            <Sparkles size={16} />
            <span>AI-Powered Attendance System</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 animate-slide-up">
            Revolutionize Your
            <span className="block bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Attendance Management
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-purple-200 max-w-3xl mx-auto mb-12 animate-slide-up delay-200">
            Advanced face recognition technology for seamless, accurate, and secure student attendance tracking. 
            Save time, reduce errors, and modernize your institution.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-300">
            <Link to="/register" className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 flex items-center gap-2">
              Start Free Trial
              <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center gap-2">
              View Demo
              <Play size={20} />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16 pt-16 border-t border-white/10">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">99.9%</div>
              <div className="text-purple-300 text-sm mt-1">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">&lt;2s</div>
              <div className="text-purple-300 text-sm mt-1">Recognition Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">24/7</div>
              <div className="text-purple-300 text-sm mt-1">Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-4 lg:px-8 xl:px-16 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-purple-200 text-lg max-w-2xl mx-auto">
              Everything you need to modernize attendance management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Feature Cards */}
            <div className="glass-card p-8 rounded-2xl hover:scale-105 transition-transform duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-purple-500/30 transition-shadow">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-white font-semibold text-xl mb-3">Face Recognition</h3>
              <p className="text-purple-200 text-sm leading-relaxed">
                Advanced AI-powered face detection and recognition for accurate attendance marking
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl hover:scale-105 transition-transform duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-shadow">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-white font-semibold text-xl mb-3">Student Management</h3>
              <p className="text-purple-200 text-sm leading-relaxed">
                Comprehensive student database with face registration and profile management
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl hover:scale-105 transition-transform duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-shadow">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-white font-semibold text-xl mb-3">Real-time Tracking</h3>
              <p className="text-purple-200 text-sm leading-relaxed">
                Live attendance sessions with instant updates and real-time monitoring
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl hover:scale-105 transition-transform duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-violet-500/30 transition-shadow">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-white font-semibold text-xl mb-3">Faculty Dashboard</h3>
              <p className="text-purple-200 text-sm leading-relaxed">
                Powerful admin controls for managing classes, sessions, and attendance reports
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl hover:scale-105 transition-transform duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-pink-500/30 transition-shadow">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-white font-semibold text-xl mb-3">Analytics & Reports</h3>
              <p className="text-purple-200 text-sm leading-relaxed">
                Detailed attendance analytics with exportable reports and insights
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl hover:scale-105 transition-transform duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-shadow">
                <Smartphone className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-white font-semibold text-xl mb-3">Mobile Friendly</h3>
              <p className="text-purple-200 text-sm leading-relaxed">
                Responsive design that works seamlessly on all devices and screen sizes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 px-4 lg:px-8 xl:px-16 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-purple-200 text-lg max-w-2xl mx-auto">
              Simple three-step process to get started
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-white font-semibold text-xl mb-3">Register Students</h3>
              <p className="text-purple-200 text-sm">
                Add students and register their faces for recognition
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-white font-semibold text-xl mb-3">Start Session</h3>
              <p className="text-purple-200 text-sm">
                Faculty creates attendance session and students mark attendance
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-white font-semibold text-xl mb-3">View Reports</h3>
              <p className="text-purple-200 text-sm">
                Access detailed attendance reports and analytics
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 px-4 lg:px-8 xl:px-16 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                Why Choose Us?
              </h2>
              <p className="text-purple-200 text-lg mb-8">
                Experience the future of attendance management with cutting-edge technology
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-white font-semibold mb-1">99.9% Accuracy</h4>
                    <p className="text-purple-200 text-sm">Advanced AI ensures precise face recognition</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-white font-semibold mb-1">Time Saving</h4>
                    <p className="text-purple-200 text-sm">Mark attendance in seconds, not minutes</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-white font-semibold mb-1">Secure & Private</h4>
                    <p className="text-purple-200 text-sm">Enterprise-grade security for your data</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-white font-semibold mb-1">Easy Integration</h4>
                    <p className="text-purple-200 text-sm">Seamlessly integrates with existing systems</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 rounded-3xl">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-white/5 rounded-2xl">
                  <Lock className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white">AES-256</div>
                  <div className="text-purple-300 text-xs mt-1">Encryption</div>
                </div>
                <div className="text-center p-6 bg-white/5 rounded-2xl">
                  <Globe className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white">99.9%</div>
                  <div className="text-purple-300 text-xs mt-1">Uptime</div>
                </div>
                <div className="text-center p-6 bg-white/5 rounded-2xl">
                  <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white">50%</div>
                  <div className="text-purple-300 text-xs mt-1">Time Saved</div>
                </div>
                <div className="text-center p-6 bg-white/5 rounded-2xl">
                  <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white">&lt;2s</div>
                  <div className="text-purple-300 text-xs mt-1">Response</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 lg:px-8 xl:px-16 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12 rounded-3xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Attendance System?
            </h2>
            <p className="text-purple-200 text-lg mb-8">
              Join thousands of institutions already using Smart Attendance
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 flex items-center gap-2">
                Get Started Free
                <ArrowRight size={20} />
              </Link>
              <Link to="/login" className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20">
                Login to Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 lg:px-8 xl:px-16 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Cpu size={16} className="text-white" />
              </div>
              <span className="text-white font-semibold">Smart Attendance</span>
            </div>
            <p className="text-purple-300 text-sm">
              © 2026 Smart Attendance. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="#" className="text-purple-300 hover:text-white text-sm transition-colors">
                Privacy
              </Link>
              <Link to="#" className="text-purple-300 hover:text-white text-sm transition-colors">
                Terms
              </Link>
              <Link to="#" className="text-purple-300 hover:text-white text-sm transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom styles for animations */}
      <style>{`
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
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        .glass-card {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
      `}</style>
    </div>
  );
}

function Play({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}
