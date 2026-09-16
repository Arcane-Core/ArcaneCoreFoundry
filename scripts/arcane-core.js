import {
  FRAME_ID,
  GRAPHICS_LINK,
  MAX_SIZE,
  MIN_SIZE,
  MODULE,
  POSITIONS,
  SNAP_DISTANCE,
  ZERO_UUID,
} from "./constants.js";
import { get, move, trimUrl, uiScale } from "./helpers.js";
import { registerSettings } from "./settings.js";

/** Uses /api/npc/getNpc: its middleware checks the campaign id and key before the NPC lookup. */
async function validate(baseUrl, campaignId, apiKey) {
  if (!campaignId || !apiKey) return { ok: false, message: "Enter a campaign ID and API key" };
  try {
    const res = await fetch(`${trimUrl(baseUrl)}/api/npc/getNpc?npcId=${ZERO_UUID}`, {
      headers: { "x-campaign-id": campaignId.trim(), "x-api-key": apiKey.trim() },
    });
    if (res.ok) return { ok: true, message: "Connected" };
    if (res.status === 400) return { ok: false, message: "Invalid campaign ID" };
    if (res.status === 403) return { ok: false, message: "Invalid API key for this campaign" };
    return { ok: false, message: `Arcane Core returned ${res.status}` };
  } catch {
    return { ok: false, message: "Can't reach Arcane Core at that URL" };
  }
}

function render() {
  document.getElementById(FRAME_ID)?.remove();
  if (!get("showPortrait") || new Set(get("hiddenFor")).has(game.user.id)) return;
  const campaignId = get("campaignId").trim();
  const apiKey = get("apiKey").trim();
  if (!campaignId || !apiKey) return;

  const frame = document.createElement("iframe");
  frame.src = `${trimUrl(get("baseUrl"))}/graphics/${encodeURIComponent(campaignId)}/${encodeURIComponent(apiKey)}/portrait`;
  frame.setAttribute("allowtransparency", "true");
  const handle = document.createElement("div");
  handle.className = "arcane-core-resize";

  const el = document.createElement("div");
  el.id = FRAME_ID;
  const button = (icon, label, onClick) => {
    const b = document.createElement("button");
    b.type = "button";
    b.innerHTML = `<i class="fa-solid ${icon}" inert></i>`;
    b.ariaLabel = b.dataset.tooltip = label;
    b.addEventListener("click", onClick);
    return b;
  };
  const toolbar = document.createElement("div");
  toolbar.className = "arcane-core-toolbar";
  toolbar.append(
    button("fa-arrow-rotate-left", "Reset position and size", () =>
      game.settings.set(MODULE, "layout", {}).then(render),
    ),
    button("fa-xmark", "Hide portrait", async () => {
      await game.settings.set(MODULE, "showPortrait", false);
      ui.notifications.info(
        "Arcane Core portrait hidden. Turn Show Portrait back on in Configure Settings → Arcane Core.",
      );
    }),
  );

  el.append(frame, handle, toolbar);
  const layout = { slot: get("position"), size: get("size"), ...get("layout") };
  el.style.width = el.style.height = `${layout.size}px`;
  place(el, layout);
  el.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || event.target.closest("button")) return;
    event.preventDefault();
    (event.target === handle ? resize : drag)(event, el, layout);
  });
}

function place(el, layout) {
  const position = POSITIONS[layout.slot];
  const slot = position && document.getElementById(position.slot);
  if (position && !slot) console.warn(`Arcane Core: #${position.slot} not found, placing the portrait freely`);
  if (slot) {
    el.style.left = el.style.top = "";
    move(slot, el, position.before(slot));
  } else {
    const size = el.offsetWidth || layout.size;
    el.style.left = `${Math.clamp(layout.left ?? 16, 0, Math.max(0, window.innerWidth - size))}px`;
    el.style.top = `${Math.clamp(layout.top ?? 16, 0, Math.max(0, window.innerHeight - size))}px`;
    move(document.getElementById("interface") ?? document.body, el, null);
  }
  el.dataset.handle = slot ? position.handle : "bottom-right";
  el.classList.toggle("free", !slot);
}

