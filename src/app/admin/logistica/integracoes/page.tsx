'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  ChevronRight,
  Webhook,
  Server,
  RefreshCcw,
  Settings2,
  ShieldCheck,
  AlertCircle,
  Activity,
  ArrowRight,
  Save,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  ExternalLink,
  MapPin,
  Copy,
  Power,
  Link2,
  KeyRound
} from 'lucide-react';
import Link from 'next/link';
import { supabase, getTableName } from '@/lib/supabase';



type ApiRequest = {
  id: string;
  name: string;
  method: string;
  endpoint: string;
  bodyTemplate: string;
};

export default function AdminLogisticaIntegracoesPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState('Carregando...');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [logs, setLogs] = useState<{ type: string, text: string }[]>([
    { type: 'INFO', text: 'Sistema inicializado.' },
    { type: 'WAIT', text: 'Aguardando ação do usuário...' }
  ]);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(true);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean, data: any, message?: string }>>({});
  const [testingRequests, setTestingRequests] = useState<Record<string, boolean>>({});

  const handleTestApi = async (requestId: string) => {
    const platformToTest = editingPlatform || selectedPlatform;
    if (!platformToTest) return;
    setTestingRequests(prev => ({ ...prev, [requestId]: true }));
    setLogs(prev => [...prev, { type: 'INFO', text: `Testando requisição ${requestId} para ${platformToTest}...` }]);
    
    try {
      // Parâmetros de teste baseados na requisição (Exemplos reais enviados pelo usuário)
      let testParams: any = {};
      
      if (requestId === 'list-order') {
        testParams = { pedidoID: 'df47a2bb-5195-ef11-acd3-0e6c0ab65689' };
      } else if (requestId === 'list-orders') {
        testParams = { dataCorte: '23/10/2024', pagina: '1', paginacao: '30' };
      } else if (requestId === 'list-states') {
        testParams = { pagina: 1, paginacao: -1 };
      } else if (requestId === 'list-cities') {
        testParams = { pagina: 1, paginacao: 30, estadoID: 9 };
      } else if (requestId === 'list-payment-methods') {
        testParams = { pagina: 1, paginacao: -1 };
      } else if (requestId === 'get-quote') {
        testParams = { 
          origem: { nome: 'Filial Centro', logradouro: 'SIA TRECHO 2', numero: '5', bairro: 'SIA', CEP: '70380520', cidadeID: 756, latitude: -15.804854, longitude: -47.958237 },
          entrega: { nome: 'Casa', logradouro: 'CRS 513', numero: '5', bairro: 'ASA SUL', CEP: '70380520', cidadeID: 756, latitude: -21.1650675, longitude: -47.8278067 }
        };
      } else if (requestId === 'get-route-quote') {
        testParams = { 
          cobrarKm: false,
          pedidos: [
            { entregaEndereco: { CEP: '70232060', logradouro: 'SQS 202 Bloco F', numero: '505', bairro: 'Asa Sul', cidadeID: 756, latitude: -15.806432, longitude: -47.887403 }, retorno: false },
            { entregaEndereco: { CEP: '70237080', logradouro: 'SQS 403 Bloco R', numero: '150', bairro: 'Asa Sul', cidadeID: 756, latitude: -15.810322, longitude: -47.885366 }, retorno: false }
          ]
        };
      } else if (requestId === 'create-order') {
        testParams = {
          ref: 'ORD-123', detalhes: 'Teste API Feira.Casa', valor: 10.0, nome: 'Cliente Teste', tel: '11999999999', pagId: '6ae83ae2-9b7f-4646-a1a6-755c8c4ab38b',
          entrega: { logradouro: 'Rua Teste', numero: '1', bairro: 'Bairro', CEP: '01001000', cidadeID: 756, latitude: -23.5505, longitude: -46.6333 },
          origem: { nome: 'Origem', logradouro: 'Rua Origem', numero: '1', bairro: 'Bairro', CEP: '01001000', cidadeID: 756, latitude: -23.5505, longitude: -46.6333 }
        };
      } else if (requestId === 'mark-ready' || requestId === 'cancel-order') {
        testParams = { pedidoID: 'df47a2bb-5195-ef11-acd3-0e6c0ab65689' };
      }

      // Casos de teste específicos do iFood
      if (platformToTest === 'ifood') {
        if (requestId === 'get-order') {
          testParams = { orderId: '07110e1b-8191-4670-baed-407219481ffb' };
        } else if (requestId === 'confirm-order' || requestId === 'dispatch-order') {
          testParams = { orderId: '07110e1b-8191-4670-baed-407219481ffb' };
        } else if (requestId === 'request-driver') {
          testParams = { merchantId: 'uuid-da-loja', payload: { displayId: '1234' } };
        } else if (requestId === 'ack-events') {
          testParams = { events: [{ id: 'uuid-do-evento' }] };
        }
      } 
      
      // Casos de teste específicos do Uber Eats
      else if (platformToTest === 'ubereats') {
        if (requestId === 'get-store-status') {
          testParams = { store_id: '1d2b3c4e-5f6a-7890-ab12-c3d4e5f67890' };
        } else if (requestId === 'get-order' || requestId === 'accept-order' || requestId === 'order-ready') {
          testParams = { order_id: 'bd1ed236-ee79-11ed-a05b-0242ac12A003' };
        }
      } 
      
      // Casos de teste específicos da Rappi
      else if (platformToTest === 'rappi') {
        if (requestId === 'take-order') {
          testParams = { order_id: '392625', cookingTime: '20' };
        } else if (requestId === 'ready-order') {
          testParams = { order_id: '392625' };
        } else if (requestId === 'reject-order') {
          testParams = { order_id: '392625', reason: 'Item esgotado' };
        }
      }

      // Proxy server-side para evitar CORS com APIs externas
      const res = await fetch('/api/logistics/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platformId: platformToTest, requestId, params: testParams })
      });
      const result = await res.json();

      setTestResults(prev => ({
        ...prev,
        [requestId]: {
          success: result.success,
          data: result.data,
          message: result.error || result.data?.message
        }
      }));

      if (result.success) {
        setLogs(prev => [...prev, { type: 'SUCCESS', text: `Teste da requisição ${requestId} concluído com sucesso!` }]);
      } else {
        setLogs(prev => [...prev, { type: 'ERROR', text: `Falha no teste: ${result.error || result.data?.message || 'Erro desconhecido'}` }]);
      }
    } catch (err: any) {
      setLogs(prev => [...prev, { type: 'ERROR', text: `Erro ao executar teste: ${err.message}` }]);
      setTestResults(prev => ({ ...prev, [requestId]: { success: false, data: null, message: err.message } }));
    } finally {
      setTestingRequests(prev => ({ ...prev, [requestId]: false }));
    }
  };

  useEffect(() => {
    async function loadCities() {
      try {
        setIsLoadingCities(true);
        // Buscar de ambas as fontes para garantir que cidades configuradas apareçam
        const { data: zonesData } = await supabase.from(getTableName('delivery_zones')).select('cidade, estado');
        const { data: configsData } = await supabase.from(getTableName('logistics_configs')).select('cidade, estado');
        
        const allCities: string[] = [];
        
        if (zonesData) {
          zonesData.forEach((d: any) => allCities.push(`${d.cidade} - ${d.estado}`));
        }
        
        if (configsData) {
          configsData.forEach((d: any) => {
            // Ignorar o registro especial do motor
            if (d.cidade !== '___MOTOR___') {
              allCities.push(`${d.cidade} - ${d.estado}`);
            }
          });
        }

        if (allCities.length > 0) {
          const uniqueCities = Array.from(new Set(allCities)).sort();
          setCities(uniqueCities);
          
          // Se a cidade atual for 'Carregando...' ou não estiver na lista, seleciona a primeira
          if (selectedCity === 'Carregando...' || !uniqueCities.includes(selectedCity)) {
            setSelectedCity(uniqueCities[0]);
          }
        } else {
          setCities(['Nenhuma cidade cadastrada no frete']);
          setSelectedCity('Nenhuma cidade cadastrada no frete');
        }
      } catch (err) {
        console.error('Erro ao carregar cidades:', err);
        setCities(['Erro ao carregar cidades']);
        setSelectedCity('Erro ao carregar cidades');
      } finally {
        setIsLoadingCities(false);
      }
    }
    loadCities();
  }, []);

  const [enabledPlatforms, setEnabledPlatforms] = useState<Record<string, boolean>>({
    ifood: true, pickngo: true, rappi: false, custom: false, '99food': false, ubereats: false
  });

  const togglePlatform = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEnabledPlatforms(prev => ({ ...prev, [id]: !prev[id] }));
    setLogs(prev => [...prev, {
      type: 'INFO',
      text: `Plataforma ${id} ${enabledPlatforms[id] ? 'desativada' : 'ativada'}.`
    }]);
  };

  const [n8nConfig, setN8nConfig] = useState({ webhookUrl: '', authType: 'bearer', authToken: '' });

  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [platformConfig, setPlatformConfig] = useState({
    baseUrl: '',
    keys: [{ name: 'Content-Type', value: 'application/json' }],
    requests: [] as ApiRequest[]
  });

  const handleEditPlatform = async (platformId: string) => {
    setEditingPlatform(platformId);
    try {
      const { data, error } = await supabase
        .from('mktplace_feira_integration_configs')
        .select('*')
        .eq('platform_id', platformId)
        .maybeSingle();
        
      if (data) {
        setPlatformConfig({
          baseUrl: data.base_url || '',
          keys: data.global_headers && data.global_headers.length > 0 ? data.global_headers : [{ name: 'Content-Type', value: 'application/json' }],
          requests: data.requests || []
        });
      } else {
        setPlatformConfig({ baseUrl: '', keys: [{ name: 'Content-Type', value: 'application/json' }], requests: [] });
      }
    } catch (err) {
      console.error('Error fetching integration config', err);
      setPlatformConfig({ baseUrl: '', keys: [{ name: 'Content-Type', value: 'application/json' }], requests: [] });
    }
  };

  const handleAddRequest = () => {
    setPlatformConfig(prev => ({
      ...prev,
      requests: [
        ...prev.requests,
        { id: Math.random().toString(36).substr(2, 9), name: '', method: 'POST', endpoint: '', bodyTemplate: '' }
      ]
    }));
  };

  const handleRemoveRequest = (id: string) => {
    setPlatformConfig(prev => ({
      ...prev,
      requests: prev.requests.filter(r => r.id !== id)
    }));
  };

  const handleRequestChange = (id: string, field: keyof ApiRequest, value: string) => {
    setPlatformConfig(prev => ({
      ...prev,
      requests: prev.requests.map(r => r.id === id ? { ...r, [field]: value } : r)
    }));
  };

  const handleAddKey = () => setPlatformConfig(prev => ({ ...prev, keys: [...prev.keys, { name: '', value: '' }] }));
  const handleRemoveKey = (index: number) => setPlatformConfig(prev => ({ ...prev, keys: prev.keys.filter((_, i) => i !== index) }));
  const handleKeyChange = (index: number, field: 'name' | 'value', val: string) => {
    setPlatformConfig(prev => {
      const newKeys = [...prev.keys];
      newKeys[index][field] = val;
      return { ...prev, keys: newKeys };
    });
  };

  const [regionalMapping, setRegionalMapping] = useState<{ city: string; platform: string; status: string }[]>([]);



  const activeRegionsCount = regionalMapping.filter(m => m.status === 'Operacional').length;

  const platforms = [
    { id: 'ifood', name: 'iFood Delivery', logo: 'https://parceiros.ifood.com.br/images/ifood-logo.svg', status: 'Ativo', health: '99.8%', lastSync: 'Há 2 min' },
    { id: 'pickngo', name: 'PicknGo', logo: 'https://daouupqyghflu.cloudfront.net/Pick/Favicon/28fa0cb0-7fe6-11ed-ab9d-12d2147dce0f/icon-app.png', status: 'Ativo', health: '97.5%', lastSync: 'Há 15 min' },
    { id: 'rappi', name: 'Rappi Turbo', logo: 'https://th.bing.com/th/id/OIP.PNzO3bo0FxzGimdmWAAgDwHaHa?w=175&h=180&c=7&r=0&o=7&pid=1.7&rm=3', status: 'Inativo', health: '--', lastSync: '--' },
    { id: 'custom', name: 'API Autônoma', logo: '', status: 'Desenvolvimento', health: '--', lastSync: '--' },
    { id: '99food', name: '99 Food', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/99_logo.png', status: 'Configuração', health: '--', lastSync: '--' },
    { id: 'ubereats', name: 'Uber Eats', logo: 'https://www.ubereats.com/_static/97c43f8974e6c876.svg', status: 'Desconectado', health: '--', lastSync: 'Ontem' },
  ];

  const handleSave = () => {
    if (!selectedPlatform) return;
    
    setIsSaving(true);
    setLogs(prev => [...prev, { type: 'INFO', text: `Iniciando conexão para ${selectedCity}...` }]);
    
    setTimeout(() => {
      const platformName = platforms.find(p => p.id === selectedPlatform)?.name || 'Desconhecido';
      
      setRegionalMapping(prev => {
        const existingIndex = prev.findIndex(m => m.city === selectedCity);
        const newMapping = [...prev];
        if (existingIndex >= 0) {
          newMapping[existingIndex] = { ...newMapping[existingIndex], platform: platformName, status: 'Operacional' };
        } else {
          newMapping.push({ city: selectedCity, platform: platformName, status: 'Operacional' });
        }
        return newMapping;
      });

      setLogs(prev => [...prev, { type: 'SUCCESS', text: `Integração com ${platformName} em ${selectedCity} ativa com sucesso!` }]);
      setIsSaving(false);
      setWebhookUrl('');
      setApiUrl('');
    }, 1500);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText('sk_test_51Nx1234567890abcdefghijklmnopqrstuvwxyz');
    setLogs(prev => [...prev, { type: 'INFO', text: 'Token copiado para a área de transferência.' }]);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] font-medium text-gray-400">
        <Link href="/admin/logistica" className="hover:text-green-700 transition-colors">Logística</Link>
        <ChevronRight size={14} />
        <span className="text-green-700 font-bold">Hub de Integrações Regionais</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="max-w-3xl">
          <h1 className="text-[48px] font-black text-gray-900 leading-tight tracking-tight mb-2">Hub Regional</h1>
          <p className="text-[16px] text-gray-500 font-medium leading-relaxed">
            Mapeie múltiplos parceiros logísticos por cidade. Configure Webhooks específicos para iFood, PicknGo ou sistemas autônomos por região.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              const unmapped = cities.find(c => !regionalMapping.some(m => m.city === c));
              if (unmapped) setSelectedCity(unmapped);
              setSelectedPlatform(null);
            }}
            className="px-8 py-4 bg-[#125d30] text-white rounded-[24px] font-bold shadow-lg shadow-green-900/10 hover:bg-green-800 transition-all active:scale-95 flex items-center gap-2"
          >
            <Zap size={20} />
            Nova Integração por Cidade
          </button>
        </div>
      </div>

      {/* Regional Mapping Dashboard */}
      <div className="bg-[#1b1c19] p-10 rounded-[40px] text-white shadow-xl shadow-gray-900/20 space-y-8 relative overflow-hidden">
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <MapPin size={24} className="text-green-400" />
            </div>
            <h3 className="text-2xl font-black leading-tight">Mapeamento Regional Ativo</h3>
          </div>
          <div className="flex gap-2">
            <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-500/30">
              {activeRegionsCount} Regiões Ativas
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
           {regionalMapping.map((map, i) => (
             <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{map.city}</p>
                <div className="flex justify-between items-end">
                   <div>
                      <h4 className="text-lg font-black text-white">{map.platform}</h4>
                      <p className={`text-[10px] font-bold mt-1 ${map.status === 'Operacional' ? 'text-green-400' : 'text-orange-400'}`}>● {map.status}</p>
                   </div>
                   <button 
                    onClick={() => {
                      setSelectedCity(map.city);
                      const platform = platforms.find(p => p.name === map.platform);
                      if (platform) setSelectedPlatform(platform.id);
                    }}
                    className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                   >
                      <Settings2 size={14} />
                   </button>
                </div>
             </div>
           ))}
        </div>

        {/* Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 blur-[100px] rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Platform Selection & City Binding */}
        <div className="lg:col-span-7 space-y-8">
          
          <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
             <h3 className="text-[13px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-3">
               <MapPin size={20} className="text-green-700" />
               Vincular à Cidade
             </h3>
             <div className="space-y-4">
                <p className="text-sm text-gray-500 font-medium">Selecione a cidade para configurar a integração específica:</p>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                    className={`w-full pl-6 pr-12 py-4 flex items-center justify-between border transition-all shadow-sm rounded-[20px] font-bold text-sm ${
                      isCityDropdownOpen ? 'bg-white border-green-600/30 ring-4 ring-green-600/10' : 'bg-gray-50 border-transparent hover:border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-gray-900">{selectedCity}</span>
                    <ChevronRight 
                      size={18} 
                      className={`text-gray-400 transition-transform duration-300 ${isCityDropdownOpen ? '-rotate-90 text-green-600' : 'rotate-90'}`} 
                    />
                  </button>

                  {isCityDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsCityDropdownOpen(false)} 
                      />
                      <div className="absolute z-50 w-full mt-2 py-2 bg-white border border-gray-100 rounded-[20px] shadow-2xl shadow-gray-900/10 animate-in fade-in slide-in-from-top-2 duration-200 max-h-64 overflow-y-auto">
                        {cities.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              setSelectedCity(c);
                              setIsCityDropdownOpen(false);
                              const existingMapping = regionalMapping.find(m => m.city === c);
                              if (existingMapping) {
                                const plat = platforms.find(p => p.name === existingMapping.platform);
                                setSelectedPlatform(plat ? plat.id : null);
                              } else {
                                setSelectedPlatform(null);
                              }
                            }}
                            className={`w-full text-left px-6 py-4 text-sm font-bold transition-colors border-b border-gray-50 last:border-0 ${
                              selectedCity === c 
                                ? 'bg-green-50 text-green-700' 
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
             </div>
          </div>

          <div className="space-y-6">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-4">ESCOLHA O PARCEIRO PARA {selectedCity.toUpperCase()}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {platforms.map((p) => {
                const isEnabled = enabledPlatforms[p.id] ?? false;
                return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`p-8 rounded-[40px] border transition-all text-left relative group overflow-hidden cursor-pointer ${
                    selectedPlatform === p.id
                      ? 'bg-white border-green-700 shadow-2xl shadow-green-900/10'
                      : 'bg-white border-gray-100 hover:border-gray-300 shadow-sm'
                  } ${!isEnabled ? 'opacity-50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="h-12 w-auto max-w-[120px] flex items-center">
                      {p.logo ? (
                        <img src={p.logo} alt={p.name} className={`h-full object-contain grayscale group-hover:grayscale-0 transition-all ${selectedPlatform === p.id ? 'grayscale-0' : 'opacity-40 group-hover:opacity-100'}`} />
                      ) : (
                        <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-green-700 transition-all">
                          <Terminal size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => togglePlatform(p.id, e)}
                          className={`p-2 rounded-lg transition-colors border ${
                            isEnabled
                              ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                              : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                          title={isEnabled ? 'Desativar' : 'Ativar'}
                        >
                          <Power size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditPlatform(p.id); }}
                          className={`p-2 rounded-lg transition-colors border ${
                            selectedPlatform === p.id
                              ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                              : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                          title="Configurar Credenciais"
                        >
                          <Settings2 size={14} />
                        </button>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        isEnabled ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isEnabled ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>

                  <h3 className={`text-lg font-black mb-1 ${selectedPlatform === p.id ? 'text-gray-900' : 'text-gray-500'}`}>{p.name}</h3>
                  <div className="flex items-center gap-4 text-[11px] font-bold text-gray-400">
                    <span className="flex items-center gap-1"><Activity size={12} /> {p.health}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {p.lastSync}</span>
                  </div>

                  {selectedPlatform === p.id && (
                    <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-green-700 rounded-full flex items-center justify-center text-white">
                      <Zap size={20} fill="white" />
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Integration Settings */}
        <div className="lg:col-span-5">
          {selectedPlatform ? (
            <div className="bg-white dark:bg-gray-900 p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-2xl space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 sticky top-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl">
                  {selectedPlatform === 'custom' ? <Terminal size={24} /> : <Webhook size={24} />}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">Configuração Regional</h3>
                  <p className="text-xs text-gray-400 font-medium italic">Cidade: {selectedCity}</p>
                </div>
              </div>

              <div className="space-y-8">
                {selectedPlatform === 'custom' ? (
                  <>
                    {/* N8N Integration Block */}
                    <div className="p-5 bg-orange-50 border border-orange-200 rounded-3xl space-y-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Link2 size={16} className="text-orange-600" />
                        <span className="text-[11px] font-black text-orange-700 uppercase tracking-widest">Integração N8N / Webhook POST</span>
                      </div>
                      <p className="text-[11px] text-orange-600 font-medium leading-relaxed">
                        Configure o endpoint do seu workflow N8N. A plataforma enviará um POST com o payload do pedido para esta URL.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">URL DO WEBHOOK (POST)</label>
                      <div className="relative group">
                        <Server size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-orange-500 transition-colors" />
                        <input
                          type="text"
                          value={n8nConfig.webhookUrl}
                          onChange={(e) => setN8nConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                          placeholder="https://n8n.seudominio.com/webhook/abc123"
                          className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent focus:border-orange-400/40 rounded-2xl outline-none font-bold text-sm transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">TIPO DE AUTENTICAÇÃO</label>
                      <select
                        value={n8nConfig.authType}
                        onChange={(e) => setN8nConfig(prev => ({ ...prev, authType: e.target.value }))}
                        className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:border-orange-400/40 rounded-2xl outline-none font-bold text-sm transition-all appearance-none cursor-pointer"
                      >
                        <option value="bearer">Bearer Token</option>
                        <option value="apikey">API Key (Header)</option>
                        <option value="none">Sem Autenticação</option>
                      </select>
                    </div>

                    {n8nConfig.authType !== 'none' && (
                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                          {n8nConfig.authType === 'bearer' ? 'BEARER TOKEN' : 'API KEY'}
                        </label>
                        <div className="relative group">
                          <KeyRound size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-orange-500 transition-colors" />
                          <input
                            type="password"
                            value={n8nConfig.authToken}
                            onChange={(e) => setN8nConfig(prev => ({ ...prev, authToken: e.target.value }))}
                            placeholder={n8nConfig.authType === 'bearer' ? 'eyJhbGciOi...' : 'sua-api-key-aqui'}
                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent focus:border-orange-400/40 rounded-2xl outline-none font-mono text-xs transition-all"
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Input Webhook Send */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">URL DE WEBHOOK (ENVIO)</label>
                        <Link href="/" className="text-[10px] font-black text-blue-600 hover:underline flex items-center gap-1">DOCS <ExternalLink size={10} /></Link>
                      </div>
                      <div className="relative group">
                        <Server size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                        <input
                          type="text"
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                          placeholder="https://api.plataforma.com.br/v1/webhook"
                          className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent focus:border-blue-600/30 rounded-2xl outline-none font-bold text-sm transition-all"
                        />
                      </div>
                    </div>

                    {/* Input API Receive */}
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">ENDEREÇO DE API (RECEBIMENTO)</label>
                      <div className="relative group">
                        <Zap size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-700 transition-colors" />
                        <input
                          type="text"
                          value={apiUrl}
                          onChange={(e) => setApiUrl(e.target.value)}
                          placeholder={`https://hub.feira.casa/api/v1/callback/${selectedPlatform}`}
                          className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent focus:border-green-600/30 rounded-2xl outline-none font-bold text-sm transition-all"
                        />
                      </div>
                    </div>

                    {/* Secret Key / Auth */}
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">TOKEN DE AUTENTICAÇÃO LOCAL</label>
                      <div className="relative">
                        <input
                          type="password"
                          value="sk_test_51Nx1234567890abcdefghijklmnopqrstuvwxyz"
                          readOnly
                          className="w-full pl-6 pr-14 py-4 bg-gray-100 border border-transparent rounded-2xl outline-none font-mono text-xs text-gray-500"
                        />
                        <button
                          onClick={handleCopyToken}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors p-1"
                          title="Copiar Token"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex-1 py-4 text-white rounded-[24px] font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                    isSaving 
                      ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                      : 'bg-[#125d30] hover:bg-green-800 shadow-green-900/10 active:scale-95'
                  }`}
                >
                  {isSaving ? <RefreshCcw size={18} className="animate-spin" /> : <Save size={18} />}
                  {isSaving ? 'Salvando...' : `Salvar para ${selectedCity.split(' - ')[0]}`}
                </button>
              </div>

              <div className="p-6 bg-gray-50 rounded-3xl space-y-3">
                <div className="flex items-center justify-between text-gray-900 font-black text-xs">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} />
                    <span>Log Regional (Live)</span>
                  </div>
                  <button onClick={() => setLogs([])} className="text-[10px] text-gray-400 hover:text-gray-600">Limpar</button>
                </div>
                <div className="font-mono text-[10px] space-y-2 h-32 overflow-y-auto">
                  {logs.map((log, index) => (
                    <p key={index} className={
                      log.type === 'INFO' ? 'text-blue-600' :
                      log.type === 'WAIT' ? 'text-gray-400' :
                      log.type === 'SUCCESS' ? 'text-green-600' : 'text-gray-600'
                    }>[{log.type}] {log.text}</p>
                  ))}
                  {logs.length === 0 && <p className="text-gray-400 italic">Nenhum log disponível.</p>}
                </div>
              </div>

              </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-12 rounded-[40px] flex flex-col items-center justify-center text-center space-y-6 h-full min-h-[500px]">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-gray-300 shadow-sm">
                <MapPin size={32} />
              </div>
              <div>
                <h4 className="text-xl font-black text-gray-900">Mapear Regional</h4>
                <p className="text-sm text-gray-400 font-medium max-w-[240px] mx-auto mt-2">Selecione uma plataforma à esquerda para vincular à cidade de <b>{selectedCity}</b>.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="p-8 bg-blue-50 border border-blue-100 rounded-[40px] flex items-center gap-6">
         <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
            <ShieldCheck size={24} />
         </div>
         <div>
            <p className="text-sm font-black text-blue-800">Criptografia de Ponta-a-Ponta</p>
            <p className="text-xs font-medium text-blue-600/80 leading-relaxed">
              Todas as chaves de API e payloads de Webhook são criptografados em repouso. O ecossistema valida a assinatura de cada requisição recebida para garantir a autenticidade da plataforma.
            </p>
         </div>
      </div>

      {/* Edit Platform Modal */}
      {editingPlatform && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingPlatform(null)}></div>
          <div className="relative bg-white rounded-[32px] w-[80vw] max-w-[1200px] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-black text-gray-900">Configuração Base: {platforms.find(p => p.id === editingPlatform)?.name}</h3>
                <p className="text-sm text-gray-500 font-medium mt-1">Defina as credenciais mestre e URL Base da integração.</p>
              </div>
              <button onClick={() => setEditingPlatform(null)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                <XCircle size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Base URL */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">URL BASE DA API</label>
                <input 
                  type="text" 
                  value={platformConfig.baseUrl}
                  onChange={e => setPlatformConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                  placeholder="https://api.parceiro.com.br/v2" 
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:border-green-600/30 rounded-2xl outline-none font-bold text-sm transition-all"
                />
              </div>

              {/* Requisições (Endpoints) */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-[13px] font-black text-gray-900 uppercase tracking-widest">Requisições da Plataforma</h4>
                    <p className="text-[11px] text-gray-400 font-medium mt-1">Configure os endpoints específicos (ex: Listar Cidades, Gerar Pedido).</p>
                  </div>
                  <button onClick={handleAddRequest} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-100 transition-colors">
                    + ADICIONAR REQUISIÇÃO
                  </button>
                </div>
                
                <div className="space-y-6">
                  {platformConfig.requests.map((req, index) => (
                    <div key={req.id} className="p-5 bg-white border border-gray-200 rounded-[24px] shadow-sm space-y-4 relative group">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase">Requisição #{index + 1}</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleTestApi(req.id)}
                            disabled={testingRequests[req.id]}
                            className="px-3 py-1 bg-green-50 text-green-700 rounded-lg font-bold text-[10px] hover:bg-green-100 transition-colors flex items-center gap-1"
                          >
                            {testingRequests[req.id] ? <RefreshCcw size={10} className="animate-spin" /> : <Activity size={10} />}
                            TESTAR AGORA
                          </button>
                          <button 
                            onClick={() => handleRemoveRequest(req.id)}
                            className="p-1 text-red-400 hover:text-red-600 transition-colors"
                            title="Remover"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-12 md:col-span-4">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Nome da Ação</label>
                          <input 
                            type="text" 
                            value={req.name}
                            onChange={e => handleRequestChange(req.id, 'name', e.target.value)}
                            placeholder="Ex: Listar Estados" 
                            className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-blue-600/30 rounded-xl outline-none font-bold text-xs transition-all"
                          />
                        </div>
                        <div className="col-span-4 md:col-span-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Método</label>
                          <select 
                            value={req.method}
                            onChange={e => handleRequestChange(req.id, 'method', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-blue-600/30 rounded-xl outline-none font-bold text-xs transition-all appearance-none cursor-pointer text-blue-700"
                          >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="PATCH">PATCH</option>
                            <option value="DELETE">DELETE</option>
                          </select>
                        </div>
                        <div className="col-span-8 md:col-span-6">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Endpoint Relativo</label>
                          <input 
                            type="text" 
                            value={req.endpoint}
                            onChange={e => handleRequestChange(req.id, 'endpoint', e.target.value)}
                            placeholder="Ex: /api/listarcidades" 
                            className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-blue-600/30 rounded-xl outline-none font-bold text-xs transition-all font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex justify-between">
                          <span>Body Payload (JSON)</span>
                          <span className="text-gray-300 font-normal">Opcional</span>
                        </label>
                        <textarea 
                          value={req.bodyTemplate}
                          onChange={e => handleRequestChange(req.id, 'bodyTemplate', e.target.value)}
                          placeholder="{\n  &quot;exemplo&quot;: &quot;valor&quot;\n}" 
                          className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-blue-600/30 rounded-xl outline-none font-mono text-xs transition-all h-24 resize-none"
                        />
                      </div>

                      {testResults[req.id] && (
                        <div className={`mt-4 p-4 rounded-xl border ${testResults[req.id].success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                           <div className="flex items-center justify-between mb-2">
                             <div className={`flex items-center gap-2 font-black text-xs uppercase tracking-tight ${testResults[req.id].success ? 'text-green-700' : 'text-red-700'}`}>
                                <Activity size={14} />
                                <span>{testResults[req.id].success ? 'SUCESSO NA REQUISIÇÃO' : 'FALHA NA CONEXÃO'}</span>
                             </div>
                             <button onClick={() => setTestResults(prev => { const n = {...prev}; delete n[req.id]; return n; })} className={`text-[10px] font-bold uppercase ${testResults[req.id].success ? 'text-green-600' : 'text-red-600'}`}>FECHAR</button>
                           </div>
                           <div className="bg-white/60 p-3 rounded-lg border border-white max-h-40 overflow-y-auto shadow-inner">
                              <pre className={`text-[10px] font-mono leading-tight whitespace-pre-wrap ${testResults[req.id].success ? 'text-green-900' : 'text-red-900'}`}>
                                {JSON.stringify(testResults[req.id].data || testResults[req.id].message, null, 2)}
                              </pre>
                           </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {platformConfig.requests.length === 0 && (
                    <div className="p-8 border-2 border-dashed border-gray-200 rounded-[32px] text-center">
                      <p className="text-sm font-bold text-gray-400">Nenhuma requisição configurada.</p>
                      <p className="text-xs text-gray-400 mt-1">Adicione os endpoints para mapear as ações da API.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Chaves Dinâmicas */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Chaves e Parâmetros Customizados</label>
                  <button onClick={handleAddKey} className="text-[11px] font-black text-green-700 hover:underline">
                    + ADICIONAR CHAVE
                  </button>
                </div>
                
                <div className="space-y-3">
                  {platformConfig.keys.map((k, index) => (
                    <div key={index} className="flex gap-3">
                      <input 
                        type="text" 
                        value={k.name}
                        onChange={e => handleKeyChange(index, 'name', e.target.value)}
                        placeholder="Nome (Ex: X-API-Key)" 
                        className="flex-1 px-4 py-3 bg-gray-50 border border-transparent focus:border-green-600/30 rounded-xl outline-none font-bold text-xs transition-all"
                      />
                      <input 
                        type="text" 
                        value={k.value}
                        onChange={e => handleKeyChange(index, 'value', e.target.value)}
                        placeholder="Valor" 
                        className="flex-1 px-4 py-3 bg-gray-50 border border-transparent focus:border-green-600/30 rounded-xl outline-none font-bold text-xs transition-all"
                      />
                      <button 
                        onClick={() => handleRemoveKey(index)}
                        className="p-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors"
                        title="Remover Chave"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  ))}
                  {platformConfig.keys.length === 0 && (
                    <p className="text-xs text-gray-400 italic">Nenhuma chave adicional configurada.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button 
                onClick={async () => {
                  try {
                    await supabase.from('mktplace_feira_integration_configs').upsert({
                      platform_id: editingPlatform,
                      base_url: platformConfig.baseUrl,
                      global_headers: platformConfig.keys,
                      requests: platformConfig.requests,
                      updated_at: new Date().toISOString()
                    }, { onConflict: 'platform_id' });
                    setEditingPlatform(null);
                    setLogs(prev => [...prev, { type: 'SUCCESS', text: 'Credenciais da plataforma salvas com sucesso no banco de dados.' }]);
                  } catch (err) {
                    console.error(err);
                    setLogs(prev => [...prev, { type: 'ERROR', text: 'Erro ao salvar credenciais.' }]);
                  }
                }}
                className="w-full py-4 bg-[#125d30] text-white rounded-[24px] font-black text-sm hover:bg-green-800 transition-all shadow-lg shadow-green-900/10 active:scale-95 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Salvar Credenciais da Integração
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
