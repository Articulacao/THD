// Conteúdos de THD – aulas 1 a 7 (até Bauhaus). Fonte: slides do docente (THD_24_25).
export type Aula = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export const AULAS: Record<Aula, string> = {
  1: "Design: cultura, estratégia e significado",
  2: "Arte, técnica e design",
  3: "Industrialização e origem do design moderno",
  4: "Arts and Crafts",
  5: "Arte Nova",
  6: "Deutscher Werkbund",
  7: "Bauhaus",
};

export type Q = {
  id: string;
  aula: Aula;
  nivel: 1 | 2 | 3;
  p: string;
  o: string[];
  c: number; // índice da opção correta
  e: string; // explicação
};

export const QUESTOES: Q[] = [
  // AULA 1
  { id: "a1-1", aula: 1, nivel: 1, p: "Segundo Hanington & Martin (2012), design é…", o: ["decoração de objetos", "o processo de dar forma a ideias para as tornar compreensíveis, úteis e significativas", "apenas desenho técnico", "um estilo artístico"], c: 1, e: "Design ≠ decoração: é intenção + função + significado." },
  { id: "a1-2", aula: 1, nivel: 1, p: "Qual a fórmula-síntese da aula 1 sobre o design?", o: ["Ver – copiar – vender", "Pensar – fazer – sentir", "Medir – cortar – montar", "Pesquisar – imitar – publicar"], c: 1, e: "Pensar (compreender problemas), fazer (criar soluções), sentir (comunicar emoção e propósito)." },
  { id: "a1-3", aula: 1, nivel: 1, p: "Quais os quatro princípios de identidade visual apresentados?", o: ["Simplicidade, relevância, distinção, coerência", "Cor, forma, textura, ritmo", "Preço, qualidade, prazo, marca", "Tradição, ornamento, simetria, luxo"], c: 0, e: "Um bom design comunica com clareza e emoção através destes quatro princípios." },
  { id: "a1-4", aula: 1, nivel: 2, p: "O que defende John Berger em «Modos de Ver»?", o: ["Que ver é um ato neutro e universal", "Que a maneira como vemos é afetada pelo que sabemos e acreditamos: ver é um ato cultural", "Que só os artistas sabem ver", "Que a fotografia substitui a pintura"], c: 1, e: "O design comunica valores, não apenas formas." },
  { id: "a1-5", aula: 1, nivel: 2, p: "Qual a ordem correta do processo de design (ciclo iterativo)?", o: ["Prototipagem → Pesquisa → Avaliação → Ideação", "Pesquisa → Ideação → Prototipagem → Avaliação", "Ideação → Avaliação → Pesquisa → Prototipagem", "Avaliação → Prototipagem → Ideação → Pesquisa"], c: 1, e: "Depois da avaliação o ciclo volta à pesquisa." },
  { id: "a1-6", aula: 1, nivel: 2, p: "O método AEIOU serve para…", o: ["agrupar ideias em temas", "observar pessoas e ambientes", "testar protótipos finais", "calcular custos de produção"], c: 1, e: "AEIOU observa; o Affinity Diagram agrupa ideias; entrevistas e testes validam." },
  { id: "a1-7", aula: 1, nivel: 2, p: "Porque é que a Tiffany & Co. serve de exemplo de design como estratégia?", o: ["Porque vende apenas diamantes", "Porque vende amor e elegância: cria identidade, não só produtos", "Porque tem o logótipo mais simples", "Porque usa produção em massa"], c: 1, e: "«Eres lo que significas, vales lo que importas» (Kairos)." },
  { id: "a1-8", aula: 1, nivel: 3, p: "Qual destes NÃO é um domínio do design apresentado na aula?", o: ["Design de comunicação", "Design de produto/industrial", "Design de moda/têxtil", "Design de contabilidade"], c: 3, e: "Domínios: produto/industrial, engenharia/mecânico, moda/têxtil, comunicação, ambiente/interiores e pesquisa." },
  { id: "a1-9", aula: 1, nivel: 3, p: "Ao contrário do direito ou da medicina, o design…", o: ["tem licenciamento obrigatório", "carece de uma estrutura unificada ou licenciamento", "só existe em empresas", "é regulado por uma ordem mundial"], c: 1, e: "Isto ajuda a explicar a diversidade de significados do termo «design»." },
  { id: "a1-10", aula: 1, nivel: 3, p: "«Projetar é escolher.» O que implica esta ideia?", o: ["Que o design depende só da tecnologia", "Que cada decisão gera impacto e o designer assume responsabilidade por ela", "Que o designer não tem influência cultural", "Que a economia determina todas as formas"], c: 1, e: "As formas do mundo resultam de decisões humanas, não são determinadas por sistemas tecnológicos ou económicos." },

  // AULA 2
  { id: "a2-1", aula: 2, nivel: 1, p: "Design é o ponto de encontro entre…", o: ["Arte e Técnica", "Ciência e Religião", "Moda e Mercado", "Teoria e Prática"], c: 0, e: "Arte → Técnica → Design." },
  { id: "a2-2", aula: 2, nivel: 1, p: "A arte procura sobretudo…", o: ["o bom com propósito", "o belo sem finalidade", "o útil e barato", "a produção em série"], c: 1, e: "A arte busca o belo sem finalidade; a técnica busca o bom com propósito." },
  { id: "a2-3", aula: 2, nivel: 1, p: "Quais os três elementos fundamentais do design contemporâneo?", o: ["Forma, função, comunicação", "Cor, linha, volume", "Preço, marca, canal", "Arte, ciência, política"], c: 0, e: "A comunicação surge como terceiro elemento, complementando forma e função." },
  { id: "a2-4", aula: 2, nivel: 2, p: "Quem criou os «ready-mades», como «A Fonte» (1917)?", o: ["Marcel Duchamp", "Wassily Kandinsky", "William Morris", "Peter Behrens"], c: 0, e: "Duchamp apresentou objetos industriais como arte: «a arte não é o objeto, mas a ideia que o torna arte»." },
  { id: "a2-5", aula: 2, nivel: 2, p: "Qual a origem provável da palavra «design»?", o: ["Alemã (Gestaltung)", "Italiana (disegno), usada em Inglaterra como design", "Grega (techné)", "Francesa (dessein) apenas"], c: 1, e: "Em português não temos tradução direta." },
  { id: "a2-6", aula: 2, nivel: 2, p: "A função de um objeto no design pode ser de ordem…", o: ["apenas técnica", "técnica, estética e/ou simbólica", "apenas simbólica", "económica e política"], c: 1, e: "Estas componentes são hoje consideradas num processo de design." },
  { id: "a2-7", aula: 2, nivel: 3, p: "O que sustentava a estética moderna desde Kant, segundo a aula?", o: ["Que forma e função se observam em simultâneo", "Que era impossível observar forma e função em simultâneo: foca-se um aspeto de cada vez", "Que a função é irrelevante", "Que o artesanato é superior à arte"], c: 1, e: "O design surge para unir o belo e o bom num mesmo ato de criação." },
  { id: "a2-8", aula: 2, nivel: 3, p: "O design emergiu como fusão de arte e técnica para responder a…", o: ["necessidades da produção industrial em massa", "exigências da Igreja medieval", "mercados do Renascimento", "coleções de museus"], c: 0, e: "A «imagem técnica» das embalagens industriais ilustra esta união." },
  { id: "a2-9", aula: 2, nivel: 2, p: "A Revolução Francesa (1789) marca o início de que idade?", o: ["Idade Moderna", "Idade Contemporânea", "Idade Média", "Idade Antiga"], c: 1, e: "Idade Moderna: 1453–1789. Contemporânea: de 1789 até hoje." },

  // AULA 3
  { id: "a3-1", aula: 3, nivel: 1, p: "Onde e quando começou a Revolução Industrial?", o: ["França, início do séc. XVII", "Reino Unido, final do séc. XVIII", "Alemanha, séc. XX", "EUA, séc. XIX"], c: 1, e: "Impulsionada por avanços como a máquina a vapor e a expansão do comércio." },
  { id: "a3-2", aula: 3, nivel: 1, p: "O Taylorismo também se chama…", o: ["Arts and Crafts", "Organização científica do trabalho", "Estilo internacional", "Gesamtkunstwerk"], c: 1, e: "Maximiza a eficiência através da análise, divisão e padronização das tarefas." },
  { id: "a3-3", aula: 3, nivel: 1, p: "Que carro simboliza a estandardização e o «automóvel para todos»?", o: ["Ford Modelo T (1908)", "Volkswagen Carocha", "Mini Cooper", "Tesla Model S"], c: 0, e: "O tempo de produção caiu de cerca de 12 horas para cerca de 2 horas." },
  { id: "a3-4", aula: 3, nivel: 2, p: "Qual NÃO é um princípio do Taylorismo?", o: ["Divisão de tarefas", "Tempo e movimento", "Supervisão e controlo", "Valorização do trabalho artesanal único"], c: 3, e: "O Taylorismo padroniza ferramentas e métodos; o trabalho artesanal é o ideal do Arts and Crafts." },
  { id: "a3-5", aula: 3, nivel: 2, p: "A «beleza racional» defende que…", o: ["a estética resulta da eficiência e simplicidade", "o ornamento é a essência do belo", "a beleza é só subjetiva", "o belo vem da natureza"], c: 0, e: "A forma segue a função; inspirada no racionalismo e no Iluminismo." },
  { id: "a3-6", aula: 3, nivel: 2, p: "Que nova classe nasce do êxodo rural e da concentração nas fábricas?", o: ["Nobreza", "Proletariado", "Clero", "Artesãos de corporação"], c: 1, e: "Jornadas longas e salários baixos geraram movimentos sociais e políticos." },
  { id: "a3-7", aula: 3, nivel: 3, p: "Qual é um desafio (desvantagem) da estandardização?", o: ["Aumento de custos", "Redução de variedade e personalização", "Menor produtividade", "Manutenção mais difícil"], c: 1, e: "Outros desafios: alienação do consumidor e impacto ambiental." },
  { id: "a3-8", aula: 3, nivel: 3, p: "Como mudou o papel do designer com a industrialização?", o: ["Passou a fabricar cada peça à mão", "Passou a idealizador/planeador; a fabricação ficou a cargo dos operários", "Desapareceu", "Passou a ser apenas vendedor"], c: 1, e: "Houve separação entre design e produção." },
  { id: "a3-9", aula: 3, nivel: 2, p: "Que valor passa a prevalecer nos produtos de massa?", o: ["Decoração", "Praticidade e eficiência", "Raridade", "Simbolismo religioso"], c: 1, e: "Estética funcional: sóbria, racional e simplificada." },

  // AULA 4 – Arts and Crafts
  { id: "a4-1", aula: 4, nivel: 1, p: "Quem liderou o movimento Arts and Crafts?", o: ["William Morris", "Walter Gropius", "Victor Horta", "Hermann Muthesius"], c: 0, e: "Designer, poeta e ativista político, influenciado por Ruskin." },
  { id: "a4-2", aula: 4, nivel: 1, p: "O Arts and Crafts surge como reação a…", o: ["Renascimento", "Revolução Industrial e produção em massa", "Bauhaus", "Taylorismo digital"], c: 1, e: "Inglaterra, segunda metade do séc. XIX." },
  { id: "a4-3", aula: 4, nivel: 1, p: "Quem inspirou a visão ética do movimento, defendendo o trabalho como expressão criativa?", o: ["John Ruskin", "Henry Ford", "Frederick Taylor", "Mies van der Rohe"], c: 0, e: "Ruskin influenciou profundamente Morris." },
  { id: "a4-4", aula: 4, nivel: 2, p: "Qual NÃO foi uma crítica do Arts and Crafts à industrialização?", o: ["Desumanização do trabalho", "Perda de qualidade e originalidade", "Falta de conexão entre criador e objeto", "Excesso de ornamento nos produtos de massa"], c: 3, e: "Criticavam a falta de beleza e estética; defendiam a beleza no quotidiano." },
  { id: "a4-5", aula: 4, nivel: 2, p: "Que inspirava os desenhos de Morris?", o: ["Formas naturais e medievais", "Geometria pura", "Máquinas e engrenagens", "Tipografia suíça"], c: 0, e: "Móveis, tapeçarias e papéis de parede feitos à mão." },
  { id: "a4-6", aula: 4, nivel: 2, p: "Na era artesanal, design e produção eram…", o: ["integrados: cada objeto era único", "separados por classes", "automatizados", "feitos por fábricas"], c: 0, e: "O artesão controlava todas as etapas." },
  { id: "a4-7", aula: 4, nivel: 3, p: "Qual o legado do Arts and Crafts?", o: ["Valorizou a estética dos objetos do quotidiano, a coerência forma-função e as oficinas/escolas", "Defendeu a total eliminação da arte", "Criou a linha de montagem", "Inventou o Estilo Internacional"], c: 0, e: "Fundou escolas e oficinas de técnicas artesanais e design." },
  { id: "a4-8", aula: 4, nivel: 3, p: "Para o Arts and Crafts, o excesso de consumo e a produção sem sentido eram…", o: ["sinal de progresso", "desperdício de recursos e de cultura", "inevitáveis e positivos", "irrelevantes"], c: 1, e: "Os objetos deviam durar e ter valor intrínseco." },

  // AULA 5 – Arte Nova
  { id: "a5-1", aula: 5, nivel: 1, p: "Entre que datas se desenvolveu a Arte Nova?", o: ["1650–1700", "1890–1910", "1925–1945", "1960–1980"], c: 1, e: "Fenómeno internacional na Europa, EUA e até Japão." },
  { id: "a5-2", aula: 5, nivel: 1, p: "Qual a característica visual mais marcante da Arte Nova?", o: ["Linha orgânica e fluida, inspirada na natureza", "Linhas retas e rígidas", "Cubos e grelhas", "Ausência total de forma"], c: 0, e: "Plantas, flores, vinhas, conchas, asas de insetos." },
  { id: "a5-3", aula: 5, nivel: 1, p: "Quem projetou as entradas do Metro de Paris (1899–1904) em ferro forjado?", o: ["Hector Guimard", "Victor Horta", "Peter Behrens", "Marcel Breuer"], c: 0, e: "Exemplo icónico da Arte Nova em ferro." },
  { id: "a5-4", aula: 5, nivel: 2, p: "A Casa Tassel (Bruxelas, 1892–93) é obra de…", o: ["Victor Horta", "Henry Ford", "Mies van der Rohe", "Gropius"], c: 0, e: "Considerada um dos primeiros exemplos de arquitetura Arte Nova." },
  { id: "a5-5", aula: 5, nivel: 2, p: "O conceito de «obra total» (Gesamtkunstwerk) na Arte Nova significa…", o: ["só a arquitetura importa", "que cada elemento, da arquitetura à tipografia, fala a mesma linguagem visual", "que a obra é feita por uma só pessoa", "que se rejeita a indústria"], c: 1, e: "O artista é também designer e o designer também artista." },
  { id: "a5-6", aula: 5, nivel: 2, p: "Que materiais modernos usava a Arte Nova?", o: ["Ferro fundido, vidro plano, aço, cerâmica vitrificada", "Só madeira e pedra", "Plástico e alumínio", "Só materiais naturais"], c: 0, e: "Une o orgânico e o tecnológico." },
  { id: "a5-7", aula: 5, nivel: 3, p: "O que simboliza a linha curva na Arte Nova?", o: ["Vida, crescimento e força vital", "Rigidez industrial", "Neutralidade", "Eficiência produtiva"], c: 0, e: "Visão romântica da natureza em oposição à mecanização." },
  { id: "a5-8", aula: 5, nivel: 3, p: "Que figura belga, pioneira, defendia o design funcional, belo e acessível a todos?", o: ["Henry van de Velde", "Hannes Meyer", "Anni Albers", "Duchamp"], c: 0, e: "Ligado à Arte Nova e ao caminho para o modernismo; mais tarde fundador do Werkbund." },

  // AULA 6 – Werkbund
  { id: "a6-1", aula: 6, nivel: 1, p: "Quando e onde foi fundado o Deutscher Werkbund?", o: ["1907, Alemanha", "1919, Weimar", "1851, Londres", "1933, Berlim"], c: 0, e: "Associação de trabalhadores alemães, de designers e arquitetos." },
  { id: "a6-2", aula: 6, nivel: 1, p: "Qual a diferença central face ao Arts and Crafts?", o: ["O Werkbund defendia a máquina e uma estética para a produção em série", "O Werkbund rejeitava a indústria", "Eram idênticos", "O Werkbund defendia o ornamento"], c: 0, e: "«Se o inimigo não for a máquina, mas a forma como a usamos.»" },
  { id: "a6-3", aula: 6, nivel: 1, p: "Peter Behrens foi contratado em 1907 pela…", o: ["AEG", "Ford", "Siemens Mobile", "Bauhaus"], c: 0, e: "Criou uma identidade corporativa coesa: edifícios, lâmpadas, ventiladores." },
  { id: "a6-4", aula: 6, nivel: 2, p: "Que ideia o Werkbund rejeita?", o: ["Beleza funcional", "Acessibilidade", "Ornamento desnecessário", "Integração arte-indústria"], c: 2, e: "Simplicidade funcional e rejeição do ornamento." },
  { id: "a6-5", aula: 6, nivel: 2, p: "Que conceito Behrens ajudou a estabelecer?", o: ["Identidade corporativa", "Arte conceptual", "Gesamtkunstwerk orgânico", "Estilo barroco"], c: 0, e: "É considerado um dos primeiros designers industriais do mundo." },
  { id: "a6-6", aula: 6, nivel: 2, p: "Qual era o grande desafio que o Werkbund tentava responder?", o: ["Como conciliar arte, indústria e dignidade humana no mundo das máquinas", "Como voltar ao feudalismo", "Como vender mais carros", "Como abolir escolas"], c: 0, e: "A questão de fundo do movimento." },
  { id: "a6-7", aula: 6, nivel: 3, p: "Que corrente alemã ligada ao Art Nouveau precedeu fundadores como Van de Velde e Behrens?", o: ["Jugendstil", "Dadaísmo", "Cubismo", "Surrealismo"], c: 0, e: "Vários fundadores vinham do Jugendstil." },
  { id: "a6-8", aula: 6, nivel: 3, p: "O legado do Werkbund foi…", o: ["abrir caminho para a Bauhaus", "extinguir o design", "regressar ao artesanato puro", "criar o Taylorismo"], c: 0, e: "Gropius entrou em 1910 e fundaria a Bauhaus." },
  { id: "a6-9", aula: 6, nivel: 2, p: "Que características tem a «fábrica moderna» de Behrens?", o: ["Linhas limpas, formas geométricas, funcionalidade", "Ornamento floral", "Ruínas góticas", "Linhas orgânicas"], c: 0, e: "A fábrica de turbinas da AEG é exemplo notável." },

  // AULA 7 – Bauhaus
  { id: "a7-1", aula: 7, nivel: 1, p: "Quem fundou a Bauhaus em 1919?", o: ["Walter Gropius", "William Morris", "Hector Guimard", "Duchamp"], c: 0, e: "Escola que queria unir arte, técnica e indústria." },
  { id: "a7-2", aula: 7, nivel: 1, p: "Quais as três fases/cidades da Bauhaus, por ordem?", o: ["Weimar → Dessau → Berlim", "Berlim → Weimar → Dessau", "Dessau → Berlim → Weimar", "Weimar → Berlim → Dessau"], c: 0, e: "Weimar (o sonho), Dessau (a máquina), Berlim (a resistência)." },
  { id: "a7-3", aula: 7, nivel: 1, p: "Em que ano a Gestapo forçou o encerramento da Bauhaus?", o: ["1933", "1919", "1945", "1907"], c: 0, e: "Os mestres emigraram e espalharam a Bauhaus pelo mundo." },
  { id: "a7-4", aula: 7, nivel: 2, p: "Quem criou o curso preliminar (Vorkurs) em Weimar?", o: ["Johannes Itten", "Mies van der Rohe", "Hannes Meyer", "Marcel Breuer"], c: 0, e: "Baseado em cor, forma, matéria e autoexpressão; seguidor do Mazdaznan." },
  { id: "a7-5", aula: 7, nivel: 2, p: "Qual a estética dominante da fase de Dessau?", o: ["Geometria pura, cores primárias, tipografia funcional, sem ornamento", "Expressionismo místico", "Linhas orgânicas", "Barroco"], c: 0, e: "É aqui que nasce a estética «Bauhaus» como hoje a conhecemos." },
  { id: "a7-6", aula: 7, nivel: 2, p: "A frase «A necessidade e não a forma determina o produto» é de…", o: ["Hannes Meyer", "Gropius", "Itten", "Kandinsky"], c: 0, e: "Meyer dirigiu a escola em 1928–1930, com foco social (habitação social)." },
  { id: "a7-7", aula: 7, nivel: 2, p: "Quem é associado ao «menos é mais» e foi o último diretor?", o: ["Mies van der Rohe", "Marcel Breuer", "Klee", "Anni Albers"], c: 0, e: "Dirigiu a escola em 1930–33." },
  { id: "a7-8", aula: 7, nivel: 3, p: "Qual a única mestra mulher da Bauhaus, na tecelagem?", o: ["Gunta Stölzl", "Marianne Brandt", "Anni Albers", "Lou Scheper-Berkenkamp"], c: 0, e: "As mulheres eram frequentemente direcionadas para a tecelagem." },
  { id: "a7-9", aula: 7, nivel: 3, p: "Que papel teve Kandinsky na Bauhaus?", o: ["Lecionou teoria da forma, cor e composição (1922–33)", "Dirigiu a escola em Berlim", "Criou a cadeira de tubo de aço", "Fundou o Werkbund"], c: 0, e: "Procurava uma «gramática visual universal»." },
  { id: "a7-10", aula: 7, nivel: 3, p: "Que criou Marcel Breuer?", o: ["A cadeira de tubo de aço (Wassily)", "O Modulor", "A Casa Tassel", "Os ready-mades"], c: 0, e: "Pioneiro do mobiliário tubular." },
  { id: "a7-11", aula: 7, nivel: 3, p: "Como a Bauhaus integrava o ensino da cor?", o: ["Expressiva (Kandinsky) e científica/construtiva (Itten)", "Só científica", "Só decorativa", "Não ensinava cor"], c: 0, e: "Integrou arte e ciência." },
];

