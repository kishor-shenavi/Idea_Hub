import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function SetUsername() {
  const [username, setUsername] = useState('');
  const { fetchUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch('/api/v1/users/updateMe', { name: username });
      await fetchUser();
      navigate('/projects');
    } catch (error) {
      console.error('Failed to update username', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Choose a Username</h2>
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <button type="submit">Save</button>
    </form>
  );
}

export default SetUsername;
