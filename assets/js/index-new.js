(function() {
  const body = document.body;

  const finishPreload = () => body.classList.remove('is-preload');
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.setTimeout(finishPreload, 100);
    });
  } else {
    window.setTimeout(finishPreload, 100);
  }

  const header = document.getElementById('site-header');
  const nav = document.getElementById('site-nav');
  const toggle = document.querySelector('.menu-toggle');

  const closeMenu = () => {
    if (!nav) return;
    nav.classList.remove('is-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  };

  const openMenu = () => {
    if (!nav) return;
    nav.classList.add('is-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
  };

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    nav.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    document.addEventListener('click', (event) => {
      if (!nav.classList.contains('is-open')) return;
      if (header && header.contains(event.target)) return;
      closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMenu();
        toggle.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 980) {
        closeMenu();
      }
    });
  }

  const updateHeaderState = () => {
    if (!header) return;
    if (window.scrollY > 30) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });

  const navLinks = nav ? Array.from(nav.querySelectorAll('a[href^="#"]')) : [];
  const linkBySection = new Map();

  navLinks.forEach((link) => {
    const targetId = link.getAttribute('href');
    if (!targetId || !targetId.startsWith('#')) return;
    const section = document.querySelector(targetId);
    if (!section) return;
    linkBySection.set(section.id, link);
  });

  const setActiveLink = (link) => {
    navLinks.forEach((item) => {
      if (item === link) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  };

  if ('IntersectionObserver' in window && linkBySection.size > 0) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visible.length > 0) {
        const link = linkBySection.get(visible[0].target.id);
        if (link) {
          setActiveLink(link);
        }
      }
    }, {
      rootMargin: '-50% 0px -45% 0px',
      threshold: [0.1, 0.25, 0.5, 0.75]
    });

    linkBySection.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) {
        observer.observe(section);
      }
    });
  } else if (navLinks.length > 0) {
    setActiveLink(navLinks[0]);
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      setActiveLink(link);
    });
  });
})();
