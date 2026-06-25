// =============================================
// DOM ELEMENTS
// =============================================
const nav = document.getElementById("nav");
const cuisineDropdown = document.getElementById("cuisine-filter");
const menuSearch = document.getElementById("menu-search");
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav-link");
const heroBg = document.getElementById("heroBg");
const reservationBg = document.getElementById("reservationBg");
const reservationForm = document.getElementById("reservationForm");
const dateInput = document.getElementById("reservation-date");
const timeSelect = document.getElementById("time");
const themeToggle = document.getElementById("themeToggle");

// ── Device detection ───
const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

// ── FIX #9 — show correct scroll hint based on input type ────────
const scrollHintMouse = document.querySelector('.scroll-hint-mouse');
const scrollHintTouch = document.querySelector('.scroll-hint-touch');

if (scrollHintMouse && scrollHintTouch) {
  scrollHintMouse.style.display = isTouchDevice ? 'none' : '';
  scrollHintTouch.style.display = isTouchDevice ? '' : 'none';
}

// ── FIX #13 — Date validation: min = tomorrow, max = 90 days out ─────
if (dateInput) {
  const tomorrow = new Date(Date.now() + 86400000);
  const maxDate = new Date(Date.now() + 90 * 86400000);

  dateInput.setAttribute('min', tomorrow.toISOString().split('T')[0]);
  dateInput.setAttribute('max', maxDate.toISOString().split('T')[0]);

  dateInput.addEventListener('change', updateAvailableTimes);
}

// ── FIX #11 — Disable past time slots when today is selected ─────
function updateAvailableTimes() {
  if (!dateInput || !timeSelect) return;

  const selectedDate = dateInput.value;
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentHours = now.getHours();
  const currentMins = now.getMinutes();

  timeSelect.querySelectorAll('option').forEach((option) => {
    if (!option.value) return;

    const [optHours, optMins] = option.value.split(':').map(Number);
    const isPastToday =
      selectedDate === todayStr &&
      (optHours < currentHours || (optHours === currentHours && optMins <= currentMins));

    option.disabled = isPastToday;
  });

  if (timeSelect.value && timeSelect.selectedOptions[0]?.disabled) {
    timeSelect.value = '';
  }
}

function filterMenuItems(timeFilter, cuisineFilter, searchText) {
  const menuItems = document.querySelectorAll(".menu-item");
  let visibleCount = 0;

  menuItems.forEach((item) => {
    const itemName = item.querySelector('h3')?.textContent?.toLowerCase() || '';
    const category = item.dataset.category;
    const matchesSearch = itemName.includes(searchText.toLowerCase());
    const matchesFilter = filter === 'all' || category === filter;

    if (matchesSearch && matchesFilter) {
      item.classList.remove('hidden-item');
      visibleCount++;
    } else {
      item.classList.add('hidden-item');
    }
  });

  // Handle "No Results" display
  let noResults = document.querySelector(".no-results");
  if (visibleCount === 0) {
    if (!noResults) {
      noResults = document.createElement('p');
      noResults.className = 'no-results';
      noResults.textContent = 'No menu items found.';
      document.querySelector('.menu-content')?.appendChild(noResults);
    }
  } else if (noResults) {
    noResults.remove();
  }
}
function triggerFilter() {
  const activeBtn = document.querySelector(".filter-btn.active");
  const timeFilter = activeBtn ? activeBtn.dataset.filter : "all";
  const cuisineFilter = cuisineDropdown ? cuisineDropdown.value : "all";
  const searchText = menuSearch ? menuSearch.value : "";
  
  filterMenuItems(timeFilter, cuisineFilter, searchText);
}
if (cuisineDropdown) {
  cuisineDropdown.addEventListener("change", triggerFilter);
}

if (menuSearch) {
  menuSearch.addEventListener("input", triggerFilter);
}
// Filter buttons
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));

    btn.classList.add("active");
    triggerFilter();

    
  });
});

if (menuSearch) {
  menuSearch.addEventListener('input', () => {
    const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    filterMenuItems(activeFilter, menuSearch.value);
  });
}

 

