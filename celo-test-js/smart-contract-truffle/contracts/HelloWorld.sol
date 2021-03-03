pragma solidity 0.5.16;

contract HelloWorld {
  string name = "Celo";

  function getName() public view returns (string memory) {
    return name;
  }

  function setName(string calldata newName) external {
    name = newName;
  }
}