




//rigght pannel correct last one 


// import { useState, useEffect, useCallback, useRef } from 'react';
// import axios from '../api/axios';

// import ProjectCard from '../components/ProjectCard';
// import { useAuth } from '../context/AuthContext';
// import { Link, useLocation } from 'react-router-dom';
// import FilterDropdown from '../components/FilterDropdown';
// import { motion, AnimatePresence } from 'framer-motion';
// import { FiPlus, FiSearch, FiX } from 'react-icons/fi';
// import { useNavigate } from 'react-router-dom';
// import {
//   FiGithub,
//   FiBook,
//   FiHeart,
//   FiShare2,
//   FiMessageSquare
// } from 'react-icons/fi';
// export default function Projects() {
//   const [projects, setProjects] = useState([]);
//   const [pagination, setPagination] = useState(null);
//   const [userProjects, setUserProjects] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('all');
//   const [sortBy, setSortBy] = useState('newest');
//   const { user } = useAuth();
//   const navigate=useNavigate()
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategories, setSelectedCategories] = useState([]);
//   const [selectedDifficulty, setSelectedDifficulty] = useState('');
//   const location = useLocation();
//   const [page, setPage] = useState(1);
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [isPanelOpen, setIsPanelOpen] = useState(false);
//   const observer = useRef();
//   const panelRef = useRef();
// const openPanel = (project) => {
//   // If clicking the same project that's already open, do nothing
//   if (selectedProject?._id === project._id && isPanelOpen) return;
  
//   setSelectedProject(project);
//   setIsPanelOpen(true);
// };

// // Close panel function:
// const closePanel = (e) => {
//   e?.stopPropagation();
//   setIsPanelOpen(false);
// };


//   useEffect(() => {
//     if (location.state?.showMineOnly) {
//       setActiveTab('my');
//     }
//   }, [location.state]);

//   const handleDelete = async (projectId) => {
//     if (!window.confirm('Are you sure you want to delete this project?')) return;

//     try {
//       await axios.delete(`/api/v1/projects/${projectId}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//       });
//       setProjects((prev) => prev.filter((p) => p._id !== projectId));
//       setUserProjects((prev) => prev.filter((p) => p._id !== projectId));
//       if (selectedProject?._id === projectId) {
//         closePanel();
//       }
//     } catch (err) {
//       console.error('Failed to delete project:', err);
//       alert('Failed to delete project.');
//     }
//   };

//   const handleProjectLike = (projectId, newLikeStatus, newLikeCount) => {
//     const updateProjectState = (prevProjects) =>
//       prevProjects.map((project) =>
//         project._id === projectId
//           ? {
//               ...project,
//               likes: newLikeStatus
//                 ? [...project.likes, user.id]
//                 : project.likes.filter((id) => id !== user.id),
//               likeCount: newLikeCount,
//             }
//           : project
//       );

//     setProjects(updateProjectState);
//     setUserProjects(updateProjectState);

//     if (selectedProject?._id === projectId) {
//       setSelectedProject((prev) => ({
//         ...prev,
//         likes: newLikeStatus
//           ? [...prev.likes, user.id]
//           : prev.likes.filter((id) => id !== user.id),
//         likeCount: newLikeCount,
//       }));
//     }
//   };

// const fetchProjects = useCallback(
//   async (pageNumber = 1, append = false) => {
//     try {
//       setLoading(true);
//       let url = `/api/v1/projects?limit=12&page=${pageNumber}`;

//       if (searchTerm) url += `&search=${searchTerm}`;
//       if (selectedCategories.length > 0)
//         url += `&category=${selectedCategories.join(',')}`;
//       if (selectedDifficulty) url += `&difficulty=${selectedDifficulty}`;
      
//       // Fix sorting parameters
//       if (sortBy === 'likes') url += `&sort=-likeCount`;
//       if (sortBy === 'newest') url += `&sort=-createdAt`;

//       const [allProjects, myProjects] = await Promise.all([
//         axios.get(url),
//         user
//           ? axios.get('/api/v1/projects/myprojects', {
//               headers: {
//                 Authorization: `Bearer ${localStorage.getItem('token')}`,
//               },
//             })
//           : { data: { data: [] } },
//       ]);

//       setProjects((prev) =>
//         append ? [...prev, ...allProjects.data.data] : allProjects.data.data
//       );
//       setPagination(allProjects.data.pagination);
//       setUserProjects(myProjects.data.data);
//       setPage(pageNumber);
//     } catch (error) {
//       console.error('Failed to fetch projects:', error);
//     } finally {
//       setLoading(false);
//     }
//   },
//   [user, sortBy, searchTerm, selectedCategories, selectedDifficulty]
// );

//   useEffect(() => {
//     fetchProjects(1);
//   }, [fetchProjects]);

//   const lastProjectRef = useCallback(
//     (node) => {
//       if (loading) return;
//       if (observer.current) observer.current.disconnect();
//       observer.current = new IntersectionObserver((entries) => {
//         if (
//           entries[0].isIntersecting &&
//           pagination?.next &&
//           activeTab === 'all'
//         ) {
//           fetchProjects(page + 1, true);
//         }
//       });
//       if (node) observer.current.observe(node);
//     },
//     [loading, pagination, page, fetchProjects, activeTab]
//   );

//   // const openPanel = (project) => {
//   //   setSelectedProject(project);
//   //   setIsPanelOpen(true);
//   //   document.body.style.overflow = 'hidden'; // Prevent scrolling when panel is open
//   // };

//   // const closePanel = () => {
//   //   setIsPanelOpen(false);
//   //   document.body.style.overflow = ''; // Re-enable scrolling
//   // };

//   let displayedProjects =
//     activeTab === 'all' ? [...projects] : [...userProjects];

//   if (selectedCategories.length > 0) {
//     displayedProjects = displayedProjects.filter((project) =>
//       selectedCategories.includes(project.category?.toLowerCase())
//     );
//   }

//   if (selectedDifficulty) {
//     displayedProjects = displayedProjects.filter(
//       (project) =>
//         project.difficulty?.toLowerCase() ===
//         selectedDifficulty.toLowerCase()
//     );
//   }

//   if (searchTerm.trim()) {
//     const lowerSearch = searchTerm.toLowerCase();
//     displayedProjects = displayedProjects.filter(
//       (project) =>
//         project.title.toLowerCase().includes(lowerSearch) ||
//         project.tags.some((tag) => tag.toLowerCase().includes(lowerSearch))
//     );
//   }

//   if (sortBy === 'newest') {
//     displayedProjects.sort(
//       (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//     );
//   } else if (sortBy === 'likes') {
//     displayedProjects.sort(
//       (a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)
//     );
//   }

//   return (
//      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
//     <div className={`max-w-7xl mx-auto ${isPanelOpen ? 'pr-[400px]' : ''} transition-all duration-300`}>
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
//         >
//           <div>
//             <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
//               {activeTab === 'all' ? 'Explore Projects' : 'My Projects'}
//             </h1>
//             <p className="text-lg text-gray-600">
//               {activeTab === 'all'
//                 ? 'Discover amazing student projects'
//                 : 'Manage your created projects'}
//             </p>
//           </div>

