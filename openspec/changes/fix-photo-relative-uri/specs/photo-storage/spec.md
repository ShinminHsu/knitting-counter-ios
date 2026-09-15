## ADDED Requirements

### Requirement: Relative photo path

When a project photo is saved, the system SHALL store the file at `<Documents>/photos/<projectId>/<photoId>.jpg` and SHALL persist `ProjectPhoto.uri` as the relative path `photos/<projectId>/<photoId>.jpg`. The persisted `uri` MUST NOT contain a URL scheme or the app container path.

#### Scenario: New photo saved

- **WHEN** the user adds a photo from the camera or library to project `p1`
- **THEN** the persisted photo `uri` equals `photos/p1/<photoId>.jpg`

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

### Requirement: Orphaned photo cleanup

On project detail mount, the system SHALL remove photo metadata only when no file exists at the photo's resolved path.

#### Scenario: File exists in new container

- **WHEN** the container path changed and the photo file exists at the resolved path
- **THEN** the photo metadata is kept

#### Scenario: File genuinely missing

- **WHEN** no file exists at the photo's resolved path
- **THEN** the photo metadata is removed from the project
