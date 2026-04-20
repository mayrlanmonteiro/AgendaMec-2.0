import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Plus, Settings, Share2, Edit2, Trash2, 
  LogOut, X, Upload, Copy, Check, MoreVertical, 
  LayoutDashboard, User as UserIcon, ExternalLink, Package,
  TrendingUp, BarChart3, Box, AlertCircle, Search, Filter, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { 
  collection, query, where, getDocs, doc, deleteDoc, 
  addDoc, serverTimestamp, updateDoc 
} from 'firebase/firestore';
import { supabase } from '../lib/supabase';
import { categorias as objCategorias, marcas as objMarcas } from '../data/mockData';

// --- Sub-components para Dashboard ---

const StatCard = ({ icon: Icon, title, value, detail, colorClass }) => (
  <div className="card p-6 flex items-start justify-between group cursor-default shadow-sm hover:shadow-xl transition-all duration-300 border-gray-100 bg-white">
    <div className="space-y-3">
      <div className={`p-4 rounded-3xl inline-flex ${colorClass} bg-opacity-10 transition-all duration-500 group-hover:rotate-12`}>
        <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</p>
        <h3 className="text-3xl font-black text-gray-900 mt-1 tracking-tighter">{value}</h3>
      </div>
      {detail && <p className="text-xs font-bold text-gray-400">{detail}</p>}
    </div>
    <div className="h-full flex items-center">
       <button className="p-2 text-gray-200 hover:text-gray-500 transition-colors">
         <MoreVertical size={18} />
       </button>
    </div>
  </div>
);

const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-50">
    <td className="p-6 flex items-center gap-4">
      <div className="w-12 h-12 bg-gray-100 rounded-2xl" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-100 rounded w-40" />
        <div className="h-3 bg-gray-100 rounded w-20" />
      </div>
    </td>
    <td className="p-6"><div className="h-4 bg-gray-100 rounded w-24" /></td>
    <td className="p-6"><div className="h-7 bg-gray-100 rounded-full w-28" /></td>
    <td className="p-6 text-right"><div className="h-4 bg-gray-100 rounded w-20 ml-auto" /></td>
    <td className="p-6 text-center"><div className="h-4 bg-gray-100 rounded w-12 mx-auto" /></td>
    <td className="p-6 text-right space-x-2">
      <div className="h-10 bg-gray-100 rounded-xl w-10 inline-block" />
      <div className="h-10 bg-gray-100 rounded-xl w-10 inline-block" />
    </td>
  </tr>
);

const SkeletonCard = () => (
  <div className="card p-5 animate-pulse space-y-5">
    <div className="flex gap-4">
      <div className="w-20 h-20 bg-gray-100 rounded-3xl" />
      <div className="flex-1 space-y-3 py-2">
        <div className="h-5 bg-gray-100 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
    <div className="h-px bg-gray-50 w-full" />
    <div className="grid grid-cols-2 gap-3">
      <div className="h-12 bg-gray-50 rounded-2xl" />
      <div className="h-12 bg-gray-50 rounded-2xl" />
    </div>
  </div>
);

// --- Componente Dashboard Principal ---

