'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Upload, Loader2 } from 'lucide-react';
import styles from './conversational.module.css';

export type StepType = 'text' | 'email' | 'tel' | 'password' | 'file' | 'select' | 'confirm';

export type Step = {
  id: string;
  question: string | ((data: any) => string);
  field: string;
  type: StepType;
  options?: string[];
  placeholder?: string;
  validate?: (value: string) => string | boolean;
};

type Message = {
  id: string;
  type: 'bot' | 'user';
  text: string;
  component?: React.ReactNode;
};

interface ConversationalFlowProps {
  steps: Step[];
  initialMessage?: string;
  onComplete: (data: any) => Promise<void>;
  botName?: string;
  botAvatar?: string;
}

export default function ConversationalFlow({ 
  steps, 
  initialMessage = "Olá! Vamos começar seu cadastro?", 
  onComplete,
  botName = "Assistente Feira.Casa",
  botAvatar = "https://ui-avatars.com/api/?name=Feira+Casa&background=0e6b17&color=fff"
}: ConversationalFlowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const init = async () => {
      setIsTyping(true);
      await new Promise(r => setTimeout(r, 1000));
      addBotMessage(initialMessage);
      await new Promise(r => setTimeout(r, 1000));
      askCurrentQuestion(0);
    };
    init();
  }, []);

  const addBotMessage = (text: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString() + Math.random(), type: 'bot', text }]);
    setIsTyping(false);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString() + Math.random(), type: 'user', text }]);
  };

  const askCurrentQuestion = (index: number) => {
    const step = steps[index];
    if (!step) return;

    setIsTyping(true);
    setTimeout(() => {
      const questionText = typeof step.question === 'function' 
        ? step.question(formData) 
        : step.question;
      addBotMessage(questionText);
    }, 1000);
  };

  const handleSend = async () => {
    if (!inputValue.trim() && steps[currentStepIndex].type !== 'file') return;

    const step = steps[currentStepIndex];
    const value = inputValue;

    if (step.validate) {
      const error = step.validate(value);
      if (typeof error === 'string') {
        setIsTyping(true);
        setTimeout(() => {
          addBotMessage(error);
        }, 500);
        return;
      }
    }

    setInputValue('');
    addUserMessage(value);
    const updatedData = { ...formData, [step.field]: value };
    setFormData(updatedData);

    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      // Wait for user message to settle
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          const nextStep = steps[nextIndex];
          const questionText = typeof nextStep.question === 'function' 
            ? nextStep.question(updatedData) 
            : nextStep.question;
          addBotMessage(questionText);
        }, 1000);
      }, 500);
    } else {
      setIsSubmitting(true);
      setIsTyping(true);
      try {
        await onComplete(updatedData);
        addBotMessage("Cadastro realizado com sucesso! Bem-vindo.");
      } catch (err: any) {
        addBotMessage(`Ops, algo deu errado: ${err.message || 'Tente novamente.'}`);
      } finally {
        setIsSubmitting(false);
        setIsTyping(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addUserMessage(`Arquivo: ${file.name}`);
      setInputValue(file.name); // Just for the flow
      setTimeout(() => handleSend(), 100);
    }
  };

  const currentStep = steps[currentStepIndex];

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <div className={styles.botAvatar}>
          <img src={botAvatar} alt="Bot" />
        </div>
        <div>
          <h3>{botName}</h3>
          <span>{isSubmitting ? 'Processando dados...' : 'Online para te ajudar'}</span>
        </div>
      </div>

      <div className={styles.messagesArea}>
        {messages.map((msg) => (
          <div key={msg.id} className={`${styles.messageRow} ${msg.type === 'user' ? styles.userRow : styles.botRow}`}>
            <div className={styles.messageBubble}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className={styles.botRow}>
            <div className={`${styles.messageBubble} ${styles.typing}`}>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        {currentStep?.type === 'file' ? (
          <label className={styles.fileInputLabel}>
            <Upload size={20} />
            Enviar Documento
            <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        ) : currentStep?.type === 'select' ? (
          <div className={styles.optionsGrid}>
            {currentStep.options?.map(opt => (
              <button 
                key={opt} 
                onClick={() => {
                  setInputValue(opt);
                  setTimeout(() => handleSend(), 100);
                }}
                className={styles.optionBtn}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : currentStep?.type === 'confirm' ? (
          <div className={styles.optionsGrid}>
            <button onClick={() => { setInputValue('Sim!'); setTimeout(() => handleSend(), 100); }} className={styles.confirmBtn}>Sim!</button>
            <button onClick={() => { setInputValue('Não'); setTimeout(() => handleSend(), 100); }} className={styles.cancelBtn}>Não</button>
          </div>
        ) : (
          <div className={styles.textInputWrapper}>
            <input 
              type={currentStep?.type === 'password' ? 'password' : currentStep?.type === 'email' ? 'email' : 'text'} 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={currentStep?.placeholder || "Digite sua resposta aqui..."}
              disabled={isTyping || isSubmitting}
            />
            <button onClick={handleSend} disabled={!inputValue.trim() || isTyping || isSubmitting}>
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
