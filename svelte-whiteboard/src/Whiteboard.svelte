<script lang="ts">
    import { setContext } from "svelte";
    import {WHITEBOARD_ELEM_KEY, PathElement, HTMLElement } from "./constants";
    import Point from "./Point";
    import { onMount } from "svelte";
    import WhiteboardElement from "./WhiteboardElement.svelte";
    import Context from "./Context.svelte";
    import { current_component } from "svelte/internal";
    import SmoothNumber from "./SmoothNumber"
    
    
    
    //#region DOM-Binds
    
    let container;
    let content_holder;

    //#endregion

    const board = current_component;
    //#region Element Collection & Context
    let elems: Array<WhiteboardElement> = new Array<WhiteboardElement>();
    setContext(WHITEBOARD_ELEM_KEY, {
        registerElem(elem: WhiteboardElement){
            elems.push(elem);
        },
        getBoard() { return board; },
        removeElem(elem: WhiteboardElement){
            const delInd = elems.indexOf(elem);
            if(delInd > 0){
                elems.splice(delInd, 1)
            }
        },
        addEventListener(event: string, handler){
            if(container){
                container.addEventListener(event, handler);
            }
        },
        removeEventListener(event: string, handler){
            if(container){
                container.removeEventListener(event, handler);
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
    
    /**
     * This is the point (in board coordinates) that is in the center of the shown screen
     */
    export let BoardFocus: Point = new Point(0,0);
    
    // Re-render whenever the focus or zoom changes
    $: if(BoardFocus && container && BoardZoom) {
        render();
    }

    /**
     * Set this in order to change the zoom factor. All elements and paths will be scaled accordingly
     */
    export let BoardZoom: number = 1.0;

    /**
     * Use this to smooth out the changes in zoom.
     */
    export const BoardZoomSmooth = new SmoothNumber(BoardZoom, 1.5, false, (c: number) => {BoardZoom = c;})


    /**
     * Returns the dimensions of the container (in screen px)
     * @return {[DOMRect]} the bounding client rect of the container.
     */
    export function getDimensions(): any{
        return container.getBoundingClientRect();
    }

    //#region Point Converters

    /**
     * Gets the board coordinates for a given point on the screen.
     * @param point The point on the screen, i.e. the position of the mouse cursor
     * @return The point on the board.
     */
    export function screenToBoard(point: Point): Point{
        if(container){
            var cRect = container.getBoundingClientRect();
            return new Point((point.X  - cRect.left - (cRect.width / 2) + BoardFocus.X * BoardZoom) / BoardZoom, (point.Y  - cRect.top - (cRect.height / 2) + BoardFocus.Y * BoardZoom) / BoardZoom);
        }
        else{
            throw "Cannot calculate point offset since container not yet available!";
        }
    }

    /**
     * Converts a board position to the top and left coordinates for the whiteboard container.
     * @param point the point in board coordinates
     * @return A point where X is the left offset from the container and Y the top offset.
     */
    export function boardToRelative(point: Point): Point{
        if(container){
            var cRect = container.getBoundingClientRect();
            return new Point((point.X * BoardZoom - (BoardFocus.X * BoardZoom) + (cRect.width / 2)), (point.Y * BoardZoom - (BoardFocus.Y * BoardZoom) + (cRect.height / 2)));
        }
        else{
            throw "Cannot calculate point offset since container not yet available!";
        }
    }
    //#endregion

    //#region Rendering

    /**
     * Re-renders the current view
     */
    export function render(){
        // Moves every element to its current position, in case it isn't
        elems.forEach((elem) => {
            elem.rerender();
        })

        const sscRect = container.getBoundingClientRect();
        
        // How many board units is the current view in width (x) and height (y)
        const scaledDimensions = new Point(sscRect.width, sscRect.height).div(BoardZoom);
        
        // The top left board coordinate of the current view
        const minPoint = BoardFocus.add(scaledDimensions.mult(-0.5))
        
        // Creates the svg viewbox
        svg_viewbox = minPoint.X + " " + minPoint.Y + " " + scaledDimensions.X + " " + scaledDimensions.Y;
        
        // The background grid needs to repeat every 10 board units, the offset makes sure that 0,0 is a point where the grid lines cross
        bg_offset = "" + ((-(BoardFocus.X * BoardZoom ) + sscRect.width/2) % (10 * BoardZoom))  + "px " + ((-(BoardFocus.Y * BoardZoom) + sscRect.height/2) % (10 * BoardZoom)) + "px";
        
        // The grid is always 10 board units apart, but the screen size differs
        bg_size = "" + 10 * BoardZoom + "px " + 10 * BoardZoom + "px";
        
        // This css var is responsible for scaling the html elements
        document.documentElement.style.setProperty("--boardZoom", "" + BoardZoom);
    }
    //#endregion

    //#region Moving

    /**
     * Handles moving, currently only calculates the absolute position to move to 
     * @param p The new board position of the element
     * @return The new top and left offset for the element
     */
    function moveTo(p: Point): Point{
        return boardToRelative(p);
    }
    //#endregion

    //#region Selection

    let selectedElem : WhiteboardElement = null;
    export function setSelectedElement(elem: WhiteboardElement ){
        if(elem == null || elem.selectable){
            if(selectedElem != null){
                selectedElem.isSelected = false;
            }
            if(elem != null){
                elem.isSelected = true;
            }
            selectedElem = elem;
        }
    }

    //#endregion


    //#region Board Behavior

    export let canPan = true;
    export let canZoom = true;

    export let isPanning = false;

    export let MousePosition: Point = new Point(0,0);

    let panOrigin: Point = null;


    const pointerCache = [];
    let prevDelta = -1;
    let prevCenterPoint: Point = null;
    function containerPointerDown(ev){
        if(canPan && ev.which == 2){
            isPanning = true;
            panOrigin = new Point(ev.clientX, ev.clientY)
        }
        if(ev.which == 1){
            pointerCache.push(ev)
        }
    }

    function containerPointerUp(ev){
        console.log("POINTER UP: " + ev.type)
        console.log(ev)
        isPanning = false;
        panOrigin = null;

        // Remove this event from the target's cache
        const index = pointerCache.findIndex((cachedEv) => cachedEv.pointerId === ev.pointerId);
        pointerCache.splice(index, 1);

        prevDelta = -1;
        prevCenterPoint = null;
    }

    function containerPointerMove(ev){
        if(isPanning){
            BoardFocus = BoardFocus.add(new Point(ev.clientX, ev.clientY).add(panOrigin.neg()).div(-BoardZoom));
            panOrigin = new Point(ev.clientX, ev.clientY);
        }

        // If two pointers are down, check for pinch gestures
        if (pointerCache.length === 2) {
            // Find this event in the cache and update its record with this event
            const index = pointerCache.findIndex((cachedEv) => cachedEv.pointerId === ev.pointerId);
            pointerCache[index] = ev;


            // Calculate the distance between the two pointers
            const p1 = new Point(pointerCache[0].clientX, pointerCache[0].clientY)
            const p2 = new Point(pointerCache[1].clientX, pointerCache[1].clientY)

            const currCenterPoint = p1.add(p2.add(p1.neg()).div(2))

            const curDiff = p1.dist(p2);

            let centerDist = null;

            if(canPan && prevCenterPoint != null){
                centerDist = prevCenterPoint.add(currCenterPoint.neg())
                BoardFocus = BoardFocus.add(centerDist.div(BoardZoom));
            }



            const zoomMag = curDiff - prevDelta;

            if (canZoom && prevDelta > 0 && (!(canPan && prevCenterPoint) || Math.abs(zoomMag) * 2 > centerDist.len())) {
                
                var scale = BoardZoom;
                scale += zoomMag * 0.05;

                // Restrict scale
                scale = Math.min(Math.max(.125, scale), 4);
                BoardZoomSmooth.set(scale);
            }

            
            prevDelta = curDiff;
            prevCenterPoint = currCenterPoint;
        }
        MousePosition = screenToBoard(new Point(ev.clientX, ev.clientY));
    }

    function containerWheel(ev){
        ev.preventDefault();


        if(canZoom && ev.ctrlKey){    
            var scale = BoardZoom;
            scale += (ev.deltaY / Math.abs(ev.deltaY) ) * -0.1;

            // Restrict scale
            scale = Math.min(Math.max(.125, scale), 4);
            BoardZoomSmooth.set(scale);
        }
        if(canPan && !ev.ctrlKey && !isPanning){
            BoardFocus = BoardFocus.add(new Point(ev.deltaX, ev.deltaY))
        }
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
    --boardZoom: 1;
}


#container{
    position: relative;
    touch-action: none;
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
    transform: scale(var(--boardZoom));
    transform-origin: top left;
}
</style>
<svelte:options accessors/>

<div id="container" on:pointerdown={containerPointerDown}
                    on:pointermove={containerPointerMove}
                    on:wheel|nonpassive={containerWheel}
                    on:pointerup={containerPointerUp}
                    on:pointercancel={containerPointerUp}
                    on:pointerleave={containerPointerUp}
                    on:pointerout={containerPointerUp}  bind:this={container} style="background-position: {bg_offset}; background-size: {bg_size};">
    <div bind:this={content_holder} id="content_holder">
        <Context Key={WHITEBOARD_ELEM_KEY} Context={{type: HTMLElement}}>
            <slot {WhiteboardElement}>
            </slot>
        </Context>
    </div>
    <Context Key={WHITEBOARD_ELEM_KEY} Context={{type: PathElement}}>
        <svg viewBox="{svg_viewbox}" xmlns="http://www.w3.org/2000/svg">    
            <slot name="paths" {WhiteboardElement}>
            </slot>
        </svg>
    </Context>
</div>
