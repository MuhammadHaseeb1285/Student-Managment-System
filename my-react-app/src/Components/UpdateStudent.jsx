import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UpdateStudent.css';

const UpdateStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    rollNumber: '',
    email: '',
    gender: '',
    dob: '',
    city: '',
    interest: '',
    department: '',
    degreeTitle: '',
    subject: '',
    startDate: '',
    endDate: '',
    photo: ''
  });

  useEffect(() => {
    axios.get(`http://localhost:5000/api/students/${id}`)
      .then(res => setFormData({
        fullName: res.data.fullName || res.data.full_name || '',
        rollNumber: res.data.rollNumber || res.data.roll_number || '',
        email: res.data.email || '',
        gender: res.data.gender || '',
        dob: (res.data.dob || res.data.date_of_birth || '').slice(0, 10),
        city: res.data.city || '',
        interest: res.data.interest || '',
        department: res.data.department || '',
        degreeTitle: res.data.degreeTitle || res.data.degree_title || '',
        subject: res.data.subject || '',
        startDate: (res.data.startDate || res.data.start_date || '').slice(0, 10),
        endDate: (res.data.endDate || res.data.end_date || '').slice(0, 10),
        photo: res.data.photo || ''
      }))
      .catch(err => {
        alert('Failed to load student details');
        navigate('/students');
      });
  }, [id, navigate]);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Map camelCase to snake_case for backend
    const payload = {
      full_name: formData.fullName,
      roll_number: formData.rollNumber,
      email: formData.email,
      gender: formData.gender,
      dob: formData.dob,
      city: formData.city,
      interest: formData.interest,
      department: formData.department,
      degree_title: formData.degreeTitle,
      subject: formData.subject,
      start_date: formData.startDate,
      end_date: formData.endDate,
      photo: formData.photo
    };
    axios.put(`http://localhost:5000/api/students/${id}`, payload)
      .then(() => {
        alert('Student updated successfully');
        navigate('/students');
      })
      .catch(err => alert('Update failed'));
  };

  return (
    <div className="update-student-container">
      <h2>Update Student</h2>
      <form className="update-form" onSubmit={handleSubmit}>
        {formData.photo && (
          <div className="photo-preview-block">
            <img src={formData.photo} alt="Student" className="circle-img" style={{width:120, height:120, borderRadius:'50%', objectFit:'cover', marginBottom:'1rem'}} />
          </div>
        )}
        <div className="form-group">
          <label>Full Name</label>
          <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" required />
        </div>
        <div className="form-group">
          <label>Roll Number</label>
          <input name="rollNumber" value={formData.rollNumber} onChange={handleChange} placeholder="Roll Number" required />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
        </div>
        <div className="form-group">
          <label>Gender</label>
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="">Select an option</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>Date of Birth</label>
          <input name="dob" type="date" value={formData.dob} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>City</label>
          <select name="city" value={formData.city} onChange={handleChange} required>
            <option value="">Select a city</option>
            <option value="Rahim Yar Khan">Rahim Yar Khan</option>
            <option value="Lahore">Lahore</option>
            <option value="Islamabad">Islamabad</option>
          </select>
        </div>
        <div className="form-group">
          <label>Interest</label>
          <input name="interest" value={formData.interest} onChange={handleChange} list="interest-options" required />
          <datalist id="interest-options">
            <option value="Blogging" />
            <option value="Reading" />
            <option value="Writing" />
            <option value="Coding" />
          </datalist>
        </div>
        <div className="form-group">
          <label>Department</label>
          <select name="department" value={formData.department} onChange={handleChange} required>
            <option value="">Select an option</option>
            <option value="Dept. of Software Engineering">Dept. of Software Engineering</option>
            <option value="Dept. of Computer Science">Dept. of Computer Science</option>
            <option value="Dept. of Information Technology">Dept. of Information Technology</option>
          </select>
        </div>
        <div className="form-group">
          <label>Degree Title</label>
          <select name="degreeTitle" value={formData.degreeTitle} onChange={handleChange} required>
            <option value="">Select an option</option>
            <option value="Associate Degree">Associate Degree</option>
            <option value="Bachelors Degree">Bachelors Degree</option>
            <option value="M.Phil. Degree">M.Phil. Degree</option>
            <option value="Post-Graduate Diploma">Post-Graduate Diploma</option>
            <option value="Doctorate">Doctorate</option>
            <option value="Post Doctorate">Post Doctorate</option>
          </select>
        </div>
        <div className="form-group">
          <label>Subject</label>
          <input name="subject" value={formData.subject} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Start Date</label>
          <input name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>End Date</label>
          <input name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
        </div>
        <div className="form-buttons">
          <button className="update-button" type="submit">Update</button>
          <button className="cancel-button" type="button" onClick={() => navigate('/students')}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default UpdateStudent;
