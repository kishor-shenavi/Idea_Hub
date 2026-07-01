import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axios';
import ProjectForm from './ProjectForm';
import LoadingSpinner from './LoadingSpinner';

export default function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`/api/v1/projects/${id}`);
        const p = data.data;
        setFormData({
          title: p.title || '',
          description: p.description || '',
          tags: p.tags || [],
          category: p.category || 'web',
          difficulty: p.difficulty || 'intermediate',
          githubUrl: p.githubUrl || '',
          documentationUrl: p.documentationUrl || '',
          demoUrl: p.demoUrl || '',
          techStack: p.techStack || [],
        });
      } catch { navigate('/projects'); }
      finally { setPageLoading(false); }
    };
    load();
  }, [id, navigate]);

  if (pageLoading) return <LoadingSpinner show />;
  if (!formData) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`/api/v1/projects/${id}`, formData);
      navigate('/projects', { state: { showMineOnly: true } });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update project');
    } finally { setLoading(false); }
  };

  return <ProjectForm formData={formData} setFormData={setFormData} onSubmit={handleSubmit} isEditing loading={loading} />;
}
