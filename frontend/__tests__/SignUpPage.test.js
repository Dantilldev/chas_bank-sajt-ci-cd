// Importerar testverktyg från React Testing Library
import {render, screen, fireEvent, waitFor} from "@testing-library/react";

// Importerar komponenten som ska testas
import Signup from "@/app/signup/page";

// Extra matchers för t.ex. toBeInTheDocument()
import "@testing-library/jest-dom";

// 🔧 MOCKA `fetch` globalt så att inga riktiga nätverksanrop görs under test
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]), // returnerar en tom lista som svar
  })
);

// 🧪 Beskrivning av test-sviten för Signup-komponenten
describe("Signup Component", () => {
  // Innan varje test körs...
  beforeEach(() => {
    fetch.mockClear(); // 🔄 Nollställer mock:en så vi får rena resultat
  });

  // ✅ TEST 1: Komponentens struktur
  it("renders form inputs and submit button", () => {
    render(<Signup />); // 🔍 Renderar signup-komponenten i ett test-DOM

    // ✔ Kollar att input för username finns
    expect(screen.getByPlaceholderText("Enter username")).toBeInTheDocument();

    // ✔ Kollar att input för password finns
    expect(screen.getByPlaceholderText("Enter password")).toBeInTheDocument();

    // ✔ Kollar att knappen med texten "Register" finns
    expect(screen.getByRole("button", {name: "Register"})).toBeInTheDocument();
  });

  // ✅ TEST 2: Formuläret fungerar korrekt
  it("allows user to fill in and submit the form", async () => {
    render(<Signup />); // 🔍 Renderar signup-komponenten

    // 🔽 Hämtar formulärfälten
    const usernameInput = screen.getByPlaceholderText("Enter username");
    const passwordInput = screen.getByPlaceholderText("Enter password");
    const button = screen.getByRole("button", {name: /register/i});

    // 🖊 Fyller i testdata i inputfält
    fireEvent.change(usernameInput, {target: {value: "testuser"}});
    fireEvent.change(passwordInput, {target: {value: "testpass"}});

    // 🖱 Klickar på "Register"-knappen
    fireEvent.click(button);

    // ⏳ Väntar tills mock-fetch kallas
    await waitFor(() => {
      // ✅ Kollar att fetch anropades en gång
      expect(fetch).toHaveBeenCalledTimes(1);

      // ✅ Kollar att fetch anropades med rätt URL och options
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/http:\/\/.*:4000\/users/), // matchar URL:en
        expect.objectContaining({
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            username: "testuser",
            password: "testpass",
          }),
        })
      );
    });
  });
});
