#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/assets/social"
BG="$ROOT/assets/social/webdotme-social-background.jpg"
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
MONO="/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
LIME="#adff2f"
WHITE="#f3f3ef"
MUTED="#94958f"

mkdir -p "$OUT"

base_card() {
  local output="$1" eyebrow="$2" line1="$3" line2="$4" detail="$5"
  convert "$BG" -resize '1200x630^' -gravity center -extent 1200x630 \
    -gravity northwest \
    -fill "$LIME" -font "$MONO" -pointsize 18 -kerning 4 -annotate +70+92 "$eyebrow" \
    -fill "$WHITE" -font "$BOLD" -pointsize 67 -kerning -3 -annotate +66+250 "$line1" \
    -annotate +66+330 "$line2" \
    -fill "$MUTED" -font "$FONT" -pointsize 23 -kerning 0 -annotate +70+410 "$detail" \
    -fill "$WHITE" -font "$BOLD" -pointsize 26 -kerning -1 -annotate +70+562 'webdotme' \
    -fill "$LIME" -draw 'circle 48,552 55,552' \
    -quality 88 "$OUT/$output"
}

base_card 'home.jpg' 'PHILADELPHIA · INDEPENDENT STUDIO' 'DISTINCTIVE WEBSITES' 'FOR SMALL BUSINESSES.' 'Strategy, design, development and local SEO.'
base_card 'services.jpg' 'WEBDOTME · SERVICES' 'BUILT TO LOOK GOOD.' 'BUILT TO WORK.' 'Web design · Development · Local SEO · Support'
base_card 'start-a-project.jpg' 'START A PROJECT' "LET'S BUILD SOMETHING" 'WORTH REMEMBERING.' 'One person. Zero handoffs. Clear communication.'

convert "$BG" -resize '1200x630^' -gravity center -extent 1200x630 \
  \( "$ROOT/assets/steve-brooks-office.webp" -resize '650x650^' -gravity center -crop 650x630+0+0 +repage \
     -modulate 82,78,100 -contrast \) -gravity east -composite \
  -size 760x630 gradient:'#090a09ff-#090a0900' -gravity west -composite \
  -fill "$LIME" -font "$MONO" -pointsize 18 -kerning 4 -gravity northwest -annotate +70+92 'ABOUT WEBDOTME' \
  -fill "$WHITE" -font "$BOLD" -pointsize 72 -kerning -3 -annotate +66+245 'STEVE BROOKS' \
  -fill "$MUTED" -font "$FONT" -pointsize 25 -kerning 0 -annotate +70+315 'Independent web designer + developer' \
  -fill "$WHITE" -font "$BOLD" -pointsize 26 -kerning -1 -annotate +70+562 'webdotme' \
  -fill "$LIME" -draw 'circle 48,552 55,552' \
  -quality 88 "$OUT/about.jpg"

case_card() {
  local output="$1" image="$2" title1="$3" title2="$4" detail="$5" crop_height="$6"
  convert "$BG" -resize '1200x630^' -gravity center -extent 1200x630 \
    \( "$image" -gravity north -crop "1348x${crop_height}+0+0" +repage -resize '520x410^' -gravity north -extent 520x410 \
       -bordercolor '#3a3d38' -border 2 \) -gravity northeast -geometry +60+110 -composite \
    -fill "$LIME" -font "$MONO" -pointsize 17 -kerning 4 -gravity northwest -annotate +65+86 'CASE STUDY' \
    -fill "$WHITE" -font "$BOLD" -pointsize 56 -kerning -3 -annotate +61+235 "$title1" \
    -annotate +61+302 "$title2" \
    -fill "$MUTED" -font "$FONT" -pointsize 21 -kerning 0 -annotate +65+372 "$detail" \
    -fill "$WHITE" -font "$BOLD" -pointsize 25 -kerning -1 -annotate +65+562 'webdotme' \
    -fill "$LIME" -draw 'circle 43,552 50,552' \
    -quality 88 "$OUT/$output"
}

case_card 'little-lute-studio.jpg' "$ROOT/assets/portfolio/little-lute-site-desktop.webp" 'LITTLE LUTE' 'STUDIO' 'Embroidery + mobile spray tanning' 1700

convert "$BG" -resize '1200x630^' -gravity center -extent 1200x630 \
  \( "$ROOT/assets/portfolio/little-lute-site-desktop.webp" -gravity north -crop 1363x1500+0+0 +repage -resize '420x390^' -gravity north -extent 420x390 -bordercolor '#3a3d38' -border 2 \) -gravity northeast -geometry +65+110 -composite \
  -fill "$LIME" -font "$MONO" -pointsize 18 -kerning 4 -gravity northwest -annotate +70+92 'SELECTED WORK' \
  -fill "$WHITE" -font "$BOLD" -pointsize 68 -kerning -3 -annotate +66+245 'SITES WITH' \
  -annotate +66+325 'SUBSTANCE.' \
  -fill "$MUTED" -font "$FONT" -pointsize 23 -annotate +70+405 'Designed and built in Philadelphia.' \
  -fill "$WHITE" -font "$BOLD" -pointsize 26 -kerning -1 -annotate +70+562 'webdotme' \
  -fill "$LIME" -draw 'circle 48,552 55,552' \
  -quality 88 "$OUT/work.jpg"

identify "$OUT"/*.jpg
