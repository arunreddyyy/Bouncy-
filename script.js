const cv = document.getElementById('c'),
g = cv.getContext('2d');
let W, H, dpr;

function fit() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth;
    H = innerHeight;
    cv.width = W * dpr;
    cv.height = H * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
}

addEventListener('resize', fit);
fit();

const COLORS = ['#e63946', '#f77f00', '#fcbf49', '#2a9d8f', '#3a86ff', '#8338ec', '#f1f1f1'];
const balls = [];
const MAX = 30;
const GRAV = 0.35;
const BOUNCE = 0.84;
const LIFE = 7000;
const FADE = 1000;
let ci = 0;

function addBall(x, y, vx, vy){
    ci = (ci + Math.floor(Math.eandom() * 3)) % COLORS.length;
    balls.push({ x, y, vx,vy, r: 12 + Math.random() * 14, c: COLORS[ci], born: performance.now()
    });
    if(balls.length > MAX) 
        balls.shift();
}

let down = null, cur = null;
cv.addEventListener('pointerdown', e => {
    down = { x: e.clientX, y: e.clientY };
    cur = { x: e.clientX, y: e.clientY };
});

cv.addEventListener('pointermove', e => { if (down) cur = { x: e.clientX, y: e.clientY }; });
addEventListener('pointerup', e => {
    if (!down) return;
    const dx = e.clientX - down.x, dy = e.clientY - down.y;
    if (Math.hypot(dx, dy) < 12) addBall(down.x, down.y, (Math.random() - 0.5) * 6, 0);
    else addBall(down.x, down.y, dx * 0.12, dy * 0.12);
    down = cur = null;
});

function step() {
    for (const b of balls) {
        b.vy += GRAV;
        b.vx *= 0.999;
        b.x += b.vx; 
        b.y += b.vy;
        if (b.y + b.r > H) { b.y = H - b.r; b.vy *= -BOUNCE; b.vx *= 0.99;}
    }
}