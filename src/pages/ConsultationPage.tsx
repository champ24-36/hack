import React, { useState } from 'react';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Video from 'lucide-react/dist/esm/icons/video';
import Phone from 'lucide-react/dist/esm/icons/phone';
import MessageSquare from 'lucide-react/dist/esm/icons/message-square';
import User from 'lucide-react/dist/esm/icons/user';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import XCircle from 'lucide-react/dist/esm/icons/x-circle';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ConsultationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  const consultations = [
    {
      id: 1,
      title: 'Employment Rights Consultation',
      lawyer: 'Sarah Johnson, Esq.',
      date: '2025-01-15',
      time: '2:00 PM',
      duration: '60 minutes',
      type: 'video',
      status: 'scheduled',
      description: 'Discussion about workplace discrimination and employee rights.',
      category: 'Employment Law'
    },
    {
      id: 2,
      title: 'Contract Review Session',
      lawyer: 'Michael Chen, Esq.',
      date: '2025-01-17',
      time: '10:00 AM',
      duration: '45 minutes',
      type: 'phone',
      status: 'scheduled',
      description: 'Review of employment contract terms and conditions.',
      category: 'Contract Law'
    },
    {
      id: 3,
      title: 'Tenant Rights Consultation',
      lawyer: 'Emily Rodriguez, Esq.',
      date: '2025-01-10',
      time: '3:30 PM',
      duration: '60 minutes',
      type: 'video',
      status: 'completed',
      description: 'Discussed landlord-tenant disputes and rental rights.',
      category: 'Housing Law'
    },
    {
      id: 4,
      title: 'Small Business Legal Advice',
      lawyer: 'David Wilson, Esq.',
      date: '2025-01-08',
      time: '11:00 AM',
      duration: '90 minutes',
      type: 'video',
      status: 'completed',
      description: 'Legal requirements for starting a small business.',
      category: 'Business Law'
    }
  ];

  const getFilteredConsultations = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    switch (activeTab) {
      case 'upcoming':
        return consultations.filter(c => c.date >= today && c.status === 'scheduled');
      case 'past':
        return consultations.filter(c => c.date < today || c.status === 'completed');
      case 'all':
      default:
        return consultations;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'scheduled':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5 text-blue-500" />;
      case 'phone':
        return <Phone className="h-5 w-5 text-green-500" />;
      case 'chat':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">My Consultations</h1>
          <p className="text-gray-600">
            Manage your legal consultations and appointments with our expert attorneys.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'upcoming', label: 'Upcoming', count: getFilteredConsultations().length },
                { key: 'past', label: 'Past', count: consultations.filter(c => c.status === 'completed').length },
                { key: 'all', label: 'All', count: consultations.length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as 'upcoming' | 'past' | 'all')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-[#B88271] text-[#B88271]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Consultations List */}
        <div className="space-y-6">
          {getFilteredConsultations().map((consultation) => (
            <div key={consultation.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-black">
                        {consultation.title}
                      </h3>
                      {getStatusIcon(consultation.status)}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{consultation.lawyer}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(consultation.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{consultation.time} ({consultation.duration})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getTypeIcon(consultation.type)}
                        <span className="capitalize">{consultation.type} Call</span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3">{consultation.description}</p>
                    
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f2e8e5] text-[#B88271]">
                        {consultation.category}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        consultation.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : consultation.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-6">
                    {consultation.status === 'scheduled' && (
                      <>
                        <button className="bg-[#B88271] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#a86f5e] transition-all shadow-lg text-sm">
                          Join Call
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm">
                          Reschedule
                        </button>
                      </>
                    )}
                    {consultation.status === 'completed' && (
                      <>
                        <button className="border border-[#B88271] text-[#B88271] px-4 py-2 rounded-lg font-medium hover:bg-[#f2e8e5] transition-colors text-sm">
                          View Summary
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm">
                          Download Notes
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {getFilteredConsultations().length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No consultations found
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'upcoming' 
                ? "You don't have any upcoming consultations scheduled."
                : activeTab === 'past'
                ? "You don't have any past consultations."
                : "You haven't scheduled any consultations yet."
              }
            </p>
            <button className="bg-[#B88271] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#a86f5e] transition-all shadow-lg">
              Book Your First Consultation
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ConsultationPage;