import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Trophy, Users, Calendar, Plus, Trash2, Save, X,
  Medal, Activity, LayoutDashboard, UserPlus,
  ChevronRight, CheckCircle2, AlertCircle, Pencil, Table2, Filter, Camera, RotateCcw, Settings, Zap
} from 'lucide-react';

// --- UI Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700",
    danger: "bg-red-50 hover:bg-red-100 text-red-600",
    success: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20",
    outline: "border-2 border-slate-200 text-slate-600 hover:border-indigo-500 hover:text-indigo-500"
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, type = "text", className = "", min, max }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    min={min}
    max={max}
    className={`w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all ${className}`}
  />
);

const Select = ({ value, onChange, options, placeholder, className = "" }) => (
  <select
    value={value}
    onChange={onChange}
    className={`w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none bg-white transition-all ${className}`}
  >
    <option value="">{placeholder}</option>
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-700",
    indigo: "bg-indigo-100 text-indigo-700",
    green: "bg-emerald-100 text-emerald-700",
    orange: "bg-orange-100 text-orange-700",
    rose: "bg-rose-100 text-rose-700",
    red: "bg-red-100 text-red-700",
    slate: "bg-slate-100 text-slate-600"
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${colors[color] || colors.slate}`}>
      {children}
    </span>
  );
};

// --- Helper Functions ---

const getCategory = (cls) => {
  const c = parseInt(cls);
  if (c >= 1 && c <= 3) return 'Junior (1-3)';
  if (c >= 4 && c <= 6) return 'Middle (4-6)';
  if (c >= 7 && c <= 10) return 'Senior (7-10)';
  return 'Unknown';
};

const DEFAULT_GAMES = [
  'Badminton', 'Carrom (1vs1)', 'Carrom (2vs2)', 'Chess', 'Ludo', 'Slow Cycle Race', 
  'Race', 'Sack Race', 'Spoon Race', 'High Jump', 'Long Jump', 'Skipping', 'Musical Chair', 'Discus Throw'
];

// --- Main Application ---

export default function App() {
  const [activeTab, setActiveTab] = useState('admin');

  // --- User Role State ---
  const [userRole, setUserRole] = useState(() => {
    const saved = localStorage.getItem('sports_user_role');
    return saved || 'admin'; // default to admin
  });

  // --- Admin Login State ---
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    const saved = localStorage.getItem('sports_admin_logged_in');
    return saved === 'true';
  });

  const [adminLoginForm, setAdminLoginForm] = useState({
    username: '',
    password: ''
  });

  // --- Teacher Login State ---
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState(() => {
    const saved = localStorage.getItem('sports_teacher_logged_in');
    return saved === 'true';
  });

  const [loggedInTeacherId, setLoggedInTeacherId] = useState(() => {
    const saved = localStorage.getItem('sports_logged_in_teacher_id');
    return saved || '';
  });

  const [teacherLoginForm, setTeacherLoginForm] = useState({
    username: '',
    password: ''
  });

  // --- Admin Active Section State ---
  const [activeAdminSection, setActiveAdminSection] = useState('assign');
  
  // --- Selected Game for Assignment ---
  const [selectedGameForAssign, setSelectedGameForAssign] = useState('');

  // --- Teacher Identification State ---
  const [currentTeacherId, setCurrentTeacherId] = useState(() => {
    const saved = localStorage.getItem('sports_current_teacher_id');
    return saved || '';
  });

  // --- State ---

  const [games, setGames] = useState(() => {
    const saved = localStorage.getItem('sports_games');
    return saved ? JSON.parse(saved) : DEFAULT_GAMES;
  });

  const [newGameName, setNewGameName] = useState('');

  const [gameConfigs, setGameConfigs] = useState(() => {
    const saved = localStorage.getItem('sports_game_configs');
    if (saved) {
      return JSON.parse(saved);
    }
    // Set default player counts for specific games
    return {
      'Carrom (1vs1)': 2,
      'Carrom (2vs2)': 4
    };
  });

  const [teachers, setTeachers] = useState(() => {
    const saved = localStorage.getItem('sports_teachers');
    return saved ? JSON.parse(saved) : [];
  });

  // Teacher credentials: stored in localStorage with format: { teacherId: { username, password } }
  const [teacherCredentials, setTeacherCredentials] = useState(() => {
    const saved = localStorage.getItem('sports_teacher_credentials');
    return saved ? JSON.parse(saved) : {};
  });

  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherUsername, setNewTeacherUsername] = useState('');
  const [newTeacherPassword, setNewTeacherPassword] = useState('');

  const [gameTeacherAssignments, setGameTeacherAssignments] = useState(() => {
    const saved = localStorage.getItem('sports_game_teachers');
    return saved ? JSON.parse(saved) : {};
  });

  const [openTeacherDropdown, setOpenTeacherDropdown] = useState(false);
  const [selectedTeachersForGame, setSelectedTeachersForGame] = useState([]);

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('sports_students');
    return saved ? JSON.parse(saved) : [];
  });

  const [matches, setMatches] = useState(() => {
    const saved = localStorage.getItem('sports_matches');
    return saved ? JSON.parse(saved) : [];
  });

  // Registration Form State
  const [regForm, setRegForm] = useState({
    name: '',
    rollNumber: '',
    fatherName: '',
    photo: '',
    classVal: '',
    gender: '',
    sports: []
  });

  const [editingId, setEditingId] = useState(null);

  // Student Profile Detail View
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Image Preview State
  const [previewImage, setPreviewImage] = useState(null);

  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState('user'); // 'user' for front, 'environment' for rear
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Filter State
  const [filters, setFilters] = useState({
    category: '',
    gender: '',
    classVal: '',
    sport: ''
  });

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Match Schedule State
  const [scheduleForm, setScheduleForm] = useState({
    sport: '',
    category: '', // e.g. 'Juniors (4-5)-Boys'
    playerCount: 2, // Number of players to select
    playerIds: [] // Array of selected player IDs
  });

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('sports_games', JSON.stringify(games));
    localStorage.setItem('sports_game_configs', JSON.stringify(gameConfigs));
    localStorage.setItem('sports_students', JSON.stringify(students));
    localStorage.setItem('sports_matches', JSON.stringify(matches));
    localStorage.setItem('sports_user_role', userRole);
    localStorage.setItem('sports_teachers', JSON.stringify(teachers));
    localStorage.setItem('sports_game_teachers', JSON.stringify(gameTeacherAssignments));
    localStorage.setItem('sports_admin_logged_in', isAdminLoggedIn ? 'true' : 'false');
    localStorage.setItem('sports_current_teacher_id', currentTeacherId);
    localStorage.setItem('sports_teacher_logged_in', isTeacherLoggedIn ? 'true' : 'false');
    localStorage.setItem('sports_logged_in_teacher_id', loggedInTeacherId);
    localStorage.setItem('sports_teacher_credentials', JSON.stringify(teacherCredentials));
  }, [games, gameConfigs, students, matches, userRole, teachers, gameTeacherAssignments, isAdminLoggedIn, currentTeacherId, isTeacherLoggedIn, loggedInTeacherId, teacherCredentials]);

  // --- Close Teacher Dropdown on Outside Click ---
  // --- Close Teacher Dropdown on Outside Click ---
  useEffect(() => {
    if (!openTeacherDropdown) return;

    const handleClickOutside = (e) => {
      const dropdown = document.getElementById('teacherDropdownContainer');
      if (dropdown && !dropdown.contains(e.target)) {
        setOpenTeacherDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openTeacherDropdown]);
  // --- Auto navigate based on role ---
  useEffect(() => {
    if (userRole === 'teacher') {
      if (isTeacherLoggedIn) {
        setActiveTab('dashboard');
      } else {
        setActiveTab('teacher-login');
      }
    } else if (userRole === 'admin') {
      setActiveTab('admin');
    }
  }, [userRole, isTeacherLoggedIn]);

  // --- Auto Logout When Role Changes ---
  useEffect(() => {
    if (userRole !== 'admin' && isAdminLoggedIn) {
      handleAdminLogout();
    }
    
    // Auto logout teacher when switching away from teacher role
    if (userRole !== 'teacher' && isTeacherLoggedIn) {
      handleTeacherLogout();
    }
  }, [userRole]);

  // --- Logic & Handlers ---

  const addGame = () => {
    if (!newGameName.trim()) return;
    if (games.includes(newGameName.trim())) {
      alert('This game already exists!');
      return;
    }
    setGames([...games, newGameName.trim()]);
    setNewGameName('');
  };

  const removeGame = (gameName) => {
    if (confirm(`Remove "${gameName}" from the games list?`)) {
      setGames(games.filter(g => g !== gameName));
    }
  };

  const resetGames = () => {
    if (confirm('Reset to default games list?')) {
      setGames(DEFAULT_GAMES);
    }
  };

  const addTeacher = () => {
    if (!newTeacherName.trim() || !newTeacherUsername.trim() || !newTeacherPassword.trim()) {
      alert('Please fill in all teacher details (name, username, password)');
      return;
    }
    
    const newTeacher = {
      id: Date.now().toString(),
      name: newTeacherName.trim()
    };
    
    // Add teacher credentials
    setTeacherCredentials({
      ...teacherCredentials,
      [newTeacher.id]: {
        username: newTeacherUsername.trim(),
        password: newTeacherPassword.trim()
      }
    });
    
    setTeachers([...teachers, newTeacher]);
    setNewTeacherName('');
    setNewTeacherUsername('');
    setNewTeacherPassword('');
  };

  const removeTeacher = (teacherId) => {
    if (confirm('Remove this teacher?')) {
      setTeachers(teachers.filter(t => t.id !== teacherId));
      const newAssignments = { ...gameTeacherAssignments };
      Object.keys(newAssignments).forEach(game => {
        newAssignments[game] = newAssignments[game].filter(id => id !== teacherId);
      });
      setGameTeacherAssignments(newAssignments);
      
      // Remove teacher credentials
      const newCredentials = { ...teacherCredentials };
      delete newCredentials[teacherId];
      setTeacherCredentials(newCredentials);
    }
  };

  const getTeachersForGame = (gameName) => {
    return (gameTeacherAssignments[gameName] || []).map(id => 
      teachers.find(t => t.id === id)
    ).filter(Boolean);
  };

  // --- Admin Login Handler ---
  const handleAdminLogin = () => {
    const { username, password } = adminLoginForm;
    
    // Simple validation - you can customize credentials here
    if (username === 'admin' && password === 'admin123') {
      setIsAdminLoggedIn(true);
      setAdminLoginForm({ username: '', password: '' });
    } else {
      alert('Invalid username or password. Use admin / admin123');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminLoginForm({ username: '', password: '' });
  };

  const handleTeacherLogin = () => {
    const { username, password } = teacherLoginForm;
    
    // Check credentials against teacher credentials
    for (const [teacherId, creds] of Object.entries(teacherCredentials)) {
      if (creds.username === username && creds.password === password) {
        setIsTeacherLoggedIn(true);
        setLoggedInTeacherId(teacherId);
        setTeacherLoginForm({ username: '', password: '' });
        return;
      }
    }
    
    alert('Invalid username or password. Please check your credentials.');
  };

  const handleTeacherLogout = () => {
    setIsTeacherLoggedIn(false);
    setLoggedInTeacherId('');
    setTeacherLoginForm({ username: '', password: '' });
  };
  // --- Get Teacher's Assigned Game (uses logged in teacher for teacher role, currentTeacherId for admin) ---
  const getTeacherAssignedGame = () => {
    const teacherId = userRole === 'teacher' && isTeacherLoggedIn ? loggedInTeacherId : currentTeacherId;
    if (!teacherId) return null;
    
    for (const [game, teacherIds] of Object.entries(gameTeacherAssignments)) {
      if (teacherIds.includes(teacherId)) {
        return game;
      }
    }
    return null;
  };

  // --- Get Filtered Students for Teacher ---
  const getTeacherStudents = () => {
    const assignedGame = getTeacherAssignedGame();
    if (!assignedGame) return students;
    return students.filter(student => student.sports && student.sports.includes(assignedGame));
  };

  // --- Get Filtered Matches for Teacher ---
  const getTeacherMatches = () => {
    const assignedGame = getTeacherAssignedGame();
    if (!assignedGame) return matches;
    return matches.filter(match => match.sport === assignedGame);
  };

  // --- Get Filtered Games for Teacher ---
  const getTeacherGames = () => {
    if (userRole === 'teacher' && isTeacherLoggedIn) {
      // Get games assigned to this teacher
      const assignedGames = [];
      for (const [game, teacherIds] of Object.entries(gameTeacherAssignments)) {
        if (teacherIds.includes(loggedInTeacherId)) {
          assignedGames.push(game);
        }
      }
      return assignedGames;
    }
    return games;
  };

  // Get sport status for a student: 'not-played', 'playing', or 'played'
  const getSportStatus = (studentId, sportName) => {
    // Check if student has played (finished match)
    const playedMatch = matches.find(m => 
      m.sport === sportName && 
      m.status === 'finished' && 
      m.playerIds && 
      m.playerIds.includes(studentId)
    );
    if (playedMatch) return 'played'; // Green

    // Check if student is currently playing (scheduled match)
    const playingMatch = matches.find(m => 
      m.sport === sportName && 
      m.status === 'scheduled' && 
      m.playerIds && 
      m.playerIds.includes(studentId)
    );
    if (playingMatch) return 'playing'; // Yellow

    // Not played yet
    return 'not-played'; // Red
  };

  const updateGamePlayerCount = (gameName, playerCount) => {
    setGameConfigs({
      ...gameConfigs,
      [gameName]: playerCount
    });
  };

  const getGamePlayerCount = (gameName) => {
    return gameConfigs[gameName] || 2; // Default to 2 players (1v1)
  };

  const isGamePlayerCountFixed = (gameName) => {
    // Games with fixed player counts that cannot be changed
    const fixedGames = ['Carrom (1vs1)', 'Carrom (2vs2)'];
    return fixedGames.includes(gameName);
  };

  const handleStudentSubmit = () => {
    if (!regForm.name || !regForm.rollNumber || !regForm.fatherName || !regForm.classVal || !regForm.gender || regForm.sports.length === 0) return;

    const studentData = {
      name: regForm.name,
      rollNumber: regForm.rollNumber,
      fatherName: regForm.fatherName,
      photo: regForm.photo,
      classVal: parseInt(regForm.classVal),
      gender: regForm.gender,
      category: getCategory(regForm.classVal),
      sports: regForm.sports
    };

    if (editingId) {
      // Update existing
      setStudents(students.map(s => s.id === editingId ? { ...s, ...studentData } : s));
      // Keep the profile modal open to show updated data
      setSelectedStudentId(editingId);
      setEditingId(null);
    } else {
      // Create new
      const newStudent = {
        id: Date.now().toString(),
        ...studentData
      };
      setStudents([...students, newStudent]);
      setSelectedStudentId(newStudent.id);
    }

    setRegForm({ name: '', rollNumber: '', fatherName: '', photo: '', classVal: '', gender: '', sports: [] });
  };

  const startEdit = (student) => {
    setEditingId(student.id);
    setRegForm({
      name: student.name,
      rollNumber: student.rollNumber || '',
      fatherName: student.fatherName || '',
      photo: student.photo || '',
      classVal: student.classVal,
      gender: student.gender,
      sports: student.sports
    });
    setActiveTab('register');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setRegForm({ name: '', rollNumber: '', fatherName: '', photo: '', classVal: '', gender: '', sports: [] });
  };

  const toggleSportSelection = (sport) => {
    if (regForm.sports.includes(sport)) {
      setRegForm({ ...regForm, sports: regForm.sports.filter(s => s !== sport) });
    } else {
      if (regForm.sports.length >= 3) return; // Max 3 limit
      setRegForm({ ...regForm, sports: [...regForm.sports, sport] });
    }
  };

  const deleteStudent = (id) => {
    if (confirm("Remove this student?")) {
      setStudents(students.filter(s => s.id !== id));
      setMatches(matches.filter(m => m.p1Id !== id && m.p2Id !== id));
    }
  };

  const scheduleMatch = () => {
    if (!scheduleForm.sport || scheduleForm.playerIds.length !== scheduleForm.playerCount) return;

    const newMatch = {
      id: Date.now().toString(),
      sport: scheduleForm.sport,
      category: scheduleForm.category,
      playerIds: scheduleForm.playerIds,
      winnerId: null,
      status: 'scheduled',
      timestamp: new Date().toISOString()
    };

    setMatches([...matches, newMatch]);
    setScheduleForm({ sport: '', category: '', playerCount: 2, playerIds: [] });
  };

  const declareWinner = (matchId, winnerId) => {
    setMatches(matches.map(m => {
      if (m.id === matchId) {
        // For Carrom (2vs2), winnerId should be an array of 2 player IDs
        // For other games, winnerId is a single player ID
        const isTeamGame = m.sport === 'Carrom (2vs2)';
        return {
          ...m,
          winnerId: isTeamGame ? (Array.isArray(winnerId) ? winnerId : [winnerId]) : winnerId,
          status: 'finished'
        };
      }
      return m;
    }));
  };

  const togglePlayerSelection = (playerId) => {
    if (scheduleForm.playerIds.includes(playerId)) {
      setScheduleForm({
        ...scheduleForm,
        playerIds: scheduleForm.playerIds.filter(id => id !== playerId)
      });
    } else {
      if (scheduleForm.playerIds.length < scheduleForm.playerCount) {
        setScheduleForm({
          ...scheduleForm,
          playerIds: [...scheduleForm.playerIds, playerId]
        });
      }
    }
  };

  const deleteMatch = (id) => setMatches(matches.filter(m => m.id !== id));

  const resetFilters = () => {
    setFilters({ category: '', gender: '', classVal: '', sport: '' });
  };

  // --- Camera Logic ---

  const startCamera = async (facingMode = 'user') => {
    try {
      setIsCameraOpen(true);
      setCameraFacingMode(facingMode);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please ensure permissions are granted.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
    setCameraFacingMode('user');
  };

  const switchCamera = async () => {
    const newFacingMode = cameraFacingMode === 'user' ? 'environment' : 'user';
    await startCamera(newFacingMode);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setRegForm(prev => ({ ...prev, photo: dataUrl }));
      stopCamera();
    }
  };

  // --- Derived Data for UI ---

  // Dashboard Stats
  const stats = useMemo(() => {
    return {
      totalStudents: students.length,
      totalMatches: matches.length,
      matchesPending: matches.filter(m => m.status === 'scheduled').length,
      matchesFinished: matches.filter(m => m.status === 'finished').length,
      byCategory: {
        juniors: students.filter(s => s.category.includes('Junior')).length,
        middle: students.filter(s => s.category.includes('Middle')).length,
        seniors: students.filter(s => s.category.includes('Senior')).length,
      }
    };
  }, [students, matches]);

  // Filtering Logic for Filter Tab
  const filteredStudentsList = useMemo(() => {
    let studentsList = students;
    
    // If teacher is viewing, filter by their assigned game
    if (userRole === 'teacher' && currentTeacherId) {
      const teacherStudents = getTeacherStudents();
      studentsList = teacherStudents;
    }
    
    return studentsList.filter(student => {
      const matchCategory = filters.category ? student.category === filters.category : true;
      const matchGender = filters.gender ? student.gender === filters.gender : true;
      const matchClass = filters.classVal ? student.classVal.toString() === filters.classVal : true;
      const matchSport = filters.sport ? student.sports.includes(filters.sport) : true;
      
      // Search filter - search by name, roll number, or father's name
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = searchTerm ? 
        student.name.toLowerCase().includes(searchLower) ||
        student.rollNumber.toLowerCase().includes(searchLower) ||
        student.fatherName.toLowerCase().includes(searchLower)
        : true;
      
      return matchCategory && matchGender && matchClass && matchSport && matchSearch;
    });
  }, [students, filters, searchTerm, userRole, currentTeacherId]);

  // Filtering Logic for Scheduler
  const eligiblePlayers = useMemo(() => {
    if (!scheduleForm.sport) return [];

    // 1. Get IDs of players who have ALREADY played or are scheduled for this sport
    const busyPlayerIds = new Set();
    matches.forEach(m => {
      if (m.sport === scheduleForm.sport) {
        // Handle both old format (p1Id, p2Id) and new format (playerIds array)
        if (m.playerIds && Array.isArray(m.playerIds)) {
          m.playerIds.forEach(id => busyPlayerIds.add(id));
        } else {
          // Fallback for old format
          if (m.p1Id) busyPlayerIds.add(m.p1Id);
          if (m.p2Id) busyPlayerIds.add(m.p2Id);
        }
      }
    });

    // 2. Filter students: Must play this sport AND not be in the busy list
    let pool = students.filter(s =>
      s.sports.includes(scheduleForm.sport) &&
      !busyPlayerIds.has(s.id)
    );

    return pool;
  }, [students, matches, scheduleForm.sport]);

  const availableCategoriesForSport = useMemo(() => {
    if (!scheduleForm.sport) return [];
    const cats = new Set();
    // Only show categories that have at least 2 eligible players remaining
    // Or just show all categories present in the eligible pool
    eligiblePlayers.forEach(s => {
      cats.add(`${s.category} - ${s.gender}`);
    });
    return Array.from(cats).sort();
  }, [eligiblePlayers, scheduleForm.sport]);

  const autoScheduleAllMatches = () => {
    // Only schedule if a sport is selected
    if (!scheduleForm.sport) {
      alert('Please select a sport first');
      return;
    }

    const newMatches = [];
    const selectedSport = scheduleForm.sport;
    const playerCount = getGamePlayerCount(selectedSport);
    
    // Group eligible players by the selected sport and category
    const matchGroups = {};
    
    eligiblePlayers.forEach(player => {
      const playerData = students.find(s => s.id === player.id);
      if (!playerData) return;
      
      // Only include players who have registered for the selected sport
      if (!playerData.sports.includes(selectedSport)) return;
      
      const category = `${player.category} - ${player.gender}`;
      const groupKey = `${selectedSport}|${category}`;
      
      if (!matchGroups[groupKey]) {
        matchGroups[groupKey] = [];
      }
      
      // Add player only once
      if (!matchGroups[groupKey].includes(player.id)) {
        matchGroups[groupKey].push(player.id);
      }
    });

    // Create one round of matches for each category group
    Object.entries(matchGroups).forEach(([groupKey, playerIds]) => {
      if (playerIds.length < playerCount) return; // Need minimum players
      
      const [sport, category] = groupKey.split('|');
      
      // Shuffle players randomly
      const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
      
      // Create only ONE round of matches (first batch of shuffled players)
      // Each player appears in at most one match for this sport-category
      for (let i = 0; i + playerCount <= shuffled.length; i += playerCount) {
        const matchPlayerIds = shuffled.slice(i, i + playerCount);
        
        // Check if match already exists
        const matchExists = matches.some(m => 
          m.sport === sport && 
          m.category === category &&
          m.status === 'scheduled' &&
          JSON.stringify(m.playerIds.sort()) === JSON.stringify(matchPlayerIds.sort())
        );
        
        if (!matchExists && matchPlayerIds.length === playerCount) {
          newMatches.push({
            id: Date.now().toString() + Math.random(),
            sport: sport,
            category: category,
            playerIds: matchPlayerIds,
            winnerId: null,
            status: 'scheduled',
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    if (newMatches.length > 0) {
      setMatches([...matches, ...newMatches]);
    } else {
      alert('No eligible students found to schedule matches for this sport');
    }
  };

  const filteredPlayersForMatch = useMemo(() => {
    if (!scheduleForm.category) return [];
    const [catName, gender] = scheduleForm.category.split(' - ');
    let players = eligiblePlayers.filter(s => s.category === catName && s.gender === gender);
    
    // If teacher is viewing, filter by their assigned game
    if (userRole === 'teacher' && currentTeacherId) {
      const teacherGame = getTeacherAssignedGame();
      if (teacherGame) {
        players = players.filter(s => s.sports.includes(teacherGame));
      }
    }
    
    return players;
  }, [eligiblePlayers, scheduleForm.category, userRole, currentTeacherId]);


  // --- Render Views ---

  const renderAdmin = () => {
    // Show login page if not logged in
    if (!isAdminLoggedIn) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
          <Card className="w-full max-w-md p-8 border-indigo-200 shadow-2xl">
            <div className="text-center mb-8">
              <Settings size={48} className="mx-auto text-indigo-600 mb-4" />
              <h1 className="text-3xl font-bold text-slate-800">Admin Login</h1>
              <p className="text-slate-500 mt-2">Access admin control panel</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                <Input
                  type="text"
                  value={adminLoginForm.username}
                  onChange={(e) => setAdminLoginForm({ ...adminLoginForm, username: e.target.value })}
                  placeholder="Enter username"
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <Input
                  type="password"
                  value={adminLoginForm.password}
                  onChange={(e) => setAdminLoginForm({ ...adminLoginForm, password: e.target.value })}
                  placeholder="Enter password"
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                />
              </div>

              <Button onClick={handleAdminLogin} className="w-full mt-6">
                <Pencil size={16} /> Login
              </Button>

              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800 font-semibold">Demo Credentials:</p>
                <p className="text-xs text-amber-700 mt-1">Username: <span className="font-mono font-bold">admin</span></p>
                <p className="text-xs text-amber-700">Password: <span className="font-mono font-bold">admin123</span></p>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // Show admin panel if logged in
    return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Logout Button */}
      <div className="flex justify-end">
        <Button onClick={handleAdminLogout} variant="danger">
          <X size={16} /> Logout
        </Button>
      </div>

      {/* Admin Navigation Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setActiveAdminSection('assign')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeAdminSection === 'assign'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Assign Game
        </button>
        <button
          onClick={() => setActiveAdminSection('manageGames')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeAdminSection === 'manageGames'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Manage Games
        </button>
        <button
          onClick={() => setActiveAdminSection('manageTeachers')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeAdminSection === 'manageTeachers'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Manage Teachers
        </button>
      </div>

      {/* Assign by Game Section */}
      {activeAdminSection === 'assign' && teachers.length > 0 && games.length > 0 && (
        <Card className="p-6 border-indigo-100 shadow-sm overflow-visible">
          <h3 className="font-semibold text-slate-800 mb-4">Assign Teachers to Game</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-visible">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Select Game</label>
              <select
                id="quickAssignGame"
                value={selectedGameForAssign}
                onChange={(e) => {
                  setSelectedGameForAssign(e.target.value);
                  setSelectedTeachersForGame([]);
                }}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
              >
                <option value="">Choose a game...</option>
                {games.map(game => (
                  <option key={game} value={game}>
                    {game}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Select Teachers</label>
              <div className="relative" id="teacherDropdownContainer">
                <button
                  onClick={() => setOpenTeacherDropdown(!openTeacherDropdown)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white text-left text-slate-700 font-medium flex justify-between items-center"
                >
                  <span>{selectedTeachersForGame.length > 0 ? `${selectedTeachersForGame.length} teacher(s) selected` : 'Select teachers...'}</span>
                  <span className="text-slate-400">▼</span>
                </button>
                
                {openTeacherDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                    {(() => {
                      // Find all teachers assigned to any game
                      const allAssignedTeacherIds = new Set();
                      Object.values(gameTeacherAssignments).forEach(teacherIds => {
                        teacherIds.forEach(id => allAssignedTeacherIds.add(id));
                      });
                      
                      // Filter to show only teachers NOT assigned to any game
                      const availableTeachers = teachers.filter(teacher => !allAssignedTeacherIds.has(teacher.id));
                      
                      if (availableTeachers.length === 0) {
                        return (
                          <div className="px-4 py-3 text-sm text-slate-500 text-center">
                            All teachers are already assigned to games
                          </div>
                        );
                      }
                      
                      return availableTeachers.map(teacher => (
                        <label key={teacher.id} className="flex items-center px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0">
                          <input
                            type="checkbox"
                            checked={selectedTeachersForGame.includes(teacher.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTeachersForGame([...selectedTeachersForGame, teacher.id]);
                              } else {
                                setSelectedTeachersForGame(selectedTeachersForGame.filter(id => id !== teacher.id));
                              }
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 cursor-pointer"
                          />
                          <span className="ml-3 text-sm text-slate-700">{teacher.name}</span>
                        </label>
                      ));
                    })()}
                  </div>
                )}
                
                {selectedTeachersForGame.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedTeachersForGame.map(teacherId => {
                      const teacher = teachers.find(t => t.id === teacherId);
                      return (
                        <span key={teacherId} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                          {teacher?.name}
                          <button
                            onClick={() => setSelectedTeachersForGame(selectedTeachersForGame.filter(id => id !== teacherId))}
                            className="hover:text-indigo-900 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button
            onClick={() => {
              const selectedGame = selectedGameForAssign;
              const selectedTeachers = selectedTeachersForGame;
              
              if (!selectedGame) {
                alert('Please select a game');
                return;
              }
              
              if (selectedTeachers.length === 0) {
                alert('Please select a teacher');
                return;
              }
              
              setGameTeacherAssignments({
                ...gameTeacherAssignments,
                [selectedGame]: selectedTeachers
              });
              
              setSelectedGameForAssign('');
              setSelectedTeachersForGame([]);
              setOpenTeacherDropdown(false);
              alert(`${selectedTeachers.length} teacher(s) assigned to ${selectedGame}`);
            }}
            className="mt-4 w-full"
          >
            <Save size={16} /> Assign Teachers to Game
          </Button>

          {/* Game Assignments List */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h4 className="font-semibold text-slate-800 mb-4">Games with Assigned Teachers</h4>
            {Object.keys(gameTeacherAssignments).length === 0 ? (
              <div className="text-center py-4 text-slate-400 text-sm">
                <p>No teachers assigned to any game yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {games.map(game => {
                  const assignedTeachers = gameTeacherAssignments[game] || [];
                  if (assignedTeachers.length === 0) return null;
                  
                  const teacherNames = assignedTeachers
                    .map(id => teachers.find(t => t.id === id)?.name)
                    .filter(Boolean);
                  
                  return (
                    <div key={game} className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="font-medium text-emerald-900 mb-2">{game}</div>
                      <div className="flex flex-wrap gap-2">
                        {teacherNames.map((name, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 bg-emerald-200 text-emerald-800 text-xs font-semibold rounded">
                            ✓ {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      )}

      {activeAdminSection === 'assign' && (teachers.length === 0 || games.length === 0) && (
        <Card className="p-6 bg-amber-50 border-amber-200">
          <div className="flex gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">Add Games and Teachers First</p>
              <p className="text-amber-700 mt-1">You need to add at least one game and one teacher before you can assign them.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Manage Games Section */}
      {activeAdminSection === 'manageGames' && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Manage Games</h2>
            <Button onClick={resetGames} variant="secondary" className="text-xs">
              <RotateCcw size={14} /> Reset to Default
            </Button>
          </div>

          <Card className="p-6 border-indigo-100 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">Add New Game</h3>
            <div className="flex gap-2">
              <Input
                value={newGameName}
                onChange={e => setNewGameName(e.target.value)}
                placeholder="e.g., Relay Race, Tug of War, etc."
                onKeyPress={(e) => e.key === 'Enter' && addGame()}
              />
              <Button onClick={addGame} className="px-6">
                <Plus size={16} /> Add
              </Button>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 p-4">
              <h3 className="font-semibold text-slate-800">Current Games List</h3>
              <p className="text-xs text-slate-500 mt-1">
                {games.length} game{games.length !== 1 ? 's' : ''} available for registration
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
              {games.length === 0 ? (
                <div className="col-span-full text-center py-8 text-slate-400">
                  <AlertCircle className="mx-auto mb-2" size={40} />
                  <p>No games added yet. Start by adding your first game!</p>
                </div>
              ) : (
                games.map(game => (
                  <div key={game} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors">
                    <div className="flex-1">
                      <span className="font-medium text-slate-800">{game}</span>
                      <div className="text-xs text-slate-500 mt-1">Players per match: <span className="font-bold text-indigo-600">{getGamePlayerCount(game)}</span></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <button
                          onClick={() => updateGamePlayerCount(game, Math.max(2, getGamePlayerCount(game) - 1))}
                          className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded transition-colors"
                          title="Decrease players"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="2"
                          max="20"
                          value={getGamePlayerCount(game)}
                          onChange={(e) => updateGamePlayerCount(game, Math.max(2, parseInt(e.target.value) || 2))}
                          className="w-12 px-2 py-1 text-xs text-center border border-slate-300 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                        />
                        <button
                          onClick={() => updateGamePlayerCount(game, Math.min(20, getGamePlayerCount(game) + 1))}
                          className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded transition-colors"
                          title="Increase players"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeGame(game)}
                        className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded transition-colors"
                        title="Remove Game"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </>
      )}

      {/* Manage Teachers Section */}
      {activeAdminSection === 'manageTeachers' && (
        <Card className="p-6 border-indigo-100 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Manage Teachers & Credentials</h3>
          
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-indigo-800 font-semibold mb-2">Add New Teacher</p>
            <p className="text-xs text-indigo-700 mb-4">Create login credentials for each teacher. Teachers will use these to access their assigned games.</p>
            
            <div className="space-y-3">
              <Input
                value={newTeacherName}
                onChange={e => setNewTeacherName(e.target.value)}
                placeholder="Teacher Name (e.g., Mr. Sharma, Mrs. Patel)"
              />
              <Input
                value={newTeacherUsername}
                onChange={e => setNewTeacherUsername(e.target.value)}
                placeholder="Username for login (e.g., sharma_mr)"
              />
              <Input
                type="password"
                value={newTeacherPassword}
                onChange={e => setNewTeacherPassword(e.target.value)}
                placeholder="Password for login"
                onKeyPress={(e) => e.key === 'Enter' && addTeacher()}
              />
              <Button onClick={addTeacher} className="w-full">
                <Plus size={16} /> Add Teacher with Credentials
              </Button>
            </div>
          </div>
          
          {teachers.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">
              <AlertCircle className="mx-auto mb-2" size={32} />
              <p>No teachers added yet. Add your first teacher to assign them to games.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {teachers.map(teacher => {
                const creds = teacherCredentials[teacher.id];
                const assignedGame = Object.entries(gameTeacherAssignments).find(([_, teacherIds]) => 
                  teacherIds.includes(teacher.id)
                )?.[0];
                
                return (
                  <div key={teacher.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-bold text-slate-800">{teacher.name}</div>
                        {creds && (
                          <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                            <div><span className="font-semibold">Username:</span> {creds.username}</div>
                            <div><span className="font-semibold">Password:</span> {creds.password}</div>
                          </div>
                        )}
                        {assignedGame && (
                          <div className="text-xs text-indigo-600 font-semibold mt-1">Assigned to: {assignedGame}</div>
                        )}
                      </div>
                      <button
                        onClick={() => removeTeacher(teacher.id)}
                        className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded transition-colors"
                        title="Remove Teacher"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Info Box */}
      {activeAdminSection === 'manageGames' && (
        <Card className="p-4 bg-blue-50 border-blue-100 border">
          <div className="flex gap-3">
            <CheckCircle2 size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Games will appear in Registration Form</p>
              <p className="text-blue-700">Any game you add or remove here will automatically be updated in the student registration form and match scheduling options.</p>
            </div>
          </div>
        </Card>
      )}
    </div>
    );
  };

  const renderTeacherLogin = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <Card className="w-full max-w-md p-8 border-indigo-200 shadow-2xl">
        <div className="text-center mb-8">
          <Activity size={48} className="mx-auto text-indigo-600 mb-4" />
          <h1 className="text-3xl font-bold text-slate-800">Teacher Login</h1>
          <p className="text-slate-500 mt-2">Access your sports management portal</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
            <Input
              type="text"
              value={teacherLoginForm.username}
              onChange={(e) => setTeacherLoginForm({ ...teacherLoginForm, username: e.target.value })}
              placeholder="Enter your username"
              onKeyPress={(e) => e.key === 'Enter' && handleTeacherLogin()}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <Input
              type="password"
              value={teacherLoginForm.password}
              onChange={(e) => setTeacherLoginForm({ ...teacherLoginForm, password: e.target.value })}
              placeholder="Enter your password"
              onKeyPress={(e) => e.key === 'Enter' && handleTeacherLogin()}
            />
          </div>

          <Button onClick={handleTeacherLogin} className="w-full mt-6">
            <Activity size={16} /> Login as Teacher
          </Button>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800 font-semibold">Credentials provided by your admin</p>
            <p className="text-xs text-blue-700 mt-1">Contact your administrator if you don't have login credentials</p>
          </div>
        </div>
      </Card>
    </div>
  );

  // --- Render Views ---

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
          <div className="text-indigo-600 mb-2"><Users size={24} /></div>
          <div className="text-2xl font-bold text-slate-800">{stats.totalStudents}</div>
          <div className="text-xs font-semibold text-slate-500 uppercase">Total Participants</div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <div className="text-emerald-600 mb-2"><Trophy size={24} /></div>
          <div className="text-2xl font-bold text-slate-800">{stats.matchesFinished}</div>
          <div className="text-xs font-semibold text-slate-500 uppercase">Matches Completed</div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-amber-50 to-white border-amber-100">
          <div className="text-amber-600 mb-2"><Calendar size={24} /></div>
          <div className="text-2xl font-bold text-slate-800">{stats.matchesPending}</div>
          <div className="text-xs font-semibold text-slate-500 uppercase">Scheduled</div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-white border-purple-100">
          <div className="text-purple-600 mb-2"><Activity size={24} /></div>
          <div className="text-2xl font-bold text-slate-800">
            {matches.length > 0 ? Math.round((stats.matchesFinished / stats.totalMatches) * 100) : 0}%
          </div>
          <div className="text-xs font-semibold text-slate-500 uppercase">Progress</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Participation Breakdown */}
        <Card className="p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users size={18} className="text-indigo-500" /> Category Breakdown
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 text-sm font-medium">Junior (Class 1-3)</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400" style={{ width: `${(stats.byCategory.juniors / (stats.totalStudents || 1)) * 100}%` }}></div>
                </div>
                <span className="text-sm font-bold text-slate-700">{stats.byCategory.juniors}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 text-sm font-medium">Middle (Class 4-6)</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400" style={{ width: `${(stats.byCategory.middle / (stats.totalStudents || 1)) * 100}%` }}></div>
                </div>
                <span className="text-sm font-bold text-slate-700">{stats.byCategory.middle}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 text-sm font-medium">Senior (Class 7-10)</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400" style={{ width: `${(stats.byCategory.seniors / (stats.totalStudents || 1)) * 100}%` }}></div>
                </div>
                <span className="text-sm font-bold text-slate-700">{stats.byCategory.seniors}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Results */}
        <Card className="p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Medal size={18} className="text-amber-500" /> Recent Winners
          </h3>
          <div className="space-y-3">
            {matches.filter(m => m.status === 'finished').slice(-4).reverse().map(match => {
              let winnerDisplay = '';
              if (match.sport === 'Carrom (2vs2)' && Array.isArray(match.winnerId)) {
                // For team games, show both winners
                const winners = students.filter(s => match.winnerId.includes(s.id));
                winnerDisplay = winners.map(w => w?.name || 'Unknown').join(' & ');
              } else {
                // For individual games, show single winner
                const winner = students.find(s => s.id === match.winnerId);
                winnerDisplay = winner?.name || 'Unknown';
              }
              return (
                <div key={match.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{winnerDisplay}</div>
                    <div className="text-xs text-slate-500">{match.sport} • {match.category}</div>
                  </div>
                  <Badge color="orange">Winner{match.sport === 'Carrom (2vs2)' ? 's' : ''}</Badge>
                </div>
              );
            })}
            {matches.filter(m => m.status === 'finished').length === 0 && (
              <p className="text-sm text-slate-400 italic">No matches completed yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderRegistration = () => (
    <div className="max-w-xl mx-auto animate-in fade-in duration-500">
      <Card className="p-6 border-indigo-100 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            {editingId ? <Pencil size={20} className="text-amber-600" /> : <UserPlus size={20} className="text-indigo-600" />}
            {editingId ? 'Edit Student Details' : 'Register New Student'}
          </h3>
          {editingId && (
            <button onClick={cancelEdit} className="text-sm text-slate-500 hover:text-red-500 underline">
              Cancel Edit
            </button>
          )}
        </div>

        <div className="flex flex-col-reverse md:flex-row gap-6">
          {/* Left Column: Personal Details */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Full Name</label>
              <Input
                value={regForm.name}
                onChange={e => setRegForm({ ...regForm, name: e.target.value })}
                placeholder="e.g. Rahul Kumar"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Roll Number</label>
                <Input
                  value={regForm.rollNumber}
                  onChange={e => setRegForm({ ...regForm, rollNumber: e.target.value })}
                  placeholder="e.g. 101"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Father's Name</label>
                <Input
                  value={regForm.fatherName}
                  onChange={e => setRegForm({ ...regForm, fatherName: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Class (4-10)</label>
                <Input
                  type="number"
                  min="4" max="10"
                  value={regForm.classVal}
                  onChange={e => setRegForm({ ...regForm, classVal: e.target.value })}
                  placeholder="Class"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Gender</label>
                <Select
                  value={regForm.gender}
                  onChange={e => setRegForm({ ...regForm, gender: e.target.value })}
                  options={[
                    { value: 'Boys', label: 'Boy' },
                    { value: 'Girls', label: 'Girl' }
                  ]}
                  placeholder="Select..."
                />
              </div>
            </div>
          </div>

          {/* Right Column: Profile Photo */}
          <div className="flex flex-col items-center justify-start pt-2">
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase text-center">Photo</label>

            {isCameraOpen ? (
              <div className="relative w-48 h-48 bg-black rounded-xl overflow-hidden shadow-md flex flex-col">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-4">
                  <button
                    onClick={capturePhoto}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    title="Capture"
                  >
                    <div className="w-8 h-8 rounded-full border-2 border-slate-300 bg-red-500"></div>
                  </button>
                  <button
                    onClick={switchCamera}
                    className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors"
                    title="Switch Camera"
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button
                    onClick={stopCamera}
                    className="w-10 h-10 bg-slate-800/80 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-700 transition-colors"
                    title="Cancel"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 items-center">
                <div
                  onClick={startCamera}
                  className="relative group cursor-pointer w-32 h-32 rounded-full border-4 border-slate-100 hover:border-indigo-100 overflow-hidden transition-all shadow-sm bg-slate-50 flex items-center justify-center"
                >
                  {regForm.photo ? (
                    <img src={regForm.photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-300 group-hover:text-indigo-400 transition-colors">
                      <Camera size={40} />
                      <span className="text-[10px] uppercase font-bold mt-1">Camera</span>
                    </div>
                  )}

                  {/* Hover Overlay for camera trigger */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    {!regForm.photo && <Camera className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" size={32} />}
                    {regForm.photo && (
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); startCamera(); }}
                          className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-slate-700 hover:text-indigo-600 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                          title="Retake Photo"
                        >
                          <Camera size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setRegForm({ ...regForm, photo: '' }); }}
                          className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-slate-700 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                          title="Remove Photo"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => document.getElementById('photo-upload').click()}
                    className="px-4 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-indigo-200 rounded-lg transition-all flex items-center gap-2 shadow-sm"
                  >
                    Upload Image
                  </button>
                </div>

                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setRegForm(prev => ({ ...prev, photo: reader.result }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase flex justify-between">
            Select Sports
            <span className={`text-xs ${regForm.sports.length === 3 ? 'text-red-500' : 'text-slate-400'}`}>
              {regForm.sports.length}/3 Selected
            </span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {games.map(game => (
              <button
                key={game}
                onClick={() => toggleSportSelection(game)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all text-left ${regForm.sports.includes(game)
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                  }`}
              >
                {game}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleStudentSubmit}
          className={`w-full mt-2 ${editingId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : ''}`}
          disabled={!regForm.name || !regForm.rollNumber || !regForm.fatherName || !regForm.classVal || !regForm.gender || regForm.sports.length === 0}
        >
          {editingId ? 'Update Student' : 'Register Student'}
        </Button>
      </Card>

      {!editingId && (
        <div className="text-center mt-6 text-slate-500 text-sm">
          Want to see the list? Go to the <button onClick={() => setActiveTab('participants')} className="text-indigo-600 font-bold hover:underline">Participants Tab</button>.
        </div>
      )
      }
    </div >
  );

  const renderParticipants = () => (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Participants</h2>
        <div className="flex gap-2">
          {userRole === 'admin' && (
            <Button onClick={() => setActiveTab('register')} variant="secondary">
              <Plus size={16} /> Add New
            </Button>
          )}
          <Button onClick={resetFilters} variant="secondary" className="text-xs">
            <X size={14} /> Reset Filters
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <Card className="p-4 bg-indigo-50 border-indigo-100 shadow-sm">
        <Input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search by name, roll number, or father's name..."
          className="w-full"
        />
      </Card>

      {/* Filter Section */}
      <Card className="p-6 border-indigo-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Category</label>
            <Select
              value={filters.category}
              onChange={e => setFilters({ ...filters, category: e.target.value })}
              options={[
                { value: 'Junior (1-3)', label: 'Junior (1-3)' },
                { value: 'Middle (4-6)', label: 'Middle (4-6)' },
                { value: 'Senior (7-10)', label: 'Senior (7-10)' }
              ]}
              placeholder="All Categories"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Gender</label>
            <Select
              value={filters.gender}
              onChange={e => setFilters({ ...filters, gender: e.target.value })}
              options={[
                { value: 'Boys', label: 'Boys' },
                { value: 'Girls', label: 'Girls' }
              ]}
              placeholder="All Genders"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Class</label>
            <Select
              value={filters.classVal}
              onChange={e => setFilters({ ...filters, classVal: e.target.value })}
              options={Array.from({ length: 7 }, (_, i) => i + 4).map(c => ({ value: c.toString(), label: `Class ${c}` }))}
              placeholder="All Classes"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Sport</label>
            <Select
              value={filters.sport}
              onChange={e => setFilters({ ...filters, sport: e.target.value })}
              options={games.map(s => ({ value: s, label: s }))}
              placeholder="All Sports"
            />
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
        <CheckCircle2 size={16} className="text-emerald-500" />
        Found <strong>{filteredStudentsList.length}</strong> matching participants
      </div>

      {/* Participants Table */}
      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <th className="p-4 font-semibold">Roll No</th>
              <th className="p-4 font-semibold">Photo</th>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Class</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Gender</th>
              <th className="p-4 font-semibold">Sports</th>
              <th className="p-4 font-semibold">Father's Name</th>
              {userRole === 'admin' && <th className="p-4 font-semibold text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudentsList.length === 0 ? (
              <tr>
                <td colSpan={userRole === 'admin' ? '9' : '8'} className="p-8 text-center text-slate-400">
                  No participants match your filters.
                </td>
              </tr>
            ) : (
              filteredStudentsList.map(student => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-800">{student.rollNumber}</td>
                  <td className="p-4">
                    {student.photo ? (
                      <button
                        onClick={() => setPreviewImage(student.photo)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <img 
                          src={student.photo} 
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover border border-indigo-200"
                        />
                      </button>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300">
                        <Users size={16} className="text-slate-400" />
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-bold text-slate-800">
                    <button 
                      onClick={() => setSelectedStudentId(student.id)}
                      className="text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer transition-colors"
                    >
                      {student.name}
                    </button>
                  </td>
                  <td className="p-4 text-slate-600">{student.classVal}</td>
                  <td className="p-4"><Badge color="slate">{student.category}</Badge></td>
                  <td className="p-4 text-slate-600">{student.gender}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {student.sports.map(s => {
                        const status = getSportStatus(student.id, s);
                        let statusColor = 'bg-red-100 text-red-700 border-red-200'; // not-played
                        if (status === 'playing') {
                          statusColor = 'bg-yellow-100 text-yellow-700 border-yellow-200'; // playing
                        } else if (status === 'played') {
                          statusColor = 'bg-green-100 text-green-700 border-green-200'; // played
                        }
                        
                        return (
                          <span key={s} className={`px-1.5 py-0.5 rounded text-xs border font-medium ${statusColor}`}>
                            {s}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 text-xs">{student.fatherName}</td>
                  {userRole === 'admin' && (
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(student)}
                          className="p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-500 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => deleteStudent(student.id)}
                          className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* Student Detail Modal */}
      {selectedStudentId && (() => {
        const student = students.find(s => s.id === selectedStudentId);
        if (!student) return null;
        
        const matchesForStudent = matches.filter(m => m.playerIds && m.playerIds.includes(student.id));
        
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Student Profile</h2>
                  <button 
                    onClick={() => setSelectedStudentId(null)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Photo Section */}
                  <div className="flex flex-col items-center justify-center">
                    {student.photo ? (
                      <button
                        onClick={() => setPreviewImage(student.photo)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <img 
                          src={student.photo} 
                          alt={student.name}
                          className="w-40 h-40 rounded-full object-cover border-4 border-indigo-200 mb-4 hover:shadow-lg transition-shadow"
                        />
                      </button>
                    ) : (
                      <div className="w-40 h-40 rounded-full bg-slate-200 flex items-center justify-center border-4 border-slate-300 mb-4">
                        <Users size={64} className="text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Information Section */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase">Full Name</label>
                        <p className="text-lg font-bold text-slate-800">{student.name}</p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase">Roll Number</label>
                        <p className="text-lg font-bold text-slate-800">{student.rollNumber}</p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase">Class</label>
                        <p className="text-lg font-bold text-slate-800">{student.classVal}</p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase">Category</label>
                        <Badge color="indigo">{student.category}</Badge>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase">Gender</label>
                        <p className="text-lg font-bold text-slate-800">{student.gender}</p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase">Father's Name</label>
                        <p className="text-lg font-bold text-slate-800">{student.fatherName}</p>
                      </div>
                    </div>

                    {/* Sports Section */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Registered Sports</label>
                      <div className="flex flex-wrap gap-2">
                        {student.sports.map(s => {
                          const status = getSportStatus(student.id, s);
                          let statusColor = 'rose'; // not-played (red)
                          if (status === 'playing') {
                            statusColor = 'orange'; // playing (yellow)
                          } else if (status === 'played') {
                            statusColor = 'green'; // played
                          }
                          
                          return (
                            <Badge key={s} color={statusColor}>{s}</Badge>
                          );
                        })}
                      </div>
                    </div>

                    {/* Matches Section */}
                    {matchesForStudent.length > 0 && (
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Matches Participated</label>
                        <div className="space-y-2">
                          {matchesForStudent.map(match => (
                            <div key={match.id} className="p-2 bg-slate-50 rounded border border-slate-200 text-sm">
                              <div className="font-semibold text-slate-700">{match.sport}</div>
                              <div className="text-xs text-slate-500">{match.category} • {match.status === 'finished' ? '✓ Completed' : 'Scheduled'}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200 flex gap-2">
                  <Button onClick={() => { startEdit(student); setSelectedStudentId(null); }} variant="primary" className="flex-1">
                    <Pencil size={16} /> Edit Profile
                  </Button>
                  <Button onClick={() => setSelectedStudentId(null)} variant="secondary" className="flex-1">
                    Close
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        );
      })()}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative flex flex-col items-center">
            <img 
              src={previewImage} 
              alt="Preview"
              className="max-w-lg max-h-96 rounded-lg object-contain"
            />
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 bg-white rounded-full p-2 hover:bg-slate-200 transition-colors shadow-lg"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderFilters = () => (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Filter Participants</h2>
        <Button onClick={resetFilters} variant="secondary" className="text-xs">
          <X size={14} /> Reset Filters
        </Button>
      </div>

      <Card className="p-6 border-indigo-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Category</label>
            <Select
              value={filters.category}
              onChange={e => setFilters({ ...filters, category: e.target.value })}
              options={[
                { value: 'Juniors (4-5)', label: 'Juniors (4-5)' },
                { value: 'Middle (6-7)', label: 'Middle (6-7)' },
                { value: 'Seniors (8-10)', label: 'Seniors (8-10)' }
              ]}
              placeholder="All Categories"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Gender</label>
            <Select
              value={filters.gender}
              onChange={e => setFilters({ ...filters, gender: e.target.value })}
              options={[
                { value: 'Boys', label: 'Boys' },
                { value: 'Girls', label: 'Girls' }
              ]}
              placeholder="All Genders"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Class</label>
            <Select
              value={filters.classVal}
              onChange={e => setFilters({ ...filters, classVal: e.target.value })}
              options={Array.from({ length: 7 }, (_, i) => i + 4).map(c => ({ value: c.toString(), label: `Class ${c}` }))}
              placeholder="All Classes"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Sport</label>
            <Select
              value={filters.sport}
              onChange={e => setFilters({ ...filters, sport: e.target.value })}
              options={games.map(s => ({ value: s, label: s }))}
              placeholder="All Sports"
            />
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
        <CheckCircle2 size={16} className="text-emerald-500" />
        Found <strong>{filteredStudentsList.length}</strong> matching participants
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Class</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Gender</th>
              <th className="p-4 font-semibold">Sports</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudentsList.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-400">
                  No participants match your filters.
                </td>
              </tr>
            ) : (
              filteredStudentsList.map(student => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-800">{student.name}</td>
                  <td className="p-4 text-slate-600">{student.classVal}</td>
                  <td className="p-4"><Badge color="slate">{student.category}</Badge></td>
                  <td className="p-4 text-slate-600">{student.gender}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {student.sports.map(s => (
                        <span key={s} className={`px-1.5 py-0.5 rounded text-xs border border-slate-200 ${filters.sport === s ? 'bg-indigo-100 text-indigo-700 border-indigo-200 font-bold' : 'bg-slate-100 text-slate-600'}`}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );

  const renderScheduler = () => {
    const displayMatches = userRole === 'teacher' && currentTeacherId 
      ? getTeacherMatches() 
      : matches;
    
    const teacherAssignedGame = userRole === 'teacher' && currentTeacherId ? getTeacherAssignedGame() : null;

    return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Teacher's Assigned Game Info */}
      {userRole === 'teacher' && teacherAssignedGame && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <div className="text-sm"><span className="font-semibold text-slate-700">Assigned Game:</span> <span className="text-indigo-700 font-bold">{teacherAssignedGame}</span></div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Scheduler Controls */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24 border-indigo-100 shadow-md bg-slate-50">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Calendar size={20} className="text-indigo-600" /> Schedule Match
              </h3>
              <Button 
                onClick={autoScheduleAllMatches}
                className="text-xs h-8 px-2"
                title="Auto-schedule all possible matches randomly"
              >
                Auto Schedule
              </Button>
            </div>

            <div className="space-y-4">
              {/* Step 1: Select Sport */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">1. Select Sport</label>
                <Select
                  value={scheduleForm.sport}
                  onChange={e => setScheduleForm({ sport: e.target.value, category: '', playerCount: getGamePlayerCount(e.target.value), playerIds: [] })}
                  options={games.map(s => ({ value: s, label: s }))}
                  placeholder="Choose Sport..."
                />
              </div>

              {/* Step 2: Select Number of Players */}
              {scheduleForm.sport && (
                <div className="animate-in slide-in-from-left-4 fade-in duration-300">
                  <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">2. Number of Players</label>
                  {isGamePlayerCountFixed(scheduleForm.sport) ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="text-sm font-bold text-amber-900">{getGamePlayerCount(scheduleForm.sport)} Players (Fixed)</div>
                      <p className="text-xs text-amber-700 mt-1">This game has a fixed player count and cannot be changed.</p>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Select
                        value={scheduleForm.playerCount.toString()}
                        onChange={e => setScheduleForm({ ...scheduleForm, playerCount: parseInt(e.target.value), playerIds: [] })}
                        options={Array.from({ length: 19 }, (_, i) => i + 2).map(n => ({ value: n.toString(), label: `${n} Players` }))}
                        placeholder="Select..."
                      />
                    </div>
                  )}
                  <p className="text-xs text-slate-500 mt-2">Admin default: {getGamePlayerCount(scheduleForm.sport)} players</p>
                </div>
              )}

              {/* Players Required Info */}
              {scheduleForm.sport && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg animate-in slide-in-from-left-4 fade-in duration-300">
                  <div className="text-xs font-semibold text-blue-900">Players to Select</div>
                  <div className="text-lg font-bold text-blue-600 mt-1">{scheduleForm.playerCount} Player{scheduleForm.playerCount !== 1 ? 's' : ''}</div>
                  <div className="text-xs text-blue-700 mt-1">Select exactly {scheduleForm.playerCount} player{scheduleForm.playerCount !== 1 ? 's' : ''} to schedule this match</div>
                </div>
              )}

              {/* Step 3: Select Category (Dynamic) */}
              {scheduleForm.sport && (
                <div className="animate-in slide-in-from-left-4 fade-in duration-300">
                  <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">3. Select Category</label>
                  {availableCategoriesForSport.length > 0 ? (
                    <Select
                      value={scheduleForm.category}
                      onChange={e => setScheduleForm({ ...scheduleForm, category: e.target.value, playerIds: [] })}
                      options={availableCategoriesForSport.map(c => ({ value: c, label: c }))}
                      placeholder="Choose Group..."
                    />
                  ) : (
                    <div className="text-sm text-red-500 italic bg-red-50 p-2 rounded border border-red-100">
                      No eligible students found for {scheduleForm.sport}. <br />
                      <span className="text-xs text-red-400">All registered players might have already played.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Select Players */}
              {scheduleForm.category && (
                <div className="space-y-3 animate-in slide-in-from-left-4 fade-in duration-300">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">
                      4. Select Players
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${scheduleForm.playerIds.length === scheduleForm.playerCount ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {scheduleForm.playerIds.length}/{scheduleForm.playerCount}
                      </span>
                    </label>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {filteredPlayersForMatch.map(player => (
                        <button
                          key={player.id}
                          onClick={() => togglePlayerSelection(player.id)}
                          className={`w-full text-left p-2 rounded-lg border transition-all text-sm ${
                            scheduleForm.playerIds.includes(player.id)
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold shadow-sm'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
                          }`}
                          disabled={!scheduleForm.playerIds.includes(player.id) && scheduleForm.playerIds.length >= scheduleForm.playerCount}
                        >
                          <div className="flex items-center justify-between">
                            <span>{player.name}</span>
                            <span className="text-xs text-slate-500">Class {player.classVal}</span>
                          </div>
                        </button>
                      ))}
                      {filteredPlayersForMatch.length === 0 && (
                        <div className="text-center py-8 text-slate-400">
                          <p>No eligible players in this category.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button 
                    onClick={scheduleMatch} 
                    className="w-full mt-4"
                    disabled={scheduleForm.playerIds.length !== scheduleForm.playerCount}
                  >
                    Create Match
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Matches List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-700">Scheduled Matches</h3>
            <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
              {displayMatches.filter(m => m.status === 'scheduled').length} Pending
            </span>
          </div>

          <div className="space-y-3">
            {displayMatches.filter(m => m.status === 'scheduled').length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                <Calendar className="mx-auto text-slate-300 mb-2" size={48} />
                <p className="text-slate-500">No active matches. Schedule one!</p>
              </div>
            )}

            {displayMatches.filter(m => m.status === 'scheduled').map(match => {
              const matchPlayers = students.filter(s => match.playerIds && match.playerIds.includes(s.id));
              if (matchPlayers.length === 0) return null;

              return (
                <Card key={match.id} className="p-4 border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow">
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="text-xs font-bold text-indigo-600 uppercase mb-2">{match.sport} • {match.category}</div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="text-xs text-slate-500 mb-2 font-semibold">Players ({matchPlayers.length}):</div>
                        <div className="grid grid-cols-2 gap-2">
                          {matchPlayers.map((player, idx) => (
                            <div key={player.id} className="flex items-center gap-2">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-slate-800">{player.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {match.sport === 'Carrom (2vs2)' ? (
                        // For Carrom (2vs2), show pair selection buttons
                        (() => {
                          const pairs = [];
                          for (let i = 0; i < matchPlayers.length; i += 2) {
                            if (i + 1 < matchPlayers.length) {
                              pairs.push([matchPlayers[i], matchPlayers[i + 1]]);
                            }
                          }
                          return pairs.map((pair, pairIndex) => (
                            <Button
                              key={pairIndex}
                              onClick={() => declareWinner(match.id, pair.map(p => p.id))}
                              className="flex-1 text-xs"
                              variant="outline"
                            >
                              {pair.map(p => p.name).join(' & ')} Won
                            </Button>
                          ));
                        })()
                      ) : (
                        // For other games, show individual player buttons
                        matchPlayers.map(player => (
                          <Button
                            key={player.id}
                            onClick={() => declareWinner(match.id, player.id)}
                            className="flex-1 text-xs"
                            variant="outline"
                          >
                            {player.name} Won
                          </Button>
                        ))
                      )}
                      <button onClick={() => deleteMatch(match.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Finished Matches Section */}
          {displayMatches.some(m => m.status === 'finished') && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="font-bold text-slate-700 mb-4">Completed Matches</h3>
              <div className="grid gap-3 opacity-75">
                {displayMatches.filter(m => m.status === 'finished').reverse().map(match => {
                  const matchPlayers = students.filter(s => match.playerIds && match.playerIds.includes(s.id));
                  let winnerDisplay = '';
                  let winnerBadge = '';

                  if (match.sport === 'Carrom (2vs2)' && Array.isArray(match.winnerId)) {
                    // For team games, show both winners
                    const winners = students.filter(s => match.winnerId.includes(s.id));
                    winnerDisplay = winners.map(w => w?.name || 'Unknown').join(' & ');
                    winnerBadge = `Winners: ${winnerDisplay}`;
                  } else {
                    // For individual games, show single winner
                    const winner = students.find(s => s.id === match.winnerId);
                    winnerDisplay = winner?.name || 'Unknown';
                    winnerBadge = `Winner: ${winnerDisplay}`;
                  }

                  if (matchPlayers.length === 0) return null;

                  return (
                    <div key={match.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center">
                      <div>
                        <div className="text-xs font-semibold text-slate-500">{match.sport}</div>
                        <div className="text-sm flex flex-wrap gap-1">
                          {matchPlayers.map((player, idx) => {
                            const isWinner = match.sport === 'Carrom (2vs2)' && Array.isArray(match.winnerId)
                              ? match.winnerId.includes(player.id)
                              : match.winnerId === player.id;
                            return (
                              <span key={player.id} className={isWinner ? "font-bold text-emerald-600" : "text-slate-500"}>
                                {idx > 0 && <span className="mx-1 text-slate-300">•</span>}
                                {player.name}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      <Badge color="green">{winnerBadge}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    );
  };

  const renderResults = () => {
    // Group winners by sport and category
    let winnersMatches = matches.filter(m => m.status === 'finished');
    
    // If teacher is viewing, filter by their assigned game
    if (userRole === 'teacher' && currentTeacherId) {
      winnersMatches = getTeacherMatches().filter(m => m.status === 'finished');
    }

    return (
      <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
        {/* Teacher's Assigned Game Info */}
        {userRole === 'teacher' && currentTeacherId && (
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <div className="text-sm"><span className="font-semibold text-slate-700">Assigned Game:</span> <span className="text-indigo-700 font-bold">{getTeacherAssignedGame()}</span></div>
          </div>
        )}

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Tournament Results</h2>
          <p className="text-slate-500">Hall of Fame</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {winnersMatches.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Trophy className="mx-auto text-slate-200 mb-4" size={64} />
              <p className="text-slate-500">No results to display yet.</p>
            </div>
          ) : (
            winnersMatches.map(match => {
              const matchPlayers = students.filter(s => match.playerIds && match.playerIds.includes(s.id));
              let winnerDisplay = '';
              let competedWith = '';

              if (match.sport === 'Carrom (2vs2)' && Array.isArray(match.winnerId)) {
                // For team games, show both winners
                const winners = students.filter(s => match.winnerId.includes(s.id));
                winnerDisplay = winners.map(w => w?.name || 'Unknown').join(' & ');
                competedWith = matchPlayers.filter(p => !match.winnerId.includes(p.id)).map(p => p.name).join(', ');
              } else {
                // For individual games, show single winner
                const winner = students.find(s => s.id === match.winnerId);
                winnerDisplay = winner?.name || 'Unknown';
                competedWith = matchPlayers.filter(p => p.id !== match.winnerId).map(p => p.name).join(', ');
              }

              if (!winnerDisplay || matchPlayers.length === 0) return null;

              return (
                <Card key={match.id} className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow border-l-4 border-l-amber-400">
                  <div className="bg-amber-100 text-amber-600 p-3 rounded-full">
                    <Trophy size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">{match.sport}</div>
                    <div className="text-xs text-indigo-500 font-semibold mb-1">{match.category}</div>
                    <div className="font-bold text-slate-800 text-lg">{winnerDisplay}</div>
                    <div className="text-xs text-slate-500">
                      Competed with {competedWith}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const createDummyParticipants = (count) => {
    const firstNames = ['Aarav', 'Anaya', 'Arjun', 'Aditi', 'Aditya', 'Anushka', 'Arnav', 'Avni', 'Abhishek', 'Avery', 'Bhavna', 'Bhavin', 'Chirag', 'Chitra', 'Deepak', 'Divya', 'Dharun', 'Dhruv', 'Esha', 'Eshaan', 'Farhan', 'Farah', 'Gaurav', 'Gauri', 'Hariom', 'Harshita', 'Ishaan', 'Ishita', 'Jatin', 'Jigyasa', 'Kabir', 'Kavya', 'Karan', 'Kayla', 'Lakshaay', 'Lakshmi', 'Manish', 'Manika', 'Nikhil', 'Nikita', 'Omkar', 'Olive', 'Pranav', 'Priya', 'Rohan', 'Rohini', 'Sahil', 'Sakshi', 'Tarun', 'Tanvi', 'Umang', 'Usha', 'Vansh', 'Vanshika', 'Waleed', 'Wanda', 'Xenith', 'Yash', 'Yara', 'Zara'];
    const lastNames = ['Sharma', 'Singh', 'Patel', 'Gupta', 'Khan', 'Kumar', 'Yadav', 'Verma', 'Malhotra', 'Reddy', 'Desai', 'Joshi', 'Nair', 'Iyer', 'Kulkarni', 'Chopra', 'Bansal', 'Saxena', 'Tripathi', 'Pandey'];
    const fatherFirstNames = ['Dr.', 'Mr.', 'Shri', 'Sri'];
    const fatherLastNames = lastNames;
    const genders = ['Boys', 'Girls'];

    const dummyParticipants = [];
    const usedRollNumbers = new Set(students.map(s => s.rollNumber));

    for (let i = 0; i < count; i++) {
      let rollNumber = Math.floor(Math.random() * 1000) + 1;
      while (usedRollNumbers.has(rollNumber.toString())) {
        rollNumber = Math.floor(Math.random() * 1000) + 1;
      }
      usedRollNumbers.add(rollNumber.toString());

      const classVal = Math.floor(Math.random() * 7) + 4; // Classes 4-10
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const gender = genders[Math.floor(Math.random() * genders.length)];
      const fatherName = `${fatherFirstNames[Math.floor(Math.random() * fatherFirstNames.length)]} ${lastName}`;
      
      const sports = [];
      const sportsCount = Math.floor(Math.random() * 3) + 1; // 1-3 sports
      const availableSports = [...games];
      for (let j = 0; j < sportsCount; j++) {
        const sportIndex = Math.floor(Math.random() * availableSports.length);
        sports.push(availableSports[sportIndex]);
        availableSports.splice(sportIndex, 1);
      }

      dummyParticipants.push({
        id: Date.now().toString() + Math.random(),
        name: `${firstName} ${lastName}`,
        rollNumber: rollNumber.toString(),
        fatherName: fatherName,
        photo: '',
        classVal: classVal,
        gender: gender,
        category: getCategory(classVal),
        sports: sports
      });
    }

    setStudents([...students, ...dummyParticipants]);
  };

  const renderDummyParticipants = () => (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Generate Dummy Participants</h2>
        <p className="text-sm text-slate-600 mb-6">Create test participants to populate your sports management system with sample data.</p>
      </div>

      <Card className="p-6 border-indigo-100 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-4">Quick Generate Options</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button 
            onClick={() => createDummyParticipants(10)}
            className="h-20 flex flex-col items-center justify-center gap-2 text-center"
          >
            <span className="text-2xl font-bold">10</span>
            <span className="text-xs">Participants</span>
          </Button>
          <Button 
            onClick={() => createDummyParticipants(25)}
            className="h-20 flex flex-col items-center justify-center gap-2 text-center"
          >
            <span className="text-2xl font-bold">25</span>
            <span className="text-xs">Participants</span>
          </Button>
          <Button 
            onClick={() => createDummyParticipants(50)}
            className="h-20 flex flex-col items-center justify-center gap-2 text-center"
          >
            <span className="text-2xl font-bold">50</span>
            <span className="text-xs">Participants</span>
          </Button>
          <Button 
            onClick={() => createDummyParticipants(100)}
            className="h-20 flex flex-col items-center justify-center gap-2 text-center"
          >
            <span className="text-2xl font-bold">100</span>
            <span className="text-xs">Participants</span>
          </Button>
        </div>
      </Card>

      <Card className="p-6 border-amber-100 bg-amber-50 shadow-sm">
        <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
          <AlertCircle size={18} /> About Dummy Data
        </h3>
        <ul className="text-sm text-amber-800 space-y-2 ml-6 list-disc">
          <li>Each participant is assigned random classes (4-10), genders, and sports</li>
          <li>Roll numbers are auto-generated and won't duplicate with existing students</li>
          <li>Participants are distributed across Junior, Middle, and Senior categories</li>
          <li>You can generate multiple batches - they'll be added to your existing participants</li>
          <li>All data is stored in your browser's storage</li>
        </ul>
      </Card>

      <div className="text-center text-sm text-slate-600 p-6 bg-white rounded-lg border border-slate-200">
        <p>Total participants: <span className="font-bold text-indigo-600">{students.length}</span></p>
      </div>
    </div>
  );

  // --- Main Layout ---

  // Define tabs based on role
  const getTabs = () => {
    const baseTabs = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'participants', label: 'Participants', icon: Table2 },
      { id: 'scheduler', label: 'Competition', icon: Calendar },
      { id: 'results', label: 'Results', icon: Medal },
    ];

    // Admin gets all tabs, but only if logged in
    if (userRole === 'admin') {
      if (isAdminLoggedIn) {
        return [
          { id: 'admin', label: 'Admin', icon: Settings },
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'participants', label: 'Participants', icon: Table2 },
          { id: 'register', label: 'Registration', icon: UserPlus },
          { id: 'dummy', label: 'Dummy Data', icon: Zap },
          { id: 'scheduler', label: 'Competition', icon: Calendar },
          { id: 'results', label: 'Results', icon: Medal },
        ];
      } else {
        // If admin is not logged in, only show admin tab
        return [
          { id: 'admin', label: 'Admin', icon: Settings },
        ];
      }
    }

    // Teachers - check if logged in
    if (userRole === 'teacher') {
      if (isTeacherLoggedIn) {
        return baseTabs;
      } else {
        // If teacher is not logged in, only show login tab
        return [
          { id: 'teacher-login', label: 'Teacher Login', icon: Activity },
        ];
      }
    }

    // Default fallback
    return baseTabs;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Header */}
      <div className="bg-indigo-600 text-white sticky top-0 z-20 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={24} className="text-indigo-200" />
            <h1 className="font-bold text-xl tracking-tight">Sports Manager</h1>
            <div className="ml-4 flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-100">Role:</span>
              <select
                value={userRole}
                onChange={e => setUserRole(e.target.value)}
                className="px-2 py-1 rounded bg-indigo-500 text-white text-xs font-semibold hover:bg-indigo-400 transition-colors cursor-pointer"
              >
                <option value="admin">👤 Admin</option>
                <option value="teacher">👨‍🏫 Teacher</option>
              </select>
            </div>

            {/* Teacher Selector (shown only in admin when using teacher role for preview) */}
            {userRole === 'teacher' && !isTeacherLoggedIn && teachers.length > 0 && (
              <div className="ml-4 flex items-center gap-2">
                <span className="text-xs font-semibold text-indigo-100">Teacher:</span>
                <select
                  value={currentTeacherId}
                  onChange={e => setCurrentTeacherId(e.target.value)}
                  className="px-2 py-1 rounded bg-indigo-500 text-white text-xs font-semibold hover:bg-indigo-400 transition-colors cursor-pointer"
                >
                  <option value="">Select teacher...</option>
                  {teachers.map(teacher => {
                    // Find which game this teacher is assigned to
                    const assignedGame = Object.entries(gameTeacherAssignments).find(([_, teacherIds]) => 
                      teacherIds.includes(teacher.id)
                    )?.[0];
                    
                    return (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} {assignedGame ? `(${assignedGame})` : '(Not Assigned)'}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Logout button for logged-in teachers */}
            {userRole === 'teacher' && isTeacherLoggedIn && (
              <div className="ml-4 flex items-center gap-2">
                <span className="text-xs font-semibold text-indigo-100">
                  👨‍🏫 {teachers.find(t => t.id === loggedInTeacherId)?.name || 'Teacher'}
                </span>
                <button
                  onClick={handleTeacherLogout}
                  className="px-2 py-1 rounded bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <X size={14} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto no-scrollbar">
          {getTabs().map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all whitespace-nowrap border-b-4 ${activeTab === tab.id
                ? 'border-white text-white bg-indigo-700 rounded-t-lg'
                : 'border-transparent text-indigo-100 hover:bg-indigo-500 hover:text-white rounded-t-lg'
                }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'admin' && renderAdmin()}
        {activeTab === 'teacher-login' && renderTeacherLogin()}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'participants' && renderParticipants()}
        {activeTab === 'register' && renderRegistration()}
        {activeTab === 'dummy' && renderDummyParticipants()}
        {activeTab === 'scheduler' && renderScheduler()}
        {activeTab === 'results' && renderResults()}
      </main>

    </div>
  );
}
