// Modal functions
        function openModal(id) {
            const modal = document.getElementById(`${id}-modal`);
            if (modal) {
                modal.style.display = 'flex';
                // Populate modal content if it's the confirm modal
                if (id === 'confirm' && currentProduct) {
                    const qty = document.getElementById('qty-select').value;
                    document.getElementById('confirm-items-preview').innerHTML = `
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <img src="${currentProduct.image}" alt="${currentProduct.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                            <div>
                                <p style="font-size: 0.9rem; font-weight: 600; color: var(--secondary); margin: 0;">${currentProduct.name}</p>
                                <p style="font-size: 0.8rem; color: #64748b; margin: 0;">Qty: ${qty} | Price: ₹${(currentProduct.price * qty).toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    `;
                    // Populate address fields (dummy data for now)
                    document.getElementById('conf-name').value = 'John Doe';
                    document.getElementById('conf-hno').value = '123';
                    document.getElementById('conf-street').value = 'Main St';
                    document.getElementById('conf-pincode').value = '123456';
                    document.getElementById('conf-district').value = 'Anytown';
                }
            }
        }

        function closeModal(id) {
            const modal = document.getElementById(`${id}-modal`);
            if (modal) {
                modal.style.display = 'none';
            }
        }

        function confirmOrder() {
            // In a real app, this would send the order to a backend
            console.log('Order confirmed for:', currentProduct.name, 'Quantity:', document.getElementById('qty-select').value);
            closeModal('confirm');
            showToast('Order placed successfully!');
            // Optionally redirect to an order confirmation page or clear cart
        }

        // Get constants from URL
        const urlParams = new URLSearchParams(window.location.search);
        let productId = urlParams.get('id');
        let currentProduct = null;

        // If no ID in query, try to get it from path (handle clean URLs like /product-detail/1)
        if (!productId) {
            const pathParts = window.location.pathname.split('/');
            const lastPart = pathParts[pathParts.length - 1];
            if (lastPart && !lastPart.includes('.html') && lastPart !== 'product-detail') {
                productId = lastPart;
            }
        }

        function findProduct() {
            if (!productId || productId === 'null' || productId === 'undefined') return null;

            // Priority 1: Check window.products (populated by data.js OR Firestore)
            const list = window.products || (typeof products !== 'undefined' ? products : []);
            let found = list.find(p => p && (String(p.id) === String(productId)));

            // Priority 2: Check by filename (legacy or direct access)
            if (!found) {
                const pathParts = window.location.pathname.split('/');
                const fileName = pathParts[pathParts.length - 1].toLowerCase();
                const fileId = fileName.split('.')[0];
                if (fileId && fileId !== 'product-detail' && fileId !== 'product-detail.html') {
                    found = list.find(p => p && String(p.id) === String(fileId));
                }
            }
            return found;
        }

        window.retryFindProduct = function () {
            if (currentProduct) return; // already found
            const found = findProduct();
            if (found) {
                currentProduct = found;
                renderProduct();
                renderRelated();
                console.log("✅ Product found after content/sync update");
            }
        };

        function init() {
            // If no product ID at all — show a friendly redirect message
            if (!productId || productId === 'null' || productId === 'undefined') {
                document.getElementById('product-title').innerText = "No Product Selected";
                document.body.innerHTML = `
                    <div style="text-align:center; padding: 100px 20px; font-family:'Segoe UI',sans-serif;">
                        <img src="logo.jpg" style="height:70px; margin-bottom:20px; border-radius:50%;" onerror="this.style.display='none'">
                        <h2 style="font-size:2rem; color:#1e293b;">No Product Selected</h2>
                        <p style="color:#64748b; margin: 15px 0 30px;">Please browse our store and click on a product to view its details.</p>
                        <a href="index.html" style="background:#059669; color:white; padding:14px 30px; border-radius:12px; text-decoration:none; font-weight:700; font-size:1rem;">← Browse Products</a>
                    </div>`;
                return;
            }

            // First attempt — try from data.js (already seeded into window.products)
            currentProduct = findProduct();

            if (currentProduct) {
                renderProduct();
                renderRelated();
            } else {
                // Show loading state while waiting for Firebase
                console.warn(`Product ID "${productId}" not in data.js, trying Firestore...`);
                document.getElementById('product-title').innerText = "Loading Product...";

                // Actively fetch from Firestore
                _tryFetchFromFirestore(productId);

                // Fallback timeout – show Not Found after 12 seconds
                const notFoundTimer = setTimeout(() => {
                    if (!currentProduct) {
                        document.body.innerHTML = `
                            <div style="text-align:center; padding: 100px 20px; font-family:'Segoe UI',sans-serif;">
                                <img src="logo.jpg" style="height:70px; margin-bottom:20px; border-radius:50%;" onerror="this.style.display='none'">
                                <h2 style="font-size:2rem; color:#1e293b;">Product Not Found</h2>
                                <p style="color:#64748b; margin: 15px 0 30px;">The product you're looking for is not available or may have been removed.</p>
                                <a href="index.html" style="background:#059669; color:white; padding:14px 30px; border-radius:12px; text-decoration:none; font-weight:700; font-size:1rem;">← Back to Home</a>
                            </div>`;
                    }
                }, 12000);

                // If products come in from Firestore listener, render immediately
                window._onProductsReady = () => {
                    currentProduct = findProduct();
                    if (currentProduct) {
                        clearTimeout(notFoundTimer);
                        renderProduct();
                        renderRelated();
                        updateCartCount();
                    }
                };
            }

            updateCartCount();

            // Restore user from cache
            const cached = JSON.parse(localStorage.getItem('wilson-user') || 'null');
            if (cached) {
                window.currentUser = cached;
                updateUserNav(cached);
            }
        }

        // Directly fetch this product from Firestore if window.products isn't loaded yet
        async function _tryFetchFromFirestore(id) {
            try {
                // Wait for window._db to be set by the module script (up to 5s)
                let attempts = 0;
                while (!window._db && attempts < 50) {
                    await new Promise(r => setTimeout(r, 100));
                    attempts++;
                }

                const firebaseDb = window._db;
                if (!firebaseDb) {
                    console.warn('Firestore db not available for direct product fetch');
                    return;
                }

                // Dynamically import only what we need
                const { doc, getDoc, collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

                // Try direct product fetch first (fastest)
                const snap = await getDoc(doc(firebaseDb, 'products', String(id)));
                if (snap.exists()) {
                    const data = snap.data();
                    currentProduct = { id: data.id ?? id, ...data };
                    if (!window.products) window.products = [];
                    window.products.push(currentProduct);
                    renderProduct();
                    renderRelated();
                    updateCartCount();
                    console.log('✅ Product loaded directly from Firestore');
                    return;
                }

                // If not found by direct ID, search all products
                const allSnap = await getDocs(collection(firebaseDb, 'products'));
                const allProds = [];
                allSnap.forEach(d => allProds.push({ id: d.data().id ?? d.id, ...d.data() }));
                window.products = allProds;

                // Try to find now
                currentProduct = findProduct();
                if (currentProduct) {
                    renderProduct();
                    renderRelated();
                    updateCartCount();
                } else if (typeof window._onProductsReady === 'function') {
                    window._onProductsReady();
                }

            } catch (err) {
                console.warn('Firestore fetch on product-detail failed:', err.message);
            }
        }

        function updateUserNav(user) {
            const btn = document.getElementById('login-nav-btn');
            if (!btn) return;
            if (user) {
                if (user.profilePic) {
                    btn.innerHTML = `<img src="${user.profilePic}" style="width:28px;height:28px;border-radius:50%;border:2px solid #059669;object-fit:cover;" onerror="this.outerHTML='<i class=\\'fas fa-user-check\\'></i>'">`;
                } else {
                    btn.innerHTML = `<i class="fas fa-user-check" style="color:#059669;"></i>`;
                }
            } else {
                btn.innerHTML = `<i class="fas fa-user-circle"></i>`;
            }
        }

        function handleAuthNavClick() {
            const user = window.currentUser || JSON.parse(localStorage.getItem('wilson-user') || 'null');
            if (user) {
                if (confirm(`Signed in as ${user.name || user.email}\n\nSign out?`)) {
                    if (typeof window.wilsonSignOut === 'function') window.wilsonSignOut();
                    else { localStorage.removeItem('wilson-user'); window.currentUser = null; updateUserNav(null); }
                }
            } else {
                if (typeof window.openAuthModal === 'function') window.openAuthModal();
            }
        }

        function renderProduct() {
            document.title = `${currentProduct.name} - Wilson Health Care`;
            document.getElementById('product-title').innerText = currentProduct.name;
            document.getElementById('main-product-img').src = currentProduct.image;
            document.getElementById('current-price').innerText = currentProduct.price.toLocaleString('en-IN');
            document.getElementById('buy-box-price').innerText = currentProduct.price.toLocaleString('en-IN');
            document.getElementById('mrp-display').innerHTML = `M.R.P.: <span style="text-decoration: line-through;">₹${(currentProduct.oldPrice || currentProduct.price * 1.3).toLocaleString('en-IN')}</span>`;
            document.getElementById('discount-pct').innerText = `-${currentProduct.discount || '20%'}`;
            document.getElementById('category-val').innerText = currentProduct.category;
            document.getElementById('product-desc').innerText = currentProduct.desc;

            const usageList = document.getElementById('usage-list');
            usageList.innerHTML = `<li>${currentProduct.usage || 'Professional hospital grade equipment.'}</li><li>Tested for accuracy and high performance.</li><li>1-year warranty included.</li>`;

            // Thumbs
            const thumbStrip = document.getElementById('thumb-strip');
            const allImages = [currentProduct.image, ...(currentProduct.images || [])].slice(0, 6);
            thumbStrip.innerHTML = allImages.map((img, i) => `
                <div class="thumb ${i === 0 ? 'active' : ''}" onmouseover="changeImg(this, '${img}')">
                    <img src="${img}" alt="Thumb ${i}">
                </div>
            `).join('');
        }

        function changeImg(el, src) {
            document.getElementById('main-product-img').src = src;
            document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
            el.classList.add('active');
        }

        function openTab(evt, tabName) {
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.getElementById(tabName).classList.add('active');
            evt.currentTarget.classList.add('active');
        }

        function handleAddToCart() {
            const user = window.currentUser || JSON.parse(localStorage.getItem('wilson-user') || 'null');
            if (!user) {
                showToast("Please sign in to add items to cart");
                // Open the auth modal from auth.js
                if (typeof window.openAuthModal === 'function') {
                    setTimeout(() => window.openAuthModal(), 400);
                }
                return;
            }
            let cart = JSON.parse(localStorage.getItem('wilson-cart')) || [];
            const qty = parseInt(document.getElementById('qty-select').value);
            const existing = cart.find(i => i.id === currentProduct.id);
            if (existing) {
                existing.quantity += qty;
            } else {
                cart.push({ ...currentProduct, quantity: qty, cartId: Date.now() });
            }
            localStorage.setItem('wilson-cart', JSON.stringify(cart));
            showToast(`Added ${qty} item(s) to cart! ✓`);
            updateCartCount();
        }

        function openModal(id) {
            document.getElementById(`${id}-modal`).style.display = 'flex';
        }
        function closeModal(id) {
            document.getElementById(`${id}-modal`).style.display = 'none';
        }

        function handleBuyNow() {
            const user = window.currentUser || JSON.parse(localStorage.getItem('wilson-user') || 'null');
            if (!user) {
                showToast("Please sign in first");
                if (typeof window.openAuthModal === 'function') {
                    setTimeout(() => window.openAuthModal(), 400);
                }
                return;
            }

            const qty = document.getElementById('qty-select').value;
            const preview = document.getElementById('confirm-items-preview');
            preview.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px; text-align: left;">
                    <img src="${currentProduct.image}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
                    <div style="flex: 1;">
                        <div style="font-weight: 700; color: var(--secondary); font-size: 1rem;">${currentProduct.name}</div>
                        <div style="color: var(--primary); font-weight: 600; font-size: 0.9rem;">Qty: ${qty} × Rs ${currentProduct.price.toLocaleString('en-IN')}</div>
                    </div>
                </div>
            `;

            document.getElementById('conf-name').value = user.name || '';
            document.getElementById('conf-hno').value = user.hno || '';
            document.getElementById('conf-street').value = user.street || '';
            document.getElementById('conf-pincode').value = user.pincode || '';
            document.getElementById('conf-district').value = user.district || '';

            document.querySelectorAll('.address-input').forEach(i => i.disabled = true);
            openModal('confirm');
        }

        function confirmOrder() {
            const user = window.currentUser || JSON.parse(localStorage.getItem('wilson-user') || 'null');
            const name = document.getElementById('conf-name').value.trim();
            const hno = document.getElementById('conf-hno').value.trim();
            const street = document.getElementById('conf-street').value.trim();
            const pincode = document.getElementById('conf-pincode').value.trim();
            const district = document.getElementById('conf-district').value.trim();

            if (!name || !hno || !street || !pincode || !district) {
                alert("Please fill all delivery details");
                return;
            }

            // Update user details permanently for this and future orders
            const updatedUser = { ...user, name, hno, street, pincode, district };
            window.currentUser = updatedUser;
            localStorage.setItem('wilson-user', JSON.stringify(updatedUser));

            if (typeof window._saveUserToFirestore === 'function') {
                window._saveUserToFirestore(updatedUser, null);
            }

            const updatedAddr = `${hno}, ${street}, ${district} - ${pincode}`;
            const qty = document.getElementById('qty-select').value;

            const message = `Hi Wilson Health Care, I'm booking an order:
*Product:* ${currentProduct.name}
*Quantity:* ${qty}
*Total:* Rs ${(currentProduct.price * qty).toLocaleString('en-IN')}

*Delivery Details:*
*Name:* ${name}
*Address:* ${updatedAddr}
*Contact:* ${user.mobile || 'N/A'}`;

            closeModal('confirm');
            window.open(`https://wa.me/917032687122?text=${encodeURIComponent(message)}`, '_blank');
        }

        function handleWishlist() {
            const user = window.currentUser || JSON.parse(localStorage.getItem('wilson-user') || 'null');
            if (!user) {
                showToast("Please sign in to use wishlist");
                if (typeof window.openAuthModal === 'function') setTimeout(() => window.openAuthModal(), 400);
                return;
            }
            let wishlist = JSON.parse(localStorage.getItem('wilson-wishlist')) || [];
            if (!wishlist.includes(String(currentProduct.id))) {
                wishlist.push(String(currentProduct.id));
                localStorage.setItem('wilson-wishlist', JSON.stringify(wishlist));
                showToast("Added to your wishlist! ♥");
            } else {
                showToast("Already in your wishlist!");
            }
        }

        function showToast(msg) {
            const toast = document.getElementById('toast');
            toast.innerText = msg;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        function updateCartCount() {
            const cart = JSON.parse(localStorage.getItem('wilson-cart')) || [];
            document.getElementById('cart-count').innerText = cart.length;
        }

        function renderRelated() {
            const grid = document.getElementById('related-grid');
            if (!currentProduct) return;
            const related = (window.products || []).filter(p => p.category === currentProduct.category && String(p.id) !== String(currentProduct.id)).slice(0, 5);
            grid.innerHTML = related.map(p => `
                <a href="product-detail.html?id=${p.id}" class="related-card">
                    <img src="${p.image}" alt="${p.name}">
                    <div class="related-title">${p.name}</div>
                    <div style="font-weight: 700; color: #059669; margin-top: 5px;">₹${(p.price || 0).toLocaleString('en-IN')}</div>
                </a>
            `).join('');
        }

        init();