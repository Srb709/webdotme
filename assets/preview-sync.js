(() => {
	"use strict";

	const saveData = Boolean(navigator.connection && navigator.connection.saveData);
	if (saveData) return;

	const projects = {
		lute: {
			url: "https://littlelutestudio.com",
			title: "Little Lute Studio live website preview"
		},
		foundry: {
			url: "https://foundry-no-9.vercel.app",
			title: "Foundry No. 9 live website preview"
		},
		monolith: {
			url: "https://monolith-architecture-gamma.vercel.app",
			title: "MØNOLITH Architecture live website preview"
		}
	};

	const createFrame = (container, project, className) => {
		if (!container || !project || container.querySelector(`.${className}`)) return null;

		const frame = document.createElement("iframe");
		frame.className = className;
		frame.dataset.src = project.url;
		frame.loading = "lazy";
		frame.tabIndex = -1;
		frame.setAttribute("aria-hidden", "true");
		frame.title = project.title;
		container.appendChild(frame);
		return frame;
	};

	const loadFrame = (frame) => {
		if (!frame || frame.getAttribute("src") || !frame.dataset.src) return;
		frame.src = frame.dataset.src;
	};

	const markLoaded = (frame) => {
		const container = frame.closest(".wdm-project-portal, .work-feature-visual");
		container?.classList.add("is-live-preview");
	};

	const frames = [];
	const homePortals = [
		[document.querySelector("#little-lute .wdm-project-portal"), projects.lute],
		[document.querySelector("#foundry .wdm-project-portal"), projects.foundry],
		[document.querySelector("#monolith .wdm-project-portal"), projects.monolith]
	];

	homePortals.forEach(([portal, project]) => {
		const frame = createFrame(portal, project, "wdm-live-frame");
		if (frame) frames.push(frame);
	});

	const workFeatures = Array.from(document.querySelectorAll(".work-feature"));
	const workProjects = [projects.lute, projects.foundry, projects.monolith];

	workFeatures.slice(0, 3).forEach((feature, index) => {
		const visual = feature.querySelector(".work-feature-visual");
		const project = workProjects[index];
		const frame = createFrame(visual, project, "work-feature-live");
		if (frame) frames.push(frame);
	});

	const path = window.location.pathname;
	let caseProject = null;
	if (path.includes("/work/little-lute-studio/")) caseProject = projects.lute;
	if (path.includes("/work/foundry-no-9/")) caseProject = projects.foundry;
	if (path.includes("/work/monolith-architecture/")) caseProject = projects.monolith;

	if (caseProject) {
		const caseVisual = document.querySelector(".work-feature-visual");
		const frame = createFrame(caseVisual, caseProject, "case-preview-live");
		if (frame) frames.push(frame);
	}

	frames.forEach((frame) => frame.addEventListener("load", () => markLoaded(frame)));

	const observeFrame = (frame) => {
		if (!("IntersectionObserver" in window)) {
			loadFrame(frame);
			return;
		}

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting || entry.intersectionRatio < 0.08) return;
				loadFrame(frame);
				observer.disconnect();
			});
		}, {
			rootMargin: "320px 0px 320px 0px",
			threshold: [0.08, 0.2]
		});

		observer.observe(frame);
	};

	frames.forEach(observeFrame);

	const setupShowcaseSelector = () => {
		const selector = document.querySelector(".wdm-showcase-selector");
		if (!selector) return false;
		if (selector.dataset.liveSyncReady === "true") return true;

		const stage = selector.querySelector(".wdm-showcase-stage");
		const frame = selector.querySelector(".wdm-showcase-live");
		const buttons = Array.from(selector.querySelectorAll(".wdm-showcase-button"));
		if (!stage || !frame || !buttons.length) return false;

		selector.dataset.liveSyncReady = "true";
		frame.loading = "lazy";
		frame.tabIndex = -1;
		frame.setAttribute("aria-hidden", "true");

		const activateLivePreview = (button) => {
			const project = projects[button.dataset.project];
			if (!project) return;

			stage.classList.remove("is-live", "is-live-preview");
			frame.dataset.src = project.url;
			if (frame.getAttribute("src") !== project.url) {
				frame.removeAttribute("src");
				window.requestAnimationFrame(() => {
					frame.src = project.url;
				});
			}
		};

		buttons.forEach((button) => {
			button.addEventListener("click", () => activateLivePreview(button));
			button.addEventListener("focus", () => activateLivePreview(button));
		});

		frame.addEventListener("load", () => {
			if (!frame.getAttribute("src")) return;
			stage.classList.add("is-live-preview");
		});

		const loadInitial = () => {
			const activeButton = buttons.find((button) => button.getAttribute("aria-pressed") === "true") || buttons[0];
			activateLivePreview(activeButton);
		};

		if (!("IntersectionObserver" in window)) {
			loadInitial();
			return true;
		}

		const selectorObserver = new IntersectionObserver((entries) => {
			if (!entries.some((entry) => entry.isIntersecting)) return;
			loadInitial();
			selectorObserver.disconnect();
		}, {
			rootMargin: "260px 0px 260px 0px",
			threshold: 0.05
		});

		selectorObserver.observe(selector);
		return true;
	};

	if (!setupShowcaseSelector()) {
		const mutationObserver = new MutationObserver(() => {
			if (!setupShowcaseSelector()) return;
			mutationObserver.disconnect();
		});
		mutationObserver.observe(document.body, { childList: true, subtree: true });
	}
})();
