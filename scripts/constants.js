export const MODULE = "arcane-core";
export const FRAME_ID = "arcane-core-portrait";
export const GRAPHICS_LINK = /\/graphics\/([0-9a-f-]{36})\/([^/\s?#]+)/i;
export const ZERO_UUID = "00000000-0000-0000-0000-000000000000";
export const POSITIONS = {
  "top-right": {
    label: "Top right, beside the sidebar",
    slot: "ui-right-column-1",
    before: (slot) => slot.firstChild,
    handle: "bottom-left",
    zone: (r, s, scale) => ({ left: r.right - s, top: r.top + 16 * scale }),
  },
  "top-left": {
    label: "Top left, above scene navigation",
    slot: "ui-left-column-2",
    before: (slot) => slot.firstChild,
    handle: "bottom-right",
    zone: (r) => ({ left: r.left, top: r.top }),
  },
  "bottom-left": {
    label: "Bottom left, above the player list",
    slot: "ui-left-column-1",
    before: () => document.getElementById("players"),
    handle: "top-right",
    zone: (r, s, scale) => {
      const players = document.getElementById("players")?.getBoundingClientRect();
      return { left: r.left, top: (players ? players.top - 16 * scale : r.bottom) - s };
    },
  },
};
export const SNAP_DISTANCE = 64;
export const MIN_SIZE = 64;
export const MAX_SIZE = 800;
