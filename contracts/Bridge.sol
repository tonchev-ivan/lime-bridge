// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.7.0 <0.9.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "./MyToken.sol";

contract Bridge {
    constructor(address _gateway) {
        gateway = _gateway;
    }

    /* structs */

    /* @dev Transaction struct
     * @param fromChainId chain id of the chain where the tokens were locked
     * @param toChainId chain id of the chain where the tokens will be unlocked
     * @param tokenAddress address of the token that was locked
     * @param amount amount of tokens that were locked
     * @param claimed whether the tokens were claimed or not
     */
    struct Transaction {
        uint fromChainId;
        uint toChainId;
        address tokenAddress;
        uint amount;
        bool claimed;
    }

    /* @dev WrappedToken struct
     * @param chainId chain id of the chain where the tokens were locked
     * @param originalTokenAddress address of the token that was locked
     * @param wrappedTokenAddress address of the wrapped token
     */
    struct WrappedToken {
        uint chainId;
        address originalTokenAddress;
        address wrappedTokenAddress;
    }

    /* variables */

    address gateway; /* @dev address of the gateway */

    uint private fee = 10; /* @dev fee for locking tokens in percent */

    mapping(address => uint) feeSums; /* @dev sum of all fees */

    mapping(address => Transaction[])
        public userTransactions; /* @dev mapping of user address to an array of transactions */

    mapping(address => MyToken) wrappedTokens; /* @dev mapping of wrapped token address to the wrapped token */

    WrappedToken[] public wrappedTokensArray; /* @dev array of wrapped tokens */

    /* events for Gateway api */

    /* @dev event emitted when tokens are locked
     * @param _tokenAddress address of the token that was locked
     * @param requester address of the user that locked the tokens
     * @param _targetChainId chain id of the chain where the tokens will be unlocked
     * @param amount amount of tokens that were locked
     * @param timestamp timestamp of the event
     */
    event TokensLocked(
        address _tokenAddress,
        address indexed requester,
        uint _targetChainId,
        uint amount,
        uint timestamp
    );

    /* @dev event emitted when tokens are burned
     * @param _tokenAddress address of the token that was burned
     * @param requester address of the user that burned the tokens
     * @param _targetChainId chain id of the chain where the tokens will be unlocked
     * @param amount amount of tokens that were burned
     * @param timestamp timestamp of the event
     */
    event Burn(
        address _tokenAddress,
        address indexed requester,
        uint _targetChainId,
        uint amount,
        uint timestamp
    );

    /* events for FE */

    /* @dev event emitted when tokens are unlocked
     * @param requester address of the user that locked the tokens
     * @param amount amount of tokens that were unlocked
     * @param timestamp timestamp of the event
     */
    event TokensUnlocked(
        address indexed requester,
        uint amount,
        uint timestamp
    );

    /* @dev event emitted when tokens are minted
     * @param _tokenAddress address of the token that was minted
     * @param to address of the user that minted the tokens
     * @param amount amount of tokens that were minted
     * @param timestamp timestamp of the event
     */
    event Mint(
        address _tokenAddress,
        address indexed to,
        uint256 amount,
        uint256 timestamp
    );

    /*  @dev event emitted when tokens are claimed
     * @param _transactionId id of the transaction
     * @param requester address of the user that claimed the tokens
     * @param amount amount of tokens that were claimed
     * @param timestamp timestamp of the event
     */
    event TokensClaimed(
        uint _transactionId,
        address indexed requester,
        uint amount,
        uint timestamp
    );

    /* functions */

    /* @dev function to lock tokens, emits TokensLocked event
     * @param _tokenAddress address of the token that will be locked
     * @param _bridgedAmount amount of tokens that will be locked
     * @param _targetChainId chain id of the chain where the tokens will be unlocked
     * @param _deadline deadline for the permit function
     * @param v signature parameter
     * @param r signature parameter
     * @param s signature parameter
     */
    function lockTokens(
        address _tokenAddress,
        uint _bridgedAmount,
        uint _targetChainId,
        uint _deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external payable {
        require(_bridgedAmount > 0, "Amount is required");
        MyToken(_tokenAddress).permit(
            msg.sender,
            address(this),
            _bridgedAmount,
            _deadline,
            v,
            r,
            s
        );

        uint feeAmount = (_bridgedAmount * fee) / 100;
        feeSums[_tokenAddress] += feeAmount;
        uint amountToTransfer = _bridgedAmount - feeAmount;

        MyToken(_tokenAddress).transferFrom(
            msg.sender,
            address(this),
            amountToTransfer
        );
        emit TokensLocked(
            _tokenAddress,
            msg.sender,
            _targetChainId,
            amountToTransfer,
            block.timestamp
        );
    }

    /* @dev function to unlock tokens, emits TokensUnlocked event
     * @param _initiatorChainId chain id of the chain where the tokens were locked
     * @param _tokenAddress address of the token that was locked
     * @param _requester address of the user that locked the tokens
     * @param _bridgedAmount amount of tokens that were locked
     */
    function unlockTokens(
        uint _initiatorChainId,
        address _tokenAddress,
        address _requester,
        uint _bridgedAmount
    ) external onlyGateway {
        userTransactions[_requester].push(
            Transaction(
                _initiatorChainId,
                block.chainid,
                _tokenAddress,
                _bridgedAmount,
                false
            )
        );
        emit TokensUnlocked(_requester, _bridgedAmount, block.timestamp);
    }

    /* @dev function to mint tokens, emits Mint event
     * @param _initiatorChainId chain id of the chain where the tokens were locked
     * @param _receiver address of the user that will receive the tokens
     * @param amount amount of tokens that will be minted
     * @param _wrappedTokenAddress address of the wrapped token
     */
    function mint(
        uint _initiatorChainId,
        address _receiver,
        uint amount,
        address _wrappedTokenAddress
    ) external onlyGateway {
        require(
            address(wrappedTokens[_wrappedTokenAddress]) != address(0x0),
            "No such token exists"
        );
        wrappedTokens[_wrappedTokenAddress].mint(address(this), amount);
        userTransactions[_receiver].push(
            Transaction(
                _initiatorChainId,
                block.chainid,
                _wrappedTokenAddress,
                amount,
                false
            )
        );
        emit Mint(_receiver, _wrappedTokenAddress, amount, block.timestamp);
    }

    /* @dev function to claim tokens, emits TokensClaimed event, checks if the token is wrapped or not
     * @param _transactionId id of the transaction
     */
    function claimTokens(uint _transactionId) external {
        require(
            userTransactions[msg.sender].length > 0,
            "Transaction does not exist"
        );
        require(
            userTransactions[msg.sender].length > _transactionId,
            "Transaction does not exist"
        );
        require(
            userTransactions[msg.sender][_transactionId].claimed == false,
            "Already claimed"
        );
        address tokenAddress = userTransactions[msg.sender][_transactionId]
            .tokenAddress;
        if (address(wrappedTokens[tokenAddress]) == address(0x0)) {
            MyToken(userTransactions[msg.sender][_transactionId].tokenAddress)
                .transfer(
                    msg.sender,
                    userTransactions[msg.sender][_transactionId].amount
                );
        } else {
            wrappedTokens[tokenAddress].transfer(
                msg.sender,
                userTransactions[msg.sender][_transactionId].amount
            );
        }
        userTransactions[msg.sender][_transactionId].claimed = true;
        emit TokensClaimed(
            _transactionId,
            msg.sender,
            userTransactions[msg.sender][_transactionId].amount,
            block.timestamp
        );
    }

    /* @dev function to burn tokens, emits Burn event
     * @param _wrappedTokenAddress address of the wrapped token
     * @param _amount amount of tokens that will be burned
     * @param _targetChainId chain id of the chain where the tokens will be minted
     * @param _deadline deadline for the permit function
     * @param v signature parameter
     * @param r signature parameter
     * @param s signature parameter
     */
    function burn(
        address _wrappedTokenAddress,
        uint _amount,
        uint _targetChainId,
        uint _deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external payable {
        require(_amount > 0, "Amount is required");
        require(
            address(wrappedTokens[_wrappedTokenAddress]) != address(0x0),
            "No such token"
        );
        wrappedTokens[_wrappedTokenAddress].permit(
            msg.sender,
            address(this),
            _amount,
            _deadline,
            v,
            r,
            s
        );
        wrappedTokens[_wrappedTokenAddress].burnFrom(msg.sender, _amount);
        emit Burn(
            _wrappedTokenAddress,
            msg.sender,
            _targetChainId,
            _amount,
            block.timestamp
        );
    }

    /* utility functions, required by the gateway or the frontend */

    /* @dev function to create a wrapped token
     * @param chainId chain id of the chain where the token is deployed
     * @param originalTokenAddress address of the original token
     * @param _name name of the wrapped token
     * @param _symbol symbol of the wrapped token
     */
    function createToken(
        uint chainId,
        address originalTokenAddress,
        string memory _name,
        string memory _symbol
    ) external onlyGateway {
        MyToken wrapped = new MyToken(_name, _symbol, address(this));
        wrappedTokensArray.push(
            WrappedToken(chainId, originalTokenAddress, address(wrapped))
        );
        wrappedTokens[address(wrapped)] = wrapped;
    }

    /* @dev function to get the array of wrapped tokens
     * @return array of wrapped tokens
     */
    function getWrappedTokensArray()
        public
        view
        returns (WrappedToken[] memory)
    {
        return wrappedTokensArray;
    }

    /* @dev function to get wrapped token by address
     * @param _wrappedTokenAddress address of the wrapped token
     * @return wrapped token
     */
    function getWrappedToken(
        address _wrappedTokenAddress
    ) public view returns (MyToken) {
        return wrappedTokens[_wrappedTokenAddress];
    }

    /* @dev function to get the array of transactions of a user
     * @param _user address of the user
     * @return array of transactions
     */
    function getUserTransactions(
        address _user
    ) public view returns (Transaction[] memory) {
        return userTransactions[_user];
    }

    /* @dev function to collect fees
     */
    function collectFees(address _tokenAddress) external onlyGateway {
        require(
            feeSums[_tokenAddress] > 0,
            "No fees to collect"
        );
        MyToken(_tokenAddress).transfer(msg.sender, feeSums[_tokenAddress]);
        feeSums[_tokenAddress] = 0;
    }

    /* modifiers */

    /* @dev modifier to check if the caller is the gateway
     */
    modifier onlyGateway() {
        require(
            msg.sender == gateway,
            "Only gateway can execute this function"
        );
        _;
    }
}
