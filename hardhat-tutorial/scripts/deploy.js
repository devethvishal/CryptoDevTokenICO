const { ethers } = require("hardhat");
const { CRYPTODEVSNFTADDRESS } = require("../constants/index");



async function main() {
  const cryptoDevToken = await ethers.getContractFactory("CryptoDevToken");
  const deployedCryptoDevToken = await cryptoDevToken.deploy(
    CRYPTODEVSNFTADDRESS
  );
  await deployedCryptoDevToken.deployed();
  console.log(
    "CryptoDevToken contract is successfully deployed to the address : " +
      deployedCryptoDevToken.address
  );
}
main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });


  //0xB32B0639140c4bA264cB111206A5C5859E5FC649