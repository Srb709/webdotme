(() => {
	"use strict";

	if (document.body.dataset.pageLabel !== "Home") return;

	const selector = document.querySelector(".wdm-showcase-selector");
	if (!selector) return;

	selector.querySelectorAll(".wdm-showcase-button").forEach((button) => {
		const name = button.querySelector("strong")?.textContent?.trim() || "Project";
		button.setAttribute("aria-label", `Preview ${name}`);
	});
})();
