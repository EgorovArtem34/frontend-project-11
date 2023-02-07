import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import render from './view.js';
import resources from './locales/index.js';
import parser from './parser.js';

const validate = (url, links) => {
  const schema = yup.string().url().required().notOneOf(links)
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

const updatePosts = (watchedState) => {
  const timeoutUpdate = 5000;
  const promises = watchedState.feeds.map((feed) => {
    const proxy = addProxy(feed.url);
    return axios.get(proxy)
      .then((response) => {
        const parseData = parser(response.data.contents);
        const { posts } = parseData;
        const actualLinksPosts = watchedState.posts.map((post) => post.link);
        const filteredPosts = posts.filter((post) => !actualLinksPosts.includes(post.link));
        if (filteredPosts.length > 0) {
          const newPosts = filteredPosts
            .map((post) => ({ ...post, id: _.uniqueId(), feedId: feed.id }));
          watchedState.posts = [...newPosts, ...watchedState.posts];
        }
      })
      .catch((e) => console.log(`Error: ${e}`));
  });
  Promise.all(promises)
    .finally(() => setTimeout(() => updatePosts(watchedState), timeoutUpdate));
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
        const linksForValidate = watchedState.feeds.map((feed) => feed.url);
        validate(valueFormData, linksForValidate)
          .then((url) => {
            watchedState.errors = null;
            const proxy = addProxy(url);
            axios.get(proxy)
              .then((response) => {
                const parseData = parser(response.data.contents);
                watchedState.processState = 'sending';
                const { feed, posts } = parseData;
                const feedId = _.uniqueId();
                feed.id = feedId;
                feed.url = url;
                addIdToPosts(posts, feedId);
                watchedState.feeds = [feed, ...state.feeds];
                watchedState.posts = [...posts, ...state.posts];
                watchedState.processState = 'added';
              })
              .catch((err) => {
                console.log('1 catch', err);
                watchedState.errors = err;
                watchedState.processState = 'error';
              });
          })
          .catch((err) => {
            console.log('ERRRcatch', err);
            watchedState.errors = err.message;
            watchedState.processState = 'error';
          });
      });
      updatePosts(watchedState);
    });
};
