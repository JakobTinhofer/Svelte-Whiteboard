<script lang="ts">
import Point from "./Point";
import { WHITEBOARD_ELEM_KEY } from "./constants"
import { getContext, onDestroy, createEventDispatcher } from "svelte";
import type Whiteboard from "./Whiteboard.svelte";
import type ElementType from "./ElementType";

onDestroy(() => {
    con.removeElem(this);
})

export let Position: Point = new Point(0,0);


const current_component = arguments[0]

export let movable: boolean = true;
export let selectable: boolean = true;

export let isMoving: boolean = false;
export let isSelected: boolean = false;



export function rerender(){
    PosRel = board.boardToRelative(Position);
}

let container;
let con: any = getContext(WHITEBOARD_ELEM_KEY);
let board : Whiteboard;
let type : ElementType;
if(con != null){
    board = con.getBoard();
    type = con.type; 
    con.registerElem(current_component);
}else{
    throw "Element context was null! This module may only be used with the Whiteboard Component!";
}

let PosRel : Point = new Point(5,5);

$: if(Position && board && container){
    rerender();    
}


//#region Element Behavior
let waitingForMouseUp = false;
let dragOffset : Point;
function mouseUp(ev) {
    isMoving = false;
    dragOffset = null;
    if(selectable && waitingForMouseUp){
        // This is now selected
        board.setSelectedElement(current_component);
    }
}

function mouseDown(ev) {
    if(movable && ev.which == 1){
        isMoving = true;
        dragOffset = board.screenToBoard(new Point(ev.clientX, ev.clientY)).add(Position.neg());
    }
    if(selectable && ev.which == 1){
        waitingForMouseUp = true;
        setTimeout(() => {waitingForMouseUp = false}, 200);
    }
}

function mouseMoved(ev) {
    if(isMoving){
        Position = board.screenToBoard(new Point(ev.clientX, ev.clientY)).add(dragOffset.neg()); 
    }
}
//#endregion


</script>
<svelte:options accessors/>

<style>
    #container{
        pointer-events: all;
    }

</style>

<svelte:window on:mouseup={mouseUp} on:mousemove={mouseMoved}/>

{#if type.container == "g"}
    <g id="container" class:we-selected="{isSelected}" on:mousedown={mouseDown} transform="translate({Position.X}, {Position.Y})" bind:this={container} style="{type.style}"><slot></slot></g>
{:else}
    <div id="container" class:we-selected="{isSelected}" on:mousedown={mouseDown} bind:this={container} style="{type.style} left: {PosRel.X}px; top: {PosRel.Y}px;"><slot></slot></div>
{/if}

