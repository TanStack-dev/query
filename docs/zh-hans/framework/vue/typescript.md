---
source-updated-at: '2024-05-11T22:31:28.000Z'
translation-updated-at: '2025-05-06T05:28:24.242Z'
id: typescript
title: TypeScript
---

Vue Query 现已采用 **TypeScript** 编写，确保库与您的项目具备类型安全！

注意事项：

- 当前类型系统要求使用 TypeScript **v4.7** 或更高版本
- 本仓库中的类型变更视为**非破坏性变更**，通常以 **patch** 版本号发布（否则每个类型增强都会导致主版本号变更！）
- **强烈建议将 vue-query 包版本锁定到特定 patch 版本，并在升级时预见到类型可能在任意版本间被修复或升级**
- Vue Query 的非类型相关公共 API 仍严格遵循语义化版本规范。

## 类型推断

Vue Query 的类型通常能很好地自动流转，因此您无需自行添加类型注解

```tsx
const { data } = useQuery({
  //    ^? const data: Ref<number> | Ref<undefined>
  queryKey: ['test'],
  queryFn: () => Promise.resolve(5),
})
```

[typescript playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgVwM4FMCKz1QJ5wC+cAZlBCHAOQACMAhgHaoMDGA1gPQBuOAtAEcc+KgFgAUBNYRm8JABN6DInAC8KDNlx4AFAglw4nTocMA9APwG4Q7QGl0eAFxwA2lRjoWVALoAaa1t8ADFGFx0ASjUAPjgABXIQYAwAOigvCAAbbnQdAFYIgPFCCKA)

```tsx
const { data } = useQuery({
  //      ^? const data: Ref<string> | Ref<undefined>
  queryKey: ['test'],
  queryFn: () => Promise.resolve(5),
  select: (data) => data.toString(),
})
```

[typescript playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgVwM4FMCKz1QJ5wC+cAZlBCHAOQACMAhgHaoMDGA1gPQBuOAtAEcc+KgFgAUBNYRm8JABN6DInAC8KDNlx4AFAglw4nTodNwAegH4DcIdoDS6PAC44AbSox0LKgF0ANDZ2+ABijK46AJRqAHxwAArkIMAYAHRQ3hAANtzoOgCskYHihhhZ6KwwEYoM0apxNfSpMBAAyjBQwIwA5lHFhJFAA)

当您的 `queryFn` 具有明确定义的返回类型时效果最佳。请注意大多数数据获取库默认返回 `any` 类型，因此建议将其提取到具有正确定义的函数中：

```tsx
const fetchGroups = (): Promise<Group[]> =>
  axios.get('/groups').then((response) => response.data)

const { data } = useQuery({ queryKey: ['groups'], queryFn: fetchGroups })
//      ^? const data: Ref<Group[]> | Ref<undefined>
```

[typescript playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgVwM4FMCKz1QJ5wC+cAZlBCHAOQACMAhgHaoMDGA1gPQBuOAtAEcc+KgFgAUKEiw49AB7AIqUuUpV5i1GPESYeMOjgBxcsjBwAvIjjAAJgC44jZCABGuIhImsIzeCXQYVgALEwgzZSsACgBKRwAFVWAMAB4wswBtAF0APksciThZBSUAOgBzQKiqTnLTMC0Y0phg9EYoqKh0VEhmdBj8uC6e3wxS23oGGK9xHz9rCYYiSxQMbFw8KKQhDYBpdDxHDKo68IaqLIAaOB38ADFGRwCg0PrlQmnxTk4i37gAPQA-EA)

## 类型收窄

Vue Query 使用基于 `status` 字段和派生状态布尔值的[可辨识联合类型](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions)作为查询结果。这允许您通过检查例如 `success` 状态来确保 `data` 已定义：

```tsx
const { data, isSuccess } = reactive(
  useQuery({
    queryKey: ['test'],
    queryFn: () => Promise.resolve(5),
  }),
)

if (isSuccess) {
  data
  // ^? const data: number
}
```

[typescript playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgVwM4FMCKz1QJ5wC+cAZlBCHAOQACMAhgHaoMDGA1gPQBuOAtAEcc+KgFgAUKEixEcKOnqsYwbuiKlylKr3RUA3BImsIzeEgAm9BgBo4wVAGVkrVulSp1AXjkKlK9AAUaFjCeAEA2lQwbjBUALq2AQCUcJ4AfHAACpr26AB08qgQADaqAQCsSVWGkiRwAfZOLm6oKQgScJ1wlgwSnJydAHoA-BKEEkA)

## 错误字段类型标注

错误类型默认为 `Error`，因为这符合大多数用户的预期：

```tsx
const { error } = useQuery({ queryKey: ['groups'], queryFn: fetchGroups })
//      ^? const error: Ref<unknown>

if (error.value instanceof Error) {
  error.value
  //     ^? const error: Error
}
```

[typescript playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgVwM4FMCKz1QJ5wC+cAZlBCHAOQACMAhgHaoMDGA1gPRTr2swBaAI458VALAAoUJFhx6AD2ARUpcpSqLlqCZKkw8YdHADi5ZGDgBeRHGAATAFxxGyEACNcRKVNYRm8CToMKwAFmYQFqo2ABQAlM4ACurAGAA8ERYA2gC6AHzWBVoqAHQA5sExVJxl5mA6cSUwoeiMMTyokMzGVgUdXRgl9vQMcT6SfgG2uORQRNYoGNi4eDFIIisA0uh4zllUtZH1VDkANHAb+ABijM5BIeF1qoRjkpyccJ9fAHoA-OPAEhwGLFVAlVIAQSUKgAolBZjEZtA4nFEFJPkioOi4O84H8pIQgA)

若需抛出自定义错误或非 `Error` 对象，可指定错误字段类型：

但此方法存在缺点：`useQuery` 的其他泛型参数将无法自动推断。通常不建议抛出非 `Error` 对象，若您有类似 `AxiosError` 的子类，可通过*类型收窄*使错误字段更具体：

### 注册全局错误类型

TanStack Query v5 允许通过扩展 `Register` 接口来设置全局错误类型，无需在调用处指定泛型参数。这将确保类型推断仍有效，同时错误字段会保持指定类型：

## 查询与 Mutation Key 类型标注

### 注册查询与 Mutation Key 类型

类似于注册[全局错误类型](#registering-a-global-error)，您也可以注册全局 `QueryKey` 和 `MutationKey` 类型。这允许您为键提供更符合应用层级结构的类型定义，并确保这些类型在整个库中保持一致。注意注册的类型必须扩展 `Array` 类型，以保持键的数组特性。

```ts
import '@tanstack/vue-query'

type QueryKey = ['dashboard' | 'marketing', ...ReadonlyArray<unknown>]

declare module '@tanstack/vue-query' {
  interface Register {
    queryKey: QueryKey
    mutationKey: QueryKey
  }
}
```

## 使用 `skipToken` 实现类型安全的查询禁用

若使用 TypeScript，可通过 `skipToken` 禁用查询。这在需要根据条件禁用查询但仍需保持类型安全时非常有用。更多细节请参阅[禁用查询](./guides/disabling-queries.md)指南。
