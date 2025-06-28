import React, { useState } from 'react';
import Video from 'lucide-react/dist/esm/icons/video';
import Phone from 'lucide-react/dist/esm/icons/phone';
import MessageSquare from 'lucide-react/dist/esm/icons/message-square';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Header from '../components/Header';
import Footer from '../components/Footer';

const BookConsultationPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    urgency: '',
    preferredDate: '',
    preferredTime: '',
    consultationType: '',
    lawyer: '',
    contactMethod: 'email'
  });

  const categories = [
    { id: 'employment', name: 'Employment Law', description: 'Workplace rights, discrimination, contracts' },
    { id: 'housing', name: 'Housing & Tenant Rights', description: 'Landlord disputes, evictions, lease issues' },
    { id: 'family', name: 'Family Law', description: 'Divorce, custody, domestic relations' },
    { id: 'business', name: 'Business Law', description: 'Contracts, partnerships, compliance' },
    { id: 'personal', name: 'Personal Injury', description: 'Accidents, medical malpractice, compensation' },
    { id: 'criminal', name: 'Criminal Defense', description: 'Criminal charges, legal representation' },
    { id: 'immigration', name: 'Immigration', description: 'Visas, citizenship, deportation defense' },
    { id: 'other', name: 'Other Legal Matters', description: 'General legal questions and advice' }
  ];

  const lawyers = [
    {
      id: 'sarah',
      name: 'Sarah Johnson, Esq.',
      specialties: ['Employment Law', 'Business Law'],
      rating: 4.9,
      experience: '12 years',
      image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
    },
    {
      id: 'michael',
      name: 'Michael Chen, Esq.',
      specialties: ['Family Law', 'Personal Injury'],
      rating: 4.8,
      experience: '15 years',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
    },
    {
      id: 'emily',
      name: 'Emily Rodriguez, Esq.',
      specialties: ['Housing Law', 'Immigration'],
      rating: 4.9,
      experience: '10 years',
      image: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
    },
    {
      id: 'david',
      name: 'David Wilson, Esq.',
      specialties: ['Criminal Defense', 'Business Law'],
      rating: 4.7,
      experience: '18 years',
      image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
    }
  ];

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    // Handle form submission
    console.log('Booking consultation:', formData);
    setStep(5); // Show confirmation
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black mb-4">What type of legal help do you need?</h2>
        <p className="text-gray-600 mb-6">Select the category that best describes your legal matter.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleInputChange('category', category.id)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              formData.category === category.id
                ? 'border-[#B88271] bg-[#f2e8e5]'
                : 'border-gray-200 hover:border-[#B88271]'
            }`}
          >
            <h3 className="font-semibold text-black mb-2">{category.name}</h3>
            <p className="text-sm text-gray-600">{category.description}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black mb-4">Tell us about your situation</h2>
        <p className="text-gray-600 mb-6">Provide details about your legal matter to help us match you with the right attorney.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe your legal situation
          </label>
          <textarea
            rows={6}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B88271] focus:border-transparent"
            placeholder="Please provide as much detail as possible about your legal matter..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How urgent is this matter?
          </label>
          <div className="space-y-2">
            {[
              { value: 'immediate', label: 'Immediate (within 24 hours)', color: 'text-red-600' },
              { value: 'urgent', label: 'Urgent (within a week)', color: 'text-orange-600' },
              { value: 'normal', label: 'Normal (within a month)', color: 'text-green-600' },
              { value: 'flexible', label: 'Flexible timeline', color: 'text-blue-600' }
            ].map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name="urgency"
                  value={option.value}
                  checked={formData.urgency === option.value}
                  onChange={(e) => handleInputChange('urgency', e.target.value)}
                  className="h-4 w-4 text-[#B88271] focus:ring-[#B88271] border-gray-300"
                />
                <span className={`ml-2 ${option.color}`}>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black mb-4">Choose your consultation type</h2>
        <p className="text-gray-600 mb-6">Select how you'd like to meet with your attorney.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { type: 'video', icon: Video, title: 'Video Call', description: 'Face-to-face consultation via video', price: 'Free' },
          { type: 'phone', icon: Phone, title: 'Phone Call', description: 'Traditional phone consultation', price: 'Free' },
          { type: 'chat', icon: MessageSquare, title: 'Live Chat', description: 'Text-based consultation', price: 'Free' }
        ].map((option) => (
          <button
            key={option.type}
            onClick={() => handleInputChange('consultationType', option.type)}
            className={`p-6 rounded-lg border-2 text-center transition-all ${
              formData.consultationType === option.type
                ? 'border-[#B88271] bg-[#f2e8e5]'
                : 'border-gray-200 hover:border-[#B88271]'
            }`}
          >
            <option.icon className={`h-8 w-8 mx-auto mb-3 ${
              formData.consultationType === option.type ? 'text-[#B88271]' : 'text-gray-400'
            }`} />
            <h3 className="font-semibold text-black mb-2">{option.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{option.description}</p>
            <span className="text-sm font-medium text-green-600">{option.price}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black mb-4">Schedule your consultation</h2>
        <p className="text-gray-600 mb-6">Choose your preferred date, time, and attorney.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Date and Time Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Date
            </label>
            <input
              type="date"
              value={formData.preferredDate}
              onChange={(e) => handleInputChange('preferredDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B88271] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Time
            </label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => handleInputChange('preferredTime', time)}
                  className={`p-2 text-sm rounded-lg border transition-all ${
                    formData.preferredTime === time
                      ? 'border-[#B88271] bg-[#f2e8e5] text-[#B88271]'
                      : 'border-gray-200 hover:border-[#B88271]'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Attorney Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose Your Attorney
          </label>
          <div className="space-y-3">
            {lawyers.map((lawyer) => (
              <button
                key={lawyer.id}
                onClick={() => handleInputChange('lawyer', lawyer.id)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  formData.lawyer === lawyer.id
                    ? 'border-[#B88271] bg-[#f2e8e5]'
                    : 'border-gray-200 hover:border-[#B88271]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={lawyer.image}
                    alt={lawyer.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-black">{lawyer.name}</h3>
                    <p className="text-sm text-gray-600">{lawyer.specialties.join(', ')}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm" style={{ color: '#B88271' }}>★ {lawyer.rating}</span>
                      <span className="text-sm text-gray-500">• {lawyer.experience}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="text-center space-y-6">
      <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-black mb-4">Consultation Booked Successfully!</h2>
        <p className="text-gray-600 mb-6">
          Your consultation has been scheduled. You'll receive a confirmation email with all the details.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 text-left max-w-md mx-auto">
        <h3 className="font-semibold text-black mb-4">Consultation Details:</h3>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Date:</span> {formData.preferredDate}</p>
          <p><span className="font-medium">Time:</span> {formData.preferredTime}</p>
          <p><span className="font-medium">Type:</span> {formData.consultationType} consultation</p>
          <p><span className="font-medium">Attorney:</span> {lawyers.find(l => l.id === formData.lawyer)?.name}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button className="bg-[#B88271] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#a86f5e] transition-all shadow-lg">
          View Dashboard
        </button>
        <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
          Book Another Consultation
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        {step < 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-black">Book a Consultation</h1>
              <span className="text-sm text-gray-600">Step {step} of 4</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#B88271] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}

          {/* Navigation Buttons */}
          {step < 5 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handlePrevious}
                disabled={step === 1}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {step < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={
                    (step === 1 && !formData.category) ||
                    (step === 2 && (!formData.description || !formData.urgency)) ||
                    (step === 3 && !formData.consultationType)
                  }
                  className="px-6 py-3 bg-[#B88271] text-white rounded-lg font-medium hover:bg-[#a86f5e] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!formData.preferredDate || !formData.preferredTime || !formData.lawyer}
                  className="px-6 py-3 bg-[#B88271] text-white rounded-lg font-medium hover:bg-[#a86f5e] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Book Consultation
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookConsultationPage;