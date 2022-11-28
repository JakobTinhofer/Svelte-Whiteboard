<script lang="ts">
import type { Point } from "./types";
import { WHITEBOARD_ELEM_KEY } from "./types"
import { getContext } from "svelte";
import { current_component } from "svelte/internal";


export let drawMe : (context, start) => void;
export let events : string[] = [];
export let onEvent : (ev) => void = undefined;
export let CanvasPosition: Point;

let con: any = getContext(WHITEBOARD_ELEM_KEY);
if(con != null){
    con.registerPath(current_component);
}else{
    throw "Path context was null! This module may only be used with the Whiteboard Component!";
}



</script>

<svelte:options accessors/>
<div data-canvasPosition={CanvasPosition.toString()} />