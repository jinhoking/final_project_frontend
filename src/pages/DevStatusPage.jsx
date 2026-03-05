import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css'; // 필수 스타일
import React, { useState, useEffect } from 'react';
import { Container, Button, Row, Col, Table, Badge, Card, ProgressBar, Modal, Form, InputGroup, Accordion  } from 'react-bootstrap';
import axios from 'axios';

// 컴포넌트 임포트
import Header from '../components/main/Header';
import Footer from '../components/main/Footer';
import IssueModal from '../components/dev/IssueModal';
import DevUpdateForm from '../components/dev/DevUpdateForm';
import ProjectAddForm from '../components/dev/ProjectAddForm';
import SystemMonitor from '../components/dev/SystemMonitor'; 
import TeamBulletin from '../components/dev/TeamBulletin';

// 아이콘 및 유틸 함수
import { 
  SiReact, SiRedux, SiSpringboot, SiSpring, SiTypescript, SiNodedotjs, 
  SiRedis, SiJavascript, SiMysql, SiPostgresql, SiMongodb, 
  SiDocker, SiKubernetes, SiGit, SiPython, SiDjango, SiNextdotjs, 
  SiVuedotjs, SiAngular, SiTailwindcss, SiBootstrap, SiLinux,
  SiVite, SiNginx, SiFirebase, SiMariadb
} from 'react-icons/si';
import { FaJava, FaCheckCircle, FaSpinner, FaFlag, FaTimes, FaExclamationTriangle,
   FaSave, FaCalendarAlt, FaSearch, FaUserCircle, FaTrashAlt, FaTerminal, FaSyncAlt, FaChevronRight } from 'react-icons/fa'; 

const MILESTONE_STEPS = [
  { name: '기획', status: '기획/착수' },
  { name: '개발', status: '개발중' },
  { name: '테스트', status: '테스트중' },
  { name: '배포', status: '배포준비' }
];

const getTechStackUI = (tech) => {
  if (!tech || !tech.name) return null;
  const name = tech.name.trim().toLowerCase();
  let config = { icon: <FaFlag />, color: '#888' };

  if (name.includes('react')) config = { icon: <SiReact />, color: "#61DAFB" };
  else if (name.includes('redux')) config = { icon: <SiRedux />, color: "#764ABC" };
  else if (name.includes('springboot')) config = { icon: <SiSpringboot />, color: "#6DB33F" };
  else if (name.includes('spring')) config = { icon: <SiSpring />, color: "#61a533" };
  else if (name.includes('typescript') || name === 'ts') config = { icon: <SiTypescript />, color: "#3178C6" };
  else if (name.includes('javascript') || name === 'js') config = { icon: <SiJavascript />, color: "#F7DF1E" };
  else if (name.includes('next')) config = { icon: <SiNextdotjs />, color: "#ffffff" };
  else if (name.includes('vue')) config = { icon: <SiVuedotjs />, color: "#4FC08D" };
  else if (name.includes('angular')) config = { icon: <SiAngular />, color: "#DD0031" };
  else if (name.includes('node')) config = { icon: <SiNodedotjs />, color: "#339933" };
  else if (name.includes('java') && !name.includes('script')) config = { icon: <FaJava />, color: "#ED8B00" };
  else if (name.includes('python')) config = { icon: <SiPython />, color: "#3776AB" };
  else if (name.includes('django')) config = { icon: <SiDjango />, color: "#092E20" };
  else if (name.includes('mysql')) config = { icon: <SiMysql />, color: "#4479A1" };
  else if (name.includes('postgres')) config = { icon: <SiPostgresql />, color: "#336791" };
  else if (name.includes('maria')) config = { icon: <SiMariadb />, color: "#003545" };
  else if (name.includes('mongo')) config = { icon: <SiMongodb />, color: "#47A248" };
  else if (name.includes('redis')) config = { icon: <SiRedis />, color: "#DC382D" };
  else if (name.includes('docker')) config = { icon: <SiDocker />, color: "#2496ED" };
  else if (name.includes('kubernetes') || name === 'k8s') config = { icon: <SiKubernetes />, color: "#326CE5" };
  else if (name.includes('git')) config = { icon: <SiGit />, color: "#F05032" };
  else if (name.includes('tailwind')) config = { icon: <SiTailwindcss />, color: "#06B6D4" };
  else if (name.includes('bootstrap')) config = { icon: <SiBootstrap />, color: "#7952B3" };
  else if (name.includes('vite')) config = { icon: <SiVite />, color: "#646CFF" };
  else if (name.includes('nginx')) config = { icon: <SiNginx />, color: "#009639" };
  else if (name.includes('firebase')) config = { icon: <SiFirebase />, color: "#FFCA28" };
  else if (name.includes('linux')) config = { icon: <SiLinux />, color: "#FCC624" };

  return (
    <div className="w-100 mb-4 p-3 rounded-3 bg-black bg-opacity-30 border border-secondary border-opacity-10" key={tech.name}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex align-items-center gap-3">
          <span style={{ fontSize: '1.8rem', color: config.color }}>{config.icon || <FaFlag />}</span>
          <span className="fw-bold text-white" style={{ fontSize: '1.1rem' }}>{tech.name}</span>
        </div>
        <span className="fw-bold" style={{ color: config.color, fontSize: '1.1rem' }}>{tech.progress}%</span>
      </div>
      <div style={{ height: '12px', backgroundColor: '#222', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ width: `${tech.progress}%`, height: '100%', backgroundColor: config.color, transition: 'width 1s' }} />
      </div>
    </div>
  );
};

