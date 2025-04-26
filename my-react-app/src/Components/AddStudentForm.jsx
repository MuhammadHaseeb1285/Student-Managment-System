import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import Slider from '@mui/material/Slider';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import getCroppedImg from '../utils/cropImage';
import './AddStudentForm.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AddStudentForm = () => {
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
  });

  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [isDone, setIsDone] = useState(false);

  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result);
        setCroppedImage(null);
        setIsDone(false);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const createCroppedImage = useCallback(async () => {
    try {
      const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCroppedImage(cropped);
      setIsDone(true);  // set isDone to true once cropping is done
    } catch (err) {
      console.error(err);
    }
  }, [imageSrc, croppedAreaPixels]);

  // Helper to convert image URL to base64
  const getBase64FromUrl = async (url) => {
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('full_name', formData.fullName);
    form.append('roll_number', formData.rollNumber);
    form.append('email', formData.email);
    form.append('gender', formData.gender);
    form.append('dob', formData.dob);
    form.append('city', formData.city);
    form.append('interest', formData.interest);
    form.append('department', formData.department);
    form.append('degree_title', formData.degreeTitle);
    form.append('subject', formData.subject);
    form.append('start_date', formData.startDate);
    form.append('end_date', formData.endDate);
    // If croppedImage exists, convert it to a File and append
    if (croppedImage) {
      const response = await fetch(croppedImage);
      const blob = await response.blob();
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      form.append('photo', file);
    } else if (fileInputRef.current && fileInputRef.current.files[0]) {
      form.append('photo', fileInputRef.current.files[0]);
    }
    try {
      await axios.post('http://localhost:5000/api/students', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Student added successfully!');
      handleCancel();
    } catch (err) {
      alert('Failed to add student.');
    }
  };

  const handleCancel = () => {
    setFormData({
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
    });
    setImageSrc(null);
    setCroppedImage(null);
    setIsDone(false);
  };

  return (
    
    <div className="form-wrapper">
        <div className="nav-links">
          <button className="action-link" style={{backgroundColor:'#2ecc71'}} onClick={() => window.location.href='/dashboard'}>Dashboard</button>
          <button className="action-link" style={{backgroundColor:'#9b59b6'}} onClick={() => window.location.href='/students'}>Student List</button>
        </div>
      <h2 className="form-heading">Add Student</h2>
      <form onSubmit={handleSubmit} className="form-layout">
        {/* Image upload and preview at top, centered and side-by-side */}
        <div className="image-row">
          <div className="image-upload-flex">
            <div className="photo-selector">
              {/* Show cropper in the circle if cropping, else show image or camera icon */}
              <div className="camera-circle" onClick={() => !imageSrc && fileInputRef.current.click()} style={{ cursor: 'pointer', position: 'relative' }}>
                {imageSrc && !isDone ? (
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    cropShape="round"
                    showGrid={false}
                  />
                ) : croppedImage ? (
                  <img src={croppedImage} alt="Cropped Preview" className="circle-img" />
                ) : (
                  <PhotoCameraIcon fontSize="large" style={{ color: '#888' }} />
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={onFileChange}
                />
              </div>
              {/* Controls below the circle */}
              {imageSrc && !isDone && (
                <div className="controls" style={{ marginTop: 8 }}>
                  <Slider
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={(e, z) => setZoom(z)}
                  />
                  <button
                    type="button"
                    className="action-button"
                    onClick={createCroppedImage}
                  >
                    Done
                  </button>
                </div>
              )}
              {croppedImage && isDone && (
                <div className="controls" style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    className="action-button"
                    onClick={() => setIsDone(false)}
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Two fields per row below image section */}
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Roll Number</label>
          <input
            type="text"
            name="rollNumber"
            value={formData.rollNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select an option</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>City</label>
          <select
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          >
            <option value="">Select a city</option>
            <option value="Rahim Yar Khan">Rahim Yar Khan</option>
            <option value="Lahore">Lahore</option>
            <option value="Islamabad">Islamabad</option>
          </select>
        </div>
        <div className="form-group">
          <label>Interest</label>
          <input
            type="text"
            name="interest"
            value={formData.interest}
            onChange={handleChange}
            list="interest-options"
            required
          />
          <datalist id="interest-options">
            <option value="Blogging" />
            <option value="Reading" />
            <option value="Writing" />
            <option value="Coding" />
          </datalist>
        </div>
        <div className="form-group">
          <label>Department</label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          >
            <option value="">Select an option</option>
            <option value="Dept. of Software Engineering">
              Dept. of Software Engineering
            </option>
            <option value="Dept. of Computer Science">
              Dept. of Computer Science
            </option>
            <option value="Dept. of Information Technology">
              Dept. of Information Technology
            </option>
          </select>
        </div>
        <div className="form-group">
          <label>Degree Title</label>
          <select
            name="degreeTitle"
            value={formData.degreeTitle}
            onChange={handleChange}
            required
          >
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
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-buttons">
          <button type="submit">Create</button>
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudentForm;
