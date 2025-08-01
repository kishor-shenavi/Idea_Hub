




//all good coorected



// import { useState } from 'react';
// import { FiHeart, FiShare2, FiEdit, FiTrash2, FiGithub, FiBook, FiMessageSquare } from 'react-icons/fi';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import axios from '../api/axios';

// export default function ProjectCard({ project, onDelete, onLike, isMyProject }) {
//   const { user } = useAuth();
//   const [isLiked, setIsLiked] = useState(user && project.likes.includes(user.id));
//   const [likeCount, setLikeCount] = useState(project.likes?.length || 0);
//   const [expanded, setExpanded] = useState(false);
//   const navigate = useNavigate();

//   const handleLike = async (e) => {
//     e.stopPropagation();
//     if (!user) return;
    
//     const newIsLiked = !isLiked;
//     const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;
//     setIsLiked(newIsLiked);
//     setLikeCount(newLikeCount);
    
//     if (onLike) {
//       onLike(project._id, newIsLiked, newLikeCount);
//     }
    
//     try {
//       const { data } = await axios.put(`/api/v1/projects/${project._id}/like`, {}, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
      
//       if (data.isLiked !== newIsLiked || data.likeCount !== newLikeCount) {
//         setIsLiked(data.isLiked);
//         setLikeCount(data.likeCount);
//         if (onLike) {
//           onLike(project._id, data.isLiked, data.likeCount);
//         }
//       }
//     } catch (error) {
//       console.error('Like failed:', error);
//       setIsLiked(!newIsLiked);
//       setLikeCount(newIsLiked ? likeCount - 1 : likeCount + 1);
//       if (onLike) {
//         onLike(project._id, !newIsLiked, newIsLiked ? likeCount - 1 : likeCount + 1);
//       }
//     }
//   };

//   const handleEdit = (e) => {
//     e.stopPropagation();
//     navigate(`/projects/${project._id}/edit`);
//   };

//   const handleDelete = (e) => {
//     e.stopPropagation();
//     if (onDelete) onDelete(project._id);
//   };

//   const handleShare = (e) => {
//     e.stopPropagation();
//     if (navigator.share) {
//       navigator.share({
//         title: project.title,
//         text: project.description,
//         url: `${window.location.origin}/projects/${project._id}`,
//       });
//     } else {
//       navigator.clipboard.writeText(`${window.location.origin}/projects/${project._id}`);
//       alert('Link copied to clipboard!');
//     }
//   };

//   const startChat = (e) => {
//     e.stopPropagation();
//     navigate(`/chat/${project._id}/${user._id}`);
//   };

//   if (!user || !user.id) return null;

//   const isOwner =
//     user?.id === (typeof project.createdBy === 'object' ? project.createdBy._id : project.createdBy) &&
//     isMyProject;

//   // Color scheme variables
//   const cardBgColor = 'bg-gradient-to-br from-gray-50 to-indigo-50';
//   const cardBorderColor = 'border-indigo-100';
//   const cardShadow = 'shadow-lg hover:shadow-xl';
//   const titleColor = 'text-gray-800';
//   const categoryColor = 'bg-indigo-200 text-indigo-800';
//   const difficultyColors = {
//     beginner: 'bg-emerald-100 text-emerald-800',
//     intermediate: 'bg-amber-100 text-amber-800',
//     advanced: 'bg-rose-100 text-rose-800'
//   };
//   const likeColor = isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500';
//   const actionButtonColor = 'text-indigo-400 hover:text-indigo-600';
//   const chatButtonColor = 'text-emerald-400 hover:text-emerald-600';
//   const shareButtonColor = 'text-blue-400 hover:text-blue-600';
//   const dividerColor = 'border-indigo-100';

//   return (
//     <motion.div 
//       whileHover={{ scale: 1.02 }}
//       whileTap={{ scale: 0.98 }}
//       className={`${cardBgColor} rounded-2xl ${cardShadow} overflow-hidden transition-all cursor-pointer border ${cardBorderColor} ${
//         expanded ? 'ring-2 ring-indigo-300' : ''
//       }`}
//       onClick={() => setExpanded(!expanded)}
//     >
//       <div className="p-6">
//         <div className="flex justify-between items-start">
//           <div>
//             <h3 className={`text-xl font-bold ${titleColor} mb-2`}>{project.title}</h3>
//             <div className="flex flex-wrap gap-2">
//               <span className={`inline-block ${categoryColor} text-xs px-3 py-1 rounded-full font-medium`}>
//                 {project.category}
//               </span>
//               <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
//                 difficultyColors[project.difficulty?.toLowerCase()] || difficultyColors.beginner
//               }`}>
//                 {project.difficulty}
//               </span>
//             </div>
//           </div>
          
