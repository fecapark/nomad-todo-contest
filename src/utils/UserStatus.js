import { LangStorage } from "./CustomStorage.js";

const getTimeStatus = () => {
  const curHour = new Date().getHours();

  if (curHour >= 5 && curHour <= 9)
    return LangStorage.isEnglish() ? "Good Morning!" : "좋은 아침이에요!";
  if (curHour >= 10 && curHour <= 11)
    return LangStorage.isEnglish() ? "Have a nice Day!" : "좋은 하루되세요!";
  if (curHour >= 12 && curHour <= 17)
    return LangStorage.isEnglish() ? "Good AfterNoon!" : "점심은 드셨나요?";
  if (curHour >= 18 && curHour <= 20)
    return LangStorage.isEnglish() ? "Good Evening!" : "저녁은 드셨나요?";
  return LangStorage.isEnglish() ? "Good Night!" : "좋은 밤 되세요!";
};

export { getTimeStatus };
