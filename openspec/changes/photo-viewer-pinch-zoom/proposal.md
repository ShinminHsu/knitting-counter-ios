## Why

Project photos are often reference charts or close-ups of stitches. The full-screen photo viewer (`src/components/PhotoViewer.tsx`) shows each photo fitted to the screen with no way to zoom, so small chart symbols and stitch details are unreadable. Users expect the iOS Photos behaviour of pinching and double-tapping to zoom.

## What Changes

- Pinch to zoom each photo in the full-screen viewer between 1× and 4×.
- Double-tap toggles between 1× and 2.5×, centred on the tapped point.
- While zoomed, dragging pans the photo instead of switching photos.
- At 1×, horizontal swiping between photos works exactly as today.
- Switching to another photo resets the previous photo to 1×; closing and reopening the viewer starts at 1×.
- Implemented with the native iOS `ScrollView` zoom support already in React Native — no new dependency and no new development build required.

## Non-Goals (optional)

(covered in design.md)

## Capabilities

### New Capabilities

- `photo-viewer-zoom`: Pinch, double-tap, and pan zoom interactions in the full-screen project photo viewer, and how they interact with swiping between photos.

### Modified Capabilities

(none)

## Impact

- Affected specs: `photo-viewer-zoom` (new)
- Affected code: `src/components/PhotoViewer.tsx`
- No dependency, `app.json`, or native changes; testable with the existing EAS development build via `npx expo start --dev-client --tunnel`.
