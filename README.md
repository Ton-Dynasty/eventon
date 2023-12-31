# Eventon

[![Static Badge](https://img.shields.io/badge/Resource-Docs-black?logo=github)](https://ton-dynasty.github.io/eventon-doc/)
[![Static Badge](https://img.shields.io/badge/Community-Telegram-blue?logo=telegram)](https://t.me/+5affnJVZV4I4MTI1)
[![Static Badge](https://img.shields.io/badge/Website-Eventon-3425cc?logo=react)](https://google.com)

<p align="center">
<img src="./utils/eventon.png" alt="Eventon" width="200" height="158.95522">
</p>

## Overview

> [Docs](https://ton-dynasty.github.io/eventon-doc/)

## What is Eventon?

-   **Ton-Dynasty** has designed a protocol that can achieve the following two functionalities:
    -   **On-Chain Functionality**: Users can subscribe to events occurring on-chain, including:
        -   DeFi protocols
        -   Oracles
        -   Airdrop events
        -   Other smart contracts
    -   **Off-Chain Functionality**: Through off-chain computations, signals are transmitted to on-chain contracts to execute related programs, including:
        -   Smart contract vulnerability detection
        -   Machine learning-based intelligent position signals
        -   Blacklist monitoring
        -   Whale account transfer notifications

Users can customize their own code or utilize built-in smart contracts to automatically execute program operations when specific signals are received.

> **Every thing is a _SIGNAL_.**

For example, a change in the status of a DeFi protocol, a price provided by an Oracle, a user's transaction, or an airdrop event can all be considered a **_SIGNAL_**.

## What Can We Do with Eventon?

For example, users can use Eventon to subscribe to an Oracle and set it up so that when the Oracle emits the price of ETH at $1600 USD, Eventon will automatically execute the user's custom actions.

## Add Stake for Earning

Any user can add stake for earning by simply staking a certain amount of TON on Eventon, which allows them to receive a corresponding reward in TON.

## Workflow

The workflow of Eventon is presented as follows:

![Eventon Workflow](./utils/eventon-workflow.png)

## Architecture

The complete system architecture diagram for Eventon is as follows:
![Architecture](./utils/architecture.png)

## Project structure

-   `contracts` - source code of all the smart contracts of the project and their dependencies.
-   `wrappers` - wrapper classes (implementing `Contract` from ton-core) for the contracts, including any [de]serialization primitives and compilation functions.
-   `tests` - tests for the contracts.
-   `scripts` - scripts used by the project, mainly the deployment scripts.

## Deployment

`deployer`: EQCizWtlx_pydcxDH83X_EjirryPj0MqfFVqk9sz_3lpIRz3
`Universal Router`: EQCuzDGZUvIkyQWviIplz_lSLkg69WeP4NqgwHese-Qi9xBB
`Event Source (Bug Detector)`: EQDoog68bootdz4nfENLrJuHvxepYyhHJRbHO9mtZkkHRPti
`UserDefaultCallback (Bug Detector)`: EQAvl_1DoWeXAtk7UFBevxcEbuP8R95eYnf_NQCJuqCN-YI9

## Develop Guide

### Build

```bash
yarn
yarn build
```

### Test

```bash
yarn test
```

### Deploy or run another script

```bash
npx blueprint run
```

### Add dependency

> for contract

```bash
yarn add -W typescript
```

> for monorepop @eventon/sdk

```bash
yarn workspace @eventon/sdk add typescript -D
```
