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

function LegalPage({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <PageTransition>
      <main className="legal-page">
        <div className="legal-page-inner">
          <a href="/index.html" className="legal-back">
            <ArrowLeft size={15} /> Back to store
          </a>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="legal-title">{title}</h1>
          <div className="legal-body">{children}</div>
        </div>
      </main>
    </PageTransition>
  );
}

function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" eyebrow="Legal">
      <p className="lead">VOGUE. is committed to radical transparency. This policy explains exactly what data we collect, why we collect it, and how it's protected. We use plain language — no legalese.</p>
      <h2>What we collect</h2>
      <p>We collect only what's necessary to fulfil your order and improve your experience:</p>
      <ul>
        <li><strong>Name & contact details</strong> — to process and communicate about your order.</li>
        <li><strong>Delivery address</strong> — to ship your order to the right place.</li>
        <li><strong>Payment information</strong> — processed by our PCI-compliant payment provider. We never store full card details.</li>
        <li><strong>Browsing data</strong> — anonymised analytics. No cross-site tracking.</li>
      </ul>
      <h2>What we don't collect</h2>
      <p>We don't run advertising trackers, we don't build behavioural profiles, and we don't sell data — ever.</p>
      <h2>How we store it</h2>
      <p>All data is stored in encrypted, EU-based servers. We retain order data for seven years to comply with accounting regulations, after which it is permanently deleted.</p>
      <h2>Third parties</h2>
      <p>We share your data only with our logistics partner (delivery address only), our payment processor (card data only), and our email provider (for order confirmations only). All partners are contractually prohibited from using your data for any other purpose.</p>
      <h2>Your rights</h2>
      <p>Under GDPR and equivalent laws, you have the right to access, correct, export, or delete your data at any time. Email us at <a href="mailto:atelier@vogue.test">atelier@vogue.test</a> and we'll respond within 72 hours.</p>
      <h2>Cookies</h2>
      <p>We use a single first-party session cookie to maintain your cart. No analytics cookies, no advertising cookies.</p>
      <p className="legal-updated">Last updated: July 2025</p>
    </LegalPage>
  );
}

function TermsPage() {
  return (
    <LegalPage title="Terms of Service" eyebrow="Legal">
      <p className="lead">By using VOGUE. you agree to these terms. We've written them to be fair and readable, not to hide anything.</p>
      <h2>Products & availability</h2>
      <p>All items are produced in limited, traceable batches. We reserve the right to cancel an order if a product becomes unavailable after purchase, in which case you'll receive a full refund within 5 business days.</p>
      <h2>Pricing</h2>
      <p>All prices are in USD and include applicable taxes. Price changes will never affect an order already placed.</p>
      <h2>Intellectual property</h2>
      <p>All content on this site — photography, copy, design, and code — is the intellectual property of VOGUE. Reproduction without written consent is prohibited.</p>
      <h2>Limitation of liability</h2>
      <p>Our liability is limited to the value of the order placed. We are not liable for indirect or consequential losses.</p>
      <h2>Governing law</h2>
      <p>These terms are governed by the laws of the State of New York, without regard to conflict-of-law principles.</p>
      <p className="legal-updated">Last updated: July 2025</p>
    </LegalPage>
  );
}

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: 'Order enquiry', message: '' });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSent(true); };
  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <PageTransition>
      <main className="contact-page">
        <div className="contact-inner">
          <div className="contact-intro">
            <a href="/index.html" className="legal-back"><ArrowLeft size={15} /> Back to store</a>
            <p className="eyebrow">Get in touch</p>
            <h1 className="legal-title">Contact Us</h1>
            <p className="lead">We respond to every message within one business day.</p>
            <div className="contact-meta">
              <div><p className="contact-label">Email</p><p><a href="mailto:atelier@vogue.test">atelier@vogue.test</a></p></div>
              <div><p className="contact-label">Hours</p><p>Monday – Friday<br />9:00 am – 5:00 pm EST</p></div>
              <div><p className="contact-label">Response time</p><p>Within 1 business day</p></div>
            </div>
          </div>
          <div className="contact-form-wrap">
            {sent ? (
              <div className="contact-success">
                <Check size={32} strokeWidth={1.5} />
                <h2>Message received</h2>
                <p>We'll get back to you at <strong>{form.email}</strong> within one business day.</p>
                <a href="/index.html" className="checkout-link">Return to store</a>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <div className="form-row-two">
                  <div className="form-group">
                    <label htmlFor="c-name">Name</label>
                    <input id="c-name" type="text" value={form.name} onChange={update('name')} required placeholder="Your full name" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="c-email">Email</label>
                    <input id="c-email" type="email" value={form.email} onChange={update('email')} required placeholder="you@example.com" />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="c-subject">Subject</label>
                  <select id="c-subject" value={form.subject} onChange={update('subject')}>
                    <option>Order enquiry</option>
                    <option>Return or exchange</option>
                    <option>Repair request</option>
                    <option>Material questions</option>
                    <option>Press & wholesale</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="c-message">Message</label>
                  <textarea id="c-message" rows={6} value={form.message} onChange={update('message')} required placeholder="Tell us how we can help…" />
                </div>
                <Button type="submit" className="wide">Send message <ArrowRight size={17} /></Button>
              </form>
            )}
          </div>
        </div>
      </main>
    </PageTransition>
  );
}

