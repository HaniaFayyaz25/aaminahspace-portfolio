const menuToggle=document.querySelector(".menu-toggle");const quickMenu=document.querySelector(".quick-menu");if(menuToggle&&quickMenu){menuToggle.addEventListener("click",()=>{const open=quickMenu.classList.toggle("open");menuToggle.setAttribute("aria-expanded",String(open))});quickMenu.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{quickMenu.classList.remove("open");menuToggle.setAttribute("aria-expanded","false")}))}
document.querySelectorAll("[data-year]").forEach(el=>el.textContent=new Date().getFullYear());
const overlay=document.querySelector("#overlay");const popup=overlay?.querySelector(".popup");const popupContent=document.querySelector("#popup-content");let lastTrigger=null;
function closePopup(){if(!overlay?.classList.contains("open"))return;overlay.classList.remove("open");overlay.setAttribute("aria-hidden","true");document.body.classList.remove("locked");if(lastTrigger)lastTrigger.focus()}
function openPopup(name,trigger){const template=document.querySelector("#content-"+name);if(!template||!overlay||!popupContent)return;lastTrigger=trigger||document.activeElement;const sourceRect=lastTrigger?.getBoundingClientRect();const popupRect=popup.getBoundingClientRect();if(sourceRect){const originX=Math.max(0,Math.min(popupRect.width,sourceRect.left+sourceRect.width/2-popupRect.left));const originY=Math.max(0,Math.min(popupRect.height,sourceRect.top+sourceRect.height/2-popupRect.top));popup.style.transformOrigin=originX+"px "+originY+"px"}popupContent.replaceChildren(template.content.cloneNode(true));overlay.classList.add("open");overlay.setAttribute("aria-hidden","false");document.body.classList.add("locked");popup.scrollTop=0;requestAnimationFrame(()=>popup.focus());}
document.querySelectorAll("[data-open]").forEach(button=>button.addEventListener("click",()=>openPopup(button.dataset.open,button)));
overlay?.querySelectorAll("[data-close]").forEach(button=>button.addEventListener("click",closePopup));
document.addEventListener("keydown",event=>{if(event.key==="Escape")closePopup();if(event.key==="Tab"&&overlay?.classList.contains("open")){const focusable=[...popup.querySelectorAll('button,a,[tabindex="0"]')].filter(el=>!el.disabled);if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}});
popupContent?.addEventListener("click",event=>{const trigger=event.target.closest(".case-trigger");if(!trigger)return;const item=trigger.closest(".case-item");const expanded=item.classList.toggle("expanded");trigger.setAttribute("aria-expanded",String(expanded));trigger.querySelector("b").textContent=expanded?"×":"+"});

/* Drag the floating portals around the interactive canvas. */
const world=document.querySelector(".world");
let dragState=null;
let suppressPortalClick=false;
document.querySelectorAll(".portal").forEach(portal=>{
  portal.setAttribute("draggable","false");
  portal.addEventListener("pointerdown",event=>{
    if(event.button!==0||!world||overlay?.classList.contains("open"))return;
    const rect=portal.getBoundingClientRect();
    const worldRect=world.getBoundingClientRect();
    const translateParts=(portal.style.translate||"0px 0px").split(/\\s+/);
    const baseX=parseFloat(translateParts[0])||0;
    const baseY=parseFloat(translateParts[1])||0;
    dragState={portal,pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,rect,worldRect,baseX,baseY,moved:false};
    portal.setPointerCapture(event.pointerId);
    portal.classList.add("is-dragging");
  });
  portal.addEventListener("pointermove",event=>{
    if(!dragState||dragState.portal!==portal||dragState.pointerId!==event.pointerId)return;
    const dx=event.clientX-dragState.startX;
    const dy=event.clientY-dragState.startY;
    if(!dragState.moved&&Math.hypot(dx,dy)<5)return;
    dragState.moved=true;
    const minX=dragState.worldRect.left-dragState.rect.left+dragState.baseX;
    const maxX=dragState.worldRect.right-dragState.rect.right+dragState.baseX;
    const minY=dragState.worldRect.top-dragState.rect.top+dragState.baseY;
    const maxY=dragState.worldRect.bottom-dragState.rect.bottom+dragState.baseY;
    const x=Math.max(minX,Math.min(maxX,dragState.baseX+dx));
    const y=Math.max(minY,Math.min(maxY,dragState.baseY+dy));
    portal.style.translate=x+"px "+y+"px";
  });
  const finishDrag=event=>{
    if(!dragState||dragState.portal!==portal||dragState.pointerId!==event.pointerId)return;
    if(dragState.moved){suppressPortalClick=true;setTimeout(()=>{suppressPortalClick=false},0)}
    portal.classList.remove("is-dragging");
    dragState=null;
  };
  portal.addEventListener("pointerup",finishDrag);
  portal.addEventListener("pointercancel",finishDrag);
  portal.addEventListener("lostpointercapture",finishDrag);
  portal.addEventListener("click",event=>{
    if(suppressPortalClick){event.preventDefault();event.stopImmediatePropagation();suppressPortalClick=false}
  },true);
});
