# Eventon

<p align="center">
<img src="./utils/eventon.png" alt="Eventon" width="200" height="158.95522">
</p>

## Overview
> [Docs](https://ton-dynasty.github.io/eventon-doc/)

### What is Eventon?

-   Ton-Dynasty 設計了一個 protocol，可以實現以下兩種功能：
    -   **鏈上功能**：使用者可以訂閱鏈上合約所發生的事件:
        -   DeFi protocol
        -   Oracle
        -   空投事件
        -   其他智能合約
    -   **鏈下功能**：透過鏈下執行計算，傳送訊號到鏈上合約執行相關程式:
        -   智能合約漏洞檢測
        -   Machine Learning 智能持倉訊號
        -   黑名單監測
        -   Whale account 轉帳通知

**用戶可以根據這些訊號來客製化自己的程式碼或者利用內建的智能合約，在接收到特定訊號時自動執行程式操作。**

> **Every thing is a _SIGNAL_.**

舉例來說，一個 DeFi protocol 的狀態變換、一個 Oracle 提供的價格、一個使用者的交易、一個空投事件，都可以是一個 **_SIGNAL_** 。

### What can we do with eventon?

舉例來說，使用者可以透過 eventon 來訂閱一個 Oracle，並且設定當 Oracle 發出 ETH 的價格為 1600USD 時，eventon 會自動幫使用者執行自訂的操作。

### Add stake for earn

任何使用者都可以 add stake for earn，只要在 eventon 上 stake 一定數量的 TON，就可以獲得一定數量的 TON 獎勵。

### Workflow

eventon 的工作流程如下圖所示：

![eventon Workflow](./utils/eventon-workflow.png)

## Project structure

-   `contracts` - source code of all the smart contracts of the project and their dependencies.
-   `wrappers` - wrapper classes (implementing `Contract` from ton-core) for the contracts, including any [de]serialization primitives and compilation functions.
-   `tests` - tests for the contracts.
-   `scripts` - scripts used by the project, mainly the deployment scripts.

## Develop Guide

### Build

```bash
npm install
npm run build
```

### Test

```bash
npm run test
```

### Deploy or run another script

```bash
npx blueprint run
```
