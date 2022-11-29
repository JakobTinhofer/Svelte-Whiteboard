<script lang="ts">
    import { setContext } from "svelte";
    import type Path from "./PathContainer.svelte";
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
        moveTo,
        removeElem(elem: WhiteboardElement){
            const delInd = elems.indexOf(elem);
            if(delInd > 0){
                elems.splice(delInd, 1)
            }
        }
    });
    //#endregion

    //#region Auto-Resize
    function onWhiteboardResized(entries: ResizeObserverEntry[]): void{
        render();
    }
    
    var observer = new ResizeObserver(onWhiteboardResized);
    onMount(() => {
        
        observer.observe(container);
        onWhiteboardResized(null);
        
    });
    //#endregion
    
    var svg_viewbox = "-10 -10 20 20";
    var bg_offset = "0px 0px";
    var bg_size = "10px 10px";
    export let CanvasFocus: Point = new Point(0,0);
    $: if(CanvasFocus && container && CanvasZoom) {
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
            return new Point((point.X  - cRect.left - (cRect.width / 2) + CanvasFocus.X * CanvasZoom) / CanvasZoom, (point.Y  - cRect.top - (cRect.height / 2) + CanvasFocus.Y * CanvasZoom) / CanvasZoom);
        }
        else{
            throw "Cannot calculate point offset since container not yet available!";
        }
    }

    export function boardToCanvas(point: Point): Point{
        if(container){
            var cRect = container.getBoundingClientRect();
            return new Point((point.X * CanvasZoom - (CanvasFocus.X * CanvasZoom) + (cRect.width / 2)), (point.Y * CanvasZoom - (CanvasFocus.Y * CanvasZoom) + (cRect.height / 2)));
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
        })

        const sscRect = container.getBoundingClientRect();
        const scaledDimensions = new Point(sscRect.width, sscRect.height).div(CanvasZoom);
        const minPoint = CanvasFocus.add(scaledDimensions.mult(-0.5))
        svg_viewbox = minPoint.X + " " + minPoint.Y + " " + scaledDimensions.X + " " + scaledDimensions.Y;
        const newPoint = new Point((-(CanvasFocus.X * CanvasZoom ) + sscRect.width/2) % (10 * CanvasZoom), (-(CanvasFocus.Y * CanvasZoom) + sscRect.height/2) % (10 * CanvasZoom))
        bg_offset = "" + newPoint.X  + "px " + newPoint.Y + "px";
        bg_size = "" + 10 * CanvasZoom + "px " + 10 * CanvasZoom + "px";
        document.documentElement.style.setProperty("--canvasZoom", "" + CanvasZoom);
    }
    //#endregion

    //#region Moving
    function moveTo(p: Point): Point{
        return boardToCanvas(p);
    }
    //#endregion


</script>

<style>

svg{
    background-color: transparent;
    z-index: 1;
    pointer-events: none;
}

:root{
    --canvasZoom: 1;
}


#container{
    position: relative;
    width: 100%;
    height: 100%;
    background-image:
    linear-gradient(to right, rgb(230, 230, 230) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(230, 230, 230) 1px, transparent 1px);
}

#container > *{
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
    
}
#content_holder > :global(*){
    transform: scale(var(--canvasZoom));
    transform-origin: top left;
}
</style>
<svelte:options accessors/>


<div id="container" bind:this={container} style="background-position: {bg_offset}; background-size: {bg_size};">
    <div bind:this={content_holder} id="content_holder">
        <slot>
        </slot>
    </div>
    <svg viewBox="{svg_viewbox}">
        <slot name="paths">
        </slot>
    </svg>
</div>
