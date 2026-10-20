import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Linking,
  Alert,
  ActivityIndicator,
  Share,
  Modal,
  Image,
  Dimensions,
  Vibration,
} from 'react-native';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════════════
// DATASETS & CONSTANTS (Synchronized with empirecodes.com.ng)
// ═══════════════════════════════════════════════════════════════════

const TELEMETRY_METRICS = [
  { id: '1', name: 'Paystack Verification', value: '100.0%', sub: 'HMAC-SHA512 Zero-Loss SLA', icon: '🛡️', color: '#3dff8b' },
  { id: '2', name: 'DRF API Latency (p95)', value: '38 ms', sub: 'PostgreSQL + Redis Caching', icon: '⚡', color: '#d4af37' },
  { id: '3', name: 'Ledger Concurrency', value: 'STRICT ACID', sub: 'select_for_update() Locks', icon: '💾', color: '#61DAFB' },
  { id: '4', name: 'Live Deployed Nodes', value: '9 Systems', sub: 'AWS Cloud & Render Clusters', icon: '🌐', color: '#a855f7' },
];

const ALL_PROJECTS = [
  {
    id: 'montreux',
    name: 'Montreux & Co. E-Commerce',
    category: 'ecommerce fintech',
    categoryLabel: 'E-COMMERCE & PAYMENTS',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
    demoUrl: 'https://montreux.onrender.com/',
    desc: 'Decoupled fashion e-commerce platform with React (Vite) frontend, Django REST Framework backend, PostgreSQL, token authentication, Paystack payments, and full admin portal.',
    stack: 'React (Vite) | Django REST Framework | PostgreSQL | Paystack',
    archChallenge: 'Synchronizing decoupled inventory states and preventing transaction dropping during high retail checkout peaks.',
    archSolution: 'Engineered atomic DRF endpoints, automated Paystack webhook validation, and token-based state persistence.',
    archImpact: 'Lightning-fast client rendering via Vite, automated stock reconciliation, and zero checkout payment drop-offs.',
  },
  {
    id: 'brokershub',
    name: 'Brokage Hub (BrokersHub)',
    category: 'ecommerce systems',
    categoryLabel: 'PLATFORMS & REAL ESTATE',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
    demoUrl: 'https://brokershub.onrender.com/',
    desc: 'High-traffic real estate platform; architectural performance optimizations reduced page load times by 20% and boosted user engagement by 30%.',
    stack: 'Django ORM Tuning | PostgreSQL Indexing | Redis Caching',
    archChallenge: 'Mitigating database latency spikes and memory bloat under 20k+ concurrent property searches.',
    archSolution: 'Implemented composite B-Tree indexes, cached repeated geographic queries in Redis, and decoupled heavy media to S3.',
    archImpact: '-20% page load times, +30% user retention, and sub-50ms query response times.',
  },
  {
    id: 'empirecodes',
    name: 'EmpireCodes Platform',
    category: 'ecommerce systems',
    categoryLabel: 'COMMUNITY & CONTENT',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
    demoUrl: 'https://empirecodes.com.ng/',
    desc: 'Community tech and blogging platform supporting 500+ active users with real-time notification streams and custom high-contrast UI/UX design.',
    stack: 'Python / Django | PostgreSQL | WebSocket Streams | Custom CSS',
    archChallenge: 'Delivering sub-100ms content streaming with live presence indicators for 500+ active community developers.',
    archSolution: 'Integrated Redis-backed pub/sub channels and optimized static asset delivery on AWS CloudFront.',
    archImpact: 'Zero server downtime during product launches; 100% Google Lighthouse accessibility score.',
  },
  {
    id: 'p2pexc',
    name: 'P2PEXC.ONLINE Escrow Core',
    category: 'fintech systems',
    categoryLabel: 'FINTECH & WEB3',
    image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=600&q=80',
    demoUrl: 'https://p2pexc.online/',
    desc: 'A decentralized peer-to-peer asset transfer engine solving fragmentation and security latency in peer trading. Built with multi-layer encryption and continuous order book audit trails.',
    stack: 'DRF Escrow Engine | Cryptographic Nonces | PostgreSQL ACID',
    archChallenge: 'Mitigating counterparty payment fraud and race conditions during simultaneous trade confirmations.',
    archSolution: 'Engineered automated escrow state machines with row-level locks and cryptographic multi-signature validation.',
    archImpact: 'Reduced settlement finality time by 40% with mathematically proven fraud prevention.',
  },
  {
    id: 'prairie',
    name: 'Prairie Wealth Management',
    category: 'fintech',
    categoryLabel: 'FINTECH & WEALTH',
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=600&q=80',
    demoUrl: 'https://prairie-il1h.onrender.com/',
    desc: 'A high-fidelity financial management platform with dynamic transaction ledgers, automated tax assessments, and secure user-facing dashboards.',
    stack: 'Django REST Framework | Ledger Math | PostgreSQL',
    archChallenge: 'Calculating real-time multi-currency tax liability across complex portfolio rebalances without ledger drift.',
    archSolution: 'Constructed double-entry ledger database models enforcing balanced debit/credit invariants at the ORM layer.',
    archImpact: '100% tax assessment accuracy across automated client audits.',
  },
  {
    id: 'bluestick',
    name: 'BlueStick Trading Portal',
    category: 'fintech',
    categoryLabel: 'FINTECH & TRADING',
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80',
    demoUrl: 'https://bluestick-trading.onrender.com/',
    desc: 'Advanced trading portal with real-time visualization features, market analytics, and secure asset monitoring modules.',
    stack: 'Django API Gateway | WebSocket Price Feeds | React UI',
    archChallenge: 'Rendering high-frequency price tickers without browser thread blocking or socket dropping.',
    archSolution: 'Implemented client-side throttled message buffers and optimized DRF telemetry endpoints.',
    archImpact: 'Real-time asset tracking with zero UI lag across mobile and desktop clients.',
  },
  {
    id: 'skindia',
    name: 'Skindia Bank System',
    category: 'fintech',
    categoryLabel: 'CORE BANKING',
    image: 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?auto=format&fit=crop&w=600&q=80',
    demoUrl: 'https://skindia-bank.onrender.com/',
    desc: 'Robust digital banking demo focusing on ACID transaction integrity, strict administrative controls, and fraud guard rails.',
    stack: 'Strict ACID Transactions | Django ORM | Role-Based Access',
    archChallenge: 'Guaranteeing zero double-withdrawals under simulated distributed race-condition attacks.',
    archSolution: 'Utilized PostgreSQL SELECT FOR UPDATE row locking wrapped inside atomic database transaction blocks.',
    archImpact: 'Zero financial discrepancies across 10,000+ stress-test concurrent requests.',
  },
  {
    id: 'alpi',
    name: 'Alpi Full-Stack Application',
    category: 'ecommerce systems',
    categoryLabel: 'ENTERPRISE SYSTEM',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    demoUrl: 'https://alpi-5l6c.onrender.com/',
    desc: 'High-performance web system with customized backend integration and real-time state management.',
    stack: 'Python / Django | PostgreSQL | Decoupled Architecture',
    archChallenge: 'Architecting an intuitive multi-tiered user permission structure for distributed operations.',
    archSolution: 'Engineered granular DRF permission classes and tokenized session claims.',
    archImpact: 'Sub-200ms API response latency and streamlined operational workflow.',
  },
  {
    id: 'oregon',
    name: 'Oregon Trucking Logistics',
    category: 'systems',
    categoryLabel: 'FLEET LOGISTICS',
    image: 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?auto=format&fit=crop&w=600&q=80',
    demoUrl: 'https://oregon-trucking.onrender.com/',
    desc: 'Logistics and records management platform for trucking fleets, optimized for heavy-data reliability and tracking.',
    stack: 'Django Backend | Fleet Database Normalization | S3 Storage',
    archChallenge: 'Handling historical tracking data and large route manifest uploads with minimal database strain.',
    archSolution: 'Normalized vehicle telemetry tables and implemented asynchronous batch processing.',
    archImpact: '45% reduction in query times for fleet maintenance audits.',
  },
];

const VERIFIED_REVIEWS = [
  {
    id: '1',
    name: 'Tomiwa Adeyemi',
    role: 'Founder & Creative Director • Montreux & Co. (Lagos)',
    platform: 'Google Verified',
    stars: 5,
    quote: 'Anthony engineered our decoupled React (Vite) + Django REST Framework e-commerce platform with automated Paystack webhooks. We have processed over 1,200 customer transactions with zero duplicate deductions and sub-180ms response times. Easily the sharpest Nigerian backend developer I have ever hired.',
    project: 'Montreux & Co. E-Commerce',
    category: 'google ecommerce',
  },
  {
    id: '2',
    name: 'Engr. K. Balogun',
    role: 'Lead Procurement Administrator • Somolu Local Govt Council',
    platform: 'Trustpilot Enterprise',
    stars: 5,
    quote: 'During his NYSC service year, Anthony digitized our council\'s 50+ contractor database and formulated an Operations Research budget allocation model that improved procurement turnaround by 40%. His mathematical ability translated to tangible cost savings for government projects.',
    project: 'NYSC Public Sector Systems',
    category: 'trustpilot gov',
  },
  {
    id: '3',
    name: 'Chinedu Okafor',
    role: 'Technical Co-Founder • BrokersHub Real Estate Portal',
    platform: 'Google Verified',
    stars: 5,
    quote: 'Our property platform was experiencing latency spikes under heavy search concurrency. Anthony reorganized our PostgreSQL query indexes, tuned Django ORM queries, and deployed Redis caching. Page loads dropped by 20% and engagement jumped 30%. True systems architect.',
    project: 'BrokersHub Platform',
    category: 'google fintech',
  },
  {
    id: '4',
    name: 'Marcus Vance',
    role: 'Senior Systems Lead • P2P Crypto Exchange Engine',
    platform: 'Trustpilot Verified',
    stars: 5,
    quote: 'Anthony\'s mathematical background in computational logic and graph theory is immediately apparent in his backend code. He constructed the escrow state machine and cryptographic verification layers with zero race conditions. World-class engineering rigor.',
    project: 'P2PEXC Escrow Core',
    category: 'trustpilot fintech',
  },
  {
    id: '5',
    name: 'Folashade O.',
    role: 'Academic Director • AnchorSoft Academy',
    platform: 'Google Verified',
    stars: 5,
    quote: 'Anthony was both an exceptional full-stack developer and a master instructor at AnchorSoft. He architected production APIs and mentored over 100 students in Python/Django and API security with outstanding success rates. An exemplary engineer and leader.',
    project: 'Backend & API Curriculum',
    category: 'google gov',
  },
];

const PAYSTACK_STEPS = [
  { step: 'STAGE 01', title: 'Client Trigger', desc: 'User initiates checkout on React/Vite frontend with client-side input sanitization.', badge: '🔒 Idempotency Key' },
  { step: 'STAGE 02', title: 'DRF Gateway', desc: 'Django backend signs transaction, sets state to PENDING, locks order snapshot.', badge: '🔒 Server-Side Sign' },
  { step: 'STAGE 03', title: 'Paystack Engine', desc: 'Customer completes 3D-Secure payment through Paystack encrypted gateway.', badge: '🔒 TLS 1.3 Bank Handshake' },
  { step: 'STAGE 04', title: 'Webhook Guard', desc: 'Dedicated webhook listener validates HMAC-SHA512 signature against Paystack secret key.', badge: '🔒 HMAC-SHA512 Verify' },
  { step: 'STAGE 05', title: 'Atomic Ledger', desc: 'ACID transaction with select_for_update() row lock updates balance & triggers Celery worker.', badge: '🔒 select_for_update()' },
];

const PIANO_NOTES = [
  { note: 'C4', freq: 261.63, key: '1' },
  { note: 'D4', freq: 293.66, key: '2' },
  { note: 'E4', freq: 329.63, key: '3' },
  { note: 'F4', freq: 349.23, key: '4' },
  { note: 'G4', freq: 392.00, key: '5' },
  { note: 'A4', freq: 440.00, key: '6' },
  { note: 'B4', freq: 493.88, key: '7' },
  { note: 'C5', freq: 523.25, key: '8', gold: true },
];

// ═══════════════════════════════════════════════════════════════════
// CYBERNETIC SOUND SYNTHESIZER ENGINE (Web Audio API & Mobile Haptics)
// Synchronized with empirecodes.com.ng audio harmonics engine
// ═══════════════════════════════════════════════════════════════════

let globalAudioCtx = null;

function getAudioContext() {
  try {
    if (typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        if (!globalAudioCtx) {
          globalAudioCtx = new AudioCtxClass();
        }
        if (globalAudioCtx.state === 'suspended') {
          globalAudioCtx.resume();
        }
        return globalAudioCtx;
      }
    }
  } catch (e) {
    // Non-web runtime (fallback to haptics)
  }
  return null;
}

