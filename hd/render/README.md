# The darkroom: how the HD pictures are made

Every picture in the HD game is path-traced offline from a scene written as signed distance functions (SDFs) in GLSL, on the GPU, in headless Edge. Nothing is drawn by hand and no outside assets are used.

The look we are after: **a real miniature film set, photographed.** Real toys, wool-felt puppets, enamelled steel, brass, paper. Warm lamp light against cold moonlight, soft shadows, a little haze.

## Running it

Run from **PowerShell** (Edge will not start from the sandboxed Bash tool), in `hd/render`:

```
node darkroom.mjs scenes/gift.glsl --model teddy --out out/gifts/teddy.png              # one gift sprite, 448 px, about 10 s
node darkroom.mjs scenes/gift.glsl --model scooter --hue pink --out out/gifts/scooter-pink.png
node darkroom.mjs scenes/gift.glsl --model teddy --spp 60 --out out/tmp/teddy.png        # quick look while modelling
node darkroom.mjs scenes/gift.glsl --model teddy --D INSPECT=1 --out out/tmp/t.png      # flat light, to check shapes
node darkroom.mjs scenes/gift.glsl --model teddy --D DEBUG=1 --spp 4 --out out/tmp/n.png # normals (2 = depth, 3 = material ids)
node comp.mjs out/comp.png out/gifts/teddy.png@520 out/gifts/kite-red.png@260           # sprites placed on the belt, as in the game
node sheet.mjs out/gifts out/sheet.png --cols 6 --cell 300 --ar 1 --bg "#1a2233"        # contact sheet
```

Any header setting can be overridden on the command line (`--w --h --spp --exposure --crop x,y,w,h` …). Look at a picture with the Read tool. Names for `--hue`: red, blue, green, pink, yellow, brown, purple.

## Files

- `lib.glsl`: maths, noise, distance functions. `mat.glsl`: the material library. `pt.glsl`: the path tracer. `page.js`, `darkroom.mjs`: the driver. **Shared: do not edit these unless you own them.**
- `rigs/*.glsl`: a set's lights, shared by the set and by everything composited into it.
- `scenes/*.glsl`: one picture each. `models/*.glsl`: one object each.

## Writing a gift model (`models/<icon>.glsl`)

A model file defines exactly two functions:

```glsl
void mGift(vec3 p, inout float d)                                  // geometry: call add(d, distance, materialId) for each part
bool shGift(float id, vec3 p, inout vec3 n, inout Mat m)           // materials: fill m for your ids and return true; return false for other ids
```

- **Size and place.** 1 unit is roughly 30 cm. The gift stands on the belt at y = 0, centred on x = 0, z = 0, and must fit inside x −0.62..0.62, y 0..1.25, z −0.5..0.5. Fill the box well: the gift is shown only about 110–170 px wide in the game, so a bold, instantly readable silhouette matters more than anything else. Turn the object to its most readable angle (often a three-quarter turn about y).
- **Camera.** Fixed: orthographic, from the front (+z), looking down 12 degrees. The key light comes from the upper left.
- **Material ids** 100..199 are yours. Anything else belongs to the scene.
- **Hue.** If the gift comes in colours, start the file with `#ifndef HUE` / `#define HUE srgb(r, g, b)` / `#endif` and use `HUE` for the main body. The driver sets it from `--hue`.
- **Colours** are written as they look on screen with `srgb(r, g, b)`, which converts to linear light.
- **Bounding volume.** Start `mGift` with a cheap bound, as `models/teddy.glsl` does: `float bb = length(p - centre) - radius; if (bb > 0.15) { d = min(d, bb); return; }`. Never skip geometry with a bare `if (p.x > …)`: the tracer then steps straight through it and you get black bands.
- Helper functions of your own need a prefix unique to your file (for example `kiteTail`), because several files can be compiled together.

### Rules that keep the tracer happy

- `smoothstep(a, b, x)` needs a < b. For a falling edge write `1.0 - smoothstep(lo, hi, x)`. A reversed one silently renders black or garbage.
- Distances must not overestimate. After bending, twisting, displacing or scaling space unevenly, multiply the result by 0.5–0.8. Signs of trouble: holes, banding, noise that never clears.
- Surface texture pushed into the geometry (fur, knit, grooves) should stay under about 0.02 units deep. Finer detail belongs in `shGift` as colour, roughness and normal changes.
- No sharp CSG edges anywhere. Real objects have bevels: use `sdRBox`, `sdRCyl`, `smin`/`smax` with a small radius. A razor edge is the fastest way to look computer-made.

### What makes it look photographed (the bar is high)

