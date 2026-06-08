'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VendorChatPage() {
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatMsg, setChatMsg] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));
  }, []);

  useEffect(() => {
    if (!userId) return;
    
    // Carregar chats onde este usuário é o vendor
    const loadChats = async () => {
      const { data } = await supabase.from('mktplace_feira_chats')
        .select(`
          id, 
          order_id, 
          customer_id,
          customer:mktplace_feira_profiles!customer_id(full_name),
          order:mktplace_feira_orders!order_id(id, total_amount)
        `)
        .eq('vendor_id', userId);
      if (data) setChats(data);
    };
    loadChats();
  }, [userId]);

  useEffect(() => {
    if (!activeChat) return;

    // Load messages
    const loadMessages = async () => {
      const { data } = await supabase.from('mktplace_feira_messages')
        .select('*')
        .eq('chat_id', activeChat.id)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    loadMessages();

    // Subscribe to realtime
    const channel = supabase.channel(`chat-${activeChat.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mktplace_feira_messages', filter: `chat_id=eq.${activeChat.id}` }, (payload) => {
        setMessages(prev => {
          if (prev.find(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeChat]);

  const sendMessage = async () => {
    if (!chatMsg.trim() || !activeChat || !userId) return;
    const text = chatMsg.trim();
    setChatMsg('');

    const tempId = Math.random().toString();
    setMessages(prev => [...prev, { id: tempId, chat_id: activeChat.id, sender_id: userId, text, created_at: new Date().toISOString() }]);

    await supabase.from('mktplace_feira_messages').insert({
      chat_id: activeChat.id,
      sender_id: userId,
      text
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <Link href="/portal/feirante" className="back-link"><ArrowLeft size={16} /> Voltar</Link>
          <h2>Mensagens</h2>
        </div>
        <div className="chat-list">
          {chats.length === 0 && <p className="empty-msg">Nenhum chat aberto.</p>}
          {chats.map(chat => (
            <button 
              key={chat.id} 
              className={`chat-item ${activeChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => setActiveChat(chat)}
            >
              <div className="chat-item-avatar">
                {(chat.customer?.full_name || 'C')[0].toUpperCase()}
              </div>
              <div className="chat-item-info">
                <h4>{chat.customer?.full_name || 'Cliente'}</h4>
                <p>Pedido #{chat.order?.id?.split('-')[0].toUpperCase()}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="chat-main">
        {!activeChat ? (
          <div className="no-chat-selected">
            <MessageSquare size={48} strokeWidth={1} />
            <p>Selecione uma conversa para iniciar o atendimento</p>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <h3>{activeChat.customer?.full_name || 'Cliente'}</h3>
              <span>Pedido #{activeChat.order?.id?.split('-')[0].toUpperCase()} - R$ {Number(activeChat.order?.total_amount).toFixed(2).replace('.', ',')}</span>
            </div>
            
            <div className="chat-messages">
              {messages.length === 0 && <p className="empty-msg text-center mt-8">Envie uma mensagem para o cliente...</p>}
              {messages.map(m => {
                const isMe = m.sender_id === userId;
                return (
                  <div key={m.id} className={`bubble-wrap ${isMe ? 'user' : 'support'}`}>
                    <div className="bubble">
                      <p>{m.text}</p>
                      <span className="bubble-time">{new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="chat-input-row">
              <input 
                type="text" 
                className="chat-input" 
                placeholder="Escreva sua resposta..." 
                value={chatMsg}
                onChange={e => setChatMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <button className="chat-send" onClick={sendMessage}><Send size={18} /></button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .chat-container {
          display: flex;
          height: calc(100vh - 80px);
          background: #fff;
          border-radius: 16px;
          border: 1px solid #eef0ed;
          overflow: hidden;
          margin: 20px;
        }
        .chat-sidebar {
          width: 320px;
          border-right: 1px solid #eef0ed;
          display: flex;
          flex-direction: column;
          background: #fbfaf5;
        }
        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid #eef0ed;
        }
        .back-link { display: inline-flex; align-items: center; gap: 6px; color: #707a6f; font-size: 13px; font-weight: 600; text-decoration: none; margin-bottom: 12px; }
        .sidebar-header h2 { margin: 0; font-size: 20px; font-weight: 800; color: #231a11; }
        .chat-list { flex: 1; overflow-y: auto; }
        .chat-item { width: 100%; display: flex; align-items: center; gap: 12px; padding: 16px 20px; border: none; border-bottom: 1px solid #f0f2f0; background: transparent; cursor: pointer; text-align: left; transition: all 0.2s; }
        .chat-item:hover { background: #f0f9f1; }
        .chat-item.active { background: #0e6b17; }
        .chat-item.active h4, .chat-item.active p { color: white; }
        .chat-item-avatar { width: 44px; height: 44px; border-radius: 50%; background: #0e6b17; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; }
        .chat-item.active .chat-item-avatar { background: white; color: #0e6b17; }
        .chat-item-info h4 { margin: 0 0 4px; font-size: 15px; font-weight: 700; color: #231a11; }
        .chat-item-info p { margin: 0; font-size: 13px; color: #707a6f; }
        .empty-msg { padding: 20px; text-align: center; color: #888; font-size: 14px; }
        
        .chat-main { flex: 1; display: flex; flex-direction: column; background: #fdfdfd; }
        .no-chat-selected { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #a0a0a0; gap: 16px; }
        .no-chat-selected p { font-weight: 600; }
        
        .chat-header { padding: 20px 24px; border-bottom: 1px solid #eef0ed; background: white; }
        .chat-header h3 { margin: 0 0 4px; font-size: 18px; font-weight: 800; color: #231a11; }
        .chat-header span { font-size: 13px; font-weight: 600; color: #0e6b17; background: #f0f9f1; padding: 4px 10px; border-radius: 100px; }
        
        .chat-messages { flex: 1; padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background: #fafafa; }
        .bubble-wrap { display: flex; }
        .bubble-wrap.user { justify-content: flex-end; }
        .bubble-wrap.support { justify-content: flex-start; }
        .bubble { max-width: 70%; padding: 12px 16px; border-radius: 16px; font-size: 14px; font-weight: 600; line-height: 1.5; }
        .bubble-wrap.user .bubble { background: #0e6b17; color: white; border-bottom-right-radius: 4px; }
        .bubble-wrap.support .bubble { background: white; color: #231a11; border: 1px solid #eef0ed; border-bottom-left-radius: 4px; }
        .bubble-time { display: block; font-size: 10px; opacity: 0.7; margin-top: 6px; text-align: right; }
        
        .chat-input-row { padding: 20px 24px; border-top: 1px solid #eef0ed; background: white; display: flex; gap: 12px; }
        .chat-input { flex: 1; background: #f5f5f5; border: none; border-radius: 12px; padding: 0 20px; font-size: 14px; font-weight: 600; outline: none; }
        .chat-input:focus { box-shadow: 0 0 0 2px rgba(14,107,23,0.2); background: white; }
        .chat-send { width: 50px; height: 50px; border-radius: 12px; background: #0e6b17; color: white; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
        .chat-send:hover { background: #0b5512; transform: translateY(-2px); }
      `}</style>
    </div>
  );
}
