// // import { Link } from 'react-router-dom';
// // import { useAuth } from '../context/AuthContext';
// // import { FiBook, FiUsers, FiHeart, FiShare2, FiPlus } from 'react-icons/fi';

// // export default function Home() {
// //   const { user } = useAuth();

// //   return (
// //     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// //       {/* Hero Section */}
// //       <div className="text-center py-20">
// //         <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
// //           Welcome to Student Projects Platform
// //         </h1>
// //         <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
// //           Discover, share, and collaborate on student projects across various domains.
// //           {user && ` Welcome back, ${user.name}!`}
// //         </p>
// //         <div className="flex justify-center space-x-4">
// //           {user ? (
// //             <>
// //               <Link
// //                 to="/projects"
// //                 className="flex items-center bg-primary text-white px-6 py-3 rounded-md text-lg hover:bg-primary-dark transition-colors"
// //               >
// //                 <FiBook className="mr-2" />
// //                 Browse Projects
// //               </Link>
// //               <Link
// //                 to="/projects/create"
// //                 className="flex items-center border border-primary text-primary px-6 py-3 rounded-md text-lg hover:bg-gray-50 transition-colors"
// //               >
// //                 <FiPlus className="mr-2" />
// //                 ADD PROJECT
// //               </Link>
// //             </>
// //           ) : (
// //             <>
// //               <Link
// //                 to="/login"
// //                 className="bg-primary text-white px-6 py-3 rounded-md text-lg hover:bg-primary-dark transition-colors"
// //               >
// //                 Login
// //               </Link>
// //               <Link
// //                 to="/register"
// //                 className="border border-primary text-primary px-6 py-3 rounded-md text-lg hover:bg-gray-50 transition-colors"
// //               >
// //                 Register
// //               </Link>
// //             </>
// //           )}
// //         </div>
// //       </div>

// //       {/* Features Section */}
// //       <div className="py-12 bg-gray-50 rounded-lg mb-12">
// //         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// //           <div className="lg:text-center">
// //             <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Our Platform?</h2>
// //             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
// //               <div className="p-6 bg-white rounded-lg shadow-sm">
// //                 <FiUsers className="h-10 w-10 text-primary mb-4" />
// //                 <h3 className="text-xl font-semibold mb-2">Collaborate</h3>
// //                 <p className="text-gray-600">
// //                   Connect with other students and work together on exciting projects.
// //                 </p>
// //               </div>
// //               <div className="p-6 bg-white rounded-lg shadow-sm">
// //                 <FiHeart className="h-10 w-10 text-primary mb-4" />
// //                 <h3 className="text-xl font-semibold mb-2">Get Feedback</h3>
// //                 <p className="text-gray-600">
// //                   Receive likes and comments to improve your projects.
// //                 </p>
// //               </div>
// //               <div className="p-6 bg-white rounded-lg shadow-sm">
// //                 <FiShare2 className="h-10 w-10 text-primary mb-4" />
// //                 <h3 className="text-xl font-semibold mb-2">Showcase</h3>
// //                 <p className="text-gray-600">
// //                   Share your work with the community and build your portfolio.
// //                 </p>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Call to Action */}
// //       {!user && (
// //         <div className="text-center py-12">
// //           <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to get started?</h2>
// //           <p className="text-xl text-gray-600 mb-6">
// //             Join our community of student creators today!
// //           </p>
// //           <Link
// //             to="/register"
// //             className="inline-block bg-primary text-white px-8 py-4 rounded-md text-lg hover:bg-primary-dark transition-colors"
// //           >
// //             Create Your Free Account
// //           </Link>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }



// import { Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { FiBook,FiPlus, FiAward, FiCode, FiLayers } from 'react-icons/fi';

// export default function Home() {
//   const { user } = useAuth();

