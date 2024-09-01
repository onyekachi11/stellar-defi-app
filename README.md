# **Stellar Liquidity App**

A decentralized application (dApp) for managing liquidity pools on the Stellar testnet, allowing users to deposit or withdraw assets in exchange for pool shares.

## **Getting Started**

### **Prerequisites**

Ensure you have the following installed on your machine:

- Node.js (v14.x or later)
- npm (v6.x or later)

### **Setup Instructions**

1. Clone the repository:

   ```bash copy code
   git clone https://github.com/onyekachi11/stellar-defi-app.git
   cd stellar-defi-app
   ```

2. Install dependencies:

   ```bash copy code
   npm install
   ```

3. Start the development server:

   ```bash copy code
   npm run dev
   ```

### **Application Workflow**

1. **Generate Keypair**: Click the button to generate a new Stellar keypair (public/private key pair) for your transactions.

2. **Fund the Keypair**: Once the keypair is generated, fund the account using the Stellar testnet faucet.

3. **Create Liquidity Pool**: Input the asset names and amounts to create a new liquidity pool. This pool will allow the exchange of assets and generate pool shares.

4. **Withdraw from Liquidity Pool**: Withdraw assets from the liquidity pool by redeeming pool shares.

### **Proof of Transaction**

Here are the details of the test transactions conducted:

**Keypair**: `GCTM75VRIWYDDXHVHAKYH35NZEURPF7JHHDTFVSHARO3BZ7CCWOEX4M4`

**Liquidity Pool ID**: `f635d3a6e31727d14a94bbf777088de8241762ef09f43223ccd999bf8070f1cf`

**Liquidity Pool Creation Transaction**: `5be2159fd4ba3a090f5692cb2eaf9f6494d643ffc2886fee5314b5cedd57424b`

**Withdraw Transaction**: `ca7678e9ba7c7cacff47f989e18b66e2a7e7d4521bf9a7e9d487c729db2667fc`
