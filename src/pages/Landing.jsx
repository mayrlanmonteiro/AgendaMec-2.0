import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Star, CheckCircle2, Zap, Rocket, Globe, ShieldCheck, Menu, X } from 'lucide-react';

export default function Landing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fdfeff] selection:bg-pink-100 selection:text-pink-600 overflow-x-hidden font-inter">
      
      {/* --- PREMIUM NAVBAR --- */}
      <nav className="fixed top-0 inset-x-0 z-[100] transition-all">
        <div className="absolute inset-0 bg-white/70 backdrop-blur-2xl border-b border-white/40"></div>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 h-20 lg:h-24 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3 sm:gap-4 group cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-[16px] sm:rounded-[18px] flex items-center justify-center text-white shadow-xl shadow-pink-200 group-hover:rotate-6 transition-transform">
              <ShoppingBag size={24} className="stroke-[2.5px] scale-90 sm:scale-100" />
            </div>
            <span className="font-outfit font-black text-xl sm:text-2xl tracking-tighter uppercase text-gray-900 leading-none">
              BELEZA<span className="text-pink-600">CONECTA.</span>
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-10">
             <a href="#funciona" className="text-sm font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest transition-colors">Como Funciona</a>
             <a href="#recursos" className="text-sm font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest transition-colors">Recursos</a>
             <Link to="/mariasilva" className="text-sm font-black text-pink-600 hover:text-pink-700 uppercase tracking-widest transition-colors flex items-center gap-2">
                Demo Loja <Star size={14} fill="currentColor" />
             </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/login" className="hidden sm:inline-block px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl bg-gray-900 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-2xl shadow-gray-200 hover:scale-105 active:scale-95 transition-all">
              Entrar no Painel
            </Link>
            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-2 text-gray-900 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-3xl border-b border-gray-100 shadow-2xl animate-fade-in-up">
            <div className="flex flex-col px-6 py-8 gap-6 text-center">
              <a href="#funciona" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-black text-gray-900 uppercase tracking-widest transition-colors p-2">Como Funciona</a>
              <a href="#recursos" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-black text-gray-900 uppercase tracking-widest transition-colors p-2">Recursos</a>
              <Link to="/mariasilva" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-black text-pink-600 uppercase tracking-widest transition-colors flex items-center justify-center gap-2 p-2">
                Ver Demo da Loja <Star size={14} fill="currentColor" />
              </Link>
              <div className="h-px bg-gray-100 w-1/2 mx-auto my-2"></div>
              <Link to="/login" className="px-8 py-4 rounded-2xl bg-gray-900 text-white font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center mx-auto w-full max-w-[250px]">
                Acessar Painel
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 lg:pt-48 pb-20 lg:pb-32" style={{ zIndex: 10 }}>
        {/* Decorative Blobs */}
        <div className="absolute top-0 right-[-10%] w-[50%] h-[700px] bg-pink-100/30 rounded-full blur-[120px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-[-10%] w-[40%] h-[600px] bg-purple-100/30 rounded-full blur-[100px] -z-10"></div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10 block">
          <div className="text-center max-w-4xl mx-auto space-y-8 lg:space-y-10">
             <div className="inline-flex items-center gap-3 bg-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full shadow-xl shadow-pink-50 border border-gray-50 mb-2 sm:mb-4 animate-fade-in mx-auto">
                <span className="w-2 h-2 bg-pink-500 rounded-full animate-ping"></span>
                <span className="text-[9px] sm:text-[11px] font-black text-gray-500 uppercase tracking-[0.15em]">O Futuro da Revenda</span>
             </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-outfit font-black leading-[1.1] sm:leading-tight tracking-tight text-gray-900 animate-fade-in-up py-2">
              Seu Catálogo <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-pink-600 to-purple-700">Digital Premium.</span>
            </h1>

            <p className="text-lg sm:text-xl lg:text-3xl text-gray-500 font-medium max-w-3xl mx-auto leading-relaxed animate-fade-in-up px-2" style={{ animationDelay: '0.1s' }}>
              A plataforma definitiva para consultoras O Boticário, Natura e Avon transformarem contatos em clientes fiéis.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-4 sm:pt-6 animate-fade-in-up px-4" style={{ animationDelay: '0.2s' }}>
              <Link to="/login" className="btn-primary w-full sm:w-auto px-8 sm:px-12 py-5 sm:py-6 rounded-[24px] sm:rounded-[28px] text-white font-black text-base sm:text-lg shadow-2xl shadow-pink-200 flex items-center justify-center gap-3 hover:scale-105 transition-all">
                Criar minha Loja Grátis
                <Rocket size={20} className="stroke-[2.5px] sm:w-6 sm:h-6" />
              </Link>
              <Link to="/mariasilva" className="w-full sm:w-auto px-8 sm:px-12 py-5 sm:py-6 rounded-[24px] sm:rounded-[28px] bg-white border-2 border-gray-100 text-gray-900 font-black text-base sm:text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-3 group">
                Ver Demo
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform sm:w-[22px] sm:h-[22px]" />
              </Link>
            </div>

            {/* Social Proof Badges */}
            <div className="pt-16 sm:pt-20 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 opacity-40 grayscale group-hover:grayscale-0 transition-all px-4 sm:px-0">
               <div className="font-outfit font-black text-xl sm:text-3xl">NATURA</div>
               <div className="font-outfit font-black text-xl sm:text-3xl">BOTICÁRIO</div>
               <div className="font-outfit font-black text-xl sm:text-3xl">AVON</div>
               <div className="font-outfit font-black text-xl sm:text-3xl">JEQUITI</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="recursos" className="py-24 lg:py-32 bg-gray-900 relative overflow-hidden">
         {/* Background pattern */}
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
           <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
             <defs>
               <pattern id="grid-pattern" width="5" height="5" patternUnits="userSpaceOnUse">
                 <path d="M 5 0 L 0 0 0 5" fill="none" stroke="white" strokeWidth="0.5"/>
               </pattern>
             </defs>
             <rect width="100%" height="100%" fill="url(#grid-pattern)" />
           </svg>
         </div>

         <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
           <div className="mb-16 lg:mb-24 text-center lg:text-left">
             <h2 className="text-4xl lg:text-6xl font-outfit font-black text-white mb-4 lg:mb-6 leading-tight">Tudo o que você precisa <br className="hidden lg:block"/> para <span className="text-pink-500">vender mais.</span></h2>
             <p className="text-gray-400 font-bold text-base lg:text-lg max-w-2xl mx-auto lg:mx-0">Desenvolvemos as ferramentas certas para que você foque no que importa: encantar suas clientes.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
             {[
               { icon: Globe, title: 'URL Exclusiva', desc: 'Sua loja com seu nome e sua marca. Mais profissionalismo para o seu negócio.' },
               { icon: Zap, title: 'Pedidos via WhatsApp', desc: 'As clientes escolhem os produtos e o pedido chega pronto para fechar a venda.' },
               { icon: ShieldCheck, title: 'Gestão Completa', desc: 'Acompanhe seu estoque, destaque ofertas e gerencie seus links em um só lugar.' },
               { icon: Star, title: 'Visual Premium', desc: 'Sua vitrine projetada para encantar e converter, com design moderno e responsivo.' },
               { icon: Rocket, title: 'Sem Mensagens', desc: 'Fuja de PDFs pesados. Envie um link leve que abre em qualquer navegador rapidamente.' },
               { icon: CheckCircle2, title: 'Nativa e Rápida', desc: 'Performance otimizada para dispositivos móveis, garantindo a melhor experiência.' }
             ].map((feature, idx) => (
               <div key={idx} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 lg:p-12 rounded-[32px] lg:rounded-[48px] group hover:bg-white/10 transition-all duration-500">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-[20px] lg:rounded-[24px] flex items-center justify-center text-white mb-6 lg:mb-10 shadow-2xl shadow-pink-900/50 group-hover:scale-110 group-hover:rotate-6 transition-all">
                     <feature.icon size={28} className="stroke-[2.5px] lg:w-[30px] lg:h-[30px]" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-outfit font-black text-white mb-3 lg:mb-4 tracking-tight">{feature.title}</h3>
                  <p className="text-gray-400 font-medium leading-relaxed text-sm lg:text-base">{feature.desc}</p>
               </div>
             ))}
           </div>
         </div>
      </section>

      {/* --- HOW IT WORKS (STEP BY STEP) --- */}
      <section id="funciona" className="py-32 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-24 items-center">
            <div className="flex-1 space-y-12">
              <h2 className="text-5xl lg:text-7xl font-outfit font-black text-gray-900 leading-[1.1] tracking-tight">Comece a vender em <span className="text-pink-600 underline underline-offset-8 decoration-pink-100 italic">3 minutos.</span></h2>
              
              <div className="space-y-10">
                {[
                  { step: '01', title: 'Crie sua conta', desc: 'Cadastre-se com seu e-mail ou conta Google e configure seu perfil de consultora.' },
                  { step: '02', title: 'Adicione Seus Produtos', desc: 'Cadastre os itens que você tem em estoque ou deseja revender com fotos e descrição.' },
                  { step: '03', title: 'Compartilhe o Link', desc: 'Distribua o link da sua loja no WhatsApp, Instagram e Status para começar a receber pedidos.' }
                ].map((s, idx) => (
                  <div key={idx} className="flex gap-8 group">
                    <div className="text-5xl font-outfit font-black text-gray-100 group-hover:text-pink-100 transition-colors leading-none shrink-0">{s.step}</div>
                    <div>
                      <h4 className="text-xl font-black text-gray-900 mb-2">{s.title}</h4>
                      <p className="text-gray-500 font-medium leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8">
                 <Link to="/login" className="btn-primary inline-flex px-12 py-6 rounded-[28px] text-white font-black text-lg shadow-2xl shadow-pink-200">
                   Criar meu Catálogo Agora
                 </Link>
              </div>
            </div>

            <div className="flex-1 w-full flex justify-center">
               <div className="w-full max-w-[450px] aspect-[9/17.5] bg-gray-900 rounded-[50px] p-4 shadow-[0_50px_100px_rgba(0,0,0,0.1)] border-[12px] border-gray-800 relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-8 bg-gray-800 flex items-center justify-center">
                     <div className="w-24 h-5 bg-black rounded-full"></div>
                  </div>
                  <div className="w-full h-full bg-[#fdf2f8] rounded-[30px] p-6 pt-10 overflow-hidden flex flex-col items-center text-center">
                     <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-pink-500 mb-6">
                        <ShoppingBag size={32} />
                     </div>
                     <div className="h-4 w-32 bg-pink-100 rounded-full mb-2"></div>
                     <div className="h-4 w-24 bg-gray-100 rounded-full mb-10"></div>
                     
                     <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="aspect-square bg-white rounded-2xl shadow-sm border border-pink-50"></div>
                        <div className="aspect-square bg-white rounded-2xl shadow-sm border border-pink-50"></div>
                        <div className="aspect-square bg-white rounded-2xl shadow-sm border border-pink-50"></div>
                        <div className="aspect-square bg-white rounded-2xl shadow-sm border border-pink-50"></div>
                     </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-10 flex justify-center p-6">
                     <div className="w-full h-12 bg-pink-500 rounded-xl shadow-[0_10px_20px_rgba(236,72,153,0.3)]"></div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PREMIUM CTA --- */}
      <section className="py-24 px-6">
        <div className="max-w-[1400px] mx-auto bg-gradient-to-br from-pink-500 via-pink-600 to-purple-700 rounded-[64px] p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-[-10%] w-[30%] h-[100%] bg-white/10 skew-x-[-20deg]"></div>
           <div className="relative z-10 space-y-10">
              <h2 className="text-4xl lg:text-7xl font-outfit font-black leading-tight tracking-tight">Pronta para profissionalizar <br className="hidden lg:block"/> suas vendas de beleza?</h2>
              <p className="text-pink-100 text-xl font-medium max-w-2xl mx-auto opacity-90">Junte-se a centenas de consultoras que já estão usando o Beleza Conecta para encantar suas clientes.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                 <Link to="/login" className="bg-white text-gray-900 font-black px-12 py-6 rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all text-xl w-full sm:w-auto">
                    Começar Gratuitamente
                 </Link>
                 <Link to="/mariasilva" className="text-white font-black hover:underline underline-offset-8 text-lg w-full sm:w-auto">
                    Estou com dúvidas
                 </Link>
              </div>
           </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white pt-24 pb-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
           <div className="flex flex-col lg:flex-row justify-between items-start gap-12 pb-20 border-b border-gray-100">
              <div className="max-w-xs space-y-8">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-pink-600 rounded-xl flex items-center justify-center text-white"><ShoppingBag size={20}/></div>
                   <span className="font-outfit font-black text-xl tracking-tighter uppercase">BELEZA<span className="text-pink-600">CONECTA.</span></span>
                 </div>
                 <p className="text-gray-400 font-medium leading-relaxed">Sua aliada oficial no crescimento das suas vendas como consultora de luxo.</p>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-16 lg:gap-32">
                 <div className="space-y-6">
                   <h5 className="font-black text-gray-900 text-xs uppercase tracking-widest">Produto</h5>
                   <ul className="space-y-4 text-sm font-bold text-gray-400">
                     <li><a href="#" className="hover:text-pink-600">Recursos</a></li>
                     <li><a href="#" className="hover:text-pink-600">Demonstração</a></li>
                     <li><a href="#" className="hover:text-pink-600">Preços (Grátis)</a></li>
                   </ul>
                 </div>
                 <div className="space-y-6">
                   <h5 className="font-black text-gray-900 text-xs uppercase tracking-widest">Comunidade</h5>
                   <ul className="space-y-4 text-sm font-bold text-gray-400">
                     <li><a href="#" className="hover:text-pink-600">Instagram</a></li>
                     <li><a href="#" className="hover:text-pink-600">YouTube</a></li>
                     <li><a href="#" className="hover:text-pink-600">WhatsApp</a></li>
                   </ul>
                 </div>
                 <div className="space-y-6">
                    <h5 className="font-black text-gray-900 text-xs uppercase tracking-widest">Sobre</h5>
                    <ul className="space-y-4 text-sm font-bold text-gray-400">
                      <li><a href="#" className="hover:text-pink-600">Privacidade</a></li>
                      <li><a href="#" className="hover:text-pink-600">Termos</a></li>
                    </ul>
                 </div>
              </div>
           </div>

           <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-[11px] font-black text-gray-300 uppercase tracking-widest">&copy; 2026 BELEZA CONECTA. PROJETADO PARA O SEU SUCESSO.</p>
              <div className="flex items-center gap-4 grayscale opacity-40">
                <div className="px-3 py-1 bg-gray-50 border rounded text-[10px] font-black">FIREBASE</div>
                <div className="px-3 py-1 bg-gray-50 border rounded text-[10px] font-black">REACT</div>
                <div className="px-3 py-1 bg-gray-50 border rounded text-[10px] font-black">SUPABASE</div>
              </div>
           </div>
        </div>
      </footer>

    </div>
  );
}
