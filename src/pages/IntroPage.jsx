import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Form, Alert } from 'react-bootstrap';
import { FaCube } from 'react-icons/fa'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dailyIntelImg from '../assets/images/QIOC40Xt.png';
import AOS from 'aos';
import 'aos/dist/aos.css';

// 🚀 App.jsx에서 onLoginSuccess 프롭스를 받아옵니다.
const IntroPage = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  
  // 🚀 로그인 상태 관리 추가
  const [loginData, setLoginData] = useState({ loginId: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    AOS.init({ duration: 1000, once: false });
  }, []);

  const images = {
    hero: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070",
    header: dailyIntelImg, 
    approval: "https://images.unsplash.com/photo-1554774853-d50f9c681ae2?auto=format&fit=crop&q=80&w=2070",
    hr: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070",
    mgmt: "https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=2070",
    dev: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070",
    integrity: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2070",
    social: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2070"
  };

  // 🚀 진짜 로그인 처리 함수
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://ecpsystem.site:8080/api/users/login', loginData);
      const token = res.data; 
      if (token) {
        localStorage.setItem('token', token); 
        await onLoginSuccess(); // 로그인 성공 시 유저 정보 다시 불러오기
        navigate('/'); // 메인 대시보드로 이동
      }
    } catch (e) {
      setError('아이디 또는 비밀번호를 확인해주세요.');
    }
  };

  return (
    <div style={{ backgroundColor: '#0b0c10', color: '#fff', overflowX: 'hidden', fontFamily: "'Pretendard', sans-serif" }}>
      <style>{`
        section { min-height: 100vh; display: flex; align-items: center; padding: 100px 0; position: relative; }
        .ecp-logo { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 2rem; }
        .logo-icon { font-size: 2.2rem; color: #0dcaf0; filter: drop-shadow(0 0 15px rgba(13, 202, 240, 0.6)); }
        .logo-text { font-size: 2rem; font-weight: 900; letter-spacing: 2px; color: #fff; }
        .logo-sub { font-weight: 300; opacity: 0.7; margin-left: 5px; color: #0dcaf0; }
        .step-indicator { font-size: 4rem; font-weight: 900; line-height: 1; margin-bottom: 10px; display: block; color: transparent; -webkit-text-stroke: 1px rgba(13, 202, 240, 0.5); letter-spacing: -2px; }
        .display-title { font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 800; line-height: 1.2; margin-bottom: 25px; letter-spacing: -1.5px; color: #ffffff; }

        .premium-auth-card {
          background: rgba(16, 18, 27, 0.75); backdrop-filter: blur(20px);
          border: 1px solid rgba(13, 202, 240, 0.3); border-radius: 24px;
          padding: 50px 40px; box-shadow: 0 30px 60px rgba(0,0,0,0.8), inset 0 0 30px rgba(13, 202, 240, 0.05);
          position: relative;
        }
        .premium-auth-card::before {
          content: ''; position: absolute; top: -2px; left: 50%; transform: translateX(-50%);
          width: 50%; height: 4px; background: #0dcaf0; border-radius: 10px; box-shadow: 0 0 20px #0dcaf0;
        }

        .custom-input {
          background-color: rgba(255, 255, 255, 0.05) !important; color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important; border-radius: 12px !important;
          padding: 16px 20px !important; font-size: 1.1rem !important; font-weight: 500 !important;
        }
        .custom-input:focus { border-color: #0dcaf0 !important; background-color: rgba(13, 202, 240, 0.05) !important; box-shadow: 0 0 0 4px rgba(13, 202, 240, 0.1) !important; }
        .custom-input::placeholder { color: rgba(255, 255, 255, 0.4) !important; font-weight: 400; }

        .btn-premium {
          background: linear-gradient(135deg, #0dcaf0, #0056b3); border: none; padding: 16px; font-weight: 800; border-radius: 12px;
          font-size: 1.1rem; letter-spacing: 1px; color: #fff; transition: 0.3s; box-shadow: 0 10px 20px rgba(13, 202, 240, 0.3);
        }
        .btn-premium:hover { transform: translateY(-3px); box-shadow: 0 15px 25px rgba(13, 202, 240, 0.5); }
        
        .img-container { width: 100%; height: 500px; border-radius: 24px; overflow: hidden; box-shadow: 0 50px 80px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.05); }
        .img-container img { width: 100%; height: 100%; object-fit: cover; }
      `}</style>

      {/* 01. HERO / LOGIN + ECP LOGO */}
     <section style={{ 
        backgroundImage: `linear-gradient(to right, rgba(11, 12, 16, 0.95), rgba(11, 12, 16, 0.7)), url(${images.hero})`,
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'
      }}>
       <Container>
          <Row className="align-items-center">
            <Col lg={7} data-aos="fade-up">
              <div className="ecp-logo">
                <FaCube className="logo-icon" /> 
                <div className="logo-text">ECP <span className="logo-sub">통합 시스템</span></div>
              </div>

              <h1 className="display-title">팀의 잠재력을 깨우는<br/><span style={{color: '#0dcaf0'}}>가장 스마트한 연결.</span></h1>
              <p className="fs-5 text-white-50 mb-5" style={{maxWidth:'580px'}}>단절된 업무를 하나로 잇고, 데이터로 대화하세요.<br/>당신의 팀이 성공에만 집중할 수 있는 완벽한 환경을 제안합니다.</p>
            </Col>
            
            <Col lg={5} data-aos="zoom-in">
              <div className="premium-auth-card">
                <div className="text-center mb-4">
                  <div className="ecp-logo">
                <FaCube className="logo-icon" /> 
                <div className="logo-text"style={{fontSize:"45px"}}>ECP <span className="logo-sub"style={{fontSize:"45px"}}>로그인</span></div>
              </div>
                  <h4 className="fw-bold text-white mb-2" style={{letterSpacing: '2px'}}>
                    
                     신규 등록자 전용</h4>
                  
                </div>
                
                {/* 🚀 로그인 에러 메시지 출력 영역 */}
                {error && <Alert variant="danger" className="py-2 text-center rounded-3 bg-danger bg-opacity-25 border-danger text-white fw-bold">{error}</Alert>}
                <Form.Label className="text-white-50 small ms-1 fw-bold mb-1" style={{fontSize:"1.1rem"}}>사원 번호 (아이디)</Form.Label>
                {/* 🚀 Form에 onSubmit 연결 */}
                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-3 position-relative">
                    <Form.Control 
                      className="custom-input shadow-none" 
                      placeholder="아이디를 입력하세요." 
                      onChange={e => setLoginData({...loginData, loginId: e.target.value})} // 데이터 연결
                    />
                  </Form.Group>
                  <Form.Group className="mb-4 position-relative">
                    <Form.Label className="text-white-50 small ms-1 fw-bold mb-1" style={{fontSize:"1.1rem"}}>비밀번호</Form.Label>
                    <Form.Control 
                      type="password" 
                      className="custom-input shadow-none" 
                      placeholder="비밀번호를 입력하세요." 
                      onChange={e => setLoginData({...loginData, password: e.target.value})} // 데이터 연결
                    />
                  </Form.Group>
                  
                  {/* 🚀 버튼 타입을 submit으로 변경 */}
                  <Button type="submit" className="w-100 btn-premium">
                    시스템 접속하기
                  </Button>
                  
                  <div className="d-flex justify-content-between mt-4 px-2">
                    <Button variant="link" className="text-white-50 p-0 small text-decoration-none" onClick={() => navigate('/find-password')}>비밀번호 찾기</Button>
                    <Button variant="link" className="text-info p-0 small fw-bold text-decoration-none" onClick={() => navigate('/join')}>신규 사원 등록</Button>
                  </div>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 02. DAILY INTELLIGENCE */}
      <section>
        <Container>
          <Row className="align-items-center">
            <Col md={6} data-aos="fade-right">
              <span className="step-indicator">02 STEP</span>
              <h2 className="display-title">데이터로 여는<br/>스마트한 업무의 시작</h2>
              <p className="text-white-50 fs-5 mb-0 text-desc">번거로운 정보 검색은 이제 그만.<br/>실시간 뉴스부터 AI가 제안하는 IT 트렌드까지, 헤더에서 제공되는 인사이트로 하루의 전략을 설계하세요.</p>
            </Col>
            <Col md={6} data-aos="fade-left" className="ps-md-5">
              <div className="img-container"><img src={images.header} alt="Intelligence" /></div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 03. FLOW DECISION */}
      <section style={{ backgroundColor: '#0e0f15' }}>
        <Container>
          <Row className="flex-row-reverse align-items-center">
            <Col md={6} data-aos="fade-left">
              <span className="step-indicator">03 STEP</span>
              <h2 className="display-title">결정은 빠르게<br/>과정은 투명하게</h2>
              <p className="text-white-50 fs-5 mb-0 text-desc">쌓여가는 결재 서류에 한숨 쉴 필요 없습니다.<br/>직관적인 제어판을 통해 실시간으로 승인과 의견을 공유하며 업무의 흐름을 멈추지 마세요.</p>
            </Col>
            <Col md={6} data-aos="fade-right" className="pe-md-5">
              <div className="img-container"><img src={images.approval} alt="Approval" /></div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 04. TALENT NETWORK */}
      <section>
        <Container>
          <Row className="align-items-center">
            <Col md={6} data-aos="fade-right">
              <span className="step-indicator">04 STEP</span>
              <h2 className="display-title">함께할 때 더 커지는<br/>압도적인 시너지</h2>
              <p className="text-white-50 fs-5 mb-0 text-desc">누가 협업의 적임자인지 한눈에 파악하세요.<br/>조직도를 통해 동료의 현황을 확인하고, 즉각적인 소통으로 프로젝트의 완성도를 높입니다.</p>
            </Col>
            <Col md={6} data-aos="fade-left" className="ps-md-5">
              <div className="img-container"><img src={images.hr} alt="HR Network" /></div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 05. BUSINESS INSIGHT */}
      <section style={{ backgroundColor: '#0e0f15' }}>
        <Container>
          <Row className="flex-row-reverse align-items-center">
            <Col md={6} data-aos="fade-left">
              <span className="step-indicator">05 STEP</span>
              <h2 className="display-title">미래를 준비하는<br/>명확한 비즈니스 지표</h2>
              <p className="text-white-50 fs-5 mb-0 text-desc">감이 아닌 데이터로 이야기하세요.<br/>경영 현황과 팀의 핵심 지표를 실시간 대시보드로 공유하여 모든 팀원이 같은 목표를 바라보게 합니다.</p>
            </Col>
            <Col md={6} data-aos="fade-right" className="pe-md-5">
              <div className="img-container"><img src={images.mgmt} alt="Business" /></div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 06. PRODUCT STREAM */}
      <section>
        <Container>
          <Row className="align-items-center">
            <Col md={6} data-aos="fade-right">
              <span className="step-indicator">06 STEP</span>
              <h2 className="display-title">지연 없는 전송<br/>완벽한 프로젝트 흐름</h2>
              <p className="text-white-50 fs-5 mb-0 text-desc">개발 마일스톤과 배포 현황을 실시간으로 확인하세요.<br/>기술팀과 기획팀 사이의 장벽을 허물고, 모든 과정이 투명하게 공유되는 즐거움을 느껴보세요.</p>
            </Col>
            <Col md={6} data-aos="fade-left" className="ps-md-5">
              <div className="img-container"><img src={images.dev} alt="Development" /></div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 07. SYSTEM INTEGRITY */}
      <section style={{ backgroundColor: '#0e0f15' }}>
        <Container>
          <Row className="flex-row-reverse align-items-center">
            <Col md={6} data-aos="fade-left">
              <span className="step-indicator">07 STEP</span>
              <h2 className="display-title">안심하고 오직<br/>협업에만 집중하도록</h2>
              <p className="text-white-50 fs-5 mb-0 text-desc">보안은 저희에게 맡기세요.<br/>AOP 로그 분석과 정밀한 접근 제어 시스템이 당신의 소중한 비즈니스 자산을 24시간 철저히 보호합니다.</p>
            </Col>
            <Col md={6} data-aos="fade-right" className="pe-md-5">
              <div className="img-container"><img src={images.integrity} alt="Security" /></div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 08. CONNECTED HUB */}
      <section>
        <Container className="text-center" data-aos="zoom-in">
          <span className="step-indicator last">LAST STEP</span>
          <h2 className="display-title">모든 소통이 하나로 만나는<br/>사내 협업의 종착지</h2>
          <p className="text-white-50 fs-5 mb-5 mx-auto text-desc" style={{maxWidth:'700px'}}>공지사항부터 캘린더까지, ECP 허브에서 최고의 퍼포먼스를 경험하세요.</p>
          <div className="img-container mb-5 mx-auto" style={{maxWidth:'800px', height: '400px'}}><img src={images.social} alt="Hub" /></div>
          <Button className="btn-premium px-5 py-3" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>GET STARTED</Button>
        </Container>
      </section>

      <footer className="py-5 text-center text-white-50" style={{backgroundColor: '#050608'}}>
        <p className="mb-0">© 2026 ECP Intelligent Portal. Powered by Collaboration.</p>
      </footer>
    </div>
  );
};

export default IntroPage;