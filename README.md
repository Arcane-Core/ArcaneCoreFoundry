# ArcaneCoreFoundry

A FoundryVTT module (v13–v14) that shows the NPC currently speaking in Arcane Core as a square portrait in a corner of the game board. It embeds Arcane Core's "Portrait Only" graphic, so it follows the live NPC automatically.

## Install

Copy or symlink this folder into your Foundry `Data/modules/arcane-core`, then enable **Arcane Core** in your world.

## Setup (GM)

1. In Arcane Core, open your campaign's API dialog and copy the **campaign ID** and **API key**. You can also copy the **Portrait Only** link from Graphics Management.
2. In Foundry, open **Configure Settings → Arcane Core** and paste both values. If you paste a graphics link into Campaign ID, it fills in both fields.
3. The line under API Key checks your values as you type and shows **✓ Connected** when they're valid.
4. Pick a corner and size, then click Save.

If you regenerate the key in Arcane Core, paste the new one here.

> Every client in the world can read world settings, so players can see the API key. It's the read-only graphics key: it can only view the live graphic, not change anything.
