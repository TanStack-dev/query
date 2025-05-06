---
source-updated-at: '2024-07-19T09:36:35.000Z'
translation-updated-at: '2025-05-06T05:05:56.640Z'
id: infinite-queries
title: 无限查询
---
## 无限查询 (Infinite Queries)

能够以增量方式"加载更多"数据到现有数据集或实现"无限滚动"的列表渲染是一种非常常见的 UI 模式。TanStack Query 为此提供了一个名为 `injectInfiniteQuery` 的 `injectQuery` 变体，专门用于查询这类列表。

使用 `injectInfiniteQuery` 时，您会注意到以下几点不同：

- `data` 现在是一个包含无限查询数据的对象：
  - `data.pages` 数组包含已获取的页面
  - `data.pageParams` 数组包含用于获取页面的参数
- 现在提供了 `fetchNextPage` 和 `fetchPreviousPage` 函数（必须实现 `fetchNextPage`）
- 新增了 `initialPageParam` 选项（必须指定初始页面参数）
- 提供了 `getNextPageParam` 和 `getPreviousPageParam` 选项，用于确定是否有更多数据要加载以及获取这些数据所需的信息。这些信息会作为额外参数传递给查询函数
- 新增了 `hasNextPage` 布尔值，当 `getNextPageParam` 返回值不为 `null` 或 `undefined` 时为 `true`
- 新增了 `hasPreviousPage` 布尔值，当 `getPreviousPageParam` 返回值不为 `null` 或 `undefined` 时为 `true`
- 新增了 `isFetchingNextPage` 和 `isFetchingPreviousPage` 布尔值，用于区分后台刷新状态和加载更多状态

> 注意：选项 `initialData` 或 `placeholderData` 需要符合具有 `data.pages` 和 `data.pageParams` 属性的对象结构。

## 示例

假设我们有一个 API，它基于 `cursor` 索引每次返回 3 个 `projects` 页面，同时返回可用于获取下一组项目的游标：

```tsx
fetch('/api/projects?cursor=0')
// { data: [...], nextCursor: 3}
fetch('/api/projects?cursor=3')
// { data: [...], nextCursor: 6}
fetch('/api/projects?cursor=6')
// { data: [...], nextCursor: 9}
fetch('/api/projects?cursor=9')
// { data: [...] }
```

通过这些信息，我们可以创建一个"加载更多"的 UI：
- 默认情况下等待 `injectInfiniteQuery` 请求第一组数据
- 在 `getNextPageParam` 中返回下一个查询的信息
- 调用 `fetchNextPage` 函数

```angular-ts
import { Component, computed, inject } from '@angular/core'
import { injectInfiniteQuery } from '@tanstack/angular-query-experimental'
import { lastValueFrom } from 'rxjs'
import { ProjectsService } from './projects-service'

@Component({
  selector: 'example',
  templateUrl: './example.component.html',
})
export class Example {
  projectsService = inject(ProjectsService)

  query = injectInfiniteQuery(() => ({
    queryKey: ['projects'],
    queryFn: async ({ pageParam }) => {
      return lastValueFrom(this.projectsService.getProjects(pageParam))
    },
    initialPageParam: 0,
    getPreviousPageParam: (firstPage) => firstPage.previousId ?? undefined,
    getNextPageParam: (lastPage) => lastPage.nextId ?? undefined,
    maxPages: 3,
  }))

  nextButtonDisabled = computed(
    () => !this.#hasNextPage() || this.#isFetchingNextPage(),
  )
  nextButtonText = computed(() =>
    this.#isFetchingNextPage()
      ? '正在加载更多...'
      : this.#hasNextPage()
        ? '加载更新'
        : '已加载全部内容',
  )

  #hasNextPage = this.query.hasNextPage
  #isFetchingNextPage = this.query.isFetchingNextPage
}
```

```angular-html
<div>
  @if (query.isPending()) {
  <p>加载中...</p>
  } @else if (query.isError()) {
  <span>错误: {{ query?.error().message }}</span>
  } @else { @for (page of query?.data().pages; track $index) { @for (project of
  page.data; track project.id) {
  <p>{{ project.name }} {{ project.id }}</p>
  } }
  <div>
    <button (click)="query.fetchNextPage()" [disabled]="nextButtonDisabled()">
      {{ nextButtonText() }}
    </button>
  </div>
  }
</div>
```

必须理解的是，在后台正在进行数据获取时调用 `fetchNextPage` 有可能覆盖正在后台刷新的数据。当同时渲染列表和触发 `fetchNextPage` 时，这种情况变得尤为关键。

