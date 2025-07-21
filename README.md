# DeFi Project

This repository contains a DeFi project built with Next.js and Solidity. It includes a smart contract component for blockchain interactions, a frontend interface for user interaction, and utilizes TypeScript for development.

## Key Features & Benefits

-   **Smart Contract Integration:** Facilitates interactions with decentralized protocols.
-   **Token Management:** Includes token creation and management functionalities via smart contracts.
-   **Uniswap Clone:** Demonstrates a basic implementation of a decentralized exchange (DEX).
-   **Modern Frontend:** Built with Next.js for a responsive and user-friendly experience.
-   **Type Safety:** Developed in TypeScript, providing enhanced code maintainability and fewer runtime errors.

## Prerequisites & Dependencies

Before you begin, ensure you have the following installed:

-   **Node.js:** (Recommended version: >=18)
-   **npm** or **yarn** or **pnpm** or **bun**
-   **Hardhat:** For compiling and deploying smart contracts.
-   **Metamask or similar Ethereum wallet extension:** For interacting with the deployed smart contracts.

## Installation & Setup Instructions

Follow these steps to get the project up and running:

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/AdityasWorks/defi.git
    cd defi
    ```

2.  **Install Dependencies:**

    ```bash
    npm install # or yarn install or pnpm install or bun install
    ```

3.  **Navigate to Blockchain Directory and Install Dependencies**

    ```bash
    cd blockchain
    npm install # or yarn install or pnpm install or bun install
    ```

4.  **Configure Hardhat:**

    -   Edit the `blockchain/hardhat.config.ts` file to set up your desired network configuration. Ensure to set your RPC URL and private key in a `.env` file located in the `blockchain` directory. The example below shows how to configure the Sepolia test network:

    ```typescript
    import { HardhatUserConfig } from "hardhat/config";
    import "@nomicfoundation/hardhat-toolbox";
    import dotenv from "dotenv";
    dotenv.config();

    const RPC_URL = process.env.RPC_URL;
    const PRIVATE_KEY = process.env.PRIVATE_KEY;

    const config: HardhatUserConfig = {
        solidity: "0.8.28",
        networks: {
            sepolia: {
                url: RPC_URL,
                accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
            },
        },
    };

    export default config;
    ```

5.  **Deploy Smart Contracts:**

    -   Run the deployment script located in `blockchain/scripts/deploy.ts` to deploy your contracts to the configured network.

    ```bash
    cd blockchain
    npx hardhat compile
    npx hardhat run scripts/deploy.ts --network sepolia
    ```

    -   Alternatively, to deploy only the TokenFactory contract use:
        ```bash
        npx hardhat run scripts/deployTokenFactory.ts --network sepolia
        ```

6.  **Frontend Configuration:**

    -   Create a `.env` file in the main directory with environment variables such as contract addresses after deployment. These addresses will be used by the frontend to interact with the contracts. Example:

    ```
    NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS=0xYourTokenFactoryContractAddress
    ```

7.  **Run the Development Server:**

    ```bash
    cd .. #Navigate back to main directory
    npm run dev # or yarn dev or pnpm dev or bun dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Usage Examples & API Documentation

### Interacting with Smart Contracts

Once the contracts are deployed, you can interact with them via the frontend. The `src/app/abis` directory contains the contract ABIs. The frontend components use these ABIs to call the contract functions.

### Example: Create a new Token

1.  Navigate to the "Token Factory" section.
2.  Fill in the name, symbol, and total supply of the token.
3.  Click the "Create Token" button.
4.  Approve the transaction in your Metamask wallet.

## Configuration Options

-   **Environment Variables:**
    -   `NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS`: The address of the deployed TokenFactory contract.
    -   `RPC_URL`: The RPC URL for your Ethereum network (e.g., Infura or Alchemy).
    -   `PRIVATE_KEY`: Your private key for deploying contracts. (Use with caution, preferably for testing only.  Consider using a secure solution like environment variables or a hardware wallet for production.)

## Contributing Guidelines

Contributions are welcome! To contribute:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Commit your changes with descriptive commit messages.
4.  Push your changes to your fork.
5.  Submit a pull request.

## License Information

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

-   This project leverages libraries and tools from the Ethereum development community, including Hardhat, Ethers.js, and OpenZeppelin contracts.
-   Next.js is used for the frontend.
