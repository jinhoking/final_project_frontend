import React, { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { FaCheckCircle, FaFlag, FaTools, FaDatabase, FaJava, FaQuestionCircle } from 'react-icons/fa';
import { 
  SiReact, SiRedux, SiSpringboot, SiSpring, SiTypescript, SiNodedotjs, 
  SiRedis, SiJavascript, SiMysql, SiPostgresql, SiMongodb, 
  SiDocker, SiKubernetes, SiGit, SiPython, SiDjango, SiNextdotjs, 
  SiVuedotjs, SiAngular, SiTailwindcss, SiBootstrap, SiLinux,
  SiVite, SiNginx, SiFirebase, SiMariadb, SiGraphql, SiOracle, SiHibernate
} from 'react-icons/si';

// 🌟 에러 해결: 컴포넌트 외부로 상수를 빼서 어디서든 참조 가능하게 합니다.
const MILESTONE_STEPS = [
  { name: '기획', status: '기획/착수' },
  { name: '개발', status: '개발중' },
  { name: '테스트', status: '테스트중' },
  { name: '배포', status: '배포준비' }
];

const DevUpdateForm = ({ projectName, onSave, currentData }) => {
  const [feTechs, setFeTechs] = useState(currentData?.techStack?.fe || []);
  const [beTechs, setBeTechs] = useState(currentData?.techStack?.be || []);
  const [currentStep, setCurrentStep] = useState(currentData?.currentStep || 0);

 const getTechIcon = (techName) => {
  const name = techName.trim().toLowerCase();
  let config = { icon: <FaQuestionCircle />, color: "#888" }; 

  // 🌟 ProjectAddForm 기준 통일
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

  return config;
};

  const handleTechProgressChange = (type, index, value) => {
    if (type === 'fe') {
      const newFe = [...feTechs];
      newFe[index].progress = Number(value);
      setFeTechs(newFe);
    } else {
      const newBe = [...beTechs];
      newBe[index].progress = Number(value);
      setBeTechs(newBe);
    }
  };

  const calculateAvg = (techs) => {
    if (!techs || techs.length === 0) return 0;
    const sum = techs.reduce((acc, curr) => acc + curr.progress, 0);
    return Math.round(sum / techs.length);
  };

  // 🌟 실시간 계산값
  const feAvg = calculateAvg(feTechs);
  const beAvg = calculateAvg(beTechs);
  const totalProgress = Math.round((feAvg + beAvg) / 2);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 🌟 백엔드 ProjectService가 기대하는 데이터 구조로 전송
    onSave({
    currentStep: currentStep,
    status: MILESTONE_STEPS[currentStep].status,
    fe_progress: feAvg, // 화면 상단 평균값
    be_progress: beAvg, // 화면 상단 평균값
    progress: totalProgress,
    // 🌟 중요: 이 techStack 정보가 넘어가야 백엔드가 개별 점수를 저장합니다.
    techStack: { 
        fe: feTechs, 
        be: beTechs 
    }
  });
  };

  return (
    <Form onSubmit={handleSubmit} className="text-white p-2">
      <div className="mb-4 text-center">
        <h5 className="text-white-50 mb-2">"{projectName}" 상태 갱신</h5>
        <h1 className="fw-bold text-info display-4">{totalProgress}%</h1>
        <small className="text-muted">기술별 진행률 합산 결과</small>
      </div>

      <div className="mb-5 p-4 rounded-4 bg-black bg-opacity-30 border border-secondary border-opacity-10 text-center">
        <Form.Label className="text-info fw-bold mb-4 d-block small">
          <FaFlag className="me-2"/> 현재 진행 마일스톤 설정
        </Form.Label>
        <div className="d-flex justify-content-between position-relative px-2">
          <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '2px', backgroundColor: '#343a40', zIndex: 0 }}></div>
          {MILESTONE_STEPS.map((step, idx) => (
            <div key={idx} onClick={() => setCurrentStep(idx)} style={{ zIndex: 1, cursor: 'pointer', flex: 1 }}>
              <FaCheckCircle 
                size={30} 
                className={currentStep >= idx ? 'text-info' : 'text-secondary opacity-25'} 
                style={{ backgroundColor: '#1a1c23', borderRadius: '50%' }}
              />
              <div className={`small mt-2 fw-bold ${currentStep >= idx ? 'text-white' : 'text-muted'}`}>
                {step.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Row>
        <Col md={6} className="mb-4">
          <div className="p-3 rounded-4 bg-black bg-opacity-20 border border-info border-opacity-10 h-100">
            <h6 className="text-info fw-bold mb-4 small d-flex align-items-center">
              <FaTools className="me-2"/> FRONTEND TECH
            </h6>
            {feTechs.map((tech, idx) => {
              const { icon, color } = getTechIcon(tech.name);
              return (
                <Form.Group key={tech.name} className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ color: color, fontSize: '1.2rem' }}>{icon}</span>
                      <span className="small text-white fw-bold">{tech.name}</span>
                    </div>
                    <span className="small fw-bold" style={{ color: color }}>{tech.progress}%</span>
                  </div>
                  <Form.Range 
                    value={tech.progress} 
                    onChange={(e) => handleTechProgressChange('fe', idx, e.target.value)} 
                  />
                </Form.Group>
              );
            })}
          </div>
        </Col>

        <Col md={6} className="mb-4">
          <div className="p-3 rounded-4 bg-black bg-opacity-20 border border-warning border-opacity-10 h-100">
            <h6 className="text-warning fw-bold mb-4 small d-flex align-items-center">
              <FaDatabase className="me-2"/> BACKEND TECH
            </h6>
            {beTechs.map((tech, idx) => {
              const { icon, color } = getTechIcon(tech.name);
              return (
                <Form.Group key={tech.name} className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ color: color, fontSize: '1.2rem' }}>{icon}</span>
                      <span className="small text-white fw-bold">{tech.name}</span>
                    </div>
                    <span className="small fw-bold" style={{ color: color }}>{tech.progress}%</span>
                  </div>
                  <Form.Range 
                    value={tech.progress} 
                    onChange={(e) => handleTechProgressChange('be', idx, e.target.value)} 
                  />
                </Form.Group>
              );
            })}
          </div>
        </Col>
      </Row>

      <div className="d-grid mt-2">
        <Button variant="info" type="submit" size="lg" className="py-3 rounded-pill shadow fw-bold text-white" style={{ backgroundColor: '#0dcaf0', border: 'none' }}>
          상태 업데이트 저장 💾
        </Button>
      </div>
    </Form>
  );
};

export default DevUpdateForm;