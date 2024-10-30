require('dotenv').config();
const nodemailer = require('nodemailer');
console.log("Email : "+process.env.EMAIL_USER);
console.log("Pass : "+process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  secure: false,  
  tls: {
    rejectUnauthorized: false  
  }
});



const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, 
    to: email,                   
    subject: 'Your OTP Code',    
    text: `Hello!

    Your secure OTP code is ${otp}. It will expire in 10 minutes, so use it promptly to complete your verification process.
    
    If you didn’t request this code, please ignore this email.
    
    Stay safe,
    Alumni`, 
  };

  try {
   
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendOtpEmail };
