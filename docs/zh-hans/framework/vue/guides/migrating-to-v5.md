---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-06T16:08:27.091Z'
id: migrating-to-tanstack-query-5
title: 迁移到 v5
---
## 重大变更

v5 是一个主要版本，需要注意以下破坏性变更：

### 仅支持单一对象签名

`useQuery` 及其相关函数在 TypeScript 中曾有多种重载形式——即函数的不同调用方式。这不仅在类型维护上困难，还需要运行时检查第一和第二参数的类型以正确创建选项。

现在仅支持对象格式：

```tsx
useQuery(key, fn, options) // [!code --]
useQuery({ queryKey, queryFn, ...options }) // [!code ++]
useInfiniteQuery(key, fn, options) // [!code --]
useInfiniteQuery({ queryKey, queryFn, ...options }) // [!code ++]
useMutation(fn, options) // [!code --]
useMutation({ mutationFn, ...options }) // [!code ++]
useIsFetching(key, filters) // [!code --]
useIsFetching({ queryKey, ...filters }) // [!code ++]
useIsMutating(key, filters) // [!code --]
useIsMutating({ mutationKey, ...filters }) // [!code ++]
```

```tsx
queryClient.isFetching(key, filters) // [!code --]
queryClient.isFetching({ queryKey, ...filters }) // [!code ++]
queryClient.ensureQueryData(key, filters) // [!code --]
queryClient.ensureQueryData({ queryKey, ...filters }) // [!code ++]
queryClient.getQueriesData(key, filters) // [!code --]
queryClient.getQueriesData({ queryKey, ...filters }) // [!code ++]
queryClient.setQueriesData(key, updater, filters, options) // [!code --]
queryClient.setQueriesData({ queryKey, ...filters }, updater, options) // [!code ++]
queryClient.removeQueries(key, filters) // [!code --]
queryClient.removeQueries({ queryKey, ...filters }) // [!code ++]
queryClient.resetQueries(key, filters, options) // [!code --]
queryClient.resetQueries({ queryKey, ...filters }, options) // [!code ++]
queryClient.cancelQueries(key, filters, options) // [!code --]
queryClient.cancelQueries({ queryKey, ...filters }, options) // [!code ++]
queryClient.invalidateQueries(key, filters, options) // [!code --]
queryClient.invalidateQueries({ queryKey, ...filters }, options) // [!code ++]
queryClient.refetchQueries(key, filters, options) // [!code --]
queryClient.refetchQueries({ queryKey, ...filters }, options) // [!code ++]
queryClient.fetchQuery(key, fn, options) // [!code --]
queryClient.fetchQuery({ queryKey, queryFn, ...options }) // [!code ++]
queryClient.prefetchQuery(key, fn, options) // [!code --]
queryClient.prefetchQuery({ queryKey, queryFn, ...options }) // [!code ++]
queryClient.fetchInfiniteQuery(key, fn, options) // [!code --]
queryClient.fetchInfiniteQuery({ queryKey, queryFn, ...options }) // [!code ++]
queryClient.prefetchInfiniteQuery(key, fn, options) // [!code --]
queryClient.prefetchInfiniteQuery({ queryKey, queryFn, ...options }) // [!code ++]
```

```tsx
queryCache.find(key, filters) // [!code --]
queryCache.find({ queryKey, ...filters }) // [!code ++]
queryCache.findAll(key, filters) // [!code --]
queryCache.findAll({ queryKey, ...filters }) // [!code ++]
```

### `queryClient.getQueryData` 现在仅接受 `queryKey` 作为参数

`queryClient.getQueryData` 的参数改为仅接受 `queryKey`：

```tsx
queryClient.getQueryData(queryKey, filters) // [!code --]
queryClient.getQueryData(queryKey) // [!code ++]
```

### `queryClient.getQueryState` 现在仅接受 `queryKey` 作为参数

`queryClient.getQueryState` 的参数改为仅接受 `queryKey`：

```tsx
queryClient.getQueryState(queryKey, filters) // [!code --]
queryClient.getQueryState(queryKey) // [!code ++]
```

#### 代码迁移工具 (Codemod)

为了简化移除重载的迁移过程，v5 提供了一个代码迁移工具。

> 该工具会尽力帮助迁移破坏性变更，但请仔细检查生成的代码！此外，有些边缘情况无法通过工具检测，请留意控制台输出。

