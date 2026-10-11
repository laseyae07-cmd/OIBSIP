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