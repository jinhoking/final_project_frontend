import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Spinner, Badge } from 'react-bootstrap';
import { FaRobot, FaYoutube, FaHeadset } from 'react-icons/fa';

const Footer = () => {
  const [geminiRec, setGeminiRec] = useState({ keyword: "AI 스캐닝", search: "" });
  const [loading, setLoading] = useState(true);

  const fetchGeminiTip = useCallback(async () => {
    try {
      setLoading(true);
      const GEMINI_API_KEY = 'AIzaSyCPdPfFACxv9PJkyWd5Nj-MQQlCNfPTDL8'; 
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `IT 팁 1개 JSON {"keyword": "5자이내", "search": "유튜브검색어"}` }] }] })
      });
      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
      setGeminiRec(JSON.parse(text));
    } catch (e) {
      setGeminiRec({ keyword: "AI 코딩", search: "Github Copilot" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGeminiTip();
  }, [fetchGeminiTip]);

  return (
    <footer className="bg-black text-white-50 py-3 mt-auto border-top border-secondary border-opacity-10">
      <style>{`
        .footer-link { color: #666; text-decoration: none; font-size: 0.8rem; transition: all 0.2s; white-space: nowrap; }
        .footer-link:hover { color: #0dcaf0; }
        .ai-rec-compact { 
          background: rgba(13, 202, 240, 0.05); 
          border: 1px solid rgba(13, 202, 240, 0.15); 
          border-radius: 8px; 
          padding: 6px 15px; 
          cursor: pointer; 
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ai-rec-compact:hover { 
          background: rgba(13, 202, 240, 0.1); 
          border-color: rgba(13, 202, 240, 0.3);
        }
      `}</style>

      <Container fluid className="px-5">
        <Row className="align-items-center">
          {/* 좌측: 로고 및 저작권 */}
          <Col md={4}>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="fw-black text-info" style={{ fontSize: '1rem', letterSpacing: '0.5px' }}>ECP PORTAL</span>
              <span className="text-secondary small" style={{fontSize: '0.7rem'}}>v2.1</span>
            </div>
            <div className="text-white-50 opacity-25" style={{ fontSize: '0.75rem' }}>
              © 2026 Your Company Inc. All rights reserved.
            </div>
          </Col>
          
          {/* 우측: AI 추천 + 개인정보방침 + 장애문의 */}
          <Col md={8} className="d-flex align-items-center justify-content-end gap-4">
            
            {/* 🌟 우측으로 이동된 AI REC */}
            <div className="ai-rec-compact" onClick={() => window.open(`https://www.youtube.com/results?search_query=${geminiRec.search}`, '_blank')}>
              <FaRobot className="text-info" size={14} />
              {loading ? (
                <Spinner animation="border" size="sm" variant="info" style={{width: '0.8rem', height: '0.8rem'}} />
              ) : (
                <span className="text-white fw-bold" style={{ fontSize: '0.85rem' }}>{geminiRec.keyword}</span>
              )}
              <FaYoutube color="#ff0000" size={18} />
            </div>

            {/* 링크 영역 */}
            <div className="d-flex gap-3 border-start border-secondary border-opacity-25 ps-4">
              <a href="#void" className="footer-link">개인정보처리방침</a>
              <a href="#void" className="footer-link">이용약관</a>
            </div>

            {/* 장애문의 */}
            <div className="d-flex align-items-center gap-2 px-3 py-1.5 rounded-pill" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <FaHeadset className="text-warning" size={12} />
              <span className="text-white-50 fw-bold" style={{ fontSize: '0.75rem' }}>내선 <span className="text-warning">119</span></span>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;