1. **Use the material library** in `mat.glsl` (`matWood`, `matPaint`, `matPlastic`, `matMetal`, `matRubber`, `matFelt`, `matKnit`, `matCloth`, `matPaper`, `matLeather`, `matGlass`…). They already carry uneven gloss, dust, scratches and fibres. Do not hand-roll a flat colour.
2. **Model how it is made.** Seams, stitches, screws, rivets, joints between parts, mould lines, a hem, a label, laces, glue lines. Parts are separate pieces that touch, not one fused blob.
3. **Break up every large surface**: wood grain running the right way on each part, paint wear on edges, a stripe, a printed pattern, panel gaps.
4. **Real proportions.** Check what the real thing looks like, and how big its parts are relative to each other.
5. **Imperfect on purpose**: slightly uneven, a little sag in cloth, one lace longer than the other. Never perfectly symmetric unless it is machined.
6. **Reads at thumbnail size.** Shrink it in your head to 110 px on a dark navy and charcoal background. Is it obvious what it is? Very dark objects vanish: lift them with lighter trim or a paler material.

`models/teddy.glsl` is the reference for effort and style. Look at `out/gifts/teddy.png` before you start.

### Working loop

Render at `--spp 60`, look at the PNG, fix, repeat. Use `INSPECT` and `DEBUG` when a shape is wrong. When it is right, render the final at the default settings to `out/gifts/<icon>.png` (and `out/gifts/<icon>-<hue>.png` for each colour needed), and check it once in place with `comp.mjs`.

## Stills for the films (intro, interludes, closing film)

The films are told in stills: each beat of a scene is one path-traced picture of the whole set with the puppets posed in it, and the game cross-fades between them under the original captions and timing. Lettering, numbers and anything that changes at run time is drawn over the still by the game, so those surfaces are rendered **blank and facing the camera**.

- A still is **1600 x 1000** (the films' own stage). Scene files live in `scenes/cuts/<name>.glsl`. Each picture is one header line in the file:
  `//@shot intro-2a BEAT=0` makes `cut-intro-2a`. Upper-case words become `#define`s, lower-case ones override header settings (`spp=`, `exposure=`, `w=`, `h=`, `alpha=1`, `crop=x,y,w,h`).
- Draft them with `node shots.mjs --draft --force cut-intro-2` (writes `out/draft/cut-intro-2a.png` …) and look at them. Finals: `node shots.mjs --force cut-intro-2` (writes `out/final/`). One render job at a time: the GPU is shared.
- The old drawn frames are in `out/ref/` (`desktop-intro2a.png` …). **Match their staging**: where each character and prop sits in the frame, what is in the scene, the mood. You are re-shooting the same storyboard on a real miniature set, not redesigning it. Keep the middle-bottom of the frame (x 400..1200, y 820..1000) free of anything important: the caption sits there.
- Use an orthographic or long-lens camera looking straight at the set (a few degrees down at most), as `scenes/belt.glsl` and `scenes/desk.glsl` do, so that blank signs, screens and sheets are true rectangles in the picture. In your report give the pixel rectangle `[x, y, w, h]` (in the 1600 x 1000 still) of every blank surface the game must letter.
- The cast is ready-made. Include the model file and place the puppet; do not remodel them:
  - `models/fc.glsl`: Father Christmas. `mFC(p - pos, d)` / `shFC(id, p - pos, n, m)`. Poses by `#define POSE` 0..5 and `STAGE` 0..3 (see the file), or `#define FC_CUSTOM` and your own pose constants; `#define FC_LEGS` for a standing figure. One per picture. Seated, his waist is at y = 0 and his head 3.3 up; standing, his soles are at y = -3.05.
  - `models/elf.glsl`: `mElf(p - pos, d, handLeft, handRight, eyes, badge)` / `shElf(id, p - pos, n, m)`. About 3.5 tall, 4.6 with the hood. Several per picture is fine.
  - `models/board.glsl`: `mBoard(p - pos, d, pose)` / `shBoard(id, p - pos, n, m, tieColour)`. Seated, table top at y = 0. Five of them, identical.
  - `models/droid.glsl`: `mDroid(p - pos, d, carry)` / `shDroid(id, p - pos, n, m)`. About 2.9 tall.
  - When two puppets of the same kind are in one picture, shade by position: call the `sh…` function with `p - posOfTheNearest`.
  - Scale the whole set to the cast (Father Christmas is about 6.4 tall standing), not the cast to the set.
- Light it like the game: warm practical lamps (a visible pendant or desk lamp) against cold blue moonlight or city light, a soft fill from the camera side so nothing important goes black, a little haze in the lamp's beam (`FOG`, `FOG_LIGHT`). `scenes/belt.glsl`, `scenes/desk.glsl` and their rigs are the reference for quality and for how to structure a set (bounding boxes round each group, material ids, `shade`).
- Faces and hands must read: check a preview at half size. Expose so the still sits comfortably on a dark navy page.