// Smooth scroll for navigation links
function smoothScroll(e) {
  e.preventDefault();
  const targetId = this.getAttribute('href');
  const targetSection = document.querySelector(targetId);

  if (targetSection) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: targetSection.offsetTop - 80,
      behavior: prefersReduced ? 'auto' : 'smooth',
    });
  }
  closeMobileMenu();
}
// ── Reservation form submission ──
function handleFormSubmit(e) {
  e.preventDefault();

  const inputs = reservationForm.querySelectorAll('input, select, textarea');
  let isValid = true;

  inputs.forEach((input) => {
    if (input.required && !input.value) {
      input.style.borderColor = '#c94a4a';
      isValid = false;
    } else {
      input.style.borderColor = '';
    }
  });

  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');

  // Remove old error messages
  document.querySelectorAll('.error-message').forEach(el => el.remove());

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailInput && !emailRegex.test(emailInput.value.trim())) {
    emailInput.style.borderColor = '#c94a4a';
    const emailError = document.createElement('small');
    emailError.className = 'error-message';
    emailError.style.color = '#c94a4a';
    emailError.textContent = 'Please enter a valid email address.';
    emailInput.parentElement.appendChild(emailError);
    isValid = false;
  }

  // Phone validation
  if (phoneInput) {
    const phoneValue = phoneInput.value.replace(/\D/g, '');
    if (phoneValue.length !== 10) {
      phoneInput.style.borderColor = '#c94a4a';
      const phoneError = document.createElement('small');
      phoneError.className = 'error-message';
      phoneError.style.color = '#c94a4a';
      phoneError.textContent = 'Phone number must contain exactly 10 digits.';
      phoneInput.parentElement.appendChild(phoneError);
      isValid = false;
    }
  }

  if (isValid) {
    const submitBtn = reservationForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Reservation Requested!';
    submitBtn.style.backgroundColor = '#4a9c6a';
    submitBtn.disabled = true;

    setTimeout(() => {
      reservationForm.reset();
      updateAvailableTimes();
      submitBtn.textContent = originalText;
      submitBtn.style.backgroundColor = '';
      submitBtn.disabled = false;
      updateAvailableTimes();
    }, 3000);
  }
}

// ── Intersection Observer with prefers-reduced-motion ──────
function setupIntersectionObserver() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animatedElements = document.querySelectorAll(
    '.about-content, .menu-panel, .reservation-form, .location-info'
  );

  if (prefersReduced) {
    animatedElements.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { root: null, rootMargin: '0px', threshold: 0.1 }
  );

  animatedElements.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// Inject .visible class styles
const style = document.createElement('style');
style.textContent = `.visible { opacity: 1 !important; transform: translateY(0) !important; }`;
document.head.appendChild(style);

// ── Auto-scroll on hero "Scroll To Discover" click ───
const heroScroll = document.querySelector('.hero-scroll');
let autoScrollInterval = null;

function startAutoScroll() {
  autoScrollInterval = setInterval(() => {
    window.scrollBy({ top: 2, behavior: 'instant' });
    if (window.scrollY + window.innerHeight >= document.body.scrollHeight) {
      stopAutoScroll();
    }
  }, 15);
}

function stopAutoScroll() {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }
}

if (heroScroll) {
  heroScroll.style.cursor = 'pointer';
  heroScroll.addEventListener('click', () => {
    autoScrollInterval ? stopAutoScroll() : startAutoScroll();
  });
}

['mousemove', 'touchstart', 'keydown', 'wheel', 'pointerdown'].forEach((event) => {
  window.addEventListener(event, stopAutoScroll);
});

// ── Back To Top ──
const backToTopBtn = document.getElementById('backToTop');

if (backToTopBtn) {
  window.addEventListener('scroll', () => {
    const past = window.scrollY > 300;
    backToTopBtn.style.display = past ? 'block' : 'none';
    backToTopBtn.classList.toggle('visible', past);
  });

  backToTopBtn.addEventListener('click', () => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  });
}

// ── Event Listeners ──
window.addEventListener('scroll', handleScroll);
navToggle.addEventListener('click', toggleMobileMenu);

navLinks.forEach((link) => link.addEventListener('click', smoothScroll));

document.querySelectorAll('.nav-cta, .nav-cta-mobile, .hero-buttons a').forEach((link) => {
  link.addEventListener('click', smoothScroll);
});

