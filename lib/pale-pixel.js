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


// ── ECHO PORTRAIT RENDERER ────────────────────────────────────────────
// Draws creature portraits at any size (default 56×56 for TCG).
// Full GS/MMBN pipeline: Bresenham circles, Bayer dither, gsPal ramps,
// per-frame animation. Each type has unique silhouette + 4-tone shading.
function drawEchoPortrait(ctx, element, rarity, nameSeed, frameNum, sz) {
  sz = sz || 56;
  const s = sz / 56; // scale factor: 1.0 at 56px, 0.57 at 32px, 1.43 at 80px
  const sc = (v) => Math.round(v * s); // scale a pixel value

  const baseColor = ELEMENT_COLORS[element] || ELEMENT_COLORS.null;
  const r = mkRNG(hashStr(nameSeed || 'echo'));
  const hShift = (r() - 0.5) * 18;
  const lShift = (r() - 0.5) * 0.07;
  const cardColor = _shift(baseColor, hShift, 0, lShift);
  const P = gsPal(cardColor);

  const type = ['water','wind','pale','null'].includes(element) ? 'wisp'
             : ['earth','metal'].includes(element) ? 'crawler'
             : 'sprite';

  ctx.fillStyle = '#05080f';
  ctx.fillRect(0, 0, sz, sz);

  if (type === 'wisp')    _drawWisp56(ctx, P, cardColor, r, frameNum, sz, s, sc);
  else if (type === 'crawler') _drawCrawler56(ctx, P, cardColor, r, frameNum, sz, s, sc);
  else                     _drawSprite56(ctx, P, cardColor, r, frameNum, sz, s, sc);

  // Rarity border
  if (rarity === 'Legendary' || rarity === 'Epic') {
    const rc = rarity === 'Legendary' ? '#c8a030' : '#c084fc';
    const bw = Math.max(1, sc(2));
    ctx.fillStyle = rc;
    ctx.fillRect(0, 0, sz, bw); ctx.fillRect(0, sz-bw, sz, bw);
    ctx.fillRect(0, 0, bw, sz); ctx.fillRect(sz-bw, 0, bw, sz);
    // Corner accent dots
    ctx.fillStyle = rarity === 'Legendary' ? '#fff0a0' : '#e8c8ff';
    const d = sc(3);
    [[0,0],[sz-d,0],[0,sz-d],[sz-d,sz-d]].forEach(([x,y]) => ctx.fillRect(x,y,d,d));
  }
}

