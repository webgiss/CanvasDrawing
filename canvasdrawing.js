(function(){
let window = this;

const POS_TOPRIGHT= "9";
const POS_TOP = "8";
const POS_TOPLEFT = "7";
const POS_RIGHT = "6";
const POS_CENTER = "5";
const POS_LEFT = "4";
const POS_BOTTOMRIGHT = "3";
const POS_BOTTOM = "2";
const POS_BOTTOMLEFT = "1";
const POS_NONE = "0";

const getXY = (x,y) => {
    if (x.__proto__.constructor === Vector) {
        return [x.x, x.y];
    }
    if (typeof(x)===typeof([])) {
        return [x[0],x[1]];
    }
    return [x,y];
}


const determineFontSize = (family, size, text) => {
    var fontStyle = "font-family: " + family + "; font-size: " + size + ";"
    var body = window.document.getElementsByTagName("body")[0];
    var dummy = window.document.createElement("span");
    var dummyText = window.document.createTextNode(text);
    dummy.appendChild(dummyText);
    dummy.setAttribute("style", fontStyle);
    body.appendChild(dummy);
    var result = [dummy.offsetWidth, dummy.offsetHeight];
    body.removeChild(dummy);
    return result;
}

class Vector{
    constructor(x,y,isPolar){
        if (isPolar) {
            [this._x,this._y] = [x*Math.cos(y), x*Math.sin(y)];
        } else {
            [this._x,this._y] = getXY(x,y);
        }
    }
    get x() { return this._x; }
    get y() { return this._y; }
    get xy() { return [this._x, this._y]; }
    get length() { return Math.sqrt(this.x*this.x+this.y*this.y); }
    
    add(x,y) {
        [x,y]=getXY(x,y);
        return new Vector(this.x+x, this.y+y);
    }
    sub(x,y) {
        [x,y]=getXY(x,y);
        return new Vector(this.x-x, this.y-y);
    }
    mul(x,y) {
        [x,y]=getXY(x,y);
        return new Vector(this.x*x-this.y*y, this.x*y+this.y*x);
    }
}
class Path {
    constructor({drawing, color}) {
        this._drawing = drawing;
        this._context = this._drawing.context;
        this._color = color || BLACK;
        this._actions = [];
        this._firstPoint = null;
        this._lastPoint = null;
    }
    
    usePoint(x,y){
        let point = new Vector(x,y);
        if (this._firstPoint === null) {
          this._firstPoint = point;
        }
        this._lastPoint = point;
        
        return point;
    }
    moveTo(x,y) {
        let point = this.usePoint(x,y);
        this._actions.push(()=>{
            this._drawing._moveTo(point);
        })
    }
    lineTo(x,y) {
        let point = this.usePoint(x,y);
        this._actions.push(()=>{
            this._drawing._lineTo(point);
        })
    }
    lineLoop () {
        if (this._firstPoint !== null) {
            let point = this._firstPoint;
            this.lineTo(point);
        }
    }
    segmentLine (points, isLoop) {
        if (points.length > 0) {
          this.moveTo(points[0]);
          points.slice(1).map(point=>this.lineTo(point));
          if (isLoop) {
            this.lineTo(points[0]);
          }
        }
    }
    segmentLineLoop (points) { return this.segmentLine(points, true); }
    arc (center, length, startAngle,stopAngle) {
        center = this.usePoint(center);
        this._actions.push(()=>{
            this._drawing._arc(center, length, startAngle, stopAngle);
        })
    }
    close() {
        if (this._context !== undefined) {
            this._context.strokeStyle = this._color;
            this._context.beginPath();
            this._actions.map(action=>action());
            this._context.stroke();
            this._context.closePath();
        }
    }
}
class Drawing {
    constructor(params) {
        this.reinit(params);
    }
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }  
    get context() {
        return this._context;
    }
    reinit({canvas, height, width, origin, mapx, mapy, bgcolor}) {
        let needClear = false;

        if (canvas !== undefined) {
            this._canvas = canvas;
            needClear = true;
        }
        if (origin !== undefined) {
            this._origin = new Vector(origin);
        }
        if (self._origin === undefined) {
            self._origin = new Vector([0,0]);
        }
       
        if (mapx !== undefined) {
            self._mapx = mapx;
        }
        if (mapy !== undefined) {
            self._mapy = mapy;
        }
        if (self._mapx === undefined) {
            self._mapx === 1;
        }
        if (self._mapy === undefined) {
            self._mapy === 1;
        }
        
        this._map = new Vector(self._mapx,self._mapy);
        
        if (width === undefined) {
            this._width = this._canvas.width;
        } else {
            this._width = width;
            this._canvas.width = this._width;
            needClear = true;
        }
        if (height === undefined) {
            this._height = this._canvas.height;
        } else {
            this._height = height;
            this._canvas.height = this._height;
            needClear = true;
        }
        if (this._canvas !== undefined) {
            this._context = this._canvas.getContext('2d');
        }
        if (bgcolor !== undefined) {
            this._bgcolor = bgcolor;
            needClear = true;
        }
        if (needClear) {
            this.clear();
        }
    }
    clear() {
        let bgcolor = this._bgcolor || '#fff';
        this._rect(0,0,this._width,this._height, bgcolor);
    }
    getContextCoord(x,y) {
        let v = new Vector(x,y);
        return this._origin.add(this._map.x*v.x, this._map.y*v.y);
    }
    getContextDistance(x) {
        return this.getContextCoord(0,x).sub(this.getContextCoord(0,0)).length;
    }
 
    getPath(params) {
        let {color} = params ||{};
      
        return new Path({drawing: this, color});
    }
    
    _rect(x,y,w,h,c) {
        if (this._context !== undefined) {
            this._context.fillStyle=c;
            this._context.fillRect(x,y,w,h);
        }
    }
    
    _lineTo(point){
        if (this._context !== undefined) {
            this._context.lineTo(...this.getContextCoord(point).xy);
        }
    }
    _moveTo(point){
        if (this._context !== undefined) {
            this._context.moveTo(...this.getContextCoord(point).xy);
        }
    }
 
    _arc(center, length, startAngle, stopAngle){
        if (this._context !== undefined) {
            console.log({center, length, startAngle, stopAngle});
            this._context.arc(
                ...this.getContextCoord(center).xy, 
                this.getContextDistance(length),
                startAngle, 
                stopAngle
            );
        }
    }
    
    line({ point0, point1, color }){
        let path = this.getPath({color});
        path.moveTo(point0);
        path.lineTo(point1);
        path.close();
    }
    
    circle({center, length, color}) {
        let path = this.getPath({color});
        path.arc(center, length, 0, 2*Math.PI);
        path.close();
    }
    
    segmentLine({points, color}) {
        let path = this.getPath({color});
        path.segmentLine(points);
        path.close();
    }
    
    segmentLineLoop({points, color}) {
        let path = this.getPath({color});
        path.segmentLineLoop(points);
        path.close();
    }

    addText({text, color, fontFamily, fontSize, space, position, point}) {
        fontFamily = fontFamily || "sans-serif";
        fontSize = fontSize || "12px";
        color = color || "#000";
        if (space === undefined) {
            space = 5;
        }
        let [x,y] = this.getContextCoord(point).xy;
        let [width, height] = determineFontSize(fontFamily, fontSize, text);
        let [xmin, xmax, ymin, ymax] = [x,x,y,y];
        switch (position) {
            case POS_BOTTOMLEFT:
            case POS_BOTTOM:
            case POS_BOTTOMRIGHT:
                {
                    ymin = y + space;
                    y = y + space + height;
                }
                break;
            case POS_LEFT:
            case POS_CENTER:
            case POS_RIGHT:
                {
                    ymin = y - height/2;
                    y = y + height/2;
                }
                break;
            case POS_TOPLEFT:
            case POS_TOP:
            case POS_TOPRIGHT:
                {

                    ymin = y - space - height;
                    y = y - space;
                }
                break;
            case POS_NONE:
            default:
                {
                    return;
                }
                break;
        }
        switch (position) {
            case POS_BOTTOMLEFT:
            case POS_LEFT:
            case POS_TOPLEFT:
                {
                    xmin = x - space - width;
                    x = x - space - width;
                }
                break;
            case POS_BOTTOM:
            case POS_CENTER:
            case POS_TOP:
                {
                    xmin = x - width/2;
                    x = x - width/2;
                }
                break;
            case POS_BOTTOMRIGHT:
            case POS_RIGHT:
            case POS_TOPRIGHT:
                {
                    xmin = x + space;
                    x = x + space;
                }
                break;
            case POS_NONE:
            efault:
                {
                    return;
                }
                break;
        }
        this._context.strokeStyle = color;
        this._context.beginPath();
        this._context.font = fontSize + " " + fontFamily;
        this._context.fillStyle = color;
        this._context.fillText(text, x, y);

        this._context.rect(xmin, ymin, width, height)
        this._context.stroke();
        this._context.closePath();
    }
    
}

// const CanvasDrawing = {Vector, Drawing, getXY};
window.CanvasDrawing = { ...(window.CanvasDrawing || {}), Vector, Drawing, getXY };

})(this);
