import React, { useEffect, useRef, useState } from 'react'

const FEATURES = [
  {
    icon: '⚡',
    title: 'Smart Proxy Routing',
    desc: 'External URLs auto-route through backend proxy. Localhost goes direct. Zero config, zero CORS headaches.',
    color: '#6366f1', // Indigo
  },
  {
    icon: '🗂️',
    title: 'Collections & Requests',
    desc: 'Organize your API calls into collections. Rename, share, export, import — everything Postman does, leaner.',
    color: '#10b981', // Emerald
  },
  {
    icon: '🌍',
    title: 'Environments',
    desc: 'Define variables like {{BASE_URL}} or {{API_KEY}} and swap environments in one click.',
    color: '#0ea5e9', // Sky
  },
  {
    icon: '📜',
    title: 'Request History',
    desc: 'Every request you fire is logged. Search, replay, and inspect past calls grouped by date.',
    color: '#a855f7', // Purple
  },
  {
    icon: '🔗',
    title: 'Share Collections',
    desc: 'Generate a public link to your collection. Anyone can view it — no login required.',
    color: '#f43f5e', // Rose
  },
  {
    icon: '🔄',
    title: 'Import / Export',
    desc: 'Import Postman v2.1 collections or our own format. Export any collection as JSON instantly.',
    color: '#f59e0b', // Amber
  },
]

const STACK = ['React', 'Redux Toolkit', 'Node.js', 'Express', 'MongoDB', 'Redis', 'Google OAuth', 'Tailwind v4']

// Animated terminal demo
const DEMO_LINES = [
  { delay: 0,    text: '> POST https://leetcode.com/graphql',         color: '#6366f1' },
  { delay: 600,  text: '  body: { "query": "{ allQuestionsCount }" }', color: '#94a3b8' },
  { delay: 1200, text: '',                                              color: '' },
  { delay: 1500, text: '← 200 OK  •  322ms  •  1.2 KB',               color: '#10b981' },
  { delay: 2100, text: '{',                                             color: '#f8fafc' },
  { delay: 2400, text: '  "data": {',                                  color: '#f8fafc' },
  { delay: 2700, text: '    "allQuestionsCount": [',                   color: '#f8fafc' },
  { delay: 3000, text: '      { "difficulty": "Easy",   "count": 831 }',  color: '#10b981' },
  { delay: 3300, text: '      { "difficulty": "Medium", "count": 1743 }', color: '#0ea5e9' },
  { delay: 3600, text: '      { "difficulty": "Hard",   "count": 762 }',  color: '#a855f7' },
  { delay: 3900, text: '    ]',                                        color: '#f8fafc' },
  { delay: 4100, text: '  }',                                          color: '#f8fafc' },
  { delay: 4300, text: '}',                                            color: '#f8fafc' },
]