//           <motion.div
//             whileHover={{ scale: 1.02 }}
//             className="flex space-x-2 bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-sm mt-4 md:mt-0"
//           >
//             <button
//               onClick={() => setSortBy('newest')}
//               className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
//                 sortBy === 'newest'
//                   ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
//                   : 'text-gray-600 hover:bg-gray-100'
//               }`}
//             >
//               Newest
//             </button>
//             <button
//               onClick={() => setSortBy('likes')}
//               className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
//                 sortBy === 'likes'
//                   ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
//                   : 'text-gray-600 hover:bg-gray-100'
//               }`}
//             >
//               Most Liked
//             </button>
//           </motion.div>
//         </motion.div>

//         <div className="flex border-b border-gray-200/50 mb-8">
//           <button
//             className={`px-6 py-3 font-medium text-sm relative ${
//               activeTab === 'all'
//                 ? 'text-indigo-600'
//                 : 'text-gray-500 hover:text-gray-700'
//             }`}
//             onClick={() => setActiveTab('all')}
//           >
//             All Projects
//             {activeTab === 'all' && (
//               <motion.span
//                 layoutId="underline"
//                 className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
//                 transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
//               />
//             )}
//           </button>
//           {user && (
//             <button
//               className={`px-6 py-3 font-medium text-sm relative ${
//                 activeTab === 'my'
//                   ? 'text-indigo-600'
//                   : 'text-gray-500 hover:text-gray-700'
//               }`}
//               onClick={() => setActiveTab('my')}
//             >
//               My Projects
//               {activeTab === 'my' && (
//                 <motion.span
//                   layoutId="underline"
//                   className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
//                   transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
//                 />
//               )}
//             </button>
//           )}
//         </div>

//         <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
//           <motion.div whileHover={{ scale: 1.01 }} className="relative flex-1">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <FiSearch className="h-5 w-5 text-gray-400" />
//             </div>
//             <input
//               type="text"
//               placeholder="Search by title or tags..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//             />
//           </motion.div>

//           <FilterDropdown
//             selectedCategories={selectedCategories}
//             setSelectedCategories={setSelectedCategories}
//             selectedDifficulty={selectedDifficulty}
//             setSelectedDifficulty={setSelectedDifficulty}
//           />
//         </div>

//           <AnimatePresence>
//           {displayedProjects.length > 0 ? (
//             <div className={`grid grid-cols-1 ${isPanelOpen ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-8`}>
//               {displayedProjects.map((project, idx) => {
//                 const isLast = idx === displayedProjects.length - 1;
//                 return (
//                   <motion.div
//                     key={project._id}
//                     layout
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, scale: 0.9 }}
//                     transition={{ duration: 0.3 }}
//                     whileHover={{ y: -5 }}
//                     ref={isLast && activeTab === 'all' ? lastProjectRef : null}
//                   >
//                     <ProjectCard
//                       project={project}
//                       onLike={handleProjectLike}
//                       onDelete={handleDelete}
//                       isMyProject={activeTab === 'my'}
//                       onClick={() => openPanel(project)}
//                     />
//                   </motion.div>
//                 );
//               })}
//             </div>
//           ) : (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.5 }}
//               className="col-span-3 text-center py-16"
//             >
//               <div className="mx-auto h-32 w-32 text-gray-300 mb-4">
//                 <svg
//                   className="w-full h-full"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={1}
//                     d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                   />
//                 </svg>
//               </div>
//               <h3 className="text-xl font-medium text-gray-700 mb-2">
//                 {activeTab === 'all'
//                   ? 'No projects found'
//                   : 'No projects created yet'}
//               </h3>
//               <p className="text-gray-500 max-w-md mx-auto">
//                 {activeTab === 'all'
//                   ? 'Be the first to create a project!'
//                   : 'Start by creating your first project'}
//               </p>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {user && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="mt-12 text-center"
//           >
//             <Link
//               to="/projects/create"
//               className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all hover:from-indigo-700 hover:to-purple-700"
//             >
//               <FiPlus className="mr-2" />
//               Create New Project
//             </Link>
//           </motion.div>
//         )}
//       </div>

//       {/* Overlay when panel is open */}
   

//       {/* Project Detail Panel */}
//  <AnimatePresence>
//         {isPanelOpen && (
//           <motion.div
//             key={selectedProject?._id || 'panel'} // Key ensures re-animation
//             initial={{ x: '100%' }}
//             animate={{ x: 0 }}
//             exit={{ x: '100%' }}
//             transition={{
//               type: 'spring',
//               damping: 20,
//               stiffness: 150,
//               mass: 0.5,
//               restDelta: 0.001
//             }}
//             className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-20 overflow-y-auto border-l border-gray-200"
//             style={{ boxShadow: '-4px 0 15px rgba(0,0,0,0.1)' }}
//             ref={panelRef}
//           >
         
//             {selectedProject && (
//               <div className="p-6 h-full flex flex-col">
//               <div className="flex justify-between items-start mb-6">
//                 <h2 className="text-2xl font-bold text-gray-900">
//                   {selectedProject.title}
//                 </h2>
//                 <motion.button
//                   whileHover={{ rotate: 90, scale: 1.1 }}
//                   whileTap={{ scale: 0.9 }}
//                   onClick={closePanel}
//                   className="text-indigo-500 hover:text-indigo-700 p-1"
//                   aria-label="Close panel"
//                 >
//                   <FiX className="h-6 w-6" />
//                 </motion.button>
//               </div>

//               <div className="flex flex-wrap gap-2 mb-6">
//                 <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-medium">
//                   {selectedProject.category}
//                 </span>
//                 <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
//                   {
//                     beginner: 'bg-emerald-100 text-emerald-800',
//                     intermediate: 'bg-amber-100 text-amber-800',
//                     advanced: 'bg-rose-100 text-rose-800'
//                   }[selectedProject.difficulty?.toLowerCase()] || 'bg-emerald-100 text-emerald-800'
//                 }`}>
//                   {selectedProject.difficulty}
//                 </span>
//               </div>

//               <div className="prose max-w-none mb-6 flex-grow overflow-y-auto">
//                 <h4 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">
//                   Description
//                 </h4>
//                 <p className="text-gray-700 whitespace-pre-line mb-6">
//                   {selectedProject.description}
//                 </p>

