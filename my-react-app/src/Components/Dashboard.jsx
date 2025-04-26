import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CF6'];

// Custom tooltip for PieChart
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid #ccc', padding: '0.5rem 1rem', borderRadius: 6, fontWeight: 500 }}>
        {payload[0].name}: {payload[0].value}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => setError('Request timed out'), 10000);
    fetch('/api/dashboard-stats')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        clearTimeout(timeout);
        setStats(data);
      })
      .catch(err => {
        clearTimeout(timeout);
        setError('Failed to load dashboard: ' + err.message);
      });
  }, []);

  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!stats) return <div>Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <div className="dashboard-links">
          <Link to="/students" className="dashboard-link">Student List</Link>
          <Link to="/add-student" className="dashboard-link">Add Student</Link>
        </div>
      </div>
      <div className="tiles-row">
        <div className="tile-group">
          <h3>Top 5 Interests</h3>
          <div className="tiles">
            {(stats.topInterests || []).map(interest => (
              <div className="tile green" key={interest}>{interest}</div>
            ))}
          </div>
        </div>
        <div className="tile-group">
          <h3>Bottom 5 Interests</h3>
          <div className="tiles">
            {(stats.bottomInterests || []).map(interest => (
              <div className="tile red" key={interest}>{interest}</div>
            ))}
          </div>
        </div>
        <div className="tile-group">
          <h3>Distinct Interests</h3>
          <div className="distinct-tile">{stats.distinctInterests || 0}</div>
        </div>
      </div>
      <div className="charts-row">
        <div>
          <h4>Provincial Distribution</h4>
          <PieChart width={200} height={200}>
            <Pie data={stats.provincialDistribution || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
              {(stats.provincialDistribution || []).map((entry, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
          </PieChart>
        </div>
        <div>
          <h4>Age Distribution</h4>
          <BarChart width={300} height={200} data={stats.ageDistribution || []}>
            <XAxis dataKey="age" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#82ca9d" />
          </BarChart>
        </div>
      </div>
      <div className="charts-row">
        <div>
          <h4>Department Distribution</h4>
          <PieChart width={200} height={200}>
            <Pie data={stats.departmentDistribution || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
              {(stats.departmentDistribution || []).map((entry, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
          </PieChart>
        </div>
        <div>
          <h4>Degree Distribution</h4>
          <PieChart width={200} height={200}>
            <Pie data={stats.degreeDistribution || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
              {(stats.degreeDistribution || []).map((entry, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
          </PieChart>
        </div>
        <div>
          <h4>Gender Distribution</h4>
          <PieChart width={200} height={200}>
            <Pie data={stats.genderDistribution || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
              {(stats.genderDistribution || []).map((entry, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
          </PieChart>
        </div>
      </div>
      <div className="charts-row">
        <div>
          <h4>Last 30 Days Activity</h4>
          <LineChart width={300} height={200} data={stats.last30DaysActivity || []}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#8884d8" />
          </LineChart>
        </div>
        <div>
          <h4>Last 24 Hours Activity</h4>
          <LineChart width={300} height={200} data={stats.last24HoursActivity || []}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#82ca9d" />
          </LineChart>
        </div>
      </div>
      <div className="status-row">
        <table className="status-table">
          <thead>
            <tr>
              <th>Students Status</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {(stats.studentStatus || []).map(row => (
              <tr key={row.status}>
                <td>{row.status}</td>
                <td>{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="hours-list">
          <div>
            <h5>Most active hours</h5>
            <ul>{(stats.mostActiveHours || []).map(h => <li key={h}>{h}</li>)}</ul>
          </div>
          <div>
            <h5>Least active hours</h5>
            <ul>{(stats.leastActiveHours || []).map(h => <li key={h}>{h}</li>)}</ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
