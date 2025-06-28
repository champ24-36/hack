import Scale from 'lucide-react/dist/esm/icons/scale';
import Users from 'lucide-react/dist/esm/icons/users';
import Award from 'lucide-react/dist/esm/icons/award';
import Heart from 'lucide-react/dist/esm/icons/heart';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Star from 'lucide-react/dist/esm/icons/star';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnimatedSection from '../components/AnimatedSection';
import StaggeredGrid from '../components/StaggeredGrid';

const AboutPage: React.FC = () => {
  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Founder & Lead Attorney',
      specialties: ['Employment Law', 'Business Law'],
      experience: '15+ years',
      image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1',
      description: 'Sarah founded Vakeel Saab AI with a mission to make legal advice accessible to everyone. She specializes in employment and business law.'
    },
    {
      name: 'Michael Chen',
      role: 'Senior Attorney',
      specialties: ['Family Law', 'Personal Injury'],
      experience: '12+ years',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1',
      description: 'Michael brings extensive experience in family law and personal injury cases, helping families navigate complex legal situations.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Housing Rights Specialist',
      specialties: ['Housing Law', 'Immigration'],
      experience: '10+ years',
      image: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1',
      description: 'Emily is passionate about protecting tenant rights and helping immigrants understand their legal options in the United States.'
    },
    {
      name: 'David Wilson',
      role: 'Criminal Defense Attorney',
      specialties: ['Criminal Defense', 'Constitutional Law'],
      experience: '18+ years',
      image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1',
      description: 'David has dedicated his career to defending the rights of the accused and ensuring everyone has access to quality legal representation.'
    }
  ];

  const values = [
    {
      icon: Scale,
      title: 'Justice for All',
      description: 'We believe everyone deserves access to quality legal advice, regardless of their background or financial situation.'
    },
    {
      icon: Heart,
      title: 'Compassionate Service',
      description: 'We understand that legal issues can be stressful. We approach every case with empathy and understanding.'
    },
    {
      icon: Users,
      title: 'Community Focus',
      description: 'We are committed to serving our community and empowering people with the knowledge they need to protect their rights.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We maintain the highest standards of legal practice and continuously strive to exceed our clients\' expectations.'
    }
  ];

  const achievements = [
    { number: '10,000+', label: 'Cases Resolved' },
    { number: '50,000+', label: 'People Helped' },
    { number: '98%', label: 'Client Satisfaction' },
    { number: '24/7', label: 'Availability' }
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
                About
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B88271] to-[#a86f5e]"> Vakeel Saab AI</span>
              </h1>
            </AnimatedSection>
            <AnimatedSection animation="slideInUp" delay={200} duration={800}>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                We're on a mission to democratize legal advice and make it accessible, understandable, 
                and affordable for everyone who needs it.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection animation="slideInLeft" duration={800}>
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Legal problems don't discriminate, but access to legal help often does. We founded Vakeel Saab AI 
                to bridge this gap and ensure that everyone, regardless of their economic situation, can 
                understand their rights and get the legal guidance they need.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                We believe that legal advice should be clear, actionable, and delivered with compassion. 
                Our team of experienced attorneys is dedicated to breaking down complex legal concepts 
                into simple, understandable guidance.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" style={{ color: '#B88271' }} />
                  <span className="text-gray-700">Licensed Attorneys</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" style={{ color: '#B88271' }} />
                  <span className="text-gray-700">Proven Track Record</span>
                </div>
              </div>
            </AnimatedSection>
            <AnimatedSection animation="slideInRight" delay={200} duration={800}>
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1"
                  alt="Legal consultation"
                  className="rounded-xl shadow-lg transform hover:scale-105 transition-all duration-500"
                />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="slideInUp" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do and shape how we serve our community.
            </p>
          </AnimatedSection>

          <StaggeredGrid
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            animation="scaleIn"
            staggerDelay={150}
            duration={700}
          >
            {values.map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 text-center transform hover:-translate-y-2 hover:border-[#B88271]">
                <div className="bg-gradient-to-br from-[#f2e8e5] to-[#eaddd7] w-16 h-16 rounded-lg flex items-center justify-center mb-6 mx-auto transform hover:scale-110 transition-all duration-300">
                  <value.icon className="h-8 w-8" style={{ color: '#B88271' }} />
                </div>
                <h3 className="text-xl font-semibold text-black mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </StaggeredGrid>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="slideInUp" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Meet Our Legal Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our experienced attorneys are here to help you navigate your legal challenges with confidence.
            </p>
          </AnimatedSection>

          <StaggeredGrid
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            animation="slideInUp"
            staggerDelay={200}
            duration={800}
          >
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 overflow-hidden transform hover:-translate-y-2 hover:border-[#B88271] group">
                <div className="overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-64 object-cover transform group-hover:scale-110 transition-all duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-black mb-2">{member.name}</h3>
                  <p className="text-[#B88271] font-medium mb-2">{member.role}</p>
                  <p className="text-sm text-gray-600 mb-3">{member.specialties.join(', ')}</p>
                  <p className="text-sm text-gray-700 mb-3">{member.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">{member.experience}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-current" style={{ color: '#B88271' }} />
                      <span className="text-sm text-gray-600">4.9</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </StaggeredGrid>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-black overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="slideInUp" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our Impact
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Numbers that reflect our commitment to serving our community and making legal help accessible.
            </p>
          </AnimatedSection>

          <StaggeredGrid
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            animation="scaleIn"
            staggerDelay={200}
            duration={800}
          >
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center transform hover:scale-110 transition-all duration-300">
                <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#B88271] to-[#a86f5e] mb-2">
                  {achievement.number}
                </div>
                <p className="text-gray-300 text-lg">{achievement.label}</p>
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
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of people who have found clarity and confidence through our legal guidance.
            </p>
            <button className="bg-white text-[#B88271] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg transform hover:scale-105">
              Book Your Free Consultation
            </button>
          </div>
        </section>
      </AnimatedSection>

      <Footer />
    </div>
  );
};

export default AboutPage;