//           {isOwner && (
//             <div className="flex space-x-2">
//               <motion.button
//                 whileHover={{ scale: 1.1 }}
//                 whileTap={{ scale: 0.9 }}
//                 onClick={handleEdit}
//                 className={`${actionButtonColor} transition-colors p-1`}
//                 aria-label="Edit project"
//               >
//                 <FiEdit className="h-5 w-5" />
//               </motion.button>
//               <motion.button 
//                 whileHover={{ scale: 1.1 }}
//                 whileTap={{ scale: 0.9 }}
//                 onClick={handleDelete}
//                 className="text-rose-400 hover:text-rose-600 transition-colors p-1"
//                 aria-label="Delete project"
//               >
//                 <FiTrash2 className="h-5 w-5" />
//               </motion.button>
//             </div>
//           )}
//         </div>
             
//         {expanded && (
//           <motion.div 
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//             className="mt-6 space-y-5"
//           >
//             <div>
//               <h4 className="text-sm font-semibold text-indigo-500 uppercase tracking-wider mb-2">Description</h4>
//               <p className="text-gray-700 whitespace-pre-line">{project.description}</p>
//             </div>
    
//             {project.tags?.length > 0 && (
//               <div>
//                 <h4 className="text-sm font-semibold text-indigo-500 uppercase tracking-wider mb-2">Tags</h4>
//                 <div className="flex flex-wrap gap-2">
//                   {project.tags.map(tag => (
//                     <span key={tag} className="inline-block bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full">
//                       {tag}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}
  
//             {(project.githubUrl || project.documentationUrl) && (
//               <div>
//                 <h4 className="text-sm font-semibold text-indigo-500 uppercase tracking-wider mb-2">Links</h4>
//                 <div className="space-y-2">
//                   {project.githubUrl && (
//                     <a 
//                       href={project.githubUrl} 
//                       target="_blank" 
//                       rel="noopener noreferrer"
//                       className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
//                       onClick={(e) => e.stopPropagation()}
//                     >
//                       <FiGithub className="mr-2" /> GitHub Repository
//                     </a>
//                   )}
//                   {project.documentationUrl && (
//                     <a 
//                       href={project.documentationUrl} 
//                       target="_blank" 
//                       rel="noopener noreferrer"
//                       className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
//                       onClick={(e) => e.stopPropagation()}
//                     >
//                       <FiBook className="mr-2" /> Project Documentation
//                     </a>
//                   )}
//                 </div>
//               </div>
//             )}
//           </motion.div>
//         )}

//         <div className={`mt-6 pt-4 border-t ${dividerColor} flex items-center justify-between`}>
//           <div>
//             <p className="text-sm font-medium text-gray-700">
//               By {project.createdBy?.name || 'Unknown'}
//             </p>
//             <p className="text-xs text-gray-500">
//               {new Date(project.createdAt).toLocaleDateString('en-US', {
//                 year: 'numeric',
//                 month: 'short',
//                 day: 'numeric'
//               })}
//             </p>
//           </div>
          
//           <div className="flex items-center space-x-4">
//             <motion.button 
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.9 }}
//               onClick={handleLike}
//               disabled={!user}
//               className={`flex items-center space-x-1 transition-colors ${likeColor} ${
//                 !user ? 'opacity-50 cursor-not-allowed' : ''
//               }`}
//               aria-label={isLiked ? 'Unlike project' : 'Like project'}
//             >
//               <FiHeart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
//               <span className="text-sm font-medium">{likeCount}</span>
//             </motion.button>
            
//             <motion.button 
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.9 }}
//               onClick={handleShare}
//               className={`${shareButtonColor} transition-colors`}
//               aria-label="Share project"
//             >
//               <FiShare2 className="h-5 w-5" />
//             </motion.button>
            
//             <motion.button 
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.9 }}
//               onClick={startChat}
//               className={`${chatButtonColor} transition-colors`}
//               aria-label="Chat with project owner"
//             >
//               <FiMessageSquare className="h-5 w-5" />
//             </motion.button>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// }












//corrected for right pannel 

// import { useState } from 'react';
// import { FiHeart, FiShare2, FiEdit, FiTrash2,FiMessageSquare } from 'react-icons/fi';

