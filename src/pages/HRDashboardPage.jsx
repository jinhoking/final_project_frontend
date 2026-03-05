import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Container, Row, Col, Card, Table, Badge, Form, InputGroup, Button, Modal, Spinner } from 'react-bootstrap';
import axios from 'axios';

import Header from '../components/main/Header';
import Footer from '../components/main/Footer';
import EmployeeProfileModal from '../components/hr/EmployeeProfileModal'; 
import MessageDrawer from '../components/hr/MessageDrawer';

import { 
  FaUsers, FaPlaneDeparture, FaSearch, FaUserPlus, FaUserClock, FaIdCard, FaUserCheck, 
  FaFileAlt, FaCheck, FaTimes, FaCalendarAlt, FaSyncAlt
} from 'react-icons/fa';

const STATUS_MAP = { 'ACTIVE': '재직', 'LEAVE': '퇴사', 'SUSPENDED': '휴직', 'VACATION': '휴가', 'BUSINESS_TRIP': '출장', 'MEETING': '회의' };
const STATUS_REVERSE_MAP = { '재직': 'ACTIVE', '퇴사': 'LEAVE', '휴직': 'SUSPENDED', '휴가': 'VACATION', '출장': 'BUSINESS_TRIP', '회의': 'MEETING' };

const STATUS_COLOR_MAP = {
  'ACTIVE': { border: '#198754', text: '#2ecc71' },
  'VACATION': { border: '#ffc107', text: '#f1c40f' },
  'BUSINESS_TRIP': { border: '#0dcaf0', text: '#00cec9' },
  'MEETING': { border: '#6f42c1', text: '#a29bfe' },
  'LEAVE': { border: '#dc3545', text: '#ff7675' },
  'SUSPENDED': { border: '#6c757d', text: '#b2bec3' }
};

const getSafeDateString = (date) => {
  if (!date) return "";
  if (Array.isArray(date)) {
    return `${date[0]}-${String(date[1]).padStart(2, '0')}-${String(date[2]).padStart(2, '0')}`;
  }
  return String(date).split('T')[0];
};

