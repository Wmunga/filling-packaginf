import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ supabase }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return alert('Login failed: ' + error.message);
    const { data: userData } = await supabase.from('users').select('role').eq('id', data.user.id).single();
    if (userData.role === 'captain') navigate('/captain');
    else if (userData.role === 'supervisor') navigate('/supervisor');
  };

  return (
    <div>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;