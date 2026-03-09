import { useState, useEffect } from 'react';

function SupervisorDashboard({ supabase }) {
  const [data, setData] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    try {
      const { data: workOrders, error } = await supabase
        .from('work_orders')
        .select(`
          id, order_number, line_id, 
          hourly_productions (hour, output, remarks)
        `);

      console.log('Fetched workOrders:', workOrders);   // ← Add this
      console.log('Fetch error:', error);               // ← Add this

      if (error) {
        console.error('Supabase error:', error);
        alert('Data fetch failed: ' + error.message);
      }

      setData(workOrders || []);
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  fetchData();

  // Keep the real-time subscription
  const channel = supabase
    .channel('db-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'hourly_productions' }, fetchData)
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [supabase]); // Include supabase in dependencies to fix the warning

  return (
    <div>
      <h2>Supervisor Dashboard</h2>
      <table>
        <thead><tr><th>Work Order</th><th>Line</th><th>Hourly Outputs</th></tr></thead>
        <tbody>
  {data.length === 0 ? (
    <tr>
      <td colSpan={3}>No work orders found yet. Add some as Captain!</td>
    </tr>
  ) : (
    data.map(wo => (
      <tr key={wo.id}>
        <td>{wo.order_number}</td>
        <td>{wo.line_id}</td>
        <td>
          {wo.hourly_productions?.length > 0
            ? wo.hourly_productions.map(h => `Hour ${h.hour}: ${h.output} (${h.remarks || 'No remarks'})`).join(', ')
            : 'No hourly data yet'}
        </td>
      </tr>
    ))
  )}
</tbody>
      </table>
    </div>
  );
}

export default SupervisorDashboard;