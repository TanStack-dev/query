---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-08T20:15:31.418Z'
id: graphql
title: GraphQL
---

由於 Vue Query 的資料獲取機制是基於 Promise 無關性 (agnostically) 建構的，您實際上可以將 Vue Query 與任何非同步資料獲取客戶端搭配使用，包括 GraphQL！

> 請注意，Vue Query 不支援正規化快取 (normalized caching)。雖然絕大多數使用者實際上並不需要正規化快取，甚至從中獲得的效益不如他們想像的那麼多，但在極少數情況下可能需要此功能，因此請務必先與我們確認，以確保這確實是您需要的功能！
