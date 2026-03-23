#!/bin/bash
# Download tradition images from Unsplash
# Unsplash License: free for commercial use, no attribution required

DIR="public/images/traditions"
mkdir -p "$DIR"

declare -A IMAGES=(
  # Buddhist
  ["zen"]="GqAtvZBXUeY"
  ["chan-buddhism"]="TXnkB50LDyQ"
  ["tibetan-buddhism-gelug"]="oe-R4ltNcj8"
  ["vajrayana"]="yI-2Dv7MwDA"
  ["dzogchen"]="e6x39Tqj0g4"
  ["mahayana"]="Fmb_o0TbIBw"
  ["theravada"]="-T30-kCVPro"
  ["early-buddhism"]="xwB8Q2xO6uU"
  ["vipassana-movement"]="YFdAwkcJCIY"
  # Vedic-Yogic
  ["advaita-vedanta"]="ye3Ii-vCQL8"
  ["classical-yoga"]="niH7Z81S44g"
  ["bhakti"]="UNhWb06Clfc"
  ["kashmir-shaivism"]="rpVZjt81dMw"
  ["vedanta"]="MSJ0h0iXZ7o"
  ["tantra"]="Rz-nyXM_Xe0"
  ["hatha-yoga"]="dnbsCSqSE6o"
  # Taoist
  ["taoism"]="17cN3tYHJrI"
  ["tai-chi-qigong"]="mUz0mnSG3ek"
  # Christian Contemplative
  ["christian-mysticism"]="5BksR6Ne-Vo"
  ["hesychasm"]="V2FMCaEsesw"
  ["quaker-inner-light"]="XGTvP4qG7aY"
  # Islamic Contemplative
  ["sufism"]="inJ0URyO-Ww"
  # Modern Secular
  ["modern-non-dual"]="dYhQMoZOKgU"
  ["secular-mindfulness"]="H47uK4Q98-s"
  # Other
  ["jainism"]="rke3e9P_Jcc"
  ["kabbalah"]="GlkROV0KsmE"
  ["neoplatonism"]="XtiG9jkN3zU"
  ["gnosticism"]="Pih3VZdHSwI"
)

TOTAL=${#IMAGES[@]}
COUNT=0
FAILED=0

for slug in "${!IMAGES[@]}"; do
  id="${IMAGES[$slug]}"
  COUNT=$((COUNT + 1))
  FILE="$DIR/${slug}.jpg"

  if [ -f "$FILE" ] && file "$FILE" | grep -q "JPEG"; then
    echo "[$COUNT/$TOTAL] SKIP $slug (already exists)"
    continue
  fi

  echo -n "[$COUNT/$TOTAL] $slug... "
  curl -sL "https://unsplash.com/photos/${id}/download?force=true&w=800" \
    -H "Accept: image/jpeg" \
    -o "$FILE"

  if file "$FILE" | grep -q "JPEG"; then
    SIZE=$(du -h "$FILE" | cut -f1)
    echo "OK ($SIZE)"
  else
    echo "FAILED"
    rm -f "$FILE"
    FAILED=$((FAILED + 1))
  fi

  sleep 1
done

echo ""
DOWNLOADED=$(ls "$DIR"/*.jpg 2>/dev/null | wc -l | tr -d ' ')
echo "Downloaded: $DOWNLOADED / $TOTAL"
echo "Failed: $FAILED"
du -sh "$DIR" 2>/dev/null
