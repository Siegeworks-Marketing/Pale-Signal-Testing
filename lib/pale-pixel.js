// ◈ PALE SIGNAL · PIXEL ART LIBRARY
// Shared drawing engine: used by RPG, TCG, and future tools.
// Extracted from PaleSignalRPG-v3_12. Sovereign. No dependencies.
// Usage: import { PalePixel } from './lib/pale-pixel.js'
// Or load as a script and use window.PalePixel

const PalePixel = (() => {

// ── COLOR MATH ─────────────────────────────────────────────────
function _h2hsl(hex){
  const r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255;
  const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h,s,l=(mx+mn)/2;
  if(mx===mn){h=s=0;}else{const d=mx-mn;s=l>0.5?d/(2-mx-mn):d/(mx+mn);
    switch(mx){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;default:h=((r-g)/d+4)/6;}}
  return[h*360,s,l];
}
function _hsl2h(h,s,l){
  h=((h%360)+360)%360/360;s=Math.max(0,Math.min(1,s));l=Math.max(0,Math.min(1,l));
  const q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q;
  const hue=(p,q,t)=>{t=((t%1)+1)%1;return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p;};
  return'#'+[h+1/3,h,h-1/3].map(t=>Math.round(hue(p,q,t)*255).toString(16).padStart(2,'0')).join('');
}
function _shift(hex,dh,ds,dl){const[h,s,l]=_h2hsl(hex);return _hsl2h(h+dh,s+ds,l+dl);}
function gsPal(hex){return{
  sp:_shift(hex,+18,+0.08,+0.34),
  hl:_shift(hex,+14,+0.06,+0.24),
  md:hex,
  sh:_shift(hex,-20,-0.12,-0.25),
  dk:_shift(hex,-10,-0.20,-0.44),
};}

// ── DETERMINISTIC RNG ──────────────────────────────────────────
function mkRNG(seed){
  let s=seed>>>0;
  return()=>{s=Math.imul(s^(s>>>16),0x45d9f3b);s=Math.imul(s^(s>>>16),0x45d9f3b);s^=s>>>16;return(s>>>0)/4294967296;};
}
function hashStr(str){
  let h=0x9e3779b9;
  for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),0x9e3779b9);h^=h>>>16;}
  return h>>>0;
}

// ── CONTEXT-AWARE DRAWING ─────────────────────────────────────
// ctx is passed explicitly — no global dependency.
const _B4=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];

function px(ctx,x,y,w,h,col){ctx.fillStyle=col;ctx.fillRect(x,y,w,h);}
function dRow(ctx,sx,y,w,cA,cB,t){
  for(let dx=0;dx<w;dx++){
    ctx.fillStyle=_B4[(y%4+4)%4][((sx+dx)%4+4)%4]<t*16?cB:cA;
    ctx.fillRect(sx+dx,y,1,1);
  }
}
function dRect(ctx,sx,sy,w,h,cA,cB,t){for(let dy=0;dy<h;dy++)dRow(ctx,sx,sy+dy,w,cA,cB,t);}
function bCircle(ctx,cx,cy,r,col){
  if(r<1)return;ctx.fillStyle=col;
  let x=0,y=r,d=3-2*r;
  while(y>=x){
    const _row=(py,x0,x1)=>{if(py<0)return;const sw=x1-x0+1;if(sw>0)ctx.fillRect(x0,py,sw,1);};
    _row(cy-x,cx-y,cx+y);_row(cy+x,cx-y,cx+y);
    _row(cy-y,cx-x,cx+x);_row(cy+y,cx-x,cx+x);
    if(d<0)d+=4*x+6;else{d+=4*(x-y)+10;y--;}x++;
  }
}
function outline(ctx,sx,sy,w,h,col){
  ctx.fillStyle=col;
  ctx.fillRect(sx-1,sy-1,w+2,1);ctx.fillRect(sx-1,sy+h,w+2,1);
  ctx.fillRect(sx-1,sy,1,h);ctx.fillRect(sx+w,sy,1,h);
}
function fillShaded(ctx,sx,sy,w,h,pal){
  px(ctx,sx,sy,w,h,pal.md);
  px(ctx,sx,sy+Math.floor(h*0.55),w,Math.ceil(h*0.45),pal.sh);
  px(ctx,sx,sy,Math.ceil(w*0.45),Math.ceil(h*0.4),pal.hl);
}

