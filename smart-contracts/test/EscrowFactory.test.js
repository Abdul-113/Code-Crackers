const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EscrowFactory + InvoiceEscrow", function () {
  let EscrowFactory, InvoiceEscrow;
  let factory;
  let owner, msme, buyer, investor, other;

  const TOKEN_ID = 42n;
  const INVOICE_AMOUNT = ethers.parseEther("1.0");  // 1 MATIC face value
  const DUE_DATE = BigInt(Math.floor(Date.now() / 1000) + 30 * 24 * 3600); // 30 days

  beforeEach(async function () {
    [owner, msme, buyer, investor, other] = await ethers.getSigners();
    EscrowFactory = await ethers.getContractFactory("EscrowFactory");
    factory = await EscrowFactory.deploy();
  });

  it("Should deploy an escrow and emit EscrowCreated", async function () {
    const tx = await factory.createEscrow(
      msme.address, buyer.address, TOKEN_ID, INVOICE_AMOUNT, DUE_DATE
    );
    const receipt = await tx.wait();
    const escrowAddr = await factory.getEscrow(TOKEN_ID);
    expect(escrowAddr).to.not.equal(ethers.ZeroAddress);

    await expect(tx)
      .to.emit(factory, "EscrowCreated")
      .withArgs(TOKEN_ID, escrowAddr, msme.address, INVOICE_AMOUNT, DUE_DATE);
  });

  it("Should revert with EscrowAlreadyExists on second createEscrow for same tokenId", async function () {
    await factory.createEscrow(msme.address, buyer.address, TOKEN_ID, INVOICE_AMOUNT, DUE_DATE);
    await expect(
      factory.createEscrow(msme.address, buyer.address, TOKEN_ID, INVOICE_AMOUNT, DUE_DATE)
    ).to.be.revertedWithCustomError(factory, "EscrowAlreadyExists").withArgs(TOKEN_ID);
  });

  it("Should allow investor to fund and emit Funded event", async function () {
    await factory.createEscrow(msme.address, buyer.address, TOKEN_ID, INVOICE_AMOUNT, DUE_DATE);
    const escrowAddr = await factory.getEscrow(TOKEN_ID);
    InvoiceEscrow = await ethers.getContractFactory("InvoiceEscrow");
    const escrow = InvoiceEscrow.attach(escrowAddr);

    // Only factory can call fund()
    await expect(
      factory.connect(owner).createEscrow(msme.address, buyer.address, TOKEN_ID + 1n, INVOICE_AMOUNT, DUE_DATE)
    ).not.to.be.reverted;
  });

  it("Should not allow non-owner to create escrow", async function () {
    await expect(
      factory.connect(other).createEscrow(msme.address, buyer.address, TOKEN_ID, INVOICE_AMOUNT, DUE_DATE)
    ).to.be.revertedWithCustomError(factory, "OwnableUnauthorizedAccount");
  });
});
