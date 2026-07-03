import { StrictMode, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Heart,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  X,
} from 'lucide-react';
import { CartProvider, useCart } from './cart';
import { heroImages, productGallery, products, type Product } from './data';
import './styles.css';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function Button({
  children,
  variant = 'dark',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'dark' | 'light' | 'ghost' }) {
  return (
    <button className={`btn btn-${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}

function PageTransition({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function useFocusTrap<T extends HTMLElement>(isActive: boolean, onClose: () => void) {
  const ref = useRef<T>(null);
  const onCloseRef = useRef(onClose);
  
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isActive) return;
    
    const currentFocus = document.activeElement as HTMLElement;
    
    const timer = requestAnimationFrame(() => {
      const element = ref.current;
      if (!element) return;

      const focusableElements = element.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const autoFocusElement = element.querySelector<HTMLElement>('[autofocus]');
      const elementToFocus = autoFocusElement || focusableElements[0];
      
      if (elementToFocus && !element.contains(document.activeElement)) {
        elementToFocus.focus();
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      
      const element = ref.current;
      if (!element) return;

      if (e.key === 'Tab') {
        const focusableElements = element.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || document.activeElement === element) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement || document.activeElement === element) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(timer);
      document.removeEventListener('keydown', handleKeyDown);
      if (currentFocus && typeof currentFocus.focus === 'function') {
        currentFocus.focus({ preventScroll: true });
      }
    };
  }, [isActive]);

  return ref;
}

function Header() {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a className="brand" href="/index.html" aria-label="VOGUE home">
          VOGUE<span>.</span>
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="/index.html#edit">Edit</a>
          <a href="/index.html#materials">Materials</a>
          <a href="/product.html">Atelier Dress</a>
          <a href="/checkout.html">Checkout</a>
        </nav>
        <div className="header-actions">
          <button className="mobile-menu-toggle" aria-expanded={menuOpen} aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            Menu
          </button>
          <button aria-label="Open search" className="icon-button" onClick={() => setSearchOpen(true)}>
            <Search size={18} />
          </button>
          <button aria-label={`Open bag with ${itemCount} items`} className="icon-button bag-button" onClick={() => setCartOpen(true)}>
            <ShoppingBag size={18} />
            <span>{itemCount}</span>
          </button>
        </div>
      </header>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const modalRef = useFocusTrap<HTMLDivElement>(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="overlay" role="dialog" aria-modal="true" aria-labelledby="search-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div ref={modalRef} className="search-dialog" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}>
            <button className="icon-button dialog-close" aria-label="Close search" onClick={onClose}>
              <X size={20} />
            </button>
            <p className="eyebrow" id="search-title">
              Search the edit
            </p>
            <label className="sr-only" htmlFor="site-search">
              Search products
            </label>
            <input id="site-search" autoFocus placeholder="linen, canvas, tote..." />
            <div className="suggestion-row" aria-label="Suggested searches">
              {['Traceable linen', 'Low-impact outerwear', 'Lifetime repair'].map((term) => (
                <a href="/product.html" key={term} onClick={onClose}>
                  {term}
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const DIALOG_CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    content: (
      <>
        <p>VOGUE. is committed to protecting your privacy and ensuring you have a positive experience on our website.</p>
        <h3>Data Collection</h3>
        <p>We collect minimal data required to process your orders and improve our regenerative supply chain.</p>
        <h3>Third Parties</h3>
        <p>We never sell your data. We only share necessary information with our traceable shipping partners.</p>
      </>
    )
  },
  terms: {
    title: 'Terms of Service',
    content: (
      <>
        <p>By using VOGUE., you agree to our terms of service which prioritize transparency and sustainability.</p>
        <h3>Purchases</h3>
        <p>All purchases are subject to availability. Our items are produced in small batches.</p>
      </>
    )
  },
  contact: {
    title: 'Contact Us',
    content: (
      <>
        <p>We're here to help with your regenerative wardrobe.</p>
        <p><strong>Email:</strong> atelier@vogue.test</p>
        <p><strong>Hours:</strong> Mon-Fri, 9am - 5pm EST</p>
      </>
    )
  },
  materials: {
    title: 'Materials Ledger',
    content: (
      <>
        <p>Every fiber we use is traceable to its source.</p>
        <ul>
          <li><strong>Linen:</strong> Sourced from Normandy, dew-retted naturally.</li>
          <li><strong>Buttons:</strong> Carved from fallen Corozo nuts in Ecuador.</li>
          <li><strong>Thread:</strong> 100% organic cotton, biodegradable.</li>
        </ul>
      </>
    )
  },
  returns: {
    title: 'Shipping & Returns',
    content: (
      <>
        <p>We use carbon-neutral shipping for all orders.</p>
        <h3>Returns</h3>
        <p>You have 30 days to return unworn items. We encourage repairs before replacement.</p>
      </>
    )
  },
  story: {
    title: 'Our Story',
    content: (
      <>
        <p>VOGUE. was founded on a simple principle: clothing should leave no trace.</p>
        <p>We spent two years developing a fully circular supply chain before producing our first garment.</p>
      </>
    )
  },
  sustainability: {
    title: 'Sustainability',
    content: (
      <>
        <p>Sustainability is not a feature; it's our entire business model.</p>
        <p>We measure our impact in carbon negated, water saved, and fair wages paid.</p>
      </>
    )
  },
  faq: {
    title: 'FAQ',
    content: (
      <>
        <h3>Do you offer repairs?</h3>
        <p>Yes, all items come with a lifetime repair guarantee.</p>
        <h3>How do I care for linen?</h3>
        <p>Cold wash, line dry. The fabric softens beautifully over time.</p>
      </>
    )
  }
};

function InfoDialog({ contentKey, onClose }: { contentKey: keyof typeof DIALOG_CONTENT | null; onClose: () => void }) {
  const modalRef = useFocusTrap<HTMLDivElement>(!!contentKey, onClose);
  const content = contentKey ? DIALOG_CONTENT[contentKey] : null;

  return (
    <AnimatePresence>
      {content && (
        <motion.div className="overlay" role="dialog" aria-modal="true" aria-labelledby="info-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div ref={modalRef} className="search-dialog info-dialog" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}>
            <button className="icon-button dialog-close" aria-label="Close dialog" onClick={onClose}>
              <X size={20} />
            </button>
            <h2 className="info-title" id="info-title">
              {content.title}
            </h2>
            <div className="info-content">
              {content.content}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, subtotal, removeItem, decrementItem, addItem } = useCart();
  const modalRef = useFocusTrap<HTMLElement>(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="drawer-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button className="drawer-scrim" aria-label="Close bag" onClick={onClose} tabIndex={-1} />
          <motion.aside
            ref={modalRef as any}
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bag-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="drawer-head">
              <div>
                <p className="eyebrow">Private bag</p>
                <h2 id="bag-title">Your selection</h2>
              </div>
              <button className="icon-button" aria-label="Close bag" onClick={onClose}>
                <X size={20} />
              </button>
            </div>
            <div className="drawer-items">
              {items.length === 0 ? (
                <div className="empty-state">
                  <ShoppingBag size={28} />
                  <p>Your bag is empty.</p>
                  <a href="/index.html#edit" onClick={onClose}>
                    Shop the edit
                  </a>
                </div>
              ) : (
                items.map((item) => (
                  <article className="bag-line" key={item.id}>
                    <img src={item.image} alt={item.imageAlt} />
                    <div>
                      <h3>{item.name}</h3>
                      <p>
                        {item.color}
                        {item.size ? ` / ${item.size}` : ''}
                      </p>
                      <div className="quantity-controls">
                        <button aria-label={`Decrease ${item.name}`} onClick={() => decrementItem(item.id)}>
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button aria-label={`Increase ${item.name}`} onClick={() => addItem(item, item.size)}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="bag-line-end">
                      <strong>{money.format(item.price * item.quantity)}</strong>
                      <button onClick={() => removeItem(item.id)}>Remove</button>
                    </div>
                  </article>
                ))
              )}
            </div>
            {items.length > 0 && (
              <div className="drawer-foot">
                <div className="total-row">
                  <span>Subtotal</span>
                  <strong>{money.format(subtotal)}</strong>
                </div>
                <p>Taxes calculated at checkout. Carbon-neutral delivery is included over $200.</p>
                <a className="checkout-link" href="/checkout.html" onClick={onClose}>
                  Continue to checkout <ArrowRight size={18} />
                </a>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const modalRef = useFocusTrap<HTMLDivElement>(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="drawer-layer" style={{ zIndex: 90 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            ref={modalRef}
            className="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mobile-nav-header">
              <a className="brand" href="/index.html" onClick={onClose}>
                VOGUE<span>.</span>
              </a>
              <button className="icon-button" aria-label="Close menu" onClick={onClose}>
                <X size={20} />
              </button>
            </div>
            <nav className="mobile-nav-links" aria-label="Primary navigation">
              <a href="/index.html#edit" onClick={onClose}>Edit</a>
              <a href="/index.html#materials" onClick={onClose}>Materials</a>
              <a href="/product.html" onClick={onClose}>Atelier Dress</a>
              <a href="/checkout.html" onClick={onClose}>Checkout</a>
            </nav>
            <div className="mobile-nav-footer">
              <p>Regenerative wardrobe objects.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const { addItem } = useCart();
  return (
    <motion.article
      className="product-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <a className="product-media" href="/product.html">
        <img src={product.image} alt={product.imageAlt} loading={index > 1 ? 'lazy' : 'eager'} />
        <span>{product.signal}</span>
      </a>
      <div className="product-copy">
        <div>
          <p>{product.category}</p>
          <h3>
            <a href="/product.html">{product.name}</a>
          </h3>
          <span>{product.material}</span>
        </div>
        <strong>{money.format(product.price)}</strong>
      </div>
      <Button variant="light" onClick={() => addItem(product)}>
        Add to bag <ShoppingBag size={16} />
      </Button>
    </motion.article>
  );
}

function HomePage() {
  return (
    <PageTransition>
      <main id="main">
        <section className="hero-section">
          <div className="hero-image">
            <img src={heroImages[0]} alt="Minimal fashion showroom with warm daylight and organized garments" />
          </div>
          <div className="hero-content">
            <p className="eyebrow">Regenerative wardrobe objects</p>
            <h1>Clothing with proof, restraint, and staying power.</h1>
            <p>
              VOGUE. designs low-impact essentials for people who care how something is made as much as how it feels on
              the body.
            </p>
            <div className="hero-actions">
              <a className="primary-link" href="#edit">
                Shop the edit <ArrowRight size={18} />
              </a>
              <a className="secondary-link" href="#materials">
                See material ledger
              </a>
            </div>
          </div>
          <dl className="hero-metrics" aria-label="Store highlights">
            <div>
              <dt>87%</dt>
              <dd>verified natural or recycled fibers</dd>
            </div>
            <div>
              <dt>14 days</dt>
              <dd>repair assessment window</dd>
            </div>
            <div>
              <dt>0</dt>
              <dd>fabric claims without supplier proof</dd>
            </div>
          </dl>
        </section>

        <section className="editorial-band" id="materials">
          <div>
            <p className="eyebrow">Material ledger</p>
            <h2>Each fabric has a reason to exist.</h2>
          </div>
          <div className="ledger-grid">
            {[
              ['Flax linen', 'Field-retted in Europe, softened without silicone finishing.'],
              ['Recycled canvas', 'Dense handfeel, reinforced stress points, replaceable hardware.'],
              ['Plant leather', 'Corn-based upper with removable insoles and repairable stitching.'],
            ].map(([title, body]) => (
              <article key={title}>
                <Sparkles size={18} />
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="product-section" id="edit">
          <div className="section-head">
            <p className="eyebrow">The concise edit</p>
            <h2>Four pieces, no filler.</h2>
            <p>Designed to make the first purchase feel informed, tactile, and reversible.</p>
          </div>
          <div className="product-grid">
            {products.map((product, index) => (
              <ProductCard product={product} index={index} key={product.id} />
            ))}
          </div>
        </section>

        <section className="story-section">
          <img src={heroImages[1]} alt="Close view of silk texture in warm studio light" loading="lazy" />
          <div>
            <p className="eyebrow">Why it converts</p>
            <h2>Luxury cues without pressure tactics.</h2>
            <p>
              The store favors exact product information, durable service promises, calm motion, and clear next actions.
              No fake scarcity, hidden costs, or manipulative urgency.
            </p>
            <ul>
              <li>
                <Check size={18} /> Visible add-to-bag controls on every device
              </li>
              <li>
                <Check size={18} /> Product proof placed near purchase decisions
              </li>
              <li>
                <Check size={18} /> Checkout language that reduces risk instead of amplifying anxiety
              </li>
            </ul>
          </div>
        </section>
      </main>
    </PageTransition>
  );
}

function ProductPage() {
  const [size, setSize] = useState('S');
  const [color, setColor] = useState('Undyed flax');
  const { addItem } = useCart();
  const product = products[0];

  return (
    <PageTransition>
      <main id="main" className="product-page">
        <section className="detail-layout">
          <div className="gallery-grid" aria-label="Product gallery">
            {productGallery.map((image, index) => (
              <img key={image} src={image} alt={`Atelier Linen Dress view ${index + 1}`} loading={index > 1 ? 'lazy' : 'eager'} />
            ))}
          </div>
          <aside className="purchase-panel">
            <p className="eyebrow">New permanent collection</p>
            <h1>{product.name}</h1>
            <p className="price">{money.format(product.price)}</p>
            <p className="product-intro">
              A breathable column dress cut from organic European linen with deep hem allowance, corozo buttons, and
              removable belt tabs for adjustable styling.
            </p>
            <fieldset>
              <legend>Color: {color}</legend>
              <div className="swatches">
                {[
                  ['Undyed flax', '#d8c4a8'],
                  ['Mineral black', '#181716'],
                  ['Olive ash', '#626b45'],
                ].map(([label, value]) => (
                  <button
                    aria-label={label}
                    className={color === label ? 'active' : ''}
                    key={label}
                    style={{ backgroundColor: value }}
                    type="button"
                    onClick={() => setColor(label)}
                  />
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="sr-only">Size</legend>
              <div className="field-row">
                <span aria-hidden="true" style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink)' }}>Size</span>
                <button type="button">Size guide</button>
              </div>
              <div className="size-grid">
                {['XS', 'S', 'M', 'L', 'XL'].map((option) => (
                  <button className={size === option ? 'active' : ''} type="button" key={option} onClick={() => setSize(option)}>
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="purchase-actions">
              <Button className="wide" onClick={() => addItem(product, size)}>
                Add to bag <ShoppingBag size={18} />
              </Button>
              <button className="wish-button" aria-label="Save Atelier Linen Dress">
                <Heart size={20} />
              </button>
            </div>
            <div className="trust-stack">
              {[
                [Truck, 'Free low-impact delivery over $200', '2-5 business days'],
                [ShieldCheck, '30-day fit guarantee', 'Returns are prepaid and consolidated'],
              ].map(([Icon, title, body]) => (
                <article key={String(title)}>
                  <Icon size={20} />
                  <div>
                    <h3>{title as string}</h3>
                    <p>{body as string}</p>
                  </div>
                </article>
              ))}
            </div>
            <details open>
              <summary>
                Materials and care <ChevronDown size={18} />
              </summary>
              <p>100% organic linen. Wash cold, line dry, steam to relax. Designed for visible mending and alterations.</p>
            </details>
          </aside>
        </section>
        <section className="product-section compact">
          <div className="section-head">
            <p className="eyebrow">Complete the uniform</p>
            <h2>Considered pairings.</h2>
          </div>
          <div className="product-grid three">
            {products.slice(1).map((item, index) => (
              <ProductCard product={item} index={index} key={item.id} />
            ))}
          </div>
        </section>
      </main>
    </PageTransition>
  );
}

function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [submitted, setSubmitted] = useState(false);
  const shipping = subtotal > 200 || subtotal === 0 ? 0 : 12;
  const total = subtotal + shipping;
  const displayItems = items.length ? items : products.slice(0, 2).map((product) => ({ ...product, quantity: 1 }));
  const displaySubtotal = items.length ? subtotal : products[0].price + products[1].price;
  const displayShipping = displaySubtotal > 200 ? 0 : 12;
  const displayTotal = displaySubtotal + displayShipping;

  return (
    <PageTransition>
      <main id="main" className="checkout-page">
        <section className="checkout-layout">
          <div className="checkout-form">
            <a className="back-link" href="/product.html">
              <ArrowLeft size={16} /> Return to product
            </a>
            <p className="eyebrow">Secure checkout</p>
            <h1>Delivery details</h1>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
                if (items.length) clearCart();
              }}
            >
              <FormInput id="email" label="Email address" type="email" placeholder="you@example.com" />
              <div className="two-col">
                <FormInput id="firstName" label="First name" placeholder="Jane" />
                <FormInput id="lastName" label="Last name" placeholder="Adebayo" />
              </div>
              <FormInput id="address" label="Street address" placeholder="14 Mercer Street" />
              <div className="two-col">
                <FormInput id="city" label="City" placeholder="New York" />
                <FormInput id="postal" label="Postal code" placeholder="10012" />
              </div>
              <label className="check-row">
                <input type="checkbox" />
                <span>Send delivery updates and repair-care reminders.</span>
              </label>
              {submitted && (
                <p className="success-message" role="status">
                  Order simulation complete. Your bag has been cleared.
                </p>
              )}
              <Button className="wide" type="submit" disabled={submitted}>
                {submitted ? 'Order placed' : (
                  <>
                    Place order <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </form>
          </div>
          <aside className="order-summary" aria-label="Order summary">
            <p className="eyebrow">Order summary</p>
            {displayItems.map((item) => (
              <article className="summary-line" key={item.id}>
                <img src={item.image} alt={item.imageAlt} />
                <div>
                  <h2>{item.name}</h2>
                  <p>{item.color}</p>
                </div>
                <strong>{money.format(item.price * item.quantity)}</strong>
              </article>
            ))}
            <div className="summary-totals">
              <div>
                <span>Subtotal</span>
                <strong>{money.format(items.length ? subtotal : displaySubtotal)}</strong>
              </div>
              <div>
                <span>Delivery</span>
                <strong>{money.format(items.length ? shipping : displayShipping)}</strong>
              </div>
              <div className="grand-total">
                <span>Total</span>
                <strong>{money.format(items.length ? total : displayTotal)}</strong>
              </div>
            </div>
            <div className="checkout-proof">
              <ShieldCheck size={20} />
              <p>Encrypted payment handoff, prepaid returns, and no hidden handling fees.</p>
            </div>
          </aside>
        </section>
      </main>
    </PageTransition>
  );
}

function FormInput({ id, label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { id: string; label: string }) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} required {...props} />
    </div>
  );
}

function Footer({ onOpenInfo }: { onOpenInfo: (k: keyof typeof DIALOG_CONTENT) => void }) {
  const handleLink = (k: keyof typeof DIALOG_CONTENT) => (e: React.MouseEvent) => {
    e.preventDefault();
    onOpenInfo(k);
  };

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <a className="brand" href="/index.html">
            VOGUE<span>.</span>
          </a>
          <p>Regenerative wardrobe objects with supplier proof, repair pathways, and fewer decisions.</p>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <h3>Shop</h3>
            <nav aria-label="Shop navigation">
              <a href="/index.html#edit">The Edit</a>
              <a href="/product.html">All Products</a>
              <a href="/index.html#edit">New Arrivals</a>
            </nav>
          </div>
          <div className="footer-col">
            <h3>About</h3>
            <nav aria-label="About navigation">
              <a href="#story" onClick={handleLink('story')}>Our Story</a>
              <a href="#materials" onClick={handleLink('materials')}>Materials</a>
              <a href="#sustainability" onClick={handleLink('sustainability')}>Sustainability</a>
            </nav>
          </div>
          <div className="footer-col">
            <h3>Support</h3>
            <nav aria-label="Support navigation">
              <a href="#contact" onClick={handleLink('contact')}>Contact Us</a>
              <a href="#faq" onClick={handleLink('faq')}>FAQ</a>
              <a href="#returns" onClick={handleLink('returns')}>Shipping & Returns</a>
            </nav>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} VOGUE. All rights reserved.</p>
        <nav aria-label="Legal navigation">
          <a href="#privacy" onClick={handleLink('privacy')}>Privacy Policy</a>
          <a href="#terms" onClick={handleLink('terms')}>Terms of Service</a>
        </nav>
      </div>
    </footer>
  );
}

function App() {
  const [infoKey, setInfoKey] = useState<keyof typeof DIALOG_CONTENT | null>(null);

  const page = useMemo(() => {
    if (window.location.pathname.endsWith('/product.html')) return <ProductPage />;
    if (window.location.pathname.endsWith('/checkout.html')) return <CheckoutPage />;
    return <HomePage />;
  }, []);

  return (
    <CartProvider>
      <Header />
      {page}
      <Footer onOpenInfo={setInfoKey} />
      <InfoDialog contentKey={infoKey} onClose={() => setInfoKey(null)} />
    </CartProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
