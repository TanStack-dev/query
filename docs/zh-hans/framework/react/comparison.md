---
source-updated-at: '2024-07-11T12:20:14.000Z'
translation-updated-at: '2025-05-06T04:32:05.206Z'
id: comparison
title: 对比
---

> 本对比表格力求准确公正。若您使用过其中任一库并认为信息有待完善，欢迎通过页面底部的 "Edit this page on Github" 链接提交修改建议（需附说明或证据）。

功能/能力说明：

- ✅ 开箱即用，无需额外配置或代码
- 🟡 支持，但需通过第三方或社区库实现
- 🔶 官方支持且文档完备，但需用户自行编写实现代码
- 🛑 无官方支持或文档

|                                       | React Query                              | SWR [_(官网)_][swr]           | Apollo Client [_(官网)_][apollo] | RTK-Query [_(官网)_][rtk-query]      | React Router [_(官网)_][react-router]                                     |
| ------------------------------------- | ---------------------------------------- | ----------------------------- | -------------------------------- | ------------------------------------ | ------------------------------------------------------------------------- |
| GitHub 仓库/星标数                    | [![][stars-react-query]][gh-react-query] | [![][stars-swr]][gh-swr]      | [![][stars-apollo]][gh-apollo]   | [![][stars-rtk-query]][gh-rtk-query] | [![][stars-react-router]][gh-react-router]                                |
| 平台要求                              | React                                    | React                         | React, GraphQL                   | Redux                                | React                                                                     |
| 官方对比                              |                                          | (无)                          | (无)                             | [对比][rtk-query-comparison]         | (无)                                                                      |
| 支持的查询语法                        | Promise, REST, GraphQL                   | Promise, REST, GraphQL        | GraphQL, 任意 (响应式变量)       | Promise, REST, GraphQL               | Promise, REST, GraphQL                                                    |
| 支持的框架                            | React                                    | React                         | React + 其他                     | 任意                                 | React                                                                     |
| 缓存策略                              | 层级键值对                               | 唯一键值对                    | 规范化 Schema                    | 唯一键值对                           | 嵌套路由 -> 值                                                            |
| 缓存键策略                            | JSON                                     | JSON                          | GraphQL 查询                     | JSON                                 | 路由路径                                                                  |
| 缓存变更检测                          | 深度比较键值（稳定序列化）               | 深度比较键值（稳定序列化）    | 深度比较键值（非稳定序列化）     | 键值引用相等 (===)                   | 路由变更                                                                  |
| 数据变更检测                          | 深度比较 + 结构共享                      | 深度比较 (通过 `stable-hash`) | 深度比较（非稳定序列化）         | 键值引用相等 (===)                   | 加载器执行                                                                |
| 数据记忆化                            | 完整结构共享                             | 标识相等 (===)                | 规范化标识                       | 标识相等 (===)                       | 标识相等 (===)                                                            |
| 包体积                                | [![][bp-react-query]][bpl-react-query]   | [![][bp-swr]][bpl-swr]        | [![][bp-apollo]][bpl-apollo]     | [![][bp-rtk-query]][bpl-rtk-query]   | [![][bp-react-router]][bpl-react-router] + [![][bp-history]][bpl-history] |
| API 定义位置                          | 组件内，外部配置                         | 组件内                        | GraphQL Schema                   | 外部配置                             | 路由树配置                                                                |
| 查询                                  | ✅                                       | ✅                            | ✅                               | ✅                                   | ✅                                                                        |
| 缓存持久化                            | ✅                                       | ✅                            | ✅                               | ✅                                   | 🛑 仅活跃路由 <sup>8</sup>                                                |
| 开发者工具                            | ✅                                       | ✅                            | ✅                               | ✅                                   | 🛑                                                                        |
| 轮询/间隔查询                         | ✅                                       | ✅                            | ✅                               | ✅                                   | 🛑                                                                        |
| 并行查询                              | ✅                                       | ✅                            | ✅                               | ✅                                   | ✅                                                                        |
| 依赖查询                              | ✅                                       | ✅                            | ✅                               | ✅                                   | ✅                                                                        |
| 分页查询                              | ✅                                       | ✅                            | ✅                               | ✅                                   | ✅                                                                        |
| 无限查询                              | ✅                                       | ✅                            | ✅                               | 🛑                                   | 🛑                                                                        |
| 双向无限查询                          | ✅                                       | 🔶                            | 🔶                               | 🛑                                   | 🛑                                                                        |
| 无限查询重获取                        | ✅                                       | ✅                            | 🛑                               | 🛑                                   | 🛑                                                                        |
| 滞后查询数据<sup>1</sup>              | ✅                                       | ✅                            | ✅                               | ✅                                   | ✅                                                                        |
| 选择器                                | ✅                                       | 🛑                            | ✅                               | ✅                                   | N/A                                                                       |
| 初始数据                              | ✅                                       | ✅                            | ✅                               | ✅                                   | ✅                                                                        |
| 滚动恢复                              | ✅                                       | ✅                            | ✅                               | ✅                                   | ✅                                                                        |
| 缓存操作                              | ✅                                       | ✅                            | ✅                               | ✅                                   | 🛑                                                                        |
| 过时查询丢弃                          | ✅                                       | ✅                            | ✅                               | ✅                                   | ✅                                                                        |
| 渲染批处理与优化<sup>2</sup>          | ✅                                       | ✅                            | 🛑                               | ✅                                   | ✅                                                                        |
| 自动垃圾回收                          | ✅                                       | 🛑                            | 🛑                               | ✅                                   | N/A                                                                       |
| 变更钩子                              | ✅                                       | ✅                            | ✅                               | ✅                                   | ✅                                                                        |
| 离线变更支持                          | ✅                                       | 🛑                            | 🟡                               | 🛑                                   | 🛑                                                                        |
| 预获取 API                            | ✅                                       | ✅                            | ✅                               | ✅                                   | ✅                                                                        |
| 查询取消                              | ✅                                       | 🛑                            | 🛑                               | 🛑                                   | ✅                                                                        |
| 部分查询匹配<sup>3</sup>              | ✅                                       | 🔶                            | ✅                               | ✅                                   | N/A                                                                       |
| 后台重新验证 (Stale While Revalidate) | ✅                                       | ✅                            | ✅                               | ✅                                   | 🛑                                                                        |
| 过期时间配置                          | ✅                                       | 🛑<sup>7</sup>                | 🛑                               | ✅                                   | 🛑                                                                        |
| 预使用查询/变更配置<sup>4</sup>       | ✅                                       | 🛑                            | ✅                               | ✅                                   | ✅                                                                        |
| 窗口聚焦重获取                        | ✅                                       | ✅                            | 🛑                               | ✅                                   | 🛑                                                                        |
| 网络状态重获取                        | ✅                                       | ✅                            | ✅                               | ✅                                   | 🛑                                                                        |
| 通用缓存脱水/再水合                   | ✅                                       | 🛑                            | ✅                               | ✅                                   | ✅                                                                        |
| 离线缓存                              | ✅                                       | 🛑                            | ✅                               | 🔶                                   | 🛑                                                                        |
| React Suspense 支持                   | ✅                                       | ✅                            | ✅                               | 🛑                                   | ✅                                                                        |
| 抽象化/框架无关核心                   | ✅                                       | 🛑                            | ✅                               | ✅                                   | 🛑                                                                        |
| 变更后自动重获取<sup>5</sup>          | 🔶                                       | 🔶                            | ✅                               | ✅                                   | ✅                                                                        |
| 规范化缓存<sup>6</sup>                | 🛑                                       | 🛑                            | ✅                               | 🛑                                   | 🛑                                                                        |

