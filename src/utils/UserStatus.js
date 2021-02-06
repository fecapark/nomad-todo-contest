const getTimeStatus = () => {
  const curHour = new Date().getHours();

  if (curHour >= 5 && curHour <= 9) return "Good Morning!";
  if (curHour >= 10 && curHour <= 11) return "Have a nice Day!";
  if (curHour >= 12 && curHour <= 17) return "Good AfterNoon!";
  if (curHour >= 18 && curHour <= 20) return "Good Evening!";
  return "Good Night!";
};

export { getTimeStatus };