// ---- LINHA DO TEMPO ----
export type Evento = { id: string; t: string; ano: number; aula: Aula };
export const EVENTOS: Evento[] = [
  { id: "e1", t: "Início da Revolução Industrial (Reino Unido)", ano: 1780, aula: 3 },
  { id: "e2", t: "Revolução Francesa: início da Idade Contemporânea", ano: 1789, aula: 2 },
  { id: "e3", t: "Arts and Crafts: reação de William Morris à industrialização", ano: 1860, aula: 4 },
  { id: "e4", t: "Casa Tassel (Victor Horta)", ano: 1892, aula: 5 },
  { id: "e5", t: "Entradas do Metro de Paris (Guimard)", ano: 1899, aula: 5 },
  { id: "e6", t: "Fundação do Deutscher Werkbund", ano: 1907, aula: 6 },
  { id: "e7", t: "Peter Behrens na AEG", ano: 1907.5, aula: 6 },
  { id: "e8", t: "Ford Modelo T e a linha de montagem", ano: 1908, aula: 3 },
  { id: "e9", t: "«A Fonte» de Duchamp", ano: 1917, aula: 2 },
  { id: "e10", t: "Fundação da Bauhaus em Weimar", ano: 1919, aula: 7 },
  { id: "e11", t: "Bauhaus muda-se para Dessau", ano: 1925, aula: 7 },
  { id: "e12", t: "Hannes Meyer dirige a Bauhaus", ano: 1928, aula: 7 },
  { id: "e13", t: "Mies van der Rohe dirige a Bauhaus", ano: 1930, aula: 7 },
  { id: "e14", t: "Bauhaus em Berlim", ano: 1932, aula: 7 },
  { id: "e15", t: "Gestapo encerra a Bauhaus", ano: 1933, aula: 7 },
];

