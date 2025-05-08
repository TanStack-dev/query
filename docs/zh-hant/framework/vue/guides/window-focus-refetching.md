---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-08T20:17:24.487Z'
id: window-focus-refetching
title: Window Focus Refetching
ref: docs/zh-hant/framework/react/guides/window-focus-refetching.md
replace:
  '@tanstack/react-query': '@tanstack/vue-query'
---

[//]: # 'Example'

```js
const vueQueryPluginOptions: VueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  },
}
app.use(VueQueryPlugin, vueQueryPluginOptions)
```

[//]: # 'Example'
[//]: # 'ReactNative'
[//]: # 'ReactNative'
