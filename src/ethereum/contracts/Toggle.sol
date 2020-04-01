pragma solidity ^0.6.0;

contract Toggle {
    bool lightState = false;
    address owner;
    constructor() public {
        owner = msg.sender;
    }
    // modifier onlyOwner(){
    //     require (msg.sender == owner);
    //     _;
    // }
    function switchTheLight() public { // onlyOwner
        if (lightState == false){
            lightState = true;
        } else if (lightState == true) {
            lightState = false;
        }
    }
    function getState() public view returns(bool) {
        return lightState;
    }
}