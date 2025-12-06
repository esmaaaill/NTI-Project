const ready = (fn) => document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn);

// ---------- API + auth helpers ----------
const API_BASE = `${window.location.origin}/api`;

// Read and write auth tokens to localStorage so the UI can remember sessions between refreshes.
const authStore = {
  get token() {
    return localStorage.getItem('qs_token');
  },
  set token(value) {
    if (value) {
      localStorage.setItem('qs_token', value);
    } else {
      localStorage.removeItem('qs_token');
    }
  },
};

// Display feedback inside a target element with a consistent style.
const setStatus = (el, message, isError = false) => {
  if (!el) return;
  el.textContent = message;
  el.className = `form-status ${isError ? 'error' : 'success'}`;
};

// Fetch wrapper used by the auth flows so error messages can be surfaced cleanly.
const postJson = async (path, payload) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

const initSearchForm = () => {
  const form = document.querySelector('#searchForm');
  const output = document.querySelector('#searchResults');
  if (!form || !output) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const destination = form.location.value.trim();
    const guests = form.guests.value;
    const checkIn = form.checkin.value;
    const checkOut = form.checkout.value;

    if (!destination || !guests || !checkIn || !checkOut) {
      output.textContent = 'Please fill in all fields to start your search.';
      output.className = 'error';
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      output.textContent = 'Check-out date must be after check-in.';
      output.className = 'error';
      return;
    }

    output.textContent = `Searching stays in ${destination} for ${guests} guest(s) from ${checkIn} to ${checkOut}...`;
    output.className = 'success search-results';
  });
};

const initCarousel = () => {
  const carousel = document.querySelector('.carousel');
  if (!carousel) return;
  const images = Array.from(carousel.querySelectorAll('[data-slide]'));
  const next = carousel.querySelector('.next');
  const prev = carousel.querySelector('.prev');
  let index = 0;

  const update = () => {
    images.forEach((img, i) => {
      img.style.display = i === index ? 'block' : 'none';
    });
  };

  next?.addEventListener('click', () => {
    index = (index + 1) % images.length;
    update();
  });

  prev?.addEventListener('click', () => {
    index = (index - 1 + images.length) % images.length;
    update();
  });

  update();
};

const initBookingForm = () => {
  const form = document.querySelector('#bookingForm');
  const summary = document.querySelector('#bookingSummary');
  if (!form || !summary) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const errors = [];

    if (!data.name || data.name.trim().length < 2) errors.push('Name is required.');
    if (!data.email.includes('@')) errors.push('Valid email is required.');
    if (!data.checkin || !data.checkout) errors.push('Check-in and check-out are required.');
    if (data.checkin && data.checkout && new Date(data.checkout) <= new Date(data.checkin)) {
      errors.push('Check-out must be after check-in.');
    }
    if (!data.room) errors.push('Please choose a room type.');

    if (errors.length) {
      summary.innerHTML = `<p class="error">${errors.join(' ')}</p>`;
      return;
    }

    summary.innerHTML = `
      <p class="success">Reservation ready!</p>
      <div class="card">
        <div class="card-body">
          <div class="summary-row"><span>Guest</span><strong>${data.name}</strong></div>
          <div class="summary-row"><span>Stay</span><strong>${data.checkin} → ${data.checkout}</strong></div>
          <div class="summary-row"><span>Room</span><strong>${data.room}</strong></div>
          <div class="summary-row"><span>Payment</span><strong>${data.payment || 'On file'}</strong></div>
        </div>
      </div>
    `;
  });
};

// Enable sign up, login, token verification, and logout actions against the demo backend.
const initAuthFlows = () => {
  const signupForm = document.querySelector('#signupForm');
  const loginForm = document.querySelector('#loginForm');
  const signupStatus = document.querySelector('#signupStatus');
  const loginStatus = document.querySelector('#loginStatus');
  const authStatus = document.querySelector('#authStatus');
  const profileDetails = document.querySelector('#profileDetails');
  const tokenStatus = document.querySelector('#tokenStatus');
  const checkTokenBtn = document.querySelector('#checkToken');
  const logoutBtn = document.querySelector('#logoutBtn');

  if (!signupForm || !loginForm || !authStatus) return;

  const renderProfile = (user) => {
    if (!user) {
      profileDetails.innerHTML = '';
      authStatus.textContent = 'No account connected yet.';
      tokenStatus.textContent = 'Token not requested';
      return;
    }

    authStatus.textContent = `Signed in as ${user.name}`;
    profileDetails.innerHTML = `
      <div class="summary-row"><span>Email</span><strong>${user.email}</strong></div>
      <div class="summary-row"><span>User ID</span><strong>${user.id}</strong></div>
    `;
  };

  const verifyToken = async () => {
    if (!authStore.token) {
      tokenStatus.textContent = 'No token saved yet.';
      tokenStatus.className = 'tag error';
      return;
    }
    tokenStatus.textContent = 'Checking token…';
    tokenStatus.className = 'tag';
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${authStore.token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Token check failed');
      tokenStatus.textContent = data.message;
      tokenStatus.className = 'tag success';
      renderProfile(data.user);
    } catch (error) {
      tokenStatus.textContent = error.message;
      tokenStatus.className = 'tag error';
    }
  };

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatus(signupStatus, 'Creating your account…');
    try {
      const payload = Object.fromEntries(new FormData(signupForm));
      const data = await postJson('/auth/signup', payload);
      setStatus(signupStatus, data.message, false);
      authStore.token = data.token;
      renderProfile(data.user);
      signupForm.reset();
      verifyToken();
    } catch (error) {
      setStatus(signupStatus, error.message, true);
    }
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatus(loginStatus, 'Signing you in…');
    try {
      const payload = Object.fromEntries(new FormData(loginForm));
      const data = await postJson('/auth/login', payload);
      setStatus(loginStatus, data.message, false);
      authStore.token = data.token;
      renderProfile(data.user);
      loginForm.reset();
      verifyToken();
    } catch (error) {
      setStatus(loginStatus, error.message, true);
    }
  });

  checkTokenBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    verifyToken();
  });

  logoutBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    authStore.token = null;
    renderProfile(null);
    setStatus(loginStatus, 'Logged out.', false);
    setStatus(signupStatus, '', false);
    tokenStatus.textContent = 'Token cleared';
    tokenStatus.className = 'tag';
  });

  // Auto-verify on load if we already have a token saved.
  if (authStore.token) {
    verifyToken();
  }
};

const initContactForm = () => {
  const form = document.querySelector('#contactForm');
  const status = document.querySelector('#contactStatus');
  if (!form || !status) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const { name, email, message } = Object.fromEntries(new FormData(form));
    if (!name.trim() || !email.includes('@') || !message.trim()) {
      status.textContent = 'Please complete all fields with valid details.';
      status.className = 'error';
      return;
    }

    status.textContent = 'Message sent! Our team will respond shortly.';
    status.className = 'success';
    form.reset();
  });
};

const initReveal = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  document.querySelectorAll('[data-reveal]').forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    observer.observe(el);
  });

  const style = document.createElement('style');
  style.textContent = '.revealed{opacity:1!important;transform:translateY(0)!important;}';
  document.head.appendChild(style);
};

ready(() => {
  initSearchForm();
  initCarousel();
  initBookingForm();
  initAuthFlows();
  initContactForm();
  initReveal();
});
