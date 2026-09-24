(() => {
	"use strict";

	const ensureStylesheet = (href) => {
		if (document.querySelector(`link[href="${href}"]`)) return;
		const stylesheet = document.createElement("link");
		stylesheet.rel = "stylesheet";
		stylesheet.href = href;
		document.head.appendChild(stylesheet);
	};

	ensureStylesheet("/assets/portrait-blend.css");
	ensureStylesheet("/assets/showoff-pass.css");

	const body = document.body;
	const root = document.documentElement;
	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const finePointer = window.matchMedia("(pointer: fine)").matches;
	const desktopPreview = window.matchMedia("(min-width: 901px)");
	const saveData = Boolean(navigator.connection && navigator.connection.saveData);
	const cursor = document.querySelector(".wdm-cursor");
	const hero = document.querySelector(".wdm-hero");
	const menuButton = document.querySelector(".wdm-menu-button");
	const menu = document.querySelector(".wdm-menu");
	const menuLinks = menu ? Array.from(menu.querySelectorAll("a")) : [];
	const projectChapters = Array.from(document.querySelectorAll(".wdm-project-chapter"));
	const scrollRail = document.querySelector(".wdm-scroll-rail");
	const brandDot = document.querySelector(".wdm-brand-dot");
	let mouseX = window.innerWidth / 2;
	let mouseY = window.innerHeight / 2;
	let cursorX = mouseX;
	let cursorY = mouseY;
	let rafId = null;
	let activeFrame = null;
	let phillyImage = null;
	let livePreviewFrame = null;
	let livePreviewStage = null;
	let livePreviewTimer = null;
	let activeSectionLabel = "00 / INTRO";

	const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

	const buildShowcaseSelector = () => {
		const intro = document.querySelector(".wdm-work-intro");
		if (!intro || document.querySelector(".wdm-showcase-selector")) return;

		const selector = document.createElement("div");
		selector.className = "wdm-showcase-selector wdm-reveal";
		selector.innerHTML = `
			<div class="wdm-showcase-shell">
				<div class="wdm-showcase-list" aria-label="Featured project preview selector">
					<button aria-pressed="true" class="wdm-showcase-button" data-project="lute" type="button">
						<small>01</small><strong>Little Lute</strong><em>Small business / live</em>
					</button>
					<button aria-pressed="false" class="wdm-showcase-button" data-live="https://foundry-no-9.vercel.app" data-project="foundry" type="button">
						<small>02</small><strong>Foundry No. 9</strong><em>Editorial / motion</em>
					</button>
					<button aria-pressed="false" class="wdm-showcase-button" data-live="https://monolith-architecture-gamma.vercel.app" data-project="monolith" type="button">
						<small>03</small><strong>MØNOLITH</strong><em>WebGL / spatial</em>
					</button>
				</div>
				<div class="wdm-showcase-stage" data-active="lute">
					<div class="wdm-showcase-stage-top"><span>WebDotMe / live work surface</span><span>Move through the projects</span></div>
					<div class="wdm-showcase-panel is-active" data-project="lute">
						<div class="wdm-showcase-lute-scene">
							<div class="wdm-showcase-lute-heading"><small>Embroidery + mobile spray tanning</small><strong><span>Little Lute</span><span>Studio</span></strong></div>
							<figure class="wdm-showcase-lute-photo is-stitch">
								<picture><source srcset="assets/portfolio/little-lute-embroidery-1086.avif" type="image/avif"/><img alt="Little Lute embroidered crewneck" decoding="async" loading="lazy" src="assets/portfolio/little-lute-embroidery-1086.webp"/></picture>
								<figcaption>01 / Stitch</figcaption>
							</figure>
							<figure class="wdm-showcase-lute-photo is-glow">
								<picture><source srcset="assets/portfolio/little-lute-spray-tan-1140.avif" type="image/avif"/><img alt="Little Lute mobile spray-tan client" decoding="async" loading="lazy" src="assets/portfolio/little-lute-spray-tan-1140.webp"/></picture>
								<figcaption>02 / Glow</figcaption>
							</figure>
							<div class="wdm-showcase-lute-note">Personal work.<br/>Made locally.</div>
						</div>
					</div>
					<div class="wdm-showcase-panel" data-project="foundry">
						<div aria-hidden="true" class="wdm-showcase-foundry-photo"></div>
						<div class="wdm-showcase-foundry-copy">Objects made to <em>outlive us.</em></div>
					</div>
					<div class="wdm-showcase-panel" data-project="monolith">
						<div aria-hidden="true" class="wdm-showcase-mono-grid"></div>
						<div aria-hidden="true" class="wdm-showcase-mono-geometry"><span></span><span></span><span></span></div>
						<div class="wdm-showcase-mono-copy">We shape <em>empty space.</em></div>
					</div>
					<iframe aria-hidden="true" class="wdm-showcase-live" loading="lazy" tabindex="-1" title="Interactive live project preview"></iframe>
					<div class="wdm-showcase-status">Crisp motion study / live projects on desktop</div>
				</div>
			</div>
		`;

		intro.insertAdjacentElement("afterend", selector);
		livePreviewFrame = selector.querySelector(".wdm-showcase-live");
		livePreviewStage = selector.querySelector(".wdm-showcase-stage");

		const buttons = Array.from(selector.querySelectorAll(".wdm-showcase-button"));
		const panels = Array.from(selector.querySelectorAll(".wdm-showcase-panel"));

		const clearLivePreview = () => {
			window.clearTimeout(livePreviewTimer);
			if (!livePreviewFrame || !livePreviewStage) return;
			livePreviewStage.classList.remove("is-live");
			livePreviewFrame.removeAttribute("src");
		};

		const scheduleLivePreview = (url) => {
			window.clearTimeout(livePreviewTimer);
			if (!url || !finePointer || !desktopPreview.matches || saveData || reduceMotion) return;
			livePreviewTimer = window.setTimeout(() => {
				if (!livePreviewFrame || !livePreviewStage) return;
				if (livePreviewFrame.getAttribute("src") !== url) {
					livePreviewStage.classList.remove("is-live");
					livePreviewFrame.src = url;
				}
			}, 850);
		};

		const activateProject = (button) => {
			const project = button.dataset.project;
			if (!project || !livePreviewStage) return;

			buttons.forEach((item) => item.setAttribute("aria-pressed", item === button ? "true" : "false"));
			panels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.project === project));
			livePreviewStage.dataset.active = project;
			clearLivePreview();
			scheduleLivePreview(button.dataset.live || "");
		};

		buttons.forEach((button) => {
			button.addEventListener("pointerenter", () => activateProject(button));
			button.addEventListener("focus", () => activateProject(button));
			button.addEventListener("click", () => activateProject(button));
		});

		livePreviewFrame?.addEventListener("load", () => {
			if (!livePreviewStage || !livePreviewFrame?.getAttribute("src")) return;
			livePreviewStage.classList.add("is-live");
		});

		if ("IntersectionObserver" in window) {
			const selectorObserver = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting && entry.intersectionRatio === 0) clearLivePreview();
				});
			}, { threshold: [0, 0.1] });
			selectorObserver.observe(selector);
		}
	};

	const buildProjectArtifacts = () => {
		const configs = {
			"little-lute": {
				chip: "Responsive system / live build",
				note: "One brand / two service paths / phone-first",
				phone: true
			},
			foundry: {
				chip: "Editorial motion / GSAP",
				note: "Art direction / object catalog / cinematic transitions"
			},
			monolith: {
				chip: "WebGL / shaders / spatial UI",
				note: "Three.js / procedural geometry / adaptive rendering"
			}
		};

		Object.entries(configs).forEach(([id, config]) => {
			const chapter = document.getElementById(id);
			const portal = chapter?.querySelector(".wdm-project-portal");
			if (!portal || portal.querySelector(".wdm-project-artifacts")) return;

			const artifacts = document.createElement("div");
			artifacts.className = "wdm-project-artifacts";
			artifacts.setAttribute("aria-hidden", "true");
			artifacts.innerHTML = `
				<span class="wdm-artifact-chip">${config.chip}</span>
				<span class="wdm-artifact-note">${config.note}</span>
				${config.phone ? '<span class="wdm-artifact-phone"><img alt="" decoding="async" loading="lazy" src="assets/portfolio/little-lute-site-mobile.webp"/></span>' : ""}
			`;
			portal.appendChild(artifacts);
		});
	};

	const buildSystemMap = () => {
		const codeWindow = document.querySelector(".wdm-code-window");
		if (!codeWindow || document.querySelector(".wdm-system-map")) return;

		const map = document.createElement("div");
		map.className = "wdm-system-map";
		map.setAttribute("aria-label", "How a WebDotMe project moves from strategy to a monitored live website");
		map.innerHTML = `
			<div class="wdm-system-node"><small>01 / Define</small><strong>Strategy</strong><span>Offer / audience / structure</span></div>
			<div class="wdm-system-node"><small>02 / Shape</small><strong>Design</strong><span>Type / layout / interaction</span></div>
			<div class="wdm-system-node"><small>03 / Build</small><strong>Code</strong><span>Semantic / responsive / accessible</span></div>
			<div class="wdm-system-node"><small>04 / Ship</small><strong>Deploy</strong><span>GitHub / Vercel / domains</span></div>
			<div class="wdm-system-node"><small>05 / Watch</small><strong>Measure</strong><span>Analytics / speed / search</span></div>
		`;
		codeWindow.insertAdjacentElement("afterend", map);
	};

	const buildPhillyInterstitial = () => {
		const local = document.querySelector(".wdm-local");
		if (!local || document.querySelector(".wdm-philly-interstitial")) return;

		const section = document.createElement("section");
		section.className = "wdm-philly-interstitial";
		section.innerHTML = `
			<figure class="wdm-philly-image">
				<img alt="Dark geometric architecture photographed in Philadelphia" decoding="async" fetchpriority="low" height="1800" loading="lazy" src="https://images.unsplash.com/photo-1627338456513-ed245e2894bc?auto=format&fit=crop&w=2200&q=84" width="3000"/>
			</figure>
			<div class="wdm-philly-copy">
				<div class="wdm-philly-kicker">Philadelphia / where the work starts</div>
				<h2>Local roots.<br/><em>Internet scale.</em></h2>
				<div class="wdm-philly-foot">
					<span>Philadelphia based / working across Bucks, Montgomery + beyond</span>
					<a href="https://unsplash.com/photos/black-and-white-concrete-building-st6NoMQBGhw" rel="noopener" target="_blank">Photo / Kateryna Mountain / Unsplash</a>
				</div>
			</div>
		`;

		local.insertAdjacentElement("beforebegin", section);
		phillyImage = section.querySelector(".wdm-philly-image img");
	};

	const buildLocalSignal = () => {
		const localGrid = document.querySelector(".wdm-local-grid");
		if (!localGrid || localGrid.querySelector(".wdm-local-signal")) return;

		const signal = document.createElement("div");
		signal.className = "wdm-local-signal";
		signal.innerHTML = `
			<div><small>Home base</small><strong>Philadelphia</strong></div>
			<div><small>Primary local reach</small><strong>Bucks + Montgomery</strong></div>
			<div><small>Build model</small><strong>Direct / independent</strong></div>
		`;
		localGrid.prepend(signal);
	};

	const buildStudioEnhancements = () => {
		buildShowcaseSelector();
		buildProjectArtifacts();
		buildSystemMap();
		buildPhillyInterstitial();
		buildLocalSignal();
	};

	buildStudioEnhancements();

	const setLoaded = () => {
		window.requestAnimationFrame(() => {
			body.classList.add("wdm-loaded");
		});
	};

	if (document.readyState === "complete") {
		setLoaded();
	} else {
		window.addEventListener("load", setLoaded, { once: true });
	}

	const updatePhillyParallax = () => {
		if (!phillyImage || reduceMotion) return;
		const section = phillyImage.closest(".wdm-philly-interstitial");
		if (!section) return;
		const rect = section.getBoundingClientRect();
		if (rect.bottom < 0 || rect.top > window.innerHeight) return;
		const progress = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0, 1);
		phillyImage.style.setProperty("--philly-shift", `${((progress - 0.5) * 42).toFixed(2)}px`);
	};

	const updateScrollProgress = () => {
		const doc = document.documentElement;
		const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
		const progress = clamp(window.scrollY / maxScroll, 0, 1);
		root.style.setProperty("--scroll-progress", progress.toFixed(4));
		updatePhillyParallax();
	};

	updateScrollProgress();
	window.addEventListener("scroll", updateScrollProgress, { passive: true });
	window.addEventListener("resize", updateScrollProgress, { passive: true });

	if (hero && finePointer && !reduceMotion) {
		hero.addEventListener("pointermove", (event) => {
			const rect = hero.getBoundingClientRect();
			const x = ((event.clientX - rect.left) / rect.width - 0.5) * 110;
			const y = ((event.clientY - rect.top) / rect.height - 0.5) * 90;
			hero.style.setProperty("--mx", `${x.toFixed(2)}px`);
			hero.style.setProperty("--my", `${y.toFixed(2)}px`);
		});

		hero.addEventListener("pointerleave", () => {
			hero.style.setProperty("--mx", "0px");
			hero.style.setProperty("--my", "0px");
		});
	}

	if (cursor && finePointer && !reduceMotion) {
		const animateCursor = () => {
			cursorX += (mouseX - cursorX) * 0.18;
			cursorY += (mouseY - cursorY) * 0.18;
			cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate3d(-50%, -50%, 0)`;
			rafId = window.requestAnimationFrame(animateCursor);
		};

		window.addEventListener("pointermove", (event) => {
			mouseX = event.clientX;
			mouseY = event.clientY;
			cursor.style.opacity = "1";
		});

		window.addEventListener("pointerleave", () => {
			cursor.style.opacity = "0";
		});

		const interactive = document.querySelectorAll("a, button, [data-cursor-large]");
		interactive.forEach((element) => {
			element.addEventListener("pointerenter", () => cursor.classList.add("is-active"));
			element.addEventListener("pointerleave", () => cursor.classList.remove("is-active"));
		});

		animateCursor();
	}

	const closeMenu = () => {
		if (!menu || !menuButton) return;
		menu.classList.remove("is-open");
		menuButton.setAttribute("aria-expanded", "false");
		menuButton.textContent = "Menu";
		body.classList.remove("menu-open");
	};

	const openMenu = () => {
		if (!menu || !menuButton) return;
		menu.classList.add("is-open");
		menuButton.setAttribute("aria-expanded", "true");
		menuButton.textContent = "Close";
		body.classList.add("menu-open");
	};

	if (menuButton && menu) {
		menuButton.addEventListener("click", () => {
			if (menu.classList.contains("is-open")) {
				closeMenu();
			} else {
				openMenu();
			}
		});

		menuLinks.forEach((link) => link.addEventListener("click", closeMenu));

		window.addEventListener("keydown", (event) => {
			if (event.key === "Escape") closeMenu();
		});
	}

	if ("IntersectionObserver" in window && !reduceMotion) {
		const revealObserver = new IntersectionObserver((entries, observer) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				entry.target.classList.add("is-visible");
				observer.unobserve(entry.target);
			});
		}, {
			rootMargin: "0px 0px -10% 0px",
			threshold: 0.14
		});

		document.querySelectorAll(".wdm-reveal").forEach((item) => revealObserver.observe(item));
	} else {
		document.querySelectorAll(".wdm-reveal").forEach((item) => item.classList.add("is-visible"));
	}

	const sectionTargets = [
		[document.querySelector(".wdm-hero"), "00 / INTRO"],
		[document.querySelector(".wdm-manifesto"), "01 / POSITION"],
		[document.querySelector(".wdm-work"), "02 / WORK"],
		[document.querySelector(".wdm-underhood"), "03 / SYSTEMS"],
		[document.querySelector(".wdm-services"), "04 / SERVICES"],
		[document.querySelector(".wdm-about"), "05 / ABOUT"],
		[document.querySelector(".wdm-philly-interstitial"), "PHL / CITY"],
		[document.querySelector(".wdm-local"), "06 / LOCAL"],
		[document.querySelector(".wdm-final"), "07 / START"]
	].filter(([element]) => Boolean(element));

	if (scrollRail) scrollRail.dataset.section = activeSectionLabel;

	if ("IntersectionObserver" in window && sectionTargets.length) {
		const sectionObserver = new IntersectionObserver((entries) => {
			const visible = entries
				.filter((entry) => entry.isIntersecting)
				.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
			if (!visible) return;

			const match = sectionTargets.find(([element]) => element === visible.target);
			const nextLabel = match?.[1];
			if (!nextLabel || nextLabel === activeSectionLabel) return;

			activeSectionLabel = nextLabel;
			if (scrollRail) {
				scrollRail.dataset.section = nextLabel;
				scrollRail.classList.add("is-changing");
				window.setTimeout(() => scrollRail.classList.remove("is-changing"), 520);
			}
			if (brandDot && !reduceMotion) {
				brandDot.classList.remove("is-pulse");
				void brandDot.offsetWidth;
				brandDot.classList.add("is-pulse");
			}
		}, {
			rootMargin: "-30% 0px -40% 0px",
			threshold: [0.05, 0.2, 0.45]
		});

		sectionTargets.forEach(([element]) => sectionObserver.observe(element));
	}

	const unloadFrame = (frame) => {
		if (!frame) return;
		const portal = frame.closest(".wdm-project-portal");
		frame.removeAttribute("src");
		if (portal) portal.classList.remove("is-live");
		if (activeFrame === frame) activeFrame = null;
	};

	const loadFrame = (frame) => {
		if (!frame || !desktopPreview.matches || saveData) return;
		const source = frame.dataset.src;
		if (!source) return;

		if (activeFrame && activeFrame !== frame) {
			unloadFrame(activeFrame);
		}

		if (!frame.src) {
			frame.src = source;
		}

		activeFrame = frame;
	};

	const setupLivePreviews = () => {
		if (!("IntersectionObserver" in window)) return;

		const chapterObserver = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				const frame = entry.target.querySelector(".wdm-live-frame");
				if (!frame) return;

				if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
					loadFrame(frame);
				} else if (activeFrame === frame && entry.intersectionRatio < 0.08) {
					window.setTimeout(() => {
						if (activeFrame === frame) unloadFrame(frame);
					}, 350);
				}
			});
		}, {
			threshold: [0.08, 0.3, 0.55]
		});

		projectChapters.forEach((chapter) => chapterObserver.observe(chapter));
	};

	document.querySelectorAll(".wdm-live-frame").forEach((frame) => {
		frame.addEventListener("load", () => {
			const portal = frame.closest(".wdm-project-portal");
			if (portal && frame.src) portal.classList.add("is-live");
		});
	});

	setupLivePreviews();

	desktopPreview.addEventListener("change", (event) => {
		if (!event.matches && activeFrame) unloadFrame(activeFrame);
		if (!event.matches && livePreviewFrame && livePreviewStage) {
			livePreviewStage.classList.remove("is-live");
			livePreviewFrame.removeAttribute("src");
		}
	});

	if (!reduceMotion) {
		const magnetic = Array.from(document.querySelectorAll(".wdm-line-link, .wdm-project-link, .wdm-cta-link"));

		if (finePointer) {
			magnetic.forEach((link) => {
				link.addEventListener("pointermove", (event) => {
					const rect = link.getBoundingClientRect();
					const x = (event.clientX - rect.left - rect.width / 2) * 0.05;
					const y = (event.clientY - rect.top - rect.height / 2) * 0.08;
					link.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
				});

				link.addEventListener("pointerleave", () => {
					link.style.transform = "translate3d(0, 0, 0)";
				});
			});
		}
	}

	window.addEventListener("pagehide", () => {
		window.clearTimeout(livePreviewTimer);
		if (rafId) window.cancelAnimationFrame(rafId);
		if (activeFrame) unloadFrame(activeFrame);
		if (livePreviewFrame) livePreviewFrame.removeAttribute("src");
	});
})();
