<script lang="ts">
import Point from "./Point";
import { WHITEBOARD_ELEM_KEY } from "./constants"
import { getContext, onDestroy } from "svelte";
import { current_component } from "svelte/internal";

onDestroy(() => {
    con.removeElem(this);
})

export let moveTo: (p: Point) => void = null;

export let Position: Point = new Point(0,0);


let container;
let con: any = getContext(WHITEBOARD_ELEM_KEY);
if(con != null){
    con.registerElem(current_component);
    moveTo = (p: Point) => { 
        if(p){
            let re = con.moveTo(p);
            if(re){
                console.log("Moving to screen " + re)
                container.style.left = re.X + "px";
                container.style.top = re.Y + "px";
            }
        }
    };
}else{
    throw "Element context was null! This module may only be used with the Whiteboard Component!";
}

$: if(moveTo && container){moveTo(Position)}

</script>
<svelte:options accessors/>

<style>
    div{
        width: fit-content;
        height: fit-content;
        position: absolute;
    }

</style>

<div bind:this="{container}">
    <slot>
    </slot>
</div>
