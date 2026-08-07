# Invoice2Credit AI - Enterprise Architecture Documentation

Invoice2Credit AI is a decentralized invoice tokenization and financing protocol allowing MSMEs to borrow against outstanding accounts receivable by minting invoices as NFTs, verified via AI systems and GST integrations.

## 📂 Project Directory Structure

```text
invoice2credit-ai/
├── frontend/             # React.js SPA (Vite + Tailwind CSS + Ethers.js)
│   ├── src/
│   │   ├── assets/       # Media and theme graphics
│   │   ├── components/   # Common, Layout, UI, Navigation widgets
│   │   ├── pages/        # Portals (MSME, Investor, Buyer, Admin, Marketplace, etc.)
│   │   ├── services/     # API request handlers and Web3 bindings
│   │   └── router/       # Central React Router declarations
├── backend/              # FastAPI Python Web Server
│   ├── app/
│   │   ├── api/          # Route endpoint controllers
│   │   ├── services/     # Business logic modules (AI, Blockchain, Firebase)
│   │   └── schemas/      # Pydantic validation specs
├── smart-contracts/      # Hardhat Ethereum Development Environment
│   ├── contracts/        # Solidity Smart Contracts (Escrow, NFT)
│   ├── scripts/          # Deployment and verification recipes
│   └── test/             # Automated Hardhat unit tests
└── docs/                 # Documentation resources
```

## 🛠️ Requirements & Installation

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.10+)
- Metamask or equivalent Web3 wallet

---

### 1. Frontend Setup
Navigate to the frontend directory, install dependencies and run:
```bash
cd frontend
npm install
npm run dev
```

### 2. Backend Setup
Create a virtual environment, activate it, install requirements and launch the FastAPI server:
```bash
cd backend
python -m venv venv
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Smart Contracts Setup
Navigate to smart-contracts directory, install developer packages and compile Sol contracts:
```bash
cd smart-contracts
npm install
npx hardhat compile
```
To run tests:
```bash
npx hardhat test
```
