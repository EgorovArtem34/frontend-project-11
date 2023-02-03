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

const makeWrapper = (elements, type, values, i18nextInstance) => {
  elements[type].textContent = '';
  const wrapper = document.createElement('div');
  const ul = document.createElement('ul');
  const titleDiv = document.createElement('div');
  const h2 = document.createElement('h2');

  wrapper.classList.add('card', 'border-0');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  titleDiv.classList.add('card-body');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18nextInstance.t(`${type}.title`);
  // h2.textContent = i18nextInstance.t(`${type}.title`);

  elements[type].append(wrapper);
  wrapper.append(ul);
  wrapper.append(titleDiv);
  titleDiv.append(h2);
  if (type === 'feeds') {
    feedsRender(elements, values, wrapper, ul, i18nextInstance);
  }
  if (type === 'posts') {
    postsRender(elements, values, wrapper, ul, i18nextInstance);
  }
};
const feedsRender = (elements, feeds, wrapper, ul, i18nextInstance) => {
  feeds.forEach((feed) => {
    const li = document.createElement('li');
    const h3 = document.createElement('h3');
    const p = document.createElement('p');

    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    h3.classList.add('h6', 'm-0');
    p.classList.add('m-0', 'small', 'text-black-50');
    h3.textContent = feed.title;
    p.textContent = feed.description;

    li.append(h3);
    li.append(p);
    ul.append(li);
    wrapper.append(ul);
  });
}
const postsRender = (elements, posts, wrapper, ul, i18nextInstance) => {
  posts.forEach((post) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    const btn = document.createElement('button');

    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    link.classList.add('fw-normal', 'link-secondary');
    link.setAttribute('href', post.link);
    link.setAttribute('data-id', post.id);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    btn.outerHTML = `<button type="button" data-id="${post.id}" data-bs-toggle="modal" data-bs-target="#modal">${i18nextInstance.t('posts.button')}</button>`;
    btn.classList.add('btn', 'btn-outline-primary', 'btn-sm');

    li.append(link);
    li.append(btn);
    ul.append(li);
  });

}
export default (state, elements, i18nextInstance) => (path, value) => {
  switch (path) {
    case 'processState':
      console.log('processState', path, value)
      formRender(elements, value, i18nextInstance);
      break;
    case 'errors':
      console.log('eRRRRR', path, value)
      elements.feedback.textContent = i18nextInstance.t(`errors.${value}`);
      break;
    case 'feeds':
      makeWrapper(elements, 'feeds', value, i18nextInstance);
      break;
    case 'posts':
      makeWrapper(elements, 'posts', value, i18nextInstance);
      break;
    default:
      console.log('DEFAULT', path, value);
      break;
  }
};
