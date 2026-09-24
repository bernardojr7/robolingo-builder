export type EnglishLevelId = 'explorer' | 'adventurer' | 'hero' | 'legend';

export type SkillId = 'grammar' | 'vocabulary' | 'reading' | 'listening' | 'speaking';

export type RegionId =
  | 'village'
  | 'forest'
  | 'beach'
  | 'city'
  | 'airport'
  | 'castle'
  | 'future';

export type Region = {
  id: RegionId;
  name: string;
  subtitle: string;
  icon: string;
  requirement: string;
  missionsRequired: number;
};

export const ENGLISH_LEVELS: Array<{
  id: EnglishLevelId;
  name: string;
  subtitle: string;
  portugueseShare: string;
}> = [
  {
    id: 'explorer',
    name: 'Explorer',
    subtitle: 'Eu reconheço',
    portugueseShare: '70–90% português',
  },
  {
    id: 'adventurer',
    name: 'Adventurer',
    subtitle: 'Eu começo a compreender',
    portugueseShare: '40–60% português',
  },
  {
    id: 'hero',
    name: 'Hero',
    subtitle: 'Eu consigo usar',
    portugueseShare: '10–20% português',
  },
  {
    id: 'legend',
    name: 'Legend',
    subtitle: 'Eu navego em inglês',
    portugueseShare: '100% inglês',
  },
];

export const SKILLS: Array<{ id: SkillId; label: string; icon: string }> = [
  { id: 'grammar', label: 'Gramática', icon: 'construct-outline' },
  { id: 'vocabulary', label: 'Vocabulário', icon: 'bulb-outline' },
  { id: 'reading', label: 'Leitura', icon: 'book-outline' },
  { id: 'listening', label: 'Listening', icon: 'ear-outline' },
  { id: 'speaking', label: 'Speaking', icon: 'mic-outline' },
];

export const REGIONS: Region[] = [
  {
    id: 'village',
    name: 'Robolingo Village',
    subtitle: 'Primeiras palavras e encontros',
    icon: 'home-outline',
    requirement: 'Região inicial',
    missionsRequired: 0,
  },
  {
    id: 'forest',
    name: 'Mystery Forest',
    subtitle: 'Rotina, descrições e pistas',
    icon: 'leaf-outline',
    requirement: 'Complete 5 missões',
    missionsRequired: 5,
  },
  {
    id: 'beach',
    name: 'Sunset Beach',
    subtitle: 'Viagens, lazer e conversas',
    icon: 'sunny-outline',
    requirement: 'Complete 8 missões',
    missionsRequired: 8,
  },
  {
    id: 'city',
    name: 'English City',
    subtitle: 'Situações reais e desafios',
    icon: 'business-outline',
    requirement: 'Complete 12 missões',
    missionsRequired: 12,
  },
  {
    id: 'airport',
    name: 'International Airport',
    subtitle: 'Inglês para o mundo',
    icon: 'airplane-outline',
    requirement: 'Complete 18 missões',
    missionsRequired: 18,
  },
  {
    id: 'castle',
    name: 'Mystery Castle',
    subtitle: 'Desafios para Heroes',
    icon: 'castle-outline',
    requirement: 'Alcance o nível 10',
    missionsRequired: 30,
  },
  {
    id: 'future',
    name: 'Future World',
    subtitle: 'Conteúdo e desafios especiais',
    icon: 'rocket-outline',
    requirement: 'Alcance o nível 20',
    missionsRequired: 60,
  },
];

export const ACHIEVEMENTS: Array<{
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: (missions: number, streak: number, level: number) => boolean;
}> = [
  {
    id: 'first-mission',
    title: 'First Mission',
    description: 'Complete sua primeira missão',
    icon: 'flag-outline',
    requirement: (missions) => missions >= 1,
  },
  {
    id: 'word-collector',
    title: 'Word Collector',
    description: 'Complete 10 missões de vocabulário',
    icon: 'book-outline',
    requirement: (missions) => missions >= 10,
  },
  {
    id: 'seven-day-streak',
    title: '7-Day Streak',
    description: 'Estude durante 7 dias consecutivos',
    icon: 'flame-outline',
    requirement: (_missions, streak) => streak >= 7,
  },
  {
    id: 'hero-in-training',
    title: 'Hero in Training',
    description: 'Alcance o nível 10',
    icon: 'shield-checkmark-outline',
    requirement: (_missions, _streak, level) => level >= 10,
  },
];

export function getEnglishLevel(level: number) {
  if (level >= 30) return ENGLISH_LEVELS[3];
  if (level >= 10) return ENGLISH_LEVELS[2];
  if (level >= 5) return ENGLISH_LEVELS[1];
  return ENGLISH_LEVELS[0];
}