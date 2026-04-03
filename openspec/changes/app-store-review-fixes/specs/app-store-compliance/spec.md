## ADDED Requirements

### Requirement: Purpose strings are specific and descriptive

`NSCameraUsageDescription` and `NSPhotoLibraryUsageDescription` in `app.json` `infoPlist` SHALL contain descriptions that explicitly state the feature (project photo gallery) and provide a concrete example of use.

#### Scenario: Camera purpose string is accepted by App Store review

- **WHEN** Apple reviews the app's camera usage description
- **THEN** the string SHALL describe that the camera is used to take photos for a project's photo gallery, e.g. "Stitchie uses your camera to take photos of your knitting projects and add them to your project's photo gallery."

#### Scenario: Photo library purpose string is accepted by App Store review

- **WHEN** Apple reviews the app's photo library usage description
- **THEN** the string SHALL describe that the photo library is used to select photos for a project's photo gallery, e.g. "Stitchie accesses your photo library so you can add photos of your knitting projects to your project's photo gallery."

### Requirement: ATT prompt appears before AdMob initialization

On a fresh install or after resetting tracking permissions, the App Tracking Transparency permission request SHALL appear before `MobileAds().initialize()` is called.

#### Scenario: First launch shows ATT before ads initialize

- **WHEN** the app is launched for the first time
- **THEN** `requestATTIfNeeded()` SHALL be awaited before `initializeAdMob()` is called

#### Scenario: ATT appears only once

- **WHEN** the user has already responded to the ATT prompt in a previous session
- **THEN** `requestATTIfNeeded()` SHALL return immediately without showing the prompt again

### Requirement: ATT error does not permanently suppress future prompts

If `requestTrackingPermissionsAsync()` throws an error, the `ATT_REQUESTED` MMKV flag SHALL NOT be set to true, so the prompt can be attempted again on the next launch.

#### Scenario: ATT throws on current session but succeeds next launch

- **WHEN** `requestTrackingPermissionsAsync()` throws an error
- **THEN** `ATT_REQUESTED` SHALL remain false so the prompt is retried on the next launch
