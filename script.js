/* =========================================================
   1) HERO BANNER CAROUSEL
   Builds dots to match the number of .slide images and
   auto-rotates them every 4 seconds.
   ========================================================= */
const slides = document.querySelectorAll('.banner .slide');
const dotsWrap = document.getElementById('bannerDots');
let currentSlide = 0;

if (dotsWrap && slides.length > 0) {
  slides.forEach((slide, index) => {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    dotsWrap.appendChild(dot);
  });

  const dots = dotsWrap.querySelectorAll('.dot');

  function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = index;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  function nextSlide() {
    const next = (currentSlide + 1) % slides.length;
    goToSlide(next);
  }

  if (slides.length > 1) {
    setInterval(nextSlide, 4000);
  }
}

/* =========================================================
   2) FLASH-SALE COUNTDOWN TIMER
   Counts down 5 days 22 hours 18 minutes STARTING FROM THE
   MOMENT THE PAGE IS OPENED (not a fixed calendar date) —
   this way the demo always shows a fresh countdown no matter
   which day you present it.
   ========================================================= */
function startCountdown(targetDate) {
  const dayEl = document.getElementById('cdDay');
  const hourEl = document.getElementById('cdHour');
  const minEl = document.getElementById('cdMin');
  if (!dayEl || !hourEl || !minEl) return;

  function pad(num) {
    return String(num).padStart(2, '0');
  }

  function tick() {
    const now = new Date();
    let diffMs = targetDate - now;

    if (diffMs <= 0) {
      dayEl.textContent = '00';
      hourEl.textContent = '00';
      minEl.textContent = '00';
      clearInterval(timerId);
      return;
    }

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    diffMs -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    diffMs -= hours * (1000 * 60 * 60);
    const minutes = Math.floor(diffMs / (1000 * 60));

    dayEl.textContent = pad(days);
    hourEl.textContent = pad(hours);
    minEl.textContent = pad(minutes);
  }

  tick();
  const timerId = setInterval(tick, 60000);
}

const flashSaleEnd = new Date(
  Date.now() + (5 * 24 * 60 + 22 * 60 + 18) * 60 * 1000
);
startCountdown(flashSaleEnd);

/* =========================================================
   6) FILTER PANEL — "ทั้งหมด" / "ทุกวัน" + the category/day
   checkboxes actually hide/show the event cards on screen.

   This reads the two filter groups by POSITION instead of
   needing extra id/data attributes in the HTML: in each
   group the 1st checkbox is the "select all" one, and the
   rest follow in a fixed order (คอนเสิร์ต, อีเวนต์,
   นิทรรศการ / วันธรรมดา, เสาร์-อาทิตย์, วันหยุดนักขัตฤกษ์).
   That order matches the sidebar markup, so this works
   without touching the HTML at all.
   ========================================================= */
const filterGroups = document.querySelectorAll('.filter-group');
const CATEGORY_ORDER = ['concert', 'event', 'exhibit'];
const DAY_ORDER = ['weekday', 'weekend', 'holiday'];

let categoryMaster = null;
let categorySubs = [];
let dayMaster = null;
let daySubs = [];

if (filterGroups[0]) {
  const boxes = filterGroups[0].querySelectorAll('input[type="checkbox"]');
  categoryMaster = boxes[0] || null;
  categorySubs = Array.from(boxes).slice(1);
}

if (filterGroups[1]) {
  const boxes = filterGroups[1].querySelectorAll('input[type="checkbox"]');
  dayMaster = boxes[0] || null;
  daySubs = Array.from(boxes).slice(1);
}

function checkedValues(checkboxList, order) {
  const values = [];
  checkboxList.forEach((checkbox, index) => {
    if (checkbox.checked && order[index]) values.push(order[index]);
  });
  return values;
}

function applyFilters() {
  const checkedCategories = checkedValues(categorySubs, CATEGORY_ORDER);
  const checkedDays = checkedValues(daySubs, DAY_ORDER);

  const showEveryCategory = !categoryMaster || categoryMaster.checked || checkedCategories.length === 0;
  const showEveryDay = !dayMaster || dayMaster.checked || checkedDays.length === 0;

  document.querySelectorAll('.concert-item .card').forEach((card) => {
    const categoryMatches = showEveryCategory || checkedCategories.includes(card.dataset.category);
    const dayMatches = showEveryDay || checkedDays.includes(card.dataset.day);
    card.style.display = (categoryMatches && dayMatches) ? '' : 'none';
  });
}

