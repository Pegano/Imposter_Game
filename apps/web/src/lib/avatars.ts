import type { AvatarPreset } from '@imposter-game/shared'

// Avatar presets using emojis for MVP
// Later: replace with actual AI-generated images
export const AVATAR_PRESETS: (AvatarPreset & { emoji: string })[] = [
  {
    id: 'fox',
    name: 'Vos',
    emoji: '🦊',
    imageNotViewed: '/avatars/fox-sleeping.svg',
    imageViewed: '/avatars/fox-awake.svg',
  },
  {
    id: 'panda',
    name: 'Panda',
    emoji: '🐼',
    imageNotViewed: '/avatars/panda-sleeping.svg',
    imageViewed: '/avatars/panda-awake.svg',
  },
  {
    id: 'lion',
    name: 'Leeuw',
    emoji: '🦁',
    imageNotViewed: '/avatars/lion-sleeping.svg',
    imageViewed: '/avatars/lion-awake.svg',
  },
  {
    id: 'cat',
    name: 'Kat',
    emoji: '🐱',
    imageNotViewed: '/avatars/cat-sleeping.svg',
    imageViewed: '/avatars/cat-awake.svg',
  },
  {
    id: 'dog',
    name: 'Hond',
    emoji: '🐶',
    imageNotViewed: '/avatars/dog-sleeping.svg',
    imageViewed: '/avatars/dog-awake.svg',
  },
  {
    id: 'owl',
    name: 'Uil',
    emoji: '🦉',
    imageNotViewed: '/avatars/owl-sleeping.svg',
    imageViewed: '/avatars/owl-awake.svg',
  },
  {
    id: 'rabbit',
    name: 'Konijn',
    emoji: '🐰',
    imageNotViewed: '/avatars/rabbit-sleeping.svg',
    imageViewed: '/avatars/rabbit-awake.svg',
  },
  {
    id: 'wizard',
    name: 'Tovenaar',
    emoji: '🧙',
    imageNotViewed: '/avatars/wizard-sleeping.svg',
    imageViewed: '/avatars/wizard-awake.svg',
  },
  {
    id: 'princess',
    name: 'Prinses',
    emoji: '👸',
    imageNotViewed: '/avatars/princess-sleeping.svg',
    imageViewed: '/avatars/princess-awake.svg',
  },
  {
    id: 'robot',
    name: 'Robot',
    emoji: '🤖',
    imageNotViewed: '/avatars/robot-sleeping.svg',
    imageViewed: '/avatars/robot-awake.svg',
  },
  {
    id: 'ghost',
    name: 'Spookje',
    emoji: '👻',
    imageNotViewed: '/avatars/ghost-sleeping.svg',
    imageViewed: '/avatars/ghost-awake.svg',
  },
  {
    id: 'superhero',
    name: 'Superheld',
    emoji: '🦸',
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
