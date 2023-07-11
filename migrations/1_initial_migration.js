//migration script for truffle

const contract=artifacts.require("University");
module.exports= function (deployer)
{
    deployer.deploy(contract);
};
