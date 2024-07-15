import { html } from 'lit'
import { getStorageItem, resetStorage } from '../utils/storage.utils.js'

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
    render: () => html`<v-login></v-login>`,
    enter: () => {
      if (middleware()) {
        window.location.pathname = '/test/'
      }
    }
  },
  {
    path: '/test/',
    render: () => html`<v-test></v-test>`,
    enter: middleware
  },
  {
    path: '*',
    enter: () => {
      resetStorage()
      location.pathname = '/'
    }
  }
]

