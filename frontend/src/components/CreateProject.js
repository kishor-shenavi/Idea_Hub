import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import ProjectForm from './ProjectForm';

export default function CreateProject() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/v1/projects', {
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
      navigate('/projects');
    } catch (err) {
      // Handle error (you might want to add error state if needed)
      console.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p>You need to be logged in to create a project.</p>
        <Link to="/auth/login" className="text-primary hover:underline">Login here</Link>
      </div>
    );
  }

  return (
    <ProjectForm
      formData={formData}
      setFormData={setFormData}
      loading={loading}
      onSubmit={handleSubmit}
      isEditing={false}
    />
  );
}