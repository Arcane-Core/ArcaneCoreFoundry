import { MODULE, POSITIONS } from "./constants.js";

/**
 * Registers the module's settings; call from the init hook.
 * @param refresh re-renders and re-validates; the default onChange
 * @param render re-renders only
 */
export function registerSettings({ refresh, render }) {
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
  register("position", {
    name: "Position",
    type: String,
    hint: "The default. Each player can drag the portrait somewhere else for themselves.",
    choices: Object.fromEntries(Object.entries(POSITIONS).map(([key, { label }]) => [key, label])),
    default: "top-right",
  });
  register("size", {
    name: "Size (px)",
    hint: "The default. Each player can resize the portrait from its corner. The left-hand column is 200px wide, so larger portraits there overlap the board.",
    type: Number,
    default: 200,
  });
  register("showPortrait", {
    name: "Show Portrait",
    hint: "Only affects you.",
    scope: "user",
    type: Boolean,
    default: true,
    onChange: render,
  });
  register("layout", { scope: "user", config: false, type: Object, default: {}, onChange: undefined });
  const { SetField, StringField } = foundry.data.fields;
  register("hiddenFor", {
    name: "Hide Portrait For",
    hint: "These players never see the portrait, whatever their own setting.",
    type: new SetField(
      new StringField({
        choices: () => Object.fromEntries(game.users.filter((u) => !u.isGM).map((u) => [u.id, u.name])),
      }),
    ),
    default: [],
    onChange: render,
  });
}
