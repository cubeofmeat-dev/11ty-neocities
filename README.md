# CubeOfMeat Official Fan Repository

This is a static site project built with Eleventy (11ty) for Neocities hosting.

## Features
- Game reviews and archive by month and year
- Custom layouts and styles using SNES.css
- Image and logo support for each game entry
- Custom Copilot rules for consistent image HTML in Markdown

## Project Structure
- `src/` — Source files (Markdown, HTML, CSS, images)
- `_site/` — Generated static site output
- `eleventy.config.js` — Eleventy configuration
- `.copilot-instructions` — Custom Copilot rules for this workspace

## Usage
1. Install dependencies:
   ```sh
   npm install
   ```
2. Build the site:
   ```sh
   npx eleventy
   ```
3. Serve locally (optional):
   ```sh
   npx eleventy --serve
   ```
4. Edit content in `src/` and re-run the build as needed.

## Adding Images in Markdown
When adding images to Markdown files, use the following HTML snippet:

```
<p>
    <img class="img-<logo|game>" src="/images/<filename>">
</p>
```
Refer to `.copilot-instructions` for more details.

## License
This project is for personal and educational use. See individual files for additional licensing information.
