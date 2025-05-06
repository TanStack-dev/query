---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:09:52.666Z'
id: queries
title: 查询
---

## 查询基础

查询是与**唯一键**绑定的、对异步数据源的声明式依赖。查询可用于任何基于 Promise 的方法（包括 GET 和 POST 方法）从服务器获取数据。如果您的方法会修改服务器上的数据，建议改用[变更](./mutations.md)。

要在组件或自定义钩子中订阅查询，至少需要调用 `useQuery` 钩子并传入：

- **该查询的唯一键**
- 一个返回 Promise 的函数，该 Promise 会：
  - 解析数据，或
  - 抛出错误

[//]: # '示例'

```tsx
import { useQuery } from '@tanstack/react-query'

function App() {
  const info = useQuery({ queryKey: ['todos'], queryFn: fetchTodoList })
}
```

[//]: # '示例'

您提供的**唯一键**将在内部用于重新获取、缓存和在应用程序中共享查询。

`useQuery` 返回的查询结果包含模板渲染和数据使用所需的所有信息：

[//]: # '示例2'

```tsx
const result = useQuery({ queryKey: ['todos'], queryFn: fetchTodoList })
```

[//]: # '示例2'

`result` 对象包含几个非常重要的状态，您需要了解这些状态才能高效工作。查询在任意时刻只能处于以下一种状态：

- `isPending` 或 `status === 'pending'` - 查询尚无数据
- `isError` 或 `status === 'error'` - 查询遇到错误
- `isSuccess` 或 `status === 'success'` - 查询成功且数据可用

除了这些主要状态外，根据查询状态还可获取更多信息：

- `error` - 如果查询处于 `isError` 状态，可通过 `error` 属性获取错误信息。
- `data` - 如果查询处于 `isSuccess` 状态，可通过 `data` 属性获取数据。
- `isFetching` - 在任何状态下，如果查询正在获取数据（包括后台重新获取），`isFetching` 将为 `true`。

对于**大多数**查询，通常只需检查 `isPending` 状态，然后是 `isError` 状态，最后即可假定数据可用并渲染成功状态：

[//]: # '示例3'

```tsx
function Todos() {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodoList,
  })

  if (isPending) {
    return <span>加载中...</span>
  }

  if (isError) {
    return <span>错误：{error.message}</span>
  }

  // 此时可以认为 `isSuccess === true`
  return (
    <ul>
      {data.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}
```

[//]: # '示例3'

如果不喜欢使用布尔值，也可以始终使用 `status` 状态：

[//]: # '示例4'

```tsx
function Todos() {
  const { status, data, error } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodoList,
  })

  if (status === 'pending') {
    return <span>加载中...</span>
  }

  if (status === 'error') {
    return <span>错误：{error.message}</span>
  }

  // 同样 status === 'success'，但 "else" 逻辑也适用
  return (
    <ul>
      {data.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}
```

[//]: # '示例4'

如果在访问 `data` 之前检查了 `pending` 和 `error`，TypeScript 也会正确缩小 `data` 的类型范围。

### 获取状态 (FetchStatus)

除了 `status` 字段外，您还会获得一个额外的 `fetchStatus` 属性，其可选值包括：

- `fetchStatus === 'fetching'` - 查询正在获取数据。
- `fetchStatus === 'paused'` - 查询希望获取数据，但被暂停。详情请参阅[网络模式](./network-mode.md)指南。
- `fetchStatus === 'idle'` - 查询当前未进行任何操作。

### 为何有两种不同状态？

后台重新获取和"过时但重新验证"逻辑使得 `status` 和 `fetchStatus` 的所有组合都可能出现。例如：

- 处于 `success` 状态的查询通常处于 `idle` 获取状态，但如果正在进行后台重新获取，也可能处于 `fetching` 状态。
- 刚挂载且无数据的查询通常处于 `pending` 状态和 `fetching` 获取状态，但如果无网络连接，也可能处于 `paused` 状态。

因此请记住，查询可能处于 `pending` 状态但并未实际获取数据。经验法则：

- `status` 提供关于 `data` 的信息：是否有数据？
- `fetchStatus` 提供关于 `queryFn` 的信息：是否正在运行？

[//]: # '材料'

## 延伸阅读

如需了解执行状态检查的替代方法，请参阅[社区资源](../community/tkdodos-blog.md#4-status-checks-in-react-query)。

[//]: # '材料'