export default function Dashboard() {
  const { currentUser, profileData, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const revendedor = profileData || { nome: 'Carregando...', slug_url: 'carregando...', biografia: '', whatsapp: '' };
  const [lojaProdutos, setLojaProdutos] = useState([]);
  const [loadingProdutos, setLoadingProdutos] = useState(true);
  const [activeTab, setActiveTab] = useState('produtos');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Link Copy State
  const [copied, setCopied] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [newProduto, setNewProduto] = useState({
    nome_produto: '', preco: '', categoria: '', marca: '', estoque: '', descricao: '', destaque: false, pronta_entrega: false
  });
  const [fotosUpload, setFotosUpload] = useState([]);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    nome: '', biografia: '', whatsapp: ''
  });

  useEffect(() => {
    if (profileData) {
      setProfileForm({
        nome: profileData.nome || '',
        biografia: profileData.biografia || '',
        whatsapp: profileData.whatsapp || ''
      });
    }
  }, [profileData]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(lojaUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchProducts = async () => {
    if (!currentUser) return;
    setLoadingProdutos(true);
    try {
      const q = query(collection(db, 'produtos'), where("revendedor_id", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setLojaProdutos(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProdutos(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchProducts();
    }
  }, [currentUser]);

  const lojaUrl = `https://belezaconecta.app/${revendedor.slug_url}`;

  const handleDelete = async (id, name) => {
    if (window.confirm(`Tem certeza que deseja excluir "${name}"? Esta ação não pode ser desfeita.`)) {
      try {
        await deleteDoc(doc(db, 'produtos', id));
        setLojaProdutos(lojaProdutos.filter(p => p.id !== id));
      } catch (err) {
        alert("Erro ao excluir!");
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setFotosUpload(prev => [...prev, ...files]);
  };

  const removeFoto = (indexToRemove) => {
    setFotosUpload(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (fotosUpload.length === 0) {
      alert("Por favor adicione pelo menos uma foto.");
      return;
    }
    setFormLoading(true);

    try {
      const uploadPromises = fotosUpload.map(async (file, index) => {
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
        const filePath = `${currentUser.uid}/${Date.now()}_${index}_${safeName}`;
        
        const uploadResult = await Promise.race([
          supabase.storage.from('produtos').upload(filePath, file, { upsert: false }),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Falha no upload! (Timeout)")), 15000))
        ]);

        if (uploadResult.error) throw uploadResult.error;
        const { data } = supabase.storage.from('produtos').getPublicUrl(filePath);
        return data.publicUrl;
      });
      
      const uploadedUrls = await Promise.all(uploadPromises);
      const precoNumerico = typeof newProduto.preco === 'string' ? parseFloat(newProduto.preco.replace(',', '.')) : parseFloat(newProduto.preco);

      await addDoc(collection(db, 'produtos'), {
        revendedor_id: currentUser.uid,
        nome_produto: newProduto.nome_produto,
        preco: isNaN(precoNumerico) ? 0 : precoNumerico,
        categoria: newProduto.categoria,
        marca: newProduto.marca,
        estoque: parseInt(newProduto.estoque) || 0,
        pronta_entrega: Boolean(newProduto.pronta_entrega),
        descricao: newProduto.descricao || '',
        destaque: Boolean(newProduto.destaque),
        array_fotos: uploadedUrls,
        data_cadastro: serverTimestamp()
      });

      setIsModalOpen(false);
      setNewProduto({ nome_produto: '', preco: '', categoria: '', marca: '', estoque: '', descricao: '', destaque: false, pronta_entrega: false });
      setFotosUpload([]);
      fetchProducts();

    } catch (err) {
      console.error(err);
      alert("Erro ao criar produto: " + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const userRef = doc(db, 'revendedores', currentUser.uid);
      await updateDoc(userRef, {
        nome: profileForm.nome,
        biografia: profileForm.biografia,
        whatsapp: profileForm.whatsapp
      });
      setIsEditingProfile(false);
      alert("Perfil atualizado com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar perfil!");
    } finally {
      setFormLoading(false);
    }
  };

  const filteredProdutos = lojaProdutos.filter(p => 
    p.nome_produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    objMarcas.find(m => m.id === p.marca)?.nome_marca.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEstoque = lojaProdutos.reduce((acc, curr) => acc + (parseInt(curr.estoque) || 0), 0);
  const outOfStock = lojaProdutos.filter(p => (parseInt(p.estoque) || 0) <= 0).length;

  if (authLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white">
        <div className="w-16 h-16 border-4 border-pink-50 border-t-pink-500 rounded-full animate-spin mb-6" />
        <h2 className="text-xl font-bold text-gray-900">Beleza Conecta</h2>
        <p className="text-gray-400 font-medium animate-pulse">Sincronizando seus dados...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8F9FB] overflow-hidden font-sans text-gray-900">
      
      {/* 1. SIDEBAR (RESPONSIVE REDESIGN) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 flex flex-col transition-all duration-500 ease-in-out shadow-2xl lg:shadow-none
        lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-10 pb-12 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-pink-200 animate-bounce-subtle">
            <ShoppingBag size={24} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter leading-none">BELEZA</span>
            <span className="text-pink-600 font-black text-sm tracking-widest leading-none mt-1 uppercase">Conecta</span>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-2">
          <div className="pb-4">
            <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Menu Principal</p>
            <button 
              onClick={() => { setActiveTab('produtos'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-bold transition-all duration-300 ${activeTab === 'produtos' ? 'bg-pink-50 text-pink-600 shadow-sm' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-4">
                <LayoutDashboard size={22} className={activeTab === 'produtos' ? 'text-pink-600' : 'text-gray-300'} /> 
                <span className="text-[15px]">Meus Produtos</span>
              </div>
              {activeTab === 'produtos' && <ChevronRight size={16} />}
            </button>
            <button 
              onClick={() => { setActiveTab('perfil'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-bold transition-all duration-300 ${activeTab === 'perfil' ? 'bg-pink-50 text-pink-600 shadow-sm' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-4">
                <UserIcon size={22} className={activeTab === 'perfil' ? 'text-pink-600' : 'text-gray-300'} /> 
                <span className="text-[15px]">Meu Perfil</span>
              </div>
              {activeTab === 'perfil' && <ChevronRight size={16} />}
            </button>
          </div>

          <div className="pt-4 border-t border-gray-50">
             <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Suporte & App</p>
             <button className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all">
                <Settings size={22} className="text-gray-300" />
                <span className="text-[15px]">Configurações</span>
             </button>
          </div>
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-gray-50 rounded-[32px] p-5 mb-4">
            <div className="flex items-center gap-3">
              <img src={currentUser?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mayrlan'} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-black text-gray-900 truncate">{revendedor.nome}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase truncate">Revendedor VIP</p>
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 bg-white border border-gray-100 shadow-sm hover:shadow-md active:scale-95">
            <LogOut size={20} /> Sair do Painel
          </button>
        </div>
      </aside>

      {/* OVERLAY MOBILE */}
      {isSidebarOpen && <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-40 lg:hidden transition-opacity duration-300" onClick={() => setIsSidebarOpen(false)} />}

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP NAVBAR (NEW) */}
        <header className="h-20 lg:h-24 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-6 lg:px-12 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-colors">
              <LayoutDashboard size={24} />
            </button>
            <div className="hidden lg:block relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
               <input 
                 type="text" 
                 placeholder="Pesquisar produtos ou marcas..." 
                 className="bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-6 text-sm w-80 focus:ring-2 focus:ring-pink-500/10 transition-all outline-none"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <div className="hidden md:flex flex-col text-right">
               <span className="text-xs font-black text-pink-600 uppercase tracking-widest">Plano Ativo</span>
               <span className="text-[10px] font-bold text-gray-400">Master Revenda</span>
            </div>
            <div className="h-10 w-px bg-gray-100 hidden md:block" />
            <div className="p-3 bg-pink-50 text-pink-600 rounded-2xl hover:bg-pink-100 transition-colors relative">
               <Package size={22} />
               <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-pink-500 rounded-full ring-2 ring-white animate-pulse"></span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-10 max-w-[1600px] w-full mx-auto pb-20 no-scrollbar">
          
          {/* HEADER SECTION */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                 <span className="w-8 h-1 bg-pink-500 rounded-full"></span>
                 <p className="text-xs font-black text-pink-600 uppercase tracking-[0.3em]">Dashboard</p>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                {activeTab === 'produtos' ? 'Meus Produtos' : 'Meu Perfil'}
              </h1>
              <p className="text-gray-400 text-lg font-medium max-w-xl">
                 {activeTab === 'produtos' 
                   ? 'Gerencie sua vitrine digital, estoque e promoções em tempo real.' 
                   : 'Personalize como seus clientes enxergam sua loja e informações de contato.'}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button 
                className="btn glass border-none text-gray-700 px-8 py-4 hover:bg-white hover:shadow-xl transition-all font-bold"
                onClick={() => window.open(`/${revendedor.slug_url}`, '_blank')}
              >
                <ExternalLink size={20} /> <span className="hidden sm:inline">Ver Loja Pública</span>
              </button>
              <button 
                className="btn btn-primary px-8 py-4 shadow-2xl hover:scale-105 transition-transform font-black"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus size={20} className="stroke-[3px]" /> Novo Produto
              </button>
            </div>
          </section>

          {activeTab === 'produtos' && (
            <>
              {/* STATISTICS GRID */}
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                 <StatCard 
                   icon={Box} 
                   title="Total Produtos" 
                   value={lojaProdutos.length} 
                   detail="Itens cadastrados" 
                   colorClass="bg-pink-500"
                 />
                 <StatCard 
                   icon={TrendingUp} 
                   title="Estoque Total" 
                   value={totalEstoque} 
                   detail="Unidades disponíveis" 
                   colorClass="bg-blue-500"
                 />
                 <StatCard 
                   icon={AlertCircle} 
                   title="Sem Estoque" 
                   value={outOfStock} 
                   detail="Precisa de atenção" 
                   colorClass={outOfStock > 0 ? "bg-orange-500" : "bg-green-500"}
                 />
                 <StatCard 
                   icon={BarChart3} 
                   title="Visualizações" 
                   value="1.2k" 
                   detail="Últimos 30 dias" 
                   colorClass="bg-purple-500"
                 />
              </section>

              {/* SALES LINK BANNER (GLASSMORPHISM REDESIGN) */}
              <section className="relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-pink-900 to-purple-950 opacity-100 rounded-[40px] shadow-2xl transition-all duration-700 group-hover:scale-[1.01]"></div>
                 <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/5 to-transparent skew-x-[-20deg] translate-x-12"></div>
                 
                 <div className="relative z-10 p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-10">
                    <div className="flex flex-col lg:flex-row items-center gap-8 text-center lg:text-left">
                       <div className="w-20 h-20 bg-white/10 backdrop-blur-2xl rounded-[32px] flex items-center justify-center border border-white/20 shadow-2xl animate-float">
                          <Share2 size={36} className="text-pink-400" />
                       </div>
                       <div className="space-y-2">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500 rounded-full mb-2">
                             <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                             <span className="text-[10px] font-black text-white uppercase tracking-widest">Loja Online Ativa</span>
                          </div>
                          <h3 className="text-3xl font-black text-white tracking-tight">Potencialize suas vendas</h3>
                          <p className="text-pink-100/60 font-medium text-lg">Compartilhe seu link exclusivo e receba pedidos no WhatsApp.</p>
                       </div>
                    </div>

                    <div className="w-full lg:w-auto">
                       <div className="bg-white/10 backdrop-blur-md rounded-[28px] p-2 flex flex-col sm:flex-row items-center gap-2 border border-white/10 shadow-inner group/input max-w-md ml-auto">
                          <div className="flex-1 px-6 py-3 font-medium text-pink-100 text-sm truncate">
                             {lojaUrl}
                          </div>
                          <button 
                            onClick={copyToClipboard}
                            className={`w-full sm:w-auto px-8 py-4 rounded-[22px] flex items-center justify-center gap-3 transition-all duration-500 font-black shadow-xl ${copied ? 'bg-green-500 text-white' : 'bg-white text-gray-900 hover:scale-105 active:scale-95'}`}
                          >
                            {copied ? <Check size={20} className="stroke-[3px]" /> : <Copy size={20} />}
                            <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
                          </button>
                       </div>
                    </div>
                 </div>
              </section>

              {/* PRODUCT LISTING (PREMIUM TABLE) */}
              <section className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <Box size={24} className="text-pink-600" />
                      </div>
                      <h4 className="text-xl font-black text-gray-900 tracking-tight">Catálogo de Produtos</h4>
                   </div>
                   <div className="flex items-center gap-2">
                      <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 transition-colors shadow-sm">
                        <Filter size={20} />
                      </button>
                      <div className="h-6 w-px bg-gray-200 mx-2"></div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{filteredProdutos.length} Itens</span>
                   </div>
                </div>

                {/* VIEW DESKTOP: PREMIUM TABLE */}
                <div className="hidden lg:block bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#FBFBFC] border-b border-gray-50">
                      <tr>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Nome do Produto</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Marca / Origem</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Categoria</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Valor Unitário</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Disponível</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Gestão</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50/80">
                      {loadingProdutos ? (
                        [1,2,3,4].map(i => <SkeletonRow key={i} />)
                      ) : filteredProdutos.length > 0 ? (
                        filteredProdutos.map(produto => (
                          <tr key={produto.id} className="hover:bg-[#FBFBFC]/80 transition-all duration-300 group">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="relative shrink-0">
                                   <img src={produto.array_fotos?.[0] || 'https://via.placeholder.com/64'} className="w-16 h-16 rounded-[24px] object-cover border border-gray-100 shadow-sm group-hover:scale-110 transition-transform duration-500" />
                                   {produto.destaque && (
                                     <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full border-2 border-white"></div>
                                   )}
                                </div>
                                <div>
                                  <h5 className="text-[15px] font-black text-gray-900 line-clamp-1">{produto.nome_produto}</h5>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Ref: {produto.id.slice(0, 8)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="py-1 px-3 bg-gray-50 rounded-xl inline-block border border-gray-100">
                                <span className="text-xs font-bold text-gray-600">{objMarcas.find(m => m.id === produto.marca)?.nome_marca || 'Própria'}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="bg-pink-50 text-pink-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                                 {objCategorias.find(c => c.id === produto.categoria)?.nome_categoria || 'Geral'}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <div className="flex flex-col items-end">
                                  <span className="text-lg font-black text-gray-900 tracking-tight">R$ {parseFloat(produto.preco).toFixed(2)}</span>
                                  <span className="text-[10px] font-bold text-green-500 uppercase">À vista</span>
                               </div>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <div className={`text-sm font-black inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl ${produto.estoque > 5 ? 'bg-green-50 text-green-600' : produto.estoque > 0 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-500'}`}>
                                 {produto.estoque} <span className="text-[10px] opacity-70 uppercase">un</span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                 <button className="p-3 bg-white text-gray-400 hover:text-pink-600 hover:shadow-lg hover:border-pink-100 border border-gray-100 rounded-2xl transition-all" title="Editar">
                                    <Edit2 size={20} />
                                 </button>
                                 <button 
                                   className="p-3 bg-white text-gray-400 hover:text-red-500 hover:shadow-lg hover:border-red-100 border border-gray-100 rounded-2xl transition-all" 
                                   title="Excluir"
                                   onClick={() => handleDelete(produto.id, produto.nome_produto)}
                                 >
                                    <Trash2 size={20} />
                                 </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="py-24 text-center">
                            <div className="flex flex-col items-center max-w-xs mx-auto">
                              <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center mb-6">
                                <Package size={48} className="text-gray-200 stroke-[1px]" />
                              </div>
                              <h5 className="text-xl font-black text-gray-900 mb-2">A vitrine está limpa!</h5>
                              <p className="text-gray-400 font-medium mb-8">Nenhum produto encontrado para sua busca atual.</p>
                              <button onClick={() => setIsModalOpen(true)} className="btn btn-primary w-full">Começar Agora</button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* VIEW MOBILE: CARDS REDESIGN */}
                <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {loadingProdutos ? (
                    [1,2,3,4].map(i => <SkeletonCard key={i} />)
                  ) : filteredProdutos.length > 0 ? (
                    filteredProdutos.map(produto => (
                      <div key={produto.id} className="card p-5 space-y-5 hover:border-pink-200 transition-colors bg-white">
                         <div className="flex gap-5">
                            <img src={produto.array_fotos?.[0] || 'https://via.placeholder.com/80'} className="w-24 h-24 rounded-[32px] object-cover border border-gray-50 shadow-sm" />
                            <div className="flex-1 flex flex-col justify-center space-y-1">
                               <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">{objCategorias.find(c => c.id === produto.categoria)?.nome_categoria || 'Geral'}</span>
                               <h5 className="text-lg font-black text-gray-900 leading-tight line-clamp-2">{produto.nome_produto}</h5>
                               <p className="text-xs font-bold text-gray-400">{objMarcas.find(m => m.id === produto.marca)?.nome_marca || 'Própria'}</p>
                            </div>
                         </div>
                         <div className="h-px bg-gray-50" />
                         <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[#FBFBFC] p-3 rounded-2xl flex flex-col items-center">
                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Preço</p>
                               <p className="text-base font-black text-gray-900 tracking-tight">R$ {parseFloat(produto.preco).toFixed(2)}</p>
                            </div>
                            <div className="bg-[#FBFBFC] p-3 rounded-2xl flex flex-col items-center">
                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Estoque</p>
                               <p className={`text-base font-black ${produto.estoque > 0 ? 'text-gray-900' : 'text-red-500'}`}>{produto.estoque} un.</p>
                            </div>
                         </div>
                         <div className="flex gap-3">
                            <button className="flex-1 bg-white border border-gray-100 text-gray-900 font-bold py-4 rounded-[22px] flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all">
                               <Edit2 size={18} /> <span>Editar</span>
                            </button>
                            <button 
                              className="bg-red-50 text-red-500 font-bold px-6 py-4 rounded-[22px] shadow-sm active:scale-95 transition-all"
                              onClick={() => handleDelete(produto.id, produto.nome_produto)}
                            >
                               <Trash2 size={20} />
                            </button>
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="card border-dashed border-2 py-20 flex flex-col items-center justify-center text-center px-10 bg-white">
                      <Package size={48} className="text-gray-200 mb-4" />
                      <p className="font-bold text-gray-400">Nenhum produto cadastrado.</p>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {activeTab === 'perfil' && (
            <section className="bg-white rounded-[48px] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden animate-fade-in max-w-4xl mx-auto">
              <div className="p-10 lg:p-14 border-b border-gray-50 flex flex-col md:flex-row items-center gap-8 justify-between bg-gradient-to-br from-white to-gray-50">
                <div className="text-center md:text-left space-y-2">
                  <h2 className="text-3xl font-black tracking-tight text-gray-900">Meu Perfil</h2>
                  <p className="text-gray-400 font-medium text-lg">Personalize como seus clientes enxergam você.</p>
                </div>
                <div className="relative group">
                   <div className="absolute inset-0 bg-pink-500 rounded-[40px] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                   <img src={currentUser?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mayrlan'} className="w-28 h-28 rounded-[40px] border-4 border-white shadow-xl relative z-10" />
                   <button className="absolute -bottom-2 -right-2 p-3 bg-white rounded-2xl shadow-xl text-gray-400 hover:text-pink-600 transition-colors z-20 border border-gray-50">
                      <Upload size={18} />
                   </button>
                </div>
              </div>
              <div className="p-10 lg:p-14">
                <form onSubmit={handleUpdateProfile} className="space-y-10">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                      <div className="space-y-2">
                         <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Nome Comercial</label>
                         <input 
                           type="text"
                           value={profileForm.nome} 
                           onChange={e => setProfileForm({...profileForm, nome: e.target.value})}
                           className="w-full bg-[#FBFBFC] border border-gray-100 rounded-3xl px-8 py-5 font-bold text-gray-900 focus:ring-4 focus:ring-pink-500/5 outline-none focus:border-pink-200 transition-all" 
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">WhatsApp de Vendas</label>
                         <input 
                           type="text"
                           placeholder="Ex: 11999999999"
                           value={profileForm.whatsapp} 
                           onChange={e => setProfileForm({...profileForm, whatsapp: e.target.value})}
                           className="w-full bg-[#FBFBFC] border border-gray-100 rounded-3xl px-8 py-5 font-bold text-gray-900 focus:ring-4 focus:ring-pink-500/5 outline-none focus:border-pink-200 transition-all" 
                         />
                      </div>
                   </div>

                   <div className="space-y-2 text-left">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Biografia da Loja</label>
                      <textarea 
                        rows={4}
                        placeholder="Conte um pouco sobre sua consultoria..."
                        value={profileForm.biografia} 
                        onChange={e => setProfileForm({...profileForm, biografia: e.target.value})}
                        className="w-full bg-[#FBFBFC] border border-gray-100 rounded-3xl px-8 py-5 font-bold text-gray-900 focus:ring-4 focus:ring-pink-500/5 outline-none focus:border-pink-200 transition-all resize-none" 
                      />
                   </div>

                   <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
                      <button 
                        type="submit" 
                        disabled={formLoading}
                        className="btn-primary flex-1 w-full py-6 rounded-[28px] text-white font-black shadow-2xl shadow-pink-200 flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                         {formLoading ? 'Salvando...' : 'Salvar Alterações'}
                      </button>
                      <button type="button" onClick={() => setActiveTab('produtos')} className="text-gray-400 font-black hover:text-gray-900 transition-colors uppercase tracking-widest text-xs">Descartar</button>
                   </div>
                </form>
                <div className="mt-16 bg-pink-50 rounded-[40px] p-8 border border-pink-100 flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 bg-pink-500 text-white rounded-2xl flex items-center justify-center shadow-lg animate-bounce-subtle">
                     <Share2 size={24} />
                  </div>
                  <h4 className="text-xl font-black text-pink-900 font-outfit">Sua vitrine é única!</h4>
                  <p className="text-pink-600 font-medium max-w-sm">Use o link personalizado <strong>/{revendedor.slug_url}</strong> para compartilhar suas atualizações instantaneamente.</p>
                </div>
              </div>
            </section>
          )}

        </div>
      </main>

      {/* 3. MODAL ADICIONAR PRODUTO (PREMIUM REDESIGN) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8 overflow-hidden animate-fade-in">
           <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-2xl" onClick={() => setIsModalOpen(false)} />
           <div className="bg-white w-full max-w-4xl rounded-[48px] relative z-10 shadow-[0_32px_120px_rgba(0,0,0,0.25)] flex flex-col md:flex-row max-h-[90vh] overflow-hidden animate-modal-pop">
              
              {/* Left Panel: Preview/Photos */}
              <div className="w-full md:w-[380px] bg-[#FBFBFC] p-10 flex flex-col border-b md:border-b-0 md:border-r border-gray-100">
                <div className="flex-1 space-y-8">
                   <div className="space-y-2 text-center md:text-left">
                      <h2 className="text-2xl font-black tracking-tight">Nova Oferta</h2>
                      <p className="text-gray-400 font-medium">As fotos são o cartão de visitas dos seus produtos.</p>
                   </div>

                   <div className="space-y-6">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center md:text-left">Galeria ({fotosUpload.length}/4)</label>
                      <div className="grid grid-cols-2 gap-4">
                         {fotosUpload.map((file, idx) => (
                           <div key={idx} className="aspect-square rounded-[32px] overflow-hidden border-2 border-white relative group shadow-md hover:scale-105 transition-transform duration-300">
                              <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                              <button type="button" onClick={() => removeFoto(idx)} className="absolute inset-0 bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"><Trash2 size={24}/></button>
                           </div>
                         ))}
                         {fotosUpload.length < 4 && (
                           <label className="aspect-square rounded-[32px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 hover:border-pink-300 hover:text-pink-500 hover:bg-pink-50/30 cursor-pointer transition-all duration-300 group shadow-sm hover:shadow-pink-100">
                              <Upload size={32} className="group-hover:scale-110 transition-transform mb-2" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Enviar</span>
                              <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
                           </label>
                         )}
                      </div>
                   </div>
                </div>

                <div className="mt-10 p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm space-y-2">
                    <div className="flex items-center gap-2">
                       <TrendingUp size={16} className="text-green-500" />
                       <span className="text-[10px] font-black text-gray-900 uppercase tracking-wider">Dica de Venda</span>
                    </div>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed">Produtos com pelo menos 3 fotos reais vendem até <span className="text-pink-500 font-black">40% mais</span> no WhatsApp.</p>
                </div>
              </div>

              {/* Right Panel: Form */}
              <div className="flex-1 flex flex-col overflow-hidden bg-white">
                <div className="p-10 pb-0 flex items-center justify-end">
                   <button onClick={() => setIsModalOpen(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors text-gray-400"><X size={24}/></button>
                </div>

                <form className="flex-1 overflow-y-auto p-10 pt-4 space-y-10 no-scrollbar" onSubmit={handleAddProduct}>
                  <div className="space-y-10">
                    <section className="space-y-6">
                       <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-[0.2em] flex items-center gap-2">
                         <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div> Informações Básicas
                       </h4>
                       <div className="space-y-6">
                          <div className="space-y-2">
                             <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Nome Comercial</label>
                             <input 
                               type="text" required placeholder="Ex: Batom Matte Intenso 4g"
                               className="w-full bg-[#FBFBFC] border border-gray-100 focus:border-pink-200 rounded-[24px] px-8 py-5 outline-none focus:ring-4 focus:ring-pink-500/5 transition-all text-sm font-bold placeholder:text-gray-300"
                               value={newProduto.nome_produto} onChange={e => setNewProduto({...newProduto, nome_produto: e.target.value})}
                             />
                          </div>

                          <div className="grid grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Marca</label>
                                <select required className="w-full bg-[#FBFBFC] border border-gray-100 rounded-[24px] px-6 py-5 outline-none font-bold text-sm text-gray-700 appearance-none cursor-pointer" value={newProduto.marca} onChange={e => setNewProduto({...newProduto, marca: e.target.value})}>
                                   <option value="">Selecione...</option>
                                   {objMarcas.map(m => <option key={m.id} value={m.id}>{m.nome_marca}</option>)}
                                </select>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Categoria</label>
                                <select required className="w-full bg-[#FBFBFC] border border-gray-100 rounded-[24px] px-6 py-5 outline-none font-bold text-sm text-gray-700 appearance-none cursor-pointer" value={newProduto.categoria} onChange={e => setNewProduto({...newProduto, categoria: e.target.value})}>
                                   <option value="">Selecione...</option>
                                   {objCategorias.map(c => <option key={c.id} value={c.id}>{c.nome_categoria}</option>)}
                                </select>
                             </div>
                          </div>
                       </div>
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="space-y-6">
                          <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div> Preço e Inventário
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Valor (R$)</label>
                                <input 
                                  type="text" required placeholder="0,00"
                                  className="w-full bg-[#FBFBFC] border border-gray-100 rounded-[20px] px-6 py-4 outline-none font-black text-center text-lg focus:border-pink-200 transition-all"
                                  value={newProduto.preco} onChange={e => setNewProduto({...newProduto, preco: e.target.value})}
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Estoque</label>
                                <input 
                                  type="number" required placeholder="0"
                                  className="w-full bg-[#FBFBFC] border border-gray-100 rounded-[20px] px-6 py-4 outline-none font-black text-center text-lg focus:border-pink-200 transition-all"
                                  value={newProduto.estoque} onChange={e => setNewProduto({...newProduto, estoque: e.target.value})}
                                />
                             </div>
                          </div>
                       </div>

                       <div className="space-y-6">
                          <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div> Visibilidade
                          </h4>
                          <div className="space-y-3">
                             <label className="flex items-center gap-4 bg-[#FBFBFC] p-4 rounded-3xl cursor-pointer hover:bg-pink-50 transition-colors border border-gray-50 group">
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${newProduto.destaque ? 'bg-pink-500 text-white' : 'bg-white border-2 border-gray-200'}`}>
                                   {newProduto.destaque && <Check size={14} className="stroke-[4px]" />}
                                </div>
                                <input type="checkbox" checked={newProduto.destaque} onChange={e => setNewProduto({...newProduto, destaque: e.target.checked})} className="hidden" />
                                <div className="flex-1">
                                  <span className="text-sm font-black block leading-none mb-1">Destaque na Vitrine</span>
                                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Aparecer no topo da loja</span>
                                </div>
                             </label>
                             <label className="flex items-center gap-4 bg-[#FBFBFC] p-4 rounded-3xl cursor-pointer hover:bg-green-50 transition-colors border border-gray-50">
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${newProduto.pronta_entrega ? 'bg-green-500 text-white' : 'bg-white border-2 border-gray-200'}`}>
                                   {newProduto.pronta_entrega && <Check size={14} className="stroke-[4px]" />}
                                </div>
                                <input type="checkbox" checked={newProduto.pronta_entrega} onChange={e => setNewProduto({...newProduto, pronta_entrega: e.target.checked})} className="hidden" />
                                <div className="flex-1">
                                  <span className="text-sm font-black block leading-none mb-1">Disponível Imediato</span>
                                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Sinalizar pronta entrega</span>
                                </div>
                             </label>
                          </div>
                       </div>
                    </section>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-10 sticky bottom-0 bg-white pb-4">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 font-black text-gray-400 py-5 hover:bg-gray-50 rounded-[28px] transition-all">Cancelar</button>
                     <button 
                       type="submit" disabled={formLoading}
                       className="flex-[2] bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black py-5 rounded-[28px] shadow-2xl shadow-pink-200 hover:shadow-pink-300 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                     >
                       {formLoading ? (
                         <div className="flex items-center justify-center gap-3">
                           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           <span>Sincronizando...</span>
                         </div>
                       ) : 'Publicar Produto'}
                     </button>
                  </div>
                </form>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
