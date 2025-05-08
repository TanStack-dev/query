---
source-updated-at: '2024-01-25T20:57:22.000Z'
translation-updated-at: '2025-05-08T20:21:05.614Z'
id: scroll-restoration
title: 滾動恢復
---

# 滾動恢復 (Scroll Restoration)

傳統上，當你在網頁瀏覽器中導航至先前造訪過的頁面時，會發現頁面會自動滾動到你上次離開時的相同位置。這項功能稱為**滾動恢復 (scroll restoration)**，但隨著網頁應用程式逐漸轉向客戶端資料獲取 (client side data fetching)，這項功能反而有所退步。然而，有了 TanStack Query，情況就不同了。

在 TanStack Query 中，所有查詢（包括分頁查詢和無限滾動查詢）的「滾動恢復」功能開箱即用™️。這是因為查詢結果會被緩存，並能在查詢渲染時同步獲取。只要你的查詢緩存時間足夠長（預設為 5 分鐘）且未被垃圾回收機制清除，滾動恢復功能就能始終完美運作。
