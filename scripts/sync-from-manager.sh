#!/bin/bash
# pokemon-go-manager에서 공유 파일을 복사하는 동기화 스크립트
SRC=/Users/bitena/claude-code/pokemon-go-manager
DST=/Users/bitena/claude-code/pokemon-go-ena

FILES=(
  src/app/search-builder/page.tsx
  src/app/manhole-map/page.tsx
  src/app/jeju-map/page.tsx
  src/app/events/page.tsx
  src/lib/search-filters.ts
  src/hooks/useLocalStorage.ts
  src/types/index.ts
  src/components/maps/ManholeMapView.tsx
  src/components/maps/JejuMapView.tsx
  src/components/layout/SyncButton.tsx
  public/data/pokedex.json
  public/data/manholes.json
  public/data/jeju-map.json
  public/data/events.json
  public/data/community-days.json
  public/data/event-history.json
)

for f in "${FILES[@]}"; do
  cp "$SRC/$f" "$DST/$f"
  echo "Synced: $f"
done

echo "Done! Run 'npm run build' to verify."
