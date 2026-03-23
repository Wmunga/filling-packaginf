import { createClient } from '@supabase/supabase-js';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import CaptainInput from './CaptainInput';
import SupervisorDashboard from './SupervisorDashboard';
import ErrorBoundary from './ErrorBoundary';  // ← ADD THIS LINE

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login supabase={supabase} />} />
        <Route path="/captain" element={<CaptainInput supabase={supabase} />} />
        <Route
          path="/supervisor"
          element={
            <ErrorBoundary>  {/* ← Wrap with ErrorBoundary */}
              <SupervisorDashboard supabase={supabase} />
            </ErrorBoundary>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;