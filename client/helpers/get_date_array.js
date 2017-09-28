
export function getDateArray(start, end, interval) { //daily: interval == 1
    const dateArray = [];
    let s = new Date(start);
    let e = new Date(end);
    while(s <= e) {
      dateArray.push(s.toISOString().slice(0, 10));
      s = new Date(s.setDate(s.getDate() + interval));
    }
    return dateArray;
  }