import { motion } from 'framer-motion';
import { HeroSection } from '../components/HeroSection';
import { PromoShowcase } from '../components/PromoShowcase';
import { CategoryStrip } from '../components/CategoryStrip';
import { TrustBadges } from '../components/TrustBadges';
import { FeaturedCarousel } from '../components/FeaturedCarousel';
import { useState } from 'react';
import { toast } from 'sonner';

export function Home() {
  const [email, setEmail] = useState('');

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success('You\'re on the list! We\'ll be in touch.');
    setEmail('');
  };

  return (
    <div>
      <HeroSection />

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Category strip */}
        <CategoryStrip />

        <div className="section-divider" />

        {/* Trust badges */}
        <TrustBadges />

        <div className="section-divider" />

        {/* Featured carousel */}
        <FeaturedCarousel title="New Arrivals" sort="asc" />

        {/* Promo banners */}
        <PromoShowcase />

        {/* Best sellers carousel */}
        <FeaturedCarousel title="Best Sellers" sort="high" />

        <div className="section-divider" />

        {/* Newsletter */}
        <motion.section
          className="newsletter"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 640,
              background: 'linear-gradient(135deg, hsl(262 91% 76% / 0.07), hsl(199 95% 74% / 0.05))',
              border: '1px solid hsl(258 26% 22%)',
              borderRadius: 'var(--radius)',
              padding: '3rem 2rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: 200, height: 200, background: 'radial-gradient(circle, rgba(167,139,250,0.07), transparent)', borderRadius: '50%', pointerEvents: 'none' }} />
            <h2 className="newsletter" style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem', textAlign: 'center' }}>
              Stay in the loop
            </h2>
            <p style={{ color: 'hsl(256 22% 58%)', fontSize: '0.9rem', margin: '0 0 1.5rem', textAlign: 'center' }}>
              Get first access to new drops, exclusive deals, and style guides.
            </p>
            <form onSubmit={handleNewsletter} className="newsletter__form">
              <input
                className="input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <motion.button
                type="submit"
                className="btn btn--primary"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                Subscribe
              </motion.button>
            </form>
            <p style={{ fontSize: '0.7rem', color: 'hsl(256 22% 42%)', textAlign: 'center', marginTop: '0.75rem' }}>
              No spam, unsubscribe anytime.
            </p>
          </div>
        </motion.section>

        <div style={{ height: '3rem' }} />
      </div>
    </div>
  );
}
