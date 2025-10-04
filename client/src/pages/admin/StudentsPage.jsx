import React, { useState, useEffect } from 'react';
import axios from 'axios';
import skeneticLogo from '../../assets/skenetic-logo.jpg';


// --- ICONS ---
const SearchIcon = () => (<svg xmlns="http://www.w.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const DownloadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>);
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>);
const DeleteIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>);
const FileDownIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><polyline points="9 15 12 18 15 15"></polyline></svg>);


// --- REUSABLE MODAL COMPONENTS (WITH IMPROVED STYLING) ---

const StudentFormModal = ({ student, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '', email: '', age: '', phone: '', domain: '', password: ''
    });
    const [error, setError] = useState('');
    const isEditing = !!student;

    useEffect(() => {
        if (isEditing) {
            setFormData({
                name: student.name || '',
                email: student.email || '',
                age: student.age || '',
                phone: student.phone || '',
                domain: student.domain || '',
                password: '' // Keep password blank for editing
            });
        } else {
             setFormData({ name: '', email: '', age: '', phone: '', domain: '', password: '' });
        }
    }, [student]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!formData.name || !formData.email) {
            setError('Name and Email are required.');
            return;
        }
        if (!isEditing && !formData.password) {
            setError('Password is required for new students.');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">{isEditing ? 'Edit Student Details' : 'Add New Student'}</h2>
                {error && <div className="message-box error-message-box">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group"><label>Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" required /></div>
                        <div className="form-group"><label>Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" required /></div>
                        <div className="form-group"><label>Age</label><input type="number" name="age" value={formData.age} onChange={handleChange} className="input-field" /></div>
                        <div className="form-group"><label>Phone Number</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" maxLength="10" /></div>
                        <div className="form-group"><label>Domain</label><input type="text" name="domain" value={formData.domain} onChange={handleChange} className="input-field" /></div>
                        {!isEditing && (
                             <div className="form-group"><label>Password</label><input type="password" name="password" value={formData.password} onChange={handleChange} className="input-field" /></div>
                        )}
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="action-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="action-btn add-student-btn">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DeleteConfirmationModal = ({ onConfirm, onCancel }) => (
    <div className="modal-overlay" onClick={onCancel}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Are you sure?</h2>
            <p>Do you really want to delete this student? This process cannot be undone.</p>
            <div className="modal-actions">
                <button type="button" className="action-btn" onClick={onCancel}>No, Cancel</button>
                <button type="button" className="action-btn delete-btn" onClick={onConfirm}>Yes, Delete</button>
            </div>
        </div>
    </div>
);


// --- MAIN STUDENT PAGE COMPONENT ---
const StudentsPage = () => {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);

    // --- FIX STARTS HERE ---
    // Helper function to get the auth token and create the config object
    const getAuthConfig = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user?.token;
        if (!token) {
            setError("Authentication error: No token found. Please log in again.");
            return null;
        }
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    };

    const fetchStudents = async () => {
        const config = getAuthConfig();
        if (!config) return; // Stop if there's no token

        try {
            setIsLoading(true);
            const { data } = await axios.get('/api/users/students', config); // Pass config here
            setStudents(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch students. Please try again later.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchStudents(); }, []);

    const handleSaveStudent = async (formData) => {
        const config = getAuthConfig();
        if (!config) return;

        try {
            if (editingStudent) {
                await axios.put(`/api/users/students/${editingStudent._id}`, formData, config);
            } else {
                await axios.post('/api/users/students', formData, config);
            }
            await fetchStudents();
            closeModal();
        } catch (err) { console.error("Failed to save student", err); }
    };

    const handleDeleteStudent = async () => {
        if (!studentToDelete) return;
        const config = getAuthConfig();
        if (!config) return;

        try {
            await axios.delete(`/api/users/students/${studentToDelete._id}`, config);
            await fetchStudents();
            closeDeleteModal();
        } catch (err) { console.error("Failed to delete student", err); }
    };
    // --- FIX ENDS HERE ---
    
    const handleDownloadAll = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text("Skenetic Digital - Student List", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        
        const img = new Image();
        img.src = skeneticLogo;
        doc.addImage(img, 'JPG', 160, 5, 40, 35); 
        
        doc.autoTable({
            startY: 40,
            head: [['ID', 'Name', 'Email', 'Age', 'Phone', 'Domain']],
            body: students.map((s, i) => [`SK${String(i + 1).padStart(3, '0')}`, s.name, s.email, s.age || 'N/A', s.phone || 'N/A', s.domain || 'N/A']),
            theme: 'striped',
            headStyles: { fillColor: [30, 41, 59] }
        });
        
        doc.save('skenetic-students-list.pdf');
    };

    const handleDownloadSingle = (student) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59);
        doc.text("Student Details", 105, 25, null, null, "center");

        const img = new Image();
        img.src = skeneticLogo;
        doc.addImage(img, 'JPG', 160, 5, 40, 35);
        
        doc.autoTable({
            startY: 40,
            head: [['Field', 'Details']],
            body: [
                ['Student ID', student._id],
                ['Name', student.name],
                ['Email', student.email],
                ['Age', student.age || 'N/A'],
                ['Phone', student.phone || 'N/A'],
                ['Domain', student.domain || 'N/A'],
            ],
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59] },
            columnStyles: { 0: { fontStyle: 'bold' } }
        });

        doc.save(`student-${student.name.replace(/\s/g, '_')}.pdf`);
    };

    const openModal = (student = null) => { setEditingStudent(student); setIsModalOpen(true); };
    const closeModal = () => setIsModalOpen(false);
    const openDeleteModal = (student) => { setStudentToDelete(student); setDeleteModalOpen(true); };
    const closeDeleteModal = () => setDeleteModalOpen(false);
    
    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.domain && student.domain.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <style>{`
                .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .search-bar { position: relative; width: 320px; }
                .search-bar input { width: 100%; height: 44px; padding-left: 40px; border: 1px solid var(--border-color); border-radius: 0.5rem; font-size: 0.9rem; }
                .search-bar svg { position: absolute; left: 12px; top: 12px; color: var(--light-text); }
                .header-actions { display: flex; gap: 1rem; }
                .action-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background-color: var(--white); font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
                .action-btn:hover { background-color: #f8fafc; }
                .add-student-btn { background-color: var(--brand-blue); color: var(--white); border-color: var(--brand-blue); }
                .add-student-btn:hover { background-color: #003ECC; }
                .delete-btn { background-color: #EF4444; color: var(--white); border-color: #EF4444; }
                .delete-btn:hover { background-color: #B91C1C; }
                .student-table-wrapper { overflow-x: auto; }
                .student-table { width: 100%; border-collapse: collapse; }
                .student-table th, .student-table td { padding: 1rem; text-align: left; border-bottom: 1px solid var(--border-color); white-space: nowrap; }
                .student-table thead { background-color: #F8FAFC; }
                .student-table th { font-size: 0.8rem; text-transform: uppercase; color: var(--light-text); font-weight: 600; }
                .student-table tbody tr:hover { background-color: #F8FAFC; }
                .action-icons { display: flex; gap: 1.25rem; }
                .action-icons button { background: none; border: none; cursor: pointer; color: var(--light-text); transition: color 0.2s ease; padding: 0; }
                .action-icons button:hover { color: var(--brand-blue); }
                .loading-container, .error-container { text-align: center; padding: 4rem; color: var(--light-text); }
                
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(5px); animation: fadeIn 0.3s ease-out; }
                .modal-content { background: var(--white); padding: 2.5rem; border-radius: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.1); width: 100%; max-width: 650px; animation: zoomIn 0.3s ease-out; }
                .modal-title { font-size: 1.75rem; font-weight: 700; margin-bottom: 2.5rem; text-align: center; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2.5rem; border-top: 1px solid var(--border-color); padding-top: 1.5rem; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem 2rem; }
                .form-group { display: flex; flex-direction: column; }
                .form-group label { font-size: 0.8rem; font-weight: 500; margin-bottom: 0.5rem; color: var(--dark-text); }
                .input-field { width: 100%; padding: 0.7rem; border-radius: 0.5rem; border: 1px solid var(--border-color); box-sizing: border-box; }
                .message-box { padding: 1rem; margin-bottom: 1.5rem; border-radius: 0.5rem; text-align: center; }
                .error-message-box { background-color: #FEE2E2; color: #B91C1C; }
            `}</style>

            {isModalOpen && <StudentFormModal student={editingStudent} onClose={closeModal} onSave={handleSaveStudent} />}
            {isDeleteModalOpen && <DeleteConfirmationModal onConfirm={handleDeleteStudent} onCancel={closeDeleteModal} />}

            <div className="page-header">
                <div className="search-bar">
                    <SearchIcon />
                    <input type="text" placeholder="Search by name, email, domain..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="header-actions">
                    <button className="action-btn" onClick={handleDownloadAll}><DownloadIcon /> Download All</button>
                    <button className="action-btn add-student-btn" onClick={() => openModal()}><PlusIcon /> Add Student</button>
                </div>
            </div>

            {isLoading ? (<div className="loading-container">Loading student data...</div>) 
            : error ? (<div className="error-container">{error}</div>) 
            : (
                <div className="student-table-wrapper">
                    <table className="student-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Age</th>
                                <th>Phone Number</th>
                                <th>Domain</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student, index) => (
                                <tr key={student._id}>
                                    <td>SK{String(index + 1).padStart(3, '0')}</td>
                                    <td>{student.name}</td>
                                    <td>{student.email}</td>
                                    <td>{student.age || 'N/A'}</td>
                                    <td>{student.phone || 'N/A'}</td>
                                    <td>{student.domain || 'N/A'}</td>
                                    <td>
                                        <div className="action-icons">
                                            <button onClick={() => openModal(student)}><EditIcon /></button>
                                            <button onClick={() => openDeleteModal(student)}><DeleteIcon /></button>
                                            <button onClick={() => handleDownloadSingle(student)}><FileDownIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StudentsPage;
