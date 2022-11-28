<script lang="ts">
    import { setContext } from "svelte";
    import type Path from "./Path.svelte";
    import { WHITEBOARD_ELEM_KEY } from "./types";

    let paths: Path[] = []
    let container;
    let content_holder;
    let preview_canvas;
    let main_canvas;

    setContext(WHITEBOARD_ELEM_KEY, {
        registerPath(path: Path){
            paths.push(path);
        }
    });

    function onWhiteboardResized(entries: ResizeObserverEntry[]): void{

    }
    
    let observer = new ResizeObserver(onWhiteboardResized);
    observer.observe(container);

</script>

<style>

#main_canvas{
    background-color: rgba(43, 167, 167, 0.2);
}

#preview_canvas{
    background-color: rgba(187, 23, 23, 0.2);
}

#content_holder{
    background-color: rgba(172, 255, 47, 0.2);
}

</style>


<div bind:this={container}>
    <div bind:this={content_holder} id="content_holder">
        <slot>
        </slot>
    </div>
    <canvas bind:this={preview_canvas} id="preview_canvas"></canvas>
    <canvas bind:this={main_canvas} id="main_canvas"></canvas>
</div>
