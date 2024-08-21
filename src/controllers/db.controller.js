import { initializeApp } from 'firebase/app'
import { getDatabase, ref, child, get } from 'firebase/database'
import { getStorageItem } from '../utils/storage.utils'

export class DBController {
  host

  username

  _database


  constructor(host) {
    this.host = host

    host.addController(this)
  }

  hostConnected() {
    // eslint-disable-next-line no-undef
    const app = initializeApp(FIREBASE)
    this._database = getDatabase(app)
    this.getUserInfo()
  }

  hostDisconnected() {
    // TODO
  }

  getUserInfo() {
    const dbref = ref(this._database)
    const uid = getStorageItem('uid')

    get(child(dbref, uid)).then((snapshot) => {
      if (snapshot.exists()) {
        this.host.username = snapshot.val().username
      } else {
        console.log('No data available')
      }
    }).catch((error) => {
      console.error(error)
    })
  }
}

