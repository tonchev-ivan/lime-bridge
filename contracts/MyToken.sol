// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.7.0 <0.9.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract MyToken is ERC20, ERC20Permit, ERC20Burnable {
    address gateway;

    constructor(string memory name, string memory symbol, address _gateway) ERC20(name, symbol) ERC20Permit(name) {
        gateway = _gateway;
    }

    function mint(address account, uint256 amount)  public onlyGateway {
        _mint(account, amount);
    }

    modifier onlyGateway {
      require(msg.sender == gateway, "only gateway can execute this function");
      _;
    }
}