// ── WISP — elemental orb creature ──────────────────────────────────────
// Floating sphere of concentrated pale energy. Trails wisp-light below.
// GS pipeline: shadow base → mid sphere → highlight patch → inner core → glow → pupils
function _drawWisp56(ctx, P, baseColor, r, f, sz, s, sc) {
  const cx = sc(28), cy = sc(22);
  const bob = Math.round(Math.sin(f * 0.055) * sc(3));
  const pulse = 0.5 + 0.5 * Math.sin(f * 0.07);
  const R = sc(14); // main radius
  const cy2 = cy + bob;

  // ── Outer glow corona ──────────────────────────────────────────────
  const glow = ctx.createRadialGradient(cx, cy2, R*0.6, cx, cy2, R*1.6);
  glow.addColorStop(0, baseColor + Math.round((0.12+pulse*0.08)*255).toString(16).padStart(2,'0'));
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(cx-R*2, cy2-R*2, R*4, R*4);

  // ── Trailing wisps (3 tear-drop trails) ───────────────────────────
  const trailY = cy2 + R - sc(2);
  for (let t = 0; t < 3; t++) {
    const tx = cx + sc(t===0?-5:t===1?0:5);
    const tlen = sc(t===1?14:9);
    const tw = sc(t===1?5:3);
    dRect(ctx, tx-Math.floor(tw/2), trailY, tw, tlen, P.sh, P.dk, 0.45+t*0.08);
    // tail tip pixel
    ctx.fillStyle = P.dk;
    ctx.fillRect(tx-1, trailY+tlen, 2, sc(2));
  }

  // ── Main orb — 4-pass GS shading ──────────────────────────────────
  // Pass 1: shadow base (SE offset)
  bCircle(ctx, cx+sc(2), cy2+sc(2), R, P.dk);
  // Pass 2: mid tone
  bCircle(ctx, cx, cy2, R, P.sh);
  // Pass 3: main colour (NW offset for depth)
  bCircle(ctx, cx-sc(1), cy2-sc(1), R-sc(1), P.md);
  // Pass 4: highlight patch (NW quadrant only — GS standard)
  const hlR = Math.floor(R * 0.65);
  bCircle(ctx, cx-sc(3), cy2-sc(3), hlR, P.hl);
  // Pass 5: specular crown (2×2 bright spot)
  const spW = Math.max(2, sc(4));
  ctx.fillStyle = P.sp || P.hl;
  ctx.fillRect(cx-sc(5), cy2-sc(5), spW, spW);
  // Extra specular pixel for GS feel
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cx-sc(4), cy2-sc(6), sc(2), sc(1));

  // ── Inner core (bright centre) ─────────────────────────────────────
  const coreR = Math.floor(R * 0.32);
  bCircle(ctx, cx-sc(1), cy2-sc(1), coreR, P.sp||P.hl);

  // ── Animated inner ring ────────────────────────────────────────────
  const ringA = (0.08 + pulse * 0.10).toFixed(3);
  ctx.fillStyle = `rgba(220,235,255,${ringA})`;
  for (let a = 0; a < 6; a++) {
    const angle = (a/6)*Math.PI*2 + f*0.04;
    const rx = Math.round(cx + Math.cos(angle) * R*0.55);
    const ry = Math.round(cy2 + Math.sin(angle) * R*0.55);
    ctx.fillRect(rx, ry, Math.max(1,sc(2)), Math.max(1,sc(2)));
  }

  // ── Eyes — two glowing pupils with catchlights ────────────────────
  const eyY = cy2 + sc(2);
  const eyOff = sc(5);
  const eyW = Math.max(2, sc(3));
  const eyH = Math.max(2, sc(4));
  // Eye whites/iris
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(cx-eyOff-eyW, eyY, eyW*2, eyH);
  ctx.fillRect(cx+eyOff-eyW, eyY, eyW*2, eyH);
  // Iris colour
  const irisA = (0.7 + pulse * 0.25).toFixed(2);
  ctx.fillStyle = `rgba(255,255,255,${irisA})`;
  ctx.fillRect(cx-eyOff-Math.floor(eyW/2), eyY, eyW, eyH-sc(1));
  ctx.fillRect(cx+eyOff-Math.floor(eyW/2), eyY, eyW, eyH-sc(1));
  // Catchlight (always top-right corner)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cx-eyOff+sc(1), eyY, sc(1), sc(1));
  ctx.fillRect(cx+eyOff+sc(1), eyY, sc(1), sc(1));
}

