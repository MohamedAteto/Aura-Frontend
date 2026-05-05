import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  Headphones, Shirt, Smartphone, Monitor, Footprints,
  Dumbbell, Sparkles, Home, Camera, Watch
} from 'lucide-react';

const cats = [
  { label: 'Electronics', icon: Monitor, color: '#7dd3fc', q: 'Electronics' },
  { label: 'Audio', icon: Headphones, color: '#a78bfa', q: 'Audio' },
  { label: 'Fashion', icon: Shirt, color: '#f472b6', q: 'Fashion' },
  { label: 'Phones', icon: Smartphone, color: '#34d399', q: 'Phones' },
  { label: 'Footwear', icon: Footprints, color: '#fb7185', q: 'Footwear' },
  { label: 'Sports', icon: Dumbbell, color: '#f97316', q: 'Sports' },
  { label: 'Beauty', icon: Sparkles, color: '#e879f9', q: 'Beauty' },
  { label: 'Home', icon: Home, color: '#fbbf24', q: 'Home' },
  { label: 'Cameras', icon: Camera, color: '#60a5fa', q: 'Cameras' },
  { label: 'Watches', icon: Watch, color: '#a3e635', q: 'Watches' },
];

export function CategoryStrip() {
  return (
    <section className="section">
      <div className="section__head">
        <h2 className="section__title">Shop by category</h2>
        <Link to="/shop" className="text-link">See all →</Link>
      </div>
      <div className="cat-strip">
        {cats.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.38 }}
            >
              <Link to={`/shop?q=${cat.q}`} className="cat-card">
                <div className="cat-card__icon" style={{ boxShadow: `0 8px 20px ${cat.color}18` }}>
                  <Icon size={26} color={cat.color} strokeWidth={1.6} />
                </div>
                <span className="cat-card__label">{cat.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
