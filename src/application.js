import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import render from './view.js';
import resources from './locales/index.js';
import parser from './parser.js';

const validate = async (url, links) => {
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

const updatePosts = async (watchedState) => {
  const timeoutUpdate = 5000;
  const promises = watchedState.feeds.map((feed) => {
    const preparedUrl = addProxy(feed.url);
    return axios.get(preparedUrl)
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
export default async () => {
  const defaultLanguage = 'ru';
  const i18nextInstance = i18next.createInstance();
  await i18nextInstance.init({
    lng: defaultLanguage,
    debug: true,
    resources,
  });
  yup.setLocale({
    mixed: {
      notOneOf: 'alreadyExists',
      required: 'required',
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
    btnForm: document.querySelector('.col-auto > button'),
    modal: {
      modalEl: document.getElementById('modal'),
      title: document.querySelector('.modal-title'),
      body: document.querySelector('.modal-body'),
      articleBtn: document.querySelector('.full-article'),
    },
  };
  const state = {
    formState: 'filling',
    feeds: [],
    posts: [],
    errors: [],
    uiState: {
      viewedPosts: new Set(),
      modalPost: null,
    },
  };

  const watchedState = onChange(state, render(state, elements, i18nextInstance));
  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const valueFormData = formData.get('url').trim();
    const linksForValidate = watchedState.feeds.map((feed) => feed.url);
    try {
      watchedState.formState = 'start sending';
      const validatedUrl = await validate(valueFormData, linksForValidate);
      watchedState.errors = null;
      const preparedUrl = addProxy(validatedUrl);
      const response = await axios.get(preparedUrl);
      const parseData = parser(response.data.contents);
      const { feed, posts } = parseData;
      const feedId = _.uniqueId();
      feed.id = feedId;
      feed.url = validatedUrl;
      addIdToPosts(posts, feedId);
      watchedState.feeds = [feed, ...state.feeds];
      watchedState.posts = [...posts, ...state.posts];
      watchedState.formState = 'added';
    } catch (err) {
      watchedState.errors = err.isAxiosError ? 'networkError' : err.message;
      watchedState.formState = 'error';
    }
  });
  elements.posts.addEventListener('click', (e) => {
    const targetId = e.target.dataset.id;
    if (targetId) {
      watchedState.uiState.viewedPosts.add(targetId);
    }
  });
  elements.modal.modalEl.addEventListener('show.bs.modal', (e) => {
    const postId = e.relatedTarget.dataset.id;
    watchedState.uiState.modalPost = postId;
  });
  updatePosts(watchedState);
};
