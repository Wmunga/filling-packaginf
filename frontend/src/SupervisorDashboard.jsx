import { useState, useEffect } from 'react';

function SupervisorDashboard({ supabase }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: workOrders } = await supabase.from('work_orders').select(`
        id, order_number, line_id, 
        hourly_productions (hour, output, remarks)
      `);
      setData(workOrders || []);
    };
    fetchData();  // Initial fetch

    const channel = supabase.channel('db-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'hourly_productions' }, fetchData).subscribe();

    return () => supabase.removeChannel(channel);
  }, [supabase]);  // Include supabase in dependencies to fix the warning

  return (
    <div>
      <h2>Supervisor Dashboard</h2>
      <table>
        <thead><tr><th>Work Order</th><th>Line</th><th>Hourly Outputs</th></tr></thead>
        <tbody>
          {data.map(wo => (
            <tr key={wo.id}>
              <td>{wo.order_number}</td>
              <td>{wo.line_id}</td>
              <td>{wo.hourly_productions.map(h => `Hour ${h.hour}: ${h.output} (${h.remarks})`).join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SupervisorDashboard;