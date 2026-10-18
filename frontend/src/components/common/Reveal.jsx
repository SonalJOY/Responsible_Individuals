import React from 'react';
import useScrollReveal from '../../hooks/useScrollReveal';

export default function Reveal({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 650,
  threshold = 0.15,
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

  const inlineStyles = {
    ...style,
    transitionDelay: `${delay}ms`,
    transitionDuration: `${duration}ms`,
  };

  return (
    <Component
      ref={ref}
      className={`reveal-base reveal-${animation} ${isVisible ? 'reveal-visible' : ''} ${className}`}
      style={inlineStyles}
      {...props}
    >
      {children}
    </Component>
  );
}
