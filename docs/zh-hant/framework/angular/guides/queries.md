---
source-updated-at: '2025-03-01T21:43:55.000Z'
translation-updated-at: '2025-05-08T20:25:38.940Z'
id: queries
title: 查詢
---

## 查詢基礎

查詢是基於**唯一鍵**與非同步資料來源綁定的宣告式依賴關係。查詢可與任何基於 Promise 的方法（包括 GET 和 POST 方法）一起使用，從伺服器獲取資料。若您的方法會修改伺服器上的資料，建議改用[變更 (Mutations)](./mutations.md)。

要在元件或服務中訂閱查詢，請調用 `injectQuery` 並至少提供以下參數：

- **查詢的唯一鍵**
- 一個回傳 Promise 或 Observable 的函式，該函式應：
  - 解析資料，或
  - 拋出錯誤

```ts
import { injectQuery } from '@tanstack/angular-query-experimental'

export class TodosComponent {
  info = injectQuery(() => ({ queryKey: ['todos'], queryFn: fetchTodoList }))
}
```

您提供的**唯一鍵**會在內部用於重新獲取、快取及在應用程式中共享查詢。

`injectQuery` 回傳的查詢結果包含所有與查詢相關的資訊，可供模板渲染或其他資料使用：

```ts
result = injectQuery(() => ({ queryKey: ['todos'], queryFn: fetchTodoList }))
```

`result` 物件包含幾個非常重要的狀態，您需要了解這些狀態才能有效使用。查詢在任何時刻只能處於以下其中一種狀態：

- `isPending` 或 `status === 'pending'` - 查詢尚未取得資料
- `isError` 或 `status === 'error'` - 查詢遇到錯誤
- `isSuccess` 或 `status === 'success'` - 查詢成功且資料可用

除了這些主要狀態外，根據查詢的狀態還可獲取更多資訊：

- `error` - 若查詢處於 `isError` 狀態，可透過 `error` 屬性取得錯誤資訊。
- `data` - 若查詢處於 `isSuccess` 狀態，可透過 `data` 屬性取得資料。
- `isFetching` - 在任何狀態下，若查詢正在獲取資料（包括背景重新獲取），`isFetching` 會為 `true`。

對於**大多數**查詢，通常只需先檢查 `isPending` 狀態，再檢查 `isError` 狀態，最後即可假設資料已可用並渲染成功狀態：

```angular-ts
@Component({
  selector: 'todos',
  standalone: true,
  template: `
    @if (todos.isPending()) {
      <span>Loading...</span>
    } @else if (todos.isError()) {
      <span>Error: {{ todos.error()?.message }}</span>
    } @else {
      <!-- 此時可假設 status === 'success' -->
      @for (todo of todos.data(); track todo.id) {
        <li>{{ todo.title }}</li>
      } @empty {
        <li>No todos found</li>
      }
    }
  `,
})
export class PostsComponent {
  todos = injectQuery(() => ({
    queryKey: ['todos'],
    queryFn: fetchTodoList,
  }))
}
```

若不喜歡使用布林值，也可以直接使用 `status` 狀態：

```angular-ts
@Component({
  selector: 'todos',
  standalone: true,
  template: `
    @switch (todos.status()) {
      @case ('pending') {
        <span>Loading...</span>
      }
      @case ('error') {
        <span>Error: {{ todos.error()?.message }}</span>
      }
      <!-- 雖然 status === 'success'，但使用 "else" 邏輯也適用 -->
      @default {
        <ul>
          @for (todo of todos.data(); track todo.id) {
            <li>{{ todo.title }}</li>
          } @empty {
            <li>No todos found</li>
          }
        </ul>
      }
    }
  `,
})
class TodosComponent {}
```

若您在存取 `data` 前已檢查過 `pending` 和 `error`，TypeScript 也會正確縮小 `data` 的型別範圍。

### 獲取狀態 (FetchStatus)

除了 `status` 欄位外，您還會獲得一個額外的 `fetchStatus` 屬性，其選項如下：

- `fetchStatus === 'fetching'` - 查詢正在獲取資料。
- `fetchStatus === 'paused'` - 查詢想要獲取資料，但被暫停。詳情請參閱[網路模式 (Network Mode)](./network-mode.md)指南。
- `fetchStatus === 'idle'` - 查詢目前未進行任何操作。

### 為何需要兩種不同狀態？

背景重新獲取與過期資料重新驗證邏輯會導致 `status` 和 `fetchStatus` 的所有組合都可能出現。例如：

- 處於 `success` 狀態的查詢通常會處於 `idle` 獲取狀態，但若正在進行背景重新獲取，也可能處於 `fetching` 狀態。
- 剛掛載且無資料的查詢通常會處於 `pending` 狀態和 `fetching` 獲取狀態，但若無網路連接，也可能處於 `paused` 狀態。

因此請記住，查詢可能處於 `pending` 狀態但實際上並未獲取資料。簡單來說：

- `status` 提供關於 `data` 的資訊：我們是否有資料？
- `fetchStatus` 提供關於 `queryFn` 的資訊：它是否正在執行？