如需对 `.js` 或 `.jsx` 文件运行迁移工具，请使用以下命令：

```
npx jscodeshift@latest ./path/to/src/ \
  --extensions=js,jsx \
  --transform=./node_modules/@tanstack/react-query/build/codemods/src/v5/remove-overloads/remove-overloads.cjs
```

如需对 `.ts` 或 `.tsx` 文件运行迁移工具，请使用以下命令：

```
npx jscodeshift@latest ./path/to/src/ \
  --extensions=ts,tsx \
  --parser=tsx \
  --transform=./node_modules/@tanstack/react-query/build/codemods/src/v5/remove-overloads/remove-overloads.cjs
```

注意：对于 `TypeScript`，必须使用 `tsx` 作为解析器，否则迁移工具可能无法正确应用！

**注意：** 应用迁移工具可能会破坏代码格式，完成后请运行 `prettier` 和/或 `eslint`！

关于迁移工具的工作原理：

- 一般情况下，我们会检查第一个参数是否为包含 `queryKey` 或 `mutationKey` 属性的对象表达式（取决于正在转换的钩子/方法调用）。如果是，则代码已符合新签名，无需修改。🎉
- 如果不满足上述条件，迁移工具会检查第一个参数是否为数组表达式或引用数组表达式的标识符。如果是，则将其放入对象表达式中作为第一个参数。
- 如果可以推断对象参数，迁移工具会尝试将现有属性复制到新创建的对象中。
- 如果无法推断用法，控制台会输出提示信息，包含文件名和行号，此时需要手动迁移。
- 如果转换导致错误，控制台也会输出提示，请手动处理。

### `useQuery`（及 `QueryObserver`）的回调函数已被移除

