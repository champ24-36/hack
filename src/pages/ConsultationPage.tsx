import React, { useState, useEffect } from 'react';
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
import useAuth from '../contexts/useAuth';
import { ConsultationService } from '../services/consultationService';
import type { Database } from '../types/database';

type Consultation = Database['public']['Tables']['consultations']['Row'] & {
  lawyers?: {
    name: string;
    email: string;
    specialties: string[] | null;
    rating: number | null;
    experience_years: number | null;
  };
  legal_categories?: {
    name: string;
    description: string | null;
  };
};

const ConsultationPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConsultations = async () => {
      if (!user) return;
      
      setLoading(true);
      const data = await ConsultationService.getUserConsultations(user.id);
      setConsultations(data);
      setLoading(false);
    };

    loadConsultations();
  }, [user]);

  const getFilteredConsultations = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    switch (activeTab) {
      case 'upcoming':
        return consultations.filter(c => 
          (c.scheduled_date && c.scheduled_date >= today && c.status === 'scheduled') ||
          c.status === 'in_progress'
        );
      case 'past':
        return consultations.filter(c => 
          (c.scheduled_date && c.scheduled_date < today) || 
          c.status === 'completed' || 
          c.status === 'cancelled'
        );
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
      case 'in_progress':
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black mb-4">Please Sign In</h2>
            <p className="text-gray-600 mb-6">You need to be signed in to view your consultations.</p>
            <a href="/login" className="bg-[#B88271] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#a86f5e] transition-all shadow-lg">
              Sign In
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B88271] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your consultations...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const filteredConsultations = getFilteredConsultations();

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
                { key: 'upcoming', label: 'Upcoming' },
                { key: 'past', label: 'Past' },
                { key: 'all', label: 'All' }
              ].map((tab) => {
                const count = tab.key === 'upcoming' 
                  ? consultations.filter(c => 
                      (c.scheduled_date && c.scheduled_date >= new Date().toISOString().split('T')[0] && c.status === 'scheduled') ||
                      c.status === 'in_progress'
                    ).length
                  : tab.key === 'past'
                  ? consultations.filter(c => 
                      (c.scheduled_date && c.scheduled_date < new Date().toISOString().split('T')[0]) || 
                      c.status === 'completed' || 
                      c.status === 'cancelled'
                    ).length
                  : consultations.length;

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as 'upcoming' | 'past' | 'all')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.key
                        ? 'border-[#B88271] text-[#B88271]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label} ({count})
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Consultations List */}
        <div className="space-y-6">
          {filteredConsultations.map((consultation) => (
            <div key={consultation.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-black">
                        {consultation.title}
                      </h3>
                      {getStatusIcon(consultation.status || 'scheduled')}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      {consultation.lawyers && (
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{consultation.lawyers.name}</span>
                        </div>
                      )}
                      {consultation.scheduled_date && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(consultation.scheduled_date)}</span>
                        </div>
                      )}
                      {consultation.scheduled_time && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{consultation.scheduled_time} ({consultation.duration_minutes || 60} minutes)</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        {getTypeIcon(consultation.consultation_type)}
                        <span className="capitalize">{consultation.consultation_type} Call</span>
                      </div>
                    </div>

                    {consultation.description && (
                      <p className="text-gray-700 mb-3">{consultation.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-3">
                      {consultation.legal_categories && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f2e8e5] text-[#B88271]">
                          {consultation.legal_categories.name}
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        consultation.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : consultation.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : consultation.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : consultation.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {consultation.status?.charAt(0).toUpperCase() + (consultation.status?.slice(1) || '')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-6">
                    {(consultation.status === 'scheduled' || consultation.status === 'in_progress') && (
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

        {filteredConsultations.length === 0 && (
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
            <a 
              href="/book-consultation"
              className="bg-[#B88271] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#a86f5e] transition-all shadow-lg"
            >
              Book Your First Consultation
            </a>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ConsultationPage;