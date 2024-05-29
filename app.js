

// Get the name we're forming.
const searchParams = new URLSearchParams(window.location.search);
let render_name = "Fiona";
if (searchParams.has("name")) {
    render_name = searchParams.get("name")
}
let load = 0.0017;
if (searchParams.has("load")) {
    load = parseFloat(searchParams.get("load"))
}

const canvas = document.getElementById("draw-here");
const bg_canvas = document.getElementById("dont-draw-here");

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
    let name = bg_canvas.getContext("2d")

    for (let i = 0; i < x.length; i++) {
        let xx = Math.round(x[i] * canvas.width);
        let yy = Math.round(y[i] * canvas.height);

        let px = name.getImageData(xx, yy, 1, 1).data;
        // console.log("pixel data: ", px);
        if (px[3] !== 0) {
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
    ctx.reset()
    ctx.fillStyle = "blue";
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

function draw_name() {
    bg_canvas.height = canvas.clientHeight;
    bg_canvas.width = canvas.clientWidth;
    let ctx = bg_canvas.getContext("2d")

    let textHeight = canvas.height * 0.3;
    let textY = (canvas.height / 2) + (textHeight / 2);

    ctx.textAlign = "center"
    ctx.font = `${textHeight}px sans-serif`
    ctx.fillStyle = "black"
    ctx.fillText(render_name, canvas.width / 2, textY, canvas.width)
}

let first_draw = false;
function handle_resize() {
    if (!first_draw || canvas.height != canvas.clientHeight
        || canvas.width != canvas.clientWidth) {
        canvas.height = canvas.clientHeight;
        canvas.width = canvas.clientWidth;

        // Resized.
        draw_name()

        // Figure out how many particles to draw,
        // by a load factor.
        let count = Math.round(canvas.height * canvas.width * load)
        while (x.length > count) {
            x.length = count
            y.length = count
            vx.length = count
            vy.length = count
            scales.length = count
        }
        while (x.length < count) {
            add_particle()
        }
    }
}


let zero = document.timeline.currentTime;
function redraw(last_frame) {
    handle_resize()

    let elapsed = last_frame - zero;
    zero = last_frame;
    update_all(elapsed / 1000);

    let ctx = canvas.getContext("2d")
    draw(ctx);
    window.requestAnimationFrame(redraw)
}

window.requestAnimationFrame(redraw)
