---
source-updated-at: '2024-07-19T09:36:35.000Z'
translation-updated-at: '2025-05-08T20:27:00.713Z'
id: infinite-queries
title: 無限查詢
---

# 無限查詢 (Infinite Queries)

能夠以增量方式「載入更多」資料到現有資料集或實現「無限滾動」的列表渲染，是非常常見的 UI 模式。TanStack Query 支援一個名為 `injectInfiniteQuery` 的 `injectQuery` 變體，專門用於查詢這類型的列表。

使用 `injectInfiniteQuery` 時，你會注意到一些不同之處：

- `data` 現在是一個包含無限查詢資料的物件：
  - `data.pages` 陣列包含已獲取的頁面
  - `data.pageParams` 陣列包含用於獲取頁面的頁面參數
- 現在可使用 `fetchNextPage` 和 `fetchPreviousPage` 函式（`fetchNextPage` 是必需的）
- 現在可使用（且必須提供）`initialPageParam` 選項來指定初始頁面參數
- 可使用 `getNextPageParam` 和 `getPreviousPageParam` 選項來判斷是否有更多資料需要載入，以及獲取這些資料所需的資訊。這些資訊會作為查詢函式的附加參數提供
- 現在提供 `hasNextPage` 布林值，當 `getNextPageParam` 返回值不是 `null` 或 `undefined` 時為 `true`
- 現在提供 `hasPreviousPage` 布林值，當 `getPreviousPageParam` 返回值不是 `null` 或 `undefined` 時為 `true`
- 現在提供 `isFetchingNextPage` 和 `isFetchingPreviousPage` 布林值，用於區分背景刷新狀態和載入更多狀態

> 注意：選項 `initialData` 或 `placeholderData` 需要符合具有 `data.pages` 和 `data.pageParams` 屬性的物件結構。

## 範例

假設我們有一個 API，基於 `cursor` 索引每次返回 3 個 `projects` 頁面，以及可用於獲取下一組專案的游標：

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

根據這些資訊，我們可以通過以下方式建立「載入更多」UI：

- 預設等待 `injectInfiniteQuery` 請求第一組資料
- 在 `getNextPageParam` 中返回下一個查詢的資訊
- 呼叫 `fetchNextPage` 函式

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
      ? '載入更多中...'
      : this.#hasNextPage()
        ? '載入新資料'
        : '已無更多資料',
  )

  #hasNextPage = this.query.hasNextPage
  #isFetchingNextPage = this.query.isFetchingNextPage
}
```

```angular-html
<div>
  @if (query.isPending()) {
  <p>載入中...</p>
  } @else if (query.isError()) {
  <span>錯誤: {{ query?.error().message }}</span>
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

必須理解的是，在進行中的 fetch 期間呼叫 `fetchNextPage` 有可能會覆蓋正在背景進行的資料刷新。當同時渲染列表和觸發 `fetchNextPage` 時，這種情況變得特別關鍵。

請記住，對於 InfiniteQuery 只能有一個進行中的 fetch。所有頁面共享單一快取條目，嘗試同時進行兩次 fetch 可能會導致資料覆寫。

如果你想啟用同時 fetch，可以在 `fetchNextPage` 中使用 `{ cancelRefetch: false }` 選項（預設為 true）。

為了確保查詢過程無衝突，強烈建議檢查查詢是否處於 `isFetching` 狀態，特別是當使用者不會直接控制該呼叫時。

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
    // 如果已在獲取中，則不執行任何操作
    if (this.query.isFetching()) return
    this.query.fetchNextPage()
  }
}
```

## 當無限查詢需要重新獲取時會發生什麼？

當無限查詢變為 `stale` 並需要重新獲取時，每組資料會從第一組開始「依序」獲取。這確保即使基礎資料發生變更，我們也不會使用過時的游標，從而可能導致重複或跳過記錄。如果無限查詢的結果從 queryCache 中移除，分頁將從初始狀態重新開始，僅請求初始組。

## 如果想實現雙向無限列表怎麼辦？

雙向列表可以通過使用 `getPreviousPageParam`、`fetchPreviousPage`、`hasPreviousPage` 和 `isFetchingPreviousPage` 屬性和函式來實現。

```ts
query = injectInfiniteQuery(() => ({
  queryKey: ['projects'],
  queryFn: fetchProjects,
  getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
  getPreviousPageParam: (firstPage, pages) => firstPage.prevCursor,
}))
```

## 如果想以相反順序顯示頁面怎麼辦？

有時你可能想以相反順序顯示頁面。如果是這種情況，可以使用 `select` 選項：

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

## 如果想手動更新無限查詢怎麼辦？

### 手動移除第一頁：

```tsx
queryClient.setQueryData(['projects'], (data) => ({
  pages: data.pages.slice(1),
  pageParams: data.pageParams.slice(1),
}))
```

### 手動從單個頁面中移除單個值：

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

### 僅保留第一頁：

```tsx
queryClient.setQueryData(['projects'], (data) => ({
  pages: data.pages.slice(0, 1),
  pageParams: data.pageParams.slice(0, 1),
}))
```

確保始終保持 pages 和 pageParams 的相同資料結構！

## 如果想限制頁面數量怎麼辦？

在某些使用情境下，你可能想限制查詢資料中儲存的頁面數量以提高效能和使用者體驗：

- 當使用者可以載入大量頁面時（記憶體使用）
- 當需要重新獲取包含數十頁的無限查詢時（網路使用：所有頁面會依序獲取）

解決方案是使用「有限無限查詢」。這可以通過將 `maxPages` 選項與 `getNextPageParam` 和 `getPreviousPageParam` 結合使用來實現，以便在需要時雙向獲取頁面。

在以下範例中，查詢資料 pages 陣列中僅保留 3 頁。如果需要重新獲取，將僅依序重新獲取 3 頁。

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

## 如果我的 API 不返回游標怎麼辦？

如果你的 API 不返回游標，可以使用 `pageParam` 作為游標。因為 `getNextPageParam` 和 `getPreviousPageParam` 也會獲取當前頁面的 `pageParam`，所以可以用它來計算下一個/上一個頁面參數。

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
