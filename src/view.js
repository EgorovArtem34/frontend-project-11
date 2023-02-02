const formRender = (elements, value) => {
  switch (value) {
    case 'sending':
      console.log('Зашли в сенд');
      elements.input.classList.remove('is-invalid');
      elements.feedback.classList.replace('text-danger', 'text-success');
      elements.feedback.textContent = 'RSS успешно загружен';
      elements.input.value = '';
      break;
    case 'error':
      console.log('formEror', value);
      elements.input.classList.add('is-invalid');
      elements.feedback.classList.replace('text-success', 'text-danger');
      break;
    default:
      console.log('formDefault', value);
      break;
  }
};

const Allerrors = {
  errors: {
    notOneOf: 'RSS уже существует',
    url: 'Ссылка должна быть валидным URL',
  },
};

export default (state, elements) => (path, value) => {
  switch (path) {
    case 'processState':
      console.log('processState!', value);
      formRender(elements, value);
      break;
    case 'errors':
      elements.feedback.textContent = Allerrors.errors[value];
      break;
    default:
      break;
  }
};