`onSuccess`、`onError` 和 `onSettled` 已从查询中移除，但突变 (Mutation) 中仍保留。请参阅 [此 RFC](https://github.com/TanStack/query/discussions/5279) 了解变更动机及替代方案。

### `refetchInterval` 回调函数现在仅接收 `query` 参数

这统一了回调函数的调用方式（`refetchOnWindowFocus`、`refetchOnMount` 和 `refetchOnReconnect` 回调也仅接收 `query` 参数），并修复了当回调获取通过 `select` 转换的数据时的类型问题。

```tsx
- refetchInterval: number | false | ((data: TData | undefined, query: Query) => number | false | undefined) // [!code --]
+ refetchInterval: number | false | ((query: Query) => number | false | undefined) // [!code ++]
```

仍可通过 `query.state.data` 访问数据，但不会包含通过 `select` 转换后的数据。如需访问转换后的数据，可以对 `query.state.data` 再次调用转换函数。

### `useQuery` 中的 `remove` 方法已被移除

此前，`remove` 方法用于从 `queryCache` 中移除查询而不通知观察者。通常用于强制移除不再需要的数据，例如用户注销时。

但当查询仍处于活动状态时这样做意义不大，因为它会在下次重新渲染时触发硬加载状态。

如需移除查询，可使用 `queryClient.removeQueries({queryKey: key})`：

```tsx
const queryClient = useQueryClient()
const query = useQuery({ queryKey, queryFn })

query.remove() // [!code --]
queryClient.removeQueries({ queryKey }) // [!code ++]
```

### 最低 TypeScript 版本要求提升至 4.7

主要因为修复了一个重要的类型推断问题。详见 [TypeScript 问题](https://github.com/microsoft/TypeScript/issues/43371)。

### `useQuery` 中的 `isDataEqual` 选项已被移除

此前，该函数用于指示是使用旧数据 (`true`) 还是新数据 (`false`) 作为查询的解析数据。

现在可以通过向 `structuralSharing` 传递函数实现相同功能：

```tsx
 import { replaceEqualDeep } from '@tanstack/react-query'

- isDataEqual: (oldData, newData) => customCheck(oldData, newData) // [!code --]
+ structuralSharing: (oldData, newData) => customCheck(oldData, newData) ? oldData : replaceEqualDeep(oldData, newData) // [!code ++]
```

### 已弃用的自定义日志记录器已被移除

自定义日志记录器在 v4 中已弃用，并在本版本中移除。日志记录仅在开发模式下有效，而传递自定义日志记录器并非必要。

### 支持的浏览器

我们更新了 browserslist 以生成更现代、高效且体积更小的包。详见 [要求说明](../../installation#requirements)。

### 私有类字段和方法

TanStack Query 的类中一直有私有字段和方法，但它们并非真正的私有——仅在 TypeScript 中标记为私有。现在使用了 [ECMAScript 私有类特性](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields)，这些字段在运行时也真正私有，无法从外部访问。

### 将 `cacheTime` 重命名为 `gcTime`

很多人误解了 `cacheTime` 的含义。它听起来像是“数据缓存的时间”，但实际并非如此。

`cacheTime` 在查询仍在使用时不生效，仅在查询变为未使用后开始计时。时间到期后，数据会被“垃圾回收”以避免缓存无限增长。

`gc` 指“垃圾回收 (garbage collect)”时间。虽然更技术化，但这是计算机科学中 [广为人知的缩写](<https://en.wikipedia.org/wiki/Garbage_collection_(computer_science)>)。

```tsx
const MINUTE = 1000 * 60;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
-      cacheTime: 10 * MINUTE, // [!code --]
+      gcTime: 10 * MINUTE, // [!code ++]
    },
  },
})
```

### `useErrorBoundary` 选项已重命名为 `throwOnError`

为了使 `useErrorBoundary` 选项更框架无关，并避免与 React 钩子的 `use` 前缀和“ErrorBoundary”组件名称混淆，现更名为 `throwOnError` 以更准确反映其功能。

### TypeScript：错误类型默认从 `unknown` 改为 `Error`

虽然在 JavaScript 中可以抛出任何值（这使得 `unknown` 是最准确的类型），但大多数情况下抛出的都是 `Error`（或其子类）。这一变更使得在 TypeScript 中处理 `error` 字段更加方便。

如需抛出非 Error 类型的值，现在需要自行设置泛型：

```ts
useQuery<number, string>({
  queryKey: ['some-query'],
  queryFn: async () => {
    if (Math.random() > 0.5) {
      throw 'some error'
    }
    return 42
  },
})
```

如需全局设置不同类型的错误，请参阅 [TypeScript 指南](../typescript.md#registering-a-global-error)。

### 移除了 `prefer-query-object-syntax` ESLint 规则

由于现在仅支持对象语法，此规则不再需要。

### 移除 `keepPreviousData`，改用 `placeholderData` 恒等函数

我们移除了 `keepPreviousData` 选项和 `isPreviousData` 标志，因为它们的功能与 `placeholderData` 和 `isPlaceholderData` 标志基本相同。

为实现与 `keepPreviousData` 相同的功能，我们在 `placeholderData` 中加入了前次查询的 `data` 作为参数，该参数接受一个恒等函数。因此只需向 `placeholderData` 提供恒等函数或使用 TanStack Query 内置的 `keepPreviousData` 函数即可。

> 注意：`useQueries` 不会在 `placeholderData` 函数中接收 `previousData` 参数，这是因为传入数组的查询具有动态性，可能导致占位数据与 `queryFn` 返回的结果形状不同。

```tsx
import {
   useQuery,
+  keepPreviousData // [!code ++]
} from "@tanstack/react-query";

const {
   data,
-  isPreviousData, // [!code --]
+  isPlaceholderData, // [!code ++]
} = useQuery({
  queryKey,
  queryFn,
- keepPreviousData: true, // [!code --]
+ placeholderData: keepPreviousData // [!code ++]
});
```

在 TanStack Query 的上下文中，恒等函数指始终返回其输入参数（即数据）不变的函数。

```ts
useQuery({
  queryKey,
  queryFn,
  placeholderData: (previousData, previousQuery) => previousData, // 与 `keepPreviousData` 行为相同的恒等函数
})
```

但需要注意以下变更带来的影响：

- `placeholderData` 会始终将查询置于 `success` 状态，而 `keepPreviousData` 会保留前次查询的状态。如果成功获取数据后后台刷新出错，状态可能是 `error`。但由于错误本身未被共享，我们决定保持 `placeholderData` 的行为。
- `keepPreviousData` 会提供前次数据的 `dataUpdatedAt` 时间戳，而使用 `placeholderData` 时 `dataUpdatedAt` 保持为 `0`。如果需要在界面上持续显示该时间戳，可以通过 `useEffect` 解决：

  ```ts
  const [updatedAt, setUpdatedAt] = useState(0)

  const { data, dataUpdatedAt } = useQuery({
    queryKey: ['projects', page],
    queryFn: () => fetchProjects(page),
  })

  useEffect(() => {
    if (dataUpdatedAt > updatedAt) {
      setUpdatedAt(dataUpdatedAt)
    }
  }, [dataUpdatedAt])
  ```

### 窗口焦点重新获取不再监听 `focus` 事件

现在仅使用 `visibilitychange` 事件，因为我们仅支持支持该事件的浏览器。这修复了 [列出的诸多问题](https://github.com/TanStack/query/pull/4805)。

### 网络状态不再依赖 `navigator.onLine` 属性

`navigator.onLine` 在基于 Chromium 的浏览器中表现不佳，存在 [许多误报问题](https://bugs.chromium.org/p/chromium/issues/list?q=navigator.online)，导致查询被错误标记为 `offline`。

为解决此问题，现在初始状态始终为 `online: true`，仅通过监听 `online` 和 `offline` 事件更新状态。

这应能减少误报，但对于通过 serviceWorkers 加载的离线应用，可能导致误报（因为这些应用即使没有网络连接也能工作）。

### 移除自定义 `context` 属性，改用自定义 `queryClient` 实例

在 v4 中，我们引入了向所有 react-query 钩子传递自定义 `context` 的功能，以实现微前端场景下的隔离。

但 `context` 是 React 特有的功能，其作用仅是让我们访问 `queryClient`。通过直接传递自定义 `queryClient` 可实现相同的隔离效果，同时使其他框架也能以框架无关的方式获得此功能。

```tsx
import { queryClient } from './my-client'

const { data } = useQuery(
  {
    queryKey: ['users', id],
    queryFn: () => fetch(...),
-   context: customContext // [!code --]
  },
+  queryClient, // [!code ++]
)
```

### 移除 `refetchPage`，改用 `maxPages`

在 v4 中，我们引入了通过 `refetchPage` 函数定义无限查询中需要重新获取的页面的功能。

但重新获取所有页面可能导致 UI 不一致。此外，该选项在如 `queryClient.refetchQueries` 中也可用，但仅对无限查询有效，对“普通”查询无效。

v5 为无限查询新增了 `maxPages` 选项，用于限制存储在查询数据中和重新获取的页面数量。这一新特性解决了最初为 `refetchPage` 设计的用例，同时避免了相关问题。

### 新的 `dehydrate` API

`dehydrate` 的选项已简化。查询和突变始终会根据默认函数实现进行脱水。要改变此行为，可以使用新增的函数选项 `shouldDehydrateQuery` 或 `shouldDehydrateMutation` 替代已移除的布尔选项 `dehydrateMutations` 和 `dehydrateQueries`。如需完全不脱水查询/突变，可传入 `() => false`。

```tsx
- dehydrateMutations?: boolean // [!code --]
- dehydrateQueries?: boolean // [!code --]
```

### 无限查询现在需要 `initialPageParam`

此前，我们向 `queryFn` 传递 `undefined` 作为 `pageParam`，并可在 `queryFn` 函数签名中为 `pageParam` 参数设置默认值。这导致在 `queryCache` 中存储了不可序列化的 `undefined`。

现在，必须向无限查询选项显式传递 `initialPageParam`，它将作为第一页的 `pageParam`：

```tsx
useInfiniteQuery({
   queryKey,
-  queryFn: ({ pageParam = 0 }) => fetchSomething(pageParam), // [!code --]
+  queryFn: ({ pageParam }) => fetchSomething(pageParam), // [!code ++]
+  initialPageParam: 0, // [!code ++]
   getNextPageParam: (lastPage) => lastPage.next,
})
```

### 无限查询的手动模式已被移除

此前，我们允许通过直接向 `fetchNextPage` 或 `fetchPreviousPage` 传递 `pageParam` 值来覆盖 `getNextPageParam` 或 `getPreviousPageParam` 返回的 `pageParams`。此特性在重新获取时完全无效，且使用率不高。这也意味着无限查询现在必须提供 `getNextPageParam`。

### 从 `getNextPageParam` 或 `getPreviousPageParam` 返回 `null` 现在表示没有更多页面

在 v4 中，需要显式返回 `undefined` 表示没有更多页面。现在这一检查扩展至包含 `null`。

### 服务器端不再重试

在服务器端，`retry` 现在默认为 `0` 而非 `3`。对于预获取，我们一直默认不
