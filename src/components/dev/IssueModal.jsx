import React, { useState } from 'react';
import { Modal, Button, ListGroup, Row, Col, Badge, Form, Collapse } from 'react-bootstrap';

const IssueModal = ({ show, onHide, projectName, issueList, onAddIssue }) => {
  const [showAddForm, setShowAddForm] = useState(false); // 입력 폼 토글 상태
  
  // 새 이슈 입력 상태
  const [newIssue, setNewIssue] = useState({
    title: '',
    writer: '',
    type: 'Major'
  });

  const handleChange = (e) => {
    setNewIssue({ ...newIssue, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!newIssue.title || !newIssue.writer) {
      alert("이슈 내용과 작성자를 모두 입력해주세요.");
      return;
    }
    // 부모 컴포넌트(DevStatusPage)로 데이터 전송
    onAddIssue(newIssue);
    
    // 초기화
    setNewIssue({ title: '', writer: '', type: 'Major' });
    setShowAddForm(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <style>
        {`
          .custom-placeholder::placeholder {
            color: #ced4da !important;
            opacity: 0.7;
          }
          .custom-placeholder {
            color: white !important;
            background-color: #212529 !important;
          }
          /* 리스트 스크롤바 디자인 */
          .issue-list-scroll::-webkit-scrollbar { width: 6px; }
          .issue-list-scroll::-webkit-scrollbar-thumb { background: #444; border-radius: 10px; }
        `}
      </style>

      <div className="bg-dark border border-secondary rounded-3 text-white overflow-hidden shadow-lg">
        
        {/* 헤더: 배치 유지 (제목 좌측, 버튼 우측) */}
        <Modal.Header closeButton closeVariant="white" className="border-secondary bg-black bg-opacity-20 d-flex align-items-center">
          <Modal.Title className="fs-5 fw-bold me-auto">
            <span className="text-danger">🚨 {projectName}</span> 이슈 목록
          </Modal.Title>
          <Button 
            variant={showAddForm ? "secondary" : "danger"} 
            size="sm" 
            className="me-2 fw-bold"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? "취소" : "+ 이슈 등록"}
          </Button>
        </Modal.Header>

        <Modal.Body className="p-0">
          
          {/* 이슈 등록 폼: 배치 유지 (Row-Col 구조) */}
          <Collapse in={showAddForm}>
            <div className="p-4 bg-secondary bg-opacity-10 border-bottom border-secondary">
              <Row className="g-2">
                <Col md={6}>
                  <Form.Control 
                    type="text" 
                    placeholder="이슈 내용 (예: 로그인 API 500 에러)" 
                    name="title"
                    value={newIssue.title}
                    onChange={handleChange}
                    className="custom-placeholder border-secondary"
                  />
                </Col>
                <Col md={3}>
                  <Form.Control 
                    type="text" 
                    placeholder="작성자 이름" 
                    name="writer"
                    value={newIssue.writer}
                    onChange={handleChange}
                    className="custom-placeholder border-secondary"
                  />
                </Col>
                <Col md={3}>
                  <Form.Select 
                    name="type" 
                    value={newIssue.type}
                    onChange={handleChange}
                    className="bg-dark text-white border-secondary"
                  >
                    <option value="Critical">Critical (치명적)</option>
                    <option value="Major">Major (주요)</option>
                    <option value="Minor">Minor (사소함)</option>
                  </Form.Select>
                </Col>
              </Row>
              <div className="text-end mt-2">
                <Button variant="danger" size="sm" className="fw-bold px-3" onClick={handleSubmit}>등록하기</Button>
              </div>
            </div>
          </Collapse>

          {/* 컬럼 헤더: 배치 유지 (6:2:2:2 비율) */}
          <div className="bg-black bg-opacity-40 border-bottom border-secondary py-2 px-4">
            <Row className="text-white-50 fw-bold small text-center">
              <Col xs={6} className="text-start">이슈 내용 / ID</Col>
              <Col xs={2}>작성자</Col>
              <Col xs={2}>날짜</Col>
              <Col xs={2}>상태</Col>
            </Row>
          </div>

          {/* 리스트 출력: 배치 유지 */}
          <div className="issue-list-scroll" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {issueList && issueList.length > 0 ? (
              <ListGroup variant="flush">
                {issueList.map((issue) => (
                  <ListGroup.Item 
                    key={issue.id} 
                    className="bg-transparent text-white border-secondary py-3 px-4"
                  >
                    <Row className="align-items-center text-center">
                      <Col xs={6} className="text-start">
                        <span className="fw-bold d-block text-truncate">{issue.title}</span>
                        <small className="text-white-50" style={{ fontSize: '0.75rem' }}>ID: #{issue.id}</small>
                      </Col>
                      <Col xs={2} className="small text-white-50">{issue.writer}</Col>
                      {/* 백엔드 DTO 필드명인 issue.date 사용 */}
                      <Col xs={2} className="small text-white-50">{issue.date}</Col>
                      <Col xs={2}>
                        <Badge bg={issue.type === 'Critical' ? 'danger' : (issue.type === 'Major' ? 'warning' : 'secondary')} className="px-2 py-1">
                          {issue.type}
                        </Badge>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <div className="p-5 text-center text-white-50">
                현재 등록된 이슈가 없습니다. 🎉
              </div>
            )}
          </div>
        </Modal.Body>
      </div>
    </Modal>
  );
};

export default IssueModal;