//                 {selectedProject.tags?.length > 0 && (
//                   <div className="mb-6">
//                     <h4 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">
//                       Tags
//                     </h4>
//                     <div className="flex flex-wrap gap-2">
//                       {selectedProject.tags.map(tag => (
//                         <span key={tag} className="inline-block bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full">
//                           {tag}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {(selectedProject.githubUrl || selectedProject.documentationUrl) && (
//                   <div className="mb-6">
//                     <h4 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">
//                       Links
//                     </h4>
//                     <div className="space-y-2">
//                       {selectedProject.githubUrl && (
//                         <a 
//                           href={selectedProject.githubUrl} 
//                           target="_blank" 
//                           rel="noopener noreferrer"
//                           className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
//                         >
//                           <FiGithub className="mr-2" /> GitHub Repository
//                         </a>
//                       )}
//                       {selectedProject.documentationUrl && (
//                         <a 
//                           href={selectedProject.documentationUrl} 
//                           target="_blank" 
//                           rel="noopener noreferrer"
//                           className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
//                         >
//                           <FiBook className="mr-2" /> Project Documentation
//                         </a>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="pt-4 border-t border-indigo-100 mt-auto">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-gray-700">
//                       By {selectedProject.createdBy?.name || 'Unknown'}
//                     </p>
//                     <p className="text-xs text-gray-500">
//                       {new Date(selectedProject.createdAt).toLocaleDateString('en-US', {
//                         year: 'numeric',
//                         month: 'short',
//                         day: 'numeric'
//                       })}
//                     </p>
//                   </div>
                  
