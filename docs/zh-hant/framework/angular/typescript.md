---
source-updated-at: '2024-11-20T12:58:00.000Z'
translation-updated-at: '2025-05-08T20:18:19.369Z'
id: typescript
title: TypeScript
---

TanStack Query 現已採用 **TypeScript** 編寫，以確保函式庫與您的專案具備型別安全！

注意事項：

- 目前型別系統要求使用 TypeScript **v4.7** 或更高版本
- 此儲存庫中的型別變更視為**非破壞性變更**，通常以 **patch** 版號發佈（否則每個型別增強都會導致主版號變更！）
- **強烈建議您將 angular-query-experimental 套件版本鎖定至特定 patch 版本**，並在升級時預期型別可能在任何版本間被修正或升級
- TanStack Query 的非型別相關公開 API（以及實驗階段後的 angular-query 套件）仍嚴格遵循語意化版本控制

## 型別推論

TanStack Query 的型別通常能良好流動，因此您無需自行添加型別註解

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

若您的 `queryFn` 有明確定義的返回型別，此機制效果最佳。請注意，多數資料獲取函式庫預設返回 `any`，因此請確保將其提取至正確型別的函式。

此範例中，我們將 Group[] 傳遞給 HttpClient `get` 方法的型別參數：

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

## 型別縮窄

TanStack Query 使用[可辨識聯合型別 (discriminated union type)](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions) 作為查詢結果，透過 `status` 欄位與衍生的狀態布林標記進行辨識。這讓您能檢查例如 `isSuccess()` 狀態來確保 `data` 已定義：

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

> TypeScript 目前不支援物件方法上的可辨識聯合型別。在物件（如查詢結果）上的訊號欄位縮窄僅適用於返回布林值的訊號。建議優先使用 `isSuccess()` 等布林狀態訊號，而非 `status() === 'success'`。

## 錯誤欄位型別

錯誤型別預設為 `Error`，因這符合多數使用者的預期：

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

若想拋出自訂錯誤或非 `Error` 的內容，可指定錯誤欄位的型別：

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

但此做法有缺點：`injectQuery` 的其他泛型參數將無法進行型別推論。通常不建議拋出非 `Error` 的內容，若您有像 `AxiosError` 的子類別，可使用**型別縮窄**使錯誤欄位更明確：

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

### 註冊全域錯誤型別

TanStack Query v5 允許設定全域錯誤型別，無需在呼叫端指定泛型，透過擴充 `Register` 介面實現。這能確保型別推論仍有效，同時錯誤欄位會是指定型別：

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

## 型別化 meta

### 註冊全域 Meta

類似註冊[全域錯誤型別](#registering-a-global-error)，您也可註冊全域 `Meta` 型別。這確保[查詢](./reference/injectQuery.md)與[變異](./reference/injectMutation.md)上的選填 `meta` 欄位保持一致且型別安全。注意註冊的型別必須擴展 `Record<string, unknown>`，以維持 `meta` 為物件的特性。

```ts
import '@tanstack/angular-query-experimental'

interface MyMeta extends Record<string, unknown> {
  // 您的 meta 型別定義
}

declare module '@tanstack/angular-query-experimental' {
  interface Register {
    queryMeta: MyMeta
    mutationMeta: MyMeta
  }
}
```

## 型別化查詢與變異鍵

### 註冊查詢與變異鍵型別

同樣類似註冊[全域錯誤型別](#registering-a-global-error)，您可註冊全域 `QueryKey` 與 `MutationKey` 型別。這讓您能為鍵提供更符合應用層級的結構化型別，並在函式庫所有相關功能中保持型別化。注意註冊的型別必須擴展 `Array` 型別，以維持鍵為陣列的特性。

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

## 型別化查詢選項

若將查詢選項直接內嵌至 `injectQuery`，會獲得自動型別推論。但您可能想將查詢選項提取至獨立函式，以便在 `injectQuery` 與如 `prefetchQuery` 之間共享，或在服務中管理。此時會失去型別推論，可透過 `queryOptions` 輔助工具恢復：

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

  // 也可傳遞返回查詢選項的訊號
  postQuery = injectQuery(this.optionsSignal)

  someMethod() {
    this.queryClient.prefetchQuery(this.queries.post(23))
  }
}
```

此外，`queryOptions` 返回的 `queryKey` 會知道關聯的 `queryFn`，我們可利用此型別資訊讓如 `queryClient.getQueryData` 等方法也能感知這些型別：

```ts
data = this.queryClient.getQueryData(groupOptions().queryKey)
// ^? data: Post | undefined
```

若無 `queryOptions`，資料型別會是 unknown，除非傳遞型別參數：

```ts
data = queryClient.getQueryData<Post>(['post', 1])
```

## 型別化變異選項

類似 `queryOptions`，您可使用 `mutationOptions` 將變異選項提取至獨立函式：

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

## 使用 `skipToken` 安全停用查詢

若使用 TypeScript，可使用 `skipToken` 停用查詢。這適用於需根據條件停用查詢，但仍希望保持查詢型別安全的場景。詳見[停用查詢](./guides/disabling-queries.md)指南。
