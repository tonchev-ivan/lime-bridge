// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.7.0 <0.9.0;

import "./BridgeToken.sol";

contract Bridge {
    address public bridgeApi;
    uint256 public nonce;
    mapping(uint256 => bool) public usedNonces;
    mapping(address => Transfer[]) public trxs;

    struct Transfer {
        address destinationTokenAddress;
        uint256 destinationChainId;
        uint256 amount;
        bool claimed;
        uint256 nonce;
    }

    constructor(address _bridge) {
        bridgeApi = _bridge;
    }

    event Mint(address indexed to, uint256 amount);

    event ClaimTokens(
        uint256 trxId,
        address token,
        address indexed from,
        uint256 amount,
        uint256 destinationChainId,
        uint256 nonce
    );

    function mint(
        address _token,
        address _to,
        uint256 _amount,
        uint otherChainNonce
    ) public {
        require(msg.sender == bridgeApi, "only bridge api can mint");
        require(
            usedNonces[otherChainNonce] == false,
            "transfer already processed"
        );
        usedNonces[otherChainNonce] = true;
        BridgeToken(_token).mint(_to, _amount);
        emit Mint(_to, _amount);
    }

    function getTransfers() public view returns (Transfer[] memory) {
        return trxs[msg.sender];
    }

    function initiateClaim(uint256 id) public {
        require(
            trxs[msg.sender].length > id,
            "there is no transfer with this id"
        );
        require(
            trxs[msg.sender][id].claimed == false,
            "transfer already claimed"
        );
        emit ClaimTokens(
            id,
            trxs[msg.sender][id].destinationTokenAddress,
            msg.sender,
            trxs[msg.sender][id].amount,
            trxs[msg.sender][id].destinationChainId,
            trxs[msg.sender][id].nonce
        );
    }

    function confirmClaim(uint256 id) public {
        require(msg.sender == bridgeApi, "only bridge api can confirm");
        require(
            trxs[msg.sender].length > id,
            "there is no transfer with this id"
        );
        require(
            trxs[msg.sender][id].claimed == false,
            "transfer already claimed"
        );
        trxs[msg.sender][id].claimed = true;
    }

    function burn(
        address _token,
        uint256 _amount,
        uint256 _destinationChainId
    ) public {
        BridgeToken(_token).burn(msg.sender, _amount);
        trxs[msg.sender].push(
            Transfer(_token, _destinationChainId, _amount, false, nonce)
        );
        nonce++;
    }
}
