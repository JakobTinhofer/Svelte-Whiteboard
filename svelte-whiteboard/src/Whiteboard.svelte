<script lang="ts">
    import { setContext } from "svelte";
    import type Path from "./Path.svelte";
    import { Point, WHITEBOARD_ELEM_KEY, p, rect2p } from "./types";
    import { onMount } from "svelte";
    import type WhiteboardElement from "./WhiteboardElement.svelte";

    
    
    //#region DOM-Binds
    
    let container;
    let content_holder;
    let preview_canvas;
    let main_canvas;

    //#endregion


    //#region Element Collection & Context
    let elems: Array<WhiteboardElement> = new Array<WhiteboardElement>();
    setContext(WHITEBOARD_ELEM_KEY, {
        registerElem(elem: WhiteboardElement){
            elems.push(elem);
        },
        moveTo
    });
    //#endregion

    //#region Auto-Resize
    function onWhiteboardResized(entries: ResizeObserverEntry[]): void{
        var cRect = container.getBoundingClientRect()
        let canvasses = [preview_canvas, main_canvas];
        canvasses.forEach((canvas) => {
            canvas.width = cRect.width;
            canvas.height = cRect.height;
        });

        render();
    }
    
    var observer = new ResizeObserver(onWhiteboardResized);
    onMount(() => {
        
        observer.observe(container);
        onWhiteboardResized(null);
        
    });
    //#endregion
    
    var bg_offset = "0px 0px"
    export let CanvasFocus: Point = new Point(0,0);
    $: if(CanvasFocus && container) {
        render();
    }
    
    export let CanvasZoom: number = 1.0;

    export function getDimensions(): any{
        return container.getBoundingClientRect();
    }

    //#region Point Converters
    export function screenToBoard(point: Point): Point{
        if(container){
            var cRect = container.getBoundingClientRect();
            return new Point((point.X - cRect.left - (cRect.width / 2) + CanvasFocus.X) / CanvasZoom, (point.Y - cRect.top - (cRect.height / 2) + CanvasFocus.Y) / CanvasZoom);
        }
        else{
            throw "Cannot calculate point offset since container not yet available!";
        }
    }

    export function boardToCanvas(point: Point): Point{
        if(container){
            var cRect = container.getBoundingClientRect();
            return new Point((point.X - CanvasFocus.X + (cRect.width / 2)) * CanvasZoom, (point.Y - CanvasFocus.Y + (cRect.height / 2)) * CanvasZoom);
        }
        else{
            throw "Cannot calculate point offset since container not yet available!";
        }
    }
    //#endregion

    //#region Rendering
    export function render(){
        elems.forEach((elem) => {
            elem.moveTo(elem.Position);
            var p = elem.GetPaths();
            if(p){
                
            }
        })

        const sscRect = container.getBoundingClientRect();
        const newPoint = new Point((-CanvasFocus.X + sscRect.width/2) % 10, (-CanvasFocus.Y + sscRect.height/2) % 10)
        bg_offset = "" + newPoint.X * CanvasZoom  + "px " + newPoint.Y * CanvasZoom + "px";
    
        
    }
    //#endregion

    //#region Moving
    function moveTo(p: Point): Point{
        return boardToCanvas(p);
    }
    //#endregion


</script>

<style>

canvas{
    background-color: transparent;
    z-index: 1;
    pointer-events: none;
}

#container{
    position: relative;
    width: 100%;
    height: 100%;
    background-image:
    linear-gradient(to right, rgb(230, 230, 230) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(230, 230, 230) 1px, transparent 1px);
    background-size: 10px 10px;
}

#container > *{
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
}
</style>
<svelte:options accessors/>


<div id="container" bind:this={container} style="background-position: {bg_offset};">
    <div bind:this={content_holder} id="content_holder">
        <slot>
        </slot>
    </div>
    <canvas bind:this={preview_canvas} id="preview_canvas"></canvas>
    <canvas bind:this={main_canvas} id="main_canvas"></canvas>
</div>
