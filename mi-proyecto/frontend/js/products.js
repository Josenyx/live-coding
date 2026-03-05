const products = [
    { id: 1, name: "RTX 4070", price: 650, description: "Tarjeta gráfica gaming", image: "https://via.placeholder.com/300" },
    { id: 2, name: "Teclado Mecánico RGB", price: 120, description: "Switches rojos", image: "https://via.placeholder.com/300" },
    { id: 3, name: "Monitor 144Hz", price: 220, description: "Monitor gamer", image: "https://via.placeholder.com/300" },
    { id: 4, name: "Microondas Smart", price: 80, description: "Electrodoméstico moderno", image: "https://via.placeholder.com/300" },
    { id: 5, name: "SSD 1TB NVMe", price: 130, description: "Almacenamiento rápido", image: "https://via.placeholder.com/300" }
];

const container = document.getElementById("product-list");

// ============================
// TOAST
// ============================
function showToast(message) {
    const containerToast = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = "toast-msg";
    toast.textContent = message;
    containerToast.appendChild(toast);
    setTimeout(() => { toast.classList.add("show"); }, 100);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => { toast.remove(); }, 400);
    }, 3000);
}

// ============================
// CARRITO — localStorage
// ============================
const DISCOUNT_CODES = {
    "NOVATECH10": 10,
    "GAMER20": 20,
    "WELCOME5": 5
};

let appliedDiscount = 0;

function getCart() {
    return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(product) {
    const cart = getCart();
    cart.push({ id: product.id, name: product.name, price: product.price });
    saveCart(cart);
    updateCartBadge();
}

function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    updateCartBadge();
    renderCartDrawer();
}

function updateCartBadge() {
    const cart = getCart();
    const badge = document.getElementById("cart-badge");
    if (!badge) return;
    if (cart.length > 0) {
        badge.textContent = cart.length;
        badge.classList.remove("d-none");
    } else {
        badge.classList.add("d-none");
    }
}

function renderCartDrawer() {
    const cart = getCart();
    const list = document.getElementById("cart-items-list");
    const countEl = document.getElementById("cart-count");
    const totalEl = document.getElementById("cart-total");
    if (!list) return;

    if (cart.length === 0) {
        let emptyStr = window.t ? window.t("cart_empty") : "Tu carrito está vacío 🛒";
        let emptySub = window.t ? window.t("cart_empty_sub") : "Añade productos para empezar.";
        list.innerHTML = `<p class="cart-empty-msg">${emptyStr}<br><span style="font-size:0.8rem;color:#555;">${emptySub}</span></p>`;
        if (countEl) countEl.textContent = "0";
        if (totalEl) totalEl.textContent = "0.00";
        updateTotals(0);
        return;
    }

    let subtotal = 0;
    let removeText = window.t ? window.t("remove_item") : "Eliminar";

    list.innerHTML = cart.map((item, index) => {
        subtotal += item.price;
        return `
            <div class="cart-item-row">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                </div>
                <span class="cart-item-price">${item.price.toFixed(2)} €</span>
                <button class="cart-item-remove" onclick="removeFromCart(${index})" title="${removeText}">✕</button>
            </div>
        `;
    }).join("");

    if (countEl) countEl.textContent = cart.length;
    updateTotals(subtotal);
}

function updateTotals(subtotal) {
    const totalEl = document.getElementById("cart-total");
    if (!totalEl) return;
    const discount = appliedDiscount;
    const finalTotal = Math.max(0, subtotal - (subtotal * discount / 100));
    totalEl.textContent = finalTotal.toFixed(2);
}

// ============================
// DRAWER — abrir / cerrar
// ============================
function openCartDrawer() {
    renderCartDrawer();
    document.getElementById("cart-drawer").classList.add("open");
    document.getElementById("cart-drawer-overlay").classList.add("open");
}

function closeCartDrawer() {
    document.getElementById("cart-drawer").classList.remove("open");
    document.getElementById("cart-drawer-overlay").classList.remove("open");
}

