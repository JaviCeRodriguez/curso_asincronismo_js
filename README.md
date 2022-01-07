# Curso de Asincronismo con JavaScript 🟨

Teoría y aplicación de asincrónismo en JavaScript, utilizando callbacks, promesas y async/await para extraer informaión de una API (en este caso, [The Rick and Morty API](https://rickandmortyapi.com)).

## Requerimientos!

- Git
- Node
- Instalar dependencias: `npm install`

## Defición estructura callback

Un callbak es una función que al crearla, le pasamos como parámetro una segunda función. Podemos implementarlo con asincronismo!

Ejemplo 1:

```js
// Función para sumar
function sum(num1, num2) {
  return num1 + num2;
}

// Función que recibe la función sum
function calc(num1, num2, callback) {
  return callback(num1, num2);
}

console.log(calc(5, 2, sum)) // 7
```

Ejemplo 2

```js
// Función date que recibe otra, que mandará date
function date(callback) {
  console.log(new Date); 
  setTimeout(function () {
    let date = new Date;
    callback(date);
  }, 3000)
}

// Función printDate que simplemente realiza un console.log
function printDate(dateNow) {
  console.log(dateNow)
}

// Llamo a date y le paso la función callback printDate
date(printDate); // 2022-01-07T01:20:17.250Z
                 // 2022-01-07T01:20:20.254Z
```

## XMLHttpRequest
Es la forma antigua de hacer llamados. Se usa este no el fetch actual, debido a que no conocemos aún las promesas (haremos de cuenta que no estamos en ES6) y fetch es con promesas. Para una explicación detallada, leer la [documentación de Mozilla](https://developer.mozilla.org/es/docs/Web/API/XMLHttpRequest).

En `src/callback/challenge.js` utilizamos varios métodos/funciones en la función `fetchData`:

- `open()`: Método para inicializar un pedido.
- `onreadystatechange`: Función que se llama cuando el atributo `readyState` cambia.
- `readyState`: Atributo que nos indica el estado del pedido.
  - 0 > UNINITIALIZED
  - 1 > LOADING
  - 2 > LOADED
  - 3 > INTERACTIVE
  - 4 > COMPLETED (Nosotros queremos este)
- `status`: Estado de la respuesta del pedido.
- `responseText`: Respuesta del pedido en texto.
- `send()`: Envía la petición.

El código nos queda así:

```js
function fetchData(url_api, callback) {
  let xhttp = new XMLHttpRequest();
  xhttp.open('GET', url_api, true); // Realizo la conexión a la API, definiendo método y async
  xhttp.onreadystatechange = function(event) {
    if(xhttp.readyState === 4) { // Complete?
      if(xhttp.status === 200) {
        callback(null, JSON.parse(xhttp.responseText));
      } else {
        const error = new Error('Error ' + url_api);
        return callback(error, null)
      }
    }
  }

  xhttp.send();
}
```


## Múltiples Peticiones a una API con callbacks

Primero, el código:

```js
fetchData(API, function(error1, data1) {
  if (error1) return console.error(error1);
  fetchData(API + data1.results[0].id, function (error2, data2) {
    if (error2) return console.error(error2);
    fetchData(data2.origin.url, function(error3, data3) {
      if (error3) return console.error(error3);
      console.log(data1.info.count);
      console.log(data2.name);
      console.log(data3.dimension);
    })
  })
})

// Resultado en consola:
// 826
// Rick Sanchez   
// Dimension C-137
```

Esto, si lo miramos en detalle, tenemos callbacks encadenados. Esto se conoce como "callback hell". Debemo evita caer en esto (aunque lo hacemos para probarlo ya que son pocas peticiones).


## Implementando Promesas

Ahora, en ES6 conocemos las promesas:

```js
const somethingWillHappen = () => {
  return new Promise((resolve, reject) => { // Retorno una promesa
    if (false) { // Si es true, se resuelve la promesa. De lo contrario, se rechaza
      resolve('Hey!');
    } else {
      reject('Whoooops!');
    }
  });
};

somethingWillHappen() // Llamo a la función
  .then(response => console.log(response)) // Si se resuelve, imprimo la respuesta
  .catch(err => console.error(err)); // De lo contrario, atrapo el error y lo imprimo
```

Otra promesa, que pero que tarda más en resolverla

```js
const somethingWillHappen2 = () => {
  return new Promise((resolve, reject) => {
    if (true) {
      setTimeout(() => {
        resolve('True');
      }, 2000)
    } else {
      const error = new Error('Whooops!');
      reject(error);
    }
  });
};

somethingWillHappen2()
  .then(response => console.log(response))
  .then(() => console.log('Holitas, puedo encadenar los then'))
  .catch(err => console.error(err))
```

También puedo ejecutar varias promesas y obtener un array de responses:

```js
Promise.all([somethingWillHappen(), somethingWillHappen2()])
  .then(response => {
    console.log('Array of results', response);
  })
  .catch(err => {
    console.error(err);
  });
```


## Resolver problema con Promesas

Reutilizo la función hecha en `src/callback/challenge.js` con callbacks y ahora usaremos promesas:

```js
let XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

const fetchData = (url_api) => {
  return new Promise((resolve, reject) => {
    const xhttp = new XMLHttpRequest();
    xhttp.open('GET', url_api, true);
    xhttp.onreadystatechange = (() => {
      if(xhttp.readyState === 4) {
        (xhttp.status === 200)
          ? resolve(JSON.parse(xhttp.responseText))
          : reject(new Error('Error ', url_api))
      }
    });
    xhttp.send();
  });
}

module.exports = fetchData;
```

Esta función la guardaremos en `src/utils/fetchData.js` para poder importarla en `src/promise/challenge.js`:

```js
const fetchData = require('../utils/fetchData');
const API = 'https://rickandmortyapi.com/api/character/';

fetchData(API)
  .then(data => {
    console.log(data.info.count); // 826
    return fetchData(`${API}${data.results[0].id}`);
  })
  .then(data => {
    console.log(data.name); // Rick Sanchez
    return fetchData(data.origin.url);
  })
  .then(data => {
    console.log(data.dimension); // Dimension C-137
  })
  .catch(err => console.error(err));
```

Lo mismo que hicimos con callbacks, llamamos 3 veces a la función fetchData que reestructuramos con promesas y las resolvemos a cada una con `then` de forma encadenada.


## Async/await

Ahora, utilizamos async/await para resolver las promesas y poder seguir con la ejecución del código mientras se resuelve:

```js
const doSomethingAsync = () => {
  return new Promise((resolve, reject) => {
    (true)
      ? setTimeout(() => resolve('Do Something Async'), 3000)
      : reject(new Error('Test Error'))
  });
};

const doSomething = async () => {
  const something = await doSomethingAsync();
  console.log(something);
};

console.log('Before');
doSomething();
console.log('After');

// Resultado en consola:
// Before
// After
// Do Something Async
```

También tenemos la posibilidad de manipular las response con try catch:

```js
const anotheFunction = async () => {
  try {
    const something = await doSomethingAsync();
    console.log(something);
  } catch (error) {
    console.error(error)
  }
}

console.log('Before 1');
anotheFunction();
console.log('After 1');
```


## Resolver problema con Async/Await

Ahora aplicaremos este método para obtener la info de la API:

```js
const fetchData = require('../utils/fetchData');
const API = "https://rickandmortyapi.com/api/character/";

const anotherFunction = async (url_api) => {
  try {
    const data = await fetchData(url_api);
    const character = await fetchData(`${url_api}${data.results[0].id}`);
    const origin = await fetchData(character.origin.url);
    console.log(data.info.count);
    console.log(character.name);
    console.log(origin.dimension);
  } catch (error) {
    console.error(error);
  }
}

console.log('Before');
anotherFunction(API);
console.log('After');

// Resultado en consola:
// Before
// After
// 826
// Rick Sanchez   
// Dimension C-137
```

## Callbacks vs Promesas vs Async/Await

**Callbacks**:

- Ventajas: Simple (una función que recibe otra función). Son universales, corren en cualquier navegador.
- Desventajas: Composición tediosa, anidando cada vez más elementos. Caer en callback hell.

**Promesas**:

- Ventajas: Fácilmente enlazables: `.then(...).then(...). ...`. Fácil e intuitivo de leer.
- Desventajas: Posible error si no se retorna el siguiente llamado. No corre en todos los navegadores.

**Async/Await**:

- Ventajas: Se puede usar try-catch. Código más ordenado e intuitivo.
- Desventajas: No corre en todos los navegadores (se require un transpilador).