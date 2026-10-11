const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');

// Toggle between Login and Register forms
function toggleForms() {
    loginForm.classList.toggle('active');
    registerForm.classList.toggle('active');
    loginError.style.display = 'none';
    registerError.style.display = 'none';
}

// Utility: Hash passwords using Web Crypto API (SHA-256)
async function hashPassword(password) {
    const msgUint8 = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Utility: Show error messages
function showError(element, message) {
    element.innerText = message;
    element.style.display = 'block';
}

// Handle Registration
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;

    // Validate Password: min 8 chars, at least 1 number
    const passwordRegex = /^(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
        showError(registerError, "Password must be at least 8 characters long and contain at least one number.");
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Check for duplicate username or email
    if (users.some(user => user.email === email || user.username === username)) {
        showError(registerError, "Username or Email already exists.");
        return;
    }

    // Hash password and save user
    const hashedPassword = await hashPassword(password);
    users.push({ username, email, password: hashedPassword });
    localStorage.setItem('users', JSON.stringify(users));

    alert("Registration successful! Please login.");
    registerForm.reset();
    toggleForms();
});

// Handle Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    let users = JSON.parse(localStorage.getItem('users')) || [];
    const hashedPassword = await hashPassword(password);

    // Verify credentials
    const user = users.find(u => u.email === email && u.password === hashedPassword);

    if (user) {
        // Set active session and redirect to dashboard
        localStorage.setItem('activeSession', user.email);
        window.location.href = 'dashboard.html';
    } else {
        // Generic error message for incorrect credentials (does not reveal if email or password was wrong)
        showError(loginError, "Invalid email or password.");
    }
});