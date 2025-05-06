---
source-updated-at: '2024-08-21T11:18:15.000Z'
translation-updated-at: '2025-05-06T16:09:05.489Z'
id: devtools
title: 开发者工具
---
举起双手欢呼吧，因为 Vue Query 配备了专属的开发工具 (devtools)！🥳  

当你开始使用 Vue Query 时，这些开发工具将成为得力助手。它们能直观展示 Vue Query 的内部运作机制，在调试困境中为你节省大量时间！  

## 基于组件的开发工具 (Vue 3)  

你可以通过专用包将开发工具组件直接集成到页面中。基于组件的开发工具采用与框架无关的实现方式，始终保持最新状态。  

开发工具组件是一个独立包，需先安装：  

```bash  
npm i @tanstack/vue-query-devtools  
```  

或  

```bash  
pnpm add @tanstack/vue-query-devtools  
```  

或  

```bash  
yarn add @tanstack/vue-query-devtools  
```  

或  

```bash  
bun add @tanstack/vue-query-devtools  
```  

默认情况下，Vue Query 开发工具仅在 `process.env.NODE_ENV === 'development'` 时包含在构建包中，因此无需担心生产环境打包时需手动排除。  

开发工具会以固定浮动元素的形式挂载到应用中，并在屏幕角落提供显示/隐藏的切换按钮。该切换状态会存储在 localStorage 中，页面刷新后仍会保留。  

请将以下代码尽可能放置在 Vue 应用的顶层，越靠近页面根节点效果越好：  

```vue  
<script setup>  
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'  
</script>  

<template>  
  <h1>The app!</h1>  
  <VueQueryDevtools />  
</template>  
```  

### 配置选项  

- `initialIsOpen: Boolean`  
  - 设为 `true` 可使开发工具默认展开  
- `buttonPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right"`  
  - 默认为 `bottom-right`  
  - 控制 React Query 徽标按钮的位置，用于展开/收起开发工具面板  
- `position?: "top" | "bottom" | "left" | "right"`  
  - 默认为 `bottom`  
  - 开发工具面板的停靠位置  
- `client?: QueryClient`  
  - 传入自定义 QueryClient。未指定时使用最近上下文中的实例  
- `errorTypes?: { name: string; initializer: (query: Query) => TError}`  
  - 预定义可在查询中触发的错误类型。当从 UI 触发特定错误时，初始化函数（接收对应查询作为参数）将被调用，需返回一个 Error 对象  
- `styleNonce?: string`  
  - 用于向添加到 document head 的 style 标签传递 nonce 值。适用于需要使用内容安全策略 (CSP) nonce 允许内联样式的情况  
- `shadowDOMTarget?: ShadowRoot`  
  - 默认行为会将开发工具样式应用到 DOM 的 head 标签  
  - 传入 shadow DOM 目标可使样式应用于 shadow DOM 而非主 DOM 的 head 标签  

## 传统开发工具  

Vue Query 可与 [Vue 官方开发工具](https://github.com/vuejs/devtools-next)无缝集成，添加自定义检查器和时间线事件。默认情况下开发工具代码会在生产构建时被 tree-shaking 移除。  

只需在插件配置中启用即可：  

```ts  
app.use(VueQueryPlugin, {  
  enableDevtoolsV6Plugin: true,  
})  
```  

同时支持 v6 和 v7 版本的开发工具。
