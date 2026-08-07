const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("On-Chain Settlement & Reputation (Phase 5)", function () {
  let registry, factory, escrow;
  let owner, msme, buyer, investor;

  const TOKEN_ID = 101n;
  const HASH = ethers.keccak256(ethers.toUtf8Bytes("invoice_101"));
  const INVOICE_AMOUNT = ethers.parseEther("1.0");

  let dueDate;

  beforeEach(async function () {
    [owner, msme, buyer, investor] = await ethers.getSigners();
    
    const latestBlock = await ethers.provider.getBlock("latest");
    dueDate = BigInt(latestBlock.timestamp + 7 * 24 * 3600); // 7 days from now on-chain time

    const Registry = await ethers.getContractFactory("InvoiceRegistry");
    registry = await Registry.deploy();
    
    const Factory = await ethers.getContractFactory("EscrowFactory");
    factory = await Factory.deploy();

    // Wire them up
    await registry.setAuthorizedUpdater(await factory.getAddress());
    await factory.setRegistry(await registry.getAddress());

    // Mint NFT and create Escrow
    await registry.mintInvoice(msme.address, TOKEN_ID, HASH);
    await factory.createEscrow(msme.address, buyer.address, TOKEN_ID, INVOICE_AMOUNT, dueDate);
    
    const escrowAddr = await factory.getEscrow(TOKEN_ID);
    const Escrow = await ethers.getContractFactory("InvoiceEscrow");
    escrow = Escrow.attach(escrowAddr);

    // Investor funds it
    await escrow.connect(investor).fundInvoice({ value: INVOICE_AMOUNT });
  });

  it("buyer can releasePayment on time -> pays investor, flags on-time reputation", async function () {
    const investorBalBefore = await ethers.provider.getBalance(investor.address);
    
    await expect(escrow.connect(buyer).releasePayment({ value: INVOICE_AMOUNT }))
      .to.emit(escrow, "Repaid").withArgs(buyer.address, INVOICE_AMOUNT, false) // isLate = false
      .to.emit(registry, "ReputationUpdated").withArgs(msme.address, false, 100);

    const investorBalAfter = await ethers.provider.getBalance(investor.address);
    expect(investorBalAfter - investorBalBefore).to.equal(INVOICE_AMOUNT);

    expect(await registry.onTimeRepayments(msme.address)).to.equal(1n);
    expect(await registry.lateRepayments(msme.address)).to.equal(0n);
    expect(await registry.getReputationScore(msme.address)).to.equal(100n);
  });

  it("buyer releasing payment after dueDate flags as late reputation", async function () {
    // Fast forward time past dueDate
    await network.provider.send("evm_increaseTime", [8 * 24 * 3600]);
    await network.provider.send("evm_mine");

    await expect(escrow.connect(buyer).releasePayment({ value: INVOICE_AMOUNT }))
      .to.emit(escrow, "Repaid").withArgs(buyer.address, INVOICE_AMOUNT, true) // isLate = true
      .to.emit(registry, "ReputationUpdated").withArgs(msme.address, true, 0); // 0% on time

    expect(await registry.onTimeRepayments(msme.address)).to.equal(0n);
    expect(await registry.lateRepayments(msme.address)).to.equal(1n);
    expect(await registry.getReputationScore(msme.address)).to.equal(0n);
  });

  it("unauthorized caller cannot release payment", async function () {
    await expect(
      escrow.connect(investor).releasePayment({ value: INVOICE_AMOUNT })
    ).to.be.revertedWithCustomError(escrow, "NotBuyer").withArgs(investor.address);
  });

  it("reputation mix calculates correct percentage", async function () {
    // Hacky test: we'll simulate a second invoice that is late to see a 50% score
    const TOKEN2 = 102n;
    await registry.mintInvoice(msme.address, TOKEN2, ethers.keccak256(ethers.toUtf8Bytes("inv_102")));
    
    // Escrow 1 (On Time)
    await escrow.connect(buyer).releasePayment({ value: INVOICE_AMOUNT });
    expect(await registry.getReputationScore(msme.address)).to.equal(100n);

    // Escrow 2 (Late)
    const latestBlock = await ethers.provider.getBlock("latest");
    const dueDate2 = BigInt(latestBlock.timestamp + 100); // due very soon
    await factory.createEscrow(msme.address, buyer.address, TOKEN2, INVOICE_AMOUNT, dueDate2);
    const escrow2 = (await ethers.getContractFactory("InvoiceEscrow")).attach(await factory.getEscrow(TOKEN2));
    await escrow2.connect(investor).fundInvoice({ value: INVOICE_AMOUNT });
    
    await network.provider.send("evm_increaseTime", [2000]); // Ensure late
    await network.provider.send("evm_mine");

    await escrow2.connect(buyer).releasePayment({ value: INVOICE_AMOUNT });

    expect(await registry.onTimeRepayments(msme.address)).to.equal(1n);
    expect(await registry.lateRepayments(msme.address)).to.equal(1n);
    expect(await registry.getReputationScore(msme.address)).to.equal(50n);
  });
});
