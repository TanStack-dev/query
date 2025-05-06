---
source-updated-at: '2024-09-01T21:12:58.000Z'
translation-updated-at: '2025-05-06T05:30:13.009Z'
id: ssr
title: SSR 与 Nuxt
---

Vue Query 支持在服务端预取多个查询，并将这些查询 _脱水 (dehydrate)_ 到 queryClient 中。这意味着服务端可以预先渲染页面加载时立即可用的标记，一旦 JS 可用，Vue Query 就能用库的全部功能来升级或 _水合 (hydrate)_ 这些查询。包括在客户端重新获取那些自服务端渲染后已过时的查询。

## 使用 Nuxt.js

### Nuxt 3

首先在 `plugins` 目录下创建 `vue-query.ts` 文件，内容如下：

```ts
import type {
  DehydratedState,
  VueQueryPluginOptions,
} from '@tanstack/vue-query'
import {
  VueQueryPlugin,
  QueryClient,
  hydrate,
  dehydrate,
} from '@tanstack/vue-query'
// Nuxt 3 app aliases
import { defineNuxtPlugin, useState } from '#imports'

export default defineNuxtPlugin((nuxt) => {
  const vueQueryState = useState<DehydratedState | null>('vue-query')

  // Modify your Vue Query global settings here
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 5000 } },
  })
  const options: VueQueryPluginOptions = { queryClient }

  nuxt.vueApp.use(VueQueryPlugin, options)

  if (import.meta.server) {
    nuxt.hooks.hook('app:rendered', () => {
      vueQueryState.value = dehydrate(queryClient)
    })
  }

  if (import.meta.client) {
    hydrate(queryClient, vueQueryState.value)
  }
})
```

现在你可以使用 `onServerPrefetch` 在页面中预取数据了。

- 使用 `queryClient.prefetchQuery` 或 `suspense` 预取所有需要的查询

```ts
export default defineComponent({
  setup() {
    const { data, suspense } = useQuery({
      queryKey: ['test'],
      queryFn: fetcher,
    })

    onServerPrefetch(async () => {
      await suspense()
    })

    return { data }
  },
})
```

### Nuxt 2

首先在 `plugins` 目录下创建 `vue-query.js` 文件，内容如下：

```js
import Vue from 'vue'
import { VueQueryPlugin, QueryClient, hydrate } from '@tanstack/vue-query'

export default (context) => {
  // Modify your Vue Query global settings here
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 5000 } },
  })

  if (process.server) {
    context.ssrContext.VueQuery = queryClient
  }

  if (process.client) {
    Vue.use(VueQueryPlugin, { queryClient })

    if (context.nuxtState && context.nuxtState.vueQueryState) {
      hydrate(queryClient, context.nuxtState.vueQueryState)
    }
  }
}
```

将此插件添加到 `nuxt.config.js` 中：

```js
module.exports = {
  ...
  plugins: ['~/plugins/vue-query.js'],
}
```

现在你可以使用 `onServerPrefetch` 在页面中预取数据了。

- 使用 `useContext` 获取 nuxt 上下文
- 使用 `useQueryClient` 获取服务端 `queryClient` 实例
- 使用 `queryClient.prefetchQuery` 或 `suspense` 预取所有需要的查询
- 将 `queryClient` 脱水到 `nuxtContext`

```vue
// pages/todos.vue
<template>
  <div>
    <button @click="refetch">Refetch</button>
    <p>{{ data }}</p>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onServerPrefetch,
  useContext,
} from '@nuxtjs/composition-api'
import { useQuery, useQueryClient, dehydrate } from '@tanstack/vue-query'

export default defineComponent({
  setup() {
    // Get QueryClient either from SSR context, or Vue context
    const { ssrContext } = useContext()
    // Make sure to provide `queryClient` as a second parameter to `useQuery` calls
    const queryClient =
      (ssrContext != null && ssrContext.VueQuery) || useQueryClient()

    // This will be prefetched and sent from the server
    const { data, refetch, suspense } = useQuery(
      {
        queryKey: ['todos'],
        queryFn: getTodos,
      },
      queryClient,
    )
    // This won't be prefetched, it will start fetching on client side
    const { data2 } = useQuery(
      {
        queryKey: 'todos2',
        queryFn: getTodos,
      },
      queryClient,
    )

    onServerPrefetch(async () => {
      await suspense()
      ssrContext.nuxt.vueQueryState = dehydrate(queryClient)
    })

    return {
      refetch,
      data,
    }
  },
})
</script>
```

