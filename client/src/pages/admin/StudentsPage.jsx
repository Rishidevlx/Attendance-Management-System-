import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import skeneticLogo from '../../assets/skenetic-logo.jpg';


// --- ICONS ---
const SearchIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const DownloadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>);
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>);
const DeleteIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>);
const FileDownIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><polyline points="9 15 12 18 15 15"></polyline></svg>);
const AlertTriangleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#991B1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);
const CalendarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const CheckSquareIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>);
const XIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const NoResultsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>);


const StudentFormModal = ({ student, onClose, onSave }) => {
    const [formData, setFormData] = useState({ name: '', email: '', age: '', phone: '', domain: '', password: '' });
    const [error, setError] = useState('');
    const isEditing = !!student;

    useEffect(() => {
        if (isEditing) {
            setFormData({ name: student.name || '', email: student.email || '', age: student.age || '', phone: student.phone || '', domain: student.domain || '', password: '' });
        } else {
             setFormData({ name: '', email: '', age: '', phone: '', domain: '', password: '' });
        }
    }, [student]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!formData.name || !formData.email) { setError('Name and Email are required.'); return; }
        if (!isEditing && !formData.password) { setError('Password is required for new students.'); return; }
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
                        <div className="form-group"><label>Phone</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" maxLength="10" /></div>
                        <div className="form-group"><label>Domain</label><input type="text" name="domain" value={formData.domain} onChange={handleChange} className="input-field" /></div>
                        {!isEditing && ( <div className="form-group"><label>Password</label><input type="password" name="password" value={formData.password} onChange={handleChange} className="input-field" /></div> )}
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

const DeleteConfirmationModal = ({ count, onConfirm, onCancel }) => (
    <div className="modal-overlay" onClick={onCancel}>
        <div className="modal-content" style={{ maxWidth: '480px', padding: '2.5rem' }} onClick={(e) => e.stopPropagation()}>
             <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: '#FEE2E2', borderRadius: '50%', padding: '1rem' }}><AlertTriangleIcon /></div>
            </div>
            <h2 className="modal-title" style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '0.75rem' }}>Delete {count} Student{count > 1 && 's'}?</h2>
            <p style={{ textAlign: 'center', color: 'var(--light-text)', marginBottom: '2.5rem', maxWidth: '350px', margin: '0 auto 2.5rem' }}> This action cannot be undone.</p>
            <div className="modal-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: 0, borderTop: 'none' }}>
                <button className="action-btn" style={{backgroundColor: '#F1F5F9', color: 'var(--dark-text)'}} onClick={onCancel}>Cancel</button>
                <button className="action-btn delete-btn" onClick={onConfirm}>Yes, Delete</button>
            </div>
        </div>
    </div>
);


