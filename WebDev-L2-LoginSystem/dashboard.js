const user = Auth.getCurrentUser();
if (!user) {
    window.location.replace('index.html'); // no valid session -> back to login
} else {
    document.getElementById('welcome-name').textContent = user.username;
    document.getElementById('welcome-email').textContent = user.email;
    document.body.classList.add('ready'); // reveal page only once verified
}

document.getElementById('logout-btn').addEventListener('click', () => {
    Auth.logout();
    window.location.replace('index.html');
});