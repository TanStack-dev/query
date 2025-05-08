---
source-updated-at: '2025-03-01T21:43:55.000Z'
translation-updated-at: '2025-05-08T20:17:43.461Z'
id: Angular-HttpClient-and-other-data-fetching-clients
title: Angular HttpClient 與其他資料獲取客戶端
---

由於 TanStack Query 的資料獲取機制是基於 Promise 不可知論 (Promise-agnostic) 設計的，您實際上可以使用任何非同步資料獲取客戶端，包括瀏覽器原生的 `fetch` API、`graphql-request` 等等。

## 使用 Angular 的 `HttpClient` 進行資料獲取

`HttpClient` 是 Angular 強大且整合完善的一部分，具有以下優勢：

- 在單元測試中使用 [provideHttpClientTesting](https://angular.dev/guide/http/testing) 模擬回應。
- [攔截器 (Interceptors)](https://angular.dev/guide/http/interceptors) 可用於多種功能，例如添加驗證標頭、執行日誌記錄等。雖然某些資料獲取函式庫有自己的攔截器系統，但 `HttpClient` 的攔截器與 Angular 的依賴注入系統深度整合。
- `HttpClient` 會自動通知 [`PendingTasks`](https://angular.dev/api/core/PendingTasks#)，讓 Angular 能感知待處理的請求。單元測試和 SSR 可利用應用程式的 _穩定性_ 資訊來等待待處理請求完成，這使得 [無區域 (Zoneless)](https://angular.dev/guide/experimental/zoneless) 應用的單元測試更加容易。
- 使用 SSR 時，`HttpClient` 會[快取伺服器端的請求](https://angular.dev/guide/ssr#caching-data-when-using-HttpClient)，避免客戶端發出不必要的請求。`HttpClient` 的 SSR 快取功能開箱即用。TanStack Query 雖有更強大的 hydration 功能，但需要額外設定。選擇哪種方案取決於您的具體需求。

### 在 `queryFn` 中使用可觀察物件 (Observables)

由於 TanStack Query 是基於 Promise 的函式庫，來自 `HttpClient` 的可觀察物件需轉換為 Promise。這可透過 `rxjs` 的 `lastValueFrom` 或 `firstValueFrom` 函式實現。

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

> 由於 Angular 正逐步將 RxJS 改為可選依賴，預計 `HttpClient` 未來也將支援 Promise。
>
> TanStack Query for Angular 計劃加入對可觀察物件的支援。

## 比較表格

| 資料獲取客戶端                     | 優點                             | 缺點                                          |
| ---------------------------------- | -------------------------------- | --------------------------------------------- |
| **Angular HttpClient**             | 功能豐富且與 Angular 深度整合。  | 需將可觀察物件轉換為 Promise。                |
| **Fetch**                          | 瀏覽器原生 API，不增加套件體積。 | 功能陽春的 API，缺乏許多進階特性。            |
| **專用函式庫如 `graphql-request`** | 針對特定使用場景提供專屬功能。   | 若非 Angular 專用函式庫，與框架的整合度較差。 |
