<script lang="ts">
import {setContext, getContext} from "svelte";


export let Key : Symbol;
export let Context : any = null;
export let Overwrite = false;

$: if(Key){
    const con = getContext(Key);
		if(!Overwrite){
				for(const [key, value] of Object.entries(con)){
					Context[key] = value;
				}
				setContext(Key, con);
		}
    setContext(Key, Context);
}

</script>


<slot>
</slot>