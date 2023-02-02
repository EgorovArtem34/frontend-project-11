import * as yup from 'yup';
import onChange from 'on-change';
import render from './view.js';

const validate = (url, feeds) => {
  const schema = yup.string().url().required().notOneOf(feeds)
    .trim();
  return schema.validate(url);
};
export default () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  };
  const state = {
    processState: 'filling',
    feeds: [],
    posts: [],
    errors: [],
  };

  const watchedState = onChange(state, render(state, elements));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const valueFormData = formData.get('url').trim();
    validate(valueFormData, watchedState.feeds)
      .then((url) => {
        watchedState.feeds.push(url);
        watchedState.errors = null;
        watchedState.processState = 'sending';
      })
      .catch((err) => {
        console.log({ err })
        watchedState.errors = err.type;
        watchedState.processState = 'error';
      });
  });
};
