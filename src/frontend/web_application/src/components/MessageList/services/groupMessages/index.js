const groupMessages = messages => [...messages]
  .sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
  .reduce((acc, message) => {
    const datetime = new Date(message.date);
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    let date = new Date(Date.UTC(
      datetime.getFullYear(), datetime.getMonth(), datetime.getDate()
    ));
    if (oneDayAgo < datetime) {
      date = Object.keys(acc)
        .map(dt => new Date(dt))
        .find(dt => new Date(dt) < datetime)
        || datetime;
    }
    const accMessages = acc[date.toISOString()] || [];

    return {
      ...acc,
      [date.toISOString()]: [
        ...accMessages,
        message,
      ],
    };
  }, {});

export default groupMessages;
