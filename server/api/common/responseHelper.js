export function success(res, data, statusCode = 200) {
  res.status(statusCode).send({
    success: true,
    data
  });
}

export function error(res, error, statusCode = error.status_code || 400, message = error.message) {
  res.status(statusCode).send({
    success: false,
    message,
    error
  });
}
