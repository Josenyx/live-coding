// ========================
// UTILIDADES DE USUARIOS
// ========================
function getUsers() {
    return JSON.parse(localStorage.getItem("users") || "[]");
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function getSession() {
    return localStorage.getItem("userEmail");
}

function setSession(email) {
    localStorage.setItem("userEmail", email);
}

function clearSession() {
    localStorage.removeItem("userEmail");
}

// ========================
// ACTUALIZAR UI (logueado / no logueado)
// ========================
function updateUI() {
    const email = getSession();
    const navLoginBtn = document.getElementById("navLoginBtn");
    const userInfo = document.getElementById("user-info");
    const userEmailSpan = document.getElementById("user-email");
    const cartBtn = document.getElementById("cartBtn");

    if (email) {
        if (navLoginBtn) navLoginBtn.classList.add("d-none");
        if (userInfo) userInfo.classList.remove("d-none");
        if (userEmailSpan) userEmailSpan.textContent = email;
        if (cartBtn) cartBtn.classList.remove("d-none");
    } else {
        if (navLoginBtn) navLoginBtn.classList.remove("d-none");
        if (userInfo) userInfo.classList.add("d-none");
        if (userEmailSpan) userEmailSpan.textContent = "";
        if (cartBtn) cartBtn.classList.add("d-none");
    }
}

document.addEventListener("DOMContentLoaded", updateUI);

// ========================
// CERRAR SESIÓN
// ========================
const navLogoutBtn = document.getElementById("navLogoutBtn");
if (navLogoutBtn) {
    navLogoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        clearSession();
        // Recargar traducciones si cambia de vista? Aquí solo mostramos toast
        showToast(window.t("msg_logout"));
        updateUI();
    });
}

// ========================
// HELPERS DE MODALES
// ========================
const loginError = document.getElementById("login-error");

function showModalError(el, msg) {
    el.textContent = msg;
    el.classList.remove("d-none");
}

function hideError(el) {
    el.classList.add("d-none");
}

// Abrir / cerrar modal Login
const navLoginBtn = document.getElementById("navLoginBtn");
if (navLoginBtn) {
    navLoginBtn.addEventListener("click", (e) => {
        e.preventDefault();
        hideError(loginError);
        document.getElementById("loginFormModal").reset();
        document.getElementById("login-modal").classList.add("show");
    });
}

document.getElementById("closeModal").addEventListener("click", () => {
    hideError(loginError);
    document.getElementById("loginFormModal").reset();
    document.getElementById("login-modal").classList.remove("show");
});

document.getElementById("login-modal").addEventListener("click", (e) => {
    if (e.target.id === "login-modal") {
        hideError(loginError);
        document.getElementById("loginFormModal").reset();
        document.getElementById("login-modal").classList.remove("show");
    }
});

// Cambiar entre Login y Registro
document.getElementById("showRegisterModal").addEventListener("click", (e) => {
    e.preventDefault();
    hideError(loginError);
    document.getElementById("loginFormModal").reset();
    document.getElementById("login-modal").classList.remove("show");
    document.getElementById("register-modal").classList.add("show");
});

const registerError = document.getElementById("register-error");

document.getElementById("showLoginModal").addEventListener("click", (e) => {
    e.preventDefault();
    hideError(registerError);
    document.getElementById("registerFormModal").reset();
    document.getElementById("register-modal").classList.remove("show");
    document.getElementById("login-modal").classList.add("show");
});

document.getElementById("closeRegisterModal").addEventListener("click", () => {
    hideError(registerError);
    document.getElementById("registerFormModal").reset();
    document.getElementById("register-modal").classList.remove("show");
});

document.getElementById("register-modal").addEventListener("click", (e) => {
    if (e.target.id === "register-modal") {
        hideError(registerError);
        document.getElementById("registerFormModal").reset();
        document.getElementById("register-modal").classList.remove("show");
    }
});

// ========================
// LOGIN FORM
// ========================
const loginFormModal = document.getElementById("loginFormModal");
loginFormModal.addEventListener("submit", (e) => {
    e.preventDefault();
    hideError(loginError);

    const email = document.getElementById("modalEmail").value.trim();
    const password = document.getElementById("modalPassword").value;
    const users = getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        showModalError(loginError, window.t("msg_err_not_exist"));
        return;
    }

    if (user.password !== password) {
        showModalError(loginError, window.t("msg_err_wrong_pass"));
        return;
    }

    // Login correcto
    setSession(email);
    showToast(window.t("msg_login_ok"));
    document.getElementById("loginFormModal").reset();
    document.getElementById("login-modal").classList.remove("show");
    updateUI();
});

// ========================
// REGISTER FORM
// ========================
const registerFormModal = document.getElementById("registerFormModal");

if (registerFormModal) {
    registerFormModal.addEventListener("submit", (e) => {
        e.preventDefault();
        hideError(registerError);

        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("registerConfirmPassword").value;

        // Validar formato del correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showModalError(registerError, window.t("msg_err_email_format"));
            return;
        }

        // Validar contraseña paso a paso
        if (password.length < 8) {
            showModalError(registerError, window.t("msg_err_pass_length"));
            return;
        }
        if (!/[A-Z]/.test(password)) {
            showModalError(registerError, window.t("msg_err_pass_upper"));
            return;
        }
        if (!/[a-z]/.test(password)) {
            showModalError(registerError, window.t("msg_err_pass_lower"));
            return;
        }
        if (!/\d/.test(password)) {
            showModalError(registerError, window.t("msg_err_pass_number"));
            return;
        }

        if (password !== confirmPassword) {
            showModalError(registerError, window.t("msg_err_pass_match"));
            return;
        }

        // Comprobar si ya existe esa cuenta
        const users = getUsers();
        if (users.find(u => u.email === email)) {
            showModalError(registerError, window.t("msg_err_account_exists"));
            return;
        }

        // Guardar usuario y arrancar sesión
        users.push({ email, password });
        saveUsers(users);
        setSession(email);

        showToast(window.t("msg_register_ok"));
        document.getElementById("registerFormModal").reset();
        document.getElementById("register-modal").classList.remove("show");
        updateUI();
    });
}