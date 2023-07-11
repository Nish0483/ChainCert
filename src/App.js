import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import backgroundImage from './cert.png';
import QRCode from 'qrcode';
import { ethers } from 'ethers';
import './App.css';
import ABI from './University.json';

const App = () => {

  const address = "0x427ed72B57A03A847aE58b66866865DD627350Ab";  //contract  after deployment

  const [contract, setContract] = useState(null);
  const [certNo, setCertNo] = useState('');
  const [certHash, setHash] = useState('');
  const [validity, setValidity] = useState('');
  const [certificateName, setCertificateName] = useState('');
  const [certificateCourse, setCertificateCourse] = useState('');
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [course, setCourse] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [dateComponents, setDateComponents] = useState({
    day: '',
    month: '',
    year: '',
  });
  const [addedCertificate, setAddedCertificate] = useState(false);
  const [_name, _setName] = useState('');
  const [_course, _setCourse] = useState('');
  const [_certHash, _setHash] = useState('');
  const [needPrint, setNeedPrint] = useState(false);
  const [formError, setFormError] = useState('');
  const [formError2, setFormError2] = useState('');
  const [formError3, setFormError3] = useState('');
  const [metamask, setMetamask] = useState(false);
  const [addOk, setAddOk] = useState('');

  useEffect(() => {         //contract & wallet initialization; used ether.js
    const initialize = async () => {
      if (window.ethereum && metamask) {
        await window.ethereum.enable();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(address, ABI.abi, signer);
        setContract(contract);
      }
    };

    initialize();
  }, [metamask]);



  
  const walletCheck = () => {        //check wallet exist?
    if (window.ethereum) {
      setMetamask(true);
    } else {
      alert('MetaMask not installed!');
    }
  };

  const handleCertNo = (event) => {
    setCertNo(event.target.value);
  };

  const handleHash = (event) => {
    setHash(event.target.value);
  };

  const verifyCertificate = async () => {
    try {
      if (!certNo || !certHash) {            //making sure all inputs entered
        setFormError('Please fill in all the fields.');   
        return;
      } else {
        setFormError('');
        setValidity('');
      }

      const result = await contract.getCertificate(certNo, certHash);  //contract call
      console.log('result:', result);
      setCertificateName(result[0]);
      setCertificateCourse(result[1]);
      const input = result[2];
      const year = input.substr(0, 4);     //as date stored as string (eg. 20230712) afrer cheching hash as it is then converting back to normal form to display TO USER
      const month = input.substr(4, 2);
      const day = input.substr(6);
      console.log(`Day: ${day}, Month: ${month}, Year: ${year}`); 
      setDateComponents({...dateComponents,
        day: day,
        month: month,
        year: year,
      });

      setValidity('');
    } catch (error) {
      console.error('error', error);
      setCertificateName('');
      setCertificateCourse('');
      setDateComponents(null);
      setValidity('Invalid certificate');
    }
  };

  const handleCertNoChange = (event) => {
    setNumber(event.target.value);
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleCourseChange = (event) => {
    setCourse(event.target.value);
  };

  const handleDateChange = (event) => {
    const input = event.target.value;
    setDateInput(input);

    
  };

  const handleAddCertificate = async () => {
    setAddedCertificate(false);
    setAddOk('');
    if (contract) {
      if (!number || !name || !course || !dateInput) {
        setFormError2('Please fill in all the fields.');
        return;
      } else {
        setFormError2('');
      }

      try {
        await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        const t = dateInput.replace(/-/g, ''); //REMOVE - from 2023-09-05 to get a single string 20230905
        const result = await contract.checkCertNoRepeat(number);
        if (result === true) {
          setFormError3('');
          const transaction= await contract.addCertificate(number, name, course, t);
          await transaction.wait();
          setAddOk('Certificate added successfully');
          setNeedPrint(true);
          setAddedCertificate(true);
          fetchData(number);
          console.log('Certificate added successfully!');
          
        } else {
          setFormError3('Certificate number already exists');
        }
      } catch (error) {
        console.error('Error adding certificate:', error);
        setNeedPrint(false);
        setAddedCertificate(false);
        setAddOk('Error adding certificate');
      }
    }
  };

  const fetchData = async () => {         //fetching data to create certf pdf
    try {
      const _result = await contract.print(number);
      console.log('result:', _result);
      _setName(_result[0]); // name
      _setCourse(_result[1]); // course
      _setHash(_result[3]); // hash
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  async function generateQRCodeAsDataURL(data) {       //QR code library
    try {
      return await QRCode.toDataURL(data);
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  }

  const GeneratePDF = async () => {       // create pdf using given data using JSPDF library
   
    const dAppLink = `http://localhost:3000/?certNo=${encodeURIComponent(
      number
    )}&certHash=${encodeURIComponent(_certHash)}`;
    const qrCodeDataUrl = await generateQRCodeAsDataURL(dAppLink);

    const pdf = new jsPDF('landscape');
    const img = new Image();
    img.src = backgroundImage;
    img.onload = () => {
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();
      pdf.addImage(img, 'JPEG', 0, 0, width, height);

      pdf.setFont('courier'); // Set font family and style
      pdf.setFontSize(15); // Set font size
      pdf.setTextColor(25, 25, 25); // Set text color 
      pdf.setFontSize(11);
      pdf.text(`${number}`, 78, 193.5);

      // Function to center name for longer name scenario
      function centerText(text, fontSize, x, y) {
        const textWidth = pdf.getTextWidth(text);
        const centerX = x - textWidth / 2;
        const centerY = y + fontSize / 2;
        pdf.setFont('Helvetica', 'bold');
        pdf.setFontSize(fontSize);
        pdf.setTextColor(25, 25, 25);
        pdf.text(text, centerX, centerY);
      }
      const dynamicName = _name; 
      const fontSize = 22;
      const x = 130; // x-coordinate for the center of the text
      const y = 85; // the y-coordinate for the center of the text

      centerText(dynamicName, fontSize, x, y);

      pdf.setFont('Helvetica', 'italic'); 
      pdf.setFontSize(20); 
      pdf.setTextColor(0, 0, 0);
      pdf.setTextColor(25, 25, 25);
      pdf.text(` ${_course}`, 163, 113.1);
     

      pdf.setFont('Helvetica', 'italic'); // Set different font family and style
      pdf.setFontSize(17); // Set different font size
      pdf.setTextColor(25, 25, 25);
      pdf.text(` ${dateInput}`, 211, 122.7);

      pdf.setFont('courier'); // Set different font family and style
      pdf.setFontSize(10.7); // Set different font size
      pdf.setTextColor(25, 25, 25);
      pdf.text(` ${_certHash}`, 126, 193.2);

      if (qrCodeDataUrl) {
        // Add QR code image to the PDF document
        const qrCodeImgWidth = 30;
        const qrCodeImgHeight = 30;
        const qrCodeX = 200; // Adjust the X coordinate for QR code placement
        const qrCodeY = 143; // Adjust the Y coordinate for QR code placement
        pdf.addImage(
          qrCodeDataUrl,
          'JPEG',
          qrCodeX,
          qrCodeY,
          qrCodeImgWidth,
          qrCodeImgHeight
        );
      } else {
        // Handle error if QR code generation fails
        console.error('Failed to generate QR code.');
      }
      pdf.save('certificate.pdf');
    };

    setNeedPrint(false);
  };

  if (!metamask && validity) {   //to remove warning msgs when not need
    setValidity('');
  }

  return (
    <div>
      <div id="buttons">
        {!metamask ? (
          <button id="button-metamask" onClick={walletCheck}>
            Connect Wallet
          </button>
        ) : (
          <button id="button-metamask2" onClick={() => setMetamask(false)}>
            Disconnect
          </button>
        )}
      </div>
      <div className="cont">
        <div className="cont1">
          <h1>Verify Certificate</h1>
          <div>
            <label>Certificate Number :</label>
            <input
              type="number"
              className="no-arrow"
              min="0"
              step="1"
              value={certNo}
              onChange={handleCertNo}
            />
          </div>
          <div>
            <label>certificate Hash : </label>
            <input
              type="text"
              value={certHash}
              onChange={handleHash}
            />
            <button disabled={!metamask} onClick={verifyCertificate}>
              Verify
            </button>
            {!metamask && <p className="meta">**Connect wallet first</p>}
          </div>

          {certificateName && metamask && (
            <div>
              <p className="success-message">Data Match ! Certificate is <b>Original !</b></p>
              <p>Name : {certificateName}</p>
              <p>Course : {certificateCourse}</p>
              <p>Date of completion : {dateComponents.day}/{dateComponents.month}/{dateComponents.year}</p>
            </div>
          )}
          <p className="fail-message">{validity}</p>
          {formError && <p className="fail-message">{formError}</p>}
        </div>

        <div className="cont2">
          <h1>Add Certificate</h1>
          <div>
            <label>Certificate Number :</label>
            <input
              type="number"
              className="no-arrow"
              id="num1"
              value={number}
              onChange={handleCertNoChange}
            />
          </div>
          <div>
            <label>Name :</label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
            />
          </div>
          <div>
            <label>Course : </label>
            <input
              type="text"
              value={course}
              onChange={handleCourseChange}
            />
          </div>
          <div>
            <label>Date of completion : </label>
            <input
              type="date"
              value={dateInput}
              onChange={handleDateChange}
            />
          </div>
          <button disabled={!metamask} onClick={handleAddCertificate}>
            Add Certificate
          </button>
          {formError3 && <p className="fail-message">{formError3}</p>}
          {addedCertificate && metamask ? (
            <p className="success-message">{addOk}</p>
          ) : (
            <p className="fail-message">{addOk}</p>
          )}
          {addedCertificate && needPrint && (
            <button className="print" onClick={GeneratePDF}>
              Print Certificate
            </button>
          )}
          {formError2 && <p className="fail-message">{formError2}</p>}
        </div>
      </div>
    </div>
  );
};

export default App;
