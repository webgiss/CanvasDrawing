const { Drawing, Vector, CanvasVector, animate, drawTimeTable } = CanvasDrawing;
const KeyManager = window.KeyManager;

let background_color = '#e0e0cc';
let non_2_3_multiple_color = '#ccbb00';
let prime_color = '#aa6644';
// non_2_3_multiple_color = prime_color;
let rectangle_color = '#ccbb00';
let text_color = '#331108';
let spiral_color = '#000000';
let multiple_color = '#5577ff';
let text_size = 10;

class Primes {
    constructor () {
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

    get size() { return this._primes.length }
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

const mainAction = (config, keyManager) => {
    let ssize = 2 * config.size + 1;
    let scount = ssize * ssize;
    let [width, height] = [window.innerWidth, window.innerHeight];
    let minDim = Math.min(width, height);
    drawing.reinit({
        height,
        width,
        origin: [width / 2, height / 2],
        mapx: (minDim) / ssize,
        mapy: -(minDim) / ssize,
        bgcolor: background_color,
    });

    primes.ensureSize(scount, ssize);

    const drawNumberSquare = (index_value, index_position) => {
        let r = Math.floor(Math.sqrt(index_position));
        let mr = r - (r + 1) % 2;
        let mmr = mr + 1;
        let b = mr * mr;
        let yb = (mr + 1) / 2;
        let d = index_position - b;
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

        const point0 = new Vector(x - 1 / 2, y - 1 / 2)
        const point1 = new Vector(x + 1 / 2, y + 1 / 2)

        if (config.display_non_2_3_multiple) {
            if (index_value % 6 === 1 || index_value % 6 === 5) {
                drawing.filledRectangle({ point0, point1, color: non_2_3_multiple_color });
            }
        }

        if (config.display_prime) {
            if (primes.isPrime(index_value)) {
                drawing.filledRectangle({ point0, point1, color: prime_color });
            }
        }

        if (config.display_multiple) {
            if (index_value % config.current_multiple === 0) {
                drawing.filledRectangle({ point0, point1, color: multiple_color });
            }
        }

        if (config.display_grid) {
            drawing.rectangle({ point0, point1, color: rectangle_color });
        }

        if (config.display_text) {
            drawing.addText({ text: '' + index_value, color: text_color, fontFamily: 'Calibri', fontSize: text_size + 'px', position: '5', point: new Vector(x, y) });
        }
    }

    const u1 = [0, 1]
    const u2 = [-Math.sqrt(3) / 2, 1 / 2]
    const directionMatrix = [[1, 0, -1, -1, 0, 1], [0, 1, 1, 0, -1, -1]]


    const drawNumberHex = (index_value, index_position) => {
        let n = -1
        let p = 0
        let r = 0
        if (index_position > 0) {
            n = Math.floor(Math.sqrt((index_position - 1) / 3 + 1 / 4) - 1 / 2);
            const v = 3 * n * (n + 1);
            p = Math.floor((index_position - v) / (n + 1));
            r = index_position - v - p * (n + 1);
        }
        const d0 = p % 6
        const d1 = (p + 2) % 6
        const ud0 = [u1[0] * directionMatrix[0][d0] + u2[0] * directionMatrix[1][d0], u1[1] * directionMatrix[0][d0] + u2[1] * directionMatrix[1][d0]]
        const ud1 = [u1[0] * directionMatrix[0][d1] + u2[0] * directionMatrix[1][d1], u1[1] * directionMatrix[0][d1] + u2[1] * directionMatrix[1][d1]]

        const x = (n + 1) * ud0[0] + r * ud1[0];
        const y = (n + 1) * ud0[1] + r * ud1[1];

        const point = new Vector(x, y)
        const length = 0.40

        if (config.display_non_2_3_multiple) {
            if (index_value % 6 === 1 || index_value % 6 === 5) {
                drawing.circle({ center: point, length, fill: non_2_3_multiple_color })
            }
        }

        if (config.display_prime) {
            if (primes.isPrime(index_value)) {
                drawing.circle({ center: point, length, fill: prime_color })
            }
        }

        if (config.display_multiple) {
            if (index_value % config.current_multiple === 0) {
                drawing.circle({ center: point, length, fill: multiple_color })
            }
        }

        if (config.display_grid) {
            drawing.circle({ center: point, length, color: rectangle_color })
        }

        if (config.display_text) {
            drawing.addText({ text: '' + index_value, color: text_color, fontFamily: 'Calibri', fontSize: text_size + 'px', position: '5', point: new Vector(x, y) });
        }
    }

    const drawNumber = config.display_square ? drawNumberSquare : drawNumberHex;

    for (let index = 0; index < scount; index++) {
        drawNumber(index + config.spiral_offset, index);
    }

    if (config.display_spiral) {
        if (config.display_square) {
            let x = 1 / 2
            let y = 1 / 2
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
        } else {
            let x = (u2[0] - u1[0]) / 2
            let y = (u2[1] - u1[1]) / 2
            let index = 1 / 2
            let p = 4
            let d = null;
            let point = null;

            dir_length = [0, 0, 0, 1, 0, 1]
            while (index <= ssize) {
                for (index_dir = 0; index_dir < 6; index_dir++) {
                    d = [u1[0] * directionMatrix[0][p] + u2[0] * directionMatrix[1][p], u1[1] * directionMatrix[0][p] + u2[1] * directionMatrix[1][p]]
                    point = [x, y];
                    x += (index + dir_length[index_dir]) * d[0]
                    y += (index + dir_length[index_dir]) * d[1]

                    drawing.line({ point0: point, point1: [x, y], color: spiral_color })
                    p += 1
                    p = p % 6
                }
                index = index + 1
            }
        }
    }

    if (config.display_info) {
        info = Object.keys(config).map((key) => `${key}: ${config[key]}`).join('\n')
        drawing.addText({ text: info, fontFamily: 'sans-serif', fontSize: '14px', color: text_color, point: new CanvasVector([0, 0]), position: '3' });
        if (keyManager) {
            const doc = keyManager.doc;
            if (doc) {
                drawing.addText({ text: doc, fontFamily: 'sans-serif', fontSize: '14px', color: text_color, point: new CanvasVector([width, height]), position: '7' });
            }
        }
    }

};

const increment_multiple = (multiple) => {
    let index = multiple;
    while (index < primes.size) {
        index++;
        if (primes.isPrime(index)) {
            return index;
        }
    }
    return multiple;
}

const decrement_multiple = (multiple) => {
    let index = multiple;
    while (index > 2) {
        index--;
        if (primes.isPrime(index)) {
            return index;
        }
    }
    return multiple;
}


const keyManager = new KeyManager({
    size: 40,
    spiral_offset: 1,
    current_multiple: 2,
    display_multiple: false,
    display_non_2_3_multiple: false,
    display_prime: true,
    display_grid: true,
    display_spiral: false,
    display_text: false,
    display_square: true,
    display_info: true,
});

keyManager
    .add("+", (config) => config.size += 1, 'Increment size')
    .add("-", (config) => config.size -= 1, 'Decrement size')
    .add("ArrowLeft", (config) => config.spiral_offset -= 1, 'Decrement spiral_offset')
    .add("ArrowRight", (config) => config.spiral_offset += 1, 'Increment spiral_offset')
    .add("ArrowDown", (config) => config.current_multiple = decrement_multiple(config.current_multiple), 'Decrement current_multiple')
    .add("ArrowUp", (config) => config.current_multiple = increment_multiple(config.current_multiple), 'Increment current_multiple')
    .add("m", (config) => config.display_multiple = !config.display_multiple)
    .add("*", (config) => config.display_non_2_3_multiple = !config.display_non_2_3_multiple, 'Toggle display_non_2_3_multiple')
    .add("\u00f9", (config) => config.display_prime = !config.display_prime, 'Toggle display_prime')
    .add("g", (config) => config.display_grid = !config.display_grid, 'Toggle display_grid')
    .add("s", (config) => config.display_spiral = !config.display_spiral, 'Toggle display_spiral')
    .add("t", (config) => config.display_text = !config.display_text, 'Toggle display_text')
    .add("h", (config) => config.display_square = !config.display_square, 'Toggle display_square')
    .add("i", (config) => config.display_info = !config.display_info, 'Toggle display_info')
    // .add('x', (config) => body.classList.swap('maxwidth'), 'Toggle css maxwidth')
    // .add('y', (config) => body.classList.swap('maxheight'), 'Toggle css maxheight')
    .setAction(mainAction)
    .onResize(true)
    ;
