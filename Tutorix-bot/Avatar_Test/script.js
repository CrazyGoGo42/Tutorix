class SimplexNoise {
    constructor(seed = 0) {
        this.p = [];
        const rng = this.seededRandom(seed);
        for (let i = 0; i < 256; i++) this.p[i] = i;
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
        }
        this.perm = [...this.p, ...this.p];
    }

    seededRandom(seed) {
        return function() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }

    fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    lerp(t, a, b) { return a + t * (b - a); }

    grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 8 ? y : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    perlin3(x, y, z) {
        const xi = Math.floor(x) & 255;
        const yi = Math.floor(y) & 255;
        const zi = Math.floor(z) & 255;

        const xf = x - Math.floor(x);
        const yf = y - Math.floor(y);
        const zf = z - Math.floor(z);

        const u = this.fade(xf);
        const v = this.fade(yf);
        const w = this.fade(zf);

        const p = this.perm;
        const aaa = p[p[p[xi] + yi] + zi];
        const aab = p[p[p[xi] + yi] + zi + 1];
        const aba = p[p[p[xi] + yi + 1] + zi];
        const abb = p[p[p[xi] + yi + 1] + zi + 1];
        const baa = p[p[p[xi + 1] + yi] + zi];
        const bab = p[p[p[xi + 1] + yi] + zi + 1];
        const bba = p[p[p[xi + 1] + yi + 1] + zi];
        const bbb = p[p[p[xi + 1] + yi + 1] + zi + 1];

        const g0 = this.grad(aaa, xf, yf, zf);
        const g1 = this.grad(aab, xf, yf, zf - 1);
        const g2 = this.grad(aba, xf, yf - 1, zf);
        const g3 = this.grad(abb, xf, yf - 1, zf - 1);
        const g4 = this.grad(baa, xf - 1, yf, zf);
        const g5 = this.grad(bab, xf - 1, yf, zf - 1);
        const g6 = this.grad(bba, xf - 1, yf - 1, zf);
        const g7 = this.grad(bbb, xf - 1, yf - 1, zf - 1);

        const l0 = this.lerp(w, g0, g1);
        const l1 = this.lerp(w, g2, g3);
        const l2 = this.lerp(w, g4, g5);
        const l3 = this.lerp(w, g6, g7);
        const l4 = this.lerp(v, l0, l1);
        const l5 = this.lerp(v, l2, l3);
        return this.lerp(u, l4, l5);
    }
}

function mix(a,b,t){ return Math.round(a*(1-t) + b*t); }
function hexToRgb(hex){
    return { r: parseInt(hex.slice(1,3),16),
             g: parseInt(hex.slice(3,5),16),
             b: parseInt(hex.slice(5,7),16) };
}

const canvases = document.querySelectorAll(".avatar");
const drawFunctions = [];

canvases.forEach((canvas, index) => {
    const ctx = canvas.getContext("2d");
    const size = 256;
    canvas.width = size;
    canvas.height = size;

    const c1 = hexToRgb(canvas.dataset.color1);
    const c2 = hexToRgb(canvas.dataset.color2);
    const noiseGen = new SimplexNoise(index + 42);

    // Z-Werte für smooth Noise
    let z1 = 0;
    let z2 = 1000;

    function noise(x, y) {
        // Koordinaten leicht glätten
        const n1 = noiseGen.perlin3(x*0.01, y*0.01, z1);
        const n2 = noiseGen.perlin3(y*0.012, x*0.008, z2);
        return (n1+n2)*0.5 + 0.5;
    }

    function draw(deltaTime) {
        ctx.clearRect(0,0,size,size);

        ctx.save();
        ctx.beginPath();
        ctx.arc(size/2, size/2, size/2, 0, Math.PI*2);
        ctx.clip();

        // Grid kleiner Schritt für smoother
        for(let y=0; y<size; y+=2){
            for(let x=0; x<size; x+=2){
                const n = noise(x, y);
                const r = mix(c1.r, c2.r, n);
                const g = mix(c1.g, c2.g, n);
                const b = mix(c1.b, c2.b, n);

                ctx.fillStyle = `rgba(${r},${g},${b},0.85)`;
                ctx.fillRect(x,y,2,2);
            }
        }

        // Highlight
        const gradient = ctx.createRadialGradient(
            size*0.3, size*0.3, 10,
            size*0.3, size*0.3, size
        );
        gradient.addColorStop(0, "rgba(255,255,255,0.18)");
        gradient.addColorStop(1, "rgba(255,255,255,0)");

        ctx.fillStyle = gradient;
        ctx.fillRect(0,0,size,size);

        ctx.restore();

        // Z-Werte stetig erhöhen
        z1 += deltaTime * 0.3;
        z2 += deltaTime * 0.22;
    }

    drawFunctions.push(draw);
});

let lastTime = performance.now();
function animate(now) {
    const deltaTime = (now - lastTime) * 0.001;
    lastTime = now;

    drawFunctions.forEach(draw => draw(deltaTime));
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
