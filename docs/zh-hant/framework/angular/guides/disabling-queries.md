---
source-updated-at: '2025-03-01T21:43:55.000Z'
translation-updated-at: '2025-05-08T20:26:18.461Z'
id: disabling-queries
title: 停用/暫停查詢
---

若想阻止查詢 (query) 自動執行，可使用 `enabled = false` 選項。`enabled` 選項也接受回傳布林值的回調函式。

當 `enabled` 為 `false` 時：

- 若查詢有快取資料，則會以 `status === 'success'` 或 `isSuccess` 狀態初始化。
- 若查詢無快取資料，則會以 `status === 'pending'` 和 `fetchStatus === 'idle'` 狀態開始。
- 查詢不會在掛載時自動抓取資料。
- 查詢不會在背景自動重新抓取。
- 查詢會忽略查詢客戶端 (query client) 的 `invalidateQueries` 和 `refetchQueries` 呼叫（這些呼叫通常會觸發重新抓取）。
- 從 `injectQuery` 回傳的 `refetch` 可用於手動觸發查詢抓取，但與 `skipToken` 併用時無效。

> TypeScript 使用者可改用 [skipToken](#typesafe-disabling-of-queries-using-skiptoken) 作為 `enabled = false` 的替代方案。

```angular-ts
@Component({
  selector: 'todos',
  template: `<div>
    <button (click)="query.refetch()">Fetch Todos</button>

    @if (query.data()) {
      <ul>
        @for (todo of query.data(); track todo.id) {
          <li>{{ todo.title }}</li>
        }
      </ul>
    } @else {
      @if (query.isError()) {
        <span>Error: {{ query.error().message }}</span>
      } @else if (query.isLoading()) {
        <span>Loading...</span>
      } @else if (!query.isLoading() && !query.isError()) {
        <span>Not ready ...</span>
      }
    }

    <div>{{ query.isLoading() ? 'Fetching...' : '' }}</div>
  </div>`,
})
export class TodosComponent {
  query = injectQuery(() => ({
    queryKey: ['todos'],
    queryFn: fetchTodoList,
    enabled: false,
  }))
}
```

永久停用查詢會使您無法使用 TanStack Query 提供的許多強大功能（例如背景重新抓取），這也非慣用做法。此做法會讓您從宣告式模式（定義查詢執行時機的依賴條件）轉為命令式模式（點擊時才抓取資料），且無法傳遞參數給 `refetch`。多數情況下，您真正需要的是延遲初始抓取的「懶查詢 (lazy query)」：

## 懶查詢 (Lazy Queries)

`enabled` 選項不僅能永久停用查詢，還能在後續動態啟用/停用。典型範例是篩選表單——您可能希望使用者輸入篩選值後才發送首次請求：

```angular-ts
@Component({
  selector: 'todos',
  template: `
    <div>
      // 🚀 套用篩選條件將啟用並執行查詢
      <filters-form onApply="filter.set" />
      <todos-table data="query.data()" />
    </div>
  `,
})
export class TodosComponent {
  filter = signal('')

  todosQuery = injectQuery(() => ({
    queryKey: ['todos', this.filter()],
    queryFn: () => fetchTodos(this.filter()),
    enabled: !!this.filter(),
  }))
}
```

### isLoading (原為 `isInitialLoading`)

懶查詢會從開始就處於 `status: 'pending'` 狀態，因為 `pending` 表示尚未取得資料。雖然技術上正確，但由於當前並未抓取資料（查詢未啟用），您可能無法用此標誌顯示載入旋轉圖示。

若使用停用或懶查詢，可改用 `isLoading` 標誌。此為衍生標誌，由以下條件計算：

`isPending && isFetching`

因此僅在查詢首次抓取資料時會回傳 `true`。

## 使用 `skipToken` 實現類型安全的查詢停用

若使用 TypeScript，可用 `skipToken` 停用查詢。這適用於需基於條件停用查詢，但仍需保持類型安全的場景。

> 重要：`injectQuery` 的 `refetch` 與 `skipToken` 併用時無效，除此之外 `skipToken` 行為與 `enabled: false` 相同。

```angular-ts
import { skipToken, injectQuery } from '@tanstack/query-angular'

@Component({
  selector: 'todos',
  template: `
    <div>
      // 🚀 套用篩選條件將啟用並執行查詢
      <filters-form onApply="filter.set" />
      <todos-table data="query.data()" />
    </div>
  `,
})
export class TodosComponent {
  filter = signal('')

  todosQuery = injectQuery(() => ({
    queryKey: ['todos', this.filter()],
    queryFn: this.filter() ? () => fetchTodos(this.filter()) : skipToken,
  }))
}
```