// ---- QUEM SOU EU ----
export const MOVIMENTOS = ["Arts and Crafts", "Arte Nova", "Werkbund", "Bauhaus", "Taylorismo / Industrialização"] as const;
export type Mov = (typeof MOVIMENTOS)[number];
export type Pista = { id: string; t: string; m: Mov; aula: Aula };
export const PISTAS: Pista[] = [
  { id: "p1", t: "William Morris", m: "Arts and Crafts", aula: 4 },
  { id: "p2", t: "John Ruskin", m: "Arts and Crafts", aula: 4 },
  { id: "p3", t: "Papéis de parede feitos à mão com formas naturais e medievais", m: "Arts and Crafts", aula: 4 },
  { id: "p4", t: "Victor Horta", m: "Arte Nova", aula: 5 },
  { id: "p5", t: "Hector Guimard", m: "Arte Nova", aula: 5 },
  { id: "p6", t: "Linha orgânica e fluida inspirada em plantas e flores", m: "Arte Nova", aula: 5 },
  { id: "p7", t: "Gesamtkunstwerk (obra total)", m: "Arte Nova", aula: 5 },
  { id: "p8", t: "Peter Behrens e a AEG", m: "Werkbund", aula: 6 },
  { id: "p9", t: "Hermann Muthesius", m: "Werkbund", aula: 6 },
  { id: "p10", t: "«O inimigo não é a máquina, mas a forma como a usamos»", m: "Werkbund", aula: 6 },
  { id: "p11", t: "Johannes Itten e o Vorkurs", m: "Bauhaus", aula: 7 },
  { id: "p12", t: "Gunta Stölzl", m: "Bauhaus", aula: 7 },
  { id: "p13", t: "Marianne Brandt (candeeiros e utensílios em metal)", m: "Bauhaus", aula: 7 },
  { id: "p14", t: "Marcel Breuer e a cadeira de tubo de aço", m: "Bauhaus", aula: 7 },
  { id: "p15", t: "Frederick Taylor: tempo e movimento", m: "Taylorismo / Industrialização", aula: 3 },
  { id: "p16", t: "Henry Ford e a linha de montagem", m: "Taylorismo / Industrialização", aula: 3 },
  { id: "p17", t: "Estandardização e componentes intercambiáveis", m: "Taylorismo / Industrialização", aula: 3 },
];

