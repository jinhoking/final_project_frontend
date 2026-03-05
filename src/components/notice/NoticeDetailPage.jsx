import React, { useState, useEffect } from 'react'; 
import { Container, Card, Badge, Button, Form, ListGroup, Collapse } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrashAlt, FaFileDownload, FaUserCircle, FaPaperPlane, FaImage, FaClock, FaEye, FaBuilding, FaComments, FaFileAlt, FaBullhorn, FaRegCalendarCheck, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import axios from 'axios'; 

import Header from '../main/Header';
import Footer from '../main/Footer';

const NoticeDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [notice, setNotice] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [me, setMe] = useState(null); 
  
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        const meRes = await axios.get('http://ecpsystem.site:8080/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMe(meRes.data);

        const res = await axios.get(`http://ecpsystem.site:8080/api/notices/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotice(res.data);
        setComments(res.data.comments || []);
      } catch (err) {
        console.error("게시글 상세 로드 실패:", err);
        alert("게시글을 불러올 수 없습니다.");
        navigate('/notice');
      }
    };
    fetchDetail();
  }, [id, navigate]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://ecpsystem.site:8080/api/notices/${id}/comments`, 
        { content: newComment }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([...comments, res.data]);
      setNewComment("");
    } catch (err) {
      console.error("댓글 등록 실패:", err);
      alert("댓글 등록 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteDetail = async () => {
    if (window.confirm("이 게시글을 영구 삭제하시겠습니까?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://ecpsystem.site:8080/api/notices/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("게시글이 삭제되었습니다.");
        navigate('/notice'); 
      } catch (err) {
        console.error("삭제 실패:", err);
        alert(err.response?.data?.message || "본인 또는 관리자만 삭제할 수 있습니다.");
      }
    }
  };

  if (!notice) return null;

  return (
    <div style={{ backgroundColor: '#0b0c10', minHeight: '100vh', color: 'white', fontFamily: "'Pretendard', sans-serif", paddingBottom: '100px' }}>
      <style>{`
        .detail-container { max-width: 1200px; }
        .article-card { 
          border: 1px solid rgba(255, 255, 255, 0.05) !important; 
          border-radius: 20px !important; 
          background-color: #1a1c23 !important; 
          overflow: hidden; 
          border-left: 6px solid #0dcaf0 !important;
        }
        .article-cover { height: 260px; background: linear-gradient(135deg, #0b0c10 0%, #1a1c23 100%); display: flex; align-items: center; justify-content: center; border-bottom: 1px solid rgba(255, 255, 255, 0.05); position: relative; overflow: hidden; }
        .article-cover img { width: 100%; height: 100%; object-fit: cover; }
        
        /* 🌟 [신규] 아티클 타이틀, 메타정보, 본문 디자인 고도화 */
        .article-title { text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
        .article-meta-box {
          background: linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .writer-avatar-box {
          width: 54px; height: 54px;
          background: rgba(13, 202, 240, 0.1);
          border: 1px solid rgba(13, 202, 240, 0.2);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }
        .content-area { 
          min-height: 250px; 
          background-color: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-top: 3px solid rgba(13, 202, 240, 0.5);
          border-radius: 16px;
          padding: 40px;
          line-height: 2; 
          color: #e2e8f0; 
          white-space: pre-wrap; 
          font-size: 1.1rem; 
          letter-spacing: -0.3px; 
          box-shadow: inset 0 2px 15px rgba(0,0,0,0.3);
        }
        
        .comment-container-card { background-color: #1a1c23 !important; border: 1px solid rgba(13, 202, 240, 0.2) !important; border-radius: 20px !important; margin-top: 30px; border-left: 6px solid #0dcaf0 !important;}
        .comment-item { background: transparent !important; border-bottom: 1px dashed rgba(255, 255, 255, 0.05) !important; padding: 20px 0 !important; }
        
        .comment-bubble { 
          background: rgba(13, 202, 240, 0.08); 
          border: 1px solid rgba(13, 202, 240, 0.15); 
          padding: 10px 16px; 
          border-radius: 0 16px 16px 16px; 
          margin-top: 8px; 
          color: #e0e0e0; 
          display: inline-block; 
          max-width: 90%; 
          word-break: break-word; 
          line-height: 1.5;
        }
        
        .comment-input-wrapper { background-color: #0b0c10; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 8px; display: flex; align-items: center; }
        .comment-input { background: transparent !important; border: none !important; color: white !important; box-shadow: none !important; flex-grow: 1; }
        .toggle-arrow { background: none; border: none; color: #0dcaf0; padding: 0; font-size: 1.2rem; display: flex; align-items: center; transition: all 0.3s ease; }
        .toggle-arrow:hover { color: white; }
      `}</style>

      <Header quote="사내 공람 및 커뮤니티 게시글 상세 정보" currentUser={me} />

      <Container className="py-5 detail-container">
        {/* 상단 헤더: 타이틀과 버튼 수평 배치 유지 */}
        <div className="d-flex justify-content-between align-items-end mb-5 pb-3 border-bottom border-secondary border-opacity-25">
          <div>
            <Badge bg="info" text="dark" className="mb-2 px-3 py-1 rounded-pill fw-bold">COMMUNITY READ</Badge>
            <h1 className="fw-bold mb-0 text-white" style={{ fontSize: '2rem', letterSpacing: '-1px' }}>
              <FaBullhorn className="me-3 text-info"/>게시글 <span className="text-white-50">상세보기</span>
            </h1>
            <p className="text-white-50 mt-2 mb-0" style={{ fontSize: '0.95rem' }}>
              팀원들과 공유된 소중한 정보와 다양한 의견을 아래에서 확인하실 수 있습니다.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2 mb-1">
            <Button variant="outline-light" className="rounded-pill px-3 shadow-sm border-secondary border-opacity-50" onClick={() => navigate(`/notice/edit/${id}`)}>
              <FaEdit className="me-2"/>수정
            </Button>
            <Button variant="outline-danger" className="rounded-pill px-3 shadow-sm" onClick={handleDeleteDetail}>
              <FaTrashAlt className="me-2"/>삭제
            </Button>
            <Button variant="link" className="text-info text-decoration-none p-0 fw-bold d-flex align-items-center ms-2" onClick={() => navigate('/notice')}>
              <div className="bg-info bg-opacity-10 rounded-circle p-2 me-2 d-flex"><FaArrowLeft /></div> 
              목록으로 돌아가기
            </Button>
          </div>
        </div>

        {/* 🌟 수정 포인트: 아티클 카드 디자인 고도화 */}
        <Card className="article-card border-0 shadow-lg mb-4">
          <div className="article-cover">
            {notice.coverImageUrl ? (
              <img src={`http://ecpsystem.site:8080${notice.coverImageUrl}`} alt="Cover" />
            ) : (
              <FaImage size={80} className="text-secondary opacity-25" />
            )}
            <Badge 
              bg={notice.type === '중요' ? 'danger' : notice.type === '이벤트' ? 'warning' : 'success'} 
              className="position-absolute top-0 start-0 m-4 px-3 py-2 rounded-pill shadow-sm d-flex align-items-center gap-2" 
            >
              {notice.type === '중요' && <><FaBullhorn size={14}/> 필독 공지</>}
              {notice.type === '공지' && <><FaBullhorn size={14}/> 일반 공지</>}
              {notice.type === '이벤트' && <><FaRegCalendarCheck size={14}/> 이벤트 공지</>}
            </Badge>
          </div>

          <Card.Body className="p-4 p-md-5">
            <div className="mb-5">
              <Badge bg="info" text="dark" className="px-3 py-1 rounded-pill fw-bold mb-3 shadow-sm" style={{ letterSpacing: '1px' }}>ARTICLE VIEW</Badge>
              <h1 className="fw-bolder mb-4 text-white lh-base article-title" style={{ fontSize: '2.4rem', letterSpacing: '-1.5px' }}>{notice.title}</h1>
              
              <div className="article-meta-box p-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div className="d-flex align-items-center gap-4">
                  <div className="writer-avatar-box shadow-sm">
                    <FaUserCircle size={32} className="text-info opacity-75" />
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="text-white fw-bold fs-5">{notice.writer}</span>
                      <Badge bg="dark" className="border border-secondary text-white-50 fw-normal rounded-pill px-3 py-1"><FaBuilding className="me-1 mb-1"/>{notice.deptName} {notice.position}</Badge>
                    </div>
                    <div className="text-white-50 font-monospace small d-flex align-items-center"><FaClock className="me-2 opacity-50"/> {notice.date}</div>
                  </div>
                </div>
                
                <div className="text-end border-start border-secondary border-opacity-25 ps-4 ms-auto">
                  <div className="text-info fw-bold fs-4 d-flex align-items-center justify-content-end" style={{ textShadow: '0 0 10px rgba(13,202,240,0.3)' }}>
                    <FaEye className="me-2 opacity-75"/> {notice.views}
                  </div>
                  <div className="text-white-50 small mt-1 fw-medium tracking-wide">조회수</div>
                </div>
              </div>
            </div>
            
            <hr className="border-secondary opacity-25 my-5" />
            
            <div className="content-area mb-2">{notice.content}</div>
          </Card.Body>
        </Card>

        <Card className="comment-container-card shadow-lg">
          <Card.Body className="p-4 p-md-5">
            <h5 className="fw-bold mb-4 text-white d-flex align-items-center pb-3 border-bottom border-secondary border-opacity-25">
              <FaComments className="me-2 text-info"/> 등록된 의견 
              <Badge bg="info" className="text-dark ms-2 rounded-pill">{comments.length}</Badge>
              
              <button className="toggle-arrow ms-auto" onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}>
                {isCommentsExpanded ? <FaChevronUp /> : <FaChevronDown />}
              </button>
            </h5>
            
            <Collapse in={isCommentsExpanded}>
              <div>
                <div className="mb-4">
                  <ListGroup variant="flush">
                    {comments.length > 0 ? comments.map((comment) => (
                      <ListGroup.Item key={comment.id} className="comment-item">
                        <div className="d-flex align-items-start gap-3 w-100">
                          <FaUserCircle size={36} className="text-secondary opacity-50 mt-1" />
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <span className="fw-bold text-info">{comment.user}</span>
                              <span className="text-white-50 small ms-2">{comment.dept} {comment.rank}</span>
                              <span className="text-white-50 ms-auto font-monospace small">{comment.date}</span>
                            </div>
                            <div className="comment-bubble">{comment.text}</div>
                          </div>
                        </div>
                      </ListGroup.Item>
                    )) : (
                      <div className="text-center py-4 text-white-50 small">아직 등록된 의견이 없습니다.</div>
                    )}
                  </ListGroup>
                </div>

                <Form onSubmit={handleCommentSubmit} className="mt-2">
  <div className="comment-input-wrapper pe-1 shadow-sm">
    <Form.Control 
      type="text" 
      placeholder="댓글을 입력하세요..." 
      className="comment-input py-2 ps-3 fs-6" 
      value={newComment} 
      onChange={(e) => setNewComment(e.target.value)} 
    />
    <Button 
      variant="info" 
      type="submit" 
      // 👇 여기에 text-nowrap, flex-shrink-0, d-flex, align-items-center를 추가했습니다!
      className="comment-submit-btn fw-bold text-dark rounded-3 px-4 py-2 m-1 shadow-sm text-nowrap flex-shrink-0 d-flex align-items-center"
    >
      <FaPaperPlane className="me-2" /> 의견 등록
    </Button>
  </div>
</Form>
              </div>
            </Collapse>
          </Card.Body>
        </Card>
      </Container>
      <Footer />
    </div>
  );
};

export default NoticeDetailPage;