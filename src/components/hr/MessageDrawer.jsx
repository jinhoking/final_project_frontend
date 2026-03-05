import React, { useState, useEffect, useRef } from 'react';
import { Offcanvas, Form, Button, InputGroup, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { FaPaperPlane, FaUserCircle, FaChevronLeft, FaComments, FaTimes, FaShieldAlt, FaLock } from 'react-icons/fa';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import axios from 'axios';

const MessageDrawer = ({ show, onHide, onBack, targetUser, currentUser }) => {
  const [msg, setMsg] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const stompClient = useRef(null);
  const messagesEndRef = useRef(null);

  const getRoomId = (user1, user2) => {
    if (!user1 || !user2) return null;
    const ids = [user1.id, user2.id].sort((a, b) => a - b);
    return `${ids[0]}-${ids[1]}`;
  };

  const roomId = getRoomId(currentUser, targetUser);

  useEffect(() => {
    if (show && roomId) {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const initChat = async () => {
        try {
          const historyRes = await axios.get(`http://ecpsystem.site:8080/api/chat/history/${roomId}`, config);
          setChatHistory(historyRes.data);
          await axios.put(`http://ecpsystem.site:8080/api/chat/read/${roomId}`, {}, config);
        } catch (err) { console.error(err); }
      };
      initChat();

      const socket = new SockJS('http://ecpsystem.site:8080/ws');
      stompClient.current = Stomp.over(socket);
      stompClient.current.debug = () => {}; 
      stompClient.current.connect({}, () => {
        stompClient.current.subscribe(`/sub/chat/room/${roomId}`, (message) => {
          const receivedMsg = JSON.parse(message.body);
          if (receivedMsg.roomId === roomId) {
            setChatHistory((prev) => [...prev, { ...receivedMsg, createdAt: receivedMsg.createdAt || new Date().toISOString() }]);
            if (receivedMsg.senderId !== currentUser.id) axios.put(`http://ecpsystem.site:8080/api/chat/read/${roomId}`, {}, config);
          }
        });
      });
    }
    return () => { if (stompClient.current?.connected) stompClient.current.disconnect(); };
  }, [show, roomId, currentUser]);

  const sendMessage = () => {
    if (msg.trim() !== "" && stompClient.current?.connected && roomId) {
      stompClient.current.send("/pub/chat/message", {}, JSON.stringify({
        roomId: roomId, senderId: currentUser.id, senderName: currentUser.name,
        receiverId: targetUser.id, message: msg, createdAt: new Date().toISOString()
      }));
      setMsg("");
    }
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);

  return (
    <Offcanvas show={show} onHide={onHide} placement="end" className="msg-drawer" style={{ width: '420px' }}>
      <style>{`
        .msg-drawer { z-index: 9999 !important; background: #0b0c10 !important; border-left: 1px solid rgba(13, 202, 240, 0.3) !important; }
        .offcanvas-backdrop { z-index: 9998 !important; }
        
        /* 1층: 메인 네비게이션 헤더 */
        .nav-header { 
          background: #0b0c10; 
          padding: 10px 15px; 
          display: flex; 
          align-items: center; 
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .nav-title { font-size: 0.85rem; font-weight: 900; color: #0dcaf0; letter-spacing: 1px; opacity: 0.8; }

        /* 2층: 고정 파트너 정보 헤더 (Sub-header) */
        .info-header { 
          background: rgba(13, 202, 240, 0.08); 
          padding: 15px 20px; 
          border-bottom: 1px solid rgba(13, 202, 240, 0.2);
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .partner-name-text { font-size: 1.1rem; font-weight: 950; color: #fff; line-height: 1; }
        .partner-meta-text { font-size: 0.75rem; color: #0dcaf0; font-weight: 700; margin-top: 4px; }
        .secure-badge { font-size: 0.6rem; background: rgba(13, 202, 240, 0.1); border: 1px solid rgba(13, 202, 240, 0.3); color: #0dcaf0; padding: 2px 6px; border-radius: 4px; }

        /* 채팅 UI (카톡 스타일 유지) */
        .chat-bubble { font-size: 0.95rem; line-height: 1.5; padding: 10px 14px; max-width: 100%; word-break: break-all; }
        .my-bubble { background: #0dcaf0; color: #000; border-radius: 15px 2px 15px 15px; font-weight: 600; box-shadow: 0 4px 15px rgba(13, 202, 240, 0.2); }
        .other-bubble { background: rgba(255, 255, 255, 0.1); color: #fff; border-radius: 2px 15px 15px 15px; border: 1px solid rgba(255, 255, 255, 0.05); }
        .msg-time { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: #555; align-self: flex-end; margin: 0 5px; min-width: 35px; }
        .other-info-label { font-size: 0.75rem; color: #aaa; margin-bottom: 4px; font-weight: 700; }

        .input-area { background: #000; border-top: 1px solid rgba(13, 202, 240, 0.2); padding: 15px; }
        .custom-scroll::-webkit-scrollbar { width: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(13, 202, 240, 0.3); }
      `}</style>

      {/* 🌟 1층: 네비게이션 바 */}
      <div className="nav-header">
        <Button variant="link" className="text-info p-0" onClick={onBack}>
          <FaChevronLeft size={20} />
        </Button>
        <div className="nav-title"><FaLock size={10} className="me-1"/> ENCRYPTED CHANNEL</div>
        <FaTimes size={22} className="text-white-50" style={{ cursor: 'pointer' }} onClick={onHide} />
      </div>

      {/* 🌟 2층: 고정 부제목 헤더 (상대방 정보) */}
      <div className="info-header">
        <div className="position-relative">
          <FaUserCircle size={45} className="text-info opacity-50" />
          <div className="position-absolute bottom-0 end-0 bg-success rounded-circle" style={{ width: '12px', height: '12px', border: '2px solid #0b0c10' }}></div>
        </div>
        <div className="d-flex flex-column flex-grow-1 overflow-hidden">
          <div className="d-flex align-items-center">
            <span className="partner-name-text text-truncate">{targetUser?.name || "Unknown"}</span>
            <span className="secure-badge ms-2">E2EE</span>
          </div>
          <div className="partner-meta-text text-truncate">
            {targetUser?.pos || "Position"} <span className="mx-1 opacity-30">|</span> {targetUser?.dept || "Department"}
          </div>
        </div>
      </div>
      
      <Offcanvas.Body className="p-0 d-flex flex-column custom-scroll">
        <div className="flex-grow-1 p-3 overflow-auto custom-scroll" style={{ background: '#0b0c10' }}>
          {chatHistory.map((chat, idx) => {
            const isMe = String(chat.senderId) === String(currentUser?.id);
            const d = chat.createdAt ? new Date(chat.createdAt) : new Date();
            const msgTime = d.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true });
            
            return (
              <div key={idx} className={`d-flex mb-4 ${isMe ? 'justify-content-end' : 'justify-content-start'}`}>
                {!isMe && <FaUserCircle size={40} className="text-secondary opacity-25 me-2 mt-1" />}
                <div className="d-flex flex-column" style={{ maxWidth: '75%' }}>
                  {!isMe && (
                    <div className="other-info-label">
                      {chat.senderName} 
                    </div>
                  )}
                  <div className={`d-flex ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`chat-bubble ${isMe ? 'my-bubble' : 'other-bubble'}`}>{chat.message}</div>
                    <div className="msg-time">{msgTime}</div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <InputGroup>
            <Form.Control 
              className="bg-black text-white border-secondary border-opacity-50" 
              placeholder="보안 메시지를 입력하세요..." 
              value={msg} 
              onChange={(e) => setMsg(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()} 
            />
            <Button variant="info" onClick={sendMessage} className="px-3">
              <FaPaperPlane className="text-dark" />
            </Button>
          </InputGroup>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default MessageDrawer;