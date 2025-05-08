---
source-updated-at: '2024-05-06T05:23:35.000Z'
translation-updated-at: '2025-05-08T20:19:04.830Z'
id: custom-client
title: 自訂客戶端
---

### 自訂客戶端 (Custom client)

Vue Query 允許為 Vue 的上下文 (context) 提供自訂的 `QueryClient`。

當您需要預先建立 `QueryClient` 以整合其他無法存取 Vue 上下文的函式庫時，這會非常實用。

因此，`VueQueryPlugin` 接受 `QueryClientConfig` 或 `QueryClient` 作為外掛 (plugin) 選項。

如果您提供 `QueryClientConfig`，則會內部建立 `QueryClient` 實例並提供給 Vue 上下文。

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

### 自訂上下文鍵 (Custom context key)

您也可以自訂 `QueryClient` 在 Vue 上下文中可存取的鍵名 (key)。這在您想要避免 Vue2 同頁面多個應用程式之間的名稱衝突時特別有用。

此功能同時適用於預設和自訂的 `QueryClient`。

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

若要使用自訂的客戶端鍵名，您必須在查詢選項 (query options) 中提供它：

```js
useQuery({
  queryKey: ['query1'],
  queryFn: fetcher,
  queryClientKey: 'foo',
})
```

在內部，自訂鍵名會與預設查詢鍵名結合作為後綴 (suffix)，但使用者無需擔心這一點。

```tsx
const vueQueryPluginOptions: VueQueryPluginOptions = {
  queryClientKey: 'Foo',
}
app.use(VueQueryPlugin, vueQueryPluginOptions) // -> VUE_QUERY_CLIENT:Foo
```
