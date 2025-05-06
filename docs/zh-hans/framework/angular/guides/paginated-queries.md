---
source-updated-at: '2024-11-14T21:48:46.000Z'
translation-updated-at: '2025-05-06T04:59:52.176Z'
id: paginated-queries
title: 分页查询
---
分页渲染数据是一种非常常见的 UI 模式，在 TanStack Query 中，只需将页码信息包含在查询键 (query key) 中即可实现：

```ts
const result = injectQuery(() => ({
  queryKey: ['projects', page()],
  queryFn: fetchProjects,
}))
```

但运行这个简单示例时，你可能会注意到一个奇怪的现象：

**UI 会在 `success` 和 `pending` 状态之间反复切换，因为每个新页面都被视为一个全新的查询。**

这种体验并不理想，遗憾的是许多工具至今仍坚持这种工作方式。但 TanStack Query 不同！你可能已经猜到，TanStack Query 提供了一个名为 `placeholderData` 的强大功能来解决这个问题。

## 使用 `placeholderData` 优化分页查询

考虑以下场景：我们希望逐步增加查询的页码索引 (pageIndex) 或游标 (cursor)。如果使用 `injectQuery`，**技术上虽然可行**，但 UI 会随着每个页面创建和销毁不同查询而在 `success` 和 `pending` 状态间跳转。通过将 `placeholderData` 设为 `(previousData) => previousData` 或使用 TanStack Query 导出的 `keepPreviousData` 函数，我们可以获得以下特性：

- **即使查询键已变更，在请求新数据期间仍能访问上次成功获取的数据**
- 当新数据到达时，会无缝切换显示新数据
- 可通过 `isPlaceholderData` 判断当前查询提供的数据类型

```angular-ts
@Component({
  selector: 'pagination-example',
  template: `
    <div>
      <p>
        本示例中，当获取下一页时，当前页数据仍保持可见。下一页按钮和相关功能会在获取到下一页游标前禁用。每页数据都会作为普通查询缓存，因此返回上一页时会立即显示，同时后台会自动重新获取最新数据。
      </p>
      @if (query.status() === 'pending') {
        <div>加载中...</div>
      } @else if (query.status() === 'error') {
        <div>错误: {{ query.error().message }}</div>
      } @else {
        <!-- 'data' 会解析为最新页的数据 -->
        <!-- 或在获取新页时显示上次成功获取的页数据 -->
        <div>
          @for (project of query.data().projects; track project.id) {
            <p>{{ project.name }}</p>
          }
        </div>
      }

      <div>当前页: {{ page() + 1 }}</div>
      <button (click)="previousPage()" [disabled]="page() === 0">
        上一页
      </button>
      <button
        (click)="nextPage()"
        [disabled]="query.isPlaceholderData() || !query.data()?.hasMore"
      >
        下一页
      </button>
      <!-- 由于最后一页数据可能在页面请求间持续存在 -->
      <!-- 我们可以用 'isFetching' 显示后台加载指示器 -->
      <!-- 因为 status === 'pending' 状态不会触发 -->
      @if (query.isFetching()) {
        <span> 加载中...</span>
      }
    </div>
  `,
})
export class PaginationExampleComponent {
  page = signal(0)
  queryClient = inject(QueryClient)

  query = injectQuery(() => ({
    queryKey: ['projects', this.page()],
    queryFn: () => lastValueFrom(fetchProjects(this.page())),
    placeholderData: keepPreviousData,
    staleTime: 5000,
  }))

  constructor() {
    effect(() => {
      // 预取下一页！
      if (!this.query.isPlaceholderData() && this.query.data()?.hasMore) {
        this.#queryClient.prefetchQuery({
          queryKey: ['projects', this.page() + 1],
          queryFn: () => lastValueFrom(fetchProjects(this.page() + 1)),
        })
      }
    })
  }

  previousPage() {
    this.page.update((old) => Math.max(old - 1, 0))
  }

  nextPage() {
    this.page.update((old) => (this.query.data()?.hasMore ? old + 1 : old))
  }
}
```

## 使用 `placeholderData` 实现无限查询结果延迟加载

虽然不太常见，但 `placeholderData` 选项与 `injectInfiniteQuery` 函数也能完美配合，让你可以在无限查询键随时间变化时，仍让用户无缝查看缓存数据。
