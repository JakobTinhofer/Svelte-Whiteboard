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
            whiteboard.BoardFocus = whiteboard.BoardFocus.add(new Point(ev.clientX, ev.clientY).add(panOrigin.neg()).div(-whiteboard.BoardZoom));
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
        var scale = whiteboard.BoardZoom;
        scale += ev.deltaY * -0.001;

        // Restrict scale
        scale = Math.min(Math.max(.125, scale), 4);
        whiteboard.BoardZoom = scale;
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
<svelte:window on:mousemove={doDrag} on:mouseup={endDrag} on:mousedown={startPan} on:wheel={windowScroll}></svelte:window>
<div>
    <span>Board Focus: {whiteboard ? whiteboard.BoardFocus : "undefined"}</span>
    <span>Pan Origin: {panOrigin ? panOrigin: "none"}</span>
    <span>Mouse Position (Board): {mousePos ? mousePos: "undefined"}</span>
    <span>Scale: {whiteboard? whiteboard.BoardZoom : "undefined"}</span>
</div>
<Whiteboard bind:this={whiteboard}>
    <WhiteboardElement bind:this="{test}">
        <div on:mousedown={startDrag}>
            <p>Hi</p>
            <input bind:value={newPos} type="text" name="pos">
            <button on:click={moveElem}>Move!</button>
            
        </div>
    </WhiteboardElement>
    <svelte:fragment slot="paths">
        <polygon fill=red stroke-width=0 points="0,10 20,10 10,0" />
    </svelte:fragment>
</Whiteboard>
