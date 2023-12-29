var checkbox1 = document.getElementById('j-1');
var checkbox2 = document.getElementById('j-2');
var button = document.getElementById('buttonDownload');

function updateButtonState() {
  button.disabled = !(checkbox1.checked && checkbox2.checked);
}

checkbox1.addEventListener('change', updateButtonState);
checkbox2.addEventListener('change', updateButtonState);

function applyMaskEducation() {
  const inputs = document.querySelectorAll('[id^="date_ed"]');
  const maskOption = { mask: '0000/0000' };

  inputs.forEach(function (input) {
    const idMatch = input.id.match(/\d+/);
    if (idMatch) {
      const index = idMatch[0];
      IMask(input, maskOption);
    }
  });
}

function addRow(tableId, containerId, inputClass, removeClass, removeFunction) {
  var table = document.getElementById(tableId);
  var container = document.getElementById(containerId);

  var newContainer = container.cloneNode(true);

  var inputElements = newContainer.querySelectorAll('.' + inputClass);

  inputElements.forEach(function (input) {
    var currentId = input.id.replace(/\D/g, '');
    var newId = parseInt(currentId) + 1;
    input.id = input.id.replace(/\d+/, newId);
    input.value = '';
  });

  table.appendChild(newContainer);

  var removeButton = newContainer.querySelector('.' + removeClass);
  if (removeButton) {
    removeButton.innerHTML = '<button onclick="' + removeFunction.name + '(this)">Удалить</button>';
  }
}

function removeRow(button) {
  const row = button.closest('tr');
  if (row) {
    row.parentNode.removeChild(row);
  }
}

function addEducationRow() {
  addRow('education-table', 'education_container', 'input_ed', 'remove-button', removeRow);
}

function addRelatives() {
  addRow('relatives-table', 'relatives_container', 'input_rel', 'remove-button', removeRow);
}

function cloneLanguageBlock() {
  const originalBlock = document.querySelector('.language_container');

  if (!originalBlock) {
    console.error('Original block not found');
    return;
  }

  const clonedBlock = originalBlock.cloneNode(true);

  const newIndex = document.querySelectorAll('.language_container').length;
  updateElementIdAndName(clonedBlock, newIndex);

  const table = document.querySelector('.language-table tbody');
  table.appendChild(clonedBlock);
}

function updateElementIdAndName(container, newIndex) {
  const inputLang = container.querySelector('.input_lang');
  inputLang.id = `date_lang${newIndex}`;

  const radioButtons = container.querySelectorAll('[name^="language"]');
  radioButtons.forEach(function (radio) {
    let currentId = radio.id;
    let newId = currentId.replace(/\d+$/, newIndex);
    radio.id = newId;

    let labelFor = radio.nextElementSibling.getAttribute('for');
    let newLabelFor = labelFor.replace(/\d+$/, newIndex);
    radio.nextElementSibling.setAttribute('for', newLabelFor);

    let currentName = radio.name;
    let newName = currentName.replace(/\d+$/, newIndex);
    radio.name = newName;
  });
}

function handleFileSelect(fileInput, imageContainer, textSelector) {
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const imgElement = document.createElement('img');
      imgElement.src = e.target.result;
      imgElement.style.width = '100%';
      imgElement.style.height = '100%';
      imageContainer.innerHTML = '';
      imageContainer.appendChild(imgElement);
      fileInput.style.display = 'none';

      const fileInputText = imageContainer.querySelector('.file-input-text');
      if (fileInputText) {
        fileInputText.style.display = 'none';
      }
    };
    reader.readAsDataURL(file);
  }
}

function moveCheckedValues() {
  const checkedCheckboxes = document.querySelectorAll('.div_radio input[type="checkbox"]:checked');
  const valuesArray = Array.from(checkedCheckboxes)
    .map(checkbox => checkbox.nextElementSibling.textContent.trim());

  return valuesArray.join(', ');
}

function initializeFileInputs(fileInputClass, containerClass, textSelectorClass) {
  const fileInputs = document.querySelectorAll(fileInputClass);
  const imageContainers = document.querySelectorAll(containerClass);
  const textSelectors = document.querySelectorAll(textSelectorClass);

  fileInputs.forEach((fileInput, index) => {
    fileInput.addEventListener('change', () => {
      handleFileSelect(fileInput, imageContainers[index], textSelectors[index]);
    });
  });
}

initializeFileInputs('.file-input', '.file-input-container', '.file-input-text');
initializeFileInputs('.file-input-photos .file-input', '.file-input-photos', '.file-input-photos .file-input-text');

var educationRowsData = [];

function redirect() {
  try {
    var data = transferData();
    var data2 = saveData();

    var selectedLevel = getSelectedLevel();
    var lastName = document.getElementById('i-1').value;
    var firstName = document.getElementById('i-2').value;
    var middleName = document.getElementById('i-3').value;

    var encodedLevel = encodeURIComponent(selectedLevel);
    var encodedLastName = encodeURIComponent(lastName);
    var encodedFirstName = encodeURIComponent(firstName);
    var encodedMiddleName = encodeURIComponent(middleName);

    var familyStatus = getSelectedFamilyStatus();
    var encodedFamilyStatus = encodeURIComponent(familyStatus);
    var moveChecked = moveCheckedValues();
    var selectedRadio = redirectCategoryPeople();

    var url =
      'serverpagepdf.html?level=' +
      encodedLevel +
      '&last=' +
      encodedLastName +
      '&first=' +
      encodedFirstName +
      '&middle=' +
      encodedMiddleName +
      '&familyStatus=' +
      encodedFamilyStatus +
      '&moveCheckedValues=' +
      moveChecked +
      '&selectedRadio=' +
      selectedRadio;

    const imageContainer = document.getElementById('imageContainer');
    const imgElement = imageContainer.querySelector('img');

    if (imageContainer && imgElement) {
      const imageData = imgElement.src;
      localStorage.setItem('imageData', imageData);
    }

    var iframe1 = document.getElementById('frame');
    var iframe2 = document.getElementById('frame2');

    if (iframe1 && iframe2) {
      iframe1.contentDocument.getElementById('fullName').value =
        lastName + ' ' + firstName + ' ' + middleName;
      iframe2.contentDocument.getElementById('fullName').value =
        lastName + ' ' + firstName + ' ' + middleName;
    }

    updateEducationData('education-table');
    updateEducationData('attestation-table');
    updateEducationData('qualification-table');
    updateEducationData('studies-table');
    updateEducationData('job-table');
    updateEducationData('supervisor-table');
    updateEducationData('jobtitle-table');
    updateEducationData('relatives-table');
    sendLanguage();
    redirectCategoryPeople();
    sendDataToServer(selectedLevel, lastName, firstName, middleName, familyStatus, moveChecked, selectedRadio);
    // window.location.href = url;
  } catch (error) {
    console.error('Error in redirect:', error);
  }
}

