// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

abstract contract BridgeToken is ERC20 {
    address public bridgeContractAddress;

    constructor(string memory name, string memory symbol, address _bridgeContractAddress) ERC20(name, symbol) {
        bridgeContractAddress = _bridgeContractAddress;
    }

    function mint(address to, uint amount) external {
        require(msg.sender == bridgeContractAddress, "only bridge contract can mint");
        _mint(to, amount);
    }

    function burn(address owner, uint amount) external {
        require(msg.sender == bridgeContractAddress, "only bridge contract can burn");
        _burn(owner, amount);
    }
}
