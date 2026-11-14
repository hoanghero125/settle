#!/usr/bin/env bash
# Tạo lại bộ giấy tờ mẫu:
#   src/fixtures/papers/src/<id>.html  ->  docs/demo-papers/<id>.pdf   (A4 sạch, 1 trang)
#                                      ->  src/fixtures/papers/<id>.jpg (giả ảnh chụp điện thoại)
#   not-paperwork.jpg được vẽ thẳng bằng ImageMagick (không có HTML/PDF).
# Cần: google-chrome, ImageMagick (convert), font Noto Sans/Serif CJK JP/KR/TC.
# Dùng: bash src/fixtures/papers/src/build.sh [id ...]   (không truyền id = tạo tất cả)
set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)"
JPG_DIR="$(cd "$SRC/.." && pwd)"
ROOT="$(cd "$SRC/../../../.." && pwd)"
PDF_DIR="$ROOT/docs/demo-papers"
CHROME="${CHROME:-google-chrome}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$PDF_DIR"

# Chrome cần TMPDIR ngắn (đường dẫn socket); mã thoát bị bỏ qua, file ra được kiểm tra ở dưới.
chrome() { TMPDIR=/tmp "$CHROME" --headless --no-sandbox --disable-gpu --hide-scrollbars --user-data-dir="$TMP/profile" "$@" >/dev/null 2>&1 || true; }

# Ảnh A4 -> ảnh chụp: tờ giấy trên mặt bàn gỗ, nghiêng nhẹ, phối cảnh nhẹ, ánh sáng không đều, nhiễu, JPEG q72.
photo() { # $1=png vào  $2=jpg ra  $3=seed  $4=góc xoay (độ)
  local in="$1" out="$2" seed="$3" rot="$4"
  convert "$in" -resize x1380 -bordercolor '#fbfaf6' -border 6 "$TMP/sheet.png"
  local w h; read -r w h < <(identify -format '%w %h\n' "$TMP/sheet.png")
  convert "$TMP/sheet.png" -alpha set -virtual-pixel transparent \
    -distort Perspective "0,0 18,10  $w,0 $((w-8)),0  0,$h 0,$h  $w,$h $w,$((h-14))" \
    -background none -rotate "$rot" \
    \( +clone -background '#000' -shadow 55x10+10+12 \) +swap -background none -layers merge +repage \
    "$TMP/tilted.png"
  convert -size 1240x1600 -seed "$seed" plasma:fractal -colorspace gray -motion-blur 0x60+3 -blur 0x1 -auto-level +level-colors '#5a3f2b,#a5825d' "$TMP/desk.png"
  convert -size 1900x2300 radial-gradient:'#ffffff-#7d7d7d' -crop 1240x1600+$((180 + seed % 200))+260 +repage "$TMP/light.png"
  convert "$TMP/desk.png" "$TMP/tilted.png" -gravity center -composite \
    "$TMP/light.png" -compose multiply -composite \
    -fill '#ffeccc' -colorize 5% -seed "$seed" -attenuate 0.35 +noise Gaussian -blur 0x0.45 \
    -resize 1600x1600 -strip -quality 72 "$out"
}

build_html() { # $1=id $2=seed $3=góc
  local id="$1"
  rm -f "$PDF_DIR/$id.pdf"
  chrome --no-pdf-header-footer --print-to-pdf="$PDF_DIR/$id.pdf" "file://$SRC/$id.html"
  chrome --force-device-scale-factor=2 --window-size=794,1123 --screenshot="$TMP/$id.png" "file://$SRC/$id.html"
  [ -s "$PDF_DIR/$id.pdf" ] && [ -s "$TMP/$id.png" ] || { echo "FAIL $id (chrome)" >&2; exit 1; }
  photo "$TMP/$id.png" "$JPG_DIR/$id.jpg" "$2" "$3"
  echo "ok  $id"
}

build_not_paperwork() { # Ảnh thường, không có giấy tờ: phong cảnh mờ (trời, mặt trời, đồi).
  convert -size 1200x1600 gradient:'#8fbfe3-#f4e2c6' \
    -fill '#fff3cf' -draw 'circle 820,560 820,650' \
    -fill '#93a873' -draw 'ellipse 250,1450 760,420 180,360' \
    -fill '#6f8c55' -draw 'ellipse 1050,1550 820,470 180,360' \
    -fill '#4f6b3d' -draw 'ellipse 500,1750 1000,380 180,360' \
    -blur 0x14 -seed 7 -attenuate 0.5 +noise Gaussian -blur 0x0.6 \
    -resize 1600x1600 -strip -quality 72 "$JPG_DIR/not-paperwork.jpg"
  echo "ok  not-paperwork"
}

# id  seed  góc xoay
PAPERS="ja-resident-tax 11 -1.6
ja-health-insurance 23 2.1
ja-pension-info 37 -2.4
ko-health-insurance 41 1.4
ko-stay-expiry 53 -1.2
zh-tw-income-tax 67 2.6"

want() { [ $# -eq 0 ] && return 0; local x="$1"; shift; for a in "$@"; do [ "$a" = "$x" ] && return 0; done; return 1; }

while read -r id seed rot; do
  [ -f "$SRC/$id.html" ] || continue
  if [ $# -eq 0 ] || want "$id" "$@"; then build_html "$id" "$seed" "$rot"; fi
done <<< "$PAPERS"
if [ $# -eq 0 ] || want not-paperwork "$@"; then build_not_paperwork; fi
