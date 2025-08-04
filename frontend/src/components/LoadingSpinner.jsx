// // export default function LoadingSpinner() {
// //   return (
// //     <div className="flex justify-center items-center h-64">
// //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
// //     </div>
// //   )
// // }

// export default function LoadingSpinner() {
//   return (
//     <div className="flex justify-center items-center h-screen">
//       <div className="relative">
//         <div className="w-16 h-16 border-4 border-indigo-500 border-dashed rounded-full animate-spin"></div>
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
//           <div className="w-8 h-8 bg-indigo-600 rounded-full"></div>
//         </div>
//       </div>
//     </div>
//   );
// }






// //all good


// import { motion } from 'framer-motion';

// export default function LoadingSpinner() {
//   return (
//     <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
//       <motion.div
//         animate={{
//           rotate: 360,
//           scale: [1, 1.2, 1.2, 1, 1],
//         }}
//         transition={{
//           rotate: {
//             repeat: Infinity,
//             duration: 2,
//             ease: "linear"
//           },
//           scale: {
//             duration: 2,
//             repeat: Infinity,
//             repeatType: "reverse"
//           }
//         }}
//         className="relative"
//       >
//         <div className="w-24 h-24 border-8 border-indigo-200 border-dashed rounded-full">
//           <div className="absolute inset-0 flex items-center justify-center">
//             <motion.div
//               animate={{
//                 rotate: -360,
//                 scale: [1, 0.8, 0.8, 1, 1],
//               }}
//               transition={{
//                 rotate: {
//                   repeat: Infinity,
//                   duration: 2,
//                   ease: "linear"
//                 },
//                 scale: {
//                   duration: 2,
//                   repeat: Infinity,
//                   repeatType: "reverse"
//                 }
//               }}
//               className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-lg"
//             />
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// }







// components/LoadingSpinner.jsx
import { motion } from 'framer-motion';

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1.2, 1, 1],
        }}
        transition={{
          rotate: { repeat: Infinity, duration: 2, ease: "linear" },
          scale: { duration: 2, repeat: Infinity, repeatType: "reverse" },
        }}
        className="relative"
      >
        <div className="w-24 h-24 border-8 border-indigo-200 border-dashed rounded-full">
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{
                rotate: -360,
                scale: [1, 0.8, 0.8, 1, 1],
              }}
              transition={{
                rotate: { repeat: Infinity, duration: 2, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, repeatType: "reverse" },
              }}
              className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-lg"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
