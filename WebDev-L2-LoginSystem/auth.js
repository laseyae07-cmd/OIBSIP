/* Shared auth helpers (used by index.html and dashboard.html).
   NOTE: client-side only — fine for a learning project, not for production. */
const Auth = (() => {
    const USERS_KEY = 'users';
    const SESSION_KEY = 'activeSession';
    const SESSION_TTL = 30 * 60 * 1000; // 30 minutes
    const PBKDF2_ITERATIONS = 100000;

    const getUsers = () => {
        try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
        catch { return []; }
    };
    const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const toHex = (buf) => Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, '0')).join('');
    const fromHex = (hex) => new Uint8Array(hex.match(/.{2}/g).map(h => parseInt(h, 16)));

    // Salted PBKDF2-SHA256 (much stronger than a bare SHA-256)
    async function hashPassword(password, saltHex) {
        const salt = saltHex ? fromHex(saltHex) : crypto.getRandomValues(new Uint8Array(16));
        const key = await crypto.subtle.importKey(
            'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
        const bits = await crypto.subtle.deriveBits(
            { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' }, key, 256);
        return { hash: toHex(bits), salt: toHex(salt) };
    }

    // Legacy format from the old version: plain unsalted SHA-256
    async function legacySha256(password) {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
        return toHex(buf);
    }

    function validate({ username, email, password }) {
        if (!username || username.length < 3) return 'Username must be at least 3 characters.';
        if (!/^[A-Za-z0-9_.-]+$/.test(username)) return 'Username may only contain letters, numbers, . _ -';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
        if (!/^(?=.*\d).{8,}$/.test(password)) return 'Password must be at least 8 characters long and contain at least one number.';
        return null;
    }

    async function register(username, email, password) {
        username = username.trim();
        email = email.trim().toLowerCase();

        const error = validate({ username, email, password });
        if (error) return { ok: false, error };

        const users = getUsers();
        if (users.some(u => u.email === email || u.username.toLowerCase() === username.toLowerCase())) {
            return { ok: false, error: 'Username or Email already exists.' };
        }

        const { hash, salt } = await hashPassword(password);
        users.push({ username, email, password: hash, salt });
        saveUsers(users);
        return { ok: true };
    }

    // identifier = email OR username
    async function login(identifier, password) {
        const id = identifier.trim().toLowerCase();
        const users = getUsers();
        const user = users.find(u => u.email === id || u.username.toLowerCase() === id);
        const GENERIC = { ok: false, error: 'Invalid username/email or password.' }; // never reveal which is wrong

        if (!user) return GENERIC;

        let valid = false;
        if (user.salt) {
            valid = (await hashPassword(password, user.salt)).hash === user.password;
        } else {
            // Legacy account: verify old hash, then upgrade to salted PBKDF2
            valid = (await legacySha256(password)) === user.password;
            if (valid) {
                const upgraded = await hashPassword(password);
                user.password = upgraded.hash;
                user.salt = upgraded.salt;
                saveUsers(users);
            }
        }
        if (!valid) return GENERIC;

        const token = toHex(crypto.getRandomValues(new Uint8Array(16)));
        localStorage.setItem(SESSION_KEY, JSON.stringify({
            email: user.email, token, expires: Date.now() + SESSION_TTL
        }));
        return { ok: true };
    }

    // Returns the logged-in user, or null. Rejects forged/expired sessions.
    function getCurrentUser() {
        try {
            const s = JSON.parse(localStorage.getItem(SESSION_KEY));
            if (!s || !s.token || !s.email || Date.now() > s.expires) return null;
            return getUsers().find(u => u.email === s.email) || null;
        } catch { return null; }
    }

    const logout = () => localStorage.removeItem(SESSION_KEY);

    return { register, login, logout, getCurrentUser };
})();