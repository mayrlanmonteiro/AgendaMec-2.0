import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
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
    <div className="min-h-screen py-12 px-6 bg-gradient-to-br from-[#fdf2f8] via-[#ffffff] to-[#faf5ff] relative flex flex-col items-center justify-center">
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-100/50 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/50 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-[1000px] my-auto grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[40px] shadow-[0_32px_120px_rgba(0,0,0,0.08)] overflow-hidden relative z-10 border border-white shrink-0">
        
        {/* Left Side: Visual/Branding */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-pink-500 via-pink-600 to-purple-700 text-white relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grid)" />
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-pink-600 shadow-xl">
                <ShoppingBag size={22} />
              </div>
              <span className="font-black text-xl tracking-tighter uppercase">Beleza Conecta</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black leading-[1.15] tracking-tight">
                {isLogin ? 'Bem-vinda de volta ao seu império de beleza.' : 'Transforme sua paixão em um negócio lucrativo.'}
              </h1>
              <p className="text-pink-100 text-lg font-medium opacity-90 max-w-md">
                {isLogin 
                  ? 'Gerencie seus produtos, acompanhe pedidos e encante seus clientes com facilidade.' 
                  : 'Crie sua vitrine em segundos e venda produtos das melhores marcas direto pelo WhatsApp.'}
              </p>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-6">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                 <CheckCircle2 size={18} />
               </div>
               <span className="text-sm font-bold">100% Gratuito</span>
             </div>
             <div className="flex items-center gap-3">
               <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                 <CheckCircle2 size={18} />
               </div>
               <span className="text-sm font-bold">Venda Garantida</span>
             </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-6 sm:p-8 lg:p-16 flex flex-col justify-center">
          <div className="mb-8 lg:hidden flex flex-col items-center text-center">
             <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 mb-4 shadow-xl shadow-pink-100">
               <ShoppingBag size={32} />
             </div>
             <h2 className="text-3xl font-black text-gray-900 leading-tight">Beleza Conecta</h2>
          </div>

          <div className="mb-8 hidden lg:block">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
              {isLogin ? 'Fazer Login' : 'Criar Conta'}
            </h2>
            <p className="text-gray-400 font-medium">
              {isLogin ? 'Entre para gerenciar sua loja.' : 'Comece sua jornada como revendedora VIP.'}
            </p>
          </div>

          <button 
            type="button" 
            onClick={handleGoogleLogin} 
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200 transition-all font-bold text-gray-700 shadow-sm active:scale-95 mb-8"
            disabled={loading}
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-5 h-5" />
            <span>Continuar com Google</span>
          </button>

          <div className="flex items-center gap-4 text-gray-300 mb-8 px-4">
            <div className="flex-1 h-px bg-gray-100"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white px-2">Ou usar e-mail</span>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-2 border border-red-100 animate-shake">
               <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
               {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2 group">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1 group-focus-within:text-pink-500 transition-colors">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-pink-400 transition-colors" size={18} />
                  <input 
                    type="text" required placeholder="Ex: Maria Clara"
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-14 pr-6 font-bold text-gray-900 focus:ring-2 focus:ring-pink-500/10 transition-all outline-none md:text-[15px] placeholder:text-gray-300"
                    value={nome} onChange={(e) => setNome(e.target.value)}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2 group">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1 group-focus-within:text-pink-500 transition-colors">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-pink-400 transition-colors" size={18} />
                <input 
                  type="email" required placeholder="seu@email.com"
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-14 pr-6 font-bold text-gray-900 focus:ring-2 focus:ring-pink-500/10 transition-all outline-none md:text-[15px] placeholder:text-gray-300"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2 group">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1 group-focus-within:text-pink-500 transition-colors">Senha</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-pink-400 transition-colors" size={18} />
                <input 
                  type="password" required placeholder="••••••••"
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-14 pr-6 font-bold text-gray-900 focus:ring-2 focus:ring-pink-500/10 transition-all outline-none md:text-[15px] placeholder:text-gray-300"
                  value={senha} onChange={(e) => setSenha(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full btn btn-primary py-5 mt-4 shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-lg font-black tracking-tight flex items-center justify-center gap-3" 
              disabled={loading}
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isLogin ? 'Entrar no Painel' : 'Criar minha Loja'}</span>
                  <ArrowRight size={20} className="stroke-[3px]" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center space-y-4">
            <button 
              className="text-sm font-bold text-gray-400 hover:text-pink-600 transition-colors cursor-pointer bg-transparent border-none"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMsg('');
              }}
            >
              {isLogin ? 'Não tem uma conta? ' : 'Já faz parte do time? '}
              <span className="text-pink-500 font-black decoration-2 underline-offset-4 hover:underline">
                {isLogin ? 'Cadastre-se grátis' : 'Fazer Login'}
              </span>
            </button>
            <div className="h-4"></div>
            <Link to="/" className="text-xs font-black text-gray-300 uppercase tracking-widest hover:text-gray-500 transition-colors flex items-center justify-center gap-2">
              Voltar ao Início
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
