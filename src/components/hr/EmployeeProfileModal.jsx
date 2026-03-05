import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge, Form } from 'react-bootstrap';
// 🌟 axios 임포트 확인 (이게 없으면 200 성공 후 코드가 깨질 수 있습니다)
import axios from 'axios'; 
import { 
  FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaTimes, FaUserCircle, FaPaperPlane, FaEdit, FaSave, FaTrashAlt 
} from 'react-icons/fa';

const EmployeeProfileModal = ({ 
    show, 
    onHide, 
    employee, 
    getDeptColor, 
    currentUser, 
    onUpdate, 
    onSendMessage,
    isHrManager 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (employee) {
      setEditData({ ...employee });
      setIsEditing(false);
    }
  }, [employee, show]);

  if (!employee) return null;

  const internalGetDeptColor = (dept) => {
    if (!dept) return '#0dcaf0';
    if (dept.includes('보안')) return '#ff7675';
    if (dept.includes('경영')) return '#a29bfe';
    if (dept.includes('개발')) return '#00cec9';
    return '#0dcaf0';
  };
  
  const deptColor = getDeptColor 
    ? getDeptColor(employee.deptName || employee.dept) 
    : internalGetDeptColor(employee.deptName || employee.dept);
  // 수정 권한: 본인이거나 인사팀장
  const canEdit = isHrManager || (String(currentUser?.id) === String(employee.id));
  
  // 🌟 삭제 권한: 관리자(ADMIN) 또는 인사팀장(MANAGER)
  const isAdmin = currentUser?.role === 'ROLE_ADMIN' || currentUser?.role === 'ADMIN';
  const canDelete = isAdmin || isHrManager;

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editData);
    }
    setIsEditing(false);
  };

  // 🌟 삭제 핸들러 (버그 수정판)
  const handleDelete = async () => {
    if (!employee?.id) return alert("삭제할 사원 식별자(ID)가 없습니다.");
    if (!window.confirm(`[경고] ${employee.name} 사원의 모든 데이터를 삭제하시겠습니까?\n이 작업은 복구할 수 없습니다.`)) return;

    try {
      const token = localStorage.getItem('token');
      // 1. 서버에 삭제 요청
      const res = await axios.delete(`http://localhost:8080/api/users/${employee.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 2. 200 OK 확인 후 처리
      if (res.status === 200) {
        alert("성공적으로 삭제되었습니다.");
        onHide(); // 모달 닫기
        
        // 3. 페이지 새로고침 (데이터 동기화의 가장 확실한 방법)
        window.location.reload(); 
      }
    } catch (e) {
      console.error("삭제 실패 로그:", e);
      const msg = e.response?.data || "삭제 권한이 없거나 서버 오류가 발생했습니다.";
      alert(`삭제 실패: ${msg}`);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered className="business-card-modal">
      <style>{`
        .business-card-modal .modal-content { background: #111 !important; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; overflow: hidden; }
        .card-header-gradient { height: 110px; position: relative; }
        .profile-avatar-outer { width: 100px; height: 100px; border-radius: 50%; background: #1a1c23; border: 5px solid #111; position: absolute; bottom: -50px; left: 30px; display: flex; align-items: center; justify-content: center; }
        .edit-input { background: rgba(255,255,255,0.05) !important; border: 1px solid #333 !important; color: #fff !important; margin-bottom: 10px; }
        .edit-input::placeholder { color: rgba(255, 255, 255, 0.3) !important; }
        .btn-delete-custom { border-color: #ff4757 !important; color: #ff4757 !important; transition: 0.3s; }
        .btn-delete-custom:hover { background: #ff4757 !important; color: #fff !important; }
      `}</style>
      
      <div className="position-relative">
        <div className="card-header-gradient" style={{ background: `linear-gradient(135deg, ${deptColor}, #1a1c23)` }}>
          <Button variant="link" className="position-absolute top-0 end-0 text-white p-3" onClick={onHide}><FaTimes size={20}/></Button>
          <div className="profile-avatar-outer"><FaUserCircle size={85} style={{ color: deptColor }} /></div>
        </div>
        
        <div className="p-5 pt-5 mt-4">
          <div className="d-flex justify-content-between align-items-end mb-4">
            {isEditing ? (
              <div className="w-100 me-3">
                <Form.Control 
                  className="edit-input fw-bold fs-4" 
                  value={editData.name || ""} 
                  placeholder="성함을 입력하세요"
                  onChange={(e)=>setEditData({...editData, name: e.target.value})} 
                />
                <Form.Control 
                  className="edit-input text-info" 
                  value={editData.position || editData.pos || ""} 
                  placeholder="직급을 입력하세요"
                  onChange={(e)=>setEditData({...editData, position: e.target.value})} 
                />
              </div>
            ) : (
              <div>
                <h2 className="fw-bold mb-0 text-white">{employee.name}</h2>
                <span className="fs-5 fw-bold" style={{ color: deptColor }}>{employee.position || employee.pos}</span>
              </div>
            )}
            <Badge bg="dark" className="border border-secondary px-3 py-2 text-white-50">{employee.deptName || employee.dept}</Badge>
          </div>

          <hr className="border-secondary opacity-25" />

          <div className="d-flex flex-column gap-3 mt-4 text-white-50">
            <div className="d-flex align-items-center gap-3">
              <FaPhoneAlt className="text-info"/> 
              {isEditing ? (
                <Form.Control 
                  size="sm" 
                  className="edit-input" 
                  value={editData.phone || ""} 
                  placeholder="010-0000-0000"
                  onChange={(e)=>setEditData({...editData, phone: e.target.value})} 
                />
              ) : (employee.phone || "전화번호 없음")}
            </div>
            <div className="d-flex align-items-center gap-3">
              <FaEnvelope className="text-info"/> 
              {isEditing ? (
                <Form.Control 
                  size="sm" 
                  className="edit-input" 
                  value={editData.email || ""} 
                  placeholder="email@company.com"
                  onChange={(e)=>setEditData({...editData, email: e.target.value})} 
                />
              ) : (employee.email || "이메일 없음")}
            </div>
          </div>

          <div className="mt-5 d-flex gap-2">
            {!isEditing ? (
              <>
                <Button variant="info" className="flex-grow-1 fw-bold text-white rounded-pill py-2" onClick={() => onSendMessage(employee)}>
                  <FaPaperPlane className="me-2" /> 메시지 보내기
                </Button>
                
                {canEdit && (
                  <Button variant="outline-secondary" className="rounded-pill px-4 text-white-50 border-secondary" onClick={() => setIsEditing(true)}>
                    <FaEdit className="me-1" /> 수정
                  </Button>
                )}
                
                {/* 🌟 삭제 버튼: ADMIN 또는 인사팀장(MANAGER)에게만 노출 */}
                {canDelete && (
                  <Button variant="outline-danger" className="btn-delete-custom rounded-pill px-4" onClick={handleDelete}>
                    <FaTrashAlt className="me-1" /> 삭제
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="success" className="flex-grow-1 fw-bold text-white rounded-pill py-2" onClick={handleSave}><FaSave className="me-2" /> 저장</Button>
                <Button variant="outline-danger" className="rounded-pill px-4" onClick={() => setIsEditing(false)}>취소</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EmployeeProfileModal;