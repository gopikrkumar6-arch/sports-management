import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Trophy, Users, Calendar, Plus, Trash2, Save, X,
  Medal, Activity, LayoutDashboard, UserPlus,
  ChevronRight, CheckCircle2, AlertCircle, Pencil, Table2, Filter, Camera, RotateCcw, Settings
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
  const [activeTab, setActiveTab] = useState('dashboard');

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

  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Filter State
  const [filters, setFilters] = useState({
    category: '',
    gender: '',
    classVal: '',
    sport: ''
  });

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
  }, [games, gameConfigs, students, matches]);

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
      setEditingId(null);
    } else {
      // Create new
      const newStudent = {
        id: Date.now().toString(),
        ...studentData
      };
      setStudents([...students, newStudent]);
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
    setMatches(matches.map(m =>
      m.id === matchId ? { ...m, winnerId, status: 'finished' } : m
    ));
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

  const startCamera = async () => {
    try {
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
        juniors: students.filter(s => s.category.includes('Juniors')).length,
        middle: students.filter(s => s.category.includes('Middle')).length,
        seniors: students.filter(s => s.category.includes('Seniors')).length,
      }
    };
  }, [students, matches]);

  // Filtering Logic for Filter Tab
  const filteredStudentsList = useMemo(() => {
    return students.filter(student => {
      const matchCategory = filters.category ? student.category === filters.category : true;
      const matchGender = filters.gender ? student.gender === filters.gender : true;
      const matchClass = filters.classVal ? student.classVal.toString() === filters.classVal : true;
      const matchSport = filters.sport ? student.sports.includes(filters.sport) : true;
      return matchCategory && matchGender && matchClass && matchSport;
    });
  }, [students, filters]);

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

  const filteredPlayersForMatch = useMemo(() => {
    if (!scheduleForm.category) return [];
    const [catName, gender] = scheduleForm.category.split(' - ');
    return eligiblePlayers.filter(s => s.category === catName && s.gender === gender);
  }, [eligiblePlayers, scheduleForm.category]);


  // --- Render Views ---

  const renderAdmin = () => (
    <div className="animate-in fade-in duration-500 space-y-6">
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

      <Card className="p-4 bg-blue-50 border-blue-100 border">
        <div className="flex gap-3">
          <CheckCircle2 size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Games will appear in Registration Form</p>
            <p className="text-blue-700">Any game you add or remove here will automatically be updated in the student registration form and match scheduling options.</p>
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
              <span className="text-slate-600 text-sm font-medium">Juniors (Class 4-5)</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400" style={{ width: `${(stats.byCategory.juniors / (stats.totalStudents || 1)) * 100}%` }}></div>
                </div>
                <span className="text-sm font-bold text-slate-700">{stats.byCategory.juniors}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 text-sm font-medium">Middle (Class 6-7)</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400" style={{ width: `${(stats.byCategory.middle / (stats.totalStudents || 1)) * 100}%` }}></div>
                </div>
                <span className="text-sm font-bold text-slate-700">{stats.byCategory.middle}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 text-sm font-medium">Seniors (Class 8-10)</span>
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
              const winner = students.find(s => s.id === match.winnerId);
              return (
                <div key={match.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{winner?.name || 'Unknown'}</div>
                    <div className="text-xs text-slate-500">{match.sport} • {match.category}</div>
                  </div>
                  <Badge color="orange">Winner</Badge>
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
    <div className="animate-in fade-in duration-500 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">All Participants</h2>
        <Button onClick={() => setActiveTab('register')} variant="secondary">
          <Plus size={16} /> Add New
        </Button>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Gender</th>
              <th className="p-4 font-semibold">Sports</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-400">
                  No students found.
                </td>
              </tr>
            ) : (
              [...students].reverse().map(student => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{student.name}</div>
                    <div className="text-xs text-slate-400">Class {student.classVal}</div>
                  </td>
                  <td className="p-4">
                    <Badge color="slate">{student.category}</Badge>
                  </td>
                  <td className="p-4 text-slate-600">{student.gender}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {student.sports.map(s => (
                        <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs border border-slate-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
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

  const renderScheduler = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Scheduler Controls */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24 border-indigo-100 shadow-md bg-slate-50">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-indigo-600" /> Schedule Match
            </h3>

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
              {matches.filter(m => m.status === 'scheduled').length} Pending
            </span>
          </div>

          <div className="space-y-3">
            {matches.filter(m => m.status === 'scheduled').length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                <Calendar className="mx-auto text-slate-300 mb-2" size={48} />
                <p className="text-slate-500">No active matches. Schedule one!</p>
              </div>
            )}

            {matches.filter(m => m.status === 'scheduled').map(match => {
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
                      {matchPlayers.map(player => (
                        <Button 
                          key={player.id} 
                          onClick={() => declareWinner(match.id, player.id)} 
                          className="flex-1 text-xs" 
                          variant="outline"
                        >
                          {player.name} Won
                        </Button>
                      ))}
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
          {matches.some(m => m.status === 'finished') && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="font-bold text-slate-700 mb-4">Completed Matches</h3>
              <div className="grid gap-3 opacity-75">
                {matches.filter(m => m.status === 'finished').reverse().map(match => {
                  const matchPlayers = students.filter(s => match.playerIds && match.playerIds.includes(s.id));
                  const winner = students.find(s => s.id === match.winnerId);
                  if (matchPlayers.length === 0) return null;

                  return (
                    <div key={match.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center">
                      <div>
                        <div className="text-xs font-semibold text-slate-500">{match.sport}</div>
                        <div className="text-sm flex flex-wrap gap-1">
                          {matchPlayers.map((player, idx) => (
                            <span key={player.id} className={match.winnerId === player.id ? "font-bold text-emerald-600" : "text-slate-500"}>
                              {idx > 0 && <span className="mx-1 text-slate-300">•</span>}
                              {player.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      {winner && <Badge color="green">Winner: {winner.name}</Badge>}
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

  const renderResults = () => {
    // Group winners by sport and category
    const winners = matches.filter(m => m.status === 'finished');

    return (
      <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Tournament Results</h2>
          <p className="text-slate-500">Hall of Fame</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {winners.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Trophy className="mx-auto text-slate-200 mb-4" size={64} />
              <p className="text-slate-500">No results to display yet.</p>
            </div>
          ) : (
            winners.map(match => {
              const matchPlayers = students.filter(s => match.playerIds && match.playerIds.includes(s.id));
              const winner = students.find(s => s.id === match.winnerId);
              if (!winner || matchPlayers.length === 0) return null;

              return (
                <Card key={match.id} className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow border-l-4 border-l-amber-400">
                  <div className="bg-amber-100 text-amber-600 p-3 rounded-full">
                    <Trophy size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">{match.sport}</div>
                    <div className="text-xs text-indigo-500 font-semibold mb-1">{match.category}</div>
                    <div className="font-bold text-slate-800 text-lg">{winner.name}</div>
                    <div className="text-xs text-slate-500">
                      Competed with {matchPlayers.filter(p => p.id !== winner.id).map(p => p.name).join(', ')}
                    </div>
                  </div>
                </Card>
              );
            })
          )}}
        </div>
      </div>
    );
  };

  // --- Main Layout ---

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Header */}
      <div className="bg-indigo-600 text-white sticky top-0 z-20 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={24} className="text-indigo-200" />
            <h1 className="font-bold text-xl tracking-tight">Sports Manager</h1>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'admin', label: 'Admin', icon: Settings },
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'participants', label: 'Participants', icon: Table2 },
            { id: 'filter', label: 'Filter', icon: Filter },
            { id: 'register', label: 'Registration', icon: UserPlus },
            { id: 'scheduler', label: 'Competition', icon: Calendar },
            { id: 'results', label: 'Results', icon: Medal },
          ].map(tab => (
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
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'participants' && renderParticipants()}
        {activeTab === 'filter' && renderFilters()}
        {activeTab === 'register' && renderRegistration()}
        {activeTab === 'scheduler' && renderScheduler()}
        {activeTab === 'results' && renderResults()}
      </main>

    </div>
  );
}
