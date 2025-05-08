---
source-updated-at: '2025-04-10T12:03:08.000Z'
translation-updated-at: '2025-05-08T20:19:06.924Z'
id: disabling-queries
title: 停用/暫停查詢
---

若想阻止查詢 (query) 自動執行，可以使用 `enabled = false` 選項。`enabled` 選項也接受回調函式來返回布林值。

當 `enabled` 設為 `false` 時：

- 若查詢有快取資料，則會以 `status === 'success'` 或 `isSuccess` 狀態初始化。
- 若查詢無快取資料，則會以 `status === 'pending'` 和 `fetchStatus === 'idle'` 狀態開始。
- 查詢不會在掛載時自動執行。
- 查詢不會在背景自動重新取得資料。
- 查詢會忽略查詢客戶端 (query client) 的 `invalidateQueries` 和 `refetchQueries` 呼叫（這些呼叫通常會觸發查詢重新取得資料）。
- 從 `useQuery` 返回的 `refetch` 可用於手動觸發查詢，但與 `skipToken` 併用時會失效。

> TypeScript 使用者可改用 [skipToken](#typesafe-disabling-of-queries-using-skiptoken) 來替代 `enabled = false`。

```vue
<script setup>
import { useQuery } from '@tanstack/vue-query'

const { isLoading, isError, data, error, refetch, isFetching } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodoList,
  enabled: false,
})
</script>

<template>
  <button @click="refetch()">Fetch Todos</button>
  <span v-if="isLoading">Loading...</span>
  <span v-else-if="isError">Error: {{ error?.message }}</span>
  <div v-else-if="data">
    <span v-if="isFetching">Fetching...</span>
    <ul>
      <li v-for="todo in data" :key="todo.id">{{ todo.title }}</li>
    </ul>
  </div>
  <span v-else>Not ready...</span>
</template>
```

永久停用查詢會導致無法使用 TanStack Query 的許多強大功能（例如背景重新取得資料），這也不是慣用做法。此做法會讓你從宣告式模式（定義查詢執行時機的依賴條件）轉為命令式模式（點擊按鈕時才取得資料），且無法傳遞參數給 `refetch`。通常你需要的只是一個延遲初始執行的「惰性查詢 (lazy query)」：

## 惰性查詢 (Lazy Queries)

`enabled` 選項不僅能永久停用查詢，還可動態啟用/停用。典型範例是篩選表單——僅在使用者輸入篩選值後才發送首次請求：

```vue
<script setup>
import { useQuery } from '@tanstack/vue-query'

const filter = ref('')
const isEnabled = computed(() => !!filter.value)
const { data } = useQuery({
  queryKey: ['todos', filter],
  queryFn: () => fetchTodos(filter),
  // ⬇️ 篩選值為空時停用查詢
  enabled: isEnabled,
})
</script>

<template>
  <span v-if="data">Filter was set and data is here!</span>
</template>
```

### isLoading (原為 `isInitialLoading`)

惰性查詢會從一開始就處於 `status: 'pending'` 狀態，因為 `pending` 表示尚未取得資料。雖然技術上正確，但由於此時並未實際取得資料（查詢未被 _啟用_），因此不適合用此標誌來顯示載入指示器。

若使用停用或惰性查詢，可改用 `isLoading` 標誌。這是個衍生標誌，由以下條件計算得出：

`isPending && isFetching`

因此僅在查詢首次執行時會返回 `true`。

## 使用 `skipToken` 實現類型安全的查詢停用

若使用 TypeScript，可用 `skipToken` 停用查詢。這適用於需基於條件停用查詢，同時保持類型安全的情況。

> 重要：`useQuery` 的 `refetch` 方法與 `skipToken` 併用時會失效。除此之外，`skipToken` 的行為與 `enabled: false` 相同。

```vue
<script setup>
import { useQuery, skipToken } from '@tanstack/vue-query'

const filter = ref('')
const queryFn = computed(() =>
  !!filter.value ? () => fetchTodos(filter) : skipToken,
)
const { data } = useQuery({
  queryKey: ['todos', filter],
  // ⬇️ 篩選值為空或未定義時停用查詢
  queryFn: queryFn,
})
</script>

<template>
  <span v-if="data">Filter was set and data is here!</span>
</template>
```
