---
source-updated-at: '2025-03-01T21:43:55.000Z'
translation-updated-at: '2025-05-06T05:08:13.992Z'
id: background-fetching-indicators
title: 后台获取指示器
---
## 后台获取指示器

查询的 `status === 'pending'` 状态足以显示查询的初始硬加载状态，但有时您可能希望额外显示一个指示器，表明查询正在后台重新获取。为此，查询还提供了一个 `isFetching` 布尔值，无论 `status` 变量的状态如何，您都可以用它来显示查询正处于获取状态：

```angular-ts
@Component({
  selector: 'todos',
  template: `
    @if (todosQuery.isPending()) {
      加载中...
    } @else if (todosQuery.isError()) {
      发生错误：{{ todosQuery.error().message }}
    } @else if (todosQuery.isSuccess()) {
      @if (todosQuery.isFetching()) {
        正在刷新...
      }
      @for (todos of todosQuery.data(); track todo.id) {
        <todo [todo]="todo" />
      }
    }
  `,
})
class TodosComponent {
  todosQuery = injectQuery(() => ({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  }))
}
```

## 显示全局后台获取加载状态

除了单个查询的加载状态外，如果您希望在**任何**查询（包括后台查询）处于获取状态时显示全局加载指示器，可以使用 `useIsFetching` 钩子：

```angular-ts
import { injectIsFetching } from '@tanstack/angular-query-experimental'

@Component({
  selector: 'global-loading-indicator',
  template: `
    @if (isFetching()) {
      <div>查询正在后台获取中...</div>
    }
  `,
})
export class GlobalLoadingIndicatorComponent {
  isFetching = injectIsFetching()
}
```
