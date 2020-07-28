const {Drawing, Vector, CanvasVector, animate, drawTimeTable, getRange} = CanvasDrawing;
const KeyManager = window.KeyManager;

const text_size = 20;
const background_color = '#e0e0cc';
const pen_color = '#331108';
const circle_color = '#ffffff';

const keyManager = new KeyManager({
    minx: 1,
    miny: 1,
    maxx: 10,
    maxy: 10,
    squaresize: 100,
    res: 400,
    radius: 0.48,
    phase: 0,
});

const drawing = new Drawing({ canvasId : 'item' });
const body = window.document.getElementsByTagName('body')[0]

body.classList.__proto__.swap = function(className) {
    if (this.contains(className)) {
        this.remove(className);
    } else {
        this.add(className);
    }
}

keyManager
    .add("ArrowUp", config => config.radius+=0.01)
    .add("ArrowDown", config => config.radius-=0.01)
    .add("+", config => config.res+=1)
    .add("-", config => config.res-=1)
    .add('x', config => body.classList.swap('maxwidth'))
    .add('y', config => body.classList.swap('maxheight'))
    .add("ArrowLeft", config => config.phase-=0.01)
    .add("ArrowRight", config => config.phase+=0.01)
    .add('p', config => config.maxx += 1)
    .add('o', config => config.maxx -= 1)
    .add('i', config => config.minx += 1)
    .add('u', config => config.minx -= 1)
    .add('l', config => config.maxy += 1)
    .add('k', config => config.maxy -= 1)
    .add('j', config => config.miny += 1)
    .add('h', config => config.miny -= 1)
    .setAction(config => {
        const pixelsizex = (config.maxx-config.minx+2)*config.squaresize;
        const pixelsizey = (config.maxy-config.miny+2)*config.squaresize;

        drawing.reinit({
            width : pixelsizex+2,
            height : pixelsizey+2,
            origin: [1-(config.minx-1)*config.squaresize,1+pixelsizey+(config.miny-1)*config.squaresize],
            mapx: config.squaresize, 
            mapy: -config.squaresize, 
            bgcolor: background_color,
        });

        const sizeRangeX = getRange(config.minx,config.maxx+1)
        const sizeRangeY = getRange(config.miny,config.maxy+1)
        const resolutionRange = getRange(config.res);

        const drawLegend = (position, text) => {
            drawing.circle({
                center: position,
                length: config.radius,
                color: pen_color,
                fill: circle_color,
            });
            drawing.addText({ 
                point: position,
                text: ''+text, 
                color: pen_color, 
                fontFamily: 'Calibri', 
                fontSize: text_size+'px',
                position: '5', 
            });
        };

        sizeRangeX.forEach(x=>drawLegend([x+0.5, config.miny-0.5], x));
        sizeRangeY.forEach(y=>drawLegend([config.minx-0.5, y+0.5], y));

        sizeRangeX.forEach(x => {
            sizeRangeY.forEach(y => {
                drawing.segmentLineLoop({
                    points: resolutionRange.map(t => 
                        new Vector(x+0.5,y+0.5).add([
                            config.radius*Math.cos(2*Math.PI*t*x/config.res),
                            config.radius*Math.sin(2*Math.PI*t*y/config.res+config.phase)
                        ])
                    ),
                    color: pen_color,
                });
            });
        });
    })
;

keyManager.add('r', config=>animate({
    from:0, 
    to:7.5*Math.PI, 
    duration:25, 
    frameTime:0.1, 
    action:({value})=>action({phase:value})
}))
