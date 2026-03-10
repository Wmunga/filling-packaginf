import { useState, useEffect } from 'react';
import React from 'react';

function CaptainInput({ supabase }) {
  const [workOrderId, setWorkOrderId] = useState(null);
  const [hour, setHour] = useState(1);
  const [output, setOutput] = useState(0);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    const fetchWorkOrder = async () => {
      const { data: session } = await supabase.auth.getSession();
      const { data } = await supabase.from('work_orders').select('id').eq('captain_id', session.user.id).single();
      setWorkOrderId(data?.id);
    };
    fetchWorkOrder();
  }, [supabase]);  // Include supabase in dependencies to fix the warning

  const handleSubmit = async () => {
    if (!workOrderId) return alert('No work order assigned');
    const { error } = await supabase.from('hourly_productions').insert({ work_order_id: workOrderId, hour, output, remarks });
    if (error) alert('Error: ' + error.message);
    else alert('Saved!');
  };

  return (
    <div>
      <h2>Captain Input</h2>
      <label>Hour: <input type="number" value={hour} onChange={(e) => setHour(e.target.value)} min={1} max={12} /></label>
      <label>Output: <input type="number" value={output} onChange={(e) => setOutput(e.target.value)} /></label>
      <label>Remarks: <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} /></label>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default CaptainInput;