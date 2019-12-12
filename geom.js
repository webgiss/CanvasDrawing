const {
    Drawing,
    Vector,
    CanvasVector,
    getRange,
} = CanvasDrawing;

const {
    POS_CENTER,
    POS_TOPLEFT,
    POS_TOPRIGHT,
    POS_BOTTOMRIGHT,
    POS_BOTTOMLEFT,
} = CanvasDrawing;

const {
    getCf, getRatio, reduceFraction, partialCf, partialCfs
} = ContinuedFraction;

const KeyManager = window.KeyManager;
const keyManager = new KeyManager({
    penColor: '#e61ab6',
    backgroundColor: '#ffffff',
    w: 16,
    z: 1,
});
const drawing = new Drawing({ canvasId: "item" });

const mainAction = (config) => {
    const { w, z, backgroundColor, penColor, } = config;

    let height = window.innerHeight;
    let width = window.innerWidth;
    let minDim = Math.min(width, height);
    width = minDim;
    height = minDim;
    const origin = [width / 2, height / 2];
    const mapx = minDim / z;
    const mapy = minDim / z;
    const bgcolor = backgroundColor;
    drawing.reinit({ height, width, origin, mapx, mapy, bgcolor });

    const L = 1;
    const l = L / w;

    const W = Math.floor(2 * w / Math.sqrt(3)) + 2;

    const bitsCount = w + W;
    let generatorBits = getRange(bitsCount).map(() => Math.floor(Math.random() * 2))

    console.log({bitsCount})
    // generatorBits = getRange(bitsCount).map((index) => index === w+2 || index === w+43 ? 1 : 0)

    const bitIndexStart = Math.floor(W/2)

    const bits = [];

    let lastGenerated = generatorBits;
    bits.push(lastGenerated);

    getRange(W).forEach(() => {
        const newGenerated = [];
        getRange(lastGenerated.length-1).forEach((index)=>{
            newGenerated.push((lastGenerated[index]+lastGenerated[index+1])%2)
        })
        lastGenerated = newGenerated;
        bits.push(lastGenerated);
    })

    getRange(W-1).forEach((indexLine) => {
        const offset = (indexLine % 2) * l / 2;
        const firstBitIndex = bitIndexStart - Math.floor((indexLine+1)/2)
        getRange(w+1).forEach((index) => {
            drawing.circle({
                center: new Vector(
                    -L / 2 + index * l + l / 2 - offset, 
                    L / 2 - indexLine * (l * Math.sqrt(3) / 2) - (l*Math.sqrt(3)/3)
                ),
                length: (l*Math.sqrt(3)/6),
                fill: bits[indexLine][firstBitIndex+index]+bits[indexLine+1][firstBitIndex+index-1]+bits[indexLine+1][firstBitIndex+index] >= 2 ? penColor : backgroundColor,
            });
            drawing.circle({
                center: new Vector(
                    -L / 2 + index * l - offset, 
                    L / 2 - indexLine * (l * Math.sqrt(3) / 2) - (l*Math.sqrt(3)/6)
                ),
                length: (l*Math.sqrt(3)/6),
                fill: bits[indexLine][firstBitIndex+index]+bits[indexLine+1][firstBitIndex+index-1]+bits[indexLine][firstBitIndex+index-1] >= 2 ? penColor : backgroundColor,
            });
        })
    })

    getRange(W).forEach((indexLine) => {
        const offset = (indexLine % 2) * l / 2;
        const firstBitIndex = bitIndexStart - Math.floor((indexLine+1)/2)
        getRange(w + 1).forEach((index) => {
            drawing.circle({
                center: new Vector(-L / 2 + index * l + l / 2 - offset, L / 2 - indexLine * (l * Math.sqrt(3) / 2)),
                length: l / 2,
                fill: bits[indexLine][firstBitIndex+index] === 0 ? backgroundColor : penColor,
            });
        })
    })

    drawing.rectangle({
        point0: new Vector(L / 2, L / 2),
        point1: new Vector(-L / 2, -L / 2),
        color: penColor,
    });
};

const createColor = () => {
    const min = 0x1a;
    const max = 0xe6;
    const moy = Math.floor(Math.random()*(max-min))+min;
    const items = [min, moy, max];
    let index = Math.floor(Math.random()*items.length);
    const red = items.splice(index,1)[0];
    index = Math.floor(Math.random()*items.length);
    const green = items.splice(index,1)[0];
    const blue = items[0];
    return `rgb(${red},${green},${blue})`;
    
}


keyManager
    .add('ArrowUp', () => {})
    .add('ArrowDown', () => {})
    .add('ArrowLeft', (config) => config.w += 1)
    .add('ArrowRight', (config) => config.w -= 1)
    .add('KeyC', (config) => config.penColor = createColor())
    .setAction(mainAction)
    .onResize(true)
    ;

const cr = (xratio) => {
    if (xratio !== undefined) {
        if (xratio.length !== undefined) {
            config.ratio = getRatio(xratio);
        } else {
            config.ratio = xratio;
        }
    }
    action(config);
}

