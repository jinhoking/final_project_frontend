import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import { FaFileSignature, FaSearch, FaClock, FaCheckCircle, FaTimesCircle, FaInbox, FaUserTie, FaCalendarAlt, FaFilter, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/main/Header';
import Footer from '../components/main/Footer';

const ApprovalPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState(""); 
  const [searchDate, setSearchDate] = useState(""); 
  const [searchCriteria, setSearchCriteria] = useState("all"); 
  const [sortBy, setSortBy] = useState('latest'); 
  const [docs, setDocs] = useState([]);
  const [me, setMe] = useState(null);

  const typeCodes = { 
    '인사 - 휴가 신청서': '01', '보안 - 시설 출입 신청': '02', '보안 - 보안 사고 보고': '03', 
    '개발 - 서버 및 인프라 요청': '04', '지원 - 지출 결의서': '05', '지원 - 비품 신청서': '06', 
    '기획 - 업무 품의서': '07', '업무 - 주간/정기 보고': '08'
  };

  const getFormattedId = (createdAt, dbId, typeName) => {
    const date = createdAt ? new Date(createdAt) : new Date();
    const year = date.getFullYear();
    const mmdd = `${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const typeId = typeCodes[typeName] || '00';
    const seq = String(dbId).padStart(2, '0');
    return `DOC-${year}-${mmdd}-${typeId}-${seq}`;
  };

  useEffect(() => {
    const initData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const meRes = await axios.get('http://ecpsystem.site:8080/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMe(meRes.data);

        const res = await axios.get('http://ecpsystem.site:8080/api/documents', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (Array.isArray(res.data)) {
          setDocs(res.data);
        }
      } catch (e) {
        console.error("데이터 로딩 실패:", e);
      }
    };
    initData();
  }, []);

  const stats = {
    waiting: docs.filter(d => d.status === 'PENDING').length,
    completed: docs.filter(d => d.status === 'APPROVED').length,
    rejected: docs.filter(d => d.status === 'REJECTED').length,
    all: docs.length
  };

  const filteredDocs = docs.filter(doc => {
    let tabMatch = true;
    if (activeTab === 'waiting') tabMatch = doc.status === 'PENDING';
    if (activeTab === 'completed') tabMatch = doc.status === 'APPROVED';
    if (activeTab === 'rejected') tabMatch = doc.status === 'REJECTED';
    
    const term = searchTerm.toLowerCase();
    const searchMatch = 
      searchCriteria === 'all' ? (doc.title.toLowerCase().includes(term) || doc.drafterName.toLowerCase().includes(term)) :
      searchCriteria === 'type' ? doc.type.toLowerCase().includes(term) :
      doc.drafterName.toLowerCase().includes(term);

    const dateMatch = !searchDate || (doc.createdAt || "").includes(searchDate);

    return tabMatch && searchMatch && dateMatch;
  }).sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'priority') {
      const priorityOrder = { '긴급': 1, '보통': 2 };
      return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
    }
    return 0;
  });

  const getCategoryInfo = () => {
    switch(activeTab) {
      case 'waiting': return { title: '결재 진행중인 문서', color: 'text-warning', icon: <FaClock/> };
      case 'completed': return { title: '최종 승인완료 문서', color: 'text-success', icon: <FaCheckCircle/> };
      case 'rejected': return { title: '반려/취소 문서', color: 'text-danger', icon: <FaTimesCircle/> };
      default: return { title: '전체 등록 문서', color: 'text-info', icon: <FaInbox/> };
    }
  };
  const categoryInfo = getCategoryInfo();

  return (
    <div style={{ backgroundColor: '#0b0c10', minHeight: '100vh', color: '#f4f4f5ff', display: 'flex', flexDirection: 'column', fontFamily: "'Pretendard', sans-serif" }}>
      <style>{`
        /* 1. 전체 폰트 및 뱃지 스타일 통일 */
        button, input, select, .badge { font-family: 'Pretendard', sans-serif !important; }

        /* 🌟 메인 보드 패널 CSS 추가 */
        .main-board-panel {
          background: rgba(26, 28, 35, 0.3);
          border: 1px solid rgba(13, 202, 240, 0.3);
          border-radius: 30px;
          padding: 40px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          backdrop-filter: blur(10px);
        }

        .stat-card { background: #1a1c23; border: 1px solid rgba(255,255,255,0.05) !important; border-radius: 20px !important; transition: all 0.3s ease; cursor: pointer; border-left: 6px solid transparent !important;}
        .stat-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
        .stat-card-all.active { border-left-color: #0dcaf0 !important; background: rgba(13, 202, 240, 0.03) !important; }
        .stat-card-waiting.active { border-left-color: #ffc107 !important; background: rgba(255, 193, 7, 0.03) !important; }
        .stat-card-completed.active { border-left-color: #198754 !important; background: rgba(25, 135, 84, 0.03) !important; }
        .stat-card-rejected.active { border-left-color: #dc3545 !important; background: rgba(220, 53, 69, 0.03) !important; }

        .summary-icon-wrapper { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 14px; transition: all 0.3s ease; }
        .icon-bg-info { background: rgba(13, 202, 240, 0.1) !important; color: #0dcaf0 !important; border: 1px solid rgba(13, 202, 240, 0.15); }
        .icon-bg-warning { background: rgba(255, 193, 7, 0.1) !important; color: #ffc107 !important; border: 1px solid rgba(255, 193, 7, 0.15); }
        .icon-bg-success { background: rgba(25, 135, 84, 0.1) !important; color: #198754 !important; border: 1px solid rgba(25, 135, 84, 0.15); }
        .icon-bg-danger { background: rgba(220, 53, 69, 0.1) !important; color: #dc3545 !important; border: 1px solid rgba(220, 53, 69, 0.15); }

        /* 2. 필터 폰트 사이즈 및 플레이스홀더 수정 */
        .filter-sm, .dark-date-picker { font-size: 0.85rem !important; background-color: #1a1c23 !important; border: 1px solid rgba(255, 255, 255, 0.2) !important; color: #adb5bd !important; border-radius: 8px; height: 38px; cursor: pointer; }
        .search-input-field { font-size: 0.85rem !important; background-color: transparent !important; border: none !important; color: #adb5bd !important; height: 100%; box-shadow: none !important; }
        .search-input-field:focus { background-color: transparent !important; border: none !important; color: #fff !important; box-shadow: none !important; }
        .search-input-field::placeholder { color: #adb5bd !important; opacity: 1 !important; }
        
        .search-input-group { height: 38px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.2); background-color: #1a1c23; }
        
        /* 3. 리스트 결재 상태 뱃지 디자인 보정 */
        .status-badge { 
          width: 80px; text-align: center; padding: 7px 0 !important; 
          border-radius: 8px !important; font-weight: 600 !important; 
          font-size: 0.82rem !important; letter-spacing: 0 !important; 
        }

        .modern-doc-card { background-color: #1a1c23; border: 1px solid rgba(255,255,255,0.03); border-radius: 16px; transition: all 0.2s ease; cursor: pointer; position: relative; overflow: hidden; }
        .modern-doc-card:hover { background-color: rgba(13, 202, 240, 0.03); transform: translateX(5px); border-color: rgba(13, 202, 240, 0.2); }
      `}</style>

      <Header quote="사내 모든 결재 현황 리스트입니다." currentUser={me} />
      
      <Container className="py-5 flex-grow-1">
        <div className="d-flex justify-content-between align-items-end mb-5 border-bottom border-secondary border-opacity-50 pb-4">
          <div>
            <Badge bg="info" text="dark" className="mb-2 px-3 fw-bold rounded-pill" style={{ fontSize: '0.85rem' }}>APPROVAL DASHBOARD</Badge>
            <h1 className="fw-bold text-white mb-0" style={{ letterSpacing: '-1.5px', fontSize: '2.6rem' }}>
              전자결재 <span className="text-info">시스템</span> 
            </h1>
          </div>
          <Button variant="info" className="fw-bold px-4 py-2 text-dark shadow-sm rounded-pill d-flex align-items-center" style={{ fontSize: '0.95rem' }} onClick={() => navigate('/approval/write')}>
            <FaPlus className="me-2"/> 새 결재 기안 작성
          </Button>
        </div>
        
        {/* 🌟 반투명 패널 영역 시작 */}
        <div className="main-board-panel">
          <Row className="g-4 mb-5">
            {[{k:'all', l:'전체 등록 문서', c:stats.all, color:'info', i:<FaInbox size={20}/>},
              {k:'waiting', l:'결재 진행중', c:stats.waiting, color:'warning', i:<FaClock size={20}/>},
              {k:'completed', l:'최종 승인완료', c:stats.completed, color:'success', i:<FaCheckCircle size={20}/>},
              {k:'rejected', l:'반려/취소 문서', c:stats.rejected, color:'danger', i:<FaTimesCircle size={20}/>}
            ].map((s) => (
              <Col md={3} key={s.k} onClick={() => setActiveTab(s.k)}>
                <Card className={`stat-card stat-card-${s.k} p-4 h-100 ${activeTab === s.k ? 'active shadow-lg' : ''}`}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-white-50 small fw-bold mb-2" style={{ fontSize: '0.9rem' }}>{s.l}</div>
                      <h2 className={`fw-bold text-${s.color} mb-0`}>{s.c}<span className="fs-6 text-white-50 ms-1">건</span></h2>
                    </div>
                    <div className={`summary-icon-wrapper icon-bg-${s.color}`}>{s.i}</div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary border-opacity-25 flex-wrap gap-3">
            <div className="d-flex align-items-center">
              <span className={`${categoryInfo.color} me-3 fs-4`}>{categoryInfo.icon}</span>
              <h4 className="text-white fw-bold mb-0">
                {categoryInfo.title}
               <Badge bg="dark" className="border border-secondary text-info ms-3 rounded-pill px-3 py-2 align-middle font-monospace" style={{ fontSize: '0.85rem' }}>
  총 {filteredDocs.length}&nbsp;건
</Badge>
              </h4>
            </div>
            
            <div className="d-flex align-items-center gap-2">
              <Form.Select className="filter-sm shadow-sm flex-shrink-0" style={{ width: '110px' }} value={searchCriteria} onChange={(e) => setSearchCriteria(e.target.value)}>
                <option value="all">전체</option>
                <option value="type">기안 양식</option>
                <option value="writer">기안자</option>
              </Form.Select>

              <InputGroup className="search-input-group" style={{ maxWidth: '280px' }}>
                <InputGroup.Text className="bg-transparent border-0 text-info ps-3 pe-2"><FaSearch size={14} /></InputGroup.Text>
                <Form.Control placeholder="문서나 기안자 검색..." className="search-input-field" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </InputGroup>

              <Form.Select className="filter-sm shadow-sm flex-shrink-0" style={{ width: '100px' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="latest">최신순</option>
                <option value="priority">우선순위</option>
              </Form.Select>

              <Form.Control type="date" className="dark-date-picker shadow-sm flex-shrink-0 px-2" style={{ width: '150px' }} value={searchDate} onChange={(e) => setSearchDate(e.target.value)} />
            </div>
          </div>

          <div className="d-flex flex-column gap-3">
            {filteredDocs.length > 0 ? filteredDocs.map((doc) => (
              <div key={doc.id} className="modern-doc-card p-4 shadow-sm" onClick={() => navigate(`/approval/detail/${doc.id}`)}>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                  <div className="d-flex align-items-center gap-4 flex-grow-1">
                    <div className="d-none d-md-block">
                        <Badge bg={doc.status === 'PENDING' ? 'warning' : doc.status === 'APPROVED' ? 'success' : 'danger'} text={doc.status === 'PENDING' ? 'dark' : 'white'} className="status-badge shadow-sm">
                          {doc.status === 'PENDING' ? '진행중' : doc.status === 'APPROVED' ? '승인' : '반려'}
                        </Badge>
                    </div>
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        {doc.priority === '긴급' && <Badge bg="danger" className="rounded-pill" style={{ fontSize: '0.75rem' }}>긴급</Badge>}
                        <Badge bg="dark" className="border border-secondary text-info fw-normal" style={{ fontSize: '0.75rem' }}>{doc.type?.split(' - ')[1] || doc.type}</Badge>
                        <span className="text-white-50 small font-monospace" style={{ fontSize: '0.8rem' }}>{getFormattedId(doc.createdAt, doc.id, doc.type)}</span>
                      </div>
                      <h5 className="text-white fw-bold mb-0 text-truncate" style={{ maxWidth: '600px', fontSize: '1.05rem' }}>{doc.title}</h5>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-4 text-end">
                    <div className="d-flex align-items-center text-white-50">
                      <div className="bg-black bg-opacity-50 p-2 rounded-circle me-2 d-flex align-items-center justify-content-center border border-secondary border-opacity-50" style={{ width: '38px', height: '38px' }}>
                        <FaUserTie className="text-info opacity-75"/>
                      </div>
                      <div className="text-start">
                        <div className="small fw-bold text-white">{doc.drafterName}</div>
                        <div className="small" style={{ fontSize: '0.75rem' }}>기안자</div>
                      </div>
                    </div>
                    <div className="text-start border-start border-secondary border-opacity-25 ps-4">
                      <div className="text-white-50 small mb-1 d-flex align-items-center" style={{ fontSize: '0.75rem' }}><FaCalendarAlt className="me-2"/>기안일</div>
                      <div className="text-white fw-medium font-monospace" style={{ fontSize: '0.9rem' }}>{doc.createdAt?.split('T')[0]}</div>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-5 my-5 bg-dark bg-opacity-25 rounded-4 border border-secondary border-opacity-10">
                <FaFilter className="text-secondary opacity-25 mb-4" size={50}/>
                <h5 className="text-white-50">해당 조건에 맞는 결재 문서가 없습니다.</h5>
              </div>
            )}
          </div>
        </div>
        {/* 🌟 반투명 패널 영역 끝 */}
      </Container>
      <Footer />
    </div>
  );
};

export default ApprovalPage;