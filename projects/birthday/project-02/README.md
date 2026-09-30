# A Small Adventure Awaits

A small point-and-click birthday adventure for Anne: four illustrated scenes, hidden objects, linked puzzles, two very innocent cats and a birthday surprise at the end. It takes about 10–15 minutes to play.

## How to play

1. Copy the whole `var-06` folder to the laptop (for example, the Desktop).
2. Double-click **`index.html`**. It opens in Microsoft Edge or Google Chrome.
3. A welcome screen asks the player to put headphones on. The game begins only after clicking **Start the adventure** (or **Continue the adventure** for a saved game, with an option to start again from the beginning).

You don't need to install anything, run a server, or be online. All artwork, sound and code are in the folder.

**Controls**
- Click things in the scene to look at them, pick them up or open them.
- Collected items appear in the slim tray on the right edge of the screen. Click an item to read it again. For the key, click it to pick it up, then click where you want to use it. Right-click or press Esc to put it back.
- **Pip the kitten** (lower-left corner) is your guide. At the start of every scene she explains the mission for that room (press **Let's go!** to begin). She pops up to talk, tells you what to do next after each step, and nudges you if you are stuck for a while. Click her (or the lightbulb button) any time for exact instructions. Click her speech bubble to close it.
- Top-right buttons: **help** (lightbulb, same as clicking Pip), **sound** on/off, **menu** (start over).
- Esc or the back arrow closes a close-up view.
- Progress saves automatically in the browser, so you can close the tab and carry on later.

## Walkthrough (spoilers)

<details>
<summary>Show the solution</summary>

**Scene 1 – The garden**
1. Open the red book on the bench and take the envelope sticking out of it. The note says *"Where flowers sleep…"*.
2. The small fern pot beside the bench, on a stone plinth, has a crescent moon engraved on it. Press the moon to open a hidden drawer with a wooden box.
3. The box lid shows **sun, moon, star**. Brush the moss off the sundial: sun = 4, moon = 7, star = 2. Set the lock to **4-7-2** and press the latch.
4. Take the brass key, select it in the tray and click the front door.

**Scene 2 – The cottage**
1. A note is tucked under the teacup saucer on the tea table. It's a riddle about the sea, the oaks and the night sky.
2. On the bookshelf, open *Tales of the Sea* (crown), *The Whispering Oak* (feather) and *Atlas of the Night Sky* (heart).
3. Set the cabinet medallions under the window to I = crown, II = feather, III = heart. Open the gift inside.
4. Close the note. The side door creaks open by itself.

**Scene 3 – The cats' room**
Find all six invitation pieces:
- under the floor cushions (click the cushions to move them)
- between the toppled books
- in the yarn basket
- in the soil of the knocked-over pot
- under the curled-up rug corner
- the ginger cat in the cardboard box has one (click the box, then click the cat)

Open the pieces from the tray and drag them into place. Close the invitation and the door with the sign opens.

**Scene 4 – The party**
Three friends bring presents one at a time: Pepper, then Biscuit, then Pip. Click each gift box to open it in a pop-up window (Biscuit's is a claw machine: line the claw up over the envelope, drop it, then collect the envelope from the prize slot and click the seal); when you close it, that cat takes a seat by the cake, the opened box is set down on the floor to the right of the table (click it any time to see that gift again), and the next cat walks in. Then click the cake to light the candles and click again to blow them out. The gold frame on the wall shows your photos as a slideshow. Click the cats as often as you like.
</details>

## Personalising it

Everything personal is in **`js/config.js`**. Open it in Notepad:

- **`name`**: the player's name, used throughout the game.
- **`guide.name`**: the kitten guide's name (default *Pip*).
- **`cats.one` / `cats.two`**: each cat's name (shown on the food bowls), coat pattern (`tabby`, `tuxedo`, `solid` or `calico`) and colours (fur, light side, shadow side, belly or chest, eyes, nose). Change these to match Anne's real cats and they update in every scene.
- **`gifts`**: the three presents in the party room. Each entry is an HTML file in `assets/gift` and who brings it (`one`, `two` or `pip`). Keep any files a gift page needs (its CSS, JS, images) next to it in `assets/gift`, using the same relative paths the page expects.
- **`book`**: the soft-black book on the party table opens the memory book, `memories.html` (see *The memory book* below).
- **Photos for the party-room frame**: put pictures in `assets/photos`. They play one at a time in the gold frame on the wall, looping every 2 seconds (`photoSeconds`). Name them `1.jpg`, `2.jpg`, `3.png` … (double-click `assets/photos/number-my-photos.bat` to do this automatically), or keep your own names and list them in `photos: [...]`. See `assets/photos/HOW-TO-ADD-PHOTOS.txt`.

Save the file and refresh the browser. If you've already played, use **menu → Start over** to see the changes from the beginning.

## Project structure

```
var-06/
├── assets/photos/  – your pictures for the party-room photo frame
├── assets/gift/    – the three HTML gift pages opened in the party room
├── assets/memories/ – photos for the memory book (2022/ 2023/ 2024/ 2025/ 2026/ cats/)
├── memories.html   – the memory book (with css/memories.css, js/memories.js, js/memories-data.js)
├── index.html      – page shell (HUD, inventory, close-up frame, overlays)
├── css/style.css   – interface styling and all animations
└── js/
    ├── config.js   – personal settings (name, cats, photos, gifts)
    ├── audio.js    – synthesised sound effects and gentle music (Web Audio, no files)
    ├── art.js      – shared illustration toolkit: textures, foliage, masonry, symbols, the cats, item icons
    ├── engine.js   – game state and saving, scene rendering, close-ups, inventory, hints, captions, transitions
    ├── guide.js    – Pip, the kitten guide who explains what to do
    ├── scene1.js   – the garden and cottage door
    ├── scene2.js   – the cottage interior
    ├── scene3.js   – the cats' room and the invitation jigsaw
    └── scene4.js   – the birthday room, gift-bearing cats, cake, confetti and photo frame
```

**Technical notes**
- All artwork is original vector illustration, generated in code and textured with SVG filters. Each scene's static background is rendered once to an image, and the interactive and animated objects are drawn as live SVG on top.
- Every scene uses a fixed 1600×900 coordinate system scaled to fill the window. On wide windows such as laptops (where browser bars take up height) at most a sliver is trimmed from the top and bottom; beyond that the whole scene is shown with a soft blurred backdrop at the sides, so nothing on the floor is ever cut off. Hotspots are the drawn objects themselves, so they stay aligned at any window size or aspect ratio. Important objects are kept inside the area that stays visible down to a 4:3 window.
- Music starts after the first click, as browsers require.
- Plain HTML, CSS and JavaScript with no libraries and no build step.

## Gift 1 – the garden

`assets/gift/gift1_garden.html` is a short, hands-free animation: in the dark, two cats (a calm tuxedo with a seed, an excitable ginger with a leaf on its tail) plant a seed, and every leaf and flower grows where a cat touches. The garden then glows, the cats settle, and a birthday message fades in with a small **Replay** button. Edit the message in the `MESSAGE` object at the top of the `<script>` in that file. Visitors who use reduced motion get a calm, complete version (preview it by adding `#reduced` to the address and reloading).

## Gift 2 – the claw machine

`assets/gift/gift2_claw.html` (with `gift2_claw.js`) is a claw machine called *Special Delivery*. Anne steers the claw with the arrow buttons or the ← → keys, drops it with the Drop button or Space, and tries to catch the sealed envelope. The claw lands exactly where it is lined up (its shadow helps), and after a couple of misses the catch zone quietly gets a little wider. A caught envelope is carried to the chute and drops into the prize slot. She clicks it there, breaks the paw-print wax seal, and the letter unfolds and writes itself out. **Show full letter** skips the writing, **Read it again** replays it, and **Back to the party** (or Esc) closes the gift. Reopening the gift from the party room puts the envelope straight in the prize slot, with an option to play the claw again.

- **The letter:** edit the `LETTER` block near the bottom of `gift2_claw.html`. It holds the envelope name, greeting, message paragraphs, signature and the cats' optional P.S. Set `postscript: null` to remove the P.S.
- **The plush toys** take their colours and patterns from the cats in `js/config.js`.
- Sounds are generated in the browser, start after the first click and follow the game's sound button.

## Gift 3 – the climb and the wish

`assets/gift/gift3_wish.html` (with `gift3_climb.js`, `gift3_script.js`, `gift3_style.css`) opens under the stars at the foot of a moonlit mountain. Anne guides the climber to the summit in four short stages: click **Keep climbing**, the glinting foothold, or press Enter / Space / Up. At the top she reaches for the moon. Touching it draws the view in close to her as the moon rises into the sky, and the birthday cake appears in the air beside her at chest height. The original cake-and-wish scene continues (candles, wishes, shooting stars, fireworks, constellations). Near the end a line wishes her well for Sơn Đoòng, 2028, and a quiet **Replay** starts again from the climb.
- The climb's texts are in `CLIMB_TEXT` at the top of `gift3_climb.js`. The Sơn Đoòng line is near the end of `gift3_wish.html`.
- Everything is local (no web fonts or icon libraries), so it works offline.
- Visitors who use reduced motion get a calm version: fades instead of walking, and the cake appears complete. To preview it, add `#reduced` to the address and reload.

## The memory book

Clicking the soft-black book on the party table makes it fly off the table to the centre of the screen, turning into its leather cover as the room fades, and opens **`memories.html`**, a physical scrapbook of the years we worked together:
cover → introduction → one spread per year → the blank "2027 — ?" page (with paw prints and the two new cats) → the last page with the pen. "Close the book" closes it and returns to the party room (no welcome screen).

**Everything editable is in `js/memories-data.js`:**
- `RETURN_PAGE`: the page to go back to (default `index.html`).
- `BOOK_TEXT`: the cover title, subtitle and intro lines.
- `MEMORIES`: one entry per year with `year`, `title`, the sticky `note`/`noteBack`, and `photos` (`src` + `caption`). Up to 4 photos per page (8 per year). Add `hidden: true` to a photo to tuck it underneath the one before it, `doNotClick: true` to cover it with a "DO NOT CLICK" note, or `wide: true` to give a landscape photo a wide frame along the bottom of its page. Add `notePage: "left"` to a year to put its sticky note on the left page, and `leftPhotos` (1–4) to choose how many photos go on the left page.
- `FUTURE` and `CATS`: the 2027 page and the two cat photos (captions default to the cat names in `config.js`).
- `FINAL`: the last page's text and the line the pen writes.

**Photos** go in `assets/memories/2022/photo-01.jpg` and so on, and `assets/memories/cats/cat-01.jpg` / `cat-02.jpg`. Until a photo exists the book shows a soft placeholder with its file name (and illustrated cats), so nothing breaks. Only the pages near the one being read are loaded.

**Reading the book:** click the cover to open it; click (or drag) the right edge of a page to turn forward and the left edge to go back; arrow keys work too. Click any photo to pick it up, and click again to put it back.
