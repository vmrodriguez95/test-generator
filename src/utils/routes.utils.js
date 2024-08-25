import { html } from 'lit'
import { getStorageItem, resetStorage } from '../utils/storage.utils.js'

export const DEFAULT_INTERNAL_PATHNAME = '/test'

const middleware = () => {
  const uid = getStorageItem('uid')

  if (!uid && location.pathname !== '/') {
    location.pathname = '/'
    return false
  }

  return uid !== undefined
}

export const APP_ROUTES = [
  {
    path: '/',
    addToMenu: false,
    render: () => html`<v-login></v-login>`,
    enter: () => {
      if (middleware()) {
        window.location.pathname = DEFAULT_INTERNAL_PATHNAME
      }
    }
  },
  {
    path: DEFAULT_INTERNAL_PATHNAME,
    name: 'Hacer tests',
    addToMenu: true,
    render: () => html`<v-test></v-test>`,
    enter: middleware
  },
  // {
  //   path: '/tree',
  //   render: () => html`<v-tree></v-tree>`,
  //   enter: middleware
  // },
  {
    path: '*',
    addToMenu: false,
    enter: () => {
      resetStorage()
      location.pathname = '/'
    }
  }
]


