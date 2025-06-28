import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface AnimatedSectionProps {
  children: React.ReactNode;
  animation?: 'fadeIn' | 'slideInLeft' | 'slideInRight' | 'slideInUp' | 'slideInDown' | 'scaleIn';
  delay?: number;
  duration?: number;
  className?: string;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  animation = 'fadeIn',
  delay = 0,
  duration = 600,
  className = ''
}) => {
  const { ref, isVisible } = useScrollAnimation();

  const getAnimationClasses = () => {
    const baseClasses = `transition-all ease-out`;
    const durationClass = `duration-${duration}`;
    
    if (!isVisible) {
      switch (animation) {
        case 'fadeIn':
          return `${baseClasses} ${durationClass} opacity-0`;
        case 'slideInLeft':
          return `${baseClasses} ${durationClass} opacity-0 -translate-x-12`;
        case 'slideInRight':
          return `${baseClasses} ${durationClass} opacity-0 translate-x-12`;
        case 'slideInUp':
          return `${baseClasses} ${durationClass} opacity-0 translate-y-12`;
        case 'slideInDown':
          return `${baseClasses} ${durationClass} opacity-0 -translate-y-12`;
        case 'scaleIn':
          return `${baseClasses} ${durationClass} opacity-0 scale-95`;
        default:
          return `${baseClasses} ${durationClass} opacity-0`;
      }
    } else {
      return `${baseClasses} ${durationClass} opacity-100 translate-x-0 translate-y-0 scale-100`;
    }
  };

  return (
    <div
      ref={ref}
      className={`${getAnimationClasses()} ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;