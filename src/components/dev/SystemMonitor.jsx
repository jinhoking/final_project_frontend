import React, { useState, useEffect } from 'react';
import { Row, Col, ProgressBar } from 'react-bootstrap';
import { FaServer, FaDatabase, FaNetworkWired, FaMicrochip, FaShieldAlt } from 'react-icons/fa';

const SystemMonitor = () => {
  // 상태 관리
  const [cpuLoad, setCpuLoad] = useState(45);
  const [memory, setMemory] = useState(62);
  const [latency, setLatency] = useState(24);
  // 보안 스캔 상태 (시각적 효과용)
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // 랜덤 데이터 생성 로직
      setCpuLoad(prev => Math.min(100, Math.max(10, prev + (Math.random() * 10 - 5))));
      setMemory(prev => Math.min(100, Math.max(20, prev + (Math.random() * 6 - 3))));
      setLatency(prev => Math.max(10, Math.floor(prev + (Math.random() * 20 - 10))));
      
      // 가끔씩 보안 스캔 중인 척하기
      if (Math.random() > 0.7) {
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 1500);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-100 p-3 d-flex flex-column" style={{ overflowY: 'hidden' }}>
        
        {/* 상단 2x2 그리드 (기존 유지) */}
        <Row className="g-3 flex-grow-1">
          {/* 1. CPU */}
          <Col xs={6}>
            <div className="bg-black bg-opacity-40 p-2 rounded border border-secondary border-opacity-25 h-100 d-flex flex-column justify-content-center">
              <div className="d-flex align-items-center mb-1">
                <FaMicrochip className="text-info me-2" />
                <small className="text-white-50" style={{ fontSize: '0.7rem' }}>CPU Load</small>
              </div>
              <h5 className="mb-1 fw-bold text-white">{cpuLoad.toFixed(1)}%</h5>
              <ProgressBar now={cpuLoad} variant="info" style={{ height: '4px' }} />
            </div>
          </Col>

          {/* 2. Memory */}
          <Col xs={6}>
            <div className="bg-black bg-opacity-40 p-2 rounded border border-secondary border-opacity-25 h-100 d-flex flex-column justify-content-center">
              <div className="d-flex align-items-center mb-1">
                <FaServer className="text-warning me-2" />
                <small className="text-white-50" style={{ fontSize: '0.7rem' }}>Memory</small>
              </div>
              <h5 className="mb-1 fw-bold text-white">{memory.toFixed(1)}%</h5>
              <ProgressBar now={memory} variant="warning" style={{ height: '4px' }} />
            </div>
          </Col>

          {/* 3. Latency */}
          <Col xs={6}>
            <div className="bg-black bg-opacity-40 p-2 rounded border border-secondary border-opacity-25 h-100 d-flex flex-column justify-content-center">
              <div className="d-flex align-items-center mb-1">
                <FaNetworkWired className="text-success me-2" />
                <small className="text-white-50" style={{ fontSize: '0.7rem' }}>API Latency</small>
              </div>
              <h5 className="mb-1 fw-bold text-white">{latency}ms</h5>
              <div className="d-flex mt-2 gap-1 align-items-end" style={{ height: '10px' }}>
                 {[1,2,3,4,5].map(i => (
                  <div key={i} style={{ 
                    width: '20%', 
                    height: latency > (i*15) ? '100%' : '30%', 
                    background: latency > 80 ? '#dc3545' : '#198754',
                    transition: 'all 0.3s'
                  }}></div>
                ))}
              </div>
            </div>
          </Col>

          {/* 4. Database */}
          <Col xs={6}>
            <div className="bg-black bg-opacity-40 p-2 rounded border border-secondary border-opacity-25 h-100 d-flex flex-column justify-content-center">
              <div className="d-flex align-items-center mb-1">
                <FaDatabase className="text-primary me-2" />
                <small className="text-white-50" style={{ fontSize: '0.7rem' }}>Database</small>
              </div>
              <h5 className="mb-1 fw-bold text-primary" style={{ fontSize: '0.9rem' }}>Connected</h5>
              <small className="text-white-50" style={{ fontSize: '0.65rem' }}>Replica: Master</small>
            </div>
          </Col>
        </Row>

        {/* [추가됨] 하단 보안 상태 바 */}
        <div className="mt-3 pt-2 border-top border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center text-success">
                <FaShieldAlt className={`me-2 ${isScanning ? 'animate__animated animate__pulse animate__infinite' : ''}`} />
                <span className="fw-bold" style={{ fontSize: '0.75rem' }}>
                    {isScanning ? "Scanning..." : "System Secure"}
                </span>
            </div>
            <div className="text-end">
                <small className="text-white-50 d-block" style={{ fontSize: '0.65rem' }}>TLS 1.3 Encrypted</small>
                <small className="text-white-50 d-block" style={{ fontSize: '0.65rem' }}>Firewall: Active</small>
            </div>
        </div>
    </div>
  );
};

export default SystemMonitor;