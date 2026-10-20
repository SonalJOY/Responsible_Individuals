import React from 'react';
import { SOCIAL_LINKS } from '../../data/socialLinks';

/**
 * FloatingSocialIcons:
 * Floating social-media badges positioned along the left and right upper-to-middle edges of the viewport.
 * Right Side: Facebook, WhatsApp, Instagram, LinkedIn
 * Left Side: Twitter/X, YouTube
 */
export default function FloatingSocialIcons() {
  const leftLinks = [
    {
      ...SOCIAL_LINKS.twitter,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      ...SOCIAL_LINKS.youtube,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  ];

  const rightLinks = [
    {
      ...SOCIAL_LINKS.facebook,
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      ...SOCIAL_LINKS.whatsapp,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.886 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      ),
    },
    {
      ...SOCIAL_LINKS.instagram,
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      ...SOCIAL_LINKS.linkedin,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* LEFT DOCK (Twitter/X, YouTube) */}
      <aside 
        className="floating-social-rail rail-left" 
        aria-label="Social media channels - Twitter and YouTube"
      >
        <div className="social-pill-stack">
          {leftLinks.map((item) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.ariaLabel}
              className="social-dock-btn"
              title={item.name}
            >
              <span className="social-icon-wrapper" style={{ color: item.color }}>
                {item.icon}
              </span>
              <span className="social-tooltip-pill tooltip-right">{item.name}</span>
            </a>
          ))}
        </div>
      </aside>

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

        .rail-left {
          left: 12px;
        }

        .rail-right {
          right: 12px;
        }

        .social-pill-stack {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          padding: 0.5rem 0.35rem;
          border-radius: var(--radius-pill);
          border: 1px solid rgba(226, 232, 240, 0.9);
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 4px 6px -2px rgba(15, 23, 42, 0.05);
        }

        .social-dock-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #FFFFFF;
          border: 1px solid rgba(226, 232, 240, 0.8);
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          text-decoration: none;
          outline: none;
        }

        .social-dock-btn:focus-visible {
          box-shadow: 0 0 0 3px var(--primary-saffron, #F97316);
        }

        .social-dock-btn:hover {
          transform: scale(1.15) translateY(-1px);
          box-shadow: 0 8px 16px rgba(15, 23, 42, 0.15);
          background: #FFFFFF;
        }

        .btn-whatsapp-pulse {
          box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
          animation: waPulse 3s infinite;
        }

        @keyframes waPulse {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.45); }
          70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
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
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-pill);
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
        }

        .tooltip-left {
          right: calc(100% + 10px);
          transform: translateX(6px);
        }

        .tooltip-right {
          left: calc(100% + 10px);
          transform: translateX(-6px);
        }

        .social-dock-btn:hover .social-tooltip-pill {
          opacity: 1;
          transform: translateX(0);
        }

        /* Mobile Adaptations: Dock subtly at bottom edge corners or side compact */
        @media (max-width: 768px) {
          .floating-social-rail {
            top: auto;
            bottom: 18px;
            transform: none;
          }
          .rail-left {
            left: 8px;
          }
          .rail-right {
            right: 8px;
          }
          .social-pill-stack {
            padding: 0.35rem 0.25rem;
            gap: 0.45rem;
          }
          .social-dock-btn {
            width: 34px;
            height: 34px;
          }
          .social-tooltip-pill {
            display: none; /* Hide hover tooltips on touch screens to avoid blocking taps */
          }
        }
      `}</style>
    </>
  );
}
