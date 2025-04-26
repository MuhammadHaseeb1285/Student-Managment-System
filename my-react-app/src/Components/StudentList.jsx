import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './StudentList.css';
import { useNavigate } from 'react-router-dom';

// Helper to format date as MM/DD/YYYY
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return (
    (d.getMonth() + 1).toString().padStart(2, '0') +
    '/' +
    d.getDate().toString().padStart(2, '0') +
    '/' +
    d.getFullYear()
  );
}

const StudentList = () => {
  const navigate = useNavigate();

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      axios.delete(`http://localhost:5000/api/students/${id}`).then(() => {
        alert('Deleted');
        setStudents(prev => prev.filter(stu => stu.id !== id)); // Remove from local list
      });
    }
  };

  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/students?page=${page}&size=${size}`)
      .then(res => {
        setStudents(res.data.students);
        setTotalPages(res.data.totalPages);
      })
      .catch(err => {
        console.error('Error fetching students:', err.message);
        alert('Failed to fetch students. Please try again later.');
      });
  }, [page, size]);

  return (
    <div className="student-list">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
        <h2 style={{margin:0}}>Students</h2>
        <div style={{display:'flex', gap:'1rem'}}>
          <button className="action-link" style={{backgroundColor:'#2ecc71'}} onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="action-link" style={{backgroundColor:'#9b59b6'}} onClick={() => navigate('/add-student')}>StudentForm</button>
        </div>
      </div>
      <label>Page Size: </label>
      <select onChange={e => setSize(parseInt(e.target.value))} value={size}>
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
      </select>

      <table>
        <thead>
          <tr>
            <th>ID</th><th>Photo</th><th>Name</th><th>Roll Number</th><th>Department</th><th>Degree</th>
            <th>DOB</th><th>City</th><th>Interest</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map(stu => (
            <tr key={stu.id}>
              <td>{stu.id}</td>
              <td>
                {stu.photo ? (
                  <img src={`http://localhost:5000${stu.photo}`} alt="Student" style={{width:40, height:40, borderRadius:'50%', objectFit:'cover'}} />
                ) : (
                  <div style={{width:40, height:40, borderRadius:'50%', background:'#eee', display:'flex', alignItems:'center', justifyContent:'center', color:'#aaa', fontSize:'1.5rem'}}>?</div>
                )}
              </td>
              <td>{stu.full_name}</td>
              <td>{stu.roll_number}</td>
              <td>{stu.department}</td>
              <td>{stu.degree_title}</td>
              <td>{formatDate(stu.dob)}</td>
              <td>{stu.city}</td>
              <td>{stu.interest}</td>
              <td className="action-cell">
                <button className="action-link view" onClick={() => navigate(`/students/${stu.id}`)}>View</button>
                <button className="action-link edit" onClick={() => navigate(`/students/${stu.id}/edit`)}>Edit</button>
                <button className="action-link delete" onClick={() => handleDelete(stu.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination-container">
        <div className="pagination-info">
          Showing page {page} of {totalPages}
        </div>
        <div className="pagination">
          <button className="pagination-button" onClick={() => setPage(1)} disabled={page === 1}>First</button>
          <button className="pagination-button prev" onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>Previous</button>
          <span className="page-number">Page {page} of {totalPages}</span>
          <button className="pagination-button next" onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>Next</button>
          <button className="pagination-button" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</button>
        </div>
      </div>
    </div>
  );
};

export default StudentList;
