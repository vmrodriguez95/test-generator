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
            this.host.exams = snapshot.val()
          }
        }
      })
    }
    catch(error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  uploadExam(id, questions) {
    set(child(this._dbRef, `exams/${this._uid}/${id}`), {
      questions,
      uploaded: new Date().getTime()
    })
  }
}

