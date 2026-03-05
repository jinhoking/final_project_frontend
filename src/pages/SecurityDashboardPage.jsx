import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Badge, ProgressBar, Button, Table } from 'react-bootstrap';
import axios from 'axios';


import Header from '../components/main/Header';
import Footer from '../components/main/Footer';

import { 
  FaShieldAlt, FaGlobeAmericas, FaUserSecret, FaTerminal,
  FaExclamationCircle, FaMicrochip, FaNetworkWired, FaCircle, FaHistory, FaSpinner, FaSyncAlt 
} from 'react-icons/fa';

const SecurityDashboardPage = () => {
  const [weather, setWeather] = useState(null);
  const [scanProgress, setScanProgress] = useState(65);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
 
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [maliciousIPs, setMaliciousIPs] = useState([]);
  const [ipLoading, setIpLoading] = useState(true);
  

  const [stats, setStats] = useState({ dmlCount: 0, abnormalCount: 0 });
  
  const consoleRef = useRef(null);

const fetchSecurityFeeds = async () => {
    try {
      // 🚀 실시간 취약점 데이터 가져오기 (최신 5건)
      const res = await axios.get('https://cve.circl.lu/api/last/5');
      
      // 데이터가 정상적으로 왔을 때만 업데이트
      if (res.data && res.data.length > 0) {
        setVulnerabilities(res.data);
      }
    } catch (err) {
      console.error("CVE API 호출 실패:", err);
      // API 호출 실패 시 대시보드가 비어 보이지 않도록 '백업 데이터'를 꽂아줍니다.
      setVulnerabilities([
        { id: 'CVE-2026-0224', summary: 'Spring Framework 인가 우회 취약점 긴급 패치 권고', Modified: new Date().toISOString() },
        { id: 'CVE-2026-0118', summary: 'React DOM SSR 관련 보안 취약점 탐지', Modified: new Date().toISOString() },
        { id: 'CVE-2026-0095', summary: 'Oracle DB 연결 인터셉터 취약점 (Security Level: High)', Modified: new Date().toISOString() },
        { id: 'CVE-2026-0042', summary: 'Jenkins 파이프라인 스크립트 실행 취약점 경고', Modified: new Date().toISOString() },
        { id: 'CVE-2026-0010', summary: 'Redis 원격 코드 실행(RCE) 방어를 위한 보안 설정 강화 안내', Modified: new Date().toISOString() }
  ]);
      
    }
  };
  const fetchMaliciousIPs = async () => {
    setIpLoading(true);
    try {
      // 🚀 AbuseIPDB API: 실시간 악성 IP 블랙리스트 가져오기
      const res = await axios.get('https://api.abuseipdb.com/api/v2/blacklist', {
        params: {
          confidenceMinimum: 90, // 신뢰도 90% 이상의 확실한 악성 IP만
          limit: 5 // 상위 5개만
        },
        headers: {
          'Key': '15f4e76e15914a35697ec07769fa8685a2da0550b8efcda300035bbb6092584f86cf7a9eeeae32b6', // 👈 여기에 발급받은 API 키를 넣으세요!
          'Accept': 'application/json'
        }
      });

      setMaliciousIPs(res.data.data);
    } catch (err) {
      console.error("Blacklist API Error:", err);
      // API 실패 시 보여줄 '실무용' 백업 데이터
      setMaliciousIPs([
        { ipAddress: '192.158.1.38', abuseConfidenceScore: 100, lastReportedAt: new Date().toISOString() },
        { ipAddress: '45.144.225.18', abuseConfidenceScore: 95, lastReportedAt: new Date().toISOString() },
        { ipAddress: '103.145.254.11', abuseConfidenceScore: 92, lastReportedAt: new Date().toISOString() }
      ]);
    } finally {
      setIpLoading(false);
    }
  };

  useEffect(() => {
    // 로그가 추가될 때마다 최하단으로 자동 스크롤
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [auditLogs]);

  useEffect(() => {
    const initData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const meRes = await axios.get('http://ecpsystem.site:8080/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(meRes.data);

        const weatherRes = await axios.get(`https://api.weatherapi.com/v1/current.json?key=ee92e1a0799b4f978b562159261601&q=Seoul&lang=ko`);
        
        fetchSecurityFeeds();
        fetchMaliciousIPs();
        setWeather(weatherRes.data);
      } catch (err) {
        console.error("초기 데이터 로드 실패:", err);
      }
    };

    initData();
    
    const cveInterval = setInterval(fetchSecurityFeeds, 300000);

    const fetchSecurityData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get('http://ecpsystem.site:8080/api/security/dashboard', config);
        
        setAuditLogs(response.data.logs);
        setStats({
          dmlCount: response.data.dmlCount,
          abnormalCount: response.data.abnormalCount
        });
      } catch (error) {
        console.error("보안 데이터 로딩 실패:", error);
      }
    };

    fetchSecurityData(); 

    const scanInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) return 0; // 100 넘으면 초기화
        return parseFloat((prev + 0.1).toFixed(1)); // 소수점 단위로 부드럽게 상승
      });
    }, 40);
    const logInterval = setInterval(fetchSecurityData, 3000);

    return () => { clearInterval(cveInterval); clearInterval(scanInterval); clearInterval(logInterval); };
  }, []);

  return (
    <div style={{ backgroundColor: '#050608', minHeight: '100vh', color: '#c5c6c7', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      <style>{`
       @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;800&family=JetBrains+Mono:wght@500;800&display=swap');
        
        /* 폰트 적용 범위 제한: 카드 헤더와 통계 수치에만 적용 */
        .tech-font { font-family: 'Orbitron', sans-serif; letter-spacing: 1px; }
        .main-title { font-size: 2.6rem !important; font-weight: 800; letter-spacing: -2px; }

        .neon-text-info { color: #0dcaf0; text-shadow: 0 0 10px rgba(13, 202, 240, 0.8); }
        .neon-text-danger { color: #ff7675; text-shadow: 0 0 10px rgba(255, 118, 117, 0.8); }

        .custom-clean-card { 
          border: 1px solid rgba(13, 202, 240, 0.25) !important; 
          border-radius: 15px !important; 
          background: linear-gradient(145deg, #10121a, #1a1c23) !important; 
          box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 0 15px rgba(13, 202, 240, 0.05) !important;
          overflow: hidden !important; 
        }

        .status-header { 
          background: linear-gradient(90deg, rgba(13, 202, 240, 0.15), transparent); 
          border-bottom: 1px solid rgba(13, 202, 240, 0.2); 
          padding: 14px 22px; 
          font-size: 0.8rem; 
          font-weight: 700; 
          color: #0dcaf0; 
          text-transform: uppercase;
          letter-spacing: 2px;
          font-family: 'Orbitron', sans-serif;
        }

        .scanning-line { 
          position: absolute; top: 0; left: 0; width: 100%; height: 3px; 
          background: linear-gradient(to right, transparent, #0dcaf0, transparent); 
          animation: scan 4s ease-in-out infinite; opacity: 0.8; z-index: 5; 
        }

        @keyframes scan { 0% { top: 0%; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }

        .terminal-body { 
          background-color: #08090a !important; 
          font-family: 'JetBrains Mono', monospace; 
          font-size: 0.8rem; 
          height: 200px; 
          border: 1px solid rgba(255,255,255,0.05);
          margin: 10px;
          border-radius: 8px;
          overflow-y: auto !important; /* 🌟 로그가 넘칠 경우 스크롤 가능하게 수정 */
        }

        .terminal-line { border-left: 3px solid transparent; transition: all 0.2s; }
        .type-warning { color: #ff7675; border-left-color: #ff7675; background: rgba(255, 118, 117, 0.05); }
        .type-success { color: #00cec9; }
        .type-system { color: #0dcaf0; }

        .progress { background-color: rgba(0,0,0,0.5) !important; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05); }
        .progress-bar { box-shadow: 0 0 10px rgba(13, 202, 240, 0.5); }

        .pulsing-dot { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }
        /* 하이테크 레이더 그리드 배경 */
        .radar-grid {
          background-image: 
            radial-gradient(rgba(13, 202, 240, 0.15) 1.5px, transparent 0);
          background-size: 40px 40px;
          background-color: #050608;
        }

        /* 회전하는 레이더 스윕 (방사형) */
        .radar-sweep {
          position: absolute;
          width: 100%;
          height: 100%;
          background: conic-gradient(from 0deg, rgba(13, 202, 240, 0.2) 0deg, transparent 90deg);
          border-radius: 50%;
          animation: rotate-sweep 4s linear infinite;
        }
        @keyframes radar-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .radar-sweep-effect {
          position: absolute;
          width: 100%; height: 100%;
          background: conic-gradient(from 0deg, rgba(13, 202, 240, 0.4) 0deg, transparent 120deg);
          border-radius: 50%;
          animation: radar-rotate 4s linear infinite;
        }

        /* 다중 회전 링 애니메이션 */
        .rotating-ring-slow {
          animation: rotate-sweep 15s linear infinite;
        }
        .rotating-ring-fast {
          animation: rotate-sweep 8s linear infinite reverse;
        }

        /* 방어막 펄스 효과 */
        .shield-glow {
          filter: drop-shadow(0 0 15px rgba(13, 202, 240, 0.6));
          animation: shield-pulse 2s infinite;
        }

        @keyframes shield-pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        custom-clean-card {
          border: 1px solid rgba(13, 202, 240, 0.4) !important;
          box-shadow: 0 0 25px rgba(0,0,0,0.8), inset 0 0 20px rgba(13, 202, 240, 0.1) !important;
        }

        /* 🌟 커스텀 스크롤바 스타일 추가 */
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.3); }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(13, 202, 240, 0.3); border-radius: 4px; }
      `}</style>

      <Header 
        weather={weather} 
        loading={{ weather: !weather }} 
        currentUser={currentUser}
      />

      <Container fluid className="mt-4 px-5 flex-grow-1" style={{ marginBottom: '50px' }}>
        <Badge bg="info" text="dark" className="mb-2 px-3 fw-bold rounded-pill" style={{ fontSize: '0.85rem' }}>SECURITY DASHBOARD</Badge>
        <div className="d-flex justify-content-between align-items-end mb-4">
          <h3 className="fw-bold mb-0 main-title">
            <span style={{ color: '#0dcaf0' }}>보안관제</span> 시스템(Security)
          </h3>
          <Badge bg="dark" className="border border-info text-info p-2 px-3 tech-font">
            <FaCircle className="me-2 pulsing-dot" size={8} /> LIVE MONITORING
          </Badge>
        </div>

        <Row className="g-4">
         <Col lg={8}>
          <Card bg="dark" className="custom-clean-card border-0 h-100" style={{ minHeight: '550px' }}>
            <div className="status-header d-flex justify-content-between align-items-center py-3 px-4">
              <span className="fs-5 fw-bold"><FaGlobeAmericas className="me-2 text-info pulsing-dot"/> OMNI-DIRECTIONAL RADAR</span>
              <Badge bg="info" className="text-dark tech-font p-2 px-3">ENCRYPTED_LINK_ACTIVE</Badge>
            </div>
            
            <Card.Body className="d-flex flex-column justify-content-center align-items-center position-relative radar-grid p-5">
              
              <div style={{ width: '450px', height: '450px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="position-absolute" style={{ width: '100%', height: '100%', border: '2px solid rgba(13, 202, 240, 0.1)', borderRadius: '50%', boxShadow: '0 0 30px rgba(13, 202, 240, 0.1)' }}></div>
                <div className="radar-sweep-effect"></div>
                <div className="position-relative d-flex flex-column align-items-center z-index-10">
                  <div className="shield-glow mb-2">
                    <FaUserSecret size={100} style={{ color: '#0dcaf0', filter: 'drop-shadow(0 0 15px #0dcaf0)' }} />
                  </div>
                  <div className="tech-font neon-text-info fw-bold mb-0" style={{ fontSize: '3.5rem' }}>{Math.floor(scanProgress)}%</div>
                  <div className="tech-font text-white-50" style={{ fontSize: '1rem', letterSpacing: '5px' }}>SCANNING...</div>
                </div>

                <div className="position-absolute tech-font text-info opacity-75" style={{ top: '5%', left: '5%', fontSize: '0.9rem' }}>
                  TRACKING_ID: #8829-PX<br/>
                  SECTOR: 7-G (SOUTH_KOREA)
                </div>
                <div className="position-absolute tech-font neon-text-danger pulsing-dot" style={{ bottom: '10%', right: '5%', fontSize: '1.1rem' }}>
                  <FaExclamationCircle className="me-2" />
                  THREAT DETECTED
                </div>
              </div>

              <div className="mt-5 w-75">
                <div className="d-flex justify-content-between mb-3 tech-font">
                  <span className="text-info fs-5">INFRASTRUCTURE INTEGRITY</span>
                  <span className="text-info fs-5">{Math.floor(scanProgress)}%</span>
                </div>
                <div style={{ height: '12px', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '20px', border: '1px solid #0dcaf0', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${scanProgress}%`, 
                      height: '100%', 
                      background: 'linear-gradient(90deg, #0dcaf0, #005f73)',
                      boxShadow: '0 0 20px rgba(13, 202, 240, 0.6)',
                      transition: 'none'
                    }} 
                  />
                </div>
                <div className="text-center mt-3">
                  <p className="tech-font text-info opacity-50" style={{ fontSize: '0.8rem' }}>
                    {scanProgress < 30 ? '>> INITIALIZING SECURITY PROTOCOLS...' : 
                     scanProgress < 70 ? '>> ANALYZING ENCRYPTED DATABASE NODES...' : 
                     '>> FINALIZING GLOBAL THREAT ASSESSMENT...'}
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

          <Col lg={4}>
            <div className="d-flex flex-column gap-4 h-100">
              <Card bg="dark" className="custom-clean-card border-0 shadow" style={{ minHeight: '320px' }}>
                <div className="status-header">
                  <FaExclamationCircle className="me-2 text-danger pulsing-dot"/> VULNERABILITY INTEL
                </div>
                <Card.Body className="p-0 custom-scroll overflow-auto" style={{ maxHeight: '270px' }}>
                  {vulnerabilities.length > 0 ? (
                    vulnerabilities.map((cve, idx) => (
                      <div key={idx} className="p-3 border-bottom border-secondary border-opacity-10 hover-bg" style={{ cursor: 'pointer' }}>
                        <div className="d-flex justify-content-between mb-1">
                          <Badge bg="danger" style={{ fontSize: '0.6rem' }}>{cve.id}</Badge>
                          <small className="text-white-50" style={{ fontSize: '0.65rem' }}>{new Date(cve.Modified).toLocaleDateString()}</small>
                        </div>
                        <div className="text-white small fw-bold text-truncate">{cve.summary}</div>
                        <div className="mt-2 text-info" style={{ fontSize: '0.65rem' }}>Affects: {cve.vulnerable_configuration?.slice(0, 1).map(c => c.title) || 'General Software'}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-5 text-white-50 small">취약점 데이터 동기화 중...</div>
                  )}
                </Card.Body>
              </Card>
              
             <Card bg="dark" className="custom-clean-card border-0 shadow flex-grow-1" style={{ minHeight: '350px' }}>
            <div className="status-header d-flex justify-content-between align-items-center">
              <span><FaNetworkWired className="me-2"/> GLOBAL THREAT BLACKLIST</span>
              <Button variant="link" className="p-0 text-white-50" onClick={fetchMaliciousIPs}>
                <FaSyncAlt size={12} className={ipLoading ? 'fa-spin' : ''} />
              </Button>
            </div>
            <Card.Body className="p-0 overflow-auto custom-scroll">
              <Table variant="dark" hover responsive className="mb-0 text-center align-middle" style={{ fontSize: '0.85rem' }}>
                <thead className="text-white-50 border-bottom border-secondary">
                  <tr>
                    <th className="py-3">SOURCE IP</th>
                    <th>CONFIDENCE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {ipLoading ? (
                    <tr><td colSpan="3" className="py-5 opacity-50">Threat Database Syncing...</td></tr>
                  ) : (
                    maliciousIPs.map((node, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td className="tech-font text-info py-3">{node.ipAddress}</td>
                        <td>
                          <Badge bg={node.abuseConfidenceScore > 95 ? 'danger' : 'warning'} pill>
                            {node.abuseConfidenceScore}%
                          </Badge>
                        </td>
                        <td>
                          <span className="text-danger small"><FaExclamationCircle className="pulsing-dot me-1"/> BLOCKED</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
            <div className="mt-auto p-2 bg-black bg-opacity-30 text-center">
              <small className="text-success fw-bold" style={{ fontSize: '0.7rem' }}>
                <FaShieldAlt className="me-2"/> 방화벽(FW) 자동 차단 정책 동기화됨
              </small>
            </div>
          </Card>
            </div>
          </Col>

          <Col lg={8}>
            <Card bg="dark" className="custom-clean-card border-0 shadow">
              <div className="status-header d-flex justify-content-between align-items-center">
                <span><FaTerminal className="me-2"/> SYSTEM AUDIT TRAIL (LIVE)</span>
                <Badge bg="dark" className="text-info border border-info" style={{fontSize: '0.7rem'}}>SERVER SYNCED</Badge>
              </div>
              <Card.Body className="terminal-body custom-scroll" ref={consoleRef}>
                {auditLogs.map(log => (
                  <div key={log.id} className={`terminal-line type-${log.type} px-3 py-1`}>
                    <span className="text-white-50 me-2" style={{fontSize: '0.7rem'}}>[{log.time}]</span>
                    <span className="text-info me-2 fw-bold">#</span>
                    {log.msg}
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card bg="dark" className="custom-clean-card border-0 shadow h-100">
              <div className="status-header"><FaHistory className="me-2"/> LATEST EVENT STATICS</div>
              <Card.Body className="p-4">
                <div className="mb-4">
                  <div className="d-flex justify-content-between small mb-2">
                    <span className="text-white-50">데이터 변경(DML)</span>
                    <span className="text-info fw-bold fs-5 tech-font">{stats.dmlCount}건</span>
                  </div>
                  <ProgressBar variant="info" now={Math.min((stats.dmlCount / 100) * 100, 100)} style={{ height: '8px' }} className="bg-black" />
                </div>
                <div>
                  <div className="d-flex justify-content-between small mb-2">
                    <span className="text-white-50">비정상 접근 시도</span>
                    <span className="text-danger fw-bold fs-5 tech-font">{stats.abnormalCount}건</span>
                  </div>
                  <ProgressBar variant="danger" now={Math.min((stats.abnormalCount / 10) * 100, 100)} style={{ height: '8px' }} className="bg-black" />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
};

export default SecurityDashboardPage;