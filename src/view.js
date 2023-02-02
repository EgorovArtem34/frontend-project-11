import locales from './locales/index.js';

const formRender = (elements, value, i18nextInstance) => {
  switch (value) {
    case 'sending':
      elements.input.classList.remove('is-invalid');
      elements.feedback.classList.replace('text-danger', 'text-success');
      elements.feedback.textContent = i18nextInstance.t('successAdd');
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

export default (state, elements, i18nextInstance) => (path, value) => {
  switch (path) {
    case 'processState':
      formRender(elements, value, i18nextInstance);
      break;
    case 'errors':
      elements.feedback.textContent = i18nextInstance.t(`errors.${value}`);
      break;
    default:
      break;
  }
};
