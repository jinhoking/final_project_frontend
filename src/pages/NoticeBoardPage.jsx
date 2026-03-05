import React, { useState, useEffect } from 'react'; 
import { Container, Badge, Button, Card, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { FaSearch, FaBullhorn, FaEye, FaRegCalendarCheck, FaPlus, FaImage, FaUserCircle, FaClock, FaListAlt, FaRegCommentDots } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 

import Header from '../components/main/Header'; 
import Footer from '../components/main/Footer';

const NoticeBoardPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('전체');
  const [notices, setNotices] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); 

  const [sortBy, setSortBy] = useState('latest'); 
  const [searchCriteria, setSearchCriteria] = useState('all'); 
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const initData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const meRes = await axios.get('http://ecpsystem.site:8080/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(meRes.data);

        const response = await axios.get('http://ecpsystem.site:8080/api/notices', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotices(response.data);
      } catch (err) {
        console.error("데이터 로드 실패:", err);
      }
    };
    initData();
  }, []);

  const counts = {
    all: notices.length,
    urgent: notices.filter(n => n.type === '중요').length,
    normal: notices.filter(n => n.type === '공지').length,
    event: notices.filter(n => n.type === '이벤트').length
  };

  const stats = [
    { label: '전체 게시글', count: counts.all, icon: <FaListAlt size={20} />, color: 'info', tab: '전체' },
    { label: '필독 공지', count: counts.urgent, icon: <FaBullhorn size={20} />, color: 'danger', tab: '중요' },
    { label: '일반 공지', count: counts.normal, icon: <FaBullhorn size={20} />, color: 'success', tab: '공지' },
    { label: '이벤트 소식', count: counts.event, icon: <FaRegCalendarCheck size={20} />, color: 'warning', tab: '이벤트' },
  ];

  const filteredNotices = notices
    .filter((notice) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        searchCriteria === 'all' ? (notice.title.toLowerCase().includes(term) || notice.writer.toLowerCase().includes(term)) :
        searchCriteria === 'title' ? notice.title.toLowerCase().includes(term) :
        notice.writer.toLowerCase().includes(term);

      const matchesTab = activeTab === '전체' || notice.type === activeTab;
      const matchesDate = !selectedDate || notice.date.includes(selectedDate);

      return matchesSearch && matchesTab && matchesDate;
    })
    .sort((a, b) => {
      if (sortBy === 'latest') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'views') return (Number(b.views) || 0) - (Number(a.views) || 0);
      return 0;
    });

  const categoryInfo = (() => {
    switch(activeTab) {
      case '중요': return { title: '필독 공지 및 중요 안내', color: 'text-danger', icon: <FaBullhorn/> };
      case '공지': return { title: '일반 사내 공지 사항', color: 'text-success', icon: <FaBullhorn/> };
      case '이벤트': return { title: '진행 중인 사내 이벤트', color: 'text-warning', icon: <FaRegCalendarCheck/> };
      default: return { title: '전체 게시글 현황', color: 'text-info', icon: <FaEye/> };
    }
  })();

  return (
    <div style={{ backgroundColor: '#0b0c10', minHeight: '100vh', color: '#ffffff', fontFamily: "'Pretendard', sans-serif" }}>
      <style>{`

      button, input, select, .badge { font-family: 'Pretendard', sans-serif !important; }
  /* 1. 전체 컨테이너 및 베이스 설정 */
  .notice-container { max-width: 1300px; }

  .main-board-panel {
          background: rgba(26, 28, 35, 0.4);
          border: 1px solid rgba(13, 202, 240, 0.3);
          border-radius: 30px;
          padding: 40px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          backdrop-filter: blur(10px);
        }
  
  /* 2. 상단 통계 카드 (스쿼클 디자인) */
  .stat-card { 
    background: #1a1c23; 
    border: 1px solid rgba(255,255,255,0.05) !important; 
    border-radius: 20px !important; 
    transition: all 0.3s ease; 
    cursor: pointer; 
    border-left: 6px solid transparent !important; 
  }
  .stat-card:hover { transform: translateY(-5px); box-shadow: 0 12px 30px rgba(0,0,0,0.4); }
  
  /* 통계 카드 활성화 상태 */
  .stat-card.active-info { border-left-color: #0dcaf0 !important; background: rgba(13, 202, 240, 0.03) !important; }
  .stat-card.active-danger { border-left-color: #dc3545 !important; background: rgba(220, 53, 69, 0.03) !important; }
  .stat-card.active-success { border-left-color: #198754 !important; background: rgba(25, 135, 84, 0.03) !important; }
  .stat-card.active-warning { border-left-color: #ffc107 !important; background: rgba(255, 193, 7, 0.03) !important; }

  /* 아이콘 배지 (스쿼클) */
  .summary-icon-wrapper {
    width: 48px; height: 48px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 14px;
    transition: all 0.3s ease;
  }
  .icon-bg-info { background: rgba(13, 202, 240, 0.1) !important; color: #0dcaf0 !important; border: 1px solid rgba(13, 202, 240, 0.15); }
  .icon-bg-danger { background: rgba(220, 53, 69, 0.1) !important; color: #dc3545 !important; border: 1px solid rgba(220, 53, 69, 0.15); }
  .icon-bg-success { background: rgba(25, 135, 84, 0.1) !important; color: #198754 !important; border: 1px solid rgba(25, 135, 84, 0.15); }
  .icon-bg-warning { background: rgba(255, 193, 7, 0.1) !important; color: #ffc107 !important; border: 1px solid rgba(255, 193, 7, 0.15); }

  /* 3. 검색 필터 영역 (폰트 및 높이 일관성 핵심) */
  .filter-sm, 
  .search-input-field, 
  .dark-date-picker { 
    background-color: #1a1c23 !important; 
    border: 1px solid rgba(255, 255, 255, 0.2) !important; 
    color: #adb5bd !important; 
    border-radius: 8px; 
    font-size: 0.85rem !important; /* 🌟 폰트 크기 일치 */
    height: 38px; 
    cursor: pointer; 
  }

  .search-input-group { 
    height: 38px; 
    border-radius: 8px; 
    overflow: hidden; 
    border: 1px solid rgba(255, 255, 255, 0.2); 
    background-color: #1a1c23; 
  }

  /* 검색창 플레이스홀더 (시인성 강화) */
  .search-input-field { background: transparent !important; border: none !important; color: #fff !important; box-shadow: none !important; }
  .search-input-field::placeholder { 
    color: #adb5bd !important; /* 🌟 밝은 회색 고정 */
    opacity: 1 !important; 
    font-weight: 400;
  }

  /* 4. 갤러리 카드 및 뱃지 */
  .gallery-card { background: #1a1c23; border: 1px solid rgba(13, 202, 240, 0.05); border-radius: 20px; overflow: hidden; transition: all 0.3s ease; cursor: pointer; height: 100%; border-left: 5px solid transparent; }
  .gallery-card:hover { transform: translateY(-8px); border-color: #0dcaf0; border-left-color: #0dcaf0 !important; }
  
  .thumbnail-area { height: 180px; background: linear-gradient(135deg, #11131a 0%, #0b0c10 100%); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }

  /* 카테고리 뱃지 (폰트 크기 필터와 일치) */
  .category-badge { 
    position: absolute; 
    top: 12px; 
    left: 12px; 
    z-index: 5; 
    font-weight: 600 !important; 
    font-size: 0.85rem !important; /* 🌟 필터 폰트와 밸런스 조정 */
    padding: 6px 12px !important;
    border-radius: 8px !important;
  }
`}</style>

      <Header quote="함께 나누는 정보가 팀의 자산이 됩니다." currentUser={currentUser} />

      <Container className="py-5 notice-container">
        <div className="d-flex justify-content-between align-items-end mb-5 border-bottom border-secondary border-opacity-50 pb-4">
          <div>
            <Badge bg="info" text="dark" className="mb-2 px-3 fw-bold rounded-pill" style={{ fontSize: '0.85rem' }}>BOARD DASHBOARD</Badge>
            <h1 className="fw-bold mb-0 text-white">공지사항 <span className="text-info">&</span> 커뮤니티</h1>
          </div>
          <Button variant="info" className="fw-bold px-4 py-2 text-dark shadow-sm rounded-pill" onClick={() => navigate('/notice/write')}>
            <FaPlus className="me-2" /> 새 글 작성
          </Button>
        </div>

        {/* 🌟 반투명 패널 영역 시작 */}
        <div className="main-board-panel">
          <Row className="mb-5 g-4">
            {stats.map((stat, idx) => (
              <Col md={3} key={idx} onClick={() => setActiveTab(stat.tab)}>
                <Card className={`stat-card p-4 h-100 ${activeTab === stat.tab ? `active-${stat.color} shadow-lg` : ''}`}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-white-50 small fw-bold mb-2"style={{ fontSize: '0.9rem' }}>{stat.label}</div>
                      <h2 className={`fw-bold text-${stat.color} mb-0`}>{stat.count}<span className="fs-6 text-white-50 ms-1">건</span></h2>
                    </div>
                    <div className={`summary-icon-wrapper icon-bg-${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom border-secondary border-opacity-25 flex-wrap gap-3">
            <div className="d-flex align-items-center">
              <span className={`${categoryInfo.color} me-3 fs-4`}>{categoryInfo.icon}</span>
              <h4 className="text-white fw-bold mb-0">
                {categoryInfo.title}
                <Badge bg="dark" className="border border-secondary text-info ms-3 rounded-pill px-3 py-2 align-middle font-monospace" style={{ fontSize: '0.85rem' }}>
  총 {filteredNotices.length}건
</Badge>
              </h4>
            </div>

            <div className="d-flex align-items-center gap-2">
              <Form.Select className="filter-sm" style={{ width: '90px' }} value={searchCriteria} onChange={(e) => setSearchCriteria(e.target.value)}>
                <option value="all">전체</option>
                <option value="title">제목</option>
                <option value="writer">작성자</option>
              </Form.Select>
              <InputGroup className="search-input-group" style={{ maxWidth: '280px' }}>
                <InputGroup.Text className="bg-transparent border-0 text-info ps-3 pe-2"><FaSearch size={14} /></InputGroup.Text>
                <Form.Control placeholder="검색어 입력..." className="search-input-field" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </InputGroup>
              <Form.Select className="filter-sm" style={{ width: '100px' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="latest">최신순</option>
                <option value="views">조회순</option>
              </Form.Select>
              <Form.Control type="date" className="dark-date-picker" style={{ width: '135px' }} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
          </div>

          <Row className="g-4">
            {filteredNotices.length > 0 ? (
              filteredNotices.map((notice) => (
                <Col lg={4} md={6} sm={12} key={notice.id}>
                  <Card className="gallery-card" onClick={() => navigate(`/notice/detail/${notice.id}`)}>
                    <div className="thumbnail-area">
                      <Badge 
                        bg={notice.type === '중요' ? 'danger' : notice.type === '이벤트' ? 'warning' : 'success'} 
                        className="category-badge px-3 py-2 rounded-pill shadow-sm"
                      >
                        {notice.type === '중요' && <><FaBullhorn className="me-1"/> 필독 공지</>}
                        {notice.type === '공지' && <><FaBullhorn className="me-1"/> 일반 공지</>}
                        {notice.type === '이벤트' && <><FaRegCalendarCheck className="me-1"/> 이벤트 공지</>}
                        {!['중요', '공지', '이벤트'].includes(notice.type) && notice.type}
                      </Badge>
                      {notice.coverImageUrl ? (
                        <img src={`http://ecpsystem.site:8080${notice.coverImageUrl}`} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <FaImage size={60} className="text-secondary opacity-25" />
                      )}
                    </div>
                    <Card.Body className="p-4 d-flex flex-column">
                      <div className="text-info font-monospace small mb-2 d-flex align-items-center">
                        <FaClock className="me-1"/> {notice.date}
                      </div>
                      <Card.Title className="fw-bold text-white mb-3 flex-grow-1" style={{ fontSize: '1.15rem', lineHeight: '1.4' }}>
                        {notice.title}
                      </Card.Title>
                      <hr className="border-secondary opacity-25 my-3" />
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <FaUserCircle className="text-secondary me-2" size={24} />
                          <span className="text-white-50 small fw-medium">{notice.writer} ({notice.deptName})</span>
                        </div>
                        <div className="text-white-50 small d-flex align-items-center gap-3">
                          <div className="d-flex align-items-center">
                            <FaRegCommentDots className="me-1 opacity-75" /> 
                            {notice.comments ? notice.comments.length : (notice.commentsCount || 0)}
                          </div>
                          <div className="d-flex align-items-center">
                            <FaEye className="me-1 opacity-75" /> {notice.views}
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <Col xs={12}>
                <div className="text-center py-5 my-5 bg-dark bg-opacity-50 rounded-4 border border-secondary border-opacity-25">
                  <FaSearch size={50} className="text-secondary opacity-25 mb-3" />
                  <h5 className="text-white-50">검색된 게시글이 없습니다.</h5>
                </div>
              </Col>
            )}
          </Row>
        </div>
        {/* 🌟 반투명 패널 영역 끝 */}
      </Container>
      <Footer />
    </div>
  );
};

export default NoticeBoardPage;