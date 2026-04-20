import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Search, ShoppingBag, X, Plus, Minus, CheckCircle, 
  ShieldCheck, Truck, MessageCircle, User, 
  Filter, ChevronDown, Trash2, Package, Star,
  Heart, Share2, Sparkles, MapPin, ExternalLink, Clock
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { categorias, marcas } from '../data/mockData';

// --- Sub-components para estados de interface ---

const SkeletonCard = () => (
  <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden animate-pulse">
    <div className="pt-[100%] bg-gray-100/50" />
    <div className="p-5 space-y-3">
      <div className="h-2 bg-gray-100/80 rounded w-1/4" />
      <div className="h-4 bg-gray-100/80 rounded w-full" />
      <div className="h-6 bg-gray-100/80 rounded w-1/3 mt-4" />
      <div className="h-12 bg-gray-100/80 rounded-2xl w-full mt-4" />
    </div>
  </div>
);

const EmptyState = ({ onClear }) => (
  <div className="text-center py-24 px-6 bg-pink-50/30 rounded-[48px] border-2 border-dashed border-pink-100">
    <div className="inline-flex items-center justify-center w-24 h-24 bg-white text-pink-400 rounded-full mb-8 shadow-xl shadow-pink-100">
      <Search size={44} />
    </div>
    <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Nenhum tesouro encontrado!</h3>
    <p className="text-gray-500 max-w-sm mx-auto mb-10 font-medium">
      Tente ajustar sua busca ou limpar os filtros para ver outras opções maravilhosas do nosso catálogo.
    </p>
    <button 
      onClick={onClear}
      className="btn btn-primary px-10 py-4 shadow-2xl shadow-pink-200"
    >
      Limpar todos os filtros
    </button>
  </div>
);

// --- Componente Principal ---