// ---- OLHAR DE DESIGNER (descrições textuais; sem imagens com direitos) ----
export type Caso = { id: string; desc: string; m: Mov; pistas: string[]; aula: Aula };
export const CASOS: Caso[] = [
  { id: "c1", desc: "Uma entrada de metro em ferro forjado com hastes curvas que lembram caules de plantas, com vidro em forma de pétala.", m: "Arte Nova", pistas: ["linhas orgânicas", "inspiração na natureza", "ferro e vidro"], aula: 5 },
  { id: "c2", desc: "Uma cadeira de tubo de aço dobrado com couro esticado, sem qualquer ornamento, pensada para produção em série.", m: "Bauhaus", pistas: ["geometria", "materiais industriais", "ausência de ornamento"], aula: 7 },
  { id: "c3", desc: "Um papel de parede estampado à mão com folhagem e flores, produzido numa oficina que valoriza o trabalho do artesão.", m: "Arts and Crafts", pistas: ["feito à mão", "formas naturais", "valorização do artesão"], aula: 4 },
  { id: "c4", desc: "Uma fábrica de turbinas de linhas limpas e formas geométricas, com identidade visual coesa da empresa até aos produtos.", m: "Werkbund", pistas: ["identidade corporativa", "funcionalidade", "formas geométricas"], aula: 6 },
  { id: "c5", desc: "Um cartaz com tipografia funcional, cores primárias, composição geométrica e nenhum ornamento.", m: "Bauhaus", pistas: ["cores primárias", "tipografia funcional", "geometria pura"], aula: 7 },
  { id: "c6", desc: "Uma casa em que a escada, os candeeiros, o mobiliário e os mosaicos partilham a mesma curva fluida.", m: "Arte Nova", pistas: ["obra total", "curva fluida", "integração das artes"], aula: 5 },
];

