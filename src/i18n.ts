import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    menu: {
      skill: 'SKILL',
      item: 'ITEM',
      equip: 'EQUIP',
      persona: 'PERSONA',
      stats: 'STATS',
      quest: 'QUEST',
      socialLink: 'SOCIAL LINK',
      calendar: 'CALENDAR',
      system: 'SYSTEM',
    },
    description: {
      skill: 'Use a Skill',
      item: 'View/Use Items',
      equip: 'View/Change Equipment',
      persona: 'View/Change Personas',
      stats: 'View Stats/Organize Party',
      quest: 'View Requests',
      socialLink: 'View Social Links',
      calendar: 'View Calendar',
      system: 'View Settings',
    },
    start: {
      title: 'PERSONA 3 RELOAD',
      subtitle: 'PAUSE MENU',
      recreated: 'Written with Vue',
      inspired: 'Inspired From',
      enter: 'ENTER',
    },
    settings: {
      music: 'Toggle Music',
      sfx: 'Toggle SFX',
      language: 'Language',
      on: 'On',
      off: 'Off',
    },
    controls: {
      command: 'Command',
      confirm: 'Confirm',
      close: 'Close',
    },
  },
  ru: {
    menu: {
      skill: 'НАВЫК',
      item: 'ПРЕДМЕТ',
      equip: 'ЭКИПИРОВКА',
      persona: 'ПЕРСОНА',
      stats: 'СТАТУС',
      quest: 'ЗАДАНИЯ',
      socialLink: 'СОЦ. СВЯЗИ',
      calendar: 'КАЛЕНДАРЬ',
      system: 'СИСТЕМА',
    },
    description: {
      skill: 'Использовать навык',
      item: 'Просмотр/Использование предметов',
      equip: 'Просмотр/Смена экипировки',
      persona: 'Просмотр/Смена персон',
      stats: 'Статистика/Управление отрядом',
      quest: 'Просмотр заданий',
      socialLink: 'Просмотр соц. связей',
      calendar: 'Просмотр календаря',
      system: 'Настройки',
    },
    start: {
      title: 'PERSONA 3 RELOAD',
      subtitle: 'PAUSE MENU',
      recreated: 'Написано на Vue',
      inspired: 'Вдохновлено',
      enter: 'ВОЙТИ',
    },
    settings: {
      music: 'Музыка',
      sfx: 'Звуковые эффекты',
      language: 'Язык',
      on: 'Вкл',
      off: 'Выкл',
    },
    controls: {
      command: 'Команда',
      confirm: 'Выбрать',
      close: 'Закрыть',
    },
  },
}

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
})

export default i18n
