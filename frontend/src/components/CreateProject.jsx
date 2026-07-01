import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ProjectForm from './ProjectForm';

export default function CreateProject() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', tags: [], category: 'web',
    difficulty: 'intermediate', githubUrl: '', documentationUrl: '', demoUrl: '', techStack: [],
  });

  if (!user) return (
    <div className="page-container" style={{ textAlign: 'center', padding: 80 }}>
      <p style={{ color: 'var(--muted)', marginBottom: 16 }}>You need to be signed in to submit a project.</p>
      <button className="btn btn-primary" onClick={() => navigate('/login')}>Sign in</button>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/v1/projects', formData);
      navigate('/projects', { state: { showMineOnly: true } });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create project');
    } finally { setLoading(false); }
  };

  return <ProjectForm formData={formData} setFormData={setFormData} onSubmit={handleSubmit} isEditing={false} loading={loading} />;
}
