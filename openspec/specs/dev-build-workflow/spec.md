# dev-build-workflow Specification

## Purpose

TBD - created by archiving change 'add-expo-dev-client'. Update Purpose after archive.

## Requirements

### Requirement: Development client dependency

The project SHALL declare `expo-dev-client` as a dependency at the version resolved by `npx expo install` for Expo SDK 54, so that the existing `development` EAS profile produces an installable development build.

#### Scenario: Development profile builds

- **WHEN** `eas build --profile development --platform ios` runs on the committed branch
- **THEN** the build completes and produces an internal-distribution iOS build that opens the Expo development launcher

#### Scenario: Version matches SDK

- **WHEN** `npx expo install --check` runs
- **THEN** it reports no version mismatch for `expo-dev-client`


<!-- @trace
source: add-expo-dev-client
updated: 2026-09-15
code:
  - assets/screenshot/en/04.PNG
  - screenshots/ja/01-never-lose-place/final.png
  - screenshots/ja/05-group-repeat/scaffold.png
  - screenshots/zh-TW/01-never-lose-place/final.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - screenshots/en/02-build-pattern/scaffold.png
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - screenshots/zh-TW/05-group-repeat/final.png
  - screenshots/en/05-group-repeat/dec.png
  - screenshots/ja/03-knitting-library/final.png
  - screenshots/ja/03-knitting-library/scaffold.png
  - screenshots/zh-TW/04-crochet-library/final.png
  - screenshots/en/04-crochet-library/dec.png
  - screenshots/en/01-never-lose-place/final.png
  - assets/screenshot/en/01.PNG
  - screenshots/recolor_cream.py
  - screenshots/en/01-never-lose-place/dec.png
  - screenshots/en/04-crochet-library/scaffold.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/build_cream_base.py
  - screenshots/en/03-knitting-library/final.png
  - screenshots/ja/04-crochet-library/final.png
  - screenshots/swap_screen.py
  - screenshots/en/02-build-pattern/dec.png
  - marketing/ravelry-posts.md
  - marketing/reddit-posts.md
  - assets/screenshot/en/05.PNG
  - screenshots/en/05-group-repeat/scaffold.png
  - screenshots/ja/04-crochet-library/scaffold.png
  - screenshots/en/05-group-repeat/final.png
  - assets/screenshot/en/03.PNG
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/en/03-knitting-library/dec.png
  - assets/screenshot/en/02.PNG
  - screenshots/en/02-build-pattern/final.png
  - marketing/threads-jp-posts.md
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/zh-TW/03-knitting-library/final.png
  - screenshots/ja/02-build-pattern/final.png
  - screenshots/ja/05-group-repeat/final.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
  - marketing/marketing-strategy.md
  - screenshots/composite.py
  - screenshots/zh-TW/02-build-pattern/final.png
  - screenshots/en/04-crochet-library/final.png
-->

---
### Requirement: Release builds exclude dev launcher

Production and staging builds MUST NOT show the development launcher or development menu. This SHALL be confirmed from the installed `expo-dev-launcher` and `expo-dev-menu` module configuration before the change is merged.

#### Scenario: Module config is debug-only

- **WHEN** the `expo-module.config.json` and podspec of `expo-dev-launcher` and `expo-dev-menu` are inspected
- **THEN** both are configured to be linked in debug builds only

#### Scenario: Module config is not debug-only

- **WHEN** either module is not configured as debug-only
- **THEN** implementation pauses and the finding is reported before any build is started


<!-- @trace
source: add-expo-dev-client
updated: 2026-09-15
code:
  - assets/screenshot/en/04.PNG
  - screenshots/ja/01-never-lose-place/final.png
  - screenshots/ja/05-group-repeat/scaffold.png
  - screenshots/zh-TW/01-never-lose-place/final.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - screenshots/en/02-build-pattern/scaffold.png
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - screenshots/zh-TW/05-group-repeat/final.png
  - screenshots/en/05-group-repeat/dec.png
  - screenshots/ja/03-knitting-library/final.png
  - screenshots/ja/03-knitting-library/scaffold.png
  - screenshots/zh-TW/04-crochet-library/final.png
  - screenshots/en/04-crochet-library/dec.png
  - screenshots/en/01-never-lose-place/final.png
  - assets/screenshot/en/01.PNG
  - screenshots/recolor_cream.py
  - screenshots/en/01-never-lose-place/dec.png
  - screenshots/en/04-crochet-library/scaffold.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/build_cream_base.py
  - screenshots/en/03-knitting-library/final.png
  - screenshots/ja/04-crochet-library/final.png
  - screenshots/swap_screen.py
  - screenshots/en/02-build-pattern/dec.png
  - marketing/ravelry-posts.md
  - marketing/reddit-posts.md
  - assets/screenshot/en/05.PNG
  - screenshots/en/05-group-repeat/scaffold.png
  - screenshots/ja/04-crochet-library/scaffold.png
  - screenshots/en/05-group-repeat/final.png
  - assets/screenshot/en/03.PNG
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/en/03-knitting-library/dec.png
  - assets/screenshot/en/02.PNG
  - screenshots/en/02-build-pattern/final.png
  - marketing/threads-jp-posts.md
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/zh-TW/03-knitting-library/final.png
  - screenshots/ja/02-build-pattern/final.png
  - screenshots/ja/05-group-repeat/final.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
  - marketing/marketing-strategy.md
  - screenshots/composite.py
  - screenshots/zh-TW/02-build-pattern/final.png
  - screenshots/en/04-crochet-library/final.png
