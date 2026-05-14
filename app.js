/* Tiez Aide — interactions
   - Lucide icon mount
   - Navbar scroll shadow + mobile burger
   - Reveal-on-scroll
   - CountUp stats
   - Form success animation
*/
(function () {
  // Render Lucide icons
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons({ attrs: { 'stroke-width': 1.75 } });
  }

  // ── Navbar shadow on scroll ─────────────────────────────
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 8) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── Mobile menu ─────────────────────────────────────────
  const burger = document.getElementById('burger');
  const mobile = document.getElementById('navMobile');
  if (burger && mobile) {
    burger.addEventListener('click', () => {
      const open = mobile.hasAttribute('hidden');
      if (open) {
        mobile.removeAttribute('hidden');
        burger.setAttribute('aria-expanded', 'true');
      } else {
        mobile.setAttribute('hidden', '');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
    mobile.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        mobile.setAttribute('hidden', '');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ── Reveal on scroll ────────────────────────────────────
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          // tiny stagger inside a row
          const sibs = Array.from(e.target.parentNode.children).filter(s => s.classList.contains('reveal'));
          const idx = sibs.indexOf(e.target);
          e.target.style.transitionDelay = (idx > 0 ? Math.min(idx, 4) * 70 : 0) + 'ms';
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-in'));
  }

  // ── Count up stats ──────────────────────────────────────
  const counts = document.querySelectorAll('.count');
  const animateCount = (el) => {
    const target = parseInt(el.dataset.to, 10) || 0;
    const dur = 1400;
    const start = performance.now();
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(easeOut(p) * target).toLocaleString('fr-FR');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCount(e.target);
          io2.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    counts.forEach(el => io2.observe(el));
  } else {
    counts.forEach(animateCount);
  }

  // ── Form success ────────────────────────────────────────
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (form && success) {
   form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });
    if (response.ok) {
      success.removeAttribute('hidden');
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
      setTimeout(() => {
        success.setAttribute('hidden', '');
        form.reset();
      }, 4000);
    } else {
      alert('Erreur lors de l\'envoi. Réessayez plus tard.');
    }
  } catch (err) {
    alert('Erreur réseau. Vérifiez votre connexion.');
  }
});
  }
  // ── Devis modal (questionnaire) ─────────────────────────
  const modal = document.getElementById('devisModal');
  if (modal) {
    const form    = modal.querySelector('#devisForm');
    const panes   = modal.querySelectorAll('.modal__pane');
    const stepEls = modal.querySelectorAll('.modal__step');
    const btnPrev = modal.querySelector('[data-prev]');
    const btnNext = modal.querySelector('[data-next]');
    const btnSub  = modal.querySelector('[data-submit]');
    const foot    = modal.querySelector('.modal__foot');
    const TOTAL   = 3;
    let step = 1;

    const openModal = (preselect) => {
      step = 1;
      showStep();
      if (preselect) {
        const r = form.querySelector(`input[name="service"][value="${preselect}"]`);
        if (r) r.checked = true;
      }
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      /* refresh lucide icons inside modal in case they hadn't rendered yet */
      if (window.lucide?.createIcons) window.lucide.createIcons();
      /* focus first interactive */
      setTimeout(() => {
        const first = modal.querySelector('.modal__pane.is-active input, .modal__pane.is-active select, .modal__pane.is-active button');
        first?.focus();
      }, 60);
    };

    const closeModal = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      /* reset after a beat so closing animation feels clean */
      setTimeout(() => {
        form.reset();
        step = 1;
        showStep();
      }, 250);
    };

    const showStep = () => {
      panes.forEach(p => p.classList.remove('is-active'));
      const target = (step >= 1 && step <= TOTAL) ? String(step) : 'done';
      const pane = modal.querySelector(`.modal__pane[data-pane="${target}"]`);
      pane?.classList.add('is-active');

      stepEls.forEach((el, i) => {
        el.classList.remove('is-active', 'is-done');
        if (i + 1 === step) el.classList.add('is-active');
        else if (i + 1 < step) el.classList.add('is-done');
      });

      /* footer button visibility */
      if (target === 'done') {
        foot.setAttribute('hidden', '');
      } else {
        foot.removeAttribute('hidden');
        btnPrev.style.visibility = step === 1 ? 'hidden' : 'visible';
        if (step === TOTAL) {
          btnNext.setAttribute('hidden', '');
          btnSub.removeAttribute('hidden');
        } else {
          btnNext.removeAttribute('hidden');
          btnSub.setAttribute('hidden', '');
        }
      }
    };

    const validateStep = () => {
      if (step === 1) {
        const checked = form.querySelector('input[name="service"]:checked');
        if (!checked) { alert('Choisissez un service pour continuer.'); return false; }
      } else if (step === 2) {
        const zone = form.querySelector('select[name="zone"]');
        if (!zone.value) { zone.focus(); return false; }
      } else if (step === 3) {
        const fn = form.querySelector('input[name="firstname"]');
        const ln = form.querySelector('input[name="lastname"]');
        const ph = form.querySelector('input[name="phone"]');
        if (!fn.value.trim()) { fn.focus(); return false; }
        if (!ln.value.trim()) { ln.focus(); return false; }
        if (!ph.value.trim()) { ph.focus(); return false; }
      }
      return true;
    };

    btnNext?.addEventListener('click', () => {
      if (!validateStep()) return;
      if (step < TOTAL) { step++; showStep(); }
    });
    btnPrev?.addEventListener('click', () => {
      if (step > 1) { step--; showStep(); }
    });
   btnSub?.addEventListener('click', async () => {
  if (!validateStep()) return;
  const data = new FormData(form);
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) {
      alert('Erreur lors de l\'envoi. Réessayez plus tard.');
      return;
    }
  } catch (err) {
    alert('Erreur réseau. Vérifiez votre connexion.');
    return;
  }
  step = TOTAL + 1;
  /* mark all step pills as done */
  stepEls.forEach(el => { el.classList.remove('is-active'); el.classList.add('is-done'); });
  panes.forEach(p => p.classList.remove('is-active'));
  modal.querySelector('.modal__pane[data-pane="done"]').classList.add('is-active');
  foot.setAttribute('hidden', '');
});
   form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateStep()) return;
  const data = new FormData(form);
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });
    if (response.ok) {
      btnSub?.click();
    } else {
      alert('Erreur lors de l\'envoi. Réessayez plus tard.');
    }
  } catch (err) {
    alert('Erreur réseau. Vérifiez votre connexion.');
  }
});

    /* triggers */
    document.querySelectorAll('[data-devis]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(btn.dataset.service || null);
      });
    });
    /* closers */
    modal.querySelectorAll('[data-modal-close]').forEach(el => {
      el.addEventListener('click', closeModal);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
  }
})();
