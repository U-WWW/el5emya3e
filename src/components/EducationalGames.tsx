import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Settings,
  Search,
  User,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  X,
  CheckCircle2,
  ArrowRight,
  Flame,
  Star,
  Award,
  Zap,
  HelpCircle,
  Home,
  BarChart2,
  Compass,
  Smile,
  Frown,
  GraduationCap,
  Layers,
  Activity,
  Lightbulb,
  Lock,
  ChevronLeft,
  Sliders,
  ShieldAlert,
  Radio,
  Check
} from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface EducationalGamesProps {
  studentName?: string;
  studentCode?: string;
  studentId?: string;
  onNavigateHome?: () => void;
  onNavigateResults?: () => void;
  onNavigateProfile?: () => void;
}

export default function EducationalGames({
  studentName = 'الطالب المميز',
  studentCode = 'STU-101',
  studentId = '',
  onNavigateHome,
  onNavigateResults,
  onNavigateProfile
}: EducationalGamesProps) {
  const [activeBottomNav, setActiveBottomNav] = useState<'home' | 'games' | 'results' | 'profile'>('games');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Game Modal ID
  type GameModalType = 'color_sort' | 'water_physics' | 'chem_maze' | 'circuit_volt' | 'balance_physics' | 'molecule_assembly' | 'lens_optics' | 'hydraulic_pressure' | null;
  const [activeGameModal, setActiveGameModal] = useState<GameModalType>(null);

  // Real Persistent User Progress / Stats
  const [userStars, setUserStars] = useState<number>(12);
  const [userPoints, setUserPoints] = useState<number>(850);
  const [completedLevels, setCompletedLevels] = useState<{ [key: string]: number }>({});
  const [saveStatusMsg, setSaveStatusMsg] = useState<string | null>(null);

  // Storage key based on student identifier
  const userStorageKey = `game_data_${studentCode || studentId || 'default'}`;

  // 1. Load Real Points & Progress on Mount (from localStorage & Firestore)
  useEffect(() => {
    // Load local cache first
    try {
      const cached = localStorage.getItem(userStorageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.points !== undefined) setUserPoints(parsed.points);
        if (parsed.stars !== undefined) setUserStars(parsed.stars);
        if (parsed.completedLevels) setCompletedLevels(parsed.completedLevels);
      }
    } catch (e) {
      console.error('Error loading local game cache:', e);
    }

    // Load from Firestore if online
    const loadFirestoreData = async () => {
      const docId = studentCode || studentId || 'default_student';
      if (!docId) return;
      try {
        const scoreRef = doc(db, 'student_game_scores', docId);
        const snap = await getDoc(scoreRef);
        if (snap.exists()) {
          const data = snap.data();
          const remotePoints = data.points || 0;
          const remoteStars = data.stars || 0;
          const remoteLevels = data.completedLevels || {};

          setUserPoints(prev => Math.max(prev, remotePoints));
          setUserStars(prev => Math.max(prev, remoteStars));
          setCompletedLevels(prev => ({ ...prev, ...remoteLevels }));
        }
      } catch (err) {
        console.warn('Firestore load game stats error:', err);
      }
    };

    loadFirestoreData();
  }, [studentCode, studentId]);

  // Helper to persist updated points, stars, and level completed state
  const addEarnedRewards = async (earnedPoints: number, earnedStars: number, levelKey: string) => {
    const newPoints = userPoints + earnedPoints;
    const newStars = userStars + earnedStars;
    const newCompleted = { ...completedLevels, [levelKey]: Math.max(completedLevels[levelKey] || 0, earnedStars) };

    setUserPoints(newPoints);
    setUserStars(newStars);
    setCompletedLevels(newCompleted);

    // Toast feedback
    setSaveStatusMsg(`🏆 رائع! حصلت على +${earnedPoints} نقطة و ${earnedStars} نجوم!`);
    setTimeout(() => setSaveStatusMsg(null), 4000);

    // Save to LocalStorage
    const payload = {
      points: newPoints,
      stars: newStars,
      completedLevels: newCompleted,
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(userStorageKey, JSON.stringify(payload));
    } catch (e) {
      console.error('LocalStorage save error:', e);
    }

    // Save to Firestore
    const docId = studentCode || studentId || 'default_student';
    try {
      const scoreRef = doc(db, 'student_game_scores', docId);
      await setDoc(scoreRef, {
        studentName,
        studentCode,
        points: newPoints,
        stars: newStars,
        completedLevels: newCompleted,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Also update student profile document if exists
      if (studentId) {
        const studentRef = doc(db, 'students', studentId);
        await updateDoc(studentRef, {
          gamePoints: newPoints,
          gameStars: newStars
        }).catch(() => {});
      }
    } catch (err) {
      console.warn('Firestore save game score error:', err);
    }
  };

  // -------------------------------------------------------------
  // GAME 1: COLOR SORT MINI GAME
  // -------------------------------------------------------------
  const [tubes, setTubes] = useState<string[][]>([
    ['#3b82f6', '#a855f7', '#eab308', '#ef4444'],
    ['#ef4444', '#a855f7', '#3b82f6', '#eab308'],
    ['#eab308', '#3b82f6', '#ef4444', '#a855f7'],
    [],
    []
  ]);
  const [selectedTube, setSelectedTube] = useState<number | null>(null);
  const [sortMoves, setSortMoves] = useState(0);
  const [sortWon, setSortWon] = useState(false);

  const resetColorSort = () => {
    setTubes([
      ['#3b82f6', '#a855f7', '#eab308', '#ef4444'],
      ['#ef4444', '#a855f7', '#3b82f6', '#eab308'],
      ['#eab308', '#3b82f6', '#ef4444', '#a855f7'],
      [],
      []
    ]);
    setSelectedTube(null);
    setSortMoves(0);
    setSortWon(false);
  };

  const handleTubeClick = (index: number) => {
    if (sortWon) return;

    if (selectedTube === null) {
      if (tubes[index].length > 0) setSelectedTube(index);
    } else {
      if (selectedTube === index) {
        setSelectedTube(null);
        return;
      }

      const source = [...tubes[selectedTube]];
      const target = [...tubes[index]];

      if (source.length === 0) {
        setSelectedTube(null);
        return;
      }

      const colorToPour = source[source.length - 1];

      if (target.length < 4 && (target.length === 0 || target[target.length - 1] === colorToPour)) {
        source.pop();
        target.push(colorToPour);

        const newTubes = [...tubes];
        newTubes[selectedTube] = source;
        newTubes[index] = target;

        setTubes(newTubes);
        setSortMoves(prev => prev + 1);
        setSelectedTube(null);

        checkColorSortVictory(newTubes);
      } else {
        if (tubes[index].length > 0) setSelectedTube(index);
        else setSelectedTube(null);
      }
    }
  };

  const checkColorSortVictory = (currentTubes: string[][]) => {
    let completeCount = 0;
    for (const tube of currentTubes) {
      if (tube.length === 0) continue;
      if (tube.length === 4 && tube.every(c => c === tube[0])) completeCount++;
      else return;
    }
    if (completeCount === 3 && !sortWon) {
      setSortWon(true);
      addEarnedRewards(150, 3, 'color_sort');
    }
  };

  // -------------------------------------------------------------
  // GAME 2: WATER PHYSICS MINI GAME
  // -------------------------------------------------------------
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);
  const [currentLine, setCurrentLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [waterFillLevel, setWaterFillLevel] = useState(0);
  const [physicsActive, setPhysicsActive] = useState(false);
  const [physicsWon, setPhysicsWon] = useState(false);

  const resetWaterPhysics = () => {
    setLines([]);
    setCurrentLine(null);
    setWaterFillLevel(0);
    setPhysicsActive(false);
    setPhysicsWon(false);
  };

  useEffect(() => {
    if (activeGameModal !== 'water_physics' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: { x: number; y: number; vx: number; vy: number; radius: number }[] = [];

    const tapX = canvas.width / 2;
    const cupX = canvas.width / 2 - 40;
    const cupY = canvas.height - 90;
    const cupWidth = 80;
    const cupHeight = 70;

    let localFill = waterFillLevel;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid Lines
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Tap
      ctx.fillStyle = '#64748b';
      ctx.fillRect(tapX - 15, 0, 30, 20);
      ctx.fillRect(tapX - 10, 20, 20, 15);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(tapX, 38, 6, 0, Math.PI * 2);
      ctx.fill();

      // Drawn Lines
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';

      lines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();
      });

      if (currentLine) {
        ctx.beginPath();
        ctx.moveTo(currentLine.x1, currentLine.y1);
        ctx.lineTo(currentLine.x2, currentLine.y2);
        ctx.stroke();
      }

      // Water Cup
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cupX, cupY);
      ctx.lineTo(cupX + 10, cupY + cupHeight);
      ctx.lineTo(cupX + cupWidth - 10, cupY + cupHeight);
      ctx.lineTo(cupX + cupWidth, cupY);
      ctx.stroke();

      // Water inside Cup
      if (localFill > 0) {
        const fillHeight = (localFill / 100) * (cupHeight - 10);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
        ctx.beginPath();
        ctx.moveTo(cupX + 8, cupY + cupHeight - fillHeight);
        ctx.lineTo(cupX + 10, cupY + cupHeight - 4);
        ctx.lineTo(cupX + cupWidth - 10, cupY + cupHeight - 4);
        ctx.lineTo(cupX + cupWidth - 8, cupY + cupHeight - fillHeight);
        ctx.closePath();
        ctx.fill();
      }

      // Cup Face
      ctx.fillStyle = '#0f172a';
      ctx.lineWidth = 2;
      const faceX = canvas.width / 2;
      const faceY = cupY + cupHeight / 2;

      ctx.beginPath();
      ctx.arc(faceX - 12, faceY - 6, 3, 0, Math.PI * 2);
      ctx.arc(faceX + 12, faceY - 6, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      if (localFill >= 80) ctx.arc(faceX, faceY + 2, 10, 0, Math.PI, false);
      else ctx.arc(faceX, faceY + 12, 8, Math.PI, 0, false);
      ctx.stroke();

      // Spawn Droplets
      if (physicsActive && localFill < 100) {
        if (Math.random() < 0.4) {
          particles.push({
            x: tapX + (Math.random() * 6 - 3),
            y: 40,
            vx: Math.random() * 0.4 - 0.2,
            vy: 2 + Math.random(),
            radius: 4
          });
        }
      }

      // Update Droplets
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += 0.2;
        p.x += p.vx;
        p.y += p.vy;

        allLines: for (const line of [...lines, ...(currentLine ? [currentLine] : [])]) {
          const dx = line.x2 - line.x1;
          const dy = line.y2 - line.y1;
          const len = Math.hypot(dx, dy);
          if (len === 0) continue;

          const u = Math.max(0, Math.min(1, ((p.x - line.x1) * dx + (p.y - line.y1) * dy) / (len * len)));
          const projX = line.x1 + u * dx;
          const projY = line.y1 + u * dy;
          const dist = Math.hypot(p.x - projX, p.y - projY);

          if (dist < p.radius + 4) {
            const nx = (p.y - projY);
            const ny = -(p.x - projX);
            const nLen = Math.hypot(nx, ny) || 1;
            p.vx = (nx / nLen) * 2;
            p.vy = (ny / nLen) * 1.5;
            p.x = projX + (nx / nLen) * (p.radius + 5);
            p.y = projY + (ny / nLen) * (p.radius + 5);
            break allLines;
          }
        }

        if (p.x >= cupX && p.x <= cupX + cupWidth && p.y >= cupY + 10 && p.y <= cupY + cupHeight) {
          particles.splice(i, 1);
          localFill = Math.min(100, localFill + 2.5);
          setWaterFillLevel(localFill);
          if (localFill >= 80 && !physicsWon) {
            setPhysicsWon(true);
            addEarnedRewards(200, 3, 'water_physics');
          }
          continue;
        }

        if (p.y > canvas.height + 20 || p.x < 0 || p.x > canvas.width) {
          particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeGameModal, lines, currentLine, physicsActive, physicsWon]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || physicsActive) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setIsDrawing(true);
    setCurrentLine({ x1: e.clientX - rect.left, y1: e.clientY - rect.top, x2: e.clientX - rect.left, y2: e.clientY - rect.top });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentLine || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setCurrentLine({ ...currentLine, x2: e.clientX - rect.left, y2: e.clientY - rect.top });
  };

  const handleMouseUp = () => {
    if (isDrawing && currentLine) {
      setLines(prev => [...prev, currentLine]);
      setCurrentLine(null);
      setIsDrawing(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || physicsActive || e.touches.length === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setIsDrawing(true);
    setCurrentLine({ x1: e.touches[0].clientX - rect.left, y1: e.touches[0].clientY - rect.top, x2: e.touches[0].clientX - rect.left, y2: e.touches[0].clientY - rect.top });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentLine || !canvasRef.current || e.touches.length === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setCurrentLine({ ...currentLine, x2: e.touches[0].clientX - rect.left, y2: e.touches[0].clientY - rect.top });
  };

  // -------------------------------------------------------------
  // GAME 3: CHEMICAL PIPE MAZE (متاهة كيمياء السوائل)
  // -------------------------------------------------------------
  // Pipe types: 'I' (straight vertical), 'L' (elbow right-down), 'T' (3-way), 'X' (hazard/cross)
  const [mazeGrid, setMazeGrid] = useState<number[]>([
    0, 90, 180, 270,
    90, 0, 270, 180,
    180, 270, 0, 90,
    270, 180, 90, 0
  ]);
  const [mazeReacting, setMazeReacting] = useState(false);
  const [mazeWon, setMazeWon] = useState(false);

  const rotateMazePipe = (index: number) => {
    if (mazeWon || mazeReacting) return;
    const newGrid = [...mazeGrid];
    newGrid[index] = (newGrid[index] + 90) % 360;
    setMazeGrid(newGrid);
  };

  const testMazeReaction = () => {
    setMazeReacting(true);
    setTimeout(() => {
      setMazeReacting(false);
      setMazeWon(true);
      addEarnedRewards(180, 3, 'chem_maze');
    }, 2000);
  };

  const resetMaze = () => {
    setMazeGrid([0, 90, 180, 270, 90, 0, 270, 180, 180, 270, 0, 90, 270, 180, 90, 0]);
    setMazeReacting(false);
    setMazeWon(false);
  };

  // -------------------------------------------------------------
  // GAME 4: CIRCUIT & VOLTAGE CHALLENGE (تحدي الدوائر والجهد)
  // -------------------------------------------------------------
  const [circuitVoltage, setCircuitVoltage] = useState<number>(12); // Volts
  const [circuitResistors, setCircuitResistors] = useState<number[]>([20, 10]); // Ohms in series (Total = 30)
  const [circuitWon, setCircuitWon] = useState(false);

  // Target current = 0.40 Amps (12V / (20 + 10) = 0.40 A!)
  const totalResistance = circuitResistors.reduce((a, b) => a + b, 0) || 1;
  const currentAmps = Number((circuitVoltage / totalResistance).toFixed(2));
  const isTargetCurrent = Math.abs(currentAmps - 0.40) < 0.03;

  const handleCircuitSubmit = () => {
    if (isTargetCurrent && !circuitWon) {
      setCircuitWon(true);
      addEarnedRewards(200, 3, 'circuit_volt');
    }
  };

  // -------------------------------------------------------------
  // GAME 5: BALANCE & LEVER MECHANICS (اتزان الكتل)
  // -------------------------------------------------------------
  // Left side: Fixed weight 10 kg at position 3m = 30 N.m torque
  const [rightWeights, setRightWeights] = useState<{ mass: number; pos: number }[]>([]);
  const [balanceWon, setBalanceWon] = useState(false);

  const leftTorque = 10 * 3; // 30
  const rightTorque = rightWeights.reduce((acc, w) => acc + w.mass * w.pos, 0);
  const isBalanced = Math.abs(leftTorque - rightTorque) === 0;

  const addWeightToBalance = (mass: number, pos: number) => {
    if (balanceWon) return;
    setRightWeights(prev => [...prev.filter(w => w.pos !== pos), { mass, pos }]);
  };

  const resetBalance = () => {
    setRightWeights([]);
    setBalanceWon(false);
  };

  const checkBalanceSubmit = () => {
    if (isBalanced && rightWeights.length > 0 && !balanceWon) {
      setBalanceWon(true);
      addEarnedRewards(190, 3, 'balance_physics');
    }
  };

  // -------------------------------------------------------------
  // GAME 6: MOLECULE ASSEMBLY (تركيب الجزيئات الكيميائية)
  // -------------------------------------------------------------
  const [targetMolecule, setTargetMolecule] = useState<'H2O' | 'CO2' | 'CH4'>('H2O');
  const [assembledAtoms, setAssembledAtoms] = useState<string[]>([]);
  const [moleculeWon, setMoleculeWon] = useState(false);

  const moleculeFormula = {
    H2O: { name: 'الماء (H₂O)', core: 'O', required: ['H', 'H'] },
    CO2: { name: 'ثاني أكسيد الكربون (CO₂)', core: 'C', required: ['O', 'O'] },
    CH4: { name: 'غاز الميثان (CH₄)', core: 'C', required: ['H', 'H', 'H', 'H'] }
  };

  const handleAddAtom = (atom: string) => {
    if (moleculeWon) return;
    const req = moleculeFormula[targetMolecule].required;
    if (assembledAtoms.length < req.length) {
      const nextAtoms = [...assembledAtoms, atom];
      setAssembledAtoms(nextAtoms);

      // Check win
      if (nextAtoms.length === req.length) {
        const sortedNext = [...nextAtoms].sort().join('');
        const sortedReq = [...req].sort().join('');
        if (sortedNext === sortedReq) {
          setMoleculeWon(true);
          addEarnedRewards(220, 3, 'molecule_assembly');
        }
      }
    }
  };

  const resetMolecule = () => {
    setAssembledAtoms([]);
    setMoleculeWon(false);
  };

  // -------------------------------------------------------------
  // GAME 7: LENS OPTICS & LIGHT REFRACTION (انكسار العدسات)
  // -------------------------------------------------------------
  const [lensPosition, setLensPosition] = useState<number>(50); // 0 to 100
  const [mirrorAngle, setMirrorAngle] = useState<number>(45); // degrees
  const [opticsWon, setOpticsWon] = useState(false);

  // Target win condition: lensPosition between 45 and 55, mirrorAngle between 40 and 50
  const opticsFocused = lensPosition >= 45 && lensPosition <= 55 && mirrorAngle >= 40 && mirrorAngle <= 50;

  const testOpticsRay = () => {
    if (opticsFocused && !opticsWon) {
      setOpticsWon(true);
      addEarnedRewards(170, 3, 'lens_optics');
    }
  };

  // -------------------------------------------------------------
  // GAME 8: HYDRAULIC PRESSURE & DENSITY (ضغط الهيدروليك)
  // -------------------------------------------------------------
  const [inputForce, setInputForce] = useState<number>(100); // N
  const [fluidType, setFluidType] = useState<'water' | 'oil' | 'mercury'>('oil');
  const [pistonLifted, setPistonLifted] = useState(false);
  const [hydraulicWon, setHydraulicWon] = useState(false);

  // Required Force >= 250N for Oil
  const handleLiftHydraulic = () => {
    setPistonLifted(true);
    if (inputForce >= 250 && !hydraulicWon) {
      setHydraulicWon(true);
      addEarnedRewards(210, 3, 'hydraulic_pressure');
    }
  };

  // All 6 Extra Game Levels Definition
  const extraGameLevels = [
    {
      id: 'chem_maze',
      title: 'متاهة كيمياء السوائل',
      category: 'الكيمياء',
      difficulty: 'سهل',
      icon: '🧪',
      rewardPts: 180,
      bgGradient: 'from-blue-500 to-indigo-600',
      description: 'قم بتدوير الأنابيب لتوصيل السوائل التفاعلية نحو دورق التفاعل التجميعي بدون تسريب!'
    },
    {
      id: 'circuit_volt',
      title: 'تحدي الدوائر والجهد',
      category: 'الفيزياء',
      difficulty: 'متوسط',
      icon: '⚡',
      rewardPts: 200,
      bgGradient: 'from-amber-400 to-orange-500',
      description: 'اضبط قيمة الجهد والمقاومات الكهربائية للوصول للشدة المطلوبة وتضيء المصباح!'
    },
    {
      id: 'balance_physics',
      title: 'اتزان الكتل والجاذبية',
      category: 'الفيزياء',
      difficulty: 'متقدم',
      icon: '⚖️',
      rewardPts: 190,
      bgGradient: 'from-emerald-500 to-teal-700',
      description: 'احسب العزم وضِع الأوزان المناسبة على مسافات الميزان لتحقيق التوازن الأفقي التام!'
    },
    {
      id: 'molecule_assembly',
      title: 'تركيب الجزيئات الكيميائية',
      category: 'الكيمياء',
      difficulty: 'سهل',
      icon: '🧩',
      rewardPts: 220,
      bgGradient: 'from-purple-500 to-pink-600',
      description: 'ركّب جزيئات الماء، ثاني أكسيد الكربون، والميثان بربط ذرات الهيدروجين والأكسجين!'
    },
    {
      id: 'lens_optics',
      title: 'انكسار عدسات الضوء',
      category: 'البصريات',
      difficulty: 'متوسط',
      icon: '🧭',
      rewardPts: 170,
      bgGradient: 'from-cyan-500 to-blue-600',
      description: 'وجّه شعاع الليزر عبر العدسات المحدبة والمرايا لتسليطه بدقة على الكريستال!'
    },
    {
      id: 'hydraulic_pressure',
      title: 'ضغط الهيدروليك والكثافة',
      category: 'الميكانيكا',
      difficulty: 'متقدم',
      icon: '🌊',
      rewardPts: 210,
      bgGradient: 'from-sky-500 to-indigo-700',
      description: 'استخدم قانون باسكال واضبط كثافة السائل والضغط لرفع الأثقال والمكبس الهيدروليكي!'
    }
  ];

  const filteredLevels = extraGameLevels.filter(lvl =>
    lvl.title.includes(searchQuery) || lvl.category.includes(searchQuery)
  );

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0d9488] text-slate-100 font-sans pb-28 relative overflow-x-hidden selection:bg-teal-500 selection:text-white">
      
      {/* Background Lighting Effects */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* SAVE REWARD TOAST NOTIFICATION */}
      <AnimatePresence>
        {saveStatusMsg && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-black px-6 py-3 rounded-2xl shadow-2xl border-2 border-white flex items-center gap-2 text-sm"
          >
            <Sparkles className="w-5 h-5 fill-slate-950" />
            <span>{saveStatusMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER BAR */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-teal-500/30 px-4 py-3 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          
          {/* Title & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 shadow-lg flex items-center justify-center text-slate-950 font-black text-xl border-2 border-teal-200">
              <GraduationCap className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white drop-shadow tracking-tight">
                قسم الألعاب التعليمية
              </h1>
              <span className="text-xs font-bold text-teal-300 flex items-center gap-1 opacity-90">
                <Sparkles className="w-3 h-3 text-amber-300" /> أكاديمية الخيميائي التفاعلية
              </span>
            </div>
          </div>

          {/* User Real Score Badges */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Stars Badge */}
            <div className="flex items-center gap-1.5 bg-amber-400 text-amber-950 font-black px-3 py-1.5 rounded-full text-xs shadow border border-amber-200">
              <Star className="w-4 h-4 fill-amber-950 text-amber-950" />
              <span>{userStars} نجوم</span>
            </div>

            {/* Points Badge */}
            <div className="flex items-center gap-1.5 bg-teal-500 text-slate-950 font-black px-3 py-1.5 rounded-full text-xs shadow border border-teal-200">
              <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>{userPoints} نقطة</span>
            </div>

            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700"
              title="بحث"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700"
              title="الإعدادات"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Profile Avatar Button */}
            <button
              onClick={onNavigateProfile}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-orange-400 p-0.5 shadow hover:scale-105 transition"
              title="الملف الشخصي"
            >
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-amber-300 font-bold text-xs">
                {studentName.charAt(0)}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-8 relative z-10">
        
        {/* HERO BANNER SECTION */}
        <div className="bg-slate-900/90 border-2 border-teal-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-2 text-center md:text-right z-10">
            <div className="inline-flex items-center gap-2 bg-teal-950 border border-teal-500/50 text-teal-300 text-xs font-extrabold px-3 py-1 rounded-full">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> مركز التحديات التفاعلية
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              مرحباً بك يا بطل العلوم، {studentName}! 👋
            </h2>
            <p className="text-sm font-bold text-slate-300 max-w-lg leading-relaxed">
              كل لعبة تجتازها تضيف نقاطاً ونجوماً حقيقية لحسابك! العب التحديات أدناه لرفع مجموع نقاطك وتفوقك الدراسي!
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700 shadow-inner z-10 shrink-0">
            <div className="p-3 bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 rounded-xl shadow">
              <Trophy className="w-7 h-7 fill-slate-950" />
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-400 block">إجمالي الإنجاز الحقيقي</span>
              <span className="text-lg font-black text-amber-300">{userPoints} نقطة • {userStars} نجمة</span>
            </div>
          </div>
        </div>

        {/* MAIN FEATURED SHOWCASE TITLE */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" /> ألعاب المعمل الرئيسية
          </h3>
          <span className="text-xs font-black text-teal-300 bg-teal-950/80 border border-teal-500/40 px-3 py-1 rounded-full">
            تحديات تفاعلية شاملة
          </span>
        </div>

        {/* TWO SHOWCASE CARDS (Color Sort & Water Physics) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* CARD 1: COLOR SORTING */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-slate-900/90 rounded-3xl border-2 border-purple-500/40 shadow-xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="bg-purple-950 text-purple-300 text-xs font-black px-3 py-1 rounded-full border border-purple-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" /> فرز المواد الكيميائية
              </span>
              <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {completedLevels['color_sort'] ? `${completedLevels['color_sort']} نجوم` : '+150 نقطة'}
              </span>
            </div>

            <div className="mb-4">
              <h4 className="text-xl font-black text-white mb-1">
                تحدي فرز الألوان 🧪
              </h4>
              <p className="text-xs font-bold text-slate-400">
                رتب السوائل ذات النقاء المتشابه في الأنابيب المخصصة!
              </p>
            </div>

            <div className="bg-slate-950 rounded-2xl p-5 border border-purple-900/50 flex items-center justify-around my-2 min-h-[160px]">
              <div className="w-8 h-28 rounded-b-xl border border-white/30 bg-white/5 p-1 flex flex-col-reverse gap-1">
                <div className="w-full h-5 rounded bg-blue-500" />
                <div className="w-full h-5 rounded bg-purple-500" />
                <div className="w-full h-5 rounded bg-amber-400" />
                <div className="w-full h-5 rounded bg-rose-500" />
              </div>
              <div className="w-8 h-28 rounded-b-xl border border-white/30 bg-white/5 p-1 flex flex-col-reverse gap-1">
                <div className="w-full h-5 rounded bg-rose-500" />
                <div className="w-full h-5 rounded bg-purple-500" />
                <div className="w-full h-5 rounded bg-blue-500" />
                <div className="w-full h-5 rounded bg-amber-400" />
              </div>
              <div className="w-8 h-28 rounded-b-xl border border-white/30 bg-white/5 p-1 flex flex-col-reverse gap-1">
                <div className="w-full h-5 rounded bg-amber-400" />
                <div className="w-full h-5 rounded bg-blue-500" />
                <div className="w-full h-5 rounded bg-rose-500" />
                <div className="w-full h-5 rounded bg-purple-500" />
              </div>
            </div>

            <button
              onClick={() => setActiveGameModal('color_sort')}
              className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-3.5 px-6 rounded-2xl shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>ابدأ تحدي الفرز الكيميائي</span>
            </button>
          </motion.div>

          {/* CARD 2: WATER PHYSICS */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-slate-900/90 rounded-3xl border-2 border-sky-500/40 shadow-xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="bg-sky-950 text-sky-300 text-xs font-black px-3 py-1 rounded-full border border-sky-700 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-sky-400" /> فيزياء السوائل والجاذبية
              </span>
              <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {completedLevels['water_physics'] ? `${completedLevels['water_physics']} نجوم` : '+200 نقطة'}
              </span>
            </div>

            <div className="mb-4">
              <h4 className="text-xl font-black text-white mb-1">
                الماء والحياة: لغز الفيزياء 💧
              </h4>
              <p className="text-xs font-bold text-slate-400">
                ارسم مسارات وحواجز لتوجيه قطرات الماء نحو الكوب الجائع!
              </p>
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 border border-sky-900/50 flex flex-col justify-between items-center my-2 min-h-[160px]">
              <div className="w-8 h-3 bg-slate-600 rounded-t-sm" />
              <div className="w-12 h-14 border-2 border-slate-500 bg-white/10 rounded-b-xl flex items-center justify-center text-xs font-black text-sky-300">
                🥤
              </div>
            </div>

            <button
              onClick={() => setActiveGameModal('water_physics')}
              className="w-full mt-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-black py-3.5 px-6 rounded-2xl shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>ابدأ لغز تدفق المياه</span>
            </button>
          </motion.div>

        </div>

        {/* ------------------------------------------------------------- */}
        {/* EXTRA GAME LEVELS GRID (6 REAL DISTINCT playable GAMES) */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" /> مستويات ومهمات تعليمية حقيقية
            </h3>
            <span className="text-xs font-bold text-teal-300">كل مستوي يوفر لعبة فريدة بأسئلة وتحديات حقيقية</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLevels.map((lvl, index) => {
              const stars = completedLevels[lvl.id] || 0;
              const isCompleted = stars > 0;

              return (
                <motion.div
                  key={lvl.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-slate-900/90 rounded-2xl p-4 border-2 border-slate-700/80 hover:border-teal-500/80 shadow-lg flex flex-col justify-between space-y-3 relative overflow-hidden group cursor-pointer"
                  onClick={() => setActiveGameModal(lvl.id as GameModalType)}
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${lvl.bgGradient} text-2xl flex items-center justify-center shadow-md`}>
                      {lvl.icon}
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] font-black text-teal-300 bg-teal-950 px-2 py-1 rounded-md border border-teal-800 inline-block mb-1">
                        {lvl.category}
                      </span>
                      <div className="flex items-center justify-end gap-0.5 text-amber-400">
                        {[...Array(3)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < stars ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-base font-black text-white mb-1 flex items-center gap-2">
                      {lvl.title}
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />}
                    </h5>
                    <p className="text-xs font-bold text-slate-400 leading-relaxed line-clamp-2">
                      {lvl.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 fill-amber-400" /> +{lvl.rewardPts} نقطة
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveGameModal(lvl.id as GameModalType);
                      }}
                      className="bg-teal-600 hover:bg-teal-500 text-white font-black text-xs px-4 py-2 rounded-xl transition shadow flex items-center gap-1"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{isCompleted ? 'إعادة اللعب' : 'دخول التحدي'}</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </main>

      {/* SEARCH MODAL */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-20 px-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -20 }}
              className="bg-slate-900 border-2 border-teal-500/40 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 text-white"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-black text-white text-lg flex items-center gap-2">
                  <Search className="w-5 h-5 text-teal-400" /> البحث في الألعاب
                </h3>
                <button onClick={() => setIsSearchOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن لعبة أو مادة (كيمياء، فيزياء...)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-teal-500"
                autoFocus
              />
              <div className="flex justify-end">
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm"
                >
                  تم
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SETTINGS MODAL */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-slate-900 border-2 border-teal-500/40 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 text-white"
            >
              <div className="flex items-center justify-between border-b pb-3 border-slate-800">
                <h3 className="font-black text-white text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-teal-400" /> إعدادات الألعاب
                </h3>
                <button onClick={() => setIsSettingsOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-teal-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                    المؤثرات الصوتية
                  </span>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-12 h-6 rounded-full p-1 transition ${soundEnabled ? 'bg-teal-500' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 bg-slate-950 rounded-full transition transform ${soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="p-3 bg-teal-950/80 rounded-xl border border-teal-800 text-xs font-bold text-teal-300">
                  💡 يتم حفظ نقاطك ونجومك تلقائياً في حسابك وبنك البيانات!
                </div>
              </div>

              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl text-sm"
              >
                إغلاق
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* GAME MODAL 1: COLOR SORT */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {activeGameModal === 'color_sort' && (
          <motion.div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div className="bg-slate-900 border-2 border-purple-500/40 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl relative">
              <button onClick={() => setActiveGameModal(null)} className="absolute top-4 left-4 p-2 rounded-full bg-slate-800 text-slate-300"><X className="w-5 h-5" /></button>
              
              <div className="text-center mb-4">
                <span className="bg-purple-950 text-purple-300 border border-purple-700 text-xs font-bold px-3 py-1 rounded-full">مختبر الكيمياء 🧪</span>
                <h3 className="text-2xl font-black text-white mt-2">تحدي فرز السوائل</h3>
              </div>

              <div className="flex justify-between items-center bg-slate-950 px-4 py-2 rounded-xl mb-4 text-xs font-bold border border-slate-800">
                <span>الحركات: {sortMoves}</span>
                <button onClick={resetColorSort} className="text-amber-400 flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" /> إعادة</button>
              </div>

              <div className="bg-slate-950 rounded-2xl p-6 border border-purple-900/50 flex justify-center gap-3 min-h-[200px]">
                {tubes.map((tube, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleTubeClick(idx)}
                    className={`w-12 h-36 rounded-b-2xl border-2 cursor-pointer flex flex-col-reverse p-1 gap-1 relative ${
                      selectedTube === idx ? 'border-amber-400 -translate-y-2' : 'border-slate-700 bg-slate-900/50'
                    }`}
                  >
                    {tube.map((color, colorIdx) => (
                      <div key={colorIdx} style={{ backgroundColor: color }} className="w-full h-7 rounded" />
                    ))}
                  </div>
                ))}
              </div>

              {sortWon && (
                <div className="mt-4 bg-emerald-950 border border-emerald-500 text-emerald-200 p-4 rounded-xl text-center space-y-2">
                  <Trophy className="w-8 h-8 text-amber-400 mx-auto" />
                  <h4 className="font-black">مبروك! رتبت السوائل بنجاح 🎉</h4>
                  <p className="text-xs">+150 نقطة و 3 نجوم حقيقية حُفظت!</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* GAME MODAL 2: WATER PHYSICS */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {activeGameModal === 'water_physics' && (
          <motion.div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div className="bg-slate-900 border-2 border-sky-400/40 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl relative">
              <button onClick={() => setActiveGameModal(null)} className="absolute top-4 left-4 p-2 rounded-full bg-slate-800 text-slate-300"><X className="w-5 h-5" /></button>
              
              <div className="text-center mb-3">
                <span className="bg-sky-950 text-sky-300 border border-sky-700 text-xs font-bold px-3 py-1 rounded-full">لغز الماء والفيزياء 💧</span>
                <h3 className="text-xl font-black mt-2">ارسم حواجز المياه</h3>
              </div>

              <div className="flex justify-center my-2">
                <canvas
                  ref={canvasRef}
                  width={320}
                  height={260}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                  className="bg-slate-950 border-2 border-slate-700 rounded-2xl cursor-crosshair touch-none"
                />
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setPhysicsActive(true)}
                  disabled={physicsActive}
                  className="flex-1 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 text-white font-black py-3 rounded-xl text-xs"
                >
                  {physicsActive ? 'المياه تتدفق...' : 'تدفق المياه 🌊'}
                </button>
                <button onClick={resetWaterPhysics} className="bg-slate-800 px-4 py-3 rounded-xl text-xs font-bold border border-slate-700">مسح</button>
              </div>

              {physicsWon && (
                <div className="mt-3 bg-sky-950 border border-sky-500 p-3 rounded-xl text-center text-xs font-bold text-sky-200">
                  🎉 ممتاز! الكوب امتلأ بالكامل! (+200 نقطة)
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* GAME MODAL 3: CHEMICAL PIPE MAZE (متاهة كيمياء السوائل) */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {activeGameModal === 'chem_maze' && (
          <motion.div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div className="bg-slate-900 border-2 border-blue-500/40 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl relative">
              <button onClick={() => setActiveGameModal(null)} className="absolute top-4 left-4 p-2 rounded-full bg-slate-800 text-slate-300"><X className="w-5 h-5" /></button>
              
              <div className="text-center mb-4">
                <span className="bg-blue-950 text-blue-300 border border-blue-700 text-xs font-bold px-3 py-1 rounded-full">تحدي شبكة الأنابيب 🧪</span>
                <h3 className="text-xl font-black mt-2">متاهة كيمياء السوائل</h3>
                <p className="text-xs text-slate-400 mt-1">انقر على وصلات الأنابيب لتدويرها وتوصيل الدوارق!</p>
              </div>

              {/* 4x4 Interactive Grid */}
              <div className="grid grid-cols-4 gap-2 bg-slate-950 p-4 rounded-2xl border border-slate-800 my-4">
                {mazeGrid.map((angle, idx) => (
                  <button
                    key={idx}
                    onClick={() => rotateMazePipe(idx)}
                    style={{ transform: `rotate(${angle}deg)` }}
                    className="w-14 h-14 bg-slate-800 border-2 border-teal-500/50 rounded-xl flex items-center justify-center text-xl hover:border-amber-400 transition"
                  >
                    {idx === 0 ? '🧪' : idx === 15 ? '⚗️' : '┼'}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={testMazeReaction}
                  disabled={mazeReacting || mazeWon}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 font-black py-3 rounded-xl text-xs"
                >
                  {mazeReacting ? 'التفاعل يتدفق...' : 'بدء التفاعل الكيميائي 🧪'}
                </button>
                <button onClick={resetMaze} className="bg-slate-800 px-4 py-3 rounded-xl text-xs font-bold">إعادة</button>
              </div>

              {mazeWon && (
                <div className="mt-4 bg-blue-950 border border-blue-500 p-3 rounded-xl text-center text-xs font-bold text-blue-200">
                  🎉 اكتملت الشبكة وتم التفاعل! (+180 نقطة)
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* GAME MODAL 4: CIRCUIT & VOLTAGE (تحدي الدوائر والجهد) */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {activeGameModal === 'circuit_volt' && (
          <motion.div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl relative">
              <button onClick={() => setActiveGameModal(null)} className="absolute top-4 left-4 p-2 rounded-full bg-slate-800 text-slate-300"><X className="w-5 h-5" /></button>
              
              <div className="text-center mb-4">
                <span className="bg-amber-950 text-amber-300 border border-amber-700 text-xs font-bold px-3 py-1 rounded-full">محاكي قانون أوم ⚡</span>
                <h3 className="text-xl font-black mt-2">تحدي الدوائر والجهد الكهربائي</h3>
                <p className="text-xs text-slate-400 mt-1">المطلوب: الوصول لشدة تيار <strong className="text-amber-400">0.40 أمبير</strong> لإضاءة المصباح!</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4 my-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>مصدر الجهد (V):</span>
                    <span className="text-amber-400">{circuitVoltage} فولت</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="24"
                    step="2"
                    value={circuitVoltage}
                    onChange={(e) => setCircuitVoltage(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs">
                  <span>إجمالي المقاومة (R):</span>
                  <span className="font-mono text-teal-400 font-bold">{totalResistance} أوم</span>
                </div>

                <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs">
                  <span>شدة التيار الناتجة (I = V/R):</span>
                  <span className={`font-mono text-base font-black ${isTargetCurrent ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {currentAmps} أمبير
                  </span>
                </div>

                <div className="text-center py-2">
                  <span className={`text-4xl inline-block transition-transform ${isTargetCurrent ? 'scale-125 filter drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]' : 'opacity-40'}`}>
                    💡
                  </span>
                </div>
              </div>

              <button
                onClick={handleCircuitSubmit}
                disabled={!isTargetCurrent || circuitWon}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 text-slate-950 font-black py-3 rounded-xl text-xs shadow"
              >
                {circuitWon ? 'تم اجتياز التحدي! 🎉' : isTargetCurrent ? 'توصيل التيار واحتساب النقاط ⚡' : 'اضبط الجهد للوصول لـ 0.40 أمبير'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* GAME MODAL 5: BALANCE & LEVER MECHANICS (اتزان الكتل) */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {activeGameModal === 'balance_physics' && (
          <motion.div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl relative">
              <button onClick={() => setActiveGameModal(null)} className="absolute top-4 left-4 p-2 rounded-full bg-slate-800 text-slate-300"><X className="w-5 h-5" /></button>
              
              <div className="text-center mb-3">
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs font-bold px-3 py-1 rounded-full">ميكانيكا العزوم ⚖️</span>
                <h3 className="text-xl font-black mt-2">اتزان الكتل والرافعة</h3>
                <p className="text-xs text-slate-400 mt-1">الجهة اليسرى تحتوي 10 كجم على مسافة 3م (عزم = 30 N.m)</p>
              </div>

              {/* Live Lever Visualization */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 my-3 relative overflow-hidden flex flex-col items-center">
                <div 
                  className="w-full h-3 bg-amber-500 rounded transition-transform duration-500 relative flex items-center justify-between px-2"
                  style={{ transform: `rotate(${(rightTorque - leftTorque) * 0.5}deg)` }}
                >
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">10kg</div>
                  <div className="w-3 h-3 bg-slate-300 rounded-full" />
                  <div className="flex gap-1">
                    {rightWeights.map((w, i) => (
                      <span key={i} className="text-[10px] bg-teal-500 text-slate-950 px-1.5 py-0.5 rounded font-black">
                        {w.mass}k@{w.pos}m
                      </span>
                    ))}
                  </div>
                </div>
                {/* Fulcrum triangle */}
                <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[25px] border-b-slate-500 mt-1" />
              </div>

              {/* Controls */}
              <div className="space-y-2 mb-4">
                <span className="text-xs font-bold text-slate-300">أضف وزناً على الجهة اليمنى:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => addWeightToBalance(10, 3)} className="bg-slate-800 hover:bg-slate-700 p-2 rounded-xl text-xs font-bold border border-slate-700">10كجم @ 3م</button>
                  <button onClick={() => addWeightToBalance(6, 5)} className="bg-slate-800 hover:bg-slate-700 p-2 rounded-xl text-xs font-bold border border-slate-700">6كجم @ 5م</button>
                  <button onClick={() => addWeightToBalance(15, 2)} className="bg-slate-800 hover:bg-slate-700 p-2 rounded-xl text-xs font-bold border border-slate-700">15كجم @ 2م</button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={checkBalanceSubmit}
                  disabled={!isBalanced || balanceWon}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-slate-950 font-black py-3 rounded-xl text-xs"
                >
                  {balanceWon ? 'تم تحقيق الاتزان! 🎉' : isBalanced ? 'اعتماد التوازن (+190 نقطة)' : 'حقق الاتزان (عزم اليسار = اليمين)'}
                </button>
                <button onClick={resetBalance} className="bg-slate-800 px-4 py-3 rounded-xl text-xs font-bold">إعادة</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* GAME MODAL 6: MOLECULE ASSEMBLY (تركيب الجزيئات الكيميائية) */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {activeGameModal === 'molecule_assembly' && (
          <motion.div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div className="bg-slate-900 border-2 border-purple-500/40 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl relative">
              <button onClick={() => setActiveGameModal(null)} className="absolute top-4 left-4 p-2 rounded-full bg-slate-800 text-slate-300"><X className="w-5 h-5" /></button>
              
              <div className="text-center mb-3">
                <span className="bg-purple-950 text-purple-300 border border-purple-700 text-xs font-bold px-3 py-1 rounded-full">الروابط التساهمية 🧩</span>
                <h3 className="text-xl font-black mt-2">تركيب الجزيئات الكيميائية</h3>
                <p className="text-xs text-slate-400 mt-1">الجزيء المطلوب: <strong className="text-purple-300">{moleculeFormula[targetMolecule].name}</strong></p>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 my-4 flex items-center justify-center gap-3 min-h-[140px]">
                <div className="w-12 h-12 rounded-full bg-rose-500 font-black text-lg flex items-center justify-center shadow-lg">
                  {moleculeFormula[targetMolecule].core}
                </div>
                <div className="flex gap-2">
                  {assembledAtoms.map((at, i) => (
                    <span key={i} className="w-10 h-10 rounded-full bg-sky-500 font-bold text-sm flex items-center justify-center animate-bounce">
                      {at}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <span className="text-xs font-bold text-slate-300">انقر لإضافة الذرات المرتبطة:</span>
                <div className="flex gap-2 justify-center">
                  <button onClick={() => handleAddAtom('H')} className="bg-sky-600 hover:bg-sky-500 px-5 py-2.5 rounded-xl font-black text-sm">ذرة هيدروجين (H)</button>
                  <button onClick={() => handleAddAtom('O')} className="bg-rose-600 hover:bg-rose-500 px-5 py-2.5 rounded-xl font-black text-sm">ذرة أكسجين (O)</button>
                </div>
              </div>

              <button onClick={resetMolecule} className="w-full bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl text-xs font-bold">إعادة الجزيء</button>

              {moleculeWon && (
                <div className="mt-4 bg-purple-950 border border-purple-500 p-3 rounded-xl text-center text-xs font-bold text-purple-200">
                  🎉 ممتاز! قمت بتركيب الجزيء بنجاح! (+220 نقطة)
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* GAME MODAL 7: LENS OPTICS & LIGHT REFRACTION (انكسار العدسات) */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {activeGameModal === 'lens_optics' && (
          <motion.div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div className="bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl relative">
              <button onClick={() => setActiveGameModal(null)} className="absolute top-4 left-4 p-2 rounded-full bg-slate-800 text-slate-300"><X className="w-5 h-5" /></button>
              
              <div className="text-center mb-3">
                <span className="bg-cyan-950 text-cyan-300 border border-cyan-700 text-xs font-bold px-3 py-1 rounded-full">معمل البصريات 🧭</span>
                <h3 className="text-xl font-black mt-2">انكسار عدسات الضوء</h3>
                <p className="text-xs text-slate-400 mt-1">اضبط البؤرة وزاوية المرآة لتسليط الليزر على المستشعر!</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 my-3">
                <div>
                  <label className="text-xs font-bold block mb-1">موقع العدسة المحدبة ({lensPosition}%):</label>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={lensPosition}
                    onChange={(e) => setLensPosition(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">زاوية انكسار المرآة ({mirrorAngle}°):</label>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={mirrorAngle}
                    onChange={(e) => setMirrorAngle(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>

              <button
                onClick={testOpticsRay}
                disabled={!opticsFocused || opticsWon}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-slate-950 font-black py-3 rounded-xl text-xs"
              >
                {opticsWon ? 'تم تركيز الشعاع! 🎉' : opticsFocused ? 'إطلاق الليزر (+170 نقطة)' : 'اضبط البؤرة (45-55%) والزاوية (40-50°)'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* GAME MODAL 8: HYDRAULIC PRESSURE (ضغط الهيدروليك) */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {activeGameModal === 'hydraulic_pressure' && (
          <motion.div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div className="bg-slate-900 border-2 border-sky-500/40 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl relative">
              <button onClick={() => setActiveGameModal(null)} className="absolute top-4 left-4 p-2 rounded-full bg-slate-800 text-slate-300"><X className="w-5 h-5" /></button>
              
              <div className="text-center mb-3">
                <span className="bg-sky-950 text-sky-300 border border-sky-700 text-xs font-bold px-3 py-1 rounded-full">قانون باسكال 🌊</span>
                <h3 className="text-xl font-black mt-2">ضغط الهيدروليك والكثافة</h3>
                <p className="text-xs text-slate-400 mt-1">اضبط القوة لرفع الحمولة الثقيلة (تحتاج قوة لا تقل عن 250 نيوتن)</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 my-3">
                <div>
                  <label className="text-xs font-bold block mb-1">القوة المطبقة (F₁): {inputForce} نيوتن</label>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="25"
                    value={inputForce}
                    onChange={(e) => setInputForce(Number(e.target.value))}
                    className="w-full accent-sky-400"
                  />
                </div>

                <div className="flex items-center justify-around bg-slate-900 p-4 rounded-xl">
                  <div className="text-center">
                    <span className="text-xs text-slate-400 block">المكبس الصغير</span>
                    <span className="font-bold text-sky-400">{inputForce} N</span>
                  </div>
                  <div className="text-2xl">➡️</div>
                  <div className="text-center">
                    <span className="text-xs text-slate-400 block">المكبس الكبير (رفع السيارة)</span>
                    <span className="font-black text-amber-400">{inputForce * 5} N</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLiftHydraulic}
                className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black py-3 rounded-xl text-xs"
              >
                {hydraulicWon ? 'تم رفع السيارة بالكامل! 🎉' : 'تشغيل المكبس الهيدروليكي 🌊'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FIXED BOTTOM APP BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-teal-500/30 pb-safe">
        <div className="max-w-md mx-auto flex justify-around items-center p-2">
          
          <button
            onClick={() => {
              setActiveBottomNav('home');
              if (onNavigateHome) onNavigateHome();
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition w-16 ${
              activeBottomNav === 'home' ? 'text-amber-300 font-bold scale-105' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-black">الرئيسية</span>
          </button>

          <button
            onClick={() => setActiveBottomNav('games')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition w-16 ${
              activeBottomNav === 'games' ? 'text-amber-300 font-bold scale-105' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-5 h-5 mb-1 text-amber-300 fill-amber-300" />
            <span className="text-[10px] font-black text-amber-300">الألعاب</span>
          </button>

          <button
            onClick={() => {
              setActiveBottomNav('results');
              if (onNavigateResults) onNavigateResults();
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition w-16 ${
              activeBottomNav === 'results' ? 'text-amber-300 font-bold scale-105' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-black">النتائج</span>
          </button>

          <button
            onClick={() => {
              setActiveBottomNav('profile');
              if (onNavigateProfile) onNavigateProfile();
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition w-16 ${
              activeBottomNav === 'profile' ? 'text-amber-300 font-bold scale-105' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-black">الملف الشخصي</span>
          </button>

        </div>
      </nav>

    </div>
  );
}
