export function fisrtDayOfCurrentMonth() {
  var date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function lastDayOfCurrentMonth() {
  var date = new Date();
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
