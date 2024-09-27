import calendarApi from "../../src/api/calendarApi";

describe("Pruebas en calendarApi", () => {
  //   1
  test("debe tener la configuración por defecto de la api", () => {
    // console.log(process.env)
    // console.log(calendarApi)

    expect(calendarApi.defaults.baseURL).toBe(process.env.VITE_API_URL);
  });

  //   2
  test("debe de tener el x-token en el header de todas las peticiones", async () => {
    const tokenTest = "ABC-123-DER";
    localStorage.setItem("token", tokenTest);
    const resp = await calendarApi.get("/auth");

    expect(resp.config.headers["x-token"]).toBe(tokenTest);
  });
});
