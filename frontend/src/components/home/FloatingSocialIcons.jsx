import React from 'react';
import { SOCIAL_LINKS } from '../../data/socialLinks';

/**
 * FloatingSocialIcons:
 * Floating social-media badges positioned along the right edge of the viewport.
 * Right Side: Facebook, WhatsApp, Instagram, LinkedIn
 */
export default function FloatingSocialIcons() {
  const rightLinks = [
    {
      ...SOCIAL_LINKS.facebook,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      ...SOCIAL_LINKS.whatsapp,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.886 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      ),
    },
    {
      ...SOCIAL_LINKS.instagram,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      ...SOCIAL_LINKS.linkedin,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* RIGHT DOCK (Facebook, WhatsApp, Instagram, LinkedIn) */}
      <aside 
        className="floating-social-rail rail-right" 
        aria-label="Social media channels - Facebook, WhatsApp, Instagram, LinkedIn"
      >
        <div className="social-pill-stack">
          {rightLinks.map((item) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.ariaLabel}
              className={`social-dock-btn ${item.name === 'WhatsApp' ? 'btn-whatsapp-pulse' : ''}`}
              title={item.name}
            >
              <span className="social-icon-wrapper" style={{ color: item.color }}>
                {item.icon}
              </span>
              <span className="social-tooltip-pill tooltip-left">{item.name}</span>
            </a>
          ))}
        </div>
      </aside>

      <style>{`
        .floating-social-rail {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          z-index: 990;
          pointer-events: auto;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .rail-right {
          right: 14px;
        }

        .social-pill-stack {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          padding: 0.6rem 0.45rem;
          border-radius: var(--radius-pill, 9999px);
          border: 1px solid rgba(226, 232, 240, 0.95);
          box-shadow: 0 12px 30px -4px rgba(15, 23, 42, 0.15), 0 4px 8px -2px rgba(15, 23, 42, 0.06);
        }

        .social-dock-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #FFFFFF;
          border: 1px solid rgba(226, 232, 240, 0.85);
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          text-decoration: none;
          outline: none;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.05);
        }

        .social-dock-btn:focus-visible {
          box-shadow: 0 0 0 3px var(--primary-saffron, #F59E0B);
        }

        .social-dock-btn:hover {
          transform: scale(1.12) translateY(-1px);
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.16);
          background: #FFFFFF;
        }

        .btn-whatsapp-pulse {
          box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.4);
          animation: waPulse 3s infinite;
        }

        @keyframes waPulse {
          0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.45); }
          70% { box-shadow: 0 0 0 10px rgba(37, 211, 102, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
        }

        .social-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }

        .social-dock-btn:hover .social-icon-wrapper {
          transform: scale(1.08);
        }

        /* Tooltip Pill */
        .social-tooltip-pill {
          position: absolute;
          background: #0F172A;
          color: #FFFFFF;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          padding: 0.3rem 0.75rem;
          border-radius: var(--radius-pill, 9999px);
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.25);
          z-index: 1000;
        }

        .tooltip-left {
          right: calc(100% + 12px);
          transform: translateX(6px);
        }

        .social-dock-btn:hover .social-tooltip-pill {
          opacity: 1;
          transform: translateX(0);
        }

        /* Mobile Adaptations: Meets minimum 44px touch targets */
        @media (max-width: 768px) {
          .floating-social-rail {
            top: auto;
            bottom: 18px;
            transform: none;
          }
          .rail-right {
            right: 10px;
          }
          .social-pill-stack {
            padding: 0.4rem 0.3rem;
            gap: 0.5rem;
          }
          .social-dock-btn {
            width: 44px;
            height: 44px;
          }
          .social-tooltip-pill {
            display: none; /* Hide hover tooltips on touch devices */
          }
        }
      `}</style>
    </>
  );
}