function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: 'Do you offer repairs?', a: "Yes. Every VOGUE. garment comes with a lifetime repair guarantee. Ship it back and we'll restore it to original condition at no charge." },
    { q: 'How do I care for linen?', a: 'Machine wash cold on a gentle cycle, or hand wash. Line dry always — heat degrades linen fibre over time. The fabric softens with each wash.' },
    { q: 'What sizes do you carry?', a: 'We carry XS through XXL in all styles. Each product page includes a detailed size guide with body measurements, not vanity sizing.' },
    { q: 'Are your materials truly traceable?', a: 'Yes — every material has a full chain-of-custody document available on request. Our linen is sourced from Normandy cooperatives, our thread is organic certified cotton, and our buttons are Corozo nut.' },
    { q: 'How long does shipping take?', a: 'Standard carbon-neutral shipping takes 4–7 business days within the US. Express (2–3 days) and international options are available at checkout.' },
    { q: 'What is your returns policy?', a: 'You have 30 days to return unworn, unaltered items with tags attached. Before returning, consider a repair or alteration — we cover the cost.' },
    { q: 'Do you ship internationally?', a: 'Yes. We ship to 45+ countries via carbon-offset carriers. International orders may be subject to local customs duties, the responsibility of the recipient.' },
    { q: 'Can I cancel or change my order?', a: "Orders can be cancelled or modified within 2 hours of placement. After that email us immediately and we'll do our best." },
    { q: 'How is packaging handled?', a: 'All packaging is 100% compostable. Our garment bags are made from recycled cotton scraps. No plastic, ever.' },
    { q: 'Do you offer gift cards?', a: 'Gift cards are available in $50, $100, $250, and $500 denominations. They never expire.' },
  ];

  return (
    <PageTransition>
      <main className="legal-page">
        <div className="legal-page-inner faq-inner">
          <a href="/index.html" className="legal-back"><ArrowLeft size={15} /> Back to store</a>
          <p className="eyebrow">Support</p>
          <h1 className="legal-title">Frequently asked questions</h1>
          <p className="lead" style={{ marginBottom: '3rem' }}>Everything you need to know about materials, sizing, repairs, and orders.</p>
          <div className="faq-list" role="list">
            {faqs.map((item, i) => (
              <div key={i} className={`faq-item${open === i ? ' open' : ''}`} role="listitem">
                <button className="faq-question" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                  {item.q}
                  <ChevronDown size={18} className="faq-chevron" />
                </button>
                <div className="faq-answer"><p>{item.a}</p></div>
              </div>
            ))}
          </div>
          <div className="faq-cta">
            <p>Still have questions?</p>
            <a href="/contact.html" className="checkout-link">Contact us <ArrowRight size={16} /></a>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}

function ShippingPage() {
  return (
    <LegalPage title="Shipping & Returns" eyebrow="Support">
      <p className="lead">Every order is shipped carbon-neutral. We've partnered with certified offset carriers so your purchase doesn't cost the earth — literally.</p>
      <h2>Shipping options</h2>
      <div className="shipping-table">
        <div className="shipping-row header"><span>Service</span><span>Estimated time</span><span>Cost</span></div>
        <div className="shipping-row"><span>Standard (carbon-neutral)</span><span>4–7 business days</span><span>$8 / Free over $150</span></div>
        <div className="shipping-row"><span>Express</span><span>2–3 business days</span><span>$18</span></div>
        <div className="shipping-row"><span>International</span><span>7–14 business days</span><span>From $22</span></div>
      </div>
      <h2>Processing time</h2>
      <p>Orders are processed within 1–2 business days. You'll receive a tracking link via email once your order ships.</p>
      <h2>International orders</h2>
      <p>We ship to 45+ countries. Local customs duties and import taxes are the responsibility of the recipient — we cannot undervalue declarations.</p>
      <h2>Returns</h2>
      <p>We have a 30-day return window for unworn, unaltered items with original tags attached. Before initiating a return, we encourage repair, alteration, or exchange first.</p>
      <h2>How to return</h2>
      <p>Email <a href="mailto:atelier@vogue.test">atelier@vogue.test</a> with your order number. We'll issue a prepaid return label within 24 hours. Refunds process within 5 business days of receiving your return.</p>
      <h2>Conditions</h2>
      <p>Items must be unworn, unwashed, and unaltered with all original tags attached. Items marked as Final Sale are not eligible for return.</p>
      <p className="legal-updated">Last updated: July 2025</p>
    </LegalPage>
  );
}

