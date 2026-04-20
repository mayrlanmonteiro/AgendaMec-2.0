import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Mail, Lock, User, CheckCircle2, ChevronLeft, Sparkles } from 'lucide-react';
import { auth, googleProvider, db } from '../lib/firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Form state
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userRef = doc(db, 'revendedores', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        const baseSlug = (user.displayName || "loja").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
        
        await setDoc(userRef, {
          nome: user.displayName || 'Novo Revendedor',
          email: user.email,
          foto_perfil: user.photoURL || '',
          slug_url: baseSlug + '-' + Math.floor(Math.random() * 1000),
          biografia: 'Consultora de Beleza conectada.',
          telefone: '',
          whatsapp: '',
          data_cadastro: serverTimestamp()
        });
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || 'Erro ao entrar com Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, senha);
        navigate('/dashboard');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;
        const baseSlug = nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
        
        await setDoc(doc(db, 'revendedores', user.uid), {
          nome,
          email,
          foto_perfil: '',
          slug_url: baseSlug + '-' + Math.floor(Math.random() * 1000),
          biografia: 'Consultora de Beleza.',
          telefone: '',
          whatsapp: '',
          data_cadastro: serverTimestamp()
        });
        
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFEFF] selection:bg-pink-100 selection:text-pink-600 font-inter relative flex items-center justify-center p-6 overflow-hidden">
      
      {/* --- BACKGROUND AMBIANCE --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-pink-100/40 rounded-full blur-[160px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-100/30 rounded-full blur-[140px] animate-float"></div>
      </div>

      {/* --- AUTH CARD CONTAINER --- */}
      <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[60px] lg:rounded-[80px] shadow-[0_40px_140px_-40px_rgba(31,38,135,0.15)] overflow-hidden relative z-10 border border-white animate-modal-pop">
        
        {/* LEFT SIDE: PREMIUM BRANDING FOLD */}
        <div className="relative hidden lg:flex flex-col justify-between p-20 bg-gray-900 group">
          {/* Animated Background Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-pink-700 to-purple-900 opacity-90 transition-all duration-1000 group-hover:scale-105"></div>
          <div className="absolute inset-0 opacity-10 mix-blend-overlay">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="auth-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#auth-grid)" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <Link to="/" className="inline-flex items-center gap-4 hover:scale-105 transition-transform">
                <div className="w-14 h-14 bg-white rounded-[20px] flex items-center justify-center text-pink-600 shadow-2xl">
                  <ShoppingBag size={28} className="stroke-[2.5px]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-outfit font-black text-2xl tracking-tighter uppercase text-white leading-none">BELEZA</span>
                  <span className="text-pink-300 font-black text-xs tracking-widest uppercase leading-none mt-1">Conecta.</span>
                </div>
              </Link>

              <div className="mt-24 space-y-8 animate-fade-in-up">
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                   <Sparkles size={16} className="text-pink-300" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-white">Plataforma VIP</span>
                </div>
                <h1 className="text-6xl xl:text-7xl font-outfit font-black leading-[0.95] tracking-tight text-white mb-10">
                   {isLogin ? (
                     <>O brilho está <br/> de <span className="text-pink-300 italic underline underline-offset-8 decoration-pink-300/30">volta.</span></>
                   ) : (
                     <>Comece sua <br/> jornada <span className="text-pink-300 italic underline underline-offset-8 decoration-pink-300/30">digital.</span></>
                   )}
                </h1>
                <p className="text-pink-100 font-medium text-xl max-w-sm leading-relaxed opacity-80">
                  {isLogin 
                    ? 'Acesse seu painel exclusivo e gerencie suas vendas com a sofisticação que seu negócio merece.' 
                    : 'Transforme seu estoque físico em uma vitrine digital de alto luxo em menos de 3 minutos.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-10 opacity-70 group-hover:opacity-100 transition-opacity duration-700">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-md">
                     <CheckCircle2 size={20} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-white">100% Seguro</span>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-md">
                     <CheckCircle2 size={20} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-white">Vendas Diretas</span>
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: AUTH FORM FOLD */}
        <div className="p-10 sm:p-16 lg:p-24 flex flex-col justify-center relative bg-white">
          
          <div className="lg:hidden mb-12 text-center flex flex-col items-center">
             <div className="w-20 h-20 bg-pink-50 rounded-[32px] flex items-center justify-center text-pink-500 mb-6 shadow-xl shadow-pink-100">
                <ShoppingBag size={36} />
             </div>
             <h2 className="text-4xl font-outfit font-black text-gray-900 tracking-tight">Beleza Conecta</h2>
          </div>

          <div className="mb-12 hidden lg:block space-y-4">
             <h2 className="text-4xl font-outfit font-black text-gray-900 tracking-tight">
                {isLogin ? 'Fazer Login' : 'Criar Conta Grátis'}
             </h2>
             <p className="text-gray-400 font-medium text-lg leading-relaxed">
                {isLogin ? 'Gerencie seu catálogo premium e acompanhe seus pedidos.' : 'Crie seu link personalizado e comece a vender hoje mesmo.'}
             </p>
          </div>

          {/* Social Auth */}
          <button 
            type="button" 
            onClick={handleGoogleLogin} 
            disabled={loading}
            className="w-full h-20 flex items-center justify-center gap-4 rounded-[28px] border-2 border-gray-50 bg-white hover:bg-gray-50 hover:border-pink-100 transition-all duration-500 font-black text-gray-700 shadow-sm active:scale-95 group"
          >
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
               <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-5 h-5" />
            </div>
            <span className="text-base uppercase tracking-widest text-[11px]">Continuar com Google</span>
          </button>

          <div className="flex items-center gap-6 text-gray-200 mt-12 mb-12">
            <div className="flex-1 h-px bg-gray-100"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-white px-4">Ou usar e-mail corporativo</span>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-6 rounded-[28px] mb-8 text-sm font-bold flex items-center gap-4 border border-red-100 animate-shake">
               <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping"></div>
               {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {!isLogin && (
              <div className="space-y-3 group">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-6 italic">Seu Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-pink-500 transition-colors" size={20} />
                  <input 
                    type="text" required placeholder="Ex: Maria Carolina"
                    className="w-full bg-[#FBFBFC] border-2 border-transparent focus:border-pink-200 focus:bg-white rounded-[32px] px-20 py-7 font-black text-gray-900 outline-none focus:ring-8 focus:ring-pink-500/5 transition-all text-lg placeholder:text-gray-200 shadow-inner"
                    value={nome} onChange={(e) => setNome(e.target.value)}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-3 group">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-6 italic">E-mail Cadastrado</label>
              <div className="relative">
                <Mail className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-pink-500 transition-colors" size={20} />
                <input 
                  type="email" required placeholder="seu@email.com"
                  className="w-full bg-[#FBFBFC] border-2 border-transparent focus:border-pink-200 focus:bg-white rounded-[32px] px-20 py-7 font-black text-gray-900 outline-none focus:ring-8 focus:ring-pink-500/5 transition-all text-lg placeholder:text-gray-200 shadow-inner"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-3 group">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-6 italic">Sua Senha Mestra</label>
              <div className="relative">
                <Lock className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-pink-500 transition-colors" size={20} />
                <input 
                  type="password" required placeholder="••••••••"
                  className="w-full bg-[#FBFBFC] border-2 border-transparent focus:border-pink-200 focus:bg-white rounded-[32px] px-20 py-7 font-black text-gray-900 outline-none focus:ring-8 focus:ring-pink-500/5 transition-all text-lg placeholder:text-gray-200 shadow-inner"
                  value={senha} onChange={(e) => setSenha(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-24 bg-gray-900 text-white rounded-[36px] font-black text-xl shadow-3xl shadow-gray-200 hover:bg-black hover:scale-[1.02] active:scale-95 transition-all duration-500 flex items-center justify-center gap-4 group"
            >
              {loading ? (
                <div className="w-8 h-8 border-[4px] border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isLogin ? 'Acessar Painel' : 'Gerar minha Loja Grátis'}</span>
                  <ArrowRight size={24} className="stroke-[3px] group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-16 text-center space-y-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
             <p className="text-sm font-bold text-gray-400">
                {isLogin ? 'Ainda não é do time VIP? ' : 'Já possui acesso exclusivo? '}
                <button 
                   onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
                   className="text-pink-600 font-black decoration-2 underline-offset-8 hover:underline uppercase text-xs tracking-widest ml-1"
                >
                   {isLogin ? 'Cadastre-se Agora' : 'Fazer Login VIP'}
                </button>
             </p>

             <div className="h-px bg-gray-50/50 w-full"></div>

             <div className="flex items-center justify-between">
                <Link to="/" className="text-[10px] font-black text-gray-300 hover:text-gray-900 transition-all uppercase tracking-widest flex items-center gap-2 group/back">
                   <ChevronLeft size={16} className="group-hover/back:-translate-x-1 transition-transform" /> Voltar ao Início
                </Link>
                <div className="flex gap-4">
                  <span className="text-[9px] font-black text-gray-200 uppercase tracking-tighter">Brasil &bull; 2026</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Decorative Blob */}
      <div className="fixed -bottom-32 -left-32 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

    </div>
  );
}
