---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:29:57.696Z'
id: typescript
title: TypeScript
---

React Query 现已采用 **TypeScript** 编写，确保库与您的项目具备类型安全！

注意事项：

- 当前类型系统要求使用 TypeScript **v4.7** 或更高版本
- 本仓库中的类型变更被视为**非破坏性变更**，通常以 **patch** 版本号发布（否则每个类型增强都会导致主版本号变更！）
- **强烈建议您将 react-query 包版本锁定到特定 patch 版本，并在升级时做好类型可能在任何版本间被修复或升级的准备**
- React Query 中与类型无关的公共 API 仍严格遵循语义化版本规范。

## 类型推断

React Query 中的类型通常能很好地流动，因此您通常无需自行添加类型注解

[//]: # 'TypeInference1'

```tsx
const { data } = useQuery({
  //    ^? const data: number | undefined
  queryKey: ['test'],
  queryFn: () => Promise.resolve(5),
})
```

[typescript playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgVwM4FMCKz1QJ5wC+cAZlBCHAORToCGAxjALQCOO+VAsAFC8MQAdqnhIAJnRh0icALwoM2XHgAUAbSqDkIAEa4qAXQA0cFQEo5APjgAFciGAYAdLVQQANgDd0KgKxmzXgB6ILgw8IA9AH5eIA)

[//]: # 'TypeInference1'
[//]: # 'TypeInference2'

```tsx
const { data } = useQuery({
  //      ^? const data: string | undefined
  queryKey: ['test'],
  queryFn: () => Promise.resolve(5),
  select: (data) => data.toString(),
})
```

[typescript playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgVwM4FMCKz1QJ5wC+cAZlBCHAORToCGAxjALQCOO+VAsAFC8MQAdqnhIAJnRh0icALwoM2XHgAUAbSox0IqgF0ANHBUBKOQD44ABXIhgGAHS1UEADYA3dCoCsxw0gwu6EwAXHASUuZhknT2MBAAyjBQwIIA5iaExrwA9Nlw+QUAegD8vEA)

[//]: # 'TypeInference2'

当您的 `queryFn` 具有明确定义的返回类型时，类型推断效果最佳。请注意大多数数据获取库默认返回 `any` 类型，因此请确保将其提取到具有正确类型的函数中：

[//]: # 'TypeInference3'

```tsx
const fetchGroups = (): Promise<Group[]> =>
  axios.get('/groups').then((response) => response.data)

const { data } = useQuery({ queryKey: ['groups'], queryFn: fetchGroups })
//      ^? const data: Group[] | undefined
```

[typescript playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgVwM4FMCKz1QJ5wC+cAZlBCHAORToCGAxjALQCOO+VAsAFCiSw4dAB7AIqUuUpURY1Nx68YeMOjgBxcsjBwAvIjjAAJgC44AO2QgARriK9eDCOdTwS6GAwAWmiNon6ABQAlGYAClLAGAA8vtoA2gC6AHx6qbLiAHQA5h6BVAD02Vpg8sGZMF7o5oG0qJAuarqpdQ0YmUZ0MHTBDjxOLvBInd1EeigY2Lh4gfFUxX6lVIkANKQe3nGlvTwFBXAHhwB6APxwA65wI3RmW0lwAD4o5kboJMDm6Ea8QA)

[//]: # 'TypeInference3'

## 类型收窄

React Query 使用 [可辨识联合类型 (discriminated union type)](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions) 作为查询结果，通过 `status` 字段和派生的状态布尔标志进行区分。这使您能够检查例如 `success` 状态来确保 `data` 已定义：

[//]: # 'TypeNarrowing'

```tsx
const { data, isSuccess } = useQuery({
  queryKey: ['test'],
  queryFn: () => Promise.resolve(5),
})

if (isSuccess) {
  data
  //  ^? const data: number
}
```

[typescript playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgVwM4FMCKz1QJ5wC+cAZlBCHAORToCGAxjALQCOO+VAsAFC8MQAdqnhIAJnRh0ANHGCoAysgYN0qVETgBeFBmy48ACgDaVGGphUAurMMBKbQD44ABXIh56AHS1UEADYAbuiGAKx2dry8wCRwhvJKKmqoDgi8cBlwElK8APS5GQB6APy8hLxAA)

[//]: # 'TypeNarrowing'

## 错误字段类型标注

错误类型默认为 `Error`，因为这符合大多数用户的预期。

[//]: # 'TypingError'

```tsx
const { error } = useQuery({ queryKey: ['groups'], queryFn: fetchGroups })
//      ^? const error: Error
```

[typescript playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgVwM4FMCKz1QJ5wC+cAZlBCHAOQACMAhgHaoMDGA1gPRTr2swBaAI458VALAAoUJFhx6AD2ARUpcpSqLlqCZKkw8YdHADi5ZGDgBeRHGAATAFxxGyEACNcRKVNYRm8CToMKwAFmYQFqo2ABQAlM4ACurAGAA8ERYA2gC6AHzWBVoqAHQA5sExVJxl5mA6cSUwoeiMMTyokMzGVgUdXRgl9vQMcT6SfgG2uORQRNYoGNi4eDFZVLWR9VQ5ADSkwWGZ9WOSnJxwl1cAegD8QA)

[//]: # 'TypingError'

如果您想抛出自定义错误，或非 `Error` 类型的对象，可以指定错误字段的类型：

[//]: # 'TypingError2'

```tsx
const { error } = useQuery<Group[], string>(['groups'], fetchGroups)
//      ^? const error: string | null
```

[//]: # 'TypingError2'

但这样做的缺点是 `useQuery` 的其他泛型参数将无法进行类型推断。通常不建议抛出非 `Error` 类型的对象，因此如果存在子类如 `AxiosError`，可以使用**类型收窄**使错误字段更具体：

[//]: # 'TypingError3'

```tsx
import axios from 'axios'

const { error } = useQuery({ queryKey: ['groups'], queryFn: fetchGroups })
//      ^? const error: Error | null

if (axios.isAxiosError(error)) {
  error
  // ^? const error: AxiosError
}
```

[typescript playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgVwM4FMCKz1QJ5wC+cAZlBCHAOQACMAhgHaoMDGA1gPRTr2swBaAI458VALAAoUJFhx6AD2ARUpcpSqLlqCZKkw8YdHADi5ZGDgBeRHGAATAFxxGyEACNcRKVNYRm8CToMKwAFmYQFqo2ABQAlM4ACurAGAA8ERYA2gC6AHzWBVoqAHQA5sExVJxl5mA6cSUwoeiMMTyokMzGVgUdXRgl9vQMcT6SfgG2uORQRNYoGNi4eDFIIisA0uh4zllUtZH1VDkANHAb+ABijM5BIeF1qoRjkpyccJ9fAHoA-OPAEhwGLFVAlVIAQSUKgAolBZjEZtA4nFEFJPkioOi4O84H8pIQgA)

[//]: # 'TypingError3'

### 注册全局错误类型

TanStack Query v5 允许通过扩展 `Register` 接口来设置全局错误类型，无需在调用处指定泛型参数。这将确保类型推断仍然有效，同时错误字段会是指定的类型：

[//]: # 'RegisterErrorType'

```tsx
import '@tanstack/react-query'

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AxiosError
  }
}

const { error } = useQuery({ queryKey: ['groups'], queryFn: fetchGroups })
//      ^? const error: AxiosError | null
```

[//]: # 'RegisterErrorType'
[//]: # 'TypingMeta'

## 元数据 (Meta) 类型标注

### 注册全局元数据类型

与注册 [全局错误类型](#registering-a-global-error) 类似，您也可以注册全局 `Meta` 类型。这确保 [查询](./reference/useQuery.md) 和 [变更](./reference/useMutation.md) 中的可选 `meta` 字段保持一致且类型安全。注意注册的类型必须扩展 `Record<string, unknown>`，以保证 `meta` 始终是对象类型。

```ts
import '@tanstack/react-query'

interface MyMeta extends Record<string, unknown> {
  // 您的元数据类型定义
}

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: MyMeta
    mutationMeta: MyMeta
  }
}
```

[//]: # 'TypingMeta'
[//]: # 'TypingQueryAndMutationKeys'

## 查询与变更键 (Key) 类型标注

### 注册查询与变更键类型

同样类似于注册 [全局错误类型](#registering-a-global-error)，您还可以注册全局 `QueryKey` 和 `MutationKey` 类型。这允许您为键提供更多结构，匹配应用程序的层次关系，并在库的所有相关接口中保持类型安全。注意注册的类型必须扩展 `Array` 类型，以确保键仍然是数组形式。

```ts
import '@tanstack/react-query'

type QueryKey = ['dashboard' | 'marketing', ...ReadonlyArray<unknown>]

declare module '@tanstack/react-query' {
  interface Register {
    queryKey: QueryKey
    mutationKey: QueryKey
  }
}
```

[//]: # 'TypingQueryAndMutationKeys'
[//]: # 'TypingQueryOptions'

## 查询选项 (Query Options) 类型标注

如果将查询选项内联到 `useQuery` 中，您将获得自动类型推断。但若需要将查询选项提取到单独函数中以便在 `useQuery` 和 `prefetchQuery` 等场景共享，则会失去类型推断。此时可以使用 `queryOptions` 辅助函数恢复类型推断：

```ts
import { queryOptions } from '@tanstack/react-query'

function groupOptions() {
  return queryOptions({
    queryKey: ['groups'],
    queryFn: fetchGroups,
    staleTime: 5 * 1000,
  })
}

useQuery(groupOptions())
queryClient.prefetchQuery(groupOptions())
```

此外，`queryOptions` 返回的 `queryKey` 知晓关联的 `queryFn`，我们可以利用此类型信息使 `queryClient.getQueryData` 等函数也能感知这些类型：

```ts
function groupOptions() {
  return queryOptions({
    queryKey: ['groups'],
    queryFn: fetchGroups,
    staleTime: 5 * 1000,
  })
}

const data = queryClient.getQueryData(groupOptions().queryKey)
//     ^? const data: Group[] | undefined
```

若不使用 `queryOptions`，`data` 的类型将为 `unknown`，除非显式传递泛型参数：

```ts
const data = queryClient.getQueryData<Group[]>(['groups'])
```

[//]: # 'TypingQueryOptions'
[//]: # 'Materials'

## 扩展阅读

关于类型推断的技巧，请参阅社区资源中的 [React Query 与 TypeScript](./community/tkdodos-blog.md#6-react-query-and-typescript)。要了解如何实现最佳类型安全，可阅读 [类型安全的 React Query](./community/tkdodos-blog.md#19-type-safe-react-query)。

[//]: # 'Materials'

## 使用 `skipToken` 实现类型安全的查询禁用

如果使用 TypeScript，可以通过 `skipToken` 禁用查询。这在需要根据条件禁用查询但仍希望保持类型安全时非常有用。更多信息请参阅 [禁用查询](./guides/disabling-queries.md) 指南。
