---
source-updated-at: '2025-04-03T21:54:40.000Z'
translation-updated-at: '2025-05-08T20:16:38.217Z'
id: quick-start
title: 快速開始
---

`@tanstack/solid-query` 套件提供了與 SolidJS 搭配使用 TanStack Query 的一流 API。

## 範例

```tsx
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/solid-query'
import { Switch, Match, For } from 'solid-js'

const queryClient = new QueryClient()

function Example() {
  const query = useQuery(() => ({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  }))

  return (
    <div>
      <Switch>
        <Match when={query.isPending}>
          <p>Loading...</p>
        </Match>
        <Match when={query.isError}>
          <p>Error: {query.error.message}</p>
        </Match>
        <Match when={query.isSuccess}>
          <For each={query.data}>{(todo) => <p>{todo.title}</p>}</For>
        </Match>
      </Switch>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  )
}
```

## 可用函式

Solid Query 提供了實用的基本元件與函式，能讓管理 SolidJS 應用程式中的伺服器狀態 (server state) 更加容易。

- `useQuery`
- `createQueries`
- `createInfiniteQueries`
- `createMutation`
- `useIsFetching`
- `useIsMutating`
- `useQueryClient`
- `QueryClient`
- `QueryClientProvider`

## Solid Query 與 React Query 的重要差異

Solid Query 提供的 API 與 React Query 相似，但有一些關鍵差異需要注意。

- 上述列出的 `solid-query` 基本元件（如 `useQuery`、`createMutation`、`useIsFetching`）的參數都是函式，以便在反應式作用域 (reactive scope) 中追蹤。

```tsx
// ❌ react 版本
useQuery({
  queryKey: ['todos', todo],
  queryFn: fetchTodos,
})

// ✅ solid 版本
useQuery(() => ({
  queryKey: ['todos', todo],
  queryFn: fetchTodos,
}))
```

- 如果在 `<Suspense>` 邊界內存取查詢資料，Suspense 會直接適用於查詢。

```tsx
import { For, Suspense } from 'solid-js'

function Example() {
  const query = useQuery(() => ({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  }))
  return (
    <div>
      {/* ✅ 會觸載入 fallback，資料在 suspense 邊界內存取。 */}
      <Suspense fallback={'Loading...'}>
        <For each={query.data}>{(todo) => <div>{todo.title}</div>}</For>
      </Suspense>
      {/* ❌ 不會觸載入 fallback，資料未在 suspense 邊界內存取。 */}
      <For each={query.data}>{(todo) => <div>{todo.title}</div>}</For>
    </div>
  )
}
```

- Solid Query 的基本元件 (`createX`) 不支援解構。這些函式的回傳值是一個 store，其屬性僅在反應式上下文 (reactive context) 中追蹤。

```tsx
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/solid-query'
import { Match, Switch } from 'solid-js'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  )
}

function Example() {
  // ❌ react 版本 — 支援在反應式上下文外解構
  // const { isPending, error, data } = useQuery({
  //   queryKey: ['repoData'],
  //   queryFn: () =>
  //     fetch('https://api.github.com/repos/tannerlinsley/react-query').then(
  //       (res) => res.json()
  //     ),
  // })

  // ✅ solid 版本 — 不支援在反應式上下文外解構
  const query = useQuery(() => ({
    queryKey: ['repoData'],
    queryFn: () =>
      fetch('https://api.github.com/repos/tannerlinsley/react-query').then(
        (res) => res.json(),
      ),
  }))

  // ✅ 在 JSX 反應式上下文中存取查詢屬性
  return (
    <Switch>
      <Match when={query.isPending}>Loading...</Match>
      <Match when={query.isError}>Error: {query.error.message}</Match>
      <Match when={query.isSuccess}>
        <div>
          <h1>{query.data.name}</h1>
          <p>{query.data.description}</p>
          <strong>👀 {query.data.subscribers_count}</strong>{' '}
          <strong>✨ {query.data.stargazers_count}</strong>{' '}
          <strong>🍴 {query.data.forks_count}</strong>
        </div>
      </Match>
    </Switch>
  )
}
```

- 訊號 (Signals) 和 store 值可以直接傳入函式參數。Solid Query 會自動更新查詢 `store`。

```tsx
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/solid-query'
import { createSignal, For } from 'solid-js'

const queryClient = new QueryClient()

function Example() {
  const [enabled, setEnabled] = createSignal(false)
  const [todo, setTodo] = createSignal(0)

  // ✅ 直接傳遞訊號是安全的，觀察者會在訊號值變更時自動更新
  const todosQuery = useQuery(() => ({
    queryKey: ['todos'],
    queryFn: fetchTodos,
    enabled: enabled(),
  }))

  const todoDetailsQuery = useQuery(() => ({
    queryKey: ['todo', todo()],
    queryFn: fetchTodo,
    enabled: todo() > 0,
  }))

  return (
    <div>
      <Switch>
        <Match when={todosQuery.isPending}>
          <p>Loading...</p>
        </Match>
        <Match when={todosQuery.isError}>
          <p>Error: {todosQuery.error.message}</p>
        </Match>
        <Match when={todosQuery.isSuccess}>
          <For each={todosQuery.data}>
            {(todo) => (
              <button onClick={() => setTodo(todo.id)}>{todo.title}</button>
            )}
          </For>
        </Match>
      </Switch>
      <button onClick={() => setEnabled(!enabled())}>Toggle enabled</button>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  )
}
```

- 錯誤可以使用 SolidJS 原生的 `ErrorBoundary` 元件捕捉並重置。將 `throwOnError` 或 `suspense` 選項設為 `true` 以確保錯誤會拋給 `ErrorBoundary`。

- 由於屬性追蹤是透過 Solid 的細粒度反應性 (fine grained reactivity) 處理，因此不需要 `notifyOnChangeProps` 這類選項。
