import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Clipboard, Menu, Search, User, Users, X, Plus, RefreshCw } from 'lucide-react';
import axios from 'axios';

const BASE_URL = 'https://attendance-backend-rqkf.onrender.com';

const AttendanceTrackerApp = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedDesignation, setSelectedDesignation] = useState('all');
  const [activeSection, setActiveSection] = useState('student');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    rollNo: '',
    empId: '',
    academicYear: '',
    designation: '',
    type: 'student',
  });

  // Fetch attendance records
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      const date = selectedDate.getDate();

      const response = await axios.get(`${BASE_URL}/api/attendance`, {
        params: { date, month, year, type: activeSection },
      });
      setAttendanceRecords(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, activeSection]);

  // Filter logic
  const designations = ['all', ...new Set(attendanceRecords
    .filter(record => record.type === 'staff')
    .map(member => member.designation))];

  const filteredRecords = attendanceRecords.filter(record => {
    if (activeSection === 'student') {
      return (
        (selectedYear === 'all' || record.academicYear === parseInt(selectedYear)) &&
        record.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      return (
        (selectedDesignation === 'all' || record.designation === selectedDesignation) &&
        (record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.designation.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
  });

  // Date handling
  const formatDate = (date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  // Add user
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      const date = selectedDate.getDate();

      await axios.post(`${BASE_URL}/api/attendance`, {
        ...newUser,
        academicYear: parseInt(newUser.academicYear),
        date,
        month,
        year,
      });

      fetchData();
      setShowAddUserModal(false);
      setNewUser({
        name: '',
        rollNo: '',
        empId: '',
        academicYear: '',
        designation: '',
        type: 'student',
      });
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Loading screen */}
      {isLoading && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-blue-600 border-b-blue-300 border-l-blue-500 border-r-blue-400 rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-medium text-blue-800">Loading Attendance System...</h2>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:relative z-30 bg-gradient-to-b from-blue-800 to-indigo-900 text-white w-64 h-full shadow-lg transition-transform duration-300 ease-in-out flex flex-col`}>
        <div className="p-6 bg-gradient-to-r from-blue-700 to-blue-900 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Clipboard className="h-6 w-6 mr-2 bg-white text-blue-800 p-1 rounded-md" />
              ECE Dept
            </h1>
            <p className="text-blue-200 text-sm mt-1 ml-9">Attendance</p>
          </div>
          <button className="md:hidden text-white" onClick={() => setSidebarOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-md z-10">
          <div className="px-4 sm:px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <button className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
              <h2 className="text-lg font-medium bg-gradient-to-r from-blue-700 to-indigo-600 text-transparent bg-clip-text">
                Attendance Management
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button 
                className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                onClick={fetchData}
                title="Refresh Attendance List"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <button 
                className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-colors"
                onClick={() => setShowAddUserModal(true)}
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Date selector */}
            <div className="mb-6 bg-white p-5 rounded-xl shadow-md flex justify-between items-center">
              <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                <span className="text-lg font-medium">{formatDate(selectedDate)}</span>
              </div>
              <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-100 rounded-full">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex fonctions-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  className="pl-10 pr-4 py-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {activeSection === 'student' ? (
                <select 
                  className="px-4 py-3 border rounded-lg w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="all">All Years</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              ) : (
                <select
                  className="px-4 py-3 border rounded-lg w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedDesignation}
                  onChange={(e) => setSelectedDesignation(e.target.value)}
                >
                  <option value="all">All Designations</option>
                  {designations.filter(d => d !== 'all').map(designation => (
                    <option key={designation} value={designation}>{designation}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Section toggle */}
            <div className="mb-6 bg-white rounded-xl overflow-hidden shadow-md">
              <div className="flex border-b">
                <button
                  className={`flex-1 py-4 ${activeSection === 'student' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'} flex items-center justify-center gap-2`}
                  onClick={() => setActiveSection('student')}
                >
                  <Users className={`h-5 w-5 ${activeSection === 'student' ? 'text-blue-600' : ''}`} />
                  Students
                </button>
                <button
                  className={`flex-1 py-4 ${activeSection === 'staff' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'} flex items-center justify-center gap-2`}
                  onClick={() => setActiveSection('staff')}
                >
                  <User className={`h-5 w-5 ${activeSection === 'staff' ? 'text-blue-600' : ''}`} />
                  Staff
                </button>
              </div>
            </div>

            {/* Scrollable Attendance Table */}
            <div className="bg-white rounded-xl shadow-md overflow-x-auto">
              <div className="relative max-h-[400px] overflow-y-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-blue-50 sticky top-0 z-10">
                    <tr>
                      {activeSection === 'student' ? (
                        <>
                          <th className="min-w-[100px] px-6 py-4 text-left">Roll No</th>
                          <th className="min-w-[200px] px-6 py-4 text-left">Name</th>
                          <th className="min-w-[120px] px-6 py-4 text-left">Academic Year</th>
                        </>
                      ) : (
                        <>
                          <th className="min-w-[100px] px-6 py-4 text-left">Emp ID</th>
                          <th className="min-w-[200px] px-6 py-4 text-left">Name</th>
                          <th className="min-w-[200px] px-6 py-4 text-left">Designation</th>
                        </>
                      )}
                      <th className="min-w-[120px] px-6 py-4 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr key={record._id} className="hover:bg-blue-50 transition-colors">
                        {activeSection === 'student' ? (
                          <>
                            <td className="min-w-[100px] px-6 py-4">{record.rollNo}</td>
                            <td className="min-w-[200px] px-6 py-4">{record.name}</td>
                            <td className="min-w-[120px] px-6 py-4">{record.academicYear}</td>
                          </>
                        ) : (
                          <>
                            <td className="min-w-[100px] px-6 py-4">{record.empId}</td>
                            <td className="min-w-[200px] px-6 py-4">{record.name}</td>
                            <td className="min-w-[200px] px-6 py-4">{record.designation}</td>
                          </>
                        )}
                        <td className="min-w-[120px] px-6 py-4">
                          <span className={`px-3 py-1 rounded-full whitespace-nowrap ${record.present ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {record.present ? 'Present' : 'Absent'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add New User</h2>
              <form onSubmit={handleAddUser}>
                <div className="mb-4">
                  <label className="block text-gray-700">Type</label>
                  <select
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newUser.type}
                    onChange={(e) => setNewUser({...newUser, type: e.target.value})}
                  >
                    <option value="student">Student</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    required
                  />
                </div>
                {newUser.type === 'student' ? (
                  <>
                    <div className="mb-4">
                      <label className="block text-gray-700">Roll No</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newUser.rollNo}
                        onChange={(e) => setNewUser({...newUser, rollNo: e.target.value})}
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700">Academic Year</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newUser.academicYear}
                        onChange={(e) => setNewUser({...newUser, academicYear: e.target.value})}
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-4">
                      <label className="block text-gray-700">Employee ID</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newUser.empId}
                        onChange={(e) => setNewUser({...newUser, empId: e.target.value})}
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700">Designation</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newUser.designation}
                        onChange={(e) => setNewUser({...newUser, designation: e.target.value})}
                        required
                      />
                    </div>
                  </>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={() => setShowAddUserModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceTrackerApp;