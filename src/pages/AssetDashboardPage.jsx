import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Form, InputGroup, Button, ProgressBar, Modal } from 'react-bootstrap';
import axios from 'axios';

import Header from '../components/main/Header';
import Footer from '../components/main/Footer';
import AssetRegistrationModal from '../components/asset/AssetRegistrationModal';
import AssetDetailModal from '../components/asset/AssetDetailModal';

import { 
  FaBox, FaLaptop, FaChair, FaTools, FaSearch, FaHistory, FaPlus, 
  FaCheck, FaTimes, FaFileAlt 
} from 'react-icons/fa';

const AssetDashboardPage = () => {
  const [weather, setWeather] = useState(null);
  const [filters, setFilters] = useState({ name: "", category: "전체", status: "전체", date: "" });
  const [showReg, setShowReg] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assets, setAssets] = useState([]);

  // 실제 유저 상태 관리
  const [currentUser, setCurrentUser] = useState(null);
  
  // 문서 상세 모달 상태
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // 리스트 클릭 시 모달 열기 함수
  const handleDocClick = (doc) => {
    setSelectedDoc(doc);
    setShowDocModal(true);
  };
  const [pendingRequests, setPendingRequests] = useState([]);

  // 권한 체크 로직 (경영팀 전체 / 경영팀장)
  const isManagementTeam = currentUser?.deptName === '경영지원팀';
  const isManagementLeader = isManagementTeam && currentUser?.position === '팀장';

  // --- 실시간 데이터 집계 로직 ---
  const parsePrice = (p) => {
    if (p === null || p === undefined || p === "") return 0;
    // 숫자면 그대로 반환, 문자열이면 콤마 제거 후 숫자로 변환
    const val = typeof p === 'string' ? p.replace(/,/g, '') : p;
    return isNaN(Number(val)) ? 0 : Number(val);
  };

  // 🌟 [수정] 이번 달 지출 합산 로직 (현재 날짜 기준 동적 계산)
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthTotal = assets.reduce((acc, cur) => {
    // joinDate가 현재 연-월(예: 2026-03)로 시작하는 경우만 합산
    if (cur.joinDate && cur.joinDate.startsWith(currentYearMonth)) { 
      return acc + parsePrice(cur.price);
    }
    return acc;
  }, 0);

  const totalBudget = 10000000; // 월 예산 1,000만원
  const budgetUsagePercent = Math.min(Math.round((currentMonthTotal / totalBudget) * 100), 100);

  const statsData = [
    { icon: <FaLaptop />, label: "IT 장비", value: `${assets.filter(a => a.category === 'IT장비').length}개` },
    { icon: <FaChair />, label: "가구/집기", value: `${assets.filter(a => a.category === '가구').length}개` },
    { icon: <FaTools />, label: "수리 요청", value: `${assets.filter(a => a.status === '수리중').length}건` },
    { icon: <FaHistory />, label: "이번달 지출", value: `₩${(currentMonthTotal / 10000).toLocaleString()}만` }
  ];

  // --- API 호출 ---
  useEffect(() => {
    const initData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [meRes, weatherRes, assetsRes, docsRes] = await Promise.all([
          axios.get('http://ecpsystem.site:8080/api/users/me', config), 
          axios.get(`https://api.weatherapi.com/v1/current.json?key=ee92e1a0799b4f978b562159261601&q=Seoul&lang=ko`),
          axios.get('http://ecpsystem.site:8080/api/assets', config),
          axios.get('http://ecpsystem.site:8080/api/documents', config)
        ]);

        setCurrentUser(meRes.data);
        setWeather(weatherRes.data);
        setAssets(assetsRes.data);

        const equipRequests = docsRes.data
          .filter(doc => doc.status === 'APPROVED' && doc.type && doc.type.includes('비품'))
          .map(doc => ({
            id: doc.id,
            name: doc.title,            
            req: doc.drafterName,       
            type: "비품",               
            date: doc.createdAt ? doc.createdAt.split('T')[0] : '오늘',
            content: doc.content
          }));

        setPendingRequests(equipRequests);

      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      }
    };

    initData();
  }, []);

  const handleRequestAction = (id, action) => {
    if (!isManagementLeader) return alert("권한이 없습니다.");
    setPendingRequests(pendingRequests.filter(r => r.id !== id));
    alert(`${action === 'ok' ? '승인' : '반려'} 처리가 완료되었습니다.`);
  };

  const filteredAssets = assets.filter(ast => {
    const matchesName = (ast.name || "").toLowerCase().includes((filters.name || "").toLowerCase());
    const matchesCategory = filters.category === "전체" || ast.category === filters.category;
    const matchesStatus = filters.status === "전체" || ast.status === filters.status;
    const matchesDate = !filters.date || (ast.joinDate || "").includes(filters.date);
    return matchesName && matchesCategory && matchesStatus && matchesDate;
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleAssetClick = (ast) => {
    setSelectedAsset(ast);
    setShowDetail(true);
  };

  const handleDeleteAsset = async (id) => {
    if (!window.confirm("정말로 이 자산을 삭제하시겠습니까? 관련 이력 데이터가 모두 사라집니다.")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://ecpsystem.site:8080/api/assets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("삭제되었습니다.");
      setShowDetail(false);
      setSelectedAsset(null);
      
      const res = await axios.get('http://ecpsystem.site:8080/api/assets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssets(res.data);
    } catch (e) {
      alert("삭제 실패: 권한이 없거나 오류가 발생했습니다.");
    }
  };

  return (
    <div style={{ backgroundColor: '#0b0c10', minHeight: '100vh', color: '#c5c6c7', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      <style>{`
        .custom-clean-card { border: 1px solid rgba(255, 255, 255, 0.1) !important; border-radius: 12px !important; background-color: #1a1c23 !important; overflow: hidden !important; }
        .table-scroll-container { flex-grow: 1; overflow-y: auto !important; max-height: 500px; }
        .hr-list-table thead th { position: sticky !important; top: 0 !important; z-index: 100 !important; background-color: #1a1c23 !important; box-shadow: inset 0 -2px 0 #0dcaf0; padding: 18px 10px !important; color: #ffffff !important; font-weight: 700; }
        .hr-list-table tbody tr:hover { background: rgba(13, 202, 240, 0.05); cursor: pointer; }
        .hr-list-table tbody td { font-size: 1rem !important; padding: 18px 10px !important; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(13, 202, 240, 0.3); border-radius: 4px; }

        .filter-input-group .form-control, 
        .filter-input-group .form-select { 
            background-color: #1a1c23 !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important; 
            color: #ffffff !important; 
            font-size: 0.9rem !important; 
        }

        .filter-input-group .form-control::placeholder {
            color: rgba(255, 255, 255, 0.7) !important;
            opacity: 1 !important;
        }

        .filter-input-group .form-select {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e") !important;
        }
      `}</style>

      <Header weather={weather} quote="효율적인 자산 관리가 경쟁력입니다." loading={{ weather: !weather }} currentUser={currentUser} />

      <div className="main-title-section mb-2 px-5 mt-4">
        <Badge bg="info" text="dark" className="mb-2 px-3 fw-bold rounded-pill" style={{ fontSize: '0.85rem' }}>ASSETS DASHBOARD</Badge>
        <div className="d-flex justify-content-between align-items-end">
          <h1 className="fw-bold mb-0" style={{ letterSpacing: '-1.5px', fontSize: '2.6rem' }}>
            <span style={{ color: '#0dcaf0' }}>경영관리</span> 자산현황(ASSETS)
          </h1>
          {isManagementTeam && (
            <Button variant="outline-info" size="sm" className="rounded-pill px-3" style={{ color: '#fff', borderColor: '#0dcaf0' }} onClick={() => setShowReg(true)}>
              <FaPlus className="me-2"/>신규 자산 등록
            </Button>
          )}
        </div>
      </div>

      <Container fluid className="mt-3 flex-grow-1 px-5" style={{ marginBottom: '50px' }}>
        <Row className="mb-4 g-4 text-center">
          {statsData.map((item, idx) => (
            <Col key={idx} md={3}>
              <Card bg="dark" className="custom-clean-card border-0 p-3 shadow-sm h-100 d-flex align-items-center justify-content-center">
                <div className="d-flex align-items-center justify-content-center gap-4">
                  <div style={{ fontSize: '2.5rem', color: "#0dcaf0" }}>{item.icon}</div>
                  <div className="text-start">
                    <div className="text-white-50 small fw-bold">{item.label}</div>
                    <div className="fs-3 fw-bold text-white">{item.value}</div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <Row className="g-4 align-items-stretch">
          <Col lg={8}>
            <Card bg="dark" className="custom-clean-card h-100 border-0 shadow-lg d-flex flex-column">
              <Card.Header className="py-4 bg-black bg-opacity-40 border-0">
                <div className="d-flex justify-content-between align-items-center mb-3 text-info fw-bold fs-5">ASSET INVENTORY</div>
                <Row className="g-2 filter-input-group">
                  <Col md={3}>
                    <InputGroup size="sm">
                      <InputGroup.Text className="bg-dark border-secondary text-info">
                        <FaSearch/>
                      </InputGroup.Text>
                      <Form.Control name="name" placeholder="자산명 검색..." onChange={handleFilterChange} />
                    </InputGroup>
                  </Col>
                  <Col md={3}>
                    <Form.Select size="sm" name="category" onChange={handleFilterChange}>
                      <option value="전체">모든 카테고리</option>
                      <option value="IT장비">IT장비</option>
                      <option value="가구">가구</option>
                      <option value="사무용품/비품">사무용품/비품</option>
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Select size="sm" name="status" onChange={handleFilterChange}>
                      <option value="전체">모든 상태</option>
                      <option value="정상">정상</option>
                      <option value="수리중">수리중</option>
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Control size="sm" name="date" placeholder="입고날짜 (예: 2026-02-20)" onChange={handleFilterChange} />
                  </Col>
                </Row>
              </Card.Header>
              <div className="table-scroll-container custom-scroll">
                <Table variant="dark" hover className="mb-0 text-center hr-list-table">
                  <thead>
                    <tr><th>자산명</th><th>관리번호</th><th>카테고리</th><th>사용자</th><th>상태</th><th>입고날짜</th></tr>
                  </thead>
                  <tbody>
                    {filteredAssets.map(ast => (
                      <tr key={ast.id} onClick={() => handleAssetClick(ast)}>
                        <td className="fw-bold text-start ps-5"><FaBox className="me-2 text-info opacity-50" /> {ast.name}</td>
                        <td className="text-white-50 small">{ast.id}</td>
                        <td>{ast.category}</td>
                        <td className="text-info">{ast.holder}</td>
                        <td><Badge bg={ast.status === '정상' ? 'success' : 'warning'} className="px-3">{ast.status}</Badge></td>
                        <td className="text-white-50 small">{ast.joinDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card>
          </Col>

          <Col lg={4}>
            <div className="d-flex flex-column gap-4 h-100">
              <Card bg="dark" className="custom-clean-card border-0 shadow" style={{ minHeight: '300px' }}>
                <Card.Header className="py-3 bg-black bg-opacity-20 border-0 d-flex justify-content-between align-items-center">
                  <small className="text-info fw-bold">PENDING REQUESTS</small>
                  <Badge bg="info" className="text-dark">{pendingRequests.length}건</Badge>
                </Card.Header>
                <Card.Body className="p-0 overflow-auto custom-scroll" style={{ maxHeight: '350px' }}>
                  <div className="list-group list-group-flush">
                    {pendingRequests.map(req => (
                      <div key={req.id} className="list-group-item bg-transparent text-white border-secondary border-opacity-10 p-3" style={{ cursor: 'pointer' }} onClick={() => handleDocClick(req)}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <Badge bg="dark" className="border border-info text-info me-2">{req.type}</Badge>
                            <span className="fw-bold small">{req.name}</span>
                          </div>
                          {isManagementLeader && (
                            <div className="d-flex gap-1">
                              <Button variant="outline-success" size="sm" className="btn-action-text px-2" onClick={(e) => { e.stopPropagation(); handleRequestAction(req.id, 'ok'); }}><FaCheck/></Button>
                              <Button variant="outline-danger" size="sm" className="btn-action-text px-2" onClick={(e) => { e.stopPropagation(); handleRequestAction(req.id, 'no'); }}><FaTimes/></Button>
                            </div>
                          )}
                        </div>
                        <div className="text-white-50 small mb-1"><FaFileAlt className="me-2 opacity-50"/>기안자: {req.req}</div>
                        <div className="text-info small fw-bold">{req.date} 승인 완료</div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>

              <Card bg="dark" className="custom-clean-card border-0 shadow flex-grow-1">
                <Card.Header className="py-3 bg-black bg-opacity-20 border-0">
                  <small className="text-info fw-bold">BUDGET USAGE (CURRENT MONTH)</small>
                </Card.Header>
                <Card.Body className="p-4 d-flex flex-column justify-content-center text-center">
                  <div className="mb-4">
                    <h1 className="display-5 fw-bold text-info">{budgetUsagePercent}%</h1>
                    <p className="text-white-50 small">금월 자산 도입 예산 집행률</p>
                  </div>
                  <ProgressBar variant="info" now={budgetUsagePercent} style={{ height: '12px' }} className="bg-black mb-3" />
                  <div className="d-flex justify-content-between small text-white-50">
                    <span>₩{(currentMonthTotal / 1000000).toFixed(1)}M 집행</span>
                    <span>₩{(totalBudget / 1000000).toFixed(1)}M 예산</span>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
      <Footer />

      <AssetRegistrationModal 
        show={showReg} 
        onHide={() => setShowReg(false)} 
        onUpdate={() => {
          const fetchAssets = async () => {
             const token = localStorage.getItem('token');
             const res = await axios.get('http://ecpsystem.site:8080/api/assets', { headers: { Authorization: `Bearer ${token}` } });
             setAssets(res.data);
          };
          fetchAssets();
        }} 
      />
      
      <Modal show={showDocModal} onHide={() => setShowDocModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-dark border-secondary" closeVariant="white">
          <Modal.Title className="text-info fw-bold">
            <FaFileAlt className="me-2" />
            비품 신청서 상세 내용
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white p-4 custom-scroll" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {selectedDoc ? (
            <div className="approval-content-preview">
              <div dangerouslySetInnerHTML={{ __html: selectedDoc.content }} />
            </div>
          ) : (
            <div className="text-center text-white-50 py-5">문서 내용을 불러올 수 없습니다.</div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-dark border-secondary">
          <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => setShowDocModal(false)}>닫기</Button>
          {isManagementLeader && (
            <Button variant="info" className="rounded-pill px-4 fw-bold text-white" onClick={() => { handleRequestAction(selectedDoc.id, 'ok'); setShowDocModal(false); }}>
              <FaCheck className="me-2" />지급 완료 (목록에서 지우기)
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <AssetDetailModal 
        show={showDetail} 
        onHide={() => setShowDetail(false)} 
        asset={selectedAsset} 
        currentUser={currentUser} 
        onDelete={handleDeleteAsset} 
        onUpdate={() => {         
          const fetchAssets = async () => {
             const token = localStorage.getItem('token');
             const res = await axios.get('http://ecpsystem.site:8080/api/assets', { headers: { Authorization: `Bearer ${token}` } });
             setAssets(res.data);
          };
          fetchAssets();
        }} 
      />
    </div>
  );
};

export default AssetDashboardPage;