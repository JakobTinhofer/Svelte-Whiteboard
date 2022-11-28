export class Point {
    public X: Number
    public Y: Number

    constructor(x: number, y: number){
        this.X = x;
        this.Y = y;
    }
    

    public toString() : string {
        return "(" + this.X + "|" + this.Y + ")";
    }
}

function p(str: string): Point{
    var strs = str.replace("(", "").replace(")", "").split("|");
    return new Point(Number(strs[0]), Number(strs[1]));
}



export const WHITEBOARD_ELEM_KEY: Symbol = Symbol();