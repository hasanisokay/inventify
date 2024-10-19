export const dbErrorResponse = {
  status: 500,
  message: "Database connection error",
  error: "Database Error",
};
export const invalidCredentialsResponse = { 
  status: 401,
  error: "Invalid Credentials",
  message: "Wrong username or password.",
};
export const serverErrorResponse = {
  status: 500,
  error: "Server Error",
  message: "Server side error. Contact support.",
};

export const unauthorizedResponse = {
  status: 401,
  error: "Unauthorized",
  message: "Unauthorized access. Please check your credentials.",
};

export const suspendedAccountResponse = {
  status: 403,
  error: "Account Suspended",
  message: "Your account has been suspended. Please contact support for further assistance.",
};

export const noDataFoundResponse = {
  status: 404,
  message: "No matching data found.",
};
export const dataAddedResponse = {
  status: 201,
  message: "Data added successfully.",
};
export const dataUpdateResponse = {
  status: 200,
  message: "Data has been successfully updated.",
};

export const dataFoundResponse = (data) => ({
  status: 200,
  message: "Data found successfully.",
  data,
});
