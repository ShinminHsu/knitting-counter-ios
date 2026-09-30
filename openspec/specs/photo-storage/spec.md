# photo-storage Specification

## Purpose

TBD - created by archiving change 'fix-photo-relative-uri'. Update Purpose after archive.

## Requirements

### Requirement: Relative photo path

When a project photo is saved, the system SHALL store the file at `<Documents>/photos/<projectId>/<photoId>.jpg` and SHALL persist `ProjectPhoto.uri` as the relative path `photos/<projectId>/<photoId>.jpg`. The persisted `uri` MUST NOT contain a URL scheme or the app container path.

#### Scenario: New photo saved

- **WHEN** the user adds a photo from the camera or library to project `p1`
- **THEN** the persisted photo `uri` equals `photos/p1/<photoId>.jpg`


<!-- @trace
source: fix-photo-relative-uri
updated: 2026-09-15
code:
  - screenshots/en/04-crochet-library/scaffold.png
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/en/05-group-repeat/dec.png
  - marketing/threads-jp-posts.md
  - screenshots/composite.py
  - screenshots/en/01-never-lose-place/final.png
  - screenshots/en/02-build-pattern/dec.png
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/en/03-knitting-library/dec.png
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - screenshots/ja/04-crochet-library/scaffold.png
  - screenshots/en/02-build-pattern/final.png
  - screenshots/en/05-group-repeat/scaffold.png
  - screenshots/zh-TW/04-crochet-library/final.png
  - marketing/reddit-posts.md
  - screenshots/recolor_cream.py
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - assets/screenshot/en/05.PNG
  - screenshots/en/02-build-pattern/scaffold.png
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/ja/02-build-pattern/final.png
  - screenshots/en/04-crochet-library/dec.png
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/ja/03-knitting-library/scaffold.png
  - screenshots/ja/05-group-repeat/final.png
  - screenshots/zh-TW/01-never-lose-place/final.png
  - marketing/ravelry-posts.md
  - screenshots/en/05-group-repeat/final.png
  - screenshots/ja/05-group-repeat/scaffold.png
  - marketing/marketing-strategy.md
  - assets/screenshot/en/01.PNG
  - screenshots/en/01-never-lose-place/dec.png
  - screenshots/en/03-knitting-library/final.png
  - assets/screenshot/en/02.PNG
  - screenshots/ja/04-crochet-library/final.png
  - screenshots/zh-TW/02-build-pattern/final.png
  - assets/screenshot/en/03.PNG
  - screenshots/swap_screen.py
  - screenshots/en/04-crochet-library/final.png
  - screenshots/ja/01-never-lose-place/final.png
  - screenshots/build_cream_base.py
  - assets/screenshot/en/04.PNG
  - screenshots/zh-TW/05-group-repeat/final.png
  - screenshots/ja/03-knitting-library/final.png
  - screenshots/zh-TW/03-knitting-library/final.png
-->

---
### Requirement: Photo path resolution

Every read, existence check, and deletion of a photo file SHALL use the absolute path built from the current Documents directory and the photo's relative path. A legacy absolute `uri` containing `/Documents/photos/` SHALL resolve to the same relative location under the current Documents directory.

#### Scenario: Container path changes

- **WHEN** a photo was saved, then the app is rebuilt or updated so the container path changes
- **THEN** the photo displays in the home screen card, the project photo gallery, and the full-screen viewer

#### Scenario: Legacy absolute uri

- **WHEN** a photo `uri` is `file:///var/mobile/Containers/Data/Application/OLD-UUID/Documents/photos/p1/a.jpg`
- **THEN** the resolved path is `<current Documents directory>photos/p1/a.jpg`

#### Scenario: Delete photo

- **WHEN** the user deletes a photo
- **THEN** the file at the resolved path is removed and the photo is removed from the project


<!-- @trace
source: fix-photo-relative-uri
updated: 2026-09-15
code:
  - screenshots/en/04-crochet-library/scaffold.png
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/en/05-group-repeat/dec.png
  - marketing/threads-jp-posts.md
  - screenshots/composite.py
  - screenshots/en/01-never-lose-place/final.png
  - screenshots/en/02-build-pattern/dec.png
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/en/03-knitting-library/dec.png
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - screenshots/ja/04-crochet-library/scaffold.png
  - screenshots/en/02-build-pattern/final.png
  - screenshots/en/05-group-repeat/scaffold.png
  - screenshots/zh-TW/04-crochet-library/final.png
  - marketing/reddit-posts.md
  - screenshots/recolor_cream.py
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - assets/screenshot/en/05.PNG
  - screenshots/en/02-build-pattern/scaffold.png
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/ja/02-build-pattern/final.png
  - screenshots/en/04-crochet-library/dec.png
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/ja/03-knitting-library/scaffold.png
  - screenshots/ja/05-group-repeat/final.png
  - screenshots/zh-TW/01-never-lose-place/final.png
  - marketing/ravelry-posts.md
  - screenshots/en/05-group-repeat/final.png
  - screenshots/ja/05-group-repeat/scaffold.png
  - marketing/marketing-strategy.md
  - assets/screenshot/en/01.PNG
  - screenshots/en/01-never-lose-place/dec.png
  - screenshots/en/03-knitting-library/final.png
  - assets/screenshot/en/02.PNG
  - screenshots/ja/04-crochet-library/final.png
  - screenshots/zh-TW/02-build-pattern/final.png
  - assets/screenshot/en/03.PNG
  - screenshots/swap_screen.py
  - screenshots/en/04-crochet-library/final.png
  - screenshots/ja/01-never-lose-place/final.png
  - screenshots/build_cream_base.py
  - assets/screenshot/en/04.PNG
  - screenshots/zh-TW/05-group-repeat/final.png
  - screenshots/ja/03-knitting-library/final.png
  - screenshots/zh-TW/03-knitting-library/final.png
