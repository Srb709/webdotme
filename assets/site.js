(() => {
	"use strict";

	if (!document.querySelector('link[href="/assets/portrait-blend.css"]')) {
		const portraitStylesheet = document.createElement("link");
		portraitStylesheet.rel = "stylesheet";
		portraitStylesheet.href = "/assets/portrait-blend.css";
		document.head.appendChild(portraitStylesheet);
	}

	window.va = window.va || function () {
		(window.vaq = window.vaq || []).push(arguments);
	};

	if (!document.querySelector('script[src="/_vercel/insights/script.js"]')) {
		const analyticsScript = document.createElement("script");
		analyticsScript.src = "/_vercel/insights/script.js";
		analyticsScript.defer = true;
		document.head.appendChild(analyticsScript);
	}

	window.si = window.si || function () {
		(window.siq = window.siq || []).push(arguments);
	};

	if (!document.querySelector('script[src="/_vercel/speed-insights/script.js"]')) {
		const speedScript = document.createElement("script");
		speedScript.src = "/_vercel/speed-insights/script.js";
		speedScript.defer = true;
		document.head.appendChild(speedScript);
	}

	const body = document.body;
	const menu = document.querySelector(".menu");
	const openButton = document.querySelector("[data-menu-open]");
	const closeButton = document.querySelector("[data-menu-close]");
	const transition = document.querySelector(".page-transition");
	const transitionTitle = transition?.querySelector(".pt-title");
	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	const breadcrumbRoutes = {
		"/services/website-design/": ["Home", "Services", "Website Design"],
		"/services/website-development/": ["Home", "Services", "Website Development"],
		"/services/local-seo/": ["Home", "Services", "Local SEO"],
		"/services/website-support/": ["Home", "Services", "Website Support"],
		"/work/little-lute-studio/": ["Home", "Work", "Little Lute Studio"],
		"/work/foundry-no-9/": ["Home", "Work", "Foundry No. 9"],
		"/work/monolith-architecture/": ["Home", "Work", "MØNOLITH Architecture"]
	};

	const routeUrls = {
		Home: "https://www.webdotme.com/",
		Services: "https://www.webdotme.com/services/",
		Work: "https://www.webdotme.com/work/",
		"Website Design": "https://www.webdotme.com/services/website-design/",
		"Website Development": "https://www.webdotme.com/services/website-development/",
		"Local SEO": "https://www.webdotme.com/services/local-seo/",
		"Website Support": "https://www.webdotme.com/services/website-support/",
		"Little Lute Studio": "https://www.webdotme.com/work/little-lute-studio/",
		"Foundry No. 9": "https://www.webdotme.com/work/foundry-no-9/",
		"MØNOLITH Architecture": "https://www.webdotme.com/work/monolith-architecture/"
	};

	const crumbs = breadcrumbRoutes[window.location.pathname];
	if (crumbs) {
		const breadcrumbScript = document.createElement("script");
		breadcrumbScript.type = "application/ld+json";
		breadcrumbScript.textContent = JSON.stringify({
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			itemListElement: crumbs.map((name, index) => ({
				"@type": "ListItem",
				position: index + 1,
				name,
				item: routeUrls[name]
			}))
		});
		document.head.appendChild(breadcrumbScript);
	}

	const stripArrowGlyphs = () => {
		const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
		const nodes = [];
		while (walker.nextNode()) nodes.push(walker.currentNode);

		nodes.forEach((node) => {
			if (!/[↗→➜➝➞]/.test(node.nodeValue || "")) return;
			node.nodeValue = (node.nodeValue || "").replace(/[↗→➜➝➞]/g, "").replace(/\s{2,}/g, " ").trimEnd();
		});

		document.querySelectorAll("a").forEach((link) => {
			if (
				link.classList.contains("menu-link") ||
				link.classList.contains("next-page") ||
				link.classList.contains("button-line") ||
				link.classList.contains("project-row") ||
				link.classList.contains("nav-cta")
			) return;

			if (
				link.classList.contains("service-deep-link") ||
				link.closest(".contact-strip") ||
				link.closest(".local-list") ||
				link.closest(".article-body") ||
				link.closest(".contact-shortcuts")
			) {
				link.classList.add("clean-arrow-link");
			}
		});
	};

	stripArrowGlyphs();

	const resetRouteState = () => {
		body.classList.remove("transitioning", "page-enter", "menu-open");
		openButton?.setAttribute("aria-expanded", "false");
	};

	window.addEventListener("pagehide", resetRouteState);
	window.addEventListener("pageshow", () => {
		resetRouteState();
		requestAnimationFrame(resetRouteState);
	});

	if (transitionTitle) {
		transitionTitle.textContent = body.dataset.pageLabel || "WebDotMe";
	}

	if (!reduceMotion && transition) {
		requestAnimationFrame(() => {
			body.classList.add("page-enter");
			setTimeout(() => body.classList.remove("page-enter"), 800);
		});
	}

	const toggleMenu = (open) => {
		body.classList.toggle("menu-open", open);
		openButton?.setAttribute("aria-expanded", open ? "true" : "false");
		menu?.setAttribute("aria-hidden", open ? "false" : "true");
	};

	openButton?.addEventListener("click", () => toggleMenu(!body.classList.contains("menu-open")));
	closeButton?.addEventListener("click", () => toggleMenu(false));
	menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => toggleMenu(false)));
	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape") toggleMenu(false);
	});

	const shouldTransition = (link) => {
		if (!link || link.target === "_blank" || link.hasAttribute("download") || reduceMotion) return false;
		const href = link.getAttribute("href") || "";
		if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("sms:")) return false;

		try {
			const url = new URL(link.href, window.location.href);
			return url.origin === window.location.origin && url.pathname !== window.location.pathname;
		} catch {
			return false;
		}
	};

	document.addEventListener("click", (event) => {
		const link = event.target.closest("a[data-transition], .menu a[href], .desktop-nav a[href], .next-page[href], .logo[href]");
		if (!shouldTransition(link)) return;

		event.preventDefault();
		toggleMenu(false);
		if (transitionTitle) {
			transitionTitle.textContent = link.dataset.label || link.textContent.trim() || "Next";
		}
		body.classList.remove("page-enter");
		body.classList.add("transitioning");
		setTimeout(() => {
			window.location.href = link.href;
		}, 430);
	});

	if (!reduceMotion && "IntersectionObserver" in window && !CSS.supports("animation-timeline: view()")) {
		document.documentElement.classList.add("observer-reveal");
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				entry.target.classList.add("is-visible");
				observer.unobserve(entry.target);
			});
		}, {
			rootMargin: "0px 0px -10% 0px",
			threshold: 0.12
		});

		document.querySelectorAll(".reveal, .reveal-left").forEach((element) => observer.observe(element));
	}

	const track = (name, data = {}) => {
		if (typeof window.va === "function") {
			window.va("event", { name, data });
		}
		if (typeof window.gtag === "function") {
			window.gtag("event", name, data);
		}
	};

	document.addEventListener("click", (event) => {
		const link = event.target.closest("a");
		if (!link) return;
		const href = link.getAttribute("href") || "";

		if (href.startsWith("mailto:")) track("email_click", { page: window.location.pathname });
		if (href.startsWith("tel:")) track("phone_click", { page: window.location.pathname });
		if (href.startsWith("sms:")) track("text_click", { page: window.location.pathname });

		if (/^https?:\/\//i.test(href) && !href.includes("webdotme.com")) {
			try {
				track("outbound_click", {
					destination: new URL(href).hostname,
					page: window.location.pathname
				});
			} catch {
				// Ignore malformed external links rather than interrupting navigation.
			}
		}
	});

	const form = document.getElementById("projectForm");
	const status = document.getElementById("projectFormStatus");

	if (form) {
		form.addEventListener("input", () => {
			if (form.dataset.started) return;
			form.dataset.started = "true";
			track("project_form_started", { page: window.location.pathname });
		}, { once: true });

		form.addEventListener("submit", (event) => {
			event.preventDefault();
			if (!form.reportValidity()) return;

			const data = new FormData(form);
			const needs = data.getAll("needs").map(String);
			const payload = {
				name: String(data.get("name") || ""),
				email: String(data.get("email") || ""),
				phone: String(data.get("phone") || ""),
				business: String(data.get("business") || ""),
				websiteInstagram: String(data.get("website_instagram") || ""),
				needs,
				budget: String(data.get("budget") || ""),
				project: String(data.get("project") || "")
			};

			const draft = `Hey Steve — I just filled out the WebDotMe project form.\n\nName: ${payload.name}\nEmail: ${payload.email}\nPhone: ${payload.phone || "Not provided"}\nBusiness: ${payload.business || "Not provided"}\nWebsite / Instagram: ${payload.websiteInstagram || "Not provided"}\nNeeds: ${needs.length ? needs.join(", ") : "Not selected"}\nBudget: ${payload.budget || "Not selected"}\n\nProject:\n${payload.project}`;

			track("project_form_completed", {
				contact_method: "sms",
				selected_services: needs.join(", ")
			});

			if (status) status.textContent = "Opening your prepared text…";
			window.location.href = `sms:+12157799288?&body=${encodeURIComponent(draft)}`;
		});
	}
})();
