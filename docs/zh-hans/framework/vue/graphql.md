---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-06T05:28:32.281Z'
id: graphql
title: GraphQL
---
由于 Vue Query 的获取机制是基于 Promise 无感知构建的，您实际上可以将 Vue Query 与任何异步数据获取客户端一起使用，包括 GraphQL！

> 请注意，Vue Query 不支持规范化缓存 (normalized caching)。虽然绝大多数用户实际上并不需要规范化缓存，甚至从中获得的收益比他们想象的要少得多，但在极少数情况下可能需要它，因此请务必先与我们确认，以确保这确实是您所需要的功能！
