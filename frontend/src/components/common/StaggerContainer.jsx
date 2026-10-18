import React, { createContext, useContext } from 'react';
import useScrollReveal from '../../hooks/useScrollReveal';

const StaggerContext = createContext({
  isVisible: false,
  staggerDelay: 80,
  initialDelay: 0,
  animation: 'fade-up',
  duration: 600,
});

export function StaggerContainer({
  children,
  staggerDelay = 80,
  initialDelay = 0,
  animation = 'fade-up',
  duration = 600,
  threshold = 0.1,
  rootMargin = '0px 0px -40px 0px',
  className = '',
  as: Component = 'div',
  style = {},
  ...props
}) {
  const [ref, isVisible] = useScrollReveal({
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  return (
    <StaggerContext.Provider value={{ isVisible, staggerDelay, initialDelay, animation, duration }}>
      <Component ref={ref} className={`stagger-container ${className}`} style={style} {...props}>
        {children}
      </Component>
    </StaggerContext.Provider>
  );
}

export function StaggerItem({
  children,
  index = 0,
  animation: customAnimation,
  delay: customDelay,
  duration: customDuration,
  className = '',
  as: Component = 'div',
  style = {},
  ...props
}) {
  const context = useContext(StaggerContext);
  const isVisible = context.isVisible;
  const animation = customAnimation || context.animation || 'fade-up';
  const duration = customDuration || context.duration || 600;
  const delay = customDelay !== undefined ? customDelay : (context.initialDelay || 0) + (index * (context.staggerDelay || 80));

  const inlineStyles = {
    ...style,
    transitionDelay: `${delay}ms`,
    transitionDuration: `${duration}ms`,
  };

  return (
    <Component
      className={`reveal-base reveal-${animation} ${isVisible ? 'reveal-visible' : ''} ${className}`}
      style={inlineStyles}
      {...props}
    >
      {children}
    </Component>
  );
}

export default StaggerContainer;
