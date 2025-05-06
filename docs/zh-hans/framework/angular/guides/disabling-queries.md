---
source-updated-at: '2025-03-01T21:43:55.000Z'
translation-updated-at: '2025-05-06T05:06:44.473Z'
id: disabling-queries
title: 禁用/暂停查询
---
如果你希望阻止某个查询自动执行，可以使用 `enabled = false` 选项。该选项也支持传入返回布尔值的回调函数。

当 `enabled` 为 `false` 时：

- 如果查询存在缓存数据，则初始化状态为 `status === 'success'` 或 `isSuccess`
- 如果查询没有缓存数据，则初始化状态为 `status === 'pending'` 且 `fetchStatus === 'idle'`
- 查询不会在挂载时自动获取数据
- 查询不会在后台自动重新获取数据
- 查询会忽略 query client 的 `invalidateQueries` 和 `refetchQueries` 调用（这些调用通常会导致查询重新获取数据）
- 通过 `injectQuery` 返回的 `refetch` 可用于手动触发查询获取数据（但无法与 `skipToken` 配合使用）

> TypeScript 用户可考虑使用 [skipToken](#typesafe-disabling-of-queries-using-skiptoken) 作为 `enabled = false` 的替代方案

```angular-ts
@Component({
  selector: 'todos',
  template: `<div>
    <button (click)="query.refetch()">Fetch Todos</button>

    @if (query.data()) {
      <ul>
        @for (todo of query.data(); track todo.id) {
          <li>{{ todo.title }}</li>
        }
      </ul>
    } @else {
      @if (query.isError()) {
        <span>Error: {{ query.error().message }}</span>
      } @else if (query.isLoading()) {
        <span>Loading...</span>
      } @else if (!query.isLoading() && !query.isError()) {
        <span>Not ready ...</span>
      }
    }

    <div>{{ query.isLoading() ? 'Fetching...' : '' }}</div>
  </div>`,
})
export class TodosComponent {
  query = injectQuery(() => ({
    queryKey: ['todos'],
    queryFn: fetchTodoList,
    enabled: false,
  }))
}
```

永久禁用查询会使你无法使用 TanStack Query 的许多优秀特性（如后台重新获取），这也不符合惯用模式。这会让你从声明式模式（定义查询运行依赖条件）退回到命令式模式（点击按钮时才获取数据），且无法向 `refetch` 传递参数。通常你需要的只是一个延迟初始获取的惰性查询：

## 惰性查询

`enabled` 选项不仅能永久禁用查询，还能实现动态启用/禁用。典型场景是筛选表单——只有当用户输入筛选值后才发起首次请求：

```angular-ts
@Component({
  selector: 'todos',
  template: `
    <div>
      // 🚀 应用筛选条件时将启用并执行查询
      <filters-form onApply="filter.set" />
      <todos-table data="query.data()" />
    </div>
  `,
})
export class TodosComponent {
  filter = signal('')

  todosQuery = injectQuery(() => ({
    queryKey: ['todos', this.filter()],
    queryFn: () => fetchTodos(this.filter()),
    enabled: !!this.filter(),
  }))
}
```

### isLoading (原名为 `isInitialLoading`)

惰性查询会始终处于 `status: 'pending'` 状态，因为 `pending` 表示尚无数据。虽然技术上是正确的，但由于当前并未获取数据（查询未被 _启用_），这个状态可能不适合用来显示加载指示器。

对于禁用或惰性查询，可以使用 `isLoading` 标志。这是一个衍生标志，由以下条件计算得出：

`isPending && isFetching`

因此只有当查询首次获取数据时才会返回 `true`。

## 使用 `skipToken` 实现类型安全的查询禁用

TypeScript 用户可以使用 `skipToken` 禁用查询。适用于需要根据条件禁用查询，同时保持类型安全的场景。

> 重要提示：`injectQuery` 返回的 `refetch` 无法与 `skipToken` 配合使用。除此之外，`skipToken` 的行为与 `enabled: false` 完全一致。

```angular-ts
import { skipToken, injectQuery } from '@tanstack/query-angular'

@Component({
  selector: 'todos',
  template: `
    <div>
      // 🚀 应用筛选条件时将启用并执行查询
      <filters-form onApply="filter.set" />
      <todos-table data="query.data()" />
    </div>
  `,
})
export class TodosComponent {
  filter = signal('')

  todosQuery = injectQuery(() => ({
    queryKey: ['todos', this.filter()],
    queryFn: this.filter() ? () => fetchTodos(this.filter()) : skipToken,
  }))
}
```