if (reservationForm) {
  reservationForm.addEventListener('submit', handleFormSubmit);
}

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) closeMobileMenu();
});

// ── Reviews (localStorage) ──
const STORAGE_KEY = 'lighthouse_reviews';

const pinnedReview = {
  name: 'Rasshi Srivastav',
  rating: 5,
  text: 'Absolutely loved the food and ambience! Every dish was crafted with such care and the atmosphere was warm and elegant. A truly memorable dining experience — will definitely be coming back!',
  date: '14 May 2026',
};

function getReviews() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  return [];
}

function saveReviews(reviews) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

function normalizeRating(value) {
  const rating = Number(value);
  if (!Number.isFinite(rating)) return 0;
  return Math.min(5, Math.max(0, Math.round(rating * 2) / 2));
}

function formatRating(rating) {
  return Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
}

function renderRatingStars(rating) {
  const normalizedRating = normalizeRating(rating);

  return Array.from({ length: 5 }, (_, index) => {
    const starValue = index + 1;
    const isFull = normalizedRating >= starValue;
    const isHalf = !isFull && normalizedRating >= starValue - 0.5;
    const classes = ['review-star'];

    if (isFull) classes.push('is-full');
    if (isHalf) classes.push('is-half');

    return `<span class="${classes.join(' ')}" aria-hidden="true"></span>`;
  }).join('');
}

function renderReviews() {
  const grid = document.getElementById('reviews-grid');
  if (!grid) return;

  const userReviews = getReviews();
  const allReviews = [pinnedReview, ...userReviews];

  grid.innerHTML = allReviews
    .map(
      (r) => `
      <div class="review-card">
        <div class="review-stars">${renderRatingStars(r.rating)} <span class="review-rating-value">${formatRating(normalizeRating(r.rating))}/5</span></div>
        <p class="review-text">${r.text}</p>
        <div class="review-author">
          <div class="review-avatar">${r.name.slice(0, 2).toUpperCase()}</div>
          <div>
            <span class="review-name">${r.name}</span>
            <span class="review-date">${r.date}</span>
          </div>
        </div>
      </div>`
    )
    .join('');
}

// Star rating widget
let selectedRating = 0;
const ratingGroup = document.getElementById('review-rating-group');
const ratingPreview = document.getElementById('rating-preview');

function setRatingPreview(rating, isPreview = false) {
  const normalizedRating = normalizeRating(rating);
  if (!ratingPreview) return;

  ratingPreview.textContent = normalizedRating
    ? `${isPreview ? 'Preview' : 'Selected'} rating: ${formatRating(normalizedRating)}/5`
    : 'Hover over the stars to rate. Click to select.';
}

function syncSelectedRating() {
  const checked = document.querySelector('input[name="rating"]:checked');
  selectedRating = checked ? normalizeRating(Number(checked.value) / 2) : 0;
  setRatingPreview(selectedRating);
}

if (ratingGroup) {
  const ratingLabels = ratingGroup.querySelectorAll('label[for]');

  ratingLabels.forEach((label) => {
    const input = document.getElementById(label.htmlFor);
    if (!input) return;

    const ratingValue = normalizeRating(Number(input.value) / 2);

    label.addEventListener('mouseenter', () => setRatingPreview(ratingValue, true));
    label.addEventListener('mousemove', () => setRatingPreview(ratingValue, true));
    label.addEventListener('mouseleave', syncSelectedRating);
    input.addEventListener('change', syncSelectedRating);
  });

  ratingGroup.addEventListener('mouseleave', syncSelectedRating);
  syncSelectedRating();
}

// Review validation helpers
function isMeaningfulReview(text) {
  const words = text.trim().split(/\s+/);
  const randomPattern = /^(.)\1+$|^[a-zA-Z]{1,6}$/;
  if (randomPattern.test(text.trim())) return false;
  return words.length >= 3;
}

