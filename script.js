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
    ci = (ci + Math.floor(Math.random() * 3)) % COLORS.length;
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
        if (b.y + b.r > H) { b.y = H - b.r; b.vy *= -BOUNCE; b.vx *= 0.99; if (Math.abs(b.vy) < 1.2) b.vy = 0; }
        if (b.y - b.r < 0) { b.y = b.r; b.vy *= -BOUNCE; }
        if (b.x + b.r > W) { b.x = W - b.r; b.vx *= -BOUNCE; }
        if (b.x - b.r < 0) { b.x = b.r; b.vx *= -BOUNCE; }
    }
    for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) {
        const a = balls[i], b = balls[j];
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), m = a.r + b.r;
        if (d < m && d > 0) {
            const nx = dx / d, ny = dy / d, ov = (m - d) /2;
            a.x -= nx * ov; a.y -= ny * ov; b.x += nx * ov; b.y += ny * ov;
            const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
            if (rv < 0) {
                const k = -(1 + BOUNCE) * rv / 2;
                a.vx -= k * nx; a.vy -= k * ny; b.vx += k * nx; b.vy += k * ny;
            }
        }
    }
}
    
    function frame(now) {
        g.clearRect(0, 0, W, H);
        step();
        for (let i = balls.length - 1; i >= 0; i--) {
            const b = balls[i], age = now - b.born;
            if (age > LIFE + FADE) { balls.splice(i, 1); continue; }
            const f = age > LIFE ? 1 - (age - LIFE) / FADE : 1;

            const r = b.r * (0.6 + 0.4 * f);
            g.globalAlpha = f;
            const gr = g.createRadialGradient(b.x - r * 0.35, b.y - r * 0.35, r * 0.1, b.x, b.y, r);
            gr.addColorStop(0, 'rgba(255,255,255,.55)');
            gr.addColorStop(0.35, b.c);
            gr.addColorStop(1, b.c);
            g.fillStyle = b.c; g.beginPath(); 
            g.arc(b.x, b.y,r, 0, 6.283); g.fill();
            g.fillStyle = gr;  g.beginPath(); 
            g.arc(b.x, b.y, r, 0, 6.283); g.fill();
        }
        g.globalAlpha = 1;
        if (down && cur) {
            g.strokeStyle = ' rgba(255,255,255,.5)';
             g.lineWidth = 2;
            g.beginPath(); g.moveTo(down.x, down.y);
             g.lineTo(cur.x, cur.y); g.stroke();
            g.fillStyle = '#fff'; g.beginPath();
             g.arc(down.x, down.y, 4, 0, 6.283); g.fill();
        }
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);