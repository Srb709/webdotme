(() => {
	"use strict";

	if (!document.querySelector('link[href="/assets/portrait-blend.css"]')) {
		const portraitStylesheet = document.createElement("link");
		portraitStylesheet.rel = "stylesheet";
		portraitStylesheet.href = "/assets/portrait-blend.css";
		document.head.appendChild(portraitStylesheet);
	}

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
	const revealItems = Array.from(document.querySelectorAll(".wdm-reveal"));
	const projectChapters = Array.from(document.querySelectorAll(".wdm-project-chapter"));
	let mouseX = window.innerWidth / 2;
	let mouseY = window.innerHeight / 2;
	let cursorX = mouseX;
	let cursorY = mouseY;
	let rafId = null;
	let activeFrame = null;

	const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

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

	const updateScrollProgress = () => {
		const doc = document.documentElement;
		const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
		const progress = clamp(window.scrollY / maxScroll, 0, 1);
		root.style.setProperty("--scroll-progress", progress.toFixed(4));
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

		revealItems.forEach((item) => revealObserver.observe(item));
	} else {
		revealItems.forEach((item) => item.classList.add("is-visible"));
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
		if (rafId) window.cancelAnimationFrame(rafId);
		if (activeFrame) unloadFrame(activeFrame);
	});
})();
