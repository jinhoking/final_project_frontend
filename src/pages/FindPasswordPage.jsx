import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';

function FindPasswordPage() {
  const [formData, setFormData] = useState({ loginId: '', name: '', email: '', newPassword: '', confirmPassword: '' });
  const [step, setStep] = useState(1); 
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleVerify = () => {
    if(!formData.loginId || !formData.name || !formData.email) { setError('모든 정보를 입력해주세요.'); return; }
    setError(''); setStep(2); 
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) { setError('새 비밀번호가 일치하지 않습니다.'); return; }
    try {
      await axios.post('http://ecpsystem.site:8080/api/users/reset-password', formData);
      alert('비밀번호가 변경되었습니다! 로그인해주세요. 🔐');
      navigate('/login');
    } catch (e) {
      setError(e.response?.data || '정보가 일치하지 않거나 오류가 발생했습니다.');
      if(e.response?.data?.includes("일치하지")) setStep(1); 
    }
  };

  return (
    <div style={{ backgroundColor: '#0b0c10', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <style>{`
        .premium-auth-card {
          background: rgba(16, 18, 27, 0.75); backdrop-filter: blur(20px); border: 1px solid rgba(13, 202, 240, 0.3); border-radius: 24px; padding: 50px 40px; box-shadow: 0 30px 60px rgba(0,0,0,0.8), inset 0 0 30px rgba(13, 202, 240, 0.05); position: relative; width: 100%; max-width: 480px; margin: 0 auto;
        }
        .premium-auth-card::before { content: ''; position: absolute; top: -2px; left: 50%; transform: translateX(-50%); width: 50%; height: 4px; background: #0dcaf0; border-radius: 10px; box-shadow: 0 0 20px #0dcaf0; }
        .custom-input { background-color: rgba(255, 255, 255, 0.05) !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.2) !important; border-radius: 12px !important; padding: 14px 14px !important; font-size: 0.95rem !important; font-weight: 500 !important; }
        .custom-input:focus { border-color: #0dcaf0 !important; background-color: rgba(13, 202, 240, 0.05) !important; box-shadow: 0 0 0 4px rgba(13, 202, 240, 0.1) !important; }
        .custom-input::placeholder { color: rgba(255, 255, 255, 0.4) !important; font-weight: 400; }
        .btn-premium { background: linear-gradient(135deg, #0dcaf0, #0056b3); border: none; padding: 16px; font-weight: 800; border-radius: 12px; font-size: 1.1rem; letter-spacing: 1px; color: #fff; transition: 0.3s; box-shadow: 0 10px 20px rgba(13, 202, 240, 0.3); }
        .btn-premium:hover { transform: translateY(-3px); box-shadow: 0 15px 25px rgba(13, 202, 240, 0.5); }
      `}</style>

      <Container className="d-flex justify-content-center align-items-center">
        <div className="premium-auth-card">
          <div className="text-center mb-5">
            <h3 className="fw-bold text-white mb-2" style={{letterSpacing: '1px'}}>비밀번호 재설정</h3>
            <p className="text-info small fw-bold">가입 시 등록한 정보를 입력해주세요.</p>
          </div>

          {error && <Alert variant="danger" className="py-2 text-center rounded-3 bg-danger bg-opacity-25 border-danger text-white fw-bold">{error}</Alert>}

          <Form>
            <div style={{ display: step === 1 ? 'block' : 'none' }}>
                <Form.Group className="mb-3">
                    <Form.Label className="text-white-50 small ms-1 fw-bold mb-1">사원 번호 (아이디)</Form.Label>
                    <Form.Control className="custom-input shadow-none" placeholder="아이디 입력" onChange={e => setFormData({...formData, loginId: e.target.value})} />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label className="text-white-50 small ms-1 fw-bold mb-1">성명</Form.Label>
                    <Form.Control className="custom-input shadow-none" placeholder="이름 입력" onChange={e => setFormData({...formData, name: e.target.value})} />
                </Form.Group>
                <Form.Group className="mb-4">
                    <Form.Label className="text-white-50 small ms-1 fw-bold mb-1">회사 이메일</Form.Label>
                    <Form.Control className="custom-input shadow-none" placeholder="등록된 이메일 입력" onChange={e => setFormData({...formData, email: e.target.value})} />
                </Form.Group>
                <Button className="w-100 btn-premium mt-2" onClick={handleVerify}>정보 확인</Button>
            </div>

            <div style={{ display: step === 2 ? 'block' : 'none' }}>
                <Alert variant="info" className="py-2 text-center small rounded-3 bg-info bg-opacity-10 border-info text-info fw-bold">정보가 확인되었습니다. 새 비밀번호를 설정하세요.</Alert>
                <Form.Group className="mb-3 mt-4">
                    <Form.Label className="text-white-50 small ms-1 fw-bold mb-1">새 비밀번호</Form.Label>
                    <Form.Control type="password" className="custom-input shadow-none" placeholder="새로운 비밀번호" onChange={e => setFormData({...formData, newPassword: e.target.value})} />
                </Form.Group>
                <Form.Group className="mb-4">
                    <Form.Label className="text-white-50 small ms-1 fw-bold mb-1">새 비밀번호 확인</Form.Label>
                    <Form.Control type="password" className="custom-input shadow-none" placeholder="비밀번호 재입력" onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                </Form.Group>
                <Button className="w-100 btn-premium mt-2" onClick={handleChangePassword}>비밀번호 변경</Button>
            </div>
            
            <div className="text-center mt-4">
               <Button variant="link" className="text-white-50 p-0 small text-decoration-none" onClick={() => navigate('/login')}>로그인으로 돌아가기</Button>
            </div>
          </Form>
        </div>
      </Container>
    </div>
  );
}
export default FindPasswordPage;