---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-08T20:19:54.070Z'
id: mutations
title: 變更
---

與查詢不同，變異 (mutations) 通常用於建立/更新/刪除資料或執行伺服器副作用 (server side-effects)。為此，TanStack Query 導出了 `useMutation` 鉤子 (hook)。

以下是一個將新待辦事項 (todo) 新增至伺服器的變異範例：

```vue
<script setup>
import { useMutation } from '@tanstack/vue-query'

const { isPending, isError, error, isSuccess, mutate } = useMutation({
  mutationFn: (newTodo) => axios.post('/todos', newTodo),
})

function addTodo() {
  mutate({ id: new Date(), title: 'Do Laundry' })
}
</script>

<template>
  <span v-if="isPending">新增待辦事項中...</span>
  <span v-else-if="isError">發生錯誤：{{ error.message }}</span>
  <span v-else-if="isSuccess">待辦事項已新增！</span>
  <button @click="addTodo">建立待辦事項</button>
</template>
```

在任何時刻，變異只能處於以下其中一種狀態：

- `isIdle` 或 `status === 'idle'` - 變異目前處於閒置或全新/重置狀態
- `isPending` 或 `status === 'pending'` - 變異正在執行中
- `isError` 或 `status === 'error'` - 變異發生錯誤
- `isSuccess` 或 `status === 'success'` - 變異成功且變異資料可供使用

除了這些主要狀態外，根據變異的狀態還可取得更多資訊：

- `error` - 若變異處於 `error` 狀態，可透過 `error` 屬性取得錯誤資訊。
- `data` - 若變異處於 `success` 狀態，可透過 `data` 屬性取得資料。

在上面的範例中，你也看到可以透過呼叫 `mutate` 函式並傳入**單一變數或物件**來將變數傳遞給變異函式。

