import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { getOrCreateKeyPair, exportPublicKeyJwk } from '../utils/e2ee';

export default function E2EEBootstrap() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { publicKey } = await getOrCreateKeyPair();
        const jwk = await exportPublicKeyJwk(publicKey);
        await axios.put('/api/v1/auth/public-key', { publicKey: jwk });
      } catch (err) {
        console.error('E2EE key provisioning failed:', err.message);
      }
    })();
  }, [user?.id]);

  return null;
}