function sendDataToServer(selectedLevel, lastName, firstName, middleName, familyStatus, selectedRadio) {
  try {

    const transferDataResult = transferData();
    const languageData = sendLanguage();
    const educationData = updateEducationData('education-table');

    const DataForm = {
      selectedLevel,
      familyStatus,
      selectedRadio,
      transferDataResult,
      languageData,
      educationData,
    };

    console.log('Sending data:', DataForm);

    fetch('/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(DataForm),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.blob();
      })
      .then((blobData) => {
        const blobUrl = URL.createObjectURL(blobData);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'output.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      })
      .catch((error) => console.error('Error in fetch:', error));
  } catch (error) {
    console.error('Error in sendDataToServer:', error);
  }
}

function getSelectedLevel() {
  var checkedLevel = document.querySelector('.skills_container input[name="levelPC"]:checked');
  var levelText = checkedLevel ? checkedLevel.nextElementSibling.textContent.trim() : 'Нет опыта';
  return levelText;
}

function getSelectedFamilyStatus() {
  var checkedStatus = document.querySelector('.div_radio input[name="family"]:checked');
  return checkedStatus ? checkedStatus.nextElementSibling.textContent.trim() : '';
}

function redirectCategoryPeople() {
  const selectedRadio = document.querySelector('input[name="benefit"]:checked');
  return selectedRadio ? selectedRadio.nextElementSibling.textContent.trim() : '';
}

function transferData() {
  var data = {};
  var idPrefix = 'c-';
  var elements = document.querySelectorAll('[id^="' + idPrefix + '"]');

  elements.forEach(function (element) {
    var id = element.id;
    var value = element.value;
    data[id] = value;
  });

  console.log(data);

  sessionStorage.setItem('data', JSON.stringify(data));

  return data;
}

function saveData() {
  var lastName = document.getElementById('i-1').value;
  var firstName = document.getElementById('i-2').value;
  var middleName = document.getElementById('i-3').value;
  var dateBirthday = document.getElementById('c-30').value;
  var placeBirthday = document.getElementById('c-31').value;
  var placeLive = document.getElementById('c-18').value;
  var placeReg = document.getElementById('c-16').value;
  var serialPass = document.getElementById('c-6').value;
  var numberPass = document.getElementById('c-7').value;
  var datePass = document.getElementById('c-9').value;
  var wherePass = document.getElementById('c-8').value;
  var mobile = document.getElementById('c-23').value;

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
}


function updateEducationData(tableId) {
  const table = document.getElementById(tableId);
  const rows = table.querySelectorAll('tr');
  const rowsData = [];

  rows.forEach(function (row, index) {
    const rowData = {};
    const inputsTextareaSelect = row.querySelectorAll('input, textarea, select');

    inputsTextareaSelect.forEach(function (input) {
      const inputId = input.id;
      let inputValue;

      if (input.tagName === 'SELECT') {
        inputValue = input.options[input.selectedIndex].value;
      } else if (input.tagName === 'INPUT' && input.type !== 'radio') {
        inputValue = input.value;
      } else {
        inputValue = input.value;
      }

      rowData[inputId] = inputValue;
    });

    rowsData.push(rowData);
  });

  return rowsData;
}


function sendLanguage() {
  var languages = [];
  var languageContainers = document.querySelectorAll('.language_container');

  languageContainers.forEach(function (container, index) {
    var languageId = "date_lang" + index;
    var language = document.getElementById(languageId).value;
    var proficiency = getSelectedRadioValue("language" + index);

    languages.push({ language: language, proficiency: proficiency });
  });

  return languages;
}


function getSelectedRadioValue(name) {
  var radios = document.querySelectorAll('input[name="' + name + '"]');

  for (var i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      return radios[i].value;
    }
  }

  return null;
}

function handleSelect(inputId) {
  const input = document.getElementById(inputId);
  const files = input.files;

  if (files.length > 0) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const imageData = e.target.result;

      addToContainer(imageData);
    };

    reader.readAsDataURL(files[0]);
  }
}

function addToContainer(imageData) {
  const photosContainer = document.getElementById('photos-container');
  const imgElement = document.createElement('img');
  imgElement.src = imageData;
  photosContainer.appendChild(imgElement);
}

function PhotosReturn() {
  var imageContainer1 = document.getElementById('imageAnyphotos1');
  var imageContainer2 = document.getElementById('imageAnyphotos2');

  saveImageToLocalStorage('image1', imageContainer1.querySelector('img').src);
  saveImageToLocalStorage('image2', imageContainer2.querySelector('img').src);
};

function saveImageToLocalStorage(key, value) {
  localStorage.setItem(key, value);
}