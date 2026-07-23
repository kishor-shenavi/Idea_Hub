import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../api/axios';
import ResumeResultView from '../components/ResumeResultView';
import { flattenScan } from '../utils/resumeHelpers';

export default function ResumeHistoryDetail() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`/api/v1/resume/history/${id}`)
      .then(res => {
        if (res.data.data.status !== 'completed') {
          setError('This scan is not completed yet.');
        } else {
          setResult(flattenScan(res.data.data));
        }
      })
      .catch(() => setError('Could not load this scan.'));
  }, [id]);

  return (
    <div className="page-container" style={{ maxWidth: 860 }}>
      <Link to="/resume/history" style={{ fontSize: '0.8rem', color: 'var(--brand)', marginBottom: 20, display: 'inline-block' }}>← Back to history</Link>
      {error && <div className="error-msg">{error}</div>}
      {result && <ResumeResultView result={result} />}
    </div>
  );
}