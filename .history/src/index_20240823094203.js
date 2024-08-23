"use strict";


const LIMIT_FRACT = 5; 
const DURATION = 1500;

let canv, ctx; 
let maxx, maxy; 

let messages;
let dragon;
let baseline, basep;

const b90 = (4 / 3) * (Math.sqrt(2) - 1); 


const mrandom = Math.random;
const mfloor = Math.floor;
const mround = Math.round;
const mceil = Math.ceil;
const mabs = Math.abs;
const mmin = Math.min;
const mmax = Math.max;

const mPI = Math.PI;
const mPIS2 = Math.PI / 2;
const mPIS3 = Math.PI / 3;
const m2PI = Math.PI * 2;
const m2PIS3 = (Math.PI * 2) / 3;
const msin = Math.sin;
const mcos = Math.cos;
const matan2 = Math.atan2;

const mhypot = Math.hypot;
const msqrt = Math.sqrt;

const rac3 = msqrt(3);
const rac3s2 = rac3 / 2;

// Function Definitions

function alea(mini, maxi) {
  if (typeof maxi == "undefined") return mini * mrandom();
  return mini + mrandom() * (maxi - mini);
}

function intAlea(mini, maxi) {
  if (typeof maxi == "undefined") return mfloor(mini * mrandom());
  return mini + mfloor(mrandom() * (maxi - mini));
}