### 注解

> **<sup>1</sup> 滞后查询数据** - React Query 允许在加载新查询时继续显示现有查询数据（类似于 Suspense 即将原生提供的 UX）。这在编写分页 UI 或无限加载 UI 时至关重要，可避免每次请求新查询时出现生硬的加载状态。其他库不具备此能力，会在新查询加载时呈现生硬加载状态（除非已预获取）。

> **<sup>2</sup> 渲染优化** - React Query 具有卓越的渲染性能。默认会跟踪访问字段，仅在这些字段变化时重新渲染。若需禁用此优化，将 `notifyOnChangeProps` 设为 `'all'` 会在查询更新时重新渲染组件（例如获取新数据时）。React Query 还会批量更新，确保多组件使用同一查询时应用仅重新渲染一次。若仅关注 `data` 或 `error` 属性，可通过设置 `notifyOnChangeProps` 为 `['data', 'error']` 进一步减少渲染次数。

> **<sup>3</sup> 部分查询匹配** - 因 React Query 使用确定性查询键序列化，可操作变量组查询而无需知晓每个具体查询键。例如：可重新获取键以 `todos` 开头的所有查询（无论变量如何），或精准定位带（或不带）变量的特定查询，甚至使用过滤函数匹配符合特定条件的查询。

> **<sup>4</sup> 预使用查询配置** - 指在查询/变更被使用前预先配置其行为的能力。例如：可预先为查询设置完整默认配置，使用时仅需 `useQuery({ queryKey })`，而无需每次传递获取器或选项。SWR 通过允许配置全局默认获取器部分实现此功能，但不支持按查询配置，也不支持变更操作。

