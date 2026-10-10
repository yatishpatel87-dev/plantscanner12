export interface SamplePlant {
  id: string;
  nameGu: string;
  nameEn: string;
  scientificName: string;
  imageUrl: string;
  category: string;
  description: string;
}

export const SAMPLE_PLANTS: SamplePlant[] = [
  {
    id: 'tulsi',
    nameGu: 'તુલસી (પવિત્ર તુલસી)',
    nameEn: 'Holy Basil (Tulsi)',
    scientificName: 'Ocimum tenuiflorum',
    category: 'ઔષધીય / પવિત્ર',
    description: 'ભારતીય ઘરોમાં ખૂબ જ પવિત્ર અને સર્વરોગહારી આયુર્વેદિક છોડ.',
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'neem',
    nameGu: 'લીમડો (કડવો લીમડો)',
    nameEn: 'Neem Tree',
    scientificName: 'Azadirachta indica',
    category: 'કુદરતી કીટનાશક / ઔષધીય',
    description: 'હવા શુદ્ધ કરનાર અને કુદરતી ઔષધિ તરીકે જાણીતો વૃક્ષરાજ.',
    imageUrl: 'https://images.unsplash.com/photo-1596726696468-2453b10b080f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'aloe-vera',
    nameGu: 'કુંવારપાઠું (એલોવેરા)',
    nameEn: 'Aloe Vera',
    scientificName: 'Aloe barbadensis miller',
    category: 'સક્યુલન્ટ / ત્વચા સારસંભાળ',
    description: 'ઓછા પાણીમાં ઉછરતો અને ઔષધીય જેલ ધરાવતો અદ્ભુત છોડ.',
    imageUrl: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'money-plant',
    nameGu: 'મની પ્લાન્ટ (પોથોસ)',
    nameEn: 'Money Plant (Golden Pothos)',
    scientificName: 'Epipremnum aureum',
    category: 'ઇન્ડોર / વાસ્તુ',
    description: 'ઘરની અંદર હવા શુદ્ધ કરતો અને સરળતાથી વધતો સુશોભિત છોડ.',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'rose',
    nameGu: 'દેશી ગુલાબ',
    nameEn: 'Rose Plant',
    scientificName: 'Rosa damascena',
    category: 'સુગંધિત પુષ્પ',
    description: 'મનમોહક સુગંધ અને સુંદર ફૂલો આપતો પ્રખ્યાત બગીચાનો છોડ.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'snake-plant',
    nameGu: 'સ્નેક પ્લાન્ટ (સંસેવેરિયા)',
    nameEn: 'Snake Plant / Mother-in-Law Tongue',
    scientificName: 'Sansevieria trifasciata',
    category: 'હવા શુદ્ધિકરણ / લો મેન્ટેનન્સ',
    description: 'રાત્રે પણ ઓક્સિજન આપતો અને ઓછા સૂર્યપ્રકાશમાં જીવતો છોડ.',
    imageUrl: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bf6?auto=format&fit=crop&w=800&q=80',
  }
];
