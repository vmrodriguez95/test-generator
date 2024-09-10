import { onAuthStateChanged } from 'firebase/auth'
import { getDatabase, ref, child, get, set } from 'firebase/database'

export class DBController {
  host

  _database

  _dbRef

  _uid

  constructor(host) {
    this.host = host

    host.addController(this)
  }

  hostConnected() {
    this.startDBConnection()
  }

  hostDisconnected() {
    // TODO
  }

  startDBConnection() {
    this._database = getDatabase(this.host.firebase.value.app)
    this._dbRef = ref(this._database)
  }

  getUsername() {
    try {
      onAuthStateChanged(this.host.firebase.value.auth, async(user) => {
        if (user) {
          this._uid = user.uid
          const snapshot = await get(child(this._dbRef, `users/${this._uid}`))

          if (snapshot.exists()) {
            this.host.username = snapshot.val()
          }
        }
      })
    }
    catch(error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  getExamns() {
    try {
      onAuthStateChanged(this.host.firebase.value.auth, async(user) => {
        if (user) {
          this._uid = user.uid
          const snapshot = await get(child(this._dbRef, `exams/${this._uid}`))

          if (snapshot.exists()) {
            this.host.exams = this.orderByDate(snapshot.val(), 'asc')
          }
        }
      })
    }
    catch(error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  addFolder(folder) {
    set(child(this._dbRef, `exams/${this._uid}/${folder}`), {
      createdAt: new Date().getTime()
    })
  }

  removeFolder(folder) {
    set(child(this._dbRef, `exams/${this._uid}/${folder}`), null)
  }

  uploadExam(id, questions) {
    set(child(this._dbRef, `exams/${this._uid}/${id}`), {
      questions,
      uploaded: new Date().getTime()
    })
  }

  orderByDate(object, order) {
    return Object.fromEntries(
      Object.entries(object).sort((a, b) => {
        if (order === 'asc') {
          return a[1].createdAt - b[1].createdAt
        }
        return b[1].createdAt - a[1].createdAt
      })
    )
  }
}

