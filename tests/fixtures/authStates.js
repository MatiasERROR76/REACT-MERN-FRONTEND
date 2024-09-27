export const initialState = {
  status: "checking", //authenticated, not-authenticated
  user: {},
  errorMessage: undefined,
};

export const authenticatedState = {
  status: "authenticated", //authenticated, not-authenticated
  user: {
    uid: "abc",
    name: "fernando",
  },
  errorMessage: undefined,
};

export const notAuthenticatedStated = {
  status: "not-authenticated", //authenticated, not-authenticated
  user: {},
  errorMessage: undefined,
};
