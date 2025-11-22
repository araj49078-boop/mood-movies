// ====== app.js ======

// Redirect helpers
function goToLogin() { window.location.href = 'login.html'; }
function goToSignup() { window.location.href = 'signup.html'; }

// SIGNUP
function signupUser() {
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value.trim();
    if (!email || password.length < 6) return alert('Enter valid email and password (6+ chars).');

    auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
        alert('Signup successful!');
        window.location.href = 'index.html';
    })
    .catch(err => alert(err.message));
}

// LOGIN
function loginUser() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    if (!email || !password) return alert('Enter email and password.');

    auth.signInWithEmailAndPassword(email, password)
    .then(() => {
        alert('Login successful!');
        window.location.href = 'index.html';
    })
    .catch(err => alert(err.message));
}

// LOGOUT
function logoutUser() {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    });
}

// AUTH STATE (show/hide logout button)
auth.onAuthStateChanged(user => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.style.display = user ? 'inline-block' : 'none';
});

// MOVIES: load data from movies/data.json and display
async function fetchMoviesData() {
    try {
        const res = await fetch('movies/data.json');
        return await res.json();
    } catch (e) {
        console.error('Failed to load movies/data.json', e);
        return {};
    }
}

async function loadMovies(mood) {
    const data = await fetchMoviesData();
    const list = data[mood] || [];
    const container = document.getElementById('movies-container');
    if (!container) return;
    container.innerHTML = '';

    if (list.length === 0) {
        container.innerHTML = '<p style="color:#cbd5e1">No movies found for this mood.</p>';
        return;
    }

    list.forEach(m => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
            <img src="${m.poster}" alt="${m.title}" />
            <h4>${m.title}</h4>
            <p class="small">${m.info || ''}</p>
            <div class="embed-area" id="embed-${encodeURIComponent(m.title)}"></div>
            <button onclick="embedPlayer('${m.embed || ''}', '${encodeURIComponent(m.title)}')">Play (embed)</button>
        `;
        container.appendChild(card);
    });

    window.scrollTo({ top: container.offsetTop - 20, behavior: 'smooth' });
}

function showAll() {
    fetchMoviesData().then(data => {
        const container = document.getElementById('movies-container');
        container.innerHTML = '';
        for (const mood in data) {
            const header = document.createElement('h3');
            header.textContent = mood.toUpperCase();
            header.style.marginTop = '12px';
            container.appendChild(header);
            (data[mood] || []).forEach(m => {
                const card = document.createElement('div');
                card.className = 'movie-card';
                card.innerHTML = `
                    <img src="${m.poster}" alt="${m.title}" />
                    <h4>${m.title}</h4>
                    <p class="small">${m.info || ''}</p>
                    <button onclick="embedPlayer('${m.embed || ''}', '${encodeURIComponent(m.title)}')">Play (embed)</button>
                    <div class="embed-area" id="embed-${encodeURIComponent(m.title)}"></div>
                `;
                container.appendChild(card);
            });
        }
    });
}

// Embeds a player URL into the card's embed-area (if embed URL exists)
function embedPlayer(embedUrl, encodedTitle) {
    if (!embedUrl) return alert('Embed link not provided for this movie.');
    const id = 'embed-' + encodedTitle;
    const holder = document.getElementById(id);
    if (!holder) return;
    holder.innerHTML = `<iframe src="${embedUrl}" width="100%" height="360" frameborder="0" allowfullscreen></iframe>`;
}
