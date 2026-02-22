import type { AvatarPreset } from '@imposter-game/shared'

// Each avatar has a unique gradient pair [from, to] for their card background
export const AVATAR_PRESETS: (AvatarPreset & { emoji: string; colors: [string, string] })[] = [
  {
    id: 'fox',
    name: 'Vos',
    emoji: '🦊',
    colors: ['#F97316', '#DC2626'],
    imageNotViewed: '/avatars/fox-sleeping.svg',
    imageViewed: '/avatars/fox-awake.svg',
  },
  {
    id: 'panda',
    name: 'Panda',
    emoji: '🐼',
    colors: ['#374151', '#1E293B'],
    imageNotViewed: '/avatars/panda-sleeping.svg',
    imageViewed: '/avatars/panda-awake.svg',
  },
  {
    id: 'lion',
    name: 'Leeuw',
    emoji: '🦁',
    colors: ['#D97706', '#B45309'],
    imageNotViewed: '/avatars/lion-sleeping.svg',
    imageViewed: '/avatars/lion-awake.svg',
  },
  {
    id: 'cat',
    name: 'Kat',
    emoji: '🐱',
    colors: ['#9333EA', '#DB2777'],
    imageNotViewed: '/avatars/cat-sleeping.svg',
    imageViewed: '/avatars/cat-awake.svg',
  },
  {
    id: 'dog',
    name: 'Hond',
    emoji: '🐶',
    colors: ['#0284C7', '#1D4ED8'],
    imageNotViewed: '/avatars/dog-sleeping.svg',
    imageViewed: '/avatars/dog-awake.svg',
  },
  {
    id: 'owl',
    name: 'Uil',
    emoji: '🦉',
    colors: ['#0D9488', '#059669'],
    imageNotViewed: '/avatars/owl-sleeping.svg',
    imageViewed: '/avatars/owl-awake.svg',
  },
  {
    id: 'rabbit',
    name: 'Konijn',
    emoji: '🐰',
    colors: ['#EC4899', '#E11D48'],
    imageNotViewed: '/avatars/rabbit-sleeping.svg',
    imageViewed: '/avatars/rabbit-awake.svg',
  },
  {
    id: 'wizard',
    name: 'Tovenaar',
    emoji: '🧙',
    colors: ['#6D28D9', '#4338CA'],
    imageNotViewed: '/avatars/wizard-sleeping.svg',
    imageViewed: '/avatars/wizard-awake.svg',
  },
  {
    id: 'princess',
    name: 'Prinses',
    emoji: '👸',
    colors: ['#BE185D', '#7C3AED'],
    imageNotViewed: '/avatars/princess-sleeping.svg',
    imageViewed: '/avatars/princess-awake.svg',
  },
  {
    id: 'robot',
    name: 'Robot',
    emoji: '🤖',
    colors: ['#0369A1', '#0E7490'],
    imageNotViewed: '/avatars/robot-sleeping.svg',
    imageViewed: '/avatars/robot-awake.svg',
  },
  {
    id: 'ghost',
    name: 'Spookje',
    emoji: '👻',
    colors: ['#4B5563', '#6D28D9'],
    imageNotViewed: '/avatars/ghost-sleeping.svg',
    imageViewed: '/avatars/ghost-awake.svg',
  },
  {
    id: 'superhero',
    name: 'Superheld',
    emoji: '🦸',
    colors: ['#DC2626', '#D97706'],
    imageNotViewed: '/avatars/superhero-sleeping.svg',
    imageViewed: '/avatars/superhero-awake.svg',
  },
]

export function getAvatarById(id: string) {
  return AVATAR_PRESETS.find((avatar) => avatar.id === id)
}

export function getRandomAvatar() {
  return AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)]
}
