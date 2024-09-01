export function shuffle(array) {
  let arrayLength = array.length, aux, randomPos

  // While there remain elements to shuffle...
  while (arrayLength) {

    // Pick a remaining element...
    randomPos = Math.floor(Math.random() * arrayLength--)

    // And swap it with the current element.
    aux = array[arrayLength]
    array[arrayLength] = array[randomPos]
    array[randomPos] = aux
  }

  return array
}
