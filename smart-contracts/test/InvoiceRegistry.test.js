const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("InvoiceRegistry", function () {
  let InvoiceRegistry;
  let registry;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    InvoiceRegistry = await ethers.getContractFactory("InvoiceRegistry");
    [owner, addr1, addr2] = await ethers.getSigners();
    registry = await InvoiceRegistry.deploy();
  });

  it("Should mint a new invoice and register the hash successfully", async function () {
    const tokenId = 1;
    const hash = ethers.id("INV-001");
    
    await expect(registry.mintInvoice(addr1.address, tokenId, hash))
      .to.emit(registry, "InvoiceHashRegistered")
      .withArgs(hash, tokenId, addr1.address);

    expect(await registry.isHashRegistered(hash)).to.be.true;
    expect(await registry.hashToTokenId(hash)).to.equal(tokenId);
    expect(await registry.ownerOf(tokenId)).to.equal(addr1.address);
  });

  it("Should revert with DuplicateInvoice when minting with an already registered hash", async function () {
    const tokenId1 = 1;
    const tokenId2 = 2;
    const hash = ethers.id("INV-DUPLICATE");
    
    await registry.mintInvoice(addr1.address, tokenId1, hash);
    
    await expect(
      registry.mintInvoice(addr2.address, tokenId2, hash)
    ).to.be.revertedWithCustomError(registry, "DuplicateInvoice")
     .withArgs(hash, tokenId1);
  });

  it("Should allow minting two different invoices with different hashes", async function () {
    const tokenId1 = 1;
    const tokenId2 = 2;
    const hash1 = ethers.id("INV-001");
    const hash2 = ethers.id("INV-002");
    
    await registry.mintInvoice(addr1.address, tokenId1, hash1);
    await registry.mintInvoice(addr2.address, tokenId2, hash2);

    expect(await registry.isHashRegistered(hash1)).to.be.true;
    expect(await registry.isHashRegistered(hash2)).to.be.true;
    expect(await registry.ownerOf(tokenId1)).to.equal(addr1.address);
    expect(await registry.ownerOf(tokenId2)).to.equal(addr2.address);
  });
});
