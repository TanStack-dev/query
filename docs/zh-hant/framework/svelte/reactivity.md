---
source-updated-at: '2024-08-19T12:20:53.000Z'
translation-updated-at: '2025-05-08T20:15:22.292Z'
id: reactivity
title: 響應式
---

Svelte 使用編譯器來構建你的程式碼，以優化渲染效能。預設情況下，元件只會執行一次，除非它們在標記中被引用。為了能夠對選項的變更做出反應，你需要使用[儲存 (stores)](https://svelte.dev/docs/svelte-store)。

在以下範例中，`refetchInterval` 選項是從變數 `intervalMs` 設定的，而 `intervalMs` 與輸入欄位綁定。然而，由於查詢無法對 `intervalMs` 的變更做出反應，當輸入值變更時，`refetchInterval` 並不會隨之改變。

```svelte
<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'

  const endpoint = 'http://localhost:5173/api/data'

  let intervalMs = 1000

  const query = createQuery({
    queryKey: ['refetch'],
    queryFn: async () => await fetch(endpoint).then((r) => r.json()),
    refetchInterval: intervalMs,
  })
</script>

<input type="number" bind:value={intervalMs} />
```

為了解決這個問題，我們可以將 `intervalMs` 轉換為一個可寫儲存 (writable store)。然後，查詢選項可以被轉換為一個衍生儲存 (derived store)，這樣就能以真正的反應性 (reactivity) 傳遞給函式。

```svelte
<script lang="ts">
  import { derived, writable } from 'svelte/store'
  import { createQuery } from '@tanstack/svelte-query'

  const endpoint = 'http://localhost:5173/api/data'

  const intervalMs = writable(1000)

  const query = createQuery(
    derived(intervalMs, ($intervalMs) => ({
      queryKey: ['refetch'],
      queryFn: async () => await fetch(endpoint).then((r) => r.json()),
      refetchInterval: $intervalMs,
    })),
  )
</script>

<input type="number" bind:value={$intervalMs} />
```
