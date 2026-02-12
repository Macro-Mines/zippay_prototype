
# ZiPPaY Architecture & Workflow

This document outlines the technical design and operational logic of the ZiPPaY micro-payment system.

## 1. System Overview
ZiPPaY operates as a distributed state system across three virtual "nodes":
1. **Smartphone (UPI App)**: The "Command Center" for funding, syncing, and configuration.
2. **Smartwatch (ZiP Wallet)**: The "Transaction Edge" for executing payments locally.
3. **Merchant Terminal**: The "Point of Sale" for initiating requests.
4. **ZiP AI Assistant**: A Google Gemini-powered service for analyzing spending patterns.

## 2. Data Model (`GlobalState`)
The state is unified in the project root to simulate a real-time local network (Bluetooth/Wi-Fi):
- **User Wallet**: Balance, Bank Balance, Synced Transactions, and `pendingSync` (watch-only).
- **Merchant Wallet**: Collected balance and Bank Settlement ledger.
- **Connectivity**: Boolean flags for Bluetooth and Wi-Fi status.

## 3. Key Workflows

### A. Funding the Wallet (Load)
- **Condition**: Requires Bluetooth (Phone -> Watch) AND Wi-Fi (Phone -> Bank).
- **Logic**: Deducts from `phoneBalance` and adds to `userWallet.balance`. Creates a `CREDIT` transaction.

### B. The Offline Payment
- **Condition**: Watch must be `ACTIVE`. Bluetooth/Wi-Fi are *not* strictly required at the moment of tap.
- **Limit Check**: Watch allows 5 transactions (`offlineCount`) before requiring a sync with the phone.

### C. Auto-Reload Logic
- **Trigger**: Balance < ₹50.
- **Requirements**: Auto-Reload toggle ON, Wi-Fi ON, Bluetooth ON, Watch ACTIVE.

### D. Emergency ZiP (Offline Credit)
- **Logic**: If `balance < requestedAmount` AND `balance >= 0`.
- **Fee**: 4% of the transaction value.

### E. AI Insights (ZiP Assistant)
- **Engine**: Gemini 3 Flash.
- **Context**: The full transaction history and wallet status is passed to the LLM.
- **Security**: Requires an `API_KEY` set in environment variables.

## 4. Sensory Design
- **Success**: High-pitched rising sine waves + double haptic pulse.
- **Error/Cancel**: Low-pitched falling sawtooth waves + triple haptic pulse.
- **Alerts**: Pulse/Ping sounds for incoming requests.
