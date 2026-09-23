(() => {
	"use strict";

	if (document.body.dataset.pageLabel !== "Home") return;

	const selector = document.querySelector(".wdm-showcase-selector");
	if (!selector) return;

	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const stage = selector.querySelector(".wdm-showcase-stage");
	const liveFrame = selector.querySelector(".wdm-showcase-live");
	const targets = {
		lute: "#little-lute",
		foundry: "#foundry",
		monolith: "#monolith"
	};

	if (liveFrame) liveFrame.remove();
	stage?.classList.remove("is-live");

	selector.querySelectorAll(".wdm-showcase-button").forEach((button) => {
		button.removeAttribute("data-live");
		const project = button.dataset.project;
		const targetSelector = project ? targets[project] : null;
		if (!targetSelector) return;

		button.setAttribute("aria-label", `${button.querySelector("strong")?.textContent || "Project"}. Jump to project details.`);
		button.addEventListener("click", () => {
			const target = document.querySelector(targetSelector);
			if (!target) return;

			target.scrollIntoView({
				behavior: reduceMotion ? "auto" : "smooth",
				block: "start"
			});
		});
	});
})();
