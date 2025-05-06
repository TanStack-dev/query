---
source-updated-at: '2025-04-03T21:54:40.000Z'
translation-updated-at: '2025-05-03T22:08:58.056Z'
id: quick-start
title: 快速开始
---
`@tanstack/solid-query` 包为在 SolidJS 中使用 TanStack Query 提供了一流的 API。

## 示例

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

## 可用函数

Solid Query 提供了一系列实用的基础功能和函数，可以更轻松地管理 SolidJS 应用中的服务端状态 (server state)。

- `useQuery`
- `createQueries`
- `createInfiniteQueries`
- `createMutation`
- `useIsFetching`
- `useIsMutating`
- `useQueryClient`
- `QueryClient`
- `QueryClientProvider`

## Solid Query 与 React Query 的重要区别

Solid Query 提供的 API 与 React Query 类似，但需要注意一些关键差异。

- 上述 `solid-query` 基础功能（如 `useQuery`、`createMutation`、`useIsFetching`）的参数是函数，以便在响应式作用域 (reactive scope) 中进行追踪。

```tsx
// ❌ React 版本
useQuery({
  queryKey: ['todos', todo],
  queryFn: fetchTodos,
})

// ✅ Solid 版本
useQuery(() => ({
  queryKey: ['todos', todo],
  queryFn: fetchTodos,
}))
```

- 如果在 `<Suspense>` 边界内访问查询数据，Suspense 会默认生效。

```tsx
import { For, Suspense } from 'solid-js'

function Example() {
  const query = useQuery(() => ({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  }))
  return (
    <div>
      {/* ✅ 会触发加载状态，数据在 Suspense 边界内访问。 */}
      <Suspense fallback={'Loading...'}>
        <For each={query.data}>{(todo) => <div>{todo.title}</div>}</For>
      </Suspense>
      {/* ❌ 不会触发加载状态，数据未在 Suspense 边界内访问。 */}
      <For each={query.data}>{(todo) => <div>{todo.title}</div>}</For>
    </div>
  )
}
```

- Solid Query 的基础功能（`createX`）不支持解构。这些函数的返回值是一个存储 (store)，其属性仅在响应式上下文中被追踪。

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
  // ❌ React 版本 —— 支持在响应式上下文外解构
  // const { isPending, error, data } = useQuery({
  //   queryKey: ['repoData'],
  //   queryFn: () =>
  //     fetch('https://api.github.com/repos/tannerlinsley/react-query').then(
  //       (res) => res.json()
  //     ),
  // })

  // ✅ Solid 版本 —— 不支持在响应式上下文外解构
  const query = useQuery(() => ({
    queryKey: ['repoData'],
    queryFn: () =>
      fetch('https://api.github.com/repos/tannerlinsley/react-query').then(
        (res) => res.json(),
      ),
  }))

  // ✅ 在 JSX 响应式上下文中访问查询属性
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

- 可以直接将信号 (Signal) 和存储值 (store value) 传递给函数参数。Solid Query 会自动更新查询存储 (store)。

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

  // ✅ 直接传递信号是安全的，当信号值变化时观察者会自动更新
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

- 可以使用 SolidJS 原生的 `ErrorBoundary` 组件捕获和重置错误。将 `throwOnError` 或 `suspense` 选项设置为 `true` 以确保错误被抛出到 `ErrorBoundary`。

- 由于属性追踪是通过 Solid 的细粒度响应式系统处理的，因此不需要 `notifyOnChangeProps` 等选项。
