var lastName = sessionStorage.getItem('lastName') || '';
var firstName = sessionStorage.getItem('firstName') || '';
var middleName = sessionStorage.getItem('middleName') || '';
var dateBirthday = sessionStorage.getItem('dateBirthday') || '';
var placeBirthday = sessionStorage.getItem('placeBirthday') || '';
var placeLive = sessionStorage.getItem('placeLive') || '';
var placeReg = sessionStorage.getItem('placeReg') || '';
var serialPass = sessionStorage.getItem('serialPass') || '';
var numberPass = sessionStorage.getItem('numberPass') || '';
var datePass = sessionStorage.getItem('datePass') || '';
var wherePass = sessionStorage.getItem('wherePass') || '';
var mobile = sessionStorage.getItem('mobile') || '';


sessionStorage.setItem('lastName', lastName);
sessionStorage.setItem('firstName', firstName);
sessionStorage.setItem('middleName', middleName);
sessionStorage.setItem('dateBirthday', dateBirthday);
sessionStorage.setItem('placeBirthday', placeBirthday);
sessionStorage.setItem('placeLive', placeLive);
sessionStorage.setItem('placeReg', placeReg);
sessionStorage.setItem('serialPass', serialPass);
sessionStorage.setItem('numberPass', numberPass);
sessionStorage.setItem('datePass', datePass);
sessionStorage.setItem('wherePass', wherePass);
sessionStorage.setItem('mobile', mobile);

document.getElementById('fullName').innerText = lastName + ' ' + firstName + ' ' + middleName;
document.getElementById('placeLive').innerText = placeLive;
document.getElementById('placeReg').innerText = placeReg;
document.getElementById('datePass').innerText = datePass;
document.getElementById('wherePass').innerText = wherePass;
document.getElementById('mobile').innerText = mobile;
document.getElementById('passport').innerText = serialPass + ' ' + numberPass;
document.getElementById('datePlace').innerText = dateBirthday + ' ' + placeBirthday;