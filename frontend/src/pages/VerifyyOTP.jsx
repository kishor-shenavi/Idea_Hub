


//all good


// import { useState, useRef } from 'react';
// import { useAuth } from '../context/AuthContext';

// export default function VerifyOtp() {
//   const { verifyOtpAndRegister } = useAuth();
//   const [otp, setOtp] = useState(['', '', '', '']);
//   const [error, setError] = useState('');
//   const inputRefs = useRef([]);

//   const handleChange = (index, value) => {
//     if (/^\d*$/.test(value)) { // Only allow numbers
//       const newOtp = [...otp];
//       newOtp[index] = value;
//       setOtp(newOtp);

//       // Move to next input if current input is filled
//       if (value && index < 3) {
//         inputRefs.current[index + 1].focus();
//       }
//     }
//   };

//   const handleKeyDown = (index, e) => {
//     // Move to previous input on backspace if current is empty
//     if (e.key === 'Backspace' && !otp[index] && index > 0) {
//       inputRefs.current[index - 1].focus();
//     }
//   };

//   const handlePaste = (e) => {
//     e.preventDefault();
//     const pasteData = e.clipboardData.getData('text/plain').slice(0, 4);
//     if (/^\d+$/.test(pasteData)) {
//       const newOtp = [...otp];
//       for (let i = 0; i < pasteData.length; i++) {
//         if (i < 4) {
//           newOtp[i] = pasteData[i];
//         }
//       }
//       setOtp(newOtp);
//     }
//   };

//   const handleVerify = async (e) => {
//     e.preventDefault();
//     const name = localStorage.getItem('pendingName');
//     const email = localStorage.getItem('pendingEmail');
//     const password = localStorage.getItem('pendingPassword');
//     const role = localStorage.getItem('pendingRole');
//     const otpCode = otp.join('');

//     try {
//       await verifyOtpAndRegister(name, email, password, role, otpCode);
//     } catch (err) {
//       setError('OTP verification failed. Try again.');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <form onSubmit={handleVerify} className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
//         <h2 className="text-xl font-bold mb-4 text-center">Verify OTP</h2>
//         {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
        
//         <div className="flex justify-center space-x-2 mb-6">
//           {otp.map((digit, index) => (
//             <input
//               key={index}
//               type="text"
//               value={digit}
//               onChange={(e) => handleChange(index, e.target.value)}
//               onKeyDown={(e) => handleKeyDown(index, e)}
//               onPaste={handlePaste}
//               maxLength={1}
//               ref={(el) => (inputRefs.current[index] = el)}
//               className="w-12 h-12 text-2xl text-center border rounded focus:border-indigo-500 focus:outline-none"
//               required
//             />
//           ))}
//         </div>
        
//         <button
//           type="submit"
//           className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
//         >
//           Verify & Register
//         </button>
//       </form>
//     </div>
//   );
// }











// import { useState } from 'react';
// import { useAuth } from '../context/AuthContext';

// export default function VerifyOtp() {
//   const { verifyOtpAndRegister } = useAuth();
//   const [otp, setOtp] = useState('');
//   const [error, setError] = useState('');

//   const handleVerify = async (e) => {
//     e.preventDefault();
//     const name = localStorage.getItem('pendingName');
//     const email = localStorage.getItem('pendingEmail');
//     const password = localStorage.getItem('pendingPassword');
//     const role = localStorage.getItem('pendingRole');

//     try {
//       await verifyOtpAndRegister(name, email, password, role, otp);
//     } catch (err) {
//       setError('OTP verification failed. Try again.');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <form onSubmit={handleVerify} className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
//         <h2 className="text-xl font-bold mb-4 text-center">Verify OTP</h2>
//         {error && <p className="text-red-600 mb-2">{error}</p>}
//         <input
//           type="text"
//           value={otp}
//           onChange={(e) => setOtp(e.target.value)}
//           placeholder="Enter OTP"
//           className="w-full px-3 py-2 border rounded mb-4"
//           required
//         />
//         <button
//           type="submit"
//           className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
//         >
//           Verify & Register
//         </button>
//       </form>
//     </div>
//   );
// }





import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function VerifyOtp() {
  const { verifyOtpAndRegister } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    // Get the pending email from localStorage when component mounts
    const pendingEmail = localStorage.getItem('pendingEmail');
    if (pendingEmail) {
      setEmail(pendingEmail);
    }
  }, []);

  const handleChange = (index, value) => {
    if (/^\d*$/.test(value)) { // Only allow numbers
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next input if current input is filled
      if (value && index < 3) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain').slice(0, 4);
    if (/^\d+$/.test(pasteData)) {
      const newOtp = [...otp];
      for (let i = 0; i < pasteData.length; i++) {
        if (i < 4) {
          newOtp[i] = pasteData[i];
        }
      }
      setOtp(newOtp);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const name = localStorage.getItem('pendingName');
    const email = localStorage.getItem('pendingEmail');
    const password = localStorage.getItem('pendingPassword');
    const role = localStorage.getItem('pendingRole');
    const otpCode = otp.join('');

    try {
      await verifyOtpAndRegister(name, email, password, role, otpCode);
    } catch (err) {
      setError('OTP verification failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <form onSubmit={handleVerify} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Verify OTP</h2>
          {email && (
            <p className="text-sm text-gray-600 mt-2">
              We've sent a 4-digit code to <span className="font-medium">{email}</span>
            </p>
          )}
        </div>
        
        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md flex items-center justify-center text-sm">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
        
        <div className="flex justify-center space-x-3 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              maxLength={1}
              ref={(el) => (inputRefs.current[index] = el)}
              className="w-14 h-14 text-2xl text-center border-2 rounded-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              required
              autoFocus={index === 0}
            />
          ))}
        </div>
        
        <div className="space-y-4">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
          >
            Verify & Continue
          </button>
          
          <p className="text-center text-sm text-gray-600">
            Didn't receive code?{' '}
            <button
              type="button"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
              onClick={() => {
                // Add resend OTP functionality here
                alert('OTP resent to your email!');
              }}
            >
              Resend
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}