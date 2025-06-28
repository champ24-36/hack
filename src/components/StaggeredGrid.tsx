import { useStaggeredAnimation } from '../hooks/useScrollAnimation';

interface StaggeredGridProps {
  children: React.ReactNode[];
  animation?: 'fadeIn' | 'slideInLeft' | 'slideInRight' | 'slideInUp' | 'slideInDown' | 'scaleIn';
  staggerDelay?: number;
  duration?: number;
  className?: string;
  itemClassName?: string;
}

const StaggeredGrid: React.FC<StaggeredGridProps> = ({
  children,
  animation = 'slideInUp',
  staggerDelay = 150,
  duration = 600,
  className = '',
  itemClassName = ''
}) => {
  const { containerRef, visibleItems } = useStaggeredAnimation(children.length, staggerDelay);

  const getAnimationClasses = (index: number) => {
    const baseClasses = `transition-all ease-out`;
    const durationClass = `duration-${duration}`;
    
    if (!visibleItems[index]) {
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
    <div ref={containerRef} className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={`${getAnimationClasses(index)} ${itemClassName}`}
          style={{
            transitionDuration: `${duration}ms`
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export default StaggeredGrid;