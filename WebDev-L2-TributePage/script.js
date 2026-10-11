// 1. Placeholder if malala-image.jpg is missing
const mainImage = document.getElementById('main-image');
if (mainImage) {
    mainImage.addEventListener('error', () => {
        mainImage.classList.add('image-missing');
        mainImage.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="720">' +
            '<rect width="100%" height="100%" fill="#e4edf8"/>' +
            '<text x="50%" y="50%" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#55606e">' +
            'Add malala-image.jpg to this folder</text></svg>');
    }, { once: true });
}

// 2. Expand / collapse all timeline entries
const toggleBtn = document.getElementById('toggle-all');
const items = document.querySelectorAll('.timeline-list details');
if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        const open = toggleBtn.getAttribute('aria-pressed') !== 'true';
        items.forEach(d => { d.open = open; });
        toggleBtn.setAttribute('aria-pressed', String(open));
        toggleBtn.textContent = open ? 'Collapse all' : 'Expand all';
    });
}

// 3. Highlight the nav link for the section in view
const links = document.querySelectorAll('.topnav ul a');
const sections = [...links].map(a => document.querySelector(a.getAttribute('href')));
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
        }
    });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => s && observer.observe(s));

// 4. Hamburger menu (mobile)
const menuBtn = document.getElementById('menu-toggle');
const navList = document.getElementById('nav-links');
if (menuBtn && navList) {
    const setMenu = (open) => {
        navList.classList.toggle('open', open);
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    menuBtn.addEventListener('click', () => setMenu(!navList.classList.contains('open')));
    navList.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
}

// 5. Scroll reveal (staggered) and timeline line
const revealTargets = document.querySelectorAll(
    '.glance h2, .facts > div, .biography h2, .biography h3, .biography p, ' +
    '.quote-section blockquote, .timeline-head, .section-note, .timeline-list > li, ' +
    '.message h2, .message .card, .subhead, .legacy h2, .legacy p'
);
const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
        }
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealTargets.forEach(el => {
    el.classList.add('reveal');
    const index = [...el.parentElement.children].indexOf(el);
    el.style.setProperty('--delay', Math.min(index, 5) * 0.08 + 's');
    revealObserver.observe(el);
});

const timelineList = document.querySelector('.timeline-list');
if (timelineList) revealObserver.observe(timelineList);

// 6. Reading progress bar
const progress = document.getElementById('progress');
let ticking = false;
function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    progress.style.setProperty('--p', Math.min(Math.max(p, 0), 1));
    ticking = false;
}
if (progress) {
    window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(updateProgress); ticking = true; }
    }, { passive: true });
    updateProgress();
}