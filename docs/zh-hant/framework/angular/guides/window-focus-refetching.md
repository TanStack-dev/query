---
source-updated-at: '2025-03-01T21:43:55.000Z'
translation-updated-at: '2025-05-08T20:24:19.843Z'
id: window-focus-refetching
title: Window Focus Refetching
ref: docs/zh-hant/framework/react/guides/window-focus-refetching.md
replace:
  '@tanstack/react-query': '@tanstack/angular-query-experimental'
---

[//]: # 'Example'

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideTanStackQuery(
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false, // default: true
          },
        },
      }),
    ),
  ],
}
```

[//]: # 'Example'
[//]: # 'Example2'

```ts
injectQuery(() => ({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  refetchOnWindowFocus: false,
}))
```

[//]: # 'Example2'
[//]: # 'ReactNative'
[//]: # 'ReactNative'
