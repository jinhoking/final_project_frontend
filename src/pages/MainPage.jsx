import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Badge, ProgressBar, ListGroup, Button, Modal, Form } from 'react-bootstrap';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate } from 'react-router-dom';

import Header from '../components/main/Header';
import Footer from '../components/main/Footer';

import { 
  FaUsers, FaBriefcase, FaCode, FaShieldAlt, FaFileAlt, 
  FaCheckCircle, FaClipboardList, FaBell, FaChevronRight, FaImage, FaClock, FaTrash, FaPen
} from 'react-icons/fa';

function MainPage({userInfo}) {
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState({ weather: true, news: true, notice: true, schedule: true });
  const [geminiRec, setGeminiRec] = useState({ keyword: "AI 스캐닝", search: "" });
  const [apiLoading, setApiLoading] = useState(true);

  const [docs, setDocs] = useState([]);
  const [actualNotices, setActualNotices] = useState([]);

  // --- 일정 및 모달 상태 ---
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // 🌟 [추가] 등록/수정 모드 구분
  const [newSchedule, setNewSchedule] = useState({ id: null, title: '', date: '', color: '#0dcaf0', writerName: '', writerPosition: '', deptName: '' });

  const getFormattedId = (createdAt, dbId, typeName) => {
    const date = createdAt ? new Date(createdAt) : new Date();
    const year = date.getFullYear();
    const mmdd = `${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const seq = String(dbId).padStart(2, '0');
    return `DOC-${year}${mmdd}-${seq}`;
  };

  const getNextScheduleText = () => {
    if (schedules.length === 0) return "등록된 일정이 없습니다.";
    const now = new Date();
    const futureSchedules = schedules
      .filter(s => new Date(s.start) >= now)
      .sort((a, b) => new Date(a.start) - new Date(b.start));
    
    if (futureSchedules.length === 0) return "진행 예정인 일정이 없습니다.";
    const next = futureSchedules[0];
    return `${next.title} (${next.start.split('T')[0]})`;
  };

  // 빈 날짜 클릭 시 -> '새 일정 등록' 모드
  const handleDateClick = (arg) => {
    setIsEditMode(false); 
    setNewSchedule({ id: null, title: '', date: arg.dateStr, color: '#0dcaf0', writerName: userInfo?.name, writerPosition: userInfo?.position, deptName: userInfo?.deptName });
    setShowModal(true);
  };

  // 🌟 [수정] 일정 클릭 시 -> '상세 보기 및 수정' 모드
  const handleEventClick = (info) => {
    setIsEditMode(true);
    setNewSchedule({
      id: info.event.id,
      title: info.event.title,
      date: info.event.startStr,
      color: info.event.backgroundColor,
      writerName: info.event.extendedProps.writerName || '알 수 없음',
      writerPosition: info.event.extendedProps.writerPosition || '',
      deptName: info.event.extendedProps.deptName || '전사'
    });
    setShowModal(true);
  };

  // 🌟 [수정] 저장 & 업데이트 통합 로직
  const saveSchedule = async () => {
    if (!newSchedule.title) return;
    const token = localStorage.getItem('token');
    try {
      const payload = { 
        title: newSchedule.title, 
        start: newSchedule.date, 
        color: newSchedule.color, 
        allDay: true,
        deptName: userInfo?.department?.deptName || userInfo?.deptName || '미소속'
      };

      if (isEditMode) {
        // [수정 API 호출]
        await axios.put(`http://ecpsystem.site:8080/api/schedules/${newSchedule.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // 프론트 데이터 갱신
        setSchedules(schedules.map(s => String(s.id) === String(newSchedule.id) ? { ...s, ...payload } : s));
      } else {
        // [신규 등록 API 호출]
        const res = await axios.post('http://ecpsystem.site:8080/api/schedules', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSchedules([...schedules, res.data]);
      }
      setShowModal(false);
    } catch (e) {
      console.error(e);
      alert("일정 저장에 실패했습니다.");
    }
  };

  const deleteSchedule = async () => {
    if (!newSchedule.id) return;
    if (!window.confirm("이 일정을 삭제하시겠습니까?")) return;

    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://ecpsystem.site:8080/api/schedules/${newSchedule.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchedules(schedules.filter(s => String(s.id) !== String(newSchedule.id)));
      setShowModal(false);
    } catch (e) {
      console.error(e);
      alert("일정 삭제에 실패했습니다.");
    }
  };

  const quickMenus = [
    { title: '인사 관리현황(HR)', icon: <FaUsers />, color: 'info', path: '/hr', desc: '근태 및 인사관리' },
    { title: '경영 관리현황(ASSETS)', icon: <FaBriefcase />, color: 'secondary', path: '/asset', desc: '자산 및 비품관리' },
    { title: '개발팀 현황(DEV)', icon: <FaCode />, color: 'primary', path: '/dev', desc: '개발 현황 모니터링' },
    { title: '보안 관제시스템(SECURITY)', icon: <FaShieldAlt />, color: 'danger', path: '/security', desc: '보안 로그 및 통제' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      try {
        if (token) {
           const docRes = await axios.get('http://ecpsystem.site:8080/api/documents', { headers });
           if (Array.isArray(docRes.data)) setDocs(docRes.data.sort((a, b) => b.id - a.id));

           const noticeRes = await axios.get('http://ecpsystem.site:8080/api/notices', { headers });
           if (Array.isArray(noticeRes.data)) setActualNotices(noticeRes.data.sort((a, b) => b.id - a.id));

           const scheduleRes = await axios.get('http://ecpsystem.site:8080/api/schedules', { headers });
           if (Array.isArray(scheduleRes.data)) setSchedules(scheduleRes.data);
        }
      } catch (e) { console.error(e); } 
      finally { setLoading(prev => ({ ...prev, notice: false, schedule: false })); }
    };
    fetchData();
  }, [userInfo]); 

  const pendingCount = docs.filter(d => d.status === 'PENDING').length;
  const approvalRate = docs.length === 0 ? 0 : Math.round((docs.filter(d => d.status === 'APPROVED').length / docs.length) * 100);

  return (
    <div style={{ backgroundColor: '#0b0c10', minHeight: '100vh', color: 'white', fontFamily: "'Pretendard', sans-serif" }}>
      
      <Header nextSchedule={getNextScheduleText()} myApprovals={pendingCount} messages={5} currentUser={userInfo} />

      <Container fluid className="px-5 mt-4">
        <div className="text-white-50 small mb-2 ps-1 fw-bold" style={{ letterSpacing: '1px', fontSize: '1.3rem'}}>QUICK MENU</div>
        <Row className="g-4 mb-5">
          {quickMenus.map((menu, idx) => (
            <Col lg={3} md={6} key={idx}>
              <Card bg="dark" className="border-secondary h-100 shadow-sm hover-card transition-all" style={{ borderRadius: '15px', cursor: 'pointer', border: '3px solid rgba(24, 116, 202, 0.87)', overflow: 'hidden' }} onClick={() => navigate(menu.path)}>
                <Card.Body className="p-4 d-flex align-items-center justify-content-center">
                  <div className={`fs-1 me-4 text-${menu.color}`}>{menu.icon}</div>
                  <div className="text-start">
                    <h5 className="text-white mb-1" style={{ fontSize: '1.45rem', fontWeight: '800' }}>{menu.title}</h5>
                    <div className="text-white-50" style={{ fontSize: '1rem' }}>{menu.desc}</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Row className="g-4 mb-5">
          {/* 공지사항 & 커뮤니티 */}
          <Col lg={4}>
            <Card bg="dark" className="border-secondary shadow-lg h-100" style={{ borderRadius: '15px', height: '520px', border: '3px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <Card.Header className="bg-black border-bottom border-secondary fw-bold text-warning py-3 d-flex justify-content-between align-items-center fs-5">
                <span><FaBell className="me-2"/> 공지사항 & 커뮤니티</span>
                <Button variant="link" className="text-warning p-0 text-decoration-none" style={{fontSize: '0.85rem',  cursor: 'pointer'}} onClick={() => navigate('/notice')}>전체보기 <FaChevronRight size={10}/></Button>
              </Card.Header>
              <Card.Body className="p-0 overflow-y-auto custom-scrollbar" style={{ height: 'calc(520px - 60px)' }}>
                

                {/* 🚀 [스크롤 구역] 최근 게시글 리스트 타임라인 */}
                <div className="flex-fill overflow-y-auto custom-scrollbar">
                  {/* 소제목 바 (전자결재의 '최근 기안 타임라인'과 동일한 스타일) */}
                  <div className="px-3 py-2 text-warning fw-bold small border-bottom border-secondary border-opacity-10" style={{backgroundColor:'#141414', fontSize: '0.85rem'}}>
                    <FaCheckCircle className="me-1"/> 최신 업데이트순</div>
                  </div>
                  
                
                <ListGroup variant="flush">
                  {actualNotices.map((item) => (
                    <ListGroup.Item key={item.id} className="bg-transparent text-white border-secondary py-2 px-3 hover-list" onClick={() => navigate(`/notice/detail/${item.id}`)} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' ,  cursor: 'pointer'}}>
                      <div className="d-flex align-items-center gap-3">
                        <div className="flex-shrink-0" style={{ width: '85px', height: '65px', borderRadius: '8px', backgroundColor: '#11131a', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)' }}>
                          {item.coverImageUrl ? (
                            <img src={`http://ecpsystem.site:8080${item.coverImageUrl}`} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div className="d-flex align-items-center justify-content-center h-100 text-white-50"><FaImage size={20} className="opacity-25" /></div>
                          )}
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <Badge bg={item.type === '중요' ? 'danger' : item.type === '이벤트' ? 'warning' : 'success'} style={{ fontSize: '0.7rem', padding: '3px 6px' }}>{item.type === '중요' ? '필독' : item.type === '공지' ? '일반' : item.type}</Badge>
                            {(new Date() - new Date(item.createdAt)) / (1000 * 60 * 60) < 24 && <span className="text-warning fw-bold" style={{ fontSize: '0.7rem' }}>NEW</span>}
                          </div>
                          <div className="fw-bold text-white mb-1 text-truncate" style={{ fontSize: '1.02rem', lineHeight: '1.2' }}>{item.title}</div>
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="text-info fw-bold" style={{ fontSize: '0.95rem' }}>{item.writer || '관리자'}<span className="text-white-50 fw-normal ms-1" style={{fontSize: '0.85rem'}}>{item.deptName ? `(${item.deptName})` : ''}</span></div>
                            <div className="d-flex align-items-center px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                              <FaClock className="text-warning me-1" size={11} /><span className="text-white fw-bold font-monospace" style={{ fontSize: '1rem' }}>{item.createdAt?.split('T')[0] || item.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>

          {/* 전자결재 시스템 */}
          <Col lg={4}>
            <Card bg="dark" className="border-secondary shadow-sm h-100" style={{ borderRadius: '15px', height: '520px', border: '3px solid rgba(255,255,255,0.1)', overflow: 'hidden',  cursor: 'pointer' }}>
              <Card.Header className="bg-black border-bottom border-secondary fw-bold text-success py-3 d-flex justify-content-between align-items-center fs-5">
                <span><FaFileAlt className="me-2"/> 전자결재 시스템</span>
                <Button variant="link" className="text-success p-0 text-decoration-none" style={{fontSize: '0.85rem', cursor: 'pointer'}} onClick={() => navigate('/approval')}>전체보기 <FaChevronRight size={10}/></Button>
              </Card.Header>
              <Card.Body className="p-0 d-flex flex-column" style={{ height: 'calc(520px - 60px)' }}>
                <div className="p-3 border-bottom border-secondary border-opacity-25 bg-black bg-opacity-25">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="text-white fw-bold fs-5">결재 대기 현황</div>
                    <div className="display-6 fw-bold text-success" style={{ lineHeight: 1 }}>{pendingCount}<span className="fs-6 ms-1">건</span></div>
                  </div>
                  <ProgressBar variant="success" now={approvalRate} style={{ height: '8px', backgroundColor: '#000' }} />
                </div>

                <div className="flex-fill overflow-y-auto custom-scrollbar">
                  <div className="px-3 py-2 text-primary fw-bold small border-bottom border-secondary border-opacity-10" style={{backgroundColor:'#141414', fontSize: '0.85rem'}}><FaCheckCircle className="me-1"/> 최근 기안 타임라인</div>
                  <ListGroup variant="flush">
                    {docs.slice(0, 5).map((doc) => (
                      <ListGroup.Item key={doc.id} className="bg-transparent text-white border-secondary py-2 px-3 hover-list" onClick={() => navigate(`/approval/detail/${doc.id}`)} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="d-flex align-items-center gap-3">
                          <div className="flex-shrink-0 d-flex flex-column align-items-center justify-content-center" style={{ width: '85px', height: '65px', borderRadius: '8px', backgroundColor: '#11131a', border: '1px solid rgba(13, 202, 240, 0.2)' }}>
                            <FaFileAlt className="text-info mb-1" size={16}/>
                            <span className="text-info fw-bold" style={{fontSize: '0.75rem', textAlign: 'center', lineHeight: '1.2'}}>
                              {doc.type?.includes(' - ') ? doc.type.split(' - ')[1].replace(' 신청서', '') : '문서'}
                            </span>
                          </div>
                          <div className="flex-grow-1 overflow-hidden">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <Badge bg={doc.status === 'APPROVED' ? 'success' : doc.status === 'REJECTED' ? 'danger' : 'warning'} style={{ fontSize: '0.7rem', padding: '3px 6px' }}>
                                {doc.status === 'PENDING' ? '검토중' : doc.status === 'APPROVED' ? '승인' : '반려'}
                              </Badge>
                              <small className="text-white-50 font-monospace" style={{fontSize: '0.75rem'}}>{getFormattedId(doc.createdAt, doc.id, doc.type)}</small>
                            </div>
                            <div className="fw-bold text-white mb-1 text-truncate" style={{ fontSize: '1.02rem', lineHeight: '1.2' }}>{doc.title}</div>
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="text-info fw-bold" style={{ fontSize: '0.95rem' }}>
                                {doc.drafterName || '미지정'}<span className="text-white-50 fw-normal ms-1" style={{fontSize: '0.85rem'}}>({doc.deptName || '본인'})</span>
                              </div>
                              <div className="d-flex align-items-center px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <FaClock className="text-warning me-1" size={11} /><span className="text-white fw-bold font-monospace" style={{ fontSize: '1rem' }}>{doc.createdAt?.split('T')[0]}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* 사내 주요일정 */}
         <Col lg={4}>
  <Card bg="dark" className="border-secondary shadow-lg h-100" style={{ borderRadius: '15px', height: '520px', border: '3px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
    {/* ✨ 상단 메인 타이틀 (Black & Large - 통일) */}
    <Card.Header className="bg-black border-bottom border-secondary fw-bold text-info py-3 d-flex justify-content-between align-items-center">
      <span style={{ fontSize: '1.25rem' }}><FaClipboardList className="me-2"/> 사내 주요일정(달력)</span>
      <Badge bg="dark" className="border border-info text-info small tech-font">AUTO_SYNC</Badge>
    </Card.Header>

    <Card.Body className="p-0 d-flex flex-column" style={{ height: 'calc(520px - 60px)' }}>
      
        
      {/* 🚀 달력 영역 (내부 패딩 조정) */}
      <div className="flex-fill p-3 overflow-hidden">
        <div className="calendar-container" style={{ height: '100%' }}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            height="100%"
            locale="ko"
            events={schedules} 
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            headerToolbar={{ 
              left: 'prev,next', 
              center: 'title', 
              right: 'today' 
            }}
            dayCellContent={(arg) => arg.dayNumberText.replace('일', '')}
          />
        </div>
      </div>
    </Card.Body>
  </Card>
</Col>
        </Row>
      </Container>

      {/* 🌟 [수정] 모달 안에서 바로 내용 수정 가능하도록 폼 통합 적용 */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="bg-dark text-white border-secondary">
        <Modal.Header closeButton closeVariant="white" className="bg-black border-bottom border-secondary">
          <Modal.Title className="fs-5 fw-bold text-info">
            {isEditMode ? '사내 일정 상세 및 수정' : `새 일정 등록 (${newSchedule.date})`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          
          {/* 작성자 정보 (수정 모드일 때만 표시됨) */}
          {isEditMode && (
             <div className="d-flex justify-content-center mb-4">
               <div className="d-flex align-items-center text-white-50" style={{ fontSize: '0.95rem', background: 'rgba(255,255,255,0.05)', padding: '8px 15px', borderRadius: '8px' }}>
                 <FaUsers className="me-2 text-info" /> 
                 <span className="text-white fw-bold me-2">{newSchedule.deptName}</span> 
                 {newSchedule.writerName} {newSchedule.writerPosition}
               </div>
             </div>
          )}

          <Form.Group className="mb-3">
            <Form.Label className="text-white-50 small">일정명 (내용 수정 가능)</Form.Label>
            <Form.Control type="text" className="bg-black border-secondary text-white" value={newSchedule.title} onChange={(e) => setNewSchedule({...newSchedule, title: e.target.value})} autoFocus />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label className="text-white-50 small">일정 날짜</Form.Label>
            <div className="d-flex align-items-center text-white p-2 rounded" style={{ background: '#11131a', border: '1px solid rgba(255,255,255,0.1)' }}>
               <FaClock className="me-2 text-info" /> {newSchedule.date}
            </div>
          </Form.Group>

          <Form.Group>
            <Form.Label className="text-white-50 small">구분 색상</Form.Label>
            <div className="d-flex gap-2">
              {['#0dcaf0', '#ffc107', '#198754', '#dc3545'].map(c => (
                <div key={c} onClick={() => setNewSchedule({...newSchedule, color: c})} style={{ width: '30px', height: '30px', backgroundColor: c, cursor: 'pointer', borderRadius: '50%', border: newSchedule.color === c ? '2px solid white' : 'none' }} />
              ))}
            </div>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="bg-black border-top border-secondary d-flex justify-content-between">
          {isEditMode ? (
            <>
              <Button variant="outline-danger" className="fw-bold" onClick={deleteSchedule}><FaTrash className="me-1"/> 삭제</Button>
              <div>
                <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>닫기</Button>
                <Button variant="info" className="fw-bold" onClick={saveSchedule}><FaPen className="me-1"/> 수정</Button>
              </div>
            </>
          ) : (
            <>
              <div/> 
              <div>
                <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>닫기</Button>
                <Button variant="info" className="fw-bold" onClick={saveSchedule}>일정 저장</Button>
              </div>
            </>
          )}
        </Modal.Footer>
      </Modal>

      <Footer geminiRec={geminiRec} apiLoading={apiLoading}/>
      <style>{`
       .hover-card { 
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important; 
        }
        .hover-card:hover { 
          transform: translateY(-8px) !important; 
          border-color: #0dcaf0 !important; 
          background: rgba(13, 202, 240, 0.1) !important;
          box-shadow: 0 15px 35px rgba(0,0,0,0.6), 0 0 15px rgba(13, 202, 240, 0.2) !important;
        }

        .hover-list { border-left: 3px solid transparent !important; transition: 0.3s; }
        .hover-list:hover { 
          border-left: 3px solid #0dcaf0 !important; 
          background: linear-gradient(90deg, rgba(2, 24, 29, 0.49), transparent) !important; 
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .fc { 
  --fc-border-color: rgba(13, 202, 240, 0.1);
  --fc-today-bg-color: rgba(13, 202, 240, 0.05);
  background: transparent !important;
  color: #fff !important;
  font-family: 'Pretendard', sans-serif;
}

/* 2. 헤더 툴바 (월 이름 및 버튼) */
.fc .fc-toolbar-title { 
  font-family: 'Orbitron', sans-serif; 
  font-size: 2.1rem !important; 
  font-weight: 800; 
  color: #0dcaf0; 
  text-shadow: 0 0 10px rgba(13, 202, 240, 0.3);
}

.fc .fc-button-primary {
  background-color: rgba(0, 0, 0, 0.3) !important;
  border: 1px solid rgba(13, 202, 240, 0.2) !important;
  font-size: 0.75rem !important;
  text-transform: uppercase;
  transition: all 0.2s;
}

.fc .fc-button-primary:hover {
  background-color: #0dcaf0 !important;
  color: #000 !important;
  box-shadow: 0 0 10px #0dcaf0;
}

/* 3. 요일(Sun, Mon...) 및 날짜 숫자 */
.fc .fc-col-header-cell-cushion { 
  color: rgba(255, 255, 255, 0.85) !important; /* 요일 선명하게 */
  font-size: 0.95rem !important; /* 요일 크기 살짝 키움 */
  font-weight: 700;
  text-decoration: none !important;
  padding: 10px 0 !important;
}

.fc .fc-daygrid-day-number { 
  color: #ffffff !important; /* 날짜 완전 흰색으로 선명하게 */
  font-size: 1.1rem !important; /* 숫자 크기 시원하게 키움 */
  font-weight: 600; /* 숫자 두께감 추가 */
  padding: 8px 12px !important;
  text-decoration: none !important;
  cursor: pointer !important;
  opacity: 1 !important; /* 불투명도 최대 */
}

.fc .fc-day-today .fc-daygrid-day-number {
  color: #0dcaf0 !important;
  text-shadow: 0 0 8px rgba(13, 202, 240, 0.6);
  /* 폰트 크기는 위에서 설정한 1.1rem을 그대로 상속받아 시원하게 보일 겁니다 */
}
  .fc .fc-day-other .fc-daygrid-day-number {
  opacity: 0.35 !important;
}

/* 5. 이벤트(일정) 스타일 - 네온 바 형태로 변경 */
.fc-event {
  border: none !important;
  border-radius: 4px !important;
  padding: 2px 5px !important;
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
  cursor: pointer !important;
}

/* 6. 그리드 선을 더 미세하게 */
.fc-theme-standard td, .fc-theme-standard th {
  border: 1px solid rgba(255, 255, 255, 0.03) !important;
}

/* 7. 스크롤바 숨기기 (달력 내부) */
.fc-scroller::-webkit-scrollbar { width: 0px; }
        .custom-header {
  border-bottom: 1px solid rgb(0, 0, 0) !important;
  background: linear-gradient(10deg, rgb(0, 0, 0), transparent) !important;
}
  .fc .fc-toolbar-title { 
          font-family: 'Orbitron', sans-serif; 
          font-size: 2.1rem !important; 
          font-weight: 800; 
          color: #0dcaf0; 
          text-shadow: 0 0 10px rgba(13, 202, 240, 0.3);
        }

.calendar-container .fc-header-toolbar {
  margin-bottom: 10px !important;
}
      `}</style>
    </div>
  );
}

export default MainPage;