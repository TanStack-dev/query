---
source-updated-at: '2025-03-19T08:29:27.000Z'
translation-updated-at: '2025-05-06T04:15:15.834Z'
id: migrating-to-tanstack-query-5
title: 迁移到 v5
---
## 重大变更

v5 是一个主要版本，因此需要注意以下重大变更：

### 仅支持单一对象参数签名

`useQuery` 及相关函数在 TypeScript 中曾有多种重载形式——即函数可以通过不同方式调用。这不仅在类型维护上困难，还需要运行时检查第一和第二参数的类型以正确创建选项。

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

为简化重载移除的迁移工作，v5 提供了代码迁移工具。

> 该工具会尽力协助迁移重大变更，但请仔细检查生成的代码！此外，某些边缘情况可能无法被工具识别，请留意日志输出。

如需针对 `.js` 或 `.jsx` 文件运行，请使用以下命令：

```
npx jscodeshift@latest ./path/to/src/ \
  --extensions=js,jsx \
  --transform=./node_modules/@tanstack/react-query/build/codemods/src/v5/remove-overloads/remove-overloads.cjs
```

如需针对 `.ts` 或 `.tsx` 文件运行，请使用以下命令：

```
npx jscodeshift@latest ./path/to/src/ \
  --extensions=ts,tsx \
  --parser=tsx \
  --transform=./node_modules/@tanstack/react-query/build/codemods/src/v5/remove-overloads/remove-overloads.cjs
```

注意：对于 `TypeScript` 文件，必须使用 `tsx` 作为解析器，否则代码迁移工具可能无法正确应用！

**注意：** 应用代码迁移工具可能会破坏代码格式，完成后请务必运行 `prettier` 和/或 `eslint`！

关于代码迁移工具工作原理的说明：

- 一般情况下，我们会寻找理想情况：当第一个参数是对象表达式且包含 "queryKey" 或 "mutationKey" 属性（取决于正在转换的钩子/方法调用）。如果符合此条件，则代码已匹配新签名，工具不会修改。🎉
- 如果不符合上述条件，工具会检查第一个参数是否为数组表达式或引用数组表达式的标识符。如果是，则将其放入对象表达式中作为第一个参数。
- 如果可以推断对象参数，工具会尝试将现有属性复制到新创建的对象中。
- 如果工具无法推断用法，则会在控制台输出消息，包含文件名和代码行号。此时需要手动迁移。
- 如果转换导致错误，控制台也会显示消息，提示发生意外情况，请手动迁移。

### 移除了 `useQuery`（及 `QueryObserver`）中的回调函数

