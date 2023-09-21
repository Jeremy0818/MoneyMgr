import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import '../Modal.css';

function HelpModal({ show, onClose, content }) {
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Body dangerouslySetInnerHTML={{ __html: content }} />
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export { HelpModal };
