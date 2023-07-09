import React, { useState, useEffect} from 'react';
import { jsPDF } from 'jspdf';
import backgroundImage from './cert.png';
import QRCode from 'qrcode';
import Web3 from 'web3';
import './App.css';
import abi from './university.json'



const App = () => {
  
  const [contract, setContract] = useState(null);
  const [certNo,setCertNo]=useState('');
  const [certHash,setHash]=useState('');
  const[validity , setvalidity]=useState('');
  const [certificateName, setCertificateName] = useState('');
  const [certificateCourse, setCertificateCourse] = useState('');
  const [certificateDate, setCertificateDate] = useState('');
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
  const [_certNo,_setCertNo]=useState('');
  const [_name, _setName] = useState('');
  const [_course, _setCourse] = useState('');
  const [_date, _setDate] = useState('');
  const [_certHash,_setHash]=useState('');
  const[needPrint,setNeedPrint]=useState('false');
  const [formError, setFormError] = useState('');
  const [formError2, setFormError2] = useState('');
  const[FormError3,setFormError3]=useState('');
  const[metamask,setMetamask]=useState(false);
  const[addOk,setAddOk]=useState('');





useEffect(()=>{
  const address="0x9AeEb0Aad2efbc24D010A43eD50EF7A350ED6630";
    const initialize= async()=>{
      if (window.ethereum && metamask)
      {
        await window.ethereum.enable();
        const web3=new Web3(window.ethereum);
        const contract= new web3.eth.Contract(abi,address);
        setContract(contract);

        
      }

      const urlParams = new URLSearchParams(window.location.search);//for auto filling from QR code
      const certNoParam = urlParams.get('certNo');
      const certHashParam = urlParams.get('certHash');
      setCertNo(certNoParam || '');// Set the initial values of the input fields
      setHash(certHashParam || '');

   };

    initialize();

  },[metamask]);

  const walletCheck=()=>{

    if(window.ethereum){setMetamask(true)}else {alert('MetaMask not installed !')}

  }

  const handleCertNo=(event)=>{
   setCertNo(event.target.value);
  }
  const handleHash = (event) => {
    setHash(event.target.value);
  }


   const verifyCertificate = async () => {
    try {
      if (!certNo || !certHash ) {
        setFormError('Please fill in all the fields.');
        return;
      }else {setFormError('');setvalidity('');}

     
      
      const result = await contract.methods.getCertificate(certNo, certHash).call();
      console.log('result:', result);
      setCertificateName(result[0]);
      setCertificateCourse(result[1]);
      const input = result[2];
      const year = input.substr(0, 4);
      const month = input.substr(4, 2);
      const day = input.substr(6);
      console.log(`Day: ${day}, Month: ${month}, Year: ${year}`);
      setDateComponents({
      day: day,
      month: month,
      year: year,
      });

      setvalidity("");

    } catch (error) {
      console.error('error', error);
      setCertificateName('');
      setCertificateCourse('');
      setCertificateDate(null);
      setvalidity('Invalid certificate');
      
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

    // Extract day, month, and year components
    const day = input.substr(0, 2);
    const month = input.substr(2, 2);
    const year = input.substr(4);
    };

const handleAddCertificate = async () => {

  
    setAddOk('');
    if (contract) {

      if (!number || !name || !course || !dateInput) {
        setFormError2('Please fill in all the fields.');
        return;
      }else {setFormError2('');}

      try {
        const web3=new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        const t = dateInput.replace(/-/g, '');

        // try {var result = await contract.methods.addCertificate(number,'','','').call();}catch(error){setFormError3('The entered certificate num already exists please choose another')}
        // if (result) {
        // setFormError3('');  
        await contract.methods.addCertificate(number, name, course, t).send({ from: accounts[0] });
        console.log("Certificate added successfully!");
        setAddOk('Certificate added successfully')
        
        setNeedPrint(true);
        
        setAddedCertificate(true);
      }
       
       catch (error) { 
        console.error("Error adding certificate:", error);
        setNeedPrint(false);
        setAddedCertificate(false);
        setAddOk('error adding certificate ');
        
        
      }
    }

    fetchData(number);
    
    
  }

  const fetchData = async () => {
      try {
        const _result = await contract.methods.print(number).call();
        console.log('result:', _result);
        _setName(_result[0]); // name
        _setCourse(_result[1]); // course
        _setDate(_result[2]); // date
        _setHash(_result[3]); // hash
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    async function generateQRCodeAsDataURL(data) {
      try {
        return await QRCode.toDataURL(data);
          } catch (error) {
        console.error('Error generating QR code:', error);
        return null;
         }
    }
    
   
    
    const GeneratePDF = async() => {
    
    const dAppLink = `http://localhost:3000/?certNo=${encodeURIComponent(number)}&certHash=${encodeURIComponent(_certHash)}`;
    const qrCodeDataUrl = await generateQRCodeAsDataURL(dAppLink);

    const pdf = new jsPDF('landscape');
    const img = new Image();
    img.src = backgroundImage;
    img.onload = () => {
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();
      pdf.addImage(img, 'JPEG', 0, 0, width, height);

      pdf.setFont('Arial',''); // Set font family and style
      pdf.setFontSize(15); // Set font size
      pdf.setTextColor(25, 25, 25); // Set text color (white)
      pdf.setFontSize(12);
      pdf.text(`${number}`, 98, 202.5);

      // Function to center name for longer name scenario
      function centerText(text, fontSize, x, y) {
        const textWidth = pdf.getTextWidth(text);
        const centerX = x - textWidth / 2;
        const centerY = y + fontSize / 2;
        pdf.setFont('Helvetica', 'bold');
        pdf.setFontSize(fontSize);
        pdf.text(text, centerX, centerY);
      }
      const dynamicName = _name; // Replace 'name' with your actual state variable name
      const fontSize = 22;
      const x = 130; // Specify the x-coordinate for the center of the text
      const y = 85; // Specify the y-coordinate for the center of the text
      
      centerText(dynamicName, fontSize, x, y);

      pdf.setFont('Helvetica','bold'); // Set different font family and style
      pdf.setFontSize(20); // Set different font size
      pdf.setTextColor(0, 0, 0);
      pdf.text(` ${_course}`, 163, 113.1);

      pdf.setFont('Helvetica','bold'); // Set different font family and style
      pdf.setFontSize(17); // Set different font size
      pdf.setTextColor(0, 0, 0);
      pdf.text(` ${dateInput}`, 211, 122.7);

      pdf.setFont('Arial',''); // Set different font family and style
      pdf.setFontSize(11); // Set different font size
      pdf.setTextColor(25, 25, 25);
      pdf.text(` ${_certHash}`, 143, 202.3);

      if (qrCodeDataUrl) {
        // Add QR code image to the PDF document
        const qrCodeImgWidth = 30;
        const qrCodeImgHeight = 30;
        const qrCodeX = 183; // Adjust the X coordinate for QR code placement
        const qrCodeY = 160; // Adjust the Y coordinate for QR code placement
        pdf.addImage(qrCodeDataUrl, 'JPEG', qrCodeX, qrCodeY, qrCodeImgWidth, qrCodeImgHeight);
      } else {
        // Handle error if QR code generation fails
        console.error('Failed to generate QR code.');
      }
        pdf.save('certificate.pdf');

     };

 setNeedPrint(false);

 };

if(!metamask&&validity)
{
  setvalidity('');
}

  
  return (
    <div>
    <div id="buttons">
      {!metamask?(<button id='button-metamask' onClick={walletCheck} >connect wallet</button>):(<button id='button-metamask2' onClick={() => setMetamask(false)}>Disconnect</button>)}
      
    </div>
   <div className='cont' >
    <div className='cont1'>
     <h1>Verify Certificate</h1>
      <div>
            <label>Certificate Number :</label>
            <input type="number" class="no-arrow"  min="0" step="1"  value={certNo} onChange={handleCertNo} />
            
      </div>
      <div>
      <label>certificate Hash : </label>
            <input type="text"  value={certHash} onChange={handleHash} />
            <button disabled={!metamask} onClick={verifyCertificate}>Verify</button>

        {!metamask &&(
         <p className='meta'>**Connect wallet first</p>)}

      </div>
     

      {certificateName &&metamask&&(
    <div>
      
    <p className="success-message">Data Match | Certificate is Original !! </p>
   
    <p>Name : {certificateName}</p>
    <p>Course : {certificateCourse}</p>
    <p>Date of completion :  {dateComponents.day}/{dateComponents.month}/{dateComponents.year}</p>
     </div>) 
      }
     <p className="fail-message">{validity}</p>
     {formError && <p className="fail-message">{formError}</p>}

     </div>

    <div className='cont2'> 
     
       <h1>Add Certificate</h1>
      <div>
        <label>Certificate Number :</label>
        <input type="number"    class="no-arrow" id="num1" value={number} onChange={handleCertNoChange} />
      </div>
      <div>
        <label>Name :</label>
        <input type="text" value={name} onChange={handleNameChange} />
      </div>
      <div>
        <label>Course : </label>
        <input type="text" value={course} onChange={handleCourseChange} />
      </div>
      <div>
        <label>Date of completion : </label>
        <input type="date" value={dateInput} onChange={handleDateChange} />
      </div>
      <button disabled={!metamask} onClick={handleAddCertificate}>Add Certificate</button>

      {FormError3 && <p className="fail-message">{FormError3}</p>}

      {addedCertificate && metamask?(
          <p className='success-message'>{addOk}  </p>
        ): <p className='fail-message'>{addOk}</p> }
      {addedCertificate && needPrint&&(
          <button className='print' onClick={GeneratePDF}>Print Certificate</button> 
        )}
       
       {formError2 && <p className="fail-message">{formError2}</p>}
        </div>
</div>
</div>
);
};

export default App;