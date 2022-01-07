// Función para sumar
function sum(num1, num2) {
  return num1 + num2;
}

// Función que recibe la función sum
function calc(num1, num2, callback) {
  return callback(num1, num2);
}

console.log(calc(5, 2, sum)) // 7


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