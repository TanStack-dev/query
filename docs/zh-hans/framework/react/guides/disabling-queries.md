---
source-updated-at: '2025-01-10T12:49:47.000Z'
translation-updated-at: '2025-05-06T04:14:23.656Z'
id: disabling-queries
title: 禁用/暂停查询
---
若需阻止查询自动执行，可通过设置 `enabled = false` 选项实现。该选项也支持传入返回布尔值的回调函数。

当 `enabled` 为 `false` 时：

- 若查询存在缓存数据，则初始化状态为 `status === 'success'` 或 `isSuccess`
- 若查询无缓存数据，则初始化状态为 `status === 'pending'` 且 `fetchStatus === 'idle'`
- 查询不会在挂载时自动触发
- 查询不会在后台自动重新获取
- 查询会忽略 query client 的 `invalidateQueries` 和 `refetchQueries` 调用（这些调用通常会导致查询重新获取）
- 通过 `useQuery` 返回的 `refetch` 可手动触发查询，但无法与 `skipToken` 配合使用

> TypeScript 用户可选用 [skipToken](#typesafe-disabling-of-queries-using-skiptoken) 作为 `enabled = false` 的替代方案

[//]: # '示例'

```tsx
function Todos() {
  const { isLoading, isError, data, error, refetch, isFetching } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodoList,
    enabled: false,
  })

  return (
    <div>
      <button onClick={() => refetch()}>Fetch Todos</button>

      {data ? (
        <>
          <ul>
            {data.map((todo) => (
              <li key={todo.id}>{todo.title}</li>
            ))}
          </ul>
        </>
      ) : isError ? (
        <span>Error: {error.message}</span>
      ) : isLoading ? (
        <span>Loading...</span>
      ) : (
        <span>Not ready ...</span>
      )}

      <div>{isFetching ? 'Fetching...' : null}</div>
    </div>
  )
}
```

[//]: # '示例'

永久禁用查询会使你失去 TanStack Query 的许多优秀特性（如后台重新获取），这也不符合惯用模式。这会让你从声明式模式（定义查询执行依赖）退化为命令式模式（点击按钮时才获取）。此外也无法通过 `refetch` 传递参数。多数情况下，你需要的只是一个延迟初始获取的惰性查询：

## 惰性查询

`enabled` 选项不仅能永久禁用查询，还能实现动态启用/禁用。典型场景是筛选表单——仅当用户输入筛选值后才发起首次请求：

[//]: # '示例2'

```tsx
function Todos() {
  const [filter, setFilter] = React.useState('')

  const { data } = useQuery({
    queryKey: ['todos', filter],
    queryFn: () => fetchTodos(filter),
    // ⬇️ 当筛选值为空时禁用查询
    enabled: !!filter,
  })

  return (
    <div>
      // 🚀 应用筛选条件将启用并执行查询
      <FiltersForm onApply={setFilter} />
      {data && <TodosTable data={data} />}
    </div>
  )
}
```

[//]: # '示例2'

### isLoading (原 `isInitialLoading`)

惰性查询会始终处于 `status: 'pending'` 状态，因为 `pending` 表示尚无数据。虽然技术上是正确的，但由于当前并未获取数据（查询未被 _启用_），这个标志位通常不能用于显示加载指示器。

若使用禁用或惰性查询，可改用 `isLoading` 标志位。这是一个衍生标志，由以下公式计算：

`isPending && isFetching`

因此仅当查询首次获取数据时才会为 `true`

## 使用 `skipToken` 实现类型安全的查询禁用

TypeScript 用户可使用 `skipToken` 禁用查询。适用于需要基于条件禁用查询，同时保持类型安全的场景。

> 重要提示：`useQuery` 返回的 `refetch` 无法与 `skipToken` 配合使用。除此之外，`skipToken` 与 `enabled: false` 行为一致

[//]: # '示例3'

```tsx
import { skipToken, useQuery } from '@tanstack/react-query'

function Todos() {
  const [filter, setFilter] = React.useState<string | undefined>()

  const { data } = useQuery({
    queryKey: ['todos', filter],
    // ⬇️ 当 filter 为 undefined 或空时禁用查询
    queryFn: filter ? () => fetchTodos(filter) : skipToken,
  })

  return (
    <div>
      // 🚀 应用筛选条件将启用并执行查询
      <FiltersForm onApply={setFilter} />
      {data && <TodosTable data={data} />}
    </div>
  )
}
```

[//]: # '示例3'
