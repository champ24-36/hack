import { Link } from 'react-router-dom';
import Scale from 'lucide-react/dist/esm/icons/scale';
import Phone from 'lucide-react/dist/esm/icons/phone';
import Mail from 'lucide-react/dist/esm/icons/mail';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Scale className="h-8 w-8" style={{ color: '#B88271' }} />
              <span className="text-2xl font-bold">Vakeel Saab AI</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              Making legal advice accessible, understandable, and affordable for everyone. 
              Your rights matter, and we're here to help you protect them.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-gray-400">
                <Phone className="h-5 w-5" />
                <span>1-800-LEGAL-HELP</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#B88271' }}>Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-[#B88271] transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-[#B88271] transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-[#B88271] transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#B88271' }}>Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>help@vakeelsaabai.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>1-800-LEGAL-HELP</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Available Nationwide</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Vakeel Saab AI. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;