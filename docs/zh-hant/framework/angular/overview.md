---
source-updated-at: '2025-04-13T18:21:31.000Z'
translation-updated-at: '2025-05-08T20:17:51.709Z'
id: overview
title: 概述
---

> 重要提示：此函式庫目前處於實驗階段。這意味著次要版本和修補版本都可能包含破壞性變更。升級時請謹慎操作。若您要在生產環境中使用此實驗階段的套件，請將版本鎖定在特定修補版本，以避免意外的破壞性變更。

`@tanstack/angular-query-experimental` 套件提供了在 Angular 中使用 TanStack Query 的一流 API。

## 歡迎提供意見回饋！

我們正在努力為 TanStack Query 在 Angular 上建立穩定的 API。如果您有任何意見，請透過 [TanStack Discord](https://tlinz.com/discord) 伺服器聯繫我們，或到 [GitHub 上的這個討論串](https://github.com/TanStack/query/discussions/6293)留言。

## 支援的 Angular 版本

TanStack Query 相容於 Angular v16 及更高版本。

TanStack Query (前身為 React Query) 常被稱為網頁應用程式中缺失的資料獲取函式庫，但更技術性地來說，它能讓您在網頁應用程式中輕鬆實現**獲取、快取、同步和更新伺服器狀態 (server state)**。

## 動機

大多數核心網頁框架**並未**提供一套全面的資料獲取或更新方法。因此，開發者最終要麼建立封裝了嚴格資料獲取觀點的元框架 (meta-frameworks)，要麼發明自己的資料獲取方式。這通常意味著拼湊基於元件的狀態和副作用，或者使用更通用的狀態管理函式庫來儲存並在應用程式中提供非同步資料。

雖然大多數傳統的狀態管理函式庫非常適合處理客戶端狀態 (client state)，但它們**在處理非同步或伺服器狀態 (server state) 時表現不佳**。這是因為**伺服器狀態完全不同**。首先，伺服器狀態：

- 遠端儲存在您可能無法控制或擁有的位置
- 需要非同步 API 來獲取和更新
- 意味著共享所有權，其他人可能在您不知情的情況下更改它
- 如果不小心處理，可能會在您的應用程式中變得「過時」

一旦您理解了應用程式中伺服器狀態的本質，**隨著開發進展，更多挑戰會接踵而至**，例如：

- 快取...（可能是程式設計中最難實現的部分）
- 將多個相同資料的請求去重 (deduping) 為單一請求
- 在後台更新「過時」的資料
- 知道資料何時「過時」
- 盡快反映資料的更新
- 效能優化，如分頁 (pagination) 和懶加載 (lazy loading) 資料
- 管理伺服器狀態的記憶體和垃圾回收
- 透過結構共享 (structural sharing) 記憶化 (memoizing) 查詢結果

如果這份清單沒有讓您感到不知所措，那可能意味著您已經解決了所有伺服器狀態的問題，值得獲得獎勵。然而，如果您像大多數人一樣，要麼尚未解決全部或大部分挑戰，而我們才剛剛觸及表面！

TanStack Query 無疑是管理伺服器狀態的最佳函式庫之一。它**開箱即用、零配置**，並且可以隨著應用程式的增長按您的喜好進行**自訂**。

TanStack Query 讓您能夠戰勝並克服伺服器狀態的棘手挑戰和障礙，在它開始控制您之前掌控您的應用程式資料。

從更技術的角度來看，TanStack Query 可能會：

- 幫助您從應用程式中移除**許多**複雜且難以理解的程式碼，並用寥寥幾行 TanStack Query 邏輯取代
- 使您的應用程式更易於維護，並在無需擔心連接新的伺服器狀態資料來源的情況下更容易建立新功能
- 透過讓您的應用程式感覺比以往更快、更靈敏，直接影響您的終端使用者
- 可能幫助您節省頻寬並提高記憶體效能

[//]: # '範例'

## 說夠了，快給我看看程式碼！

在下面的範例中，您可以看到 TanStack Query 以最基本和簡單的形式用於獲取 TanStack Query GitHub 專案本身的 GitHub 統計資料：

[在 StackBlitz 中開啟](https://stackblitz.com/github/TanStack/query/tree/main/examples/angular/simple)

```angular-ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { CommonModule } from '@angular/common'
import { injectQuery } from '@tanstack/angular-query-experimental'
import { lastValueFrom } from 'rxjs'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'simple-example',
  standalone: true,
  template: `
    @if (query.isPending()) {
      Loading...
    }
    @if (query.error()) {
      An error has occurred: {{ query.error().message }}
    }
    @if (query.data(); as data) {
      <h1>{{ data.name }}</h1>
      <p>{{ data.description }}</p>
      <strong>👀 {{ data.subscribers_count }}</strong>
      <strong>✨ {{ data.stargazers_count }}</strong>
      <strong>🍴 {{ data.forks_count }}</strong>
    }
  `
})
export class SimpleExampleComponent {
  http = inject(HttpClient)

  query = injectQuery(() => ({
    queryKey: ['repoData'],
    queryFn: () =>
      lastValueFrom(
        this.http.get<Response>('https://api.github.com/repos/tanstack/query'),
      ),
  }))
}

interface Response {
  name: string
  description: string
  subscribers_count: number
  stargazers_count: number
  forks_count: number
}
```

## 您說服我了，接下來該怎麼做？

- 按照自己的步調學習 TanStack Query，我們提供了詳盡的[逐步指南](../installation.md)和[API 參考文件](../reference/functions/injectquery.md)
