---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:21:39.068Z'
id: tkdodos-blog
title: TkDodo 的部落格
---

TanStack Query 的維護者 [TkDodo](https://bsky.app/profile/tkdodo.eu) 撰寫了一系列關於使用該函式庫的部落格文章。部分文章展示了通用的最佳實踐，但大多數都帶有鮮明的個人觀點。

## [#1: 實用 React Query](https://tkdodo.eu/blog/practical-react-query)

> 這是一篇進階的 React Query 介紹，展示了超越官方文件的實用技巧。內容涵蓋解釋預設值（`staleTime` 與 `gcTime`）、保持伺服器與客戶端狀態分離的概念、處理依賴項與創建自訂 Hook，以及說明為何 `enabled` 選項非常強大。[閱讀更多...](https://tkdodo.eu/blog/practical-react-query)

## [#2: React Query 資料轉換](https://tkdodo.eu/blog/react-query-data-transformations)

> 學習如何使用 React Query 執行常見且重要的資料轉換任務。從在 `queryFn` 中轉換到使用 `select` 選項，本文概述了各種不同方法的優缺點。[閱讀更多...](https://tkdodo.eu/blog/react-query-data-transformations)

## [#3: React Query 渲染優化](https://tkdodo.eu/blog/react-query-render-optimizations)

> 讓我們看看當使用 React Query 時，若元件過於頻繁重新渲染該如何處理。該函式庫本身已經相當優化，但仍有一些可選功能（如 `tracked queries`）可用來避免 `isFetching` 過渡。我們也將探討 `structural sharing` 的含義。[閱讀更多...](https://tkdodo.eu/blog/react-query-render-optimizations)

## [#4: React Query 中的狀態檢查](https://tkdodo.eu/blog/status-checks-in-react-query)

> 我們通常會先檢查 `isPending` 再檢查 `isError`，但有時應優先檢查 `data` 是否可用。本文展示錯誤的狀態檢查順序如何對使用者體驗產生負面影響。[閱讀更多...](https://tkdodo.eu/blog/status-checks-in-react-query)

## [#5: 測試 React Query](https://tkdodo.eu/blog/testing-react-query)

> 官方文件已涵蓋了測試 React Query 所需的基礎知識。本文提供了一些額外技巧（如關閉 `retries` 或靜默 `console`），適用於測試自訂 Hook 或使用它們的元件。文中還連結了一個[範例儲存庫](https://github.com/TkDodo/testing-react-query)，包含成功與錯誤狀態的測試案例，使用 `mock-service-worker` 驅動。[閱讀更多...](https://tkdodo.eu/blog/testing-react-query)

## [#6: React Query 與 TypeScript](https://tkdodo.eu/blog/react-query-and-type-script)

> 由於 React Query 本身使用 TypeScript 編寫，因此對其有極佳的支持。這篇部落格文章解釋了各種泛型、如何利用型別推論避免顯式標註 `useQuery` 等函式、如何處理 `unknown` 錯誤、型別縮窄如何運作等內容！[閱讀更多...](https://tkdodo.eu/blog/react-query-and-type-script)

## [#7: 在 React Query 中使用 WebSockets](https://tkdodo.eu/blog/using-web-sockets-with-react-query)

> 逐步指南，教你如何透過事件訂閱或直接推送完整資料到客戶端，實現 React Query 的即時通知功能。適用於瀏覽器原生 WebSocket API、Firebase 甚至 GraphQL 訂閱等場景。[閱讀更多...](https://tkdodo.eu/blog/using-web-sockets-with-react-query)

## [#8: 有效的 React Query 鍵值設計](https://tkdodo.eu/blog/effective-react-query-keys)

> 多數範例僅使用簡單的字串或陣列作為查詢鍵值，但當應用程式超越待辦事項清單規模後，該如何有效組織鍵值？本文展示如何透過共置與查詢鍵值工廠簡化工作。[閱讀更多...](https://tkdodo.eu/blog/effective-react-query-keys)

## [#8a: 活用查詢函式上下文](https://tkdodo.eu/blog/leveraging-the-query-function-context)

> 這是對前一篇部落格文章的補充，探討如何隨著應用程式成長，利用查詢函式上下文與物件查詢鍵值實現最高安全性。[閱讀更多...](https://tkdodo.eu/blog/leveraging-the-query-function-context)

## [#9: React Query 中的預留位置與初始資料](https://tkdodo.eu/blog/placeholder-and-initial-data-in-react-query)

> 預留位置與初始資料是兩個相似但不同的概念，都能同步顯示資料而非載入動畫以提升應用程式 UX。本文比較兩者並說明各自適用的場景。[閱讀更多...](https://tkdodo.eu/blog/placeholder-and-initial-data-in-react-query)

## [#10: 將 React Query 作為狀態管理器](https://tkdodo.eu/blog/react-query-as-a-state-manager)

> React Query 不會替你獲取資料——它是一個資料同步工具，特別擅長處理伺服器狀態。本文包含將 React Query 作為非同步狀態單一來源所需的一切知識。你將學習如何讓 React Query 發揮魔力，以及為何自訂 `staleTime` 可能就是你需要的全部。[閱讀更多...](https://tkdodo.eu/blog/react-query-as-a-state-manager)

## [#11: React Query 錯誤處理](https://tkdodo.eu/blog/react-query-error-handling)

> 處理錯誤是處理非同步資料（尤其是資料獲取）不可或缺的部分。我們必須面對現實：並非所有請求都會成功，也並非所有 Promise 都會實現。這篇部落格文章描述了 React Query 中應對錯誤的多種方式，如錯誤屬性、使用錯誤邊界或 onError 回調，讓你能為「出了問題」的情況做好準備。[閱讀更多...](https://tkdodo.eu/blog/react-query-error-handling)

## [#12: 精通 React Query 變異](https://tkdodo.eu/blog/mastering-mutations-in-react-query)

> 變異是處理伺服器資料時不可或缺的第二部分——用於需要更新資料的情境。這篇部落格文章涵蓋了什麼是變異及其與查詢的差異。你將學習 `mutate` 與 `mutateAsync` 的區別，以及如何將查詢與變異綁定在一起。[閱讀更多...](https://tkdodo.eu/blog/mastering-mutations-in-react-query)

## [#13: 離線狀態下的 React Query](https://tkdodo.eu/blog/offline-react-query)

> 產生 Promise 的方式有很多——這也是 React Query 所需的全部——但最常見的用例無疑是資料獲取。這通常需要活躍的網路連線。但有時，特別是在網路可能不穩定的行動裝置上，你的應用程式也需要在離線時運作。本文將介紹 React Query 提供的不同離線策略。[閱讀更多...](https://tkdodo.eu/blog/offline-react-query)

## [#14: React Query 與表單](https://tkdodo.eu/blog/react-query-and-forms)

> 表單往往模糊了伺服器狀態與客戶端狀態的界線。在多數應用程式中，我們不僅想顯示狀態，還希望讓使用者與之互動。本文展示了兩種不同方法，以及一些將 React Query 與表單結合使用的技巧。[閱讀更多...](https://tkdodo.eu/blog/react-query-and-forms)

## [#15: React Query 常見問題](https://tkdodo.eu/blog/react-query-fa-qs)

> 本文試圖回答關於 React Query 最常見的問題。[閱讀更多...](https://tkdodo.eu/blog/react-query-fa-qs)

## [#16: React Query 與 React Router 的結合](https://tkdodo.eu/blog/react-query-meets-react-router)

> Remix 和 React Router 正在改變我們對「何時獲取資料」的思考方式。本文深入探討為何 React Query 與支援資料載入的路由器是天作之合。[閱讀更多...](https://tkdodo.eu/blog/react-query-meets-react-router)

## [#17: 預填查詢快取](https://tkdodo.eu/blog/seeding-the-query-cache)

> 這篇部落格文章展示了多種在渲染開始前將資料存入查詢快取的方法，以最小化應用程式中顯示的載入動畫數量。選項範圍涵蓋從伺服器端預取、在路由器中預取到透過 `setQueryData` 預填快取項目。[閱讀更多...](https://tkdodo.eu/blog/seeding-the-query-cache)

## [#18: React Query 內部機制](https://tkdodo.eu/blog/inside-react-query)

> 如果你曾好奇 React Query 的底層運作原理——這篇文章就是為你準備的。它解釋了架構（包含視覺化圖表），從框架無關的 Query Core 開始，到它如何與框架特定適配器溝通。[閱讀更多...](https://tkdodo.eu/blog/inside-react-query)

## [#19: 型別安全的 React Query](https://tkdodo.eu/blog/type-safe-react-query)

> 「擁有型別」與「具備型別安全」之間存在巨大差異。本文試圖釐清這些差異，並展示如何在 TypeScript 中使用 React Query 獲得最佳的型別安全性。[閱讀更多...](https://tkdodo.eu/blog/type-safe-react-query)