// ---- SIMULAÇÃO FÁBRICA 1907 ----
export type Efeito = { custo: number; qualidade: number; identidade: number; social: number };
export type Cenario = { id: string; aula: Aula; titulo: string; texto: string; opcoes: { t: string; ef: Efeito; fb: string }[] };
export const CENARIOS: Cenario[] = [
  { id: "s1", aula: 3, titulo: "Linha de montagem", texto: "Como administrador, quer baixar o preço de um produto para o tornar acessível. Como produz?", opcoes: [
    { t: "Linha de montagem com peças estandardizadas", ef: { custo: 3, qualidade: 0, identidade: -1, social: 1 }, fb: "Como o Ford T: mais barato e acessível, mas menos variedade e personalização." },
    { t: "Manter a produção artesanal peça a peça", ef: { custo: -3, qualidade: 2, identidade: 2, social: -1 }, fb: "Mantém originalidade e qualidade, mas o produto fica caro e menos acessível." },
    { t: "Linha de montagem, mas com departamento de design a criar linguagem própria", ef: { custo: 2, qualidade: 1, identidade: 2, social: 1 }, fb: "Aproxima-se da solução do Werkbund: indústria com design pensado." },
  ] },
  { id: "s2", aula: 3, titulo: "Taylorismo", texto: "Os operários demoram a executar cada tarefa. Qual a decisão?", opcoes: [
    { t: "Cronometrar cada tarefa e dividir o trabalho em pequenas etapas", ef: { custo: 3, qualidade: 0, identidade: 0, social: -2 }, fb: "Taylorismo: aumenta a produtividade, mas desumaniza o trabalho (crítica do Arts and Crafts)." },
    { t: "Envolver os trabalhadores na conceção do produto", ef: { custo: -1, qualidade: 2, identidade: 1, social: 2 }, fb: "Mais ligação criador-objeto, menos eficiência imediata." },
  ] },
  { id: "s3", aula: 6, titulo: "A identidade da AEG", texto: "Contrata Peter Behrens. Qual o seu brief?", opcoes: [
    { t: "Desenhar só os produtos novos", ef: { custo: 1, qualidade: 1, identidade: 0, social: 0 }, fb: "Resultado fragmentado." },
    { t: "Desenhar edifícios, produtos, gráfica e comunicação com a mesma linguagem", ef: { custo: -1, qualidade: 2, identidade: 3, social: 1 }, fb: "Nasce a identidade corporativa moderna (AEG, 1907)." },
    { t: "Aplicar ornamento floral para parecer mais caro", ef: { custo: -1, qualidade: 0, identidade: -1, social: -1 }, fb: "O Werkbund rejeita o ornamento desnecessário." },
  ] },
  { id: "s4", aula: 4, titulo: "A resposta de Morris", texto: "A sua oficina recebe encomendas em massa. O que decide?", opcoes: [
    { t: "Produzir tudo à mão, sem compromissos", ef: { custo: -3, qualidade: 3, identidade: 2, social: -1 }, fb: "Qualidade e originalidade máximas, mas só uma elite compra." },
    { t: "Mecanizar para baixar o preço", ef: { custo: 3, qualidade: -2, identidade: -2, social: 1 }, fb: "Acessível, mas perde-se o que o Arts and Crafts defendia." },
  ] },
  { id: "s5", aula: 7, titulo: "A direção da Bauhaus", texto: "Dirige a escola em 1928. Qual a prioridade do ensino?", opcoes: [
    { t: "Misticismo e autoexpressão (estilo Itten)", ef: { custo: -1, qualidade: 1, identidade: 1, social: 0 }, fb: "Foi a fase de Weimar, mais expressionista." },
    { t: "Necessidades reais e habitação social (estilo Hannes Meyer)", ef: { custo: 1, qualidade: 1, identidade: 1, social: 3 }, fb: "«A necessidade e não a forma determina o produto»." },
    { t: "Purismo formal e minimalismo (estilo Mies)", ef: { custo: 0, qualidade: 2, identidade: 2, social: 0 }, fb: "«Menos é mais»: rigor e disciplina." },
  ] },
  { id: "s6", aula: 5, titulo: "Materiais da Arte Nova", texto: "Vai desenhar um edifício em 1895. Que materiais escolhe?", opcoes: [
    { t: "Ferro, vidro e aço com formas orgânicas", ef: { custo: 0, qualidade: 2, identidade: 3, social: 1 }, fb: "É a síntese Arte Nova: orgânico + tecnológico." },
    { t: "Pedra e ornamento historicista", ef: { custo: -1, qualidade: 1, identidade: -1, social: 0 }, fb: "Fica agarrado ao passado." },
  ] },
];

export const DIMENSOES = ["Conhecimento", "Cronologia", "Associação", "Análise visual", "Pensamento crítico", "Consistência"] as const;
export type Dim = (typeof DIMENSOES)[number];
