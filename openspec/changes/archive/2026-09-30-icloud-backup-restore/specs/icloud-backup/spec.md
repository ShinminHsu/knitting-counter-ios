## ADDED Requirements

### Requirement: Automatic iCloud backup

The system SHALL back up every project (including charts, rounds, progress, sessions, and photo metadata), every project photo file, all custom stitches, and all templates to the app's private iCloud container using the hidden AppData scope. Backup files MUST NOT be visible in the iOS Files app. The feature SHALL be available to free and premium users alike.

#### Scenario: New project is backed up

- **WHEN** the backup toggle is on, iCloud is available, and the user creates a project and then stops interacting for 5 seconds
- **THEN** the system writes `/projects/<projectId>.json` and updates `/manifest.json` with the project's `updatedAt`

#### Scenario: Photo is uploaded once

- **WHEN** a project photo has already been uploaded and the project is later modified
- **THEN** the system rewrites the project file but does not upload that photo again

#### Scenario: Custom stitches and templates are backed up

- **WHEN** the user adds or edits a custom stitch or template
- **THEN** the system rewrites `/library.json` on the next flush

#### Scenario: Backup files hidden from Files app

- **WHEN** the user opens the iOS Files app and browses iCloud Drive
- **THEN** no Stitchie backup folder or file is listed

### Requirement: Debounced backup flush

The system SHALL NOT write to iCloud on every data change. A flush SHALL run 5 seconds after the last change to project, custom stitch, or template data, immediately when the app moves to the background, and immediately when the tracking screen unmounts. Only one flush SHALL run at a time; a change during a running flush SHALL queue exactly one follow-up flush. An item SHALL be marked uploaded only after its write succeeds.

#### Scenario: Rapid stitch taps

- **WHEN** the user taps "Next Stitch" 30 times within 10 seconds on the tracking screen
- **THEN** no iCloud write occurs until 5 seconds after the last tap, and then a single flush writes the project once

#### Scenario: App backgrounded

- **WHEN** the user changes progress and presses the home button within 5 seconds
- **THEN** a flush starts immediately on the background transition

#### Scenario: Leaving tracking screen

- **WHEN** the user navigates back from the tracking screen
- **THEN** a flush starts immediately

#### Scenario: Interrupted flush retries

- **WHEN** a flush is interrupted after writing the project file but before a photo upload completes
- **THEN** the next flush uploads the remaining photo and does not skip it

#### Scenario: Backup disabled

- **WHEN** the user turns the iCloud Backup toggle off
- **THEN** no flush writes to iCloud until the toggle is turned back on

### Requirement: Deletion tombstones

The system SHALL record a tombstone (`projectId` → `deletedAt`) when the user deletes a project. The next flush SHALL delete that project's file and photo folder from iCloud, record the id under `manifest.deleted`, and then clear the local tombstone.

#### Scenario: Deleted project removed from backup

- **WHEN** the user deletes a project and a flush completes
- **THEN** `/projects/<projectId>.json` and `/photos/<projectId>/` no longer exist in the container and `manifest.deleted` contains the project id

#### Scenario: Deleted project not restored

- **WHEN** a restore runs and a project id is listed in `manifest.deleted`
- **THEN** that project is not added to local data

### Requirement: Removed photo cleanup

When a previously backed-up photo is no longer in its project's photo list, the next flush SHALL delete that photo's backup file from iCloud and stop tracking it as uploaded.

#### Scenario: Single photo deleted

- **WHEN** a project has 3 backed-up photos, the user deletes 1 photo, and a flush completes
- **THEN** `/photos/<projectId>/` in iCloud contains exactly the 2 remaining photo files

#### Scenario: Photo cleanup failure

- **WHEN** deleting a removed photo's backup file fails
- **THEN** the photo id stays tracked as uploaded and deletion is retried on the next flush

### Requirement: Cloud data preservation

