import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();
const port = 4000;

// Middleware - sätts före routes
app.use(cors());
app.use(express.json()); // Använd Express inbyggda json-parser

const pool = mysql.createPool({
  user: "root",
  password: "root",
  host: "mysql",
  database: "bank",
  port: 3307,
});

// Hjälpfunktion för att hantera SQL-frågor
async function query(sql, params) {
  const [results] = await pool.execute(sql, params);
  return results;
}

// Generera engångslösenord
function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

// Din kod här. Skriv dina arrayer

let sessions = [];

// Route för att lägga till en användare - create inserst med SQL
app.post("/users", async (req, res) => {
  const {username, password} = req.body;

  try {
    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    const params = [username, password];

    const result = await query(sql, params);

    const userId = result.insertId;

    const sqlAccount = "INSERT INTO accounts (userId, amount) VALUES (?, ?)";
    const paramsAccount = [userId, 0];

    await query(sqlAccount, paramsAccount);

    console.log("Result: ", result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({error: error.message});
  }
});

// SESSIONS
app.post("/sessions", async (req, res) => {
  const {username, password} = req.body;

  try {
    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    const params = [username, password];

    const result = await query(sql, params);

    // Check if user exists
    if (result.length === 0) {
      return res.status(401).json({error: "Invalid username or password"});
    }

    const user = result[0];

    const token = generateOTP();

    const session = {
      userId: user.id,
      id: sessions.length + 1,
      token,
      username,
    };

    sessions.push(session);
    res.json(session);

    console.log("Result: ", result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({error: error.message});
  }
});

// ME/ACCOUNTS
app.post("/me/accounts", async (req, res) => {
  const {token} = req.body; // Accept the token from the body
  const session = sessions.find((session) => session.token === token);

  // If the session is found, get the account
  if (session) {
    const {userId} = session;

    try {
      const sql = "SELECT * FROM accounts WHERE userId = ?";
      const params = [userId];

      const result = await query(sql, params);

      const account = result[0];

      if (account) {
        res.json(account);
      } else {
        res.status(404).send("Account not found");
      }
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({error: error.message});
    }

    // If the account is found, return it and go to its personal page
  } else {
    res.status(404).send("Session not found");
  }
});

// ME/ACCOUNTS/TRANSACTIONS
app.post("/me/accounts/transactions", async (req, res) => {
  const {depositAmount, token} = req.body;

  const session = sessions.find((session) => session.token === token);

  if (session) {
    try {
      const {userId} = session;
      const sql = "UPDATE accounts SET amount = amount + ? WHERE userId = ?";
      const params = [Number(depositAmount), userId];

      await query(sql, params);

      // const account = result[0];
      const accountSql = "SELECT * FROM accounts WHERE userId = ?";
      const accountParams = [userId];

      const result2 = await query(accountSql, accountParams);

      res.json(result2[0]); // Send updated account
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({error: error.message});
    }
  } else {
    res.status(404).send("Session not found");
  }
});

// Starta servern
app.listen(port, () => {
  console.log(`Bankens backend körs på http://localhost:${port}`);
});
