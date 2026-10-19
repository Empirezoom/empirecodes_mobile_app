import React, { useState, useEffect } from 'react';
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
} from 'react-native';

// --- MOCK INITIAL DATA (Fallback if DRF backend is not running yet) ---
const INITIAL_METRICS = [
  { id: '1', name: 'Production SLA', value: '99.98%', status: 'NOMINAL', icon: '⚡' },
  { id: '2', name: 'Live Nodes', value: '9 Nodes Active', status: 'HEALTHY', icon: '🌐' },
  { id: '3', name: 'DB Engine', value: 'PostgreSQL ACID', status: 'ONLINE', icon: '💾' },
  { id: '4', name: 'Avg API Latency', value: '42ms (Lagos/AWS)', status: 'OPTIMAL', icon: '⏱️' },
];

const INITIAL_LEADS = [
  {
    id: '1',
    name: 'Chinedu Eze',
    company: 'FintechPulse NG',
    phone: '+2348031112233',
    email: 'chinedu@fintechpulse.ng',
    service: 'Paystack Payment Engine & Webhooks',
    budget: '₦1,500,000 - ₦2,500,000',
    message: 'Need a bulletproof Django backend to handle Paystack transaction webhooks and recurring subscriptions.',
    status: 'new',
  },
  {
    id: '2',
    name: 'Sarah Alabi',
    company: 'Montreux & Co.',
    phone: '+2348124445566',
    email: 'sarah@montreux.com',
    service: 'E-Commerce DRF + React Decoupled',
    budget: '₦3,000,000',
    message: 'Upgrading our Montreux fashion inventory management and checkout APIs.',
    status: 'in_progress',
  },
  {
    id: '3',
    name: 'David Adeleke',
    company: 'BrokersHub Nigeria',
    phone: '+2348097778899',
    email: 'david@brokershub.ng',
    service: 'AWS Cloud Architecture & DB Tuning',
    budget: '₦2,000,000',
    message: 'Need query optimization and Redis caching to handle 20k daily visitors.',
    status: 'contacted',
  },
];

