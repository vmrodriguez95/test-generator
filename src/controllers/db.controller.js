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

  startDBConnection() {
    this._database = getDatabase(this.host.firebase.value.app)
    this._dbRef = ref(this._database)
  }

  requestUsername() {
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

  requestExams() {
    try {
      onAuthStateChanged(this.host.firebase.value.auth, async(user) => {
        if (user) {
          this._uid = user.uid
          const snapshot = await get(child(this._dbRef, `exams/${this._uid}`))

          if (snapshot.exists()) {
            this.host.examsStructure = this.orderByDate(snapshot.val(), 'asc')
          } else {
            this.host.examsStructure = null
          }
        }
      })
    }
    catch(error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  async requestItem(breadcrumbs) {
    if (this._uid) {
      const snapshot = await get(child(this._dbRef, `exams/${this._uid}/${breadcrumbs}`))

      if (snapshot.exists()) {
        return snapshot.val()
      }
    }
  }

  addItem(breadcrumbs, value = {}) {
    if (this._uid) {
      const newValue = Object.assign({}, { createdAt: new Date().getTime() }, value)

      set(child(this._dbRef, `exams/${this._uid}/${breadcrumbs}`), newValue)
    }
  }

  updateItem(breadcrumbs, newValue) {
    if (this._uid) {
      set(child(this._dbRef, `exams/${this._uid}/${breadcrumbs}`), newValue)
    }
  }

  removeItem(breadcrumbs) {
    if (this._uid) {
      set(child(this._dbRef, `exams/${this._uid}/${breadcrumbs}`), null)
    }
  }

  orderByDate(object, order) {
    let objectOrdered = object

    Object.keys(object).forEach(key => {
      objectOrdered[key] = Object.fromEntries(
        Object.entries(object[key]).sort((a, b) => {
          if (order === 'asc') {
            return a[1].createdAt - b[1].createdAt
          }
          return b[1].createdAt - a[1].createdAt
        })
      )
    })

    return objectOrdered
  }
}

