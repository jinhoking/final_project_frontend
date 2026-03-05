import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Row, Col, Button } from 'react-bootstrap';

function JoinPage() {
  const [formData, setFormData] = useState({ loginId: '', password: '', confirmPassword: '', name: '', email: '', phone: '', address: '', deptId: '1', position: '사원' });
  const navigate = useNavigate();
  const isPasswordMatch = formData.password === formData.confirmPassword;
  const isPasswordEmpty = formData.password === '' || formData.confirmPassword === '';

  const handleJoin = async () => {
    if (!formData.loginId || !formData.password || !formData.name) { alert("아이디, 비밀번호, 이름은 필수 입력 사항입니다!"); return; }
    if (!isPasswordMatch) { alert("비밀번호가 일치하지 않습니다. 다시 확인해주세요."); return; }
    try {
      const dataToSend = { ...formData, deptId: Number(formData.deptId), joinDate: new Date().toISOString().split('.')[0] };
      await axios.post('http://ecpsystem.site:8080/api/users/join', dataToSend);
      alert('사원 등록이 완료되었습니다. 로그인 페이지로 이동합니다. 🎊');
      navigate('/login');
    } catch (error) { alert('등록 실패: ' + (error.response?.data || '서버 에러 발생')); }
  };

  return (
    <div style={{ backgroundColor: '#0b0c10', minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '60px 0' }}>
      <style>{`
        .premium-auth-card {
          background: rgba(16, 18, 27, 0.83); backdrop-filter: blur(20px); border: 1px solid rgba(13, 202, 240, 0.3); border-radius: 24px; padding: 50px 40px; box-shadow: 0 30px 60px rgba(0,0,0,0.8), inset 0 0 30px rgba(13, 202, 240, 0.05); position: relative; width: 100%; max-width: 550px; margin: 0 auto;
        }
        .premium-auth-card::before { content: ''; position: absolute; top: -2px; left: 50%; transform: translateX(-50%); width: 50%; height: 4px; background: #0dcaf0; border-radius: 10px; box-shadow: 0 0 20px #0dcaf0; }
        .custom-input { background-color: rgba(255, 255, 255, 0.05) !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.2) !important; border-radius: 12px !important; padding: 15px 15px !important; font-size: 0.95rem !important; font-weight: 500 !important; }
        .custom-input:focus { border-color: #0dcaf0 !important; background-color: rgba(13, 202, 240, 0.05) !important; box-shadow: 0 0 0 4px rgba(13, 202, 240, 0.1) !important; }
        .custom-input::placeholder { color: rgba(255, 255, 255, 0.4) !important; font-weight: 400; }
        .custom-input option { background-color: #1a1c2e; color: #fff; }
        .btn-premium { background: linear-gradient(135deg, #0dcaf0, #0056b3); border: none; padding: 16px; font-weight: 800; border-radius: 12px; font-size: 1.1rem; letter-spacing: 1px; color: #fff; transition: 0.3s; box-shadow: 0 10px 20px rgba(13, 202, 240, 0.3); }
        .btn-premium:hover { transform: translateY(-3px); box-shadow: 0 15px 25px rgba(13, 202, 240, 0.5); }
      `}</style>

      <Container className="d-flex justify-content-center align-items-center">
        <div className="premium-auth-card">
          <div className="text-center mb-5">
            <h3 className="fw-bold text-white mb-2" style={{letterSpacing: '1px'}}>신규 사원 등록</h3>
            <p className="text-info small fw-bold">ECP 통합 시스템 접근 권한 생성</p>
          </div>
          
          <Form>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white-50 small ms-1 fw-bold mb-1">사원 번호 (아이디)</Form.Label>
                  <Form.Control className="custom-input shadow-none" placeholder="아이디를 생성 해주세요." onChange={e => setFormData({...formData, loginId: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white-50 small ms-1 fw-bold mb-1">비밀번호</Form.Label>
                  <Form.Control type="password" className="custom-input shadow-none" placeholder="비밀번호를 생성해주세요." onChange={e => setFormData({...formData, password: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white-50 small ms-1 fw-bold mb-1">비밀번호 확인</Form.Label>
                  <Form.Control type="password" className={`custom-input shadow-none ${!isPasswordMatch && !isPasswordEmpty ? 'border-danger' : ''}`} placeholder="비밀번호 재입력" onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="text-white-50 small ms-1 fw-bold mb-1">성명</Form.Label>
              <Form.Control className="custom-input shadow-none" placeholder="본명을 입력하세요" onChange={e => setFormData({...formData, name: e.target.value})} />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="text-white-50 small ms-1 fw-bold mb-1">연락처</Form.Label>
              <Form.Control className="custom-input shadow-none" placeholder="예: 010-0000-0000" onChange={e => setFormData({...formData, phone: e.target.value})} />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="text-white-50 small ms-1 fw-bold mb-1">거주지 주소</Form.Label>
              <Form.Control className="custom-input shadow-none" placeholder="주소를 입력하세요" onChange={e => setFormData({...formData, address: e.target.value})} />
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label className="text-white-50 small ms-1 fw-bold mb-1">회사 이메일</Form.Label>
              <Form.Control className="custom-input shadow-none" placeholder="id@company.com" onChange={e => setFormData({...formData, email: e.target.value})} />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="text-white-50 small ms-1 fw-bold mb-1">소속 부서</Form.Label>
                  <Form.Select className="custom-input shadow-none" value={formData.deptId} onChange={e => setFormData({...formData, deptId: e.target.value})}>
                   <option value="1">본사</option><option value="10">인사팀</option><option value="11">경영지원팀</option><option value="12">개발팀</option><option value="13">보안팀</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="text-white-50 small ms-1 fw-bold mb-1">직급</Form.Label>
                  <Form.Select className="custom-input shadow-none" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})}>
                    <option value="사원">사원</option><option value="대리">대리</option><option value="과장">과장</option><option value="차장">차장</option><option value="부장">부장</option><option value="팀장">팀장</option><option value="본부장">본부장</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Button className="w-100 btn-premium mt-2" onClick={handleJoin}>사원 등록 완료</Button>
            <div className="text-center mt-4">
              <Button variant="link" className="text-white-50 p-0 small text-decoration-none" onClick={() => navigate('/login')}>이미 계정이 있으신가요? 로그인</Button>
            </div>
          </Form>
        </div>
      </Container>
    </div>
  );
}
export default JoinPage;