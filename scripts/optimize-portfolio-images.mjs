import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const outputDirectory = "assets/portfolio";
await mkdir(outputDirectory, { recursive: true });

const images = [
  {
    source: "https://raw.githubusercontent.com/Srb709/-little-lute-studio/main/public/embroidery/brand-crewneck.png",
    name: "little-lute-embroidery",
    widths: [480, 800, 1086],
  },
  {
    source: "https://raw.githubusercontent.com/Srb709/-little-lute-studio/main/public/spray-tan/bride-indoor.png",
    name: "little-lute-spray-tan",
    widths: [480, 800, 1140],
  },
  {
    source: "https://www.webdotme.com/assets/washington-benefits-homepage.jpg",
    name: "washington-benefits-homepage",
    widths: [800, 1200, 1800],
  },
];

for (const image of images) {
  const response = await fetch(image.source);
  if (!response.ok) throw new Error(`Could not download ${image.source}: ${response.status}`);
  const source = Buffer.from(await response.arrayBuffer());

  for (const width of image.widths) {
    const resized = sharp(source).resize({ width, withoutEnlargement: true });
    await resized.clone().avif({ quality: 55, effort: 5 }).toFile(`${outputDirectory}/${image.name}-${width}.avif`);
    await resized.clone().webp({ quality: 78, effort: 5 }).toFile(`${outputDirectory}/${image.name}-${width}.webp`);
  }
}