const INITIAL_REVIEWS = [
  {
    id: '1',
    name: 'Kenechukwu O.',
    company: 'Montreux & Co.',
    role: 'Product Lead',
    rating: 5,
    text: 'Anthony engineered our entire backend API. Zero double-charges, idempotent webhooks, and flawless Paystack integration.',
    isApproved: true,
  },
  {
    id: '2',
    name: 'Babajide Santos',
    company: 'BrokersHub Nigeria',
    role: 'Technical Director',
    rating: 5, 
    text: 'Reduced our page response latencies by 35%. Excellent mathematician and backend architect.',
    isApproved: true,
  },
  {
    id: '3',
    name: 'Tunde Bakare',
    company: 'P2PEXC Crypto',
    role: 'Founder',
    rating: 5,
    text: 'Strict ACID compliance, clean DRF endpoints, and great communicator throughout the sprint.',
    isApproved: false, // Needs approval
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backendUrl, setBackendUrl] = useState('http://192.168.100.13:8000/api');
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  // App State
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);

  // Operations Research Calculator State
  const [capacityHours, setCapacityHours] = useState('160');
  const [serviceAPrice, setServiceAPrice] = useState('500'); // Paystack Integration ($500)
  const [serviceBPrice, setServiceBPrice] = useState('1200'); // Full-Stack SaaS ($1200)
  const [orResult, setOrResult] = useState(null);

  // Try fetching live data from local Django backend if available
  const syncWithDjango = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/dashboard/`, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        setIsLiveConnected(true);
        if (data.telemetry && data.telemetry.metrics) {
          setMetrics(data.telemetry.metrics);
        }
        if (data.recent_leads && data.recent_leads.length > 0) {
          setLeads(data.recent_leads);
        }
        Alert.alert('Connected!', 'Live DRF backend connected to your iPhone!');
      } else {
        throw new Error('Server returned ' + response.status);
      }
    } catch (e) {
      setIsLiveConnected(false);
      Alert.alert(
        'Offline / Mock Mode',
        `Could not reach DRF at ${backendUrl}.\n\nRunning in standalone preview mode with sample data.`
      );
    } finally {
      setLoading(false);
    }
  };

  // 1-Tap Contact Action (WhatsApp)
  const openWhatsApp = (phone, name) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const url = `whatsapp://send?phone=${cleanPhone}&text=Hello ${encodeURIComponent(name)}, Anthony Matthew from EmpireCodes here.`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://wa.me/${cleanPhone}`);
      }
    });
  };

  // 1-Tap Phone Call
  const makeCall = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  // Toggle Lead Status
  const toggleLeadStatus = (id) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === id) {
          const next =
            lead.status === 'new'
              ? 'in_progress'
              : lead.status === 'in_progress'
              ? 'closed'
              : 'new';
          return { ...lead, status: next };
        }
        return lead;
      })
    );
  };

  // Toggle Review Approval
  const toggleReviewApproval = (id) => {
    setReviews((prev) =>
      prev.map((rev) => (rev.id === id ? { ...rev, isApproved: !rev.isApproved } : rev))
    );
  };

  // Run Operations Research Optimization on Phone
  const computeOROptimization = () => {
    const hours = parseFloat(capacityHours) || 160;
    const pA = parseFloat(serviceAPrice) || 500;
    const pB = parseFloat(serviceBPrice) || 1200;

    // Service A takes 20 hours ($pA)
    // Service B takes 40 hours ($pB)
    const contractsB = Math.floor(hours / 40);
    const remHours = hours - contractsB * 40;
    const contractsA = Math.floor(remHours / 20);
    const totalRev = contractsA * pA + contractsB * pB;
    const usedHours = contractsA * 20 + contractsB * 40;

    setOrResult({
      contractsA,
      contractsB,
      totalRev,
      usedHours,
      slackHours: hours - usedHours,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020202" />

      {/* TOP HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>EMPIRECODES</Text>
          <Text style={styles.brandSubtitle}>Anthony Oluwaseun Matthew • Command Hub</Text>
        </View>
        <TouchableOpacity
          style={[styles.connectionPill, isLiveConnected ? styles.pillLive : styles.pillOffline]}
          onPress={syncWithDjango}
        >
          <View style={[styles.dot, isLiveConnected ? styles.dotLive : styles.dotOffline]} />
          <Text style={styles.connectionText}>
            {isLiveConnected ? 'DRF: LIVE' : 'PREVIEW'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* NAVIGATION TABS */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.navBtn, activeTab === 'dashboard' && styles.navBtnActive]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={[styles.navBtnText, activeTab === 'dashboard' && styles.navBtnTextActive]}>
            ⚡ Vitals
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navBtn, activeTab === 'leads' && styles.navBtnActive]}
          onPress={() => setActiveTab('leads')}
        >
          <Text style={[styles.navBtnText, activeTab === 'leads' && styles.navBtnTextActive]}>
            📬 Leads ({leads.filter((l) => l.status === 'new').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navBtn, activeTab === 'reviews' && styles.navBtnActive]}
          onPress={() => setActiveTab('reviews')}
        >
          <Text style={[styles.navBtnText, activeTab === 'reviews' && styles.navBtnTextActive]}>
            ⭐ Reviews
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navBtn, activeTab === 'math' && styles.navBtnActive]}
          onPress={() => setActiveTab('math')}
        >
          <Text style={[styles.navBtnText, activeTab === 'math' && styles.navBtnTextActive]}>
            🧮 Math Lab
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ================= TAB 1: DASHBOARD & TELEMETRY ================= */}
        {activeTab === 'dashboard' && (
          <View>
            <Text style={styles.sectionHeader}>ARCHITECTURAL TELEMETRY</Text>
            <View style={styles.metricsGrid}>
              {metrics.map((m, idx) => (
                <View key={idx} style={styles.metricCard}>
                  <Text style={styles.metricIcon}>{m.icon || '🔹'}</Text>
                  <Text style={styles.metricValue}>{m.value || m.metric_value}</Text>
                  <Text style={styles.metricName}>{m.name || m.metric_name}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{m.status || m.status_label || 'OK'}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* QUICK STATS SUMMARY */}
            <Text style={[styles.sectionHeader, { marginTop: 24 }]}>BUSINESS OVERVIEW</Text>
            <View style={styles.overviewBox}>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewNumber}>{leads.length}</Text>
                <Text style={styles.overviewLabel}>Active Inquiries</Text>
              </View>
              <View style={styles.overviewDivider} />
              <View style={styles.overviewItem}>
                <Text style={styles.overviewNumber}>
                  {leads.filter((l) => l.status === 'new').length}
                </Text>
                <Text style={styles.overviewLabel}>New Leads</Text>
              </View>
              <View style={styles.overviewDivider} />
              <View style={styles.overviewItem}>
                <Text style={styles.overviewNumber}>
                  {reviews.filter((r) => r.isApproved).length}
                </Text>
                <Text style={styles.overviewLabel}>Live Reviews</Text>
              </View>
            </View>

            {/* SERVER URL CONFIG */}
            <View style={styles.configCard}>
              <Text style={styles.configTitle}>DRF Backend Endpoint</Text>
              <TextInput
                style={styles.configInput}
                value={backendUrl}
                onChangeText={setBackendUrl}
                placeholder="http://192.168.1.x:8000/api"
                placeholderTextColor="#666"
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.syncBtn} onPress={syncWithDjango} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#020202" />
                ) : (
                  <Text style={styles.syncBtnText}>Test & Sync with Django API</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ================= TAB 2: CLIENT LEADS FEED ================= */}
        {activeTab === 'leads' && (
          <View>
            <Text style={styles.sectionHeader}>PROSPECTIVE CLIENT INQUIRIES</Text>
            {leads.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardSubtitle}>{item.company || 'Direct Client'}</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.statusPill,
                      item.status === 'new'
                        ? styles.statusNew
                        : item.status === 'in_progress'
                        ? styles.statusProgress
                        : styles.statusClosed,
                    ]}
                    onPress={() => toggleLeadStatus(item.id)}
                  >
                    <Text style={styles.statusPillText}>{item.status.toUpperCase()}</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.serviceTag}>💼 {item.service}</Text>
                {item.budget ? (
                  <Text style={styles.budgetTag}>💰 Budget: {item.budget}</Text>
                ) : null}
                <Text style={styles.cardBody}>{item.message}</Text>

                {/* 1-TAP ACTION BUTTONS */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.waBtn]}
                    onPress={() => openWhatsApp(item.phone, item.name)}
                  >
                    <Text style={styles.actionBtnText}>💬 WhatsApp</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.callBtn]}
                    onPress={() => makeCall(item.phone)}
                  >
                    <Text style={styles.actionBtnText}>📞 Call</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.statusBtn]}
                    onPress={() => toggleLeadStatus(item.id)}
                  >
                    <Text style={styles.actionBtnText}>🔄 Advance</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ================= TAB 3: CLIENT REVIEWS APPROVER ================= */}
        {activeTab === 'reviews' && (
          <View>
            <Text style={styles.sectionHeader}>CLIENT REVIEWS & MODERATION</Text>
            <Text style={styles.sectionHint}>
              Approve or reject customer reviews before they publish to empirecodes.com.ng.
            </Text>

            {reviews.map((rev) => (
              <View key={rev.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cardTitle}>{rev.name}</Text>
                    <Text style={styles.cardSubtitle}>
                      {rev.role} • {rev.company}
                    </Text>
                  </View>
                  <Text style={styles.ratingStars}>{'★'.repeat(rev.rating)}</Text>
                </View>

                <Text style={styles.cardBody}>"{rev.text}"</Text>

                <View style={styles.cardFooter}>
                  <Text style={[styles.badgeText, rev.isApproved ? styles.approvedText : styles.pendingText]}>
                    {rev.isApproved ? '✓ LIVE ON PORTFOLIO' : '⏳ PENDING REVIEW'}
                  </Text>
                  <TouchableOpacity
                    style={[styles.toggleBtn, rev.isApproved ? styles.rejectBtn : styles.approveBtn]}
                    onPress={() => toggleReviewApproval(rev.id)}
                  >
                    <Text style={styles.toggleBtnText}>
                      {rev.isApproved ? 'Unpublish' : 'Approve & Publish'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ================= TAB 4: OPERATIONS RESEARCH LAB ================= */}
        {activeTab === 'math' && (
          <View>
            <Text style={styles.sectionHeader}>OPERATIONS RESEARCH OPTIMIZER</Text>
            <Text style={styles.sectionHint}>
              B.Tech Computational Mathematics: Solve linear program allocations maximizing monthly consulting revenue.
            </Text>

            <View style={styles.orCard}>
              <Text style={styles.orLabel}>Monthly Developer Capacity (Hours):</Text>
              <TextInput
                style={styles.orInput}
                keyboardType="numeric"
                value={capacityHours}
                onChangeText={setCapacityHours}
              />

              <Text style={styles.orLabel}>Service A: Paystack Gateway (20 hrs / project):</Text>
              <TextInput
                style={styles.orInput}
                keyboardType="numeric"
                value={serviceAPrice}
                onChangeText={setServiceAPrice}
              />

              <Text style={styles.orLabel}>Service B: Full-Stack Django SaaS (40 hrs / project):</Text>
              <TextInput
                style={styles.orInput}
                keyboardType="numeric"
                value={serviceBPrice}
                onChangeText={setServiceBPrice}
              />

              <TouchableOpacity style={styles.computeBtn} onPress={computeOROptimization}>
                <Text style={styles.computeBtnText}>Run Simplex Optimization</Text>
              </TouchableOpacity>

              {orResult && (
                <View style={styles.resultBox}>
                  <Text style={styles.resultHeader}>OPTIMAL ALLOCATION</Text>
                  <Text style={styles.resultLine}>
                    • Paystack Integrations (Service A): <Text style={styles.greenVal}>{orResult.contractsA} contracts</Text>
                  </Text>
                  <Text style={styles.resultLine}>
                    • Django SaaS Systems (Service B): <Text style={styles.greenVal}>{orResult.contractsB} contracts</Text>
                  </Text>
                  <Text style={styles.resultLine}>
                    • Utilized Hours: <Text style={styles.goldVal}>{orResult.usedHours} / {capacityHours} hrs</Text>
                  </Text>
                  <Text style={styles.resultLine}>
                    • Projected Revenue: <Text style={styles.greenVal}>${orResult.totalRev.toLocaleString()}</Text>
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020202',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  brandTitle: {
    color: '#3dff8b',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandSubtitle: {
    color: '#888',
    fontSize: 11,
    marginTop: 2,
  },
  connectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillLive: {
    backgroundColor: 'rgba(61, 255, 139, 0.1)',
    borderColor: '#3dff8b',
  },
  pillOffline: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderColor: '#d4af37',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  dotLive: {
    backgroundColor: '#3dff8b',
  },
  dotOffline: {
    backgroundColor: '#d4af37',
  },
  connectionText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#090909',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  navBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  navBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#3dff8b',
  },
  navBtnText: {
    color: '#777',
    fontSize: 11,
    fontWeight: '600',
  },
  navBtnTextActive: {
    color: '#3dff8b',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    color: '#d4af37',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  sectionHint: {
    color: '#888',
    fontSize: 12,
    marginBottom: 16,
    lineHeight: 18,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#0d0d0d',
    borderWidth: 1,
    borderColor: '#1f1f1f',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  metricIcon: {
    fontSize: 18,
    marginBottom: 6,
  },
  metricValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  metricName: {
    color: '#777',
    fontSize: 11,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(61, 255, 139, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    color: '#3dff8b',
    fontSize: 9,
    fontWeight: '700',
  },
  overviewBox: {
    flexDirection: 'row',
    backgroundColor: '#0d0d0d',
    borderWidth: 1,
    borderColor: '#1f1f1f',
    borderRadius: 8,
    paddingVertical: 16,
    marginBottom: 20,
    justifyContent: 'space-around',
  },
  overviewItem: {
    alignItems: 'center',
  },
  overviewNumber: {
    color: '#3dff8b',
    fontSize: 22,
    fontWeight: '900',
  },
  overviewLabel: {
    color: '#888',
    fontSize: 11,
    marginTop: 4,
  },
  overviewDivider: {
    width: 1,
    backgroundColor: '#222',
  },
  configCard: {
    backgroundColor: '#090909',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
  },
  configTitle: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  configInput: {
    backgroundColor: '#030303',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 6,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 10,
  },
  syncBtn: {
    backgroundColor: '#3dff8b',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  syncBtnText: {
    color: '#020202',
    fontWeight: '800',
    fontSize: 12,
  },
  card: {
    backgroundColor: '#0d0d0d',
    borderWidth: 1,
    borderColor: '#1f1f1f',
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: '#d4af37',
    fontSize: 12,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusNew: {
    backgroundColor: '#3dff8b',
  },
  statusProgress: {
    backgroundColor: '#d4af37',
  },
  statusClosed: {
    backgroundColor: '#555',
  },
  statusPillText: {
    color: '#020202',
    fontSize: 9,
    fontWeight: '900',
  },
  serviceTag: {
    color: '#8be9fd',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  budgetTag: {
    color: '#50fa7b',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardBody: {
    color: '#bbb',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  waBtn: {
    backgroundColor: '#25D366',
  },
  callBtn: {
    backgroundColor: '#1f6feb',
  },
  statusBtn: {
    backgroundColor: '#222',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  ratingStars: {
    color: '#d4af37',
    fontSize: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    paddingTop: 10,
    marginTop: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  approvedText: {
    color: '#3dff8b',
  },
  pendingText: {
    color: '#d4af37',
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  approveBtn: {
    backgroundColor: '#3dff8b',
  },
  rejectBtn: {
    backgroundColor: '#ff5555',
  },
  toggleBtnText: {
    color: '#020202',
    fontSize: 11,
    fontWeight: '800',
  },
  orCard: {
    backgroundColor: '#0d0d0d',
    borderWidth: 1,
    borderColor: '#1f1f1f',
    borderRadius: 8,
    padding: 16,
  },
  orLabel: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  orInput: {
    backgroundColor: '#030303',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 6,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  computeBtn: {
    backgroundColor: '#d4af37',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 18,
  },
  computeBtnText: {
    color: '#020202',
    fontSize: 13,
    fontWeight: '800',
  },
  resultBox: {
    backgroundColor: '#030303',
    borderWidth: 1,
    borderColor: '#3dff8b',
    borderRadius: 6,
    padding: 14,
    marginTop: 18,
  },
  resultHeader: {
    color: '#3dff8b',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
  },
  resultLine: {
    color: '#ddd',
    fontSize: 12,
    lineHeight: 20,
  },
  greenVal: {
    color: '#3dff8b',
    fontWeight: '700',
  },
  goldVal: {
    color: '#d4af37',
    fontWeight: '700',
  },
});

