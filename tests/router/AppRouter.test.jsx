import { render, screen } from "@testing-library/react";
import { AppRouter } from "../../src/router/AppRouter";
import { useAuthStore } from "../../src/hooks";
import { MemoryRouter } from "react-router-dom";
import { CalendarPage } from "../../src/calendar";

// crear mock

jest.mock("../../src/hooks/useAuthStore");

// // para uno usar mock de hooks
jest.mock("../../src/calendar", () => ({
  CalendarPage: () => <h1>Calendario</h1>,
}));

describe("Pruebas en AppRouter.jsx", () => {
  const mockCheckAuthToken = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  test("debe de mostrar el la pantalla de carga y llamar checkAuthToken", () => {
    // llamar hook

    useAuthStore.mockReturnValue({
      status: "checking",
      checkAuthToken: mockCheckAuthToken,
    });

    render(<AppRouter />);

    expect(screen.getByText("Cargando...")).toBeTruthy();
    expect(mockCheckAuthToken).toHaveBeenCalled();
  });

  test("debe de mostrar la pantalla de login si no esta autenticado", () => {
    // llamar hook

    useAuthStore.mockReturnValue({
      status: "not-authenticated",
      checkAuthToken: mockCheckAuthToken,
    });

    const { container } = render(
      <MemoryRouter initialEntries={["/auth2/algo/otracosa"]}>
        <AppRouter />
      </MemoryRouter>
    );

    expect(screen.getByText("Ingreso")).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  test("debe de mostrar el calendario si estamos auth", () => {
    // llamar hook

    useAuthStore.mockReturnValue({
      status: "authenticated",
      checkAuthToken: mockCheckAuthToken,
    });

    render(
      <MemoryRouter>
        <AppRouter />
      </MemoryRouter>
    );
    expect(screen.getByText("Calendario")).toBeTruthy();
  });
});