//                   <div className="flex items-center space-x-4">
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         const newIsLiked = !selectedProject.likes.includes(user.id);
//                         const newLikeCount = newIsLiked ? selectedProject.likeCount + 1 : selectedProject.likeCount - 1;
//                         handleProjectLike(selectedProject._id, newIsLiked, newLikeCount);
//                       }}
//                       disabled={!user}
//                       className={`flex items-center space-x-1 transition-colors ${
//                         selectedProject.likes.includes(user?.id) 
//                           ? 'text-rose-500' 
//                           : 'text-gray-400 hover:text-rose-500'
//                       } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
//                     >
//                       <FiHeart className={`h-5 w-5 ${
//                         selectedProject.likes.includes(user?.id) ? 'fill-current' : ''
//                       }`} />
//                       <span className="text-sm font-medium">
//                         {selectedProject.likeCount}
//                       </span>
//                     </button>
                    
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         if (navigator.share) {
//                           navigator.share({
//                             title: selectedProject.title,
//                             text: selectedProject.description,
//                             url: `${window.location.origin}/projects/${selectedProject._id}`,
//                           });
//                         } else {
//                           navigator.clipboard.writeText(
//                             `${window.location.origin}/projects/${selectedProject._id}`
//                           );
//                           alert('Link copied to clipboard!');
//                         }
//                       }}
//                       className="text-indigo-500 hover:text-indigo-700 transition-colors"
//                     >
//                       <FiShare2 className="h-5 w-5" />
//                     </button>
                    
//                     {user && (
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           navigate(`/chat/${selectedProject._id}/${user._id}`);
//                         }}
//                         className="text-emerald-500 hover:text-emerald-700 transition-colors"
//                       >
//                         <FiMessageSquare className="h-5 w-5" />
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//             )}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }




























// import { useState, useEffect, useCallback, useRef } from 'react';
// import axios from '../api/axios';
// import ProjectCard from '../components/ProjectCard';
// import { useAuth } from '../context/AuthContext';
// import { Link, useLocation } from 'react-router-dom';
// import FilterDropdown from '../components/FilterDropdown';
// import { motion, AnimatePresence } from 'framer-motion';
// import { FiPlus, FiSearch, FiX } from 'react-icons/fi';

// export default function Projects() {
//   const [projects, setProjects] = useState([]);
//   const [pagination, setPagination] = useState(null);
//   const [userProjects, setUserProjects] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('all');
//   const [sortBy, setSortBy] = useState('newest');
//   const { user } = useAuth();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategories, setSelectedCategories] = useState([]);
//   const [selectedDifficulty, setSelectedDifficulty] = useState('');
//   const location = useLocation();
//   const [page, setPage] = useState(1);
//   const [selectedProject, setSelectedProject] = useState(null);
//   const observer = useRef();
  
//   useEffect(() => {
//     if (location.state?.showMineOnly) {
//       setActiveTab('my');
//     }
//   }, [location.state]);
   

//   const handleProjectSelect = (project) => {
//     if (selectedProject?._id === project._id) {
//       setSelectedProject(null);
//     } else {
//       setSelectedProject(project);
//       document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
//     }
//   };

//   const handleCloseProject = () => {
//     setSelectedProject(null);
//     document.body.style.overflow = 'auto'; // Re-enable scrolling
//   };

//   // Add keyboard escape handler
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.key === 'Escape' && selectedProject) {
//         handleCloseProject();
//       }
//     };
//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [selectedProject]);


//   const handleDelete = async (projectId) => {
//     if (!window.confirm('Are you sure you want to delete this project?')) return;

//     try {
//       await axios.delete(`/api/v1/projects/${projectId}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//       });
//       setProjects((prev) => prev.filter((p) => p._id !== projectId));
//       setUserProjects((prev) => prev.filter((p) => p._id !== projectId));
//       if (selectedProject?._id === projectId) {
//         setSelectedProject(null);
//       }
//     } catch (err) {
//       console.error('Failed to delete project:', err);
//       alert('Failed to delete project.');
//     }
//   };

//   const handleProjectLike = (projectId, newLikeStatus, newLikeCount) => {
//     const updateProject = (project) => 
//       project._id === projectId
//         ? {
//             ...project,
//             likes: newLikeStatus
//               ? [...project.likes, user.id]
//               : project.likes.filter((id) => id !== user.id),
//             likeCount: newLikeCount,
//           }
//         : project;

//     setProjects(prev => prev.map(updateProject));
//     setUserProjects(prev => prev.map(updateProject));
//     if (selectedProject?._id === projectId) {
//       setSelectedProject(updateProject(selectedProject));
//     }
//   };

//   const fetchProjects = useCallback(
//     async (pageNumber = 1, append = false) => {
//       try {
//         setLoading(true);
//         let url = `/api/v1/projects?limit=12&page=${pageNumber}`;

//         if (searchTerm) url += `&search=${searchTerm}`;
//         if (selectedCategories.length > 0)
//           url += `&category=${selectedCategories.join(',')}`;
//         if (selectedDifficulty) url += `&difficulty=${selectedDifficulty}`;
//         if (sortBy === 'likes') url += `&sort=likes`;

//         const [allProjects, myProjects] = await Promise.all([
//           axios.get(url),
//           user
//             ? axios.get('/api/v1/projects/myprojects', {
//                 headers: {
//                   Authorization: `Bearer ${localStorage.getItem('token')}`,
//                 },
//               })
//             : { data: { data: [] } },
//         ]);

//         setProjects((prev) =>
//           append ? [...prev, ...allProjects.data.data] : allProjects.data.data
//         );
//         setPagination(allProjects.data.pagination);
//         setUserProjects(myProjects.data.data);
//         setPage(pageNumber);
//       } catch (error) {
//         console.error('Failed to fetch projects:', error);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [user, sortBy, searchTerm, selectedCategories, selectedDifficulty]
//   );

//   useEffect(() => {
//     fetchProjects(1);
//   }, [fetchProjects]);

//   const lastProjectRef = useCallback(
//     (node) => {
//       if (loading || selectedProject) return;
//       if (observer.current) observer.current.disconnect();
//       observer.current = new IntersectionObserver((entries) => {
//         if (
//           entries[0].isIntersecting &&
//           pagination?.next &&
//           activeTab === 'all'
//         ) {
//           fetchProjects(page + 1, true);
//         }
//       });
//       if (node) observer.current.observe(node);
//     },
//     [loading, pagination, page, fetchProjects, activeTab, selectedProject]
//   );

//   let displayedProjects =
//     activeTab === 'all' ? [...projects] : [...userProjects];

//   if (selectedCategories.length > 0) {
//     displayedProjects = displayedProjects.filter((project) =>
//       selectedCategories.includes(project.category?.toLowerCase())
//     );
//   }

//   if (selectedDifficulty) {
//     displayedProjects = displayedProjects.filter(
//       (project) =>
//         project.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase()
//     );
//   }

//   if (searchTerm.trim()) {
//     const lowerSearch = searchTerm.toLowerCase();
//     displayedProjects = displayedProjects.filter(
//       (project) =>
//         project.title.toLowerCase().includes(lowerSearch) ||
//         project.tags.some((tag) => tag.toLowerCase().includes(lowerSearch))
//     );
//   }

//   if (sortBy === 'newest') {
//     displayedProjects.sort(
//       (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//     );
//   } else if (sortBy === 'likes') {
//     displayedProjects.sort(
//       (a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)
//     );
//   }

//   // const handleProjectSelect = (project) => {
//   //   setSelectedProject(selectedProject?._id === project._id ? null : project);
//   // };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
//         >
//           <div>
//             <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
//               {activeTab === 'all' ? 'Explore Projects' : 'My Projects'}
//             </h1>
//             <p className="text-lg text-gray-600">
//               {activeTab === 'all'
//                 ? 'Discover amazing student projects'
//                 : 'Manage your created projects'}
//             </p>
//           </div>

//           <motion.div
//             whileHover={{ scale: 1.02 }}
//             className="flex space-x-2 bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-sm mt-4 md:mt-0"
//           >
//             <button
//               onClick={() => setSortBy('newest')}
//               className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
//                 sortBy === 'newest'
//                   ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
//                   : 'text-gray-600 hover:bg-gray-100'
//               }`}
//             >
//               Newest
//             </button>
//             <button
//               onClick={() => setSortBy('likes')}
//               className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
//                 sortBy === 'likes'
//                   ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
//                   : 'text-gray-600 hover:bg-gray-100'
//               }`}
//             >
//               Most Liked
//             </button>
//           </motion.div>
//         </motion.div>

//         <div className="flex border-b border-gray-200/50 mb-8">
//           <button
//             className={`px-6 py-3 font-medium text-sm relative ${
//               activeTab === 'all'
//                 ? 'text-indigo-600'
//                 : 'text-gray-500 hover:text-gray-700'
//             }`}
//             onClick={() => {
//               setActiveTab('all');
//               setSelectedProject(null);
//             }}
//           >
//             All Projects
//             {activeTab === 'all' && (
//               <motion.span
//                 layoutId="underline"
//                 className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
//                 transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
//               />
//             )}
//           </button>
//           {user && (
//             <button
//               className={`px-6 py-3 font-medium text-sm relative ${
//                 activeTab === 'my'
//                   ? 'text-indigo-600'
//                   : 'text-gray-500 hover:text-gray-700'
//               }`}
//               onClick={() => {
//                 setActiveTab('my');
//                 setSelectedProject(null);
//               }}
//             >
//               My Projects
//               {activeTab === 'my' && (
//                 <motion.span
//                   layoutId="underline"
//                   className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
//                   transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
//                 />
//               )}
//             </button>
//           )}
//         </div>

//         <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
//           <motion.div 
//             whileHover={{ scale: 1.01 }} 
//             className="relative flex-1"
//             layout
//           >
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <FiSearch className="h-5 w-5 text-gray-400" />
//             </div>
//             <input
//               type="text"
//               placeholder="Search by title or tags..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//             />
//           </motion.div>

//           <FilterDropdown
//             selectedCategories={selectedCategories}
//             setSelectedCategories={setSelectedCategories}
//             selectedDifficulty={selectedDifficulty}
//             setSelectedDifficulty={setSelectedDifficulty}
//           />
//         </div>

//      <AnimatePresence mode="wait">
//           {displayedProjects.length > 0 ? (
//             <div className="relative">
//               {/* Overlay for selected project */}
//               <AnimatePresence>
//                 {selectedProject && (
//                   <>
//                     <motion.div
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       exit={{ opacity: 0 }}
//                       transition={{ duration: 0.3 }}
//                       className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20"
//                       onClick={handleCloseProject}
//                     />
                    
//                     <motion.div
//                       key="selected-project"
//                       layoutId={`project-${selectedProject._id}`}
//                       initial={{ opacity: 0, scale: 0.9 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       exit={{ opacity: 0, scale: 0.9 }}
//                       transition={{ 
//                         type: "spring",
//                         damping: 25,
//                         stiffness: 300
//                       }}
//                       className="fixed inset-0 flex items-center justify-center p-4 z-30"
//                     >
//                       <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//                         <button
//                           onClick={handleCloseProject}
//                           className="absolute -top-10 right-0 z-40 p-2 text-white hover:text-indigo-200 transition-colors"
//                           aria-label="Close project view"
//                         >
//                           <FiX className="h-6 w-6" />
//                         </button>
//                         <ProjectCard
//                           project={selectedProject}
//                           onLike={handleProjectLike}
//                           onDelete={handleDelete}
//                           isMyProject={activeTab === 'my'}
//                           expanded={true}
//                           onClose={handleCloseProject}
//                         />
//                       </div>
//                     </motion.div>
//                   </>
//                 )}
//               </AnimatePresence>

//               {/* Projects Grid */}
//               <motion.div
//                 layout
//                 className={`grid gap-6 ${
//                   selectedProject
//                     ? 'opacity-50 pointer-events-none'
//                     : 'opacity-100'
//                 } transition-opacity duration-300 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}
//               >
//                 {displayedProjects.map((project, idx) => {
//                   const isLast = idx === displayedProjects.length - 1;
//                   return (
//                     <motion.div
//                       key={project._id}
//                       layoutId={`project-${project._id}`}
//                       initial={{ opacity: 0, scale: 0.9 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       exit={{ opacity: 0, scale: 0.9 }}
//                       transition={{ duration: 0.3 }}
//                       whileHover={{ 
//                         y: -5,
//                         boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
//                       }}
//                       className="relative"
//                       ref={isLast && activeTab === 'all' && !selectedProject ? lastProjectRef : null}
//                     >
//                       <ProjectCard
//                         project={project}
//                         onLike={handleProjectLike}
//                         onDelete={handleDelete}
//                         isMyProject={activeTab === 'my'}
//                         onClick={() => handleProjectSelect(project)}
//                       />
//                     </motion.div>
//                   );
//                 })}
//               </motion.div>
//             </div>
//           ) : (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.5 }}
//               className="col-span-3 text-center py-16"
//             >
//               <div className="mx-auto h-32 w-32 text-gray-300 mb-4">
//                 <svg
//                   className="w-full h-full"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={1}
//                     d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                   />
//                 </svg>
//               </div>
//               <h3 className="text-xl font-medium text-gray-700 mb-2">
//                 {activeTab === 'all'
//                   ? 'No projects found'
//                   : 'No projects created yet'}
//               </h3>
//               <p className="text-gray-500 max-w-md mx-auto">
//                 {activeTab === 'all'
//                   ? 'Be the first to create a project!'
//                   : 'Start by creating your first project'}
//               </p>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {user && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="mt-12 text-center"
//           >
//             <Link
//               to="/projects/create"
//               className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all hover:from-indigo-700 hover:to-purple-700"
//             >
//               <FiPlus className="mr-2" />
//               Create New Project
//             </Link>
//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// }













// import { useState, useEffect, useCallback, useRef } from 'react';
// import axios from '../api/axios';
// import ProjectCard from '../components/ProjectCard';
// import { useAuth } from '../context/AuthContext';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import FilterDropdown from '../components/FilterDropdown';
// import { motion, AnimatePresence } from 'framer-motion';
// import { FiPlus, FiSearch, FiX, FiMessageSquare, FiHeart, FiShare2, FiGithub, FiBook } from 'react-icons/fi';

// export default function Projects() {
//   const [projects, setProjects] = useState([]);
//   const [pagination, setPagination] = useState(null);
//   const [userProjects, setUserProjects] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('all');
//   const [sortBy, setSortBy] = useState('newest');
//   const { user } = useAuth();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategories, setSelectedCategories] = useState([]);
//   const [selectedDifficulty, setSelectedDifficulty] = useState('');
//   const location = useLocation();
//   const [page, setPage] = useState(1);
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [isPanelOpen, setIsPanelOpen] = useState(false);
//   const observer = useRef();
//   const panelRef = useRef();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (location.state?.showMineOnly) {
//       setActiveTab('my');
//     }
//   }, [location.state]);

//   const openPanel = (project) => {
//     setSelectedProject(project);
//     setIsPanelOpen(true);
//   };

//   const closePanel = (e) => {
//     e?.stopPropagation();
//     setIsPanelOpen(false);
//   };

//   const handleDelete = async (projectId) => {
//     if (!window.confirm('Are you sure you want to delete this project?')) return;

//     try {
//       await axios.delete(`/api/v1/projects/${projectId}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//       });
//       setProjects((prev) => prev.filter((p) => p._id !== projectId));
//       setUserProjects((prev) => prev.filter((p) => p._id !== projectId));
//       if (selectedProject?._id === projectId) {
//         closePanel();
//       }
//     } catch (err) {
//       console.error('Failed to delete project:', err);
//       alert('Failed to delete project.');
//     }
//   };

//   const handleProjectLike = (projectId, newLikeStatus, newLikeCount) => {
//     const updateProjectState = (prevProjects) =>
//       prevProjects.map((project) =>
//         project._id === projectId
//           ? {
//               ...project,
//               likes: newLikeStatus
//                 ? [...project.likes, user.id]
//                 : project.likes.filter((id) => id !== user.id),
//               likeCount: newLikeCount,
//             }
//           : project
//       );

//     setProjects(updateProjectState);
//     setUserProjects(updateProjectState);

//     if (selectedProject?._id === projectId) {
//       setSelectedProject((prev) => ({
//         ...prev,
//         likes: newLikeStatus
//           ? [...prev.likes, user.id]
//           : prev.likes.filter((id) => id !== user.id),
//         likeCount: newLikeCount,
//       }));
//     }
//   };

//   const fetchProjects = useCallback(
//     async (pageNumber = 1, append = false) => {
//       try {
//         setLoading(true);
//         let url = `/api/v1/projects?limit=12&page=${pageNumber}`;

//         if (searchTerm) url += `&search=${searchTerm}`;
//         if (selectedCategories.length > 0)
//           url += `&category=${selectedCategories.join(',')}`;
//         if (selectedDifficulty) url += `&difficulty=${selectedDifficulty}`;
//         if (sortBy === 'likes') url += `&sort=-likeCount`;
//         if (sortBy === 'newest') url += `&sort=-createdAt`;

//         const [allProjects, myProjects] = await Promise.all([
//           axios.get(url),
//           user
//             ? axios.get('/api/v1/projects/myprojects', {
//                 headers: {
//                   Authorization: `Bearer ${localStorage.getItem('token')}`,
//                 },
//               })
//             : { data: { data: [] } },
//         ]);

//         setProjects((prev) =>
//           append ? [...prev, ...allProjects.data.data] : allProjects.data.data
//         );
//         setPagination(allProjects.data.pagination);
//         setUserProjects(myProjects.data.data);
//         setPage(pageNumber);
//       } catch (error) {
//         console.error('Failed to fetch projects:', error);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [user, sortBy, searchTerm, selectedCategories, selectedDifficulty]
//   );

//   useEffect(() => {
//     fetchProjects(1);
//   }, [fetchProjects]);

//   const lastProjectRef = useCallback(
//     (node) => {
//       if (loading) return;
//       if (observer.current) observer.current.disconnect();
//       observer.current = new IntersectionObserver((entries) => {
//         if (
//           entries[0].isIntersecting &&
//           pagination?.next &&
//           activeTab === 'all'
//         ) {
//           fetchProjects(page + 1, true);
//         }
//       });
//       if (node) observer.current.observe(node);
//     },
//     [loading, pagination, page, fetchProjects, activeTab]
//   );

//   let displayedProjects =
//     activeTab === 'all' ? [...projects] : [...userProjects];

//   if (selectedCategories.length > 0) {
//     displayedProjects = displayedProjects.filter((project) =>
//       selectedCategories.includes(project.category?.toLowerCase())
//     );
//   }

//   if (selectedDifficulty) {
//     displayedProjects = displayedProjects.filter(
//       (project) =>
//         project.difficulty?.toLowerCase() ===
//         selectedDifficulty.toLowerCase()
//     );
//   }

//   if (searchTerm.trim()) {
//     const lowerSearch = searchTerm.toLowerCase();
//     displayedProjects = displayedProjects.filter(
//       (project) =>
//         project.title.toLowerCase().includes(lowerSearch) ||
//         project.tags.some((tag) => tag.toLowerCase().includes(lowerSearch))
//     );
//   }

//   if (sortBy === 'newest') {
//     displayedProjects.sort(
//       (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//     );
//   } else if (sortBy === 'likes') {
//     displayedProjects.sort(
//       (a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className={`max-w-7xl mx-auto ${isPanelOpen ? 'pr-[400px]' : ''} transition-all duration-300`}>
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
//         >
//           <div>
//             <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
//               {activeTab === 'all' ? 'Explore Projects' : 'My Projects'}
//             </h1>
//             <p className="text-lg text-gray-600">
//               {activeTab === 'all'
//                 ? 'Discover amazing student projects'
//                 : 'Manage your created projects'}
//             </p>
//           </div>

//           <motion.div
//             whileHover={{ scale: 1.02 }}
//             className="flex space-x-2 bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-sm mt-4 md:mt-0"
//           >
//             <button
//               onClick={() => setSortBy('newest')}
//               className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
//                 sortBy === 'newest'
//                   ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
//                   : 'text-gray-600 hover:bg-gray-100'
//               }`}
//             >
//               Newest
//             </button>
//             <button
//               onClick={() => setSortBy('likes')}
//               className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
//                 sortBy === 'likes'
//                   ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
//                   : 'text-gray-600 hover:bg-gray-100'
//               }`}
//             >
//               Most Liked
//             </button>
//           </motion.div>
//         </motion.div>

//         <div className="flex border-b border-gray-200/50 mb-8">
//           <button
//             className={`px-6 py-3 font-medium text-sm relative ${
//               activeTab === 'all'
//                 ? 'text-indigo-600'
//                 : 'text-gray-500 hover:text-gray-700'
//             }`}
//             onClick={() => setActiveTab('all')}
//           >
//             All Projects
//             {activeTab === 'all' && (
//               <motion.span
//                 layoutId="underline"
//                 className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
//                 transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
//               />
//             )}
//           </button>
//           {user && (
//             <button
//               className={`px-6 py-3 font-medium text-sm relative ${
//                 activeTab === 'my'
//                   ? 'text-indigo-600'
//                   : 'text-gray-500 hover:text-gray-700'
//               }`}
//               onClick={() => setActiveTab('my')}
//             >
//               My Projects
//               {activeTab === 'my' && (
//                 <motion.span
//                   layoutId="underline"
//                   className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
//                   transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
//                 />
//               )}
//             </button>
//           )}
//         </div>

//         <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
//           <motion.div whileHover={{ scale: 1.01 }} className="relative flex-1">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <FiSearch className="h-5 w-5 text-gray-400" />
//             </div>
//             <input
//               type="text"
//               placeholder="Search by title or tags..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//             />
//           </motion.div>

//           <FilterDropdown
//             selectedCategories={selectedCategories}
//             setSelectedCategories={setSelectedCategories}
//             selectedDifficulty={selectedDifficulty}
//             setSelectedDifficulty={setSelectedDifficulty}
//           />
//         </div>

//         <AnimatePresence>
//           {displayedProjects.length > 0 ? (
//             <div className={`grid grid-cols-1 ${isPanelOpen ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-8`}>
//               {displayedProjects.map((project, idx) => {
//                 const isLast = idx === displayedProjects.length - 1;
//                 return (
//                   <motion.div
//                     key={project._id}
//                     layout
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, scale: 0.9 }}
//                     transition={{ duration: 0.3 }}
//                     whileHover={{ y: -5 }}
//                     ref={isLast && activeTab === 'all' ? lastProjectRef : null}
//                   >
//                     <ProjectCard
//                       project={project}
//                       onLike={handleProjectLike}
//                       onDelete={handleDelete}
//                       isMyProject={activeTab === 'my'}
//                       onClick={() => openPanel(project)}
//                     />
//                   </motion.div>
//                 );
//               })}
//             </div>
//           ) : (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.5 }}
//               className="col-span-3 text-center py-16"
//             >
//               <div className="mx-auto h-32 w-32 text-gray-300 mb-4">
//                 <svg
//                   className="w-full h-full"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={1}
//                     d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                   />
//                 </svg>
//               </div>
//               <h3 className="text-xl font-medium text-gray-700 mb-2">
//                 {activeTab === 'all'
//                   ? 'No projects found'
//                   : 'No projects created yet'}
//               </h3>
//               <p className="text-gray-500 max-w-md mx-auto">
//                 {activeTab === 'all'
//                   ? 'Be the first to create a project!'
//                   : 'Start by creating your first project'}
//               </p>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {user && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="mt-12 text-center"
//           >
//             <Link
//               to="/projects/create"
//               className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all hover:from-indigo-700 hover:to-purple-700"
//             >
//               <FiPlus className="mr-2" />
//               Create New Project
//             </Link>
//           </motion.div>
//         )}
//       </div>

