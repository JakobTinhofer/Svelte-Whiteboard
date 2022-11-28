<script lang="ts">
    import Whiteboard from "../src/index"
    import WhiteboardElement from "../src/WhiteboardElement.svelte";
    import {p, Point} from "../src/types"

    let newPos;
    let whiteboard: Whiteboard;
    let test: WhiteboardElement;
    
    function moveElem(ev){
        var po : Point = p(newPos)
        console.log(po);
        test.moveTo(po)
    }

    let dragOffset: Point;

    function startDrag(ev){
        if(ev.which == 1){
            dragOffset = whiteboard.screenToBoard(new Point(ev.clientX, ev.clientY)).add(test.Position.neg());
        }
    }

    let mousePos: Point;
    function doDrag(ev){
        if(dragOffset){
            test.Position = whiteboard.screenToBoard(new Point(ev.clientX, ev.clientY)).add(dragOffset.neg());
        }else if(panOrigin){
            whiteboard.CanvasFocus = whiteboard.CanvasFocus.add(new Point(ev.clientX, ev.clientY).add(panOrigin.neg()).neg());
            panOrigin = new Point(ev.clientX, ev.clientY);
        }
        mousePos =whiteboard.screenToBoard(new Point(ev.clientX, ev.clientY));
    }

    function endDrag(ev){
        dragOffset = undefined;
        panOrigin = undefined;
    }

    let panOrigin: Point;
    function startPan(ev){
        if(ev.which == 2){
            panOrigin = new Point(ev.clientX, ev.clientY)
        }
        
    }

    function windowScroll(ev){
        var scale = whiteboard.CanvasZoom;
        scale += ev.deltaY * -0.001;

        // Restrict scale
        scale = Math.min(Math.max(.125, scale), 4);
        whiteboard.CanvasZoom = scale;
    }
</script>

<style>
    div{
        background-color: black;
        display: inline-block;
        color: aliceblue;
        z-index: 10;
    }
</style>
<svelte:window on:mousemove={doDrag} on:mouseup={endDrag} on:mousedown={startPan}></svelte:window>
<div>
    <span>Canvas Focus: {whiteboard ? whiteboard.CanvasFocus : "undefined"}</span>
    <span>Pan Origin: {panOrigin ? panOrigin: "none"}</span>
    <span>Mouse Position (Board): {mousePos ? mousePos: "undefined"}</span>
    <span>Scale: {whiteboard? whiteboard.CanvasZoom : "undefined"}</span>
</div>
<Whiteboard bind:this={whiteboard}>
    <WhiteboardElement bind:this="{test}">
        <div on:mousedown={startDrag}>
            <p>Hi</p>
            <input bind:value={newPos} type="text" name="pos">
            <button on:click={moveElem}>Move!</button>
        </div>
    </WhiteboardElement>
</Whiteboard>
