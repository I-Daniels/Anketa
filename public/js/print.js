const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

// Извлечение значений параметров
const lastName = urlParams.get('last');
const middleName = urlParams.get('middle');
const firstName = urlParams.get('first');

// Вставка значений в элемент с id "fullName"
const fullNameElement = document.getElementById('fullName');
if (fullNameElement) {
  fullNameElement.textContent = `${lastName} ${firstName} ${middleName}`;
} else {
  console.error('Элемент с id "fullName" не найден на странице.');
}


// sessionStorage.setItem('c-30', dateBirthday);
// sessionStorage.setItem('c-31', placeBirthday);
// sessionStorage.setItem('c-18', placeLive);
// sessionStorage.setItem('c-16', placeReg);
// sessionStorage.setItem('c-6', serialPass);
// sessionStorage.setItem('c-7', numberPass);
// sessionStorage.setItem('c-9', datePass);
// sessionStorage.setItem('c-8', wherePass);
// sessionStorage.setItem('c-23', mobile);