//       {/* Project Detail Panel */}
//       <AnimatePresence>
//         {isPanelOpen && (
//           <motion.div
//             key={selectedProject?._id || 'panel'}
//             initial={{ x: '100%' }}
//             animate={{ x: 0 }}
//             exit={{ x: '100%' }}
//             transition={{
//               type: 'spring',
//               damping: 20,
//               stiffness: 150,
//               mass: 0.5,
//               restDelta: 0.001
//             }}
//             className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-20 overflow-y-auto border-l border-gray-200"
//             style={{ boxShadow: '-4px 0 15px rgba(0,0,0,0.1)' }}
//             ref={panelRef}
//           >
//             {selectedProject && (
//               <div className="p-6 h-full flex flex-col">
//                 <div className="flex justify-between items-start mb-6">
//                   <h2 className="text-2xl font-bold text-gray-900">
//                     {selectedProject.title}
//                   </h2>
//                   <motion.button
//                     whileHover={{ rotate: 90, scale: 1.1 }}
//                     whileTap={{ scale: 0.9 }}
//                     onClick={closePanel}
//                     className="text-indigo-500 hover:text-indigo-700 p-1"
//                     aria-label="Close panel"
//                   >
//                     <FiX className="h-6 w-6" />
//                   </motion.button>
//                 </div>

