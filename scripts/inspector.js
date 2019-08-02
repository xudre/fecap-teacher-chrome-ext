'use strict';

// ---- ☕ CONFIG ☕ ---- //

const monitorTimeout = .5e3; // Milisegundos de intervalo entre verificações.

let monitorData; // Armazenamento dos dados coletados.
let monitorHashId; // Id temporário da lista encontrada.
let divNotFound; // Referência para a lista de alunos ausentes.
let divNotClass; // Referência para o alerta de lista de chamada.
let divAllPresent; // Referência para o alerta de nenhum aluno ausente.
let btnNotify; // Referência para o botão de notificação.

// ---- 🚀 METHODS 🚀 ---- //

/**
 *
 */
const notify = () => {
  if (!monitorData || /^\s*$/i.test(monitorData)) {
    alert('Não há nada para reportar.');

    return;
  }

  const text = encodeURI(monitorData);
  const url = `https://wa.me/?text=${text}`;

  window.open(url);
};

/**
 *
 */
const monitor = () => {
  const tableId = '#table_falta';
  const gradeFound = document.querySelector(`${tableId} .th_destaque`);

  if (gradeFound) {
    divNotClass.classList.add('hidden');

    const preData = [];
    const absentList = [];
    const gradeTitle = gradeFound.innerText;

    // Coleta e processa a lista de alunos:
    const studentsList = document.querySelectorAll(`${tableId} tbody tr`);

    if (studentsList && studentsList.length > 0) {
      for (let i = 0; i < studentsList.length; i++) {
        const studentLine = studentsList[i];

        if (!studentLine.hasAttribute('onmouseover')) continue;

        let absences = 0;

        const checkboxes = studentLine.querySelectorAll('input[type=checkbox]');
        const columns = studentLine.querySelectorAll('td');

        checkboxes.forEach(checkbox => {
          if (checkbox.checked) {
            absences++;
          }
        });

        if (absences > 0) {
          absentList.push({
            id: columns[0].innerText,
            name: columns[1].innerText,
            skipping: columns[2].querySelector('.presente') ? true : false
          });

          preData.push()
        }
      }
    }

    if (absentList.length > 0) {
      let tmpHashId = '';

      preData.push(`${gradeTitle}`);
      preData.push(``);

      absentList.forEach(absent => {
        tmpHashId += `,${absent.id}`;

        const x = absent.skipping ? 'x' : ' ';

        preData.push(`[${x}] ${absent.id} - ${absent.name}`);
      });

      preData.push(``);
      preData.push(`[x] = Aluno passou pela catraca.`);

      monitorData = "```" + preData.join('\n') + "```";

      if (tmpHashId !== monitorHashId) {
        const list = divNotFound.querySelector('ul');

        list.innerHTML = '';

        absentList.forEach(absent => {
          const item = document.createElement('li');

          item.innerHTML =
  `<span class="mdl-list__item-primary-content">
    <i class="mdl-list__item-avatar" style="background-image: url('http://intranet.fecap.br/portalcorporativo/col/sistema_chamada_on_line_rm/BD_get_foto.php?MATRICULA=${absent.id}')"></i>
    <span>${absent.name}</span>
  </span>`;

          item.classList.add('mdl-list__item');

          if (absent.skipping) {
            item.classList.add('skipping');
          }

          componentHandler.upgradeElement(item);

          list.appendChild(item);
        });

        monitorHashId = tmpHashId;
      }

      divNotFound.classList.remove('hidden');
      divAllPresent.classList.add('hidden');
    } else {
      divNotFound.classList.add('hidden');
      divAllPresent.classList.remove('hidden');

      monitorData = undefined;
    }
  } else {
    divNotClass.classList.remove('hidden');
    divNotFound.classList.add('hidden');
    divAllPresent.classList.add('hidden');

    monitorData = undefined;
  }

  setTimeout(monitor, monitorTimeout);
};

/**
 *
 */
const setup = () => {
  fetch(chrome.runtime.getURL(`views/inspector.html`))
  .then(response => {
    response.text()
    .then(data => {
      const inspector = document.createElement('div');

      inspector.classList.add('chrome-ext-inspector');
      inspector.innerHTML = data;

      divNotFound = inspector.querySelector('.not-found');
      divNotClass = inspector.querySelector('.not-class');
      divAllPresent = inspector.querySelector('.all-present');
      btnNotify = inspector.querySelector('.btn-notify');

      divNotFound.classList.add('hidden');
      divAllPresent.classList.add('hidden');

      btnNotify.addEventListener('click', notify);

      document.body.appendChild(inspector);

      componentHandler.upgradeElement(inspector);

      setTimeout(monitor, monitorTimeout);
    });
  });
};

setup();