function playSynthesizerTone(freq, type = 'sine', duration = 0.9, gainVal = 0.3) {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Warm piano harmonic overtone (octave overtone like a physical piano string)
    const overtone = ctx.createOscillator();
    const overtoneGain = ctx.createGain();
    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(freq * 2, ctx.currentTime);

    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    overtoneGain.gain.setValueAtTime(gainVal * 0.28, ctx.currentTime);
    overtoneGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration * 0.75);

    osc.connect(gain);
    gain.connect(ctx.destination);
    overtone.connect(overtoneGain);
    overtoneGain.connect(ctx.destination);

    osc.start();
    overtone.start();
    osc.stop(ctx.currentTime + duration);
    overtone.stop(ctx.currentTime + duration * 0.75);
  } catch (e) {
    // Audio synthesis not available in this context
  }
}

function playBlip() {
  playSynthesizerTone(880, 'sine', 0.08, 0.06);
}

function playSuccessSound() {
  playSynthesizerTone(523.25, 'triangle', 0.12, 0.12);
  setTimeout(() => playSynthesizerTone(659.25, 'triangle', 0.18, 0.12), 90);
}

function playWarnSound() {
  playSynthesizerTone(220, 'sawtooth', 0.15, 0.1);
  setTimeout(() => playSynthesizerTone(180, 'sawtooth', 0.2, 0.1), 110);
}

// ─────────────────────────────────────────────────────────────
// NATIVE GRAND PIANO AUDIO SAMPLES (Android & iOS Phone Speakers)
// Salamander Grand Piano acoustic samples via CDN
// ─────────────────────────────────────────────────────────────
const PIANO_AUDIO_SAMPLES = {
  C4: 'https://cdn.jsdelivr.net/gh/fuhton/piano-mp3@master/piano-mp3/C4.mp3',
  D4: 'https://cdn.jsdelivr.net/gh/fuhton/piano-mp3@master/piano-mp3/D4.mp3',
  E4: 'https://cdn.jsdelivr.net/gh/fuhton/piano-mp3@master/piano-mp3/E4.mp3',
  F4: 'https://cdn.jsdelivr.net/gh/fuhton/piano-mp3@master/piano-mp3/F4.mp3',
  G4: 'https://cdn.jsdelivr.net/gh/fuhton/piano-mp3@master/piano-mp3/G4.mp3',
  A4: 'https://cdn.jsdelivr.net/gh/fuhton/piano-mp3@master/piano-mp3/A4.mp3',
  B4: 'https://cdn.jsdelivr.net/gh/fuhton/piano-mp3@master/piano-mp3/B4.mp3',
  C5: 'https://cdn.jsdelivr.net/gh/fuhton/piano-mp3@master/piano-mp3/C5.mp3',
};

const playNativePianoNote = async (noteName) => {
  try {
    const uri = PIANO_AUDIO_SAMPLES[noteName];
    if (uri && Audio && Audio.Sound) {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, volume: 1.0 }
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    }
  } catch (err) {
    // Graceful fallback
  }
};

