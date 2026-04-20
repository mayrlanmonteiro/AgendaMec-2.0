-- === ESTRUTURA DO BANCO DE DADOS ===
-- Copie e cole este código no SQL Editor do seu painel Supabase e clique em "Run"

-- Habilitar a extensão "uuid-ossp" (para geração de IDs universais únicos, caso necessário)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. Tabela REVENDEDORES
-- (Vincula-se aos usuários autenticados da plataforma)
-- ==========================================
CREATE TABLE public.revendedores (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    telefone TEXT,
    whatsapp TEXT,
    foto_perfil TEXT,
    biografia TEXT,
    slug_url TEXT UNIQUE NOT NULL,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ativar Row Level Security (RLS) para revendedores
ALTER TABLE public.revendedores ENABLE ROW LEVEL SECURITY;

-- Políticas (Policies) para Revendedores
-- Qualquer pessoa pode visualizar perfis de revendedores (para a loja virtual do cliente poder carregar os dados)
CREATE POLICY "Revendedores são visíveis publicamente" 
  ON public.revendedores FOR SELECT USING (true);

-- Revendedores só podem editar o PRÓPRIO perfil
CREATE POLICY "Revendedores podem atualizar seu próprio perfil" 
  ON public.revendedores FOR UPDATE 
  USING (auth.uid() = id);

-- ==========================================
-- 2. Tabela CATEGORIAS
-- ==========================================
CREATE TABLE public.categorias (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome_categoria TEXT NOT NULL UNIQUE
);

-- RLS Categorias: Visível a todos, editável apenas pelo admin superior (ou todos inserindo mockado)
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categorias são visíveis publicamente" ON public.categorias FOR SELECT USING (true);

-- ==========================================
-- 3. Tabela MARCAS
-- ==========================================
CREATE TABLE public.marcas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome_marca TEXT NOT NULL UNIQUE,
    logo TEXT
);

-- RLS Marcas: Visível a todos
ALTER TABLE public.marcas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Marcas são visíveis publicamente" ON public.marcas FOR SELECT USING (true);

-- ==========================================
-- 4. Tabela PRODUTOS
-- ==========================================
CREATE TABLE public.produtos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    revendedor_id UUID REFERENCES public.revendedores(id) ON DELETE CASCADE NOT NULL,
    nome_produto TEXT NOT NULL,
    marca UUID REFERENCES public.marcas(id) ON DELETE SET NULL,
    categoria UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
    preco NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    descricao TEXT,
    array_fotos TEXT[] DEFAULT array[]::TEXT[],
    estoque INTEGER NOT NULL DEFAULT 0,
    destaque BOOLEAN DEFAULT FALSE,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS PRODUTOS
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

-- Produtos visíveis a todos (vitrine)
CREATE POLICY "Produtos são visíveis publicamente"
  ON public.produtos FOR SELECT USING (true);

-- Apenas o dono do produto (revendedor) pode inserir/atualizar/deletar
CREATE POLICY "Apenas revendedores donos do produto podem inserir"
  ON public.produtos FOR INSERT WITH CHECK (auth.uid() = revendedor_id);

CREATE POLICY "Apenas revendedores donos do produto podem atualizar"
  ON public.produtos FOR UPDATE USING (auth.uid() = revendedor_id);

CREATE POLICY "Apenas revendedores donos do produto podem excluir"
  ON public.produtos FOR DELETE USING (auth.uid() = revendedor_id);


-- ==========================================
-- INSERÇÃO DE DADOS INICIAIS MOCKADOS
-- Pule / comente essa parte se quiser iniciar o sistema com 0 marcas e 0 categorias
-- ==========================================
INSERT INTO public.categorias (nome_categoria) VALUES 
('Perfumes'), ('Maquiagem'), ('Skincare'), ('Cabelos')
ON CONFLICT (nome_categoria) DO NOTHING;

INSERT INTO public.marcas (nome_marca, logo) VALUES 
('O Boticário', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=100'),
('Natura', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=100'),
('Jequiti', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=100'),
('Avon', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=100')
ON CONFLICT (nome_marca) DO NOTHING;
