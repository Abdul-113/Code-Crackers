// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./InvoiceEscrow.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IInvoiceRegistry {
    function updateReputation(address msme, bool isLate) external;
}

/**
 * @title EscrowFactory V2
 * @notice Deploys one InvoiceEscrow per approved invoice tokenId.
 *         Owned by the platform backend wallet (Admin).
 *
 * V2 Changes:
 *  - createEscrow now accepts platform address, advanceAmount, yieldAmount, platformFeeRate
 *  - These are passed to the V2 InvoiceEscrow constructor
 */
contract EscrowFactory is Ownable {
    mapping(uint256 => address) public escrows;
    IInvoiceRegistry public invoiceRegistry;

    /// @notice Platform wallet address — receives 0.5% fee on each settlement
    address public platformWallet;

    event EscrowCreated(
        uint256 indexed tokenId,
        address indexed escrowAddress,
        address indexed msme,
        uint256 invoiceAmount,
        uint256 advanceAmount,
        uint256 yieldAmount,
        uint256 dueDate
    );

    error EscrowAlreadyExists(uint256 tokenId);

    constructor(address _platformWallet) Ownable(msg.sender) {
        platformWallet = _platformWallet;
    }

    /**
     * @notice Deploy a new V2 InvoiceEscrow for the given tokenId.
     * @param msme            Address of the MSME invoice owner.
     * @param buyer           Address of the corporate buyer.
     * @param tokenId         ERC-721 token ID from InvoiceRegistry.
     * @param invoiceAmount   Full face value of the invoice (wei).
     * @param advanceAmount   Amount investor gives MSME upfront (e.g. 95% of face value).
     * @param yieldAmount     Investor profit on repayment (e.g. 5% of face value).
     * @param platformFeeRate Fee in basis points (50 = 0.5%).
     * @param dueDate         Unix timestamp of repayment due date.
     */
    function createEscrow(
        address msme,
        address buyer,
        uint256 tokenId,
        uint256 invoiceAmount,
        uint256 advanceAmount,
        uint256 yieldAmount,
        uint256 platformFeeRate,
        uint256 dueDate
    ) external onlyOwner returns (address) {
        if (escrows[tokenId] != address(0)) {
            revert EscrowAlreadyExists(tokenId);
        }

        InvoiceEscrow escrow = new InvoiceEscrow(
            msme,
            buyer,
            platformWallet,
            tokenId,
            invoiceAmount,
            advanceAmount,
            yieldAmount,
            platformFeeRate,
            dueDate
        );

        escrows[tokenId] = address(escrow);

        emit EscrowCreated(
            tokenId,
            address(escrow),
            msme,
            invoiceAmount,
            advanceAmount,
            yieldAmount,
            dueDate
        );

        return address(escrow);
    }

    /// @notice Convenience getter: returns escrow address for a tokenId
    function getEscrow(uint256 tokenId) external view returns (address) {
        return escrows[tokenId];
    }

    function setRegistry(address _registry) external onlyOwner {
        invoiceRegistry = IInvoiceRegistry(_registry);
    }

    function setPlatformWallet(address _wallet) external onlyOwner {
        platformWallet = _wallet;
    }

    /**
     * @notice Proxies reputation update to the Registry.
     *         Only callable by a deployed InvoiceEscrow contract.
     */
    function recordRepayment(address msme, bool isLate, uint256 tokenId) external {
        require(escrows[tokenId] == msg.sender, "Unauthorized Escrow");
        if (address(invoiceRegistry) != address(0)) {
            invoiceRegistry.updateReputation(msme, isLate);
        }
    }
}
