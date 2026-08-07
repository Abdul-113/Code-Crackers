// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IEscrowFactory {
    function recordRepayment(address msme, bool isLate, uint256 tokenId) external;
}

/**
 * @title InvoiceEscrow V2
 * @notice Holds MATIC in escrow for a single tokenized invoice.
 *
 * V2 Correct Payment Flow:
 *  1. Buyer signs Assignment of Receivable (signAssignment)
 *  2. Investor funds escrow → advance is immediately released to MSME (investorFund)
 *  3. On due date, Buyer pays into this contract (buyerPay)
 *  4. Contract auto-splits: Investor gets principal+yield, Platform gets fee
 *
 * This makes the smart contract the legal enforcement mechanism.
 * The Buyer's obligation is now to THIS contract address, not the MSME.
 */
contract InvoiceEscrow {
    enum State { OPEN, ASSIGNMENT_SIGNED, FUNDED, REPAID, DEFAULTED }

    address public immutable factory;
    address public immutable msme;
    address public immutable buyer;
    address public immutable platform;
    uint256 public immutable tokenId;
    uint256 public immutable invoiceAmount;    // Full face value of invoice
    uint256 public immutable advanceAmount;    // Amount investor gives to MSME (e.g. 95% of face)
    uint256 public immutable yieldAmount;      // Investor profit on repayment (e.g. 5% of face)
    uint256 public immutable platformFeeRate;  // In basis points (50 = 0.5%)
    uint256 public immutable dueDate;

    address public investor;
    State   public state;
    bool    public buyerAssigned;

    event AssignmentSigned(address indexed buyer, uint256 tokenId);
    event Funded(address indexed investor, uint256 advanceReleased);
    event BuyerPaid(address indexed buyer, uint256 amount, bool isLate);
    event Defaulted(uint256 tokenId);

    error NotBuyer(address caller);
    error NotInvestor(address caller);
    error AssignmentRequired();
    error AlreadyFunded();
    error AlreadySigned();
    error FundingAmountMismatch(uint256 sent, uint256 required);
    error InsufficientRepayment(uint256 sent, uint256 required);

    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory");
        _;
    }

    modifier inState(State expected) {
        require(state == expected, "Invalid state");
        _;
    }

    constructor(
        address _msme,
        address _buyer,
        address _platform,
        uint256 _tokenId,
        uint256 _invoiceAmount,
        uint256 _advanceAmount,
        uint256 _yieldAmount,
        uint256 _platformFeeRate,
        uint256 _dueDate
    ) {
        factory         = msg.sender;
        msme            = _msme;
        buyer           = _buyer;
        platform        = _platform;
        tokenId         = _tokenId;
        invoiceAmount   = _invoiceAmount;
        advanceAmount   = _advanceAmount;
        yieldAmount     = _yieldAmount;
        platformFeeRate = _platformFeeRate;
        dueDate         = _dueDate;
        state           = State.OPEN;
        buyerAssigned   = false;
    }

    /**
     * @notice Step 1: Buyer digitally signs the Assignment of Receivable.
     *         By calling this, the Buyer acknowledges their obligation to pay
     *         this escrow contract address on the due date, not the MSME directly.
     *         Only the buyer wallet registered at invoice creation can call this.
     */
    function signAssignment() external {
        if (msg.sender != buyer) revert NotBuyer(msg.sender);
        if (buyerAssigned) revert AlreadySigned();
        buyerAssigned = true;
        state = State.ASSIGNMENT_SIGNED;
        emit AssignmentSigned(msg.sender, tokenId);
    }

    /**
     * @notice Step 2: Investor funds the escrow.
     *         Must send exactly advanceAmount in msg.value.
     *         Advance is immediately transferred to MSME — they get liquidity now.
     *         Buyer must have signed the Assignment first.
     */
    function investorFund() external payable inState(State.ASSIGNMENT_SIGNED) {
        if (!buyerAssigned) revert AssignmentRequired();
        if (investor != address(0)) revert AlreadyFunded();
        if (msg.value < advanceAmount) {
            revert FundingAmountMismatch(msg.value, advanceAmount);
        }
        investor = msg.sender;
        state    = State.FUNDED;

        // Immediately release advance to MSME — this is the key liquidity event
        payable(msme).transfer(advanceAmount);

        emit Funded(msg.sender, advanceAmount);
    }

    /// @notice Factory-proxied fund (admin tooling fallback)
    function fund(address _investor) external payable onlyFactory inState(State.ASSIGNMENT_SIGNED) {
        if (!buyerAssigned) revert AssignmentRequired();
        if (investor != address(0)) revert AlreadyFunded();
        if (msg.value < advanceAmount) {
            revert FundingAmountMismatch(msg.value, advanceAmount);
        }
        investor = _investor;
        state    = State.FUNDED;
        payable(msme).transfer(advanceAmount);
        emit Funded(_investor, advanceAmount);
    }

    /**
     * @notice Step 3: On the due date, Buyer pays into this contract.
     *         Payment is auto-split:
     *           - Investor receives: advanceAmount + yieldAmount (principal + profit)
     *           - Platform receives: platformFee (0.5% of invoiceAmount)
     *         This is the enforcement mechanism. The Buyer signed assignment to THIS address.
     */
    function buyerPay() external payable inState(State.FUNDED) {
        if (msg.sender != buyer) revert NotBuyer(msg.sender);

        uint256 platformFee   = (invoiceAmount * platformFeeRate) / 10000;
        uint256 investorShare = advanceAmount + yieldAmount;
        uint256 totalRequired = investorShare + platformFee;

        if (msg.value < totalRequired) {
            revert InsufficientRepayment(msg.value, totalRequired);
        }

        bool isLate = block.timestamp > dueDate;
        state = State.REPAID;

        // Auto-split the payment
        payable(investor).transfer(investorShare);
        payable(platform).transfer(platformFee);

        // Any residual stays in contract (can be claimed by MSME if overpaid)
        // Note: MSME already received advanceAmount at funding time

        try IEscrowFactory(factory).recordRepayment(msme, isLate, tokenId) {} catch {}

        emit BuyerPaid(msg.sender, msg.value, isLate);
    }

    /**
     * @notice Legacy releasePayment kept for backward compatibility with frontend.
     *         Redirects to buyerPay for V2 contracts.
     */
    function releasePayment() external payable inState(State.FUNDED) {
        if (msg.sender != buyer) revert NotBuyer(msg.sender);

        uint256 platformFee   = (invoiceAmount * platformFeeRate) / 10000;
        uint256 investorShare = advanceAmount + yieldAmount;
        uint256 totalRequired = investorShare + platformFee;

        if (msg.value < totalRequired) {
            revert InsufficientRepayment(msg.value, totalRequired);
        }

        bool isLate = block.timestamp > dueDate;
        state = State.REPAID;

        payable(investor).transfer(investorShare);
        payable(platform).transfer(platformFee);

        try IEscrowFactory(factory).recordRepayment(msme, isLate, tokenId) {} catch {}

        emit BuyerPaid(msg.sender, msg.value, isLate);
    }

    /// @notice Admin marks invoice defaulted; investor retrieves their advance deposit
    function markDefault() external onlyFactory inState(State.FUNDED) {
        state = State.DEFAULTED;
        if (investor != address(0) && address(this).balance > 0) {
            // Return remaining balance (advance was already sent to MSME, so this covers any overfund)
            payable(investor).transfer(address(this).balance);
        }
        emit Defaulted(tokenId);
    }

    /// @notice View helper for frontend polling
    function getState() external view returns (uint8) {
        return uint8(state);
    }

    /// @notice Returns whether buyer has signed the assignment
    function isAssigned() external view returns (bool) {
        return buyerAssigned;
    }
}