const RenderDonut = ({ percent, label, size = 150, color = "#0dcaf0", fontSize = "2.2rem" }) => {
  const radius = (size / 2) - 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);
  return (
    <div className="text-center d-flex flex-column align-items-center">
      <div className="progress-donut-container" style={{ width: size, height: size, position: 'relative' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={radius} fill="transparent" stroke="#222" strokeWidth="12" />
          <circle cx={size/2} cy={size/2} r={radius} fill="transparent" stroke={color} strokeWidth="12" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="progress-donut-text position-absolute top-50 start-50 translate-middle">
          <span className="fw-bold" style={{ fontSize, color }}>{percent}</span><span style={{ fontSize: '1rem', color }}>%</span>
        </div>
      </div>
      <small className="fw-bold mt-2 text-white-50">{label}</small>
    </div>
  );
};

const DevStatusPage = () => {
  const [weather, setWeather] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [projectList, setProjectList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);


 const [repoListHeight, setRepoListHeight] = useState(220);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://ecpsystem.site:8080/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) setProjectList(res.data);
    } catch (e) {
      console.error("Fetch Error:", e);
    }
  };

 const [repoList, setRepoList] = useState([]); // 리스트로 저장
  const [repoLoading, setRepoLoading] = useState(true);

  const fetchRepoList = async () => {
    setRepoLoading(true);
    try {
      const owner = "jinhoking"; 
      const token = import.meta.env.VITE_GITHUB_TOKEN || "";; // ⚠️ 꼭 새로 발급받으세요!

      const res = await axios.get(`https://api.github.com/users/${owner}/repos`, {
        params: {
          sort: 'updated', // 최근 수정순 정렬
          per_page: 8      // 보여줄 개수
        },
        headers: { Authorization: `token ${token}` }
      });

      setRepoList(res.data);
    } catch (e) {
      console.error("GitHub API Error", e);
    } finally {
      setRepoLoading(false);
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const meRes = await axios.get('http://ecpsystem.site:8080/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(meRes.data); 
        
        const weatherRes = await axios.get(`https://api.weatherapi.com/v1/current.json?key=ee92e1a0799b4f978b562159261601&q=Seoul&lang=ko`);
        setWeather(weatherRes.data);

        fetchProjects();
        fetchRepoList(); 
      } catch (e) {
        console.error("데이터 로딩 실패:", e);
      }
    };
    initData();
  }, []);

  const handleUpdateProject = async (updatedData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://ecpsystem.site:8080/api/projects/${selectedProject.id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProjects();
      setSelectedProject(prev => ({ ...prev, ...updatedData }));
      setShowUpdateModal(false);
    } catch (e) {
      alert("업데이트 실패: " + e.message);
    }
  };

  const handleAddIssue = async (newIssueData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://ecpsystem.site:8080/api/projects/${selectedProject.id}/issues`, newIssueData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const res = await axios.get('http://ecpsystem.site:8080/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjectList(res.data);
      const updatedProject = res.data.find(p => p.id === selectedProject.id);
      setSelectedProject(updatedProject);
      alert("이슈가 성공적으로 등록되었습니다.");
    } catch (e) {
      console.error(e);
      alert("이슈 등록 실패");
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("정말로 이 프로젝트를 삭제하시겠습니까? 관련 데이터가 모두 삭제됩니다.")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://ecpsystem.site:8080/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("성공적으로 삭제되었습니다.");
      setSelectedProject(null);
      fetchProjects();
    } catch (e) {
      alert("삭제 실패: 권한이 없거나 오류가 발생했습니다.");
    }
  };

  const filteredProjects = projectList.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.manager?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: '#0b0c10', minHeight: '100vh', color: '#c5c6c7', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      <style>{`
          .custom-clean-card { border: 1px solid rgba(255, 255, 255, 0.1) !important; border-radius: 12px !important; background-color: #1a1c23 !important; overflow: hidden !important; }
          .project-list-table thead th { font-size: 1.1rem !important; padding: 18px 10px !important; color: #ffffff !important; border-bottom: 2px solid #0dcaf0 !important; font-weight: 700; background: rgba(255,255,255,0.02); position: sticky; top: 0; z-index: 10; }
          .project-list-table tbody td { font-size: 1.15rem !important; padding: 25px 10px !important; }
          .selected-row { background-color: rgba(13, 202, 240, 0.15) !important; border-left: 6px solid #0dcaf0 !important; }
          .save-btn-custom { background-color: #0dcaf0 !important; border: none !important; font-weight: 700 !important; color: #ffffff !important; box-shadow: 0 4px 12px rgba(13, 202, 240, 0.4) !important; }
          .save-btn-custom:hover { color: #ffffff !important; opacity: 0.9; }
          .issue-btn-advanced { background: linear-gradient(135deg, #ff416c, #ff4b2b) !important; border: none !important; color: white !important; font-weight: 700 !important; }
          .search-input-custom::placeholder { color: rgba(255, 255, 255, 0.45) !important; font-weight: 400; }
          .search-input-custom { background: #0b0c10 !important; border: 1px solid #333 !important; color: #fff !important; }
          
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #0dcaf0; border-radius: 10px; }

          /* 🚀 [추가] getTechStackUI 강제 축소 CSS (상단 함수 수정 없이 크기만 슬림하게 튜닝) */
          .tech-stack-wrapper > div { margin-bottom: 8px !important; padding: 10px 14px !important; }
          .tech-stack-wrapper > div > div:first-child span { font-size: 0.95rem !important; }
          .tech-stack-wrapper > div > div:first-child > div > span:first-child { font-size: 1.3rem !important; }
          .tech-stack-wrapper > div > div:last-child { height: 6px !important; }

          .custom-resizable-box {
  position: relative; /* 핸들바 위치 잡기 위해 */
  overflow: hidden; /* 내용이 튀어나가지 않게 */
}
  /* 🚀 아코디언 흰색 배경 제거 및 텍스트 가독성 확보 */
.github-accordion .accordion-item {
  background-color: transparent !important; /* 배경 투명하게 */
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.github-accordion .accordion-button {
  background-color: rgba(0, 0, 0, 0.2) !important; /* 살짝 어두운 투명 배경 */
  color: #0dcaf0 !important; /* 글씨는 하늘색 */
  box-shadow: none !important;
}

/* 펼쳐졌을 때 배경색 */
.github-accordion .accordion-button:not(.collapsed) {
  background-color: rgba(13, 202, 240, 0.15) !important;
  color: #fff !important;
}

/* 화살표 흰색으로 변경 */
.github-accordion .accordion-button::after {
  filter: invert(1);
}

/* 하단 리사이즈 핸들 스타일링 */
.custom-handle {
  width: 100%;
  height: 20px;
  background: linear-gradient(to bottom, transparent, rgba(13, 202, 240, 0.1));
  cursor: ns-resize; /* 아래위 화살표 커서 */
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 100;
}


      `}</style>

      <Header 
        weather={weather} 
        news={["🚀 대시보드 최종 디자인 시스템 가동"]} 
        loading={{ weather: !weather }} 
        currentUser={currentUser} 
      />

      <div className="main-title-section mb-2 px-5 mt-4">
        <Badge bg="info" text="dark" className="mb-2 px-3 fw-bold rounded-pill" style={{ fontSize: '0.85rem' }}>DEV DASHBOARD</Badge>
        <div className="d-flex justify-content-between align-items-end">
          <h1 className="fw-bold mb-0" style={{ letterSpacing: '-1.5px', fontSize: '2.6rem' }}><span className="text-info">개발팀</span> 현황(DEV STATUS)</h1>
        </div>
      </div>

      <Container fluid className="mt-3 flex-grow-1 px-5" style={{ marginBottom: '50px' }}>
        <Row className="g-4 align-items-stretch">
          
          {/* 🌟 왼쪽 컬럼: 카드들이 늘어나지 않도록 구성 */}
          <Col lg={5} className="d-flex flex-column gap-3">
            
            <Card bg="dark" className="custom-clean-card" style={{ height: '620px', display: 'flex', flexDirection: 'column' }}>
              <Card.Header className="py-3 bg-black bg-opacity-40 d-flex justify-content-between align-items-center border-0 flex-shrink-0">
                <span className="text-info fw-bold fs-5 me-3">PROJECT LIST</span>
                <InputGroup className="w-50 mx-2">
                  <InputGroup.Text className="bg-dark border-secondary text-secondary"><FaSearch/></InputGroup.Text>
                  <Form.Control 
                    className="search-input-custom" 
                    placeholder="PM 또는 검색" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                  />
                </InputGroup>
                <Button variant="info" size="sm" className="rounded-pill px-3 fw-bold text-white shadow-sm" onClick={() => setShowAddModal(true)}>+ 추가</Button>
              </Card.Header>
              
              <div className="custom-scrollbar" style={{ overflowY: 'auto', flexGrow: 1 }}>
                <Table variant="dark" hover responsive className="mb-0 align-middle project-list-table text-center">
                  <thead>
                    <tr className="text-center">
                      <th className="ps-4 text-start" style={{ width: '40%' }}>Project Name</th>
                      <th>PM</th>
                      <th>Start Date</th>
                      <th>Devs</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map(p => (
                      <tr key={p.id} onClick={() => setSelectedProject(p)} className={selectedProject?.id === p.id ? 'selected-row' : ''} style={{ cursor: 'pointer' }}>
                        <td className="ps-4 fw-bold text-start align-middle">
                          {p.name} 
                          {p.issues && p.issues.length > 0 && <Badge bg="danger" pill className="ms-2">{p.issues.length}</Badge>}
                        </td>
                        <td className="text-warning">{p.manager}</td>
                        <td className="text-white-50">{p.startDate}</td>
                        <td>{p.devCount || 0}명</td>
                        <td><Badge bg={p.currentStep === 3 ? 'success' : 'info'} pill>{MILESTONE_STEPS[p.currentStep || 0].name}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card>


  <ResizableBox
    height={repoListHeight}
    width={Infinity} // 가로는 부모 Col에 맡깁니다
    axis="y" 
    resizeHandles={['s']}
    minConstraints={[835, 220]} // 최소 높이 220px
    maxConstraints={[835, 800]} // 최대 높이 800px (상세 뷰 높이에 맞게)
    onResize={(e, data) => setRepoListHeight(data.size.height)}
    handle={
      <div className="custom-handle">
        <div style={{ width: '40px', height: '4px', backgroundColor: '#0dcaf0', borderRadius: '2px', opacity: 0.5 }}></div>
      </div>
    }
  >
    <Card bg="dark" className="custom-clean-card border-0 h-100" style={{ display: 'flex', flexDirection: 'column' }}>
      <Card.Header className="py-2 bg-black bg-opacity-20 border-0 d-flex justify-content-between align-items-center flex-shrink-0">
        <small className="text-info fw-bold"><SiGit className="me-2"/> MY REPOSITORIES</small>
        <Button variant="link" className="p-0 text-white-50" onClick={fetchRepoList}>
          <FaSyncAlt size={12} className={repoLoading ? 'fa-spin' : ''} />
        </Button>
      </Card.Header>
      
      <Card.Body className="p-0 overflow-auto custom-scrollbar" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
        {repoLoading ? (
          <div className="p-3 text-center text-white-50 small">로딩 중...</div>
        ) : (
          <Accordion flush className="github-accordion">
            {repoList.map((repo, index) => (
              <Accordion.Item eventKey={index.toString()} key={repo.id}>
                <Accordion.Header>
                  <div className="d-flex justify-content-between w-100 pe-3 align-items-center">
                    <span className="text-white small fw-bold text-truncate" style={{maxWidth: '180px'}}>
                      {repo.name}
                    </span>
                    <Badge bg="info" className="text-dark" style={{fontSize: '0.6rem'}}>
                      {repo.language || 'Plain'}
                    </Badge>
                  </div>
                </Accordion.Header>
                <Accordion.Body className="p-3 bg-black bg-opacity-30 text-white-50" style={{fontSize: '0.8rem'}}>
                  <p className="mb-2 text-white">{repo.description || "설명이 없습니다."}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>⭐ {repo.stargazers_count} | 🍴 {repo.forks_count}</span>
                    <a href={repo.html_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-info py-0 px-2" style={{fontSize: '0.7rem'}}>
                      Visit
                    </a>
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </Card.Body>
    </Card>
  </ResizableBox>

          </Col>

          {/* 🌟 오른쪽 컬럼: 디테일 뷰 */}
          <Col lg={7}>
            <div className="d-flex flex-column h-100 gap-4">
              <Card bg="dark" className="custom-clean-card flex-grow-1 border-0 shadow-lg overflow-hidden">
                <Card.Header className="py-2 bg-black bg-opacity-40 border-0 d-flex justify-content-between align-items-center">
                  <span className="text-white-50 fw-bold small">PROJECT DETAIL VIEW</span>
                  {selectedProject && <Button variant="outline-secondary" size="sm" className="rounded-circle border-0" onClick={() => setSelectedProject(null)}><FaTimes color="#aaa" /></Button>}
                </Card.Header>

                {selectedProject ? (
                  <Card.Body className="p-4 d-flex flex-column gap-3">
                    <div className="d-flex justify-content-between align-items-start border-bottom border-secondary border-opacity-20 pb-3">
                      <div>
                        <h2 className="text-info fw-bold mb-1 display-6">{selectedProject?.name}</h2>
                        <div className="d-flex align-items-center gap-3 text-white-50 small">
                          <span><FaCalendarAlt className="me-1 text-info"/> {selectedProject?.startDate} 착수</span>
                          <span>| PM: {selectedProject?.manager}</span>
                        </div>
                      </div>
                      <Button variant="danger" size="md" className="issue-btn-advanced px-4 rounded-pill d-flex align-items-center gap-2" onClick={() => setShowIssueModal(true)}>
                        <FaExclamationTriangle /> 이슈 {selectedProject?.issues?.length || 0}건 확인
                      </Button>
                    </div>

                    <Row className="g-3">
                      <Col md={4}>
                         <div className="p-3 rounded-4 bg-black bg-opacity-20 border border-secondary border-opacity-10 h-100">
                            <h6 className="text-info fw-bold mb-2 small">PROJECT OVERVIEW</h6>
                            <p className="text-white-50 mb-4 small" style={{lineHeight: '1.6'}}>{selectedProject?.description}</p>
                            <div className="d-flex justify-content-between px-1 text-center border-top border-secondary border-opacity-10 pt-3">
                              {MILESTONE_STEPS.map((step, idx) => (
                                <div key={idx} className={selectedProject?.currentStep >= idx ? 'text-success' : 'text-white-50 opacity-20'}>
                                  <FaCheckCircle size={22}/><div className="small mt-1 fw-bold" style={{fontSize: '0.7rem'}}>{step.name}</div>
                                </div>
                              ))}
                            </div>
                         </div>
                      </Col>
                      <Col md={8}>
                         <div className="bg-black bg-opacity-30 p-3 rounded-4 h-100 d-flex align-items-center justify-content-around">
                            <RenderDonut percent={selectedProject?.progress || 0} label="TOTAL" size={160} fontSize="2.2rem" />
                            <RenderDonut percent={selectedProject?.fe_progress || 0} label="FRONTEND" size={110} color="#61DAFB" fontSize="1.4rem" />
                            <RenderDonut percent={selectedProject?.be_progress || 0} label="BACKEND" size={110} color="#6DB33F" fontSize="1.4rem" />
                         </div>
                      </Col>
                    </Row>

                    {/* 🚀 FE/BE 팀 스택 영역: 간격 줄이고(g-3, p-3) CSS 클래스(tech-stack-wrapper) 적용 */}
                    <Row className="g-3">
                      {['fe', 'be'].map((type) => (
                        <Col key={type} md={6}>
                          <div className={`p-3 rounded-4 bg-black bg-opacity-40 border-top border-2 border-${type === 'fe' ? 'info' : 'warning'}`}>
                            <div className="mb-2">
                                <span className={`fw-bold fs-6 ${type === 'fe' ? 'text-info' : 'text-warning'}`}>{type.toUpperCase()} TEAM 상세</span>
                                <div className="text-white-50 small mt-1 d-flex align-items-center gap-2" style={{fontSize: '0.8rem'}}><FaUserCircle /> 담당자: {selectedProject?.devs?.[type]}</div>
                            </div>
                            <div className="tech-stack-wrapper d-flex flex-column gap-0">
                              {selectedProject?.techStack?.[type]?.map(tech => getTechStackUI(tech))}
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>

                    <div className="text-end mt-auto pt-3 border-top border-secondary border-opacity-10 d-flex justify-content-end gap-2">
                      <Button 
                        variant="outline-danger" 
                        className="px-4 rounded-pill fw-bold" 
                        onClick={() => handleDeleteProject(selectedProject?.id)}
                      >
                        프로젝트 삭제
                      </Button>
                      <Button variant="info" size="lg" className="save-btn-custom px-5 rounded-pill shadow d-inline-flex align-items-center gap-2" onClick={() => setShowUpdateModal(true)}>
                        <FaSave /> <span className="text-white">상태 업데이트 저장</span>
                      </Button>
                    </div>
                  </Card.Body>
                ) : (
                  <Card.Body className="d-flex align-items-center justify-content-center text-white-50 h-100"><div className="text-center opacity-25"><FaFlag size={60} className="mb-4 text-info"/><p className="fs-4 fw-light">프로젝트를 선택하세요.</p></div></Card.Body>
                )}
              </Card>

              <Row className="g-4">
                <Col md={5}><Card bg="dark" className="custom-clean-card border-0 shadow" style={{ height: '320px' }}><Card.Header className="py-2 bg-black bg-opacity-20 border-0"><small className="text-info fw-bold">SYSTEM MONITOR</small></Card.Header><Card.Body className="p-0"><SystemMonitor /></Card.Body></Card></Col>
                <Col md={7}><Card bg="dark" className="custom-clean-card border-0 shadow" style={{ height: '320px' }}><Card.Header className="py-2 bg-black bg-opacity-20 border-0"><small className="text-info fw-bold">TEAM COMMUNICATIONS</small></Card.Header><Card.Body className="p-0"><TeamBulletin /></Card.Body></Card></Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>
      <Footer />

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg">
        <div className="bg-dark border border-success border-opacity-50 rounded-3 text-white overflow-hidden shadow-lg"><Modal.Header closeButton closeVariant="white" className="border-secondary bg-black bg-opacity-40"><Modal.Title className="fs-5 fw-bold text-success">✨ New Project 등록</Modal.Title></Modal.Header><Modal.Body className="p-4">
          <ProjectAddForm onSave={async (data) => { 
            try {
              const token = localStorage.getItem('token');
              await axios.post('http://ecpsystem.site:8080/api/projects', data, { headers: { Authorization: `Bearer ${token}` } });
              fetchProjects();
              setShowAddModal(false); 
            } catch (e) { alert("등록 실패"); }
          }} />
        </Modal.Body></div>
      </Modal>

      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)} centered>
        <div className="bg-dark border border-info border-opacity-50 rounded-3 text-white shadow-lg"><Modal.Header closeButton closeVariant="white" className="border-secondary bg-black bg-opacity-40"><Modal.Title className="fs-5 fw-bold text-info">📝 상태 업데이트</Modal.Title></Modal.Header><Modal.Body className="p-4"><DevUpdateForm projectName={selectedProject?.name} currentData={selectedProject} onSave={handleUpdateProject} /></Modal.Body></div>
      </Modal>

      {selectedProject && <IssueModal show={showIssueModal} onHide={() => setShowIssueModal(false)} projectName={selectedProject.name} issueList={selectedProject.issues} onAddIssue={handleAddIssue} />}
    </div>
  );
};

export default DevStatusPage;