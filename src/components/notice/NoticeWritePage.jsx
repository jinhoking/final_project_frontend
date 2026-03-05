import React, { useState, useEffect } from 'react'; 
import { Container, Card, Form, Button, Row, Col, Badge } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes, FaFileUpload, FaHistory, FaArrowLeft, FaCamera, FaFileAlt, FaBullhorn, FaEdit } from 'react-icons/fa';
import axios from 'axios'; 

import Header from '../main/Header';
import Footer from '../main/Footer';

const NoticeWritePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({ 
    category: '공지', 
    title: '', 
    content: ''
  });

  const [userInfo, setUserInfo] = useState({
    dept: '', rank: '', name: ''
  });

  const [me, setMe] = useState(null); 

  const [coverPreview, setCoverPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState([]);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get('http://ecpsystem.site:8080/api/users/me', { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setMe(res.data);
        setUserInfo({
          dept: res.data.deptName || '소속없음', 
          rank: res.data.position || '직급없음',
          name: res.data.name || '이름없음'
        });
      } catch (e) {
        console.error("유저 정보 로드 실패:", e);
      }
    };
    fetchMe();

    if (id) {
      setFormData({
        category: '중요',
        title: '2026년도 상반기 전사 보안 교육 실시 안내',
        content: '안녕하세요, 보안팀입니다.\n\n2026년 상반기 임직원 필수 보안 교육 일정을 아래와 같이 안내드립니다.'
      });
    }
  }, [id]);

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleFilesUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachedFiles(files);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      return alert("제목과 내용을 모두 입력해주세요.");
    }

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('content', formData.content);
    submitData.append('category', formData.category);

    if (coverFile) {
      submitData.append('coverImage', coverFile);
    }
    
    attachedFiles.forEach(file => {
      submitData.append('files', file);
    });

    try {
      const token = localStorage.getItem('token');
      if (id) {
        await axios.put(`http://ecpsystem.site:8080/api/notices/${id}`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("게시글이 성공적으로 수정되었습니다!");
      } else {
        await axios.post('http://ecpsystem.site:8080/api/notices', submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("게시글이 성공적으로 등록되었습니다!");
      }
      navigate('/notice'); 
    } catch (e) {
      console.error("게시글 처리 실패:", e);
      alert(e.response?.data?.message || "처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div style={{ backgroundColor: '#0b0c10', minHeight: '100vh', color: 'white', fontFamily: "'Pretendard', sans-serif", paddingBottom: '100px' }}>
      <style>{`
        .write-container { max-width: 1200px; }
        .cover-upload-zone {
          height: 250px; border-radius: 20px; border: 2px dashed rgba(13, 202, 240, 0.4);
          background: rgba(0, 0, 0, 0.3); display: flex; flex-direction: column; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.3s ease; position: relative; overflow: hidden;
        }
        .cover-upload-zone:hover { background: rgba(13, 202, 240, 0.05); border-color: #0dcaf0; }
        .cover-image-preview { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.6; transition: opacity 0.3s; }
        
        .write-card { 
          border: 1px solid rgba(13, 202, 240, 0.2) !important; 
          border-radius: 20px !important; 
          background: #1a1c23 !important; 
          box-shadow: 0 10px 30px rgba(0,0,0,0.5); 
          border-left: 6px solid #0dcaf0 !important; 
        }

        .form-label-custom { color: #0dcaf0; font-weight: 600; font-size: 0.95rem; margin-bottom: 8px; }
        .form-label-info-border {
  border-bottom: 1px solid #0dcaf0 !important; /* 하단 실선 추가 */
  padding-bottom: 6px; /* 텍스트와 선 사이 간격 */
  margin-bottom: 12px; /* 선과 아래 인풋창 사이 간격 */
  display: block; /* 선이 가로로 꽉 차게 설정 */
}
        .custom-input { 
          background-color: #0b0c10 !important; border: 1px solid rgba(255,255,255,0.1) !important; 
          color: #e6e6e6ff !important; padding: 14px 18px !important; font-size: 1rem; border-radius: 12px; transition: all 0.3s; 
        }
        .custom-input:focus { border-color: #0dcaf0 !important; box-shadow: 0 0 0 2px rgba(13, 202, 240, 0.15) !important; color: white; }
        .custom-input::placeholder { color: rgba(255, 255, 255, 0.25) !important; font-weight: 400; }
        
        /* 🌟 [수정] readonly-input의 텍스트 색상을 밝은 흰색(#ffffff)으로 변경 */
.readonly-input { 
  
  border-color:  rgba(255, 255, 255, 0.25)
  color: #0dcaf0 !important; /* 텍스트 하늘색 적용 */
  font-weight: 600; /* 가독성을 위해 굵기 추가 */
  cursor: not-allowed; 
}
        .file-upload-zone { border: 1px dashed rgba(255,255,255,0.2); border-radius: 12px; padding: 40px; text-align: center; cursor: pointer; transition: all 0.3s; background-color: #0b0c10; }
        .file-upload-zone:hover { border-color: #0dcaf0; background: rgba(13, 202, 240, 0.02); }
        .history-box { background: rgba(255, 193, 7, 0.05); border: 1px solid rgba(255, 193, 7, 0.2); border-radius: 12px; padding: 15px 20px; margin-bottom: 25px; color: #ffca2c; font-size: 0.9rem; }
        .btn-cancel { border: 1px solid rgba(255,255,255,0.2) !important; color: #adb5bd !important; border-radius: 50px !important; transition: all 0.2s; }
        .btn-cancel:hover { background-color: rgba(255,255,255,0.1) !important; color: white !important; }
        .btn-submit { background: linear-gradient(45deg, #0dcaf0, #0aa2c0) !important; border: none !important; color: #000 !important; border-radius: 50px !important; transition: all 0.2s; box-shadow: 0 4px 15px rgba(13, 202, 240, 0.3); }
        .btn-submit:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(13, 202, 240, 0.5); }
      `}</style>

      <Header quote={id ? "내용을 수정할 때는 신중하게 검토해 주세요." : "정확하고 신속한 정보 공유를 위해 작성해 주세요."} currentUser={me} />

      <Container className="py-5 write-container">
        {/* 상단 헤더: 전자결재 페이지의 배치를 그대로 적용 */}
        <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom border-secondary border-opacity-25">
          <div>
            <Badge bg="info" text="dark" className="mb-2 px-3 py-1 rounded-pill fw-bold">
              {id ? 'EDIT POST' : 'NEW POST'}
            </Badge>
            <h1 className="fw-bold mb-0 text-white" style={{ fontSize: '2rem', letterSpacing: '-1px' }}>
              {id ? <FaEdit className="me-2 text-info"/> : <FaBullhorn className="me-2 text-info"/>}
              게시글 <span className="text-white-50">{id ? '수정하기' : '작성하기'}</span>
            </h1>
            {/* 헤드라인(설명 문구) */}
            <p className="text-white-50 mt-2 mb-0" style={{ fontSize: '0.95rem' }}>
              {id ? "기존 게시글의 내용을 검토하고 보완하여 최신 정보를 유지하세요." : "팀원들에게 공유할 새로운 소식이나 유용한 정보를 자유롭게 작성해 보세요."}
            </p>
          </div>

          {/* 우측 상단 내비게이션 영역 */}
          <div className="d-flex flex-column align-items-end">
            <Button variant="link" className="text-info text-decoration-none p-0 fw-bold d-flex align-items-center mb-2" onClick={() => navigate(-1)}>
              <div className="bg-info bg-opacity-10 rounded-circle p-2 me-2 d-flex"><FaArrowLeft /></div> 목록으로 돌아가기
            </Button>
            {id && <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill shadow-sm fw-bold">EDIT MODE</Badge>}
          </div>
        </div>

        {id && (
          <div className="history-box d-flex align-items-center">
            <FaHistory className="me-3" size={20} />
            <div><strong className="d-block mb-1">수정 이력 관리 중</strong>모든 수정 사항은 자동으로 버전 관리(Version Control) 되며, 원본 데이터는 서버에 보존됩니다.</div>
          </div>
        )}

        <Form onSubmit={(e) => e.preventDefault()}>
          {/* 카드 섹션 1: 대표 이미지 */}
          <Card className="write-card border-0 mb-4">
            <Card.Body className="p-4 p-md-5">
              <h5 className="form-label-custom mb-3 d-flex align-items-center"><FaCamera className="me-2"/>대표 이미지 (썸네일)</h5>
              <label className="cover-upload-zone w-100 m-0">
                <input type="file" accept="image/*" className="d-none" onChange={handleCoverUpload} />
                {coverPreview && <img src={coverPreview} alt="Cover Preview" className="cover-image-preview" />}
                <div className="text-center position-relative z-1" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                  <FaCamera size={40} className="mb-3 text-info" />
                  <h5 className="fw-bold text-white mb-2">{coverPreview ? '이미지 변경하기' : '클릭하여 커버 이미지 업로드'}</h5>
                  <p className="text-white-50 small mb-0">갤러리 목록에서 가장 먼저 보여질 사진입니다. (16:9 권장)</p>
                </div>
              </label>
            </Card.Body>
          </Card>

          {/* 카드 섹션 2: 상세 내용 */}
          <Card className="write-card border-0">
            <Card.Body className="p-4 p-md-5">
              <div className="p-4 rounded-4 mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Row className="g-3">
                  {/* 🌟 [수정] 라벨의 클래스를 text-white-75에서 text-white로 변경하여 밝게 처리 */}
                  <Col md={4}>
  <Form.Label className="text-info small fw-bold mb-2">소속 부서</Form.Label>
  <Form.Control type="text" className="custom-input readonly-input" value={userInfo.dept} readOnly />
</Col>
<Col md={4}>
  <Form.Label className="text-info small fw-bold mb-2">직급</Form.Label>
  <Form.Control type="text" className="custom-input readonly-input" value={userInfo.rank} readOnly />
</Col>
<Col md={4}>
  <Form.Label className="text-info small fw-bold mb-2">작성자명</Form.Label>
  <Form.Control type="text" className="custom-input readonly-input" value={userInfo.name} readOnly />
</Col>
                </Row>
              </div>

              <Row className="mb-4 g-4">
                <Col md={3}>
                  <Form.Label className="form-label-custom">카테고리</Form.Label>
                  <Form.Select 
                    className="custom-input text-white-50"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="공지" style={{ color: '#555' }}>일반 공지</option>
                    <option value="중요" style={{ color: '#555' }}>필독 공지</option>
                    <option value="이벤트" style={{ color: '#555' }}>이벤트</option>
                  </Form.Select>
                </Col>
                <Col md={9}>
                  <Form.Label className="form-label-custom">게시글 제목</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="제목을 입력해 주세요" 
                    className="custom-input fw-bold"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </Col>
              </Row>

              <Form.Group className="mb-5">
                <Form.Label className="form-label-custom">본문 내용 {id && <span className="text-white-50 fw-normal ms-2 small">(수정 모드)</span>}</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={15} 
                  placeholder="갤러리에 공유할 멋진 소식을 상세히 작성해 주세요..." 
                  className="custom-input"
                  style={{ lineHeight: '1.8', borderRadius: '16px' }}
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                />
              </Form.Group>

              <Form.Group className="mb-5">
                <Form.Label className="form-label-custom d-flex align-items-center"><FaFileAlt className="me-2"/>일반 첨부파일 (문서, 자료 등)</Form.Label>
                <label className="file-upload-zone w-100 d-block m-0">
                  <input type="file" multiple className="d-none" onChange={handleFilesUpload} />
                  <FaFileUpload size={32} className="mb-3 text-info opacity-75" />
                  <h6 className="fw-bold mb-1 text-white">클릭하여 파일 추가</h6>
                  {attachedFiles.length > 0 ? (
                    <div className="mt-3 d-flex flex-wrap justify-content-center gap-2">
                      {attachedFiles.map((file, idx) => (
                        <Badge key={idx} bg="info" text="dark" className="px-3 py-2 rounded-pill">{file.name}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="mb-0 text-white-50 small">대표 이미지가 아닌, 문서나 추가 자료를 이곳에 업로드하세요. (최대 20MB)</p>
                  )}
                </label>
              </Form.Group>

              <div className="d-flex justify-content-end gap-3 pt-2">
                <Button variant="outline-secondary" className="btn-cancel px-4 py-3 fw-bold d-flex align-items-center" onClick={() => navigate(-1)}>
                  <FaTimes className="me-2"/>작성 취소
                </Button>
                <Button variant="info" className="btn-submit px-5 py-3 fw-bold d-flex align-items-center fs-6" onClick={handleSubmit}>
                  <FaSave className="me-2"/>{id ? '수정한 내용 저장하기' : '게시글 등록하기'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Form>
      </Container>
      <Footer />
    </div>
  );
};

export default NoticeWritePage;