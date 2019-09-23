const { Drawing, Vector, CanvasVector, animate, drawTimeTable } = CanvasDrawing;
const KeyManager = window.KeyManager;

let background_color = '#e0e0cc';
let non_2_3_multiple_color = '#ccbb00';
let prime_color = '#aa6644';
// non_2_3_multiple_color = prime_color;
let rectangle_color = '#ccbb00';
let text_color = '#331108';
let spiral_color = '#000000';
let text_size = 10;

class Primes {
    constructor() {
        this._primes = [];
    }

    ensureSize(scount, ssize) {
        if (this._primes === undefined || this._primes.length <= scount) {
            this._primes = [...Array(scount).keys()];

            this._primes[1] = 0;
            let index = 2;

            while (index < ssize) {
                if (this._primes[index] > 0) {
                    for (let i = index * index; i < scount; i += index) {
                        this._primes[i] = 0;
                    }
                }

                index++;
            }
        }
    }

    isPrime(k) {
        return this._primes[k] > 0;
    }
}

let primes = new Primes();

let drawing = new Drawing({ canvasId: 'item' });
const body = window.document.getElementsByTagName('body')[0]

body.classList.__proto__.swap = function (className) {
    if (this.contains(className)) {
        this.remove(className);
    } else {
        this.add(className);
    }
}

const keyManager = new KeyManager({
    size: 40,
    spiral_offset: 1,
    display_non_2_3_multiple: false,
    display_prime: true,
    display_rectangle: true,
    display_spiral: false,
    display_text: false,
});

keyManager
    .add("ArrowUp", config => config.spiral_offset += 1)
    .add("ArrowDown", config => config.spiral_offset -= 1)
    .add("ArrowLeft", config => config.spiral_offset -= 1)
    .add("ArrowRight", config => config.spiral_offset += 1)
    .add("+", config => config.size += 1)
    .add("-", config => config.size -= 1)
    .add("*", config => config.display_non_2_3_multiple = !config.display_non_2_3_multiple)
    .add("ù", config => config.display_prime = !config.display_prime)
    .add("r", config => config.display_rectangle = !config.display_rectangle)
    .add("s", config => config.display_spiral = !config.display_spiral)
    .add("t", config => config.display_text = !config.display_text)
    .add('x', config => body.classList.swap('maxwidth'))
    .add('y', config => body.classList.swap('maxheight'))
    .setAction(config => {
        let ssize = 2 * config.size;
        let scount = ssize * ssize;
        let [width, height] = [window.innerWidth, window.innerHeight];
        let minDim = Math.min(width, height);
        drawing.reinit({
            height,
            width,
            origin: [width / 2, height / 2],
            mapx: (minDim / 2) / config.size,
            mapy: -(minDim / 2) / config.size,
            bgcolor: background_color,
        });

        primes.ensureSize(scount, ssize);

        const drawNumber = (k) => {
            let kk = k - config.spiral_offset;
            let r = Math.floor(Math.sqrt(kk));
            let mr = r - (r + 1) % 2;
            let mmr = mr + 1;
            let b = mr * mr;
            let yb = (mr + 1) / 2;
            let d = kk - b;
            let decl = d % mmr;
            let phase = (d - decl) / mmr;

            let [x, y] = [yb, -yb];

            if (phase >= 1) {
                y = y + mmr;
            }

            if (phase >= 2) {
                x = x - mmr;
            }

            if (phase >= 3) {
                y = y - mmr;
            }

            switch (phase) {
                case 0:
                    y = y + decl + 1;
                    break;
                case 1:
                    x = x - decl - 1;
                    break;
                case 2:
                    y = y - decl - 1;
                    break;
                case 3:
                    x = x + decl + 1;
                    break;
            }

            if (config.display_non_2_3_multiple) {
                if (k % 6 === 1 || k % 6 === 5) {
                    drawing.filledRectangle({ point0: new Vector(x, y), point1: new Vector(x + 1, y + 1), color: non_2_3_multiple_color });
                }
            }

            if (config.display_prime) {
                if (primes.isPrime(k)) {
                    drawing.filledRectangle({ point0: new Vector(x, y), point1: new Vector(x + 1, y + 1), color: prime_color });
                }
            }

            if (config.display_rectangle) {
                drawing.rectangle({ point0: new Vector(x, y), point1: new Vector(x + 1, y + 1), color: rectangle_color });
            }

            if (config.display_text) {
                drawing.addText({ text: '' + k, color: text_color, fontFamily: 'Calibri', fontSize: text_size + 'px', position: '5', point: new Vector(x + 0.5, y + 0.5) });
            }
        }

        for (let index = config.spiral_offset; index < scount; index++) {
            drawNumber(index);
        }

        if (config.display_spiral) {
            let x = 1
            let y = 1
            let index = 1

            while (index <= ssize) {
                drawing.line({ point0: [x, y], point1: [x - index, y], color: spiral_color })
                x = x - index
                drawing.line({ point0: [x, y], point1: [x, y - index], color: spiral_color })
                y = y - index

                index = index + 1

                drawing.line({ point0: [x, y], point1: [x + index, y], color: spiral_color })
                x = x + index
                drawing.line({ point0: [x, y], point1: [x, y + index], color: spiral_color })
                y = y + index

                index = index + 1
            }
        }
    })
    ;