如示例所示，可以预取部分查询而让其他查询在 queryClient 上获取。这意味着你可以通过添加或移除特定查询的 `prefetchQuery` 或 `suspense` 来控制服务端渲染的内容。

## 使用 Vite SSR

将 VueQuery 客户端状态与 [vite-ssr](https://github.com/frandiox/vite-ssr) 同步，以便在 DOM 中序列化：

```js
// main.js (entry point)
import App from './App.vue'
import viteSSR from 'vite-ssr/vue'
import {
  QueryClient,
  VueQueryPlugin,
  hydrate,
  dehydrate,
} from '@tanstack/vue-query'

export default viteSSR(App, { routes: [] }, ({ app, initialState }) => {
  // -- This is Vite SSR main hook, which is called once per request

  // Create a fresh VueQuery client
  const queryClient = new QueryClient()

  // Sync initialState with the client state
  if (import.meta.env.SSR) {
    // Indicate how to access and serialize VueQuery state during SSR
    initialState.vueQueryState = { toJSON: () => dehydrate(queryClient) }
  } else {
    // Reuse the existing state in the browser
    hydrate(queryClient, initialState.vueQueryState)
  }

  // Mount and provide the client to the app components
  app.use(VueQueryPlugin, { queryClient })
})
```

然后，使用 Vue 的 `onServerPrefetch` 在任何组件中调用 VueQuery：

```html
<!-- MyComponent.vue -->
<template>
  <div>
    <button @click="refetch">Refetch</button>
    <p>{{ data }}</p>
  </div>
</template>

<script setup>
  import { useQuery } from '@tanstack/vue-query'
  import { onServerPrefetch } from 'vue'

  // This will be prefetched and sent from the server
  const { refetch, data, suspense } = useQuery({
    queryKey: ['todos'],
    queryFn: getTodos,
  })

  onServerPrefetch(suspense)
</script>
```

## 技巧、窍门与注意事项

### 只有成功的查询会被包含在脱水过程中

任何出错的查询会自动排除在脱水过程外。这意味着默认行为是假装这些查询从未在服务端加载过，通常会显示加载状态，并在 queryClient 上重试查询。无论错误如何都会发生这种情况。

有时这种行为并不理想，可能你希望在特定错误或查询时渲染带有正确状态码的错误页面。在这些情况下，使用 `fetchQuery` 并捕获错误来手动处理。

### 过时性是从查询在服务端获取时开始计算的

查询是否过时取决于其 `dataUpdatedAt` 时间。需要注意的是，服务端需要有正确的时间才能正常工作，但使用的是 UTC 时间，因此时区不影响。

由于 `staleTime` 默认为 `0`，默认情况下查询会在页面加载时在后台重新获取。你可能希望使用更高的 `staleTime` 来避免这种双重获取，特别是在没有缓存标记时。

这种过时查询的重新获取非常适合在 CDN 中缓存标记！可以将页面本身的缓存时间设置得较高以避免在服务端重新渲染页面，但将查询的 `staleTime` 设置得较低以确保数据在用户访问页面时立即在后台重新获取。也许你想将页面缓存一周，但如果数据超过一天就在页面加载时自动重新获取？

### 服务端高内存消耗

如果为每个请求创建 `QueryClient`，Vue Query 会为该客户端创建独立的缓存，该缓存在 `gcTime` 期间保留在内存中。如果在该期间内有大量请求，可能会导致服务端内存消耗过高。

在服务端，`gcTime` 默认为 `Infinity`，这会禁用手动垃圾回收，并在请求完成后自动清除内存。如果显式设置了非 Infinity 的 `gcTime`，则需要负责提前清除缓存。

为了在不再需要时清除缓存并降低内存消耗，可以在请求处理完毕且脱水状态已发送到客户端后调用 [`queryClient.clear()`](../../../../reference/QueryClient/#queryclientclear)。

或者，可以设置较小的 `gcTime`。