// ── ELEMENT COLOR MAP ─────────────────────────────────────────
const ELEMENT_COLORS = {
  water:'#4888d0',fire:'#ff6622',wood:'#44cc66',earth:'#c8a040',
  metal:'#c0c8e0',wind:'#80ccff',pale:'#8fa8ff',null:'#6a6880',
};

// ── ECHO PORTRAIT RENDERER ────────────────────────────────────
// Draws a 32×32 pixel creature portrait on the given canvas context.
// Type derived from element: water/wind/pale→wisp, earth/metal→crawler, wood/fire→sprite, null→wisp
// Rarity adds visual complexity. Name hash seeds color variation.
function drawEchoPortrait(ctx, element, rarity, nameSeed, frameNum = 0) {
  const baseColor = ELEMENT_COLORS[element] || ELEMENT_COLORS.null;
  const P = gsPal(baseColor);
  const r = mkRNG(hashStr(nameSeed || 'echo'));
  // Slight hue shift per-card for uniqueness within same element
  const hShift = (r() - 0.5) * 20;
  const lShift = (r() - 0.5) * 0.08;
  const cardColor = _shift(baseColor, hShift, 0, lShift);
  const CP = gsPal(cardColor);

  const type = ['water','wind','pale','null'].includes(element) ? 'wisp'
             : ['earth','metal'].includes(element) ? 'crawler'
             : 'sprite';

  // Clear background
  ctx.fillStyle = '#05080f';
  ctx.fillRect(0, 0, 32, 32);

  if (type === 'wisp') drawWispPortrait(ctx, CP, cardColor, r, frameNum);
  else if (type === 'crawler') drawCrawlerPortrait(ctx, CP, cardColor, r, frameNum);
  else drawSpritePortrait(ctx, CP, cardColor, r, frameNum);

  // Rarity border overlay
  if (rarity === 'Epic' || rarity === 'Legendary') {
    const rarityColor = rarity === 'Legendary' ? '#c8a030' : '#c084fc';
    ctx.fillStyle = rarityColor + '40';
    ctx.fillRect(0, 0, 32, 1); ctx.fillRect(0, 31, 32, 1);
    ctx.fillRect(0, 0, 1, 32); ctx.fillRect(31, 0, 1, 32);
  }
}

function drawWispPortrait(ctx, P, baseColor, r, f) {
  const bob = Math.round(Math.sin(f * 0.06) * 2);
  const pulse = 0.5 + 0.5 * Math.sin(f * 0.06 * 1.3);
  // Trails
  dRect(ctx, 14, 22+bob, 4, 3, P.sh, P.dk, 0.6);
  dRect(ctx, 11, 21+bob, 3, 4, P.sh, P.dk, 0.5);
  dRect(ctx, 19, 21+bob, 3, 4, P.sh, P.dk, 0.5);
  // Core orb
  bCircle(ctx, 16, 13+bob, 7, P.dk);
  bCircle(ctx, 16, 12+bob, 7, P.sh);
  bCircle(ctx, 15, 11+bob, 5, P.md);
  bCircle(ctx, 14, 10+bob, 4, P.hl);
  px(ctx, 13, 8+bob, 4, 2, P.sp||P.hl);
  // Glow
  const gA = (0.12 + pulse * 0.16).toFixed(2);
  ctx.fillStyle = `rgba(200,220,255,${gA})`;
  ctx.fillRect(12, 10+bob, 6, 5);
  // Eyes
  const eA = (0.6 + pulse * 0.4).toFixed(2);
  ctx.fillStyle = `rgba(255,255,255,${eA})`;
  ctx.fillRect(12, 11+bob, 2, 2); ctx.fillRect(17, 11+bob, 2, 2);
}

