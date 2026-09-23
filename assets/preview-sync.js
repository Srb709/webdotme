(() => {
	"use strict";

	const desktop = window.matchMedia("(min-width: 901px)");
	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const saveData = Boolean(navigator.connection && navigator.connection.saveData);

	if (!desktop.matches || reduceMotion || saveData) return;

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

	const loadFrame = (frame) => {
		if (!frame || frame.src || !frame.dataset.src) return;
		frame.src = frame.dataset.src;
	};

	const markLoaded = (frame) => {
		const container = frame.closest(".wdm-project-portal, .work-feature-visual");
		container?.classList.add("is-live-preview");
	};

	frames.forEach((frame) => frame.addEventListener("load", () => markLoaded(frame)));

	if (!("IntersectionObserver" in window)) {
		frames.forEach(loadFrame);
		return;
	}

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting || entry.intersectionRatio < 0.12) return;
			loadFrame(entry.target);
			observer.unobserve(entry.target);
		});
	}, {
		rootMargin: "260px 0px 260px 0px",
		threshold: [0.12, 0.3]
	});

	frames.forEach((frame) => observer.observe(frame));
})();
