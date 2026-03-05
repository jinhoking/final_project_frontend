import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Badge, Spinner, Modal, Button, ListGroup } from 'react-bootstrap';
// 🌟 필수 아이콘 유지
import { FaIdCard, FaUsers ,FaSearch, FaFileAlt, FaEnvelope, FaBell, FaUtensils, FaPaperPlane, FaRobot, FaExternalLinkAlt,
    FaYoutube, FaChevronRight, FaTimes } from 'react-icons/fa'; 
import axios from 'axios';
import ChatRoomListDrawer from '../hr/ChatRoomListDrawer';
import MessageDrawer from '../hr/MessageDrawer';
import EmployeeProfileModal from '../hr/EmployeeProfileModal';

const Header = ({ currentUser }) => {
  const [time, setTime] = useState(new Date());
  const [unreadCount, setUnreadCount] = useState(0); 
  const [showChatList, setShowChatList] = useState(false); 
  const [showMessage, setShowMessage] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  
  const [pendingList, setPendingList] = useState([]); 
  const [showApprovalModal, setShowApprovalModal] = useState(false); 

  const [showDirectory, setShowDirectory] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const [weatherData, setWeatherData] = useState(null);
  const [newsData, setNewsData] = useState([]); 
  const [mealData, setMealData] = useState({ main: "메뉴 로딩 중...", sub: "잠시만 기다려주세요" });
  
  const [aiTrends, setAiTrends] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null); 

  const [dismissedDocIds, setDismissedDocIds] = useState(() => {
    const saved = localStorage.getItem('dismissed_approvals');
    return saved ? JSON.parse(saved) : [];
  });

  const [cityIndex, setCityIndex] = useState(0);
  const cities = [
    { name: 'KOREA', tz: 'Asia/Seoul' },
    { name: 'USA', tz: 'America/New_York' },
    { name: 'UK', tz: 'Europe/London' }
  ];
  const [geminiRec, setGeminiRec] = useState({ keyword: "AI 스캐닝", search: "" });
  const [apiLoading, setApiLoading] = useState({ weather: true, news: true, meal: true, aiTrend: true, gemini: true });

  const [myStats, setMyStats] = useState({ pendingCount: 0 });
  const prevPendingRef = useRef(0); 
  const [isBellRinging, setIsBellRinging] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const cityTimer = setInterval(() => setCityIndex(p => (p + 1) % cities.length), 5000);
    return () => { clearInterval(timer); clearInterval(cityTimer); };
  }, [cities.length]);

  const fetchMealData = useCallback(async () => {
    try {
      setApiLoading(prev => ({ ...prev, meal: true }));
      const now = new Date();
      const kst = new Date(now.getTime() + (9 * 60 * 60 * 1000));
      const yyyymmdd = kst.toISOString().split('T')[0].replace(/-/g, '');
      const officeCode = "B10"; 
      const schoolCode = "7010057"; 
      const mealUrl = `https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&ATPT_OFCDC_SC_CODE=${officeCode}&SD_SCHUL_CODE=${schoolCode}&MLSV_YMD=${yyyymmdd}`;
      const res = await axios.get(mealUrl);
      if (res.data?.mealServiceDietInfo) {
        const rawMenu = res.data.mealServiceDietInfo[1].row[0].DDISH_NM;
        const cleanMenu = rawMenu.replace(/\([^)]*\)/g, '').replace(/[0-9.]/g, '').split('<br/>').map(item => item.trim()).filter(i => i.length > 0);
        setMealData({ main: cleanMenu[0] || "식단 정보", sub: cleanMenu.slice(1, 4).join(', ') || "상세 메뉴 없음" });
      } else {
        setMealData({ main: "급식 없음", sub: "오늘은 식단 정보가 없습니다." });
      }
    } catch (e) {
      setMealData({ main: "연결 오류", sub: "네트워크 상태를 확인하세요" });
    } finally {
      setApiLoading(prev => ({ ...prev, meal: false }));
    }
  }, []);

  const fetchGeminiRecommendation = useCallback(async () => {
    try {
      setApiLoading(prev => ({ ...prev, gemini: true }));
      const GEMINI_API_KEY = 'AIzaSyCPdPfFACxv9PJkyWd5Nj-MQQlCNfPTDL8'; 
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `개발자에게 도움될 IT 팁 키워드 1개만 정해줘. JSON {"keyword": "5자이내", "search": "유튜브검색어"} 로만 답해.` }] }] })
      });
      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
      setGeminiRec(JSON.parse(text));
    } catch (e) { setGeminiRec({ keyword: "AI 코딩", search: "Github Copilot 사용법" }); }
    finally { setApiLoading(prev => ({ ...prev, gemini: false })); }
  }, []);

  const fetchExternalApis = useCallback(async () => {
    try {
      const weatherRes = await axios.get('https://api.weatherapi.com/v1/current.json?key=ee92e1a0799b4f978b562159261601&q=Seoul&lang=ko&aqi=yes');
      setWeatherData(weatherRes.data);
    } catch (e) { console.error("Weather API Error"); }
    finally { setApiLoading(prev => ({ ...prev, weather: false })); }

    try {
      setApiLoading(prev => ({ ...prev, news: true }));
      const googleNewsRss = encodeURIComponent('https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko');
      const newsRes = await axios.get(`https://api.rss2json.com/v1/api.json?rss_url=${googleNewsRss}`);
      if (newsRes.data && newsRes.data.items) {
        const validNews = newsRes.data.items.slice(0, 10).map(item => ({
          title: item.title,
          url: item.link,
          urlToImage: item.thumbnail || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop'
        }));
        setNewsData(validNews);
      }
    } catch (e) {
      setNewsData([{ title: "[사내뉴스] ECP 통합 시스템 배포 및 안정화 작업 완료", url: "#", urlToImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100" }]);
    } finally { setApiLoading(prev => ({ ...prev, news: false })); }

    fetchMealData(); 
    fetchGeminiRecommendation();
  }, [fetchMealData, fetchGeminiRecommendation]);
  
  const fetchAITrendData = useCallback(async () => {
    try {
      setApiLoading(prev => ({ ...prev, aiTrend: true }));
      const res = await axios.get('https://huggingface.co/api/models?sort=downloads&direction=-1&limit=10');
      setAiTrends(res.data.map(m => ({
        id: m.modelId, name: m.modelId.split('/').pop().toUpperCase(), category: m.pipeline_tag || "General AI",
        downloads: m.downloads, likes: m.likes,
        thumbnail: `https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200&h=200&fit=crop&sig=${m.modelId}`
      })));
    } catch (e) {} finally { setApiLoading(prev => ({ ...prev, aiTrend: false })); }
  }, []);

  const fetchHeaderData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token || !currentUser) return; 
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [docRes, unreadRes, userRes] = await Promise.all([
        axios.get('http://ecpsystem.site:8080/api/documents', config).catch(() => ({ data: [] })),
        axios.get('http://ecpsystem.site:8080/api/chat/unread-count', config).catch(() => ({ data: 0 })),
        axios.get('http://ecpsystem.site:8080/api/users', config).catch(() => ({ data: [] }))
      ]);

      const myDocs = docRes.data || [];
      const filteredDocs = myDocs.filter(doc => {
        const isDismissed = dismissedDocIds.includes(String(doc.id));
        if (isDismissed) return false;
        const isMyTurn = doc.status === 'PENDING' && Number(doc.currentApproverId) === Number(currentUser.id);
        const isMyDocStatusChanged = Number(doc.writerId) === Number(currentUser.id) && (doc.status === 'APPROVED' || doc.status === 'REJECTED' || doc.status === 'PENDING');
        return isMyTurn || isMyDocStatusChanged;
      });

      const currentCount = filteredDocs.length;
      if (currentCount > prevPendingRef.current) {
        setIsBellRinging(true);
        setTimeout(() => setIsBellRinging(false), 3000);
      }
      prevPendingRef.current = currentCount;
      setPendingList(filteredDocs);
      setMyStats({ pendingCount: currentCount });
      setUnreadCount(Number(unreadRes.data));
      if (userRes && userRes.data) { setEmployees(userRes.data); }
    } catch (e) { console.error("Sync Fail", e); }
  }, [currentUser, dismissedDocIds]);
  
  const handleOpenProfile = (emp) => {
    setSelectedEmployee(emp);
    setShowProfile(true);
  };

  const handleOpenChat = (target) => {
    setSelectedPartner(target);
    setShowMessage(true);
    setShowProfile(false);
  };

  const handleDismissDoc = (e, docId) => {
    e.stopPropagation(); 
    const updatedIds = [...dismissedDocIds, String(docId)];
    setDismissedDocIds(updatedIds);
    localStorage.setItem('dismissed_approvals', JSON.stringify(updatedIds));
    setPendingList(prev => prev.filter(d => String(d.id) !== String(docId)));
    setMyStats(prev => ({ ...prev, pendingCount: prev.pendingCount - 1 }));
  };

  useEffect(() => {
    fetchHeaderData(); fetchExternalApis(); fetchAITrendData();
    const interval = setInterval(fetchHeaderData, 15000); 
    return () => clearInterval(interval);
  }, [fetchHeaderData, fetchExternalApis, fetchAITrendData]);

  const formatTimeByTz = (date, tz) => date.toLocaleTimeString('en-US', { hour12: false, timeZone: tz });
  const formatDate = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }).toUpperCase();

  return (
    <div className="border-bottom border-secondary py-1 mb-4" style={{ backgroundColor: '#0b0c10' }}>
      <style>{`
        /* 🌟 간격을 일정하고 딱 맞게 붙이기 위해 gap을 10px로 고정 */
        .h-wrapper { display: flex; align-items: center; justify-content: space-between; width: 100%; height: 80px; padding: 0 20px; gap: 10px; flex-wrap: nowrap; }
        .h-cell { display: flex; align-items: center; justify-content: center; height: 70px; overflow: hidden; }
        
        /* 🌟 뉴스/AI 트렌드가 중앙을 채우도록 flex: 1 적용 */
        .w-feed-expand { flex: 1; min-width: 0; }
        
        .f-label { font-size: 0.65rem; font-weight: 800; color: #555; text-transform: uppercase; margin-bottom: 1px; }
        .f-label-v2 { font-size: clamp(0.85rem, 1.2vw, 1rem); font-weight: 950; color: #aaa; text-transform: uppercase; margin-bottom: 1px; line-height: 1; }
        .f-country { font-size: 0.75rem; font-weight: 900; color: #0dcaf0; letter-spacing: 0.5px; margin-bottom: -2px; }
        .f-location { font-size: 0.85rem; font-weight: 950; color: #fff; line-height: 1; margin-bottom: 2px; }
        .f-temp { font-size: clamp(1.5rem, 2.5vw, 2.1rem); font-weight: 950; color: #fff; line-height: 0.85; }
        .f-clock { font-size: clamp(1.2rem, 1.8vw, 1.6rem); font-weight: 900; color: #0dcaf0; font-family: 'JetBrains Mono', monospace; line-height: 1; }
        
        /* 🌟 마우스 드래그 시 이상한 윤곽선(왼쪽 선 등) 안 뜨게 방지 */
        .header-box { background: rgba(13, 202, 240, 0.05); border: 1px solid rgba(13, 202, 240, 0.2); border-radius: 8px; height: 68px; display: flex; align-items: center; padding: 0 10px; position: relative; overflow: hidden; transition: all 0.2s; user-select: none; }
        .header-box:focus, .header-box:active { outline: none !important; box-shadow: none !important; }

        .news-title { font-size: clamp(0.85rem, 1.2vw, 1.1rem); font-weight: 900; color: #fff; white-space: nowrap; cursor: pointer; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); line-height: 68px; }
        .box-badge-news, .box-badge-ai { font-weight: 950; font-size: 0.6rem; padding: 1px 4px; border-radius: 3px; margin-right: 8px; flex-shrink: 0; }
        .box-badge-news { background: #0dcaf0; color: #000; animation: blink-news 2s infinite ease-in-out; }
        .box-badge-ai { background: #ffc107; color: #000; animation: blink-ai 2s infinite ease-in-out; }
        .neon-number { font-family: 'JetBrains Mono', monospace; color: #0dcaf0; font-size: clamp(1.8rem, 2.2vw, 2.4rem); font-weight: 950; line-height: 1; text-shadow: 0 0 10px rgba(13, 202, 240, 0.8); }
        @keyframes blink-news { 0%, 100% { opacity: 1; box-shadow: 0 0 5px rgba(13, 202, 240, 0.5); } 50% { opacity: 0.5; box-shadow: 0 0 0px rgba(13, 202, 240, 0); } }
        @keyframes blink-ai { 0%, 100% { opacity: 1; box-shadow: 0 0 5px rgba(255, 193, 7, 0.5); } 50% { opacity: 0.5; box-shadow: 0 0 0px rgba(255, 193, 7, 0); } }
        .hover-list:hover { background-color: rgba(13, 202, 240, 0.1) !important; cursor: pointer; }
        /* 🌟 헤더 박스 하늘빛 네온 호버 효과 */
        .glow-hover { transition: all 0.3s ease; }
        .glow-hover:hover { 
          box-shadow: 0 0 12px rgba(13, 202, 240, 0.6) !important; 
          border-color: rgba(13, 202, 240, 0.8) !important; 
          background: rgba(13, 202, 240, 0.15) !important; 
        }
        @media (max-width: 768px) {
          .h-wrapper { height: auto; padding: 10px; flex-wrap: wrap; gap: 8px; }
          .h-cell { flex: 1 1 100%; }
        }

        .org-chart-container { padding: 30px 20px; overflow-x: auto; overflow-y: auto; background: #0b0c10; text-align: center; min-height: 50vh; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; }
        .org-chart-container::-webkit-scrollbar { height: 8px; width: 8px; }
        .org-chart-container::-webkit-scrollbar-thumb { background: rgba(13, 202, 240, 0.4); border-radius: 4px; }
        .org-tree { display: inline-flex; justify-content: center; white-space: nowrap; margin: 0 auto; }
        .org-tree ul { padding-top: 20px; position: relative; transition: all 0.5s; display: flex; justify-content: center; padding-left: 0; margin-bottom: 0; }
        .org-tree li { float: left; text-align: center; list-style-type: none; position: relative; padding: 20px 10px 0 10px; }
        .org-tree li::before, .org-tree li::after { content: ''; position: absolute; top: 0; right: 50%; border-top: 2px solid rgba(13, 202, 240, 0.4); width: 50%; height: 20px; }
        .org-tree li::after { right: auto; left: 50%; border-left: 2px solid rgba(13, 202, 240, 0.4); }
        .org-tree li:only-child::after, .org-tree li:only-child::before { display: none; }
        .org-tree li:only-child { padding-top: 0; }
        .org-tree li:first-child::before, .org-tree li:last-child::after { border: 0 none; }
        .org-tree li:first-child::after { border-radius: 5px 0 0 0; }
        .org-tree li:last-child::before { border-right: 2px solid rgba(13, 202, 240, 0.4); border-radius: 0 5px 0 0; }
        .org-tree ul ul::before { content: ''; position: absolute; top: 0; left: 50%; border-left: 2px solid rgba(13, 202, 240, 0.4); width: 0; height: 20px; }
        .org-node-card { border: 1px solid rgba(13, 202, 240, 0.3); padding: 8px 15px; color: #fff; display: inline-block; border-radius: 6px; background: rgba(13, 202, 240, 0.05); box-shadow: 0 4px 10px rgba(0,0,0,0.5); position: relative; z-index: 2; min-width: 120px; }
        .org-node-card.root { background: rgba(13, 202, 240, 0.15); border: 2px solid #0dcaf0; font-size: 1.1rem; font-weight: 900; }
        .org-node-card.hq { background: rgba(255, 255, 255, 0.05); border-color: #0dcaf0; font-weight: 900; font-size: 1rem; border-width: 2px; }
        .org-team-box { background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(13, 202, 240, 0.4); border-radius: 8px; min-width: 160px; display: inline-block; position: relative; z-index: 2; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
        .org-team-header { background: rgba(13, 202, 240, 0.15); padding: 8px; font-weight: 900; color: #fff; border-bottom: 1px solid rgba(13, 202, 240, 0.4); font-size: 0.85rem; letter-spacing: 0.5px; }
        .org-team-list { padding: 8px; display: flex; flex-direction: column; gap: 6px; max-height: 220px; overflow-y: auto; background: rgba(255, 255, 255, 0.02); }
        .org-team-list::-webkit-scrollbar { width: 4px; }
        .org-team-list::-webkit-scrollbar-thumb { background: rgba(13, 202, 240, 0.4); border-radius: 4px; }
        .org-emp-card { background: #111; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; padding: 8px 10px; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: flex-start; text-align: left; }
        .org-emp-card:hover { border-color: #fff; background: rgba(13, 202, 240, 0.2); transform: translateY(-2px); box-shadow: 0 4px 10px rgba(13, 202, 240, 0.2); }
        .emp-name { font-weight: 900; color: #fff; font-size: 0.85rem; line-height: 1.2; }
        .emp-pos { font-size: 0.65rem; color: #0dcaf0; font-weight: 700; margin-top: 2px; }
        .org-search::placeholder { color: rgba(255, 255, 255, 0.7) !important; }
      `}</style>

      <div className="h-wrapper">
{/* ── 🌟 날씨 박스 (프리미엄 디자인: SEOUL 강조, 아이콘 입체화) ── */}
        <div className="h-cell" style={{ flex: 'none' }}>
          <div className="header-box glow-hover" 
               style={{ cursor: 'pointer', padding: '0 18px', display: 'flex', alignItems: 'center', gap: '14px' }} 
               onClick={() => window.open('https://www.aqi.in/weather/ko/south-korea/seoul/seoul', '_blank')}>
            
            {/* 날씨 아이콘 (원형 배경 + 네온 그림자 효과로 고급스럽게) */}
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '50%', padding: '4px', display: 'flex', boxShadow: 'inset 0 0 10px rgba(13, 202, 240, 0.1)' }}>
              <img src={weatherData?.current.condition.icon} 
                   style={{ width: '56px', height: '56px', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(13, 202, 240, 0.6))' }} 
                   alt="w" />
            </div>
            
            {/* 정보 영역 */}
            <div className="d-flex flex-column justify-content-center" style={{ lineHeight: 1.1 }}>
              
              {/* 1줄: 도시명 (크고 강렬하게) */}
              <div style={{ fontSize: '1.1rem', fontWeight: '950', color: '#fff', letterSpacing: '1px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                {weatherData?.location.name?.toUpperCase() ?? 'SEOUL'}
              </div>
              
              {/* 2줄: 온도 + AQI (작고 깔끔한 태그 스타일) */}
              <div className="d-flex align-items-center gap-2" style={{ marginTop: '4px' }}>
                {/* 온도 */}
                <span style={{ fontSize: '2rem', fontWeight: '900', color: '#0dcaf0' }}>
                  {weatherData ? `${Math.round(weatherData.current.temp_c)}°C` : '--°C'}
                </span>
                
                {/* 점 구분선 */}
                <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.3)' }}></span>
                
                {/* AQI 뱃지 */}
                <span style={{ 
                  background: 'rgba(0, 255, 136, 0.15)', border: '1px solid rgba(0, 255, 136, 0.4)', borderRadius: '4px', 
                  padding: '2px 6px', color: '#00ff88', fontSize: '0.65rem', fontWeight: '900', letterSpacing: '0.5px' 
                }}>
                  AQI {weatherData?.current.air_quality?.pm10.toFixed(0) ?? '--'}
                </span>
              </div>
              
            </div>
          </div>
        </div>

        {/* ── 시계 박스 ── */}
        <div className="h-cell" style={{ flex: 'none' }}>
          <div className="header-box d-flex flex-column align-items-center justify-content-center" style={{ minWidth: '120px' }}>
            <div className="f-country text-white" style={{ fontSize: "18px" }}>{cities[cityIndex].name}</div>
            <div className="f-clock">{formatTimeByTz(time, cities[cityIndex].tz)}</div>
            <div className="f-label text-info">{formatDate(time)}</div>
          </div>
        </div>

        {/* ── 식단 박스 ── */}
        <div className="h-cell" style={{ flex: 'none' }}>
          <div className="header-box d-flex flex-column align-items-center justify-content-center" style={{ minWidth: '140px' }}>
            <div className="f-label text-warning"><FaUtensils size={11}/> TODAY'S MENU</div>
            <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.15rem', whiteSpace: 'nowrap' }}>{mealData.main}</div>
            <div className="text-white-50 fw-bold" style={{ fontSize: '0.65rem', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px', whiteSpace: 'nowrap' }}>{mealData.sub}</div>
          </div>
        </div>

        {/* ── 🌟 피드 (가로 너비 확장 및 정중앙 배치) ── */}
        <div className="h-cell w-feed-expand gap-2">
          <div className="header-box flex-fill w-50 glow-hover" style={{background:'rgba(255,255,255,0.03)', borderColor:'rgba(13,202,240,0.4)'}}>
            <div className="box-badge-news">LIVE NEWS</div>
            <div className="flex-grow-1 h-100 overflow-hidden">
              <marquee scrollamount="5" style={{ height: '68px' }}>
                <div className="d-flex align-items-center h-100">
                  {newsData.length > 0 ? newsData.map((news, idx) => (
                    <div key={idx} className="d-flex align-items-center me-5" onClick={() => window.open(news.url, '_blank')} style={{cursor:'pointer', height: '68px'}}>
                      <img src={news.urlToImage} style={{ width: '40px', height: '40px', borderRadius: '4px', marginRight: '12px', objectFit: 'cover', border: '2px solid #0dcaf0' }} alt="n" />
                      <span className="news-title">{news.title}</span>
                    </div>
                  )) : <span className="news-title">📢 STREAMING INTEL FEED: NO DATA FROM SOURCE...</span>}
                </div>
              </marquee>
            </div>
          </div>
          <div className="header-box flex-fill w-50 glow-hover" style={{borderColor:'rgba(13,202,240,0.4)'}}>
            <div className="box-badge-ai">AI TREND</div>
            <div className="flex-grow-1 h-100 overflow-hidden">
              <marquee scrollamount="6" style={{ height: '68px' }}>
                <div className="d-flex align-items-center h-100">
                  {aiTrends.map((trend, idx) => (
                    <div key={idx} className="d-flex align-items-center me-5" style={{cursor:'pointer', height: '68px'}} onClick={() => setSelectedModel(trend)}>
                      <img src={trend.thumbnail} style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '12px', border: '2px solid #ffc107', objectFit: 'cover' }} alt="ai" />
                      <span className="news-title" style={{color:'#ffc107'}}>{trend.name}</span>
                    </div>
                  ))}
                </div>
              </marquee>
            </div>
          </div>
        </div>

        {/* ── 조직도 ── */}
        <div className="h-cell" style={{ flex: 'none' }}>
          <div className="header-box w-100 d-flex align-items-center justify-content-between px-3 glow-hover" 
               style={{cursor:'pointer', background:'rgba(13,202,240,0.08)', borderColor:'rgba(13,202,240,0.4)', minWidth: '120px'}} 
               onClick={() => setShowDirectory(true)}>
            <div className="d-flex flex-column align-items-start justify-content-center" style={{ gap: '3px' }}>
              <div className="text-info opacity-75" style={{ fontSize: '0.65rem', fontWeight: 900, whiteSpace: 'nowrap' }}>
                <FaUsers size={15} className="me-1"/> DIRECTORY
              </div>
              <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 950, whiteSpace: 'nowrap', lineHeight: 1.1 }}>조직도</div>
            </div>
            <FaIdCard size={38} color="#0dcaf0" style={{ opacity: 0.8 }} />
          </div>
        </div>

        {/* ── 🌟 결재 & 메시지 (간격 일정하게 맞춤) ── */}
        <div className="h-cell gap-2" style={{ flex: 'none' }}>
          <div className="header-box flex-fill justify-content-center glow-hover" style={{ cursor: 'pointer', minWidth: '130px' }} onClick={() => setShowApprovalModal(true)}>
            <div className="f-label-v2 me-2" style={{ fontSize: "20px" }}>MY 결재</div>
            <div className="d-flex align-items-center gap-2">
              <FaBell color={myStats.pendingCount > 0 ? "#ff3b3b" : "#444"} size={22} />
              <span className="neon-number">{myStats.pendingCount}</span>
            </div>
          </div>

          <div className="header-box flex-fill justify-content-center glow-hover" style={{ cursor: 'pointer', minWidth: '130px' }} onClick={() => setShowChatList(true)}>
            <div className="f-label-v2 me-2" style={{ fontSize: "20px" }}>메시지</div>
            <div className="position-relative d-flex align-items-center">
              <FaPaperPlane size={24} color={unreadCount > 0 ? "#ffc107" : "#0dcaf0"} />
              {unreadCount > 0 && (
                <Badge pill bg="danger" className="position-absolute" 
                       style={{ top: '-12px', right: '-15px', fontSize: '0.75rem', border: '2px solid #0b0c10', boxShadow: '0 0 5px rgba(255,0,0,0.5)' }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* --- 이하 기존 모달 코드 동일하게 유지됨 --- */}
      <ChatRoomListDrawer show={showChatList} onHide={() => setShowChatList(false)} currentUser={currentUser} onSelectRoom={(partner) => { setSelectedPartner(partner); setShowChatList(false); setShowMessage(true); }} />
      <MessageDrawer show={showMessage} onHide={() => setShowMessage(false)} onBack={() => { setShowMessage(false); setShowChatList(true); }} currentUser={currentUser} targetUser={selectedPartner} />
      <EmployeeProfileModal show={showProfile} onHide={() => setShowProfile(false)} employee={selectedEmployee} currentUser={currentUser} onSendMessage={handleOpenChat} />
      
      <Modal show={!!selectedModel} onHide={() => setSelectedModel(null)} centered size="lg" contentClassName="bg-dark text-white border-info">
        <Modal.Header closeButton closeVariant="white" className="border-secondary" style={{backgroundColor:"black"}}>
          <Modal.Title className="text-info fw-bold"><FaRobot className="me-2"/> AI Intelligence: {selectedModel?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="row">
            <div className="col-md-5"><img src={selectedModel?.thumbnail} className="img-fluid rounded border border-info shadow-lg" alt="ai" /></div>
            <div className="col-md-7">
              <h4 className="text-warning mb-3">{selectedModel?.category.toUpperCase()}</h4>
              <p className="text-light opacity-75">Hugging Face 트렌드 데이터입니다.</p>
              <div className="d-flex gap-3 mb-4"><Badge bg="primary">Downloads: {selectedModel?.downloads.toLocaleString()}</Badge><Badge bg="danger">Likes: {selectedModel?.likes.toLocaleString()}</Badge></div>
              <div className="d-grid gap-2">
                <Button variant="outline-info" onClick={() => window.open(`https://huggingface.co/${selectedModel?.id}`, '_blank')}><FaExternalLinkAlt className="me-2"/> 방문</Button>
                <Button variant="outline-danger" onClick={() => window.open(`https://www.youtube.com/results?search_query=${selectedModel?.name}+ai`, '_blank')}><FaYoutube className="me-2"/> 검색</Button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={showApprovalModal} onHide={() => setShowApprovalModal(false)} centered size="lg" contentClassName="bg-dark text-white border-info">
        <Modal.Header closeButton closeVariant="white" className="border-secondary" style={{backgroundColor:"black"}}>
          <Modal.Title className="text-info fw-bold"><FaFileAlt className="me-2"/> 전자결재 진행 현황</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {pendingList.length > 0 ? (
            <div className="list-group list-group-flush">
              {pendingList.map((doc) => (
                <div key={doc.id} className="list-group-item bg-transparent text-white border-secondary border-opacity-25 d-flex justify-content-between align-items-center py-3 px-4 hover-list" onClick={() => window.location.href = `/approval/detail/${doc.id}`}>
                  <div className="d-flex flex-column">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <Badge bg={doc.status === 'APPROVED' ? 'success' : doc.status === 'REJECTED' ? 'danger' : 'warning'}>{doc.status === 'PENDING' ? '검토대기' : doc.status === 'APPROVED' ? '승인완료' : '반려'}</Badge>
                      <span className="text-white-50" style={{ fontSize: '0.8rem' }}>No.{doc.id}</span>
                    </div>
                    <div className="fw-bold fs-5">{doc.title}</div>
                    <div className="text-info small">{doc.drafterName} | {doc.createdAt?.split('T')[0]}</div>
                  </div>
                  <Button variant="danger" size="sm" onClick={(e) => handleDismissDoc(e, doc.id)}><FaTimes className="me-1" /> 제거</Button>
                </div>
              ))}
            </div>
          ) : <div className="text-center py-5 text-white-50">진행 중인 결재가 없습니다.</div>}
        </Modal.Body>
      </Modal>

      <Modal show={showDirectory} onHide={() => setShowDirectory(false)} centered size="xl" contentClassName="bg-dark text-white border-info">
        <Modal.Header closeButton closeVariant="white" className="border-secondary" style={{backgroundColor:"black" }} glow-hover>
          <Modal.Title className="text-info fw-bold"><FaUsers className="me-2"/> 전사 조직도 다이어그램</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 d-flex flex-column">
          <div className="p-3 bg-black border-bottom border-secondary border-opacity-50">
            <input type="text" className="form-control org-search bg-dark text-white border-secondary" placeholder="직원 이름 또는 부서 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          {(() => {
            const getEmps = (deptName, divName) => {
              return employees.filter(e => {
                const matchSearch = e.name?.includes(searchTerm) || e.deptName?.includes(searchTerm) || divName.includes(searchTerm) || '본사'.includes(searchTerm);
                return (e.deptName === deptName) && matchSearch;
              });
            };

            const strategyHead = getEmps('전략기획본부', '전략기획본부'); 
            const insaEmps = getEmps('인사팀', '전략기획본부');
            const mgmtEmps = getEmps('경영지원팀', '전략기획본부');
            const devHead = getEmps('개발지원본부', '개발지원본부'); 
            const devEmps = getEmps('개발팀', '개발지원본부');
            const secEmps = getEmps('보안팀', '개발지원본부');
            const unassignedEmps = employees.filter(e => {
              const isKnown = ['인사팀', '경영지원팀', '개발팀', '보안팀', '전략기획본부', '개발지원본부', '본사'].includes(e.deptName);
              const matchSearch = e.name?.includes(searchTerm) || (e.deptName || '미배정').includes(searchTerm) || '미배정'.includes(searchTerm) || '관리자'.includes(searchTerm);
              return !isKnown && matchSearch;
            });

            const renderTeamBox = (teamName, empList, borderColor = "rgba(13, 202, 240, 0.4)", headerColor = "rgba(13, 202, 240, 0.15)") => (
              <div className="org-team-box" style={{ borderColor }}>
                <div className="org-team-header" style={{ background: headerColor }}>
                  {teamName} <span className="badge bg-dark border border-secondary ms-1">{empList.length}</span>
                </div>
                <div className="org-team-list">
                  {empList.length > 0 ? empList.map(emp => (
                    <div key={emp.id} className="org-emp-card" onClick={() => handleOpenProfile(emp)}>
                      <div className="emp-name">{emp.name}</div>
                      <div className="emp-pos">
                        {emp.position} 
                        {emp.deptName !== teamName && emp.deptName ? ` (${emp.deptName})` : ''}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center text-white-50 small py-2">인원 없음</div>
                  )}
                </div>
              </div>
            );

            return (
              <div className="org-chart-container">
                <div className="org-tree">
                  <ul>
                    <li>
                      <div className="org-node-card root">🏢 ECP Corporation</div>
                      <ul>
                        <li>
                          <div className="org-node-card hq">본사</div>
                          <ul>
                            <li>
                              <div className="org-team-box" style={{ borderColor: '#0dcaf0', borderWidth: '2px' }}>
                                <div className="org-team-header" style={{ background: 'rgba(13, 202, 240, 0.2)' }}>전략기획본부 (본부장)</div>
                                {strategyHead.length > 0 && (
                                  <div className="org-team-list" style={{ background: 'rgba(255, 152, 0, 0.05)' }}>
                                    {strategyHead.map(emp => (
                                      <div key={emp.id} className="org-emp-card" style={{ borderColor: 'rgba(255, 152, 0, 0.5)' }} onClick={() => handleOpenProfile(emp)}>
                                        <div className="emp-name" style={{ color: '#ffc107' }}>{emp.name}</div>
                                        <div className="emp-pos text-white-50">{emp.position}</div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <ul>
                                <li>{renderTeamBox('인사팀', insaEmps)}</li>
                                <li>{renderTeamBox('경영지원팀', mgmtEmps)}</li>
                              </ul>
                            </li>
                            <li>
                              <div className="org-team-box" style={{ borderColor: '#0dcaf0', borderWidth: '2px' }}>
                                <div className="org-team-header" style={{ background: 'rgba(13, 202, 240, 0.2)' }}>개발지원본부 (본부장)</div>
                                {devHead.length > 0 && (
                                  <div className="org-team-list" style={{ background: 'rgba(255, 152, 0, 0.05)' }}>
                                    {devHead.map(emp => (
                                      <div key={emp.id} className="org-emp-card" style={{ borderColor: 'rgba(255, 152, 0, 0.5)' }} onClick={() => handleOpenProfile(emp)}>
                                        <div className="emp-name" style={{ color: '#ffc107' }}>{emp.name}</div>
                                        <div className="emp-pos text-white-50">{emp.position}</div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <ul>
                                <li>{renderTeamBox('개발팀', devEmps)}</li>
                                <li>{renderTeamBox('보안팀', secEmps)}</li>
                              </ul>
                            </li>
                          </ul>
                        </li>
                        <li>
                          {renderTeamBox('미배정 / 관리자', unassignedEmps, "rgba(255, 193, 7, 0.6)", "rgba(255, 193, 7, 0.2)")}
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>
            );
          })()}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Header;