const HRDashboardPage = ({ userInfo }) => { 
  const [employees, setEmployees] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [currentUser, setCurrentUser] = useState(userInfo || null);

  const [filters, setFilters] = useState({ name: "", dept: "전체", pos: "전체", date: "", status: "전체" });
  const [showProfile, setShowProfile] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [chatTarget, setChatTarget] = useState(null);
  const [weather, setWeather] = useState(null);

  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const handleDocClick = (doc) => {
    setSelectedDoc(doc);
    setShowDocModal(true);
  };

  const isHrManager = currentUser && 
    (currentUser.deptName === '인사팀' || currentUser.dept === '인사팀') && 
    (currentUser.position === '팀장' || currentUser.pos === '팀장');

  const getDeptColor = (dept) => {
    if (!dept) return '#0dcaf0';
    if (dept.includes('보안')) return '#ff7675';
    if (dept.includes('경영')) return '#a29bfe';
    if (dept.includes('개발')) return '#00cec9';
    return '#0dcaf0';
  };

  const parseVacationHtml = (htmlString) => {
    if (!htmlString) return { type: '휴가', period: '-', reason: '-' };
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, 'text/html');
      let type = '휴가';
      const spans = Array.from(doc.querySelectorAll('span'));
      const checkedSpan = spans.find(s => s.textContent.includes('☑'));
      if (checkedSpan && checkedSpan.nextSibling) type = checkedSpan.nextSibling.textContent.trim();
      let period = '';
      const rows = Array.from(doc.querySelectorAll('tr'));
      const periodRow = rows.find(tr => tr.textContent.includes('휴가 기간'));
      if (periodRow && periodRow.querySelectorAll('td')[1]) period = periodRow.querySelectorAll('td')[1].textContent.trim();
      let reason = '';
      const reasonRow = rows.find(tr => tr.textContent.includes('신청 사유'));
      if (reasonRow && reasonRow.querySelectorAll('td')[1]) reason = reasonRow.querySelectorAll('td')[1].textContent.replace('※ 상세 사유를 입력하세요.', '').trim();
      return { type, period, reason };
    } catch (e) { return { type: '휴가', period: '-', reason: '내용 없음' }; }
  };

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    return {
      total: employees.length,
      newHires: employees.filter(e => {
        const dateStr = getSafeDateString(e.joinDate);
        return dateStr.startsWith(currentMonthStr);
      }).length,
      absent: employees.filter(e => e.status && !['ACTIVE', 'LEAVE'].includes(e.status)).length,
      attendanceRate: employees.length > 0 ? Math.round(((employees.filter(e => e.status === 'ACTIVE').length) / employees.length) * 100) : 0
    };
  }, [employees]);

  useEffect(() => {
    const initData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        if(!currentUser) {
          const meRes = await axios.get('http://ecpsystem.site:8080/api/users/me', config);
          setCurrentUser(meRes.data);
        }

        const [usersRes, docsRes] = await Promise.all([
          axios.get('http://ecpsystem.site:8080/api/users', config),
          axios.get('http://ecpsystem.site:8080/api/documents', config)
        ]);

        const allUsers = usersRes.data;
        setEmployees(allUsers);
        setPendingApprovals(docsRes.data.filter(doc => doc.type?.includes('휴가') || doc.type === '01'));

        // 🌟 [수정] 진짜 실시간 로그인 데이터 연동 로직
        const today = new Date().toDateString();
        
        const logs = allUsers
          .filter(emp => emp.lastLoginAt !== null) // 로그인 기록이 있는 사람만
          .map(emp => {
            const loginDate = new Date(emp.lastLoginAt);
            const isToday = loginDate.toDateString() === today;
            
            // 시간 포맷 (HH:mm)
            const timeStr = `${String(loginDate.getHours()).padStart(2, '0')}:${String(loginDate.getMinutes()).padStart(2, '0')}`;
            
            return {
              time: timeStr,
              name: emp.name,
              action: STATUS_MAP[emp.status] || "출근",
              note: "정상 출근 확인",
              isToday: isToday // 오늘 데이터인지 판별용
            };
          })
          .filter(log => log.isToday) // 오늘 로그인한 유저만 필터링
          .sort((a, b) => b.time.localeCompare(a.time)); // 최근 시간 순 정렬

        setAttendanceLogs(logs);
      } catch (e) { console.error(e); }
    };

    const fetchWeather = () => {
      axios.get(`https://api.weatherapi.com/v1/current.json?key=ee92e1a0799b4f978b562159261601&q=Seoul&lang=ko`)
        .then(res => setWeather(res.data))
        .catch(err => console.error("Weather API Error:", err));
    };

    initData();
    fetchWeather();
  }, [currentUser, userInfo]);

  const handleOpenChat = (target) => { setChatTarget(target); setShowChat(true); setShowProfile(false); };

  const handleStatusChange = async (id, newStatusValue) => {
    if (!isHrManager) return alert("권한이 없습니다.");
    try {
      const token = localStorage.getItem('token');
      const statusEnum = STATUS_REVERSE_MAP[newStatusValue] || newStatusValue;
      await axios.put(`http://ecpsystem.site:8080/api/users/${id}/status`, { status: statusEnum }, { headers: { Authorization: `Bearer ${token}` } });
      setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, status: statusEnum } : emp));
      alert("상태가 변경되었습니다.");
    } catch (e) { alert("변경 실패"); }
  };

  const handleCheckAction = async (id, action) => {
    if (!isHrManager) return alert("권한이 없습니다.");
    
    try {
      const token = localStorage.getItem('token');
      const newStatus = action === 'check' ? 'APPROVED' : 'REJECTED'; 
  
     await axios.post(`http://ecpsystem.site:8080/api/documents/${id}/approve`, 
        { 
          status: newStatus, 
          comment: commentMsg 
        }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(action === 'check' ? "승인 처리되었습니다." : "제외(반려)되었습니다.");
      setPendingApprovals(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      
    } catch (error) {
      console.error(error);
      alert("상태 변경 요청에 실패했습니다.");
    }
  };

  const handleEmployeeUpdate = async (updatedData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://ecpsystem.site:8080/api/users/${updatedData.id}`, updatedData, { headers: { Authorization: `Bearer ${token}` } });
      setEmployees(prev => prev.map(emp => emp.id === updatedData.id ? { ...emp, ...updatedData } : emp));
      setShowProfile(false);
    } catch (e) { alert("실패"); }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesName = (emp.name || "").toLowerCase().includes(filters.name.toLowerCase());
      const matchesDept = filters.dept === "전체" || (emp.deptName || emp.dept) === filters.dept;
      const matchesPos = filters.pos === "전체" || (emp.position || emp.pos) === filters.pos;
      const matchesDate = filters.date === "" || (getSafeDateString(emp.joinDate)).includes(filters.date);
      const matchesStatus = filters.status === "전체" || (STATUS_MAP[emp.status] || "재직") === filters.status;
      return matchesName && matchesDept && matchesPos && matchesDate && matchesStatus;
    });
  }, [employees, filters]);

  const getStatusStyle = (statusEnum) => {
    const style = STATUS_COLOR_MAP[statusEnum] || { border: '#0dcaf0', text: '#0dcaf0' };
    return { 
      backgroundColor: 'transparent',
      borderColor: style.border, 
      color: style.text, 
      borderWidth: '2px', 
      borderStyle: 'solid', 
      fontWeight: '700', 
      textAlign: 'center', 
      textAlignLast: 'center', 
      cursor: 'pointer', 
      borderRadius: '8px', 
      padding: '4px 2px', 
      fontSize: '0.9rem', 
      height: '34px', 
      appearance: 'none', 
      width: '100%' 
    };
  };

  return (
    <div style={{ backgroundColor: '#0b0c10', minHeight: '100vh', color: '#c5c6c7', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      <style>{`
          .custom-clean-card { border: 1px solid rgba(255, 255, 255, 0.1) !important; border-radius: 12px !important; background-color: #1a1c23 !important; overflow: hidden !important; }
          .table-scroll-container { flex-grow: 1; overflow-y: auto !important; max-height: 710px; position: relative; }
          .hr-list-table { border-collapse: separate !important; border-spacing: 0; width: 100%; }
          .hr-list-table thead th { position: sticky !important; top: 0 !important; z-index: 100 !important; background-color: #1a1c23 !important; border-bottom: 2px solid #0dcaf0; padding: 18px 10px !important; color: #ffffff !important; font-weight: 700; }
          .hr-list-table thead th:first-child { padding-left: 2.8rem !important; text-align: left !important; width: 20%; }
          .hr-list-table tbody td:first-child { padding-left: 1.5rem !important; text-align: left !important; }
          .hr-list-table tbody tr:hover { background: rgba(13, 202, 240, 0.05); cursor: pointer; }
          
          /* 🌟 [수정] 테이블 셀 가로 배치 고정 및 줄바꿈 방지 */
          .hr-list-table tbody td { 
            font-size: 1.05rem !important; 
            padding: 15px 10px !important; 
            vertical-align: middle; 
            border-bottom: 1px solid rgba(255,255,255,0.05); 
            white-space: nowrap !important; 
          }
          
          .filter-input-group .form-control, 
          .filter-input-group .form-select { 
              background-color: #1a1c23 !important;
              border: 1px solid rgba(255, 255, 255, 0.2) !important; 
              color: #ffffff !important; 
              font-size: 0.9rem !important; 
          }
          .filter-input-group .form-control::placeholder { color: rgba(255, 255, 255, 0.5) !important; }
          .status-cell-center { display: flex; justify-content: center; align-items: center; width: 100%; }
          
          @keyframes pulse-red { 
            0% { opacity: 1; transform: scale(1); } 
            50% { opacity: 0.5; transform: scale(0.95); } 
            100% { opacity: 1; transform: scale(1); } 
          }
          .animate-pulse { animation: pulse-red 1.5s infinite ease-in-out; }
      `}</style>

      <Header weather={weather} loading={{ weather: !weather }} currentUser={currentUser || userInfo} />

      <div className="main-title-section mb-2 px-5 mt-4">
        <Badge bg="info" text="dark" className="mb-2 px-3 fw-bold rounded-pill" style={{ fontSize: '0.85rem' }}>HR DASHBOARD</Badge>
        <div className="d-flex justify-content-between align-items-end">
          <h1 className="fw-bold mb-0" style={{ letterSpacing: '-1px', fontSize: '2.6rem' }}>
            <span className="text-info">인사관리</span> 근태현황(HR STATUS)
          </h1>
        </div>
      </div>

      <Container fluid className="mt-3 flex-grow-1 px-5" style={{ marginBottom: '50px' }}>
        <Row className="mb-4 g-4 text-center">
          {[ 
            { icon: <FaUserPlus />, label: "이달의 입사", value: `${stats.newHires}명`, color: "#00d2d3" },
            { icon: <FaUsers />, label: "전체 사원 수", value: `${stats.total}명`, color: "#0dcaf0" },
            { icon: <FaPlaneDeparture />, label: "휴가/부재", value: `${stats.absent}명`, color: "#ffc107" },
            { icon: <FaUserCheck />, label: "금일 출근율", value: `${stats.attendanceRate}%`, color: "#2ecc71" },
          ].map((item, idx) => (
            <Col key={idx} md={3}>
              <Card className="custom-clean-card border-0 p-3 h-100 d-flex align-items-center justify-content-center shadow-sm">
                <div className="d-flex align-items-center justify-content-center gap-4">
                  <div style={{ fontSize: '2.5rem', color: item.color }}>{item.icon}</div>
                  <div className="text-start">
                    <div className="text-white-50 small fw-bold">{item.label}</div>
                    <div className="fs-3 fw-bold text-white">{item.value}</div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <Row className="g-4 align-items-stretch">
          <Col lg={8}>
            <Card className="custom-clean-card h-100 border-0 shadow-lg d-flex flex-column">
              <Card.Header className="py-4 bg-black bg-opacity-40 border-0">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <span className="text-info fw-bold fs-5">EMPLOYEE DIRECTORY</span>
                    <Badge bg="info" text="dark" className="rounded-pill px-3 shadow-sm d-flex align-items-center opacity-75">
                      <Spinner animation="grow" size="sm" className="me-2" style={{width: '0.7rem', height: '0.7rem'}} />
                      가입자 자동 연동중
                    </Badge>
                  </div>
                </div>
                <Row className="g-2 filter-input-group">
                  <Col md={3}>
                    <InputGroup size="sm">
                      <InputGroup.Text className="bg-dark border-secondary text-info"><FaSearch size={14}/></InputGroup.Text>
                      <Form.Control placeholder="이름 검색..." onChange={(e) => setFilters({...filters, name: e.target.value})} />
                    </InputGroup>
                  </Col>
                  <Col md={2}><Form.Select size="sm" onChange={(e) => setFilters({...filters, dept: e.target.value})}><option value="전체">모든 부서</option><option value="인사팀">인사팀</option><option value="개발팀">개발팀</option><option value="보안팀">보안팀</option><option value="경영지원팀">경영지원팀</option></Form.Select></Col>
                  <Col md={2}><Form.Select size="sm" onChange={(e) => setFilters({...filters, pos: e.target.value})}>
                    <option value="전체">모든 직위</option>
                    <option value="본부장">본부장</option><option value="팀장">팀장</option><option value="차장">차장</option><option value="과장">과장</option><option value="대리">대리</option><option value="사원">사원</option>
                  </Form.Select></Col>
                  <Col md={3}><Form.Control size="sm" placeholder="입사일 (YYYY.MM)" onChange={(e) => setFilters({...filters, date: e.target.value})} /></Col>
                  <Col md={2}><Form.Select size="sm" onChange={(e) => setFilters({...filters, status: e.target.value})}>
                    <option value="전체">모든 상태</option>
                    {Object.values(STATUS_MAP).map(v => <option key={v} value={v}>{v}</option>)}
                  </Form.Select></Col>
                </Row>
              </Card.Header>
              <div className="table-scroll-container custom-scroll">
                <Table variant="dark" hover className="mb-0 text-center hr-list-table">
                  <thead><tr><th>성명</th><th>부서</th><th>직위</th><th>입사일</th><th>상태</th></tr></thead>
                  <tbody>
                    {filteredEmployees.map(emp => (
                      <tr key={emp.id} onClick={() => { setSelectedEmployee(emp); setShowProfile(true); }}>
                        <td className="fw-bold text-nowrap"><FaIdCard className="me-2 text-secondary opacity-50" /> {emp.name}</td>
                        <td className="text-nowrap" style={{ color: getDeptColor(emp.deptName || emp.dept) }}>{emp.deptName || emp.dept}</td>
                        <td className="text-white-50 text-nowrap">{emp.position || emp.pos}</td>
                        <td className="small text-nowrap">{emp.joinDate ? getSafeDateString(emp.joinDate).replaceAll('-', '.') : "날짜 없음"}</td>
                        <td>
                          <div className="status-cell-center">
                            {isHrManager ? (
                              <Form.Select size="sm" style={getStatusStyle(emp.status || 'ACTIVE')} value={STATUS_MAP[emp.status] || '재직'} onChange={(e) => handleStatusChange(emp.id, e.target.value)} onClick={(e) => e.stopPropagation()}>
                                {Object.values(STATUS_MAP).map(v => <option key={v} value={v}>{v}</option>)}
                              </Form.Select>
                            ) : (
                              <div style={getStatusStyle(emp.status || 'ACTIVE')}>{STATUS_MAP[emp.status] || '재직'}</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card>
          </Col>

          <Col lg={4}>
            <div className="d-flex flex-column gap-4 h-100">
              <Card className="custom-clean-card border-0 shadow mb-0" style={{ minHeight: '300px' }}>
                <Card.Header className="py-3 bg-black bg-opacity-20 border-0 d-flex justify-content-between align-items-center"><small className="text-info fw-bold">PENDING VACATIONS</small><Badge bg="info" className="text-dark">{pendingApprovals.length}건</Badge></Card.Header>
                <Card.Body className="p-0 overflow-auto custom-scroll" style={{ maxHeight: '350px' }}>
                  <div className="list-group list-group-flush">
              {pendingApprovals.map(req => {
    const parsed = parseVacationHtml(req.content);
    // 💡 여기서 상태값을 확실하게 먼저 정의해 줍니다!
    const isWait = req.status === 'PENDING';
    const isApprove = req.status === 'APPROVED';
    
    return (
      <div key={req.id} className="list-group-item bg-transparent text-white border-secondary border-opacity-10 p-3" style={{ cursor: 'pointer' }} onClick={() => handleDocClick(req)}>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            {/* 상태에 따라 뱃지 색상 및 텍스트 변경 */}
            <Badge bg={isWait ? "dark" : (isApprove ? "success" : "secondary")} 
                   className={`border ${isWait ? 'border-info text-info' : 'border-0'} me-2`}>
              {isWait ? parsed.type : (isApprove ? '승인됨' : '반려됨')}
            </Badge>
            <span className="fw-bold">{req.drafterName}</span>
          </div>
          
          {/* PENDING(대기 중) 상태일 때만 승인/반려 버튼 노출 */}
          {isHrManager && isWait && (
            <div className="d-flex gap-1">
              <Button variant="outline-success" size="sm" onClick={(e) => { e.stopPropagation(); handleCheckAction(req.id, 'check'); }}><FaCheck/></Button>
              <Button variant="outline-danger" size="sm" onClick={(e) => { e.stopPropagation(); handleCheckAction(req.id, 'discard'); }}><FaTimes/></Button>
            </div>
          )}
        </div>
                          <div className="text-white-50 small text-truncate"><FaFileAlt className="me-2 opacity-50"/>{parsed.reason || req.title}</div>
                          <div className="text-info small fw-bold"><FaCalendarAlt className="me-2"/>{parsed.period}</div>
                        </div>
                      );
                    })}
                  </div>
                </Card.Body>
              </Card>

              <Card className="custom-clean-card border-0 shadow flex-grow-1" style={{ minHeight: '350px' }}>
                <Card.Header className="py-3 bg-black bg-opacity-20 border-0 d-flex justify-content-between align-items-center">
                  <small className="text-info fw-bold"><FaUserClock className="me-2"/>ATTENDANCE MONITOR</small>
                  <Badge bg="danger" className="animate-pulse shadow-sm" style={{ letterSpacing: '1px' }}>● LIVE</Badge>
                </Card.Header>
                <Card.Body className="p-0 overflow-auto custom-scroll" style={{ maxHeight: '400px' }}>
                  <div className="list-group list-group-flush">
                    {attendanceLogs.length > 0 ? attendanceLogs.map((log, idx) => (
                      <div key={idx} className="list-group-item bg-transparent text-white border-secondary border-opacity-10 p-3 d-flex align-items-center gap-3">
                        <div className="text-info fw-bold small text-nowrap" style={{ width: '45px' }}>{log.time}</div>
                        <div className="fw-bold fs-6 text-nowrap" style={{ width: '70px' }}>{log.name}</div>
                        <Badge bg="dark" className="border border-secondary text-info fw-medium text-nowrap" style={{ backgroundColor: 'transparent' }}>{log.action}</Badge>
                        <div className="text-white-50 small ms-auto text-nowrap">정상 출근 확인</div>
                      </div>
                    )) : (
                      <div className="p-4 text-center text-white-50 small mt-4">
                        <FaSyncAlt className="mb-2 fa-spin" /><br/>
                        출근 기록을 불러오는 중입니다...
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
      <Footer />
      
      <Modal show={showDocModal} onHide={() => setShowDocModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-dark border-secondary" closeVariant="white">
          <Modal.Title className="text-info fw-bold"><FaFileAlt className="me-2" />휴가 신청서 상세</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white p-4 custom-scroll" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {selectedDoc ? <div dangerouslySetInnerHTML={{ __html: selectedDoc.content }} /> : "불러오는 중..."}
        </Modal.Body>
        <Modal.Footer className="bg-dark border-secondary">
          <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => setShowDocModal(false)}>닫기</Button>
          {isHrManager && <Button variant="info" className="rounded-pill px-4 fw-bold text-white" onClick={() => { handleCheckAction(selectedDoc.id, 'check'); setShowDocModal(false); }}>승인 완료</Button>}
        </Modal.Footer>
      </Modal>

      <EmployeeProfileModal show={showProfile} onHide={() => setShowProfile(false)} employee={selectedEmployee} getDeptColor={getDeptColor} currentUser={currentUser} isHrManager={isHrManager} onUpdate={handleEmployeeUpdate} onSendMessage={handleOpenChat} />
      <MessageDrawer show={showChat} onHide={() => setShowChat(false)} targetUser={chatTarget} currentUser={currentUser} />
    </div>
  );
};

export default HRDashboardPage;