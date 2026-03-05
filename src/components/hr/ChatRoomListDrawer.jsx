import React, { useState, useEffect } from 'react';
import { Offcanvas, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { FaUserCircle, FaComments, FaChevronRight, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const ChatRoomListDrawer = ({ show, onHide, currentUser, onSelectRoom }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (show && currentUser) fetchRooms(); }, [show, currentUser]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://ecpsystem.site:8080/api/chat/rooms', { headers: { Authorization: `Bearer ${token}` } });
      const formattedRooms = (res.data || []).map(item => {
        let displayTime = "방금 전";
        if (item.lastTime) {
          const d = new Date(item.lastTime);
          displayTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        }
        return { ...item, displayTime };
      });
      setRooms(formattedRooms);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <Offcanvas show={show} onHide={onHide} placement="end" className="chat-drawer" style={{ width: '420px' }}>
      <style>{`
        .chat-drawer { z-index: 9999 !important; background: #0b0c10 !important; border-left: 1px solid rgba(13, 202, 240, 0.3) !important; }
        .offcanvas-backdrop { z-index: 9998 !important; }
        .drawer-header { background: rgba(13, 202, 240, 0.05); border-bottom: 1px solid rgba(13, 202, 240, 0.2); padding: 15px 20px; }
        .chat-room-item { background: transparent !important; border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important; padding: 18px !important; transition: all 0.2s ease; cursor: pointer; }
        .chat-room-item:hover { background: rgba(13, 202, 240, 0.08) !important; }
        .partner-name { font-size: 1.05rem; font-weight: 900; color: #fff; }
        .partner-pos { font-size: 0.8rem; color: #0dcaf0; font-weight: 800; margin-left: 5px; opacity: 0.8; }
        .last-time { font-family: 'JetBrains Mono', monospace; color: #555; font-size: 0.7rem; font-weight: 700; }
        .custom-scroll::-webkit-scrollbar { width: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(13, 202, 240, 0.3); }
      `}</style>

      <div className="drawer-header d-flex align-items-center justify-content-between">
        <div className="text-info fw-bold" style={{fontSize: '1.1rem'}}><FaComments className="me-2" /> INTELLIGENCE FEED</div>
        <FaTimes size={22} className="text-white-50" style={{cursor: 'pointer'}} onClick={onHide} />
      </div>
      
      <Offcanvas.Body className="p-0 custom-scroll">
        {loading ? ( <div className="text-center py-5"><Spinner animation="border" variant="info" size="sm" /></div> ) : (
          <ListGroup variant="flush">
            {rooms.map((room) => (
              <ListGroup.Item key={room.roomId} className="chat-room-item" onClick={() => onSelectRoom({ id: room.partnerId, name: room.partnerName, pos: room.partnerPos, dept: room.partnerDept })}>
                <div className="d-flex align-items-center gap-3">
                  <FaUserCircle size={45} className="text-secondary opacity-25" />
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="d-flex justify-content-between">
                      <div><span className="partner-name">{room.partnerName}</span><span className="partner-pos">{room.partnerPos}</span></div>
                      <span className="last-time">{room.displayTime}</span>
                    </div>
                    <div className="text-truncate text-white-50 small mt-1 pe-4">{room.lastMessage || "Encrypted signal..."}</div>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default ChatRoomListDrawer;