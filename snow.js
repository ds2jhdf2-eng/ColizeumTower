const canvas = document.getElementById('snow-canvas');
const ctx = canvas.getContext('2d');

let snowflakes = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function createSnowflakes() {
    for (let i = 0; i < 120; i++) {
        snowflakes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 3 + 1,
            speedY: Math.random() * 1 + 0.5,
            speedX: Math.random() * 0.5 - 0.25,
            opacity: Math.random() * 0.8 + 0.2
        });
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    for (const flake of snowflakes) {
        ctx.globalAlpha = flake.opacity;
        ctx.moveTo(flake.x, flake.y);
        ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
    }
    ctx.fill();
    move();
    requestAnimationFrame(draw);
}

function move() {
    for (const flake of snowflakes) {
        flake.y += flake.speedY;
        flake.x += flake.speedX;
        if (flake.y > canvas.height) flake.y = -flake.r;
        if (flake.x > canvas.width) flake.x = 0;
        if (flake.x < 0) flake.x = canvas.width;
    }
}

createSnowflakes();
draw();

canvas.style.position = 'fixed';
canvas.style.left = 0;
canvas.style.top = 0;
canvas.style.pointerEvents = 'none';
canvas.style.zIndex = 1000;
