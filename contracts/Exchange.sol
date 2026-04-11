// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Token} from "./Token.sol";

contract Exchange {
    //state variables
    address public feeAccount;
    uint256 public feePercent;
    uint256 public orderCount;

    //---------------------
    //Mappings
    mapping(uint256 => Order) public orders;
    mapping(uint256 => bool) public isOrderCancelled;

    //total tokens belonging to a user
    mapping(address => mapping(address => uint256))
        private userTotalTokenBlance;

    //total tokens of an acting user
    mapping(address => mapping(address => uint256))
        private userActiveTokenBlance;

    //events
    event TokensDeposited(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );
    event TokensWithdrawn(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );
    event OrderCreated(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event OrderCancelled(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );

    struct Order {
        uint256 id;
        address user;
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timestamp;
    }

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    // ----------------------
    //Deposit & Withdraw tokens

    function depositToken(address _token, uint256 _amount) public {
        //udpade user balance
        userTotalTokenBlance[_token][msg.sender] += _amount;

        //emit an event
        emit TokensDeposited(
            _token,
            msg.sender,
            _amount,
            userTotalTokenBlance[_token][msg.sender]
        );

        //transfer tokens to exchange
        require(
            Token(_token).transferFrom(msg.sender, address(this), _amount),
            "Exchange: Token transfer failed"
        );
    }

    function withdrawToken(address _token, uint256 _amount) public {
        require(
            totalBalanceOf(_token, msg.sender) -
                activeBalanceOf(_token, msg.sender) >=
                _amount,
            "Exchange: Insufficient Balance"
        );
        //update the user
        userTotalTokenBlance[_token][msg.sender] -= _amount;

        //emit event
        emit TokensWithdrawn(
            _token,
            msg.sender,
            _amount,
            userTotalTokenBlance[_token][msg.sender]
        );
        //transfer tokens back to user
        require(
            Token(_token).transfer(msg.sender, _amount),
            "Exchange: Token Transfer Failed"
        );
    }

    function totalBalanceOf(
        address _token,
        address _user
    ) public view returns (uint256) {
        return userTotalTokenBlance[_token][_user];
    }

    function activeBalanceOf(
        address _token,
        address _user
    ) public view returns (uint256) {
        return userActiveTokenBlance[_token][_user];
    }

    //-------------------------
    //Make and cancel orders

    function makeOrder(
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) public {
        require(
            totalBalanceOf(_tokenGive, msg.sender) >=
                activeBalanceOf(_tokenGive, msg.sender) + _amountGive,
            "Exchange: Insufficient Balance"
        );
        orderCount++;

        orders[orderCount] = Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );

        userActiveTokenBlance[_tokenGive][msg.sender] += _amountGive;

        emit OrderCreated(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );
    }

    function cancelOrder(uint256 _id) public {
        //fetch order
        Order storage order = orders[_id];
        //order must exist
        require(order.id == _id, "Exchange: Order dose not exist");
        //Ensure the caller of the function is the owner of the order
        require(address(order.user) == msg.sender, "Exchange: Not the owner");
        //cancel Order
        isOrderCancelled[_id] = true;
        //update the active balance
        userActiveTokenBlance[order.tokenGive][order.user] -= order.amountGive;
        //emit an event
        emit OrderCancelled(
            order.id,
            msg.sender,
            order.tokenGet,
            order.amountGet,
            order.tokenGive,
            order.amountGive,
            block.timestamp
        );
    }
}
