// SPDX-License-Identifier: GPL-3.0
pragma solidity  ^0.8.0;

// import '@openzeppelin/contracts/access/Ownable.sol';
// import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
// import '@openzeppelin/contracts/utils/math/SafeMath.sol';

contract Bank{
    address public bankOwner;
    string public bankName;
    mapping (address => uint256) public customerBalance;

    constructor() {
        bankOwner=msg.sender;
    }

    function depositeMoney() public payable {
        require(msg.value!=0,"Deposite amount must not be 0.");
        customerBalance[msg.sender] += msg.value; // customerBalance[msg.sender] = customerBalance[msg.sender] + msg.value;
    }
    function withdrawMoney(address payable _to,uint256 _amount) external payable {
        require(_amount<=customerBalance[msg.sender] , "Insufficient Balance .");
        customerBalance[msg.sender] -=  _amount; //  customerBalance[msg.sender] = customerBalance[msg.sender] - _amount;
        _to.transfer(_amount);
    }


    function transferwithinBank(address payable _to,uint256 _amount) external payable{
        require(_amount<=customerBalance[msg.sender] , "Insufficient Balance .");
        customerBalance[msg.sender] -= _amount; //  customerBalance[msg.sender] = customerBalance[msg.sender] - _amount;
        customerBalance[_to] += _amount ;       //  customerBalance[msg.sender] = customerBalance[msg.sender] + _amount;
        _to.transfer(_amount);
    }
    function getCustomerBalance() external view returns (uint256){
        return customerBalance[msg.sender];
    }

    function getBankBalance() external view returns(uint256){
            require(msg.sender == bankOwner,"You are not authorized to see bank balance, Bank Owner can see bank balance .");
            return address(this).balance;
    }
    
    function setBankName(string calldata _bankName) external {
        require(msg.sender==bankOwner,"You must be bank owner to set Bank Name.");
      //  require(_bankName!="","Please enter Bank Name.");
        bankName = _bankName;
    }
}   