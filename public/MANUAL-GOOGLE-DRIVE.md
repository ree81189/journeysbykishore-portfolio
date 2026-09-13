# Manual Google Drive Photo Workflow

1. Keep your photos in Google Drive.
2. For a photo, use Share → Anyone with the link → Viewer → Copy link.
3. Open `content.js`.
4. Add the photo's Google Drive link to a new photo entry.
5. Commit the change to GitHub.
6. Cloudflare will deploy the update.

The current file contains one test photo supplied during setup.

Note: a normal Google Drive file URL is not itself a direct image URL. The website's final gallery code must convert/use the Drive file ID appropriately. This content file is intentionally kept separate so the later Google Drive API upgrade can replace the manual source without changing your photo organization.
