import { Provider } from "react-redux";
import { useAuthStore } from "../../src/hooks/useAuthStore";
import { authSlice } from "../../src/store/auth/authSlice";
import { initialState, notAuthenticatedStated } from "../fixtures/authStates";
import { configureStore } from "@reduxjs/toolkit";
import { renderHook, act, waitFor } from "@testing-library/react";
import { testUserCredentials } from "../fixtures/testUser";
import calendarApi from "../../src/api/calendarApi";

const getMockStore = (initialState) => {
  return configureStore({
    reducer: {
      auth: authSlice.reducer,
    },
    preloadedState: {
      auth: { ...initialState },
    },
  });
};

describe("Pruebas en useAuthStore.jsx", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("debe de regresar los valores por defecto", () => {
    const mockStore = getMockStore({ ...initialState });

    const { result } = renderHook(() => useAuthStore(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      ),
    });
    expect(result.current).toEqual({
      errorMessage: undefined,
      status: "checking",
      user: {},
      checkAuthToken: expect.any(Function),
      startLogin: expect.any(Function),
      startLogout: expect.any(Function),
      startRegister: expect.any(Function),
    });
  });

  test("startLogin debe de realizar login correctamente", async () => {
    // limpiar localstorage para asegurarnos de que no haya datos previos

    const mockStore = getMockStore({ ...notAuthenticatedStated });
    // montar hook
    const { result } = renderHook(() => useAuthStore(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      ),
    });

    await act(async () => {
      await result.current.startLogin(testUserCredentials);
    });

    const { errorMessage, status, user } = result.current;
    expect({ errorMessage, status, user }).toEqual({
      errorMessage: undefined,
      status: "authenticated",
      user: { name: "Test User", uid: "66e8aa13fac218d5999e6148" },
    });

    expect(localStorage.getItem("token")).toEqual(expect.any(String));
    expect(localStorage.getItem("token-init-date")).toEqual(expect.any(String));
  });

  test("startLogin debe de fallar la auth", async () => {
    localStorage.clear();
    const mockStore = getMockStore({ ...notAuthenticatedStated });
    // montar hook
    const { result } = renderHook(() => useAuthStore(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      ),
    });

    await act(async () => {
      await result.current.startLogin({
        email: "algo@algo.com",
        password: "123456",
      });
    });

    const { errorMessage, status, user } = result.current;

    expect(localStorage.getItem("token")).toBe(null);
    expect({ errorMessage, status, user }).toEqual({
      errorMessage: "Credenciales incorrectas",
      status: "not-authenticated",
      user: {},
    });

    // para el settimeout
    await waitFor(() => expect(result.current.errorMessage).toBe(undefined));
  });

  test("startRegister debe de crear un usuario", async () => {
    const newUser = {
      email: "test2@gmail.com",
      password: "123456",
      name: "testuser2",
    };

    const mockStore = getMockStore({ ...notAuthenticatedStated });
    // montar hook
    const { result } = renderHook(() => useAuthStore(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      ),
    });

    // espia

    const spy = jest.spyOn(calendarApi, "post").mockReturnValue({
      data: {
        ok: true,
        uid: "28348234",
        name: "testuser2",
        token: "any-token",
      },
    });

    await act(async () => {
      await result.current.startRegister(newUser);
    });

    const { errorMessage, status, user } = result.current;

    expect({ errorMessage, status, user }).toEqual({
      errorMessage: undefined,
      status: "authenticated",
      user: { name: "testuser2", uid: "28348234" },
    });

    // destruye el espia
    spy.mockRestore();
  });

  test("startRegister debe de fallar", async () => {
    const mockStore = getMockStore({ ...notAuthenticatedStated });
    // montar hook
    const { result } = renderHook(() => useAuthStore(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      ),
    });

    await act(async () => {
      await result.current.startRegister(testUserCredentials);
    });

    const { errorMessage, status, user } = result.current;

    expect({ errorMessage, status, user }).toEqual({
      errorMessage: "El usuario ya existe con ese correo",
      status: "not-authenticated",
      user: {},
    });
  });

  test("checkAuthToken debe fallar si no hay token", async () => {
    const mockStore = getMockStore({ ...initialState });
    // montar hook
    const { result } = renderHook(() => useAuthStore(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      ),
    });

    await act(async () => {
      await result.current.checkAuthToken();
    });

    const { errorMessage, status, user } = result.current;

    expect({ errorMessage, status, user }).toEqual({
      errorMessage: undefined,
      status: "not-authenticated",
      user: {},
    });
  });

  test("checkAuthToken debe de autenticar el usuario si hay token", async () => {
    const { data } = await calendarApi.post("auth/", testUserCredentials);

    localStorage.setItem("token", data.token);

    const mockStore = getMockStore({ ...initialState });
    // montar hook
    const { result } = renderHook(() => useAuthStore(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      ),
    });

    await act(async () => {
      await result.current.checkAuthToken();
    });

    const { errorMessage, status, user } = result.current;

    expect({ errorMessage, status, user }).toEqual({
      errorMessage: undefined,
      status: "authenticated",
      user: { name: "Test User", uid: "66e8aa13fac218d5999e6148" },
    });
  });
});
