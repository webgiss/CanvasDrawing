const {
    Drawing,
    Vector,
    CanvasVector,
    getRange,
} = CanvasDrawing;

const {
    ALIGN_CENTER,
    POS_CENTER,
} = CanvasDrawing;

const drawing = new Drawing({ canvasId: "item" });

const mainAction = () => {
    const n = 11;
    const minDim = 2 * 2 ** n;

    width = minDim + 400;
    height = minDim + 600 + 1600;

    const origin = [200, 4296];
    const mapx = 1;
    const mapy = -1;
    const bgcolor = '#000000';
    drawing.reinit({ height, width, origin, mapx, mapy, bgcolor });

    const N = 2 ** (2 * n);
    const range = getRange(N);

    range.forEach((i) => {
        let p = hilbert1To2(n, i);
        let v = new Vector([p[0] * 2, p[1] * 2]);
        drawing.filledRectangle({
            point0: v,
            point1: v.add(2, 2),
            color: hue2color(i / N),
        });
    })

    drawing.addText({
        text: 'Hilbert',
        position: POS_CENTER,
        point: new CanvasVector(2248, 5296),
        textAlign: ALIGN_CENTER,
        color: '#ffffff',
        fontFamily: 'Calibri',
        fontSize: '900px',
        fontWeight: 'bold',
    });
};

mainAction();