export default function ClientView() {
  const { slug } = useParams();
  
  // Data State
  const [revendedor, setRevendedor] = useState(null);
  const [lojaProdutos, setLojaProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorNotFound, setErrorNotFound] = useState(false);

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [selectedMarca, setSelectedMarca] = useState('');
  const [sortBy, setSortBy] = useState('novidades');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  
  // Cart State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', productName: '' });

  // Fetch Logic
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const qRevendedor = query(collection(db, 'revendedores'), where('slug_url', '==', slug));
        const revendedorSnap = await getDocs(qRevendedor);
        
        if (revendedorSnap.empty) {
          setErrorNotFound(true);
          return;
        }

        const revDoc = revendedorSnap.docs[0];
        const revData = { id: revDoc.id, ...revDoc.data() };
        setRevendedor(revData);

        const qProdutos = query(collection(db, 'produtos'), where('revendedor_id', '==', revData.id));
        const produtosSnap = await getDocs(qProdutos);
        
        const items = [];
        produtosSnap.forEach(doc => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setLojaProdutos(items);

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // Filtering & Sorting Logic
  const filteredSortedProdutos = useMemo(() => {
    let result = lojaProdutos.filter(p => {
      const matchSearch = p.nome_produto?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const matchCategoria = selectedCategoria ? p.categoria === selectedCategoria : true;
      const matchMarca = selectedMarca ? p.marca === selectedMarca : true;
      const matchStock = onlyInStock ? p.estoque > 0 : true;
      return matchSearch && matchCategoria && matchMarca && matchStock;
    });

    // Sorting
    switch (sortBy) {
      case 'menor_preco':
        result.sort((a, b) => parseFloat(a.preco) - parseFloat(b.preco));
        break;
      case 'maior_preco':
        result.sort((a, b) => parseFloat(b.preco) - parseFloat(a.preco));
        break;
      case 'novidades':
      default:
        // Mantém ordem original ou pode adicionar timestamp se disponível
        break;
    }

    return result;
  }, [lojaProdutos, searchTerm, selectedCategoria, selectedMarca, onlyInStock, sortBy]);

  // Cart Handlers
  const addToCart = (produto) => {
    if (produto.estoque <= 0) return;
    
    setCart(prev => {
      const exists = prev.find(item => item.produto.id === produto.id);
      if (exists) {
        return prev.map(item => item.produto.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item);
      }
      return [...prev, { produto, quantidade: 1 }];
    });
    
    setToast({ 
      show: true, 
      message: 'Adicionado à sacola', 
      productName: produto.nome_produto 
    });
    setTimeout(() => setToast({ show: false, message: '', productName: '' }), 4000);
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.produto.id === id) {
         return { ...item, quantidade: Math.max(1, item.quantidade + delta) };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.produto.id !== id));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    let message = `Olá *${revendedor?.nome}*!\nEstou reservando os seguintes itens do seu catálogo:\n\n`;
    cart.forEach(item => {
        message += `✅ ${item.quantidade}x *${item.produto.nome_produto}*\n`;
        message += `   Subtotal: R$ ${(parseFloat(item.produto.preco) * item.quantidade).toFixed(2)}\n\n`;
    });
    message += `💰 *Total da Reserva: R$ ${cartTotal.toFixed(2)}*\n\nComo combinamos a entrega?`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/55${revendedor?.whatsapp}?text=${encodedMessage}`, '_blank');
  };

  const cartTotal = cart.reduce((acc, item) => acc + (parseFloat(item.produto.preco) * item.quantidade), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantidade, 0);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategoria('');
    setSelectedMarca('');
    setOnlyInStock(false);
    setSortBy('novidades');
  };

  if (errorNotFound) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white px-6 text-center">
        <Package size={80} className="text-gray-100 mb-6" />
        <h1 className="text-2xl font-black text-gray-900 mb-2 font-outfit">Opa! Página não encontrada.</h1>
        <p className="text-gray-500 mb-8 max-w-sm font-medium">Verifique se o link está correto ou entre em contato com sua consultora.</p>
        <button onClick={() => window.location.href = '/'} className="btn btn-primary px-10 font-black">Ir para o Início</button>
      </div>
    );
  }

  return (
    <div className="bg-[#fdfeff] min-h-screen font-inter text-gray-900 selection:bg-pink-100 selection:text-pink-600 overflow-x-hidden">
      
      {/* --- HEADER PREMIUM --- */}
      <header className="sticky top-0 z-[60] transition-all duration-300">
        <div className="absolute inset-0 bg-white/70 backdrop-blur-2xl border-b border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.02)]"></div>
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-20 lg:h-24 flex items-center justify-between gap-3 lg:gap-6 relative z-10">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2 lg:gap-4 shrink-0 cursor-pointer group" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
             <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-[20px] flex items-center justify-center text-white shadow-xl shadow-pink-200 group-hover:rotate-6 transition-transform">
               <ShoppingBag size={28} className="stroke-[2.5px]" />
             </div>
             <div>
               <h1 className="font-outfit font-black text-xl lg:text-2xl leading-none tracking-tight text-gray-900 uppercase">
                 {revendedor?.nome?.split(' ')[0] || 'Loja'}<span className="text-pink-600">.</span>
               </h1>
               <div className="flex items-center gap-2 mt-1.5">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                 <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Vitrine Online</span>
               </div>
             </div>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-2xl relative group">
            <input 
              type="text" 
              placeholder="O que você está procurando hoje?" 
              className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:ring-4 focus:ring-pink-500/5 focus:bg-white focus:border-pink-100 transition-all outline-none placeholder:text-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-pink-500 transition-colors" size={20}/>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-400 rounded-lg transition-all"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-2xl transition-all active:scale-90 md:hidden" onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}>
              <Search size={24} />
            </button>
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-4 bg-gray-900 text-white rounded-[22px] hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.1)] group flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-pink-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <ShoppingBag size={22} className="stroke-[2.5px]" />
              <span className="hidden lg:block font-black text-xs uppercase tracking-widest">Minha Sacola</span>
              {cartCount > 0 && (
                <div className="bg-pink-500 text-white text-[10px] font-black min-w-[20px] h-5 px-1 flex items-center justify-center rounded-lg border-2 border-gray-900">
                  {cartCount}
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-12 lg:pt-20 pb-16 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-20 right-[-10%] w-[40%] h-[40%] bg-pink-100/30 rounded-full blur-[120px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-[-10%] w-[30%] h-[30%] bg-purple-100/30 rounded-full blur-[100px] -z-10"></div>

        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 bg-pink-50 px-4 py-2 rounded-full text-pink-600 border border-pink-100">
                 <Sparkles size={16} />
                 <span className="text-[11px] font-black uppercase tracking-widest leading-none">Catálogo Exclusivo</span>
              </div>
              <h2 className="text-4xl lg:text-7xl font-black text-gray-900 font-outfit leading-[0.95] tracking-tight">
                Beleza que <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Transforma.</span>
              </h2>
              <p className="text-gray-500 font-bold text-base lg:text-xl max-w-xl opacity-80 leading-relaxed">
                Explore nossa curadoria especial de perfumes, maquiagens e cuidados pessoais feita pela sua consultora VIP.
              </p>
            </div>
            
            {/* Owner Info Card */}
            <div className="flex items-center gap-5 bg-white p-5 rounded-[32px] shadow-[0_10px_50px_rgba(0,0,0,0.03)] border border-gray-50 group hover:-translate-y-2 transition-transform duration-500">
               <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-200 to-purple-200 border-2 border-white shadow-lg">
                 {revendedor?.foto_perfil ? (
                    <img src={revendedor.foto_perfil} alt={revendedor.nome} className="w-full h-full object-cover" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-pink-400 bg-pink-50">
                      <User size={32} />
                    </div>
                 )}
               </div>
               <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Consultora Oficial</p>
                 <h4 className="font-outfit font-black text-lg text-gray-900 leading-none">{revendedor?.nome || 'Consultora VIP'}</h4>
                 <div className="flex items-center gap-2 mt-2">
                    <button className="text-[11px] font-black text-pink-600 hover:text-pink-700 underline underline-offset-4 tracking-tighter">Ver Perfil</button>
                    <span className="text-gray-200">•</span>
                    <div className="flex items-center gap-1 text-[11px] font-black text-gray-400">
                       <MapPin size={12} className="text-pink-400" />
                       <span>Brasil</span>
                    </div>
                 </div>
               </div>
            </div>
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-3 mt-16 overflow-x-auto pb-6 no-scrollbar mask-fade">
            <button 
              onClick={() => setSelectedCategoria('')}
              className={`px-8 py-4 rounded-[22px] text-sm font-black transition-all border shrink-0 uppercase tracking-widest ${selectedCategoria === '' ? 'bg-gray-900 border-gray-900 text-white shadow-2xl shadow-gray-200' : 'bg-white border-gray-100 text-gray-400 hover:border-pink-200 hover:text-pink-600'}`}
            >
              Todos os Produtos
            </button>
            {categorias.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategoria(cat.id)}
                className={`px-8 py-4 rounded-[22px] text-sm font-black transition-all border shrink-0 uppercase tracking-widest flex items-center gap-3 ${selectedCategoria === cat.id ? 'bg-pink-600 border-pink-600 text-white shadow-2xl shadow-pink-100' : 'bg-white border-gray-100 text-gray-400 hover:border-pink-200 hover:text-pink-600'}`}
              >
                {cat.nome_categoria}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* --- CONTENT SECTION --- */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* SIDEBAR FILTERS (DESKTOP) */}
          <aside className="hidden lg:block w-72 shrink-0">
             <div className="sticky top-32 space-y-12">
               
               {/* Marcas */}
               <div className="space-y-6">
                 <div className="flex items-center justify-between">
                   <h4 className="font-outfit font-black text-gray-900 text-sm uppercase tracking-[0.1em]">Filtrar Marcas</h4>
                   {selectedMarca && <button onClick={() => setSelectedMarca('')} className="text-[10px] font-black text-pink-500 hover:underline">LIMPAR</button>}
                 </div>
                 <div className="grid grid-cols-1 gap-3">
                   {marcas.map(m => (
                     <button 
                       key={m.id}
                       onClick={() => setSelectedMarca(selectedMarca === m.id ? '' : m.id)}
                       className={`group flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${selectedMarca === m.id ? 'bg-pink-50 border-pink-200' : 'bg-white border-gray-100 hover:border-pink-100'}`}
                     >
                       <span className={`text-sm font-bold ${selectedMarca === m.id ? 'text-pink-600' : 'text-gray-500'}`}>{m.nome_marca}</span>
                       <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selectedMarca === m.id ? 'bg-pink-600 border-pink-600 shadow-lg shadow-pink-100' : 'border-gray-200'}`}>
                          {selectedMarca === m.id && <CheckCircle size={12} className="text-white" />}
                       </div>
                     </button>
                   ))}
                 </div>
               </div>

               {/* Ordenação */}
               <div className="space-y-6">
                 <h4 className="font-outfit font-black text-gray-900 text-sm uppercase tracking-[0.1em]">Ordenar Por</h4>
                 <div className="space-y-2">
                   {[
                     {id:'novidades', label: 'Mais Recentes'},
                     {id:'menor_preco', label: 'Menor Preço'},
                     {id:'maior_preco', label: 'Maior Preço'}
                   ].map(opt => (
                     <button 
                       key={opt.id}
                       onClick={() => setSortBy(opt.id)}
                       className={`flex items-center gap-3 w-full p-4 rounded-2xl transition-all ${sortBy === opt.id ? 'bg-gray-900 text-white shadow-xl' : 'text-gray-500 hover:bg-gray-100'}`}
                     >
                       <div className={`w-1.5 h-1.5 rounded-full ${sortBy === opt.id ? 'bg-pink-400' : 'bg-transparent'}`} />
                       <span className="text-sm font-bold">{opt.label}</span>
                     </button>
                   ))}
                 </div>
               </div>

               {/* Adicionais */}
               <div className="pt-8 border-t border-gray-100">
                  <label className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl cursor-pointer group">
                     <span className="text-sm font-bold text-gray-700">Apenas em estoque</span>
                     <div className="relative">
                        <input type="checkbox" checked={onlyInStock} onChange={() => setOnlyInStock(!onlyInStock)} className="sr-only p-2" />
                        <div className={`w-12 h-6 rounded-full transition-all ${onlyInStock ? 'bg-pink-500' : 'bg-gray-300'}`}>
                           <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${onlyInStock ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                     </div>
                  </label>
               </div>
             </div>
          </aside>

          {/* Mobile Filter Button Bar */}
          <div className="lg:hidden flex items-center gap-3 mb-4 sticky top-24 z-50 p-2 bg-[#fdfeff]/80 backdrop-blur-xl rounded-[28px] border border-white shadow-[0_15px_30px_rgba(0,0,0,0.04)]">
            <button 
              onClick={() => setIsFilterSheetOpen(true)}
              className="flex-1 flex items-center justify-center gap-3 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
            >
              <Filter size={18} /> Filtros { (selectedMarca || selectedCategoria) && "•" }
            </button>
            <div className="relative">
              <select 
                className="appearance-none bg-white border-2 border-gray-100 rounded-2xl py-4 pl-6 pr-12 text-xs font-black uppercase tracking-widest outline-none focus:border-pink-500 transition-all font-outfit"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="novidades">Novidades</option>
                <option value="menor_preco">Menor R$</option>
                <option value="maior_preco">Maior R$</option>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16}/>
            </div>
          </div>

          {/* PRODUCT GRID */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-10">
                {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : filteredSortedProdutos.length > 0 ? (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-10">
                {filteredSortedProdutos.map((produto, idx) => {
                  const marcaObj = marcas.find(m => m.id === produto.marca);
                  return (
                    <div 
                      key={produto.id} 
                      className="group flex flex-col bg-white rounded-[24px] lg:rounded-[40px] p-2 lg:p-2.5 pb-5 lg:pb-7 transition-all duration-500 hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] border border-transparent hover:border-pink-100 relative animate-fade-in-up"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      
                      {/* Image Container */}
                      <div className="relative aspect-square rounded-[20px] lg:rounded-[32px] overflow-hidden bg-gray-50 border border-gray-50 flex items-center justify-center">
                        <img 
                          src={produto.array_fotos?.[0] || 'https://via.placeholder.com/600'} 
                          alt={produto.nome_produto} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                        
                        {/* Overlay Controls */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                           <button className="p-3 bg-white/90 backdrop-blur-md rounded-2xl text-gray-900 hover:text-pink-500 hover:scale-110 transition-all shadow-xl"><Heart size={18}/></button>
                           <button className="p-3 bg-white/90 backdrop-blur-md rounded-2xl text-gray-900 hover:text-pink-500 hover:scale-110 transition-all shadow-xl"><Share2 size={18}/></button>
                        </div>

                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-[80%]">
                           {produto.destaque && (
                             <div className="bg-gray-900 text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                               <Star size={10} fill="currentColor" className="text-yellow-400" />
                               EXCLUSIVO
                             </div>
                           )}
                           {produto.estoque <= 0 ? (
                             <div className="bg-white/90 backdrop-blur-md text-red-500 text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg">ESGOTADO</div>
                           ) : produto.pronta_entrega && (
                             <div className="bg-green-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg">PRONTA ENTREGA</div>
                           )}
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="mt-6 px-4 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{marcaObj?.nome_marca || 'Beleza'}</span>
                        </div>
                        
                        <h3 className="text-base lg:text-lg font-black text-gray-900 leading-tight line-clamp-2 min-h-[3rem] group-hover:text-pink-600 transition-colors font-outfit">
                          {produto.nome_produto}
                        </h3>

                        <div className="mt-auto pt-4 lg:pt-6 flex flex-col gap-3 lg:gap-5">
                          <div className="flex flex-col xl:flex-row xl:items-end gap-0.5 xl:gap-1.5">
                             <span className="text-xl lg:text-3xl font-black text-gray-900 tracking-tighter">R$ {parseFloat(produto.preco).toFixed(2)}</span>
                             {produto.preco_original && (
                               <span className="text-xs lg:text-sm font-bold text-gray-300 line-through mb-0 xl:mb-1">R$ {produto.preco_original}</span>
                             )}
                          </div>
                          
                          <button 
                            onClick={() => addToCart(produto)}
                            disabled={produto.estoque <= 0}
                            className={`w-full py-3 lg:py-5 rounded-xl lg:rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 lg:gap-3 shadow-xl ${
                              produto.estoque > 0 
                              ? 'btn-primary text-white shadow-pink-100' 
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-100 opacity-60'
                            }`}
                          >
                            {produto.estoque > 0 ? (
                              <>
                                <span>Adicionar à Sacola</span>
                                <Plus size={16} className="stroke-[3px]" />
                              </>
                            ) : 'Indisponível no momento'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState onClear={resetFilters} />
            )}
          </main>
        </div>
      </section>

      {/* --- BENEFITS GRID (LUSH DESIGN) --- */}
      <section className="bg-gray-900 py-24 lg:py-32 mt-20 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-[40%] h-[100%] bg-pink-500/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[30%] h-[100%] bg-purple-500/10 rounded-full blur-[150px]"></div>

        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl lg:text-5xl font-black text-white font-outfit mb-16 tracking-tight">Vantagens de comprar <br className="md:hidden"/> <span className="text-pink-500">conosco.</span></h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: MessageCircle, title: 'Atendimento VIP', desc: 'Fale direto com sua consultora pelo WhatsApp.' },
              { icon: Truck, title: 'Pronta Entrega', desc: 'Receba seus favoritos sem esperar o prazo de fábrica.' },
              { icon: ShieldCheck, title: 'Garantia Total', desc: 'Produtos 100% originais e lacrados de fábrica.' },
              { icon: Clock, title: 'Reserva Online', desc: 'Garanta seus itens favoritos com um toque.' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-[40px] flex flex-col items-center group hover:bg-white/10 transition-all duration-500">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-[24px] flex items-center justify-center mb-8 shadow-xl shadow-pink-900 group-hover:scale-110 group-hover:rotate-12 transition-all">
                   <item.icon size={30} className="stroke-[2.5px]" />
                </div>
                <h4 className="font-outfit font-black text-xl text-white mb-4 tracking-tight">{item.title}</h4>
                <p className="text-sm font-medium text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white pt-32 pb-16 relative">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
            
            <div className="lg:col-span-5 space-y-10">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-pink-600 rounded-2xl flex items-center justify-center text-white"><ShoppingBag size={24}/></div>
                 <div className="font-outfit font-black text-3xl tracking-tighter uppercase">BELEZA<span className="text-pink-600">CONECTA.</span></div>
               </div>
               <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-md">
                 Transformando a maneira como você compra beleza com suas consultoras favoritas. Digital, prático e humano.
               </p>
               <div className="flex gap-4">
                 <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all"><ExternalLink size={20} className="text-gray-400"/></button>
                 <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all"><Share2 size={20} className="text-gray-400"/></button>
               </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
               <div className="space-y-8">
                 <h5 className="font-black text-gray-900 text-sm uppercase tracking-widest">Suporte</h5>
                 <ul className="space-y-4 text-sm font-bold text-gray-400">
                   <li><a href="#" className="hover:text-pink-600 transition-colors">Como Comprar</a></li>
                   <li><a href="#" className="hover:text-pink-600 transition-colors">Segurança</a></li>
                   <li><a href="#" className="hover:text-pink-600 transition-colors">Dúvidas Frequentes</a></li>
                 </ul>
               </div>
               <div className="space-y-8">
                 <h5 className="font-black text-gray-900 text-sm uppercase tracking-widest">Loja</h5>
                 <ul className="space-y-4 text-sm font-bold text-gray-400">
                   <li><a href="#" className="hover:text-pink-600 transition-colors">Categorias</a></li>
                   <li><a href="#" className="hover:text-pink-600 transition-colors">Marcas</a></li>
                   <li><a href="#" className="hover:text-pink-600 transition-colors">Mais Vendidos</a></li>
                 </ul>
               </div>
               <div className="space-y-8 col-span-2 md:col-span-1">
                 <h5 className="font-black text-gray-900 text-sm uppercase tracking-widest">Pagamentos</h5>
                 <div className="flex flex-wrap gap-2 opacity-50">
                    <div className="px-3 py-1.5 bg-gray-50 border rounded-lg text-[10px] font-black">PIX</div>
                    <div className="px-3 py-1.5 bg-gray-50 border rounded-lg text-[10px] font-black">CARTÃO</div>
                    <div className="px-3 py-1.5 bg-gray-50 border rounded-lg text-[10px] font-black">BOLETO</div>
                 </div>
               </div>
            </div>
          </div>

          <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[11px] font-black text-gray-300 uppercase tracking-widest">&copy; 2026 BELEZA CONECTA. Todos os direitos reservados.</p>
            <div className="flex items-center gap-12">
               <a href="#" className="text-[11px] font-black text-gray-300 hover:text-pink-500 transition-all uppercase tracking-widest">Privacidade</a>
               <a href="#" className="text-[11px] font-black text-gray-300 hover:text-pink-500 transition-all uppercase tracking-widest">Termos</a>
            </div>
          </div>
        </div>
      </footer>

      {/* --- UI OVERLAYS --- */}

      {/* Modern Toast Feedback */}
      {toast.show && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:right-10 md:translate-x-0 w-[calc(100%-2rem)] md:w-auto z-[200] animate-bounce-in">
          <div className="bg-gray-900 text-white p-5 rounded-[28px] shadow-[0_30px_60px_rgba(0,0,0,0.3)] flex items-center gap-5 border border-white/10 backdrop-blur-xl">
             <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-green-900/40">
                <CheckCircle size={28} className="stroke-[3px]" />
             </div>
             <div className="flex-1 pr-6">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Sacola Atualizada!</p>
                <p className="text-sm font-black line-clamp-1">{toast.productName}</p>
             </div>
             <button 
               onClick={() => { setIsCartOpen(true); setToast({...toast, show:false}); }}
               className="btn btn-primary px-6 py-3 text-xs font-black shadow-pink-900/40 whitespace-nowrap"
             >
               VER SACOLA
             </button>
          </div>
        </div>
      )}

      {/* Cart Drawer (Lush Redesign) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setIsCartOpen(false)} />
          <div className="w-full md:max-w-md lg:max-w-lg bg-white h-full relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.2)] flex flex-col animate-slide-left border-l border-white/40">
            
            <div className="px-8 py-10 flex items-center justify-between border-b border-gray-50">
              <div>
                <h2 className="text-3xl font-black text-gray-900 font-outfit tracking-tight">Minha Sacola</h2>
                <p className="text-xs font-black text-gray-300 uppercase tracking-widest mt-1.5">{cartCount} Itens Adicionados</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-gray-900"><X size={24}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                   <div className="w-32 h-32 bg-gray-100 rounded-[48px] flex items-center justify-center text-gray-400 mb-8 border-2 border-dashed border-gray-200">
                      <ShoppingBag size={50} className="stroke-[1.5px]" />
                   </div>
                   <p className="font-outfit font-black text-2xl text-gray-900">Sua sacola <br/> está vazia</p>
                   <p className="text-sm font-bold text-gray-400 mt-3">Não deixe seus favoritos <br/> escaparem hoje!</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.produto.id} className="flex gap-6 group relative">
                    <div className="w-28 h-28 shrink-0 relative">
                       <img 
                          src={item.produto.array_fotos?.[0] || 'https://via.placeholder.com/200'} 
                          alt={item.produto.name} 
                          className="w-full h-full object-cover rounded-[24px] border border-gray-50 shadow-sm"
                        />
                        <button 
                          onClick={() => removeFromCart(item.produto.id)} 
                          className="absolute -top-3 -left-3 w-8 h-8 bg-white text-gray-300 hover:text-red-500 rounded-full shadow-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-gray-100"
                        >
                          <Trash2 size={14}/>
                        </button>
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h4 className="text-sm font-black text-gray-900 leading-tight line-clamp-2 -mt-1">{item.produto.nome_produto}</h4>
                        <p className="text-pink-600 font-black text-lg mt-1 tracking-tighter">R$ {parseFloat(item.produto.preco).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-5">
                        <div className="flex items-center gap-5 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                          <button onClick={() => updateQuantity(item.produto.id, -1)} className="text-gray-400 hover:text-pink-600"><Minus size={14} /></button>
                          <span className="text-sm font-black w-4 text-center">{item.quantidade}</span>
                          <button onClick={() => updateQuantity(item.produto.id, 1)} className="text-gray-400 hover:text-pink-600"><Plus size={14} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-8 border-t border-gray-50 bg-gray-50/20 space-y-8 rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.02)]">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-gray-400 text-[10px] font-black uppercase tracking-widest">
                    <span>Subtotal Estimado</span>
                    <span>R$ {cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-gray-900 font-black font-outfit text-xl mb-1">Total da Reserva</span>
                    <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 leading-none tracking-tighter">R$ {cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button 
                    onClick={handleCheckout}
                    className="w-full btn-primary text-white font-black py-6 rounded-[28px] shadow-2xl shadow-pink-200 flex items-center justify-center gap-3 active:scale-95 transition-all text-sm uppercase tracking-widest"
                  >
                    <MessageCircle size={24} className="stroke-[2.5px]" /> 
                    <span>Falar no WhatsApp</span>
                  </button>
                  <button onClick={() => setIsCartOpen(false)} className="w-full py-2 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] hover:text-gray-500 transition-colors">Continuar Escolhendo</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Filter Sheet (Lush Design) */}
      {isFilterSheetOpen && (
        <div className="fixed inset-0 z-[100] flex items-end">
           <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setIsFilterSheetOpen(false)} />
           <div className="w-full bg-white rounded-t-[48px] relative z-10 p-10 pt-6 animate-slide-up max-h-[90vh] overflow-y-auto no-scrollbar shadow-[0_-30px_100px_rgba(0,0,0,0.2)] border-t border-white/50">
              <div className="w-16 h-1.5 bg-gray-100 rounded-full mx-auto mb-10" />
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-3xl font-black font-outfit">Explorar Categorias</h3>
                <button onClick={() => setIsFilterSheetOpen(false)} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl text-gray-400"><X size={20}/></button>
              </div>

              <div className="space-y-12">
                <div>
                  <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-6">Categorias Populares</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {categorias.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => { setSelectedCategoria(cat.id); }}
                        className={`px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest border-2 transition-all ${selectedCategoria === cat.id ? 'bg-pink-500 border-pink-500 text-white shadow-xl shadow-pink-200' : 'bg-white border-gray-100 text-gray-400'}`}
                      >
                        {cat.nome_categoria}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                   <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-6">Marcas de Luxo</h4>
                   <div className="grid grid-cols-2 gap-3">
                    {marcas.map(m => (
                      <button 
                         key={m.id}
                         onClick={() => setSelectedMarca(selectedMarca === m.id ? '' : m.id)}
                         className={`py-4 px-6 rounded-2xl text-[11px] font-black uppercase tracking-widest border-2 text-center transition-all ${selectedMarca === m.id ? 'bg-purple-600 border-purple-600 text-white shadow-xl shadow-purple-200' : 'bg-white border-gray-100 text-gray-400'}`}
                      >
                        {m.nome_marca}
                      </button>
                    ))}
                   </div>
                </div>

                <div className="flex items-center justify-between py-8 border-t border-gray-100">
                    <div>
                       <span className="font-outfit font-black text-gray-900 block">Pronta Entrega</span>
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Apenas produtos em estoque</span>
                    </div>
                    <button 
                      onClick={() => setOnlyInStock(!onlyInStock)}
                      className={`w-16 h-9 rounded-full transition-all relative p-1.5 ${onlyInStock ? 'bg-green-500 shadow-xl shadow-green-100' : 'bg-gray-100'}`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-all ${onlyInStock ? 'translate-x-7' : 'translate-x-0'}`} />
                    </button>
                </div>
              </div>

              <div className="sticky bottom-0 pt-6 pb-2 mt-12 bg-white">
                <button 
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="w-full btn-primary text-white font-black py-6 rounded-[32px] shadow-2xl uppercase tracking-[0.2em] text-xs active:scale-95 transition-all"
                >
                  Ver Resultados
                </button>
              </div>
           </div>
        </div>
      )}

      {/* --- EXTRA PREMIUM STYLES --- */}
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --pink-main: #ec4899;
          --purple-main: #8b5cf6;
        }

        .font-outfit { font-family: 'Outfit', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }

        .btn-primary {
          background: linear-gradient(135deg, var(--pink-main), var(--purple-main));
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-primary:hover {
          filter: brightness(1.1);
          transform: translateY(-2px);
        }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .mask-fade {
          mask-image: linear-gradient(to right, black 85%, transparent 100%);
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up { 
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
          opacity: 0;
        }

        @keyframes slideLeft { 
          from { transform: translateX(100%); opacity: 0; } 
          to { transform: translateX(0); opacity: 1; } 
        }
        .animate-slide-left { animation: slideLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        @keyframes slideUp { 
          from { transform: translateY(100%); } 
          to { transform: translateY(0); } 
        }
        .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        @keyframes bounceIn {
          0% { transform: scale(0.8) translate(-50%, 40px); opacity: 0; }
          60% { transform: scale(1.05) translate(-50%, -5px); opacity: 1; }
          100% { transform: scale(1) translate(-50%, 0); opacity: 1; }
        }
        @media (min-width: 768px) {
          @keyframes bounceIn {
            0% { transform: scale(0.8) translateY(40px); opacity: 0; }
            60% { transform: scale(1.05) translateY(-5px); opacity: 1; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
        }
        .animate-bounce-in { animation: bounceIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .cubic-bezier { transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); }
      `}} />
    </div>
  );
}