function isValidName(name) {
  return /^[A-Za-z\s'\-]{3,30}$/.test(name.trim());
}

const reviewForm = document.getElementById('review-form');
const reviewMsg = document.getElementById('review-msg');

if (reviewForm) {
  reviewForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('review-name').value.trim();
    const reviewText = document.getElementById('review-text').value.trim();

    reviewMsg.style.display = 'block';

    if (!selectedRating) {
      reviewMsg.textContent = 'Please select a star rating.';
      reviewMsg.style.color = '#c94a4a';
      return;
    }
    if (!isValidName(name)) {
      reviewMsg.textContent = 'Name should contain only letters and be 3–30 characters long.';
      reviewMsg.style.color = '#c94a4a';
      return;
    }
    if (reviewText.length < 20) {
      reviewMsg.textContent = 'Review must contain at least 20 characters.';
      reviewMsg.style.color = '#c94a4a';
      return;
    }
    if (!isMeaningfulReview(reviewText)) {
      reviewMsg.textContent = 'Please enter a meaningful review.';
      reviewMsg.style.color = '#c94a4a';
      return;
    }

    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const newReview = {
      id: Date.now(),
      name,
      rating: selectedRating,
      text: reviewText,
      date: dateStr,
    };
    const reviews = getReviews();
    reviews.unshift(newReview);
    saveReviews(reviews);
    renderReviews();

    reviewForm.reset();
    selectedRating = 0;
    if (ratingGroup) {
      ratingGroup.querySelectorAll('input[name="rating"]').forEach((input) => {
        input.checked = false;
      });
    }
    setRatingPreview(0);

    reviewMsg.textContent = 'Review submitted successfully!';
    reviewMsg.style.color = '#4a9c6a';
    setTimeout(() => {
      reviewMsg.style.display = 'none';
    }, 3000);
  });
}

// ── Veg / Non-Veg Filter ──────────────────────────────
// 1. Your filtering function, contained properly
(function () {
  const dietFilterBtns = document.querySelectorAll('.diet-btn');
  if (!dietFilterBtns.length) return;

  function applyDietFilter(diet) {
    const activePanels = document.querySelectorAll('.menu-panel.active');

    activePanels.forEach((panel) => {
      const items = panel.querySelectorAll('.menu-item');
      let visibleCount = 0;

      items.forEach((item) => {
        const itemDiet = item.dataset.diet || 'all';
        const show = diet === 'all' || itemDiet === diet;
        item.classList.toggle('diet-hidden', !show);
        if (show) visibleCount++;
      });

      let noResults = panel.querySelector('.diet-no-results');
      if (!noResults) {
        noResults = document.createElement('p');
        noResults.className = 'diet-no-results';
        noResults.textContent = 'No items match the selected filter.';
        const menuItems = panel.querySelector('.menu-items');
        if (menuItems) {
          menuItems.appendChild(noResults);
        }
      }
      noResults.classList.toggle('visible', visibleCount === 0);
    });
  }

  dietFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      dietFilterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      applyDietFilter(btn.dataset.diet);
    });
  });

  document.querySelectorAll('.menu-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const activeDiet = document.querySelector('.diet-btn.active')?.dataset.diet || 'all';
      setTimeout(() => applyDietFilter(activeDiet), 50);
    });
  });
})();

// =============================================
// 3D CARD FLIP ENHANCEMENTS
// =============================================

function handleCardFlip() {
  const cards = document.querySelectorAll('.food-card-3d');
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (isTouch) {
    cards.forEach((card) => {
      card.addEventListener('click', function (e) {
        if (e.target.closest('a') || e.target.closest('button')) return;
        this.classList.toggle('flipped');
      });
    });
  }
}

// Reset mobile flip when clicking elsewhere
document.addEventListener('click', function (e) {
  if (!e.target.closest('.food-card-3d')) {
    document.querySelectorAll('.food-card-3d.flipped').forEach((card) => {
      card.classList.remove('flipped');
    });
  }
});

// ── Initialise ───
document.addEventListener('DOMContentLoaded', function () {
  handleScroll();
  setupIntersectionObserver();
  updateAvailableTimes();
  renderReviews();
  handleCardFlip();
});

// Mobile flip style
const styleForMobile = `
  @media (max-width: 768px) {
    .food-card-3d.flipped .food-card-inner {
      transform: rotateY(180deg) scale(1.01);
    }
  }
`;

const mobileStyle = document.createElement('style');
mobileStyle.textContent = styleForMobile;
document.head.appendChild(mobileStyle);