---
source-updated-at: '2024-04-02T22:46:31.000Z'
translation-updated-at: '2025-05-06T05:26:47.297Z'
id: suspense
title: Suspense
---
> 注意：Vue Query 的 Suspense 模式目前属于实验性功能，与 Vue 自身的 Suspense 特性相同。这些 API 将会发生变化，除非您将 Vue 和 Vue Query 的版本锁定为相互兼容的补丁级别版本，否则不应在生产环境中使用。

Vue Query 也可以与 Vue 的新 [Suspense](https://vuejs.org/guide/built-ins/suspense.html) API 结合使用。

为此，您需要使用 Vue 提供的 `Suspense` 组件包裹可挂起 (suspendable) 的组件：

```vue
<script setup>
import SuspendableComponent from './SuspendableComponent.vue'
</script>

<template>
  <Suspense>
    <template #default>
      <SuspendableComponent />
    </template>
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>
```

并将可挂起组件中的 `setup` 函数改为 `async` 形式。随后您就可以使用 `vue-query` 提供的异步 `suspense` 函数：

```vue
<script>
import { defineComponent } from 'vue'
import { useQuery } from '@tanstack/vue-query'

const todoFetcher = async () =>
  await fetch('https://jsonplaceholder.cypress.io/todos').then((response) =>
    response.json(),
  )
export default defineComponent({
  name: 'SuspendableComponent',
  async setup() {
    const { data, suspense } = useQuery(['todos'], todoFetcher)
    await suspense()

    return { data }
  },
})
</script>
```

## 渲染时获取 (Fetch-on-render) vs 随取随渲 (Render-as-you-fetch)

默认情况下，Vue Query 在 `suspense` 模式下无需额外配置即可作为**渲染时获取 (Fetch-on-render)** 解决方案完美工作。这意味着当您的组件尝试挂载时，它们会触发查询获取并挂起，但只有在您导入并挂载它们之后才会发生。如果您想进一步提升并实现**随取随渲 (Render-as-you-fetch)** 模式，我们建议在路由回调和/或用户交互事件上实现[预取 (Prefetching)](../prefetching)，以便在组件挂载前——甚至在其父组件开始导入或挂载之前——就开始加载查询。