function drawCrawlerPortrait(ctx, P, baseColor, r, f) {
  const bob = Math.round(Math.sin(f * 0.03) * 1);
  const shellC = _shift(baseColor, -8, -0.05, -0.15);
  const SP = gsPal(shellC);
  const legC = _shift(baseColor, -12, -0.06, -0.18);
  const legPhase = Math.floor(f * 0.04) % 2;
  // Legs
  px(ctx, 2,14+bob+(legPhase?1:0),5,2,legC); px(ctx,2,18+bob,5,2,legC); px(ctx,2,22+bob+(legPhase?0:1),5,2,legC);
  px(ctx,25,14+bob+(legPhase?0:1),5,2,legC); px(ctx,25,18+bob,5,2,legC); px(ctx,25,22+bob+(legPhase?1:0),5,2,legC);
  // Shell body
  outline(ctx, 7,12+bob,18,12,SP.dk); fillShaded(ctx, 7,12+bob,18,12,SP);
  px(ctx, 8,13+bob,16,3,SP.hl); px(ctx,8,16+bob,16,1,SP.sh);
  px(ctx, 8,17+bob,16,3,SP.md); px(ctx,9,18+bob,14,1,SP.hl);
  // Head
  bCircle(ctx,16,10+bob,4,P.dk); bCircle(ctx,16,9+bob,4,P.md); px(ctx,14,8+bob,4,2,P.hl);
  ctx.fillStyle='#0a0a14'; ctx.fillRect(13,9+bob,2,2); ctx.fillRect(17,9+bob,2,2);
  ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.fillRect(14,9+bob,1,1); ctx.fillRect(18,9+bob,1,1);
}

function drawSpritePortrait(ctx, P, baseColor, r, f) {
  const bob = Math.round(Math.sin(f * 0.08) * 2);
  const hop = Math.round(Math.abs(Math.sin(f * 0.08 * 0.5)) * 2);
  const leafC = _shift(baseColor, +12, +0.08, +0.10);
  const LP = gsPal(leafC);
  // Legs
  px(ctx,12,23-hop+bob,3,3+hop,P.dk); px(ctx,17,23-hop+bob,3,3+hop,P.dk);
  px(ctx,11,25-hop+bob,5,2,P.sh); px(ctx,16,25-hop+bob,5,2,P.sh);
  // Body
  bCircle(ctx,16,19-hop+bob,6,P.dk); bCircle(ctx,16,18-hop+bob,6,P.md);
  bCircle(ctx,15,17-hop+bob,4,P.hl); px(ctx,15,16-hop+bob,3,2,P.sp||P.hl);
  // Leaf crown
  const lb=Math.round(Math.sin(f*0.08*1.1)*1);
  bCircle(ctx,16,10-hop+bob+lb,5,LP.sh); bCircle(ctx,13,9-hop+bob+lb,4,LP.md);
  bCircle(ctx,19,10-hop+bob+lb,4,LP.md); bCircle(ctx,16,7-hop+bob+lb,3,LP.hl);
  // Face
  ctx.fillStyle='#0a0a14'; ctx.fillRect(13,18-hop+bob,2,2); ctx.fillRect(17,18-hop+bob,2,2);
  ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.fillRect(14,18-hop+bob,1,1); ctx.fillRect(18,18-hop+bob,1,1);
}

// ── CARD FRAME RENDERER ───────────────────────────────────────
// Draws a full GBA-style card frame on a canvas.
// Used to give TCG cards the RPG visual treatment.
function drawCardFrame(ctx, w, h, elementColor, rarity) {
  const P = gsPal(elementColor);
  // Background
  ctx.fillStyle = '#05080f';
  ctx.fillRect(0, 0, w, h);
  // Subtle gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, elementColor + '18');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  // CRT scanlines
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  for(let y = 0; y < h; y += 2) ctx.fillRect(0, y, w, 1);
  // Border
  const borderColor = rarity === 'Legendary' ? '#c8a030'
                    : rarity === 'Epic' ? '#c084fc'
                    : rarity === 'Rare' ? elementColor
                    : elementColor + '60';
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, w-1, h-1);
  // Inner corner accents (GBA cartridge feel)
  ctx.fillStyle = borderColor;
  ctx.fillRect(0, 0, 3, 1); ctx.fillRect(0, 0, 1, 3);
  ctx.fillRect(w-3, 0, 3, 1); ctx.fillRect(w-1, 0, 1, 3);
  ctx.fillRect(0, h-1, 3, 1); ctx.fillRect(0, h-3, 1, 3);
  ctx.fillRect(w-3, h-1, 3, 1); ctx.fillRect(w-1, h-3, 1, 3);
}

return {
  gsPal, _shift, mkRNG, hashStr,
  px, dRect, bCircle, outline, fillShaded,
  ELEMENT_COLORS,
  drawEchoPortrait,
  drawCardFrame,
};
})();

if (typeof module !== 'undefined') module.exports = PalePixel;
else if (typeof window !== 'undefined') window.PalePixel = PalePixel;