if (categoryMaster) {
  categoryMaster.addEventListener('change', () => {
    categorySubs.forEach((checkbox) => { checkbox.checked = categoryMaster.checked; });
    applyFilters();
  });
}

categorySubs.forEach((checkbox) => {
  checkbox.addEventListener('change', () => {
    if (categoryMaster) categoryMaster.checked = categorySubs.every((cb) => cb.checked);
    applyFilters();
  });
});

if (dayMaster) {
  dayMaster.addEventListener('change', () => {
    daySubs.forEach((checkbox) => { checkbox.checked = dayMaster.checked; });
    applyFilters();
  });
}

daySubs.forEach((checkbox) => {
  checkbox.addEventListener('change', () => {
    if (dayMaster) dayMaster.checked = daySubs.every((cb) => cb.checked);
    applyFilters();
  });
});

applyFilters();

/* =========================================================
   7) & 8) NAVBAR MENU — click to smooth-scroll to the right
   section, and auto-highlight the matching menu item while
   scrolling past it.

   Also positional: the 5 menu items are always in this exact
   order (หน้าแรก, รายการแสดง, สินค้าที่ระลึก, วาไรตี้,
   โปรโมชั่น), and matched to the section CLASSES that have
   been part of the page since the very first version, so
   this needs no new id/data attribute in the HTML either.
   ========================================================= */
const menuLinks = document.querySelectorAll('.menu span');
const navbarEl = document.querySelector('.navbar');

const SECTION_SELECTORS = [null, '.Content', '.product', '.variety', '.promotion'];
const sectionEls = SECTION_SELECTORS.map((sel) => (sel ? document.querySelector(sel) : document.body));

function scrollToSection(index) {
  if (index === 0) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const target = sectionEls[index];
  if (!target || !navbarEl) return;

  const offset = navbarEl.offsetHeight + 20;
  const targetY = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: targetY, behavior: 'smooth' });
}

menuLinks.forEach((link, index) => {
  link.addEventListener('click', () => {
    menuLinks.forEach((l) => l.classList.remove('active'));
    link.classList.add('active');
    scrollToSection(index);
  });
});

let spyTicking = false;

function updateActiveMenuOnScroll() {
  if (!navbarEl) return;
  const scrollLine = window.scrollY + navbarEl.offsetHeight + 30;
  let activeIndex = 0;

  sectionEls.forEach((el, index) => {
    if (index === 0) return;
    if (el && el.offsetTop <= scrollLine) activeIndex = index;
  });

  menuLinks.forEach((link, index) => {
    link.classList.toggle('active', index === activeIndex);
  });

  spyTicking = false;
}

window.addEventListener('scroll', () => {
  if (!spyTicking) {
    requestAnimationFrame(updateActiveMenuOnScroll);
    spyTicking = true;
  }
});

updateActiveMenuOnScroll();

/* =========================================================
   9) TOAST NOTIFICATIONS — small popup feedback after
   clicking a buy / coupon / "read more" button. Event
   delegation on document, so it still works after the event
   cards get re-rendered by pagination.
   ========================================================= */
function showToast(message, iconClass) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid ${iconClass}"></i><span>${message}</span>`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('is-visible'));

  setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), 300);
  }, 2200);
}

document.addEventListener('click', (event) => {
  // "เร็วๆนี้" (not on sale yet) — check this before .buy since it
  // carries both classes
  const outlineBtn = event.target.closest('.buy-outline');
  if (outlineBtn) {
    showToast('ยังไม่เปิดจำหน่าย เดี๋ยวแจ้งเตือนให้ทันทีที่เปิดขาย!', 'fa-bell');
    return;
  }

  const buyBtn = event.target.closest('.buy');
  if (buyBtn) {
    showToast('เพิ่มบัตรลงตะกร้าแล้ว', 'fa-circle-check');
    return;
  }

  const addBtn = event.target.closest('.button-add');
  if (addBtn) {
    showToast('เพิ่มสินค้าลงตะกร้าแล้ว', 'fa-cart-shopping');
    return;
  }

  const promoBtn = event.target.closest('.promo-button');
  if (promoBtn) {
    showToast('เก็บสิทธิ์เรียบร้อยแล้ว', 'fa-ticket');
    return;
  }

  const moreLink = event.target.closest('.more-link');
  if (moreLink) {
    event.preventDefault();
    showToast('บทความฉบับเต็มกำลังจัดทำ เร็วๆนี้', 'fa-newspaper');
  }
});