//                 <div className="flex flex-wrap gap-2 mb-6">
//                   <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-medium">
//                     {selectedProject.category}
//                   </span>
//                   <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
//                     {
//                       beginner: 'bg-emerald-100 text-emerald-800',
//                       intermediate: 'bg-amber-100 text-amber-800',
//                       advanced: 'bg-rose-100 text-rose-800'
//                     }[selectedProject.difficulty?.toLowerCase()] || 'bg-emerald-100 text-emerald-800'
//                   }`}>
//                     {selectedProject.difficulty}
//                   </span>
//                 </div>

//                 <div className="prose max-w-none mb-6 flex-grow overflow-y-auto">
//                   <h4 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">
//                     Description
//                   </h4>
//                   <p className="text-gray-700 whitespace-pre-line mb-6">
//                     {selectedProject.description}
//                   </p>

//                   {selectedProject.tags?.length > 0 && (
//                     <div className="mb-6">
//                       <h4 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">
//                         Tags
//                       </h4>
//                       <div className="flex flex-wrap gap-2">
//                         {selectedProject.tags.map(tag => (
//                           <span key={tag} className="inline-block bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full">
//                             {tag}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {(selectedProject.githubUrl || selectedProject.documentationUrl) && (
//                     <div className="mb-6">
//                       <h4 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">
//                         Links
//                       </h4>
//                       <div className="space-y-2">
//                         {selectedProject.githubUrl && (
//                           <a 
//                             href={selectedProject.githubUrl} 
//                             target="_blank" 
//                             rel="noopener noreferrer"
//                             className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
//                           >
//                             <FiGithub className="mr-2" /> GitHub Repository
//                           </a>
//                         )}
//                         {selectedProject.documentationUrl && (
//                           <a 
//                             href={selectedProject.documentationUrl} 
//                             target="_blank" 
//                             rel="noopener noreferrer"
//                             className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
//                           >
//                             <FiBook className="mr-2" /> Project Documentation
//                           </a>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <div className="pt-4 border-t border-gray-200 mt-auto">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm font-medium text-gray-700">
//                         By {selectedProject.createdBy?.name || 'Unknown'}
//                       </p>
//                       <p className="text-xs text-gray-500">
//                         {new Date(selectedProject.createdAt).toLocaleDateString('en-US', {
//                           year: 'numeric',
//                           month: 'short',
//                           day: 'numeric'
//                         })}
//                       </p>
//                     </div>
                    
