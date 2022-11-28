<script lang="ts">
import { WHITEBOARD_PATHS_KEY } from "./types"
import { getContext } from "svelte";
import { current_component } from "svelte/internal";

let con: any = getContext(WHITEBOARD_PATHS_KEY);
if(con != null){
    con.registerPath(current_component);
}else{
    throw "Path context was null! This module may only be used with the Whiteboard Component!";
}

export let drawPath: () => Path2D;



</script>

<svelte:options accessors/>