# Journeys by Kishore — Portfolio

This is a static cinematic portfolio designed for Cloudflare Workers.

## Add a project
Open `public/config.js` and add an object inside `projects`:

```js
{
  title: "Couple Name Wedding",
  category: "Highlight Films",
  year: "2026",
  location: "Hyderabad, India",
  cover: "PUBLIC_IMAGE_URL",
  video: "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

You can use YouTube or Vimeo links. The portfolio converts them to an embedded player automatically.

## Google Drive
The first version leaves Google Drive integration as a clearly marked next step. To automatically read public folders from Google Drive, we will connect the Google Drive API and use folder IDs. Do not put private Drive files or credentials in this repository.

## Cloudflare
The project is intended for Cloudflare Workers Static Assets. `wrangler.jsonc` points Cloudflare to `public/`.
