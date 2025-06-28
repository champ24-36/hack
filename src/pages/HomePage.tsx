import { Link } from 'react-router-dom';
import Scale from 'lucide-react/dist/esm/icons/scale';
import Shield from 'lucide-react/dist/esm/icons/shield';
import Users from 'lucide-react/dist/esm/icons/users';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Star from 'lucide-react/dist/esm/icons/star';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnimatedSection from '../components/AnimatedSection';
import StaggeredGrid from '../components/StaggeredGrid';

const HomePage: React.FC = () => {
  const services = [
    {
      icon: Scale,
      title: "Legal Consultation",
      description: "Get expert advice on your legal matters from qualified professionals who understand your situation."
    },
    {
      icon: Shield,
      title: "Know Your Rights",
      description: "Learn about your fundamental rights and how to protect them in various legal situations."
    },
    {
      icon: BookOpen,
      title: "Document Review",
      description: "Have your legal documents reviewed and explained in simple, understandable terms."
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Join a community of people facing similar legal challenges and share experiences."
    }
  ];

  const steps = [
    {
      step: "1",
      title: "Describe Your Situation",
      description: "Tell us about your legal concern in simple terms. No legal jargon required."
    },
    {
      step: "2",
      title: "Get Expert Guidance",
      description: "Our qualified legal advisors will explain your rights and options clearly."
    },
    {
      step: "3",
      title: "Take Informed Action",
      description: "Make confident decisions with the legal knowledge you need."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Small Business Owner",
      content: "Finally, legal advice that doesn't require a law degree to understand. They helped me navigate my employment dispute with confidence.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "First-time Homebuyer",
      content: "The team explained my property rights so clearly. I felt empowered to make the right decisions for my family.",
      rating: 5
    },
    {
      name: "Maria Rodriguez",
      role: "Single Mother",
      content: "I never knew I had so many rights as a tenant. This service gave me the knowledge to stand up for myself and my children.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AnimatedSection animation="fadeIn" duration={800}>
              <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 leading-tight">
                Know Your Rights,
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B88271] to-[#a86f5e]"> Protect Your Future</span>
              </h1>
            </AnimatedSection>
            
            <AnimatedSection animation="slideInUp" delay={200} duration={800}>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Legal advice shouldn't be complicated or expensive. We make understanding your rights simple, 
                accessible, and affordable for everyone.
              </p>
            </AnimatedSection>
            
            <AnimatedSection animation="slideInUp" delay={400} duration={800}>
              <div className="flex justify-center">
                <Link
                  to="/chat"
                  className="bg-[#B88271] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#a86f5e] transition-all shadow-lg flex items-center justify-center group transform hover:scale-105"
                >
                  Chat for Justice
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </AnimatedSection>
            
            {/* Trust Indicators */}
            <AnimatedSection animation="fadeIn" delay={600} duration={800}>
              <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" style={{ color: '#B88271' }} />
                  <span>Licensed Attorneys</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" style={{ color: '#B88271' }} />
                  <span>10,000+ Cases Resolved</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" style={{ color: '#B88271' }} />
                  <span>Available 24/7</span>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="slideInUp" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              How We Help You Navigate Legal Challenges
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From understanding your rights to taking action, we're here to guide you every step of the way.
            </p>
          </AnimatedSection>

          <StaggeredGrid
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            animation="slideInUp"
            staggerDelay={150}
            duration={700}
          >
            {services.map((service, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 group hover:border-[#B88271] transform hover:-translate-y-2">
                <div className="bg-gradient-to-br from-[#f2e8e5] to-[#eaddd7] w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:from-[#eaddd7] group-hover:to-[#e0cec7] transition-all transform group-hover:scale-110">
                  <service.icon className="h-8 w-8" style={{ color: '#B88271' }} />
                </div>
                <h3 className="text-xl font-semibold text-black mb-4">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </StaggeredGrid>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-black overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="slideInUp" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple Steps to Legal Clarity
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Getting legal help has never been easier. Follow these three simple steps to understand your rights.
            </p>
          </AnimatedSection>

          <StaggeredGrid
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            animation="scaleIn"
            staggerDelay={200}
            duration={800}
          >
            {steps.map((step, index) => (
              <div key={index} className="text-center transform hover:scale-105 transition-all duration-300">
                <div className="bg-[#B88271] text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg transform hover:rotate-12 transition-all duration-300">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{step.title}</h3>
                <p className="text-gray-300 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </StaggeredGrid>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="slideInUp" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Real People, Real Results
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how we've helped thousands of people understand and protect their legal rights.
            </p>
          </AnimatedSection>

          <StaggeredGrid
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            animation="slideInLeft"
            staggerDelay={200}
            duration={700}
          >
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all transform hover:-translate-y-2 hover:border-[#B88271]">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" style={{ color: '#B88271' }} />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-black">{testimonial.name}</p>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </StaggeredGrid>
        </div>
      </section>

      {/* CTA Section */}
      <AnimatedSection animation="slideInUp" duration={800}>
        <section className="py-20 bg-[#B88271]">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Understand Your Rights?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Don't let legal confusion hold you back. Get the clarity and confidence you need today.
            </p>
            <Link
              to="/chat"
              className="bg-white text-[#B88271] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg inline-block transform hover:scale-105"
            >
              Start Your Free Consultation
            </Link>
          </div>
        </section>
      </AnimatedSection>

      <Footer />
    </div>
  );
};

export default HomePage;