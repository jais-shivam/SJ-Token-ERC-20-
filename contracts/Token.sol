// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;


contract Token{
    
    //Veriables 
    string public name='SJ Token';
    string public symbol="<><>";
    uint256 public decimals=18;
    uint256 public totalSupply;
    mapping(address=>uint256) public balanceOf;
    mapping(address=>mapping(address=>uint256)) public allowance;

    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor() public{
        totalSupply=1000000*(10**decimals);
        balanceOf[msg.sender]=totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns(bool success){
        require(balanceOf[msg.sender]>=_value);
        _transfer(msg.sender, _to, _value);
        return true;
    }
    //Internal function
    function _transfer(address _from, address _to, uint256 _value) internal{
        require(_to!=address(0));
        balanceOf[_from]-=_value;
        balanceOf[_to]+=_value;
        emit Transfer(_from, _to, _value);
    }

    // Approve Tokens
    function approve(address _spender, uint256 _value) public returns(bool success){
        require(_spender!=address(0));
        allowance[msg.sender][_spender]=_value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    // Transfer from
    function transferFrom(address _from, address _to, uint256 _value) public returns(bool success){
        require(balanceOf[_from]>=_value);
        require(allowance[_from][msg.sender]>=_value);
        allowance[_from][msg.sender]-=_value;//reseting(adjusting) approved token
        _transfer(_from, _to, _value);
        return true;
    }
}