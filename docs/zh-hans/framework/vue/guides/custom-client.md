---
source-updated-at: '2024-05-06T05:23:35.000Z'
translation-updated-at: '2025-05-06T16:13:50.563Z'
id: custom-client
title: 自定义客户端
---

### 自定义客户端 (Custom client)

Vue Query 允许为 Vue 上下文提供自定义的 `QueryClient`。

当您需要预先创建 `QueryClient` 以与其他无法访问 Vue 上下文的库集成时，这个功能会非常有用。

因此，`VueQueryPlugin` 接受 `QueryClientConfig` 或 `QueryClient` 作为插件选项。

如果您提供 `QueryClientConfig`，`QueryClient` 实例将在内部创建并注入 Vue 上下文。

```tsx
const vueQueryPluginOptions: VueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: { queries: { staleTime: 3600 } },
  },
}
app.use(VueQueryPlugin, vueQueryPluginOptions)
```

```tsx
const myClient = new QueryClient(queryClientConfig)
const vueQueryPluginOptions: VueQueryPluginOptions = {
  queryClient: myClient,
}
app.use(VueQueryPlugin, vueQueryPluginOptions)
```

### 自定义上下文键 (Custom context key)

您还可以自定义 `QueryClient` 在 Vue 上下文中可访问的键名。如果您希望在同一个页面上避免多个 Vue2 应用之间的命名冲突，这会很有帮助。

此功能同时适用于默认和自定义的 `QueryClient`。

```tsx
const vueQueryPluginOptions: VueQueryPluginOptions = {
  queryClientKey: 'Foo',
}
app.use(VueQueryPlugin, vueQueryPluginOptions)
```

```tsx
const myClient = new QueryClient(queryClientConfig)
const vueQueryPluginOptions: VueQueryPluginOptions = {
  queryClient: myClient,
  queryClientKey: 'Foo',
}
app.use(VueQueryPlugin, vueQueryPluginOptions)
```

要使用自定义客户端键，您需要在查询选项中提供它：

```js
useQuery({
  queryKey: ['query1'],
  queryFn: fetcher,
  queryClientKey: 'foo',
})
```

在内部，自定义键会与默认查询键作为后缀组合。但用户无需关心这一点。

```tsx
const vueQueryPluginOptions: VueQueryPluginOptions = {
  queryClientKey: 'Foo',
}
app.use(VueQueryPlugin, vueQueryPluginOptions) // -> VUE_QUERY_CLIENT:Foo
```
