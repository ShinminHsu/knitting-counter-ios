# photo-viewer-zoom Specification

## Purpose

TBD - created by archiving change 'photo-viewer-pinch-zoom'. Update Purpose after archive.

## Requirements

### Requirement: Pinch zoom range

In the full-screen photo viewer, the user SHALL be able to pinch to zoom the current photo between 1× and 4×. Pinching beyond 4× MUST settle back at 4×, and pinching below 1× MUST settle back at 1×.

#### Scenario: Pinch to zoom in

- **WHEN** the user pinches outward on a photo at 1×
- **THEN** the photo scales up around the pinch point

#### Scenario: Pinch beyond maximum

- **WHEN** the user pinches past 4× and releases
- **THEN** the photo settles at 4×

#### Scenario: Pinch below minimum

- **WHEN** the user pinches inward on a photo at 1× and releases
- **THEN** the photo settles back at 1×


<!-- @trace
source: photo-viewer-pinch-zoom
updated: 2026-09-15
code:
  - screenshots/en/02-build-pattern/dec.png
  - screenshots/en/05-group-repeat/final.png
  - screenshots/ja/04-crochet-library/scaffold.png
  - screenshots/en/02-build-pattern/scaffold.png
  - marketing/threads-jp-posts.md
  - screenshots/composite.py
  - assets/screenshot/en/05.PNG
  - screenshots/en/05-group-repeat/scaffold.png
  - screenshots/ja/03-knitting-library/final.png
  - screenshots/ja/03-knitting-library/scaffold.png
  - screenshots/en/03-knitting-library/dec.png
  - screenshots/zh-TW/05-group-repeat/final.png
  - screenshots/zh-TW/01-never-lose-place/final.png
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/zh-TW/03-knitting-library/final.png
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
  - screenshots/zh-TW/04-crochet-library/final.png
  - screenshots/en/01-never-lose-place/dec.png
  - assets/screenshot/en/01.PNG
  - screenshots/en/04-crochet-library/dec.png
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - screenshots/en/03-knitting-library/final.png
  - screenshots/en/01-never-lose-place/final.png
  - screenshots/en/02-build-pattern/final.png
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/ja/02-build-pattern/final.png
  - marketing/ravelry-posts.md
  - screenshots/ja/05-group-repeat/scaffold.png
  - screenshots/swap_screen.py
  - screenshots/en/05-group-repeat/dec.png
  - marketing/marketing-strategy.md
  - screenshots/ja/01-never-lose-place/final.png
  - screenshots/recolor_cream.py
  - screenshots/zh-TW/02-build-pattern/final.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - screenshots/ja/05-group-repeat/final.png
  - assets/screenshot/en/04.PNG
  - assets/screenshot/en/03.PNG
  - screenshots/en/04-crochet-library/scaffold.png
  - marketing/reddit-posts.md
  - screenshots/en/04-crochet-library/final.png
  - screenshots/ja/04-crochet-library/final.png
  - screenshots/build_cream_base.py
  - assets/screenshot/en/02.PNG
-->

---
### Requirement: Double-tap zoom toggle

Double-tapping a photo at 1× SHALL zoom it to 2.5× centred on the tapped point. Double-tapping a zoomed photo SHALL return it to 1×. A single tap MUST NOT change zoom or close the viewer.

#### Scenario: Double-tap to zoom in

- **WHEN** the user double-taps the top-left area of a photo at 1×
- **THEN** the photo animates to 2.5× with the tapped area in view

#### Scenario: Double-tap to zoom out

- **WHEN** the user double-taps a photo zoomed at 3×
- **THEN** the photo animates back to 1×

#### Scenario: Single tap

- **WHEN** the user taps a photo once
- **THEN** the zoom level and current photo do not change


