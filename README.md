# ArcaneCoreFoundry

A FoundryVTT module (v13–v14) that shows the NPC currently speaking in Arcane Core as a square portrait on the game board. By default it sits in one of Foundry's interface columns, and each player can drag it anywhere or resize it. It embeds Arcane Core's "Portrait Only" graphic, so it follows the live NPC automatically.

## Install

Copy or symlink this folder into your Foundry `Data/modules/arcane-core`, then enable **Arcane Core** in your world.

## Setup (GM)

1. In (Arcane Core)[https://app.arcanecore.gg], open your campaign's API dialog and copy the **campaign ID** and **API key**. You can also copy the **Portrait Only** link from Graphics Management.
2. In Foundry, open **Configure Settings → Arcane Core** and paste both values. If you paste a graphics link into Campaign ID, it fills in both fields.
3. The line under API Key checks your values as you type and shows **✓ Connected** when they're valid.
4. Pick a default position and size, then click Save. The portrait sits in Foundry's own interface columns, so the sidebar, scene controls and scene navigation push it aside instead of covering it. Each player can drag the portrait anywhere on their screen, or drop it on one of the highlighted slots to lock it there, and resize it from its corner. Their placement is saved for them only. Hovering the portrait shows buttons to reset it to the default placement or hide it (turn it back on with Show Portrait).

If you regenerate the key in Arcane Core, paste the new one here.
