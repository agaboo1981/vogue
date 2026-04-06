document.addEventListener('DOMContentLoaded', () => {
    const IMAGE_FALLBACK_SRC = new URL('../assets/fallback-fashion.svg', import.meta.url).href;
    const UNSPLASH_HOST = 'images.unsplash.com';
    const FALLBACK_BACKGROUND = 'linear-gradient(135deg, #e7dfd7 0%, #f5f1ec 50%, #e2d7ca 100%)';

    const normalizeUnsplashUrl = (inputUrl, widthHint) => {
        if (!inputUrl || !inputUrl.includes(UNSPLASH_HOST)) {
            return inputUrl;
        }

        try {
            const url = new URL(inputUrl);
            if (url.host !== UNSPLASH_HOST) {
                return inputUrl;
            }

            url.searchParams.set('auto', 'format');
            url.searchParams.set('fit', 'crop');
            url.searchParams.set('fm', 'jpg');
            url.searchParams.set('q', '80');

            if (widthHint && Number.isFinite(widthHint) && widthHint > 0) {
                url.searchParams.set('w', String(Math.round(widthHint)));
            }

            return url.toString();
        } catch {
            return inputUrl;
        }
    };

    const applyFallbackImage = (img) => {
        if (!img || img.dataset.fallbackApplied === 'true') {
            return;
        }

        img.dataset.fallbackApplied = 'true';
        img.src = img.dataset.fallback || IMAGE_FALLBACK_SRC;
    };

    const hardenImage = (img, priority = false) => {
        if (!img || !img.src) {
            return;
        }

        const widthHint = img.getBoundingClientRect().width || (priority ? 1400 : 900);
        const normalizedSrc = normalizeUnsplashUrl(img.src, widthHint);

        if (normalizedSrc !== img.src) {
            img.src = normalizedSrc;
        }

        if (!priority) {
            img.loading = 'lazy';
            img.decoding = 'async';
        } else {
            img.loading = 'eager';
            img.fetchPriority = 'high';
            img.decoding = 'sync';
        }

        img.referrerPolicy = 'strict-origin-when-cross-origin';
        img.dataset.fallback = img.dataset.fallback || IMAGE_FALLBACK_SRC;

        img.addEventListener('error', () => applyFallbackImage(img), { once: true });
    };

    const applyBackgroundWithFallback = (element, sourceUrl) => {
        if (!element || !sourceUrl) {
            return;
        }

        const widthHint = element.getBoundingClientRect().width || 1400;
        const normalized = normalizeUnsplashUrl(sourceUrl, widthHint);

        if (!normalized || !normalized.includes(UNSPLASH_HOST)) {
            element.style.backgroundImage = `url('${sourceUrl}')`;
            return;
        }

        const probe = new Image();
        probe.onload = () => {
            element.style.backgroundImage = `url('${normalized}')`;
        };
        probe.onerror = () => {
            element.style.backgroundImage = FALLBACK_BACKGROUND;
        };
        probe.src = normalized;
    };

    const applyLensBackground = (element, sourceUrl) => {
        if (!element || !sourceUrl) {
            return;
        }

        const normalized = normalizeUnsplashUrl(sourceUrl, 1200);
        if (!normalized || !normalized.includes(UNSPLASH_HOST)) {
            element.style.backgroundImage = `url('${sourceUrl}')`;
            return;
        }

        const probe = new Image();
        probe.onload = () => {
            element.style.backgroundImage = `url('${normalized}')`;
        };
        probe.onerror = () => {
            element.style.backgroundImage = FALLBACK_BACKGROUND;
        };
        probe.src = normalized;
    };

    const hardenUnsplashMedia = () => {
        document.querySelectorAll('img').forEach((img, idx) => {
            hardenImage(img, idx === 0);
        });

        document.querySelectorAll('[data-bg-image]').forEach((element) => {
            applyBackgroundWithFallback(element, element.dataset.bgImage);
        });

        document.querySelectorAll('[data-lens-image]').forEach((element) => {
            applyLensBackground(element, element.dataset.lensImage);
        });
    };

    document.addEventListener('error', (event) => {
        const target = event.target;
        if (target instanceof HTMLImageElement) {
            applyFallbackImage(target);
        }
    }, true);

    hardenUnsplashMedia();

    // 1. Elegant Preloader
    window.addEventListener('load', () => {
        setTimeout(() => {
            const preloader = document.getElementById('preloader');
            if (preloader) {
                preloader.classList.add('fade-out-loader');
                setTimeout(() => preloader.remove(), 800);
            }
        }, 1200);
    });

    // 2. Custom Cursor (Only for non-touch devices)
    const cursor = document.querySelector('.custom-cursor');
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (cursor && !isTouchDevice) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        const interactables = document.querySelectorAll('a, button, .product-card, input, label');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
    } else if (cursor) {
        cursor.style.display = 'none';
        document.body.style.cursor = 'auto';
    }

    // 3. Scroll Navbar
    const nav = document.querySelector('nav');
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }

    // 4. Staggered Scroll Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // 5. Runway Controls
    const runway = document.getElementById('runway');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (runway && prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            runway.scrollBy({ left: -450, behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', () => {
            runway.scrollBy({ left: 450, behavior: 'smooth' });
        });
    }

    // 6. Fabric Lens Logic
    const lensContainers = document.querySelectorAll('.lens-container');
    lensContainers.forEach(container => {
        const lens = container.querySelector('.fabric-lens');
        if (!lens) return;

        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            lens.style.left = (x - lens.offsetWidth / 2) + 'px';
            lens.style.top = (y - lens.offsetHeight / 2) + 'px';

            const percentX = (x / rect.width) * 100;
            const percentY = (y / rect.height) * 100;
            lens.style.backgroundPosition = `${percentX}% ${percentY}%`;
        });
    });

    // 7. Persistent Cart Logic
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const openCartBtn = document.getElementById('open-cart');
    const closeCartBtn = document.getElementById('close-cart');
    const addToCartBtns = document.querySelectorAll('.add-to-cart');
    const cartCount = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSubtotal = document.getElementById('cart-subtotal');

    // Load cart from LocalStorage
    let cart = JSON.parse(localStorage.getItem('vogue_cart')) || [];

    const toggleCart = () => {
        if (!cartDrawer) return;
        cartDrawer.classList.toggle('translate-x-full');
        cartOverlay.classList.toggle('hidden');
        setTimeout(() => {
            cartOverlay.classList.toggle('opacity-0');
        }, 10);
        document.body.classList.toggle('overflow-hidden');
    };

    if (openCartBtn) openCartBtn.addEventListener('click', toggleCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
    if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

    const updateCartUI = () => {
        if (!cartCount || !cartItemsContainer || !cartSubtotal) return;

        localStorage.setItem('vogue_cart', JSON.stringify(cart));
        
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        cartCount.textContent = totalItems;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="text-center py-20 text-gray-400">
                    <i data-lucide="shopping-bag" class="w-12 h-12 mx-auto mb-4 opacity-20"></i>
                    <p class="font-medium">Your bag is currently empty.</p>
                    <button onclick="window.location.href='index.html#trending'" class="mt-6 text-xs font-black uppercase tracking-widest text-black border-b-2 border-black pb-1 hover:text-rose-500 hover:border-rose-500 transition-colors">Start Shopping</button>
                </div>
            `;
        } else {
            cartItemsContainer.innerHTML = cart.map(item => `
                <div class="flex gap-6 group animate-on-scroll fade-in">
                    <div class="w-24 h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
                    </div>
                    <div class="flex-1">
                        <div class="flex justify-between mb-2">
                            <h4 class="font-bold tracking-tight">${item.name}</h4>
                            <p class="font-bold serif italic">$${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <p class="text-xs text-gray-400 uppercase tracking-widest mb-4">Quantity: ${item.quantity}</p>
                        <button onclick="removeFromCart('${item.id}')" class="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 hover:text-black transition-colors">Remove</button>
                    </div>
                </div>
            `).join('');
        }

        const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        cartSubtotal.textContent = `$${total.toFixed(2)}`;

        hardenUnsplashMedia();

        if (window.lucide) window.lucide.createIcons();
    };

    window.removeFromCart = (id) => {
        cart = cart.filter(item => item.id != id);
        updateCartUI();
    };

    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            const price = parseFloat(btn.dataset.price);
            const image = btn.closest('.product-card')?.querySelector('img')?.src || 
                          document.querySelector('.product-gallery-grid img')?.src;

            const existingItem = cart.find(item => item.id === id);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ id, name, price, image, quantity: 1 });
            }

            updateCartUI();
            if (cartDrawer.classList.contains('translate-x-full')) toggleCart();
            showToast(`${name} added to bag`);
        });
    });

    const showToast = (message) => {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white px-8 py-4 rounded-full text-xs font-bold tracking-widest z-[100] shadow-2xl';
        toast.textContent = message.toUpperCase();
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.transition = 'opacity 0.5s, transform 0.5s';
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, 20px)';
            setTimeout(() => toast.remove(), 500);
        }, 2000);
    };

    // 8. Search Simulation Logic
    const searchModal = document.getElementById('search-modal');
    const openSearchBtn = document.getElementById('open-search');
    const closeSearchBtn = document.getElementById('close-search');
    const searchInput = searchModal?.querySelector('input');

    if (searchModal && openSearchBtn && closeSearchBtn) {
        const toggleSearch = () => {
            if (searchModal.classList.contains('open')) {
                searchModal.classList.remove('open');
                setTimeout(() => searchModal.classList.add('visibility-hidden'), 300);
            } else {
                searchModal.classList.remove('visibility-hidden');
                setTimeout(() => searchModal.classList.add('open'), 10);
                searchInput?.focus();
            }
        };

        openSearchBtn.addEventListener('click', toggleSearch);
        closeSearchBtn.addEventListener('click', toggleSearch);

        searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                showToast(`Searching for "${searchInput.value}"...`);
                setTimeout(toggleSearch, 1000);
            }
        });
    }

    // 9. Checkout Validation
    const checkoutBtn = document.querySelector('button[type="button"]'); // The "Continue to Payment" btn
    if (checkoutBtn && window.location.pathname.includes('checkout.html')) {
        checkoutBtn.addEventListener('click', () => {
            const inputs = document.querySelectorAll('.form-input');
            let allFilled = true;
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    input.style.borderColor = '#f43f5e';
                    allFilled = false;
                } else {
                    input.style.borderColor = '#e2e8f0';
                }
            });

            if (allFilled) {
                showToast("Processing shipping details...");
                checkoutBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin mx-auto"></i>';
                lucide.createIcons();
                setTimeout(() => {
                    alert("Order Placed Successfully! (Simulation)");
                    localStorage.removeItem('vogue_cart');
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                showToast("Please fill all required fields");
            }
        });
    }

    // Initialize UI
    updateCartUI();
});