// ── CRAWLER — armoured hexapod ─────────────────────────────────────────
// Heavy chitinous creature. 6 articulated legs, domed carapace, mandibles.
// Earth/metal elements. Moves slowly; maximum defense.
function _drawCrawler56(ctx, P, baseColor, r, f, sz, s, sc) {
  const cx = sc(28), cy = sc(30);
  const bob = Math.round(Math.sin(f * 0.035) * sc(2));
  const legPhase = Math.floor(f * 0.045) % 2;
  const cy2 = cy + bob;

  // Shell colour (darker, more metallic than base)
  const shellC = _shift(baseColor, -8, -0.06, -0.18);
  const SP = gsPal(shellC);
  const legC = _shift(baseColor, -14, -0.08, -0.22);
  const LP = gsPal(legC);

  // ── Ground shadow ──────────────────────────────────────────────────
  dRect(ctx, cx-sc(16), cy2+sc(14), sc(32), sc(5), 'rgba(0,0,0,0)', 'rgba(0,0,0,0.28)', 0.65);

  // ── Legs (3 per side, alternating gait) ───────────────────────────
  // Each leg: upper segment + lower segment + foot
  const legDefs = [
    // [x from center, y from body, is left side, phase group]
    [-sc(13), sc(-3), true,  0], [-sc(14), sc(3),  true,  1], [-sc(12), sc(8),  true,  0],
    [ sc(13), sc(-3), false, 1], [ sc(14), sc(3),  false, 0], [ sc(12), sc(8),  false, 1],
  ];
  legDefs.forEach(([lx,ly,isLeft,pg]) => {
    const lift = (legPhase === pg) ? sc(-2) : sc(1);
    const bx = cx + lx, by = cy2 + ly;
    const extX = isLeft ? -sc(7) : sc(7);
    // Upper segment
    ctx.fillStyle = LP.sh;
    ctx.fillRect(Math.min(bx,bx+extX/2), by+lift, Math.abs(extX/2)+sc(2), sc(3));
    // Lower segment
    ctx.fillStyle = LP.md;
    ctx.fillRect(Math.min(bx+extX/2,bx+extX), by+sc(2)+lift, Math.abs(extX/2)+sc(2), sc(3));
    // Foot
    ctx.fillStyle = LP.dk;
    ctx.fillRect(bx+extX-sc(1), by+sc(4)+lift, sc(3), sc(2));
    // Joint highlight
    ctx.fillStyle = LP.hl;
    ctx.fillRect(bx+Math.round(extX*0.45), by+sc(1)+lift, sc(2), sc(2));
  });

  // ── Main carapace ─────────────────────────────────────────────────
  const bw = sc(24), bh = sc(18);
  const bx2 = cx - bw/2, by2 = cy2 - bh*0.6;
  // Shadow outline
  ctx.fillStyle = SP.dk;
  ctx.fillRect(bx2-sc(1), by2+sc(1), bw+sc(2), bh+sc(2));
  // Shell fill
  fillShaded(ctx, bx2, by2, bw, bh, SP);
  // Scute pattern — 3 horizontal ridge lines
  for (let i = 0; i < 3; i++) {
    const ry = by2 + Math.round(bh * (0.25+i*0.25));
    ctx.fillStyle = SP.dk;
    ctx.fillRect(bx2+sc(2), ry, bw-sc(4), sc(1));
    ctx.fillStyle = SP.hl;
    ctx.fillRect(bx2+sc(2), ry+sc(1), bw-sc(4), sc(1));
  }
  // Centre keel highlight
  ctx.fillStyle = SP.sp || SP.hl;
  ctx.fillRect(cx-sc(2), by2+sc(1), sc(4), bh-sc(3));
  // Shell specular (NW corner)
  ctx.fillStyle = SP.sp || SP.hl;
  ctx.fillRect(bx2+sc(2), by2+sc(1), sc(6), sc(3));

  // ── Head ──────────────────────────────────────────────────────────
  const hR = sc(9);
  const hx = cx, hy = by2 - hR + sc(4);
  bCircle(ctx, hx+sc(1), hy+sc(1), hR, P.dk);
  bCircle(ctx, hx, hy, hR, P.sh);
  bCircle(ctx, hx-sc(1), hy-sc(1), Math.max(1,hR-sc(2)), P.md);
  ctx.fillStyle = P.hl;
  ctx.fillRect(hx-sc(3), hy-sc(4), sc(6), sc(3));

  // Mandibles
  ctx.fillStyle = LP.dk;
  ctx.fillRect(hx-sc(8), hy+sc(2), sc(6), sc(2));
  ctx.fillRect(hx+sc(2), hy+sc(2), sc(6), sc(2));
  ctx.fillStyle = LP.sh;
  ctx.fillRect(hx-sc(9), hy+sc(3), sc(4), sc(2));
  ctx.fillRect(hx+sc(5), hy+sc(3), sc(4), sc(2));

  // Antennae
  ctx.fillStyle = LP.md;
  for (let a = 0; a < 2; a++) {
    const ax = hx + (a===0?-sc(5):sc(5));
    ctx.fillRect(ax, hy-sc(6), sc(1), sc(4));
    ctx.fillRect(ax+(a===0?-sc(3):sc(2)), hy-sc(8), sc(3), sc(1));
  }

  // Eyes — bright dots with pupils
  const eyW2 = Math.max(2, sc(3));
  ctx.fillStyle = '#0a0a14';
  ctx.fillRect(hx-sc(5)-eyW2/2, hy-sc(1), eyW2+sc(1), eyW2);
  ctx.fillRect(hx+sc(5)-eyW2/2, hy-sc(1), eyW2+sc(1), eyW2);
  ctx.fillStyle = P.sp || '#60c8ff';
  ctx.fillRect(hx-sc(5), hy-sc(1), eyW2, eyW2-sc(1));
  ctx.fillRect(hx+sc(5), hy-sc(1), eyW2, eyW2-sc(1));
  // Catchlight
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(hx-sc(4), hy-sc(1), sc(1), sc(1));
  ctx.fillRect(hx+sc(6), hy-sc(1), sc(1), sc(1));
}

