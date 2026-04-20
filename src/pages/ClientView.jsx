import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ShoppingBag, Search, Filter, Star, Info, 
  ChevronRight, X, Minus, Plus, MessageSquare, 
  Check, ArrowRight, Heart, Share2, MapPin
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { categorias as objCategorias, marcas as objMarcas } from '../data/mockData';

export default function ClientView() {
  const { slug } = useParams();
  const [revendedor, setRevendedor] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI State
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const qRev = query(collection(db, 'revendedores'), where("slug_url", "==", slug));
        const snapRev = await getDocs(qRev);
        
        if (snapRev.empty) {
          setError("Consultora não encontrada.");
          setLoading(false);
          return;
        }

        const revData = { id: snapRev.docs[0].id, ...snapRev.docs[0].data() };
        setRevendedor(revData);

        const qProd = query(collection(db, 'produtos'), where("revendedor_id", "==", snapRev.docs[0].id));
        const snapProd = await getDocs(qProd);
        const prodData = snapProd.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProdutos(prodData);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  const filteredProdutos = useMemo(() => {
    return produtos.filter(p => {
      const matchCat = activeCategory === 'all' || p.categoria === activeCategory;
      const matchSearch = p.nome_produto.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [produtos, activeCategory, searchTerm]);

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    // Notification logic could go here
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.preco * item.qty), 0);

  const sendWhatsApp = () => {
    const message = `Olá ${revendedor.nome}! Gostaria de fazer um pedido:\n\n` +
      cart.map(item => `• ${item.qty}x ${item.nome_produto} (R$ ${item.preco.toFixed(2)})`).join('\n') +
      `\n\n*Total: R$ ${cartTotal.toFixed(2)}*\n\nPor favor, me confirme a disponibilidade.`;
    
    const phone = revendedor.whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-pink-50/20">
        <div className="w-16 h-16 border-4 border-white border-t-pink-500 rounded-full animate-spin mb-6 shadow-xl" />
        <h2 className="text-xl font-black text-gray-900 font-outfit uppercase tracking-tighter">Entrando na Loja...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white p-10 text-center space-y-8">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[40px] flex items-center justify-center shadow-xl mb-4">
           <Info size={50} />
        </div>
        <h1 className="text-3xl font-black text-gray-900 font-outfit">{error}</h1>
        <p className="text-gray-400 font-medium max-w-sm">Verifique o link enviado pela sua consultora ou tente novamente mais tarde.</p>
        <button onClick={() => window.location.reload()} className="px-10 py-5 bg-pink-500 text-white rounded-3xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-all">Tentar Agora</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFEFF] font-sans text-gray-900 relative">
      
      {/* --- NAVBAR CLIENTE --- */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'py-3' : 'py-5 lg:py-8'}`}>
        <div className={`absolute inset-0 transition-all duration-500 ${scrolled ? 'bg-white/90 backdrop-blur-3xl border-b border-gray-100 shadow-sm' : 'bg-transparent'}`}></div>
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-pink-100 group-hover:rotate-6 transition-transform">
              <ShoppingBag size={22} className="stroke-[2.5px]" />
            </div>
            <span className="font-outfit font-black text-xl tracking-tighter uppercase text-gray-900">Beleza<span className="text-pink-600">Conecta.</span></span>
          </div>

          <div className="flex items-center gap-4">
            <button 
               onClick={() => setIsCartOpen(true)}
               className="relative p-4 bg-white border border-gray-100 text-gray-900 rounded-2xl shadow-sm hover:shadow-xl transition-all active:scale-90"
            >
              <ShoppingBag size={22} className="stroke-[2.5px]" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-pink-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-bounce-subtle shadow-lg">{cart.length}</span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* --- HEADER CONSULTORA (FOLD 1) --- */}
      <header className="pt-32 lg:pt-48 pb-20 px-6 sm:px-12 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[50%] h-[70%] bg-pink-100/40 rounded-full blur-[140px] -z-10 animate-pulse"></div>
         <div className="absolute bottom-0 left-0 w-[40%] h-[60%] bg-purple-100/30 rounded-full blur-[120px] -z-10"></div>

         <div className="max-w-[1400px] mx-auto">
            <div className="bg-white/60 backdrop-blur-3xl border border-white/20 p-8 lg:p-16 rounded-[60px] shadow-2xl flex flex-col lg:flex-row items-center gap-12 lg:gap-20 transition-all hover:scale-[1.005]">
               <div className="relative group shrink-0 scale-110 lg:scale-100">
                  <div className="absolute inset-0 bg-pink-500/10 rounded-[48px] blur-3xl group-hover:bg-pink-500/20 transition-all duration-700"></div>
                  <img 
                    src={revendedor.foto_url || `https://api.dicebear.com/7.x/initials/svg?seed=${revendedor.nome}`} 
                    className="w-40 h-40 lg:w-48 lg:h-48 rounded-[48px] border-4 border-white shadow-2xl relative z-10 object-cover group-hover:rotate-3 transition-transform duration-500" 
                  />
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-pink-500 text-white rounded-2xl flex items-center justify-center shadow-2xl z-20 border-4 border-white animate-float">
                     <Star size={24} fill="white" />
                  </div>
               </div>

               <div className="flex-1 text-center lg:text-left space-y-6 lg:space-y-8">
                  <div className="space-y-3">
                     <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-pink-50 text-pink-600 rounded-full border border-pink-100">
                        <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Consultora Parceira</span>
                     </div>
                     <h1 className="text-5xl lg:text-7xl font-black font-outfit tracking-tight text-gray-900 leading-none">
                        {revendedor.nome}
                     </h1>
                     <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6 pt-2">
                        <div className="flex items-center gap-2 text-gray-400 font-black text-xs uppercase tracking-widest">
                           <MapPin size={16} className="text-pink-500"/> Porto Alegre, BR
                        </div>
                        <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                        <div className="flex items-center gap-2 text-gray-400 font-black text-xs uppercase tracking-widest">
                           <MessageSquare size={16} className="text-green-500"/> Atendimento via WhatsApp
                        </div>
                     </div>
                  </div>

                  <p className="text-gray-500 text-xl lg:text-2xl font-medium leading-relaxed max-w-3xl italic">
                     "{revendedor.biografia || 'Seja bem-vinda à minha vitrine digital! Escolha seus produtos favoritos e me chame no WhatsApp para combinarmos a entrega.'}"
                  </p>

                  <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                     <div className="px-6 py-3 bg-pink-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-pink-100">Pronta Entrega</div>
                     <div className="px-6 py-3 bg-blue-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-100">Produtos Originais</div>
                  </div>
               </div>
            </div>
         </div>
      </header>

      {/* --- FILTERS & SEARCH (FOLD 2) --- */}
      <section className="sticky top-20 lg:top-28 z-40 px-6 sm:px-12 py-4">
         <div className="max-w-[1400px] mx-auto bg-white/80 backdrop-blur-2xl border border-gray-100/50 p-4 lg:p-6 rounded-[36px] shadow-2xl shadow-gray-200/40 flex flex-col lg:flex-row items-center gap-6">
            <div className="flex items-center gap-4 w-full flex-1">
               <div className="relative flex-1 group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-pink-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="O que você está procurando hoje?"
                    className="w-full bg-gray-50 border-transparent rounded-3xl py-5 pl-16 pr-8 text-sm lg:text-base font-bold outline-none focus:ring-8 focus:ring-pink-500/5 focus:bg-white transition-all shadow-inner"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
            </div>

            <div className="w-full lg:w-auto h-px lg:w-px lg:h-12 bg-gray-100"></div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar w-full lg:w-auto pb-4 lg:pb-0 px-2 lg:px-0">
               <button 
                 onClick={() => setActiveCategory('all')}
                 className={`px-8 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${activeCategory === 'all' ? 'bg-gray-900 text-white shadow-xl scale-105' : 'bg-gray-50 text-gray-400 hover:text-gray-900'}`}
               >
                 Todos
               </button>
               {objCategorias.map(cat => (
                 <button 
                   key={cat.id}
                   onClick={() => setActiveCategory(cat.id)}
                   className={`px-8 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${activeCategory === cat.id ? 'bg-pink-500 text-white shadow-xl scale-105' : 'bg-gray-50 text-gray-400 hover:text-gray-900'}`}
                 >
                   {cat.nome_categoria}
                 </button>
               ))}
            </div>
         </div>
      </section>

      {/* --- PRODUCT GRID (FOLD 3) --- */}
      <main className="max-w-[1400px] mx-auto px-6 sm:px-12 py-20 pb-40">
         
         <div className="flex items-center justify-between mb-16 px-4">
            <h2 className="text-3xl lg:text-4xl font-black font-outfit tracking-tight">Vitrines Disponíveis <span className="text-gray-300 ml-2">({filteredProdutos.length})</span></h2>
            <div className="hidden sm:flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-gray-400 italic">
               Role para baixo para ver mais <ArrowRight size={14} className="animate-bounce-x" />
            </div>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 lg:gap-12">
            {filteredProdutos.map(produto => (
               <div key={produto.id} className="group flex flex-col bg-white rounded-[48px] border border-gray-50 shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 overflow-hidden relative">
                  {/* Badge */}
                  <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                     {produto.pronta_entrega && (
                        <span className="px-4 py-2 bg-white/90 backdrop-blur-md text-green-600 text-[10px] font-black rounded-xl shadow-lg border border-green-50 uppercase tracking-widest">Pronta Entrega</span>
                     )}
                     {produto.destaque && (
                        <span className="px-4 py-2 bg-pink-500 text-white text-[10px] font-black rounded-xl shadow-lg border border-pink-400 uppercase tracking-widest flex items-center gap-2">
                           <Star size={12} fill="white" /> Destaque
                        </span>
                     )}
                  </div>

                  {/* Like Button */}
                  <div className="absolute top-6 right-6 z-10">
                     <button className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-gray-300 hover:text-red-500 shadow-lg border border-gray-100 transition-all active:scale-90 group/btn">
                        <Heart size={20} className="transition-transform group-hover/btn:scale-110" />
                     </button>
                  </div>

                  {/* Image Area */}
                  <div className="aspect-[4/5] overflow-hidden relative cursor-zoom-in" onClick={() => { setSelectedProduct(produto); setIsProductModalOpen(true); }}>
                     <img 
                       src={produto.array_fotos?.[0] || 'https://via.placeholder.com/400'} 
                       className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110" 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-10">
                        <p className="text-white font-bold text-sm leading-relaxed translate-y-4 group-hover:translate-y-0 transition-transform duration-700">Ver detalhes do produto</p>
                     </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-10 flex-1 flex flex-col justify-between space-y-8">
                     <div className="space-y-3">
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">{objMarcas.find(m => m.id === produto.marca)?.nome_marca}</span>
                           <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                           <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{objCategorias.find(c => c.id === produto.categoria)?.nome_categoria}</span>
                        </div>
                        <h3 className="text-2xl font-black font-outfit tracking-tight text-gray-900 group-hover:text-pink-600 transition-colors leading-[1.2]">
                           {produto.nome_produto}
                        </h3>
                     </div>

                     <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="flex flex-col gap-0.5">
                           <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest leading-none">Investimento</span>
                           <span className="text-3xl font-black text-gray-900 tracking-tighter">R$ {produto.preco.toFixed(2)}</span>
                        </div>
                        <button 
                           onClick={() => addToCart(produto)}
                           className="w-16 h-16 bg-gray-900 text-white rounded-[24px] flex items-center justify-center shadow-2xl hover:bg-pink-600 hover:scale-110 active:scale-95 transition-all duration-300 group/cart"
                        >
                           <ShoppingBag size={24} className="group-hover/cart:rotate-12 transition-transform stroke-[2.5px]" />
                        </button>
                     </div>
                  </div>
               </div>
            ))}
         </div>

         {filteredProdutos.length === 0 && (
           <div className="py-40 text-center space-y-8 animate-fade-in">
              <div className="w-32 h-32 bg-gray-50 rounded-[50%] flex items-center justify-center mx-auto text-gray-200">
                 <Search size={64} />
              </div>
              <h3 className="text-3xl font-black font-outfit text-gray-900">Nenhum item encontrado</h3>
              <p className="text-gray-400 font-medium max-w-sm mx-auto text-lg leading-relaxed">Tente ajustar sua busca ou selecionar outra categoria para ver as novidades.</p>
              <button 
                onClick={() => { setActiveCategory('all'); setSearchTerm(''); }}
                className="px-10 py-5 bg-white border border-gray-100 rounded-3xl font-black text-sm uppercase tracking-widest shadow-sm hover:shadow-xl transition-all"
              >
                Limpar Filtros
              </button>
           </div>
         )}
      </main>

      {/* --- CART DRAWER (PREMIUM) --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] animate-fade-in">
           <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" onClick={() => setIsCartOpen(false)}></div>
           <div className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-[-30px_0_80px_rgba(0,0,0,0.1)] flex flex-col animate-slide-in-right">
              
              <div className="p-10 border-b border-gray-50 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center"><ShoppingBag size={24} /></div>
                    <div className="space-y-0.5">
                       <h3 className="text-2xl font-black font-outfit tracking-tighter">Sua Sacola</h3>
                       <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest">{cart.length} itens escolhidos</p>
                    </div>
                 </div>
                 <button onClick={() => setIsCartOpen(false)} className="p-4 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
                 {cart.map(item => (
                    <div key={item.id} className="flex gap-6 group">
                       <div className="w-24 h-24 rounded-[28px] overflow-hidden border border-gray-50 shrink-0">
                          <img src={item.array_fotos?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                       </div>
                       <div className="flex-1 space-y-4">
                          <div className="flex justify-between items-start">
                             <div className="space-y-1 py-1">
                                <h4 className="text-lg font-black text-gray-900 leading-tight">{item.nome_produto}</h4>
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Unitário R$ {item.preco.toFixed(2)}</p>
                             </div>
                             <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors"><X size={18} /></button>
                          </div>
                          
                          <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                             <div className="flex items-center bg-gray-50 rounded-xl px-2 py-1">
                                <button 
                                  onClick={() => updateQty(item.id, -1)}
                                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                  <Minus size={14} className="stroke-[3px]" />
                                </button>
                                <span className="w-10 text-center text-sm font-black text-gray-900">{item.qty}</span>
                                <button 
                                  onClick={() => updateQty(item.id, 1)}
                                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                  <Plus size={14} className="stroke-[3px]" />
                                </button>
                             </div>
                             <span className="text-xl font-black text-gray-900 tracking-tighter">R$ {(item.preco * item.qty).toFixed(2)}</span>
                          </div>
                       </div>
                    </div>
                 ))}

                 {cart.length === 0 && (
                   <div className="py-20 text-center space-y-6">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200"><ShoppingBag size={40} /></div>
                      <p className="text-gray-400 font-bold text-lg">Sua sacola está vazia.</p>
                      <button onClick={() => setIsCartOpen(false)} className="text-pink-500 font-black uppercase text-xs tracking-widest hover:underline">Continuar Comprando</button>
                   </div>
                 )}
              </div>

              <div className="p-10 bg-gray-50 border-t border-gray-100 space-y-8 bg-white">
                 <div className="flex items-end justify-between px-2">
                    <div className="space-y-1">
                       <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Total do Pedido</p>
                       <p className="text-gray-300 text-[10px] font-bold">Frete a combinar com a consultora</p>
                    </div>
                    <p className="text-4xl font-black text-gray-900 tracking-tighter leading-none">R$ {cartTotal.toFixed(2)}</p>
                 </div>

                 <button 
                   onClick={sendWhatsApp}
                   disabled={cart.length === 0}
                   className="w-full bg-green-500 text-white py-7 rounded-[32px] font-black text-lg shadow-3xl shadow-green-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale"
                 >
                    Enviar Pedido via WhatsApp <MessageSquare size={24} />
                 </button>
                 
                 <div className="flex items-center justify-center gap-3 px-10 text-center">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Pagamento Facilitado direto com a consultora</span>
                 </div>
              </div>

           </div>
        </div>
      )}

      {/* --- FOOTER CLIENTE --- */}
      <footer className="bg-gray-900 py-24 px-6 sm:px-12 text-center text-white overflow-hidden relative">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-600 to-pink-500"></div>
         <div className="max-w-[800px] mx-auto space-y-10 relative z-10">
            <div className="flex flex-col items-center gap-6">
               <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-pink-500 border border-white/10 shadow-2xl"><ShoppingBag size={32} /></div>
               <div>
                  <h4 className="font-outfit font-black text-2xl tracking-tighter uppercase">Beleza<span className="text-pink-500">Conecta.</span></h4>
                  <p className="text-white/40 font-black text-[10px] uppercase tracking-[0.3em] mt-1">Sua vitrine digital inteligente</p>
               </div>
            </div>
            <p className="text-white/60 font-medium text-lg leading-relaxed italic">
               "Nossa missão é conectar consultoras de beleza a seus clientes de forma moderna, rápida e apaixonante."
            </p>
            <div className="h-px bg-white/5 w-32 mx-auto"></div>
            <p className="text-white/20 font-black text-[10px] uppercase tracking-widest">© 2026 Plataforma Desenvolvida para Revendedoras de Sucesso.</p>
         </div>
      </footer>

    </div>
  );
}
