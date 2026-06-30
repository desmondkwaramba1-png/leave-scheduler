import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:3001/api/leave-requests';

function App() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  function fetchRequests() {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setRequests(data));
  }
  function updateStatus(id, status) {
    fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
      .then(res => res.json())
      .then(() => fetchRequests());
  }
  return (
    <div>
      <h1>Team Leave Scheduler</h1>

      <h2>Leave Requests — Next 30 Days</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Team</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(r => (
            <tr key={r.id}>
              <td>{r.employee_name}</td>
              <td>{r.team_name}</td>
              <td>{r.start_date}</td>
              <td>{r.end_date}</td>
              <td>{r.status}</td>
              <td>
                {r.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(r.id, 'approved')}>Approve</button>
                    <button onClick={() => updateStatus(r.id, 'rejected')}>Reject</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;