---
source-updated-at: '2025-04-25T12:36:10.000Z'
translation-updated-at: '2025-05-08T20:24:32.006Z'
id: mutations
title: 變更
---

與查詢 (queries) 不同，突變 (mutations) 通常用於建立/更新/刪除資料或執行伺服器副作用 (side-effects)。為此，TanStack Query 導出了 `useMutation` 鉤子 (hook)。

以下是一個新增待辦事項到伺服器的突變範例：

[//]: # 'Example'

```tsx
function App() {
  const mutation = useMutation({
    mutationFn: (newTodo) => {
      return axios.post('/todos', newTodo)
    },
  })

  return (
    <div>
      {mutation.isPending ? (
        'Adding todo...'
      ) : (
        <>
          {mutation.isError ? (
            <div>An error occurred: {mutation.error.message}</div>
          ) : null}

          {mutation.isSuccess ? <div>Todo added!</div> : null}

          <button
            onClick={() => {
              mutation.mutate({ id: new Date(), title: 'Do Laundry' })
            }}
          >
            Create Todo
          </button>
        </>
      )}
    </div>
  )
}
```

[//]: # 'Example'

在任何時刻，突變只能處於以下其中一種狀態：

- `isIdle` 或 `status === 'idle'` - 突變目前處於閒置或全新/重置狀態
- `isPending` 或 `status === 'pending'` - 突變正在執行中
- `isError` 或 `status === 'error'` - 突變遇到錯誤
- `isSuccess` 或 `status === 'success'` - 突變成功且突變資料可用

除了這些主要狀態外，根據突變的狀態還可以獲取更多資訊：

- `error` - 如果突變處於 `error` 狀態，可以透過 `error` 屬性取得錯誤資訊。
- `data` - 如果突變處於 `success` 狀態，可以透過 `data` 屬性取得資料。

在上面的範例中，你還看到可以透過呼叫 `mutate` 函式並傳入**單一變數或物件**來將變數傳遞給突變函式。

即使只有變數，突變也沒什麼特別的，但當與 `onSuccess` 選項、[Query Client 的 `invalidateQueries` 方法](../../../reference/QueryClient.md#queryclientinvalidatequeries) 以及 [Query Client 的 `setQueryData` 方法](../../../reference/QueryClient.md#queryclientsetquerydata) 一起使用時，突變就變成了一個非常強大的工具。

[//]: # 'Info1'

> 重要提示：`mutate` 函式是一個非同步函式，這意味著在 **React 16 及更早版本**中，你不能直接在事件回呼中使用它。如果需要在 `onSubmit` 中存取事件，你必須將 `mutate` 包裝在另一個函式中。這是由於 [React 事件池化 (event pooling)](https://reactjs.org/docs/legacy-event-pooling.html) 的緣故。

[//]: # 'Info1'
[//]: # 'Example2'

```tsx
// 這在 React 16 及更早版本中無法運作
const CreateTodo = () => {
  const mutation = useMutation({
    mutationFn: (event) => {
      event.preventDefault()
      return fetch('/api', new FormData(event.target))
    },
  })

  return <form onSubmit={mutation.mutate}>...</form>
}

// 這樣可以運作
const CreateTodo = () => {
  const mutation = useMutation({
    mutationFn: (formData) => {
      return fetch('/api', formData)
    },
  })
  const onSubmit = (event) => {
    event.preventDefault()
    mutation.mutate(new FormData(event.target))
  }

  return <form onSubmit={onSubmit}>...</form>
}
```

[//]: # 'Example2'

## 重置突變狀態

有時你需要清除突變請求的 `error` 或 `data`。為此，你可以使用 `reset` 函式來處理：

[//]: # 'Example3'

```tsx
const CreateTodo = () => {
  const [title, setTitle] = useState('')
  const mutation = useMutation({ mutationFn: createTodo })

  const onCreateTodo = (e) => {
    e.preventDefault()
    mutation.mutate({ title })
  }

  return (
    <form onSubmit={onCreateTodo}>
      {mutation.error && (
        <h5 onClick={() => mutation.reset()}>{mutation.error}</h5>
      )}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <br />
      <button type="submit">Create Todo</button>
    </form>
  )
}
```

[//]: # 'Example3'

## 突變副作用

`useMutation` 提供了一些輔助選項，允許在突變生命週期的任何階段快速且輕鬆地執行副作用。這些選項對於[突變後使查詢失效並重新獲取](./invalidations-from-mutations.md)甚至[樂觀更新 (optimistic updates)](./optimistic-updates.md)都非常有用。

[//]: # 'Example4'

```tsx
useMutation({
  mutationFn: addTodo,
  onMutate: (variables) => {
    // 突變即將發生！

    // 可選返回一個包含資料的上下文，用於例如回滾操作
    return { id: 1 }
  },
  onError: (error, variables, context) => {
    // 發生錯誤！
    console.log(`rolling back optimistic update with id ${context.id}`)
  },
  onSuccess: (data, variables, context) => {
    // 成功！
  },
  onSettled: (data, error, variables, context) => {
    // 無論錯誤或成功...都沒關係！
  },
})
```

[//]: # 'Example4'

當在任何回呼函式中返回一個 Promise 時，它會先被等待，然後才會呼叫下一個回呼：

[//]: # 'Example5'

```tsx
useMutation({
  mutationFn: addTodo,
  onSuccess: async () => {
    console.log("I'm first!")
  },
  onSettled: async () => {
    console.log("I'm second!")
  },
})
```

[//]: # 'Example5'

你可能會發現，除了在 `useMutation` 上定義的回呼外，你還想在呼叫 `mutate` 時**觸發額外的回呼**。這可以用來觸發元件特定的副作用。為此，你可以在突變變數之後向 `mutate` 函式提供任何相同的回呼選項。支援的選項包括：`onSuccess`、`onError` 和 `onSettled`。請注意，如果你的元件在突變完成*之前*卸載，這些額外的回呼將不會執行。

[//]: # 'Example6'

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

[//]: # 'Example6'

### 連續突變

在處理連續突變時，`onSuccess`、`onError` 和 `onSettled` 回呼的處理方式略有不同。當傳遞給 `mutate` 函式時，它們只會觸發*一次*，並且只有在元件仍然掛載時才會觸發。這是因為每次呼叫 `mutate` 函式時，突變觀察者 (observer) 會被移除並重新訂閱。相反地，`useMutation` 的處理程序會針對每個 `mutate` 呼叫執行。

> 請注意，傳遞給 `useMutation` 的 `mutationFn` 很可能是非同步的。在這種情況下，突變完成的順序可能與 `mutate` 函式呼叫的順序不同。

[//]: # 'Example7'

```tsx
useMutation({
  mutationFn: addTodo,
  onSuccess: (data, variables, context) => {
    // 會被呼叫 3 次
  },
})

const todos = ['Todo 1', 'Todo 2', 'Todo 3']
todos.forEach((todo) => {
  mutate(todo, {
    onSuccess: (data, variables, context) => {
      // 只會執行一次，針對最後一個突變 (Todo 3)，
      // 無論哪個突變先完成
    },
  })
})
```

[//]: # 'Example7'

## Promise

使用 `mutateAsync` 而不是 `mutate` 來獲取一個 Promise，該 Promise 會在成功時解析或在錯誤時拋出。例如，這可以用於組合副作用。

[//]: # 'Example8'

```tsx
const mutation = useMutation({ mutationFn: addTodo })

try {
  const todo = await mutation.mutateAsync(todo)
  console.log(todo)
} catch (error) {
  console.error(error)
} finally {
  console.log('done')
}
```

[//]: # 'Example8'

## 重試

預設情況下，TanStack Query 不會在錯誤時重試突變，但可以透過 `retry` 選項來實現：

[//]: # 'Example9'

```tsx
const mutation = useMutation({
  mutationFn: addTodo,
  retry: 3,
})
```

[//]: # 'Example9'

如果突變因裝置離線而失敗，它們將在裝置重新連接時以相同的順序重試。

## 持久化突變

如果需要，可以將突變持久化到儲存中，並在稍後恢復。這可以透過 hydration 函式來實現：

[//]: # 'Example10'

```tsx
const queryClient = new QueryClient()

// 定義 "addTodo" 突變
queryClient.setMutationDefaults(['addTodo'], {
  mutationFn: addTodo,
  onMutate: async (variables) => {
    // 取消目前 todos 列表的查詢
    await queryClient.cancelQueries({ queryKey: ['todos'] })

    // 建立樂觀待辦事項
    const optimisticTodo = { id: uuid(), title: variables.title }

    // 將樂觀待辦事項新增到 todos 列表
    queryClient.setQueryData(['todos'], (old) => [...old, optimisticTodo])

    // 返回包含樂觀待辦事項的上下文
    return { optimisticTodo }
  },
  onSuccess: (result, variables, context) => {
    // 將 todos 列表中的樂觀待辦事項替換為結果
    queryClient.setQueryData(['todos'], (old) =>
      old.map((todo) =>
        todo.id === context.optimisticTodo.id ? result : todo,
      ),
    )
  },
  onError: (error, variables, context) => {
    // 從 todos 列表中移除樂觀待辦事項
    queryClient.setQueryData(['todos'], (old) =>
      old.filter((todo) => todo.id !== context.optimisticTodo.id),
    )
  },
  retry: 3,
})

// 在某個元件中啟動突變：
const mutation = useMutation({ mutationKey: ['addTodo'] })
mutation.mutate({ title: 'title' })

// 如果突變因為裝置離線等原因被暫停，
// 可以在應用程式退出時將暫停的突變脫水 (dehydrate)：
const state = dehydrate(queryClient)

// 然後在應用程式啟動時再次水合 (hydrate)：
hydrate(queryClient, state)

// 恢復暫停的突變：
queryClient.resumePausedMutations()
```

[//]: # 'Example10'

### 持久化離線突變

如果你使用 [persistQueryClient 插件](../plugins/persistQueryClient.md) 持久化離線突變，除非你提供預設的突變函式，否則在頁面重新載入時無法恢復突變。

這是一個技術限制。當持久化到外部儲存時，只有突變的狀態會被持久化，因為函式無法被序列化。水合後，觸發突變的元件可能尚未掛載，因此呼叫 `resumePausedMutations` 可能會導致錯誤：`No mutationFn found`。

[//]: # 'Example11'

```tsx
const persister = createSyncStoragePersister({
  storage: window.localStorage,
})
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 小時
    },
  },
})

// 我們需要一個預設的突變函式，以便暫停的突變在頁面重新載入後可以恢復
queryClient.setMutationDefaults(['todos'], {
  mutationFn: ({ id, data }) => {
    return api.updateTodo(id, data)
  },
})

export default function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
      onSuccess={() => {
        // 從 localStorage 初始恢復成功後恢復突變
        queryClient.resumePausedMutations()
      }}
    >
      <RestOfTheApp />
    </PersistQueryClientProvider>
  )
}
```

[//]: # 'Example11'

我們還有一個涵蓋查詢和突變的完整[離線範例](../examples/offline)。

## 突變範圍

預設情況下，所有突變都是並行執行的——即使你多次呼叫相同突變的 `.mutate()`。可以透過為突變指定帶有 `id` 的 `scope` 來避免這種情況。所有具有相同 `scope.id` 的突變將會序列化執行，這意味著當它們被觸發時，如果該範圍已經有一個突變正在進行中，它們將以 `isPaused: true` 狀態開始。它們會被放入佇列中，並在輪到它們時自動恢復。

[//]: # 'ExampleScopes'

```tsx
const mutation = useMutation({
  mutationFn: addTodo,
  scope: {
    id: 'todo',
  },
})
```

[//]: # 'ExampleScopes'
[//]: # 'Materials'

## 延伸閱讀

有關突變的更多資訊，請查看社群資源中的 [#12: Mastering Mutations in React Query](../community/tkdodos-blog.md#12-mastering-mutations-in-react-query)。

[//]: # 'Materials'
