(() => {
  const body = document.body;
  const menu = document.querySelector('.menu');
  const open = document.querySelector('[data-menu-open]');
  const close = document.querySelector('[data-menu-close]');
  const transition = document.querySelector('.page-transition');
  const ptTitle = transition?.querySelector('.pt-title');

  const resetRouteState = () => {
    body.classList.remove('transitioning', 'page-enter', 'menu-open');
    open?.setAttribute('aria-expanded', 'false');
  };

  // Safari can restore a page from its back-forward cache with the outgoing
  // transition class still applied. Clear it both before caching and on return.
  window.addEventListener('pagehide', resetRouteState);
  window.addEventListener('pageshow', () => {
    resetRouteState();
    requestAnimationFrame(resetRouteState);
  });

  const pageName = body.dataset.pageLabel || 'WebDotMe';
  if (ptTitle) ptTitle.textContent = pageName;
	requestAnimationFrame(() => {
		body.classList.add('page-enter');
		setTimeout(() => body.classList.remove('page-enter'), 820);
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
		setTimeout(() => { location.href = a.href; }, 450);
  });

	// Motion follows intent: the environment responds quietly to the pointer,
	// while the project itself gets the richer interaction.
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

	if (!reduceMotion && finePointer) {
		document.documentElement.classList.add('motion-reactive');
		let targetX = 0;
		let targetY = 0;
		let currentX = 0;
		let currentY = 0;
		let motionFrame = 0;

		const renderField = () => {
			currentX += (targetX - currentX) * .12;
			currentY += (targetY - currentY) * .12;
			document.documentElement.style.setProperty('--field-x', `${currentX.toFixed(2)}px`);
			document.documentElement.style.setProperty('--field-y', `${currentY.toFixed(2)}px`);

			if (Math.abs(targetX - currentX) > .05 || Math.abs(targetY - currentY) > .05) {
				motionFrame = requestAnimationFrame(renderField);
			} else {
				motionFrame = 0;
			}
		};

		window.addEventListener('pointermove', (event) => {
			targetX = ((event.clientX / window.innerWidth) - .5) * 12;
			targetY = ((event.clientY / window.innerHeight) - .5) * 9;
			if (!motionFrame) motionFrame = requestAnimationFrame(renderField);
		}, { passive: true });

		document.querySelectorAll('.browser, .project-row, .screen-frame').forEach((card) => {
			card.addEventListener('pointermove', (event) => {
				const rect = card.getBoundingClientRect();
				card.style.setProperty('--card-x', `${event.clientX - rect.left}px`);
				card.style.setProperty('--card-y', `${event.clientY - rect.top}px`);
			}, { passive: true });
		});
	}

	// IntersectionObserver keeps the reveal choreography intact in browsers
	// that do not yet support scroll-driven CSS animation timelines.
	if (!reduceMotion && !CSS.supports('animation-timeline: view()')) {
		document.documentElement.classList.add('observer-reveal');
		const revealObserver = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				entry.target.classList.add('is-visible');
				revealObserver.unobserve(entry.target);
			});
		}, { rootMargin: '0px 0px -12% 0px', threshold: .12 });

		document.querySelectorAll('.reveal, .reveal-left').forEach((element) => revealObserver.observe(element));
	}

  // Conversion measurement. Events are queued now and flow into Google Analytics
  // as soon as the production measurement ID is connected.
  const track = (eventName, params = {}) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
      return;
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...params });
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    if (href.startsWith('mailto:')) track('email_click', { link_url: href });
    if (href.startsWith('tel:')) track('phone_click', { link_url: href });
    if (/^https?:\/\//i.test(href) && !href.includes('webdotme.com')) {
      track('outbound_click', { link_url: href });
    }
  });

  // The inquiry form opens a prepared SMS immediately. The visitor still
  // controls the final send action in their phone's Messages app.
  const form = document.getElementById('projectForm');
  const status = document.getElementById('projectFormStatus');

  if (form) {
    form.addEventListener('input', () => {
      if (form.dataset.started) return;
      form.dataset.started = 'true';
      track('generate_lead_start', { form_name: 'project_inquiry' });
    }, { once: true });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const fd = new FormData(form);
      const payload = {
        name: String(fd.get('name') || ''),
        email: String(fd.get('email') || ''),
        phone: String(fd.get('phone') || ''),
        business: String(fd.get('business') || ''),
        websiteInstagram: String(fd.get('website_instagram') || ''),
        needs: fd.getAll('needs').map(String),
        budget: String(fd.get('budget') || ''),
        project: String(fd.get('project') || '')
      };
      const needs = payload.needs.length ? payload.needs.join(', ') : 'Not selected';
      const draft = `Hey Steve — I just filled out the WebDotMe project form.

Name: ${payload.name}
Email: ${payload.email}
Phone: ${payload.phone || 'Not provided'}
Business: ${payload.business || 'Not provided'}
Website / Instagram: ${payload.websiteInstagram || 'Not provided'}
Needs: ${needs}
Budget: ${payload.budget || 'Not selected'}

Project:
${payload.project}`;

      track('generate_lead', {
        form_name: 'project_inquiry',
        contact_method: 'sms',
        selected_services: payload.needs.join(', ')
      });
      if (status) status.textContent = 'Opening your prepared text…';
      window.location.href = `sms:+12157799288?&body=${encodeURIComponent(draft)}`;
    });
  }
})();