//                     <div className="flex items-center space-x-4">
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           const newIsLiked = !selectedProject.likes.includes(user.id);
//                           const newLikeCount = newIsLiked ? selectedProject.likeCount + 1 : selectedProject.likeCount - 1;
//                           handleProjectLike(selectedProject._id, newIsLiked, newLikeCount);
//                         }}
//                         disabled={!user}
//                         className={`flex items-center space-x-1 transition-colors ${
//                           selectedProject.likes.includes(user?.id) 
//                             ? 'text-rose-500' 
//                             : 'text-gray-400 hover:text-rose-500'
//                         } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
//                       >
//                         <FiHeart className={`h-5 w-5 ${
//                           selectedProject.likes.includes(user?.id) ? 'fill-current' : ''
//                         }`} />
//                         <span className="text-sm font-medium">
//                           {selectedProject.likeCount}
//                         </span>
//                       </button>
                      
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           if (navigator.share) {
//                             navigator.share({
//                               title: selectedProject.title,
//                               text: selectedProject.description,
//                               url: `${window.location.origin}/projects/${selectedProject._id}`,
//                             });
//                           } else {
//                             navigator.clipboard.writeText(
//                               `${window.location.origin}/projects/${selectedProject._id}`
//                             );
//                             alert('Link copied to clipboard!');
//                           }
//                         }}
//                         className="text-indigo-500 hover:text-indigo-700 transition-colors"
//                       >
//                         <FiShare2 className="h-5 w-5" />
//                       </button>
                      
//                      {user && (
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             navigate(`/chat/${selectedProject._id}/${user._id}`);
//                           }}
//                           className="text-emerald-500 hover:text-emerald-700 transition-colors"
//                         >
//                           <FiMessageSquare className="h-5 w-5" />
//                         </button>
                    

//                      )} 
                      
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }




















//corrected with all without chat option


