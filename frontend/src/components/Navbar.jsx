// // import { Link } from 'react-router-dom'
// // import { useAuth } from '../context/AuthContext'
// // export default function Navbar() {
// //   const { user, logout } = useAuth()

// //   return (
// //     <nav className="bg-white shadow-md">
// //       <div className="container mx-auto px-4 py-3 flex justify-between items-center">
// //         <div className="flex items-center space-x-8">
// //           <Link to="/" className="text-xl font-bold text-primary">
// //             Student Projects
// //           </Link>
// //           <Link to="/" className="hover:text-primary">
// //             Home
// //           </Link>
// //         </div>
        
// //         <div className="flex items-center space-x-4">
// //           {user ? (
// //             <>
// //               <Link to="/projects" className="hover:text-primary">
// //                 Projects
// //               </Link>
// //               <button
// //                 onClick={logout}
// //                 className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
// //               >
// //                 Logout
// //               </button>
// //             </>
// //           ) : (
// //             <>
// //               <Link to="/login" className="hover:text-primary">
// //                 Login
// //               </Link>
// //               <Link
// //                 to="/register"
// //                 className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
// //               >
// //                 Register
// //               </Link>
// //             </>
// //           )}
// //         </div>
// //       </div>
// //     </nav>
// //   )
// // }

// import { Link } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'

// export default function Navbar() {
//   const { user, logout } = useAuth()

//   return (
//     <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
//       <div className="container mx-auto px-4 py-3 flex justify-between items-center">
//         <div className="flex items-center space-x-8">
//           <Link to="/" className="text-xl font-bold text-white hover:text-indigo-200 transition-colors">
//             <span className="bg-white text-indigo-600 px-2 py-1 rounded-md mr-2">✨</span>
//             Student Projects
//           </Link>
//           <Link to="/" className="text-white hover:text-indigo-200 transition-colors">
//             Home
//           </Link>
//         </div>

//         <div className="flex items-center space-x-4">
//           {user ? (
//             <>
//               <Link 
//                 to="/projects" 
//                 className="text-white hover:text-indigo-200 transition-colors flex items-center"
//               >
//                 <span className="mr-1">📂</span> Projects
//               </Link>
//               <button
//                 onClick={logout}
//                 className="bg-white text-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-100 transition-colors flex items-center shadow-sm"
//               >
//                 <span className="mr-1">🚪</span> Logout
//               </button>
//             </>
//           ) : (
//             <>
//               <Link 
//                 to="/login" 
//                 className="text-white hover:text-indigo-200 transition-colors px-4 py-2 rounded-md"
//               >
//                 Login
//               </Link>
//               <Link
//                 to="/register"
//                 className="bg-white text-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-100 transition-colors shadow-sm"
//               >
//                 Register
//               </Link>
//             </>
//           )}
//         </div>
//       </div>
//     </nav>
//   )
// }


import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiLogIn, FiUserPlus, FiFolder, FiLogOut } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg backdrop-blur-sm bg-opacity-90"
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-2"
        >
          <Link to="/" className="text-xl font-bold text-white hover:text-indigo-200 transition-colors flex items-center">
            <motion.span 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
              className="bg-white text-indigo-600 px-2 py-1 rounded-md mr-2"
            >
              ✨
            </motion.span>
            <span className="hidden sm:inline">Student Projects</span>
          </Link>
        </motion.div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/projects" 
                  className="text-white hover:text-indigo-200 transition-colors flex items-center"
                >
                  <FiFolder className="mr-1" /> 
                  <span className="hidden sm:inline">Projects</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button
                  onClick={logout}
                  className="bg-white text-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-100 transition-colors flex items-center shadow-sm"
                >
                  <FiLogOut className="mr-1" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/login" 
                  className="text-white hover:text-indigo-200 transition-colors px-4 py-2 rounded-md flex items-center"
                >
                  <FiLogIn className="mr-1" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="bg-white text-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-100 transition-colors flex items-center shadow-sm"
                >
                  <FiUserPlus className="mr-1" />
                  <span className="hidden sm:inline">Register</span>
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}