-->

---
### Requirement: Legacy photo path migration

The project store SHALL declare persist version 1. When persisted data from version 0 is loaded, the system SHALL convert each photo `uri` containing `/Documents/photos/` to its relative `photos/...` form, and SHALL leave any other `uri` unchanged.

#### Scenario: Absolute uri migrated

- **WHEN** version 0 data contains a photo `uri` ending in `/Documents/photos/p1/a.jpg`
- **THEN** after hydration the photo `uri` is `photos/p1/a.jpg` and the store's persisted version is 1

#### Scenario: Unrecognized uri kept

- **WHEN** version 0 data contains a photo `uri` without `/Documents/photos/`
- **THEN** after hydration that `uri` is unchanged

#### Scenario: Projects without photos

- **WHEN** version 0 data contains projects with empty `photos` arrays
- **THEN** migration completes and project data is unchanged


<!-- @trace
source: fix-photo-relative-uri
updated: 2026-09-15
code:
  - screenshots/en/04-crochet-library/scaffold.png
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/en/05-group-repeat/dec.png
  - marketing/threads-jp-posts.md
  - screenshots/composite.py
  - screenshots/en/01-never-lose-place/final.png
  - screenshots/en/02-build-pattern/dec.png
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/en/03-knitting-library/dec.png
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - screenshots/ja/04-crochet-library/scaffold.png
  - screenshots/en/02-build-pattern/final.png
  - screenshots/en/05-group-repeat/scaffold.png
  - screenshots/zh-TW/04-crochet-library/final.png
  - marketing/reddit-posts.md
  - screenshots/recolor_cream.py
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - assets/screenshot/en/05.PNG
  - screenshots/en/02-build-pattern/scaffold.png
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/ja/02-build-pattern/final.png
  - screenshots/en/04-crochet-library/dec.png
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/ja/03-knitting-library/scaffold.png
  - screenshots/ja/05-group-repeat/final.png
  - screenshots/zh-TW/01-never-lose-place/final.png
  - marketing/ravelry-posts.md
  - screenshots/en/05-group-repeat/final.png
  - screenshots/ja/05-group-repeat/scaffold.png
  - marketing/marketing-strategy.md
  - assets/screenshot/en/01.PNG
  - screenshots/en/01-never-lose-place/dec.png
  - screenshots/en/03-knitting-library/final.png
  - assets/screenshot/en/02.PNG
  - screenshots/ja/04-crochet-library/final.png
  - screenshots/zh-TW/02-build-pattern/final.png
  - assets/screenshot/en/03.PNG
  - screenshots/swap_screen.py
  - screenshots/en/04-crochet-library/final.png
  - screenshots/ja/01-never-lose-place/final.png
  - screenshots/build_cream_base.py
  - assets/screenshot/en/04.PNG
  - screenshots/zh-TW/05-group-repeat/final.png
  - screenshots/ja/03-knitting-library/final.png
  - screenshots/zh-TW/03-knitting-library/final.png
-->

---
### Requirement: Orphaned photo cleanup

On project detail mount, the system SHALL remove photo metadata only when no file exists at the photo's resolved path.

#### Scenario: File exists in new container

- **WHEN** the container path changed and the photo file exists at the resolved path
- **THEN** the photo metadata is kept

#### Scenario: File genuinely missing

- **WHEN** no file exists at the photo's resolved path
- **THEN** the photo metadata is removed from the project

<!-- @trace
source: fix-photo-relative-uri
updated: 2026-09-15
code:
  - screenshots/en/04-crochet-library/scaffold.png
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/en/05-group-repeat/dec.png
  - marketing/threads-jp-posts.md
  - screenshots/composite.py
  - screenshots/en/01-never-lose-place/final.png
  - screenshots/en/02-build-pattern/dec.png
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/en/03-knitting-library/dec.png
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - screenshots/ja/04-crochet-library/scaffold.png
  - screenshots/en/02-build-pattern/final.png
  - screenshots/en/05-group-repeat/scaffold.png
  - screenshots/zh-TW/04-crochet-library/final.png
  - marketing/reddit-posts.md
  - screenshots/recolor_cream.py
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - assets/screenshot/en/05.PNG
  - screenshots/en/02-build-pattern/scaffold.png
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/ja/02-build-pattern/final.png
  - screenshots/en/04-crochet-library/dec.png
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/ja/03-knitting-library/scaffold.png
  - screenshots/ja/05-group-repeat/final.png
  - screenshots/zh-TW/01-never-lose-place/final.png
  - marketing/ravelry-posts.md
  - screenshots/en/05-group-repeat/final.png
  - screenshots/ja/05-group-repeat/scaffold.png
  - marketing/marketing-strategy.md
  - assets/screenshot/en/01.PNG
  - screenshots/en/01-never-lose-place/dec.png
  - screenshots/en/03-knitting-library/final.png
  - assets/screenshot/en/02.PNG
  - screenshots/ja/04-crochet-library/final.png
  - screenshots/zh-TW/02-build-pattern/final.png
  - assets/screenshot/en/03.PNG
  - screenshots/swap_screen.py
  - screenshots/en/04-crochet-library/final.png
  - screenshots/ja/01-never-lose-place/final.png
  - screenshots/build_cream_base.py
  - assets/screenshot/en/04.PNG
  - screenshots/zh-TW/05-group-repeat/final.png
  - screenshots/ja/03-knitting-library/final.png
  - screenshots/zh-TW/03-knitting-library/final.png
-->