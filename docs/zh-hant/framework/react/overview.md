---
source-updated-at: '2025-04-02T06:45:29.000Z'
translation-updated-at: '2025-05-08T20:17:08.397Z'
id: overview
title: 概述
---

TanStack Query（前身為 React Query）常被稱為網頁應用程式中缺失的資料獲取函式庫，但用更技術性的術語來說，它能讓你在網頁應用程式中**獲取、快取、同步和更新伺服器狀態 (server state)** 變得輕而易舉。

## 動機

大多數核心網頁框架**並未**提供一種全面的方式來獲取或更新資料。因此，開發者最終要麼建立封裝了嚴格資料獲取觀點的元框架 (meta-frameworks)，要麼發明自己的資料獲取方式。這通常意味著拼湊基於元件的狀態和副作用，或是使用更通用的狀態管理函式庫來儲存並在應用程式中提供非同步資料。

雖然大多數傳統的狀態管理函式庫非常適合處理客戶端狀態 (client state)，但它們**在處理非同步或伺服器狀態 (server state) 時表現不佳**。這是因為**伺服器狀態完全不同**。首先，伺服器狀態：

- 遠端儲存在你可能無法控制或擁有的位置
- 需要非同步 API 來獲取和更新
- 意味著共享所有權，其他人可以在你不知情的情況下更改它
- 如果不小心處理，可能會在你的應用程式中變得「過時 (out of date)」

一旦你理解了應用程式中伺服器狀態的本質，**隨著進展還會出現更多挑戰**，例如：

- 快取...（可能是程式設計中最難的事情）
- 將多個相同資料的請求去重 (deduping) 為單一請求
- 在背景更新「過時」的資料
- 知道資料何時「過時」
- 盡快反映資料的更新
- 效能優化，如分頁 (pagination) 和懶加載資料 (lazy loading data)
- 管理伺服器狀態的記憶體和垃圾回收 (garbage collection)
- 透過結構共享 (structural sharing) 記憶化 (memoizing) 查詢結果

如果這份清單沒有讓你感到不知所措，那可能意味著你已經解決了所有伺服器狀態的問題，值得獲得一個獎項。然而，如果你像大多數人一樣，要麼尚未解決所有或大部分這些挑戰，而我們才剛剛觸及表面！

TanStack Query 無疑是管理伺服器狀態的**最佳**函式庫之一。它**開箱即用，無需配置**，並且可以根據你的喜好進行客製化，隨著應用程式的增長而調整。

TanStack Query 讓你能夠克服伺服器狀態的棘手挑戰和障礙，並在它開始控制你之前掌控你的應用程式資料。

從更技術性的角度來看，TanStack Query 可能會：

- 幫助你從應用程式中移除**許多**複雜且難以理解的程式碼，並用少量 TanStack Query 邏輯取代
- 使你的應用程式更易於維護，並更容易建立新功能，而無需擔心連接新的伺服器狀態資料來源
- 通過讓你的應用程式感覺比以往更快、更響應，直接影響你的終端使用者
- 可能幫助你節省頻寬並提高記憶體效能

[//]: # 'Example'

## 說夠了，直接展示程式碼吧！

在下面的範例中，你可以看到 TanStack Query 以最基本和簡單的形式用於獲取 TanStack Query GitHub 專案本身的 GitHub 統計資料：

[在 StackBlitz 中開啟](https://stackblitz.com/github/TanStack/query/tree/main/examples/react/simple)

```tsx
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  )
}

function Example() {
  const { isPending, error, data } = useQuery({
    queryKey: ['repoData'],
    queryFn: () =>
      fetch('https://api.github.com/repos/TanStack/query').then((res) =>
        res.json(),
      ),
  })

  if (isPending) return 'Loading...'

  if (error) return 'An error has occurred: ' + error.message

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
      <strong>👀 {data.subscribers_count}</strong>{' '}
      <strong>✨ {data.stargazers_count}</strong>{' '}
      <strong>🍴 {data.forks_count}</strong>
    </div>
  )
}
```

[//]: # 'Example'
[//]: # 'Materials'

## 你說服我了，接下來該怎麼做？

- 考慮參加官方的 [TanStack Query 課程](https://query.gg?s=tanstack)（或為整個團隊購買！）
- 透過我們詳盡的[逐步指南](./installation.md)和[API 參考](./reference/useQuery.md)按照自己的步調學習 TanStack Query

[//]: # 'Materials'
