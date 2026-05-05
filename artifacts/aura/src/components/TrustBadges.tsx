import { motion } from 'framer-motion';
import { Truck, RotateCcw, Shield, Headphones } from 'lucide-react';

const badges = [
  { icon: Truck, color: '#7dd3fc', title: 'Free Shipping', sub: 'On all orders over $50' },
  { icon: RotateCcw, color: '#34d399', title: 'Easy Returns', sub: '30-day hassle-free returns' },
  { icon: Shield, color: '#a78bfa', title: 'Secure Payment', sub: 'SSL & encrypted checkout' },
  { icon: Headphones, color: '#f97316', title: '24/7 Support', sub: 'Dedicated support team' },
];

export function TrustBadges() {
  return (
    <section className="trust-strip" style={{ maxWidth: 1400, margin: '3rem auto', padding: '2rem 1.5rem' }}>
      {badges.map((b, i) => {
        const Icon = b.icon;
        return (
          <motion.div
            key={b.title}
            className="trust-item"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <div className="trust-icon" style={{ background: `${b.color}12`, border: `1px solid ${b.color}28` }}>
              <Icon size={18} color={b.color} strokeWidth={1.8} />
            </div>
            <div>
              <p className="trust-title">{b.title}</p>
              <p className="trust-sub">{b.sub}</p>
            </div>
          </motion.div>
        );
      })}
    </section>
  );
}
