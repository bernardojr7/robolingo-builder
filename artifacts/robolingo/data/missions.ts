import type { InterestId } from '@/context/AppContext';
import type { CurriculumYearId, EnglishLevelId, RegionId, SkillId } from '@/data/gameDesign';

export type DailyMission = {
  id: string;
  interest: InterestId;
  icon: string;
  skill: string;
  year: CurriculumYearId;
  unit: string;
  topic: string;
  skills: SkillId[];
  region: RegionId;
  difficulty: EnglishLevelId;
  title: string;
  description: string;
  intro: string;
  tip: string;
  question: string;
  hint: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

const MISSIONS: Record<InterestId, DailyMission> = {
  games: {
    id: 'g6-hello',
    interest: 'games',
    icon: 'game-controller-outline',
    skill: 'Games',
    year: '6',
    unit: 'Unit 1 · Hello, world',
    topic: 'Everyday requests',
    skills: ['grammar', 'vocabulary', 'speaking'],
    region: 'village',
    difficulty: 'explorer',
    title: 'Uma partida em inglês',
    description: 'Aprenda uma frase útil para jogar em equipe.',
    intro: 'Hoje vamos praticar uma frase que aparece muito durante uma partida. Escolha a opção que um jogador usaria para pedir ajuda.',
    tip: '“Help me” significa “me ajude”.',
    question: '___ me! The enemy is coming.',
    hint: 'Complete o pedido de ajuda.',
    options: ['Help', 'Helps', 'Helping'],
    correctIndex: 0,
    explanation: 'Muito bem. Usamos “Help me!” para pedir ajuda de forma direta.',
  },
  futebol: {
    id: 'g6-routine',
    interest: 'futebol',
    icon: 'football-outline',
    skill: 'Futebol',
    year: '6',
    unit: 'Unit 2 · My routine',
    topic: 'Actions and routines',
    skills: ['grammar', 'vocabulary', 'speaking'],
    region: 'village',
    difficulty: 'explorer',
    title: 'Jogue como um local',
    description: 'Aprenda a chamar um passe durante o jogo.',
    intro: 'A bola está chegando e você quer pedir um passe. Escolha a frase mais natural para o momento.',
    tip: '“Pass me the ball” significa “passe a bola para mim”.',
    question: '___ me the ball, please!',
    hint: 'Escolha o verbo no imperativo.',
    options: ['Pass', 'Passes', 'Passing'],
    correctIndex: 0,
    explanation: '“Pass me the ball” é a forma natural de pedir um passe.',
  },
  moda: {
    id: 'g6-describe',
    interest: 'moda',
    icon: 'shirt-outline',
    skill: 'Moda',
    year: '6',
    unit: 'Unit 2 · My routine',
    topic: 'Describing people and things',
    skills: ['vocabulary', 'grammar'],
    region: 'village',
    difficulty: 'explorer',
    title: 'Escolha o look',
    description: 'Descreva uma peça de roupa em inglês.',
    intro: 'Você está montando um look e quer falar sobre a sua camiseta favorita.',
    tip: '“Blue” significa “azul” e vem antes do substantivo.',
    question: 'I like my ___ shirt.',
    hint: 'Qual palavra descreve a cor?',
    options: ['blue', 'blues', 'bluing'],
    correctIndex: 0,
    explanation: 'Em inglês, a cor vem antes da peça: “my blue shirt”.',
  },
  musica: {
    id: 'g7-people',
    interest: 'musica',
    icon: 'musical-notes-outline',
    skill: 'Música',
    year: '7',
    unit: 'Unit 1 · People and places',
    topic: 'Hobbies and preferences',
    skills: ['grammar', 'vocabulary', 'listening'],
    region: 'forest',
    difficulty: 'adventurer',
    title: 'Monte sua playlist',
    description: 'Fale sobre o que você gosta de ouvir.',
    intro: 'Você está mostrando uma música para alguém. Complete a frase sobre o seu gosto musical.',
    tip: 'Depois de “I like”, usamos o verbo com “-ing” para falar de uma atividade.',
    question: 'I like ___ to music.',
    hint: 'Complete com “ouvir”.',
    options: ['listen', 'listening', 'listens'],
    correctIndex: 1,
    explanation: '“I like listening to music” significa “eu gosto de ouvir música”.',
  },
  anime: {
    id: 'g7-stories',
    interest: 'anime',
    icon: 'sparkles-outline',
    skill: 'Anime',
    year: '7',
    unit: 'Unit 2 · Stories',
    topic: 'Characters and actions',
    skills: ['reading', 'vocabulary', 'speaking'],
    region: 'forest',
    difficulty: 'adventurer',
    title: 'Uma fala de personagem',
    description: 'Pratique uma frase de ação e coragem.',
    intro: 'Seu personagem está pronto para a próxima aventura. Complete a fala antes da batalha.',
    tip: '“Ready” significa “pronto” ou “pronta”.',
    question: 'I am ___ for the next adventure.',
    hint: 'Escolha a palavra que significa “pronto”.',
    options: ['ready', 'read', 'reads'],
    correctIndex: 0,
    explanation: '“I am ready” é a forma correta de dizer “eu estou pronto”.',
  },
  culinaria: {
    id: 'g7-clues',
    interest: 'culinaria',
    icon: 'restaurant-outline',
    skill: 'Culinária',
    year: '7',
    unit: 'Unit 2 · Stories',
    topic: 'Instructions and sequence',
    skills: ['reading', 'grammar'],
    region: 'forest',
    difficulty: 'adventurer',
    title: 'Receita em inglês',
    description: 'Aprenda a pedir um ingrediente.',
    intro: 'Você está preparando uma receita e percebeu que falta um ingrediente importante.',
    tip: '“Need” significa “precisar”.',
    question: 'We ___ two eggs for the recipe.',
    hint: 'Complete com “precisamos”.',
    options: ['need', 'needs', 'needing'],
    correctIndex: 0,
    explanation: 'Com “we”, usamos “need”: “We need two eggs”.',
  },
  leitura: {
    id: 'g8-world',
    interest: 'leitura',
    icon: 'book-outline',
    skill: 'Leitura',
    year: '8',
    unit: 'Unit 1 · Around the world',
    topic: 'Reading for detail',
    skills: ['reading', 'vocabulary'],
    region: 'beach',
    difficulty: 'hero',
    title: 'Entre as páginas',
    description: 'Entenda uma frase curta de uma história.',
    intro: 'Você encontrou uma frase em um livro e precisa entender o que o personagem está fazendo.',
    tip: '“Quietly” significa “silenciosamente”.',
    question: 'The girl reads the book ___.',
    hint: 'Escolha a palavra que indica como ela lê.',
    options: ['quietly', 'quiet', 'quieter'],
    correctIndex: 0,
    explanation: '“Quietly” é o advérbio que explica como ela lê.',
  },
  matematica: {
    id: 'g8-conversations',
    interest: 'matematica',
    icon: 'calculator-outline',
    skill: 'Matemática',
    year: '8',
    unit: 'Unit 1 · Around the world',
    topic: 'Numbers and information',
    skills: ['listening', 'grammar'],
    region: 'beach',
    difficulty: 'hero',
    title: 'English com números',
    description: 'Pratique como dizer uma operação simples.',
    intro: 'Você está resolvendo uma conta e precisa dizer o resultado em inglês.',
    tip: '“Equals” significa “é igual a”.',
    question: 'Two plus three ___ five.',
    hint: 'Complete com “é igual a”.',
    options: ['equal', 'equals', 'equalling'],
    correctIndex: 1,
    explanation: '“Two plus three equals five” é a frase correta.',
  },
  ciencia: {
    id: 'g8-real',
    interest: 'ciencia',
    icon: 'flask-outline',
    skill: 'Ciência',
    year: '8',
    unit: 'Unit 2 · Real conversations',
    topic: 'Describing what is happening',
    skills: ['grammar', 'speaking', 'listening'],
    region: 'city',
    difficulty: 'hero',
    title: 'Descoberta no laboratório',
    description: 'Aprenda a descrever uma experiência.',
    intro: 'Você está observando um experimento e quer contar o que está acontecendo agora.',
    tip: 'Para algo acontecendo agora, usamos “is” + verbo com “-ing”.',
    question: 'The water is ___ now.',
    hint: 'Escolha “fervendo”.',
    options: ['boil', 'boils', 'boiling'],
    correctIndex: 2,
    explanation: '“Is boiling” descreve algo que está acontecendo neste momento.',
  },
  historia: {
    id: 'g8-past',
    interest: 'historia',
    icon: 'time-outline',
    skill: 'História',
    year: '8',
    unit: 'Unit 2 · Real conversations',
    topic: 'Past events',
    skills: ['grammar', 'reading'],
    region: 'city',
    difficulty: 'hero',
    title: 'Uma viagem no tempo',
    description: 'Fale sobre algo que aconteceu no passado.',
    intro: 'Você está contando uma curiosidade histórica para a sua turma.',
    tip: '“Yesterday” indica passado e combina com “was” para “I”.',
    question: 'Yesterday, I ___ at the museum.',
    hint: 'Complete com “estava”.',
    options: ['am', 'was', 'were'],
    correctIndex: 1,
    explanation: 'Com “I” no passado, usamos “was”: “I was at the museum”.',
  },
  geografia: {
    id: 'g9-global',
    interest: 'geografia',
    icon: 'globe-outline',
    skill: 'Geografia',
    year: '9',
    unit: 'Unit 1 · Global voices',
    topic: 'Places and perspectives',
    skills: ['reading', 'vocabulary', 'speaking'],
    region: 'airport',
    difficulty: 'legend',
    title: 'Explore o mapa',
    description: 'Aprenda a localizar um lugar.',
    intro: 'Você está olhando um mapa e quer dizer onde o Brasil está localizado.',
    tip: '“In” é usado para dizer que algo está dentro de um país ou região.',
    question: 'Brazil is ___ South America.',
    hint: 'Escolha a preposição correta.',
    options: ['on', 'at', 'in'],
    correctIndex: 2,
    explanation: 'Usamos “in” com regiões e continentes: “in South America”.',
  },
  hq: {
    id: 'g9-dialogue',
    interest: 'hq',
    icon: 'chatbox-ellipses-outline',
    skill: 'HQ',
    year: '9',
    unit: 'Unit 1 · Global voices',
    topic: 'Dialogue and meaning',
    skills: ['reading', 'listening', 'speaking'],
    region: 'airport',
    difficulty: 'legend',
    title: 'Balão de fala',
    description: 'Complete o diálogo de uma história.',
    intro: 'O herói encontrou uma pista. Escolha a pergunta que faz sentido no balão de fala.',
    tip: '“What” significa “o que” ou “qual”.',
    question: '___ is the secret door?',
    hint: 'Escolha a palavra usada para perguntar “onde”.',
    options: ['When', 'Where', 'Who'],
    correctIndex: 1,
    explanation: '“Where is the secret door?” significa “onde está a porta secreta?”.',
  },
  filme: {
    id: 'g9-media',
    interest: 'filme',
    icon: 'film-outline',
    skill: 'Filmes',
    year: '9',
    unit: 'Unit 2 · Future makers',
    topic: 'Opinions and media',
    skills: ['listening', 'speaking', 'vocabulary'],
    region: 'castle',
    difficulty: 'legend',
    title: 'Cena favorita',
    description: 'Fale sobre um filme que você gosta.',
    intro: 'Você está recomendando um filme para um amigo e quer dizer que gostou muito dele.',
    tip: '“Watched” é o passado de “watch”, assistir.',
    question: 'I ___ this movie last night.',
    hint: 'Complete com “assisti”.',
    options: ['watch', 'watched', 'watching'],
    correctIndex: 1,
    explanation: '“Last night” indica passado, então usamos “watched”.',
  },
  serie: {
    id: 'g9-future',
    interest: 'serie',
    icon: 'tv-outline',
    skill: 'Séries',
    year: '9',
    unit: 'Unit 2 · Future makers',
    topic: 'Ongoing actions',
    skills: ['grammar', 'listening'],
    region: 'castle',
    difficulty: 'legend',
    title: 'Próximo episódio',
    description: 'Converse sobre uma série que está acompanhando.',
    intro: 'Seu amigo quer saber se você continua assistindo à sua série favorita.',
    tip: 'Com “she”, usamos “is” no presente contínuo.',
    question: 'She ___ watching the new episode.',
    hint: 'Complete com “está”.',
    options: ['am', 'is', 'are'],
    correctIndex: 1,
    explanation: 'Com “she”, a forma correta é “She is watching”.',
  },
  viagem: {
    id: 'g9-world',
    interest: 'viagem',
    icon: 'airplane-outline',
    skill: 'Viagem',
    year: '9',
    unit: 'Unit 2 · Future makers',
    topic: 'Travel and independence',
    skills: ['speaking', 'vocabulary', 'listening'],
    region: 'future',
    difficulty: 'legend',
    title: 'No aeroporto',
    description: 'Aprenda uma frase essencial para viajar.',
    intro: 'Você chegou ao aeroporto e quer perguntar onde fica o portão de embarque.',
    tip: '“Where is...” significa “onde fica...?”.',
    question: '___ is gate twelve?',
    hint: 'Escolha a palavra usada para perguntar “onde”.',
    options: ['Where', 'What', 'Why'],
    correctIndex: 0,
    explanation: '“Where is gate twelve?” é a pergunta correta para localizar o portão.',
  },
};

export function getDailyMission(selectedThemes: InterestId[], completedMissions: number): DailyMission {
  const theme = selectedThemes[completedMissions % selectedThemes.length] ?? 'games';
  return MISSIONS[theme];
}

export function getCurriculumMissions(): DailyMission[] {
  return Object.values(MISSIONS);
}

export function getMissionById(id: string | undefined): DailyMission | undefined {
  return getCurriculumMissions().find((mission) => mission.id === id);
}

export function getSkillProgress(
  completedMissions: number,
  curriculumYear?: CurriculumYearId,
): Record<SkillId, number> {
  const curriculumMissions = getCurriculumMissions();
  const trackMissions = curriculumYear
    ? curriculumMissions.filter((mission) => mission.year === curriculumYear)
    : curriculumMissions;
  const completedMissionIds = new Set(
    curriculumMissions
      .slice(0, Math.min(Math.max(completedMissions, 0), curriculumMissions.length))
      .map((mission) => mission.id),
  );
  const totals: Record<SkillId, number> = {
    grammar: 0,
    vocabulary: 0,
    reading: 0,
    listening: 0,
    speaking: 0,
  };
  const completedTotals = { ...totals };
  trackMissions.forEach((mission) => mission.skills.forEach((skill) => (totals[skill] += 1)));
  trackMissions
    .filter((mission) => completedMissionIds.has(mission.id))
    .forEach((mission) => mission.skills.forEach((skill) => (completedTotals[skill] += 1)));
  return Object.fromEntries(
    Object.keys(totals).map((skill) => [
      skill,
      totals[skill as SkillId] ? Math.round((completedTotals[skill as SkillId] / totals[skill as SkillId]) * 100) : 0,
    ]),
  ) as Record<SkillId, number>;
}