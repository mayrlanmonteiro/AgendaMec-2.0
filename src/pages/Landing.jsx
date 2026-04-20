import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Star, CheckCircle2, Zap, Rocket, Globe, ShieldCheck, Menu, X, ArrowRight } from 'lucide-react';

export default function Landing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#fdfeff] selection:bg-pink-100 selection:text-pink-600 overflow-x-hidden font-inter">
      
      {/* --- PREMIUM NAVBAR --- */}
      <nav className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 ${scrolled ? 'py-2' : 'py-4 lg:py-6'}`}>
        <div className={`absolute inset-0 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-2xl border-b border-gray-100 shadow-sm' : 'bg-transparent'}`}></div>
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3 sm:gap-4 group cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-[16px] sm:rounded-[18px] flex items-center justify-center text-white shadow-xl shadow-pink-200 group-hover:rotate-6 transition-transform duration-300">
              <ShoppingBag size={24} className="stroke-[2.5px]" />
            </div>
            <span className="font-outfit font-black text-xl sm:text-2xl tracking-tighter uppercase text-gray-900 leading-none">
              BELEZA<span className="text-pink-600">CONECTA.</span>
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-12">
             <a href="#funciona" className="text-[11px] font-black text-gray-400 hover:text-pink-600 uppercase tracking-[0.2em] transition-all">Como Funciona</a>
             <a href="#recursos" className="text-[11px] font-black text-gray-400 hover:text-pink-600 uppercase tracking-[0.2em] transition-all">Recursos</a>
             <Link to="/mariasilva" className="text-[11px] font-black text-pink-600 hover:text-pink-700 uppercase tracking-[0.2em] transition-all flex items-center gap-2 group">
                Demo Loja <Star size={14} className="fill-pink-600 group-hover:scale-110 transition-transform" />
             </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:inline-block px-8 py-4 rounded-2xl bg-gray-900 text-white font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-gray-200 hover:scale-105 hover:bg-black active:scale-95 transition-all duration-300">
              Acessar Painel
            </Link>
            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-3 text-gray-900 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-3xl border-b border-gray-100 shadow-2xl animate-fade-in-up">
            <div className="flex flex-col px-8 py-10 gap-8 text-center">
              <a href="#funciona" onClick={() => setIsMobileMenuOpen(false)} className="text-xs font-black text-gray-900 uppercase tracking-widest p-2">Como Funciona</a>
              <a href="#recursos" onClick={() => setIsMobileMenuOpen(false)} className="text-xs font-black text-gray-900 uppercase tracking-widest p-2">Recursos</a>
              <Link to="/mariasilva" onClick={() => setIsMobileMenuOpen(false)} className="text-xs font-black text-pink-600 uppercase tracking-widest flex items-center justify-center gap-2 p-2">
                Ver Demo da Loja <Star size={14} fill="currentColor" />
              </Link>
              <div className="h-px bg-gray-100 w-full"></div>
              <Link to="/login" className="px-10 py-5 rounded-2xl bg-gray-900 text-white font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center w-full">
                Entrar no Painel
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION (FULL HEIGHT FOLD) --- */}
      <section className="relative min-h-[90vh] lg:min-h-screen flex items-center pt-24 lg:pt-32 pb-20 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[80%] bg-pink-100/40 rounded-full blur-[140px] -z-10 animate-pulse transition-all"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[70%] bg-purple-100/30 rounded-full blur-[120px] -z-10 animate-float transition-all"></div>

        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 w-full relative z-10 transition-all">
          <div className="text-center max-w-5xl mx-auto space-y-10 lg:space-y-12">
             <div className="inline-flex items-center gap-3 bg-white px-5 py-2.5 rounded-full shadow-2xl shadow-pink-100/50 border border-pink-50 mb-4 animate-fade-in mx-auto">
                <span className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-ping"></span>
                <span className="text-[10px] sm:text-[11px] font-black text-gray-500 uppercase tracking-[0.25em]">A revolução da consultoria digital</span>
             </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-outfit font-black leading-[0.95] tracking-tight text-gray-900 animate-fade-in-up py-4">
              Seu Catálogo <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-pink-600 to-purple-700 pb-2">
                Digital Premium.
              </span>
            </h1>

            <p className="text-xl sm:text-2xl lg:text-3xl text-gray-500 font-medium max-w-3xl mx-auto leading-relaxed animate-fade-in-up px-4" style={{ animationDelay: '0.1s' }}>
              A plataforma definitiva para consultoras de luxo transformarem o estoque em vendas rápidas pelo WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8 pt-8 animate-fade-in-up px-6" style={{ animationDelay: '0.2s' }}>
              <Link to="/login" className="btn-primary w-full sm:w-auto px-10 sm:px-14 py-5 sm:py-7 rounded-[28px] sm:rounded-[32px] text-white font-black text-base sm:text-xl shadow-2xl shadow-pink-200 flex items-center justify-center gap-4 hover:scale-105 transition-all duration-500 group">
                Criar minha Loja Grátis
                <Rocket size={24} className="stroke-[2.5px] group-hover:translate-y-[-2px] group-hover:translate-x-[2px] transition-transform" />
              </Link>
              <Link to="/mariasilva" className="w-full sm:w-auto px-10 sm:px-14 py-5 sm:py-7 rounded-[28px] sm:rounded-[32px] bg-white border-2 border-gray-100 text-gray-900 font-black text-base sm:text-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-4 group shadow-lg shadow-gray-50">
                Ver Loja Demo
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Trusted By / Social Proof */}
            <div className="pt-20 sm:pt-28 flex flex-wrap items-center justify-center gap-10 sm:gap-16 opacity-30 grayscale hover:grayscale-0 transition-all duration-700 px-6">
                {['NATURA', 'BOTICÁRIO', 'AVON', 'JEQUITI', 'HINODE', 'EUDORA'].map((brand) => (
                  <div key={brand} className="font-outfit font-black text-xl sm:text-3xl tracking-tighter hover:text-pink-600 transition-colors cursor-default select-none uppercase">
                    {brand}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID (DEDICATED FOLD) --- */}
      <section id="recursos" className="py-28 lg:py-40 bg-gray-900 relative overflow-hidden">
         {/* Background Subtle Gradient */}
         <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-pink-500/5 blur-[120px] -z-0"></div>
         <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-purple-500/5 blur-[120px] -z-0"></div>

         <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
           <div className="mb-20 lg:mb-32 text-center lg:text-left max-w-3xl mx-auto lg:mx-0">
             <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-6">
               <Zap size={16} className="text-pink-500" />
               <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">Recursos Exclusivos</span>
             </div>
             <h2 className="text-5xl lg:text-7xl font-outfit font-black text-white mb-6 lg:mb-8 leading-[1.05] tracking-tight">
               Tudo o que você precisa <br className="hidden lg:block"/> para <span className="text-pink-500">vender mais.</span>
             </h2>
             <p className="text-gray-400 font-bold text-lg lg:text-xl leading-relaxed">
               Desenvolvemos as ferramentas certas para que você tenha um negócio digital profissional em poucos minutos.
             </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
             {[
               { icon: Globe, title: 'URL Personalizada', desc: 'Sua loja com seu nome único. Transmita confiança e profissionalismo instantâneo.' },
               { icon: Zap, title: 'Pedidos Express', desc: 'As clientes escolhem os produtos e o pedido chega mastigado no seu WhatsApp.' },
               { icon: ShieldCheck, title: 'Gestão Inteligente', desc: 'Acompanhe seu estoque, destaque ofertas e organize sua vitrine de onde estiver.' },
               { icon: Star, title: 'Design de Luxo', desc: 'Uma interface projetada para encantar clientes exigentes, com visual premium e fluido.' },
               { icon: Rocket, title: 'Super Velocidade', desc: 'Páginas otimizadas que carregam em menos de 1 segundo. Sem atritos para a compra.' },
               { icon: CheckCircle2, title: 'Mobile First', desc: 'Feito sob medida para o celular, facilitando o compartilhamento e a visualização.' }
             ].map((feature, idx) => (
               <div key={idx} className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 lg:p-14 rounded-[40px] lg:rounded-[56px] group hover:bg-white/10 hover:border-white/20 transition-all duration-500 shadow-2xl">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-[24px] lg:rounded-[30px] flex items-center justify-center text-white mb-8 lg:mb-12 shadow-2xl shadow-pink-900/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                     <feature.icon size={32} className="stroke-[2.5px]" />
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-outfit font-black text-white mb-4 lg:mb-6 tracking-tight">{feature.title}</h3>
                  <p className="text-gray-400 font-medium leading-relaxed text-base lg:text-lg">{feature.desc}</p>
               </div>
             ))}
           </div>
         </div>
      </section>

      {/* --- HOW IT WORKS (STEP BY STEP FOLD) --- */}
      <section id="funciona" className="py-28 lg:py-48 bg-white overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-20 lg:gap-32 items-center">
            <div className="flex-1 space-y-12 lg:space-y-16">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 bg-pink-50 text-pink-600 px-4 py-2 rounded-full border border-pink-100">
                  <Rocket size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Simples e Rápido</span>
                </div>
                <h2 className="text-5xl lg:text-8xl font-outfit font-black text-gray-900 leading-[0.95] tracking-tight">
                  Pronta em <br/> 
                  <span className="text-pink-600 underline underline-offset-[12px] decoration-pink-100/80 italic">3 minutos.</span>
                </h2>
              </div>
              
              <div className="space-y-12 pr-4">
                {[
                  { step: '01', title: 'Crie sua conta', desc: 'Cadastre-se rapidamente e configure o seu link personalizado em poucos cliques.' },
                  { step: '02', title: 'Vitrine Virtual', desc: 'Envie as fotos dos seus melhores produtos e defina seus preços de venda.' },
                  { step: '03', title: 'Fature Mais', desc: 'Compartilhe seu link nos Status e Grupos e veja os pedidos chegarem organizados.' }
                ].map((s, idx) => (
                  <div key={idx} className="flex gap-8 sm:gap-10 group">
                    <div className="text-6xl sm:text-7xl font-outfit font-black text-gray-100 group-hover:text-pink-100 transition-colors leading-none shrink-0">{s.step}</div>
                    <div className="space-y-3 pt-2">
                      <h4 className="text-2xl font-black text-gray-900 tracking-tight">{s.title}</h4>
                      <p className="text-gray-500 font-medium leading-relaxed text-lg lg:text-xl max-w-md">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8 pt-12">
                 <Link to="/login" className="btn-primary inline-flex px-14 py-7 rounded-[32px] text-white font-black text-xl shadow-3xl shadow-pink-200 hover:scale-105 active:scale-95 transition-all">
                   Começar Gratuitamente
                 </Link>
              </div>
            </div>

            <div className="flex-1 w-full flex justify-center lg:justify-end relative">
               {/* Mobile Frame Visual */}
               <div className="w-full max-w-[480px] aspect-[9/18.5] bg-gray-900 rounded-[64px] p-4 shadow-[0_60px_120px_-20px_rgba(31,38,135,0.15)] border-[14px] border-gray-800 relative overflow-hidden group">
                  <div className="absolute top-0 inset-x-0 h-10 bg-gray-800 flex items-center justify-center z-20">
                     <div className="w-28 h-6 bg-black rounded-full"></div>
                  </div>
                  <div className="w-full h-full bg-[#fdf2f8] rounded-[48px] p-8 pt-16 overflow-hidden flex flex-col items-center text-center">
                     <div className="w-20 h-20 bg-white rounded-3xl shadow-2xl flex items-center justify-center text-pink-500 mb-8 animate-bounce-subtle">
                        <ShoppingBag size={40} />
                     </div>
                     <div className="h-5 w-40 bg-pink-100 rounded-full mb-3"></div>
                     <div className="h-5 w-32 bg-gray-100 rounded-full mb-12"></div>
                     
                     <div className="grid grid-cols-2 gap-5 w-full">
                        <div className="aspect-square bg-white rounded-[28px] shadow-sm border border-pink-50 animate-pulse"></div>
                        <div className="aspect-square bg-white rounded-[28px] shadow-sm border border-pink-50 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="aspect-square bg-white rounded-[28px] shadow-sm border border-pink-50 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        <div className="aspect-square bg-white rounded-[28px] shadow-sm border border-pink-50 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                     </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-12 flex justify-center p-8">
                     <div className="w-full h-14 bg-pink-500 rounded-2xl shadow-[0_15px_30px_rgba(236,72,153,0.3)] animate-pulse"></div>
                  </div>
               </div>
               {/* Floating elements */}
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-white rounded-full shadow-2xl flex items-center justify-center animate-float z-30 border border-gray-50 hidden lg:flex">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl font-black text-pink-600">100%</span>
                    <span className="text-[8px] font-black uppercase text-gray-400 tracking-tighter">Mobile Ready</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PREMIUM CTA (FULL FOLD) --- */}
      <section className="py-24 lg:py-32 px-6 lg:px-12 mb-20">
        <div className="max-w-[1400px] mx-auto bg-gradient-to-br from-gray-900 via-pink-900/90 to-purple-950 rounded-[70px] lg:rounded-[90px] p-12 lg:p-32 text-center text-white relative overflow-hidden shadow-2xl group transition-all duration-700">
           {/* Decorative skew elements */}
           <div className="absolute top-0 right-[-10%] w-[40%] h-[120%] bg-white/5 skew-x-[-25deg] transition-transform duration-[2000ms] group-hover:translate-x-12"></div>
           <div className="absolute bottom-0 left-[-10%] w-[30%] h-[120%] bg-pink-500/5 skew-x-[-25deg] transition-transform duration-[2000ms] group-hover:-translate-x-12"></div>
           
           <div className="relative z-10 space-y-12 lg:space-y-16">
              <div className="space-y-6">
                <h2 className="text-4xl lg:text-8xl font-outfit font-black leading-[1.05] tracking-tight">
                  Sua consultoria merece <br className="hidden lg:block"/> o brilho do digital.
                </h2>
                <p className="text-pink-100/70 text-xl lg:text-3xl font-medium max-w-3xl mx-auto leading-relaxed">
                  Junte-se a centenas de revendedoras de sucesso que já elevaram o nível do seu negócio.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-6">
                 <Link to="/login" className="bg-white text-gray-900 font-black px-14 py-7 rounded-[32px] shadow-3xl hover:scale-105 active:scale-95 transition-all text-xl w-full sm:w-auto flex items-center justify-center gap-3">
                    Começar Gratuitamente <Rocket size={24} className="text-pink-600" />
                 </Link>
                 <Link to="/mariasilva" className="text-white font-black hover:text-pink-200 transition-colors underline underline-offset-[14px] decoration-white/20 text-xl w-full sm:w-auto">
                    Explorar Demonstração
                 </Link>
              </div>
           </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white pt-32 pb-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
           <div className="flex flex-col lg:flex-row justify-between items-start gap-16 pb-24 border-b border-gray-100">
              <div className="max-w-md space-y-10">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-pink-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-pink-100"><ShoppingBag size={24}/></div>
                    <span className="font-outfit font-black text-2xl tracking-tighter uppercase text-gray-900">BELEZA<span className="text-pink-600">CONECTA.</span></span>
                 </div>
                 <p className="text-gray-400 font-bold text-lg leading-relaxed">
                   A plataforma líder em vitrines digitais para consultoras de cosméticos em todo o Brasil. Tecnologia a serviço do seu crescimento.
                 </p>
                 <div className="flex gap-4 grayscale opacity-30">
                    <div className="px-4 py-2 bg-gray-50 border rounded-xl text-[10px] font-black uppercase tracking-widest tracking-tighter">São Paulo, BR</div>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-16 lg:gap-32">
                 <div className="space-y-8">
                   <h5 className="font-black text-gray-900 text-sm uppercase tracking-[0.2em]">Plataforma</h5>
                   <ul className="space-y-5 text-base font-bold text-gray-400">
                     <li><a href="#funciona" className="hover:text-pink-600 transition-colors">Como Funciona</a></li>
                     <li><a href="#recursos" className="hover:text-pink-600 transition-colors">Recursos</a></li>
                     <li><Link to="/mariasilva" className="hover:text-pink-600 transition-colors">Demonstração</Link></li>
                   </ul>
                 </div>
                 <div className="space-y-8">
                   <h5 className="font-black text-gray-900 text-sm uppercase tracking-[0.2em]">Conecta</h5>
                   <ul className="space-y-5 text-base font-bold text-gray-400">
                     <li><a href="#" className="hover:text-pink-600 transition-colors">Instagram</a></li>
                     <li><a href="#" className="hover:text-pink-600 transition-colors">Suporte VIP</a></li>
                     <li><a href="#" className="hover:text-pink-600 transition-colors">Blog</a></li>
                   </ul>
                 </div>
                 <div className="space-y-8 col-span-2 md:col-span-1">
                    <h5 className="font-black text-gray-900 text-sm uppercase tracking-[0.2em]">Legal</h5>
                    <ul className="space-y-5 text-base font-bold text-gray-400">
                      <li><a href="#" className="hover:text-pink-600 transition-colors">Privacidade</a></li>
                      <li><a href="#" className="hover:text-pink-600 transition-colors">Termos de Uso</a></li>
                    </ul>
                 </div>
              </div>
           </div>

           <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.25em]">&copy; 2026 BELEZA CONECTA. TECNOLOGIA PARA REVENDEDORAS.</p>
              </div>
              <div className="flex items-center gap-5 grayscale opacity-30">
                <div className="w-6 h-6 border border-gray-200 rounded flex items-center justify-center text-[8px] font-black">FB</div>
                <div className="w-6 h-6 border border-gray-200 rounded flex items-center justify-center text-[8px] font-black">RT</div>
                <div className="w-6 h-6 border border-gray-200 rounded flex items-center justify-center text-[8px] font-black">TW</div>
              </div>
           </div>
        </div>
      </footer>

    </div>
  );
}
