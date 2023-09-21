import React, { useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../Modal.css';

function RedirectModal({ show, content, redirectPath }) {
    const navigate = useNavigate();

    useEffect(() => {
        if (show) {
            setTimeout(() => {
                navigate(redirectPath);
            }, 2000);
        }

    }, [show]);

    return (
        <Modal show={show}>
            <Modal.Body dangerouslySetInnerHTML={{ __html: content }} />
        </Modal>
    );
}

export { RedirectModal };