// ── SPRITE — wild elemental creature ───────────────────────────────────
// Small energetic being with leaf/flame crown. Hops. Fast, fragile.
// Wood/fire elements. High agility, lower defense.
function _drawSprite56(ctx, P, baseColor, r, f, sz, s, sc) {
  const cx = sc(28), bodyY = sc(34);
  const bob   = Math.round(Math.sin(f * 0.08) * sc(2));
  const hop   = Math.abs(Math.round(Math.sin(f * 0.055) * sc(4)));
  const by2 = bodyY - hop + bob;

  // Crown colour (shifted toward complementary)
  const crownC = _shift(baseColor, 12, 0.09, 0.10);
  const CP = gsPal(crownC);
  const accentC = _shift(baseColor, -5, 0.05, -0.08);
  const AP = gsPal(accentC);

  // ── Shadow under feet ──────────────────────────────────────────────
  const shadowH = Math.max(1, sc(3) - hop);
  dRect(ctx, cx-sc(10), bodyY+sc(12), sc(20), shadowH, 'rgba(0,0,0,0)', 'rgba(0,0,0,0.30)', 0.7);

  // ── Feet / legs ────────────────────────────────────────────────────
  const footLift = Math.round(Math.sin(f*0.08+Math.PI)*sc(2));
  const footR2 = Math.round(Math.sin(f*0.08)*sc(2));
  ctx.fillStyle = P.dk;
  ctx.fillRect(cx-sc(8), by2+sc(8)+footLift, sc(5), sc(6)-footLift);
  ctx.fillRect(cx+sc(3), by2+sc(8)+footR2,  sc(5), sc(6)-footR2);
  // Feet
  ctx.fillStyle = P.sh;
  ctx.fillRect(cx-sc(9), by2+sc(12), sc(6), sc(3));
  ctx.fillRect(cx+sc(3), by2+sc(12), sc(6), sc(3));
  ctx.fillStyle = P.md;
  ctx.fillRect(cx-sc(9), by2+sc(12), sc(6), sc(1));
  ctx.fillRect(cx+sc(3), by2+sc(12), sc(6), sc(1));

  // ── Body ─────────────────────────────────────────────────────────
  const bodyR = sc(9);
  bCircle(ctx, cx+sc(1), by2+sc(1), bodyR, P.dk);
  bCircle(ctx, cx, by2, bodyR, P.sh);
  bCircle(ctx, cx-sc(1), by2-sc(1), bodyR-sc(1), P.md);
  // Chest highlight
  ctx.fillStyle = P.hl;
  ctx.fillRect(cx-sc(4), by2-sc(4), sc(7), sc(5));
  ctx.fillStyle = P.sp || P.hl;
  ctx.fillRect(cx-sc(3), by2-sc(5), sc(5), sc(2));
  // Belly marking
  ctx.fillStyle = AP.md;
  ctx.fillRect(cx-sc(3), by2+sc(2), sc(6), sc(3));
  ctx.fillStyle = AP.hl;
  ctx.fillRect(cx-sc(2), by2+sc(2), sc(4), sc(1));

  // ── Arms (small nubs, move with hop) ───────────────────────────────
  ctx.fillStyle = P.sh;
  ctx.fillRect(cx-sc(10), by2-sc(2), sc(4), sc(4));
  ctx.fillRect(cx+sc(6),  by2-sc(2), sc(4), sc(4));
  ctx.fillStyle = P.md;
  ctx.fillRect(cx-sc(10), by2-sc(3), sc(3), sc(2));
  ctx.fillRect(cx+sc(7),  by2-sc(3), sc(3), sc(2));

  // ── Leaf/flame crown ──────────────────────────────────────────────
  const crownY = by2 - bodyR - sc(2);
  // Three main cluster circles, each a "leaf mass"
  const crownBob = Math.round(Math.sin(f*0.09)*sc(1));
  bCircle(ctx, cx,      crownY-sc(6)+crownBob, sc(8), CP.dk);
  bCircle(ctx, cx-sc(7),crownY-sc(2)+crownBob, sc(6), CP.sh);
  bCircle(ctx, cx+sc(7),crownY-sc(2)+crownBob, sc(6), CP.sh);
  bCircle(ctx, cx,      crownY-sc(7)+crownBob, sc(7), CP.sh);
  bCircle(ctx, cx-sc(6),crownY-sc(3)+crownBob, sc(5), CP.md);
  bCircle(ctx, cx+sc(6),crownY-sc(3)+crownBob, sc(5), CP.md);
  bCircle(ctx, cx,      crownY-sc(8)+crownBob, sc(5), CP.md);
  // Highlight sub-clusters (sub-circles for leaf depth illusion)
  bCircle(ctx, cx-sc(4),crownY-sc(6)+crownBob, sc(3), CP.hl);
  bCircle(ctx, cx+sc(4),crownY-sc(6)+crownBob, sc(3), CP.hl);
  bCircle(ctx, cx,      crownY-sc(10)+crownBob, sc(3), CP.hl);
  // Crown specular
  ctx.fillStyle = CP.sp || CP.hl;
  ctx.fillRect(cx-sc(2), crownY-sc(11)+crownBob, sc(4), sc(2));
  // Small accent berry/fruit dot
  if (r() > 0.4) {
    ctx.fillStyle = AP.sp || '#ff8844';
    ctx.fillRect(cx+sc(4), crownY-sc(4)+crownBob, sc(3), sc(3));
    ctx.fillStyle = '#fff0a0';
    ctx.fillRect(cx+sc(4), crownY-sc(4)+crownBob, sc(1), sc(1));
  }

  // ── Face ──────────────────────────────────────────────────────────
  const faceY = by2 - sc(2);
  ctx.fillStyle = P.md;
  ctx.fillRect(cx-sc(5), faceY, sc(10), sc(6));
  ctx.fillStyle = P.hl;
  ctx.fillRect(cx-sc(4), faceY, sc(8), sc(2));

  // Eyes
  const eyD = Math.max(2, sc(3));
  ctx.fillStyle = '#0a0a14';
  ctx.fillRect(cx-sc(5), faceY+sc(1), eyD+sc(1), eyD+sc(1));
  ctx.fillRect(cx+sc(2),  faceY+sc(1), eyD+sc(1), eyD+sc(1));
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillRect(cx-sc(4), faceY+sc(1), eyD, eyD);
  ctx.fillRect(cx+sc(3),  faceY+sc(1), eyD, eyD);
  // Catchlights
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cx-sc(3), faceY+sc(1), sc(1), sc(1));
  ctx.fillRect(cx+sc(4),  faceY+sc(1), sc(1), sc(1));
  // Tiny mouth
  ctx.fillStyle = P.dk;
  ctx.fillRect(cx-sc(2), faceY+sc(4), sc(4), sc(1));
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
