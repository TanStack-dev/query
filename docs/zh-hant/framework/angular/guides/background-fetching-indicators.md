---
source-updated-at: '2025-03-01T21:43:55.000Z'
translation-updated-at: '2025-05-08T20:26:11.071Z'
id: background-fetching-indicators
title: 背景獲取指示器
---

查詢的 `status === 'pending'` 狀態足以顯示查詢的初始硬載入狀態，但有時您可能希望額外顯示一個指示器，表示查詢正在背景重新獲取資料。為此，查詢還提供了一個 `isFetching` 布林值，您可以用來顯示它正處於獲取狀態，無論 `status` 變數的狀態為何：

```angular-ts
@Component({
  selector: 'todos',
  template: `
    @if (todosQuery.isPending()) {
      Loading...
    } @else if (todosQuery.isError()) {
      An error has occurred: {{ todosQuery.error().message }}
    } @else if (todosQuery.isSuccess()) {
      @if (todosQuery.isFetching()) {
        Refreshing...
      }
      @for (todos of todosQuery.data(); track todo.id) {
        <todo [todo]="todo" />
      }
    }
  `,
})
class TodosComponent {
  todosQuery = injectQuery(() => ({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  }))
}
```

## 顯示全域背景獲取載入狀態

除了個別查詢的載入狀態外，如果您希望在**任何**查詢正在獲取資料時（包括在背景）顯示全域載入指示器，可以使用 `useIsFetching` 鉤子：

```angular-ts
import { injectIsFetching } from '@tanstack/angular-query-experimental'

@Component({
  selector: 'global-loading-indicator',
  template: `
    @if (isFetching()) {
      <div>Queries are fetching in the background...</div>
    }
  `,
})
export class GlobalLoadingIndicatorComponent {
  isFetching = injectIsFetching()
}
```
