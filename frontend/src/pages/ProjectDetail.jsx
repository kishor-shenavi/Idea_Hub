// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from '../api/axios';
// import { useAuth } from '../context/AuthContext';
// import { FiHeart, FiShare2, FiMessageSquare, FiEdit, FiTrash2, FiGithub, FiBook } from 'react-icons/fi';

// export default function ProjectDetail() {
//   const { id } = useParams();
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [project, setProject] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isLiking, setIsLiking] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [isLiked, setIsLiked] = useState(false);

//   useEffect(() => {
//     const fetchProject = async () => {
//       try {
//         const { data } = await axios.get(`/api/v1/projects/${id}`);
//         setProject(data.data);
//         setIsLiked(user && data.data.likes?.includes(user.id));
//       } catch (error) {
//         console.error('Failed to fetch project:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProject();
//   }, [id, user]);

//   const handleLike = async () => {
//     if (!user) {
//       navigate('/auth/login');
//       return;
//     }
    
//     setIsLiking(true);
//     try {
//       const { data } = await axios.put(`/api/v1/projects/${id}/like`, {}, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       setProject(data.data);
//       setIsLiked(!isLiked);
//     } catch (error) {
//       console.error('Like failed:', error);
//     } finally {
//       setIsLiking(false);
//     }
//   };

//   const handleShare = () => {
//     if (navigator.share) {
//       navigator.share({
//         title: project.title,
//         text: project.description,
//         url: window.location.href,
//       }).catch(err => console.error('Error sharing:', err));
//     } else {
//       navigator.clipboard.writeText(window.location.href).then(() => {
//         alert('Link copied to clipboard!');
//       });
//     }
//   };

//   const handleDelete = async () => {
//     if (!window.confirm('Are you sure you want to delete this project?')) return;
    
//     setIsDeleting(true);
//     try {
//       await axios.delete(`/api/v1/projects/${id}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       navigate('/projects');
//     } catch (error) {
//       console.error('Failed to delete project:', error);
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   const startChat = () => {
//     navigate(`/chat/${id}`);
//   };

//   if (loading) return <div className="text-center py-8">Loading...</div>;
//   if (!project) return <div className="text-center py-8">Project not found</div>;

//   const isOwner = user?.id === project.createdBy._id;

//   return (
//     <div className="max-w-4xl mx-auto py-8 px-4">
//       <div className="bg-white rounded-lg shadow-md overflow-hidden">
//         <div className="p-6">
//           <div className="flex justify-between items-start">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-800">{project.title}</h1>
//               <div className="mt-2 flex flex-wrap gap-2">
//                 <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
//                   {project.category}
//                 </span>
//                 <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
//                   {project.difficulty}
//                 </span>
//               </div>
//             </div>
//             {isOwner && (
//               <div className="flex space-x-2">
//                 <button 
//                   onClick={() => navigate(`/projects/${id}/edit`)}
//                   className="text-gray-500 hover:text-primary"
//                 >
//                   <FiEdit className="h-5 w-5" />
//                 </button>
//                 <button 
//                   onClick={handleDelete}
//                   disabled={isDeleting}
//                   className="text-gray-500 hover:text-red-500 disabled:opacity-50"
//                 >
//                   <FiTrash2 className="h-5 w-5" />
//                 </button>
//               </div>
//             )}
//           </div>
          
//           <div className="mt-6">
//             <h2 className="text-xl font-semibold text-gray-800 mb-2">Description</h2>
//             <p className="text-gray-600 whitespace-pre-line">{project.description}</p>
//           </div>

//           {project.tags?.length > 0 && (
//             <div className="mt-6">
//               <h2 className="text-xl font-semibold text-gray-800 mb-2">Tags</h2>
//               <div className="flex flex-wrap gap-2">
//                 {project.tags.map(tag => (
//                   <span key={tag} className="inline-block bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
//                     {tag}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           )}

//           {(project.githubUrl || project.documentationUrl) && (
//             <div className="mt-6">
//               <h2 className="text-xl font-semibold text-gray-800 mb-2">Links</h2>
//               <div className="space-y-2">
//                 {project.githubUrl && (
//                   <a 
//                     href={project.githubUrl} 
//                     target="_blank" 
//                     rel="noopener noreferrer"
//                     className="flex items-center text-blue-600 hover:underline"
//                   >
//                     <FiGithub className="mr-2" /> GitHub Repository
//                   </a>
//                 )}
//                 {project.documentationUrl && (
//                   <a 
//                     href={project.documentationUrl} 
//                     target="_blank" 
//                     rel="noopener noreferrer"
//                     className="flex items-center text-blue-600 hover:underline"
//                   >
//                     <FiBook className="mr-2" /> Documentation
//                   </a>
//                 )}
//               </div>
//             </div>
//           )}
          
//           <div className="mt-8 pt-6 border-t flex items-center justify-between">
//             <div className="text-gray-600">
//               <p>Created by: <span className="font-medium">{project.createdBy?.name}</span></p>
//               <p className="text-sm">Posted on: {new Date(project.createdAt).toLocaleDateString()}</p>
//             </div>
            
//             <div className="flex items-center space-x-4">
//               <button 
//                 onClick={handleLike}
//                 disabled={isLiking}
//                 className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500 disabled:opacity-50`}
//               >
//                 <FiHeart className="h-5 w-5" />
//                 <span>{project.likes?.length || 0}</span>
//               </button>
              
//               <button 
//                 onClick={handleShare}
//                 className="flex items-center space-x-1 text-gray-500 hover:text-blue-500"
//               >
//                 <FiShare2 className="h-5 w-5" />
//                 <span>Share</span>
//               </button>

//               {user && !isOwner && (
//                 <button 
//                   onClick={startChat}
//                   className="flex items-center space-x-1 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
//                 >
//                   <FiMessageSquare className="h-5 w-5" />
//                   <span>Message Owner</span>
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }