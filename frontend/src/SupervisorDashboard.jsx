import React, { useState, useEffect, useCallback, useRef } from 'react';

function SupervisorDashboard({ supabase }) {
  const [data, setData] = useState([]);
  const isMounted = useRef(true);

  // Memoized fetch function – used by both initial load and real-time
  const fetchData = useCallback(async () => {
    if (!isMounted.current) return;

    try {
      const { data: workOrders, error } = await supabase
        .from('work_orders')
        .select(`
          id, order_number, line_id, 
          hourly_productions (hour, output, remarks)
        `);

      console.log('Fetched workOrders:', workOrders);
      console.log('Fetch error:', error);

      if (error) {
        console.error('Supabase fetch error:', error.message);
      } else if (isMounted.current) {
        setData(workOrders || []);
      }
    } catch (err) {
      console.error('Unexpected fetch error:', err);
    }
  }, [supabase]);

  // Effect 1: Initial data fetch – runs once when component mounts
  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [fetchData]); // only depends on the stable fetchData function

  // Effect 2: Real-time subscription – only handles incoming changes
  useEffect(() => {
    isMounted.current = true;

    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hourly_productions' },
        () => {
          // Callback – safe place to call setState indirectly via fetchData
          if (isMounted.current) {
            fetchData();
          }
        }
      )
      .subscribe();

    return () => {
      isMounted.current = false;
      supabase.removeChannel(channel);
    };
  }, [fetchData, supabase]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Supervisor Dashboard</h2>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
            <th style={{ padding: '12px', border: '1px solid #ddd' }}>Work Order</th>
            <th style={{ padding: '12px', border: '1px solid #ddd' }}>Line</th>
            <th style={{ padding: '12px', border: '1px solid #ddd' }}>Hourly Outputs</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                No work orders found yet. Add some as Captain!
              </td>
            </tr>
          ) : (
            data.map((wo) => (
              <tr key={wo.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {wo.order_number}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {wo.line_id}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {wo.hourly_productions?.length > 0 ? (
                    wo.hourly_productions
                      .map((h) => `Hour ${h.hour}: ${h.output} (${h.remarks || 'No remarks'})`)
                      .join(', ')
                  ) : (
                    'No hourly data yet'
                  )}
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