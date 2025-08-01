// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'

// export default function Register() {
//   const [name, setName] = useState('')
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [role, setRole] = useState('student')
//   const [error, setError] = useState('')
//   const { register } = useAuth()
//   const navigate = useNavigate()

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     try {
//       await register(name, email, password, role)
//     } catch (err) {
//       console.log(error);
//       setError('Registration failed. Please try again.')
//     }
//   }

//   return (
//     <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
//       <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
//       {error && <div className="text-red-500 mb-4">{error}</div>}
//       <form onSubmit={handleSubmit}>
//         <div className="mb-4">
//           <label className="block text-gray-700 mb-2" htmlFor="name">
//             Name
//           </label>
//           <input
//             type="text"
//             id="name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
//             required
//           />
//         </div>
//         <div className="mb-4">
//           <label className="block text-gray-700 mb-2" htmlFor="email">
//             Email
//           </label>
//           <input
//             type="email"
//             id="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
//             required
//           />
//         </div>
//         <div className="mb-4">
//           <label className="block text-gray-700 mb-2" htmlFor="password">
//             Password
//           </label>
//           <input
//             type="password"
//             id="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
//             required
//             minLength="6"
//           />
//         </div>
//         <div className="mb-6">
//           <label className="block text-gray-700 mb-2">Role</label>
//           <div className="flex space-x-4">
//             <label className="inline-flex items-center">
//               <input
//                 type="radio"
//                 className="text-primary focus:ring-primary"
//                 name="role"
//                 value="student"
//                 checked={role === 'student'}
//                 onChange={() => setRole('student')}
//               />
//               <span className="ml-2">Student</span>
//             </label>
//             <label className="inline-flex items-center">
//               <input
//                 type="radio"
//                 className="text-primary focus:ring-primary"
//                 name="role"
//                 value="admin"
//                 checked={role === 'admin'}
//                 onChange={() => setRole('admin')}
//               />
//               {/* <span className="ml-2">Admin</span> */}
//             </label>
//           </div>
//         </div>
//         <button onClick={() => navigate('/projects')}
//           type="submit"
//           className="w-full bg-primary text-blue py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
//         >
//           Register
//         </button>
//       </form>
//       <p className="mt-4 text-center text-gray-600">
//         Already have an account?{' '}
//         <button
//           onClick={() => navigate('/login')}
//           className="text-primary bg-blue-500 hover:underline"
//         >
//           Login here
//         </button>
//       </p>
//     </div>
//   )
// }






// corrected code:

// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'

// export default function Register() {
//   const [name, setName] = useState('')
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//  // const [role, setRole] = useState('student')
//   const [error, setError] = useState('')
//   const { register } = useAuth()
//   const navigate = useNavigate()

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     try {
//       await register(name, email, password, 'student')
//     } catch (err) {
//       console.log(error);
//       setError('Registration failed. Please try again.')
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
//       <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
//         <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
//           <h2 className="text-2xl font-bold text-center">Join Our Community</h2>
//           <p className="text-center text-indigo-100 mt-1">Start your journey with us</p>
//         </div>
        
//         <div className="p-6">
//           {error && (
//             <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md flex items-center">
//               <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//               {error}
//             </div>
//           )}
          
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
//                 Full Name
//               </label>
//               <input
//                 type="text"
//                 id="name"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
//                 required
//                 placeholder="John Doe"
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 id="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
//                 required
//                 placeholder="your@email.com"
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 id="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
//                 required
//                 minLength="6"
//                 placeholder="••••••••"
//               />
//             </div>

            
//             <button
//               type="submit"
//               className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
//             >
//               Create Account
//             </button>
//           </form>
          
//           <p className="mt-4 text-center text-gray-600">
//             Already have an account?{' '}
//             <button
//               onClick={() => navigate('/login')}
//               className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
//             >
//               Sign in
//             </button>
//           </p>
//         </div>
//       </div>
//     </div>
//   )
// }











import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
 // const [role, setRole] = useState('student')
  const [error, setError] = useState('')
 const { sendOtpForRegister } = useAuth() 
  const navigate = useNavigate()

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
         LoadingSpinner(true);
    await sendOtpForRegister(email); // Send OTP to this email
    localStorage.setItem('pendingName', name);
    localStorage.setItem('pendingPassword', password);
    localStorage.setItem('pendingRole', 'student');
 LoadingSpinner(false);
    // ✅ You already navigate to /verify-otp inside sendOtpForRegister
  } catch (err) {
     LoadingSpinner(false);
    console.error(err);
    setError('Failed to send OTP. Please try again.');
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <h2 className="text-2xl font-bold text-center">Join Our Community</h2>
          <p className="text-center text-indigo-100 mt-1">Start your journey with us</p>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                required
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                required
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                required
                minLength="6"
                placeholder="••••••••"
              />
            </div>

            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              Create Account
            </button>
          </form>
          
          <p className="mt-4 text-center text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}