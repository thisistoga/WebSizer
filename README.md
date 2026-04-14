# WebSizer

A lightweight Chrome extension that resizes the browser **viewport** (not the outer window) to predetermined sizes for responsive design testing.

Unlike most resize extensions that just call `window.resizeTo()` and leave you with the wrong viewport size, WebSizer measures your browser's UI offset and compensates so the inner viewport matches the target dimensions exactly.

## Features

- **Pixel-accurate viewport sizing** — compensates for browser chrome (toolbar, bookmarks bar, devtools) so the inner viewport matches the target exactly
- **Verification pass** — re-checks after resizing and corrects any rounding drift
- **Curated presets** — common mobile, tablet, desktop, and social media sizes
- **Custom sizes** — input any width and height
- **Live current viewport display** — see your current dimensions at a glance

## Presets

**Mobile**
- iPhone SE (320 × 568)
- iPhone 6/7/8 (375 × 667)
- iPhone 12/13 (390 × 844)
- Pixel 7 (412 × 915)
- Galaxy S21 (360 × 800)

**Tablet**
- iPad Mini (768 × 1024)
- iPad 10th Gen (810 × 1080)
- iPad Pro 12.9" (1024 × 1366)
- Galaxy Tab S8 (800 × 1280)

**Desktop**
- HD (1280 × 720)
- Laptop (1366 × 768)
- Desktop (1440 × 900)
- Full HD (1920 × 1080)
- QHD (2560 × 1440)

**Social**
- Portrait Post (1080 × 1350)

Plus a custom width × height input.

## Installation

WebSizer isn't on the Chrome Web Store yet. To install it manually:

1. Download or clone this repository:
   ```bash
   git clone https://github.com/thisistoga/WebSizer.git
   ```
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked**
5. Select the `WebSizer` folder
6. Pin the extension to your toolbar for quick access

## Usage

1. Click the WebSizer icon in your toolbar
2. Click any preset, or enter a custom width and height and click **Apply**
3. Your browser's viewport will resize to match exactly

## How it works

When you click a size, WebSizer:

1. Reads `window.innerWidth/innerHeight` and `window.outerWidth/outerHeight` from the active tab
2. Calculates the chrome offset (the difference between outer window and inner viewport)
3. Calls `chrome.windows.update()` with `target + offset`
4. After a short delay, re-measures the viewport and corrects any drift

The resize logic runs in a background service worker so it survives the popup closing when the window geometry changes.

## Development

The extension uses Manifest V3 with no build step, no dependencies, and no frameworks — just plain HTML, CSS, and vanilla JavaScript.

```
WebSizer/
├── manifest.json     # Extension manifest (MV3)
├── background.js     # Service worker handling resize logic
├── popup.html        # Popup UI markup
├── popup.css         # Popup styling
├── popup.js          # Popup event handlers
└── icons/            # Extension icons (16, 48, 128)
```

To make changes, edit the files and reload the extension at `chrome://extensions`.

## Permissions

WebSizer requests two permissions:

- **`activeTab`** — to read viewport dimensions from the page you're currently viewing
- **`scripting`** — to inject the measurement script that reads `window.innerWidth`/`outerWidth`

It does not collect, transmit, or store any data.

## Limitations

- Cannot read viewport on Chrome internal pages (`chrome://`, `chrome-extension://`, the Chrome Web Store) — load any normal webpage first
- The target viewport must fit within your screen; oversized targets will be clamped to the available display area
- Browser chrome offset is measured per-resize, so resizing while devtools is opening/closing may drift by a few pixels (rerun the resize)

## Contributing

Issues and pull requests are welcome. For bigger changes, please open an issue first to discuss the direction.

## License

[MIT](LICENSE) © Toga
