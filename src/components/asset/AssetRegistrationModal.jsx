import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { FaPlus, FaTimes } from 'react-icons/fa';
import axios from 'axios'; 

const AssetRegistrationModal = ({ show, onHide, onUpdate }) => {
  const [formData, setFormData] = useState({ 
    name: "", 
    category: "IT장비", 
    holder: "", 
    sn: "", 
    price: "", 
    location: "", 
    warranty: "" 
  });

  const handleSubmit = async () => {
    if(!formData.name || !formData.holder) return alert("필수 정보를 입력해주세요.");

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // 🌟 [수정] 백엔드 코드와 완벽히 호환되도록 원래의 formData 그대로 전송!
      await axios.post('http://ecpsystem.site:8080/api/assets', formData, config);
      
      onUpdate(); 
      onHide();
      alert("자산이 성공적으로 등록되었습니다.");

      // 성공 후 입력창 싹 비워주기
      setFormData({ name: "", category: "IT장비", holder: "", sn: "", price: "", location: "", warranty: "" });

    } catch (error) {
      console.error(error);
      alert("서버 저장 실패: " + (error.response?.data || error.message));
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" className="support-reg-modal">
      <style>{`
        .support-reg-modal .modal-content { background: #111 !important; color: #fff !important; border: 1px solid rgba(13, 202, 240, 0.3); border-radius: 20px; }
        .support-reg-modal .form-label { color: #ffffff !important; font-weight: 600; font-size: 0.9rem; margin-bottom: 8px; }
        .support-reg-modal .form-control, .support-reg-modal .form-select { background-color: #1a1c23 !important; border: 1px solid #333 !important; color: #fff !important; border-radius: 10px; padding: 12px; }
        .support-reg-modal .btn { color: #ffffff !important; }
        .support-reg-modal .form-control::placeholder { color: rgba(255, 255, 255, 0.6) !important; opacity: 1 !important; }
        
        /* 🌟 셀렉트박스 옵션 색상 고정 (하얀 글씨 안 보이는 현상 방지) */
        .support-reg-modal .form-select option { background-color: #1a1c23 !important; color: #ffffff !important; }
      `}</style>

      {/* 헤더: 닫기 버튼 우측 끝 배치 */}
      <Modal.Header className="p-4 border-bottom border-secondary border-opacity-10 d-flex justify-content-between align-items-center">
        <Modal.Title className="fw-bold fs-5 text-info mb-0"><FaPlus className="me-2"/>신규 자산 등록</Modal.Title>
        <Button variant="link" className="p-0 ms-auto" style={{ color: '#fff' }} onClick={onHide}><FaTimes size={20}/></Button>
      </Modal.Header>

      <Modal.Body className="p-4">
        <Form>
          <Row className="mb-3">
            <Col md={6}><Form.Group><Form.Label>자산명</Form.Label><Form.Control value={formData.name} placeholder="예: MacBook Pro 16" onChange={(e)=>setFormData({...formData, name: e.target.value})} /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>시리얼 번호 (S/N)</Form.Label><Form.Control value={formData.sn} placeholder="제품 시리얼 번호" onChange={(e)=>setFormData({...formData, sn: e.target.value})} /></Form.Group></Col>
          </Row>
          <Row className="mb-3">
            <Col md={4}><Form.Group><Form.Label>구매 가액</Form.Label><Form.Control value={formData.price} placeholder="예: 2500000" onChange={(e)=>setFormData({...formData, price: e.target.value})} /></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label>보관 위치</Form.Label><Form.Control value={formData.location} placeholder="본사 4층" onChange={(e)=>setFormData({...formData, location: e.target.value})} /></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label>보증 만료일</Form.Label><Form.Control value={formData.warranty} placeholder="2027-01-01" onChange={(e)=>setFormData({...formData, warranty: e.target.value})} /></Form.Group></Col>
          </Row>
          <Row>
            <Col md={6}><Form.Group><Form.Label>카테고리</Form.Label><Form.Select value={formData.category} onChange={(e)=>setFormData({...formData, category: e.target.value})}>
              <option value="IT장비">IT장비</option>
              <option value="가구">가구</option>
              <option value="사무용품/비품">사무용품/비품</option>
              </Form.Select></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>실사용자 (담당자)</Form.Label><Form.Control value={formData.holder} placeholder="성함 입력 (공용일 경우 부서명)" onChange={(e)=>setFormData({...formData, holder: e.target.value})} /></Form.Group></Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer className="p-4 border-0">
        <Button variant="info" className="w-100 py-3 fw-bold rounded-pill shadow" onClick={handleSubmit}>등록 완료</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssetRegistrationModal;