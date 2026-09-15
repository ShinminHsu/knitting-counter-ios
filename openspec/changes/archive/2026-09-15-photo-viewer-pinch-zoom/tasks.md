## 1. Setup

- [x] 1.1 Create branch `feat/photo-viewer-pinch-zoom` from `dev` (which already contains `fix-photo-relative-uri`)

## 2. Implementation

- [x] 2.1 ZoomablePhoto component with Native ScrollView zoom per page (Pinch zoom range): in `src/components/PhotoViewer.tsx` add a file-local `ZoomablePhoto({ uri, isActive, onZoomChange })` that renders a `ScrollView` (`minimumZoomScale={1}`, `maximumZoomScale={4}`, `centerContent`, `bouncesZoom`, both indicators hidden, `scrollEventThrottle={16}`, `screenWidth × screenHeight` style and content size) around the existing `Image` (`resizeMode="contain"`, `resolvePhotoUri` already applied by the caller); keep a `zoomedRef` updated from `onScroll` using `(nativeEvent.zoomScale ?? 1) > 1.01` and call `onZoomChange` only when it changes
- [x] 2.2 Double-tap zoom toggle with zoomToRect: wrap the `Image` in `Pressable`; treat a second press within 300 ms (ref timestamp) as a double tap; when not zoomed call `scrollResponderZoomTo({ x: locationX - w / 2, y: locationY - h / 2, width: w, height: h, animated: true })` with `w = screenWidth / 2.5`, `h = screenHeight / 2.5`; when zoomed call it with `{ x: 0, y: 0, width: screenWidth, height: screenHeight, animated: true }`; single taps do nothing
- [x] 2.3 Reset zoom when page changes (Zoom reset on page change): in `ZoomablePhoto`, a `useEffect` on `isActive` resets to the full-screen rect with `animated: false` and clears `zoomedRef` when `isActive` becomes `false` while zoomed
- [x] 2.4 Disable paging while zoomed (Pan while zoomed, Swipe paging at 1x): in `PhotoViewer` add `isZoomed` state; pass `scrollEnabled={!isZoomed}` and `extraData={currentIndex}` to the `FlatList`; render `ZoomablePhoto` from `renderItem({ item, index })` with `uri={resolvePhotoUri(item.uri)}`, `isActive={index === currentIndex}`, and an `onZoomChange` that sets `isZoomed` only when `index === currentIndex`; in `handleScroll` set `isZoomed` to `false` when the index changes
- [x] 2.5 Reset zoom on close and mount (Zoom reset on close): expose `resetZoom()` from `ZoomablePhoto` via a `ref` prop and `useImperativeHandle`; attach `activePhotoRef` to the active page; route the ✕ button and `Modal` `onRequestClose` through `handleClose`, which calls `activePhotoRef.current?.resetZoom()` before `onClose()`; call `resetZoom()` once in a mount effect

## 3. Verification

- [x] 3.1 Run `tsc --noEmit` under Node 20 and confirm no type errors
- [x] 3.2 [手動驗證] On this Mac run `npx expo start --dev-client --tunnel`, open the development build, and in a project with at least 2 photos confirm: Pinch zoom range (in to 4× and settles, out below 1× snaps back); Double-tap zoom toggle (zooms in at tap point, second double-tap returns to 1×, single tap does nothing); Pan while zoomed (drag stops at edge, page number unchanged); Swipe paging at 1x (indicator updates; one-photo project zooms with no indicator); Zoom reset on page change; Zoom reset on close — Reset zoom on close and mount (zoom, tap ✕, reopen → 1×; also swipe down to dismiss if available)
- [x] 3.3 Commit on `feat/photo-viewer-pinch-zoom` and ask the user before pushing to GitHub
