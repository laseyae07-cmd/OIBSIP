# Login Authentication System

Front-end only (Approach A): HTML / CSS / JavaScript + `localStorage`.

## Files
| File | Purpose |
|---|---|
| `index.html` | Login + Registration forms |
| `dashboard.html` | Protected page |
| `auth.js` | Shared logic: registration, login, hashing, sessions |
| `script.js` | Login/register page behavior |
| `dashboard.js` | Session guard + logout |
| `style.css` | Styling |

## Features
- Register with username, email and password
- Password rule: min 8 characters, at least 1 number
- Duplicate username/email check (case-insensitive)
- Login with username **or** email
- Generic error on bad credentials (doesn't reveal which field was wrong)
- Dashboard redirects to login without a valid session
- Logout clears the session and redirects to login
- Passwords hashed with salted PBKDF2-SHA256 (Web Crypto API) — never stored in plain text
- Empty/invalid submissions blocked on both forms
- 30-minute session expiry

## Run
Open `index.html` via a local server (e.g. VS Code Live Server or `python -m http.server`).
Web Crypto requires a secure context (`localhost` or HTTPS).

## Limitations
`localStorage` is visible to anyone using the browser, so this is a learning demo. Real apps should
authenticate on a server (e.g. Node/Express + bcrypt + HttpOnly session cookies — see MDN: "Cookies and sessions").