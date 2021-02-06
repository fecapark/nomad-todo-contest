const storage = window.localStorage;
const USER_KEY = "user-key";
const LIST_KEY = "list-key";
const TAG_KEY = "tag-key";

const UserStorage = {
  convertUser: (user) => {
    user = user.trim();

    let userWords = user.split(" ");
    console.log(userWords);
    userWords.forEach((word, index) => {
      const head = word[0];
      const left = word.slice(1);

      userWords[index] = head.toUpperCase() + left;
    });

    return userWords.join(" ");
  },

  isUserSigned: () => {
    const user = storage.getItem(USER_KEY);

    if (!user) return false;
    return true;
  },

  setUserData: (user) => {
    user = UserStorage.convertUser(user);
    storage.setItem(USER_KEY, user);
  },

  getUserData: () => {
    return storage.getItem(USER_KEY);
  },

  removeUserData: () => {
    storage.removeItem(USER_KEY);
    storage.removeItem(LIST_KEY);
    storage.removeItem(TAG_KEY);
    window.location.reload();
  },
};

const ListStorage = {};

const TagStorage = {
  getAllTags: () => {
    const data = JSON.parse(storage.getItem(TAG_KEY));

    if (!data || data.length === 0) return [];
    return data;
  },

  appendTag: (tagObj) => {
    const tagObjs = TagStorage.getAllTags();
    tagObjs.unshift(tagObj);

    storage.setItem(TAG_KEY, JSON.stringify(tagObjs));
  },

  removeTag: (tag) => {
    const idx = TagStorage.contains(tag);
    if (idx === -1) return;

    tagObjs.splice(idx, 1);
    storage.setItem(TAG_KEY, JSON.stringify(tagObjs));
  },

  contains: (tag) => {
    const tagObjs = TagStorage.getAllTags();
    let idx = -1;

    for (let i = 0; i < tagObjs.length; i++) {
      if (tagObjs[i].text === tag) {
        idx = i;
        break;
      }
    }

    console.log(tagObjs);

    return idx;
  },

  getTagObj: (tag) => {
    const tagObjs = TagStorage.getAllTags();

    for (let i = 0; i < tagObjs.length; i++) {
      if (tagObjs[i].text === tag) {
        return tagObjs[i];
      }
    }

    return null;
  },
};

export { UserStorage, ListStorage, TagStorage };
