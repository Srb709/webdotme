(() => {
  const body = document.body;
  const menu = document.querySelector('.menu');
  const open = document.querySelector('[data-menu-open]');
  const close = document.querySelector('[data-menu-close]');
  const transition = document.querySelector('.page-transition');
  const ptTitle = transition?.querySelector('.pt-title');

  const pageName = body.dataset.pageLabel || 'WebDotMe';
  if (ptTitle) ptTitle.textContent = pageName;
  requestAnimationFrame(() => {
    body.classList.add('page-enter');
    setTimeout(() => body.classList.remove('page-enter'), 1050);
  });

  const toggleMenu = (state) => {
    body.classList.toggle('menu-open', state);
    open?.setAttribute('aria-expanded', state ? 'true' : 'false');
  };
  open?.addEventListener('click', () => toggleMenu(true));
  close?.addEventListener('click', () => toggleMenu(false));
  menu?.addEventListener('click', (e) => { if (e.target === menu) toggleMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleMenu(false); });

  function shouldTransition(a){
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return false;
    const href = a.getAttribute('href') || '';
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
    try {
      const url = new URL(a.href, location.href);
      return url.origin === location.origin && url.pathname !== location.pathname;
    } catch { return false; }
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-transition], .menu a[href], .desktop-nav a[href], .next-page[href], .logo[href]');
    if (!shouldTransition(a)) return;
    e.preventDefault();
    toggleMenu(false);
    const label = a.dataset.label || a.textContent.trim().replace(/↗|→/g,'').trim() || 'Next';
    if (ptTitle) ptTitle.textContent = label;
    body.classList.remove('page-enter');
    body.classList.add('transitioning');
    setTimeout(() => { location.href = a.href; }, 590);
  });

  // Resilient fallback for third-party preview images
  document.querySelectorAll('img[data-fallback-src]').forEach((img) => {
    const applyFallback = () => {
      if (img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = 'true';
      img.alt = img.dataset.fallbackAlt || img.alt;
      img.src = img.dataset.fallbackSrc;
    };
    img.addEventListener('error', applyFallback, { once: true });
    setTimeout(() => {
      if (!img.complete || !img.naturalWidth) applyFallback();
    }, 3500);
  });

  // Live inquiry form
  const form = document.getElementById('projectForm');
  const status = document.getElementById('projectFormStatus');
  const submit = form?.querySelector('.submit');
  const endpoint = 'https://jenivmopscalrrgthvmz.supabase.co/functions/v1/webdotme-lead';

  if (form && status && submit && window.fetch) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const label = submit.querySelector('span:first-child');
      const original = label?.textContent || 'SEND IT';
      submit.disabled = true;
      if (label) label.textContent = 'SENDING…';
      status.textContent = '';
      status.className = 'form-status';

      try {
        const fd = new FormData(form);
        const payload = {
          name: String(fd.get('name') || ''),
          email: String(fd.get('email') || ''),
          business: String(fd.get('business') || ''),
          website_instagram: String(fd.get('website_or_instagram') || ''),
          needs: fd.getAll('needs').map(String),
          budget: String(fd.get('budget') || ''),
          project: String(fd.get('project') || ''),
          company_url: String(fd.get('company_url') || '')
        };
        const res = await fetch(endpoint, {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify(payload)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) throw new Error(data.error || 'Unable to send inquiry.');
        form.reset();
        form.classList.add('is-sent');
        status.textContent = '';
      } catch (err) {
        status.textContent = err?.message || 'Something went wrong. Please try again.';
        status.classList.add('is-error');
        submit.disabled = false;
        if (label) label.textContent = original;
      }
    });
  }
})();
