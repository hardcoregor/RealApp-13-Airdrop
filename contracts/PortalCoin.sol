// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PortalCoin is ERC20, Ownable {
  constructor() ERC20('PortalCoin', 'PRTL') Ownable(msg.sender) {}

  function mint(address to, uint256 amount) public onlyOwner {
    _mint(to, amount);
  }
}