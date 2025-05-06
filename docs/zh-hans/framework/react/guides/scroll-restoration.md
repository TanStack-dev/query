---
source-updated-at: '2024-01-25T20:57:22.000Z'
translation-updated-at: '2025-05-06T04:09:15.717Z'
id: scroll-restoration
title: 滚动恢复
---

## 滚动恢复 (Scroll Restoration)

传统上，当你在网页浏览器中导航回之前访问过的页面时，会发现页面会自动滚动到你上次离开时的位置。这一功能被称为 **滚动恢复 (scroll restoration)**。但随着现代 Web 应用逐渐转向客户端数据获取 (client side data fetching)，这一特性曾出现了一定程度的退化。不过在使用 TanStack Query 时，情况就完全不同了。

开箱即用，所有查询（包括分页查询和无限加载查询）的"滚动恢复 (scroll restoration)"功能在 TanStack Query 中都能完美运作™️。这是因为查询结果会被缓存，并且在组件渲染时可以同步获取。只要你的查询缓存时间足够长（默认缓存时间为 5 分钟）且未被垃圾回收机制清除，滚动恢复功能就能始终正常工作。
