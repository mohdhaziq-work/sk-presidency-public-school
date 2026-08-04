/* ============================================================
   SK PRESIDENCY PUBLIC SCHOOL - Main JavaScript
   Sidebar collapse, active tracking, back-to-top, scroll-reveal
   ============================================================ */

document.addEventListener('DOMContentLoaded', function() {

  /* ===== MOBILE NAV TOGGLE ===== */
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');
  if (navToggle && navList) {
    navToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      navList.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', navList.classList.contains('open'));
    });
    document.addEventListener('click', function(e) {
      if (!navToggle.contains(e.target) && !navList.contains(e.target)) {
        navList.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
    navList.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        if (window.innerWidth <= 860) {
          navList.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  /* ===== SIDEBAR COLLAPSE TOGGLE ===== */
  const sbToggle = document.querySelector('.sb-toggle');
  const sbLinks = document.querySelector('.sidebar-links');
  if (sbToggle && sbLinks) {
    var collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    function applyCollapse() {
      if (collapsed) {
        sbLinks.classList.add('collapsed');
        sbToggle.innerHTML = '&#x25B6;';
      } else {
        sbLinks.classList.remove('collapsed');
        sbToggle.innerHTML = '&#x25BC;';
      }
    }
    applyCollapse();
    sbToggle.addEventListener('click', function() {
      collapsed = !collapsed;
      localStorage.setItem('sidebarCollapsed', collapsed);
      applyCollapse();
    });
  }

  /* ===== SIDEBAR ACTIVE STATE ===== */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar-link').forEach(function(link) {
    var href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('sb-active');
    }
  });
  document.querySelectorAll('.nav-list a').forEach(function(link) {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

  /* ===== HERO SLIDER ===== */
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  let currentSlide = 0, slideInterval;
  function showSlide(index) {
    slides.forEach(function(s, i) { s.classList.toggle('active', i === index); });
    dots.forEach(function(d, i) { d.classList.toggle('active', i === index); });
    currentSlide = index;
  }
  function nextSlide() { showSlide((currentSlide + 1) % slides.length); }
  function resetInterval() { clearInterval(slideInterval); slideInterval = setInterval(nextSlide, 5000); }
  if (slides.length > 1) {
    dots.forEach(function(dot) {
      dot.addEventListener('click', function() { showSlide(parseInt(this.getAttribute('data-index'))); resetInterval(); });
    });
    slideInterval = setInterval(nextSlide, 5000);
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', function() { clearInterval(slideInterval); });
      hero.addEventListener('mouseleave', function() { resetInterval(); });
    }
  }

  /* ===== BACK TO TOP BUTTON ===== */
  const btt = document.querySelector('.back-to-top');
  if (btt) {
    window.addEventListener('scroll', function() {
      btt.classList.toggle('visible', window.scrollY > 400);
    });
    btt.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ===== SCROLL-REVEAL ANIMATIONS ===== */
  const reveals = document.querySelectorAll('.reveal, .reveal-left');
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(function(el) { observer.observe(el); });

  /* ===== PHOTO SCROLL PAUSE ===== */
  const photoScroll = document.querySelector('.photo-scroll-inner');
  if (photoScroll) {
    photoScroll.addEventListener('mouseenter', function() { this.style.animationPlayState = 'paused'; });
    photoScroll.addEventListener('mouseleave', function() { this.style.animationPlayState = 'running'; });
  }

  /* ===== SMOOTH ANCHOR SCROLL ===== */
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

});