请记住，一个 InfiniteQuery 只能有一个正在进行的获取操作。所有页面共享单个缓存条目，尝试同时进行两次获取可能会导致数据覆盖。

如果您希望启用并行获取，可以在 `fetchNextPage` 中使用 `{ cancelRefetch: false }` 选项（默认为 true）。

为了确保查询过程无冲突，强烈建议检查查询是否不处于 `isFetching` 状态，特别是当用户不会直接控制该调用时。

```angular-ts
@Component({
  template: ` <list-component (endReached)="fetchNextPage()" /> `,
})
export class Example {
  query = injectInfiniteQuery(() => ({
    queryKey: ['projects'],
    queryFn: async ({ pageParam }) => {
      return lastValueFrom(this.projectsService.getProjects(pageParam))
    },
  }))

  fetchNextPage() {
    // 如果正在获取，则不执行任何操作
    if (this.query.isFetching()) return
    this.query.fetchNextPage()
  }
}
```

## 当无限查询需要重新获取时会发生什么？

当无限查询变为 `stale` 并需要重新获取时，每组数据会从第一组开始`顺序`获取。这确保了即使底层数据发生变更，我们也不会使用过期的游标，从而避免获取重复记录或跳过记录。如果无限查询的结果从 queryCache 中移除，分页将从初始状态重新开始，仅请求初始组。

## 如何实现双向无限列表？

双向列表可以通过使用 `getPreviousPageParam`、`fetchPreviousPage`、`hasPreviousPage` 和 `isFetchingPreviousPage` 属性和函数来实现。

```ts
query = injectInfiniteQuery(() => ({
  queryKey: ['projects'],
  queryFn: fetchProjects,
  getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
  getPreviousPageParam: (firstPage, pages) => firstPage.prevCursor,
}))
```

## 如何以相反顺序显示页面？

有时您可能希望以相反的顺序显示页面。这种情况下，可以使用 `select` 选项：

```ts
query = injectInfiniteQuery(() => ({
  queryKey: ['projects'],
  queryFn: fetchProjects,
  select: (data) => ({
    pages: [...data.pages].reverse(),
    pageParams: [...data.pageParams].reverse(),
  }),
}))
```

## 如何手动更新无限查询？

### 手动移除第一页：

```tsx
queryClient.setQueryData(['projects'], (data) => ({
  pages: data.pages.slice(1),
  pageParams: data.pageParams.slice(1),
}))
```

### 手动从单个页面中移除某个值：

```tsx
const newPagesArray =
  oldPagesArray?.pages.map((page) =>
    page.filter((val) => val.id !== updatedId),
  ) ?? []

queryClient.setQueryData(['projects'], (data) => ({
  pages: newPagesArray,
  pageParams: data.pageParams,
}))
```

### 仅保留第一页：

```tsx
queryClient.setQueryData(['projects'], (data) => ({
  pages: data.pages.slice(0, 1),
  pageParams: data.pageParams.slice(0, 1),
}))
```

请确保始终保持 pages 和 pageParams 的相同数据结构！

## 如何限制页面数量？

在某些使用场景中，您可能希望限制查询数据中存储的页面数量以提高性能和用户体验：
- 当用户可以加载大量页面时（内存使用）
- 当需要重新获取包含数十个页面的无限查询时（网络使用：所有页面都会顺序获取）

解决方案是使用"有限无限查询"。这可以通过结合使用 `maxPages` 选项与 `getNextPageParam` 和 `getPreviousPageParam` 来实现，以便在需要时双向获取页面。

在以下示例中，查询数据 pages 数组中仅保留 3 个页面。如果需要重新获取，只会顺序重新获取 3 个页面。

```ts
injectInfiniteQuery(() => ({
  queryKey: ['projects'],
  queryFn: fetchProjects,
  initialPageParam: 0,
  getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
  getPreviousPageParam: (firstPage, pages) => firstPage.prevCursor,
  maxPages: 3,
}))
```

## 如果我的 API 不返回游标怎么办？

如果您的 API 不返回游标，您可以使用 `pageParam` 作为游标。因为 `getNextPageParam` 和 `getPreviousPageParam` 也会获取当前页面的 `pageParam`，所以您可以用它来计算下一个/上一个页面参数。

```ts
injectInfiniteQuery(() => ({
  queryKey: ['projects'],
  queryFn: fetchProjects,
  initialPageParam: 0,
  getNextPageParam: (lastPage, allPages, lastPageParam) => {
    if (lastPage.length === 0) {
      return undefined
    }
    return lastPageParam + 1
  },
  getPreviousPageParam: (firstPage, allPages, firstPageParam) => {
    if (firstPageParam <= 1) {
      return undefined
    }
    return firstPageParam - 1
  },
}))
```
