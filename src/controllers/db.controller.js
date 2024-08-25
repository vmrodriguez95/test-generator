import { initializeApp } from 'firebase/app'
import { getDatabase, ref, child, get, set } from 'firebase/database'
import { getStorageItem } from '../utils/storage.utils'

export class DBController {
  host

  _database

  _dbRef

  constructor(host) {
    this.host = host

    host.addController(this)
  }

  hostConnected() {
    this.startDBConnection()
    this.getUsername()
    this.getExamns()
  }

  hostDisconnected() {
    // TODO
  }

  startDBConnection() {
    // eslint-disable-next-line no-undef
    const app = initializeApp(FIREBASE)
    this._database = getDatabase(app)
    this._dbRef = ref(this._database)
  }

  getUsername() {
    const uid = getStorageItem('uid')

    get(child(this._dbRef, `${uid}/username`)).then((snapshot) => {
      if (snapshot.exists()) {
        this.host.username = snapshot.val()
      } else {
        // eslint-disable-next-line no-console
        console.log('No data available')
      }
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error)
    })
  }

  getExamns() {
    const uid = getStorageItem('uid')

    get(child(this._dbRef, `${uid}/exams`)).then((snapshot) => {
      if (snapshot.exists()) {
        this.host.exams = snapshot.val()
      } else {
        // eslint-disable-next-line no-console
        console.log('No data available')
      }
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error)
    })
  }

  uploadExam(id, questions) {
    const uid = getStorageItem('uid')

    set(child(this._dbRef, `${uid}/exams/${id}`), {
      questions,
      uploaded: new Date().getTime()
    })
  }
}

