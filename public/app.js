const hero=document.querySelector('.hero'),photo=document.querySelector('.hero-photo'),heroText=document.querySelector('.hero-content'),quote=document.querySelector('.full-quote'),quoteImg=document.querySelector('.quote-image');
window.addEventListener('scroll',()=>{const y=scrollY;if(hero){let p=Math.min(y/innerHeight,1);photo.style.transform=`scale(${1.03+p*.12}) translate3d(0,${p*9}%,0)`;heroText.style.transform=`translate3d(0,${p*100}px,0)`}if(quote){const r=quote.getBoundingClientRect(),p=Math.max(-1,Math.min(1,(innerHeight/2-(r.top+r.height/2))/(innerHeight/2)));quoteImg.style.transform=`scale(1.08) translate3d(0,${p*-45}px,0)`}},{passive:true});
const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.12});
document.querySelectorAll('.statement,.center-heading,.film,.about-copy,.about-photo,.final').forEach(x=>observer.observe(x));

/* Manual Google Drive photo gallery */
(function(){
  const field = document.getElementById('photo-field');
  const photos = Array.isArray(window.JBK_PHOTOS) ? window.JBK_PHOTOS : [];
  if (!field || !photos.length) return;
  const classes = ['tile-a','tile-b','tile-c','tile-d','tile-e','tile-f','tile-g','tile-h'];
  function driveImageUrl(link){
    const match = String(link || '').match(/\/d\/([a-zA-Z0-9_-]+)/);
    return match ? 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(match[1]) + '&sz=w2000' : link;
  }
  field.innerHTML = photos.map((photo, i) => {
    const cls = classes[i % classes.length];
    const title = String(photo.title || 'Travel photograph').replace(/"/g, '&quot;');
    const href = photo.journeyUrl || 'journey.html';
    return '<a class="tile ' + cls + '" href="' + href + '">' +
      '<img src="' + driveImageUrl(photo.driveLink) + '" alt="' + title + '" loading="lazy">' +
      '</a>';
  }).join('');
})();
