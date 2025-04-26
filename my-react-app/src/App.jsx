import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AddStudentForm from './Components/AddStudentForm.jsx';
import StudentList from './Components/StudentList.jsx'; // ✅ Import this
import ViewStudent from './Components/ViewStudent.jsx';
import UpdateStudent from './Components/UpdateStudent.jsx';
import Dashboard from './Components/Dashboard.jsx';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/add-student" element={<AddStudentForm />} />
        <Route path="/students" element={<StudentList />} />
        <Route path="/students/:id" element={<ViewStudent />} />
        <Route path="/students/:id/edit" element={<UpdateStudent />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
