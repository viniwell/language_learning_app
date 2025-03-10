<script>
    const { data } = $props();
</script>

<h1>{JSON.stringify(data.user, null, 2)}</h1>