import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import render from './view.js';
import axios from 'axios';
import _ from 'lodash';
import resources from './locales/index.js'
import parser from './parser.js';

const validate = (url, feeds) => {
  const schema = yup.string().url().required().notOneOf(feeds)
    .trim();
  return schema.validate(url);
};

const addProxy = (url) => {
  const urlWithProxy = new URL('/get', 'https://allorigins.hexlet.app');
  urlWithProxy.searchParams.set('url', url);
  urlWithProxy.searchParams.set('disableCache', 'true');
  return urlWithProxy;
};
const addIdToPosts = (posts, feedId) => {
  posts.forEach((post) => {
    post.feedId = feedId;
    post.id = _.uniqueId();
  });
};

export default () => {
  const defaultLanguage = 'ru';
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    debug: true,
    resources,
  })
    .then(() => {
      yup.setLocale({
        mixed: {
          notOneOf: 'alreadyExists',
        },
        string: {
          url: 'invalidURL',
        },
      });

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

      const watchedState = onChange(state, render(state, elements, i18nextInstance));

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const valueFormData = formData.get('url').trim();
        validate(valueFormData, watchedState.feeds)
          .then((url) => {
            watchedState.errors = null;
            watchedState.processState = 'sending';
            const proxy = addProxy(url);
            axios.get(proxy)
              .then((response) => {
                const parseData = parser(response.data.contents);
                const { feed, posts } = parseData;
                const feedId = _.uniqueId();
                feed.id = feedId;
                addIdToPosts(posts, feedId);
                watchedState.feeds.push(feed);
                watchedState.posts.push(posts);
              });
          })
          .catch((err) => {
            watchedState.errors = err.message;
            watchedState.processState = 'error';
          });
      });
    });
};
