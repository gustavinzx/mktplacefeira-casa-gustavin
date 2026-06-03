'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useI18n } from '@/lib/i18n/client';
import {
  ShoppingBag, ChevronRight, Package, Clock, CheckCircle2,
  MapPin, ArrowRight, Search, Filter, MessageSquare, AlertCircle,
  X, Star, Send
} from 'lucide-react';
import Link from 'next/link';

interface OrderItem { name: string; qty: number; price: number; unit: string; }
interface TrackingStep { label: string; done: boolean; time?: string; }
interface Order {
  id: string; date: string; total: string; totalNum: number;
  status: string;
  items: number; itemsList: OrderItem[]; image: string; vendor: string;
  address: string; deliveryTime?: string; trackingProgress?: number;
  trackingSteps?: TrackingStep[];
}

export default function MyOrdersPage() {
  const { dictionary } = useI18n();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [chatOrder, setChatOrder] = useState<Order | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [chatMsg, setChatMsg] = useState('');
  const [chatMsgs, setChatMsgs] = useState<{ from: 'user' | 'support'; text: string; time: string }[]>([
    { from: 'support', text: 'Olá! Como posso ajudar você com seu pedido?', time: '10:23' },
  ]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch('/api/orders', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const mappedOrders: Order[] = data.data.map((o: any) => {
            const statusMap: Record<string, string> = {
              'pendente': 'Aguardando',
              'preparando': 'Sendo Preparado',
              'enviado': 'A caminho',
              'entregue': 'Entregue',
              'cancelado': 'Cancelado'
            };
            
            const firstItemImage = o.items?.[0]?.product?.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=200&auto=format&fit=crop';
            
            return {
              id: `#ORD-${o.id.substring(0, 4).toUpperCase()}`,
              date: new Date(o.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
              total: `R$ ${Number(o.total_amount).toFixed(2)}`,
              totalNum: Number(o.total_amount),
              status: statusMap[o.status] || o.status,
              items: o.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0,
              image: firstItemImage,
              vendor: o.producer?.stall_name || 'Feirante',
              address: 'Endereço cadastrado',
              trackingSteps: [
                { label: 'Pedido Confirmado', done: true, time: new Date(o.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) },
              ],
              itemsList: o.items?.map((item: any) => ({
                name: item.product?.title || 'Produto Excluído',
                qty: item.quantity,
                price: Number(item.price_at_time),
                unit: item.product?.unit || 'un'
              })) || []
            };
          });
          setOrders(mappedOrders);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => {
    const tabMatch =
      activeTab === 'all' ||
      (activeTab === 'active' && (o.status === 'A caminho' || o.status === 'Aguardando' || o.status === 'Sendo Preparado')) ||
      (activeTab === 'delivered' && o.status === 'Entregue') ||
      (activeTab === 'cancelled' && o.status === 'Cancelado');
    const searchMatch =
      !searchQuery ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    return tabMatch && searchMatch;
  });

  const statusStyle = (s: string) => {
    if (s === 'Entregue') return 'bg-green-50 text-green-700';
    if (s === 'A caminho') return 'bg-blue-50 text-blue-600';
    if (s === 'Cancelado') return 'bg-red-50 text-red-600';
    return 'bg-gray-50 text-gray-500';
  };
  const statusIcon = (s: string) => {
    if (s === 'Entregue') return <CheckCircle2 size={14} />;
    if (s === 'A caminho') return <Package size={14} />;
    if (s === 'Cancelado') return <AlertCircle size={14} />;
    return <Clock size={14} />;
  };

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    const now = new Date();
    const t = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    setChatMsgs(prev => [...prev, { from: 'user', text: chatMsg.trim(), time: t }]);
    setChatMsg('');
    setTimeout(() => {
      setChatMsgs(prev => [...prev, { from: 'support', text: 'Entendido! Estou verificando seu pedido e te respondo em instantes.', time: t }]);
    }, 1200);
  };

  const TABS = [
    { id: 'all', label: 'Todos', count: orders.length },
    { id: 'active', label: 'Em Aberto', count: orders.filter(o => o.status === 'A caminho' || o.status === 'Aguardando' || o.status === 'Sendo Preparado').length },
    { id: 'delivered', label: 'Entregues', count: orders.filter(o => o.status === 'Entregue').length },
    { id: 'cancelled', label: 'Cancelados', count: orders.filter(o => o.status === 'Cancelado').length },
  ];

  return (
    <div className="orders-page">
      <Header />

      <main className="container">
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight size={14} />
          <Link href="/profile">Minha Conta</Link>
          <ChevronRight size={14} />
          <span className="current">Meus Pedidos</span>
        </div>

        <div className="page-header">
          <div>
            <h1 className="title">Meus Pedidos</h1>
            <p className="subtitle">Acompanhe suas compras e histórico de pedidos.</p>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Buscar pedido..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="filter-btn">
              <Filter size={18} />
              <span>Filtros</span>
            </button>
          </div>
        </div>

        <div className="tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
              {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
            </button>
          ))}
        </div>

        <div className="orders-list">
          {loading ? (
            <div className="empty-state">
              <p>Carregando pedidos...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={48} strokeWidth={1} />
              <p>Nenhum pedido encontrado</p>
            </div>
          ) : filtered.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-main">
                <div className="order-img">
                  <img src={order.image} alt={order.vendor} />
                </div>

                <div className="order-info">
                  <div className="order-header-row">
                    <span className="order-id">{order.id}</span>
                    <span className={`status-badge ${statusStyle(order.status)}`}>
                      {statusIcon(order.status)}
                      {order.status}
                    </span>
                  </div>
                  <h3 className="vendor-name">{order.vendor}</h3>
                  <div className="order-meta">
                    <span className="meta-item"><Clock size={14} /> {order.date}</span>
                    <span className="meta-dot">•</span>
                    <span className="meta-item"><ShoppingBag size={14} /> {order.items} itens</span>
                  </div>
                </div>

                <div className="order-price">
                  <p className="price-label">Total do Pedido</p>
                  <h4 className="price-value">{order.total}</h4>
                </div>

                <div className="order-actions">
                  <button className="details-btn" onClick={() => setDetailOrder(order)}>
                    Ver Detalhes <ArrowRight size={16} />
                  </button>
                  <button className="support-btn" title="Suporte" onClick={() => setChatOrder(order)}>
                    <MessageSquare size={18} />
                  </button>
                </div>
              </div>

              {order.status === 'A caminho' && (
                <div className="tracking-bar">
                  <div className="tracking-info">
                    <MapPin size={15} style={{ color: '#0e6b17', flexShrink: 0 }} />
                    <p>Previsão de entrega: <strong>{order.deliveryTime}</strong></p>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${order.trackingProgress}%` }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <Footer />

      {/* ── ORDER DETAIL MODAL ── */}
      {detailOrder && (
        <div className="modal-overlay" onClick={() => setDetailOrder(null)}>
          <div className="modal-card detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2 className="modal-title">{detailOrder.id}</h2>
                <div className="modal-subtitle-row">
                  <span className={`status-badge ${statusStyle(detailOrder.status)}`}>
                    {statusIcon(detailOrder.status)} {detailOrder.status}
                  </span>
                  <span className="modal-date">{detailOrder.date}</span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setDetailOrder(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Vendor row */}
              <div className="detail-vendor">
                <img src={detailOrder.image} alt="" className="detail-img" />
                <div>
                  <p className="detail-label">Feirante</p>
                  <h3 className="detail-vendor-name">{detailOrder.vendor}</h3>
                  <div className="star-row">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={13} fill={i <= 4 ? '#fbbc04' : 'none'} stroke="#fbbc04" />
                    ))}
                    <span className="star-score">4.8</span>
                  </div>
                </div>
              </div>

              {/* Tracking timeline */}
              {detailOrder.trackingSteps && (
                <div className="timeline-section">
                  <h4 className="section-label">Rastreamento</h4>
                  <div className="timeline">
                    {detailOrder.trackingSteps.map((step, i) => (
                      <div key={i} className={`step ${step.done ? 'done' : ''}`}>
                        <div className="step-dot-col">
                          <div className="step-dot" />
                          {i < detailOrder.trackingSteps!.length - 1 && <div className="step-line" />}
                        </div>
                        <div className="step-info">
                          <span className="step-label">{step.label}</span>
                          {step.time && <span className="step-time">{step.time}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Items */}
              <div>
                <h4 className="section-label">Itens do Pedido</h4>
                <div className="items-list">
                  {detailOrder.itemsList.map((item, i) => (
                    <div key={i} className="item-row">
                      <span className="item-qty">{item.qty}×</span>
                      <span className="item-name">{item.name}</span>
                      <span className="item-unit">{item.unit}</span>
                      <span className="item-price">R$ {(item.qty * item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div className="address-row">
                <MapPin size={15} style={{ color: '#0e6b17', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p className="detail-label">Endereço de Entrega</p>
                  <p className="address-text">{detailOrder.address}</p>
                </div>
              </div>
            </div>

            <div className="modal-foot">
              {detailOrder.status !== 'Cancelado' && detailOrder.status !== 'Entregue' && (
                <button
                  className="cancel-order-btn"
                  onClick={() => { setDetailOrder(null); setCancelTarget(detailOrder); }}
                >
                  Cancelar Pedido
                </button>
              )}
              <div style={{ flex: 1 }} />
              <div className="total-display">
                <span className="total-label">Total pago</span>
                <span className="total-value">{detailOrder.total}</span>
              </div>
              <button
                className="chat-btn-inline"
                onClick={() => { setDetailOrder(null); setChatOrder(detailOrder); }}
              >
                <MessageSquare size={16} /> Suporte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CHAT MODAL ── */}
      {chatOrder && (
        <div className="modal-overlay" onClick={() => setChatOrder(null)}>
          <div className="modal-card chat-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2 className="modal-title">Suporte ao Pedido</h2>
                <p className="modal-date">{chatOrder.id} · {chatOrder.vendor}</p>
              </div>
              <button className="modal-close" onClick={() => setChatOrder(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="chat-messages">
              {chatMsgs.map((m, i) => (
                <div key={i} className={`bubble-wrap ${m.from}`}>
                  <div className="bubble">
                    <p>{m.text}</p>
                    <span className="bubble-time">{m.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="chat-input-row">
              <input
                className="chat-input"
                placeholder="Digite sua mensagem..."
                value={chatMsg}
                onChange={e => setChatMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
              />
              <button className="chat-send" onClick={sendChat}>
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CANCEL CONFIRM MODAL ── */}
      {cancelTarget && (
        <div className="modal-overlay" onClick={() => setCancelTarget(null)}>
          <div className="modal-card cancel-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" style={{ marginLeft: 'auto', display: 'flex' }} onClick={() => setCancelTarget(null)}>
              <X size={20} />
            </button>
            <div className="cancel-icon">
              <AlertCircle size={36} style={{ color: '#dc2626' }} />
            </div>
            <h2 className="cancel-title">Cancelar Pedido?</h2>
            <p className="cancel-desc">
              Tem certeza que deseja cancelar o pedido <strong>{cancelTarget.id}</strong>?
              Esta ação não pode ser desfeita.
            </p>
            <div className="cancel-actions">
              <button className="btn-keep" onClick={() => setCancelTarget(null)}>
                Manter Pedido
              </button>
              <button className="btn-cancel-confirm" onClick={() => setCancelTarget(null)}>
                Sim, Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .orders-page { background: #fbfaf5; min-height: 100vh; }
        .container { max-width: 1100px; margin: 0 auto; padding: 40px 20px 100px; }

        /* Breadcrumb */
        .breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #707a6f; margin-bottom: 32px; flex-wrap: wrap; }
        .breadcrumb a:hover { color: #0e6b17; }
        .breadcrumb .current { color: #0e6b17; font-weight: 800; }

        /* Header */
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; gap: 24px; flex-wrap: wrap; }
        .title { font-size: 36px; font-weight: 900; color: #0e6b17; font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.02em; }
        .subtitle { font-size: 16px; color: #707a6f; margin-top: 4px; }
        .header-actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .search-box { background: white; border: 1px solid #eef0ed; border-radius: 16px; padding: 0 20px; display: flex; align-items: center; gap: 12px; transition: all 0.2s; min-width: 240px; }
        .search-box:focus-within { border-color: #0e6b17; box-shadow: 0 4px 12px rgba(14,107,23,0.05); }
        .search-box input { border: none; outline: none; padding: 14px 0; font-weight: 600; font-size: 14px; width: 100%; background: transparent; color: #231a11; }
        .filter-btn { background: white; border: 1px solid #eef0ed; border-radius: 16px; padding: 0 20px; height: 50px; display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 14px; color: #404940; cursor: pointer; transition: all 0.2s; }
        .filter-btn:hover { background: #f6f8f5; }

        /* Tabs */
        .tabs { display: flex; gap: 4px; margin-bottom: 32px; border-bottom: 1px solid #eef0ed; overflow-x: auto; }
        .tab { padding: 12px 20px; border: none; background: none; font-weight: 700; font-size: 14px; color: #707a6f; cursor: pointer; position: relative; transition: all 0.2s; white-space: nowrap; display: flex; align-items: center; gap: 6px; }
        .tab:hover { color: #0e6b17; }
        .tab.active { color: #0e6b17; }
        .tab.active::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 3px; background: #0e6b17; border-radius: 10px 10px 0 0; }
        .tab-count { background: #f0f9f1; color: #0e6b17; font-size: 11px; font-weight: 900; padding: 2px 7px; border-radius: 99px; }
        .tab.active .tab-count { background: #0e6b17; color: white; }

        /* Orders list */
        .orders-list { display: flex; flex-direction: column; gap: 20px; }
        .empty-state { text-align: center; padding: 80px 20px; color: #a0a0a0; display: flex; flex-direction: column; align-items: center; gap: 12px; font-weight: 600; }

        /* Order card */
        .order-card { background: white; border-radius: 28px; border: 1px solid #eef0ed; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
        .order-main { padding: 24px; display: flex; align-items: center; gap: 20px; }
        .order-img { width: 90px; height: 90px; border-radius: 18px; overflow: hidden; flex-shrink: 0; background: #f5f5f5; }
        .order-img img { width: 100%; height: 100%; object-fit: cover; }
        .order-info { flex: 1; min-width: 0; }
        .order-header-row { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap; }
        .order-id { font-size: 13px; font-weight: 800; color: #888; }
        .status-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 100px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em; }
        .vendor-name { font-size: 18px; font-weight: 800; color: #231a11; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .order-meta { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 600; color: #999; flex-wrap: wrap; }
        .meta-item { display: flex; align-items: center; gap: 5px; }
        .meta-dot { color: #ccc; }
        .order-price { padding: 0 28px; border-left: 1px solid #f0f2f0; border-right: 1px solid #f0f2f0; text-align: center; flex-shrink: 0; }
        .price-label { font-size: 10px; font-weight: 800; color: #999; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
        .price-value { font-size: 20px; font-weight: 900; color: #0e6b17; }
        .order-actions { display: flex; align-items: center; gap: 10px; padding-left: 8px; flex-shrink: 0; }
        .details-btn { background: #0e6b17; color: white; border: none; padding: 12px 24px; border-radius: 16px; font-weight: 800; font-size: 14px; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; box-shadow: 0 6px 16px rgba(14,107,23,0.15); white-space: nowrap; }
        .details-btn:hover { background: #0b5512; transform: translateY(-1px); }
        .support-btn { background: #f6f8f5; border: 1px solid #eef0ed; color: #707a6f; width: 46px; height: 46px; border-radius: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
        .support-btn:hover { background: #e8f5e9; color: #0e6b17; }

        /* Tracking bar */
        .tracking-bar { background: #fcfdf8; border-top: 1px solid #f0f2f0; padding: 16px 24px; }
        .tracking-info { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #404940; margin-bottom: 10px; }
        .progress-track { height: 6px; background: #eef0ed; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #0e6b17, #38a169); border-radius: 10px; transition: width 0.4s; }

        /* Modals */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal-card { background: white; border-radius: 32px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 32px 64px rgba(0,0,0,0.2); animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideUp { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .modal-head { display: flex; align-items: flex-start; justify-content: space-between; padding: 28px 32px 20px; border-bottom: 1px solid #f0f2f0; gap: 16px; }
        .modal-title { font-size: 22px; font-weight: 900; color: #231a11; }
        .modal-subtitle-row { display: flex; align-items: center; gap: 10px; margin-top: 6px; flex-wrap: wrap; }
        .modal-date { font-size: 13px; color: #888; font-weight: 600; }
        .modal-close { width: 36px; height: 36px; border-radius: 50%; background: #f5f5f5; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #555; flex-shrink: 0; transition: all 0.2s; }
        .modal-close:hover { background: #fee2e2; color: #dc2626; }
        .modal-body { flex: 1; overflow-y: auto; padding: 28px 32px; display: flex; flex-direction: column; gap: 24px; }
        .modal-foot { padding: 20px 32px; border-top: 1px solid #f0f2f0; display: flex; align-items: center; gap: 12px; background: #fdfdfd; flex-wrap: wrap; }

        /* Detail modal */
        .detail-modal { width: min(760px, 96vw); max-height: 90vh; }
        .detail-vendor { display: flex; align-items: center; gap: 16px; background: #fafafa; border-radius: 20px; padding: 16px; }
        .detail-img { width: 70px; height: 70px; border-radius: 14px; object-fit: cover; flex-shrink: 0; }
        .detail-label { font-size: 11px; font-weight: 800; color: #888; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2px; }
        .detail-vendor-name { font-size: 18px; font-weight: 900; color: #231a11; }
        .star-row { display: flex; align-items: center; gap: 3px; margin-top: 4px; }
        .star-score { font-size: 12px; font-weight: 700; color: #888; margin-left: 4px; }
        .section-label { font-size: 12px; font-weight: 800; color: #707a6f; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; }

        /* Timeline */
        .timeline { display: flex; flex-direction: column; }
        .step { display: flex; gap: 12px; }
        .step-dot-col { display: flex; flex-direction: column; align-items: center; width: 20px; flex-shrink: 0; }
        .step-dot { width: 16px; height: 16px; border-radius: 50%; border: 2px solid #ddd; background: white; flex-shrink: 0; transition: all 0.2s; }
        .step.done .step-dot { background: #0e6b17; border-color: #0e6b17; }
        .step-line { flex: 1; width: 2px; background: #e5e7eb; margin: 4px 0; min-height: 20px; }
        .step.done .step-line { background: #0e6b17; }
        .step-info { display: flex; align-items: baseline; gap: 8px; padding-bottom: 20px; }
        .step-label { font-size: 14px; font-weight: 700; color: #555; }
        .step.done .step-label { color: #231a11; }
        .step-time { font-size: 12px; color: #0e6b17; font-weight: 700; }

        /* Items */
        .items-list { display: flex; flex-direction: column; gap: 0; border: 1px solid #f0f2f0; border-radius: 16px; overflow: hidden; }
        .item-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #f8f8f8; }
        .item-row:last-child { border-bottom: none; }
        .item-qty { font-size: 13px; font-weight: 800; color: #0e6b17; min-width: 28px; }
        .item-name { flex: 1; font-size: 14px; font-weight: 700; color: #231a11; }
        .item-unit { font-size: 12px; color: #888; font-weight: 600; }
        .item-price { font-size: 15px; font-weight: 800; color: #231a11; min-width: 80px; text-align: right; }

        /* Address */
        .address-row { display: flex; gap: 10px; background: #f8fdf8; border-radius: 14px; padding: 14px 16px; }
        .address-text { font-size: 14px; font-weight: 600; color: #231a11; margin-top: 2px; }

        /* Footer */
        .cancel-order-btn { background: #fff1f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 12px; padding: 10px 20px; font-weight: 800; font-size: 13px; cursor: pointer; transition: all 0.2s; }
        .cancel-order-btn:hover { background: #fee2e2; }
        .total-display { display: flex; flex-direction: column; align-items: flex-end; }
        .total-label { font-size: 11px; color: #888; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
        .total-value { font-size: 22px; font-weight: 900; color: #0e6b17; }
        .chat-btn-inline { background: #0e6b17; color: white; border: none; border-radius: 14px; padding: 10px 20px; font-weight: 800; font-size: 14px; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; }
        .chat-btn-inline:hover { background: #0b5512; }

        /* Chat modal */
        .chat-modal { width: min(480px, 96vw); height: min(560px, 90vh); }
        .chat-messages { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 12px; background: #fafafa; }
        .bubble-wrap { display: flex; }
        .bubble-wrap.user { justify-content: flex-end; }
        .bubble-wrap.support { justify-content: flex-start; }
        .bubble { max-width: 78%; padding: 10px 14px; border-radius: 18px; font-size: 14px; font-weight: 600; line-height: 1.5; }
        .bubble-wrap.user .bubble { background: #0e6b17; color: white; border-bottom-right-radius: 4px; }
        .bubble-wrap.support .bubble { background: white; color: #231a11; border: 1px solid #eee; border-bottom-left-radius: 4px; }
        .bubble-time { display: block; font-size: 10px; opacity: 0.65; margin-top: 4px; text-align: right; font-weight: 600; }
        .chat-input-row { display: flex; gap: 10px; padding: 16px 20px; border-top: 1px solid #f0f2f0; background: white; }
        .chat-input { flex: 1; background: #f5f5f5; border: none; border-radius: 14px; padding: 12px 16px; font-size: 14px; font-weight: 600; outline: none; }
        .chat-input:focus { background: white; box-shadow: 0 0 0 2px rgba(14,107,23,0.15); }
        .chat-send { background: #0e6b17; color: white; border: none; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s; }
        .chat-send:hover { background: #0b5512; }

        /* Cancel modal */
        .cancel-modal { width: min(400px, 96vw); padding: 32px; text-align: center; }
        .cancel-icon { width: 72px; height: 72px; background: #fff1f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
        .cancel-title { font-size: 22px; font-weight: 900; color: #231a11; margin-bottom: 10px; }
        .cancel-desc { font-size: 15px; color: #707a6f; line-height: 1.6; margin-bottom: 28px; }
        .cancel-actions { display: flex; gap: 12px; }
        .btn-keep { flex: 1; background: #f5f5f5; color: #404940; border: none; padding: 14px; border-radius: 16px; font-weight: 800; font-size: 15px; cursor: pointer; transition: all 0.2s; }
        .btn-keep:hover { background: #e8e8e8; }
        .btn-cancel-confirm { flex: 1; background: #dc2626; color: white; border: none; padding: 14px; border-radius: 16px; font-weight: 800; font-size: 15px; cursor: pointer; transition: all 0.2s; }
        .btn-cancel-confirm:hover { background: #b91c1c; }

        /* Mobile */
        @media (max-width: 680px) {
          .container { padding: 24px 16px 80px; }
          .title { font-size: 26px; }
          .page-header { margin-bottom: 24px; }
          .header-actions { width: 100%; }
          .search-box { flex: 1; min-width: 0; }
          .order-main { flex-wrap: wrap; gap: 16px; }
          .order-price { border: none; padding: 0; }
          .order-actions { width: 100%; justify-content: space-between; padding: 0; }
          .details-btn { flex: 1; justify-content: center; }
          .modal-head { padding: 20px 20px 16px; }
          .modal-body { padding: 20px; }
          .modal-foot { padding: 16px 20px; }
          .detail-modal { border-radius: 24px 24px 0 0; margin-top: auto; max-height: 94vh; }
          .modal-overlay { align-items: flex-end; padding: 0; }
          .chat-modal { width: 100%; border-radius: 24px 24px 0 0; }
          .cancel-modal { border-radius: 24px; }
          .cancel-actions { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
