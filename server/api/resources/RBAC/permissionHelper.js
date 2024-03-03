function createPermission(resource, action) {
  return `${resource}#${action}`;
}

function create(resource, action) {
  return createPermission(resource.code, action.code);
}

export { createPermission, create };