`onSuccess`、`onError` 和 `onSettled` 已从查询中移除（突变中仍保留）。请参阅 [此 RFC](https://github.com/TanStack/query/discussions/5279) 了解变更动机及替代方案。

### `refetchInterval` 回调函数现在仅接收 `query` 参数

这统一了回调调用方式（`refetchOnWindowFocus`、`refetchOnMount` 和 `refetchOnReconnect` 回调也仅接收查询参数），并修复了当回调获取通过 `select` 转换的数据时的一些类型问题。

```tsx
- refetchInterval: number | false | ((data: TData | undefined, query: Query) => number | false | undefined) // [!code --]
+ refetchInterval: number | false | ((query: Query) => number | false | undefined) // [!code ++]
```

仍可通过 `query.state.data` 访问数据，但不会是通过 `select` 转换后的数据。如需访问转换后的数据，可对 `query.state.data` 再次调用转换函数。

### 从 `useQuery` 中移除了 `remove` 方法

此前，`remove` 方法用于从 `queryCache` 中移除查询而不通知观察者。通常用于强制移除不再需要的数据，例如用户注销时。

但当查询仍处于活动状态时这样做没有意义，因为下次重新渲染会触发硬加载状态。

如需移除查询，可使用 `queryClient.removeQueries({queryKey: key})`：

```tsx
const queryClient = useQueryClient()
const query = useQuery({ queryKey, queryFn })

query.remove() // [!code --]
queryClient.removeQueries({ queryKey }) // [!code ++]
```

### 最低要求的 TypeScript 版本现为 4.7

主要因为修复了一个重要的类型推断问题。详情请参阅 [TypeScript issue](https://github.com/microsoft/TypeScript/issues/43371)。

### 从 `useQuery` 中移除了 `isDataEqual` 选项

此前，该函数用于指示是使用先前的 `data`（`true`）还是新数据（`false`）作为查询的解析数据。

可通过向 `structuralSharing` 传递函数实现相同功能：

```tsx
 import { replaceEqualDeep } from '@tanstack/react-query'

- isDataEqual: (oldData, newData) => customCheck(oldData, newData) // [!code --]
+ structuralSharing: (oldData, newData) => customCheck(oldData, newData) ? oldData : replaceEqualDeep(oldData, newData) // [!code ++]
```

### 移除了已弃用的自定义日志记录器

自定义日志记录器在 v4 中已弃用，在此版本中移除。日志记录仅在开发模式下有效，而在此模式下传递自定义日志记录器并无必要。

### 支持的浏览器

我们更新了 browserslist 以生成更现代、性能更好且体积更小的包。要求详见 [此处](../../installation#requirements)。

### 私有类字段和方法

TanStack Query 始终在类中有私有字段和方法，但它们并非真正的私有——仅在 `TypeScript` 中是私有的。现在我们使用 [ECMAScript 私有类特性](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields)，意味着这些字段在运行时真正私有，无法从外部访问。

### 将 `cacheTime` 重命名为 `gcTime`

几乎每个人都误解了 `cacheTime`。它听起来像是"数据缓存的时间"，但这是错误的。

只要查询仍在使用，`cacheTime` 就不起作用。仅在查询不再使用时生效。超时后，数据会被"垃圾回收"以避免缓存增长。

`gc` 指"垃圾回收"时间。这更技术性，但在计算机科学中是 [众所周知的缩写](<https://en.wikipedia.org/wiki/Garbage_collection_(computer_science)>)。

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

为使 `useErrorBoundary` 选项更框架无关，并避免与 React 钩子的 "`use`" 前缀和 "ErrorBoundary" 组件名称混淆，现重命名为 `throwOnError` 以更准确反映其功能。

### TypeScript：`Error` 现在是错误的默认类型而非 `unknown`

尽管在 JavaScript 中可以 `throw` 任何内容（这使得 `unknown` 是最正确的类型），但几乎总是抛出 `Error`（或其子类）。此变更使在 TypeScript 中处理 `error` 字段对大多数情况更简单。

如需抛出非 Error 的内容，现在需自行设置泛型：

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

### 移除了 eslint `prefer-query-object-syntax` 规则

由于现在唯一支持的语法是对象语法，此规则不再需要。

### 用 `placeholderData` 恒等函数替代 `keepPreviousData`

我们移除了 `keepPreviousData` 选项和 `isPreviousData` 标志，因为它们的功能与 `placeholderData` 和 `isPlaceholderData` 标志基本相同。

为实现与 `keepPreviousData` 相同的功能，我们向 `placeholderData` 添加了先前查询 `data` 作为参数，它接受一个恒等函数。因此只需向 `placeholderData` 提供恒等函数或使用 Tanstack Query 包含的 `keepPreviousData` 函数。

> 注意：`useQueries` 不会在 `placeholderData` 函数中接收 `previousData` 作为参数。这是由于传入数组的查询的动态性质可能导致占位符和 `queryFn` 的结果形状不同。

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

在 Tanstack Query 的上下文中，恒等函数指始终返回其提供的参数（即数据）而不做更改的函数。

```ts
useQuery({
  queryKey,
  queryFn,
  placeholderData: (previousData, previousQuery) => previousData, // 与 `keepPreviousData` 行为相同的恒等函数
})
```

但此变更有一些注意事项：

- `placeholderData` 会始终进入 `success` 状态，而 `keepPreviousData` 给出先前查询的状态。如果数据成功获取后遇到后台刷新错误，状态可能是 `error`。但由于错误本身未共享，我们决定坚持 `placeholderData` 的行为。
- `keepPreviousData` 提供先前数据的 `dataUpdatedAt` 时间戳，而使用 `placeholderData` 时 `dataUpdatedAt` 保持为 `0`。如需在屏幕上连续显示该时间戳可能会不便，但可通过 `useEffect` 解决：

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

现在仅使用 `visibilitychange` 事件。这是可行的，因为我们仅支持支持 `visibilitychange` 事件的浏览器。这修复了 [此处列出](https://github.com/TanStack/query/pull/4805) 的一系列问题。

### 网络状态不再依赖 `navigator.onLine` 属性

`navigator.onLine` 在基于 Chromium 的浏览器中效果不佳。存在 [许多问题](https://bugs.chromium.org/p/chromium/issues/list?q=navigator.online) 关于误报，导致查询被错误标记为 `offline`。

为避免此问题，我们现在始终以 `online: true` 开始，仅监听 `online` 和 `offline` 事件来更新状态。

这应减少误报的可能性，但对于通过 serviceWorkers 加载的离线应用，可能意味着误报，因为这些应用即使没有互联网连接也能工作。

### 移除自定义 `context` 属性，改用自定义 `queryClient` 实例

在 v4 中，我们引入了向所有 react-query 钩子传递自定义 `context` 的可能性。这在使用微前端时实现了适当的隔离。

然而，`context` 是仅 React 的特性。`context` 所做的只是让我们访问 `queryClient`。我们可以通过允许直接传入自定义 `queryClient` 实现相同的隔离。
这反过来使其他框架能够以框架无关的方式拥有相同的功能。

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

在 v4 中，我们引入了通过 `refetchPage` 函数定义无限查询中要重新获取的页面的可能性。

然而，重新获取所有页面可能导致 UI 不一致。此外，此选项在例如 `queryClient.refetchQueries` 上可用，但仅对无限查询有效，而非"普通"查询。

v5 为无限查询引入了新的 `maxPages` 选项，以限制存储在查询数据中和重新获取的页面数量。此新功能处理了最初为 `refetchPage` 功能识别的用例，而无需相关的问题。

### 新的 `dehydrate` API

传递给 `dehydrate` 的选项已简化。查询和突变始终根据默认函数实现进行脱水。要更改此行为，可以使用移除的布尔选项 `dehydrateMutations` 和 `dehydrateQueries` 的函数等效项 `shouldDehydrateQuery` 或 `shouldDehydrateMutation`。要完全不水合查询/突变，传入 `() => false`。

```tsx
- dehydrateMutations?: boolean // [!code --]
- dehydrateQueries?: boolean // [!code --]
```

### 无限查询现在需要 `initialPageParam`

此前，我们向 `queryFn` 传递 `undefined` 作为 `pageParam`，并且可以在 `queryFn` 函数签名中为 `pageParam` 参数分配默认值。这导致在 `queryCache` 中存储不可序列化的 `undefined`。

现在，必须向无限查询选项显式传递 `initialPageParam`。这将用作第一页的 `pageParam`：

```tsx
useInfiniteQuery({
   queryKey,
-  queryFn: ({ pageParam = 0 }) => fetchSomething(pageParam), // [!code --]
+  queryFn: ({ pageParam }) => fetchSomething(pageParam), // [!code ++]
+  initialPageParam: 0, // [!code ++]
   getNextPageParam: (lastPage) => lastPage.next,
})
```

### 移除了无限查询的手动模式

此前，我们允许通过直接向 `fetchNextPage` 或 `fetchPreviousPage` 传递 `pageParam` 值来覆盖从 `getNextPageParam` 或 `getPreviousPageParam` 返回的 `pageParams`。此功能在重新获取时完全无效，且不广为人知或使用。这也意味着无限查询现在必须定义 `getNextPageParam`。

### 从 `getNextPageParam` 或 `getPreviousPageParam` 返回 `null` 现在表示没有更多可用页面

在 v4 中，需要显式返回 `undefined` 表示没有更多可用页面。我们扩展了此检查以包括 `null
