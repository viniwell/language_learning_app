<script lang="ts">
    import "$lib/components/Test.svelte"
    import Test from "$lib/components/Test.svelte";
    const { children } = $props();

</script>

<Test name="Sasha"/>
{@render children()}