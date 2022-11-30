<script lang="ts">
import Point from "./Point";
import { WHITEBOARD_ELEM_KEY } from "./constants"
import { getContext, onDestroy, createEventDispatcher } from "svelte";
import { current_component } from "svelte/internal";
import type Whiteboard from "./Whiteboard.svelte";
import type ElementType from "./ElementType";

const dispatch = createEventDispatcher();

onDestroy(() => {
    con.removeElem(this);
})

export let Position: Point = new Point(0,0);

let x;
let y;


export let movable: boolean = true;
export let selectable: boolean = true;

export let isMoving: boolean = false;
export let isSelected: boolean = false;



export function rerender(){
    PosRel = board.boardToRelative(Position);
    console.log("Updated relative position");
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

function allowedEvents(node: Element){
    
}

</script>
<svelte:options accessors/>

<style>
    #container{
        pointer-events: all;
    }

</style>

{#if type.container == "g"}
    <g id="container" use:allowedEvents transform="translate({Position.X}, {Position.Y})" bind:this={container} style="{type.style}"><slot></slot></g>
{:else}
    <div id="container" use:allowedEvents bind:this={container} style="{type.style} left: {PosRel.X}px; top: {PosRel.Y}px;"><slot></slot></div>
{/if}

