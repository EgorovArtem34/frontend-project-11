const getFeed = (doc) => {
  const title = doc.querySelector('title').textContent;
  const description = doc.querySelector('description').textContent;
  return { title, description };
};
const getPosts = (doc) => {
  const items = doc.querySelectorAll('item');
  const posts = [];
  items.forEach((item) => {
    const post = {
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
    };
    posts.push(post);
  });
  return posts;
};

export default (content) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'application/xml');
  const err = doc.querySelector('parsererror');
  if (err) {
    throw new Error('notContainRSS');
  }
  const feed = getFeed(doc);
  const posts = getPosts(doc);
  return { feed, posts };
};