// import { useAuth } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import axios from '../api/axios';
// export default function ProjectCard({ project, onDelete, onLike, isMyProject, onClick }) {
//   const { user } = useAuth();
//   const [isLiked, setIsLiked] = useState(user && project.likes.includes(user.id));
//   const [likeCount, setLikeCount] = useState(project.likes?.length || 0);
//   const navigate = useNavigate();
//      const chatButtonColor = 'text-emerald-400 hover:text-emerald-600';
//     const startChat = (e) => {
//     e.stopPropagation();
//     navigate(`/chat/${project._id}/${user._id}`);
//   };
//   const handleLike = async (e) => {
//     e.stopPropagation();
//     if (!user) return;
    
//     const newIsLiked = !isLiked;
//     const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;
//     setIsLiked(newIsLiked);
//     setLikeCount(newLikeCount);
    
//     if (onLike) {
//       onLike(project._id, newIsLiked, newLikeCount);
//     }
    
//     try {
//       const { data } = await axios.put(`/api/v1/projects/${project._id}/like`, {}, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
      
//       if (data.isLiked !== newIsLiked || data.likeCount !== newLikeCount) {
//         setIsLiked(data.isLiked);
//         setLikeCount(data.likeCount);
//         if (onLike) {
//           onLike(project._id, data.isLiked, data.likeCount);
//         }
//       }
//     } catch (error) {
//       console.error('Like failed:', error);
//       setIsLiked(!newIsLiked);
//       setLikeCount(newIsLiked ? likeCount - 1 : likeCount + 1);
//       if (onLike) {
//         onLike(project._id, !newIsLiked, newIsLiked ? likeCount - 1 : likeCount + 1);
//       }
//     }
//   };

//   const handleEdit = (e) => {
//     e.stopPropagation();
//     navigate(`/projects/${project._id}/edit`);
//   };

//   const handleDelete = (e) => {
//     e.stopPropagation();
//     if (onDelete) onDelete(project._id);
//   };

//   const handleShare = (e) => {
//     e.stopPropagation();
//     if (navigator.share) {
//       navigator.share({
//         title: project.title,
//         text: project.description,
//         url: `${window.location.origin}/projects/${project._id}`,
//       });
//     } else {
//       navigator.clipboard.writeText(`${window.location.origin}/projects/${project._id}`);
//       alert('Link copied to clipboard!');
//     }
//   };

//   const isOwner =
//     user?.id === (typeof project.createdBy === 'object' ? project.createdBy._id : project.createdBy) &&
//     isMyProject;

//    return (
//     <motion.div 
//       whileHover={{ scale: 1.02 }}
//       whileTap={{ scale: 0.98 }}
//       className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl shadow-lg hover:shadow-xl overflow-hidden transition-all cursor-pointer border border-indigo-100"
//       onClick={onClick}
//     >
//       <div className="p-6">
//         <div className="flex justify-between items-start">
//           <div>
//             <h3 className="text-xl font-bold text-gray-800 mb-2">{project.title}</h3>
//             <div className="flex flex-wrap gap-2">
//               <span className="inline-block bg-indigo-200 text-indigo-800 text-xs px-3 py-1 rounded-full font-medium">
//                 {project.category}
//               </span>
//               <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
//                 {
//                   beginner: 'bg-emerald-100 text-emerald-800',
//                   intermediate: 'bg-amber-100 text-amber-800',
//                   advanced: 'bg-rose-100 text-rose-800'
//                 }[project.difficulty?.toLowerCase()] || 'bg-emerald-100 text-emerald-800'
//               }`}>
//                 {project.difficulty}
//               </span>
//             </div>
//           </div>
          
//           {isOwner && (
//             <div className="flex space-x-2">
//               <motion.button
//                 whileHover={{ scale: 1.1 }}
//                 whileTap={{ scale: 0.9 }}
//                 onClick={handleEdit}
//                 className="text-indigo-400 hover:text-indigo-600 transition-colors p-1"
//                 aria-label="Edit project"
//               >
//                 <FiEdit className="h-5 w-5" />
//               </motion.button>
//               <motion.button 
//                 whileHover={{ scale: 1.1 }}
//                 whileTap={{ scale: 0.9 }}
//                 onClick={handleDelete}
//                 className="text-rose-400 hover:text-rose-600 transition-colors p-1"
//                 aria-label="Delete project"
//               >
//                 <FiTrash2 className="h-5 w-5" />
//               </motion.button>
//             </div>
//           )}
//         </div>
             
//         <div className="mt-6 pt-4 border-t border-indigo-100 flex items-center justify-between">
//           <div>
//             <p className="text-sm font-medium text-gray-700">
//               By {project.createdBy?.name || 'Unknown'}
//             </p>
//             <p className="text-xs text-gray-500">
//               {new Date(project.createdAt).toLocaleDateString('en-US', {
//                 year: 'numeric',
//                 month: 'short',
//                 day: 'numeric'
//               })}
//             </p>
//           </div>
          
