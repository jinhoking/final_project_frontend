import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { FaCube } from 'react-icons/fa';

function LoginPage({ onLoginSuccess }) {
  const [loginData, setLoginData] = useState({ loginId: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const backendUrl = `http://ecpsystem.site:8080/api/users/login`;

    console.log("🚀 전송 시작! 주소:", backendUrl);

    try {
      const res = await axios.post(backendUrl, loginData);
      console.log("✅ 백엔드 응답 성공:", res.data);
      
      const token = res.data; 
      if (token) {
        localStorage.setItem('token', token); 
        
        
        if (onLoginSuccess) {
          await onLoginSuccess();
        }  
        navigate('/'); 
      }
    } catch (e) {
      console.error("🚨 실패 원인:", e);
      setError('아이디 또는 비밀번호를 확인해주세요.');
    }
  };
  return (
        <div style={{ backgroundColor: '#0b0c10', minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '60px 0' }}>
      <style>{`
        .premium-auth-card {
          background: rgba(17, 19, 26, 0.85); /* 네이비 톤 제거, 메인 페이지와 어울리는 딥다크 */
          backdrop-filter: blur(20px); 
          border: 1px solid rgba(13, 202, 240, 0.2); 
          border-radius: 24px; 
          padding: 50px 40px; 
          box-shadow: 0 30px 60px rgba(0,0,0,0.8), inset 0 0 30px rgba(13, 202, 240, 0.05); 
          position: relative; 
          width: 100%; 
          max-width: ${window.location.pathname === '/join' ? '650px' : '450px'}; /* 가로 크기 자동 조절 */
          margin: 0 auto;
        }
        .premium-auth-card::before { 
          content: ''; position: absolute; top: -2px; left: 50%; transform: translateX(-50%); 
          width: 50%; height: 4px; background: #0dcaf0; border-radius: 10px; box-shadow: 0 0 20px #0dcaf0; 
        }
        .custom-input { 
          background-color: rgba(0, 0, 0, 0.3) !important; 
          color: #ffffff !important; 
          border: 1px solid rgba(255, 255, 255, 0.1) !important; 
          border-radius: 12px !important; 
          padding: 16px 20px !important; 
          font-size: 1.05rem !important; 
          font-weight: 500 !important; 
        }
        .custom-input:focus { 
          border-color: #0dcaf0 !important; 
          background-color: rgba(13, 202, 240, 0.05) !important; 
          box-shadow: 0 0 0 4px rgba(13, 202, 240, 0.1) !important; 
        }
        .custom-input::placeholder { color: rgba(255, 255, 255, 0.3) !important; font-weight: 400; }
        .custom-input option { background-color: #0b0c10; color: #fff; }
        .btn-premium { 
          background: linear-gradient(135deg, #0dcaf0, #0056b3); 
          border: none; padding: 16px; font-weight: 800; border-radius: 12px; 
          font-size: 1.1rem; letter-spacing: 1px; color: #fff; 
          transition: 0.3s; box-shadow: 0 10px 20px rgba(13, 202, 240, 0.3); 
        }
        .btn-premium:hover { transform: translateY(-3px); box-shadow: 0 15px 25px rgba(13, 202, 240, 0.5); }
      
      `}</style>

      <Container className="d-flex justify-content-center align-items-center">
        <div className="premium-auth-card">
          
          <div className="text-center mb-4">
            <div className="d-flex justify-content-center align-items-center mb-3">
              <FaCube size={32} className="text-info me-2" style={{ filter: 'drop-shadow(0 0 10px rgba(13, 202, 240, 0.5))' }} />
              <h2 className="fw-bold text-white mb-0" style={{letterSpacing: '1px'}}>
                ECP <span className="text-info" style={{ fontWeight: 800 }}>로그인</span>
              </h2>
            </div>
            <p className="text-white-50 fw-bold fs-6">사내 임직원 전용</p>
          </div>
          
          {error && <Alert variant="danger" className="py-2 text-center rounded-3 bg-danger bg-opacity-25 border-danger text-white fw-bold">{error}</Alert>}
          
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3 position-relative">
              {/* 🚀 라벨 부활 */}
              <Form.Label className="text-white-50 small ms-1 fw-bold mb-1">사원 번호 (아이디)</Form.Label>
              <Form.Control 
                className="custom-input shadow-none" 
                placeholder="아이디를 입력하세요" 
                onChange={e => setLoginData({...loginData, loginId: e.target.value})} 
              />
            </Form.Group>
            
            <Form.Group className="mb-4 position-relative">
              {/* 🚀 라벨 부활 */}
              <Form.Label className="text-white-50 small ms-1 fw-bold mb-1">비밀번호</Form.Label>
              <Form.Control 
                type="password" 
                className="custom-input shadow-none" 
                placeholder="비밀번호를 입력하세요" 
                onChange={e => setLoginData({...loginData, password: e.target.value})} 
              />
            </Form.Group>
            
            <Button type="submit" className="w-100 btn-premium">
              시스템 접속하기
            </Button>
            
            <div className="d-flex justify-content-between mt-4 px-2">
              <Button variant="link" className="text-white-50 p-0 small text-decoration-none" onClick={() => navigate('/find-password')}>비밀번호 찾기</Button>
              <Button variant="link" className="text-info p-0 small fw-bold text-decoration-none" onClick={() => navigate('/join')}>신규 사원 등록</Button>
            </div>
          </Form>

        </div>
      </Container>
    </div>
  );
}

export default LoginPage;