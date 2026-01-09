import React, { useState, useEffect, useRef } from 'react';
import './ChatModal.css';
import { askChatbot, askAgentic } from "../../api/chatbot";
import { useNavigate } from 'react-router-dom';

export default function ChatModal({ isOpen, onClose }) {
    const navigate = useNavigate();
    const [shouldRender, setShouldRender] = useState(isOpen);
    const contentRef = useRef(null);
    const [isAgentic, setIsAgentic] = useState(false);

    const [messages, setMessages] = useState([
        { type: "bot", text: "Hi! I can help you with questions about your dashboard, companies, or analytics ✨" }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            // Scroll to bottom on open
            setTimeout(() => scrollToBottom(), 100);
        } else {
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Scroll to bottom whenever messages change or modal opens
    useEffect(() => {
        if (shouldRender) {
            scrollToBottom();
        }
    }, [messages, shouldRender]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && contentRef.current && !contentRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = { type: "user", text: inputValue };
        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            let data;
            if (isAgentic) {
                data = await askAgentic(userMessage.text);
                const botMessage = {
                    type: "bot",
                    text: data.answer || "I've completed my research.",
                    sources: data.sources || [],
                    isAgentic: true,
                    actions: data.actions || []
                };
                setMessages((prev) => [...prev, botMessage]);

                // Handle Frontend Actions (Navigation)
                if (data.frontend_action?.type === "company_profile" && data.frontend_action.company_id) {
                    setTimeout(() => {
                        navigate(`/companies/${data.frontend_action.company_id}`);
                        onClose(); // Close modal upon navigation
                    }, 1500); // Small delay to let user see the final message
                }
            } else {
                data = await askChatbot(userMessage.text);
                const botMessage = {
                    type: "bot",
                    text: data.answer || "I received your message but couldn't find an answer.",
                    sources: data.sources || [],
                    confidence: data.confidence
                };
                setMessages((prev) => [...prev, botMessage]);
            }
        } catch (error) {
            const errorMessage = {
                type: "bot",
                text: "Sorry, I encountered an error while processing your request. Please try again."
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!shouldRender) return null;

    return (
        <div
            className={`chat-modal-overlay ${isOpen ? 'open' : 'closing'}`}
        >
            <div className={`chat-modal-content ${isAgentic ? 'agentic' : ''}`} ref={contentRef}>
                <div className="chat-header">
                    <div className="chat-title">
                        <span>{isAgentic ? '🧬' : '✨'}</span>
                        {isAgentic ? 'Agentic Assistant' : 'AI Assistant'}
                    </div>
                    <div className="chat-header-actions">
                        <button
                            className={`agentic-toggle-btn ${isAgentic ? 'active' : ''}`}
                            onClick={() => setIsAgentic(!isAgentic)}
                            title={isAgentic ? "Back to Default Mode" : "Switch to Agentic Mode"}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2v4"></path>
                                <path d="M12 18v4"></path>
                                <path d="m4.93 4.93 2.83 2.83"></path>
                                <path d="m16.24 16.24 2.83 2.83"></path>
                                <path d="M2 12h4"></path>
                                <path d="M18 12h4"></path>
                                <path d="m4.93 19.07 2.83-2.83"></path>
                                <path d="m16.24 7.76 2.83-2.83"></path>
                            </svg>
                            <span>Agentic</span>
                        </button>
                        <button className="close-btn" onClick={onClose} aria-label="Close chat">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="chat-messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.type}`}>
                            <div className="message-text">{msg.text}</div>
                            {msg.type === "bot" && msg.confidence !== undefined && (
                                <div className="message-confidence">
                                    <span className="confidence-label">Confidence:</span>
                                    <span className="confidence-value">{(msg.confidence * 100).toFixed(0)}%</span>
                                </div>
                            )}
                            {msg.sources && msg.sources.length > 0 && (
                                <div className="message-sources">
                                    <p className="sources-label">Sources:</p>
                                    <ul>
                                        {msg.sources.map((source, i) => (
                                            <li key={i}>
                                                {source.company_name ? (
                                                    <>
                                                        <strong>{source.company_name}</strong>
                                                        {source.location && ` (${source.location}, ${source.industry})`}
                                                        {source.type && ` - ${source.type}`}
                                                    </>
                                                ) : (
                                                    <span>{source.content || source.type || "External Source"}</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {msg.isAgentic && msg.actions && msg.actions.length > 0 && (
                                <div className="agent-actions">
                                    <p className="actions-label">Agent Process:</p>
                                    <div className="actions-list">
                                        {msg.actions.map((action, i) => (
                                            <div key={i} className={`action-item ${action.status}`}>
                                                <span className="action-dot"></span>
                                                <span className="action-name">{action.function.replace('_', ' ')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="message bot loading">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-area">
                    <input
                        type="text"
                        className="chat-input"
                        placeholder="Enter your message..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                    />
                    <button className="send-btn" onClick={handleSend} disabled={isLoading || !inputValue.trim()}>
                        Ask
                    </button>
                </div>
            </div>
        </div>
    );
}