//           <div className="flex items-center space-x-4">
//             <motion.button 
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.9 }}
//               onClick={handleLike}
//               disabled={!user}
//               className={`flex items-center space-x-1 transition-colors ${
//                 isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'
//               } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               <FiHeart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
//               <span className="text-sm font-medium">{likeCount}</span>
//             </motion.button>
            
//             <motion.button 
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.9 }}
//               onClick={handleShare}
//               className="text-indigo-400 hover:text-indigo-600 transition-colors"
//             >
//               <FiShare2 className="h-5 w-5" />
//             </motion.button>
//                 <motion.button 
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.9 }}
//               onClick={startChat}
//               className={`${chatButtonColor} transition-colors`}
//               aria-label="Chat with project owner"
//             >
//               <FiMessageSquare className="h-5 w-5" />
//             </motion.button>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// }






//corrected without chat otjion


import { useState } from 'react';
import { FiHeart, FiShare2, FiEdit, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../api/axios';

export default function ProjectCard({ project, onDelete, onLike, isMyProject, onClick }) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(user && project.likes.includes(user.id));
  const [likeCount, setLikeCount] = useState(project.likes?.length || 0);
  const navigate = useNavigate();
  
  const chatButtonColor = 'text-emerald-400 hover:text-emerald-600';
  
  const startChat = (e) => {
    e.stopPropagation();
    navigate(`/chat/${project._id}/${project.createdBy._id || project.createdBy}`);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) return;
    
    const newIsLiked = !isLiked;
    const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;
    setIsLiked(newIsLiked);
    setLikeCount(newLikeCount);
    
    if (onLike) {
      onLike(project._id, newIsLiked, newLikeCount);
    }
    
    try {
      const { data } = await axios.put(`/api/v1/projects/${project._id}/like`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (data.isLiked !== newIsLiked || data.likeCount !== newLikeCount) {
        setIsLiked(data.isLiked);
        setLikeCount(data.likeCount);
        if (onLike) {
          onLike(project._id, data.isLiked, data.likeCount);
        }
      }
    } catch (error) {
      console.error('Like failed:', error);
      setIsLiked(!newIsLiked);
      setLikeCount(newIsLiked ? likeCount - 1 : likeCount + 1);
      if (onLike) {
        onLike(project._id, !newIsLiked, newIsLiked ? likeCount - 1 : likeCount + 1);
      }
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/projects/${project._id}/edit`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(project._id);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: project.title,
        text: project.description,
        url: `${window.location.origin}/projects/${project._id}`,
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/projects/${project._id}`);
      alert('Link copied to clipboard!');
    }
  };

  const isOwner = user?.id === (typeof project.createdBy === 'object' ? project.createdBy._id : project.createdBy) && isMyProject;
  const showChatButton = user && !isOwner;

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl shadow-lg hover:shadow-xl overflow-hidden transition-all cursor-pointer border border-indigo-100"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{project.title}</h3>
            <div className="flex flex-wrap gap-2">
              <span className="inline-block bg-indigo-200 text-indigo-800 text-xs px-3 py-1 rounded-full font-medium">
                {project.category}
              </span>
              <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
                {
                  beginner: 'bg-emerald-100 text-emerald-800',
                  intermediate: 'bg-amber-100 text-amber-800',
                  advanced: 'bg-rose-100 text-rose-800'
                }[project.difficulty?.toLowerCase()] || 'bg-emerald-100 text-emerald-800'
              }`}>
                {project.difficulty}
              </span>
            </div>
          </div>
          
          {isOwner && (
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleEdit}
                className="text-indigo-400 hover:text-indigo-600 transition-colors p-1"
                aria-label="Edit project"
              >
                <FiEdit className="h-5 w-5" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDelete}
                className="text-rose-400 hover:text-rose-600 transition-colors p-1"
                aria-label="Delete project"
              >
                <FiTrash2 className="h-5 w-5" />
              </motion.button>
            </div>
          )}
        </div>
             
        <div className="mt-6 pt-4 border-t border-indigo-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">
              By {typeof project.createdBy === 'object' ? project.createdBy.name : 'Unknown'}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(project.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              disabled={!user}
              className={`flex items-center space-x-1 transition-colors ${
                isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'
              } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FiHeart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{likeCount}</span>
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="text-indigo-400 hover:text-indigo-600 transition-colors"
            >
              <FiShare2 className="h-5 w-5" />
            </motion.button>
            
            {showChatButton && (
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={startChat}
                className={`${chatButtonColor} transition-colors`}
                aria-label="Chat with project owner"
              >
                <FiMessageSquare className="h-5 w-5" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}