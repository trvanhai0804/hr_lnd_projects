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
Three friends bring presents one at a time: Pepper, then Biscuit, then Pip. Click each gift box to open it in a pop-up window; when you close it, that cat takes a seat by the cake, the opened box is set down on the floor to the right of the table (click it any time to see that gift again), and the next cat walks in. Then click the cake to light the candles and click again to blow them out. The gold frame on the wall shows your photos as a slideshow. Click the cats as often as you like.
</details>

## Personalising it

Everything personal is in **`js/config.js`**. Open it in Notepad:

- **`name`**: the player's name, used throughout the game.
- **`guide.name`**: the kitten guide's name (default *Pip*).
- **`cats.one` / `cats.two`**: each cat's name (shown on the food bowls), coat pattern (`tabby`, `tuxedo`, `solid` or `calico`) and colours (fur, light side, shadow side, belly or chest, eyes, nose). Change these to match Anne's real cats and they update in every scene.
- **`gifts`**: the three presents in the party room. Each entry is an HTML file in `assets/gift` and who brings it (`one`, `two` or `pip`). Keep any files a gift page needs (its CSS, JS, images) next to it in `assets/gift`, using the same relative paths the page expects.
- **`book`**: the soft-black book on the party table. Put its HTML page in `assets/book` and set `file` (e.g. `book: { file: 'book.html' }`); clicking the book then opens it in the same pop-up window as the gifts. Until then it shows a short "still being written" message.
- **Photos for the party-room frame**: put pictures in `assets/photos`. They play one at a time in the gold frame on the wall, looping every 2 seconds (`photoSeconds`). Name them `1.jpg`, `2.jpg`, `3.png` … (double-click `assets/photos/number-my-photos.bat` to do this automatically), or keep your own names and list them in `photos: [...]`. See `assets/photos/HOW-TO-ADD-PHOTOS.txt`.

Save the file and refresh the browser. If you've already played, use **menu → Start over** to see the changes from the beginning.

## Project structure

```
var-06/
├── assets/photos/  – your pictures for the party-room photo frame
├── assets/gift/    – the three HTML gift pages opened in the party room
├── assets/book/    – the HTML page for the black book on the party table (add later)
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
