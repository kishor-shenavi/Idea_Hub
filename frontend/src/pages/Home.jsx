
//all good 


// import { Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { FiBook, FiPlus, FiAward, FiCode, FiLayers } from 'react-icons/fi';
// import { motion } from 'framer-motion';
// //import { useRef } from 'react';
// import { useInView } from 'react-intersection-observer';

// export default function Home() {
//   const { user } = useAuth();
//   const [ref, inView] = useInView({
//     triggerOnce: true,
//     threshold: 0.1,
//   });

//   const features = [
//     {
//       icon: <FiAward className="h-8 w-8" />,
//       title: "Build Your Portfolio",
//       description: "Showcase your best work to potential employers and academic institutions with a professional portfolio."
//     },
//     {
//       icon: <FiCode className="h-8 w-8" />,
//       title: "Develop Real Skills",
//       description: "Work on practical projects that enhance your technical and collaborative skills beyond the classroom."
//     },
//     {
//       icon: <FiLayers className="h-8 w-8" />,
//       title: "Cross-Disciplinary Learning",
//       description: "Explore projects from different fields and discover new interests and applications for your skills."
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
//       {/* Floating Background Elements */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         {[...Array(15)].map((_, i) => (
//           <motion.div
//             key={i}
//             className="absolute rounded-full bg-indigo-100 opacity-20"
//             style={{
//               width: Math.random() * 100 + 50,
//               height: Math.random() * 100 + 50,
//               left: `${Math.random() * 100}%`,
//               top: `${Math.random() * 100}%`,
//             }}
//             animate={{
//               y: [0, Math.random() * 100 - 50],
//               x: [0, Math.random() * 100 - 50],
//               opacity: [0.1, 0.3, 0.1],
//             }}
//             transition={{
//               duration: Math.random() * 20 + 10,
//               repeat: Infinity,
//               repeatType: 'reverse',
//               ease: 'easeInOut',
//             }}
//           />
//         ))}
//       </div>

//       {/* Main Content */}
//       <div className="relative z-10">
//         {/* Hero Section */}
//         <motion.div 
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           className="text-center py-32 px-4 sm:px-6 lg:px-8"
//         >
//           <motion.div
//             whileHover={{ scale: 1.02 }}
//             className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20"
//           >
//             <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
//               Showcase Your <span className="text-primary">Student Projects</span>
//             </h1>
//             <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
//               A platform to discover, share, and collaborate on innovative student projects across all disciplines.
//               {user && (
//                 <motion.span 
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   className="block mt-2 text-indigo-600"
//                 >
//                   Welcome back, {user.name}!
//                 </motion.span>
//               )}
//             </p>
//             <div className="flex flex-wrap justify-center gap-4">
//               {user ? (
//                 <>
//                   <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                     <Link
//                       to="/projects"
//                       className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700"
//                     >
//                       <FiBook className="mr-2" />
//                       Browse Projects
//                     </Link>
//                   </motion.div>
//                   <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                     <Link
//                       to="/projects/create"
//                       className="flex items-center border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-4 rounded-xl text-lg font-medium transition-all"
//                     >
//                       <FiPlus className="mr-2" />
//                       Add Project
//                     </Link>
//                   </motion.div>
//                 </>
//               ) : (
//                 <>
//                   <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                     <Link
//                       to="/login"
//                       className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700"
//                     >
//                       Login
//                     </Link>
//                   </motion.div>
//                   <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                     <Link
//                       to="/register"
//                       className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-4 rounded-xl text-lg font-medium transition-all"
//                     >
//                       Register
//                     </Link>
//                   </motion.div>
//                 </>
//               )}
//             </div>
//           </motion.div>
//         </motion.div>

//         {/* Features Section */}
//         <div ref={ref} className="py-16 px-4 sm:px-6 lg:px-8">
//           <div className="max-w-7xl mx-auto">
//             <motion.div 
//               initial={{ opacity: 0 }}
//               animate={inView ? { opacity: 1 } : {}}
//               transition={{ duration: 0.6 }}
//               className="text-center mb-16"
//             >
//               <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//                 Empower Your <span className="text-primary">Academic Journey</span>
//               </h2>
//               <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//                 Our platform helps you turn ideas into reality with the support of a vibrant student community.
//               </p>
//             </motion.div>
            
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//               {features.map((feature, index) => (
//                 <motion.div
//                   key={index}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={inView ? { opacity: 1, y: 0 } : {}}
//                   transition={{ duration: 0.5, delay: index * 0.1 }}
//                   whileHover={{ y: -10 }}
//                   className="p-8 bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all"
//                 >
//                   <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6">
//                     {feature.icon}
//                   </div>
//                   <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
//                   <p className="text-gray-600">{feature.description}</p>
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Stats Section */}
//         <div className="py-16 bg-gradient-to-r from-indigo-50 to-purple-50">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <motion.div 
//               initial={{ opacity: 0 }}
//               animate={inView ? { opacity: 1 } : {}}
//               transition={{ duration: 0.6 }}
//               className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
//             >
//               {[
//                 { value: "500+", label: "Active Projects" },
//                 { value: "1.2K+", label: "Student Members" },
//                 { value: "50+", label: "Academic Institutions" },
//                 { value: "15+", label: "Project Categories" }
//               ].map((stat, index) => (
//                 <motion.div
//                   key={index}
//                   whileHover={{ scale: 1.05 }}
//                   className="p-6 bg-white rounded-xl shadow-md"
//                 >
//                   <p className="text-4xl font-bold text-indigo-600 mb-2">{stat.value}</p>
//                   <p className="text-gray-600">{stat.label}</p>
//                 </motion.div>
//               ))}
//             </motion.div>
//           </div>
//         </div>

