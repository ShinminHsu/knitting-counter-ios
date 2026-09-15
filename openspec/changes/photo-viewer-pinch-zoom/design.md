## Context

- `src/components/PhotoViewer.tsx` renders a `Modal` with a horizontal `FlatList` (`pagingEnabled`, `getItemLayout` at `screenWidth`), one page per photo: a `View` containing an `Image` sized `screenWidth × screenHeight` with `resizeMode="contain"`. `currentIndex` updates in `onMomentumScrollEnd`.
- `app/project/[id]/index.tsx` renders `<PhotoViewer visible={true} … />` only while `viewingPhoto` is set, so the viewer unmounts on close.
- The app is iOS-only (`app.json` portrait orientation, New Architecture enabled).
- React Native 0.81 `ScrollView` exposes iOS zoom props (`maximumZoomScale`, `minimumZoomScale`, `centerContent`, `bouncesZoom`), reports `nativeEvent.zoomScale` in `onScroll`, and provides `scrollResponderZoomTo({ x, y, width, height, animated })`, which the Fabric `RCTScrollViewComponentView` maps to `UIScrollView zoomToRect:animated:`.
- Styling rules: `StyleSheet.create` only, touch targets ≥ 44pt.

## Goals / Non-Goals

**Goals:**

- Photos-app-like pinch, double-tap, and pan zoom in the full-screen viewer.
- No regression in swiping between photos at 1×.
- No new dependency and no new development build.

**Non-Goals:**

- Android behaviour.
- Zooming thumbnails in `PhotoGallery` or the home screen project card.
- Remembering zoom level per photo or across viewer sessions.
- Swiping to the next photo while zoomed at the image edge (user zooms out first).
- Rotation / landscape support.
- Localizing the existing hard-coded badge strings in `PhotoViewer.tsx`.

## Decisions

### Native ScrollView zoom per page

Each page wraps the `Image` in a `ScrollView` with `minimumZoomScale={1}`, `maximumZoomScale={4}`, `centerContent`, `bouncesZoom`, both scroll indicators hidden, `scrollEventThrottle={16}`, and fixed `screenWidth × screenHeight` size for both the scroll view and its content. `UIScrollView` provides pinch, pan, bounce, and clamping natively.

Alternative: `react-native-gesture-handler` + `react-native-reanimated` transforms. Rejected: more code (focal-point math, clamping, bounce), and gesture handlers inside an RN `Modal` add setup risk; the native scroll view already matches iOS Photos behaviour.

### ZoomablePhoto component

A file-local `ZoomablePhoto` component in `PhotoViewer.tsx` with props `uri: string`, `isActive: boolean`, `onZoomChange: (zoomed: boolean) => void`. It owns the `ScrollView` ref and a `zoomedRef` boolean. `onScroll` computes `zoomed = (nativeEvent.zoomScale ?? 1) > 1.01` and calls `onZoomChange` only when the value changes. The 1.01 threshold avoids floating-point noise at rest.

### Double-tap zoom toggle with zoomToRect

The `Image` is wrapped in a `Pressable`. A ref stores the last press timestamp; a second press within 300 ms is a double tap (and clears the timestamp). Single taps do nothing, so there is no single-tap delay to manage.

- Not zoomed: `w = screenWidth / 2.5`, `h = screenHeight / 2.5`; call `scrollResponderZoomTo({ x: locationX - w / 2, y: locationY - h / 2, width: w, height: h, animated: true })`. `locationX/locationY` from the press event are in the unscaled content coordinate space; `UIScrollView` clamps the rect to content bounds.
- Zoomed: call `scrollResponderZoomTo({ x: 0, y: 0, width: screenWidth, height: screenHeight, animated: true })` to return to 1×.

Implementation note: React Native 0.81's `scrollResponderZoomTo` passes `animated !== false` from its (deprecated) second argument to the native command and ignores `rect.animated` for that purpose. All calls therefore go through a `zoomTo(rect, animated)` helper that passes the flag both inside the rect (to suppress the deprecation warning) and as the second argument, so the page-change reset is truly non-animated.

### Disable paging while zoomed

`PhotoViewer` keeps `isZoomed` state and passes `scrollEnabled={!isZoomed}` to the `FlatList`, so drags on a zoomed photo pan it and never switch photos. `renderItem` receives `index` and renders `ZoomablePhoto` with `isActive={index === currentIndex}` and an `onZoomChange` that updates `isZoomed` only for the active page. `extraData={currentIndex}` makes the list re-render when the active page changes.

### Reset zoom when page changes

`ZoomablePhoto` runs an effect on `isActive`: when it becomes `false` while `zoomedRef` is true, it calls `scrollResponderZoomTo` with the full-screen rect and `animated: false`, then clears `zoomedRef`. `handleScroll` in `PhotoViewer` sets `isZoomed` to `false` whenever the page index changes. With paging disabled while zoomed this is a safety net for zoom levels that end just above 1×.

### Close resets via unmount

No explicit reset on close: the parent unmounts `PhotoViewer` when `viewingPhoto` becomes `null`, so reopening mounts fresh scroll views at 1×.

## Risks / Trade-offs

- [Pinch ending at a scale slightly above 1× keeps paging disabled] → threshold 1.01 plus double-tap returns exactly to 1×; `bouncesZoom` snaps below-minimum pinches back to 1×.
- [Pressable press cancelled by pinch/pan leads to missed double taps] → acceptable; double tap is only recognised for two clean taps, same as Photos.
- [FlatList re-rendering all visible items on `currentIndex` change] → photo counts are small (free tier 1–3, premium photos ≤ 1 MB each); `ZoomablePhoto` props are cheap.
- [`scrollResponderZoomTo` is iOS-only (invariant on other platforms)] → app is iOS-only; documented as Non-Goal.
