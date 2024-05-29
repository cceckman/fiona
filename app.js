
const canvas = document.getElementById("draw-here");

function clamp(x) {
    if (x < 0) {
        return 0
    } else if (x > 1.0) {
        return 1.0
    } else {
        return x
    }
}

let x = []
let y = []
let vx = []
let vy = []
let scales = []

// TODO: Consider using a Gaussian distribution
// instead of whatever Math.random() is
function add_particle() {
    x.push(Math.random())
    y.push(Math.random())

    // Pick a sign:
    let xsign = 0;
    let ysign = 0;
    if (Math.random() > 0.5) {
        xsign = -1;
    } else {
        xsign = 1;
    }
    if (Math.random() > 0.5) {
        ysign = -1;
    } else {
        ysign = 1;
    }
    // at most this fraction of the screen 
    // per millisecond
    vx.push(Math.random() * 0.5 * xsign)
    vy.push(Math.random() * 0.5 * ysign)

    scales.push(1)
}

function update_scales() {
    for (let i = 0; i < x.length; i++) {
        let xx = x[i]
        let yy = y[i]

        if (xx > 0.3 && xx < 0.6 && yy > 0.3 && yy < 0.6) {
            scales[i] = 0.1
        } else {
            scales[i] = 1
        }
    }
}


function update_one(elapsed, m, vm, i) {
    let d = vm[i] * elapsed * scales[i];
    let mm = m[i] + d;
    if (mm < 0 || mm > 1.0) {
        // Don't move on this tick,
        // just change velocity
        vm[i] = -vm[i];
    } else {
        m[i] = mm
    }
}

function update_all(elapsed) {
    update_scales()
    for (let i = 0; i < x.length; i++) {
        update_one(elapsed, x, vx, i);
    }
    for (let i = 0; i < y.length; i++) {
        update_one(elapsed, y, vy, i);
    }
}

function draw(ctx) {
    for (let i = 0; i < x.length; i++) {
        const min = Math.min(canvas.height, canvas.width)
        let size = Math.min(Math.round(min * 0.1), 2)

        const xx = x[i] * canvas.width
        const yy = y[i] * canvas.height
        ctx.beginPath()
        ctx.ellipse(xx, yy, size, size, 0, 0, 2 * Math.PI)
        ctx.fill()
        ctx.closePath()
    }
}

let particles = [];
for (let i = 0; i < 1000; i++) {
    add_particle()
}

let zero = document.timeline.currentTime;
function redraw(last_frame) {
    let elapsed = last_frame - zero;
    zero = last_frame;
    update_all(elapsed / 1000);

    canvas.height = canvas.clientHeight;
    canvas.width = canvas.clientWidth;

    let ctx = canvas.getContext("2d")
    ctx.fillStyle = "blue";
    draw(ctx);
    window.requestAnimationFrame(redraw)
}


window.requestAnimationFrame(redraw)
