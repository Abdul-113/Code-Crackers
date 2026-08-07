const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("InvoiceEscrow — fundInvoice (on-chain bid acceptance)", function () {
  let factory, escrowFactory, escrowAddr, escrow;
  let owner, msme, buyer, investor1, investor2;

  const TOKEN_ID      = 99n;
  const INVOICE_AMOUNT = ethers.parseEther("0.5");  // 0.5 MATIC face value
  const DUE_DATE      = BigInt(Math.floor(Date.now() / 1000) + 30 * 24 * 3600);

  beforeEach(async function () {
    [owner, msme, buyer, investor1, investor2] = await ethers.getSigners();
    const EscrowFactory = await ethers.getContractFactory("EscrowFactory");
    escrowFactory = await EscrowFactory.deploy();
    const tx = await escrowFactory.createEscrow(
      msme.address, buyer.address, TOKEN_ID, INVOICE_AMOUNT, DUE_DATE
    );
    await tx.wait();
    escrowAddr = await escrowFactory.getEscrow(TOKEN_ID);
    const InvoiceEscrow = await ethers.getContractFactory("InvoiceEscrow");
    escrow = InvoiceEscrow.attach(escrowAddr);
  });

  it("investor1 can fund the escrow with exact amount — state flips to FUNDED", async function () {
    await expect(
      escrow.connect(investor1).fundInvoice({ value: INVOICE_AMOUNT })
    ).to.emit(escrow, "Funded")
     .withArgs(investor1.address, INVOICE_AMOUNT);

    expect(await escrow.state()).to.equal(1); // State.FUNDED
    expect(await escrow.investor()).to.equal(investor1.address);
    expect(await ethers.provider.getBalance(escrowAddr)).to.equal(INVOICE_AMOUNT);
  });

  it("second investor cannot double-fund an already-funded escrow", async function () {
    // investor1 funds first
    await escrow.connect(investor1).fundInvoice({ value: INVOICE_AMOUNT });

    // investor2 attempts — must revert
    await expect(
      escrow.connect(investor2).fundInvoice({ value: INVOICE_AMOUNT })
    ).to.be.revertedWith("Invalid state"); // inState(OPEN) guard fires
  });

  it("funding fails gracefully when amount does not match", async function () {
    const wrongAmount = ethers.parseEther("0.1"); // too low
    await expect(
      escrow.connect(investor1).fundInvoice({ value: wrongAmount })
    ).to.be.revertedWithCustomError(escrow, "FundingAmountMismatch")
     .withArgs(wrongAmount, INVOICE_AMOUNT);
  });

  it("overpayment is also rejected (exact amount required)", async function () {
    const overAmount = ethers.parseEther("1.0"); // too high
    await expect(
      escrow.connect(investor1).fundInvoice({ value: overAmount })
    ).to.be.revertedWithCustomError(escrow, "FundingAmountMismatch")
     .withArgs(overAmount, INVOICE_AMOUNT);
  });

  it("getState() returns 0 (OPEN) before funding and 1 (FUNDED) after", async function () {
    expect(await escrow.getState()).to.equal(0);
    await escrow.connect(investor1).fundInvoice({ value: INVOICE_AMOUNT });
    expect(await escrow.getState()).to.equal(1);
  });
});
