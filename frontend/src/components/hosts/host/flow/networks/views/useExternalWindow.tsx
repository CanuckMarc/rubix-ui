import { render, createPortal } from "react-dom";
import { useEffect, useState } from "react";
import 'antd/dist/antd.css';
import "./style.css"
import { ExternalWindowParamType } from './table'

// const containerEl: HTMLDivElement = document.createElement('div');
// containerEl.setAttribute("id", "external-window-container");

// renderedElement: JSX.Element
export const useExternalWindow = (inputObj: ExternalWindowParamType) => {
    let externalWindow: Window | null = null;
    const [isOpen, setIsOpen] = useState(false);

    const cleanupFunc = (e: Event) => {
        e.preventDefault();
        // e.returnValue = '';
        console.log('accessed event listener callback')
        externalWindow = null;
        setIsOpen(false)
    }
    
    useEffect(() => {
      if (isOpen) {
        externalWindow = window.open(`http://localhost:34115/#/log-table/connections/${inputObj.connUUID}/hosts/${inputObj.hostUUID}/pluginName/${inputObj.logNetwork}`, '', 'width=600,height=400,left=200,top=200');
        // externalWindow = window.open('', 'Log window', 'width=600,height=400,left=200,top=200');
       
        if (externalWindow) {
            externalWindow.addEventListener('unload', cleanupFunc);
            // externalWindow.addEventListener('beforeunload', cleanupFunc);


            // externalWindow.document.write(`<html><head><title>Log window</title><link rel="stylesheet" type="text/css" href="./style.css"></head><body></body></html>`);
            // externalWindow.document.body.appendChild(containerEl);
            // render(renderedElement, externalWindow.document.getElementById("external-window-container")!);
        }
      } 

    }, [isOpen]);
  
    return { isOpen, setIsOpen };
  };