document.addEventListener("DOMContentLoaded", () => {
    updateCartBadge();

    // Botón carrito navbar
    const cartBtn = document.getElementById("cartBtn");
    if (cartBtn) {
        cartBtn.addEventListener("click", openCartDrawer);
    }

    // Cerrar con X o con overlay
    document.getElementById("closeCartDrawer").addEventListener("click", closeCartDrawer);
    document.getElementById("cart-drawer-overlay").addEventListener("click", closeCartDrawer);

    // ---- AUTO-FORMATO CÓDIGO DESCUENTO (XXXX-XXXX-XXXX, máx 12 alfanuméricos) ----
    const discountInput = document.getElementById("discount-code");
    discountInput.addEventListener("input", (e) => {
        let raw = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 12);
        let formatted = raw.match(/.{1,4}/g)?.join("-") || "";
        e.target.value = formatted;
    });

    // Descuento — aplicar
    document.getElementById("applyDiscount").addEventListener("click", () => {
        const code = discountInput.value.replace(/-/g, "").trim().toUpperCase();
        const msgEl = document.getElementById("discount-msg");
        msgEl.classList.remove("d-none", "ok", "error");

        if (DISCOUNT_CODES[code] !== undefined) {
            appliedDiscount = DISCOUNT_CODES[code];
            msgEl.textContent = window.t ? window.t("msg_discount_ok", { amount: appliedDiscount }) : `✅ Código aplicado — ${appliedDiscount}% de descuento`;
            msgEl.classList.add("ok");
            renderCartDrawer();
        } else {
            appliedDiscount = 0;
            msgEl.textContent = window.t ? window.t("msg_discount_err") : `❌ Código no válido.`;
            msgEl.classList.add("error");
            renderCartDrawer();
        }

        msgEl.classList.remove("d-none");
    });

    // ---- BOTÓN PROCEDER AL PAGO: abrir modal de envío ----
    document.getElementById("checkoutBtn").addEventListener("click", () => {
        const cart = getCart();
        if (cart.length === 0) {
            showToast(window.t ? window.t("msg_cart_empty_toast") : "Tu carrito está vacío.");
            return;
        }
        document.getElementById("shipping-error").classList.add("d-none");
        document.getElementById("shippingForm").reset();
        document.getElementById("shipping-modal").classList.add("show");
    });

    // Cerrar modal envío
    document.getElementById("closeShippingModal").addEventListener("click", () => {
        document.getElementById("shipping-modal").classList.remove("show");
    });
    document.getElementById("shipping-modal").addEventListener("click", (e) => {
        if (e.target.id === "shipping-modal") {
            document.getElementById("shipping-modal").classList.remove("show");
        }
    });

    // ---- CONFIRMAR PEDIDO ----
    document.getElementById("shippingForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const nombre = document.getElementById("sh-nombre").value.trim();
        const apellidos = document.getElementById("sh-apellidos").value.trim();
        const direccion = document.getElementById("sh-direccion").value.trim();
        const ciudad = document.getElementById("sh-ciudad").value.trim();
        const provincia = document.getElementById("sh-provincia").value.trim();
        const pais = document.getElementById("sh-pais").value.trim();

        if (!nombre || !apellidos || !direccion || !ciudad || !provincia || !pais) {
            const err = document.getElementById("shipping-error");
            err.textContent = window.t ? window.t("msg_shipping_err") : "Por favor, completa todos los campos.";
            err.classList.remove("d-none");
            return;
        }

        const method = document.querySelector("input[name='payment']:checked")?.value || "card";
        const methodLabel = {
            card: window.t ? window.t("pay_card") : "Tarjeta de crédito",
            paypal: window.t ? window.t("pay_paypal") : "PayPal",
            crypto: window.t ? window.t("pay_crypto") : "Crypto"
        }[method];

        let msg = window.t ? window.t("msg_order_ok", { name: `${nombre} ${apellidos}`, method: methodLabel }) : `✅ Pedido confirmado para ${nombre} ${apellidos} con ${methodLabel}. ¡Gracias!`;
        showToast(msg);

        localStorage.removeItem("cart");
        appliedDiscount = 0;
        discountInput.value = "";
        document.getElementById("discount-msg").classList.add("d-none");
        updateCartBadge();
        document.getElementById("shipping-modal").classList.remove("show");
        closeCartDrawer();
    });
});

// ============================
// GENERAR CARDS DE PRODUCTOS
// ============================
products.forEach(p => {
    const card = document.createElement("div");
    card.className = "col-md-4";
    let btnText = window.t ? window.t("add_to_cart") : "Añadir al carrito";

    // Necesitamos asegurarnos de que los productos se re-renderizan si cambia el idioma, 
    // pero para hacerlo simple usaremos un data-lang en el botón
    card.innerHTML = `
    <div class="card mb-4">
      <img src="${p.image}" class="card-img-top">
      <div class="card-body">
        <h5>${p.name}</h5>
        <p>${p.description}</p>
        <p class="price">${p.price} €</p>
        <button class="btn btn-outline-light w-100 add-cart" data-lang="add_to_cart">${btnText}</button>
      </div>
    </div>
  `;
    container.appendChild(card);

    card.querySelector(".add-cart").addEventListener("click", () => {
        const session = localStorage.getItem("userEmail");
        if (!session) {
            showToast(window.t ? window.t("msg_err_login_cart") : "Inicia sesión para añadir productos al carrito 🔒");
            return;
        }
        addToCart(p);
        let toastMsg = window.t ? window.t("msg_cart_added", { name: p.name }) : `"${p.name}" añadido al carrito 🛒`;
        showToast(toastMsg);
    });
});