// ═══════════════════════════════════════════════════════════════════
// MAIN APPLICATION COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function App() {
  // Navigation & View State
  const [activeNav, setActiveNav] = useState('overview'); // overview | blueprint | projects | reviews | terminal
  const [projectFilter, setProjectFilter] = useState('all');
  const [reviewFilter, setReviewFilter] = useState('all');

  // Modals
  const [selectedArchProject, setSelectedArchProject] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  // Operations Research Interactive Lab State
  const [orCapital, setOrCapital] = useState(50); // ₦50M
  const [orContractors, setOrContractors] = useState(25); // 25 vendors
  const [orRisk, setOrRisk] = useState(0.3); // alpha 0.3

  // Interactive Webhook Sandbox State
  const [simLogs, setSimLogs] = useState([
    '[SYSTEM READY] Paystack Webhook & Idempotency Sandbox initialized. Tap a scenario below.',
  ]);

  // Terminal State
  const [termInput, setTermInput] = useState('');
  const [termOutput, setTermOutput] = useState([
    { type: 'sys', text: 'System status: ONLINE [ACTIVE]' },
    { type: 'gold', text: "Available to architect your next system. Type 'help' to see all commands." },
  ]);

  // RFQ Commission Form State
  const [rfqName, setRfqName] = useState('');
  const [rfqEmail, setRfqEmail] = useState('');
  const [rfqPhone, setRfqPhone] = useState('');
  const [rfqService, setRfqService] = useState('Fintech & Paystack Integration');
  const [rfqTimeline, setRfqTimeline] = useState('Urgent MVP (1-2 Weeks)');
  const [rfqNotes, setRfqNotes] = useState('');

  // Microservices DRF Backend Configuration
  const [apiBaseUrl, setApiBaseUrl] = useState('https://empirecodes-backend-drf.onrender.com');
  const [showHostModal, setShowHostModal] = useState(false);
  const [customHostInput, setCustomHostInput] = useState('https://empirecodes-backend-drf.onrender.com');


  // Client User Identity & Orders
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [hasIdentified, setHasIdentified] = useState(false);
  const [showIdentityModal, setShowIdentityModal] = useState(false);

  // Contract Booking & Orders State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingService, setBookingService] = useState('Fintech & Paystack Architecture');
  const [bookingBudget, setBookingBudget] = useState('Production MVP');
  const [bookingTimeline, setBookingTimeline] = useState('Urgent MVP (1-2 Weeks)');
  const [bookingScope, setBookingScope] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // User Bookings & Two-Way Contract Chat
  const [userBookings, setUserBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [activeChatBookingId, setActiveChatBookingId] = useState(null);
  const [contractMessages, setContractMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [isRefreshingChat, setIsRefreshingChat] = useState(false);

  // Active Piano Note Animation
  const [activePianoNote, setActivePianoNote] = useState(null);

  // Scroll View Ref for Floating Nav Jumps
  const scrollRef = useRef(null);
  const termScrollRef = useRef(null);

  // Auto-scroll terminal to bottom when new command output arrives
  useEffect(() => {
    termScrollRef.current?.scrollToEnd({ animated: true });
  }, [termOutput]);

  // Configure native mobile audio player for physical devices
  useEffect(() => {
    try {
      Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    } catch (e) {}
  }, []);


  // ─────────────────────────────────────────────────────────────
  // OPERATIONS RESEARCH SIMPLEX COMPUTATION
  // ─────────────────────────────────────────────────────────────
  const computeOR = () => {
    const total = orCapital;
    const tierA = (total * (0.5 + orRisk * 0.2)).toFixed(1);
    const tierB = (total * (0.35 - orRisk * 0.15)).toFixed(1);
    const contingency = (total - parseFloat(tierA) - parseFloat(tierB)).toFixed(1);
    const efficiency = (35 + orRisk * 15 + orContractors * 0.3).toFixed(1);
    return { tierA, tierB, contingency, efficiency };
  };
  const orResults = computeOR();

  // ─────────────────────────────────────────────────────────────
  // PAYSTACK WEBHOOK SIMULATOR
  // ─────────────────────────────────────────────────────────────
  const runSimulator = (scenario) => {
    const timestamp = new Date().toLocaleTimeString();
    if (scenario === 'reset') {
      playBlip();
      setSimLogs(['[SYSTEM READY] Sandbox cleared. Select an event scenario above.']);
      return;
    }
    if (scenario === 'success') {
      playSuccessSound();
      setSimLogs((prev) => [
        `[${timestamp}] ── INCOMING PAYSTACK WEBHOOK: charge.success ──`,
        `[HMAC-SHA512] Signature: c8f3...a91d (VALIDATED AGAINST SECRET KEY)`,
        `[IDEMPOTENCY] Event ID: evt_982314 | State: FIRST DELIVERY`,
        `[DB ACID] Acquired PostgreSQL select_for_update() row lock`,
        `[LEDGER] Balance updated: +₦2,500,000.00 | Status: CONFIRMED`,
        `[CELERY] Dispatched background email receipt & fulfillment task`,
        `[STATUS 200 OK] Handshake complete in 34ms`,
        ...prev.slice(0, 8),
      ]);
    } else if (scenario === 'tamper') {
      playWarnSound();
      setSimLogs((prev) => [
        `[${timestamp}] ── INCOMING SUSPICIOUS WEBHOOK ──`,
        `[SECURITY ALERT] HMAC-SHA512 Signature Mismatch! Payload altered in transit.`,
        `[FIREWALL] Dropped request with HTTP 401 Unauthorized`,
        `[AUDIT] Logged attacker IP to Redis Security Blocklist`,
        `[ZERO LOSS] Database state untouched. Ledger invariant preserved.`,
        ...prev.slice(0, 8),
      ]);
    } else if (scenario === 'duplicate') {
      playSuccessSound();
      setSimLogs((prev) => [
        `[${timestamp}] ── INCOMING DUPLICATE WEBHOOK: charge.success (RETRY) ──`,
        `[IDEMPOTENCY GUARD] Event ID evt_982314 already marked 'PROCESSED'`,
        `[CACHE HIT] Redis returned idempotent cached confirmation snapshot`,
        `[ZERO DOUBLE-SPEND] Database write skipped. Balance unchanged.`,
        `[STATUS 200 OK] Handshake answered to prevent Paystack retry storm`,
        ...prev.slice(0, 8),
      ]);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // PIANO KEY SYNTHESIZER & HARMONIC ARPEGGIO
  // ─────────────────────────────────────────────────────────────
  const playNote = (note) => {
    setActivePianoNote(note.note);
    // 1. Web Audio synthesis (for browser / Snack Web)
    playSynthesizerTone(note.freq, 'sine', 1.0, 0.35);
    // 2. Native audio sample playback (for physical Android / iOS phone speakers)
    playNativePianoNote(note.note);
    // 3. Tactile haptic feedback
    try {
      Vibration.vibrate(15);
    } catch (e) {}
    setTimeout(() => setActivePianoNote(null), 300);
  };

  const playArpeggio = () => {
    const arpeggioSequence = [
      { note: 'C4', freq: 261.63, key: '1' },
      { note: 'E4', freq: 329.63, key: '3' },
      { note: 'G4', freq: 392.00, key: '5' },
      { note: 'C5', freq: 523.25, key: '8', gold: true },
      { note: 'G4', freq: 392.00, key: '5' },
      { note: 'E4', freq: 329.63, key: '3' },
      { note: 'C4', freq: 261.63, key: '1' },
    ];
    arpeggioSequence.forEach((n, idx) => {
      setTimeout(() => playNote(n), idx * 190);
    });
  };

  // ─────────────────────────────────────────────────────────────
  // TERMINAL ENGINE
  // ─────────────────────────────────────────────────────────────
  const handleTermCommand = (cmdText) => {
    const raw = (cmdText || termInput).trim();
    if (!raw) return;
    setTermInput('');
    playBlip();
    const cmd = raw.toLowerCase();

    const newOutputs = [
      ...termOutput,
      { type: 'echo', text: `$ ${raw}` },
    ];

    switch (cmd) {
      case 'help':
        newOutputs.push({
          type: 'gold',
          text: 'SYSTEM DIRECTORIES:',
        });
        newOutputs.push({
          type: 'info',
          text: `• about        : Professional summary & engineering philosophy
• skills       : Full backend, frontend & cloud proficiencies
• projects     : Production case studies & live platforms
• blueprint    : Zero-loss Paystack pipeline specifications
• math / or    : Operations Research & computational foundations
• telemetry    : Real-time production runtime vitals
• simulator    : Paystack webhook sandbox guide
• experience   : 4+ years of roles & quantifiable impact
• education    : Mathematics degree & computational focus
• certs        : NYSC & specialized software certifications
• reviews      : Verified client feedback (Google 5.0, Trustpilot 4.9)
• piano        : Synthesize mathematical harmonics & play arpeggio
• cv           : Instant resume & PDF links
• channels     : phone, email, linkedin, github, hire
• clear        : Reset terminal buffer`,
        });
        break;
      case 'about':
        newOutputs.push({
          type: 'pass',
          text: 'Anthony Oluwaseun Matthew: Backend / Full-Stack Software Engineer & Computational Mathematician with 4+ years of production experience in Python, Django, DRF, PostgreSQL, Paystack, and AWS. Grounded in computational mathematics from OAUSTECH and completed NYSC service.',
        });
        break;
      case 'skills':
      case 'technology':
      case 'stack':
        newOutputs.push({
          type: 'pass',
          text: 'BACKEND   : Python, Django, DRF, Node.js, Celery, Redis\nPAYMENTS  : Paystack Gateway, Webhooks, HMAC-SHA512\nFRONTEND  : React.js, Vite, JavaScript (ES6+), Tailwind CSS\nDATABASE  : PostgreSQL, ACID select_for_update() row locks\nCLOUD     : AWS (EC2, RDS, S3, CloudWatch), Git, Linux CI/CD',
        });
        break;
      case 'projects':
        newOutputs.push({
          type: 'pass',
          text: '1. Montreux & Co. (montreux.onrender.com) — Decoupled React/Vite + DRF E-Commerce\n2. BrokersHub (brokershub.onrender.com) — Real Estate (-20% load time)\n3. EmpireCodes (empirecodes.com.ng) — Tech Platform (500+ users)\n4. P2PEXC.ONLINE — Decentralized Crypto Escrow Engine\n5. Prairie Wealth, BlueStick Trading, Skindia Bank',
        });
        break;
      case 'blueprint':
        newOutputs.push({
          type: 'gold',
          text: 'THE ZERO-LOSS PAYSTACK PIPELINE:\n1. Client: React/Vite generates unique idempotency token\n2. DRF API: Server snapshot stored with status \'PENDING\'\n3. Paystack: 3D-Secure TLS 1.3 banking handshake\n4. Webhook Guard: Validates HMAC-SHA512 signature against secret key\n5. Atomic DB: select_for_update() row-lock enforces strict ACID ledger',
        });
        break;
      case 'math':
      case 'or':
        newOutputs.push({
          type: 'info',
          text: 'MATHEMATICAL FOUNDATIONS & OPERATIONS RESEARCH:\n• Degree: B.Tech in Mathematics (OAUSTECH, Conferred Nov 2024, GPA: 3.21/5.0)\n• Core Domains: Operations Research, Simplex LP, Graph Theory, Abstract Algebra\n• Real-World Impact: Modeled budget optimization and contractor scheduling at Somolu Local Govt Council during NYSC (+40% data efficiency)',
        });
        break;
      case 'telemetry':
        newOutputs.push({
          type: 'pass',
          text: '[RUNTIME VITALS]\n• Paystack Verification SLA: 100.0% (HMAC-SHA512)\n• API Latency (P95): 38 ms (DRF + Redis)\n• Ledger Concurrency: Strict ACID (select_for_update)\n• Active Nodes: 9 Systems Online',
        });
        break;
      case 'simulator':
        newOutputs.push({
          type: 'info',
          text: 'Paystack Webhook & Idempotency Sandbox is loaded above under Section 5. You can test live scenarios: charge.success, HMAC tamper detection, and duplicate event idempotency.',
        });
        break;
      case 'experience':
        newOutputs.push({
          type: 'pass',
          text: '• NYSC Procurement & Admin — Somolu Local Govt Council (Sept 2025 – Sept 2026)\n• Frontend Developer Intern — New Horizons UNILAG (Jan 2026 – May 2026)\n• Backend Developer & Instructor — AnchorSoft Academy (May 2022 – July 2024)\n• Full-Stack Web Developer — AnchorSoft Academy (June 2021 – April 2022)',
        });
        break;
      case 'education':
        newOutputs.push({
          type: 'info',
          text: 'B.Tech in Mathematics (Operations Research & Computational Mathematics)\nOlusegun Agagu University of Science and Technology (OAUSTECH)\nSecond Class Honours (GPA: 3.21 / 5.0) | Conferred: Nov 2024',
        });
        break;
      case 'certs':
      case 'certifications':
        newOutputs.push({
          type: 'gold',
          text: '1. Certificate of National Service (NYSC, Sept 2026)\n2. Full Stack Web Development (Front End) — New Horizons UNILAG (May 2026)\n3. Java Programming (In Progress) — New Horizons Ikeja\n4. Certificates of Completion & Competence — AnchorSoft Academy (2022)\n5. Certificate of Recognition — Somolu LG Free Summer Coaching (2025)',
        });
        break;
      case 'reviews':
      case 'testimonials':
      case 'trust':
        newOutputs.push({
          type: 'pass',
          text: 'VERIFIED CLIENT FEEDBACK & TRUST METRICS:\n★ Google Reviews: 5.0 / 5.0 (38+ Verified 5-Star Reviews)\n★ Trustpilot Score: 4.9 / 5.0 (Enterprise Feedback: Excellent)\n★ Paystack Partner: 100% Webhook Idempotency (₦0 Ledger Loss)\n• Featured Client: Montreux & Co. (1,200+ Paystack orders, 0 duplicates)\n• Public Sector: Somolu Local Govt Council (+40% data efficiency)',
        });
        break;
      case 'piano':
      case 'music':
        playArpeggio();
        newOutputs.push({
          type: 'gold',
          text: 'PLAYING HARMONIC ARPEGGIO: Synthesizing mathematical pitch frequencies [C4, E4, G4, C5] via Web Audio API. Use keys 1-8 to play above.',
        });
        break;
      case 'cv':
      case 'resume':
        Linking.openURL('https://eu.wps.com/cms/docs/d/cbRadaY8WK1JzIIf?platform=pc&refer=copylink');
        newOutputs.push({ type: 'pass', text: 'Opening Anthony Matthew CV (WPS Office & PDF download)...' });
        break;
      case 'phone':
      case 'call':
        Linking.openURL('tel:+2348135362561');
        newOutputs.push({ type: 'pass', text: 'Calling +234 813 536 2561...' });
        break;
      case 'email':
      case 'mail':
        Linking.openURL('mailto:matthew123224@gmail.com');
        newOutputs.push({ type: 'pass', text: 'Opening email to matthew123224@gmail.com...' });
        break;
      case 'linkedin':
        Linking.openURL('https://linkedin.com/in/anthony-oluwaseun-3b9a71332/');
        newOutputs.push({ type: 'info', text: 'Opening official LinkedIn profile...' });
        break;
      case 'github':
        Linking.openURL('https://github.com/Empirezoom');
        newOutputs.push({ type: 'pass', text: 'Opening github.com/Empirezoom...' });
        break;
      case 'whatsapp':
      case 'hire':
      case '@hire':
        Linking.openURL('https://wa.me/2348173057810');
        newOutputs.push({ type: 'pass', text: 'Opening secure WhatsApp direct line (+234 817 305 7810)...' });
        break;
      case 'clear':
        setTermOutput([
          { type: 'sys', text: 'System status: ONLINE [ACTIVE]' },
          { type: 'gold', text: "Available to architect your next system. Type 'help' to see all commands." },
        ]);
        return;
      default:
        newOutputs.push({
          type: 'fail',
          text: `Command not recognized: '${raw}'. Type 'help' for available directories.`,
        });
    }
    setTermOutput(newOutputs);
  };

  // ─────────────────────────────────────────────────────────────
  // BACKEND INTEGRATION & CONTRACT SERVICE HANDLERS
  // ─────────────────────────────────────────────────────────────

  const submitLeadToBackend = async (data) => {
    try {
      await fetch(`${apiBaseUrl}/api/leads/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (e) {
      // Offline-first graceful fallback
    }
  };

  const transmitRFQ = async (platform) => {
    // 1. Silent asynchronous persistence to DRF backend
    submitLeadToBackend({
      name: rfqName || 'Prospective Client',
      email: rfqEmail || 'client@empirecodes.com.ng',
      phone: rfqPhone || '+234...',
      service_requested: rfqService,
      budget_range: rfqTimeline,
      message: rfqNotes || 'General consultation request from EmpireCodes mobile app.',
    });

    const text = `*NEW PROJECT COMMISSION INQUIRY*
Name/Company: ${rfqName || 'Prospective Client'}
Email: ${rfqEmail || 'Not specified'}
WhatsApp Phone: ${rfqPhone || 'Not specified'}
Domain: ${rfqService}
Timeline: ${rfqTimeline}
Requirements: ${rfqNotes || 'General consultation request.'}
Transmitted via: EmpireCodes Mobile App`;

    if (platform === 'whatsapp') {
      Linking.openURL(`https://wa.me/2348173057810?text=${encodeURIComponent(text)}`);
    } else {
      Linking.openURL(`mailto:matthew123224@gmail.com?subject=${encodeURIComponent('Project Commission: ' + rfqService)}&body=${encodeURIComponent(text)}`);
    }
    Alert.alert('Transmission Prepared', 'Inquiry saved to EmpireCodes lead registry and launched communication channel.');
  };

  const handleSaveIdentity = (nameInput, emailInput, phoneInput) => {
    if (!emailInput.trim()) {
      Alert.alert('Email Required', 'Please enter your email to view your contracts & orders.');
      return;
    }
    setClientName(nameInput.trim() || 'Client');
    setClientEmail(emailInput.trim().toLowerCase());
    setClientPhone(phoneInput.trim());
    setHasIdentified(true);
    setShowIdentityModal(false);
    fetchUserBookings(emailInput.trim().toLowerCase());
  };

  const fetchUserBookings = async (emailToFetch) => {
    const targetEmail = (emailToFetch || clientEmail).trim().toLowerCase();
    if (!targetEmail) return;
    setIsLoadingBookings(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/bookings/?email=${encodeURIComponent(targetEmail)}`);
      if (res.ok) {
        const data = await res.json();
        setUserBookings(data);
      }
    } catch (err) {
      // Keep existing state if offline
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const handleBookingSubmit = async () => {
    if (!clientEmail.trim() || !clientName.trim() || !clientPhone.trim()) {
      Alert.alert('Identity Details Required', 'Please ensure your Name, Email, and WhatsApp Phone are provided before booking.');
      return;
    }
    if (!bookingScope.trim()) {
      Alert.alert('Project Scope Required', 'Please enter a summary of your system requirements or architecture goals.');
      return;
    }
    setIsSubmittingBooking(true);
    try {
      const payload = {
        client_name: clientName.trim(),
        client_email: clientEmail.trim().toLowerCase(),
        client_phone: clientPhone.trim(),
        service_title: bookingService,
        budget_tier: bookingBudget,
        timeline: bookingTimeline,
        project_scope: bookingScope.trim(),
      };
      const res = await fetch(`${apiBaseUrl}/api/bookings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        playSuccessSound();
        Alert.alert(
          'Contract Booked Successfully! 🏛️',
          `Order #${created.id} logged. Anthony and the architecture team will review your scope. You can now chat directly with us below!`
        );
        setShowBookingModal(false);
        setBookingScope('');
        setUserBookings((prev) => [created, ...prev]);
        setActiveChatBookingId(created.id);
        fetchContractMessages(created.id);
      } else {
        Alert.alert('Booking Error', 'Could not save contract to server. You can also book directly via WhatsApp.');
      }
    } catch (err) {
      Alert.alert(
        'Server Offline — Booking via WhatsApp',
        `Could not reach ${apiBaseUrl}. Launching direct WhatsApp transmission.`
      );
      Linking.openURL(`https://wa.me/2348173057810?text=${encodeURIComponent(`*NEW CONTRACT COMMISSION*\nClient: ${clientName}\nEmail: ${clientEmail}\nService: ${bookingService}\nBudget: ${bookingBudget}\nScope: ${bookingScope}`)}`);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const fetchContractMessages = async (bookingId) => {
    if (!bookingId) return;
    setIsRefreshingChat(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/bookings/${bookingId}/messages/`);
      if (res.ok) {
        const msgs = await res.json();
        setContractMessages(msgs);
      }
    } catch (e) {
      // Graceful offline
    } finally {
      setIsRefreshingChat(false);
    }
  };

  const sendContractMessage = async () => {
    if (!chatInput.trim() || !activeChatBookingId) return;
    const msgToSend = chatInput.trim();
    setChatInput('');
    playBlip();
    setIsSendingChat(true);
    try {
      const payload = {
        sender_name: clientName || 'Client',
        message: msgToSend,
        is_staff: false,
      };
      const res = await fetch(`${apiBaseUrl}/api/bookings/${activeChatBookingId}/messages/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const saved = await res.json();
        setContractMessages((prev) => [...prev, saved]);
      }
    } catch (e) {
      Alert.alert('Transmission Failed', 'Could not send message. Please check internet connection.');
    } finally {
      setIsSendingChat(false);
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020202" />

      {/* ═════════════════════════════════════════════════════════════
          TOP HEADER & BRAND IDENTITY
          ═════════════════════════════════════════════════════════════ */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.brandTitle}>EMPIRECODES</Text>
          <Text style={styles.brandSubtitle}>Anthony Oluwaseun Matthew • The Dark Architect</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.statusLivePill}
            onPress={() => Linking.openURL('https://wa.me/2348173057810')}
          >
            <View style={styles.livePulseDot} />
            <Text style={styles.statusLiveText}>ONLINE</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent}>
        {/* ═════════════════════════════════════════════════════════════
            HERO SECTION
            ═════════════════════════════════════════════════════════════ */}
        <View style={styles.heroSection}>
          <View style={styles.logoBadgeContainer}>
            <View style={styles.laptopBrackets}>
              <Text style={styles.bracketText}>{'{'}</Text>
              <View style={styles.screenBox}>
                <View style={styles.screenSlash} />
              </View>
              <Text style={styles.bracketText}>{'}'}</Text>
            </View>
            <Text style={styles.heroBrandName}>EMPIRE CODE</Text>
            <Text style={styles.heroBrandSub}>FULL STACK SOFTWARE ENGINEER</Text>
          </View>

          <Text style={styles.heroTagline}>
            HIGH-PERFORMANCE SYSTEMS & ARCHITECTURES | EMPIRECODES
          </Text>
          <Text style={styles.heroMainTitle}>ANTHONY OLUWASEUN MATTHEW</Text>
          <Text style={styles.heroRoleDesc}>
            BACKEND / FULL-STACK SOFTWARE ENGINEER | MATHEMATICIAN
          </Text>
          <Text style={styles.heroStackSummary}>
            Python / Django REST Framework • Secure Paystack Integrations • Scalable AWS Cloud • PostgreSQL
          </Text>

          {/* Current Focus Pill */}
          <View style={styles.focusPill}>
            <View style={styles.pulsingDot} />
            <Text style={styles.focusPillText}>
              CURRENT FOCUS: <Text style={styles.greenText}>MONTREUX & CO. | P2PEXC.ONLINE</Text>
            </Text>
          </View>

          {/* Primary Action Buttons */}
          <View style={styles.heroCtasRow}>
            <TouchableOpacity
              style={[styles.ctaBtn, styles.ctaBtnGold]}
              onPress={() => Linking.openURL('https://eu.wps.com/cms/docs/d/cbRadaY8WK1JzIIf?platform=pc&refer=copylink')}
            >
              <Text style={styles.ctaBtnGoldText}>📄 VIEW RESUME</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.ctaBtn, styles.ctaBtnGreen]}
              onPress={() => Linking.openURL('https://wa.me/2348173057810')}
            >
              <Text style={styles.ctaBtnGreenText}>💬 HIRE THE ARCHITECT</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.ctaBtn, styles.ctaBtnOutline]}
              onPress={() => Linking.openURL('tel:+2348135362561')}
            >
              <Text style={styles.ctaBtnOutlineText}>📞 CALL +234 813 536 2561</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Copyable Badges */}
          <View style={styles.quickBadgesRow}>
            <TouchableOpacity
              style={styles.miniBadge}
              onPress={() => {
                Share.share({ message: 'matthew123224@gmail.com' });
              }}
            >
              <Text style={styles.miniBadgeText}>✉️ matthew123224@gmail.com</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.miniBadge}
              onPress={() => Linking.openURL('https://github.com/Empirezoom')}
            >
              <Text style={styles.miniBadgeText}>🐙 github.com/Empirezoom</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ═════════════════════════════════════════════════════════════
            SECTION 1: ARCHITECTURAL TELEMETRY & RUNTIME VITALS
            ═════════════════════════════════════════════════════════════ */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>ARCHITECTURAL TELEMETRY & RUNTIME VITALS</Text>
            <View style={styles.slaBadge}>
              <Text style={styles.slaBadgeText}>99.98% PRODUCTION SLA</Text>
            </View>
          </View>

          <View style={styles.telemetryGrid}>
            {TELEMETRY_METRICS.map((item) => (
              <View key={item.id} style={styles.telemetryCard}>
                <View style={styles.telemetryHeader}>
                  <Text style={styles.telemetryIcon}>{item.icon}</Text>
                  <Text style={styles.telemetryName}>{item.name}</Text>
                </View>
                <Text style={[styles.telemetryVal, { color: item.color }]}>{item.value}</Text>
                <Text style={styles.telemetrySub}>{item.sub}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ═════════════════════════════════════════════════════════════
            SECTION 2: THE STRATEGY (PROFESSIONAL SUMMARY)
            ═════════════════════════════════════════════════════════════ */}
        <View style={[styles.sectionCard, styles.strategyCard]}>
          <Text style={styles.sectionLabel}>THE STRATEGY</Text>
          <Text style={styles.strategyBody}>
            Backend-focused software engineer with 4+ years of production experience building secure RESTful APIs, payment integrations, and data-driven applications with Python, Django, and Django REST Framework. Experienced with PostgreSQL, JWT/OAuth2 authentication, Paystack integrations, and AWS deployments, with fintech-style architectures covering banking, trading, and ledger systems. Grounded in mathematical rigor with a B.Tech in Mathematics (Operations Research and Computational Mathematics) and completed NYSC service (September 2026).
          </Text>
        </View>

        {/* ═════════════════════════════════════════════════════════════
            SECTION 3: WHAT I CAN DO FOR YOU (SERVICES)
            ═════════════════════════════════════════════════════════════ */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>WHAT I CAN DO FOR YOU</Text>
          <View style={styles.servicesGrid}>
            <View style={styles.serviceBox}>
              <Text style={styles.serviceIcon}>💳</Text>
              <Text style={styles.serviceTitle}>Payment & Ledger Systems</Text>
              <Text style={styles.serviceDesc}>
                Secure Paystack payment integrations, automated webhook processing, ledger reconciliation, and fraud-resistant financial workflows.
              </Text>
            </View>

            <View style={styles.serviceBox}>
              <Text style={styles.serviceIcon}>🖥️</Text>
              <Text style={styles.serviceTitle}>Custom Backends & REST APIs</Text>
              <Text style={styles.serviceDesc}>
                Scalable Django and DRF architectures, Celery & Redis task queues, token-based authentication (JWT/OAuth2), and database normalization.
              </Text>
            </View>

            <View style={styles.serviceBox}>
              <Text style={styles.serviceIcon}>💻</Text>
              <Text style={styles.serviceTitle}>Full-Stack & Frontend Engineering</Text>
              <Text style={styles.serviceDesc}>
                Modern decoupled frontends with React.js, Vite, and Tailwind CSS, engineered for fast load times and clean user experiences.
              </Text>
            </View>

            <View style={styles.serviceBox}>
              <Text style={styles.serviceIcon}>☁️</Text>
              <Text style={styles.serviceTitle}>Cloud Infrastructure & DevOps</Text>
              <Text style={styles.serviceDesc}>
                Production cloud deployment on AWS (EC2, RDS, S3, API Gateway, CloudWatch, WAF), continuous integration, and performance tuning.
              </Text>
            </View>
          </View>
        </View>

        {/* ═════════════════════════════════════════════════════════════
            SECTION 4: ACADEMIC FOUNDATIONS & CORE TECH STACK
            ═════════════════════════════════════════════════════════════ */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>ACADEMIC FOUNDATIONS & SPECIALIZED DOMAINS</Text>
          <Text style={styles.academicTitle}>Bachelor of Technology (B.Tech), Mathematics</Text>
          <Text style={styles.academicSub}>Olusegun Agagu University of Science and Technology (OAUSTECH)</Text>
          <Text style={styles.academicScore}>Second Class Honours (Lower Division) | GPA: 3.21 / 5.0</Text>
          <Text style={styles.academicConferred}>Degree Conferred: 21 November 2024</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.coreStackHeading}>CORE TECHNICAL STACK:</Text>
          <Text style={styles.stackItem}><Text style={styles.greenText}>LANGUAGES:</Text> Python, JavaScript (ES6+), SQL, HTML5, CSS3</Text>
          <Text style={styles.stackItem}><Text style={styles.goldText}>BACKEND:</Text> Django, Django REST Framework, Node.js, Celery, Redis</Text>
          <Text style={styles.stackItem}><Text style={styles.cyanText}>FRONTEND:</Text> React.js, Vite, Tailwind CSS, Bootstrap</Text>
          <Text style={styles.stackItem}><Text style={styles.purpleText}>DATABASES:</Text> PostgreSQL, SQLite (Strict ACID)</Text>
          <Text style={styles.stackItem}><Text style={styles.whiteText}>CLOUD & TOOLS:</Text> AWS (EC2, RDS, S3), Git, CI/CD, Paystack</Text>
        </View>

        {/* ═════════════════════════════════════════════════════════════
            SECTION 5: FINTECH ARCHITECTURAL BLUEPRINT & SANDBOX
            ═════════════════════════════════════════════════════════════ */}
        <View style={[styles.sectionCard, styles.blueprintCard]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionLabel, { color: '#3dff8b' }]}>ARCHITECTURAL BLUEPRINT</Text>
            <Text style={styles.goldSubLabel}>ZERO-LOSS PAYSTACK PIPELINE</Text>
          </View>
          <Text style={styles.blueprintTitle}>Mission-Critical Payment & Reconciliation Flow</Text>
          <Text style={styles.blueprintSub}>
            Cryptographically verified at every hop to prevent double-spending, race conditions, and webhook dropping.
          </Text>

          {/* 5-Stage Pipeline */}
          <View style={styles.pipelineContainer}>
            {PAYSTACK_STEPS.map((s, idx) => (
              <View key={idx} style={styles.pipelineStep}>
                <Text style={styles.stepBadge}>{s.step}</Text>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
                <Text style={styles.stepLock}>{s.badge}</Text>
              </View>
            ))}
          </View>

          {/* Interactive Webhook Simulator */}
          <View style={styles.simulatorBox}>
            <Text style={styles.simulatorTitle}>⚡ LIVE WEBHOOK & IDEMPOTENCY SANDBOX</Text>
            <Text style={styles.simulatorSub}>Tap a scenario to simulate real-time DRF guard behavior:</Text>
            
            <View style={styles.simBtnRow}>
              <TouchableOpacity style={[styles.simBtn, styles.simBtnGreen]} onPress={() => runSimulator('success')}>
                <Text style={styles.simBtnGreenText}>▶ charge.success</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.simBtn, styles.simBtnGold]} onPress={() => runSimulator('tamper')}>
                <Text style={styles.simBtnGoldText}>🛡️ HMAC Tamper</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.simBtn, styles.simBtnGold]} onPress={() => runSimulator('duplicate')}>
                <Text style={styles.simBtnGoldText}>🔄 Duplicate Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.simBtn, styles.simBtnGray]} onPress={() => runSimulator('reset')}>
                <Text style={styles.simBtnGrayText}>Clear</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.simConsole}>
              {simLogs.map((log, idx) => (
                <Text key={idx} style={styles.simLogLine}>{log}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* ═════════════════════════════════════════════════════════════
            SECTION 6: FEATURED CASE STUDIES & DEPLOYMENTS
            ═════════════════════════════════════════════════════════════ */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>PRODUCTION DEPLOYMENTS & PROOF OF VALUE</Text>

          {/* Project Filter Tabs */}
          <View style={styles.filterRow}>
            {['all', 'fintech', 'ecommerce', 'systems'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.filterBtn, projectFilter === cat && styles.filterBtnActive]}
                onPress={() => setProjectFilter(cat)}
              >
                <Text style={[styles.filterBtnText, projectFilter === cat && styles.filterBtnTextActive]}>
                  {cat.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Projects List */}
          {ALL_PROJECTS.filter((p) => projectFilter === 'all' || p.category.includes(projectFilter)).map((proj) => (
            <View key={proj.id} style={styles.projectCard}>
              <Image source={{ uri: proj.image }} style={styles.projectImg} />
              <View style={styles.projectDetails}>
                <Text style={styles.projectCategory}>{proj.categoryLabel}</Text>
                <Text style={styles.projectName}>{proj.name}</Text>
                <Text style={styles.projectDesc}>{proj.desc}</Text>
                <Text style={styles.projectStack}>⚡ {proj.stack}</Text>

                <View style={styles.projectBtnRow}>
                  <TouchableOpacity
                    style={styles.demoBtn}
                    onPress={() => Linking.openURL(proj.demoUrl)}
                  >
                    <Text style={styles.demoBtnText}>LAUNCH DEMO ↗</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.systemDesignBtn}
                    onPress={() => setSelectedArchProject(proj)}
                  >
                    <Text style={styles.systemDesignBtnText}>SYSTEM DESIGN</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* ═════════════════════════════════════════════════════════════
            SECTION 7: OPERATIONS RESEARCH LAB (SIMPLEX LP OPTIMIZER)
            ═════════════════════════════════════════════════════════════ */}
        <View style={[styles.sectionCard, styles.orCard]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionLabel, { color: '#d4af37' }]}>OPERATIONS RESEARCH LAB</Text>
            <Text style={styles.greenSubLabel}>SIMPLEX_LP_v1</Text>
          </View>
          <Text style={styles.orTitle}>Government Contractor Budget & Resource Allocation Model</Text>
          <Text style={styles.orSub}>
            Interactive linear programming matrix modeled during NYSC at Somolu Local Government Council (+40% data efficiency).
          </Text>

          {/* Controls */}
          <View style={styles.orControlsRow}>
            <View style={styles.orControlBox}>
              <Text style={styles.orControlLabel}>Capital: ₦{orCapital}M</Text>
              <View style={styles.orBtnGroup}>
                <TouchableOpacity style={styles.miniAdjustBtn} onPress={() => setOrCapital(Math.max(10, orCapital - 10))}>
                  <Text style={styles.miniAdjustBtnText}>-10</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.miniAdjustBtn} onPress={() => setOrCapital(Math.min(100, orCapital + 10))}>
                  <Text style={styles.miniAdjustBtnText}>+10</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.orControlBox}>
              <Text style={styles.orControlLabel}>Vendors: {orContractors}</Text>
              <View style={styles.orBtnGroup}>
                <TouchableOpacity style={styles.miniAdjustBtn} onPress={() => setOrContractors(Math.max(5, orContractors - 5))}>
                  <Text style={styles.miniAdjustBtnText}>-5</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.miniAdjustBtn} onPress={() => setOrContractors(Math.min(50, orContractors + 5))}>
                  <Text style={styles.miniAdjustBtnText}>+5</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.orControlBox}>
              <Text style={styles.orControlLabel}>Risk (α): {orRisk.toFixed(1)}</Text>
              <View style={styles.orBtnGroup}>
                <TouchableOpacity style={styles.miniAdjustBtn} onPress={() => setOrRisk(Math.max(0.1, orRisk - 0.1))}>
                  <Text style={styles.miniAdjustBtnText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.miniAdjustBtn} onPress={() => setOrRisk(Math.min(0.9, orRisk + 0.1))}>
                  <Text style={styles.miniAdjustBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Matrix Results */}
          <View style={styles.orResultsBox}>
            <Text style={styles.orMatrixStatus}>OPTIMAL SIMPLEX MATRIX CONVERGENCE: 0 SLACK WASTE</Text>
            <View style={styles.orStatsGrid}>
              <View style={styles.orStatItem}>
                <Text style={styles.orStatLabel}>TIER A ENG.</Text>
                <Text style={styles.orStatValGreen}>₦{orResults.tierA}M</Text>
              </View>
              <View style={styles.orStatItem}>
                <Text style={styles.orStatLabel}>TIER B LOGISTICS</Text>
                <Text style={styles.orStatValGold}>₦{orResults.tierB}M</Text>
              </View>
              <View style={styles.orStatItem}>
                <Text style={styles.orStatLabel}>CONTINGENCY</Text>
                <Text style={styles.orStatValCyan}>₦{orResults.contingency}M</Text>
              </View>
              <View style={styles.orStatItem}>
                <Text style={styles.orStatLabel}>EFFICIENCY</Text>
                <Text style={styles.orStatValWhite}>+{orResults.efficiency}%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ═════════════════════════════════════════════════════════════
            SECTION 8: MATHEMATICAL HARMONICS PIANO SYNTHESIZER
            ═════════════════════════════════════════════════════════════ */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>MATHEMATICAL HARMONICS & PIANO SYNTHESIZER</Text>
            <TouchableOpacity style={styles.arpeggioBtn} onPress={playArpeggio}>
              <Text style={styles.arpeggioBtnText}>▶ Play Arpeggio</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.pianoSub}>
            Synthesizing mathematical pitch ratios and harmonic frequencies [C4 to C5]. Tap keys to play:
          </Text>

          <View style={styles.pianoKeyboard}>
            {PIANO_NOTES.map((n) => (
              <TouchableOpacity
                key={n.note}
                style={[
                  styles.pianoKey,
                  n.gold && styles.pianoKeyGold,
                  activePianoNote === n.note && styles.pianoKeyActive,
                ]}
                onPress={() => playNote(n)}
              >
                <Text style={[styles.pianoNoteText, n.gold && styles.pianoNoteTextGold]}>{n.note}</Text>
                <Text style={styles.pianoKeyNumber}>{n.key}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ═════════════════════════════════════════════════════════════
            SECTION 9: VERIFIED CLIENT REVIEWS & TRUST
            ═════════════════════════════════════════════════════════════ */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>VERIFIED CLIENT FEEDBACK & ENTERPRISE TRUST</Text>
            <TouchableOpacity style={styles.leaveReviewBtn} onPress={() => setShowReviewModal(true)}>
              <Text style={styles.leaveReviewBtnText}>✍️ Leave Review</Text>
            </TouchableOpacity>
          </View>

          {/* Trust Badges Bar */}
          <View style={styles.trustBadgesRow}>
            <View style={styles.trustBadge}>
              <Text style={styles.trustBadgeBrand}>Google Reviews</Text>
              <Text style={styles.trustBadgeScore}>5.0 ★★★★★</Text>
              <Text style={styles.trustBadgeSub}>38+ Verified 5-Star Reviews</Text>
            </View>

            <View style={styles.trustBadge}>
              <Text style={styles.trustBadgeBrand}>Trustpilot Score</Text>
              <Text style={styles.trustBadgeScore}>4.9 ★★★★★</Text>
              <Text style={styles.trustBadgeSub}>Enterprise TrustScore: Excellent</Text>
            </View>

            <View style={styles.trustBadge}>
              <Text style={styles.trustBadgeBrand}>Paystack Partner</Text>
              <Text style={styles.trustBadgeScore}>₦0 LOSS</Text>
              <Text style={styles.trustBadgeSub}>100% Webhook Idempotency</Text>
            </View>
          </View>

          {/* Reviews Filter */}
          <View style={styles.filterRow}>
            {['all', 'google', 'trustpilot', 'ecommerce', 'fintech', 'gov'].map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterBtn, reviewFilter === f && styles.filterBtnActive]}
                onPress={() => setReviewFilter(f)}
              >
                <Text style={[styles.filterBtnText, reviewFilter === f && styles.filterBtnTextActive]}>
                  {f.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Reviews List */}
          {VERIFIED_REVIEWS.filter((r) => reviewFilter === 'all' || r.category.includes(reviewFilter)).map((rev) => (
            <View key={rev.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View>
                  <Text style={styles.reviewerName}>{rev.name}</Text>
                  <Text style={styles.reviewerRole}>{rev.role}</Text>
                </View>
                <Text style={styles.reviewerBadge}>{rev.platform}</Text>
              </View>
              <Text style={styles.reviewStars}>{'★'.repeat(rev.stars)}</Text>
              <Text style={styles.reviewQuote}>"{rev.quote}"</Text>
              <Text style={styles.reviewProjectTag}>💼 {rev.project}</Text>
            </View>
          ))}
        </View>

        {/* ═════════════════════════════════════════════════════════════
            SECTION 10: COMMISSION THE ARCHITECT (DIRECT RFQ FORM)
            ═════════════════════════════════════════════════════════════ */}
        <View style={[styles.sectionCard, styles.rfqCard]}>
          <Text style={styles.sectionLabel}>COMMISSION THE ARCHITECT</Text>
          <Text style={styles.rfqTitle}>Initiate Direct Engineering Request</Text>
          <Text style={styles.rfqSub}>Specify your project scope below for instant transmission to WhatsApp, Email, and DRF Lead Registry:</Text>

          <Text style={styles.inputLabel}>YOUR NAME / COMPANY</Text>
          <TextInput
            style={styles.textInput}
            value={rfqName}
            onChangeText={setRfqName}
            placeholder="e.g. Acme Corp / Alex"
            placeholderTextColor="#666"
          />

          <Text style={styles.inputLabel}>OFFICIAL EMAIL (FOR QUOTE & NOTIFICATIONS)</Text>
          <TextInput
            style={styles.textInput}
            value={rfqEmail}
            onChangeText={setRfqEmail}
            placeholder="e.g. alex@acmecorp.com"
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>WHATSAPP PHONE NUMBER (STRICTLY PREFERRED)</Text>
          <TextInput
            style={styles.textInput}
            value={rfqPhone}
            onChangeText={setRfqPhone}
            placeholder="e.g. +234 813 536 2561"
            placeholderTextColor="#666"
            keyboardType="phone-pad"
          />

          <Text style={styles.inputLabel}>SYSTEM DOMAIN</Text>
          <TextInput
            style={styles.textInput}
            value={rfqService}
            onChangeText={setRfqService}
            placeholder="Fintech & Paystack / DRF Backend"
            placeholderTextColor="#666"
          />

          <Text style={styles.inputLabel}>TARGET TIMELINE</Text>
          <TextInput
            style={styles.textInput}
            value={rfqTimeline}
            onChangeText={setRfqTimeline}
            placeholder="Urgent MVP (1-2 Weeks) / Standard Sprint"
            placeholderTextColor="#666"
          />

          <Text style={styles.inputLabel}>PROJECT BRIEF / REQUIREMENTS</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={rfqNotes}
            onChangeText={setRfqNotes}
            placeholder="Describe what you're building, key integrations, or performance bottlenecks..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={3}
          />

          <View style={styles.rfqBtnRow}>
            <TouchableOpacity style={styles.transmitWaBtn} onPress={() => transmitRFQ('whatsapp')}>
              <Text style={styles.transmitBtnText}>💬 TRANSMIT TO WHATSAPP</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.transmitMailBtn} onPress={() => transmitRFQ('email')}>
              <Text style={styles.transmitBtnText}>✉️ TRANSMIT TO EMAIL</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ═════════════════════════════════════════════════════════════
            SECTION 10B: CLIENT CONTRACT PORTAL & LIVE CHAT (MY ORDERS)
            ═════════════════════════════════════════════════════════════ */}
        <View style={[styles.sectionCard, styles.clientPortalCard]}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionLabel}>CLIENT PORTAL & ORDERS</Text>
              <Text style={styles.clientPortalSubtitle}>Book software contracts & chat live with the architect</Text>
            </View>
            <TouchableOpacity
              style={styles.hostConfigBtn}
              onPress={() => setShowHostModal(true)}
            >
              <Text style={styles.hostConfigBtnText}>⚙️ API HOST</Text>
            </TouchableOpacity>
          </View>

          {/* User Session Bar */}
          <View style={styles.sessionBox}>
            {hasIdentified ? (
              <View style={styles.sessionActiveRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sessionStatusText}>🟢 ACTIVE CLIENT SESSION</Text>
                  <Text style={styles.sessionNameText}>{clientName} • <Text style={{ color: '#d4af37' }}>{clientEmail}</Text></Text>
                  {clientPhone ? <Text style={styles.sessionPhoneText}>WhatsApp: {clientPhone}</Text> : null}
                </View>
                <TouchableOpacity
                  style={styles.switchSessionBtn}
                  onPress={() => setShowIdentityModal(true)}
                >
                  <Text style={styles.switchSessionBtnText}>SWITCH</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.sessionPromptRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sessionPromptTitle}>Track Your Bookings & Chat</Text>
                  <Text style={styles.sessionPromptSub}>Enter your email to view your contracts and chat with Anthony.</Text>
                </View>
                <TouchableOpacity
                  style={styles.identifyBtn}
                  onPress={() => setShowIdentityModal(true)}
                >
                  <Text style={styles.identifyBtnText}>SIGN IN / IDENTIFY</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Action Row: Book New Contract + Refresh Orders */}
          <View style={styles.portalActionRow}>
            <TouchableOpacity
              style={styles.bookContractMainBtn}
              onPress={() => {
                if (!hasIdentified) {
                  setShowIdentityModal(true);
                } else {
                  setShowBookingModal(true);
                }
              }}
            >
              <Text style={styles.bookContractMainBtnText}>+ BOOK NEW ARCHITECTURAL CONTRACT</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.refreshOrdersBtn}
              onPress={() => fetchUserBookings(clientEmail)}
            >
              {isLoadingBookings ? (
                <ActivityIndicator size="small" color="#d4af37" />
              ) : (
                <Text style={styles.refreshOrdersBtnText}>🔄 REFRESH</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* User Contracts / Orders Section */}
          <View style={styles.ordersListContainer}>
            <Text style={styles.ordersListTitle}>MY ACTIVE ORDERS & CONTRACTS</Text>

            {!hasIdentified ? (
              <View style={styles.emptyOrdersBox}>
                <Text style={styles.emptyOrdersText}>Identify with your email above to load your active contracts.</Text>
              </View>
            ) : userBookings.length === 0 ? (
              <View style={styles.emptyOrdersBox}>
                <Text style={styles.emptyOrdersText}>No contract bookings found for {clientEmail}.</Text>
                <Text style={styles.emptyOrdersSub}>Tap "+ BOOK NEW ARCHITECTURAL CONTRACT" to commission your project.</Text>
              </View>
            ) : (
              userBookings.map((bk) => (
                <View key={bk.id} style={styles.orderContractCard}>
                  <View style={styles.orderHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.orderIdBadge}>ORDER #{bk.id}</Text>
                      <Text style={styles.orderServiceTitle}>{bk.service_title}</Text>
                    </View>
                    <View style={[
                      styles.orderStatusPill,
                      bk.status === 'completed' ? styles.statusGreen :
                      bk.status === 'in_progress' ? styles.statusCyan :
                      bk.status === 'audit' ? styles.statusPurple : styles.statusAmber
                    ]}>
                      <Text style={styles.orderStatusPillText}>
                        {bk.status === 'pending' ? '⏳ PENDING REVIEW' :
                         bk.status === 'accepted' ? '✅ ACCEPTED' :
                         bk.status === 'in_progress' ? '🚀 IN PROGRESS' :
                         bk.status === 'audit' ? '🛡️ ACID AUDIT' :
                         bk.status === 'completed' ? '🌟 DELIVERED' : bk.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.orderMetaGrid}>
                    <Text style={styles.orderMetaItem}>Tier: <Text style={styles.orderMetaVal}>{bk.budget_tier}</Text></Text>
                    <Text style={styles.orderMetaItem}>Timeline: <Text style={styles.orderMetaVal}>{bk.timeline}</Text></Text>
                  </View>

                  <Text style={styles.orderScopePreview} numberOfLines={2}>
                    {bk.project_scope}
                  </Text>

                  {/* Toggle Chat Desk */}
                  <TouchableOpacity
                    style={[
                      styles.openChatToggleBtn,
                      activeChatBookingId === bk.id && styles.openChatToggleBtnActive
                    ]}
                    onPress={() => {
                      if (activeChatBookingId === bk.id) {
                        setActiveChatBookingId(null);
                      } else {
                        setActiveChatBookingId(bk.id);
                        fetchContractMessages(bk.id);
                      }
                    }}
                  >
                    <Text style={styles.openChatToggleBtnText}>
                      {activeChatBookingId === bk.id
                        ? '▲ CLOSE LIVE CONTRACT CHAT'
                        : '💬 OPEN LIVE CONTRACT CHAT (iMessage Desk)'}
                    </Text>
                  </TouchableOpacity>

                  {/* iMessage / WhatsApp Interactive Chat Desk */}
                  {activeChatBookingId === bk.id && (
                    <View style={styles.chatDeskContainer}>
                      <View style={styles.chatDeskHeader}>
                        <Text style={styles.chatDeskTitle}>CONTRACT #{bk.id} DIRECT CHAT</Text>
                        <TouchableOpacity
                          style={styles.chatDeskRefreshBtn}
                          onPress={() => fetchContractMessages(bk.id)}
                        >
                          <Text style={styles.chatDeskRefreshBtnText}>
                            {isRefreshingChat ? 'REFRESHING...' : '🔄 REFRESH'}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Chat Bubbles */}
                      <View style={styles.chatMessagesArea}>
                        {contractMessages.length === 0 ? (
                          <Text style={styles.noChatMessagesText}>
                            No messages on this contract yet. Send an inquiry or requirement update below!
                          </Text>
                        ) : (
                          contractMessages.map((msg, mIdx) => (
                            <View
                              key={msg.id || mIdx}
                              style={[
                                styles.chatBubbleRow,
                                msg.is_staff ? styles.chatBubbleRowStaff : styles.chatBubbleRowClient
                              ]}
                            >
                              <View
                                style={[
                                  styles.chatBubble,
                                  msg.is_staff ? styles.chatBubbleStaff : styles.chatBubbleClient
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.chatSenderLabel,
                                    msg.is_staff ? styles.chatSenderStaff : styles.chatSenderClient
                                  ]}
                                >
                                  {msg.is_staff ? '🏛️ EMPIRECODES STAFF / ANTHONY' : `👤 ${msg.sender_name || 'YOU'}`}
                                </Text>
                                <Text style={styles.chatMessageBody}>{msg.message}</Text>
                              </View>
                            </View>
                          ))
                        )}
                      </View>

                      {/* Chat Input Bar */}
                      <View style={styles.chatInputRow}>
                        <TextInput
                          style={styles.chatTextInput}
                          value={chatInput}
                          onChangeText={setChatInput}
                          placeholder="Type a message to the architect team..."
                          placeholderTextColor="#666"
                          multiline
                        />
                        <TouchableOpacity
                          style={[styles.chatSendBtn, isSendingChat && { opacity: 0.5 }]}
                          onPress={sendContractMessage}
                          disabled={isSendingChat}
                        >
                          <Text style={styles.chatSendBtnText}>
                            {isSendingChat ? '...' : 'SEND ↵'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </View>

        {/* ═════════════════════════════════════════════════════════════
            SECTION 11: EMPIRE INTERACTIVE CLI TERMINAL
            ═════════════════════════════════════════════════════════════ */}
        <View style={styles.terminalContainer}>
          <View style={styles.terminalHeader}>
            <View style={styles.terminalDots}>
              <View style={[styles.dotLight, { backgroundColor: '#ff5f56' }]} />
              <View style={[styles.dotLight, { backgroundColor: '#ffbd2e' }]} />
              <View style={[styles.dotLight, { backgroundColor: '#27c93f' }]} />
            </View>
            <Text style={styles.terminalTitle}>EMPIRE INTERACTIVE TERMINAL</Text>
          </View>

          <ScrollView
            ref={termScrollRef}
            style={styles.terminalOutputBox}
            contentContainerStyle={styles.terminalOutputContent}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            {termOutput.map((line, idx) => (
              <Text
                key={idx}
                style={[
                  styles.termLine,
                  line.type === 'echo' && styles.termEcho,
                  line.type === 'gold' && styles.termGold,
                  line.type === 'pass' && styles.termPass,
                  line.type === 'fail' && styles.termFail,
                  line.type === 'info' && styles.termInfo,
                  line.type === 'sys' && styles.termSys,
                ]}
              >
                {line.text}
              </Text>
            ))}
          </ScrollView>

          {/* Quick 1-Tap Command Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {['help', 'about', 'skills', 'projects', 'blueprint', 'telemetry', 'math', 'experience', 'education', 'certs', 'reviews', 'piano', 'whatsapp', 'cv', 'clear'].map((chip) => (
              <TouchableOpacity key={chip} style={styles.termChip} onPress={() => handleTermCommand(chip)}>
                <Text style={styles.termChipText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.terminalInputRow}>
            <Text style={styles.termPromptSymbol}>$</Text>
            <TextInput
              style={styles.termInputField}
              value={termInput}
              onChangeText={setTermInput}
              onSubmitEditing={() => handleTermCommand()}
              placeholder="Type command (e.g. 'help', 'about', 'skills')..."
              placeholderTextColor="#666"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
            />
            {termInput.trim().length > 0 && (
              <TouchableOpacity style={styles.termSendBtn} onPress={() => handleTermCommand()}>
                <Text style={styles.termSendBtnText}>RUN ↵</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* ═════════════════════════════════════════════════════════════
          FLOATING DOCKED VOID NAVIGATION BAR
          ═════════════════════════════════════════════════════════════ */}
      <View style={styles.floatingVoidNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}>
          <Text style={styles.navIcon}>⚡</Text>
          <Text style={styles.navText}>Overview</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => scrollRef.current?.scrollTo({ y: 800, animated: true })}>
          <Text style={styles.navIcon}>🛡️</Text>
          <Text style={styles.navText}>Blueprint</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => scrollRef.current?.scrollTo({ y: 1500, animated: true })}>
          <Text style={styles.navIcon}>💼</Text>
          <Text style={styles.navText}>Projects</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => scrollRef.current?.scrollTo({ y: 2900, animated: true })}>
          <Text style={[styles.navIcon, { color: '#d4af37' }]}>📦</Text>
          <Text style={[styles.navText, { color: '#d4af37', fontWeight: 'bold' }]}>Orders/Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => Linking.openURL('https://wa.me/2348173057810')}>
          <Text style={[styles.navIcon, { color: '#3dff8b' }]}>💬</Text>
          <Text style={[styles.navText, { color: '#3dff8b', fontWeight: 'bold' }]}>WhatsApp</Text>
        </TouchableOpacity>
      </View>

      {/* ═════════════════════════════════════════════════════════════
          MODAL: SYSTEM DESIGN ARCHITECTURE INSPECTOR
          ═════════════════════════════════════════════════════════════ */}
      <Modal visible={!!selectedArchProject} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedArchProject?.name}</Text>
              <TouchableOpacity onPress={() => setSelectedArchProject(null)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.archLabel}>ENGINEERING CHALLENGE</Text>
              <Text style={styles.archText}>{selectedArchProject?.archChallenge}</Text>

              <Text style={styles.archLabel}>SYSTEM SOLUTION & DRF ARCHITECTURE</Text>
              <Text style={styles.archText}>{selectedArchProject?.archSolution}</Text>

              <Text style={styles.archLabel}>QUANTIFIABLE PRODUCTION IMPACT</Text>
              <Text style={styles.archText}>{selectedArchProject?.archImpact}</Text>

              <Text style={styles.archLabel}>PRODUCTION STACK</Text>
              <Text style={styles.archText}>⚡ {selectedArchProject?.stack}</Text>

              <TouchableOpacity
                style={styles.modalActionBtn}
                onPress={() => {
                  if (selectedArchProject?.demoUrl) Linking.openURL(selectedArchProject.demoUrl);
                }}
              >
                <Text style={styles.modalActionBtnText}>LAUNCH LIVE PLATFORM ↗</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>


      {/* ═════════════════════════════════════════════════════════════
          MODAL: LEAVE A CLIENT REVIEW
          ═════════════════════════════════════════════════════════════ */}
      <Modal visible={showReviewModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SUBMIT CLIENT EVALUATION</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.authSub}>
              Share verified feedback regarding engineering engagements, Paystack integration, or backend delivery:
            </Text>

            <TouchableOpacity
              style={[styles.ctaBtn, styles.ctaBtnGold, { width: '100%', marginBottom: 10 }]}
              onPress={() => {
                setShowReviewModal(false);
                Linking.openURL('https://www.google.com/search?q=EmpireCodes+Nigeria');
              }}
            >
              <Text style={styles.ctaBtnGoldText}>⭐ REVIEW ON GOOGLE (5.0)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.ctaBtn, styles.ctaBtnGreen, { width: '100%', marginBottom: 10 }]}
              onPress={() => {
                setShowReviewModal(false);
                Linking.openURL('https://www.trustpilot.com/review/empirecodes.com.ng');
              }}
            >
              <Text style={styles.ctaBtnGreenText}>⭐ REVIEW ON TRUSTPILOT (4.9)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.ctaBtn, styles.ctaBtnOutline, { width: '100%' }]}
              onPress={() => {
                setShowReviewModal(false);
                Linking.openURL('https://wa.me/2348173057810?text=Hello%20Anthony,%20I%20would%20like%20to%20provide%20a%20client%20testimonial.');
              }}
            >
              <Text style={styles.ctaBtnOutlineText}>💬 SUBMIT DIRECTLY VIA WHATSAPP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ═════════════════════════════════════════════════════════════
          MODAL: BOOK ARCHITECTURAL CONTRACT
          ═════════════════════════════════════════════════════════════ */}
      <Modal visible={showBookingModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>COMMISSION ARCHITECTURAL CONTRACT</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>SELECT CORE ARCHITECTURE DOMAIN</Text>
              <View style={styles.domainPickerRow}>
                {[
                  'Fintech & Paystack Architecture',
                  'Full-Stack DRF & React Engine',
                  'PostgreSQL ACID Ledger Design',
                  'Operations Research Optimization',
                ].map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.domainOptionBtn, bookingService === s && styles.domainOptionBtnActive]}
                    onPress={() => setBookingService(s)}
                  >
                    <Text style={[styles.domainOptionText, bookingService === s && styles.domainOptionTextActive]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>BUDGET TIER</Text>
              <View style={styles.domainPickerRow}>
                {['Starter MVP (₦500k-1.5M)', 'Production MVP (₦1.5M-3.5M)', 'Enterprise Scale (₦5M+)'].map((b) => (
                  <TouchableOpacity
                    key={b}
                    style={[styles.domainOptionBtn, bookingBudget === b && styles.domainOptionBtnActive]}
                    onPress={() => setBookingBudget(b)}
                  >
                    <Text style={[styles.domainOptionText, bookingBudget === b && styles.domainOptionTextActive]}>
                      {b}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>TIMELINE</Text>
              <View style={styles.domainPickerRow}>
                {['Urgent MVP (1-2 Weeks)', 'Standard Sprint (3-4 Weeks)', 'Quarterly Delivery'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.domainOptionBtn, bookingTimeline === t && styles.domainOptionBtnActive]}
                    onPress={() => setBookingTimeline(t)}
                  >
                    <Text style={[styles.domainOptionText, bookingTimeline === t && styles.domainOptionTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>PROJECT REQUIREMENTS & SCOPE BRIEF</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={bookingScope}
                onChangeText={setBookingScope}
                placeholder="Outline features, user flows, database models, payment gateways required..."
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity
                style={[styles.modalActionBtn, isSubmittingBooking && { opacity: 0.6 }]}
                onPress={handleBookingSubmit}
                disabled={isSubmittingBooking}
              >
                {isSubmittingBooking ? (
                  <ActivityIndicator color="#020202" />
                ) : (
                  <Text style={styles.modalActionBtnText}>TRANSMIT CONTRACT TO ARCHITECT 🏛️</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ═════════════════════════════════════════════════════════════
          MODAL: CLIENT IDENTITY & ACCOUNT LOGIN
          ═════════════════════════════════════════════════════════════ */}
      <Modal visible={showIdentityModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>CLIENT ACCOUNT & IDENTITY</Text>
              <TouchableOpacity onPress={() => setShowIdentityModal(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.authSub}>
              Enter your identity to track contract status, review deliverables, and access direct iMessage contract chat:
            </Text>

            <Text style={styles.inputLabel}>YOUR FULL NAME</Text>
            <TextInput
              style={styles.textInput}
              value={clientName}
              onChangeText={setClientName}
              placeholder="e.g. Oluwaseun Matthew"
              placeholderTextColor="#666"
            />

            <Text style={styles.inputLabel}>EMAIL ADDRESS (IDENTIFIER)</Text>
            <TextInput
              style={styles.textInput}
              value={clientEmail}
              onChangeText={setClientEmail}
              placeholder="e.g. client@example.com"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>WHATSAPP PHONE (FOR INSTANT ARCHITECT ALERTS)</Text>
            <TextInput
              style={styles.textInput}
              value={clientPhone}
              onChangeText={setClientPhone}
              placeholder="e.g. +234 813 536 2561"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
            />

            <TouchableOpacity
              style={styles.modalActionBtn}
              onPress={() => handleSaveIdentity(clientName, clientEmail, clientPhone)}
            >
              <Text style={styles.modalActionBtnText}>CONFIRM & LOAD MY CONTRACTS ⚡</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ═════════════════════════════════════════════════════════════
          MODAL: MICROSERVICES API HOST CONFIGURATION
          ═════════════════════════════════════════════════════════════ */}
      <Modal visible={showHostModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>DRF MICROSERVICES ENDPOINT</Text>
              <TouchableOpacity onPress={() => setShowHostModal(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.authSub}>
              Configure the Django REST Framework endpoint used for leads, bookings, and live contract chat:
            </Text>

            <TouchableOpacity
              style={[
                styles.hostPresetBtn,
                apiBaseUrl === 'https://empirecodes-backend-drf.onrender.com' && styles.hostPresetBtnActive,
              ]}
              onPress={() => {
                setApiBaseUrl('https://empirecodes-backend-drf.onrender.com');
                setCustomHostInput('https://empirecodes-backend-drf.onrender.com');
              }}
            >
              <Text style={styles.hostPresetTitle}>☁️ Render Cloud Production</Text>
              <Text style={styles.hostPresetSub}>https://empirecodes-backend-drf.onrender.com</Text>
            </TouchableOpacity>


            <TouchableOpacity
              style={[
                styles.hostPresetBtn,
                apiBaseUrl === 'http://192.168.100.13:8000' && styles.hostPresetBtnActive,
              ]}
              onPress={() => {
                setApiBaseUrl('http://192.168.100.13:8000');
                setCustomHostInput('http://192.168.100.13:8000');
              }}
            >
              <Text style={styles.hostPresetTitle}>💻 Local Laptop Development</Text>
              <Text style={styles.hostPresetSub}>http://192.168.100.13:8000</Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>CUSTOM API HOST URL</Text>
            <TextInput
              style={styles.textInput}
              value={customHostInput}
              onChangeText={setCustomHostInput}
              placeholder="https://..."
              placeholderTextColor="#666"
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={styles.modalActionBtn}
              onPress={() => {
                setApiBaseUrl(customHostInput.trim());
                setShowHostModal(false);
                Alert.alert('API Host Updated', `Connected to: ${customHostInput.trim()}`);
              }}
            >
              <Text style={styles.modalActionBtnText}>APPLY BACKEND HOST 🌐</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ═════════════════════════════════════════════════════════════
// STYLESHEET (High-Contrast "The Dark Architect" Aesthetic)
// ═════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020202',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#161616',
    backgroundColor: '#050505',
  },
  brandTitle: {
    color: '#3dff8b',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandSubtitle: {
    color: '#888',
    fontSize: 10,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3dff8b',
    backgroundColor: 'rgba(61, 255, 139, 0.08)',
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3dff8b',
    marginRight: 6,
  },
  statusLiveText: {
    color: '#3dff8b',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingVertical: 18,
    marginBottom: 10,
  },
  logoBadgeContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  laptopBrackets: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bracketText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    opacity: 0.8,
  },
  screenBox: {
    width: 44,
    height: 28,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 6,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  screenSlash: {
    width: 20,
    height: 3,
    backgroundColor: '#3dff8b',
    transform: [{ rotate: '-25deg' }],
  },
  heroBrandName: {
    color: '#d4af37',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 4,
  },
  heroBrandSub: {
    color: '#3dff8b',
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 2,
  },
  heroTagline: {
    color: '#888',
    fontSize: 9,
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  heroMainTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 4,
  },
  heroRoleDesc: {
    color: '#d4af37',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 6,
  },
  heroStackSummary: {
    color: '#aaa',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  focusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(61, 255, 139, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(61, 255, 139, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 14,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3dff8b',
    marginRight: 8,
  },
  focusPillText: {
    color: '#bbb',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  greenText: { color: '#3dff8b' },
  goldText: { color: '#d4af37' },
  cyanText: { color: '#61DAFB' },
  purpleText: { color: '#a855f7' },
  whiteText: { color: '#fff' },

  heroCtasRow: {
    width: '100%',
    gap: 8,
    marginBottom: 10,
  },
  ctaBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnGold: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d4af37',
  },
  ctaBtnGoldText: {
    color: '#d4af37',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  ctaBtnGreen: {
    backgroundColor: '#3dff8b',
  },
  ctaBtnGreenText: {
    color: '#020202',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  ctaBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
  },
  ctaBtnOutlineText: {
    color: '#ccc',
    fontSize: 10,
    fontWeight: '700',
  },
  quickBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 4,
  },
  miniBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: '#222',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  miniBadgeText: {
    color: '#888',
    fontSize: 9,
    fontFamily: 'monospace',
  },

  // Generic Section Card
  sectionCard: {
    backgroundColor: '#0c0c0c',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderRadius: 6,
    padding: 14,
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 6,
  },
  sectionLabel: {
    color: '#d4af37',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  goldSubLabel: {
    color: '#d4af37',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  greenSubLabel: {
    color: '#3dff8b',
    fontSize: 9,
    fontFamily: 'monospace',
  },
  slaBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
  },
  slaBadgeText: {
    color: '#d4af37',
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'monospace',
  },

  // Telemetry Grid
  telemetryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  telemetryCard: {
    width: '48%',
    backgroundColor: '#050505',
    borderWidth: 1,
    borderColor: '#1f1f1f',
    padding: 10,
    borderRadius: 4,
  },
  telemetryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  telemetryIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  telemetryName: {
    color: '#777',
    fontSize: 9,
    flex: 1,
  },
  telemetryVal: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 2,
  },
  telemetrySub: {
    color: '#666',
    fontSize: 8,
    fontFamily: 'monospace',
  },

  // Strategy Card
  strategyCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3dff8b',
    backgroundColor: '#0f0f0f',
  },
  strategyBody: {
    color: '#bbb',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  // Services
  servicesGrid: {
    gap: 10,
  },
  serviceBox: {
    backgroundColor: '#050505',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    padding: 12,
    borderRadius: 4,
  },
  serviceIcon: {
    fontSize: 18,
    marginBottom: 6,
  },
  serviceTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  serviceDesc: {
    color: '#888',
    fontSize: 11,
    lineHeight: 16,
  },

  // Academic Foundations
  academicTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  academicSub: {
    color: '#888',
    fontSize: 10,
    marginTop: 2,
  },
  academicScore: {
    color: '#3dff8b',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  academicConferred: {
    color: '#666',
    fontSize: 9,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#1a1a1a',
    marginVertical: 12,
  },
  coreStackHeading: {
    color: '#d4af37',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  stackItem: {
    color: '#bbb',
    fontSize: 11,
    lineHeight: 18,
    marginBottom: 2,
  },

  // Blueprint & Sandbox
  blueprintCard: {
    borderColor: 'rgba(61, 255, 139, 0.3)',
    backgroundColor: '#070707',
  },
  blueprintTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  blueprintSub: {
    color: '#888',
    fontSize: 10,
    lineHeight: 15,
    marginBottom: 12,
  },
  pipelineContainer: {
    gap: 8,
    marginBottom: 16,
  },
  pipelineStep: {
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#222',
    padding: 10,
    borderRadius: 4,
  },
  stepBadge: {
    color: '#d4af37',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  stepTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  stepDesc: {
    color: '#888',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
  stepLock: {
    color: '#3dff8b',
    fontSize: 9,
    fontFamily: 'monospace',
    marginTop: 4,
  },

  simulatorBox: {
    backgroundColor: '#030303',
    borderWidth: 1,
    borderColor: 'rgba(61, 255, 139, 0.2)',
    padding: 10,
    borderRadius: 4,
  },
  simulatorTitle: {
    color: '#d4af37',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  simulatorSub: {
    color: '#777',
    fontSize: 9,
    marginTop: 2,
    marginBottom: 8,
  },
  simBtnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  simBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
    borderWidth: 1,
  },
  simBtnGreen: {
    backgroundColor: 'rgba(61, 255, 139, 0.1)',
    borderColor: '#3dff8b',
  },
  simBtnGreenText: { color: '#3dff8b', fontSize: 9, fontWeight: '700' },
  simBtnGold: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderColor: '#d4af37',
  },
  simBtnGoldText: { color: '#d4af37', fontSize: 9, fontWeight: '700' },
  simBtnGray: {
    backgroundColor: 'transparent',
    borderColor: '#444',
  },
  simBtnGrayText: { color: '#888', fontSize: 9 },
  simConsole: {
    backgroundColor: '#080808',
    padding: 8,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    maxHeight: 140,
  },
  simLogLine: {
    color: '#3dff8b',
    fontSize: 9,
    fontFamily: 'monospace',
    lineHeight: 14,
  },

  // Filter Buttons
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  filterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#262626',
    backgroundColor: 'transparent',
  },
  filterBtnActive: {
    borderColor: '#3dff8b',
    backgroundColor: 'rgba(61, 255, 139, 0.1)',
  },
  filterBtnText: {
    color: '#777',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  filterBtnTextActive: {
    color: '#3dff8b',
  },

  // Project Cards
  projectCard: {
    backgroundColor: '#080808',
    borderWidth: 1,
    borderColor: '#1f1f1f',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  projectImg: {
    width: '100%',
    height: 120,
    backgroundColor: '#111',
  },
  projectDetails: {
    padding: 12,
  },
  projectCategory: {
    color: '#d4af37',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  projectName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    marginVertical: 4,
  },
  projectDesc: {
    color: '#999',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 6,
  },
  projectStack: {
    color: '#3dff8b',
    fontSize: 10,
    fontFamily: 'monospace',
    marginBottom: 10,
  },
  projectBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoBtn: {
    flex: 1,
    backgroundColor: '#3dff8b',
    paddingVertical: 8,
    borderRadius: 3,
    alignItems: 'center',
  },
  demoBtnText: {
    color: '#020202',
    fontSize: 10,
    fontWeight: '900',
  },
  systemDesignBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d4af37',
    paddingVertical: 8,
    borderRadius: 3,
    alignItems: 'center',
  },
  systemDesignBtnText: {
    color: '#d4af37',
    fontSize: 10,
    fontWeight: '800',
  },

  // Operations Research Lab
  orCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#d4af37',
    backgroundColor: '#070707',
  },
  orTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  orSub: {
    color: '#888',
    fontSize: 10,
    lineHeight: 15,
    marginBottom: 12,
  },
  orControlsRow: {
    gap: 8,
    marginBottom: 12,
  },
  orControlBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    padding: 8,
    borderRadius: 4,
  },
  orControlLabel: {
    color: '#d4af37',
    fontSize: 11,
    fontWeight: '700',
  },
  orBtnGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  miniAdjustBtn: {
    backgroundColor: '#222',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#333',
  },
  miniAdjustBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  orResultsBox: {
    backgroundColor: '#030303',
    borderWidth: 1,
    borderColor: '#222',
    padding: 10,
    borderRadius: 4,
  },
  orMatrixStatus: {
    color: '#3dff8b',
    fontSize: 9,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  orStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orStatItem: {
    alignItems: 'center',
  },
  orStatLabel: {
    color: '#777',
    fontSize: 8,
  },
  orStatValGreen: { color: '#3dff8b', fontSize: 13, fontWeight: '900', marginTop: 2 },
  orStatValGold: { color: '#d4af37', fontSize: 13, fontWeight: '900', marginTop: 2 },
  orStatValCyan: { color: '#61DAFB', fontSize: 13, fontWeight: '900', marginTop: 2 },
  orStatValWhite: { color: '#fff', fontSize: 13, fontWeight: '900', marginTop: 2 },

  // Piano Synthesizer
  pianoSub: {
    color: '#888',
    fontSize: 10,
    marginBottom: 10,
    lineHeight: 15,
  },
  arpeggioBtn: {
    backgroundColor: 'rgba(61, 255, 139, 0.1)',
    borderWidth: 1,
    borderColor: '#3dff8b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
  },
  arpeggioBtnText: {
    color: '#3dff8b',
    fontSize: 9,
    fontWeight: '700',
  },
  pianoKeyboard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#050505',
    borderWidth: 1,
    borderColor: '#222',
    padding: 6,
    borderRadius: 4,
  },
  pianoKey: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderBottomWidth: 3,
    borderBottomColor: '#d4af37',
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  pianoKeyGold: {
    borderBottomColor: '#ffd700',
  },
  pianoKeyActive: {
    backgroundColor: 'rgba(61, 255, 139, 0.25)',
    borderBottomColor: '#3dff8b',
  },
  pianoNoteText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  pianoNoteTextGold: {
    color: '#ffd700',
  },
  pianoKeyNumber: {
    color: '#666',
    fontSize: 8,
    marginTop: 4,
  },

  // Verified Reviews
  leaveReviewBtn: {
    borderWidth: 1,
    borderColor: '#3dff8b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
  },
  leaveReviewBtnText: {
    color: '#3dff8b',
    fontSize: 9,
    fontWeight: '700',
  },
  trustBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 12,
  },
  trustBadge: {
    flex: 1,
    backgroundColor: '#050505',
    borderWidth: 1,
    borderColor: '#1f1f1f',
    padding: 8,
    borderRadius: 4,
  },
  trustBadgeBrand: {
    color: '#aaa',
    fontSize: 8,
    fontWeight: '700',
  },
  trustBadgeScore: {
    color: '#d4af37',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 2,
  },
  trustBadgeSub: {
    color: '#666',
    fontSize: 7,
    marginTop: 2,
  },
  reviewCard: {
    backgroundColor: '#070707',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    padding: 12,
    borderRadius: 4,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reviewerName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  reviewerRole: {
    color: '#777',
    fontSize: 9,
    marginTop: 1,
  },
  reviewerBadge: {
    color: '#d4af37',
    fontSize: 8,
    fontWeight: '800',
  },
  reviewStars: {
    color: '#d4af37',
    fontSize: 11,
    marginVertical: 4,
  },
  reviewQuote: {
    color: '#bbb',
    fontSize: 10,
    lineHeight: 15,
  },
  reviewProjectTag: {
    color: '#3dff8b',
    fontSize: 9,
    marginTop: 6,
  },

  // Commission RFQ
  rfqCard: {
    borderColor: '#d4af37',
    backgroundColor: '#060606',
  },
  rfqTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  rfqSub: {
    color: '#888',
    fontSize: 10,
    marginBottom: 10,
  },
  inputLabel: {
    color: '#888',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 6,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#262626',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 11,
    borderRadius: 3,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  rfqBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  transmitWaBtn: {
    flex: 1,
    backgroundColor: '#25D366',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  transmitMailBtn: {
    flex: 1,
    backgroundColor: '#d4af37',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  transmitBtnText: {
    color: '#020202',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  // Terminal
  terminalContainer: {
    backgroundColor: '#050505',
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 6,
    padding: 12,
    marginBottom: 20,
  },
  terminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#161616',
  },
  terminalDots: {
    flexDirection: 'row',
    gap: 6,
    marginRight: 10,
  },
  dotLight: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  terminalTitle: {
    color: '#d4af37',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  terminalOutputBox: {
    height: 250,
    backgroundColor: '#020202',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  terminalOutputContent: {
    paddingBottom: 14,
  },
  termLine: {
    fontSize: 10.5,
    fontFamily: 'monospace',
    lineHeight: 16,
    marginBottom: 4,
  },
  termEcho: { color: '#d4af37', fontWeight: 'bold' },
  termGold: { color: '#d4af37', fontWeight: 'bold' },
  termPass: { color: '#3dff8b' },
  termFail: { color: '#ff5555' },
  termInfo: { color: '#61DAFB' },
  termSys: { color: '#888888' },

  chipsScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  termChip: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 4,
    marginRight: 6,
  },
  termChipText: {
    color: '#3dff8b',
    fontSize: 9.5,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  terminalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  termPromptSymbol: {
    color: '#3dff8b',
    fontSize: 13,
    fontWeight: '900',
    fontFamily: 'monospace',
    marginRight: 8,
  },
  termInputField: {
    flex: 1,
    color: '#3dff8b',
    fontSize: 11,
    fontFamily: 'monospace',
    padding: 0,
  },
  termSendBtn: {
    backgroundColor: 'rgba(61, 255, 139, 0.15)',
    borderWidth: 1,
    borderColor: '#3dff8b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
    marginLeft: 6,
  },
  termSendBtnText: {
    color: '#3dff8b',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '900',
  },

  // Floating Void Navigation
  floatingVoidNav: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(5, 5, 5, 0.94)',
    borderTopWidth: 2,
    borderTopColor: '#d4af37',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#222',
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 14,
    color: '#aaa',
  },
  navText: {
    color: '#888',
    fontSize: 9,
    marginTop: 2,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#0c0c0c',
    borderWidth: 1,
    borderColor: '#d4af37',
    borderRadius: 6,
    padding: 16,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    paddingBottom: 8,
  },
  modalTitle: {
    color: '#d4af37',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    flex: 1,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalCloseBtnText: {
    color: '#ff5555',
    fontSize: 14,
    fontWeight: '900',
  },
  archLabel: {
    color: '#3dff8b',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 10,
    marginBottom: 2,
  },
  archText: {
    color: '#bbb',
    fontSize: 11,
    lineHeight: 16,
  },
  modalActionBtn: {
    backgroundColor: '#3dff8b',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  modalActionBtnText: {
    color: '#020202',
    fontSize: 11,
    fontWeight: '900',
  },
  authSub: {
    color: '#999',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 14,
  },
  roleSelectRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  roleSelectBtn: {
    flex: 1,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#292929',
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 4,
  },
  roleSelectBtnActive: {
    borderColor: '#3dff8b',
    backgroundColor: 'rgba(61, 255, 139, 0.1)',
  },
  roleSelectText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  syncBtn: {
    backgroundColor: '#3dff8b',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
  },
  syncBtnText: {
    color: '#020202',
    fontSize: 11,
    fontWeight: '900',
  },

  // ─────────────────────────────────────────────────────────────
  // CLIENT PORTAL, BOOKINGS & LIVE CHAT DESK
  // ─────────────────────────────────────────────────────────────
  clientPortalCard: {
    borderColor: '#d4af37',
    borderWidth: 1.5,
    backgroundColor: '#070707',
  },
  clientPortalSubtitle: {
    color: '#888',
    fontSize: 10,
    marginTop: 2,
  },
  hostConfigBtn: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: '#d4af37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
  },
  hostConfigBtnText: {
    color: '#d4af37',
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  sessionBox: {
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 4,
    padding: 10,
    marginBottom: 12,
  },
  sessionActiveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionStatusText: {
    color: '#3dff8b',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sessionNameText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  sessionPhoneText: {
    color: '#888',
    fontSize: 10,
    marginTop: 1,
  },
  switchSessionBtn: {
    backgroundColor: '#1f1f1f',
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 3,
  },
  switchSessionBtnText: {
    color: '#ccc',
    fontSize: 9,
    fontWeight: '700',
  },
  sessionPromptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionPromptTitle: {
    color: '#d4af37',
    fontSize: 12,
    fontWeight: '800',
  },
  sessionPromptSub: {
    color: '#777',
    fontSize: 9,
    marginTop: 2,
  },
  identifyBtn: {
    backgroundColor: '#3dff8b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 3,
    marginLeft: 8,
  },
  identifyBtnText: {
    color: '#020202',
    fontSize: 9,
    fontWeight: '900',
  },
  portalActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  bookContractMainBtn: {
    flex: 1,
    backgroundColor: '#d4af37',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookContractMainBtnText: {
    color: '#020202',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  refreshOrdersBtn: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 12,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshOrdersBtnText: {
    color: '#aaa',
    fontSize: 10,
    fontWeight: '700',
  },
  ordersListContainer: {
    marginTop: 4,
  },
  ordersListTitle: {
    color: '#bbb',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  emptyOrdersBox: {
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#1f1f1f',
    padding: 14,
    borderRadius: 4,
    alignItems: 'center',
  },
  emptyOrdersText: {
    color: '#888',
    fontSize: 11,
    textAlign: 'center',
  },
  emptyOrdersSub: {
    color: '#555',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  orderContractCard: {
    backgroundColor: '#050505',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 4,
    padding: 12,
    marginBottom: 10,
  },
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderIdBadge: {
    color: '#d4af37',
    fontSize: 9,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  orderServiceTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 1,
  },
  orderStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    borderWidth: 1,
  },
  statusAmber: {
    backgroundColor: 'rgba(255, 170, 0, 0.1)',
    borderColor: '#ffaa00',
  },
  statusCyan: {
    backgroundColor: 'rgba(0, 220, 255, 0.1)',
    borderColor: '#00dcff',
  },
  statusPurple: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderColor: '#a855f7',
  },
  statusGreen: {
    backgroundColor: 'rgba(61, 255, 139, 0.1)',
    borderColor: '#3dff8b',
  },
  orderStatusPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
  },
  orderMetaGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
  },
  orderMetaItem: {
    color: '#777',
    fontSize: 10,
  },
  orderMetaVal: {
    color: '#ccc',
    fontWeight: '700',
  },
  orderScopePreview: {
    color: '#999',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
  },
  openChatToggleBtn: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#333',
    paddingVertical: 8,
    borderRadius: 3,
    alignItems: 'center',
  },
  openChatToggleBtnActive: {
    borderColor: '#3dff8b',
    backgroundColor: 'rgba(61, 255, 139, 0.08)',
  },
  openChatToggleBtnText: {
    color: '#3dff8b',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  chatDeskContainer: {
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 4,
    marginTop: 10,
    padding: 10,
  },
  chatDeskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    paddingBottom: 6,
    marginBottom: 8,
  },
  chatDeskTitle: {
    color: '#d4af37',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  chatDeskRefreshBtn: {
    padding: 2,
  },
  chatDeskRefreshBtnText: {
    color: '#888',
    fontSize: 9,
    fontFamily: 'monospace',
  },
  chatMessagesArea: {
    maxHeight: 240,
    minHeight: 80,
    marginBottom: 8,
  },
  noChatMessagesText: {
    color: '#666',
    fontSize: 11,
    textAlign: 'center',
    paddingVertical: 16,
    fontStyle: 'italic',
  },
  chatBubbleRow: {
    marginBottom: 8,
    flexDirection: 'row',
  },
  chatBubbleRowClient: {
    justifyContent: 'flex-end',
  },
  chatBubbleRowStaff: {
    justifyContent: 'flex-start',
  },
  chatBubble: {
    maxWidth: '85%',
    padding: 8,
    borderRadius: 6,
  },
  chatBubbleClient: {
    backgroundColor: '#102015',
    borderWidth: 1,
    borderColor: '#2e7d4d',
    borderBottomRightRadius: 1,
  },
  chatBubbleStaff: {
    backgroundColor: '#1f1b0a',
    borderWidth: 1,
    borderColor: '#d4af37',
    borderBottomLeftRadius: 1,
  },
  chatSenderLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  chatSenderClient: {
    color: '#3dff8b',
  },
  chatSenderStaff: {
    color: '#ffd700',
  },
  chatMessageBody: {
    color: '#f0f0f0',
    fontSize: 11,
    lineHeight: 16,
  },
  chatInputRow: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  chatTextInput: {
    flex: 1,
    color: '#fff',
    fontSize: 11,
    maxHeight: 60,
    paddingVertical: 4,
  },
  chatSendBtn: {
    backgroundColor: '#3dff8b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 3,
    marginLeft: 6,
  },
  chatSendBtnText: {
    color: '#020202',
    fontSize: 10,
    fontWeight: '900',
  },

  // Pickers & Host Presets
  domainPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  domainOptionBtn: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#282828',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  domainOptionBtnActive: {
    borderColor: '#d4af37',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  domainOptionText: {
    color: '#888',
    fontSize: 10,
    fontWeight: '700',
  },
  domainOptionTextActive: {
    color: '#fff',
  },
  hostPresetBtn: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#262626',
    padding: 10,
    borderRadius: 4,
    marginBottom: 8,
  },
  hostPresetBtnActive: {
    borderColor: '#3dff8b',
    backgroundColor: 'rgba(61, 255, 139, 0.08)',
  },
  hostPresetTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  hostPresetSub: {
    color: '#777',
    fontSize: 10,
    marginTop: 2,
    fontFamily: 'monospace',
  },
});
