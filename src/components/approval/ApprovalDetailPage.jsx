import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Badge, Button, Form, Row, Col, Image, OverlayTrigger, Popover, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaCheck, FaTimes, FaShieldAlt, FaHistory, FaFileAlt, FaArrowLeft, FaPaperclip, FaLock, FaCommentDots, FaUserTie, FaTrash, FaEdit, FaEye, FaSave, FaBuilding, FaClock,
  FaLink, FaUserPlus, FaCopy, FaFolder, FaFolderOpen, FaCheckSquare, FaRegSquare
} from 'react-icons/fa';

import Header from '../main/Header'; 
import Footer from '../main/Footer';

const ApprovalDetailPage = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const editorRef = useRef(null);
  

  const [weather, setWeather] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [doc, setDoc] = useState(null);
  const [me, setMe] = useState(null);
  const [approvalMessage, setApprovalMessage] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [newFiles, setNewFiles] = useState([]);

  // 🌟 문서 참조자 관리를 위한 State 추가
  const [usersByDept, setUsersByDept] = useState({});
  const [selectedObservers, setSelectedObservers] = useState([]);
  const [showObserverModal, setShowObserverModal] = useState(false);
  const [expandedDepts, setExpandedDepts] = useState({});

  const typeCodes = { 
    '인사 - 휴가 신청서': '01', '보안 - 시설 출입 신청': '02', '보안 - 보안 사고 보고': '03', 
    '개발 - 서버 및 인프라 요청': '04', '지원 - 지출 결의서': '05', '지원 - 비품 신청서': '06', '기획 - 업무 품의서': '07', 
    '업무 - 주간/정기 보고': '08'
  };

  const getFormattedId = (createdAt, dbId, typeName) => {
    if (!createdAt) return "DOC-0000-0000-00-00";
    const date = new Date(createdAt);
    const year = date.getFullYear();
    const mmdd = `${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const typeId = typeCodes[typeName] || '00';
    const seq = String(dbId).padStart(2, '0');
    return `DOC-${year}-${mmdd}-${typeId}-${seq}`;
  };

    useEffect(() => {
    const fetchDetail = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    // 1. 내 정보와 문서 정보 가져오기
    const [meRes, docRes] = await Promise.all([
      axios.get('http://ecpsystem.site:8080/api/users/me', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`http://ecpsystem.site:8080/api/documents/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    ]);

    const myInfo = meRes.data;
    let fetchedDoc = docRes.data;
    
    setMe(myInfo);

    // 🚀 [핵심 수정] 참조자 읽음 처리 로직을 먼저 수행한 뒤 상태를 세팅합니다.
    const myObserverInfo = fetchedDoc.observers?.find(obs => String(obs.id) === String(myInfo.id));
    
    if (myObserverInfo && !myObserverInfo.isRead) {
      try {
        await axios.put(`http://ecpsystem.site:8080/api/documents/${id}/read`, {}, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        
        // 데이터 객체 자체를 업데이트 (DB에는 이미 저장됨)
        fetchedDoc.observers = fetchedDoc.observers.map(obs => 
          String(obs.id) === String(myInfo.id) 
            ? { ...obs, isRead: true, readAt: new Date().toISOString() } 
            : obs
        );
      } catch (readErr) {
        console.error("읽음 처리 실패:", readErr);
      }
    }

    // 최종적으로 업데이트된 데이터를 모든 상태에 적용
    setDoc(fetchedDoc);
    setSelectedObservers(fetchedDoc.observers || []); // 🌟 여기서도 업데이트된 값이 들어가야 함

    // 전체 유저 로드 로직 (기존 유지)
    const usersRes = await axios.get('http://ecpsystem.site:8080/api/users', { headers: { Authorization: `Bearer ${token}` } });
    const grouped = usersRes.data.reduce((acc, u) => {
      if (String(u.id) === String(myInfo.id)) return acc;
      const dept = u.deptName || '미소속';
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(u);
      return acc;
    }, {});
    setUsersByDept(grouped);

  } catch (e) {
    console.error("로딩 실패:", e);
    navigate('/approval');
  } finally {
    setLoading(false);
  }
};

    fetchDetail();
  }, [id, navigate]);
  
  // 🌟 부서 폴더 토글 함수
  const toggleDept = (dept) => {
    setExpandedDepts(prev => ({ ...prev, [dept]: !prev[dept] }));
  };

  // 🌟 참조자 체크박스 토글 함수
  const toggleObserver = (user) => {
    setSelectedObservers(prev => {
      const isSelected = prev.some(u => u.id === user.id);
      if (isSelected) return prev.filter(u => u.id !== user.id);
      return [...prev, user];
    });
  };

  const handleAction = async (status) => {
    if ((status === 'COMMENT') && !approvalMessage.trim()) {
      return alert("사유나 의견 내용을 입력해주세요.");
    }
    const actionName = status === 'APPROVED' ? '승인' : (status === 'REJECTED' ? '반려' : '의견 등록');
    if(!window.confirm(`${actionName} 처리하시겠습니까?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://ecpsystem.site:8080/api/documents/${id}/approve`, 
        { status, comment: approvalMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('처리가 완료되었습니다.');
      window.location.reload(); 
    } catch (e) { 
      alert("처리 중 오류가 발생했습니다."); 
    }
  };

  const handleUpdate = async () => {
    if(!window.confirm("수정한 내용으로 기안서를 갱신하시겠습니까?")) return;
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('content', editorRef.current.innerHTML);
      newFiles.forEach(file => formData.append('files', file));
      
      // 🌟 수정된 참조자 목록 전송
      selectedObservers.forEach(obs => formData.append('observerIds', obs.id));

      await axios.put(`http://ecpsystem.site:8080/api/documents/${id}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert("수정되었습니다.");
      setIsEditing(false);
      window.location.reload(); 
    } catch (e) {
      console.error("수정 실패 상세:", e.response);
      alert("수정 권한이 없거나 서버 오류가 발생했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말로 이 기안서를 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://ecpsystem.site:8080/api/documents/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      alert("삭제되었습니다.");
      navigate('/approval');
    } catch (e) { 
      alert("삭제 실패: 권한이 없거나 서버 오류입니다."); 
    }
  };

  if (loading) return <div className="text-center py-5 text-white mt-5"><h5><FaHistory className="fa-spin me-2"/>데이터를 불러오는 중...</h5></div>;
  if (!doc || !me) return null;

  const myId = String(me.id).trim();
  const writerId = String(doc.writerId).trim();
  const isWriter = myId === writerId; 

  const isAdmin = me.role === 'ROLE_ADMIN' || me.role === 'ADMIN'; 
  const isDivisionHead = me.position === '본부장'; 
  const isMyTeamLeader = (me.role === 'ROLE_MANAGER' || me.role === 'ROLE_LEADER' || me.position === '팀장') && me.deptName === doc.deptName; 

  const isProcessed = doc.approvals?.filter(a => String(a.approverId).trim() !== writerId).some(a => a.status !== 'PENDING');
  const isApprover = doc.approvals?.some(app => String(app.approverId).trim() === myId);
  const isObserver = doc.observers?.some(obs => String(obs.id).trim() === myId);
  
  const canEdit = isWriter && doc.status === 'PENDING' && !isProcessed;
  const canDelete = (isWriter && doc.status === 'PENDING' && !isProcessed) || isAdmin || isDivisionHead || (isMyTeamLeader && doc.status === 'PENDING');
  
  const hasAccess = isWriter || isAdmin || isDivisionHead || isMyTeamLeader || isApprover || isObserver;

  const nextApprover = doc.approvals?.filter(app => app.status === 'PENDING').sort((a, b) => (a.order || 0) - (b.order || 0))[0];
  const isMyTurn = nextApprover && String(nextApprover.approverId).trim() === myId;

  const isImage = (filename) => filename && /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);

  const renderImagePreview = (file) => (
    <Popover id="popover-basic" className="bg-dark border-secondary shadow-lg">
      <Popover.Body className="p-1">
        <Image src={`http://ecpsystem.site:8080/api/files/view/${file.id}`} style={{ maxWidth: '300px', borderRadius: '8px' }} />
      </Popover.Body>
    </Popover>
  );

  const handleEditorClick = (e) => {
    if (!isEditing) return; 
    if (e.target.innerText === '□') {
      e.target.innerText = '☑';
      e.target.style.color = '#0dcaf0';
    } else if (e.target.innerText === '☑') {
      e.target.innerText = '□';
      e.target.style.color = '#adb5bd';
    }
  };

  if (!hasAccess) {
    return (
      <div style={{ backgroundColor: '#0b0c10', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container>
          <Card className="bg-dark border-danger p-5 text-center shadow-lg mx-auto" style={{ borderRadius: '20px', maxWidth: '500px', borderWidth: '2px' }}>
            <div className="d-flex flex-column align-items-center">
              <FaLock size={60} className="text-danger mb-4" />
              <h2 className="text-white fw-bold mb-3" style={{ letterSpacing: '-1px' }}>문서 접근 권한 없음</h2>
              <p className="text-white-50 mb-4" style={{ lineHeight: '1.6' }}>본인이 작성한 문서이거나,<br />관련 결재권자만 열람할 수 있는 보안 문서입니다.</p>
              <Button variant="outline-info" className="px-5 py-2 fw-bold rounded-pill" onClick={() => navigate('/approval')}>목록으로 돌아가기</Button>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  // 화면에 보여줄 참조자 리스트 (수정 중이면 selectedObservers, 아니면 doc.observers)
  const displayObservers = isEditing ? selectedObservers : (doc.observers || []);

  return (
    <div style={{ backgroundColor: '#0b0c10', minHeight: '100vh', color: '#adb5bd', fontFamily: "'Pretendard', sans-serif" }}>
      <style>{`
        .modern-card { background: #1a1c23; border: 1px solid rgba(13, 202, 240, 0.1); border-radius: 12px; position: relative; overflow: hidden; }
        .modern-card::before { content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 4px; background: #0dcaf0; }
        .custom-input { background-color: rgba(0,0,0,0.3) !important; color: #fff !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 8px; transition: border 0.3s; }
        
        .info-widget-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; padding: 12px; display: flex; align-items: center; transition: background 0.2s; }
        .info-icon-wrapper { background: rgba(0,0,0,0.4); width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; color: #0dcaf0; margin-right: 14px; font-size: 1.1rem; }
        
        .doc-content-view table { width: 100% !important; border-collapse: collapse !important; border: 1px solid rgba(255,255,255,0.1) !important; }
        .doc-content-view th { background-color: rgba(255,255,255,0.03) !important; color: #0dcaf0 !important; border: 1px solid rgba(255,255,255,0.1) !important; padding: 18px !important; }
        .doc-content-view td { border: 1px solid rgba(255,255,255,0.1) !important; padding: 18px !important; color: #fff !important; }
        
        /* 채팅 히스토리 UI */
        .chat-container { display: flex; flex-direction: column; gap: 12px; padding-right: 5px; height: 100%; }
        .chat-message { display: flex; gap: 8px; align-items: flex-start; }
        .chat-message.me { flex-direction: row-reverse; }
        .chat-avatar { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: rgba(255, 255, 255, 0.05); color: #adb5bd; flex-shrink: 0; border: 1px solid rgba(255, 255, 255, 0.1); }
        .chat-message.me .chat-avatar { background: rgba(13, 202, 240, 0.1); color: #0dcaf0; border-color: rgba(13, 202, 240, 0.2); }
        .chat-bubble-wrapper { max-width: 80%; display: flex; flex-direction: column; }
        .chat-message.me .chat-bubble-wrapper { align-items: flex-end; }
        .chat-name { font-size: 0.75rem; color: #adb5bd; margin-bottom: 4px; font-weight: 600; }
        .chat-message.me .chat-name { display: none; }
        .chat-bubble { padding: 10px 14px; border-radius: 12px; font-size: 0.85rem; line-height: 1.4; word-break: break-word; }
        .chat-message.other .chat-bubble { background: rgba(255, 255, 255, 0.05); color: #e0e0e0; border-top-left-radius: 2px; }
        .chat-message.me .chat-bubble { background: rgba(13, 202, 240, 0.15); color: #fff; border-top-right-radius: 2px; border: 1px solid rgba(13, 202, 240, 0.3); }
        
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #0dcaf0; border-radius: 10px; }
        
        /* 🌟 문서 참조자 리스트 (New 트렌디 디자인) */
        .observer-list { 
  display: flex; 
  flex-direction: column; 
  gap: 8px; 
  max-height: 140px; /* 고정 높이를 주어 4명 이상일 때 스크롤 발생 */
  overflow-y: auto; 
  padding-right: 4px; 
  margin-bottom: 8px; 
}
        .observer-item { display: flex; align-items: center; background: rgba(255, 255, 255, 0.03); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05); transition: background 0.2s; }
        .observer-item:hover { background: rgba(255, 255, 255, 0.06); }
        .obs-avatar { width: 30px; height: 30px; background: rgba(0,0,0,0.3); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #adb5bd; margin-right: 12px; }
        .obs-info { display: flex; flex-direction: column; flex-grow: 1; }
        .obs-name { font-size: 0.85rem; color: #fff; font-weight: 600; }
        .obs-dept { font-size: 0.65rem; color: #6c757d; }
        .btn-dashed { border: 1px dashed rgba(13, 202, 240, 0.5); background: transparent; color: #0dcaf0; transition: all 0.3s; }
        .btn-dashed:hover { background: rgba(13, 202, 240, 0.1); border-color: #0dcaf0; color: #fff; }
        .observer-select-item:hover { background: rgba(255, 255, 255, 0.05) !important; }
        /* 🌟 [추가] 파일 썸네일 상자 스타일: 이미지 크기에 딱 맞게 보정 */
.file-thumb-box {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  overflow: hidden; /* 이미지가 상자를 벗어나지 않게 함 */
  background: transparent;
  flex-shrink: 0;
}
.file-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 이미지가 상자에 꽉 차도록 비율 유지하며 채움 */
}
        /* 🌟 코멘트 작성 텍스트에디터 (New 트렌디 디자인) */
        .comment-box-wrapper { background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; }
        .comment-box-wrapper:focus-within { border-color: rgba(13, 202, 240, 0.5); background: rgba(0, 0, 0, 0.3); }
        .comment-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .comment-my-avatar { width: 24px; height: 24px; background: rgba(13, 202, 240, 0.1); color: #0dcaf0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; }
        .comment-textarea { background: transparent !important; border: none !important; color: #fff !important; padding: 0 !important; font-size: 0.85rem; resize: none; box-shadow: none !important; }
        .comment-textarea::placeholder { color: rgba(255,255,255,0.2); }

        /* 모던한 결재선 디자인 (카드 스타일 UI) */
        .modern-step-container { display: flex; gap: 16px; overflow-x: auto; padding: 10px 0 20px 0; }
        .modern-step-card { flex: 1; min-width: 120px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
        .modern-step-card.approved { border-top: 3px solid #0dcaf0; background: linear-gradient(180deg, rgba(13, 202, 240, 0.05) 0%, rgba(0,0,0,0) 100%); }
        .modern-step-card.rejected { border-top: 3px solid #dc3545; background: linear-gradient(180deg, rgba(220, 53, 69, 0.05) 0%, rgba(0,0,0,0) 100%); }
        .modern-step-card.pending { border-top: 3px solid rgba(255, 255, 255, 0.1); }
        
        .step-role { font-size: 0.8rem; color: #adb5bd; margin-bottom: 12px; font-weight: 600; letter-spacing: 0.5px; }
        .step-status-icon { display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 50%; font-size: 1.2rem; margin-bottom: 10px; }
        .approved .step-status-icon { background: rgba(13, 202, 240, 0.1); color: #0dcaf0; }
        .rejected .step-status-icon { background: rgba(220, 53, 69, 0.1); color: #dc3545; }
        .pending .step-status-icon { background: rgba(255, 255, 255, 0.05); color: #6c757d; }
        
        .step-label { font-size: 0.9rem; font-weight: bold; margin-bottom: 4px; }
        .step-date { font-size: 0.7rem; color: rgba(255, 255, 255, 0.4); font-family: monospace; }
        
        .control-panel { background: #16181d; border: 1px solid #0dcaf0; border-radius: 12px; padding: 20px; position: relative; overflow: hidden; }
        .editing-active { border: 2px dashed #0dcaf0 !important; outline: none; background: rgba(13, 202, 240, 0.02); border-radius: 8px; padding: 10px; }
      `}</style>

      <Header currentUser={me}     
      />

      <Container fluid className="py-5" style={{ maxWidth: '1600px' }}>
        <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom border-secondary border-opacity-25">
          <div>
            <Badge bg={doc.status === 'PENDING' ? 'warning' : doc.status === 'APPROVED' ? 'success' : 'danger'} text={doc.status === 'PENDING' ? 'dark' : 'white'} className="mb-2 px-3 py-2 rounded-pill fw-bold shadow-sm">{doc.status}</Badge>
            <h1 className="fw-bold mb-0 text-white mt-1" style={{ fontSize: '2rem', letterSpacing: '-1px' }}>
              <span className="text-info me-3">[{doc.type?.split(' - ')[1] || doc.type}]</span> 
              <span className="font-monospace fs-4 text-white-50">{getFormattedId(doc.createdAt, doc.id, doc.type)}</span>
            </h1>
          </div>
          <div className="text-end d-flex align-items-center gap-2">
            {!isEditing ? (
              <>
                {canEdit && <Button variant="outline-info" className="rounded-pill px-3" onClick={() => setIsEditing(true)}><FaEdit className="me-2"/>수정</Button>}
                {canDelete && <Button variant="outline-danger" className="rounded-pill px-3" onClick={handleDelete}><FaTrash className="me-2"/>삭제</Button>}
              </>
            ) : (
              <>
                <Button variant="info" className="rounded-pill px-3 text-dark fw-bold" onClick={handleUpdate}><FaSave className="me-2"/>저장</Button>
                <Button variant="outline-light" className="rounded-pill px-3" onClick={() => { setIsEditing(false); setSelectedObservers(doc.observers || []); }}><FaTimes className="me-2"/>취소</Button>
              </>
            )}
            <Button variant="link" className="text-info text-decoration-none p-0 fw-bold d-flex align-items-center mb-1 ms-3" onClick={() => navigate('/approval')}>
              <div className="bg-info bg-opacity-10 rounded-circle p-2 me-2 d-flex"><FaArrowLeft /></div> 
              목록으로 돌아가기
            </Button>
          </div>
        </div>

        <Row className="g-4 align-items-stretch">
          
          <Col lg={7} className="d-flex flex-column gap-4">
            <Card className="modern-card shadow-lg flex-grow-1">
              <Card.Body className="p-4 p-md-5">
                <div className="d-flex justify-content-between align-items-center mb-5 border-bottom border-secondary border-opacity-25 pb-4">
                  <h3 className="fw-bold mb-0 text-white">{doc.title}</h3>
                  <Badge bg={doc.priority === '긴급' ? 'danger' : 'secondary'} className="px-3 py-2 ms-3 fs-6 rounded-3 shadow-sm">{doc.priority}</Badge>
                </div>
                <div 
                  ref={editorRef}
                  className={`doc-content-view ${isEditing ? 'editing-active' : ''}`}
                  style={{ minHeight: '300px', cursor: isEditing ? 'text' : 'default' }} 
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onClick={handleEditorClick}
                  dangerouslySetInnerHTML={{ __html: doc.content }} 
                />
              </Card.Body>
            </Card>

            <Card className="modern-card shadow-lg" style={{ minHeight: '150px' }}>
              <Card.Body className="p-4">
                <h6 className="text-info fw-bold mb-3 pb-2 border-bottom border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
                  <span><FaPaperclip className="me-2"/>파일 증빙 자료 ({doc.files?.length || 0})</span>
                  {isEditing && <Form.Control type="file" multiple size="sm" className="w-50 bg-dark border-secondary text-white shadow-none" onChange={(e) => setNewFiles(Array.from(e.target.files))} />}
                </h6>
{/* 🌟 [완벽 수정] 파일 리스트 반복문 영역 */}
              <div className="d-flex flex-wrap gap-2 mt-3">
                {doc.files && doc.files.length > 0 ? (
                  doc.files.map((file, idx) => (
                    // 🌟 1. 뒷배경 까맣게 만들던 bg-black bg-opacity-25 제거, 깔끔한 투명 배경과 테두리만 남김
                    <div key={idx} className="rounded-3 p-2 border border-secondary border-opacity-25 d-flex align-items-center" style={{ width: '48%', background: 'transparent' }}>
                      
                      {/* 🌟 2. 이미지만 딱 보이게 둥근 테두리 적용. hover 시 배경 안보이게 완벽 차단 */}
                      {isImage(file.oriName) ? (
                        <div style={{ width: '38px', height: '38px', flexShrink: 0, borderRadius: '6px', overflow: 'hidden', backgroundColor: 'transparent !important' }} className="me-2">
                           <img 
                             src={`http://ecpsystem.site:8080/api/files/view/${file.id}`} 
                             style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', backgroundColor: 'transparent' }} 
                             alt="thumb" 
                             draggable="false" 
                           />
                        </div>
                      ) : (
                        <div className="d-flex align-items-center justify-content-center me-2" style={{ width: '38px', height: '38px', flexShrink: 0, background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                          <FaFileAlt className="text-info" size={18}/>
                        </div>
                      )}
                      
                      <div className="flex-grow-1 overflow-hidden me-2">
                        {isImage(file.oriName) ? (
                          <OverlayTrigger placement="top" overlay={renderImagePreview(file)}>
                            <span className="text-white fw-medium small preview-trigger text-truncate d-block" style={{ cursor: 'pointer' }}>{file.oriName}</span>
                          </OverlayTrigger>
                        ) : (
                          <span className="text-white fw-medium small text-truncate d-block">{file.oriName}</span>
                        )}
                      </div>
                      <Button variant="outline-info" size="sm" className="rounded-pill px-3" style={{ fontSize: '0.7rem' }} href={`http://ecpsystem.site:8080/api/files/download/${file.id}`}>다운</Button>
                    </div>
                  ))
                ) : <span className="text-white-50 small m-0 py-2 w-100 text-center">첨부된 파일 증빙 자료가 없습니다.</span>}
              </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={5} className="d-flex flex-column h-100">
            
            <Row className="g-3 mb-3">
              <Col md={6}>
                <Card className="modern-card shadow-sm border-0" style={{ height: '320px' }}>
                  <Card.Body className="p-3 d-flex flex-column">
                    <h6 className="text-info fw-bold mb-3 pb-2 border-bottom border-secondary border-opacity-25"><FaUserTie className="me-2"/>기안자 정보</h6>
                    <div className="flex-grow-1 d-flex flex-column justify-content-center gap-2">
                      <div className="info-widget-box p-3"><div className="info-icon-wrapper"><FaUserTie /></div><div className="flex-grow-1"><div className="text-white-50" style={{fontSize: '0.75rem'}}>기안자</div><div className="text-white fw-bold" style={{fontSize: '0.9rem'}}>{doc.drafterName} {doc.position}</div></div></div>
                      <div className="info-widget-box p-3"><div className="info-icon-wrapper text-warning"><FaBuilding /></div><div className="flex-grow-1"><div className="text-white-50" style={{fontSize: '0.75rem'}}>소속 부서</div><div className="text-white fw-bold" style={{fontSize: '0.9rem'}}>{doc.deptName}</div></div></div>
                      <div className="info-widget-box p-3"><div className="info-icon-wrapper text-success"><FaClock /></div><div className="flex-grow-1"><div className="text-white-50" style={{fontSize: '0.75rem'}}>상신 일시</div><div className="text-white fw-bold font-monospace" style={{fontSize: '0.85rem'}}>{doc.createdAt?.replace('T', ' ').substring(0, 16)}</div></div></div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={6}>
                <Card className="modern-card shadow-sm border-0" style={{ height: '320px' }}>
                  <Card.Body className="p-3 d-flex flex-column">
                    <h6 className="text-info fw-bold mb-3 pb-2 border-bottom border-secondary border-opacity-25"><FaHistory className="me-2"/>결재 히스토리</h6>
                    <div className="overflow-auto flex-grow-1 pe-2 custom-scroll chat-container pt-2">
                      {doc.approvals && doc.approvals.some(a => a.comment || a.status !== 'PENDING') ? (
                        doc.approvals.filter(a => a.comment || a.status !== 'PENDING').map((app, idx) => {
                          const isMe = String(app.approverId).trim() === String(me.id).trim();
                          return (
                            <div key={idx} className={`chat-message ${isMe ? 'me' : 'other'}`}>
                              <div className="chat-avatar"><FaUserTie size={14}/></div>
                              <div className="chat-bubble-wrapper">
                                <div className="chat-name">{app.approverName}</div>
                                <div className="chat-bubble shadow-sm">{app.comment || <span className="opacity-50 font-italic">의견 없음</span>}</div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center mt-5"><FaCommentDots size={30} className="text-secondary opacity-25 mb-3"/><p className="text-white-50" style={{fontSize:'0.8rem'}}>아직 내역이 없습니다.</p></div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="g-3 mb-3">
              <Col md={6} className="d-flex">
                <Card className="modern-card shadow-sm border-0 w-100" style={{ height: '280px' }}>
                  <Card.Body className="p-3 d-flex flex-column">
                    <h6 className="text-info fw-bold mb-3 pb-2 border-bottom border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
                      <span><FaLink className="me-2"/>문서 참조자</span>
                      <Badge bg="secondary" className="rounded-pill">{displayObservers.length}</Badge>
                    </h6>
                    
                    <div className="flex-grow-1 d-flex flex-column">
                      {/* 🌟 수정: DB에서 받아온 실제 참조자 리스트 뿌려주기 */}
                     <div className="observer-list custom-scroll flex-grow-1">
  {displayObservers.length > 0 ? (
    displayObservers.map((obs, idx) => (
      <div key={idx} className="observer-item">
        <div className="obs-avatar"><FaUserTie size={12}/></div>
        <div className="obs-info">
          <span className="obs-name">{obs.name} {obs.position}</span>
          <span className="obs-dept">{obs.deptName}</span>
        </div>
                            <div className="ms-auto">
          {obs.isRead || obs.readAt ? (
            <Badge className="bg-info bg-opacity-25 text-info border border-info border-opacity-50 px-2 py-1 rounded-pill" style={{ fontSize: '0.65rem' }}>
              읽음
            </Badge>
          ) : (
            <Badge className="bg-secondary bg-opacity-25 text-white-50 border border-secondary border-opacity-25 px-2 py-1 rounded-pill" style={{ fontSize: '0.65rem' }}>
              미확인
            </Badge>
          )}
        </div>
      </div>
                          ))
                        ) : (
                          <div className="text-white-50 small mt-3 text-center">지정된 참조자가 없습니다.</div>
                        )}
                      </div>
                      
                      {/* 🌟 수정: isEditing(기안자 && 승인전) 상태일 때만 참조자 추가 버튼 노출 */}
                      {isEditing && (
                        <Button className="btn-dashed w-100 py-2 rounded-3 text-sm fw-bold mt-auto" size="sm" onClick={() => setShowObserverModal(true)}>
                          <FaUserPlus className="me-2"/> 참조자 수정하기
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} className="d-flex">
                <Card className="modern-card shadow-sm border-0 w-100" style={{ height: '280px' }}>
                  <Card.Body className="p-3 d-flex flex-column">
                    <h6 className="text-info fw-bold mb-3 pb-2 border-bottom border-secondary border-opacity-25"><FaCommentDots className="me-2"/>코멘트 작성</h6>
                    
                    <div className="flex-grow-1 d-flex flex-column">
                      <div className="comment-box-wrapper flex-grow-1 mb-2">
                        <div className="comment-header">
                          <div className="comment-my-avatar"><FaUserTie /></div>
                          <span className="text-white-50 fw-bold" style={{fontSize: '0.75rem'}}>{me?.name || '내 프로필'}</span>
                        </div>
                        <Form.Control 
                          as="textarea" 
                          className="comment-textarea flex-grow-1" 
                          placeholder="결재 의견이나 코멘트를 자유롭게 남겨주세요..." 
                          value={approvalMessage} 
                          onChange={(e) => setApprovalMessage(e.target.value)} 
                          maxLength={500}
                        />
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center mt-auto">
                        <span className="text-secondary font-monospace" style={{fontSize: '0.7rem'}}>
                          {approvalMessage.length} / 500
                        </span>
                        {isMyTurn || (isWriter && doc.status === 'PENDING') ? (
                          <Button variant="info" size="sm" className="fw-bold px-3 rounded-pill" onClick={() => handleAction('COMMENT')}>
                            등록하기
                          </Button>
                        ) : (
                          <Button variant="outline-secondary" size="sm" className="fw-bold px-3 rounded-pill" disabled>
                            <FaLock className="me-1"/> 권한 없음
                          </Button>
                        )}
                      </div>
                    </div>

                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <div className="control-panel shadow-lg p-4 d-flex flex-column mt-auto">
              <div className="fw-bold text-info mb-4 d-flex align-items-center fs-10"><FaShieldAlt className="me-2"/> 결재 승인 / 반려 제어판</div>
              
              <div className="modern-step-container custom-scroll">
                <div className="modern-step-card approved">
                  <div className="step-role">기안</div>
                  <div className="step-status-icon"><FaCheck /></div>
                  <div className="step-label text-info">상신 완료</div>
                  <div className="step-date">{doc.createdAt?.substring(5, 10)}</div>
                </div>

                {doc.approvals?.filter(a => String(a.approverId).trim() !== String(doc.writerId).trim()).map((line, idx) => (
                  <div key={idx} className={`modern-step-card ${line.status === 'APPROVED' ? 'approved' : line.status === 'REJECTED' ? 'rejected' : 'pending'}`}>
                    <div className="step-role">{line.position || '결재'}</div>
                    <div className="step-status-icon">
                      {line.status === 'APPROVED' ? <FaCheck /> : line.status === 'REJECTED' ? <FaTimes /> : <FaClock />}
                    </div>
                    <div className={`step-label ${line.status === 'APPROVED' ? 'text-info' : line.status === 'REJECTED' ? 'text-danger' : 'text-secondary'}`}>
                      {line.status === 'APPROVED' ? '승인' : line.status === 'REJECTED' ? '반려' : '대기중'}
                    </div>
                    <div className="step-date">{line.approvedAt ? line.approvedAt.substring(5, 10) : '-'}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-top border-secondary border-opacity-25">
                {isMyTurn ? (
                  <Row className="g-3">
                    <Col><Button variant="info" className="w-100 fw-bold text-dark py-3 rounded-3 shadow-sm fs-6" onClick={() => handleAction('APPROVED')}><FaCheck className="me-2"/>결재 승인</Button></Col>
                    <Col><Button variant="outline-danger" className="w-100 fw-bold py-3 rounded-3 shadow-sm fs-6" onClick={() => handleAction('REJECTED')}><FaTimes className="me-2"/>결재 반려</Button></Col>
                  </Row>
                ) : (
                   <div className="text-center py-3 bg-black bg-opacity-50 rounded-3 border border-secondary border-opacity-25">
                     <span className="text-white-50 fw-bold">{doc.status !== 'PENDING' ? "결재가 종료된 문서입니다." : "현재 귀하의 결재 차례가 아닙니다."}</span>
                   </div>
                )}
              </div>
            </div>

          </Col>
        </Row>
      </Container>
      <Footer />

      {/* 🌟 신규: 폴더 트리 방식의 참조자 선택 모달 (수정 시에만 사용됨) */}
      <Modal show={showObserverModal} onHide={() => setShowObserverModal(false)} centered contentClassName="bg-dark text-white border-info shadow-lg" style={{fontFamily: "'Pretendard', sans-serif"}}>
        <Modal.Header closeButton closeVariant="white" className="border-secondary border-opacity-25 bg-black bg-opacity-25">
          <Modal.Title className="text-info fw-bold fs-5"><FaUserPlus className="me-2"/>참조자 선택</Modal.Title>
        </Modal.Header>
        <Modal.Body className="custom-scroll p-4" style={{ maxHeight: '450px', overflowY: 'auto' }}>
          {Object.keys(usersByDept).length > 0 ? (
            Object.keys(usersByDept).map(dept => (
              <div key={dept} className="mb-3">
                {/* 부서 (폴더) 토글 영역 */}
                <div 
                  className="d-flex align-items-center p-2 rounded" 
                  style={{ background: 'rgba(255,255,255,0.03)', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}
                  onClick={() => toggleDept(dept)}
                >
                  {expandedDepts[dept] ? <FaFolderOpen className="text-warning me-2 fs-5"/> : <FaFolder className="text-warning me-2 fs-5"/>}
                  <span className="fw-bold text-white">{dept}</span>
                  <Badge bg="secondary" className="ms-auto rounded-pill">{usersByDept[dept].length}</Badge>
                </div>
                
                {/* 부서원 리스트 영역 */}
                {expandedDepts[dept] && (
                  <div className="ps-3 mt-2 border-start border-secondary border-opacity-25 ms-3">
                    {usersByDept[dept].map(user => {
                      const isSelected = selectedObservers.some(u => u.id === user.id);
                      return (
                        <div 
                          key={user.id} 
                          className="d-flex align-items-center p-2 rounded observer-select-item mb-1"
                          style={{ cursor: 'pointer', background: isSelected ? 'rgba(13, 202, 240, 0.1)' : 'transparent', transition: 'background 0.2s' }}
                          onClick={() => toggleObserver(user)}
                        >
                          {isSelected ? <FaCheckSquare className="text-info me-3 fs-5"/> : <FaRegSquare className="text-secondary me-3 fs-5"/>}
                          <div className="bg-black bg-opacity-50 p-1 rounded d-flex align-items-center justify-content-center me-2" style={{width:'28px', height:'28px'}}>
                            <FaUserTie className="text-white-50 small"/>
                          </div>
                          <span className="text-white fw-medium">{user.name} <span className="text-white-50 small">{user.position}</span></span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-white-50 py-5">선택 가능한 유저가 없습니다.</div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-secondary border-opacity-25 bg-black bg-opacity-25">
          <Button variant="info" className="w-100 fw-bold rounded-pill text-dark py-2" onClick={() => setShowObserverModal(false)}>
            선택 완료 ({selectedObservers.length}명)
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default ApprovalDetailPage;