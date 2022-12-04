// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import './BridgeToken.sol';

contract LimeTestToken is BridgeToken {
  constructor(address _bridgeContractAddress) BridgeToken('Lime Test Token', 'LTT', _bridgeContractAddress) {}
}