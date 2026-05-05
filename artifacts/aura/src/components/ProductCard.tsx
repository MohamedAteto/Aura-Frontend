import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { StarRating } from './StarRating';
import { mediaUrl } from '../lib/api';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { QuickViewContext } from '../App';

interface Product {
  id: number; name: string; price: number; imageUrl?: string;
  categoryName?: string; averageRating?: number; reviewCount?: number; inStock?: boolean;
}

interface Props {
  product: Product;
  index?: number;
  viewMode?: 'grid' | 'list';
}

export function ProductCard({ product, index = 0, viewMode = 'grid' }: Props) {
  const { isAuthenticated } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const { bumpCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const wishlisted = isWishlisted(product.id);

  const isList = viewMode === 'list';
  const isNew = product.id % 5 === 0;
  const isSale = product.id % 7 === 0;

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    setAdding(true);
    try {
      await api.post('/api/Cart', { productId: product.id, quantity: 1 });
      bumpCart(1);
      setAdded(true);
      toast.success(`${product.name} added to cart!`);
      setTimeout(() => setAdded(false), 2200);
    } catch {
      toast.error('Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle(product.id);
    toast(wishlisted ? 'Removed from wishlist' : 'Saved to wishlist', { icon: wishlisted ? '💔' : '❤️' });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    QuickViewContext.open(product.id);
  };

  return (
    <motion.article
      className={`pcard ${isList ? 'pcard--list' : ''}`}
      initial={{ opacity: 0, y: isList ? 6 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.04, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={`/shop/${product.id}`} className="pcard__link">
        <div className="pcard__img-wrap">
          <img src={mediaUrl(product.imageUrl)} alt={product.name} className="pcard__img" loading="lazy" />
          <div className="pcard__shine" />
          <div className="pcard__badges">
            {!product.inStock && <span className="pcard__badge pcard__badge--oos">Out of stock</span>}
            {isNew && product.inStock && <span className="pcard__badge pcard__badge--new">New</span>}
            {isSale && product.inStock && <span className="pcard__badge pcard__badge--sale">−20%</span>}
          </div>
          <button type="button" className={`pcard__wish ${wishlisted ? 'pcard__wish--active' : ''}`} onClick={handleWishlist} aria-label="Toggle wishlist">
            <Heart size={14} fill={wishlisted ? '#fb7185' : 'none'} color={wishlisted ? '#fb7185' : 'hsl(256 22% 65%)'} strokeWidth={2} />
          </button>
          <div className="pcard__overlay">
            <button type="button" className="pcard__quick-btn" onClick={handleQuickView}>
              <Eye size={13} /> Quick view
            </button>
          </div>
        </div>

        <div className="pcard__body">
          <p className="pcard__cat">{product.categoryName}</p>
          <h3 className="pcard__title">{product.name}</h3>
          <div className="pcard__rating">
            <StarRating rating={product.averageRating ?? 0} size={12} />
            <span className="pcard__rating-val">{(product.averageRating ?? 0).toFixed(1)}</span>
            <span className="pcard__reviews">({product.reviewCount ?? 0})</span>
          </div>
          <div className="pcard__footer">
            <p className="pcard__price">
              {isSale && product.inStock && <span className="pcard__price-old">${(product.price * 1.25).toFixed(2)}</span>}
              ${product.price.toFixed(2)}
            </p>
            {isList && (
              <span style={{ fontSize: '0.78rem', color: product.inStock ? '#34d399' : 'var(--aura-rose)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                {product.inStock ? 'In stock' : 'Out of stock'}
              </span>
            )}
          </div>
        </div>
      </Link>

      <motion.button
        className={`pcard__add ${added ? 'pcard__add--done' : ''}`}
        onClick={addToCart}
        disabled={adding || !product.inStock}
        whileHover={{ scale: product.inStock ? 1.01 : 1 }}
        whileTap={{ scale: product.inStock ? 0.98 : 1 }}
      >
        {added
          ? <><span>✓</span> Added!</>
          : adding
            ? '…'
            : <><ShoppingCart size={13} /> {product.inStock ? 'Add to cart' : 'Out of stock'}</>}
      </motion.button>
    </motion.article>
  );
}
