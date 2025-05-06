---
source-updated-at: '2025-04-03T21:54:40.000Z'
translation-updated-at: '2025-05-06T05:17:08.121Z'
id: suspense
title: Suspense
---
Solid Query 也能与 Solid 的 [Suspense](https://docs.solidjs.com/reference/components/suspense) API 配合使用。

为此，你需要用 Vue 提供的 `Suspense` 组件包裹可挂起的组件：

```tsx
import { Suspense } from 'solid-js'
;<Suspense fallback={<LoadingSpinner />}>
  <SuspendableComponent />
</Suspense>
```

你可以使用 `solid-query` 提供的异步 `suspense` 函数：

```vue
<script>
import { defineComponent } from 'vue'
import { useQuery } from '@tanstack/solid-query'

const todoFetcher = async () =>
  await fetch('https://jsonplaceholder.cypress.io/todos').then((response) =>
    response.json(),
  )
export default defineComponent({
  name: 'SuspendableComponent',
  async setup() {
    const { data, suspense } = useQuery(() => ['todos'], todoFetcher)
    await suspense()

    return { data }
  },
})
</script>
```

## 渲染时获取 (Fetch-on-render) vs 随取随渲染 (Render-as-you-fetch)

开箱即用的 Solid Query 在 `suspense` 模式下无需额外配置即可作为**渲染时获取 (Fetch-on-render)**方案出色工作。这意味着当你的组件尝试挂载时，它们会触发查询获取并挂起，但只有在你导入并挂载它们之后才会发生。如果你想更上一层楼，实现**随取随渲染 (Render-as-you-fetch)**模式，我们建议在路由回调和/或用户交互事件上实现[预取 (Prefetching)](../prefetching)，以便在组件挂载前就开始加载查询，甚至可以在导入或挂载其父组件之前就开始。
