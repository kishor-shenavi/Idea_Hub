// //all good
// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from '../api/axios';
// import { useAuth } from '../context/AuthContext';
// import ProjectForm from './ProjectForm';

// export default function EditProject() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(false);
//   const [project, setProject] = useState(null);
//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     tags: [],
//     category: 'web',
//     difficulty: 'intermediate',
//     githubUrl: '',
//     documentationUrl: '',
//     currentTag: ''
//   });

// useEffect(() => {
//   const fetchProject = async () => {
//     try {
//       const { data } = await axios.get(`/api/v1/projects/${id}`, { // Keep original route
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       setProject(data.data);
//       setFormData({
//         title: data.data.title,
//         description: data.data.description,
//         tags: data.data.tags || [],
//         category: data.data.category,
//         difficulty: data.data.difficulty,
//         githubUrl: data.data.githubUrl || '',
//         documentationUrl: data.data.documentationUrl || '',
//         currentTag: ''
//       });
//     } catch (err) {
//       console.error('Failed to fetch project', err);
//     }
//   };

//   fetchProject();
// }, [id]);

// const handleSubmit = async (e) => {
//   e.preventDefault();
//   setLoading(true);

//   try {
//      if (!project || !user) {
//   return <div className="text-center py-8">Loading...</div>;
// }
//     await axios.put(`/api/v1/projects/${id}`, { // Keep original route
//       title: formData.title,
//       description: formData.description,
//       tags: formData.tags,
//       category: formData.category,
//       difficulty: formData.difficulty,
//       githubUrl: formData.githubUrl,
//       documentationUrl: formData.documentationUrl
//     }, {
//       headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//     });
//     // navigate(`/projects/${id}`);
//    // navigate('/projects?mine=true');
// navigate('/projects', { state: { showMineOnly: true } });

//   } catch (err) {
//     console.error('Failed to update project:', err.response?.data?.message || err.message);
//   } finally {
//     setLoading(false);
//   }
// };



// //console.log("User ID:", user?.id);
// //console.log("Project Creator ID:", project?.createdBy?._id);
// if (!user || !project) {
//   return <div className="text-center py-8">Loading...</div>;
// }

// if (user.id !== project.createdBy._id) {
//   return (
//     <div className="text-center py-8">
//       <p>You don't have permission to edit this project.</p>
//     </div>
//   );
// }

// // if (user.id !== (typeof project.createdBy === 'object' ? project.createdBy._id : project.createdBy)) {

// //   return (
// //     <div className="text-center py-8">
// //       <p>You don't have permission to edit this project.</p>
// //     </div>
// //   );
// // }
//   return (
//     <ProjectForm
//       formData={formData}
//       setFormData={setFormData}
//       loading={loading}
//       onSubmit={handleSubmit}
//       isEditing={true}
//     />
//   );
// }



import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ProjectForm from './ProjectForm';
import { useLoading } from '../context/LoadingContext';
//import LoadingSpinner from '../components/LoadingSpinner';
export default function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  //const [loading, setLoading] = useState(false);
   const { setLoading } = useLoading();
  const [project, setProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [],
    category: 'web',
    difficulty: 'intermediate',
    githubUrl: '',
    documentationUrl: '',
    currentTag: ''
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
       //  LoadingSpinner(true); // Add this
        const { data } = await axios.get(`/api/v1/projects/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setProject(data.data);
        setFormData({
          title: data.data.title,
          description: data.data.description,
          tags: data.data.tags || [],
          category: data.data.category,
          difficulty: data.data.difficulty,
          githubUrl: data.data.githubUrl || '',
          documentationUrl: data.data.documentationUrl || '',
          currentTag: ''
        });
      } catch (err) {
        console.error('Failed to fetch project', err);
      }
      finally{
        setLoading(false);
       //  LoadingSpinner(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
   setLoading(true);
    //LoadingSpinner(true);
    try {
      await axios.put(`/api/v1/projects/${id}`, {
        title: formData.title,
        description: formData.description,
        tags: formData.tags,
        category: formData.category,
        difficulty: formData.difficulty,
        githubUrl: formData.githubUrl,
        documentationUrl: formData.documentationUrl
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      navigate('/projects', { state: { showMineOnly: true } });
    } catch (err) {
      console.error('Failed to update project:', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
      //LoadingSpinner(false);
    }
  };

  if (!user || !project) {
    return (
      <div className="text-center py-8 px-4">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="mt-4">Loading project...</p>
      </div>
    );
  }

  if (user.id !== project.createdBy._id) {
    return (
      <div className="text-center py-8 px-4">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
          <p className="text-gray-700 mb-4">You don't have permission to edit this project.</p>
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProjectForm
      formData={formData}
      setFormData={setFormData}
      //loading={loading}
      onSubmit={handleSubmit}
      isEditing={true}
    />
  );
}