const Terminal = () => {
  const [visibleLines, setVisibleLines] = useState([])

  useEffect(() => {
    DEMO_LINES.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines((prev) => [...prev, line])
      }, line.delay)
    })
  }, [])

  return (
    <div style={{
      background: '#020617', // Slate 950
      border: '1px solid #1e293b',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)',
    }}>
      {/* Terminal titlebar */}
      <div style={{
        background: '#0f172a',
        borderBottom: '1px solid #1e293b',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f43f5e' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }} />
        <span style={{ marginLeft: 8, fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>
          Uchiha Monitor — request builder
        </span>
      </div>

      {/* Terminal content */}
      <div style={{ padding: '20px 24px', minHeight: 280, fontFamily: 'monospace', fontSize: 13, lineHeight: 1.7 }}>
        {visibleLines.map((line, i) => (
          <div
            key={i}
            style={{
              color: line.color || '#f8fafc',
              animation: 'fadeSlideIn 0.3s ease forwards',
              opacity: 0,
            }}
          >
            {line.text || '\u00A0'}
          </div>
        ))}
        <span style={{
          display: 'inline-block',
          width: 8,
          height: 16,
          background: '#6366f1',
          animation: 'blink 1s step-end infinite',
          verticalAlign: 'text-bottom',
          marginLeft: 2,
        }} />
      </div>
    </div>
  )
}

const FeatureCard = ({ feature, index }) => {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? '#0f172a' : '#020617',
        border: `1px solid ${hovered ? feature.color + '60' : '#1e293b'}`,
        borderRadius: 12,
        padding: '28px 24px',
        transition: 'all 0.25s ease',
        cursor: 'default',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? `0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px ${feature.color}30` : 'none',
      }}
    >
      <div style={{
        fontSize: 28,
        marginBottom: 14,
        display: 'inline-block',
        padding: '10px',
        background: feature.color + '15',
        borderRadius: 10,
        border: `1px solid ${feature.color}30`,
      }}>
        {feature.icon}
      </div>
      <h3 style={{
        color: '#f8fafc',
        fontSize: 15,
        fontWeight: 700,
        fontFamily: 'monospace',
        marginBottom: 8,
        letterSpacing: '-0.3px',
      }}>
        {feature.title}
      </h3>
      <p style={{
        color: '#94a3b8',
        fontSize: 13,
        lineHeight: 1.65,
        fontFamily: 'sans-serif',
      }}>
        {feature.desc}
      </p>
    </div>
  )
}

const LandingPage = ({ onGetStarted }) => {
  const heroRef = useRef(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{
      background: '#020617',
      minHeight: '100vh',
      color: '#f8fafc',
      fontFamily: 'system-ui, sans-serif',
      overflowX: 'hidden',
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-title {
          animation: fadeUp 0.8s ease forwards;
        }
        .hero-sub {
          animation: fadeUp 0.8s 0.15s ease forwards;
          opacity: 0;
        }
        .hero-cta {
          animation: fadeUp 0.8s 0.3s ease forwards;
          opacity: 0;
        }
        .hero-terminal {
          animation: fadeUp 0.8s 0.45s ease forwards;
          opacity: 0;
        }
        .glow-btn:hover {
          box-shadow: 0 0 30px rgba(99, 102, 241, 0.4), 0 8px 24px rgba(0,0,0,0.3) !important;
          transform: translateY(-2px) !important;
        }
        .nav-link:hover {
          color: #6366f1 !important;
        }
        .stack-badge:hover {
          border-color: #6366f1 !important;
          color: #6366f1 !important;
        }
      `}</style>

      {/* ── Noise overlay ── */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
        backgroundRepeat: 'repeat',
        backgroundSize: '200px',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* ── Radial glow ── */}
      <div style={{
        position: 'fixed',
        top: '-20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80vw',
        height: '60vh',
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 48px',
        borderBottom: scrollY > 20 ? '1px solid #1e293b' : '1px solid transparent',
        background: scrollY > 20 ? 'rgba(2,6,23,0.95)' : 'transparent',
        backdropFilter: scrollY > 20 ? 'blur(12px)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <span style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: 20,
            color: '#6366f1',
            letterSpacing: '-0.5px',
          }}>Uchiha</span>
          <span style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: 20,
            color: '#f8fafc',
            letterSpacing: '-0.5px',
          }}>Monitor</span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {['Features', 'Stack', 'About'].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="nav-link"
              style={{
                color: '#94a3b8',
                textDecoration: 'none',
                fontSize: 13,
                fontFamily: 'JetBrains Mono, monospace',
                transition: 'color 0.2s',
              }}
            >
              {link}
            </a>
          ))}
          <button
            onClick={onGetStarted}
            className="glow-btn"
            style={{
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 20px',
              fontSize: 13,
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Launch App →
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '120px 48px 80px',
          textAlign: 'center',
        }}
      >
        {/* Badge */}
        <div className="hero-title" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 100,
          padding: '6px 16px',
          marginBottom: 32,
          fontSize: 12,
          fontFamily: 'JetBrains Mono, monospace',
          color: '#818cf8',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#10b981',
            animation: 'blink 2s step-end infinite',
          }} />
          Open source API client — built with ❤️
        </div>

        {/* Main heading */}
        <h1 className="hero-title" style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: 'clamp(42px, 7vw, 88px)',
          lineHeight: 1.05,
          letterSpacing: '-2px',
          marginBottom: 24,
          maxWidth: 900,
        }}>
          <span style={{ color: '#f8fafc' }}>The API client</span>
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #6366f1 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 3s ease infinite',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            you actually want
          </span>
        </h1>

        {/* Subheading */}
        <p className="hero-sub" style={{
          color: '#94a3b8',
          fontSize: 18,
          lineHeight: 1.6,
          maxWidth: 560,
          marginBottom: 40,
          fontFamily: 'sans-serif',
        }}>
          Uchiha Monitor is a lightweight, self-hosted API testing tool.
          Collections, environments, history, GraphQL, and smart CORS proxy — all in one dark terminal.
        </p>

        {/* CTA buttons */}
        <div className="hero-cta" style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 80 }}>
          <button
            onClick={onGetStarted}
            className="glow-btn"
            style={{
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '14px 32px',
              fontSize: 15,
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
          >
            Open App →
          </button>
          <a
            href="#features"
            style={{
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: 14,
              fontFamily: 'JetBrains Mono, monospace',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#f8fafc'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            See features ↓
          </a>
        </div>

        {/* Terminal demo */}
        <div
          className="hero-terminal"
          style={{
            width: '100%',
            maxWidth: 680,
            animation: 'float 6s ease-in-out infinite',
          }}
        >
          <Terminal />
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{
        position: 'relative',
        zIndex: 1,
        padding: '100px 48px',
        maxWidth: 1200,
        margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{
            color: '#6366f1',
            fontSize: 12,
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            Everything you need
          </p>
          <h2 style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(28px, 4vw, 48px)',
            letterSpacing: '-1px',
            color: '#f8fafc',
          }}>
            Packed with features
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 20,
        }}>
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </section>

      {/* ── Split preview ── */}
      <section style={{
        position: 'relative',
        zIndex: 1,
        padding: '60px 48px 100px',
        maxWidth: 1200,
        margin: '0 auto',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 48,
          alignItems: 'center',
        }}>
          {/* Left — text */}
          <div>
            <p style={{
              color: '#6366f1',
              fontSize: 12,
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}>
              Zero CORS headaches
            </p>
            <h2 style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(24px, 3vw, 40px)',
              letterSpacing: '-1px',
              color: '#f8fafc',
              lineHeight: 1.15,
              marginBottom: 20,
            }}>
              Hit any URL.<br />We handle the rest.
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
              Type any external URL and Uchiha Monitor automatically routes it through your backend proxy.
              Localhost APIs go direct. External APIs get proxied. You never touch a config file.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'localhost:3000', badge: 'DIRECT', color: '#10b981' },
                { label: 'leetcode.com/graphql', badge: 'PROXIED', color: '#0ea5e9' },
                { label: 'api.github.com', badge: 'PROXIED', color: '#0ea5e9' },
              ].map((item) => (
                <div key={item.label} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: 8,
                  padding: '10px 16px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 13,
                }}>
                  <span style={{ color: '#f8fafc' }}>{item.label}</span>
                  <span style={{
                    color: item.color,
                    fontSize: 11,
                    border: `1px solid ${item.color}40`,
                    background: `${item.color}10`,
                    borderRadius: 4,
                    padding: '2px 8px',
                  }}>
                    {item.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — visual */}
          <div style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: 16,
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{
                background: '#10b981',
                color: '#020617',
                borderRadius: 4,
                padding: '4px 10px',
                fontSize: 12,
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 700,
              }}>GET</div>
              <div style={{
                flex: 1,
                background: '#020617',
                border: '1px solid #1e293b',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: 12,
                fontFamily: 'JetBrains Mono, monospace',
                color: '#94a3b8',
              }}>
                /collection
              </div>
              <div style={{
                background: '#6366f1',
                color: '#fff',
                borderRadius: 6,
                padding: '6px 16px',
                fontSize: 12,
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 700,
                cursor: 'pointer',
              }}>Send</div>
            </div>

            <div style={{
              background: '#020617',
              border: '1px solid #1e293b',
              borderRadius: 8,
              padding: '16px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12,
              lineHeight: 1.8,
            }}>
              <span style={{ color: '#10b981' }}>200 OK</span>
              <span style={{ color: '#94a3b8' }}> • 89ms • 2.1 KB</span>
              <br />
              <span style={{ color: '#94a3b8' }}>{'{'}</span><br />
              <span style={{ color: '#94a3b8' }}>{'  '}</span>
              <span style={{ color: '#0ea5e9' }}>"collections"</span>
              <span style={{ color: '#94a3b8' }}>: [</span><br />
              <span style={{ color: '#94a3b8' }}>{'    '}</span>
              <span style={{ color: '#0ea5e9' }}>"name"</span>
              <span style={{ color: '#94a3b8' }}>: </span>
              <span style={{ color: '#10b981' }}>"LeetCode"</span><br />
              <span style={{ color: '#94a3b8' }}>{'    '}</span>
              <span style={{ color: '#0ea5e9' }}>"requests"</span>
              <span style={{ color: '#94a3b8' }}>: </span>
              <span style={{ color: '#f59e0b' }}>14</span><br />
              <span style={{ color: '#94a3b8' }}>{'  ]'}</span><br />
              <span style={{ color: '#94a3b8' }}>{'}'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stack ── */}
      <section id="stack" style={{
        position: 'relative',
        zIndex: 1,
        padding: '80px 48px',
        borderTop: '1px solid #1e293b',
        borderBottom: '1px solid #1e293b',
        textAlign: 'center',
      }}>
        <p style={{
          color: '#94a3b8',
          fontSize: 12,
          fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          marginBottom: 32,
        }}>
          Built with
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          {STACK.map((tech) => (
            <span
              key={tech}
              className="stack-badge"
              style={{
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: 8,
                padding: '10px 20px',
                fontSize: 13,
                fontFamily: 'JetBrains Mono, monospace',
                color: '#94a3b8',
                transition: 'all 0.2s',
                cursor: 'default',
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* ── About / CTA ── */}
      <section id="about" style={{
        position: 'relative',
        zIndex: 1,
        padding: '120px 48px',
        textAlign: 'center',
        maxWidth: 720,
        margin: '0 auto',
      }}>
        <h2 style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: 'clamp(32px, 5vw, 60px)',
          letterSpacing: '-1.5px',
          color: '#f8fafc',
          lineHeight: 1.1,
          marginBottom: 24,
        }}>
          Ready to test<br />
          <span style={{ color: '#6366f1' }}>your first API?</span>
        </h2>
        <p style={{
          color: '#94a3b8',
          fontSize: 16,
          lineHeight: 1.7,
          marginBottom: 40,
        }}>
          Sign in with Google and start firing requests in under 30 seconds.
          No installation, no setup, no BS.
        </p>
        <button
          onClick={onGetStarted}
          className="glow-btn"
          style={{
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '16px 48px',
            fontSize: 16,
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.25s ease',
          }}
        >
          Get Started Free →
        </button>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        position: 'relative',
        zIndex: 1,
        borderTop: '1px solid #1e293b',
        padding: '32px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: '#6366f1' }}>Uchiha</span>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: '#f8fafc' }}>Monitor</span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
          Built for developers, by developers.
        </p>
        <p style={{ color: '#1e293b', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
          v1.0.0
        </p>
      </footer>
    </div>
  )
}

export default LandingPage;