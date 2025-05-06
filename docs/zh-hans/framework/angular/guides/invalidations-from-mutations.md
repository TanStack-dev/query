---
source-updated-at: '2025-01-03T15:54:42.000Z'
translation-updated-at: '2025-05-06T05:03:17.566Z'
id: invalidations-from-mutations
title: 从变更中失效
---
## 变更触发的失效

使查询失效只是成功的一半，而知道**何时**使其失效则是另一半。通常，当应用中的某个变更 (mutation) 成功执行时，应用中很可能存在相关的查询需要失效，并可能需要重新获取数据以反映该变更带来的新变化。

例如，假设我们有一个用于发布新待办事项的变更：

```ts
mutation = injectMutation(() => ({
  mutationFn: postTodo,
}))
```

当 `postTodo` 变更成功执行时，我们很可能希望所有 `todos` 查询失效并可能重新获取，以显示新的待办事项。为此，你可以使用 `injectMutation` 的 `onSuccess` 选项和 `client` 的 `invalidateQueries` 函数：

```ts
import {
  injectMutation,
  QueryClient,
} from '@tanstack/angular-query-experimental'

export class TodosComponent {
  queryClient = inject(QueryClient)

  // 当此变更成功时，使所有带有 `todos` 或 `reminders` 查询键 (query key) 的查询失效
  mutation = injectMutation(() => ({
    mutationFn: addTodo,
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['todos'] })
      this.queryClient.invalidateQueries({ queryKey: ['reminders'] })
    },
  }))
}
```

你可以利用 [`injectMutation` 函数](./mutations.md) 中提供的任何回调来设置失效逻辑。
