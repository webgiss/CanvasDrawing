const Md = [
    [1, 0, 0, 3],
    [0, 1, 1, 2],
    [3, 2, 2, 1],
    [2, 3, 3, 0]
]
const M12 = [
    [0, 1, 3, 2],
    [0, 2, 3, 1],
    [3, 2, 0, 1],
    [3, 1, 0, 2]
]
const M21 = [
    [0, 1, 3, 2],
    [0, 3, 1, 2],
    [2, 3, 1, 0],
    [2, 1, 3, 0]
]


/**
 * Convert an index into coordinate of the Hilbert-n curve.
 * @param {number} n The order of the hilbert curve
 * @param {number} i The index (compris between 0 and (2**(2n))-1)
 * @returns {number[]} The result comprise between 0 and (2**n)-1
 */
const hilbert1To2 = (n, i) => {
    let d = 0;
    let p = 2 ** (n - 1);
    let x = 0;
    let y = 0;
    while (p > 0) {
        let ic = (Math.floor(i / (p * p))) % (4);
        let zc = M12[d][ic];
        let xc = Math.floor(zc / 2);
        let yc = zc % 2;
        d = Md[d][ic];
        x = x + xc * p;
        y = y + yc * p;
        p = Math.floor(p / 2);
    }
    return [x, y];
}

/**
 * Convert a couple of coordinate of the Hilbert-n curve into an index.
 * @param {number} n The order of the hilbert curve
 * @param {number} x The index (compris between 0 and (2**n)-1)
 * @param {number} y The index (compris between 0 and (2**n)-1)
 * @returns {number} The result comprise between 0 and (2**(2n))-1
 */
const hilbert2To1 = (n, x, y) => {
    let d = 0;
    let p = 2 ** (n - 1);
    let i = 0;
    while (p > 0) {
        let xc = (Math.floor(x / p)) % (2);
        let yc = (Math.floor(y / p)) % (2);
        let zc = 2 * xc + yc;
        let ic = M21[d][zc];
        d = Md[d][ic];
        i = i + ic * p * p;
        p = Math.floor(p / 2);
    }
    return i;
}

