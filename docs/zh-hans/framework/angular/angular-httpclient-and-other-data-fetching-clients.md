---
source-updated-at: '2025-03-01T21:43:55.000Z'
translation-updated-at: '2025-05-06T04:50:39.857Z'
id: Angular-HttpClient-and-other-data-fetching-clients
title: Angular HttpClient 及其他数据获取客户端
---

由于 TanStack Query 的请求机制基于 Promise 无感知构建，您实际上可以使用任何异步数据请求客户端，包括浏览器原生的 `fetch` API、`graphql-request` 等。

## 使用 Angular 的 `HttpClient` 获取数据

`HttpClient` 是 Angular 强大且深度集成的组成部分，具有以下优势：

- 在单元测试中使用 [provideHttpClientTesting](https://angular.dev/guide/http/testing) 模拟响应。
- [拦截器](https://angular.dev/guide/http/interceptors) 可用于广泛功能，如添加认证头、执行日志记录等。虽然某些数据请求库拥有自己的拦截器系统，但 `HttpClient` 拦截器与 Angular 的依赖注入系统深度集成。
- `HttpClient` 会自动通知 [`PendingTasks`](https://angular.dev/api/core/PendingTasks#)，使 Angular 能感知待处理请求。单元测试和服务端渲染 (SSR) 可利用应用 _稳定性_ 信息等待请求完成，这极大简化了 [无 Zone (Zoneless)](https://angular.dev/guide/experimental/zoneless) 应用的单元测试。
- 使用 SSR 时，`HttpClient` 会 [缓存服务端请求](https://angular.dev/guide/ssr#caching-data-when-using-HttpClient)，避免客户端重复请求。其 SSR 缓存开箱即用。虽然 TanStack Query 的 hydration 功能更强大但需额外配置，具体选择取决于您的使用场景。

### 在 `queryFn` 中使用 Observable

由于 TanStack Query 是基于 Promise 的库，需将 `HttpClient` 的 Observable 转换为 Promise。可通过 `rxjs` 的 `lastValueFrom` 或 `firstValueFrom` 实现：

```ts
@Component({
  // ...
})
class ExampleComponent {
  private readonly http = inject(HttpClient)

  readonly query = injectQuery(() => ({
    queryKey: ['repoData'],
    queryFn: () =>
      lastValueFrom(
        this.http.get('https://api.github.com/repos/tanstack/query'),
      ),
  }))
}
```

> 随着 Angular 逐步将 RxJS 作为可选依赖，预计 `HttpClient` 未来也将支持 Promise。
>
> TanStack Query for Angular 的 Observable 支持已在规划中。

## 对比表格

| 数据请求客户端                 | 优势                            | 局限性                                |
| ------------------------------ | ------------------------------- | ------------------------------------- |
| **Angular HttpClient**         | 功能丰富且与 Angular 深度集成。 | 需将 Observable 转换为 Promise。      |
| **Fetch**                      | 浏览器原生 API，不增加包体积。  | 功能基础，缺乏高级特性。              |
| **专用库如 `graphql-request`** | 针对特定场景的专用功能。        | 若非 Angular 专用库则框架集成度较差。 |
