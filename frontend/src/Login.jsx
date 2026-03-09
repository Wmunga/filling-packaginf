import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ supabase }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Listen for auth state changes (recommended for reliable redirect)
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Fetch role from your users table
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error || !userProfile) {
          console.error('Profile fetch error:', error);
          alert('User profile not found - contact admin');
          return;
        }

        // Redirect based on role
        if (userProfile.role === 'captain') {
          navigate('/captain');
        } else if (userProfile.role === 'supervisor') {
          navigate('/supervisor');
        } else {
          alert('Unknown role');
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, navigate]);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Login failed: ' + error.message);
    }
    // No need for manual redirect here — the listener handles it
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;