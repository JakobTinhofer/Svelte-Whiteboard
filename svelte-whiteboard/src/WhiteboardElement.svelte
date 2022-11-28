<script lang="ts">
import { Point } from "./types";
import type Path from "./Path.svelte";
import { WHITEBOARD_ELEM_KEY, WHITEBOARD_PATHS_KEY } from "./types"
import { getContext } from "svelte";
import { current_component } from "svelte/internal";
import { setContext } from "svelte";


export let moveTo: (p: Point) => void = null;

export let Position: Point = new Point(0,0);

export function GetPaths(): Path2D{
    if(paths.length == 0){
        return null;
    }else{
        var rp = new Path2D();
        paths.forEach((p) => {
            if(p.drawPath!= null){
                rp.addPath(p.drawPath());
            }
        })
        return rp;
    }
}

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

let paths: Array<Path> = new Array<Path>()
setContext(WHITEBOARD_PATHS_KEY, {
    registerPath(p: Path){
        paths.push(p);
    }
})


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
