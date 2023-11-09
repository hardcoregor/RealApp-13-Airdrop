// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.20;

import {IERC20, SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

error AlreadyClaimed();
error InvalidProof();

contract MerkleDistributor {
    using SafeERC20 for IERC20;

    address public immutable token;
    bytes32 public immutable merkleRoot;
    uint256 public dropAmount;

    mapping(address => uint) private addressesClaimed;

    // This is a packed array of booleans.
    mapping(uint256 => uint256) private claimedBitMap;

    event Claimed(address indexed _from, uint _dropAmount);

    constructor(address token_, bytes32 merkleRoot_, uint256 dropAmount_) {
        token = token_;
        merkleRoot = merkleRoot_;
        dropAmount = dropAmount_;
    }

    function claim(bytes32[] calldata merkleProof)
        public
        virtual
    {
        if (addressesClaimed[msg.sender] != 0) revert AlreadyClaimed();

        // Verify the merkle proof.
        bytes32 node = keccak256(abi.encodePacked(msg.sender));
        if (!MerkleProof.verify(merkleProof, merkleRoot, node)) revert InvalidProof();

        addressesClaimed[msg.sender] = 1;
        IERC20(token).safeTransfer(msg.sender, dropAmount);

        emit Claimed(msg.sender, dropAmount);
    }
}