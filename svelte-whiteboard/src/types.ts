export class Point {
    public get X(): number { return this._x; }
    public get Y(): number { return this._y; }

    private _x: number
    private _y: number

    constructor(x: number, y: number){
        this._x = x;
        this._y = y;
    }
    

    public toString() : string {
        return "(" + this.X + "|" + this.Y + ")";
    }

    public neg(): Point{
        return new Point(-1 * this._x, -1 * this._y);
    }

    public add(...points: Point[]) : Point{
        return AggregatePoints(this, ...points);
    }

    public mult(fact: number): Point{
        return new Point(this._x * fact, this._y * fact);
    }

    public div(div: number): Point{
        return new Point(this._x / div, this._y / div);
    }
}

export function p(str: string): Point{
    var strs = str.replace("(", "").replace(")", "").split("|");
    return new Point(Number(strs[0]), Number(strs[1]));
}

export function rect2p(rect:any){
    return new Point(rect.left, rect.top);
}

export function OffsetPoint(p: Point, x, y): Point {
    return new Point(p.X + x, p.Y + y);
}

export function AggregatePoints(...p: Point[]): Point{
    var x : number = 0;
    var y : number = 0;
    for(var po of p){
        x += po.X;
        y += po.Y
    }
    return new Point(x,y);
}

export const WHITEBOARD_ELEM_KEY: Symbol = Symbol();

export const WHITEBOARD_PATHS_KEY: Symbol = Symbol();
