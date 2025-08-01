
import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function VerifyOtp() {
  const { verifyOtpAndRegister } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

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
      setError('OTP verification failed. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleVerify} className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-center">Verify OTP</h2>
        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
        
        <div className="flex justify-center space-x-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              maxLength={1}
              ref={(el) => (inputRefs.current[index] = el)}
              className="w-12 h-12 text-2xl text-center border rounded focus:border-indigo-500 focus:outline-none"
              required
            />
          ))}
        </div>
        
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          Verify & Register
        </button>
      </form>
    </div>
  );
}











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
