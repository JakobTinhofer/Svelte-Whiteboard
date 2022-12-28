export default class Point{
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
        return Point.AggregatePoints(this, ...points);
    }

    public mult(fact: number): Point{
        return new Point(this._x * fact, this._y * fact);
    }

    public div(div: number): Point{
        return new Point(this._x / div, this._y / div);
    }

    public len(): number{
        return Math.sqrt(Math.pow(this._x, 2) + Math.pow(this._y, 2))
    }

    public dist(p2: Point): number{
        return Point.Distance(this, p2);
    }

    public static fromString(str: string): Point{
        var strs = str.replace("(", "").replace(")", "").split("|");
        return new Point(Number(strs[0]), Number(strs[1]));
    }
    
    public static fromRect(rect:any){
        return new Point(rect.left, rect.top);
    }
    
    public static OffsetPoint(p: Point, x, y): Point {
        return new Point(p.X + x, p.Y + y);
    }
    
    public static AggregatePoints(...p: Point[]): Point{
        var x : number = 0;
        var y : number = 0;
        for(var po of p){
            x += po.X;
            y += po.Y
        }
        return new Point(x,y);
    }

    public static Distance(p1: Point, p2: Point): number{
        return (p1.add(p2.neg())).len()
    }
}