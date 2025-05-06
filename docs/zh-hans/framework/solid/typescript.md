---
source-updated-at: '2025-04-03T21:54:40.000Z'
translation-updated-at: '2025-05-06T05:19:16.449Z'
id: typescript
title: TypeScript
---
Solid Query 采用 **TypeScript** 编写，以确保库和您的项目具备类型安全！

注意事项：

- 当前类型系统要求使用 TypeScript **v4.7** 或更高版本
- 本仓库中的类型变更被视为**非破坏性变更**，通常以 **patch** 版本号发布（否则每个类型增强都会导致主版本号变更！）
- **强烈建议您将 solid-query 包版本锁定到特定 patch 版本，并在升级时预见到类型可能在任意版本间被修复或升级**
- Solid Query 中与类型无关的公共 API 仍严格遵循语义化版本规范。

## 类型推断

Solid Query 中的类型通常能很好地流动，因此您无需自行添加类型注解

```tsx
import { useQuery } from '@tanstack/solid-query'

const query = useQuery(() => ({
  queryKey: ['number'],
  queryFn: () => Promise.resolve(5),
}))

query.data
//    ^? (property) data: number | undefined
```

[typescript playground](https://www.typescriptlang.org/play/?#code/JYWwDg9gTgLgBAbzgYygUwIYzQRQK5pQCecAvnAGZQQhwDkAAjBgHYDOzyA1gPRsQAbYABMAtAEcCxOgFgAUPOQR28SYRIBeFOiy4pRABQGAlHA0A+OAYTy4duGuIBpNEQBccANp0WeEACNCOgBdABo4W3tHIgAxFg8TM0sABWoQYDY0ADp0fgEANzQDAFZjeVJjMoU5aKzhLAx5Hh57OAA9AH55brkgA)

```tsx
import { useQuery } from '@tanstack/solid-query'

const query = useQuery(() => ({
  queryKey: ['test'],
  queryFn: () => Promise.resolve(5),
  select: (data) => data.toString(),
}))

query.data
//    ^? (property) data: string | undefined
```

[typescript playground](https://www.typescriptlang.org/play/?#code/JYWwDg9gTgLgBAbzgYygUwIYzQRQK5pQCecAvnAGZQQhwDkAAjBgHYDOzyA1gPRsQAbYABMAtAEcCxOgFgAUPOQR28SYRIBeFOiy4pRABQGAlHA0A+OAYTy4duGuIBpNEQBccANp1sHOgF0AGjhbe0ciADEWDxMzSwAFahBgNjQAOnR+AQA3NAMAVmNA0LtUgTRkGBjhLAxTCzga5jSYCABlGChgFgBzE2K5UmNjeXlwtKaMeR4eezgAPQB+UYU5IA)

当您的 `queryFn` 具有明确定义的返回类型时效果最佳。请注意大多数数据获取库默认返回 `any`，因此请确保将其提取到具有正确类型的函数中：

```tsx
const fetchGroups = (): Promise<Group[]> =>
  axios.get('/groups').then((response) => response.data)

const query = useQuery(() => ({
  queryKey: ['groups'],
  queryFn: fetchGroups,
}))

query.data
//    ^? (property) data: Group[] | undefined
```

[typescript playground](https://www.typescriptlang.org/play/?ssl=11&ssc=4&pln=6&pc=1#code/JYWwDg9gTgLgBAbzgYygUwIYzQRQK5pQCecAvnAGZQQhwDkAAjBgHYDOzyA1gPRsQAbYABMAtAEcCxOgFgAUKEiw4GAB7AIbStVp01GtrLnyYRMGjgBxanjBwAvIjgiAXHBZ4QAI0Jl585Ah2eAo0GGQAC2sIWy1HAAoASjcABR1gNjQAHmjbAG0AXQA+BxL9TQA6AHMw+LoeKpswQ0SKmAi0Fnj0Nkh2C3sSnr7MiuEsDET-OUDguElCEkdUTGx8Rfik0rh4hHk4A-mpIgBpNCI3PLpGmOa6AoAaOH3DheIAMRY3UPCoprYHvJSIkpsY5G8iGMJvIeDxDnAAHoAfmm8iAA)

## 类型收窄

Solid Query 使用[可辨识联合类型](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions)作为查询结果，通过 `status` 字段和派生的状态布尔标志进行区分。这使您能够检查例如 `success` 状态来确保 `data` 已定义：

```tsx
const query = useQuery(() => ({
  queryKey: ['number'],
  queryFn: () => Promise.resolve(5),
}))

if (query.isSuccess) {
  const data = query.data
  //     ^? const data: number
}
```

[typescript playground](https://www.typescriptlang.org/play/?#code/JYWwDg9gTgLgBAbzgYygUwIYzQRQK5pQCecAvnAGZQQhwDkAAjBgHYDOzyA1gPRsQAbYABMAtAEcCxOgFgAUKEixEKdFjQBRChTTJ45KjXr8hYgFZtZc+cgjt4kwiQC8qzNnxOAFF4CUcZwA+OC8EeTg4R2IAaTQiAC44AG06FjwQACNCOgBdABpwyKkiADEWRL8A4IAFahBgNjQAOnQTADc0LwBWXwK5Ul9feXlgChCooiaGgGU8ZGQ0NjZ-MLkIiNt7OGEsDACipyad5kKInh51iIA9AH55UmHrOSA)

## 错误字段类型标注

错误类型默认为 `Error`，因为这符合大多数用户的预期。

```tsx
const query = useQuery(() => ({
  queryKey: ['groups'],
  queryFn: fetchGroups,
}))

query.error
//    ^? (property) error: Error | null
```

[typescript playground](https://www.typescriptlang.org/play/?#code/JYWwDg9gTgLgBAbzgYygUwIYzQRQK5pQCecAvnAGZQQhwDkAAjBgHYDOzyA1gPRsQAbYABMAtAEcCxOgFgAUKEiw4GAB7AIbStVp01GtrLnyYRMGjgBxanjBwAvIjgiAXHBZ4QAI0Jl585Ah2eAo0GGQAC2sIWy1HAAoASjcABR1gNjQAHmjbAG0AXQA+BxL9TQA6AHMw+LoeKpswQ0SKmAi0Fnj0Nkh2C3sSnr7MiuEsDET-OUDguElCEkdUTGx8Rfik0rh4hHk4A-mpIgBpNCI3PLpGmOa6AoAaOH3DheIAMRY3UPCoprYHvJSIkpsY5G8iBVCNQoPIeDxDnAAHoAfmm8iAA)

如果您想抛出自定义错误，或根本不是 `Error` 的内容，可以指定错误字段的类型：

```tsx
const query = useQuery<Group[], string>(() => ({
  queryKey: ['groups'],
  queryFn: fetchGroups,
}))

query.error
//    ^? (property) error: string | null
```

但这样做有个缺点：`useQuery` 所有其他泛型的类型推断将不再工作。通常认为抛出非 `Error` 的内容不是良好实践，因此如果您有像 `AxiosError` 这样的子类，可以使用*类型收窄*来使错误字段更具体：

```tsx
import axios from 'axios'

const query = useQuery(() => ({
  queryKey: ['groups'],
  queryFn: fetchGroups,
}))

query.error
//    ^? (property) error: Error | null

if (axios.isAxiosError(query.error)) {
  query.error
  //    ^? (property) error: AxiosError
}
```

[typescript playground](https://www.typescriptlang.org/play/?#code/JYWwDg9gTgLgBAbzgYygUwIYzQRQK5pQCecAvnAGZQQhwDkAAjBgHYDOzyA1gPRsQAbYABMAtAEcCxOgFgAUKEiw4GAB7AIbStVp01GtrLnyYRMGjgBxanjBwAvIjgiAXHBZ4QAI0Jl585Ah2eAo0GGQAC2sIWy1HAAoASjcABR1gNjQAHmjbAG0AXQA+BxL9TQA6AHMw+LoeKpswQ0SKmAi0Fnj0Nkh2C3sSnr7MiuEsDET-OUDguElCEkdUTGx8Rfik0rh4hHk4A-mpIgBpNCI3PLpGmOa6AoAaOH3DheIAMRY3UPCoprYHvJSIkpsY5G8iBVCNQoPIeDxDnAAHoAfmmwAoO3KbAqGQAgupNABRKAw+IQqGk6AgxAvA4U6HQOlweGI1FA+RAA)

## 注册全局 `Error` 类型

TanStack Query v5 提供了一种方式来设置全局错误类型，无需在调用处指定泛型，通过扩展 `Register` 接口实现。这将确保类型推断仍然有效，但错误字段将是指定的类型：

```tsx
import '@tanstack/solid-query'

declare module '@tanstack/solid-query' {
  interface Register {
    defaultError: AxiosError
  }
}

const query = useQuery(() => ({
  queryKey: ['groups'],
  queryFn: fetchGroups,
}))

query.error
//    ^? (property) error: AxiosError | null
```

## 注册全局 `Meta` 类型

与注册[全局错误类型](#registering-a-global-error)类似，您也可以注册全局 `Meta` 类型。这确保[查询](../useQuery)和[变更](../createMutation)上的可选 `meta` 字段保持一致且类型安全。注意注册的类型必须扩展 `Record<string, unknown>`，以便 `meta` 保持为对象。

```ts
import '@tanstack/solid-query'

interface MyMeta extends Record<string, unknown> {
  // 您的 meta 类型定义
}

declare module '@tanstack/solid-query' {
  interface Register {
    queryMeta: MyMeta
    mutationMeta: MyMeta
  }
}
```

## 查询选项类型标注

如果将查询选项内联到 `useQuery` 中，您将获得自动类型推断。但您可能希望将查询选项提取到单独的函数中，以便在 `useQuery` 和例如 `prefetchQuery` 之间共享。这种情况下，您将失去类型推断。要恢复它，可以使用 `queryOptions` 辅助函数：

```ts
import { queryOptions } from '@tanstack/solid-query'

function groupOptions() {
  return queryOptions({
    queryKey: ['groups'],
    queryFn: fetchGroups,
    staleTime: 5 * 1000,
  })
}

useQuery(groupOptions)
queryClient.prefetchQuery(groupOptions())
```

此外，`queryOptions` 返回的 `queryKey` 知道与之关联的 `queryFn`，我们可以利用这些类型信息使像 `queryClient.getQueryData` 这样的函数也能感知这些类型：

```ts
function groupOptions() {
  return queryOptions({
    queryKey: ['groups'],
    queryFn: fetchGroups,
    staleTime: 5 * 1000,
  })
}

const data = queryClient.getQueryData(groupOptions().queryKey)
//    ^? const data: Group[] | undefined
```

如果没有 `queryOptions`，`data` 的类型将是 `unknown`，除非我们传递泛型：

```ts
const data = queryClient.getQueryData<Group[]>(['groups'])
```

## 使用 `skipToken` 类型安全地禁用查询

如果使用 TypeScript，可以使用 `skipToken` 来禁用查询。这在您想基于条件禁用查询但仍希望保持查询类型安全时非常有用。

更多信息请参阅[禁用查询](../disabling-queries)指南。
