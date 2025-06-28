import { Link } from 'react-router-dom';
import X from 'lucide-react/dist/esm/icons/x';
import Scale from 'lucide-react/dist/esm/icons/scale';
import Home from 'lucide-react/dist/esm/icons/home';
import Users from 'lucide-react/dist/esm/icons/users';
import Briefcase from 'lucide-react/dist/esm/icons/briefcase';
import MessageSquare from 'lucide-react/dist/esm/icons/message-square';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import User from 'lucide-react/dist/esm/icons/user';
import Phone from 'lucide-react/dist/esm/icons/phone';
import Mail from 'lucide-react/dist/esm/icons/mail';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Shield from 'lucide-react/dist/esm/icons/shield';
import Heart from 'lucide-react/dist/esm/icons/heart';
import Globe from 'lucide-react/dist/esm/icons/globe';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';

interface NavbarProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: 'sidebar' | 'modal' | 'dropdown';
}

const Navbar: React.FC<NavbarProps> = ({ isOpen, onClose, variant = 'modal' }) => {
  if (!isOpen) return null;

  const navigationSections = [
    {
      title: 'Main Pages',
      icon: Home,
      items: [
        { name: 'Home', path: '/', icon: Home, description: 'Welcome to Vakeel Saab AI' },
        { name: 'About Us', path: '/about', icon: Users, description: 'Learn about our mission and team' },
        { name: 'Contact', path: '/contact', icon: Phone, description: 'Get in touch with us' },
      ]
    },
    {
      title: 'Legal Services',
      icon: Scale,
      items: [
        { name: 'All Services', path: '/services', icon: Briefcase, description: 'Browse our complete legal services' },
        { name: 'Employment Law', path: '/services#employment', icon: Briefcase, description: 'Workplace rights and disputes' },
        { name: 'Housing Rights', path: '/services#housing', icon: Home, description: 'Tenant and landlord issues' },
        { name: 'Family Law', path: '/services#family', icon: Heart, description: 'Divorce, custody, and family matters' },
        { name: 'Business Law', path: '/services#business', icon: Briefcase, description: 'Business formation and contracts' },
        { name: 'Personal Injury', path: '/services#injury', icon: Shield, description: 'Accident and injury claims' },
        { name: 'Criminal Defense', path: '/services#criminal', icon: Shield, description: 'Criminal charges and defense' },
        { name: 'Immigration', path: '/services#immigration', icon: Globe, description: 'Visa and citizenship matters' },
        { name: 'Document Review', path: '/services#documents', icon: FileText, description: 'Legal document analysis' },
      ]
    },
    {
      title: 'Get Help',
      icon: MessageSquare,
      items: [
        { name: 'AI Chat Assistant', path: '/chat', icon: MessageSquare, description: 'Get instant legal guidance' },
        { name: 'Book Consultation', path: '/book-consultation', icon: Calendar, description: 'Schedule with an attorney' },
        { name: 'My Consultations', path: '/consultation', icon: Calendar, description: 'Manage your appointments' },
        { name: 'Dashboard', path: '/dashboard', icon: User, description: 'Your legal matters overview' },
        { name: 'My Profile', path: '/profile', icon: User, description: 'Account settings and info' },
      ]
    },
    {
      title: 'Resources',
      icon: BookOpen,
      items: [
        { name: 'Legal Blog', path: '/blog', icon: BookOpen, description: 'Legal insights and articles' },
        { name: 'FAQ', path: '/faq', icon: MessageSquare, description: 'Frequently asked questions' },
        { name: 'Legal Forms', path: '/forms', icon: FileText, description: 'Download legal documents' },
        { name: 'Know Your Rights', path: '/rights', icon: Shield, description: 'Understanding your legal rights' },
      ]
    }
  ];

  const renderContent = () => (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Scale className="h-8 w-8" style={{ color: '#B88271' }} />
          <h2 className="text-2xl font-bold text-black">Vakeel Saab AI</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="h-6 w-6 text-gray-600" />
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="space-y-8">
        {navigationSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <div className="flex items-center space-x-2 mb-4">
              <section.icon className="h-5 w-5" style={{ color: '#B88271' }} />
              <h3 className="text-lg font-semibold text-black">{section.title}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {section.items.map((item, itemIndex) => (
                <Link
                  key={itemIndex}
                  to={item.path}
                  onClick={onClose}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#f2e8e5] transition-colors group"
                >
                  <div className="bg-gray-100 p-2 rounded-lg group-hover:bg-white transition-colors">
                    <item.icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-black group-hover:text-[#B88271] transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-600 truncate">{item.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#B88271] transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>&copy; 2025 Vakeel Saab AI</span>
          <div className="flex items-center space-x-4">
            <a href="mailto:help@vakeelsaabai.com" className="hover:text-[#B88271] transition-colors">
              <Mail className="h-4 w-4" />
            </a>
            <a href="tel:1-800-LEGAL-HELP" className="hover:text-[#B88271] transition-colors">
              <Phone className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  if (variant === 'sidebar') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
        <div className="bg-white w-full max-w-md h-full shadow-xl overflow-y-auto">
          {renderContent()}
        </div>
        <div className="flex-1" onClick={onClose} />
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
        {renderContent()}
      </div>
    );
  }

  // Default modal variant
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default Navbar;