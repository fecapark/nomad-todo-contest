const Hash = {
  getSalt: () => {
    let salt = "";

    for (let i = 0; i < 10; i++) {
      if (Math.random() > 0.5) {
        const ascii = Math.floor(Math.random() * 26) + 97;
        const c = String.fromCharCode(ascii);
        salt += c;
      } else {
        salt += Math.floor(Math.random() * 10);
      }
    }

    return salt;
  },

  createHash(str) {
    let hash = 0;
    let chr;

    for (let i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }

    return hash;
  },
};

export { Hash };
