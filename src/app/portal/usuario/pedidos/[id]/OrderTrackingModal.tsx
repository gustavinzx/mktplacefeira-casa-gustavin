'use client';

import React from 'react';
import { X, Package, Clock, Truck, CheckCircle2, MapPin, Store } from 'lucide-react';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderStatus: 'preparando' | 'pronto' | 'em_transporte' | 'entregue';
  vendorName: string;
}

export default function OrderTrackingModal({ isOpen, onClose, orderStatus, vendorName }: OrderTrackingModalProps) {
  if (!isOpen) return null;

  // Determine current step index
  const steps = ['preparando', 'pronto', 'em_transporte', 'entregue'];
  const currentIndex = steps.indexOf(orderStatus);

  const renderStatusContent = () => {
    switch (orderStatus) {
      case 'preparando':
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-[#fbfaf5] rounded-[24px] border border-[#bfc9bd]/30 mb-8">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mb-6 animate-pulse">
              <Package size={40} />
            </div>
            <h3 className="text-2xl font-black text-[#1b1c19] mb-2">Preparando Pedido</h3>
            <p className="text-[#707a6f] font-medium max-w-xs">
              A loja <strong>{vendorName}</strong> está separando e embalando seus produtos com muito cuidado.
            </p>
          </div>
        );
      case 'pronto':
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-[#fbfaf5] rounded-[24px] border border-[#bfc9bd]/30 mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6 animate-pulse">
              <Clock size={40} />
            </div>
            <h3 className="text-2xl font-black text-[#1b1c19] mb-2">Aguardando Entregador</h3>
            <p className="text-[#707a6f] font-medium max-w-xs">
              Seu pedido já está pronto! Estamos apenas aguardando o entregador parceiro fazer a coleta.
            </p>
          </div>
        );
      case 'em_transporte':
        return (
          <div className="flex flex-col items-center justify-center p-1 text-center bg-white rounded-[24px] border border-[#bfc9bd]/30 mb-8 overflow-hidden relative">
            <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start pointer-events-none">
              <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-[#bfc9bd]/30 flex items-center gap-2">
                <Truck size={16} className="text-[#0e6b17]" />
                <span className="text-xs font-black text-[#1b1c19] uppercase tracking-wider">A caminho</span>
              </div>
              <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-[#bfc9bd]/30">
                <span className="text-xs font-black text-[#1b1c19] block leading-none">Previsão</span>
                <span className="text-lg font-black text-[#0e6b17] leading-tight">14:50</span>
              </div>
            </div>
            
            {/* Visual Map Mockup */}
            <div className="w-full h-[260px] relative bg-[#e5e3df] rounded-[20px] overflow-hidden">
              {/* Using the standard map image from the app */}
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop" 
                alt="Mapa da rota" 
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent" />
              
              {/* Route line simulation (SVG) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 260" preserveAspectRatio="none">
                <path 
                  d="M 50 200 C 100 200, 150 100, 200 120 S 300 150, 350 80" 
                  fill="none" 
                  stroke="#0e6b17" 
                  strokeWidth="4" 
                  strokeDasharray="8,8"
                />
              </svg>

              {/* Pins */}
              <div className="absolute w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg text-[#ff6b00]" style={{ bottom: '40px', left: '34px' }}>
                <Store size={16} />
              </div>
              <div className="absolute w-10 h-10 bg-[#0e6b17] rounded-full flex items-center justify-center shadow-lg text-white animate-bounce" style={{ top: '60px', right: '30px' }}>
                <MapPin size={20} />
              </div>
              {/* Moving Truck (Mock) */}
              <div className="absolute w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl border-2 border-[#0e6b17] text-[#0e6b17] z-10" style={{ top: '100px', left: '180px' }}>
                <Truck size={22} />
              </div>
            </div>
          </div>
        );
      case 'entregue':
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-green-50 rounded-[24px] border border-green-200 mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-black text-green-800 mb-2">Pedido Entregue!</h3>
            <p className="text-green-700 font-medium max-w-xs">
              Esperamos que os produtos estejam super frescos e deliciosos. Bom apetite!
            </p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-['Plus_Jakarta_Sans']">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#bfc9bd]/20 flex justify-between items-center bg-white">
          <h2 className="text-xl font-black text-[#1b1c19]">Acompanhe seu pedido</h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#f0f0e8] hover:bg-[#e0e0d8] flex items-center justify-center text-[#707a6f] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status Content */}
        <div className="p-8 pb-4 bg-white">
          {renderStatusContent()}

          {/* Progress Bar Steps */}
          <div className="relative flex justify-between items-center max-w-[80%] mx-auto mt-4 mb-4">
            <div className="absolute left-0 right-0 h-1 bg-[#f0f0e8] top-1/2 -translate-y-1/2 -z-10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#0e6b17] transition-all duration-500 ease-in-out" 
                style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
              />
            </div>
            
            {steps.map((step, index) => {
              const isPast = index < currentIndex;
              const isCurrent = index === currentIndex;
              
              return (
                <div key={step} className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border-4 transition-colors duration-300 ${
                    isPast || isCurrent ? 'bg-[#0e6b17] border-[#0e6b17]' : 'bg-white border-[#bfc9bd]'
                  }`} />
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-[#707a6f] px-2">
            <span>Preparo</span>
            <span>Pronto</span>
            <span>Em Rota</span>
            <span>Entregue</span>
          </div>
        </div>

      </div>
    </div>
  );
}
