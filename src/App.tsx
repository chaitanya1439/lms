import React, { useState, useEffect } from 'react';
import { BookOpen, Layout, Users, BarChart3, Settings, User, LogOut, Plus, Search, Bell, Star, Clock, Award, TrendingUp, Calendar, Filter, ChevronRight, Play, Target } from 'lucide-react';


const supabase = {
  auth: {
    getUser: () => Promise.resolve({ data: { user: { id: 'demo-user', email: 'demo@example.com' } } }),
    signUp: (credentials: { email: string; password: string }) => Promise.resolve({ data: { user: { id: 'demo-user' } }, error: null }),
    signInWithPassword: (credentials: { email: string; password: string }) => Promise.resolve({ error: null }),
    signOut: () => Promise.resolve()
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ 
          data: { id: 'demo-user', email: 'demo@example.com', full_name: 'John Doe', role: 'student' }
        })
      })
    }),
    insert: (data: any[]) => Promise.resolve({ data: null, error: null })
  })
};

interface Course {
  id: string;
  title: string;
  format: 'module' | 'weekly' | 'social';
  description: string;
  progress: number;
  enrolled: boolean;
  instructor: string;
  duration: string;
  rating: number;
  students: number;
  level: string;
  category: string;
  thumbnail: string;
}

interface UserData {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Advanced Spanish Conversation',
    format: 'weekly',
    description: 'Master conversational Spanish with native speakers and interactive sessions.',
    progress: 75,
    enrolled: true,
    instructor: 'María González',
    duration: '12 weeks',
    rating: 4.8,
    students: 234,
    level: 'Advanced',
    category: 'Spanish',
    thumbnail: 'bg-gradient-to-br from-red-400 to-pink-500'
  },
  {
    id: '2',
    title: 'French for Business',
    format: 'module',
    description: 'Professional French language skills for business communications and meetings.',
    progress: 45,
    enrolled: true,
    instructor: 'Pierre Dubois',
    duration: '8 weeks',
    rating: 4.6,
    students: 189,
    level: 'Intermediate',
    category: 'French',
    thumbnail: 'bg-gradient-to-br from-blue-400 to-indigo-500'
  },
  {
    id: '3',
    title: 'German Grammar Fundamentals',
    format: 'social',
    description: 'Build a solid foundation in German grammar through interactive exercises.',
    progress: 0,
    enrolled: false,
    instructor: 'Klaus Weber',
    duration: '10 weeks',
    rating: 4.7,
    students: 156,
    level: 'Beginner',
    category: 'German',
    thumbnail: 'bg-gradient-to-br from-yellow-400 to-orange-500'
  },
  {
    id: '4',
    title: 'Japanese Writing System',
    format: 'module',
    description: 'Learn Hiragana, Katakana, and basic Kanji characters with practice exercises.',
    progress: 0,
    enrolled: false,
    instructor: 'Yuki Tanaka',
    duration: '6 weeks',
    rating: 4.9,
    students: 298,
    level: 'Beginner',
    category: 'Japanese',
    thumbnail: 'bg-gradient-to-br from-purple-400 to-pink-500'
  },
  {
    id: '5',
    title: 'Italian Cooking & Language',
    format: 'social',
    description: 'Learn Italian through cooking traditional recipes and cultural immersion.',
    progress: 0,
    enrolled: false,
    instructor: 'Giuseppe Romano',
    duration: '14 weeks',
    rating: 4.5,
    students: 112,
    level: 'Intermediate',
    category: 'Italian',
    thumbnail: 'bg-gradient-to-br from-green-400 to-teal-500'
  }
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchUserAndCourses();
  }, []);

  async function fetchUserAndCourses() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const { data: userData } = await supabase
          .from('users')
          .select()
          .eq()
          .single();
        
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      if (authView === 'signup') {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          await supabase.from('users').insert([
            { id: authData.user.id, email, full_name: fullName, role: 'student' }
          ]);
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
      }

      await fetchUserAndCourses();
    } catch (error) {
      console.error('Auth error:', error);
      setAuthError('Authentication failed. Please try again.');
      setPassword('');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    setCourses(mockCourses);
  }

  const handleEnroll = async (courseId: string) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId 
        ? { ...course, enrolled: true, progress: 0 }
        : course
    ));
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(courses.map(c => c.category)))];

  const AuthForm = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
      
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-96 border border-white/20">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">EduLMS</h1>
            <p className="text-sm text-gray-500">Learn without limits</p>
          </div>
        </div>

        {authError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            {authError}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          {authView === 'signup' && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setAuthError(null);
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                placeholder="Enter your full name"
                required
              />
            </div>
          )}
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setAuthError(null);
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 bg-white/50 backdrop-blur-sm"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setAuthError(null);
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 bg-white/50 backdrop-blur-sm"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Please wait...
              </div>
            ) : (authView === 'signup' ? 'Create Account' : 'Sign In')}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {authView === 'login' ? "New to EduLMS? " : "Already have an account? "}
            <button
              onClick={() => {
                setAuthView(authView === 'login' ? 'signup' : 'login');
                setAuthError(null);
                setPassword('');
              }}
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              {authView === 'login' ? 'Create Account' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className="w-72 bg-white/90 backdrop-blur-xl h-screen fixed left-0 top-0 shadow-2xl border-r border-gray-200/50 z-40">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">EduLMS</h1>
            <p className="text-xs text-gray-500">Professional Learning</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          {[
            { id: 'dashboard', icon: Layout, label: 'Dashboard', desc: 'Overview & Stats' },
            { id: 'courses', icon: BookOpen, label: 'Courses', desc: 'Browse & Learn' },
            { id: 'users', icon: Users, label: 'Community', desc: 'Students & Teachers' },
            { id: 'reports', icon: BarChart3, label: 'Analytics', desc: 'Progress Reports' },
            { id: 'settings', icon: Settings, label: 'Settings', desc: 'Preferences' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id 
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-sm' 
                  : 'hover:bg-gray-50 hover:shadow-sm'
              }`}
            >
              <div className={`p-2 rounded-lg transition-colors ${
                activeTab === item.id 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                  : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
              }`}>
                <item.icon className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className={`font-semibold ${activeTab === item.id ? 'text-gray-900' : 'text-gray-700'}`}>
                  {item.label}
                </div>
                <div className="text-xs text-gray-500">{item.desc}</div>
              </div>
              {activeTab === item.id && (
                <ChevronRight className="h-4 w-4 text-blue-500 ml-auto" />
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );

  const Header = () => (
    <header className="bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-200/50 p-6 flex justify-between items-center sticky top-0 z-30">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 capitalize flex items-center gap-2">
          {activeTab === 'dashboard' && <Layout className="h-6 w-6 text-blue-600" />}
          {activeTab === 'courses' && <BookOpen className="h-6 w-6 text-blue-600" />}
          {activeTab === 'users' && <Users className="h-6 w-6 text-blue-600" />}
          {activeTab === 'reports' && <BarChart3 className="h-6 w-6 text-blue-600" />}
          {activeTab === 'settings' && <Settings className="h-6 w-6 text-blue-600" />}
          {activeTab}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {activeTab === 'dashboard' && 'Your learning journey overview'}
          {activeTab === 'courses' && 'Explore and enroll in new courses'}
          {activeTab === 'users' && 'Connect with fellow learners'}
          {activeTab === 'reports' && 'Track your progress and achievements'}
          {activeTab === 'settings' && 'Customize your learning experience'}
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
          <Bell className="h-5 w-5 text-gray-600" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.full_name?.charAt(0)}
          </div>
          <div className="text-left">
            <div className="font-semibold text-gray-900">{user?.full_name}</div>
            <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
          </div>
        </div>
        
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );

  const CourseCard = ({ course }: { course: Course }) => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-gray-200">
      <div className={`h-32 ${course.thumbnail} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full text-gray-700">
            {course.level}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <span className="bg-white/90 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full text-gray-700 capitalize">
            {course.format}
          </span>
        </div>
        {course.enrolled && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-full transition-all duration-500" 
                style={{ width: `${course.progress}%` }}
              />
            </div>
            <div className="text-white text-xs font-semibold mt-1">
              {course.progress}% Complete
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {course.title}
          </h3>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-semibold text-gray-700">{course.rating}</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
        
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {course.instructor}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {course.duration}
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {course.students}
          </div>
        </div>
        
        {course.enrolled ? (
          <button className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-200 flex items-center justify-center gap-2">
            <Play className="h-4 w-4" />
            Continue Learning
          </button>
        ) : (
          <button 
            onClick={() => handleEnroll(course.id)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Enroll Now
          </button>
        )}
      </div>
    </div>
  );

  const CourseList = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCourses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
      
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No courses found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );

  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }: any) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
            <TrendingUp className="h-4 w-4" />
            {trend}
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-gray-600 font-medium">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  const Dashboard = () => {
    const enrolledCourses = courses.filter(c => c.enrolled);
    const avgProgress = enrolledCourses.length > 0 
      ? Math.round(enrolledCourses.reduce((acc, curr) => acc + curr.progress, 0) / enrolledCourses.length)
      : 0;

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={BookOpen}
            title="Enrolled Courses"
            value={enrolledCourses.length}
            subtitle="Active learning paths"
            color="from-blue-500 to-blue-600"
            trend="+12%"
          />
          <StatCard
            icon={TrendingUp}
            title="Average Progress"
            value={`${avgProgress}%`}
            subtitle="Across all courses"
            color="from-green-500 to-green-600"
            trend="+8%"
          />
          <StatCard
            icon={Award}
            title="Certificates"
            value="3"
            subtitle="Completed achievements"
            color="from-purple-500 to-purple-600"
            trend="+2"
          />
          <StatCard
            icon={Clock}
            title="Study Time"
            value="24h"
            subtitle="This month"
            color="from-orange-500 to-orange-600"
            trend="+15%"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Learning Progress</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold">View All</button>
            </div>
            
            <div className="space-y-4">
              {enrolledCourses.map(course => (
                <div key={course.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-600">{course.instructor}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{course.progress}%</div>
                      <div className="text-xs text-gray-500 capitalize">{course.format}</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-6 w-6" />
                <h3 className="text-lg font-bold">Learning Goal</h3>
              </div>
              <p className="text-blue-100 mb-4">Complete 2 courses this month</p>
              <div className="bg-white/20 rounded-full h-2 mb-2">
                <div className="bg-white h-2 rounded-full w-3/4"></div>
              </div>
              <p className="text-sm text-blue-100">1.5 of 2 courses completed</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="h-5 w-5 text-gray-600" />
                <h3 className="font-bold text-gray-900">Upcoming Sessions</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Spanish Conversation</p>
                    <p className="text-xs text-gray-600">Today, 3:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">French Business</p>
                    <p className="text-xs text-gray-600">Tomorrow, 10:00 AM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <Award className="h-5 w-5 text-gray-600" />
                <h3 className="font-bold text-gray-900">Recent Achievements</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Week Streak</p>
                    <p className="text-xs text-gray-600">7 days in a row</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <Star className="h-4 w-4 text-white fill-current" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Perfect Score</p>
                    <p className="text-xs text-gray-600">French Quiz #3</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ComingSoonSection = ({ title, description }: { title: string; description: string }) => (
    <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
      <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <Settings className="h-5 w-5 text-white" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-6 py-3 rounded-xl font-semibold">
        <Clock className="h-4 w-4" />
        Coming Soon
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading your learning experience...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
      
      <Sidebar />
      <div className="ml-72">
        <Header />
        <main className="p-8">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'courses' && <CourseList />}
          {activeTab === 'users' && (
            <ComingSoonSection 
              title="Community Hub" 
              description="Connect with fellow learners, join study groups, and collaborate on language exchange programs."
            />
          )}
          {activeTab === 'reports' && (
            <ComingSoonSection 
              title="Advanced Analytics" 
              description="Detailed progress reports, learning analytics, and personalized insights to optimize your study routine."
            />
          )}
          {activeTab === 'settings' && (
            <ComingSoonSection 
              title="Personalization Center" 
              description="Customize your learning preferences, notification settings, and accessibility options."
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;