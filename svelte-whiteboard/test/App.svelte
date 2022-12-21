<script lang="ts">
    import {Whiteboard, WhiteboardElement, Point} from "../src/index";

    let whiteboard: Whiteboard;
    let test: WhiteboardElement;
    
    let pos = null;
</script>

<style>
    div{
        background-color: black;
        display: inline-block;
        color: aliceblue;
        z-index: 10;
    }
</style>
<svelte:window/>
<div>
    <span>Board Focus: {whiteboard ? whiteboard.BoardFocus : "undefined"}</span>
    <span>Mouse Position (Board): {pos}</span>
    <span>Scale: {whiteboard? whiteboard.BoardZoom : "undefined"}</span>
</div>
<Whiteboard bind:this={whiteboard} bind:MousePosition={pos}>
    <WhiteboardElement >
        <div >
            <p>Hi how are you on this nice summer day</p>
        </div>
    </WhiteboardElement>
    <svelte:fragment slot="paths">
        <WhiteboardElement bind:this="{test}">
            <polygon fill=red stroke-width=0 points="0,10 20,10 10,0" />
        </WhiteboardElement>
    </svelte:fragment>
</Whiteboard>
