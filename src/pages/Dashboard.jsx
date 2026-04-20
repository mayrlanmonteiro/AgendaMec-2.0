import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Plus, Settings, Share2, Edit2, Trash2, 
  LogOut, X, Upload, Copy, Check, MoreVertical, 
  LayoutDashboard, User as UserIcon, ExternalLink, Package,
  TrendingUp, BarChart3, Box, AlertCircle, Search, Filter, ChevronRight,
  ArrowUpRight, Menu, Star, Zap
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
  <div className="bg-white p-8 rounded-[32px] border border-gray-100 flex items-start justify-between group cursor-default shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
    <div className="space-y-4">
      <div className={`w-14 h-14 rounded-2xl inline-flex items-center justify-center ${colorClass} bg-opacity-10 transition-all duration-500 group-hover:bg-opacity-20`}>
        <Icon size={28} className={colorClass.replace('bg-', 'text-')} />
      </div>
      <div>
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</p>
        <div className="flex items-baseline gap-2">
           <h3 className="text-4xl font-black text-gray-900 mt-1 tracking-tighter">{value}</h3>
           {detail && <p className="text-xs font-bold text-gray-400">{detail}</p>}
        </div>
      </div>
    </div>
    <div>
       <button className="p-2 text-gray-200 hover:text-gray-900 transition-colors">
         <MoreVertical size={20} />
       </button>
    </div>
  </div>
);

