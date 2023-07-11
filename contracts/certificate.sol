// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract University {
    address public owner;

    constructor() {
        owner = msg.sender;       //to set admin 
    }

    struct Certificate {
        uint certNo;
        string name;
        string course;
        string date;
        bytes32 certHash;
    }

    mapping(uint => Certificate) cert;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can add certificates"); //not used in addcertificate function; as test mode  any one can add certificate
        _;
    }

    event CertificateAdded(uint certNo, bytes32 certHash);
    function addCertificate(
        uint certNo,
        string memory name,
        string memory course,
        string memory date)     public {
        

        bytes32 certHash = keccak256(abi.encodePacked(certNo, name, course, date));  //generate hash using given data using keccak algorithm
        cert[certNo] = Certificate(certNo, name, course, date, certHash);

        emit CertificateAdded(certNo, certHash);
        
        
     }

//fetch data to verify
    function getCertificate(uint256 certNo, bytes32 providedHash) public view        
        returns (string memory, string memory, string memory)                       
    {
        Certificate memory _cert = cert[certNo];

        require(providedHash == _cert.certHash, "Invalid certificate"); //comparing hashes input vs blockchain data
        return (_cert.name, _cert.course, _cert.date);
    }

// fetch data to create pdf
    function print(uint256 number) external view
        returns (
            string memory,
            string memory,
            string memory,
            bytes32
        )
    {
        Certificate memory _cert = cert[number];
        return (_cert.name, _cert.course, _cert.date, _cert.certHash);
    }

//check certificate number input is dupilcate as per record?
 function checkCertNoRepeat (uint certNo) public view returns(bool)
 {
     
     if(cert[certNo].certNo==0){return(true);}  // '0' mean that lcation is not used so no repeat
     else{return(false);}
 }



}