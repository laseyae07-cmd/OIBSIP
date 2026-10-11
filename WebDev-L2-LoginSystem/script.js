const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const loginSuccess = document.getElementById('login-success');

// Already logged in? Skip the login page.
if (Auth.getCurrentUser()) window.location.replace('dashboard.html');

function showError(el, msg) { el.textContent = msg; el.style.display = 'block'; }
function clearMessages() {
    [loginError, registerError, loginSuccess].forEach(el => { el.textContent = ''; el.style.display = 'none'; });
}

function toggleForms() {
    loginForm.classList.toggle('active');
    registerForm.classList.toggle('active');
    clearMessages();
}
document.querySelectorAll('[data-toggle]').forEach(el => el.addEventListener('click', toggleForms));

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();
    const btn = registerForm.querySelector('button');
    btn.disabled = true;
    try {
        const result = await Auth.register(
            document.getElementById('reg-username').value,
            document.getElementById('reg-email').value,
            document.getElementById('reg-password').value
        );
        if (!result.ok) return showError(registerError, result.error);
        registerForm.reset();
        toggleForms();
        loginSuccess.textContent = 'Registration successful! Please log in.';
        loginSuccess.style.display = 'block';
    } finally { btn.disabled = false; }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();
    const identifier = document.getElementById('login-id').value.trim();
    const password = document.getElementById('login-password').value;
    if (!identifier || !password) return showError(loginError, 'Please fill in all fields.');

    const btn = loginForm.querySelector('button');
    btn.disabled = true;
    try {
        const result = await Auth.login(identifier, password);
        if (result.ok) window.location.href = 'dashboard.html';
        else showError(loginError, result.error);
    } finally { btn.disabled = false; }
});