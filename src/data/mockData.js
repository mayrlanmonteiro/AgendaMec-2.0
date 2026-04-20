export const revendedores = [
  {
    id: '1',
    nome: 'Maria Silva',
    email: 'maria@example.com',
    telefone: '11987654321',
    whatsapp: '11987654321',
    foto_perfil: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200',
    biografia: 'Especialista em beleza facial e corporal. 5 anos ajudando mulheres a elevarem sua autoestima com os melhores produtos.',
    slug_url: 'mariasilva',
    data_cadastro: '2023-01-15'
  }
];

export const marcas = [
  { id: '1', nome_marca: 'O Boticário', logo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=100' },
  { id: '2', nome_marca: 'Natura', logo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=100' },
  { id: '3', nome_marca: 'Jequiti', logo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=100' },
  { id: '4', nome_marca: 'Avon', logo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=100' },
];

export const categorias = [
  { id: '1', nome_categoria: 'Perfumes' },
  { id: '2', nome_categoria: 'Maquiagem' },
  { id: '3', nome_categoria: 'Skincare' },
  { id: '4', nome_categoria: 'Cabelos' }
];

export const produtos = [
  {
    id: '1',
    revendedor_id: '1',
    nome_produto: 'Lily Eau de Parfum',
    marca: '1',
    categoria: '1',
    preco: 289.90,
    descricao: 'A elegância de um clássico. Fragrância floral marcante e sofisticada.',
    array_fotos: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=400'
    ],
    estoque: 5,
    destaque: true,
    data_cadastro: '2023-02-10'
  },
  {
    id: '2',
    revendedor_id: '1',
    nome_produto: 'Base Líquida Matte',
    marca: '2',
    categoria: '2',
    preco: 59.90,
    descricao: 'Alta cobertura, longa duração e acabamento natural matte.',
    array_fotos: [
      'https://images.unsplash.com/photo-1631214500515-e4ace7f401f7?auto=format&fit=crop&q=80&w=400'
    ],
    estoque: 12,
    destaque: true,
    data_cadastro: '2023-02-12'
  },
  {
    id: '3',
    revendedor_id: '1',
    nome_produto: 'Sérum Anti-idade',
    marca: '1',
    categoria: '3',
    preco: 145.00,
    descricao: 'Reduz linhas de expressão e hidrata profundamente.',
    array_fotos: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400'
    ],
    estoque: 8,
    destaque: false,
    data_cadastro: '2023-02-15'
  },
  {
    id: '4',
    revendedor_id: '1',
    nome_produto: 'Batom Vermelho Vibrante',
    marca: '4',
    categoria: '2',
    preco: 25.50,
    descricao: 'Cor intensa na primeira passada com hidratação intensa.',
    array_fotos: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=400'
    ],
    estoque: 20,
    destaque: true,
    data_cadastro: '2023-02-20'
  }
];
