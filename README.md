# Birthday Surprise Website

This project is separated into clean files so it is easier to maintain.

## Folder structure

```text
birthday_surprise_clean/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── config.js
│   └── app.js
└── assets/
    ├── images/
    └── audio/
```

## What to edit

### index.html
Use this for page structure only.
Usually you do not need to change this often.

### css/style.css
Use this for design and animations:
- Card size
- Background color
- Font size
- Bubble style
- Confetti style
- Mobile layout

### js/config.js
Use this for most future changes:
- Birthday name
- Main photo
- Music link
- Birthday messages
- Bubble images and positions
- Gift messages and positions
- Turn effects on/off

### js/app.js
Use this only when adding new logic or new features.

## Important

For GitHub Pages, keep the file names exactly like this:

```html
<link rel="stylesheet" href="css/style.css">
<script src="js/config.js"></script>
<script src="js/app.js"></script>
```

`config.js` must be loaded before `app.js`.
