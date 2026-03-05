import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaSave, FaTimes, FaInfoCircle, FaChevronRight, FaPaperclip, FaFileSignature, FaUserTie, FaArrowLeft,
  FaFolder, FaFolderOpen, FaUserPlus, FaCheckSquare, FaRegSquare, FaLink // 🌟 참조자 모달용 아이콘 추가
} from 'react-icons/fa'; 
import Header from '../main/Header';
import Footer from '../main/Footer';

const ApprovalWritePage = () => {
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const [realUser, setRealUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [autoApprovers, setAutoApprovers] = useState([]);
  const [me, setMe] = useState(null);
  // 🌟 문서 참조자 관련 State 추가
  const [usersByDept, setUsersByDept] = useState({});
  const [selectedObservers, setSelectedObservers] = useState([]);
  const [showObserverModal, setShowObserverModal] = useState(false);
  const [expandedDepts, setExpandedDepts] = useState({});

  const [formData, setFormData] = useState({
    type: '인사 - 휴가 신청서', 
    docNo: '', 
    title: '',
    content: '', 
    priority: '보통',
    retention: '5년'
  });

  const today = new Date().toISOString().split('T')[0];

  const typeCodes = { 
    '인사 - 휴가 신청서': '01', '보안 - 시설 출입 신청': '02', '보안 - 보안 사고 보고': '03', 
    '개발 - 서버 및 인프라 요청': '04', '지원 - 지출 결의서': '05', '지원 - 비품 신청서': '06', '기획 - 업무 품의서': '07', 
    '업무 - 주간/정기 보고': '08'
  };

  const tableStyle = "width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #333; font-size: 15px; background-color: #1a1a1a; letter-spacing: -0.5px;";
  const thStyle = "width: 160px; background-color: #222529; color: #0dcaf0; border: 1px solid #333; padding: 16px; text-align: left; font-weight: 700; border-right: 2px solid #333;";
  const tdStyle = "border: 1px solid #333; padding: 16px; color: #ffffff; vertical-align: middle; line-height: 1.6;";
  const cbStr = 'class="cb" style="cursor:pointer; user-select:none; color:#0dcaf0; font-weight:bold; margin-right:4px;"';

  const docTemplates = { 
    '인사 - 휴가 신청서': `
      <div style="text-align:center; font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 30px; letter-spacing: 10px;">[ 휴 가 신 청 서 ]</div>
      <table style="${tableStyle}">
        <tr><td style="${thStyle}">휴가 구분</td><td style="${tdStyle}"><span ${cbStr}>□</span> 연차 &nbsp;&nbsp; <span ${cbStr}>□</span> 반차 &nbsp;&nbsp; <span ${cbStr}>□</span> 병가 &nbsp;&nbsp; <span ${cbStr}>□</span> 경조사 &nbsp;&nbsp; <span ${cbStr}>□</span> 기타</td></tr>
        <tr><td style="${thStyle}">휴가 기간</td><td style="${tdStyle}">2026-00-00 ~ 2026-00-00 (총 0일)</td></tr>
        <tr><td style="${thStyle}">기안자</td><td style="${tdStyle}">소속: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / 직급: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / 성명: </td></tr>
        <tr><td style="${thStyle}">업무 대행자</td><td style="${tdStyle}">부서: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / 성명: </td></tr>
        <tr><td style="${thStyle}">비상 연락처</td><td style="${tdStyle}">010-0000-0000</td></tr>
        <tr><td style="${thStyle}">신청 사유</td><td style="${tdStyle}" height="150" valign="top"><div style="color: #888;">※ 사유를 구체적으로 입력하세요.</div></td></tr>
      </table>`,
    '지원 - 지출 결의서': `
      <div style="text-align:center; font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 30px; letter-spacing: 10px;">[ 지 출 결 의 서 ]</div>
      <table style="${tableStyle}">
        <tr><td style="${thStyle}">지출 일자</td><td style="${tdStyle}">2026-00-00</td></tr>
        <tr><td style="${thStyle}">지출 금액</td><td style="${tdStyle}">₩ 0 (금 원정)</td></tr>
        <tr><td style="${thStyle}">결제 수단</td><td style="${tdStyle}"><span ${cbStr}>□</span> 법인카드(카드번호:    ) &nbsp;&nbsp; <span ${cbStr}>□</span> 개인환급</td></tr>
        <tr><td style="${thStyle}">계정 과목</td><td style="${tdStyle}">복리후생비 / 소모품비 / 여비교통비 / 접대비</td></tr>
        <tr><td style="${thStyle}">지출 상세 내역</td><td style="${tdStyle}" height="150" valign="top"><div style="color: #888;">※ 사용 목적 및 영수증 증빙 번호를 입력하세요.</div></td></tr>
      </table>`,
    '지원 - 비품 신청서': `
      <div style="text-align:center; font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 30px; letter-spacing: 10px;">[ 비 품 신 청 서 ]</div>
      <table style="${tableStyle}">
        <tr><td style="${thStyle}">품목 구분</td><td style="${tdStyle}"><span ${cbStr}>□</span> IT/PC장비 &nbsp;&nbsp; <span ${cbStr}>□</span> 사무/문구 &nbsp;&nbsp; <span ${cbStr}>□</span> 가구/집기 &nbsp;&nbsp; <span ${cbStr}>□</span> S/W &nbsp;&nbsp; <span ${cbStr}>□</span> 기타</td></tr>
        <tr><td style="${thStyle}">품명 및 모델명</td><td style="${tdStyle}"><div style="color: #888;">※ 정확한 제품명이나 모델명을 입력하세요.</div></td></tr>
        <tr><td style="${thStyle}">수량 및 예상 단가</td><td style="${tdStyle}">수량: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 개 / 예상 단가: ₩ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (VAT 포함)</td></tr>
        <tr><td style="${thStyle}">수령 희망일</td><td style="${tdStyle}">2026-00-00</td></tr>
        <tr><td style="${thStyle}">신청 사유 및 목적</td><td style="${tdStyle}" height="150" valign="top"><div style="color: #888;">※ 신규 입사자 지급, 기존 물품 고장(수리 불가) 등 구체적인 사유를 입력하세요.</div></td></tr>
        <tr><td style="${thStyle}">구매 참고 링크</td><td style="${tdStyle}"><div style="color: #888;">※ 구매를 희망하는 쇼핑몰 URL이나 참고 자료를 남겨주세요.</div></td></tr>
      </table>`,
    '개발 - 서버 및 인프라 요청': `
      <div style="text-align:center; font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 30px; letter-spacing: 5px;">[ 서버 및 인프라 요청서 ]</div>
      <table style="${tableStyle}">
        <tr><td style="${thStyle}">요청 구분</td><td style="${tdStyle}"><span ${cbStr}>□</span> 신규 인스턴스 &nbsp;&nbsp; <span ${cbStr}>□</span> 스토리지 확장 &nbsp;&nbsp; <span ${cbStr}>□</span> 방화벽 해제</td></tr>
        <tr><td style="${thStyle}">대상 환경</td><td style="${tdStyle}">Production(운영) / Staging(검증) / Development(개발)</td></tr>
        <tr><td style="${thStyle}">필요 사양</td><td style="${tdStyle}">vCPU: &nbsp;&nbsp; / RAM: &nbsp;&nbsp; / Disk: </td></tr>
        <tr><td style="${thStyle}">요청 사유</td><td style="${tdStyle}" height="150" valign="top"><div style="color: #888;">※ 프로젝트명 및 인프라 구성 목적을 입력하세요.</div></td></tr>
      </table>`,
    '보안 - 시설 출입 신청': `
      <div style="text-align:center; font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 30px; letter-spacing: 5px;">[ 시 설 출 입 신 청 서 ]</div>
      <table style="${tableStyle}">
        <tr><td style="${thStyle}">방문자 정보</td><td style="${tdStyle}">업체명: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / 성명: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / 연락처: </td></tr>
        <tr><td style="${thStyle}">출입 장소</td><td style="${tdStyle}"><span ${cbStr}>□</span> 데이터센터(전산실) &nbsp;&nbsp; <span ${cbStr}>□</span> 통제구역 &nbsp;&nbsp; <span ${cbStr}>□</span> 본사</td></tr>
        <tr><td style="${thStyle}">출입 기간</td><td style="${tdStyle}">2026-00-00 00:00 ~ 2026-00-00 00:00</td></tr>
        <tr><td style="${thStyle}">반입 물품</td><td style="${tdStyle}">노트북, 저장매체 등 기록 (없을 시 '없음')</td></tr>
        <tr><td style="${thStyle}">출입 목적</td><td style="${tdStyle}" height="100"></td></tr>
      </table>`,
    '기획 - 업무 품의서': `
      <div style="text-align:center; font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 30px; letter-spacing: 10px;">[ 업 무 품 의 서 ]</div>
      <table style="${tableStyle}">
        <tr><td style="${thStyle}">품의 제목</td><td style="${tdStyle}"></td></tr>
        <tr><td style="${thStyle}">관련 프로젝트</td><td style="${tdStyle}">프로젝트명 입력</td></tr>
        <tr><td style="${thStyle}">예산 산출 근거</td><td style="${tdStyle}">₩ 0 (VAT 포함/별도)</td></tr>
        <tr><td style="${thStyle}">품의 배경 및 목적</td><td style="${tdStyle}" height="100"></td></tr>
        <tr><td style="${thStyle}">상세 추진 계획</td><td style="${tdStyle}" height="200"></td></tr>
        <tr><td style="${thStyle}">기대 효과</td><td style="${tdStyle}" height="80"></td></tr>
      </table>`,
    '업무 - 주간/정기 보고': `
      <div style="text-align:center; font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 30px; letter-spacing: 5px;">[ 주 간 업 무 보 고 ]</div>
      <table style="${tableStyle}">
        <tr><td style="${thStyle}">보고 기간</td><td style="${tdStyle}">2026-00-00 ~ 2026-00-00</td></tr>
        <tr><td style="${thStyle}">금주 목표</td><td style="${tdStyle}">진척률( % )</td></tr>
        <tr><td style="${thStyle}">금주 업무 실적</td><td style="${tdStyle}" height="150" valign="top"></td></tr>
        <tr><td style="${thStyle}">이슈 및 해결방안</td><td style="${tdStyle}" height="100" valign="top"></td></tr>
        <tr><td style="${thStyle}">차주 업무 계획</td><td style="${tdStyle}" height="150" valign="top"></td></tr>
      </table>`,
    '보안 - 보안 사고 보고': `
      <div style="text-align:center; font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 30px; letter-spacing: 5px;">[ 보 안 사 고 보 고 서 ]</div>
      <table style="${tableStyle}">
        <tr><td style="${thStyle}">사고 유형</td><td style="${tdStyle}"><span ${cbStr}>□</span> 악성코드 &nbsp;&nbsp; <span ${cbStr}>□</span> 기밀유출 &nbsp;&nbsp; <span ${cbStr}>□</span> 물리보안사고 &nbsp;&nbsp; <span ${cbStr}>□</span> 기타</td></tr>
        <tr><td style="${thStyle}">발생 일시/장소</td><td style="${tdStyle}"></td></tr>
        <tr><td style="${thStyle}">피해 규모</td><td style="${tdStyle}"></td></tr>
        <tr><td style="${thStyle}">사고 경위</td><td style="${tdStyle}" height="150" valign="top"></td></tr>
        <tr><td style="${thStyle}">긴급 조치 내용</td><td style="${tdStyle}" height="100"></td></tr>
        <tr><td style="${thStyle}">재발 방지 대책</td><td style="${tdStyle}" height="100"></td></tr>
      </table>`
  };

  const generateDocId = (type) => {
    const now = new Date();
    const mmdd = String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');
    return `DOC-${now.getFullYear()}-${mmdd}-${typeCodes[type] || "00"}-01`;
  };

  useEffect(() => {
    const initPage = async () => {
      const initialType = '인사 - 휴가 신청서';
      const initialTemplate = docTemplates[initialType];
      setFormData(prev => ({ ...prev, docNo: generateDocId(initialType), content: initialTemplate }));
      if (editorRef.current) editorRef.current.innerHTML = initialTemplate;

      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const meRes = await axios.get('http://ecpsystem.site:8080/api/users/me', { headers: { Authorization: `Bearer ${token}` } });
        setMe(meRes.data);
        const me = meRes.data;
        setRealUser(me);

        const usersRes = await axios.get('http://ecpsystem.site:8080/api/users', { headers: { Authorization: `Bearer ${token}` } });
        const allUsers = usersRes.data;

        // 🌟 참조자 모달을 위한 부서별 유저 그룹핑
        const grouped = allUsers.reduce((acc, u) => {
          if(String(u.id) === String(me.id)) return acc; // 본인은 참조자에서 제외
          const dept = u.deptName || '미소속';
          if (!acc[dept]) acc[dept] = [];
          acc[dept].push(u);
          return acc;
        }, {});
        setUsersByDept(grouped);
        
        // 자동 결재선 로직 유지
        const myId = (me.loginId || '').trim();
        const approvers = [];
        let teamLeaderId = '';
        let divisionHeadId = '';

        if (myId.startsWith('dev_')) { teamLeaderId = 'dev_leader'; divisionHeadId = 'head_dev'; }
        else if (myId.startsWith('sec_')) { teamLeaderId = 'sec_leader'; divisionHeadId = 'head_dev'; }
        else if (myId.startsWith('hr_')) { teamLeaderId = 'hr_leader'; divisionHeadId = 'head_strategy'; }
        else if (myId.startsWith('mgt_')) { teamLeaderId = 'mgt_leader'; divisionHeadId = 'head_strategy'; }

        const teamLeader = allUsers.find(u => u.loginId === teamLeaderId);
        const divisionHead = allUsers.find(u => u.loginId === divisionHeadId);

        if (teamLeader && String(teamLeader.id) !== String(me.id)) approvers.push(teamLeader);
        if (divisionHead && String(divisionHead.id) !== String(me.id)) approvers.push(divisionHead);

        setAutoApprovers(approvers);
      } catch (e) { console.error("데이터 로딩 실패:", e); }
    };
    initPage();
  }, []);

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

  const handleTypeChange = (e) => {
    const selectedType = e.target.value;
    const newTemplate = docTemplates[selectedType] || '';
    setFormData({ ...formData, type: selectedType, docNo: generateDocId(selectedType), content: newTemplate });
    if (editorRef.current) editorRef.current.innerHTML = newTemplate;
  };

  const handleContentChange = () => {
    if (editorRef.current) setFormData(prev => ({ ...prev, content: editorRef.current.innerHTML }));
  };

  const handleEditorClick = (e) => {
    if (e.target.innerText === '□') { e.target.innerText = '☑'; e.target.style.color = '#0dcaf0'; }
    else if (e.target.innerText === '☑') { e.target.innerText = '□'; e.target.style.color = '#adb5bd'; }
    handleContentChange();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const form = new FormData();
    form.append('type', formData.type);
    form.append('title', formData.title || `${formData.type} 기안`);
    form.append('content', formData.content);
    form.append('priority', formData.priority);
    
    // 결재자 추가
    if (autoApprovers.length > 0) { autoApprovers.forEach(app => form.append('approverIds', app.id)); }
    else { form.append('approverIds', 1); }

    // 🌟 선택된 참조자 ID 배열 추가
    if (selectedObservers.length > 0) {
      selectedObservers.forEach(obs => form.append('observerIds', obs.id));
    }

    files.forEach(file => form.append('files', file));

    try {
      await axios.post('http://ecpsystem.site:8080/api/documents', form, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      alert('기안서 제출 성공! 🎉');
      navigate('/approval');
    } catch (e) { alert('제출 실패'); }
  };

  return (
    <div style={{ backgroundColor: '#0b0c10', minHeight: '100vh', color: '#adb5bd', fontFamily: "'Pretendard', sans-serif" }}>
      <style>{`
        .modern-input { background-color: transparent !important; color: #fff !important; border: none !important; border-bottom: 1px solid rgba(255,255,255,0.2) !important; border-radius: 0 !important; padding: 10px 5px !important; transition: all 0.3s; }
        .modern-input:focus { border-bottom: 2px solid #0dcaf0 !important; box-shadow: none !important; }
        .modern-input::placeholder { color: #adb5bd !important; opacity: 1 !important; }
        .modern-select { background-color: #16181d !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 8px !important; color: #fff !important; }
        .modern-card { background: #1a1c23; border: 1px solid rgba(13, 202, 240, 0.2); border-radius: 16px; overflow: hidden; position: relative; }
        .modern-card::before { content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 4px; background: #0dcaf0; }
        
        /* 🌟 결재선 UI 모던 리팩토링 (트렌디한 노드 스타일) */
        .approval-pipeline { display: flex; align-items: center; gap: 15px; flex-wrap: wrap; background: rgba(0,0,0,0.3); padding: 24px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }
        .pipeline-node { display: flex; align-items: center; background: rgba(255, 255, 255, 0.03); padding: 14px 24px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); min-width: 200px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        .pipeline-node.active { border-color: rgba(13, 202, 240, 0.5); background: rgba(13, 202, 240, 0.05); }
        .pipeline-arrow { color: #0dcaf0; opacity: 0.5; font-size: 1.4rem; }
        
        .file-input-custom { background-color: transparent !important; color: #adb5bd !important; cursor: pointer; font-size: 0.9rem !important; display: flex; align-items: center; }
        .file-input-custom::-webkit-file-upload-button { background: #1a1c23; color: #0dcaf0; border: 1px solid rgba(13, 202, 240, 0.5); border-radius: 6px; padding: 7px 18px; margin-right: 15px; cursor: pointer; font-weight: 600; font-size: 0.85rem; font-family: 'Pretendard', sans-serif; height: 36px; }

        /* 🌟 참조자 모달 스크롤바 및 아이템 호버 효과 */
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #0dcaf0; border-radius: 10px; }
        .observer-select-item:hover { background: rgba(255, 255, 255, 0.05) !important; }
      `}</style>
      
      <Header currentUser={me} />
      
      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom border-secondary border-opacity-25">
          <div>
            <Badge bg="info" text="dark" className="mb-2 px-3 py-1 rounded-pill fw-bold" style={{ fontSize: '0.85rem' }}>NEW DOCUMENT</Badge>
            <h1 className="fw-bold mb-0 text-white" style={{ fontSize: '2rem', letterSpacing: '-1px' }}>
              <FaFileSignature className="me-2 text-info"/>신규 <span className="text-white-50">기안서 작성</span>
            </h1>
          </div>
          <Button variant="link" className="text-info text-decoration-none p-0 fw-bold d-flex align-items-center mb-1" onClick={() => navigate('/approval')}>
            <div className="bg-info bg-opacity-10 rounded-circle p-2 me-2 d-flex"><FaArrowLeft /></div> 
            목록으로 돌아가기
          </Button>
        </div>

        <Card className="modern-card shadow-lg mb-5">
          <Card.Body className="p-4 p-md-5">
            <Form onSubmit={handleSubmit}>
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-5 p-4 bg-black bg-opacity-50 rounded-4 border border-secondary border-opacity-25">
                <div className="d-flex gap-5">
                  <div>
                    <span className="text-white-50 small fw-bold d-block mb-1">자동 채번 문서번호</span>
                    <span className="text-info fw-bold fs-5 font-monospace">{formData.docNo}</span>
                  </div>
                  <div className="border-start border-secondary border-opacity-50 ps-5">
                    <span className="text-white-50 small fw-bold d-block mb-1">기안 일자</span>
                    <span className="text-white fw-bold fs-5 font-monospace">{today}</span>
                  </div>
                </div>
                <div className="text-end mt-3 mt-md-0">
                  <span className="text-white-50 small fw-bold d-block mb-1">분류 코드</span>
                  <Badge bg="dark" className="border border-info text-info px-3 py-2 fs-6 font-monospace">{typeCodes[formData.type] || '00'}</Badge>
                </div>
              </div>

              <Row className="g-4 mb-5">
                <Col md={3}><Form.Label className="text-info small fw-bold">기안자 및 소속</Form.Label><Form.Control className="modern-input" value={`${realUser?.name || ''} / ${realUser?.deptName || ''}`} readOnly /></Col>
                <Col md={2}><Form.Label className="text-info small fw-bold">직급</Form.Label><Form.Control className="modern-input" value={realUser?.position || ''} readOnly /></Col>
                <Col md={3}><Form.Label className="text-info small fw-bold">기안 양식 선택</Form.Label><Form.Select className="modern-select shadow-none p-2" value={formData.type} onChange={handleTypeChange}>{Object.keys(docTemplates).map(type => <option key={type} value={type}>{type}</option>)}</Form.Select></Col>
                <Col md={2}><Form.Label className="text-danger small fw-bold">긴급도</Form.Label><Form.Select className="modern-select shadow-none p-2" value={formData.priority} onChange={(e)=>setFormData({...formData, priority: e.target.value})}><option value="보통">보통</option><option value="긴급">긴급</option></Form.Select></Col>
                <Col md={2}><Form.Label className="text-info small fw-bold">보존 연한</Form.Label><Form.Select className="modern-select shadow-none p-2" value={formData.retention} onChange={(e)=>setFormData({...formData, retention: e.target.value})}><option>5년</option><option>3년</option><option>1년</option></Form.Select></Col>
              </Row>

              <Form.Group className="mb-5">
                <Form.Label className="text-info fw-bold fs-5 mb-3 border-bottom border-secondary border-opacity-50 pb-2 w-100">기안 제목</Form.Label>
                <Form.Control className="modern-input fs-4 fw-bold" placeholder="결재권자가 한눈에 파악할 수 있는 명확한 제목을 입력하세요." value={formData.title} onChange={(e)=>setFormData({...formData, title: e.target.value})} required />
              </Form.Group>

              <Form.Group className="mb-5">
                <Form.Label className="text-info fw-bold fs-5 mb-3"><FaFileSignature className="me-2"/>기안 상세 내용</Form.Label>
                <div ref={editorRef} className="doc-editor" contentEditable={true} onInput={handleContentChange} onClick={handleEditorClick} suppressContentEditableWarning={true} style={{ minHeight: '500px', padding: '40px', backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderTop: '3px solid #0dcaf0', borderRadius: '8px', outline: 'none', lineHeight: '1.6', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }} />
              </Form.Group>

              {/* 🌟 수정: 둥근 배지를 버리고 모던한 직사각형 SaaS 노드 디자인으로 교체 */}
              <Form.Group className="mb-5">
                <Form.Label className="text-info fw-bold mb-3 d-flex align-items-center"><FaInfoCircle className="me-2"/>지정된 결재 라인 (자동)</Form.Label>
                <div className="approval-pipeline">
                  <div className="pipeline-node active">
                    <div className="bg-info bg-opacity-10 p-2 rounded me-3"><FaUserTie className="text-info fs-5"/></div>
                    <div>
                      <div className="text-info mb-1" style={{fontSize: '0.75rem', fontWeight: 'bold'}}>기안 (상신)</div>
                      <div className="text-white fw-bold fs-6">{realUser?.name} <span className="fw-normal text-white-50">{realUser?.position}</span></div>
                    </div>
                  </div>
                  {autoApprovers.map((approver, index) => (
                    <React.Fragment key={approver.id}>
                      <FaChevronRight className="pipeline-arrow" />
                      <div className="pipeline-node">
                        <div className="bg-secondary bg-opacity-25 p-2 rounded me-3"><FaUserTie className="text-white-50 fs-5"/></div>
                        <div>
                          <div className="text-white-50 mb-1" style={{fontSize: '0.75rem', fontWeight: 'bold'}}>{index === 0 ? '검토 (팀장)' : '승인 (본부장)'}</div>
                          <div className="text-white fw-bold fs-6">{approver.name} <span className="fw-normal text-white-50">{approver.position}</span></div>
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </Form.Group>

              {/* 🌟 신규: 문서 참조자 섹션 추가 (결재 라인 밑에 자연스럽게 배치) */}
              <Form.Group className="mb-5">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <Form.Label className="text-info fw-bold m-0"><FaLink className="me-2"/>문서 참조자 지정 (선택)</Form.Label>
                  <Button variant="outline-info" size="sm" className="rounded-pill px-3" onClick={() => setShowObserverModal(true)}>
                    <FaUserPlus className="me-2"/>참조자 추가
                  </Button>
                </div>
                <div className="p-3 bg-black bg-opacity-50 rounded-4 border border-secondary border-opacity-25" style={{ minHeight: '80px' }}>
                  {selectedObservers.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2">
                      {selectedObservers.map(obs => (
                        <Badge key={obs.id} bg="dark" className="border border-secondary p-2 d-flex align-items-center gap-2 shadow-sm rounded-pill px-3">
                          <FaUserTie className="text-info"/> 
                          <span className="fw-bold">{obs.name}</span> <span className="text-white-50 fw-normal">{obs.deptName}</span>
                          <FaTimes style={{cursor: 'pointer'}} className="text-danger ms-2" onClick={() => toggleObserver(obs)} />
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-white-50 small text-center mt-3">결재 완료 후 문서를 열람할 수 있는 참조자를 지정해주세요. (선택사항)</div>
                  )}
                </div>
              </Form.Group>

              <Form.Group className="mb-5">
                <Form.Label className="text-info fw-bold mb-3"><FaPaperclip className="me-2"/>증빙 파일 첨부 (선택)</Form.Label>
                <div className="p-3 bg-black bg-opacity-50 rounded-4 border border-secondary border-opacity-25 d-flex align-items-center" style={{ minHeight: '70px' }}>
                  <Form.Control type="file" multiple className="file-input-custom shadow-none border-0" onChange={(e) => setFiles(Array.from(e.target.files))} />
                </div>
                {files.length > 0 && (<div className="mt-2 ps-2">{files.map((file, index) => (<div key={index} className="text-info opacity-75 small mb-1 d-flex align-items-center"><FaPaperclip className="me-2" size={12}/><span className="font-monospace">{file.name}</span><span className="ms-2 text-white-50 extra-small">({(file.size / 1024).toFixed(1)} KB)</span></div>))}</div>)}
              </Form.Group>

              <div className="d-flex justify-content-end gap-3 pt-4 border-top border-secondary border-opacity-25">
                <Button variant="outline-secondary" className="px-5 py-3 fw-bold rounded-pill" style={{ fontSize: '1.1rem' }} onClick={()=>navigate(-1)}><FaTimes className="me-2"/>작성 취소</Button>
                <Button type="submit" variant="info" className="px-5 py-3 fw-bold text-dark rounded-pill shadow-lg" style={{ fontSize: '1.1rem' }}><FaSave className="me-2"/>기안 상신하기</Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
      <Footer />

      {/* 🌟 신규: 폴더 트리 방식의 참조자 선택 모달 */}
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

export default ApprovalWritePage;