function middle(p0, p1) {
  return { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
}

function lerp(p0, p1, alpha) {
  return {
    x: p1.x * alpha + p0.x * (1 - alpha),
    y: p1.y * alpha + p0.y * (1 - alpha)
  };
}

function Noise1DOneShotModulo(period, modulo, step, random = Math.random) {
  let currx = 1 + random() * 0.5;
  let y0;
  let y1 = modulo * random();
  const dx = 1 / period;

  return function () {
    currx += dx;
    if (currx > 1) {
      currx -= 1;
      y0 = y1 % modulo;
      y1 = y0 + step * (2 * random() - 1);
      while (y1 < 0) {
        y0 += modulo;
        y1 += modulo;
      }
    }
    let z = (3 - 2 * currx) * currx * currx;
    return (z * y1 + (1 - z) * y0) % modulo;
  };
}

function cutCubicIn2(bezier) {
  const pa = middle(bezier[0], bezier[1]);
  const pb = middle(bezier[1], bezier[2]);
  const pc = middle(bezier[2], bezier[3]);
  const pd = middle(pa, pb);
  const pe = middle(pb, pc);
  const pf = middle(pd, pe);
  return [
    [bezier[0], pa, pd, pf],
    [pf, pe, pc, bezier[3]]
  ];
}

function buildDragon(level) {
  let turn;
  let turns = "";
  for (let k = 0; k < level; ++k) {
    turns += "0";
    for (let kc = turns.length - 2; kc >= 0; --kc)
      turns += turns.charAt(kc) == "0" ? "1" : "0";
  }

  dragon = [
    { x: 0, y: 0 },
    { x: 1, y: 0 }
  ];
  let dir = 0;
  let { x, y } = dragon[1];
  for (let k = 0; k < turns.length; ++k) {
    turn = turns.charAt(k) == "0" ? 1 : -1;
    dir = (dir + turn + 4) % 4;
    x += [1, 0, -1, 0][dir];
    y += [0, 1, 0, -1][dir];
    dragon.push({ x, y });
  }
}

function makeLevel(level) {
  let rot = (mPI / 4) * level;
  let scale = baseline / Math.pow(2, level / 2);
  let mat = new DOMMatrix([
    scale * mcos(rot),
    scale * msin(-rot),
    scale * msin(rot),
    scale * mcos(rot),
    basep.x,
    basep.y
  ]);
  const nbPts = (1 << level) + 1;

  let drag = [];
  for (let k = 0; k < nbPts; ++k)
    drag[k] = DOMPointReadOnly.fromPoint(dragon[k]).matrixTransform(mat);

  let mid, pmid, p;
  let curve;
  curve = [];
  for (let k = 0; k < nbPts; ++k) {
    p = drag[k];
    if (k == nbPts - 1) {
      curve.push([pmid, lerp(pmid, p, 0.25), lerp(pmid, p, 0.75), p]);
    } else {
      mid = middle(p, drag[k + 1]);
      if (k == 0) {
        curve.push([p, lerp(p, mid, 0.25), lerp(p, mid, 0.75), mid]);
      } else {
        let p0 = lerp(pmid, p, b90);
        let p1 = lerp(mid, p, b90);
        curve.push([pmid, p0, p1, mid]);
      }
    }
    pmid = mid;
  }
  let b1, b2;
  let curve2 = [];
  curve.forEach((bezier, k) => {
    if (k == 0 || k == curve.length - 1) curve2.push(bezier);
    else {
      [b1, b2] = cutCubicIn2(bezier);
      curve2.push(b1, b2);
    }
  });
  let curve4 = [];
  curve2.forEach((bezier, k) => {
    [b1, b2] = cutCubicIn2(bezier);
    curve4.push(b1, b2);
  });

  return [curve, curve2, curve4];
}

function drawCurve(curve, color) {
  ctx.beginPath();
  curve.forEach((bezier, k) => {
    if (k == 0) ctx.moveTo(bezier[0].x, bezier[0].y);
    ctx.bezierCurveTo(
      bezier[1].x,
      bezier[1].y,
      bezier[2].x,
      bezier[2].y,
      bezier[3].x,
      bezier[3].y
    );
  });
  ctx.strokeStyle = color;
  ctx.stroke();
}

function getCurve(ca, cb, alpha) {
  let bb;
  return ca.map((ba, k) => {
    bb = cb[k];
    return [
      lerp(ba[0], bb[0], alpha),
      lerp(ba[1], bb[1], alpha),
      lerp(ba[2], bb[2], alpha),
      lerp(ba[3], bb[3], alpha)
    ];
  });
}

let animate;

{
  let animState = 0;
  let maxLevel;
  let allCurves, ca, cb;
  let lwa, lwb;
  let currLevel;
  let tInit, alpha;
  let fHue;
  let clear = false;

  animate = function (tStamp) {
    let message;

    message = messages.shift();
    if (message && message.message == "reset") animState = 0;
    if (message && message.message == "click") animState = 0;
    window.requestAnimationFrame(animate);

    switch (animState) {
      case 0:
        if (!startOver()) break;
        maxLevel = Math.floor(2 * Math.log2(baseline / LIMIT_FRACT));
        buildDragon(maxLevel);
        allCurves = [];
        for (let k = 0; k <= maxLevel; ++k) {
          allCurves.push(makeLevel(k));
        }
        tInit = tStamp;
        fHue = Noise1DOneShotModulo(50, 360, 50);
        clear = !clear;
        currLevel = 0;
        ++animState;

      case 1:
        ca = allCurves[currLevel][2];
        cb = allCurves[currLevel + 1][1];
        lwa = baseline / 10 / Math.pow(2, currLevel / 2);
        lwb = lwa / Math.sqrt(2);

        ++animState;

      case 2:
        alpha = mmin(1, (tStamp - tInit) / DURATION);
        ctx.fillStyle = "#000";
        if (clear) ctx.fillRect(0, 0, maxx, maxy);
        ctx.lineWidth = mmax(1.5, alpha * lwb + (1 - alpha) * lwa);
        drawCurve(getCurve(ca, cb, alpha), `hsl(${fHue()} 100% 50%)`);
        if (alpha == 1) {
          tInit = tStamp;
          ++currLevel;
          if (currLevel >= maxLevel - 1) ++animState;
          else animState = 1;
        }
        break;

      case 3:
        ca = allCurves[currLevel][1];
        cb = allCurves[currLevel - 1][2];
        lwa = baseline / 10 / Math.pow(2, currLevel / 2);
        lwb = lwa * Math.sqrt(2);
        ++animState;

      case 4:
        alpha = mmin(1, (tStamp - tInit) / DURATION);
        ctx.fillStyle = "#000";
        if (clear) ctx.fillRect(0, 0, maxx, maxy);
        ctx.lineWidth = mmax(1.5, alpha * lwb + (1 - alpha) * lwa);
        drawCurve(getCurve(ca, cb, alpha), `hsl(${fHue()} 100% 50%)`);
        if (alpha == 1) {
          tInit = tStamp;
          --currLevel;
          if (currLevel <= 0) animState = 1;
          else animState = 3;
        }
        break;
    }
  };
}

function startOver() {
  maxx = window.innerWidth;
  maxy = window.innerHeight;

  canv.width = maxx;
  canv.height = maxy;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, maxx, maxy);

  let margin = 20;
  baseline = mmin((maxx - margin) / 1.5, maxy - margin);
  let x0 = (maxx - 1.5 * baseline) / 2 + baseline / 3;
  let y0 = (maxy - baseline) / 2 + (baseline * 2) / 3;
  basep = { x: x0, y: y0 };

  return true;
}

function mouseClick(event) {
  messages.push({ message: "click" });
}

{
  canv = document.createElement("canvas");
  canv.style.position = "absolute";
  document.body.appendChild(canv);
  ctx = canv.getContext("2d");
}
canv.addEventListener("click", mouseClick);
messages = [{ message: "reset" }];
requestAnimationFrame(animate);