//   return (
//     <div className="min-h-screen flex flex-col">
//       {/* Main Content */}
//       <main className="flex-grow">
//         {/* Hero Section */}
//         <div className="text-center py-20 bg-gradient-to-b from-blue-50 to-white">
//           <div className="max-w-4xl mx-auto px-4">
//             <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
//               Showcase Your <span className="text-primary">Student Projects</span>
//             </h1>
//             <p className="text-xl text-gray-600 mb-8">
//               A platform to discover, share, and collaborate on innovative student projects across all disciplines.
//               {user && ` Welcome back, ${user.name}!`}
//             </p>
//             <div className="flex justify-center space-x-4">
//               {user ? (
//                 <>
//                   <Link
//                     to="/projects"
//                     className="flex items-center bg-primary hover:bg-primary-dark text-violet-600 px-8 py-3 rounded-lg text-lg font-medium transition-all transform hover:-translate-y-1 shadow-md hover:shadow-lg"
//                   >
//                     <FiBook className="mr-2" />
//                     Browse Projects
//                   </Link>
//                   <Link
//                     to="/projects/create"
//                     className="flex items-center border-2 border-primary text-primary hover:bg-blue-50 px-8 py-3 rounded-lg text-lg font-medium transition-all"
//                   >
//                     <FiPlus className="mr-2" />
//                     Add Project
//                   </Link>
//                 </>
//               ) : (
//                 <>
//                   <Link
//                     to="/login"
//                     className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg text-lg font-medium transition-all transform hover:-translate-y-1 shadow-md hover:shadow-lg"
//                   >
//                     Login
//                   </Link>
//                   <Link
//                     to="/register"
//                     className="border-2 border-primary text-primary hover:bg-blue-50 px-8 py-3 rounded-lg text-lg font-medium transition-all"
//                   >
//                     Register
//                   </Link>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Features Section - Replaced "Why Our Platform" */}
//         <div className="py-16 bg-white">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="text-center mb-16">
//               <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//                 Empower Your <span className="text-primary">Academic Journey</span>
//               </h2>
//               <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//                 Our platform helps you turn ideas into reality with the support of a vibrant student community.
//               </p>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//               <div className="p-8 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
//                 <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
//                   <FiAward className="h-8 w-8 text-primary" />
//                 </div>
//                 <h3 className="text-2xl font-semibold mb-3">Build Your Portfolio</h3>
//                 <p className="text-gray-600">
//                   Showcase your best work to potential employers and academic institutions with a professional portfolio.
//                 </p>
//               </div>
//               <div className="p-8 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
//                 <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
//                   <FiCode className="h-8 w-8 text-primary" />
//                 </div>
//                 <h3 className="text-2xl font-semibold mb-3">Develop Real Skills</h3>
//                 <p className="text-gray-600">
//                   Work on practical projects that enhance your technical and collaborative skills beyond the classroom.
//                 </p>
//               </div>
//               <div className="p-8 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
//                 <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
//                   <FiLayers className="h-8 w-8 text-primary" />
//                 </div>
//                 <h3 className="text-2xl font-semibold mb-3">Cross-Disciplinary Learning</h3>
//                 <p className="text-gray-600">
//                   Explore projects from different fields and discover new interests and applications for your skills.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Stats Section */}
//         <div className="py-16 bg-gray-50">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
//               <div className="p-6">
//                 <p className="text-4xl font-bold text-primary mb-2">500+</p>
//                 <p className="text-gray-600">Active Projects</p>
//               </div>
//               <div className="p-6">
//                 <p className="text-4xl font-bold text-primary mb-2">1.2K+</p>
//                 <p className="text-gray-600">Student Members</p>
//               </div>
//               <div className="p-6">
//                 <p className="text-4xl font-bold text-primary mb-2">50+</p>
//                 <p className="text-gray-600">Academic Institutions</p>
//               </div>
//               <div className="p-6">
//                 <p className="text-4xl font-bold text-primary mb-2">15+</p>
//                 <p className="text-gray-600">Project Categories</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Call to Action */}
//         {!user && (
//           <div className="py-20 bg-gradient-to-r from-primary to-primary-dark text-white">
//             <div className="max-w-4xl mx-auto px-4 text-center">
//               <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to showcase your work?</h2>
//               <p className="text-xl mb-8 opacity-90">
//                 Join thousands of students who are building their portfolios and collaborating on amazing projects.
//               </p>
//               <Link
//                 to="/register"
//                 className="inline-block bg-white text-primary px-10 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
//               >
//                 Get Started - It's Free
//               </Link>
//             </div>
//           </div>
//         )}
//       </main>

