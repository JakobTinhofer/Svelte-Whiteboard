import type { WhiteboardElement } from ".";
import type Point from "./Point"

export default class ElementType{
    public style: string;
    public positionAbsolute: boolean;
    public moveTo: (elem: Element, p: Point) => void;
    public container: string

    constructor(style: string, posAbsolute: boolean, move: (elem: Element, p:Point) => void, container: string){
        this.style = style;
        this.positionAbsolute = posAbsolute;
        this.moveTo = move;
        this.container = container;
    }
}

