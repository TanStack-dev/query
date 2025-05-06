---
source-updated-at: '2024-11-20T12:58:00.000Z'
translation-updated-at: '2025-05-06T04:55:35.083Z'
id: typescript
title: TypeScript
---

TanStack Query 现已采用 **TypeScript** 编写，确保库与您的项目具备类型安全！

注意事项：

- 当前类型系统要求使用 TypeScript **v4.7** 或更高版本
- 本仓库中的类型变更视为**非破坏性变更**，通常以 **patch** 版本号发布（否则每个类型增强都会导致主版本号变更！）
- **强烈建议您将 angular-query-experimental 包版本锁定到特定 patch 版本**，并在升级时预期类型可能在任意版本间被修复或升级
- TanStack Query 的非类型相关公共 API 及实验阶段结束后的 angular-query 包仍严格遵循语义化版本规范

## 类型推断

TanStack Query 的类型系统通常能完美流转，您无需自行添加类型注解

```angular-ts
@Component({
  // ...
  template: `@let data = query.data();`,
  //               ^? data: number | undefined
})
class MyComponent {
  query = injectQuery(() => ({
    queryKey: ['test'],
    queryFn: () => Promise.resolve(5),
  }))
}
```

```angular-ts
@Component({
  // ...
  template: `@let data = query.data();`,
  //               ^? data: string | undefined
})
class MyComponent {
  query = injectQuery(() => ({
    queryKey: ['test'],
    queryFn: () => Promise.resolve(5),
    select: (data) => data.toString(),
  }))
}
```

当您的 `queryFn` 具有明确定义的返回类型时效果最佳。请注意大多数数据获取库默认返回 `any` 类型，因此请确保将其提取到具有正确类型的函数中。

以下示例中我们将 Group[] 传递给 HttpClient `get` 方法的类型参数：

```angular-ts
@Component({
  template: `@let data = query.data();`,
  //               ^? data: Group[] | undefined
})
class MyComponent {
  http = inject(HttpClient)

  query = injectQuery(() => ({
    queryKey: ['groups'],
    queryFn: () => lastValueFrom(this.http.get<Group[]>('/groups')),
  }))
}
```

## 类型收窄

TanStack Query 使用[可辨识联合类型](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions)作为查询结果，通过 `status` 字段和派生的状态布尔值进行区分。这允许您检查如 `isSuccess()` 状态来确保 `data` 已定义：

```angular-ts
@Component({
  // ...
  template: `
    @if (query.isSuccess()) {
      @let data = query.data();
      //    ^? data: number
    }
  `,
})
class MyComponent {
  query = injectQuery(() => ({
    queryKey: ['test'],
    queryFn: () => Promise.resolve(5),
  }))
}
```

> TypeScript 当前不支持对象方法的可辨识联合。在如查询结果这样的对象上对信号字段进行类型收窄仅适用于返回布尔值的信号。建议优先使用 `isSuccess()` 等布尔状态信号而非 `status() === 'success'`。

## 错误字段类型标注

错误类型默认为 `Error`，因为这符合大多数用户的预期：

```angular-ts
@Component({
  // ...
  template: `@let error = query.error();`,
  //                ^? error: Error | null
})
class MyComponent {
  query = injectQuery(() => ({
    queryKey: ['groups'],
    queryFn: fetchGroups
  }))
}
```

如需抛出自定义错误或非 `Error` 对象，可指定错误字段类型：

```angular-ts
@Component({
  // ...
  template: `@let error = query.error();`,
  //                ^? error: string | null
})
class MyComponent {
  query = injectQuery<Group[], string>(() => ({
    queryKey: ['groups'],
    queryFn: fetchGroups,
  }))
}
```

但此方法会导致 `injectQuery` 其他泛型参数的类型推断失效。通常不建议抛出非 `Error` 对象，若您有如 `AxiosError` 的子类，可使用类型收窄使错误字段更具体：

```ts
import axios from 'axios'

query = injectQuery(() => ({ queryKey: ['groups'], queryFn: fetchGroups }))

computed(() => {
  const error = query.error()
  //     ^? error: Error | null

  if (axios.isAxiosError(error)) {
    error
    // ^? const error: AxiosError
  }
})
```

### 注册全局错误类型

TanStack Query v5 支持通过扩展 `Register` 接口设置全局错误类型，无需在调用处指定泛型参数，同时保证类型推断仍有效：

