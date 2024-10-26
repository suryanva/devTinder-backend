const validateRequestBody = (request) => {
  const allowedUpdates = [
    "userId",
    "firstName",
    "lastName",
    "age",
    "photoUrl",
    "gender",
    "skills",
    "about",
  ];
  // Check if request body contains only allowed updates and values are not empty
  const isEditAllowed =
    request.body &&
    Object.keys(request.body).every((update) =>
      allowedUpdates.includes(update)
    );
  console.log(request.body);
  console.log(isEditAllowed);
  return isEditAllowed;
};

module.exports = { validateRequestBody };
