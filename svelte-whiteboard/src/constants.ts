import type { WhiteboardElement } from ".";
import ElementType from "./ElementType";
import type Point from "./Point";

export const WHITEBOARD_ELEM_KEY: Symbol = Symbol();




function moveSvg(elem: Element, p: Point){
    elem.setAttribute("x", p.X + "");
    elem.setAttribute("y", p.Y + "");
}

function moveHtml(elem: Element, p: Point){
    (<HTMLElement>elem).style.left = p.X + "px";
    (<HTMLElement>elem).style.top = p.Y + "px";
}

export const PathElement = new ElementType("", true, moveSvg, "g");
export const HTMLElement = new ElementType("width: fit-content; height: fit-content; position: absolute;", false, moveHtml, "div");