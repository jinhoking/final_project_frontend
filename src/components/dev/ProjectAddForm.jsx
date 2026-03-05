import React, { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';

// 🌟 아이콘 임포트 (정리본)
import { 
  SiReact, SiRedux, SiSpringboot, SiSpring, SiTypescript, SiNodedotjs, 
  SiRedis, SiJavascript, SiMysql, SiPostgresql, SiMongodb, 
  SiDocker, SiKubernetes, SiGit, SiPython, SiDjango, SiNextdotjs, 
  SiVuedotjs, SiAngular, SiTailwindcss, SiBootstrap, SiLinux,
  SiVite, SiNginx, SiFirebase, SiMariadb
} from 'react-icons/si';
import { FaJava } from 'react-icons/fa';

// 🌟 TECH_CONFIG (복구 완료)
const TECH_CONFIG = {
  FE: [
    { name: "React", icon: <SiReact />, color: "#61DAFB" },
    { name: "Redux", icon: <SiRedux />, color: "#764ABC" },
    { name: "TypeScript", icon: <SiTypescript />, color: "#3178C6" },
    { name: "JavaScript", icon: <SiJavascript />, color: "#F7DF1E" },
    { name: "Next.js", icon: <SiNextdotjs />, color: "#ffffff" },
    { name: "Vue.js", icon: <SiVuedotjs />, color: "#4FC08D" },
    { name: "Angular", icon: <SiAngular />, color: "#DD0031" },
    { name: "Tailwind", icon: <SiTailwindcss />, color: "#06B6D4" },
    { name: "Bootstrap", icon: <SiBootstrap />, color: "#7952B3" },
    { name: "Vite", icon: <SiVite />, color: "#646CFF" },
  ],
  BE: [
    { name: "Java", icon: <FaJava />, color: "#ED8B00" },
    { name: "Spring", icon: <SiSpring/>, color: "#61a533"},
    { name: "Spring Boot", icon: <SiSpringboot />, color: "#6DB33F" },
    { name: "Node.js", icon: <SiNodedotjs />, color: "#339933" },
    { name: "Python", icon: <SiPython />, color: "#3776AB" },
    { name: "Django", icon: <SiDjango />, color: "#092E20" },
    { name: "MySQL", icon: <SiMysql />, color: "#4479A1" },
    { name: "PostgreSQL", icon: <SiPostgresql />, color: "#336791" },
    { name: "MariaDB", icon: <SiMariadb />, color: "#003545" },
    { name: "MongoDB", icon: <SiMongodb />, color: "#47A248" },
    { name: "Redis", icon: <SiRedis />, color: "#DC382D" },
    { name: "Docker", icon: <SiDocker />, color: "#2496ED" },
    { name: "Kubernetes", icon: <SiKubernetes />, color: "#326CE5" },
    { name: "Nginx", icon: <SiNginx />, color: "#009639" },
    { name: "Firebase", icon: <SiFirebase />, color: "#FFCA28" },
    { name: "Linux", icon: <SiLinux />, color: "#FCC624" },
    { name: "Git", icon: <SiGit />, color: "#F05032" },
  ]
};


const ProjectAddForm = ({ onSave }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    manager: '',
    startDate: '',
    description: '',
    fe_devs: '',
    be_devs: '',
  });

  const [selectedFe, setSelectedFe] = useState([]);
  const [selectedBe, setSelectedBe] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleTech = (techName, type) => {
    if (type === 'FE') {
      setSelectedFe(prev => prev.includes(techName) ? prev.filter(t => t !== techName) : [...prev, techName]);
    } else {
      setSelectedBe(prev => prev.includes(techName) ? prev.filter(t => t !== techName) : [...prev, techName]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 🌟 백엔드 엔티티 및 컨트롤러 파라미터와 키값을 완벽하게 매칭합니다.
    const submitData = {
      projectName: formData.projectName,
      managerName: formData.manager,    // PM 이름 (백엔드 DTO 매칭)
      startDate: formData.startDate,
      description: formData.description,
      fe_devs: formData.fe_devs,       // 입력한 담당자 명단 (문자열)
      be_devs: formData.be_devs,       // 입력한 담당자 명단 (문자열)
      fe_tech: selectedFe.join(', '),  // 배열을 쉼표로 구분된 문자열로 변환
      be_tech: selectedBe.join(', ')   // 배열을 쉼표로 구분된 문자열로 변환
    };

    onSave(submitData);
  };

  const renderTechButtons = (list, selectedList, type) => (
    <div className="d-flex flex-wrap gap-2">
      {list.map((tech) => {
        const isSelected = selectedList.includes(tech.name);
        return (
          <div 
            key={tech.name}
            onClick={() => toggleTech(tech.name, type)}
            className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 border transition-all"
            style={{ 
              cursor: 'pointer',
              backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              borderColor: isSelected ? tech.color : '#444',
              color: isSelected ? '#fff' : '#888',
              opacity: isSelected ? 1 : 0.6,
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ color: isSelected ? tech.color : '#888', fontSize: '1.2rem' }}>{tech.icon}</span>
            <span style={{ fontSize: '0.9rem', fontWeight: isSelected ? 'bold' : 'normal' }}>{tech.name}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <Form 
      onSubmit={handleSubmit} 
      className="text-white mx-auto" 
      style={{ maxWidth: '850px' }} 
    >
      <style>
        {`
        form {
      max-height: 75vh; 
      overflow-y: auto;
      padding-right: 15px;
      padding-bottom: 20px; /* 스크롤바와 내용 간격 */
    }
      /* 스크롤바 디자인 (다크 모드에 어울리게) */
    form::-webkit-scrollbar {
      width: 6px;
    }
    form::-webkit-scrollbar-thumb {
      background: #444;
      border-radius: 10px;
    }
    form::-webkit-scrollbar-track {
      background: transparent;
    }
          /* 🌟 인풋창 배경색 고정 (포커스/입력 시 흰색 방지) */
          .custom-placeholder { 
            color: white !important; 
            background-color: #212529 !important; 
            border: 1px solid #444 !important;
          }
          .custom-placeholder:focus {
            background-color: #212529 !important;
            color: white !important;
            border-color: #0dcaf0 !important;
            box-shadow: 0 0 0 0.25 margin rgba(13, 202, 240, 0.25) !important;
          }
          /* 크롬 자동완성 시 노란색/흰색 배경 방지 */
          .custom-placeholder:-webkit-autofill,
          .custom-placeholder:-webkit-autofill:hover, 
          .custom-placeholder:-webkit-autofill:focus {
            -webkit-text-fill-color: white !important;
            -webkit-box-shadow: 0 0 0px 1000px #212529 inset !important;
            transition: background-color 5000s ease-in-out 0s;
          }
        `}
      </style>

      {/* 1. 기본 정보 입력 */}
      <Row className="mb-3">
        <Col md={5}>
          <Form.Group>
            <Form.Label className="text-info fw-bold">프로젝트 명칭</Form.Label>
            <Form.Control type="text" name="projectName" placeholder="예: 차세대 결제 시스템" required className="custom-placeholder border-secondary" onChange={handleChange} />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label className="text-info fw-bold">PM</Form.Label>
            <Form.Control type="text" name="manager" placeholder="PM 이름" required className="custom-placeholder border-secondary" onChange={handleChange} />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label className="text-info fw-bold">착수 날짜</Form.Label>
            <Form.Control type="date" name="startDate" required className="custom-placeholder border-secondary" onChange={handleChange} />
          </Form.Group>
        </Col>
      </Row>

      {/* 2. 오버뷰 입력 */}
      <Form.Group className="mb-4">
        <Form.Label className="text-info fw-bold">프로젝트 오버뷰 (Overview)</Form.Label>
        <Form.Control as="textarea" name="description" rows={2} placeholder="프로젝트의 주요 목표와 핵심 내용을 요약해주세요." className="custom-placeholder border-secondary" onChange={handleChange} />
      </Form.Group>

      <hr className="border-secondary my-4" />

      {/* 3. Backend 섹션 */}
      <div className="mb-4 p-3 bg-black bg-opacity-20 rounded border border-secondary border-opacity-25">
        <h6 className="text-warning fw-bold mb-3 d-flex align-items-center gap-2">
            Backend & Infra <span className="badge bg-warning text-dark rounded-pill">{selectedBe.length}</span>
        </h6>
        <Form.Group className="mb-3">
          <Form.Control type="text" name="be_devs" placeholder="담당 개발자 (쉼표 구분)" required className="custom-placeholder border-secondary mb-3" onChange={handleChange} />
        </Form.Group>
        <div className="p-2">
            <Form.Label className="small text-white-50 mb-2">기술 스택 선택</Form.Label>
            {renderTechButtons(TECH_CONFIG.BE, selectedBe, 'BE')}
        </div>
      </div>

      {/* 4. Frontend 섹션 */}
      <div className="mb-4 p-3 bg-black bg-opacity-20 rounded border border-secondary border-opacity-25">
        <h6 className="text-info fw-bold mb-3 d-flex align-items-center gap-2">
            Frontend <span className="badge bg-info text-dark rounded-pill">{selectedFe.length}</span>
        </h6>
        <Form.Group className="mb-3">
          <Form.Control type="text" name="fe_devs" placeholder="담당 개발자 (쉼표 구분)" required className="custom-placeholder border-secondary mb-3" onChange={handleChange} />
        </Form.Group>
        <div className="p-2">
            <Form.Label className="small text-white-50 mb-2">기술 스택 선택</Form.Label>
            {renderTechButtons(TECH_CONFIG.FE, selectedFe, 'FE')}
        </div>
      </div>

      <div className="d-grid gap-2 mt-4 pt-2 border-top border-secondary">
        <Button variant="success" type="submit" size="lg" className="fw-bold text-white"> ✨ 프로젝트 등록 완료 </Button>
      </div>
    </Form>
  );
};

export default ProjectAddForm;