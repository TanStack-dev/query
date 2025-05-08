---
source-updated-at: '2024-11-14T21:48:46.000Z'
translation-updated-at: '2025-05-08T20:25:51.906Z'
id: paginated-queries
title: 分頁查詢
---

在 UI 中渲染分頁資料是非常常見的模式，而在 TanStack Query 中，只需將頁面資訊包含在查詢鍵 (query key) 中即可「直接運作」：

```ts
const result = injectQuery(() => ({
  queryKey: ['projects', page()],
  queryFn: fetchProjects,
}))
```

然而，當你運行這個簡單範例時，可能會注意到一個奇怪的現象：

**UI 會在 `success` 和 `pending` 狀態之間跳動，因為每個新頁面都被視為全新的查詢。**

這種體驗並不理想，但不幸的是，這也是目前許多工具堅持的工作方式。但 TanStack Query 不同！如你所料，TanStack Query 提供了一個名為 `placeholderData` 的強大功能來解決這個問題。

## 使用 `placeholderData` 實現更好的分頁查詢

考慮以下範例，我們理想情況下希望增加查詢的頁面索引 (pageIndex) 或游標 (cursor)。如果使用 `injectQuery`，**技術上仍能正常運作**，但當為每個頁面或游標創建和銷毀不同查詢時，UI 仍會在 `success` 和 `pending` 狀態之間跳動。通過將 `placeholderData` 設為 `(previousData) => previousData` 或使用 TanStack Query 導出的 `keepPreviousData` 函數，我們可以獲得以下新特性：

- **即使查詢鍵 (query key) 已更改，上次成功獲取的資料仍可在請求新資料時使用**。
- 當新資料到達時，舊的 `data` 會無縫切換以顯示新資料。
- 可透過 `isPlaceholderData` 判斷查詢當前提供的資料類型

```angular-ts
@Component({
  selector: 'pagination-example',
  template: `
    <div>
      <p>
        在此範例中，當獲取下一頁資料時，當前頁面的資料仍保持可見。按鈕和前往下一頁的功能也會在下一頁游標未知時被禁用。每一頁都會像普通查詢一樣被緩存，因此當返回上一頁時，你會立即看到它們，同時它們也會在背景無形中被重新獲取。
      </p>
      @if (query.status() === 'pending') {
        <div>載入中...</div>
      } @else if (query.status() === 'error') {
        <div>錯誤: {{ query.error().message }}</div>
      } @else {
        <!-- 'data' 要麼解析為最新頁面的資料 -->
        <!-- 要麼在獲取新頁面時，顯示最後一次成功的頁面資料 -->
        <div>
          @for (project of query.data().projects; track project.id) {
            <p>{{ project.name }}</p>
          }
        </div>
      }

      <div>當前頁面: {{ page() + 1 }}</div>
      <button (click)="previousPage()" [disabled]="page() === 0">
        上一頁
      </button>
      <button
        (click)="nextPage()"
        [disabled]="query.isPlaceholderData() || !query.data()?.hasMore"
      >
        下一頁
      </button>
      <!-- 由於最後一頁的資料可能在頁面請求之間持續存在 -->
      <!-- 我們可以使用 'isFetching' 來顯示背景載入指示器 -->
      <!-- 因為 status === 'pending' 狀態不會被觸發 -->
      @if (query.isFetching()) {
        <span> 載入中...</span>
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
      // 預先獲取下一頁！
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

## 使用 `placeholderData` 實現延遲無限查詢結果

雖然不那麼常見，但 `placeholderData` 選項也能與 `injectInfiniteQuery` 函數完美配合，讓你能在無限查詢鍵隨時間變化的同時，無縫地讓使用者繼續查看緩存的資料。