```ts
import '@tanstack/angular-query-experimental'

declare module '@tanstack/angular-query-experimental' {
  interface Register {
    defaultError: AxiosError
  }
}

const query = injectQuery(() => ({
  queryKey: ['groups'],
  queryFn: fetchGroups,
}))

computed(() => {
  const error = query.error()
  //      ^? error: AxiosError | null
})
```

## 元数据 (meta) 类型标注

### 注册全局元数据类型

类似于注册[全局错误类型](#registering-a-global-error)，您也可以注册全局 `Meta` 类型。这确保[查询](./reference/injectQuery.md)和[变更](./reference/injectMutation.md)中的可选 `meta` 字段保持类型安全且一致。注意注册类型必须扩展 `Record<string, unknown>` 以保证 `meta` 始终为对象。

```ts
import '@tanstack/angular-query-experimental'

interface MyMeta extends Record<string, unknown> {
  // 您的元类型定义
}

declare module '@tanstack/angular-query-experimental' {
  interface Register {
    queryMeta: MyMeta
    mutationMeta: MyMeta
  }
}
```

## 查询与变更键 (key) 类型标注

### 注册查询与变更键类型

同样类似于注册[全局错误类型](#registering-a-global-error)，您可注册全局 `QueryKey` 和 `MutationKey` 类型。这允许您为键提供更符合应用层次结构的类型约束，并在整个库中保持类型安全。注意注册类型必须扩展 `Array` 类型以保证键始终为数组。

```ts
import '@tanstack/angular-query-experimental'

type QueryKey = ['dashboard' | 'marketing', ...ReadonlyArray<unknown>]

declare module '@tanstack/angular-query-experimental' {
  interface Register {
    queryKey: QueryKey
    mutationKey: QueryKey
  }
}
```

## 查询选项 (Query Options) 类型标注

若在 `injectQuery` 内联查询选项，将获得自动类型推断。但若需将查询选项提取到独立函数中以在 `injectQuery` 和 `prefetchQuery` 间共享，或将其托管在服务中，则会丢失类型推断。此时可使用 `queryOptions` 辅助工具恢复类型推断：

```ts
@Injectable({
  providedIn: 'root',
})
export class QueriesService {
  private http = inject(HttpClient)

  post(postId: number) {
    return queryOptions({
      queryKey: ['post', postId],
      queryFn: () => {
        return lastValueFrom(
          this.http.get<Post>(
            `https://jsonplaceholder.typicode.com/posts/${postId}`,
          ),
        )
      },
    })
  }
}

@Component({
  // ...
})
export class Component {
  queryClient = inject(QueryClient)

  postId = signal(1)

  queries = inject(QueriesService)
  optionsSignal = computed(() => this.queries.post(this.postId()))

  postQuery = injectQuery(() => this.queries.post(1))
  postQuery = injectQuery(() => this.queries.post(this.postId()))

  // 也可传递返回查询选项的信号
  postQuery = injectQuery(this.optionsSignal)

  someMethod() {
    this.queryClient.prefetchQuery(this.queries.post(23))
  }
}
```

此外，`queryOptions` 返回的 `queryKey` 知晓其关联的 `queryFn`，我们可以利用此类型信息使如 `queryClient.getQueryData` 等方法也能感知这些类型：

```ts
data = this.queryClient.getQueryData(groupOptions().queryKey)
// ^? data: Post | undefined
```

若不使用 `queryOptions`，data 类型将为 unknown，除非传递类型参数：

```ts
data = queryClient.getQueryData<Post>(['post', 1])
```

## 变更选项 (Mutation Options) 类型标注

类似于 `queryOptions`，您可使用 `mutationOptions` 将变更选项提取到独立函数：

```ts
export class QueriesService {
  private http = inject(HttpClient)

  updatePost(id: number) {
    return mutationOptions({
      mutationFn: (post: Post) => Promise.resolve(post),
      mutationKey: ['updatePost', id],
      onSuccess: (newPost) => {
        //           ^? newPost: Post
        this.queryClient.setQueryData(['posts', id], newPost)
      },
    })
  }
}
```

## 使用 `skipToken` 实现类型安全的查询禁用

若使用 TypeScript，可通过 `skipToken` 禁用查询。这在需要基于条件禁用查询但仍需保持类型安全时非常有用。更多信息请参阅[禁用查询](./guides/disabling-queries.md)指南。
