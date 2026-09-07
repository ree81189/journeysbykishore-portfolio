const cfg = window.PORTFOLIO_CONFIG || {projects:[]};
const grid = document.getElementById("projectGrid");
const filters = document.getElementById("filters");
const modal = document.getElementById("videoModal");
const videoWrap = document.getElementById("videoWrap");
const modalTitle = document.getElementById("modalTitle");
const modalCategory = document.getElementById("modalCategory");
document.getElementById("year").textContent = new Date().getFullYear();

function categories(){
  return ["All", ...new Set(cfg.projects.map(p=>p.category).filter(Boolean))];
}
function renderFilters(){
  filters.innerHTML = categories().map((c,i)=>`<button class="filter ${i===0?"active":""}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join("");
  filters.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{
    filters.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));
    b.classList.add("active"); render(b.dataset.cat);
  }));
}
function render(cat="All"){
  const items = cfg.projects.filter(p=>cat==="All" || p.category===cat);
  if(!items.length){grid.innerHTML=`<div class="empty">Your selected work will appear here.</div>`;return;}
  grid.innerHTML = items.map((p,i)=>`
    <article class="card" data-index="${cfg.projects.indexOf(p)}">
      <div class="card-cover">${p.cover?`<img loading="lazy" src="${escapeAttr(p.cover)}" alt="">`:""}</div>
      <div class="play">▶</div>
      <div class="card-overlay">
        <div class="card-category">${escapeHtml(p.category||"FILM")}</div>
        <div class="card-title">${escapeHtml(p.title||"Untitled project")}</div>
        <div class="card-meta">${escapeHtml([p.location,p.year].filter(Boolean).join(" · "))}</div>
      </div>
    </article>`).join("");
  grid.querySelectorAll(".card").forEach(card=>card.addEventListener("click",()=>openVideo(cfg.projects[Number(card.dataset.index)])));
}
function openVideo(p){
  const url=embedUrl(p.video);
  if(!url){return;}
  videoWrap.innerHTML=`<iframe src="${url}" title="${escapeAttr(p.title||"Wedding film")}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
  modalTitle.textContent=p.title||"Wedding film";
  modalCategory.textContent=p.category||"FILM";
  modal.classList.add("open");modal.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";
}
function closeVideo(){
  modal.classList.remove("open");modal.setAttribute("aria-hidden","true");videoWrap.innerHTML="";document.body.style.overflow="";
}
document.getElementById("modalClose").addEventListener("click",closeVideo);
document.getElementById("modalBackdrop").addEventListener("click",closeVideo);
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeVideo()});

function embedUrl(url){
  if(!url)return "";
  try{
    const u=new URL(url);
    if(u.hostname.includes("youtube.com")){
      if(u.pathname==="/watch")return `https://www.youtube.com/embed/${u.searchParams.get("v")}?autoplay=1&rel=0`;
      if(u.pathname.startsWith("/shorts/"))return `https://www.youtube.com/embed/${u.pathname.split("/")[2]}?autoplay=1&rel=0`;
      if(u.pathname.startsWith("/embed/"))return url;
    }
    if(u.hostname==="youtu.be")return `https://www.youtube.com/embed/${u.pathname.slice(1)}?autoplay=1&rel=0`;
    if(u.hostname.includes("vimeo.com")){
      const id=u.pathname.split("/").filter(Boolean).pop();
      if(id)return `https://player.vimeo.com/video/${id}?autoplay=1`;
    }
  }catch(e){}
  return "";
}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function escapeAttr(s){return escapeHtml(s);}
renderFilters();render();
