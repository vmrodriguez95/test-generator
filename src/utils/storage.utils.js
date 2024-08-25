import { STORAGE_KEY } from '../utils/consts.utils.js'

function getStorage() {
  const item = localStorage.getItem(STORAGE_KEY)

  return item ? JSON.parse(item) : {}
}

export function getStorageItem(key) {
  return getStorage()[key]
}

export function setStorageItem(key, value) {
  const storage = getStorage()

  storage[key] = value

  localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
}

export function resetStorage() {
  localStorage.removeItem(STORAGE_KEY)
}