-->

---
### Requirement: Node version file

The repository SHALL contain an `.nvmrc` file specifying Node major version `20`, satisfying React Native 0.81's `>= 20.19.4` engine requirement on machines with a recent Node 20.

#### Scenario: nvm selects Node 20

- **WHEN** a developer runs `nvm use` in the project root on the primary dev machine
- **THEN** `node --version` reports v20.20.0 or later within major version 20


<!-- @trace
source: add-expo-dev-client
updated: 2026-09-15
code:
  - assets/screenshot/en/04.PNG
  - screenshots/ja/01-never-lose-place/final.png
  - screenshots/ja/05-group-repeat/scaffold.png
  - screenshots/zh-TW/01-never-lose-place/final.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - screenshots/en/02-build-pattern/scaffold.png
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - screenshots/zh-TW/05-group-repeat/final.png
  - screenshots/en/05-group-repeat/dec.png
  - screenshots/ja/03-knitting-library/final.png
  - screenshots/ja/03-knitting-library/scaffold.png
  - screenshots/zh-TW/04-crochet-library/final.png
  - screenshots/en/04-crochet-library/dec.png
  - screenshots/en/01-never-lose-place/final.png
  - assets/screenshot/en/01.PNG
  - screenshots/recolor_cream.py
  - screenshots/en/01-never-lose-place/dec.png
  - screenshots/en/04-crochet-library/scaffold.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/build_cream_base.py
  - screenshots/en/03-knitting-library/final.png
  - screenshots/ja/04-crochet-library/final.png
  - screenshots/swap_screen.py
  - screenshots/en/02-build-pattern/dec.png
  - marketing/ravelry-posts.md
  - marketing/reddit-posts.md
  - assets/screenshot/en/05.PNG
  - screenshots/en/05-group-repeat/scaffold.png
  - screenshots/ja/04-crochet-library/scaffold.png
  - screenshots/en/05-group-repeat/final.png
  - assets/screenshot/en/03.PNG
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/en/03-knitting-library/dec.png
  - assets/screenshot/en/02.PNG
  - screenshots/en/02-build-pattern/final.png
  - marketing/threads-jp-posts.md
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/zh-TW/03-knitting-library/final.png
  - screenshots/ja/02-build-pattern/final.png
  - screenshots/ja/05-group-repeat/final.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
  - marketing/marketing-strategy.md
  - screenshots/composite.py
  - screenshots/zh-TW/02-build-pattern/final.png
  - screenshots/en/04-crochet-library/final.png
-->

---
### Requirement: Development build guide

The repository SHALL contain `docs/dev-client.md`, written in Traditional Chinese, covering: prerequisites; one-time setup including `eas device:create` before building and enabling iOS Developer Mode; the daily `npx expo start` loop with a `--tunnel` fallback; the conditions that require a new development build (native package added or updated, `app.json` native config changed, Expo SDK upgraded, new device registered); testing notes for test ads, rewarded ads in development, DEV Tools, ATT prompt, IAP sandbox account setup, and analytics environment variables; and EAS free-plan build and device limits.

#### Scenario: New device

- **WHEN** a developer reads the guide to test on a device not yet registered
- **THEN** the guide states the device must be registered with `eas device:create` and that an existing build requires `eas build:resign` or a rebuild to install on it

#### Scenario: Deciding whether to rebuild

- **WHEN** a change adds `react-native-cloud-storage`
- **THEN** the guide's rebuild conditions state a new development build is required

#### Scenario: Testing a purchase

- **WHEN** a developer wants to test the premium purchase in the development build
- **THEN** the guide describes creating a Sandbox Apple Account in App Store Connect and where to sign in to it on the device


<!-- @trace
source: add-expo-dev-client
updated: 2026-09-15
code:
  - assets/screenshot/en/04.PNG
  - screenshots/ja/01-never-lose-place/final.png
  - screenshots/ja/05-group-repeat/scaffold.png
  - screenshots/zh-TW/01-never-lose-place/final.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - screenshots/en/02-build-pattern/scaffold.png
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - screenshots/zh-TW/05-group-repeat/final.png
  - screenshots/en/05-group-repeat/dec.png
  - screenshots/ja/03-knitting-library/final.png
  - screenshots/ja/03-knitting-library/scaffold.png
  - screenshots/zh-TW/04-crochet-library/final.png
  - screenshots/en/04-crochet-library/dec.png
  - screenshots/en/01-never-lose-place/final.png
  - assets/screenshot/en/01.PNG
  - screenshots/recolor_cream.py
  - screenshots/en/01-never-lose-place/dec.png
  - screenshots/en/04-crochet-library/scaffold.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/build_cream_base.py
  - screenshots/en/03-knitting-library/final.png
  - screenshots/ja/04-crochet-library/final.png
  - screenshots/swap_screen.py
  - screenshots/en/02-build-pattern/dec.png
  - marketing/ravelry-posts.md
  - marketing/reddit-posts.md
  - assets/screenshot/en/05.PNG
  - screenshots/en/05-group-repeat/scaffold.png
  - screenshots/ja/04-crochet-library/scaffold.png
  - screenshots/en/05-group-repeat/final.png
  - assets/screenshot/en/03.PNG
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/en/03-knitting-library/dec.png
  - assets/screenshot/en/02.PNG
  - screenshots/en/02-build-pattern/final.png
  - marketing/threads-jp-posts.md
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/zh-TW/03-knitting-library/final.png
  - screenshots/ja/02-build-pattern/final.png
  - screenshots/ja/05-group-repeat/final.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
  - marketing/marketing-strategy.md
  - screenshots/composite.py
  - screenshots/zh-TW/02-build-pattern/final.png
  - screenshots/en/04-crochet-library/final.png
-->

---
### Requirement: Project instructions update

`CLAUDE.md` SHALL describe the development build workflow in its "開發注意事項" and "測試流程" sections: JS-only changes are tested via the EAS development build with Metro on the primary machine; native changes require a new EAS development build or the second computer; releases use EAS Build and TestFlight. Existing branch, verification, and merge rules MUST remain unchanged.

#### Scenario: JS-only change testing guidance

- **WHEN** Claude reads `CLAUDE.md` while preparing to verify a JS-only change
- **THEN** the instructions direct testing with `npx expo start` against the installed development build and link `docs/dev-client.md`

#### Scenario: Git rules preserved

- **WHEN** `CLAUDE.md` is compared before and after the change
- **THEN** the "Git 工作流程" and "Commit 規範" sections are identical

<!-- @trace
source: add-expo-dev-client
updated: 2026-09-15
code:
  - assets/screenshot/en/04.PNG
  - screenshots/ja/01-never-lose-place/final.png
  - screenshots/ja/05-group-repeat/scaffold.png
  - screenshots/zh-TW/01-never-lose-place/final.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - screenshots/en/02-build-pattern/scaffold.png
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - screenshots/zh-TW/05-group-repeat/final.png
  - screenshots/en/05-group-repeat/dec.png
  - screenshots/ja/03-knitting-library/final.png
  - screenshots/ja/03-knitting-library/scaffold.png
  - screenshots/zh-TW/04-crochet-library/final.png
  - screenshots/en/04-crochet-library/dec.png
  - screenshots/en/01-never-lose-place/final.png
  - assets/screenshot/en/01.PNG
  - screenshots/recolor_cream.py
  - screenshots/en/01-never-lose-place/dec.png
  - screenshots/en/04-crochet-library/scaffold.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/build_cream_base.py
  - screenshots/en/03-knitting-library/final.png
  - screenshots/ja/04-crochet-library/final.png
  - screenshots/swap_screen.py
  - screenshots/en/02-build-pattern/dec.png
  - marketing/ravelry-posts.md
  - marketing/reddit-posts.md
  - assets/screenshot/en/05.PNG
  - screenshots/en/05-group-repeat/scaffold.png
  - screenshots/ja/04-crochet-library/scaffold.png
  - screenshots/en/05-group-repeat/final.png
  - assets/screenshot/en/03.PNG
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/en/03-knitting-library/dec.png
  - assets/screenshot/en/02.PNG
  - screenshots/en/02-build-pattern/final.png
  - marketing/threads-jp-posts.md
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/zh-TW/03-knitting-library/final.png
  - screenshots/ja/02-build-pattern/final.png
  - screenshots/ja/05-group-repeat/final.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
  - marketing/marketing-strategy.md
  - screenshots/composite.py
  - screenshots/zh-TW/02-build-pattern/final.png
  - screenshots/en/04-crochet-library/final.png
-->