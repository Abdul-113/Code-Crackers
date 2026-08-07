// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract InvoiceRegistry is ERC721, Ownable {
    mapping(bytes32 => bool) public registeredHashes;
    mapping(bytes32 => uint256) public hashToTokenId;

    mapping(address => uint256) public onTimeRepayments;
    mapping(address => uint256) public lateRepayments;
    address public authorizedUpdater;

    error DuplicateInvoice(bytes32 hash, uint256 existingTokenId);
    error UnauthorizedUpdater();

    event InvoiceHashRegistered(bytes32 indexed hash, uint256 indexed tokenId, address indexed msme);
    event ReputationUpdated(address indexed msme, bool isLate, uint256 newScore);

    constructor() ERC721("Invoice2Credit NFT", "I2C") Ownable(msg.sender) {}

    function setAuthorizedUpdater(address _updater) external onlyOwner {
        authorizedUpdater = _updater;
    }

    function isHashRegistered(bytes32 invoiceHash) public view returns (bool) {
        return registeredHashes[invoiceHash];
    }

    function mintInvoice(address to, uint256 tokenId, bytes32 invoiceHash) public onlyOwner {
        if (registeredHashes[invoiceHash]) {
            revert DuplicateInvoice(invoiceHash, hashToTokenId[invoiceHash]);
        }

        registeredHashes[invoiceHash] = true;
        hashToTokenId[invoiceHash] = tokenId;

        _safeMint(to, tokenId);

        emit InvoiceHashRegistered(invoiceHash, tokenId, to);
    }

    /**
     * @notice Updates the reputation of an MSME. Called by the EscrowFactory/Escrow.
     */
    function updateReputation(address msme, bool isLate) external {
        if (msg.sender != authorizedUpdater && msg.sender != owner()) {
            revert UnauthorizedUpdater();
        }

        if (isLate) {
            lateRepayments[msme]++;
        } else {
            onTimeRepayments[msme]++;
        }

        emit ReputationUpdated(msme, isLate, getReputationScore(msme));
    }

    /**
     * @notice Returns the reputation score as a percentage (0-100).
     * If no repayments have been made, returns 100 as a baseline trust score.
     */
    function getReputationScore(address msme) public view returns (uint256) {
        uint256 total = onTimeRepayments[msme] + lateRepayments[msme];
        if (total == 0) return 100;
        return (onTimeRepayments[msme] * 100) / total;
    }
}