即使只有變數，變異本身並不特別，但當與 `onSuccess` 選項、[Query Client 的 `invalidateQueries` 方法](../../../reference/QueryClient.md#queryclientinvalidatequeries) 以及 [Query Client 的 `setQueryData` 方法](../../../reference/QueryClient.md#queryclientsetquerydata) 搭配使用時，變異就成為非常強大的工具。

## 重置變異狀態

有時你可能需要清除變異請求的 `error` 或 `data`。為此，你可以使用 `reset` 函式來處理：

```vue
<script>
import { useMutation } from '@tanstack/vue-query'

const { error, mutate, reset } = useMutation({
  mutationFn: (newTodo) => axios.post('/todos', newTodo),
})

function addTodo() {
  mutate({ id: new Date(), title: 'Do Laundry' })
}
</script>

<template>
  <span v-else-if="error">
    <span>發生錯誤：{{ error.message }}</span>
    <button @click="reset">重置錯誤</button>
  </span>
  <button @click="addTodo">建立待辦事項</button>
</template>
```

## 變異副作用

`useMutation` 提供了一些輔助選項，讓你能在變異生命週期的任何階段快速且輕鬆地處理副作用。這些選項對於[變異後使查詢失效並重新擷取](./invalidations-from-mutations.md) 甚至 [樂觀更新 (optimistic updates)](./optimistic-updates.md) 都非常有用：

```tsx
useMutation({
  mutationFn: addTodo,
  onMutate: (variables) => {
    // 變異即將發生！

    // 可選返回包含資料的上下文，用於例如回滾操作
    return { id: 1 }
  },
  onError: (error, variables, context) => {
    // 發生錯誤！
    console.log(`回滾樂觀更新，ID：${context.id}`)
  },
  onSuccess: (data, variables, context) => {
    // 成功！
  },
  onSettled: (data, error, variables, context) => {
    // 無論錯誤或成功...都不重要！
  },
})
```

當在任何回調函式中返回 Promise 時，它會先被等待，然後才會呼叫下一個回調：

```tsx
useMutation({
  mutationFn: addTodo,
  onSuccess: async () => {
    console.log('我是第一個！')
  },
  onSettled: async () => {
    console.log('我是第二個！')
  },
})
```

你可能會發現，除了在 `useMutation` 上定義的回調外，你還想在呼叫 `mutate` 時**觸發額外的回調**。這可以用來觸發元件特定的副作用。為此，你可以在變異變數之後將任何相同的回調選項提供給 `mutate` 函式。支援的選項包括：`onSuccess`、`onError` 和 `onSettled`。請注意，若你的元件在變異完成前卸載，這些額外的回調將不會執行。

```tsx
useMutation({
  mutationFn: addTodo,
  onSuccess: (data, variables, context) => {
    // 我會先觸發
  },
  onError: (error, variables, context) => {
    // 我會先觸發
  },
  onSettled: (data, error, variables, context) => {
    // 我會先觸發
  },
})

mutate(todo, {
  onSuccess: (data, variables, context) => {
    // 我會第二個觸發！
  },
  onError: (error, variables, context) => {
    // 我會第二個觸發！
  },
  onSettled: (data, error, variables, context) => {
    // 我會第二個觸發！
  },
})
```

### 連續變異

在處理連續變異時，`onSuccess`、`onError` 和 `onSettled` 回調的行為略有不同。當傳遞給 `mutate` 函式時，它們只會觸發一次，且僅在元件仍然掛載時。這是因為每次呼叫 `mutate` 函式時，變異觀察者 (mutation observer) 都會被移除並重新訂閱。相反地，`useMutation` 的處理程序會針對每個 `mutate` 呼叫執行。

> 請注意，傳遞給 `useMutation` 的 `mutationFn` 很可能是非同步的。在這種情況下，變異完成的順序可能與 `mutate` 函式呼叫的順序不同。

```tsx
useMutation({
  mutationFn: addTodo,
  onSuccess: (data, variables, context) => {
    // 會被呼叫 3 次
  },
})

const todos = ['待辦事項 1', '待辦事項 2', '待辦事項 3']
todos.forEach((todo) => {
  mutate(todo, {
    onSuccess: (data, variables, context) => {
      // 只會執行一次，針對最後一個變異 (待辦事項 3)，
      // 無論哪個變異先完成
    },
  })
})
```

## Promise

使用 `mutateAsync` 而非 `mutate` 來取得一個會在成功時解析 (resolve) 或在錯誤時拋出 (throw) 的 Promise。這可以用於例如組合副作用。

```tsx
const mutation = useMutation({ mutationFn: addTodo })

try {
  const todo = await mutation.mutateAsync(todo)
  console.log(todo)
} catch (error) {
  console.error(error)
} finally {
  console.log('完成')
}
```

## 重試

預設情況下，TanStack Query 不會在錯誤時重試變異，但可以透過 `retry` 選項啟用：

```tsx
const mutation = useMutation({
  mutationFn: addTodo,
  retry: 3,
})
```

若變異因裝置離線而失敗，它們會在裝置重新連線時以相同的順序重試。

## 持久化變異

若有需要，可以將變異持久化到儲存空間，並在稍後恢復。這可以透過水合 (hydration) 函式實現：

```tsx
const queryClient = new QueryClient()

// 定義 "addTodo" 變異
queryClient.setMutationDefaults(['addTodo'], {
  mutationFn: addTodo,
  onMutate: async (variables) => {
    // 取消目前的待辦事項列表查詢
    await queryClient.cancelQueries({ queryKey: ['todos'] })

    // 建立樂觀待辦事項
    const optimisticTodo = { id: uuid(), title: variables.title }

    // 將樂觀待辦事項新增至待辦事項列表
    queryClient.setQueryData(['todos'], (old) => [...old, optimisticTodo])

    // 返回包含樂觀待辦事項的上下文
    return { optimisticTodo }
  },
  onSuccess: (result, variables, context) => {
    // 將待辦事項列表中的樂觀待辦事項替換為結果
    queryClient.setQueryData(['todos'], (old) =>
      old.map((todo) =>
        todo.id === context.optimisticTodo.id ? result : todo,
      ),
    )
  },
  onError: (error, variables, context) => {
    // 從待辦事項列表中移除樂觀待辦事項
    queryClient.setQueryData(['todos'], (old) =>
      old.filter((todo) => todo.id !== context.optimisticTodo.id),
    )
  },
  retry: 3,
})

// 在某個元件中開始變異：
const mutation = useMutation({ mutationKey: ['addTodo'] })
mutation.mutate({ title: '標題' })

// 若變異因裝置離線等原因暫停，
// 則可以在應用程式退出時將暫停的變異脫水 (dehydrate)：
const state = dehydrate(queryClient)

// 然後可以在應用程式啟動時再次水合 (hydrate) 變異：
hydrate(queryClient, state)

// 恢復暫停的變異：
queryClient.resumePausedMutations()
```

### 持久化離線變異

若你使用 [persistQueryClient 插件](../plugins/persistQueryClient.md) 持久化離線變異，除非你提供預設的變異函式，否則在頁面重新載入時無法恢復變異。

這是一個技術限制。當持久化到外部儲存空間時，只有變異的狀態會被持久化，因為函式無法被序列化。水合後，觸發變異的元件可能尚未掛載，因此呼叫 `resumePausedMutations` 可能會導致錯誤：`找不到 mutationFn`。

```js
const client = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 小時
    },
  },
})

// 我們需要一個預設的變異函式，以便暫停的變異在頁面重新載入後可以恢復
queryClient.setMutationDefaults({
  mutationKey: ['todos'],
  mutationFn: ({ id, data }) => {
    return api.updateTodo(id, data)
  },
})

const vueQueryOptions: VueQueryPluginOptions = {
  queryClient: client,
  clientPersister: (queryClient) => {
    return persistQueryClient({
      queryClient,
      persister: createSyncStoragePersister({ storage: localStorage }),
    })
  },
  clientPersisterOnSuccess: (queryClient) => {
    queryClient.resumePausedMutations()
  },
}

createApp(App).use(VueQueryPlugin, vueQueryOptions).mount('#app')
```

我們還有一個涵蓋查詢和變異的完整 [離線範例](../examples/offline)。

## 變異範圍

預設情況下，所有變異都是並行執行的 — 即使你多次呼叫相同變異的 `.mutate()`。可以透過為變異指定帶有 `id` 的 `scope` 來避免這種情況。所有具有相同 `scope.id` 的變異將會序列化執行，這意味著當它們被觸發時，若該範圍已有變異正在進行中，它們會以 `isPaused: true` 狀態開始。它們會被放入佇列中，並在輪到它們時自動恢復。

```tsx
const mutation = useMutation({
  mutationFn: addTodo,
  scope: {
    id: 'todo',
  },
})
```