const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-50">
    <td className="p-8 flex items-center gap-5">
      <div className="w-16 h-16 bg-gray-50 rounded-2xl" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-50 rounded w-48" />
        <div className="h-3 bg-gray-50 rounded w-24" />
      </div>
    </td>
    <td className="p-8"><div className="h-4 bg-gray-50 rounded w-28" /></td>
    <td className="p-8"><div className="h-8 bg-gray-50 rounded-full w-32" /></td>
    <td className="p-8 text-right"><div className="h-4 bg-gray-50 rounded w-24 ml-auto" /></td>
    <td className="p-8 text-center"><div className="h-4 bg-gray-50 rounded w-16 mx-auto" /></td>
    <td className="p-8 text-right space-x-2">
      <div className="h-12 bg-gray-50 rounded-xl w-12 inline-block" />
      <div className="h-12 bg-gray-50 rounded-xl w-12 inline-block" />
    </td>
  </tr>
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

  const lojaUrl = `belezaconecta.app/${revendedor.slug_url}`;

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
    if (fotosUpload.length + files.length > 4) {
      alert("Máximo de 4 fotos por produto.");
      return;
    }
    setFotosUpload(prev => [...prev, ...files]);
  };

  const removeFoto = (indexToRemove) => {
    setFotosUpload(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (fotosUpload.length === 0) {
      alert("Adicione pelo menos uma foto para destacar seu produto.");
      return;
    }
    setFormLoading(true);

    try {
      const uploadPromises = fotosUpload.map(async (file, index) => {
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
        const filePath = `${currentUser.uid}/${Date.now()}_${index}_${safeName}`;
        const { error } = await supabase.storage.from('produtos').upload(filePath, file);
        if (error) throw error;
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
      alert("Perfil atualizado com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar!");
    } finally {
      setFormLoading(false);
    }
  };

  const filteredProdutos = lojaProdutos.filter(p => 
    p.nome_produto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white">
        <div className="w-16 h-16 border-4 border-pink-50 border-t-pink-500 rounded-full animate-spin mb-6" />
        <h2 className="text-xl font-bold text-gray-900 font-outfit uppercase tracking-tighter">Beleza Conecta</h2>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FBFBFC] overflow-hidden font-sans text-gray-900">
      
      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-100 flex flex-col transition-all duration-500 ease-in-out
        lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-10 pb-16 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-pink-200">
            <ShoppingBag size={24} />
          </div>
          <div className="flex flex-col">
            <span className="font-outfit font-black text-2xl tracking-tighter leading-none">BELEZA</span>
            <span className="text-pink-600 font-black text-xs tracking-widest leading-none mt-1 uppercase">Conecta</span>
          </div>
        </div>

        <nav className="flex-1 px-8 space-y-3">
          <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-6">Administração</p>
          
          <button 
            onClick={() => { setActiveTab('produtos'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-6 py-4.5 rounded-2xl font-black transition-all duration-300 ${activeTab === 'produtos' ? 'bg-pink-50 text-pink-600 shadow-sm' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
          >
            <div className="flex items-center gap-4">
              <LayoutDashboard size={22} /> 
              <span className="text-sm uppercase tracking-wider">Produtos</span>
            </div>
            {activeTab === 'produtos' && <ChevronRight size={16} />}
          </button>

          <button 
            onClick={() => { setActiveTab('perfil'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-6 py-4.5 rounded-2xl font-black transition-all duration-300 ${activeTab === 'perfil' ? 'bg-pink-50 text-pink-600 shadow-sm' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
          >
            <div className="flex items-center gap-4">
              <UserIcon size={22} /> 
              <span className="text-sm uppercase tracking-wider">Perfil</span>
            </div>
            {activeTab === 'perfil' && <ChevronRight size={16} />}
          </button>

          <div className="h-px bg-gray-50 mx-4 my-8" />

          <button className="w-full flex items-center gap-4 px-6 py-4.5 rounded-2xl font-black text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all opacity-50">
            <Settings size={22} />
            <span className="text-sm uppercase tracking-wider">Ajustes</span>
          </button>
        </nav>

        <div className="p-8">
          <div className="bg-gray-50 rounded-[32px] p-6 mb-6 flex items-center gap-4 border border-gray-100">
            <div className="relative">
              <img src={currentUser?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${revendedor.nome}`} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-black text-gray-900 truncate">{revendedor.nome}</p>
              <p className="text-[10px] font-bold text-pink-500 uppercase tracking-widest">Plano Master</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 bg-white border border-gray-100 shadow-sm">
            <LogOut size={20} /> <span className="text-xs uppercase tracking-widest">Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* OVERLAY MOBILE */}
      {isSidebarOpen && <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* HEADER BAR */}
        <header className="h-20 lg:h-28 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-8 lg:px-16 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-gray-50 text-gray-900 rounded-2xl">
              <Menu size={24} />
            </button>
            <div className="hidden lg:block relative group">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-pink-500 transition-colors" size={20} />
               <input 
                 type="text" 
                 placeholder="Buscar por nome do produto..." 
                 className="bg-gray-50 border-transparent rounded-2xl py-4 pl-14 pr-8 text-sm w-96 focus:ring-4 focus:ring-pink-500/5 focus:bg-white outline-none border transition-all"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-8">
            <div className="hidden md:flex flex-col text-right">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Atualizado agora em</span>
               <span className="text-sm font-black text-gray-900">Porto Alegre, BR</span>
            </div>
            <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center relative cursor-pointer hover:scale-105 transition-transform">
               <Package size={22} className="stroke-[2.5px]" />
               <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-black animate-pulse">3</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 lg:p-16 space-y-12 max-w-[1700px] w-full mx-auto pb-32">
          
          {/* HEADER TITLE SECTION */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-pink-100/50 text-pink-600 rounded-full">
                 <div className="w-1.5 h-1.5 bg-pink-600 rounded-full shadow-[0_0_8px_rgba(236,72,153,0.6)]"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest">Área Administrativa</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tight font-outfit">
                {activeTab === 'produtos' ? 'Gestão de Estoque' : 'Configurações'}
              </h1>
              <p className="text-gray-400 text-xl font-medium max-w-2xl">
                 Organize seu catálogo, gerencie pedidos e personalize sua experiência.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <button 
                className="px-8 py-5 bg-white text-gray-700 rounded-3xl font-black text-sm uppercase tracking-widest border border-gray-100 shadow-sm hover:shadow-xl transition-all flex items-center gap-3 active:scale-95"
                onClick={() => window.open(`/${revendedor.slug_url}`, '_blank')}
              >
                <ExternalLink size={20} /> Ver Minha Loja
              </button>
              <button 
                className="px-10 py-5 bg-gray-900 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus size={22} className="stroke-[3px]" /> Adicionar Produto
              </button>
            </div>
          </section>

          {activeTab === 'produtos' && (
            <>
              {/* STATS FOLD */}
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
                 <StatCard 
                   icon={Box} 
                   title="Catálogo Total" 
                   value={lojaProdutos.length} 
                   detail="Produtos ativos" 
                   colorClass="bg-pink-500"
                 />
                 <StatCard 
                   icon={TrendingUp} 
                   title="Meta Mensal" 
                   value="82%" 
                   detail="+12% que ontem" 
                   colorClass="bg-blue-500"
                 />
                 <StatCard 
                   icon={AlertCircle} 
                   title="Baixo Estoque" 
                   value={lojaProdutos.filter(p => p.estoque < 3).length} 
                   detail="Precisa Repor" 
                   colorClass="bg-orange-500"
                 />
                 <StatCard 
                   icon={BarChart3} 
                   title="Visitas Hoje" 
                   value="147" 
                   detail="Links únicos" 
                   colorClass="bg-purple-500"
                 />
              </section>

              {/* SALES LINK BANNER (GLASS) */}
              <section className="relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-pink-900/80 to-purple-950 rounded-[48px] lg:rounded-[64px] shadow-2xl transition-all duration-1000 group-hover:scale-[1.01]"></div>
                 <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-white/5 to-transparent skew-x-[-20deg] -translate-x-24"></div>
                 
                 <div className="relative z-10 p-10 lg:p-16 flex flex-col xl:flex-row items-center justify-between gap-12 text-center xl:text-left">
                    <div className="flex flex-col lg:flex-row items-center gap-10">
                       <div className="w-24 h-24 bg-white/10 backdrop-blur-3xl rounded-[36px] flex items-center justify-center border border-white/20 shadow-2xl shadow-pink-500/20 active:rotate-12 transition-transform">
                          <Share2 size={40} className="text-white" />
                       </div>
                       <div className="space-y-3">
                          <h3 className="text-4xl font-black text-white tracking-tight font-outfit">Sua Loja está no ar!</h3>
                          <p className="text-pink-100/60 font-medium text-xl max-w-lg">O link abaixo leva seus clientes direto para sua vitrine digital personalizada.</p>
                       </div>
                    </div>

                    <div className="w-full lg:w-auto scale-110 xl:scale-100">
                       <div className="bg-white/10 backdrop-blur-md rounded-[32px] p-3 flex flex-col sm:flex-row items-center gap-3 border border-white/10 shadow-inner max-w-xl">
                          <div className="flex-1 px-8 py-4 font-black text-white text-base truncate tracking-tight lowercase">
                             {lojaUrl}
                          </div>
                          <button 
                            onClick={copyToClipboard}
                            className={`w-full sm:w-auto px-10 py-5 rounded-[24px] flex items-center justify-center gap-3 transition-all duration-500 font-black shadow-xl ${copied ? 'bg-green-500 text-white' : 'bg-white text-gray-900 hover:scale-105 active:scale-95'}`}
                          >
                            {copied ? <Check size={22} className="stroke-[3px]" /> : <Copy size={22} />}
                            <span className="text-sm uppercase tracking-widest">{copied ? 'Copiado!' : 'Copiar'}</span>
                          </button>
                       </div>
                    </div>
                 </div>
              </section>

              {/* PRODUCT TABLE (REFINED FOR 100% ZOOM) */}
              <section className="space-y-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                        <Box size={24} className="text-pink-600" />
                      </div>
                      <h4 className="text-2xl font-black text-gray-900 tracking-tight font-outfit">Todos os Itens <span className="text-gray-300 ml-2">({filteredProdutos.length})</span></h4>
                   </div>
                   <div className="flex items-center gap-4">
                      <button className="flex items-center gap-3 px-6 py-4 bg-white border border-gray-100 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all">
                        <Filter size={18} /> Filtrar por Marca
                      </button>
                   </div>
                </div>

                <div className="hidden lg:block bg-white rounded-[48px] border border-gray-100 shadow-2xl shadow-gray-200/20 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#FBFBFC] border-b border-gray-50">
                      <tr>
                        <th className="px-10 py-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.25em]">Informação do Produto</th>
                        <th className="px-10 py-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.25em]">Sinalização</th>
                        <th className="px-10 py-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] text-center">Valor Unitário</th>
                        <th className="px-10 py-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] text-center">Estoque</th>
                        <th className="px-10 py-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50/60">
                      {loadingProdutos ? (
                        [1,2,3,4].map(i => <SkeletonRow key={i} />)
                      ) : filteredProdutos.length > 0 ? (
                        filteredProdutos.map(produto => (
                          <tr key={produto.id} className="hover:bg-gray-50/50 transition-all duration-300 group">
                            <td className="px-10 py-8">
                              <div className="flex items-center gap-6">
                                <div className="relative shrink-0 group-hover:scale-105 transition-transform duration-500">
                                   <img src={produto.array_fotos?.[0] || 'https://via.placeholder.com/64'} className="w-20 h-20 rounded-[28px] object-cover border border-gray-100 shadow-sm" />
                                   {produto.destaque && (
                                     <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                                        <Star size={10} fill="white" className="text-white" />
                                     </div>
                                   )}
                                </div>
                                <div className="space-y-1">
                                  <h5 className="text-lg font-black text-gray-900 group-hover:text-pink-600 transition-colors">{produto.nome_produto}</h5>
                                  <div className="flex items-center gap-3">
                                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{objMarcas.find(m => m.id === produto.marca)?.nome_marca || 'Própria'}</span>
                                     <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                     <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest">{objCategorias.find(c => c.id === produto.categoria)?.nome_categoria || 'Vários'}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-10 py-8">
                              <div className="flex flex-col gap-2 items-start">
                                 {produto.pronta_entrega && (
                                   <span className="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black rounded-lg border border-green-100 uppercase tracking-widest">Pronta Entrega</span>
                                 )}
                                 {produto.destaque && (
                                   <span className="px-3 py-1 bg-pink-50 text-pink-600 text-[9px] font-black rounded-lg border border-pink-100 uppercase tracking-widest">Destaque</span>
                                 )}
                              </div>
                            </td>
                            <td className="px-10 py-8 text-center">
                               <div className="flex flex-col items-center">
                                  <span className="text-xl font-black text-gray-900 tracking-tighter">R$ {parseFloat(produto.preco).toFixed(2)}</span>
                                  <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Base Padrão</span>
                               </div>
                            </td>
                            <td className="px-10 py-8 text-center">
                              <div className={`inline-flex flex-col items-center px-5 py-2.5 rounded-2xl border ${produto.estoque > 5 ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-600'}`}>
                                 <span className="text-lg font-black">{produto.estoque}</span>
                                 <span className="text-[9px] font-black uppercase tracking-tighter opacity-70">unidades</span>
                              </div>
                            </td>
                            <td className="px-10 py-8 text-right">
                              <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                 <button className="p-4 bg-white text-gray-400 hover:text-pink-600 rounded-2xl border border-gray-100 hover:shadow-xl transition-all">
                                    <Edit2 size={20} />
                                 </button>
                                 <button 
                                   onClick={() => handleDelete(produto.id, produto.nome_produto)}
                                   className="p-4 bg-white text-gray-400 hover:text-red-500 rounded-2xl border border-gray-100 hover:shadow-xl transition-all"
                                 >
                                    <Trash2 size={20} />
                                 </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="py-32 text-center">
                             <div className="max-w-md mx-auto space-y-6">
                                <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center mx-auto text-gray-100">
                                   <Package size={60} />
                                </div>
                                <h5 className="text-2xl font-black text-gray-900 tracking-tight">Comece sua jornada digital!</h5>
                                <p className="text-gray-400 font-medium">Você ainda não possui produtos cadastrados. Adicione seu primeiro item agora e comece a vender.</p>
                                <button onClick={() => setIsModalOpen(true)} className="px-12 py-5 bg-pink-500 text-white rounded-3xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-all">Novo Produto</button>
                             </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE VIEW GRID */}
                <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {filteredProdutos.map(produto => (
                    <div key={produto.id} className="bg-white p-6 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                       <div className="flex gap-6">
                          <img src={produto.array_fotos?.[0] || 'https://via.placeholder.com/100'} className="w-24 h-24 rounded-[32px] object-cover" />
                          <div className="flex-1 space-y-2 py-2">
                             <span className="text-[10px] font-black text-pink-600 uppercase tracking-widest">{objCategorias.find(c => c.id === produto.categoria)?.nome_categoria}</span>
                             <h5 className="text-xl font-black text-gray-900 leading-none">{produto.nome_produto}</h5>
                             <p className="text-xs font-bold text-gray-400">{objMarcas.find(m => m.id === produto.marca)?.nome_marca}</p>
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded-2xl text-center">
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Preço</p>
                             <p className="text-lg font-black text-gray-900 tracking-tight">R$ {parseFloat(produto.preco).toFixed(2)}</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-2xl text-center">
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Estoque</p>
                             <p className="text-lg font-black text-gray-900 tracking-tight">{produto.estoque} un.</p>
                          </div>
                       </div>
                       <div className="flex gap-4">
                          <button className="flex-1 bg-white border border-gray-100 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm">
                             <Edit2 size={16} /> Editar
                          </button>
                          <button onClick={() => handleDelete(produto.id, produto.nome_produto)} className="bg-red-50 text-red-500 px-8 py-5 rounded-[24px] shadow-sm"><Trash2 size={20}/></button>
                       </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === 'perfil' && (
            <section className="bg-white rounded-[64px] border border-gray-100 shadow-2xl shadow-gray-200/30 overflow-hidden animate-fade-in max-w-5xl mx-auto">
               <div className="px-12 py-16 lg:p-20 bg-gradient-to-br from-white to-gray-50/50 border-b border-gray-50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-pink-100/20 blur-[80px] rounded-full"></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 justify-between">
                     <div className="text-center md:text-left space-y-4">
                        <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-gray-900 font-outfit">Meu Perfil Profissional</h2>
                        <p className="text-gray-400 font-medium text-xl max-w-md">Gerencie sua identidade digital e canais de atendimento.</p>
                     </div>
                     <div className="relative group scale-110">
                        <div className="absolute inset-0 bg-pink-500/10 rounded-[48px] blur-2xl group-hover:bg-pink-500/20 transition-all duration-500"></div>
                        <img src={currentUser?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${revendedor.nome}`} className="w-36 h-36 rounded-[48px] border-4 border-white shadow-2xl relative z-10 object-cover" />
                        <button className="absolute -bottom-2 -right-2 p-4 bg-white rounded-2xl shadow-2xl text-pink-500 hover:scale-110 transition-transform active:scale-95 z-20 border border-gray-50 hover:bg-pink-500 hover:text-white transition-all duration-300">
                           <Upload size={22} className="stroke-[2.5px]" />
                        </button>
                     </div>
                  </div>
               </div>

               <div className="p-12 lg:p-20">
                  <form onSubmit={handleUpdateProfile} className="space-y-12">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                           <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] px-2 italic">Nome que aparece na Loja</label>
                           <input 
                             type="text" 
                             className="w-full bg-[#FBFBFC] border border-transparent focus:border-pink-200 focus:bg-white rounded-[28px] px-8 py-6 font-black text-lg outline-none focus:ring-8 focus:ring-pink-500/5 transition-all placeholder:text-gray-200"
                             value={profileForm.nome}
                             onChange={e => setProfileForm({...profileForm, nome: e.target.value})}
                           />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] px-2 italic">WhatsApp de Vendas</label>
                           <input 
                             type="text" 
                             className="w-full bg-[#FBFBFC] border border-transparent focus:border-pink-200 focus:bg-white rounded-[28px] px-8 py-6 font-black text-lg outline-none focus:ring-8 focus:ring-pink-500/5 transition-all placeholder:text-gray-200"
                             value={profileForm.whatsapp}
                             onChange={e => setProfileForm({...profileForm, whatsapp: e.target.value})}
                           />
                        </div>
                     </div>

                     <div className="space-y-3">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] px-2 italic">Biografia / Apresentação</label>
                        <textarea 
                           rows={5}
                           className="w-full bg-[#FBFBFC] border border-transparent focus:border-pink-200 focus:bg-white rounded-[32px] px-10 py-8 font-bold text-lg outline-none focus:ring-8 focus:ring-pink-500/5 transition-all resize-none leading-relaxed"
                           placeholder="Ex: Consultora O Boticário há 5 anos, apaixonada por perfumaria..."
                           value={profileForm.biografia}
                           onChange={e => setProfileForm({...profileForm, biografia: e.target.value})}
                        />
                     </div>

                     <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
                        <button 
                          type="submit" 
                          disabled={formLoading}
                          className="px-14 py-7 bg-pink-500 text-white rounded-[32px] font-black text-lg shadow-3xl shadow-pink-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 flex-1 disabled:opacity-50"
                        >
                           {formLoading ? 'Salvando...' : (
                             <>Salvar Alterações <ArrowUpRight size={22} /></>
                           )}
                        </button>
                        <button type="button" onClick={() => setActiveTab('produtos')} className="text-gray-400 font-black hover:text-gray-900 transition-colors uppercase tracking-[0.2em] text-xs px-8">Desfazer</button>
                     </div>
                  </form>

                  <div className="mt-20 p-10 bg-pink-50 rounded-[48px] border border-pink-100 flex flex-col xl:flex-row items-center gap-10 text-center xl:text-left transition-all hover:bg-pink-100/50">
                     <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-pink-500 shadow-xl shadow-pink-200 shrink-0">
                        <ExternalLink size={28} />
                     </div>
                     <div className="flex-1 space-y-2">
                        <h4 className="text-2xl font-black text-pink-900 font-outfit tracking-tight">Sua vitrine é vitalícia!</h4>
                        <p className="text-pink-600 font-medium text-lg leading-relaxed max-w-2xl">Lembre-se: o link <strong>belezaconecta.app/{revendedor.slug_url}</strong> nunca muda. Use-o na sua bio do Instagram.</p>
                     </div>
                     <button onClick={copyToClipboard} className="px-8 py-4 bg-white text-pink-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all">Copiar Novamente</button>
                  </div>
               </div>
            </section>
          )}

        </div>
      </main>

      {/* --- ADD PRODUCT MODAL (PREMIUM) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12 animate-fade-in">
           <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-3xl" onClick={() => setIsModalOpen(false)} />
           <div className="bg-white w-full max-w-6xl rounded-[60px] relative z-10 shadow-[0_32px_120px_rgba(0,0,0,0.3)] flex flex-col lg:flex-row max-h-[92vh] overflow-hidden animate-modal-pop border border-white/20">
              
              {/* Image Preview Left Area */}
              <div className="w-full lg:w-[480px] bg-[#FBFBFC] p-12 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-100 shrink-0 overflow-y-auto no-scrollbar">
                <div className="flex-1 space-y-12">
                   <div className="space-y-4">
                      <div className="w-12 h-12 bg-pink-500 text-white rounded-2xl flex items-center justify-center shadow-lg"><Upload size={24} /></div>
                      <h2 className="text-3xl font-black tracking-tight font-outfit">Imagens do Item</h2>
                      <p className="text-gray-400 font-medium text-lg">As fotos reais passam mais confiança e ajudam a fechar vendas mais rápido.</p>
                   </div>

                   <div className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Galeria do Produto</label>
                        <span className="text-[10px] font-black text-pink-500 bg-pink-50 px-2.5 py-1 rounded-full uppercase tracking-tighter">{fotosUpload.length} de 4</span>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                         {fotosUpload.map((file, idx) => (
                           <div key={idx} className="aspect-square rounded-[36px] overflow-hidden border-4 border-white relative group shadow-xl transition-all duration-500 hover:scale-[1.02]">
                              <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                              <button type="button" onClick={() => removeFoto(idx)} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all font-black uppercase text-[10px] tracking-widest backdrop-blur-sm">Remover</button>
                           </div>
                         ))}
                         {fotosUpload.length < 4 && (
                           <label className="aspect-square rounded-[36px] border-[3px] border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-200 hover:border-pink-300 hover:text-pink-500 hover:bg-pink-50/50 cursor-pointer transition-all duration-500 group shadow-lg shadow-gray-50">
                              <Plus size={44} className="group-hover:scale-125 group-hover:rotate-90 transition-transform duration-500 stroke-[1.5px]" />
                              <span className="text-[10px] font-black uppercase tracking-widest mt-4">Upload</span>
                              <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
                           </label>
                         )}
                      </div>
                   </div>
                </div>

                <div className="mt-12 p-8 bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/20 space-y-4">
                    <div className="flex items-center gap-3">
                       <Zap size={20} className="text-pink-500" />
                       <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Dica Profissional</span>
                    </div>
                    <p className="text-[15px] text-gray-400 font-medium leading-relaxed italic">"Produtos com fotos de fundo neutro e boa iluminação convertem até <span className="text-pink-500 font-black">58% mais</span> no mobile."</p>
                </div>
              </div>

              {/* Form Content Right Area */}
              <div className="flex-1 flex flex-col overflow-hidden bg-white">
                <div className="px-12 py-10 border-b border-gray-50 flex items-center justify-between shrink-0">
                   <div className="flex items-center gap-4">
                      <div className="w-2 h-10 bg-pink-500 rounded-full"></div>
                      <h3 className="text-2xl font-black font-outfit uppercase tracking-tight">Criação de Anúncio</h3>
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className="p-4 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-[24px] transition-all text-gray-400 active:scale-90"><X size={24} className="stroke-[2.5px]"/></button>
                </div>

                <form className="flex-1 overflow-y-auto p-12 lg:p-16 space-y-12 no-scrollbar" onSubmit={handleAddProduct}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <section className="space-y-10 md:col-span-2">
                        <div className="space-y-4 px-2">
                           <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Título do Produto</label>
                           <input 
                             type="text" required placeholder="Ex: Kit Nativa SPA Quinoa (4 itens)"
                             className="w-full bg-[#FBFBFC] border border-transparent focus:border-pink-200 focus:bg-white rounded-[32px] px-10 py-7 outline-none focus:ring-8 focus:ring-pink-500/5 transition-all text-xl font-black placeholder:text-gray-200 shadow-inner"
                             value={newProduto.nome_produto} onChange={e => setNewProduto({...newProduto, nome_produto: e.target.value})}
                           />
                        </div>
                     </section>

                     <section className="space-y-4 px-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Preço de Venda (R$)</label>
                        <input 
                          type="text" required placeholder="0,00"
                          className="w-full bg-[#FBFBFC] border border-transparent focus:border-pink-200 focus:bg-white rounded-[32px] px-10 py-7 outline-none focus:ring-8 focus:ring-pink-500/5 transition-all text-xl font-black placeholder:text-gray-200 shadow-inner"
                          value={newProduto.preco} onChange={e => setNewProduto({...newProduto, preco: e.target.value})}
                        />
                     </section>

                     <section className="space-y-4 px-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Quantidade em Estoque</label>
                        <input 
                          type="number" required placeholder="0"
                          className="w-full bg-[#FBFBFC] border border-transparent focus:border-pink-200 focus:bg-white rounded-[32px] px-10 py-7 outline-none focus:ring-8 focus:ring-pink-500/5 transition-all text-xl font-black placeholder:text-gray-200 shadow-inner"
                          value={newProduto.estoque} onChange={e => setNewProduto({...newProduto, estoque: e.target.value})}
                        />
                     </section>

                     <section className="space-y-4 px-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Marca / Origem</label>
                        <select 
                           required 
                           className="w-full bg-[#FBFBFC] border border-transparent focus:border-pink-200 focus:bg-white rounded-[32px] px-10 py-7 outline-none focus:ring-8 focus:ring-pink-500/5 transition-all text-lg font-black appearance-none cursor-pointer"
                           value={newProduto.marca} onChange={e => setNewProduto({...newProduto, marca: e.target.value})}
                        >
                           <option value="">Configurar Selo...</option>
                           {objMarcas.map(m => <option key={m.id} value={m.id}>{m.nome_marca}</option>)}
                        </select>
                     </section>

                     <section className="space-y-4 px-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Categoria</label>
                        <select 
                           required 
                           className="w-full bg-[#FBFBFC] border border-transparent focus:border-pink-200 focus:bg-white rounded-[32px] px-10 py-7 outline-none focus:ring-8 focus:ring-pink-500/5 transition-all text-lg font-black appearance-none cursor-pointer"
                           value={newProduto.categoria} onChange={e => setNewProduto({...newProduto, categoria: e.target.value})}
                        >
                           <option value="">Definir Tipo...</option>
                           {objCategorias.map(c => <option key={c.id} value={c.id}>{c.nome_categoria}</option>)}
                        </select>
                     </section>

                     <section className="md:col-span-2 space-y-4 px-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Descrição Técnica / Benefícios</label>
                        <textarea 
                           rows={4}
                           placeholder="Quais os diferenciais deste produto? (Fragrância, tamanho, benefícios...)"
                           className="w-full bg-[#FBFBFC] border border-transparent focus:border-pink-200 focus:bg-white rounded-[32px] px-10 py-8 outline-none focus:ring-8 focus:ring-pink-500/5 transition-all text-lg font-medium resize-none shadow-inner"
                           value={newProduto.descricao} onChange={e => setNewProduto({...newProduto, descricao: e.target.value})}
                        />
                     </section>

                     <section className="md:col-span-2 flex flex-wrap gap-10 px-4 py-4 bg-gray-50 rounded-[32px] border border-gray-100">
                        <label className="flex items-center gap-4 cursor-pointer group">
                           <div className="relative">
                              <input type="checkbox" className="sr-only" checked={newProduto.destaque} onChange={e => setNewProduto({...newProduto, destaque: e.target.checked})} />
                              <div className={`w-14 h-8 rounded-full transition-all duration-300 ${newProduto.destaque ? 'bg-pink-500 shadow-pink-200' : 'bg-gray-200'}`}>
                                 <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${newProduto.destaque ? 'translate-x-6' : 'translate-x-0'}`} />
                              </div>
                           </div>
                           <div>
                              <span className="text-sm font-black text-gray-900 block">Produto Destaque</span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aparece no topo da loja</span>
                           </div>
                        </label>

                        <div className="w-px h-10 bg-gray-200 hidden md:block"></div>

                        <label className="flex items-center gap-4 cursor-pointer group">
                           <div className="relative">
                              <input type="checkbox" className="sr-only" checked={newProduto.pronta_entrega} onChange={e => setNewProduto({...newProduto, pronta_entrega: e.target.checked})} />
                              <div className={`w-14 h-8 rounded-full transition-all duration-300 ${newProduto.pronta_entrega ? 'bg-green-500 shadow-green-200' : 'bg-gray-200'}`}>
                                 <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${newProduto.pronta_entrega ? 'translate-x-6' : 'translate-x-0'}`} />
                              </div>
                           </div>
                           <div>
                              <span className="text-sm font-black text-gray-900 block">Pronta Entrega</span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Selo de envio imediato</span>
                           </div>
                        </label>
                     </section>
                  </div>

                  <div className="sticky bottom-0 pt-10 pb-16 bg-white/95 backdrop-blur-sm border-t border-gray-50">
                     <button 
                       type="submit" 
                       disabled={formLoading}
                       className="w-full bg-pink-500 text-white py-8 rounded-[36px] font-black text-xl shadow-3xl shadow-pink-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                     >
                        {formLoading ? 'Subindo arquivos...' : (
                          <>Publicar na Vitrine <Check size={28} className="stroke-[3px]" /></>
                        )}
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
