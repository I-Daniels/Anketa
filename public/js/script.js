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

  inputElements.forEach(function (input, index) {
    var currentId = input.id.replace(/\D/g, '');
    var newId = parseInt(currentId) + index + 1;
    input.id = input.id.replace(/\d+/, newId);
    input.value = '';
  });

  var selectElement = newContainer.querySelector('select');
  if (selectElement) {
    selectElement.selectedIndex = 0;
  }

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

function moveCheckedValues() {
  const checkedCheckboxes = document.querySelectorAll('.div_radio input[type="checkbox"]:checked');
  const valuesArray = Array.from(checkedCheckboxes)
    .map(checkbox => checkbox.nextElementSibling.textContent.trim());

  return valuesArray.join(', ');
}
var educationRowsData = [];

const uploadedImages = {};

const userId = generateUniqueId();

function setupPhotoContainer(index, userId) {
  const addPhotoButton = document.getElementById(`add-photo${index}`);
  const fileInput = document.getElementById(`file-input${index}`);
  const uploadedImage = document.getElementById(`uploaded-image${index}`);
  const removePhotoButton = document.getElementById(`remove-photo${index}`);

  localStorage.setItem(`userId${index}`, userId);

  const savedImagePath = localStorage.getItem(`imagePath${index}`);

  if (savedImagePath) {
    uploadedImage.src = savedImagePath;
    removePhotoButton.disabled = false;
  }

  addPhotoButton.addEventListener('click', function () {
    fileInput.click();
  });

  fileInput.addEventListener('change', async function (event) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        const imageData = e.target.result;
        uploadedImages[index] = {
          imageData: imageData,
          file: file
        };
        uploadedImage.src = e.target.result;
        removePhotoButton.disabled = false;
        localStorage.setItem(`imagePath${index}`, e.target.result);
      };

      reader.readAsDataURL(file);
    } else {
      uploadedImage.src = '';
      removePhotoButton.disabled = true;
      localStorage.removeItem(`imagePath${index}`);
      delete uploadedImages[index];
    }
  });

  removePhotoButton.addEventListener('click', function () {
    uploadedImage.src = '';
    fileInput.value = '';
    removePhotoButton.disabled = true;
    localStorage.removeItem(`imagePath${index}`);
    delete uploadedImages[index];
  });
}

for (let i = 1; i <= 3; i++) {
  setupPhotoContainer(i, userId);
}



async function redirect() {
  try {
    var imageUrlArray = [];
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


    for (const index in uploadedImages) {
      const imageData = uploadedImages[index].imageData;
      const file = uploadedImages[index].file;
    
      const formData = new FormData();
      formData.append('image', file);
      formData.append('imageFileName', file.name);
      formData.append('userId', userId);
    
      try {
        const response = await fetch('/upload-image', {
          method: 'POST',
          body: formData,
          headers: {
            'userId': userId,
          },
        });
    
        if (response.ok) {
          console.log('Изображение успешно отправлено на сервер');
    
          try {
            const { imageUrl } = await response.json();
            console.log('URL изображения:', imageUrl);
    
            localStorage.setItem(`uploadedImageUrl${index}`, imageUrl);
          } catch (error) {
            console.error('Ошибка при обработке JSON:', error);
          }
        } else {
          console.error('Ошибка при отправке изображения на сервер');

          const responseBody = await response.text();
          console.error('Текст ошибки:', responseBody);
        }
        
      } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
      }
    }

    for (let i = 1; i <= 3; i++) {
      const savedImagePath = localStorage.getItem(`uploadedImageUrl${i}`);
      console.log(`uploadedImageUrl${i}:`, savedImagePath);
      if (savedImagePath) {
        imageUrlArray.push(savedImagePath);
      }
    }


    sendDataToServer(selectedLevel, lastName, firstName, middleName, familyStatus, moveChecked, selectedRadio, imageUrlArray);
  } catch (error) {
    console.error('Ошибка в redirect:', error);
  }

}

function sendDataToServer(selectedLevel, lastName, firstName, middleName, familyStatus, moveChecked, selectedRadio, imageUrlArray) {
  try {
    const transferDataResult = transferData();
    const languageData = sendLanguage();
    const educationData = updateEducationData('education-table');
    const attestationData = updateEducationData('attestation-table');
    const qualificationData = updateEducationData('qualification-table');
    const studiesData = updateEducationData('studies-table');
    const jobData = updateEducationData('job-table');
    const supervisorData = updateEducationData('supervisor-table');
    const jobtitleData = updateEducationData('jobtitle-table');
    const relativesData = updateEducationData('relatives-table');
    const data = transferData()
    const imageFileName = document.getElementById('uploaded-image1').src;
    const DataForm = {
      lastName,
      firstName,
      middleName,
      selectedLevel,
      familyStatus,
      selectedRadio,
      moveChecked,
      transferDataResult,
      languageData,
      educationData,
      attestationData,
      qualificationData,
      studiesData,
      jobData,
      supervisorData,
      jobtitleData,
      relativesData,
      data,
      imageUrlArray,
    };

    console.log('Sending data:', DataForm);

    fetch('/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'userId': userId,
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
        var filename = lastName + '_' + firstName + '_' + middleName + '.pdf';

        a.href = blobUrl;
        a.download = filename;
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

    if (element.type === 'date' && id.endsWith('30')) {
      var dateArray = value.split("-");
      value = dateArray[2] + '.' + dateArray[1] + '.' + dateArray[0];
    }

    data[id] = value;
  });

  localStorage.setItem('data', JSON.stringify(data));

  return data;
}

function saveData() {
  var lastName = document.getElementById('i-1').value;
  var firstName = document.getElementById('i-2').value;
  var middleName = document.getElementById('i-3').value;

  localStorage.setItem('lastName', lastName);
  localStorage.setItem('firstName', firstName);
  localStorage.setItem('middleName', middleName);
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

const inputElements = document.querySelectorAll('.input_ed');

inputElements.forEach(input => {
  input.addEventListener('input', function() {
    const placeholder = this.querySelector('::placeholder');
    if (this.scrollWidth > this.clientWidth) {
      placeholder.style.animation = 'none';
    } else {
      placeholder.style.animation = 'movePlaceholder 2s infinite alternate';
    }
  });
});

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


// ------------------------------------------------------------ Photos



function generateUniqueId() {
  const timestamp = new Date().getTime();
  const randomString = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${randomString}`;
}

window.addEventListener('beforeunload', function() {
  localStorage.clear();
});