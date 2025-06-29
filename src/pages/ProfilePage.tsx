import React, { useState } from 'react';
import User from 'lucide-react/dist/esm/icons/user';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Phone from 'lucide-react/dist/esm/icons/phone';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Edit from 'lucide-react/dist/esm/icons/edit';
import Save from 'lucide-react/dist/esm/icons/save';
import X from 'lucide-react/dist/esm/icons/x';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnimatedSection from '../components/AnimatedSection';
import useAuth from '../contexts/useAuth';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, City, State 12345',
    dateOfBirth: '1990-01-01',
    occupation: 'Software Developer',
    emergencyContact: 'Jane Doe - (555) 987-6543'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Handle save logic here
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, City, State 12345',
      dateOfBirth: '1990-01-01',
      occupation: 'Software Developer',
      emergencyContact: 'Jane Doe - (555) 987-6543'
    });
    setIsEditing(false);
  };

  const consultationStats = [
    { label: 'Total Consultations', value: '12', color: 'text-blue-600' },
    { label: 'Active Cases', value: '3', color: 'text-green-600' },
    { label: 'Documents Reviewed', value: '8', color: 'text-yellow-600' },
    { label: 'Success Rate', value: '94%', color: 'text-purple-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <AnimatedSection animation="slideInDown" className="mb-8">
          <div className="bg-[#B88271] rounded-xl p-6 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
            <p className="text-white/90 mb-4">
              Manage your personal information and account settings.
            </p>
            <button className="bg-white text-[#B88271] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg">
              Explore Services
            </button>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <AnimatedSection animation="slideInLeft" duration={800}>
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <img
                      src={user?.avatar || `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1`}
                      alt={user?.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                    />
                    <button className="absolute bottom-0 right-0 bg-[#B88271] text-white p-2 rounded-full hover:bg-[#a86f5e] transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                  <h2 className="text-xl font-semibold text-black mb-1">{user?.name}</h2>
                  <p className="text-gray-600 mb-4">{user?.email}</p>
                  <div className="text-sm text-gray-500">
                    <p>Member since January 2025</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Account Statistics</h3>
                  <div className="space-y-3">
                    {consultationStats.map((stat, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{stat.label}</span>
                        <span className={`text-sm font-semibold ${stat.color}`}>{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Navigation */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Access</h3>
                  <button className="w-full bg-[#B88271] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#a86f5e] transition-all shadow-lg text-sm">
                    Browse All Services
                  </button>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2">
            <AnimatedSection animation="slideInRight" duration={800}>
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-black">Personal Information</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 text-[#B88271] hover:text-[#a86f5e] font-medium"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSave}
                          className="flex items-center space-x-2 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="h-4 w-4" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex items-center space-x-2 bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <X className="h-4 w-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      {isEditing ? (
                        <input
                          id="profile-name"
                          name="fullName"
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B88271] focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-900">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{formData.name}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      {isEditing ? (
                        <input
                          id="profile-email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B88271] focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-900">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{formData.email}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          id="profile-phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B88271] focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-900">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{formData.phone}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="profile-dob" className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      {isEditing ? (
                        <input
                          id="profile-dob"
                          name="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B88271] focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-900">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(formData.dateOfBirth).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="profile-address" className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      {isEditing ? (
                        <input
                          id="profile-address"
                          name="address"
                          type="text"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B88271] focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-900">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{formData.address}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="profile-occupation" className="block text-sm font-medium text-gray-700 mb-2">
                        Occupation
                      </label>
                      {isEditing ? (
                        <input
                          id="profile-occupation"
                          name="occupation"
                          type="text"
                          value={formData.occupation}
                          onChange={(e) => handleInputChange('occupation', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B88271] focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-900">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{formData.occupation}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="profile-emergency" className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact
                      </label>
                      {isEditing ? (
                        <input
                          id="profile-emergency"
                          name="emergencyContact"
                          type="text"
                          value={formData.emergencyContact}
                          onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B88271] focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-900">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{formData.emergencyContact}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Account Settings */}
            <AnimatedSection animation="slideInUp" delay={200} duration={800}>
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-black">Account Settings</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-black">Email Notifications</h3>
                        <p className="text-sm text-gray-600">Receive updates about your consultations</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          id="email-notifications"
                          name="emailNotifications"
                          type="checkbox" 
                          className="sr-only peer" 
                          defaultChecked 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#f2e8e5] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B88271]"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-black">SMS Notifications</h3>
                        <p className="text-sm text-gray-600">Get text reminders for appointments</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          id="sms-notifications"
                          name="smsNotifications"
                          type="checkbox" 
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#f2e8e5] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B88271]"></div>
                      </label>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <button className="text-red-600 hover:text-red-700 font-medium text-sm">
                        Delete Account
                      </button>
                    </div>
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

export default ProfilePage;