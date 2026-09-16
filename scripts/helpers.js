import { MODULE } from "./constants.js";

export const get = (key) => game.settings.get(MODULE, key);
export const trimUrl = (url) => url.trim().replace(/\/+$/, "");
export const uiScale = () => parseFloat(getComputedStyle(document.body).getPropertyValue("--ui-scale")) || 1;

export function move(parent, el, before) {
  if (before === el) return;
  try {
    parent.moveBefore(el, before);
  } catch {
    parent.insertBefore(el, before);
  }
}
