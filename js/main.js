/* ============================================================
   main.js — Matheus Haddad Personal Site
   ============================================================ */

(function () {
  'use strict';

  /* ── DOM Ready ────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    setActiveNavLink();
    initFilterTabs();
    initStickyHeader();
    initContactFormPrefill();
    initFormspree();
  });

  /* ── Mobile Menu ──────────────────────────────────────────── */
  function initMobileMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var nav    = document.querySelector('.main-nav');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when a nav link is clicked
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Active Nav Link ──────────────────────────────────────── */
  function setActiveNavLink() {
    var currentFile = window.location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('.main-nav a').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;

      // Strip query params from href for comparison
      var hrefFile = href.split('?')[0].split('/').pop() || 'index.html';

      if (hrefFile === currentFile) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /* ── Filter Tabs (palestras.html) ────────────────────────── */
  function initFilterTabs() {
    var tabs  = document.querySelectorAll('.filter-tab');
    var cards = document.querySelectorAll('.media-card[data-category]');

    if (!tabs.length || !cards.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        // Update active tab
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');

        var filter = tab.getAttribute('data-filter');

        // Show / hide cards
        cards.forEach(function (card) {
          if (filter === 'all' || card.getAttribute('data-category') === filter) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });
  }

  /* ── Sticky Header ────────────────────────────────────────── */
  function initStickyHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    function onScroll() {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run on load
  }

  /* ── Contact form assunto prefill ────────────────────────── */
  function initContactFormPrefill() {
    var select = document.getElementById('assunto');
    if (!select) return;

    var params = new URLSearchParams(window.location.search);
    var assunto = params.get('assunto');

    if (!assunto) return;

    var map = {
      'consultoria':    'Consultoria Empresarial',
      'palestra':       'Palestra/Evento',
      'mentoria':       'Mentoria',
      'livro':          'Livro/Feedback Canvas',
      'imprensa':       'Imprensa'
    };

    var value = map[assunto] || assunto;

    Array.from(select.options).forEach(function (opt) {
      if (opt.value === value || opt.text === value) {
        opt.selected = true;
      }
    });
  }

  /* ── Formspree AJAX ───────────────────────────────────────── */
  function initFormspree() {
    document.querySelectorAll('form[action^="https://formspree.io"]').forEach(function (form) {
      var successEl = form.nextElementSibling;
      var errorEl   = form.querySelector('.form-error');

      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var btn = form.querySelector('[type="submit"]');
        var originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Enviando…';

        if (errorEl) errorEl.classList.remove('visible');

        fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        })
        .then(function (res) {
          if (res.ok) {
            form.style.display = 'none';
            if (successEl && successEl.classList.contains('form-success')) {
              successEl.classList.add('visible');
            }
          } else {
            return res.json().then(function (data) {
              throw new Error(data.error || 'Erro ao enviar.');
            });
          }
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = originalText;
          if (errorEl) {
            errorEl.classList.add('visible');
          }
        });
      });
    });
  }

})();
