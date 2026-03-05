import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Form, InputGroup, Badge } from 'react-bootstrap';
import { FaBox, FaTimes, FaBarcode, FaMapMarkerAlt, FaHistory, FaTrashAlt, FaTools, FaEdit, FaSave } from 'react-icons/fa';
import axios from 'axios';

const AssetDetailModal = ({ show, onHide, asset, currentUser, onUpdate }) => {
  const [tab, setTab] = useState('detail');
  const [historyInput, setHistoryInput] = useState("");
  const [repairReason, setRepairReason] = useState(""); 
  
  // 🌟 수정 모드 상태 추가
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (asset) {
      setEditData({ ...asset });
      setIsEditing(false); // 모달이 열릴 때 항상 읽기 모드로 초기화
      setTab('detail');
    }
  }, [asset, show]);

  if (!asset) return null;

  // 🌟 권한 체크 로직 강화 (경영지원팀 OR 관리자 OR 매니저)
  const isManagementTeam = currentUser?.deptName === '경영지원팀';
  const isAdmin = currentUser?.role === 'ROLE_ADMIN' || currentUser?.role === 'ADMIN';
  const isManager = currentUser?.role === 'ROLE_MANAGER' || currentUser?.role === 'MANAGER';
  
  // 삭제 및 이력 관리 권한
  const canManage = isManagementTeam || isAdmin || isManager;

  // 1. 이력 직접 추가 핸들러
  const handleHistorySubmit = async () => {
    if (!historyInput.trim()) return alert("내용을 입력해주세요.");
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://ecpsystem.site:8080/api/assets/${asset.id}/history`, 
        { title: historyInput, admin: currentUser.name }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert("이력이 저장되었습니다.");
      setHistoryInput("");
      onUpdate(); 
      onHide();   
    } catch (e) {
      alert("저장 실패: " + e.message);
    }
  };

  // 2. 수리 요청 핸들러 (용어 변경: 고장 증상 -> 이상 내역)
  const handleRepairSubmit = async () => {
    if (!repairReason.trim()) return alert("이상 내역을 입력해주세요.");

    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://ecpsystem.site:8080/api/assets/${asset.id}/repair`, 
        { reason: repairReason, requester: currentUser.name }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("수리 및 점검 요청이 접수되었습니다.");
      setRepairReason("");
      onUpdate(); 
      onHide();
    } catch (e) {
      alert("요청 실패: " + e.message);
    }
  };

  // 3. 자산 삭제 핸들러 (🌟 신규 추가)
  const handleDeleteAsset = async () => {
    // 🌟 id 대신 assetNumber가 들어있으므로 명칭을 명확히 인지
    const targetId = asset.assetNumber || asset.id; 

    if (!window.confirm(`정말로 자산[${targetId}]을 삭제하시겠습니까?\n모든 이력 데이터가 영구히 삭제됩니다.`)) return;

    try {
      const token = localStorage.getItem('token');
      // 백엔드에서 이제 String을 받으므로 정상 작동함
      await axios.delete(`http://ecpsystem.site:8080/api/assets/${targetId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("자산 삭제가 완료되었습니다.");
      onUpdate();
      onHide();
    } catch (e) {
      console.error(e);
      alert("삭제 실패: 권한이 없거나 요청 형식이 잘못되었습니다.");
    }
  };

  // 4. 자산 정보 수정 핸들러 (🌟 신규 추가)
  const handleUpdateAsset = async () => {
    try {
      const token = localStorage.getItem('token');
      const targetId = asset.assetNumber || asset.id;

      await axios.put(`http://ecpsystem.site:8080/api/assets/${targetId}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("자산 정보가 수정되었습니다.");
      setIsEditing(false);
      onUpdate(); 
    } catch (e) {
      console.error(e);
      alert("수정 실패: 권한이 없거나 서버 오류가 발생했습니다.");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" className="asset-enhanced-modal">
      <style>{`
        .asset-enhanced-modal .modal-content { background: #111; color: #fff; border: 1px solid rgba(162,155,254,0.3); border-radius: 20px; overflow: hidden; }
        .info-box { background: rgba(255,255,255,0.03); border-radius: 12px; padding: 20px; height: 100%; border: 1px solid rgba(255,255,255,0.05); }
        .timeline-item { border-left: 2px solid #a29bfe; padding-left: 20px; position: relative; padding-bottom: 20px; }
        .timeline-item::before { content: ""; position: absolute; left: -7px; top: 0; width: 12px; height: 12px; border-radius: 50%; background: #a29bfe; }
        
        .asset-enhanced-modal .btn { color: #ffffff !important; font-weight: 600; }
        .active-tab { background: #6c5ce7 !important; border-color: #6c5ce7 !important; }

        .history-input::placeholder { color: rgba(255, 255, 255, 0.6) !important; opacity: 1 !important; }
        .history-input, .repair-input { background: #000 !important; color: #fff !important; border: 1px solid #333 !important; }
        .btn-danger-custom { background-color: #ff4757 !important; border: none !important; }
        .btn-danger-custom:hover { opacity: 0.9; }

        /* 🌟 수정 모드 인풋 스타일 (기존 코드) */
        .edit-asset-input { background: rgba(255,255,255,0.05) !important; border: 1px solid #333 !important; color: #fff !important; margin-bottom: 5px; }
        .edit-asset-input:focus { border-color: #0dcaf0 !important; box-shadow: none !important; }

        /* 🌟 [여기 추가!] 셀렉트 박스 드롭다운 메뉴 배경색 어둡게 고정 */
        .edit-asset-input option { 
            background-color: #1a1c23 !important; 
            color: #ffffff !important; 
        }


      `}</style>

      <Modal.Body className="p-0">
        <div className="p-4 d-flex justify-content-between align-items-center bg-black bg-opacity-30 border-bottom border-secondary border-opacity-25">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-dark p-3 rounded-3 border border-secondary text-info"><FaBox size={24}/></div>
            <div>
              {/* 🌟 수정 모드 시 자산명 변경 가능 */}
              {isEditing ? (
                <Form.Control 
                  size="sm" 
                  className="edit-asset-input fw-bold fs-5 mb-1" 
                  value={editData.name || ""} 
                  onChange={(e) => setEditData({...editData, name: e.target.value})} 
                />
              ) : (
                <h4 className="fw-bold mb-0 text-white">{asset.name}</h4>
              )}
              <small className="text-white-50">{asset.assetNumber || asset.id}</small>
            </div>
          </div>
          <Button variant="link" className="p-0 ms-auto" style={{ color: '#fff' }} onClick={onHide}>
            <FaTimes size={24}/>
          </Button>
        </div>

        <div className="p-4">
          <div className="d-flex gap-2 mb-4">
            {['detail', 'history', 'repair'].map(t => (
              <Button 
                key={t} 
                variant="outline-secondary" 
                className={`flex-grow-1 ${tab===t?'active-tab':''}`} 
                onClick={()=>setTab(t)}
                disabled={isEditing && t !== 'detail'} // 🌟 수정 중일 땐 탭 이동 제한
              >
                {t==='detail'?'상세정보':t==='history'?'이력조회':'수리요청'}
              </Button>
            ))}
          </div>

          {tab === 'detail' && (
            <>
              <Row className="g-3">
                <Col md={6}>
                  <div className="info-box">
                    <div className="text-info small fw-bold mb-3"><FaBarcode className="me-2"/>하드웨어 명세</div>
                    
                    <div className="mb-2 d-flex justify-content-between align-items-center">
                      <small className="text-white-50">S/N:</small> 
                      {/* 🌟 수정 모드 시 S/N 변경 가능 */}
                      {isEditing ? (
                        <Form.Control size="sm" className="edit-asset-input w-50" value={editData.sn || ""} onChange={(e) => setEditData({...editData, sn: e.target.value})} />
                      ) : ( <span className="small">{asset.sn || 'N/A'}</span> )}
                    </div>
                    
                    <div className="mb-2 d-flex justify-content-between align-items-center">
                      <small className="text-white-50">카테고리:</small> 
                      {/* 🌟 수정 모드 시 카테고리 변경 가능 */}
                      {isEditing ? (
                        <Form.Select size="sm" className="edit-asset-input w-50" value={editData.category || ""} onChange={(e) => setEditData({...editData, category: e.target.value})}>
                          <option value="IT장비">IT장비</option>
                          <option value="가구">가구</option>
                          <option value="사무용품/비품">사무용품/비품</option>
                        </Form.Select>
                      ) : ( <span className="small">{asset.category || 'N/A'}</span> )}
                    </div>

                    <div className="mb-0 d-flex justify-content-between align-items-center">
  <small className="text-white-50">구매가액:</small> 
  {/* 🌟 수정 모드 시 구매가액 변경 가능 */}
  {isEditing ? (
    <Form.Control 
      size="sm" 
      className="edit-asset-input w-50" 
      value={editData.price || ""} 
      onChange={(e) => setEditData({...editData, price: e.target.value})} 
    />
  ) : ( 
    <span className="small">
      {/* 🌟 기존 값에 콤마가 있어도 안전하게 숫자로 변환 후 다시 포맷팅 */}
      ₩{asset.price ? Number(asset.price.toString().replace(/,/g, '')).toLocaleString() : '0'}
    </span> 
  )}
</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="info-box">
                    <div className="text-info small fw-bold mb-3"><FaMapMarkerAlt className="me-2"/>위치 및 환경</div>
                    
                    <div className="mb-2 d-flex justify-content-between align-items-center">
                      <small className="text-white-50">보관위치:</small> 
                      {/* 🌟 수정 모드 시 위치 변경 가능 */}
                      {isEditing ? (
                        <Form.Control size="sm" className="edit-asset-input w-50" value={editData.location || ""} onChange={(e) => setEditData({...editData, location: e.target.value})} />
                      ) : ( <span className="small">{asset.location || 'N/A'}</span> )}
                    </div>
                    
                    <div className="mb-2 d-flex justify-content-between align-items-center">
                      <small className="text-white-50">담당자:</small> 
                      {/* 🌟 수정 모드 시 담당자 변경 가능 */}
                      {isEditing ? (
                        <Form.Control size="sm" className="edit-asset-input w-50" value={editData.holder || editData.holderName || ""} onChange={(e) => setEditData({...editData, holder: e.target.value, holderName: e.target.value})} />
                      ) : ( <span className="small">{asset.holder || asset.holderName || '공용'}</span> )}
                    </div>

                    <div className="mb-0 d-flex justify-content-between align-items-center">
                      <small className="text-white-50">현재 상태:</small> 
                      {/* 🌟 수정 모드 시 상태 변경 가능 */}
                      {isEditing ? (
                        <Form.Select size="sm" className="edit-asset-input w-50" value={editData.status || ""} onChange={(e) => setEditData({...editData, status: e.target.value})}>
                          <option value="정상">정상</option>
                          <option value="수리중">수리중</option>
                          <option value="폐기">폐기</option>
                        </Form.Select>
                      ) : ( <Badge bg={asset.status === '정상' ? 'success' : 'warning'}>{asset.status || 'N/A'}</Badge> )}
                    </div>
                  </div>
                </Col>
              </Row>

              {/* 🌟 하단 권한자용 버튼 (수정/저장/삭제) */}
              {canManage && (
                <div className="mt-4 pt-3 border-top border-secondary border-opacity-10 d-flex justify-content-end gap-2">
                  {!isEditing ? (
                    <>
                     <Button variant="outline-info" className="px-4 rounded-pill" onClick={() => setIsEditing(true)}>
                        <FaEdit className="me-2"/>정보 수정
                      </Button>
                      <Button className="btn-danger-custom px-4 rounded-pill" onClick={handleDeleteAsset}>
                        <FaTrashAlt className="me-2"/>자산 삭제
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="success" className="px-4 rounded-pill fw-bold" onClick={handleUpdateAsset}>
                        <FaSave className="me-2"/>저장
                      </Button>
                      <Button variant="outline-secondary" className="px-4 rounded-pill" onClick={() => setIsEditing(false)}>
                        취소
                      </Button>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {tab === 'history' && (
            <div className="info-box mx-1">
              {canManage && (
                <InputGroup className="mb-4">
                  <Form.Control className="history-input" placeholder="유지보수 및 변동 이력을 입력하세요..." value={historyInput} onChange={(e) => setHistoryInput(e.target.value)} />
                  <Button variant="info" onClick={handleHistorySubmit}>이력 추가</Button>
                </InputGroup>
              )}
              
              <div style={{ maxHeight: '300px', overflowY: 'auto' }} className="custom-scroll">
                {asset.history?.length > 0 ? (
                  asset.history.map((h, i) => (
                    <div className="timeline-item" key={i} style={i === asset.history.length - 1 ? {border: 'none'} : {}}>
                      <div className="fw-bold small text-white">{h.title}</div>
                      <div className="text-white-50" style={{fontSize: '0.8rem'}}>{h.eventDate || h.date} · {h.adminName || h.admin}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-white-50 py-3">기록된 이력이 존재하지 않습니다.</div>
                )}
              </div>
            </div>
          )}

          {tab === 'repair' && (
            <div className="info-box mx-1">
              <Form.Group className="mb-3">
                {/* 🌟 용어 변경: 고장 증상 -> 이상 내역 및 장애 현상 */}
                <Form.Label className="small text-white-50">이상 내역 및 장애 현상</Form.Label>
                <Form.Control 
                  as="textarea" rows={3} 
                  className="repair-input" 
                  placeholder="장애 현상이나 수리 필요 사유를 상세히 입력해 주세요." 
                  value={repairReason}
                  onChange={(e) => setRepairReason(e.target.value)}
                />
              </Form.Group>
              <Button variant="outline-warning" className="w-100 fw-bold" onClick={handleRepairSubmit}>수리 요청 제출</Button>
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AssetDetailModal;