A flush MUST NOT delete or unlist any cloud project unless a local tombstone exists for that project id, and every flush SHALL merge its changes into the existing cloud manifest. While the cloud manifest lists at least one non-deleted project that this install has not uploaded and the restore decision has not been made, the system MUST NOT run a flush when there are no local projects, and MUST NOT write `/library.json` when local projects exist. When the cloud manifest lists no such project, the restore decision SHALL be treated as made.

#### Scenario: Fresh install does not wipe backup

- **WHEN** the app is reinstalled, local data is empty, and the cloud manifest lists 4 projects
- **THEN** no flush runs and all 4 project files remain in iCloud

#### Scenario: User declines restore then creates a project

- **WHEN** the user taps "Not Now" on the restore prompt and then creates a new project
- **THEN** the flush adds the new project to the manifest and the 4 existing cloud projects remain listed and stored

#### Scenario: Project created before the restore prompt appears

- **WHEN** the app is reinstalled, the cloud manifest lists 4 projects, and the user creates a project before any restore prompt is shown
- **THEN** the flush backs up the new project, the 4 cloud projects remain listed and stored, and `/library.json` in iCloud is not modified

#### Scenario: Existing user without a cloud backup

- **WHEN** a user with local projects and no cloud backup updates the app and two flushes run
- **THEN** both flushes write to iCloud and the restore decision is treated as made

### Requirement: Restore prompt

The system SHALL show a restore prompt on the home screen when all of the following hold: the onboarding carousel has been seen, there are no local projects, the backup toggle is on, iCloud is available, the restore decision has not been made on this install, and the cloud manifest lists at least one non-deleted project. The prompt SHALL state the number of projects and the backup's last update time. The prompt SHALL be shown at most once per install.

#### Scenario: Reinstall shows prompt

- **WHEN** the user reinstalls the app, finishes the onboarding carousel, and the cloud manifest lists 3 non-deleted projects
- **THEN** a prompt offers "Restore" and "Not Now" and mentions 3 projects

#### Scenario: Restore accepted

- **WHEN** the user taps "Restore"
- **THEN** a loading state is shown, the projects appear on the home screen when restore finishes, and the prompt does not appear again

#### Scenario: Restore declined

- **WHEN** the user taps "Not Now"
- **THEN** the prompt does not appear again on later launches and restore remains available from Settings

#### Scenario: Existing local data suppresses prompt

- **WHEN** local data contains at least one project
- **THEN** no restore prompt is shown

### Requirement: Restore merge

Restore SHALL merge cloud data into local data without deleting local data. For each non-deleted cloud project: if the id is absent locally it SHALL be added; if present, the copy with the newer `updatedAt` SHALL be kept. Custom stitches and templates SHALL be merged by id, keeping the newer `updatedAt` when both copies have one and otherwise keeping the local copy. Restored projects MUST NOT be limited by the free-tier project limit. Project files failing shape validation SHALL be skipped and counted as failures. A photo whose file cannot be read SHALL be dropped from the restored project's photo list. Restore MUST abort without changing local data when the manifest `schemaVersion` exceeds the version the app supports.

#### Scenario: Restore exceeds free project limit

- **WHEN** a free user with a limit of 3 projects restores a backup containing 5 projects
- **THEN** all 5 projects are restored

#### Scenario: Local copy newer

- **WHEN** a project exists locally with `updatedAt` later than the cloud copy
- **THEN** the local copy is kept unchanged

#### Scenario: Photos restored

- **WHEN** a restored project has 2 backed-up photos
- **THEN** both photos are written to the local Documents photos directory and display in the project's photo gallery

#### Scenario: Corrupt project file

- **WHEN** one of 4 project files fails validation
- **THEN** 3 projects are restored and the result reports 1 failure

#### Scenario: Backup from newer app version

- **WHEN** the manifest `schemaVersion` is 2 and the app supports version 1
- **THEN** restore aborts, local data is unchanged, and the user sees a message to update the app

### Requirement: Entitlement backup

