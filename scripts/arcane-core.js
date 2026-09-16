const MODULE = "arcane-core";
const FRAME_ID = "arcane-core-portrait";
// Same link format the dashboard's Graphics Management copy button hands out.
const GRAPHICS_LINK = /\/graphics\/([0-9a-f-]{36})\/([^/\s?#]+)/i;
const ZERO_UUID = "00000000-0000-0000-0000-000000000000";

const get = (key) => game.settings.get(MODULE, key);
const trimUrl = (url) => url.trim().replace(/\/+$/, "");

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
  const campaignId = get("campaignId").trim();
  const apiKey = get("apiKey").trim();
  if (!campaignId || !apiKey) return;

  const frame = document.createElement("iframe");
  frame.id = FRAME_ID;
  frame.className = get("corner");
  frame.src = `${trimUrl(get("baseUrl"))}/graphics/${encodeURIComponent(campaignId)}/${encodeURIComponent(apiKey)}/portrait`;
  frame.style.width = frame.style.height = `${get("size")}px`;
  frame.setAttribute("allowtransparency", "true");
  document.body.append(frame);
}

// Saving the settings form fires onChange once per changed setting; collapse that into one refresh.
const refresh = foundry.utils.debounce(async () => {
  render();
  if (!game.user.isGM) return;
  const result = await validate(get("baseUrl"), get("campaignId"), get("apiKey"));
  if (!result.ok) ui.notifications.error(`Arcane Core: ${result.message}`);
}, 100);

Hooks.once("init", () => {
  const register = (key, data) =>
    game.settings.register(MODULE, key, { scope: "world", config: true, onChange: refresh, ...data });

  register("campaignId", {
    name: "Campaign ID",
    hint: "From your Arcane Core dashboard. You can also paste a graphics link here to fill in both fields.",
    type: String,
    default: "",
  });
  register("apiKey", { name: "API Key", hint: "From the campaign's API dialog.", type: String, default: "" });
  register("baseUrl", {
    name: "Arcane Core URL",
    hint: "Change only if you self-host Arcane Core.",
    type: String,
    default: "https://app.arcanecore.gg",
  });
  register("corner", {
    name: "Corner",
    type: String,
    choices: { "top-left": "Top left", "top-right": "Top right", "bottom-left": "Bottom left", "bottom-right": "Bottom right" },
    default: "bottom-right",
  });
  register("size", { name: "Size (px)", type: Number, default: 200 });
});

Hooks.once("ready", render);

Hooks.on("renderSettingsConfig", (app, html) => {
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
    if (current !== run) return; // a newer check started while this one was in flight
    status.dataset.state = result.ok ? "ok" : "error";
    status.textContent = `${result.ok ? "✓" : "✗"} ${result.message}`;
  };

  for (const el of [campaignInput, keyInput, urlInput]) el.addEventListener("change", check);
  check();
});