<!-- @trace
source: photo-viewer-pinch-zoom
updated: 2026-09-15
code:
  - screenshots/en/02-build-pattern/dec.png
  - screenshots/en/05-group-repeat/final.png
  - screenshots/ja/04-crochet-library/scaffold.png
  - screenshots/en/02-build-pattern/scaffold.png
  - marketing/threads-jp-posts.md
  - screenshots/composite.py
  - assets/screenshot/en/05.PNG
  - screenshots/en/05-group-repeat/scaffold.png
  - screenshots/ja/03-knitting-library/final.png
  - screenshots/ja/03-knitting-library/scaffold.png
  - screenshots/en/03-knitting-library/dec.png
  - screenshots/zh-TW/05-group-repeat/final.png
  - screenshots/zh-TW/01-never-lose-place/final.png
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/zh-TW/03-knitting-library/final.png
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
  - screenshots/zh-TW/04-crochet-library/final.png
  - screenshots/en/01-never-lose-place/dec.png
  - assets/screenshot/en/01.PNG
  - screenshots/en/04-crochet-library/dec.png
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - screenshots/en/03-knitting-library/final.png
  - screenshots/en/01-never-lose-place/final.png
  - screenshots/en/02-build-pattern/final.png
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/ja/02-build-pattern/final.png
  - marketing/ravelry-posts.md
  - screenshots/ja/05-group-repeat/scaffold.png
  - screenshots/swap_screen.py
  - screenshots/en/05-group-repeat/dec.png
  - marketing/marketing-strategy.md
  - screenshots/ja/01-never-lose-place/final.png
  - screenshots/recolor_cream.py
  - screenshots/zh-TW/02-build-pattern/final.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - screenshots/ja/05-group-repeat/final.png
  - assets/screenshot/en/04.PNG
  - assets/screenshot/en/03.PNG
  - screenshots/en/04-crochet-library/scaffold.png
  - marketing/reddit-posts.md
  - screenshots/en/04-crochet-library/final.png
  - screenshots/ja/04-crochet-library/final.png
  - screenshots/build_cream_base.py
  - assets/screenshot/en/02.PNG
-->

---
### Requirement: Pan while zoomed

While the current photo is zoomed above 1×, dragging SHALL pan the photo within its bounds and MUST NOT switch to another photo.

#### Scenario: Drag a zoomed photo horizontally

- **WHEN** the photo is at 2.5× and the user drags left past the photo's right edge
- **THEN** the photo stops at its edge and the page indicator still shows the same photo number


<!-- @trace
source: photo-viewer-pinch-zoom
updated: 2026-09-15
code:
  - screenshots/en/02-build-pattern/dec.png
  - screenshots/en/05-group-repeat/final.png
  - screenshots/ja/04-crochet-library/scaffold.png
  - screenshots/en/02-build-pattern/scaffold.png
  - marketing/threads-jp-posts.md
  - screenshots/composite.py
  - assets/screenshot/en/05.PNG
  - screenshots/en/05-group-repeat/scaffold.png
  - screenshots/ja/03-knitting-library/final.png
  - screenshots/ja/03-knitting-library/scaffold.png
  - screenshots/en/03-knitting-library/dec.png
  - screenshots/zh-TW/05-group-repeat/final.png
  - screenshots/zh-TW/01-never-lose-place/final.png
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/zh-TW/03-knitting-library/final.png
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
  - screenshots/zh-TW/04-crochet-library/final.png
  - screenshots/en/01-never-lose-place/dec.png
  - assets/screenshot/en/01.PNG
  - screenshots/en/04-crochet-library/dec.png
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - screenshots/en/03-knitting-library/final.png
  - screenshots/en/01-never-lose-place/final.png
  - screenshots/en/02-build-pattern/final.png
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/ja/02-build-pattern/final.png
  - marketing/ravelry-posts.md
  - screenshots/ja/05-group-repeat/scaffold.png
  - screenshots/swap_screen.py
  - screenshots/en/05-group-repeat/dec.png
  - marketing/marketing-strategy.md
  - screenshots/ja/01-never-lose-place/final.png
  - screenshots/recolor_cream.py
  - screenshots/zh-TW/02-build-pattern/final.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - screenshots/ja/05-group-repeat/final.png
  - assets/screenshot/en/04.PNG
  - assets/screenshot/en/03.PNG
  - screenshots/en/04-crochet-library/scaffold.png
  - marketing/reddit-posts.md
  - screenshots/en/04-crochet-library/final.png
  - screenshots/ja/04-crochet-library/final.png
  - screenshots/build_cream_base.py
  - assets/screenshot/en/02.PNG