> **<sup>5</sup> 变更后自动重获取** - 要实现变更后真正自动重获取，需具备模式（如 GraphQL 提供的）及帮助库识别该模式中实体类型和单个实体的启发式方法。

> **<sup>6</sup> 规范化缓存** - React Query、SWR 和 RTK-Query 目前不支持自动规范化缓存（即通过扁平化存储实体避免高层级数据重复）。

> **<sup>7</sup> SWR 的不可变模式** - SWR 提供 "immutable" 模式允许查询在缓存生命周期内仅获取一次，但仍不具备过期时间概念或有条件的自动重新验证能力。

> **<sup>8</sup> React Router 缓存持久化** - React Router 不会缓存当前匹配路由之外的数据。离开路由后，其数据即丢失。

[bpl-react-query]: https://bundlephobia.com/result?p=react-query
[bp-react-query]: https://badgen.net/bundlephobia/minzip/react-query?label=💾
[gh-react-query]: https://github.com/tannerlinsley/react-query
[stars-react-query]: https://img.shields.io/github/stars/tannerlinsley/react-query?label=%F0%9F%8C%9F
[swr]: https://github.com/vercel/swr
[bp-swr]: https://badgen.net/bundlephobia/minzip/swr?label=💾
[gh-swr]: https://github.com/vercel/swr
[stars-swr]: https://img.shields.io/github/stars/vercel/swr?label=%F0%9F%8C%9F
[bpl-swr]: https://bundlephobia.com/result?p=swr
[apollo]: https://github.com/apollographql/apollo-client
[bp-apollo]: https://badgen.net/bundlephobia/minzip/@apollo/client?label=💾
[gh-apollo]: https://github.com/apollographql/apollo-client
[stars-apollo]: https://img.shields.io/github/stars/apollographql/apollo-client?label=%F0%9F%8C%9F
[bpl-apollo]: https://bundlephobia.com/result?p=@apollo/client
[rtk-query]: https://redux-toolkit.js.org/rtk-query/overview
[rtk-query-comparison]: https://redux-toolkit.js.org/rtk-query/comparison
[rtk-query-bundle-size]: https://redux-toolkit.js.org/rtk-query/comparison#bundle-size
[bp-rtk]: https://badgen.net/bundlephobia/minzip/@reduxjs/toolkit?label=💾
[bp-rtk-query]: https://badgen.net/bundlephobia/minzip/@reduxjs/toolkit?label=💾
[gh-rtk-query]: https://github.com/reduxjs/redux-toolkit
[stars-rtk-query]: https://img.shields.io/github/stars/reduxjs/redux-toolkit?label=🌟
[bpl-rtk]: https://bundlephobia.com/result?p=@reduxjs/toolkit
[bpl-rtk-query]: https://bundlephobia.com/package/@reduxjs/toolkit
[react-router]: https://github.com/remix-run/react-router
[bp-react-router]: https://badgen.net/bundlephobia/minzip/react-router-dom?label=💾
[gh-react-router]: https://github.com/remix-run/react-router
[stars-react-router]: https://img.shields.io/github/stars/remix-run/react-router?label=%F0%9F%8C%9F
[bpl-react-router]: https://bundlephobia.com/result?p=react-router-dom
[bp-history]: https://badgen.net/bundlephobia/minzip/history?label=💾
[bpl-history]: https://bundlephobia.com/result?p=history
