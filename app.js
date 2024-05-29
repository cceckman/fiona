
const canvas = document.getElementById("draw-here");

class HueGradient{
    constructor() {
        this.sat = Math.round(Math.random() * 70 + 30);
        this.val = Math.round(Math.random() * 70 + 30);
        this.start_color = Math.round(Math.random() * 360);
        this.speed = Math.round(Math.random() * 360);
    }

    gradient_for_column(ctx, height, column) {
        const start_color = (this.start_color + column * this.speed) % 360;
        const mid_color = (start_color + 90) % 360;
        const end_color = (start_color + 180) % 360;
        const start_str = `hsl(${start_color}deg, ${this.sat}%, ${this.val}%)`;
        const mid_str = `hsl(${mid_color}deg, ${this.sat}%, ${this.val}%)`;
        const end_str = `hsl(${end_color}deg, ${this.sat}%, ${this.val}%)`;

        // console.log("colors: ", start_str, end_str)
        // Gradient only in the vertical dimension.
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, start_str);
        grad.addColorStop(0.5, mid_str);
        grad.addColorStop(1, end_str);
        return grad;
    }
}

function to_pct(v) {
    return Math.round(v * 100);
}

class LightnessGradient{
    constructor() {
        this.sat = to_pct(Math.random() * 90 + 10);
        this.color = Math.round(Math.random() * 360);
        // Use sin(sat) so we get a nice back-and-forth, like real yarn
        this.start_val = Math.round(Math.random() * 360);

        const a = Math.random();
        const b = Math.random();
        this.min_val = Math.min(a, b);
        this.max_val = Math.max(a, b);
        this.speed = Math.round(Math.random() * 360);
    }

    angle_to_pct(angle) {
        let fraction = Math.sin(angle);
        let v = this.min_val + (this.max_val - this.min_val) * fraction;
        return to_pct(v);
    }

    gradient_for_column(ctx, height, column) {
        // Sped is- kinda unitless?
        const start = (this.start_val + column * this.speed);
        const mid = start + this.speed;
        const end = mid + this.speed;

        const start_str = `hsl(${this.color}deg, ${this.sat}%,  ${this.angle_to_pct(start)}%)`;
        const mid_str = `hsl(${this.color}deg, ${this.sat}%,    ${this.angle_to_pct(mid)}%)`;
        const end_str = `hsl(${this.color}deg, ${this.sat}%,    ${this.angle_to_pct(end)}%)`;

        console.log("colors:", start_str, mid_str, end_str)

        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, start_str);
        grad.addColorStop(0.5, mid_str);
        grad.addColorStop(1, end_str);
        return grad;
    }
}

// Use https://stackoverflow.com/questions/4288253/html5-canvas-100-width-height-of-viewport ?
function rerender() {
    canvas.height = canvas.clientHeight;
    canvas.width = canvas.clientWidth;
    let h = canvas.height;
    let w = canvas.width;
    console.log("dims: ", canvas.clientHeight, canvas.clientWidth);
    console.log("dims: ", h, w);
    let ctx = canvas.getContext("2d");

    let gradient_params = [];

    const params = new URLSearchParams(window.location.search);
    const stitchwidth = Number(params.get("stitchwidth") ?? 19);
    const stitchheight = Number(params.get("stitchheight") ?? 13);
    const threads = Number(params.get("threads") ?? 3);
    const mode = params.get("mode") ?? "";
    console.log("params:", stitchwidth, stitchheight, threads);

    for (let col = 0; col < threads; col++) {
        let constructor = LightnessGradient;
        if(mode === "hue" || (mode === "" && Math.random() >= 0.5)) {
            constructor = HueGradient;
        } 
        gradient_params.push(new constructor());
    }

    let thread = 0;
    for(let column = 0; column < (w / stitchwidth); column++) {
        const x0 = column * stitchwidth;
        let gradients = gradient_params.map((g) => g.gradient_for_column(ctx, h, column));
        for (let y0 = 0; y0 < h; y0 += stitchheight) {
            ctx.fillStyle = gradients[thread];
            thread = (thread + 1) % threads;
            ctx.fillRect(x0, y0, stitchwidth, stitchheight);
        }
    }
}

window.addEventListener("load", rerender);