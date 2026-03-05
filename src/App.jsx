import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap'; 
import 'bootstrap/dist/css/bootstrap.min.css';
// 🚀 [추가] 모바일 햄버거 메뉴 아이콘(FaBars) 추가
import { FaCube, FaSignOutAlt, FaChevronRight, FaBars } from 'react-icons/fa';

// 페이지 컴포넌트 임포트
import LoginPage from './pages/LoginPage';
import JoinPage from './pages/JoinPage';
import MainPage from './pages/MainPage'; 
import DevStatusPage from './pages/DevStatusPage';
import HRDashboardPage from './pages/HRDashboardPage';
import AssetDashboardPage from './pages/AssetDashboardPage';
import SecurityDashboardPage from './pages/SecurityDashboardPage';
import NoticeBoardPage from './pages/NoticeBoardPage';
import NoticeDetailPage from './components/notice/NoticeDetailPage';
import NoticeWritePage from './components/notice/NoticeWritePage';
import ApprovalPage from './pages/ApprovalPage';
import ApprovalWritePage from './components/approval/ApprovalWritePage';
import ApprovalDetailPage from './components/approval/ApprovalDetailPage';
import FindPasswordPage from './pages/FindPasswordPage';
import IntroPage from './pages/IntroPage';

function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [showTeamMenu, setShowTeamMenu] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) { setUserInfo(null); return; }
    try {
      const res = await axios.get('http://ecpsystem.site:8080/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserInfo(res.data);
    } catch (e) { handleLogout(); }
  };

  useEffect(() => { fetchUser(); }, []);

  // 🚀 [추가] 스크롤 감지 로직 (아래로 내리면 숨기고, 올리면 나타남)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 70) {
        setShowNav(false); 
      } else {
        setShowNav(true);  
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserInfo(null);
    window.location.href = "/";
  };

  const handleProtectedNav = (e) => {
    if (!userInfo) {
      e.preventDefault(); // 클릭해도 페이지가 안 넘어가게 완벽 차단!
      alert("로그인 후 이용할 수 있는 메뉴입니다! 🔒");
    }
  };

  return (
    <BrowserRouter>
      {/* 🎨 캡처 이미지 지시선 완벽 반영 & 고가시성 스타일 */}
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap');
        
        body { 
          font-family: 'Pretendard', sans-serif; 
          background-color: #1a1c2e !important; 
          color: #fff;
          letter-spacing: -0.03em;
        }

        .premium-navbar {
          background: rgba(20, 20, 20, 0.56) !important; 
          backdrop-filter: blur(25px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
          padding: 0 40px !important; 
          height: 70px; /* 기존 설정 유지 */
          display: flex;
          align-items: center;
          z-index: 2000 !important; 
          /* 🚀 [추가] 숨김/나타남 애니메이션 */
          transition: top 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* 🚀 [추가] 네비바 숨김/표시 상태 클래스 */
        .nav-hidden { top: -80px !important; }
        .nav-visible { top: 0 !important; }

        .navbar-brand {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 2rem !important;
          font-weight: 700 !important;
          margin-right: 40px !important;
          letter-spacing: 1px;
        }

        /* 🚀 일반 네비 링크 스타일 */
        .nav-link-custom {
          font-size: 1.25rem !important;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.85) !important;
          margin: 0 18px;
          display: flex;
          align-items: center;
          text-decoration: none;
          transition: 0.2s ease;
          cursor: pointer;
        }
        .nav-link-custom:hover { color: #0dcaf0 !important; }

        .btn-team-trigger {
          border: 3px solid rgba(255, 255, 255, 0.15) !important;
          border-radius: 12px;
          padding: 8px 20px !important;
          background: rgba(17, 19, 26, 0.8) !important; /* 다크 테마 배경 */
          color: rgba(255, 255, 255, 0.85) !important;
          font-family: 'Space Grotesk', sans-serif;
          margin-left: 10px;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        /* ✨ 마우스 오버 시: 파란색 네온 빛 발사 */
        .btn-team-trigger:hover {
          border: 3px solid #0dcaf0 !important;
          border-color: #0dcaf0 !important;
          background: rgba(13, 202, 240, 0.1) !important;
          box-shadow: 0 0 15px rgba(13, 202, 240, 0.4);
          color: #0dcaf0 !important;
        }

        /* 🚀 [캡처 지시선 반영] 오른쪽으로 쫙 나열되는 인라인 메뉴 */
        .inline-team-menu {
          display: flex;
          align-items: center;
          gap: 25px;
          margin-left: 25px;
          padding-left: 25px;
          border-left: 2px solid rgba(13, 202, 240, 0.3);
          animation: expandRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes expandRight {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        /* ⚪ 나열되는 메뉴의 흰색 폰트 (가독성 극대화) */
        .sub-menu-item {
          font-size: 1.15rem !important;
          font-weight: 700;
          color: #ffffff !important;
          text-decoration: none;
          white-space: nowrap;
          transition: 0.2s;
        }
        .sub-menu-item:hover { 
          color: #0dcaf0 !important; 
          transform: translateY(-2px);
        }

        /* 사용자 프로필 섹션 */
        .user-section-pill {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 8px 25px;
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .btn-auth-premium {
          background: linear-gradient(135deg, #0dcaf0, #007bff);
          border: none;
          padding: 10px 30px;
          font-weight: 700;
          border-radius: 50px;
          color: white;
        }

        /* 🚀 [추가] 창이 작아졌을 때 햄버거 메뉴 및 리사이징 스타일 */
        @media (max-width: 1199px) {
          .premium-navbar { 
            height: auto !important; /* 메뉴가 열릴 수 있도록 자동 높이 */
            padding-top: 15px !important;
            padding-bottom: 15px !important;
          }
          .nav-link-custom { margin: 10px 0; }
          .inline-team-menu {
            margin: 15px 0 0 0; padding: 15px 0 0 0;
            border-left: none; border-top: 1px solid rgba(13, 202, 240, 0.2);
            flex-direction: column; align-items: flex-start; gap: 15px;
          }
          .user-section-pill { margin-top: 20px; width: 100%; justify-content: space-between; }
        }
      `}</style>

      <div style={{ backgroundColor: '#1a1c2e', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
        
        {/* 🚀 [변경] sticky-top을 fixed-top으로 바꾸고 showNav 상태 연결 */}
        <Navbar expand="xl" className={`premium-navbar sticky-top ${showNav ? 'nav-visible' : 'nav-hidden'}`}>
          <Container fluid className="px-0 d-flex align-items-center"> 
            <Navbar.Brand as={Link} to={userInfo ? "/" : "/intro"} className="text-white m-0">
              <FaCube className="text-info me-3" size={35} />
              <span>ECP <span className="text-info">SYSTEM</span></span>
            </Navbar.Brand>
            
            {/* 🚀 [추가] 모바일 햄버거 메뉴 토글 버튼 */}
            <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none">
              <FaBars color="#0dcaf0" size={28} />
            </Navbar.Toggle>
            
            <Navbar.Collapse id="basic-navbar-nav" className="w-100 mt-3 mt-xl-0">
              <Nav className="d-flex align-items-xl-center flex-column flex-xl-row me-auto ms-xl-4">
                <Link to="/" className="nav-link-custom" onClick={handleProtectedNav}>전체 대시보드</Link>
                <Link to="/notice" className="nav-link-custom" onClick={handleProtectedNav}>공지사항</Link>
                <Link to="/approval" className="nav-link-custom" onClick={handleProtectedNav}>전자결재</Link>
                
                {/* 🔽 [캡처 반영] 클릭 시 오른쪽으로 펼쳐지는 'TEAM STATUS' 버튼 */}
                <div 
                  className="nav-link-custom btn-team-trigger" 
                  onClick={() => setShowTeamMenu(!showTeamMenu)}
                  style={{ width: 'fit-content'}}
                >
                  팀별 현황 
                  <FaChevronRight style={{
                    marginLeft: '8px',      /* 여백 살짝 줄임 */
                    fontSize: '1rem',       /* 버튼 폰트 크기에 딱 맞춤 */
                    transition: 'transform 0.3s ease', 
                    transform: showTeamMenu ? 'rotate(0deg)' : 'rotate(180deg)'
                  }}/>
                </div>

                {/* 🚀 [캡처 지시선 반영] 버튼 옆 공간에 나열되는 서브 메뉴 */}
                {showTeamMenu && (
                  <div className="inline-team-menu">
                    <Link to="/hr" className="sub-menu-item" onClick={handleProtectedNav}>👥 HR</Link>
                    <Link to="/asset" className="sub-menu-item" onClick={handleProtectedNav}>💼 ASSETS</Link>
                    <Link to="/dev" className="sub-menu-item" onClick={handleProtectedNav}>💻 DEV</Link>
                    <Link to="/security" className="sub-menu-item" onClick={handleProtectedNav}>🛡️ SECURITY</Link>
                  </div>
                )}
              </Nav>
              
              <Nav className="align-items-xl-center flex-column flex-xl-row mt-3 mt-xl-0">
                {userInfo ? (
                  <div className="user-section-pill">
                    <Badge 
                      bg={userInfo.role === 'ROLE_ADMIN' ? 'danger' : userInfo.role === 'ROLE_MANAGER' ? 'warning' : 'info'} 
                      className="text-dark fw-bold px-3 py-2" 
                      style={{ fontSize: '0.85rem' }}
                    >
                      {userInfo.role === 'ROLE_ADMIN' ? 'ADMIN' : userInfo.role === 'ROLE_MANAGER' ? 'MANAGER' : 'MEMBER'}
                    </Badge>
                    
                    <div className="d-flex flex-column align-items-end pe-3" style={{ borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                      <span className="text-white-50 fw-bold mb-1" style={{ fontSize: '0.85rem' }}>{userInfo.deptName} · {userInfo.position}</span>
                      <span className="fw-bold text-info fs-5" style={{ lineHeight: '1' }}>{userInfo.name}님</span>
                    </div>

                    <Button variant="link" onClick={handleLogout} className="p-0 text-danger opacity-75 hover-opacity-100 transition-all">
                      <FaSignOutAlt size={26} />
                    </Button>
                  </div>
                ) : (
                  <div className="d-flex gap-4">
                    <Link to="/login" className="text-white text-decoration-none fs-5 fw-bold px-2" style={{padding :"9px"}}>로그인</Link>
                    <Link to="/join" className="btn-auth-premium text-decoration-none shadow-lg" style={{fontSize:"19px"}}>사원 등록</Link>
                  </div>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {/* 메인 콘텐츠 라우팅 영역 */}
        {/* 🚀 [변경] 네비바가 위로 뜨는 fixed-top이 되었으므로 콘텐츠가 가려지지 않게 paddingTop 추가 */}
        <div className="container-fluid p-0">
          <Routes>
            <Route path="/intro" element={<IntroPage onLoginSuccess={fetchUser} />}/>
            <Route path="/" element={<MainPage userInfo={userInfo} />} />
            <Route path="/login" element={<LoginPage onLoginSuccess={fetchUser} />} />
            <Route path="/join" element={<JoinPage />} />
            <Route path="/find-password" element={<FindPasswordPage />} />
            <Route path="/dev" element={<DevStatusPage />} />
            <Route path="/hr" element={<HRDashboardPage userInfo={userInfo} />} />
            <Route path="/asset" element={<AssetDashboardPage/>}/>
            <Route path="/security" element={<SecurityDashboardPage/>}/>
            <Route path="/notice" element={<NoticeBoardPage/>}/>
            <Route path="/notice/write" element={<NoticeWritePage />} />
            <Route path="/notice/detail/:id" element={<NoticeDetailPage />} />
            <Route path="/notice/edit/:id" element={<NoticeWritePage />} />
            <Route path="/approval" element={<ApprovalPage/>} />
            <Route path='/approval/write' element={<ApprovalWritePage/>} />
            <Route path='/approval/detail/:id' element={<ApprovalDetailPage/>} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;