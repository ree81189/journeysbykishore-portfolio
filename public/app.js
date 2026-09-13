const hero = document.querySelector('.hero');
const photoDocument = document.querySelector('.hero-photo');
const heroRect = document.querySelector('.hero');
const quoteDocument = document.querySelector('.full-quote');
const quoteImage = document.querySelector('.quote-image');

window.addEventListener('scroll', () => {
  const y = window.scrollY;

  if (hero) {
    hero.style.transform = `translate3d(0, ${Math.min(y * 0.12, 120)}px, 0)`;
  }

  if (photoDocument) {
    photoDocument.style.transform = `translate3d(0, ${Math.min(y * 0.08, 80)}px, 0)`;
  }

  if (heroRect) {
    heroRect.style.transform = `translate3d(0, ${Math.min(y * 0.03, 30)}px, 0)`;
  }

  if (quoteDocument) {
    quoteDocument.style.transform = `translate3d(0, ${Math.min(y * 0.05, 50)}px, 0)`;
  }

  if (quoteImage) {
    quoteImage.style.transform = `translate3d(0, ${Math.min(y * 0.06, 60)}px, 0)`;
  }
});

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
      }
    });
  },
  { threshold: 0.12 }
);

document
  .querySelectorAll('.statement, .center-heading, .film, .about-copy, .about-photo, .final')
  .forEach(element => observer.observe(element));

/* =========================================================
   AUTOMATIC GOOGLE DRIVE PHOTO GALLERY
   ========================================================= */

(async function loadGoogleDriveGallery() {
  const field = document.getElementById('photo-field');

  if (!field) {
    console.warn('Photo gallery container #photo-field was not found.');
    return;
  }

  try {
    field.innerHTML = '<p style="text-align:center;">Loading photos...</p>';

    const response = await fetch('/api/photos', {
      cache: 'no-cache'
    });

    if (!response.ok) {
      throw new Error(`Gallery API returned ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.message || data.error);
    }

    const categories = Array.isArray(data.categories)
      ? data.categories
      : [];

    const photos = categories.flatMap(category =>
      Array.isArray(category.photos)
        ? category.photos.map(photo => ({
            ...photo,
            category: category.name
          }))
        : []
    );

    if (!photos.length) {
      field.innerHTML =
        '<p style="text-align:center;">No photos found.</p>';
      return;
    }

    const classes = [
      'tile-a',
      'tile-b',
      'tile-c',
      'tile-d',
      'tile-e',
      'tile-f',
      'tile-g',
      'tile-h'
    ];

    field.innerHTML = photos
      .map((photo, index) => {
        const cls = classes[index % classes.length];

        const title = String(
          photo.name || 'Travel Photograph'
        )
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');

        const category = String(
          photo.category || 'Travel'
        )
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');

        const imageUrl = photo.thumbnailUrl
          ? photo.thumbnailUrl
          : `https://drive.google.com/thumbnail?id=${encodeURIComponent(
              photo.id
            )}&sz=w2000`;

        return `
          <a
            class="tile ${cls}"
            href="${imageUrl}"
            target="_blank"
            rel="noopener"
            data-category="${category}"
          >
            <img
              src="${imageUrl}"
              alt="${title}"
              loading="lazy"
            >
            <span class="sr-only">${category} — ${title}</span>
          </a>
        `;
      })
      .join('');

    console.log(
      `Google Drive gallery loaded: ${photos.length} photos`
    );

  } catch (error) {
    console.error('Google Drive gallery error:', error);

    field.innerHTML = `
      <p style="text-align:center;">
        Unable to load travel photos right now.
      </p>
    `;
  }
})();
