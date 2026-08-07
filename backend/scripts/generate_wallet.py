"""
Utility script to generate a new Polygon wallet for testnet deployment.
Run: python scripts/generate_wallet.py

Then fund the printed address with Amoy MATIC from:
  https://faucet.polygon.technology/
"""
from web3 import Web3

w3 = Web3()
account = w3.eth.account.create()

print("=" * 60)
print("NEW WALLET GENERATED FOR TESTNET DEPLOYMENT")
print("=" * 60)
print(f"Address:     {account.address}")
print(f"Private Key: {account.key.hex()}")
print()
print("Fund this address with Amoy MATIC from:")
print("  https://faucet.polygon.technology/")
print("  (Select 'Polygon Amoy', paste address, request 0.5 MATIC)")
print()
print("Then add to backend/.env:")
print(f"  CONTRACT_OWNER_PRIVATE_KEY={account.key.hex()}")
print("=" * 60)
