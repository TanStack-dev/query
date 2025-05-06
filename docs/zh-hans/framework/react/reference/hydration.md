---
source-updated-at: '2025-02-17T12:52:17.000Z'
translation-updated-at: '2025-05-06T04:41:17.708Z'
id: hydration
title: 注水
---

## `dehydrate`

`dehydrate` 会创建一个 `cache` 的冻结表示，后续可通过 `HydrationBoundary` 或 `hydrate` 进行水合。这在将预取查询从服务端传递到客户端，或将查询持久化到 localStorage 或其他持久化存储时非常有用。默认情况下，它仅包含当前成功的查询。

```tsx
import { dehydrate } from '@tanstack/react-query'

const dehydratedState = dehydrate(queryClient, {
  shouldDehydrateQuery,
  shouldDehydrateMutation,
})
```

**选项**

- `client: QueryClient`
  - **必填**
  - 需要被脱水的 `queryClient`
- `options: DehydrateOptions`
  - 可选
  - `shouldDehydrateMutation: (mutation: Mutation) => boolean`
    - 可选
    - 是否对变更 (mutation) 进行脱水
    - 该函数会针对缓存中的每个变更被调用
      - 返回 `true` 表示将此变更包含在脱水中，否则返回 `false`
    - 默认仅包含暂停的变更
    - 若希望在保留默认行为的同时扩展此函数，可在返回语句中导入并执行 `defaultShouldDehydrateMutation`
  - `shouldDehydrateQuery: (query: Query) => boolean`
    - 可选
    - 是否对查询进行脱水
    - 该函数会针对缓存中的每个查询被调用
      - 返回 `true` 表示将此查询包含在脱水中，否则返回 `false`
    - 默认仅包含成功的查询
    - 若希望在保留默认行为的同时扩展此函数，可在返回语句中导入并执行 `defaultShouldDehydrateQuery`
  - `serializeData?: (data: any) => any` 用于在脱水期间转换（序列化）数据的函数
  - `shouldRedactErrors?: (error: unknown) => boolean`
    - 可选
    - 是否在脱水过程中对来自服务端的错误进行脱敏
    - 该函数会针对缓存中的每个错误被调用
      - 返回 `true` 表示对此错误脱敏，否则返回 `false`
    - 默认会对所有错误脱敏

**返回值**

- `dehydratedState: DehydratedState`
  - 包含后续水合 `queryClient` 所需的所有内容
  - 你**不应**依赖此响应的具体格式，它不属于公共 API 且可能随时变更
  - 此结果未经过序列化处理，如有需要请自行序列化

### 限制

某些存储系统（如浏览器的 [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)）要求值必须可 JSON 序列化。如果你需要脱水无法自动序列化为 JSON 的值（如 `Error` 或 `undefined`），必须自行序列化。由于默认仅包含成功的查询，若要同时包含 `Errors`，需提供 `shouldDehydrateQuery`，例如：

```tsx
// 服务端
const state = dehydrate(client, { shouldDehydrateQuery: () => true }) // 同时包含 Errors
const serializedState = mySerialize(state) // 将 Error 实例转换为对象

// 客户端
const state = myDeserialize(serializedState) // 将对象转换回 Error 实例
hydrate(client, state)
```

## `hydrate`

`hydrate` 将先前脱水的状态添加回 `cache` 中。

```tsx
import { hydrate } from '@tanstack/react-query'

hydrate(queryClient, dehydratedState, options)
```

**选项**

- `client: QueryClient`
  - **必填**
  - 要注入状态的 `queryClient`
- `dehydratedState: DehydratedState`
  - **必填**
  - 要注入到客户端的状态
- `options: HydrateOptions`
  - 可选
  - `defaultOptions: DefaultOptions`
    - 可选
    - `mutations: MutationOptions` 用于已水合变更的默认变更选项
    - `queries: QueryOptions` 用于已水合查询的默认查询选项
    - `deserializeData?: (data: any) => any` 在将数据放入缓存前对其进行转换（反序列化）的函数
  - `queryClient?: QueryClient`
    - 使用此选项可指定自定义 QueryClient。否则将使用最近上下文中的 QueryClient

### 限制

若尝试水合的查询已存在于 queryCache 中，`hydrate` 仅会在数据比缓存中现有数据更新时覆盖它们。否则，这些数据**不会**被应用。

[//]: # 'HydrationBoundary'

## `HydrationBoundary`

`HydrationBoundary` 将先前脱水的状态注入到由 `useQueryClient()` 返回的 `queryClient` 中。如果客户端已包含数据，新查询将基于更新时间戳智能合并。

```tsx
import { HydrationBoundary } from '@tanstack/react-query'

function App() {
  return <HydrationBoundary state={dehydratedState}>...</HydrationBoundary>
}
```

> 注意：只有 `queries` 可以通过 `HydrationBoundary` 进行脱水

**选项**

- `state: DehydratedState`
  - 要水合的状态
- `options: HydrateOptions`
  - 可选
  - `defaultOptions: QueryOptions`
    - 用于已水合查询的默认查询选项
  - `queryClient?: QueryClient`
    - 使用此选项可指定自定义 QueryClient。否则将使用最近上下文中的 QueryClient

[//]: # 'HydrationBoundary'
