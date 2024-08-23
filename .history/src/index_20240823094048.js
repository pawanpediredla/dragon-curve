
"use strict";

// Constants
const LIMIT_FRACT = 5; // in pixels
const DURATION = 1500; // in ms, for each recursion level

let canv, ctx; // canvas and context
let maxx, maxy; // canvas dimensions

// For animation
let messages;
let dragon;
let baseline, basep;

const b90 = (4 / 3) * (Math.sqrt(2) - 1); // to draw 1/4 circle with Bézier curves

// Shortcuts for Math.
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
    y += [0
