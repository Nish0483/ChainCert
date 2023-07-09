// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract University {
    address owner;

    constructor() {
        owner = msg.sender;
    }

    struct Certificate {
        uint256 certNo;
        string name;
        string course;
        string date;
        bytes32 certHash;
    }

    mapping(uint256 => Certificate) certificates;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can add certificates");
        _;
    }

    event CertificateAdded(uint256 certNo, bytes32 certHash);

    function addCertificate(
        uint256 certNo,
        string memory name,
        string memory course,
        string memory date
    ) external /*onlyOwner*/ {
        require(certificates[certNo].certNo == 0, "Certificate number already exists");

        bytes32 certHash = keccak256(abi.encodePacked(certNo, name, course, date));
        certificates[certNo] = Certificate(certNo, name, course, date, certHash);

        emit CertificateAdded(certNo, certHash);
    }

    function getCertificate(uint256 certNo, bytes32 providedHash)
        public
        view
        returns (string memory, string memory, string memory)
    {
        Certificate memory _cert = certificates[certNo];

        require(providedHash == _cert.certHash, "Invalid certificate");
        return (_cert.name, _cert.course, _cert.date);
    }

    function print(uint256 number)
        external
        view
        returns (
            string memory,
            string memory,
            string memory,
            bytes32
        )
    {
        Certificate memory _cert = certificates[number];
        return (_cert.name, _cert.course, _cert.date, _cert.certHash);
    }
}