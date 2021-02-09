const storage = window.localStorage;
const USER_KEY = "user-key";
const CARD_KEY_TODO = "card-key-todo";
const CARD_KEY_COMPLETE = "card-key-complete";
const TAG_KEY = "tag-key";
const FILTER_KEY = "filter-key";
const LANG_KEY = "lang-key";

const UserStorage = {
  convertUser: (user) => {
    user = user.trim();

    let userWords = user.split(" ");

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
    storage.removeItem(CARD_KEY_TODO);
    storage.removeItem(CARD_KEY_COMPLETE);
    storage.removeItem(TAG_KEY);
    storage.removeItem(FILTER_KEY);
    storage.removeItem(LANG_KEY);
    window.location.reload();
  },
};

const CardStorage = {
  getAllCardFromTodo: () => {
    const data = JSON.parse(storage.getItem(CARD_KEY_TODO));

    if (!data || data.length === 0) return [];
    return data;
  },

  getAllCardFromComplete: () => {
    const data = JSON.parse(storage.getItem(CARD_KEY_COMPLETE));

    if (!data || data.length === 0) return [];
    return data;
  },

  addCardToTodo: (cardObj) => {
    const allCards = CardStorage.getAllCardFromTodo();

    const card = {
      tag: cardObj.tag,
      countdown: cardObj.countdown,
      text: cardObj.text,
      updatedAt: cardObj.updatedAt,
      createdAt: cardObj.createdAt,
      salt: cardObj.salt,
      id: cardObj.id,
    };

    allCards.unshift(card);

    storage.setItem(CARD_KEY_TODO, JSON.stringify(allCards));
  },

  addCardToComplete: (cardObj) => {
    const allCards = CardStorage.getAllCardFromComplete();

    const card = {
      tag: cardObj.tag,
      countdown: cardObj.countdown,
      text: cardObj.text,
      updatedAt: cardObj.updatedAt,
      createdAt: cardObj.createdAt,
      salt: cardObj.salt,
      id: cardObj.id,
    };

    allCards.unshift(card);

    storage.setItem(CARD_KEY_COMPLETE, JSON.stringify(allCards));
  },

  containsTodo: (id) => {
    id = parseInt(id);

    const allCards = CardStorage.getAllCardFromTodo();
    let idx = -1;

    for (let i = 0; i < allCards.length; i++) {
      if (allCards[i].id === id) {
        idx = i;
        break;
      }
    }

    return idx;
  },

  containsComplete: (id) => {
    id = parseInt(id);

    const allCards = CardStorage.getAllCardFromComplete();
    let idx = -1;

    for (let i = 0; i < allCards.length; i++) {
      if (allCards[i].id === id) {
        idx = i;
        break;
      }
    }

    return idx;
  },

  removeCardFromTodo: (id) => {
    id = parseInt(id);

    const allCards = CardStorage.getAllCardFromTodo();
    const idx = CardStorage.containsTodo(id);

    if (idx === -1) return;

    allCards.splice(idx, 1);
    storage.setItem(CARD_KEY_TODO, JSON.stringify(allCards));
  },

  removeCardFromComplete: (id) => {
    id = parseInt(id);

    const allCards = CardStorage.getAllCardFromComplete();
    const idx = CardStorage.containsComplete(id);
    if (idx === -1) return;

    allCards.splice(idx, 1);
    storage.setItem(CARD_KEY_COMPLETE, JSON.stringify(allCards));
  },
};

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
    const tagObjs = TagStorage.getAllTags();
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

  removeCardId: (id) => {
    const tagObjs = TagStorage.getAllTags();

    const removed = tagObjs.map((tagObj) => {
      tagObj.cardId = tagObj.cardId.filter((cardId) => cardId !== parseInt(id));

      return tagObj;
    });

    storage.setItem(TAG_KEY, JSON.stringify(removed));
  },
};

const FilterStorage = {
  getAllFilters: () => {
    const data = JSON.parse(storage.getItem(FILTER_KEY));

    if (!data || data.length === 0) return [];
    return data;
  },

  setAllFilter: (tags) => {
    storage.setItem(FILTER_KEY, JSON.stringify(tags));
  },

  removeAllFilter: () => {
    storage.removeItem(FILTER_KEY);
  },

  contains: (tag) => {
    const filters = FilterStorage.getAllFilters();
    let idx = -1;

    for (let i = 0; i < filters.length; i++) {
      if (filters[i] === tag) {
        idx = i;
        break;
      }
    }

    return idx;
  },

  removeFilter: (tag) => {
    const filters = FilterStorage.getAllFilters();
    const idx = FilterStorage.contains(tag);
    if (idx === -1) return;

    filters.splice(idx, 1);
    storage.setItem(FILTER_KEY, JSON.stringify(filters));
  },
};

const LangStorage = {
  setLanguage: (lang) => {
    storage.setItem(LANG_KEY, lang);
  },

  isEnglish: () => {
    if (storage.getItem(LANG_KEY) === "ENG") return true;
    return false;
  },

  toggleLanguage: () => {
    if (LangStorage.isEnglish()) {
      storage.setItem(LANG_KEY, "KOR");
    } else {
      storage.setItem(LANG_KEY, "ENG");
    }
  },

  valueSeted: () => {
    return !storage.getItem(LANG_KEY) ? false : true;
  },
};

export { UserStorage, CardStorage, TagStorage, FilterStorage, LangStorage };
