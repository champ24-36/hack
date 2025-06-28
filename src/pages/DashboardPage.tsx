import { Link } from 'react-router-dom';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import MessageSquare from 'lucide-react/dist/esm/icons/message-square';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Clock from 'lucide-react/dist/esm/icons/clock';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import Users from 'lucide-react/dist/esm/icons/users';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnimatedSection from '../components/AnimatedSection';
import useAuth from '../contexts/useAuth';

const DashboardPage = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Active Cases',
      value: '3',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Consultations',
      value: '12',
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Documents',
      value: '8',
      icon: FileText,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Success Rate',
      value: '94%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'consultation',
      title: 'Employment Rights Consultation',
      description: 'Discussed workplace discrimination case',
      date: '2 hours ago',
      status: 'completed',
      icon: MessageSquare
    },
    {
      id: 2,
      type: 'document',
      title: 'Contract Review',
      description: 'Employment contract analysis completed',
      date: '1 day ago',
      status: 'completed',
      icon: FileText
    },
    {
      id: 3,
      type: 'appointment',
      title: 'Follow-up Consultation',
      description: 'Scheduled for tenant rights discussion',
      date: 'Tomorrow at 2:00 PM',
      status: 'scheduled',
      icon: Calendar
    }
  ];

  const upcomingAppointments = [
    {
      id: 1,
      title: 'Tenant Rights Consultation',
      lawyer: 'Sarah Johnson, Esq.',
      date: 'Tomorrow',
      time: '2:00 PM',
      type: 'Video Call'
    },
    {
      id: 2,
      title: 'Contract Review Session',
      lawyer: 'Michael Chen, Esq.',
      date: 'Friday',
      time: '10:00 AM',
      type: 'Phone Call'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'scheduled':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <AnimatedSection animation="slideInDown" className="mb-8">
          <div className="bg-[#B88271] rounded-xl p-6 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-white/90 mb-4">
              Here's an overview of your legal matters and upcoming consultations.
            </p>
            <button className="bg-white text-[#B88271] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg">
              Explore All Services
            </button>
          </div>
        </AnimatedSection>

        {/* Stats Grid */}
        <AnimatedSection animation="slideInUp" delay={200} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 transform hover:-translate-y-1 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-black">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <AnimatedSection animation="slideInLeft" duration={800}>
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-black">Recent Activity</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="bg-[#f2e8e5] p-2 rounded-lg">
                          <activity.icon className="h-5 w-5" style={{ color: '#B88271' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-black truncate">
                              {activity.title}
                            </h3>
                            {getStatusIcon(activity.status)}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-2">{activity.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <Link
                      to="/consultation"
                      className="text-[#B88271] hover:text-[#a86f5e] font-medium text-sm"
                    >
                      View all activity →
                    </Link>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <AnimatedSection animation="slideInRight" duration={800}>
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-black">Quick Actions</h2>
                </div>
                <div className="p-6 space-y-3">
                  <Link
                    to="/book-consultation"
                    className="w-full bg-[#B88271] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#a86f5e] transition-all shadow-lg flex items-center justify-center"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Book Consultation
                  </Link>
                  <Link
                    to="/chat"
                    className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    AI Chat Assistant
                  </Link>
                  <button className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Upload Document
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
                    <Users className="h-5 w-5 mr-2" />
                    Browse Services
                  </button>
                </div>
              </div>
            </AnimatedSection>

            {/* Upcoming Appointments */}
            <AnimatedSection animation="slideInRight" delay={200} duration={800}>
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-black">Upcoming Appointments</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-black text-sm mb-2">
                          {appointment.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          with {appointment.lawyer}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{appointment.date} at {appointment.time}</span>
                          <span className="bg-[#f2e8e5] text-[#B88271] px-2 py-1 rounded">
                            {appointment.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link
                      to="/consultation"
                      className="text-[#B88271] hover:text-[#a86f5e] font-medium text-sm"
                    >
                      View all appointments →
                    </Link>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardPage;