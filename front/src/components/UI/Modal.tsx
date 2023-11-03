import React, { PropsWithChildren } from 'react';
import ReactDom from 'react-dom';
import styled from 'styled-components';
import {
  darkBgColor,
  darkerBgColor,
  primaryLightColor,
} from '../../constants/color-tokens';

type ModalProps = PropsWithChildren<{
  dismissModalAction: () => void;
  showFullScreen?: boolean;
  className?: string;
}>;

const WrapperDiv = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 99;

  width: 100vw;
  height: 100vh;

  overflow: hidden;

  background-color: rgba(115, 115, 115, 0.4);
  backdrop-filter: blur(7px);

  display: flex;
  justify-content: center;
  align-items: center;

  .modal {
    position: relative;
    top: -10vh;

    width: fit-content;
    max-width: 75vw;
    min-width: 450px;
    min-height: 250px;

    background-color: ${darkerBgColor};

    padding: 60px;
    padding-top: 60px;
    border-radius: 20px;

    text-align: center;

    display: flex;
    flex-direction: column;
    align-items: center;

    --animate-duration: 300ms;

    &.full-screen {
      top: 0;

      max-width: none;
      width: 100vw;
      height: 100vh;
      overflow-x: hidden;

      border-radius: 0;

      --animate-duration: 300ms;
    }
  }

  .close-btn {
    position: absolute;
    top: 15px;
    right: 15px;

    color: ${primaryLightColor};
    font-size: 1.5rem;
    font-weight: bold;

    width: 40px;
    height: 40px;

    border: 2px ${darkBgColor} solid;
    border-radius: 5px;

    &:hover {
      background-color: ${darkBgColor};
    }
  }
`;

const Modal: React.FC<ModalProps> = ({
  dismissModalAction,
  showFullScreen = false,
  className,
  children,
}): JSX.Element => {
  const onModalDismissal = (e: React.MouseEvent<HTMLElement>) => {
    // Prevents the modal from closing when clicking on the modal itself
    if (e.target !== e.currentTarget) return;

    dismissModalAction();
  };

  return ReactDom.createPortal(
    <WrapperDiv onClick={onModalDismissal} className={className}>
      <div
        className={`modal ${
          showFullScreen && 'full-screen'
        } animate__animated ${
          showFullScreen ? 'animate__slideInUp' : 'animate__flipInY'
        }`}
      >
        <button type="button" className="close-btn" onClick={onModalDismissal}>
          x
        </button>
        {children}
      </div>
    </WrapperDiv>,
    document.getElementById('modal') as HTMLElement,
  );
};

export default Modal;