-->

---
### Requirement: Swipe paging at 1x

When the current photo is at 1×, horizontal swiping SHALL switch between photos with paging, and the page indicator SHALL update, as before this change.

#### Scenario: Swipe to next photo

- **WHEN** the viewer shows photo 1 of 3 at 1× and the user swipes left
- **THEN** photo 2 is shown and the indicator reads "2 / 3"

#### Scenario: Single photo

- **WHEN** the project has exactly one photo
- **THEN** pinch and double-tap zoom work and no page indicator is shown


<!-- @trace
source: photo-viewer-pinch-zoom
updated: 2026-09-15
code:
  - screenshots/en/02-build-pattern/dec.png
  - screenshots/en/05-group-repeat/final.png
  - screenshots/ja/04-crochet-library/scaffold.png
  - screenshots/en/02-build-pattern/scaffold.png
  - marketing/threads-jp-posts.md
  - screenshots/composite.py
  - assets/screenshot/en/05.PNG
  - screenshots/en/05-group-repeat/scaffold.png
  - screenshots/ja/03-knitting-library/final.png
  - screenshots/ja/03-knitting-library/scaffold.png
  - screenshots/en/03-knitting-library/dec.png
  - screenshots/zh-TW/05-group-repeat/final.png
  - screenshots/zh-TW/01-never-lose-place/final.png
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/zh-TW/03-knitting-library/final.png
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
  - screenshots/zh-TW/04-crochet-library/final.png
  - screenshots/en/01-never-lose-place/dec.png
  - assets/screenshot/en/01.PNG
  - screenshots/en/04-crochet-library/dec.png
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - screenshots/en/03-knitting-library/final.png
  - screenshots/en/01-never-lose-place/final.png
  - screenshots/en/02-build-pattern/final.png
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/ja/02-build-pattern/final.png
  - marketing/ravelry-posts.md
  - screenshots/ja/05-group-repeat/scaffold.png
  - screenshots/swap_screen.py
  - screenshots/en/05-group-repeat/dec.png
  - marketing/marketing-strategy.md
  - screenshots/ja/01-never-lose-place/final.png
  - screenshots/recolor_cream.py
  - screenshots/zh-TW/02-build-pattern/final.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - screenshots/ja/05-group-repeat/final.png
  - assets/screenshot/en/04.PNG
  - assets/screenshot/en/03.PNG
  - screenshots/en/04-crochet-library/scaffold.png
  - marketing/reddit-posts.md
  - screenshots/en/04-crochet-library/final.png
  - screenshots/ja/04-crochet-library/final.png
  - screenshots/build_cream_base.py
  - assets/screenshot/en/02.PNG
-->

---
### Requirement: Zoom reset on page change

When the user moves to a different photo, the previously shown photo SHALL be reset to 1×.

#### Scenario: Return to a previously zoomed photo

- **WHEN** the user zooms photo 1, zooms back out to 1×, swipes to photo 2, and swipes back to photo 1
- **THEN** photo 1 is displayed at 1×


