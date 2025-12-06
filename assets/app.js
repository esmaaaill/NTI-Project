const ready = (fn) => document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn);

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
  initContactForm();
  initReveal();
});
