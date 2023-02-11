const formRender = (elements, value, i18nextInstance) => {
  switch (value) {
    case 'sending':
      elements.input.classList.remove('is-invalid');
      elements.feedback.classList.replace('text-danger', 'text-success');
      elements.feedback.textContent = i18nextInstance.t('successAdd');
      elements.input.value = '';
      break;
    case 'error':
      elements.input.classList.add('is-invalid');
      elements.feedback.classList.replace('text-success', 'text-danger');
      break;
    default:
      break;
  }
};
const errorRender = (elements, value, i18nextInstance) => {
  if (value === null) {
    return;
  }
  const errorText = value.message || value;
  elements.feedback.textContent = i18nextInstance.t(`errors.${errorText}`);
};
const feedsRender = (state, wrapper, ul) => {
  const { feeds } = state;
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
};
const postsRender = (state, ul, i18nextInstance) => {
  const { posts } = state;
  posts.forEach((post) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    const btn = document.createElement('button');

    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    link.classList.add(state.uiState.viewedPosts.has(post.id) ? ('fw-normal', 'link-secondary') : 'fw-bold');
    link.setAttribute('href', post.link);
    link.setAttribute('data-id', post.id);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    btn.setAttribute('type', 'button');
    btn.setAttribute('data-id', post.id);
    btn.setAttribute('data-bs-toggle', 'modal');
    btn.setAttribute('data-bs-target', '#modal');
    btn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    link.textContent = post.title;
    btn.textContent = i18nextInstance.t('posts.button');

    li.append(link);
    li.append(btn);
    ul.append(li);
  });
};
const makeWrapper = (state, elements, type, i18nextInstance) => {
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

  elements[type].append(wrapper);
  wrapper.append(titleDiv);
  wrapper.append(ul);
  titleDiv.append(h2);
  if (type === 'feeds') {
    feedsRender(state, wrapper, ul);
  }
  if (type === 'posts') {
    postsRender(state, ul, i18nextInstance);
  }
};
const modalRender = (state, elements, id) => {
  const ActualPosts = state.posts.filter((post) => post.id === id);
  const [{ description, link, title }] = ActualPosts;
  elements.modal.title.textContent = description;
  elements.modal.body.textContent = title;
  elements.modal.articleBtn.setAttribute('href', link);
};
export default (state, elements, i18nextInstance) => (path, value) => {
  switch (path) {
    case 'processState':
      formRender(elements, value, i18nextInstance);
      break;
    case 'errors':
      errorRender(elements, value, i18nextInstance);
      break;
    case 'feeds':
      makeWrapper(state, elements, 'feeds', i18nextInstance);
      break;
    case 'posts':
    case 'uiState.viewedPosts':
      makeWrapper(state, elements, 'posts', i18nextInstance);
      break;
    case 'uiState.modalPost':
      modalRender(state, elements, value);
      break;
    default:
      break;
  }
};
