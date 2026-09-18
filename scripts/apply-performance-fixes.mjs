import { readFile, writeFile } from "node:fs/promises";

async function update(path, transform) {
  const before = await readFile(path, "utf8");
  const after = transform(before);
  if (after === before) throw new Error(`No changes made to ${path}`);
  await writeFile(path, after);
}

function portfolioPicture({ prefix, name, widths, sizes, alt, width, height, priority = false }) {
  const avif = widths.map((w) => `${prefix}${name}-${w}.avif ${w}w`).join(", ");
  const webp = widths.map((w) => `${prefix}${name}-${w}.webp ${w}w`).join(", ");
  const loading = priority ? ' fetchpriority="high"' : ' loading="lazy"';
  return `<picture><source sizes="${sizes}" srcset="${avif}" type="image/avif"/><source sizes="${sizes}" srcset="${webp}" type="image/webp"/><img alt="${alt}" decoding="async"${loading} height="${height}" src="${prefix}${name}-${widths[1]}.webp" width="${width}"/></picture>`;
}

const homeWbg = portfolioPicture({
  prefix: "assets/portfolio/",
  name: "washington-benefits-homepage",
  widths: [800, 1200, 1800],
  sizes: "(max-width: 760px) 92vw, 1100px",
  alt: "Washington Benefits Group website homepage with health insurance and Medicare guidance",
  width: 1800,
  height: 775,
});
const homeEmbroidery = portfolioPicture({
  prefix: "assets/portfolio/",
  name: "little-lute-embroidery",
  widths: [480, 800, 1086],
  sizes: "(max-width: 760px) 42vw, 450px",
  alt: "Cream sweatshirt embroidered with the Little Lute Studio logo",
  width: 1086,
  height: 1448,
});
const homeTan = portfolioPicture({
  prefix: "assets/portfolio/",
  name: "little-lute-spray-tan",
  widths: [480, 800, 1140],
  sizes: "(max-width: 760px) 42vw, 450px",
  alt: "Bride photographed indoors for Little Lute Studio’s mobile spray tanning service",
  width: 1140,
  height: 1580,
});

await update("index.html", (html) => html
  .replace('<img alt="Washington Benefits Group website homepage with health insurance and Medicare guidance" loading="lazy" src="assets/washington-benefits-homepage.jpg"/>', homeWbg)
  .replace('<img alt="Cream sweatshirt embroidered with the Little Lute Studio logo" loading="lazy" src="https://raw.githubusercontent.com/Srb709/-little-lute-studio/main/public/embroidery/brand-crewneck.png"/><img alt="Bride photographed indoors for Little Lute Studio’s mobile spray tanning service" loading="lazy" src="https://raw.githubusercontent.com/Srb709/-little-lute-studio/main/public/spray-tan/bride-indoor.png"/>', homeEmbroidery + homeTan)
  .replace('<a class="case-link" data-label="Washington Benefits Group"', '<a aria-label="View the Washington Benefits Group case study" class="case-link" data-label="Washington Benefits Group"')
  .replace('<a class="case-link" data-label="Little Lute Studio"', '<a aria-label="View the Little Lute Studio case study" class="case-link" data-label="Little Lute Studio"')
);

const caseEmbroidery = portfolioPicture({
  prefix: "../../assets/portfolio/",
  name: "little-lute-embroidery",
  widths: [480, 800, 1086],
  sizes: "(max-width: 760px) 44vw, 480px",
  alt: "Cream sweatshirt embroidered with the Little Lute Studio logo",
  width: 1086,
  height: 1448,
  priority: true,
});
const caseTan = portfolioPicture({
  prefix: "../../assets/portfolio/",
  name: "little-lute-spray-tan",
  widths: [480, 800, 1140],
  sizes: "(max-width: 760px) 44vw, 480px",
  alt: "Bride photographed indoors for Little Lute Studio’s mobile spray tanning service",
  width: 1140,
  height: 1580,
});
await update("work/little-lute-studio/index.html", (html) => html.replace(
  '<img alt="Cream sweatshirt embroidered with the Little Lute Studio logo" loading="lazy" src="https://raw.githubusercontent.com/Srb709/-little-lute-studio/main/public/embroidery/brand-crewneck.png"/><img alt="Bride photographed indoors for Little Lute Studio’s mobile spray tanning service" loading="lazy" src="https://raw.githubusercontent.com/Srb709/-little-lute-studio/main/public/spray-tan/bride-indoor.png"/>',
  caseEmbroidery + caseTan,
));

const caseWbg = portfolioPicture({
  prefix: "../../assets/portfolio/",
  name: "washington-benefits-homepage",
  widths: [800, 1200, 1800],
  sizes: "(max-width: 760px) 92vw, 680px",
  alt: "Washington Benefits Group website homepage displayed in a desktop browser mockup",
  width: 1800,
  height: 775,
  priority: true,
});
const showcaseWbg = portfolioPicture({
  prefix: "../../assets/portfolio/",
  name: "washington-benefits-homepage",
  widths: [800, 1200, 1800],
  sizes: "(max-width: 760px) 92vw, 760px",
  alt: "",
  width: 1800,
  height: 775,
});
await update("work/washington-benefits-group/index.html", (html) => html
  .replace('<img alt="Washington Benefits Group website homepage displayed in a desktop browser mockup" loading="eager" src="../../assets/washington-benefits-homepage.jpg"/>', caseWbg)
  .replace('<img alt="" loading="lazy" src="../../assets/washington-benefits-homepage.jpg"/>', showcaseWbg)
);

await update("assets/site-core.css", (css) => css.replace(
  ".lute-images{display:grid;grid-template-columns:1fr 1fr;gap:17px;align-items:center;padding:0 2px}",
  ".lute-images{display:grid;grid-template-columns:1fr 1fr;gap:17px;align-items:center;padding:0 2px}\n.lute-images picture,.case-hero-images picture{display:contents}",
));
await update("assets/site.css", (css) => css + "\n/* Footer contact details remain readable and comfortably tappable on mobile. */\nfooter{color:#999a93}\nfooter a{display:inline-flex;align-items:center;min-height:24px}\n");