function drag(event, el, layout) {
  const start = el.getBoundingClientRect();
  const offset = { x: event.clientX - start.left, y: event.clientY - start.top };
  place(el, { ...layout, slot: null, left: start.left, top: start.top });
  el.setPointerCapture(event.pointerId);

  const size = layout.size * uiScale();
  const zones = Object.entries(POSITIONS).flatMap(([key, position]) => {
    const rect = document.getElementById(position.slot)?.getBoundingClientRect();
    if (!rect) return [];
    const zone = { key, ...position.zone(rect, size, uiScale()), el: document.createElement("div") };
    zone.el.className = "arcane-core-zone";
    Object.assign(zone.el.style, {
      left: `${zone.left}px`,
      top: `${zone.top}px`,
      width: `${size}px`,
      height: `${size}px`,
    });
    el.before(zone.el);
    return [zone];
  });

  let snap = null;
  const onMove = (e) => {
    const left = e.clientX - offset.x;
    const top = e.clientY - offset.y;
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    snap = zones.find((z) => Math.hypot(z.left - left, z.top - top) < SNAP_DISTANCE) ?? null;
    for (const z of zones) z.el.classList.toggle("active", z === snap);
  };
  onMove(event);
  el.addEventListener("pointermove", onMove);
  el.addEventListener(
    "lostpointercapture",
    () => {
      el.removeEventListener("pointermove", onMove);
      for (const z of zones) z.el.remove();
      if (snap) Object.assign(layout, { slot: snap.key, left: undefined, top: undefined });
      else
        Object.assign(layout, {
          slot: "free",
          left: Math.round(parseFloat(el.style.left)),
          top: Math.round(parseFloat(el.style.top)),
        });
      place(el, layout);
      save(layout);
    },
    { once: true },
  );
}

function resize(event, el, layout) {
  const rect = el.getBoundingClientRect();
  const [vertical, horizontal] = el.dataset.handle.split("-");
  const anchor = {
    x: horizontal === "right" ? rect.left : rect.right,
    y: vertical === "bottom" ? rect.top : rect.bottom,
  };
  const scale = rect.width / layout.size;
  el.setPointerCapture(event.pointerId);

  const onMove = (e) => {
    const reach = Math.max(Math.abs(e.clientX - anchor.x), Math.abs(e.clientY - anchor.y)) / scale;
    layout.size = Math.round(Math.clamp(reach, MIN_SIZE, MAX_SIZE));
    el.style.width = el.style.height = `${layout.size}px`;
  };
  el.addEventListener("pointermove", onMove);
  el.addEventListener(
    "lostpointercapture",
    () => {
      el.removeEventListener("pointermove", onMove);
      save(layout);
    },
    { once: true },
  );
}

const save = ({ slot, left, top, size }) => game.settings.set(MODULE, "layout", { slot, left, top, size });

const refresh = foundry.utils.debounce(async () => {
  render();
  if (!game.user.isGM) return;
  const result = await validate(get("baseUrl"), get("campaignId"), get("apiKey"));
  if (!result.ok) ui.notifications.error(`Arcane Core: ${result.message}`);
}, 100);

Hooks.once("init", () => registerSettings({ refresh, render }));

Hooks.once("ready", render);

Hooks.on("renderSettingsConfig", (_app, html) => {
  if (!game.user.isGM) return;
  const input = (key) => html.querySelector(`[name="${MODULE}.${key}"]`);
  const campaignInput = input("campaignId");
  const keyInput = input("apiKey");
  const urlInput = input("baseUrl");
  const group = keyInput?.closest(".form-group");
  if (!group || group.querySelector(".arcane-core-status")) return;

  const status = document.createElement("p");
  status.className = "hint arcane-core-status";
  group.append(status);

  let run = 0;
  const check = async () => {
    const link = GRAPHICS_LINK.exec(campaignInput.value);
    if (link) [campaignInput.value, keyInput.value] = [link[1], link[2]];

    const current = ++run;
    status.dataset.state = "checking";
    status.textContent = "Checking…";
    const result = await validate(urlInput.value, campaignInput.value, keyInput.value);
    if (current !== run) return;
    status.dataset.state = result.ok ? "ok" : "error";
    status.textContent = `${result.ok ? "✓" : "✗"} ${result.message}`;
  };

  for (const el of [campaignInput, keyInput, urlInput]) el.addEventListener("change", check);
  check();
});
