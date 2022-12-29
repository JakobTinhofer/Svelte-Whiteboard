<script lang="ts">
import Point from "./Point";
import { WHITEBOARD_ELEM_KEY } from "./constants"
import { getContext, onDestroy, onMount } from "svelte";
import type Whiteboard from "./Whiteboard.svelte";
import type ElementType from "./ElementType";
import { prevent_default } from "svelte/internal";
import { createEventDispatcher } from 'svelte';

const dispatch = createEventDispatcher();

onDestroy(() => {
    con.removeEventListener("pointermove", pointerMoved)
    
    con.removeEventListener("pointerup", pointerUp)
    con.removeEventListener("pointercancel", pointerUp)
    con.removeEventListener("pointerleave", pointerUp)

    con.removeElem(this);


})

// Equivalent to current_component from the svelte module, but somehow works better
const current_component = arguments[0]


// This is the current board position of this element
export let Position: Point = new Point(0,0);
// This the coordinate in the whiteboard container (similar to screen coordinates but from the view of the container)
let PosRel : Point = new Point(5,5);

// Can be moved through drag and drop
export let movable: boolean = true;
// Can be selected by clicking
export let selectable: boolean = true;

// Is being draged currently
export let isMoving: boolean = false;
// Is currently selected
export let isSelected: boolean = false;

$: if(isSelected){
    dispatch("selected", {Elem: current_component})
}

/**
 * This feels like a not-good hack, optimization needed!
*/
export function rerender(){
    PosRel = board.boardToRelative(Position);
}


// The container containing the WhiteboardElement content
let container: Element;

// The context given by the whiteboard
let con: any = getContext(WHITEBOARD_ELEM_KEY);

// The parent whiteboard, as retrieved through the context
let board : Whiteboard;

// The type of this element (svg/html), see ElementType.ts
let type : ElementType;

//#region Initialization & Context retrieval
if(con != null){
    board = con.getBoard();
    type = con.type; 
    con.registerElem(current_component);
}else{
    throw "Element context was null! This module may only be used with the Whiteboard Component!";
}

onMount(() => {
    con.addEventListener("pointermove", pointerMoved)
    con.addEventListener("pointerup", pointerUp)
    con.addEventListener("pointercancel", pointerUp)
    con.addEventListener("pointerleave", pointerUp)
})
//#endregion


// If the position changes and board + container have been initialized, rerender the thing plz
$: if(Position && board && container){
    rerender();    
}


//#region Element Behavior
// This is set when this element is clicked and is true for 0.2s. If a pointerup event is received in that time, the action is handled as a select action.
let waitingForMouseUp = false;

// Where in the component the drag started 
let dragOffset : Point;

/**
 * Handles pointer up, canceling the current action or triggering a selection (if the pointerdown event was less than 0.2 s ago)
 * @param ev
 */
function pointerUp(ev) {

    // Don't know if this is actually required
    if(board.isPanning){
        ev.preventDefault();
        return;
    }
    
    isMoving = false;
    dragOffset = null;
    if(selectable && waitingForMouseUp && !isSelected){
        // This is now selected, but the actual selection must be done by the whiteboard. Moving this out to the Whiteboard component might be a good idea?
        board.setSelectedElement(current_component);
    }

}

/**
 * This handler handles all pointer down events, initiating draging or selecting
 */
function pointerDown(ev) {
    if(movable && ev.which == 1){
        isMoving = true;
        dragOffset = board.screenToBoard(new Point(ev.clientX, ev.clientY)).add(Position.neg());
        
        ev.stopPropagation()
    }
    if(selectable && ev.which == 1){
        waitingForMouseUp = true;
        // If the mouse button is released in less than 0.2 s, it is considered a select
        setTimeout(() => {waitingForMouseUp = false}, 200);
        ev.stopPropagation()
    }
}

/**
 * Handles pointer movement, moves the element
*/
function pointerMoved(ev) {
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
        white-space: nowrap;
    }

</style>


{#if type.container == "g"}
    <g id="container" class:we-selected="{isSelected}" class:we-moving="{isMoving}" on:pointerdown={pointerDown} transform="translate({Position.X}, {Position.Y})" bind:this={container} style="{type.style}"><slot></slot></g>
{:else}
    <div id="container"  class:we-selected="{isSelected}" class:we-moving="{isMoving}" on:pointerdown={pointerDown} bind:this={container} style="{type.style} left: {PosRel.X}px; top: {PosRel.Y}px;"><slot></slot></div>
{/if}

