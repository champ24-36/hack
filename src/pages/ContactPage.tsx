import React, { useState } from 'react';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Phone from 'lucide-react/dist/esm/icons/phone';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Send from 'lucide-react/dist/esm/icons/send';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    message: '',
    urgency: 'normal'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories = [
    'Employment Law',
    'Housing & Tenant Rights',
    'Family Law',
    'Business Law',
    'Personal Injury',
    'Criminal Defense',
    'Immigration',
    'Other'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      details: '1-800-LEGAL-HELP',
      subtitle: 'Available 24/7 for urgent matters'
    },
    {
      icon: Mail,
      title: 'Email',
      details: 'help@vakeelsaabai.com',
      subtitle: 'We respond within 2 hours'
    },
    {
      icon: MapPin,
      title: 'Office',
      details: '123 Legal Plaza, Suite 500',
      subtitle: 'New York, NY 10001'
    },
    {
      icon: Clock,
      title: 'Hours',
      details: 'Mon-Fri: 8AM-8PM',
      subtitle: 'Weekend consultations available'
    }
  ];

  const faqs = [
    {
      question: 'How quickly can I get a consultation?',
      answer: 'We offer same-day consultations for urgent matters and typically schedule within 24-48 hours for regular cases.'
    },
    {
      question: 'What does the free consultation include?',
      answer: 'Our free consultation includes a 30-minute session where we assess your case, explain your rights, and outline potential next steps.'
    },
    {
      question: 'Do you handle cases nationwide?',
      answer: 'Yes, we have licensed attorneys in all 50 states and can provide legal guidance regardless of your location.'
    },
    {
      question: 'What if I can\'t afford legal fees?',
      answer: 'We offer sliding scale fees, payment plans, and pro bono services for qualifying cases. Legal help should be accessible to everyone.'
    }
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Send className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-4">Message Sent Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for contacting us. We've received your message and will respond within 2 hours during business hours.
            </p>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  subject: '',
                  category: '',
                  message: '',
                  urgency: 'normal'
                });
              }}
              className="bg-[#B88271] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#a86f5e] transition-all shadow-lg"
            >
              Send Another Message
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 leading-tight">
              Get in
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B88271] to-[#a86f5e]"> Touch</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Have a legal question? Need immediate help? We're here to provide the guidance and support you need.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-black mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B88271] focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B88271] focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B88271] focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Legal Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B88271] focus:border-transparent"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B88271] focus:border-transparent"
                    placeholder="Brief description of your legal matter"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency Level
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    {[
                      { value: 'immediate', label: 'Immediate', color: 'border-red-500 text-red-600' },
                      { value: 'urgent', label: 'Urgent', color: 'border-orange-500 text-orange-600' },
                      { value: 'normal', label: 'Normal', color: 'border-green-500 text-green-600' },
                      { value: 'flexible', label: 'Flexible', color: 'border-blue-500 text-blue-600' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleInputChange('urgency', option.value)}
                        className={`p-2 text-sm rounded-lg border-2 transition-all ${
                          formData.urgency === option.value
                            ? `${option.color} bg-opacity-10`
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B88271] focus:border-transparent"
                    placeholder="Please provide details about your legal situation..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#B88271] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#a86f5e] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info & FAQ */}
          <div className="space-y-8">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-black mb-6">Contact Information</h3>
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="bg-[#f2e8e5] p-2 rounded-lg">
                      <info.icon className="h-5 w-5" style={{ color: '#B88271' }} />
                    </div>
                    <div>
                      <h4 className="font-medium text-black">{info.title}</h4>
                      <p className="text-gray-900">{info.details}</p>
                      <p className="text-sm text-gray-600">{info.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-3">
                <Phone className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold text-red-800">Emergency Legal Help</h3>
              </div>
              <p className="text-red-700 mb-3">
                If you're facing an immediate legal emergency, call our 24/7 hotline:
              </p>
              <p className="text-xl font-bold text-red-800 mb-3">1-800-URGENT-LAW</p>
              <p className="text-sm text-red-600">
                Available for criminal arrests, restraining orders, and other urgent legal matters.
              </p>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-black mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index}>
                    <h4 className="font-medium text-black mb-2">{faq.question}</h4>
                    <p className="text-sm text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;