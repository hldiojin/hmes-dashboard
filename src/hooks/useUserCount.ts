import { useEffect, useState } from 'react';

import { userService } from '../services/userService';

export const useUserCount = () => {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserCount = async () => {
    try {
      setLoading(true);
      const userCount = await userService.getUserCount();
      setCount(userCount);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user count:', err);
      setError('Failed to load user count');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCount();
  }, []);

  return { count, loading, error, refetch: fetchUserCount };
};