import { useState, useEffect, useCallback, useRef } from 'react';
import axios from '../api/axios';
import ProjectCard from '../components/ProjectCard';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import FilterDropdown from '../components/FilterDropdown';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiSearch, FiX, FiMessageSquare, FiHeart, FiShare2, FiGithub, FiBook } from 'react-icons/fi';
import { useLoading } from '../context/LoadingContext';
import LoadingSpinner from '../components/LoadingSpinner';
export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [userProjects, setUserProjects] = useState([]);
  //const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const observer = useRef();
  const panelRef = useRef();
  const navigate = useNavigate();
 const { setLoading } = useLoading();
  useEffect(() => {
    if (location.state?.showMineOnly) {
      setActiveTab('my');
    }
  }, [location.state]);

  const openPanel = (project) => {
    setSelectedProject(project);
    setIsPanelOpen(true);
  };

  const closePanel = (e) => {
    e?.stopPropagation();
    setIsPanelOpen(false);
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await axios.delete(`/api/v1/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
      setUserProjects((prev) => prev.filter((p) => p._id !== projectId));
      if (selectedProject?._id === projectId) {
        closePanel();
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
      alert('Failed to delete project.');
    }
  };

  const handleProjectLike = (projectId, newLikeStatus, newLikeCount) => {
    const updateProjectState = (prevProjects) =>
      prevProjects.map((project) =>
        project._id === projectId
          ? {
              ...project,
              likes: newLikeStatus
                ? [...project.likes, user.id]
                : project.likes.filter((id) => id !== user.id),
              likeCount: newLikeCount,
            }
          : project
      );

    setProjects(updateProjectState);
    setUserProjects(updateProjectState);

    if (selectedProject?._id === projectId) {
      setSelectedProject((prev) => ({
        ...prev,
        likes: newLikeStatus
          ? [...prev.likes, user.id]
          : prev.likes.filter((id) => id !== user.id),
        likeCount: newLikeCount,
      }));
    }
  };

  const fetchProjects = useCallback(
    async (pageNumber = 1, append = false) => {
      try {
      setLoading(true);
        // LoadingSpinner(true); // Add this
        let url = `/api/v1/projects?limit=12&page=${pageNumber}`;

        if (searchTerm) url += `&search=${searchTerm}`;
        if (selectedCategories.length > 0)
          url += `&category=${selectedCategories.join(',')}`;
        if (selectedDifficulty) url += `&difficulty=${selectedDifficulty}`;
        if (sortBy === 'likes') url += `&sort=-likeCount`;
        if (sortBy === 'newest') url += `&sort=-createdAt`;

        const [allProjects, myProjects] = await Promise.all([
          axios.get(url),
          user
            ? axios.get('/api/v1/projects/myprojects', {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
              })
            : { data: { data: [] } },
        ]);

        setProjects((prev) =>
          append ? [...prev, ...allProjects.data.data] : allProjects.data.data
        );
        setPagination(allProjects.data.pagination);
        setUserProjects(myProjects.data.data);
        setPage(pageNumber);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
        //LoadingSpinner(false); // Add this
      }
    },
    [user, sortBy, searchTerm, selectedCategories, selectedDifficulty]
  );

  useEffect(() => {
    fetchProjects(1);
  }, [fetchProjects]);

  const lastProjectRef = useCallback(
    (node) => {
      //if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (
          entries[0].isIntersecting &&
          pagination?.next &&
          activeTab === 'all'
        ) {
          fetchProjects(page + 1, true);
        }
      });
      if (node) observer.current.observe(node);
    },
    [//loading, 
    pagination, page, fetchProjects, activeTab]
  );

  let displayedProjects =
    activeTab === 'all' ? [...projects] : [...userProjects];

  if (selectedCategories.length > 0) {
    displayedProjects = displayedProjects.filter((project) =>
      selectedCategories.includes(project.category?.toLowerCase())
    );
  }

  if (selectedDifficulty) {
    displayedProjects = displayedProjects.filter(
      (project) =>
        project.difficulty?.toLowerCase() ===
        selectedDifficulty.toLowerCase()
    );
  }

  if (searchTerm.trim()) {
    const lowerSearch = searchTerm.toLowerCase();
    displayedProjects = displayedProjects.filter(
      (project) =>
        project.title.toLowerCase().includes(lowerSearch) ||
        project.tags?.some((tag) => tag.toLowerCase().includes(lowerSearch))
    );
  }

  if (sortBy === 'newest') {
    displayedProjects.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  } else if (sortBy === 'likes') {
    displayedProjects.sort(
      (a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className={`max-w-7xl mx-auto ${isPanelOpen ? 'pr-[400px]' : ''} transition-all duration-300`}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              {activeTab === 'all' ? 'Explore Projects' : 'My Projects'}
            </h1>
            <p className="text-lg text-gray-600">
              {activeTab === 'all'
                ? 'Discover amazing student projects'
                : 'Manage your created projects'}
            </p>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex space-x-2 bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-sm mt-4 md:mt-0"
          >
            <button
              onClick={() => setSortBy('newest')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                sortBy === 'newest'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Newest
            </button>
            <button
              onClick={() => setSortBy('likes')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                sortBy === 'likes'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Most Liked
            </button>
          </motion.div>
        </motion.div>

        <div className="flex border-b border-gray-200/50 mb-8">
          <button
            className={`px-6 py-3 font-medium text-sm relative ${
              activeTab === 'all'
                ? 'text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All Projects
            {activeTab === 'all' && (
              <motion.span
                layoutId="underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
          {user && (
            <button
              className={`px-6 py-3 font-medium text-sm relative ${
                activeTab === 'my'
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('my')}
            >
              My Projects
              {activeTab === 'my' && (
                <motion.span
                  layoutId="underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
          <motion.div whileHover={{ scale: 1.01 }} className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by title or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </motion.div>

          <FilterDropdown
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            selectedDifficulty={selectedDifficulty}
            setSelectedDifficulty={setSelectedDifficulty}
          />
        </div>

        <AnimatePresence>
          {displayedProjects.length > 0 ? (
            <div className={`grid grid-cols-1 ${isPanelOpen ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-8`}>
              {displayedProjects.map((project, idx) => {
                const isLast = idx === displayedProjects.length - 1;
                return (
                  <motion.div
                    key={project._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5 }}
                    ref={isLast && activeTab === 'all' ? lastProjectRef : null}
                  >
                    <ProjectCard
                      project={project}
                      onLike={handleProjectLike}
                      onDelete={handleDelete}
                      isMyProject={activeTab === 'my'}
                      onClick={() => openPanel(project)}
                    />
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="col-span-3 text-center py-16"
            >
              <div className="mx-auto h-32 w-32 text-gray-300 mb-4">
                <svg
                  className="w-full h-full"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                {activeTab === 'all'
                  ? 'No projects found'
                  : 'No projects created yet'}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {activeTab === 'all'
                  ? 'Be the first to create a project!'
                  : 'Start by creating your first project'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12 text-center"
          >
            <Link
              to="/projects/create"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all hover:from-indigo-700 hover:to-purple-700"
            >
              <FiPlus className="mr-2" />
              Create New Project
            </Link>
          </motion.div>
        )}
      </div>

      {/* Project Detail Panel */}
      <AnimatePresence>
        {isPanelOpen && selectedProject && (
          <motion.div
            key={selectedProject._id}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              damping: 20,
              stiffness: 150,
              mass: 0.5,
              restDelta: 0.001
            }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-20 overflow-y-auto border-l border-gray-200"
            style={{ boxShadow: '-4px 0 15px rgba(0,0,0,0.1)' }}
            ref={panelRef}
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedProject.title}
                </h2>
                <motion.button
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closePanel}
                  className="text-indigo-500 hover:text-indigo-700 p-1"
                  aria-label="Close panel"
                >
                  <FiX className="h-6 w-6" />
                </motion.button>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-medium">
                  {selectedProject.category}
                </span>
                <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
                  {
                    beginner: 'bg-emerald-100 text-emerald-800',
                    intermediate: 'bg-amber-100 text-amber-800',
                    advanced: 'bg-rose-100 text-rose-800'
                  }[selectedProject.difficulty?.toLowerCase()] || 'bg-emerald-100 text-emerald-800'
                }`}>
                  {selectedProject.difficulty}
                </span>
              </div>

              <div className="prose max-w-none mb-6 flex-grow overflow-y-auto">
                <h4 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">
                  Description
                </h4>
                <p className="text-gray-700 whitespace-pre-line mb-6">
                  {selectedProject.description}
                </p>

                {selectedProject.tags?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tags.map(tag => (
                        <span key={tag} className="inline-block bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedProject.githubUrl || selectedProject.documentationUrl) && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">
                      Links
                    </h4>
                    <div className="space-y-2">
                      {selectedProject.githubUrl && (
                        <a 
                          href={selectedProject.githubUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                        >
                          <FiGithub className="mr-2" /> GitHub Repository
                        </a>
                      )}
                      {selectedProject.documentationUrl && (
                        <a 
                          href={selectedProject.documentationUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                        >
                          <FiBook className="mr-2" /> Project Documentation
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200 mt-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      By {typeof selectedProject.createdBy === 'object' ? selectedProject.createdBy.name : 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(selectedProject.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newIsLiked = !selectedProject.likes.includes(user.id);
                        const newLikeCount = newIsLiked ? selectedProject.likeCount + 1 : selectedProject.likeCount - 1;
                        handleProjectLike(selectedProject._id, newIsLiked, newLikeCount);
                      }}
                      disabled={!user}
                      className={`flex items-center space-x-1 transition-colors ${
                        selectedProject.likes.includes(user?.id) 
                          ? 'text-rose-500' 
                          : 'text-gray-400 hover:text-rose-500'
                      } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <FiHeart className={`h-5 w-5 ${
                        selectedProject.likes.includes(user?.id) ? 'fill-current' : ''
                      }`} />
                      <span className="text-sm font-medium">
                        {selectedProject.likeCount}
                      </span>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (navigator.share) {
                          navigator.share({
                            title: selectedProject.title,
                            text: selectedProject.description,
                            url: `${window.location.origin}/projects/${selectedProject._id}`,
                          });
                        } else {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/projects/${selectedProject._id}`
                          );
                          alert('Link copied to clipboard!');
                        }
                      }}
                      className="text-indigo-500 hover:text-indigo-700 transition-colors"
                    >
                      <FiShare2 className="h-5 w-5" />
                    </button>
                    
               {user && user.id !== (typeof selectedProject.createdBy === 'object' ? selectedProject.createdBy._id : selectedProject.createdBy) && (
  <button
    onClick={(e) => {
      e.stopPropagation();
      navigate(`/chat/${selectedProject._id}/${selectedProject.createdBy._id || selectedProject.createdBy}`);
    }}
    className="text-emerald-500 hover:text-emerald-700 transition-colors"
  >
    <FiMessageSquare className="h-5 w-5" />
  </button>
)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}