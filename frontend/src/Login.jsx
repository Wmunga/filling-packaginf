import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ supabase }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // 1. Handle auth state changes (top-level effect)
  useEffect(() => {
    // Listen for sign-in events
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        try {
          const { data: profile, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (error) throw error;
          if (!profile) {
            alert('User profile not found - contact admin');
            return;
          }

          // Redirect based on role
          if (profile.role === 'captain') {
            navigate('/captain');
          } else if (profile.role === 'supervisor') {
            navigate('/supervisor');
          } else {
            alert('Unknown role');
          }
        } catch (err) {
          console.error('Profile fetch failed:', err);
          alert('Something went wrong during login');
        }
      }
    });

    // Cleanup listener on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, navigate]); // ← safe dependencies (stable references)

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Login failed: ' + error.message);
    }
    // No manual redirect here — listener will handle it
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