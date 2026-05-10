/**
 * sliceNavBus.js
 * --------------
 * Tiny pub/sub used by Voice Control (and any future external feature) to
 * drive the existing 2D SliceViewer without changing its rendering logic.
 *
 * SliceViewer subscribes once on mount and reacts to the events:
 *   - setAxis        { axis: "axial" | "coronal" | "sagittal" }
 *   - setSliceIndex  { index: number }
 *   - nextSlice      {}
 *   - prevSlice      {}
 *   - jumpToTumor    {}
 */

const target = new EventTarget();

export const SLICE_EVENTS = {
  SET_AXIS: "neurolens:slice:setAxis",
  SET_INDEX: "neurolens:slice:setIndex",
  NEXT: "neurolens:slice:next",
  PREV: "neurolens:slice:prev",
  JUMP_TO_TUMOR: "neurolens:slice:jumpToTumor",
};

export function emitSliceEvent(name, detail = {}) {
  target.dispatchEvent(new CustomEvent(name, { detail }));
}

export function onSliceEvent(name, handler) {
  const wrapped = (e) => handler(e.detail || {});
  target.addEventListener(name, wrapped);
  return () => target.removeEventListener(name, wrapped);
}

export const sliceNav = {
  setAxis: (axis) => emitSliceEvent(SLICE_EVENTS.SET_AXIS, { axis }),
  setSliceIndex: (index) => emitSliceEvent(SLICE_EVENTS.SET_INDEX, { index }),
  next: () => emitSliceEvent(SLICE_EVENTS.NEXT),
  prev: () => emitSliceEvent(SLICE_EVENTS.PREV),
  jumpToTumor: () => emitSliceEvent(SLICE_EVENTS.JUMP_TO_TUMOR),
};