const StudentsPage = () => {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({text: '', type: ''});
    
    const [domainFilter, setDomainFilter] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);

    const [isSelectMode, setSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const getAuthConfig = () => {
        const token = JSON.parse(localStorage.getItem('user'))?.token;
        if (!token) { showMessage("Authentication error. Please log in again.", 'error'); return null;}
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    const fetchStudents = async () => {
        const config = getAuthConfig();
        if (!config) return;
        try {
            setIsLoading(true);
            const { data } = await axios.get('/api/users/students', config);
            setStudents(data);
        } catch (err) { showMessage('Failed to fetch students.', 'error'); } 
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchStudents(); }, []);

    const handleSaveStudent = async (formData) => {
        const config = getAuthConfig();
        if (!config) return;
        try {
            if (editingStudent) {
                await axios.put(`/api/users/students/${editingStudent._id}`, formData, config);
                showMessage('Student updated successfully!', 'success');
            } else {
                await axios.post('/api/users/students', formData, config);
                showMessage('Student added successfully!', 'success');
            }
            fetchStudents();
            closeModal();
        } catch (err) { showMessage(err.response?.data?.message || 'Failed to save student.', 'error'); }
    };

    const confirmDelete = async () => {
        const config = getAuthConfig();
        if (!config) return;
        
        let idsToDelete = studentToDelete ? [studentToDelete._id] : selectedIds;

        try {
            if (idsToDelete.length === 1) {
                 await axios.delete(`/api/users/students/${idsToDelete[0]}`, config);
            } else {
                 await axios.post(`/api/users/students/bulk-delete`, { ids: idsToDelete }, config);
            }
            showMessage(`${idsToDelete.length} student(s) deleted!`, 'success');
            fetchStudents();
        } catch (err) { showMessage('Failed to delete students.', 'error'); }
        finally { closeDeleteModal(); }
    };
    
    const handleDownloadAll = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text("Skenetic Digital - Student List", 14, 22);
        const img = new Image();
        img.src = skeneticLogo;
        doc.addImage(img, 'JPG', 160, 5, 40, 35); 
        doc.autoTable({
            startY: 40,
            head: [['ID', 'Name', 'Email', 'Join Date', 'Domain']],
            body: filteredStudents.map((s, i) => [`SK${String(i + 1).padStart(3, '0')}`, s.name, s.email, new Date(s.createdAt).toLocaleDateString('en-GB'), s.domain || 'N/A']),
            theme: 'striped', headStyles: { fillColor: [30, 41, 59] }
        });
        doc.save('skenetic-students-list.pdf');
    };

    const handleDownloadSingle = (student) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(22); doc.setTextColor(30, 41, 59);
        doc.text("Student Details", 105, 25, null, null, "center");
        const img = new Image();
        img.src = skeneticLogo;
        doc.addImage(img, 'JPG', 160, 5, 40, 35);
        doc.autoTable({
            startY: 40,
            head: [['Field', 'Details']],
            body: [['ID', `SK${String(students.findIndex(s => s._id === student._id) + 1).padStart(3, '0')}`], ['Name', student.name], ['Email', student.email], ['Join Date', new Date(student.createdAt).toLocaleDateString('en-GB')], ['Age', student.age || 'N/A'], ['Phone', student.phone || 'N/A'], ['Domain', student.domain || 'N/A']],
            theme: 'grid', headStyles: { fillColor: [30, 41, 59] }, columnStyles: { 0: { fontStyle: 'bold' } }
        });
        doc.save(`student-${student.name.replace(/\s/g, '_')}.pdf`);
    };

    const openModal = (student = null) => { setEditingStudent(student); setIsModalOpen(true); };
    const closeModal = () => { setEditingStudent(null); setIsModalOpen(false); };
    const openDeleteModal = (student) => { setStudentToDelete(student); setDeleteModalOpen(true); };
    const closeDeleteModal = () => { setStudentToDelete(null); setDeleteModalOpen(false); setSelectMode(false); setSelectedIds([]); };
    const openBulkDeleteModal = () => { if(selectedIds.length > 0) { setStudentToDelete(null); setDeleteModalOpen(true); }};

    const uniqueDomains = useMemo(() => ['All', ...new Set(students.map(s => s.domain).filter(Boolean))], [students]);

    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const matchesDomain = domainFilter === 'All' || student.domain === domainFilter;
            const matchesSearch = searchTerm === '' || student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.email.toLowerCase().includes(searchTerm.toLowerCase());
            let matchesDate = true;
            if (startDate && endDate) {
                const start = new Date(startDate); start.setHours(0, 0, 0, 0);
                const end = new Date(endDate); end.setHours(23, 59, 59, 999);
                const joinDate = new Date(student.createdAt);
                matchesDate = joinDate >= start && joinDate <= end;
            }
            return matchesDomain && matchesSearch && matchesDate;
        });
    }, [students, domainFilter, startDate, endDate, searchTerm]);
    
    const toggleSelectMode = () => { setSelectMode(!isSelectMode); setSelectedIds([]); };
    const handleSelectOne = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
    const handleSelectAll = () => {
        if (selectedIds.length === filteredStudents.length) { setSelectedIds([]); } 
        else { setSelectedIds(filteredStudents.map(s => s._id)); }
    };

    return (
        <div>
            <style>{`
                .summary-header-wrapper { border-bottom: none; padding-bottom: 0; margin-bottom: 1.5rem; }
                .summary-header { display: flex; justify-content: space-between; align-items: center; }
                .summary-header h2 { font-size: 1.5rem; font-weight: 700; margin: 0; }
                .header-actions { display: flex; align-items: center; gap: 1rem; }
                .action-btn { border: none; padding: 0.75rem 1.25rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; white-space: nowrap; }
                .download-btn { background-color: var(--brand-blue); color: white; }
                .add-student-btn { background-color: var(--brand-blue); color: white; }
                .select-btn { background-color: #F1F5F9; color: var(--dark-text); }
                .select-btn.active { background-color: #E2E8F0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
                .delete-btn { background-color: #EF4444; color: var(--white); }
                .delete-btn:disabled { background-color: #F87171; cursor: not-allowed; }
                .reports-header { background: var(--white); padding: 1.25rem 1.5rem; border-radius: 1rem; border: 1px solid var(--border-color); display: flex; flex-wrap: wrap; align-items: center; gap: 1.5rem; }
                .filter-group { display: flex; align-items: center; gap: 0.5rem; }
                .filter-select, .search-bar input, .date-input { border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 0.75rem; background: #F8FAFC; font-size: 0.9rem; }
                .search-bar { position: relative; flex-grow: 1; }
                .search-bar input { padding-left: 35px; width: 100%; }
                .search-bar svg { position: absolute; left: 10px; top: 13px; color: var(--light-text); }
                .clear-date-btn { background: none; border: none; cursor: pointer; color: var(--light-text); padding: 0.5rem; }
                .student-table { width: 100%; border-collapse: collapse; }
                .student-table th, .student-table td { padding: 1rem; text-align: left; border-bottom: 1px solid var(--border-color); white-space: nowrap; }
                .student-table thead { background-color: #F8FAFC; }
                .student-table th { font-size: 0.8rem; text-transform: uppercase; color: var(--light-text); font-weight: 600; }
                .action-icons { display: flex; gap: 1.25rem; }
                .action-icons button { background: none; border: none; cursor: pointer; color: var(--light-text); }
                .custom-checkbox { width: 18px; height: 18px; accent-color: var(--brand-blue); }
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal-content { background: var(--white); padding: 2.5rem; border-radius: 1rem; width: 100%; max-width: 650px; }
                .modal-title { font-size: 1.75rem; margin-bottom: 2.5rem; text-align: center; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2.5rem; border-top: 1px solid var(--border-color); padding-top: 1.5rem; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem 2rem; }
                .form-group label { font-size: 0.8rem; margin-bottom: 0.5rem; }
                .input-field { width: 100%; padding: 0.7rem; border-radius: 0.5rem; border: 1px solid var(--border-color); }
                .message-box { padding: 1rem; border-radius: 0.5rem; text-align: center; }
                .error-message-box { background-color: #FEE2E2; color: #B91C1C; }
                .success-message-box { background-color: #D1FAE5; color: #047857; position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 1100; }
            `}</style>

            {isModalOpen && <StudentFormModal student={editingStudent} onClose={closeModal} onSave={handleSaveStudent} />}
            {isDeleteModalOpen && <DeleteConfirmationModal count={studentToDelete ? 1 : selectedIds.length} onConfirm={confirmDelete} onCancel={closeDeleteModal} />}
            {message.text && <div className={`message-box ${message.type === 'error' ? 'error-message-box' : 'success-message-box'}`}>{message.text}</div>}

            <div className="summary-header-wrapper">
                <div className="summary-header">
                    <h2>Students</h2>
                    <div className="header-actions">
                        <button className="action-btn add-student-btn" onClick={() => openModal()}><PlusIcon /> Add Student</button>
                        <button className={`action-btn select-btn ${isSelectMode ? 'active' : ''}`} onClick={toggleSelectMode}><CheckSquareIcon/> Select</button>
                        {isSelectMode && (<button className="action-btn delete-btn" onClick={openBulkDeleteModal} disabled={selectedIds.length === 0}><DeleteIcon/> Delete ({selectedIds.length})</button>)}
                        <button className="action-btn download-btn" onClick={handleDownloadAll}><DownloadIcon /> Download All</button>
                    </div>
                </div>
            </div>

            <div className="reports-header">
                 <div className="filter-group">
                    <select className="filter-select" value={domainFilter} onChange={e => setDomainFilter(e.target.value)}>
                        {uniqueDomains.map(domain => <option key={domain} value={domain}>{domain === 'All' ? 'All Domains' : domain}</option>)}
                    </select>
                </div>
                <div className="filter-group">
                    <CalendarIcon/>
                    <input type="date" className="date-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    <span>-</span>
                    <input type="date" className="date-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    {(startDate || endDate) && <button className="clear-date-btn" onClick={() => {setStartDate(''); setEndDate('')}}><XIcon /></button>}
                </div>
                <div className="filter-group search-bar">
                    <SearchIcon />
                    <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="card" style={{ padding: 0, marginTop: '1.5rem' }}>
                {isLoading ? <p style={{ padding: '2rem', textAlign: 'center' }}>Loading...</p> : filteredStudents.length > 0 ? (
                    <table className="student-table">
                        <thead>
                            <tr>
                                {isSelectMode && <th><input type="checkbox" className="custom-checkbox" onChange={handleSelectAll} checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}/></th>}
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Join Date</th>
                                <th>Domain</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student, index) => (
                                <tr key={student._id}>
                                    {isSelectMode && <td><input type="checkbox" className="custom-checkbox" checked={selectedIds.includes(student._id)} onChange={() => handleSelectOne(student._id)}/></td>}
                                    <td>SK{String(index + 1).padStart(3, '0')}</td>
                                    <td>{student.name}</td>
                                    <td>{student.email}</td>
                                    <td>{new Date(student.createdAt).toLocaleDateString('en-GB')}</td>
                                    <td>{student.domain || 'N/A'}</td>
                                    <td>
                                        <div className="action-icons">
                                            <button onClick={() => openModal(student)} title="Edit"><EditIcon /></button>
                                            <button onClick={() => openDeleteModal(student)} title="Delete"><DeleteIcon /></button>
                                            <button onClick={() => handleDownloadSingle(student)} title="Download Details"><FileDownIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 ) : ( <div style={{ textAlign: 'center', padding: '4rem' }}><NoResultsIcon /><h3>No Students Found</h3><p>Try adjusting your filters.</p></div> )}
            </div>
        </div>
    );
};

export default StudentsPage;