//       {/* Footer */}
//       <footer className="bg-gray-900 text-white py-12">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//             <div>
//               <h3 className="text-xl font-bold mb-4">Student Projects</h3>
//               <p className="text-gray-400">
//                 A platform for students to showcase their work and collaborate with peers.
//               </p>
//             </div>
//             <div>
//               <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
//               <ul className="space-y-2">
//                 <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
//                 <li><Link to="/projects" className="text-gray-400 hover:text-white transition-colors">Projects</Link></li>
//                 <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
//                 <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-lg font-semibold mb-4">Resources</h4>
//               <ul className="space-y-2">
//                 <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
//                 <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
//                 <li><Link to="/guidelines" className="text-gray-400 hover:text-white transition-colors">Guidelines</Link></li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-lg font-semibold mb-4">Connect</h4>
//               <div className="flex space-x-4">
//                 <a href="#" className="text-gray-400 hover:text-white transition-colors">
//                   <span className="sr-only">Twitter</span>
//                   <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
//                     <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
//                   </svg>
//                 </a>
//                 <a href="#" className="text-gray-400 hover:text-white transition-colors">
//                   <span className="sr-only">GitHub</span>
//                   <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
//                     <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
//                   </svg>
//                 </a>
//                 <a href="#" className="text-gray-400 hover:text-white transition-colors">
//                   <span className="sr-only">LinkedIn</span>
//                   <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
//                     <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
//                   </svg>
//                 </a>
//               </div>
//               <p className="mt-4 text-gray-400">
//                 Have questions? <Link to="/contact" className="text-white hover:underline">Contact us</Link>
//               </p>
//             </div>
//           </div>
//           <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
//             <p>&copy; {new Date().getFullYear()} Student Projects Platform. All rights reserved.</p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiBook, FiPlus, FiAward, FiCode, FiLayers } from 'react-icons/fi';
import { motion } from 'framer-motion';
//import { useRef } from 'react';
import { useInView } from 'react-intersection-observer';

export default function Home() {
  const { user } = useAuth();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const features = [
    {
      icon: <FiAward className="h-8 w-8" />,
      title: "Build Your Portfolio",
      description: "Showcase your best work to potential employers and academic institutions with a professional portfolio."
    },
    {
      icon: <FiCode className="h-8 w-8" />,
      title: "Develop Real Skills",
      description: "Work on practical projects that enhance your technical and collaborative skills beyond the classroom."
    },
    {
      icon: <FiLayers className="h-8 w-8" />,
      title: "Cross-Disciplinary Learning",
      description: "Explore projects from different fields and discover new interests and applications for your skills."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-indigo-100 opacity-20"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
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
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center py-32 px-4 sm:px-6 lg:px-8"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Showcase Your <span className="text-primary">Student Projects</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
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
            <div className="flex flex-wrap justify-center gap-4">
              {user ? (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/projects"
                      className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700"
                    >
                      <FiBook className="mr-2" />
                      Browse Projects
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/projects/create"
                      className="flex items-center border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-4 rounded-xl text-lg font-medium transition-all"
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
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700"
                    >
                      Login
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/register"
                      className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-4 rounded-xl text-lg font-medium transition-all"
                    >
                      Register
                    </Link>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <div ref={ref} className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Empower Your <span className="text-primary">Academic Journey</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our platform helps you turn ideas into reality with the support of a vibrant student community.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="p-8 bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-16 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
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
                  className="p-6 bg-white rounded-xl shadow-md"
                >
                  <p className="text-4xl font-bold text-indigo-600 mb-2">{stat.value}</p>
                  <p className="text-gray-600">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Call to Action */}
        {!user && (
          <div className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl md:text-4xl font-bold mb-6"
              >
                Ready to showcase your work?
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl mb-8 opacity-90"
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
                  className="inline-block bg-white text-indigo-600 px-10 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition-all shadow-lg"
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