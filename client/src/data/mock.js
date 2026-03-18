export const COLORS = ['pc-1','pc-2','pc-3','pc-4','pc-5','pc-6','pc-7','pc-8','pc-9'];
export const NAMES  = ['Аня','Миша','Катя','Дима','Соня','Игорь','Лена','Вася'];
export const EMOJIS = ['🌿','🌊','🌅','🌆','🎉','🌸','✨','🍂'];

const mockPhotos = Array.from({ length: 14 }, (_, i) => ({
  id: i + 1,
  dataUrl: null,
  color: COLORS[i % COLORS.length],
  author: NAMES[i % NAMES.length],
  time: `${20 + Math.floor(i / 4)}:${String(i * 4 % 60).padStart(2, '0')}`,
  emoji: EMOJIS[i % EMOJIS.length],
}))

export const initialEvents = [
  {
    id: 1,
    name: 'Свадьба Насти и Коли',
    date: '15 марта 2026',
    status: 'active',
    shots: 20,
    participants: 23,
    photos: mockPhotos,
    accentColor: '#c8b89a',
    code: '4h7Snv',
  },
  {
    id: 2,
    name: 'День рождения Димы',
    date: '12 марта 2026',
    status: 'pending',
    shots: 15,
    participants: 8,
    photos: [],
    accentColor: '#5DCAA5',
    code: '424S8k',
    revealAt: Date.now() + 3600 * 1000 * 6,
  },
  {
    id: 3,
    name: 'Выпускной вечер',
    date: '1 июля 2025',
    status: 'closed',
    shots: 25,
    participants: 41,
    photos: mockPhotos.slice(0, 9),
    accentColor: '#7F77DD',
    code: 'deIrBP',
  },
];

export const mockParticipants = NAMES.slice(0, 6).map((name, i) => ({
  name,
  shots: 2 + ((i * 7 + 3) % 17),
  max: 20,
  color: COLORS[i],
  initials: name.slice(0, 2),
}));