//         {/* Call to Action */}
//         {!user && (
//           <div className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
//             <div className="max-w-4xl mx-auto px-4 text-center">
//               <motion.h2 
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6 }}
//                 className="text-3xl md:text-4xl font-bold mb-6"
//               >
//                 Ready to showcase your work?
//               </motion.h2>
//               <motion.p 
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 0.2 }}
//                 className="text-xl mb-8 opacity-90"
//               >
//                 Join thousands of students who are building their portfolios and collaborating on amazing projects.
//               </motion.p>
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 0.4 }}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 <Link
//                   to="/register"
//                   className="inline-block bg-white text-indigo-600 px-10 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition-all shadow-lg"
//                 >
//                   Get Started - It's Free
//                 </Link>
//               </motion.div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }







import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiBook, FiPlus, FiAward, FiCode, FiLayers } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function Home() {
  const { user } = useAuth();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const features = [
    {
      icon: <FiAward className="h-6 w-6 md:h-8 md:w-8" />,
      title: "Build Your Portfolio",
      description: "Showcase your best work to potential employers and academic institutions with a professional portfolio."
    },
    {
      icon: <FiCode className="h-6 w-6 md:h-8 md:w-8" />,
      title: "Develop Real Skills",
      description: "Work on practical projects that enhance your technical and collaborative skills beyond the classroom."
    },
    {
      icon: <FiLayers className="h-6 w-6 md:h-8 md:w-8" />,
      title: "Cross-Disciplinary Learning",
      description: "Explore projects from different fields and discover new interests and applications for your skills."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-x-hidden">
      {/* Floating Background Elements - Reduced for mobile */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-indigo-100 opacity-20"
            style={{
              width: Math.random() * 60 + 30, // Smaller on mobile
              height: Math.random() * 60 + 30,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 60 - 30], // Reduced movement
              x: [0, Math.random() * 60 - 30],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section - Mobile Optimized */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center pt-16 pb-12 px-4 sm:px-6 lg:px-8"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-xl border border-white/20"
          >
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-gray-900 mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Showcase Your <span className="text-primary">Student Projects</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto">
              A platform to discover, share, and collaborate on innovative student projects across all disciplines.
              {user && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="block mt-2 text-indigo-600"
                >
                  Welcome back, {user.name}!
                </motion.span>
              )}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
              {user ? (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/projects"
                      className="flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl text-base md:text-lg font-medium transition-all shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700"
                    >
                      <FiBook className="mr-2" />
                      Browse Projects
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/projects/create"
                      className="flex items-center justify-center border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-6 py-3 md:px-8 md:py-4 rounded-xl text-base md:text-lg font-medium transition-all"
                    >
                      <FiPlus className="mr-2" />
                      Add Project
                    </Link>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/login"
                      className="flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl text-base md:text-lg font-medium transition-all shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700"
                    >
                      Login
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/register"
                      className="flex items-center justify-center border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-6 py-3 md:px-8 md:py-4 rounded-xl text-base md:text-lg font-medium transition-all"
                    >
                      Register
                    </Link>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Features Section - Mobile Optimized */}
        <div ref={ref} className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
                Empower Your <span className="text-primary">Academic Journey</span>
              </h2>
              <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
                Our platform helps you turn ideas into reality with the support of a vibrant student community.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="p-6 md:p-8 bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-3 md:p-4 rounded-2xl w-14 h-14 md:w-16 md:h-16 flex items-center justify-center mb-4 md:mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3">{feature.title}</h3>
                  <p className="text-sm md:text-base text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section - Mobile Optimized */}
        <div className="py-12 md:py-16 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8 text-center"
            >
              {[
                { value: "500+", label: "Active Projects" },
                { value: "1.2K+", label: "Student Members" },
                { value: "50+", label: "Academic Institutions" },
                { value: "15+", label: "Project Categories" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="p-4 md:p-6 bg-white rounded-xl shadow-md"
                >
                  <p className="text-2xl md:text-4xl font-bold text-indigo-600 mb-1 md:mb-2">{stat.value}</p>
                  <p className="text-xs md:text-sm text-gray-600">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Call to Action - Mobile Optimized */}
        {!user && (
          <div className="py-12 md:py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6"
              >
                Ready to showcase your work?
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base md:text-xl mb-6 md:mb-8 opacity-90"
              >
                Join thousands of students who are building their portfolios and collaborating on amazing projects.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/register"
                  className="inline-block bg-white text-indigo-600 px-6 py-3 md:px-10 md:py-4 rounded-lg text-base md:text-lg font-bold hover:bg-gray-100 transition-all shadow-lg"
                >
                  Get Started - It's Free
                </Link>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}









