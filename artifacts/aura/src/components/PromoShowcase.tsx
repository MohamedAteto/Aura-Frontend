import { Link } from 'wouter';
import { motion } from 'framer-motion';

const promos = [
  {
    label: 'New Season',
    title: 'Audio drops',
    cta: 'Shop now →',
    to: '/shop?category=audio',
    bg: 'linear-gradient(135deg, #0f0c1a 0%, #1a0a2e 50%, #0d1a3a 100%)',
    accent: 'linear-gradient(135deg, #6366f1, #0ea5e9)',
  },
  {
    label: 'Limited Edition',
    title: 'Streetwear',
    cta: 'Explore →',
    to: '/shop?category=fashion',
    bg: 'linear-gradient(135deg, #1a0a14 0%, #2d0f1f 50%, #1a0a1a 100%)',
    accent: 'linear-gradient(135deg, #f472b6, #a855f7)',
  },
];

export function PromoShowcase() {
  return (
    <section className="section">
      <div className="section__head">
        <h2 className="section__title">Featured</h2>
      </div>
      <div className="promo-grid">
        {promos.map((p, i) => (
          <motion.div
            key={p.title}
            className="promo-card"
            style={{ background: p.bg, border: '1px solid hsl(258 26% 18%)' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.12,
              background: p.accent,
              borderRadius: 'var(--radius)',
            }} />
            <p className="promo-card__label">{p.label}</p>
            <h3 className="promo-card__title">{p.title}</h3>
            <Link to={p.to} className="btn btn--ghost btn--sm" style={{ width: 'fit-content', zIndex: 1 }}>
              {p.cta}
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
