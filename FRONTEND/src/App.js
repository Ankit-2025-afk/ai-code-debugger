import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";

function App() {

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = "https://ai-code-debugger-m9w8.onrender.com";

  const runDebug = async () => {

    setLoading(true);
    setOutput("⏳ Connecting to backend...\n");

    try {
      const res = await fetch(`${API_BASE}/debug`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code, language })
      });

      const data = await res.json();

      console.log("🔥 FULL BACKEND RESPONSE:", data);

      let result = "";

      // =========================
      // 🧪 TEST FIELD (VERY IMPORTANT)
      // =========================
      if (data.test_message) {
        result += `🧪 Test Message:\n${data.test_message}\n\n`;
      }

      // =========================
      // 🏆 ML SCORE
      // =========================
      if (data.ml_score !== undefined) {
        result += `🏆 ML Score: ${data.ml_score}\n\n`;
      }

      // =========================
      // 🧩 SYNTAX
      // =========================
      if (data.syntax_error) {
        result += `❌ Syntax Error:\n${data.syntax_error}\n\n`;
      } else if (data.syntax) {
        result += `✅ ${data.syntax}\n\n`;
      }

      // =========================
      // 💥 RUNTIME
      // =========================
      if (data.runtime_error) {
        result += `💥 Runtime Error:\n${data.runtime_error}\n\n`;
      }

      // =========================
      // 🧠 LOGIC
      // =========================
      if (data.logic && data.logic.length > 0) {
        result += `🧠 Issues:\n${data.logic.join("\n")}\n\n`;
      }

      // =========================
      // 🧾 FULL RESPONSE (DEBUG MODE)
      // =========================
      result += "------------------------\n";
      result += "📦 FULL BACKEND RESPONSE:\n";
      result += JSON.stringify(data, null, 2);

      setOutput(result);

    } catch (error) {
      console.error(error);
      setOutput("❌ Error connecting to backend");
    }

    setLoading(false);
  };

  return (
    <div style={{
      backgroundColor: "#121212",
      color: "white",
      minHeight: "100vh",
      padding: "30px"
    }}>

      <h1 style={{ textAlign: "center" }}>🧪 Backend Test UI</h1>

      <div style={{
        maxWidth: "900px",
        margin: "auto",
        background: "#1e1e1e",
        padding: "20px",
        borderRadius: "10px"
      }}>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{ padding: 10, marginBottom: 15, width: "100%" }}
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
        </select>

        <CodeMirror
          value={code}
          height="200px"
          theme={oneDark}
          onChange={(value) => setCode(value)}
        />

        <button
          onClick={runDebug}
          disabled={loading}
          style={{
            marginTop: 15,
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer"
          }}
        >
          {loading ? "Testing..." : "Run Test"}
        </button>

        <pre style={{
          marginTop: 20,
          background: "#000",
          color: "#00ffcc",
          padding: 15,
          borderRadius: 5,
          minHeight: "300px",
          whiteSpace: "pre-wrap"
        }}>
          {output}
        </pre>

      </div>
    </div>
  );
}

export default App;