<!-- @trace
source: photo-viewer-pinch-zoom
updated: 2026-09-15
code:
  - screenshots/en/02-build-pattern/dec.png
  - screenshots/en/05-group-repeat/final.png
  - screenshots/ja/04-crochet-library/scaffold.png
  - screenshots/en/02-build-pattern/scaffold.png
  - marketing/threads-jp-posts.md
  - screenshots/composite.py
  - assets/screenshot/en/05.PNG
  - screenshots/en/05-group-repeat/scaffold.png
  - screenshots/ja/03-knitting-library/final.png
  - screenshots/ja/03-knitting-library/scaffold.png
  - screenshots/en/03-knitting-library/dec.png
  - screenshots/zh-TW/05-group-repeat/final.png
  - screenshots/zh-TW/01-never-lose-place/final.png
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/zh-TW/03-knitting-library/final.png
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
  - screenshots/zh-TW/04-crochet-library/final.png
  - screenshots/en/01-never-lose-place/dec.png
  - assets/screenshot/en/01.PNG
  - screenshots/en/04-crochet-library/dec.png
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - screenshots/en/03-knitting-library/final.png
  - screenshots/en/01-never-lose-place/final.png
  - screenshots/en/02-build-pattern/final.png
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/ja/02-build-pattern/final.png
  - marketing/ravelry-posts.md
  - screenshots/ja/05-group-repeat/scaffold.png
  - screenshots/swap_screen.py
  - screenshots/en/05-group-repeat/dec.png
  - marketing/marketing-strategy.md
  - screenshots/ja/01-never-lose-place/final.png
  - screenshots/recolor_cream.py
  - screenshots/zh-TW/02-build-pattern/final.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - screenshots/ja/05-group-repeat/final.png
  - assets/screenshot/en/04.PNG
  - assets/screenshot/en/03.PNG
  - screenshots/en/04-crochet-library/scaffold.png
  - marketing/reddit-posts.md
  - screenshots/en/04-crochet-library/final.png
  - screenshots/ja/04-crochet-library/final.png
  - screenshots/build_cream_base.py
  - assets/screenshot/en/02.PNG
-->

---
### Requirement: Zoom reset on close

Closing the viewer SHALL discard zoom state, so reopening the viewer shows the selected photo at 1×.

#### Scenario: Reopen after closing while zoomed

- **WHEN** the user zooms a photo to 3×, taps the close button, and opens the same photo again
- **THEN** the photo is displayed at 1×

<!-- @trace
source: photo-viewer-pinch-zoom
updated: 2026-09-15
code:
  - screenshots/en/02-build-pattern/dec.png
  - screenshots/en/05-group-repeat/final.png
  - screenshots/ja/04-crochet-library/scaffold.png
  - screenshots/en/02-build-pattern/scaffold.png
  - marketing/threads-jp-posts.md
  - screenshots/composite.py
  - assets/screenshot/en/05.PNG
  - screenshots/en/05-group-repeat/scaffold.png
  - screenshots/ja/03-knitting-library/final.png
  - screenshots/ja/03-knitting-library/scaffold.png
  - screenshots/en/03-knitting-library/dec.png
  - screenshots/zh-TW/05-group-repeat/final.png
  - screenshots/zh-TW/01-never-lose-place/final.png
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/zh-TW/03-knitting-library/final.png
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
  - screenshots/zh-TW/04-crochet-library/final.png
  - screenshots/en/01-never-lose-place/dec.png
  - assets/screenshot/en/01.PNG
  - screenshots/en/04-crochet-library/dec.png
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - screenshots/en/03-knitting-library/final.png
  - screenshots/en/01-never-lose-place/final.png
  - screenshots/en/02-build-pattern/final.png
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/ja/02-build-pattern/final.png
  - marketing/ravelry-posts.md
  - screenshots/ja/05-group-repeat/scaffold.png
  - screenshots/swap_screen.py
  - screenshots/en/05-group-repeat/dec.png
  - marketing/marketing-strategy.md
  - screenshots/ja/01-never-lose-place/final.png
  - screenshots/recolor_cream.py
  - screenshots/zh-TW/02-build-pattern/final.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - screenshots/ja/05-group-repeat/final.png
  - assets/screenshot/en/04.PNG
  - assets/screenshot/en/03.PNG
  - screenshots/en/04-crochet-library/scaffold.png
  - marketing/reddit-posts.md
  - screenshots/en/04-crochet-library/final.png
  - screenshots/ja/04-crochet-library/final.png
  - screenshots/build_cream_base.py
  - assets/screenshot/en/02.PNG
-->