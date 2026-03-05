import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaPen, FaTrash, FaPlus } from 'react-icons/fa';

const TeamBulletin = () => {
  const [memos, setMemos] = useState([
    { id: 1, content: "금일 오후 5시 전체 코드 리뷰 예정 (회의실 A)", author: "PM", color: "#fff9c4" },
    { id: 2, content: "API 명세서 v1.2 업데이트 완료되었습니다.", author: "BackEnd", color: "#c8e6c9" }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMemo, setCurrentMemo] = useState({ id: null, content: '', author: '', color: '#fff9c4' });
  const colors = ["#fff9c4", "#c8e6c9", "#ffccbc", "#b3e5fc", "#e1bee7"];

  const openModal = (memo = null) => {
    if (memo) {
      setIsEditing(true);
      setCurrentMemo(memo);
    } else {
      setIsEditing(false);
      setCurrentMemo({ id: null, content: '', author: '', color: '#fff9c4' });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!currentMemo.content || !currentMemo.author) {
      alert("내용과 작성자를 입력해주세요.");
      return;
    }
    if (isEditing) {
      setMemos(memos.map(m => m.id === currentMemo.id ? currentMemo : m));
    } else {
      const newId = memos.length > 0 ? Math.max(...memos.map(m => m.id)) + 1 : 1;
      setMemos([...memos, { ...currentMemo, id: newId }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("이 메모를 떼어내시겠습니까?")) {
      setMemos(memos.filter(m => m.id !== id));
    }
  };

  return (
    <div className="h-100 d-flex flex-column position-relative" style={{ backgroundColor: '#1a1c23', borderRadius: '12px', overflow: 'hidden' }}>
      
      {/* [수정] 메인 컬러인 Info(하늘색) 테두리와 호버 효과 */}
      <style>
        {`
          .btn-bulletin-info {
            color: #0dcaf0;
            border: 2px solid #0dcaf0;
            background-color: transparent;
            transition: all 0.3s ease;
          }
          .btn-bulletin-info:hover {
            color: white !important;
            background-color: #0dcaf0 !important;
            border-color: #0dcaf0 !important;
          }
          .custom-placeholder::placeholder { color: #ced4da !important; opacity: 0.8; }
          .custom-placeholder { color: white !important; background-color: #2b3035 !important; border-color: #495057 !important; }
        `}
      </style>

      {/* 상단 버튼 영역 */}
      <div className="d-flex justify-content-end p-2 pe-3 position-absolute top-0 end-0" style={{ zIndex: 10 }}>
        <Button 
          size="sm" 
          className="rounded-pill px-3 fw-bold btn-bulletin-info" 
          onClick={() => openModal()}
        >
          <FaPlus className="me-1" /> 메모
        </Button>
      </div>

      <div className="flex-grow-1 p-3 d-flex gap-3 align-items-start" style={{ overflowX: 'auto', marginTop: '25px', minHeight: '200px' }}>
        {memos.length > 0 ? memos.map(memo => (
          <div key={memo.id} className="position-relative shadow-sm" style={{
            backgroundColor: memo.color, minWidth: '160px', width: '160px', height: '160px', padding: '15px',
            borderRadius: '4px', transform: memo.id % 2 === 0 ? 'rotate(1deg)' : 'rotate(-1deg)',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.2s',
          }}>
            <div className="position-absolute top-0 end-0 p-2 d-flex gap-2">
              <FaPen size={12} className="text-dark cursor-pointer opacity-50" onClick={() => openModal(memo)} />
              <FaTrash size={12} className="text-danger cursor-pointer opacity-50" onClick={() => handleDelete(memo.id)} />
            </div>
            <p className="text-dark mb-0 fw-bold" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>{memo.content}</p>
            <div className="text-end border-top border-dark border-opacity-10 pt-1">
              <small className="text-dark-50 fw-bold" style={{ fontSize: '0.75rem' }}>— {memo.author}</small>
            </div>
          </div>
        )) : (
          <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white-50">
            <small>등록된 메모가 없습니다. 📌</small>
          </div>
        )}
      </div>

      <div className="p-2 text-center border-top border-secondary border-opacity-25 bg-black bg-opacity-20">
         <small className="text-white-50" style={{ fontSize: '0.75rem' }}>💬 팀원들과 공유할 내용을 자유롭게 적어주세요.</small>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="sm">
        <div className="bg-dark border border-secondary rounded-3 text-white overflow-hidden shadow-lg">
          <Modal.Header closeButton closeVariant="white" className="border-secondary bg-black bg-opacity-20 py-2">
            <Modal.Title className="fs-6 fw-bold text-info">{isEditing ? "메모 수정" : "새 메모 작성"}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-3">
            <Form.Group className="mb-3">
              <Form.Control as="textarea" rows={4} placeholder="공유할 내용을 입력하세요..." className="custom-placeholder mb-2" value={currentMemo.content} onChange={(e) => setCurrentMemo({...currentMemo, content: e.target.value})} />
              <Form.Control type="text" placeholder="작성자 (예: PM)" className="custom-placeholder" value={currentMemo.author} onChange={(e) => setCurrentMemo({...currentMemo, author: e.target.value})} />
            </Form.Group>
            <div className="mb-3">
              <small className="text-white-50 d-block mb-2">포스트잇 색상</small>
              <div className="d-flex gap-2">
                {colors.map(c => (
                  <div key={c} onClick={() => setCurrentMemo({...currentMemo, color: c})}
                    style={{ 
                      width: '28px', height: '28px', backgroundColor: c, borderRadius: '50%', cursor: 'pointer',
                      border: currentMemo.color === c ? '2px solid white' : '2px solid transparent',
                    }} 
                  />
                ))}
              </div>
            </div>
            <div className="d-grid pt-2 border-top border-secondary border-opacity-50">
              <Button variant="info" size="sm" className="fw-bold text-white" onClick={handleSave}>
                {isEditing ? "수정 완료" : "메모 붙이기"}
              </Button>
            </div>
          </Modal.Body>
        </div>
      </Modal>
    </div>
  );
};

export default TeamBulletin;