The system SHALL mirror `voucherCode`, `adUnlockedProjectCount`, `adUnlockedPhotoCount`, `templateUnlocked`, and `unlockedStitchCategories` to the iCloud key-value store under key `entitlements.v1`. Local and cloud values SHALL be merged by taking the maximum of counts, logical OR of booleans, and the non-null voucher code. A voucher code read from the cloud MUST be re-validated against the voucher hash list before granting premium. `isPremium` from in-app purchase MUST NOT be written to the key-value store.

#### Scenario: Voucher premium survives reinstall

- **WHEN** a user who redeemed a valid voucher reinstalls the app with iCloud available
- **THEN** premium is restored with source `voucher` on launch without re-entering the code

#### Scenario: Ad unlocks survive reinstall

- **WHEN** a user who unlocked 2 extra project slots via ads reinstalls the app
- **THEN** `adUnlockedProjectCount` is 2 after launch

#### Scenario: Invalid voucher in cloud

- **WHEN** the cloud value contains a voucher code whose hash is not in the valid list
- **THEN** premium is not granted

### Requirement: Backup settings section

The Settings screen SHALL include an "iCloud Backup" section containing: a backup on/off toggle (default on), the last successful backup time, a "Back Up Now" action that forces a flush of all data, a "Restore from iCloud" action that asks for confirmation and then runs a merge restore, and a "Delete iCloud Backup" action. All strings SHALL be localized in English, Japanese, and Traditional Chinese.

#### Scenario: Manual backup

- **WHEN** the user taps "Back Up Now" with iCloud available
- **THEN** a flush runs and the last backup time updates on success

#### Scenario: Manual restore

- **WHEN** the user taps "Restore from iCloud" and confirms
- **THEN** a merge restore runs and the user sees the number of restored projects and failures

#### Scenario: Write failure shown

- **WHEN** a flush fails because iCloud storage is full
- **THEN** the section shows a backup failed status instead of updating the last backup time

### Requirement: iCloud unavailable handling

When iCloud is unavailable (not signed in or iCloud Drive disabled for the app), the system SHALL skip flushes and restore checks without showing errors, and the Settings section SHALL display a message instructing the user to sign in to iCloud and enable iCloud Drive for Stitchie, with "Back Up Now", "Restore from iCloud", and "Delete iCloud Backup" disabled. When availability changes to available, the system SHALL resume normal behavior without an app restart.

#### Scenario: Not signed in

- **WHEN** the device is not signed into iCloud
- **THEN** the Settings section shows the unavailable message and all three actions are disabled

#### Scenario: Availability restored

- **WHEN** the user signs into iCloud while the app is running
- **THEN** the Settings section updates to the normal state and the next data change schedules a flush

### Requirement: Backup schema version

Every backup file SHALL include `schemaVersion: 1`. The project, custom stitch, and template persisted stores SHALL declare persist `version: 1`.

#### Scenario: Written files carry version

- **WHEN** a flush writes the manifest, a project file, and the library file
- **THEN** each file's JSON contains `"schemaVersion": 1`

### Requirement: Delete iCloud backup

The Settings "iCloud Backup" section SHALL provide a "Delete iCloud Backup" action. After the user confirms, the system SHALL turn the backup toggle off, delete every backup file in the app's iCloud container and the `entitlements.v1` key-value entry, and reset local backup tracking state. Local project data MUST NOT be modified. The action MUST be disabled while iCloud is unavailable.

#### Scenario: Confirmed deletion

- **WHEN** the user taps "Delete iCloud Backup" and confirms
- **THEN** the toggle is off, the iCloud container holds no Stitchie backup files, and all local projects remain

#### Scenario: Cancelled deletion

- **WHEN** the user taps "Delete iCloud Backup" and cancels the confirmation
- **THEN** no files are deleted and the toggle keeps its previous value

#### Scenario: Reinstall after deletion

- **WHEN** the user deletes the backup, then deletes and reinstalls the app
- **THEN** no restore prompt is shown

#### Scenario: Re-enable after deletion

- **WHEN** the user turns the toggle back on after deleting the backup
- **THEN** the next flush uploads all projects, photos, and the library again