function AboutPage() {
  return (
    <PageTransition>
      <main className="about-page">
        <div className="about-hero">
          <div className="about-hero-text">
            <a href="/index.html" className="legal-back"><ArrowLeft size={15} /> Back to store</a>
            <p className="eyebrow">About VOGUE.</p>
            <h1 className="about-title">Clothing should leave<br /><em>no trace.</em></h1>
            <p className="lead">We spent two years building a circular supply chain before producing a single garment.</p>
          </div>
        </div>
        <section className="about-section">
          <div className="about-section-inner">
            <div className="about-label"><span className="eyebrow">01 — Our Story</span></div>
            <div className="about-copy">
              <h2>Built on a single principle</h2>
              <p>VOGUE. was founded in 2022 by a small team of designers and supply chain engineers who were tired of greenwashing. We believed that if a brand can't trace every component to its source, it has no right to call itself sustainable.</p>
              <p>We started by mapping the full lifecycle of a single linen dress — from soil to garment to end-of-life. That process took eight months and changed how we built everything: the products, the supply chain, the company itself.</p>
              <p>We launched in 2024 with five pieces. All five sold out in three days. We run in small batches not as a marketing tactic, but because that's all we can produce while maintaining full traceability.</p>
            </div>
          </div>
        </section>
        <section className="about-section about-section-alt">
          <div className="about-section-inner">
            <div className="about-label"><span className="eyebrow">02 — Materials</span></div>
            <div className="about-copy">
              <h2>Every fibre, documented</h2>
              <p>We don't use the word "sustainable" unless we can prove it. Every material has a full chain-of-custody document available on request.</p>
              <div className="materials-grid">
                <div className="material-card"><h3>Linen</h3><p>Sourced from family cooperatives in Normandy, France. Dew-retted naturally — no chemicals. Lower water consumption than cotton by a factor of 10.</p></div>
                <div className="material-card"><h3>Buttons</h3><p>Carved from fallen Corozo palm nuts in Ecuador. No trees felled. Each button is unique. Naturally biodegradable within 5 years.</p></div>
                <div className="material-card"><h3>Thread</h3><p>100% GOTS-certified organic cotton thread. Dyed with OEKO-TEX certified dyes. Fully biodegradable.</p></div>
                <div className="material-card"><h3>Packaging</h3><p>100% compostable — garment bags made from recycled cotton scraps. FSC-certified shipping boxes. Zero plastic.</p></div>
              </div>
            </div>
          </div>
        </section>
        <section className="about-section">
          <div className="about-section-inner">
            <div className="about-label"><span className="eyebrow">03 — Sustainability</span></div>
            <div className="about-copy">
              <h2>Measured, not marketed</h2>
              <p>Sustainability is not a feature we added — it's the reason VOGUE. exists. We measure our impact with third-party verified numbers, published annually.</p>
              <div className="impact-stats">
                <div className="impact-stat"><span className="impact-number">−18 kg</span><span className="impact-label">CO₂ negated per garment vs. industry average</span></div>
                <div className="impact-stat"><span className="impact-number">94%</span><span className="impact-label">Less water used than conventional cotton</span></div>
                <div className="impact-stat"><span className="impact-number">100%</span><span className="impact-label">Living wages paid across our supply chain</span></div>
                <div className="impact-stat"><span className="impact-number">0</span><span className="impact-label">Plastic used in packaging or product</span></div>
              </div>
              <p>We publish our full impact report every January. <a href="/contact.html">Request a copy →</a></p>
            </div>
          </div>
        </section>
        <div className="about-cta">
          <p>Ready to start?</p>
          <a href="/index.html#edit" className="checkout-link">Shop the edit <ArrowRight size={16} /></a>
        </div>
      </main>
    </PageTransition>
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

function Footer() {
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
              <a href="/about.html">Our Story</a>
              <a href="/about.html#materials">Materials</a>
              <a href="/about.html#sustainability">Sustainability</a>
            </nav>
          </div>
          <div className="footer-col">
            <h3>Support</h3>
            <nav aria-label="Support navigation">
              <a href="/contact.html">Contact Us</a>
              <a href="/faq.html">FAQ</a>
              <a href="/shipping.html">Shipping & Returns</a>
            </nav>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} VOGUE. All rights reserved.</p>
        <nav aria-label="Legal navigation">
          <a href="/privacy.html">Privacy Policy</a>
          <a href="/terms.html">Terms of Service</a>
        </nav>
      </div>
    </footer>
  );
}

function App() {
  const page = useMemo(() => {
    const path = window.location.pathname;
    if (path.endsWith('/product.html')) return <ProductPage />;
    if (path.endsWith('/checkout.html')) return <CheckoutPage />;
    if (path.endsWith('/privacy.html')) return <PrivacyPage />;
    if (path.endsWith('/terms.html')) return <TermsPage />;
    if (path.endsWith('/contact.html')) return <ContactPage />;
    if (path.endsWith('/faq.html')) return <FAQPage />;
    if (path.endsWith('/shipping.html')) return <ShippingPage />;
    if (path.endsWith('/about.html')) return <AboutPage />;
    return <HomePage />;
  }, []);

  return (
    <CartProvider>
      <Header />
      {page}
      <Footer />
    </CartProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
