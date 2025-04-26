import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ViewStudent.css';

const ViewStudent = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:5000/api/students/${id}`)
      .then(res => setStudent(res.data))
      .catch(err => {
        alert('Error fetching student details');
        navigate('/students');
      });
  }, [id, navigate]);

  if (!student) return <div>Loading...</div>;

  // Map backend keys to AddStudentForm keys for display
  const displayMap = {
    fullName: student.fullName || student.full_name,
    rollNumber: student.rollNumber || student.roll_number,
    email: student.email,
    gender: student.gender,
    dob: student.dob || student.date_of_birth || student.dob,
    city: student.city,
    interest: student.interest,
    department: student.department,
    degreeTitle: student.degreeTitle || student.degree_title,
    subject: student.subject,
    startDate: student.startDate || student.start_date,
    endDate: student.endDate || student.end_date,
    photo: student.photo // assuming photo is a base64 or url
  };

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

  return (
    <div className="view-student-container">
      <h2>Student Details</h2>
      <div className="student-details">
        {displayMap.photo && (
          <div className="photo-preview-block">
            <img src={`http://localhost:5000${displayMap.photo}`} alt="Student" className="circle-img" style={{width:120, height:120, borderRadius:'50%', objectFit:'cover', marginBottom:'1rem'}} />
          </div>
        )}
        <p><strong>Full Name:</strong> {displayMap.fullName}</p>
        <p><strong>Roll Number:</strong> {displayMap.rollNumber}</p>
        <p><strong>Email Address:</strong> {displayMap.email}</p>
        <p><strong>Gender:</strong> {displayMap.gender}</p>
        <p><strong>Date of Birth:</strong> {formatDate(displayMap.dob)}</p>
        <p><strong>City:</strong> {displayMap.city}</p>
        <p><strong>Interest:</strong> {displayMap.interest}</p>
        <p><strong>Department:</strong> {displayMap.department}</p>
        <p><strong>Degree Title:</strong> {displayMap.degreeTitle}</p>
        <p><strong>Subject:</strong> {displayMap.subject}</p>
        <p><strong>Start Date:</strong> {formatDate(displayMap.startDate)}</p>
        <p><strong>End Date:</strong> {formatDate(displayMap.endDate)}</p>
      </div>
      <button className="back-button" onClick={() => navigate('/students')}>Back</button>
    </div>
  );
};

export default ViewStudent;
