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
    const startTime = Date.now();

    const fetchWithRetry = async (url, options, retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch(url, options);
          if (res.ok) return res;
        } catch (err) {
          console.log("Retry attempt:", i + 1);
        }
        await new Promise(r => setTimeout(r, 5000));
      }
      throw new Error("Server not responding");
    };

    setLoading(true);
    setOutput("⏳ Connecting to server...\n(This may take 20–40 seconds if server is sleeping)\n");

    try {
      const lines = code.split("\n").length;

      const res = await fetchWithRetry(`${API_BASE}/debug`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code, language })
      });

      const data = await res.json();

      const endTime = Date.now();
      const responseTime = ((endTime - startTime) / 1000).toFixed(2);

      console.log("Backend Response:", data);

      // =====================
      // 📊 SCORING SYSTEM
      // =====================
      let syntaxScore = data.syntax_error ? 0 : 100;

      let logicScore = 100;
      if (data.logic?.length > 0) {
        logicScore = 70 - (data.logic.length * 10);
      }

      let performanceScore = 100;
      if (data.performance?.length > 0) {
        performanceScore = 70 - (data.performance.length * 10);
      }

      let securityScore = 100;
      if (data.security?.length > 0) {
        securityScore = 70 - (data.security.length * 10);
      }

      logicScore = Math.max(logicScore, 40);
      performanceScore = Math.max(performanceScore, 40);
      securityScore = Math.max(securityScore, 40);

      // ✅ ML + fallback
      let overallScore = data.ml_score ?? Math.round(
        (syntaxScore + logicScore + performanceScore + securityScore) / 4
      );

      // 🎯 Grade
      let grade = "";
      if (overallScore >= 90) grade = "A+ (Excellent)";
      else if (overallScore >= 75) grade = "A (Good)";
      else if (overallScore >= 60) grade = "B (Average)";
      else if (overallScore >= 40) grade = "C (Needs Improvement)";
      else grade = "D (Poor)";

      // =====================
      // 🧾 OUTPUT BUILDING
      // =====================
      let result = "";

      // 📏 Lines
      result += `📏 Lines of Code: ${lines}\n\n`;

      // 🏆 Score
      result += `🏆 Overall Code Score: ${overallScore}/100\n`;
      result += `📊 Grade: ${grade}\n`;
      result += `⏱ Response Time: ${responseTime}s\n\n`;

      // 🧩 Syntax
      if (data.syntax_error) {
        result += `❌ Syntax Error:\n${data.syntax_error}\n\n`;
      } else {
        result += `🧩 Syntax Analysis:\n✔ No syntax errors found\n\n`;
      }

      // 💥 Runtime
      if (data.runtime_error) {
        result += `💥 Runtime Error:\n${data.runtime_error}\n\n`;
      }

      // 🧠 Logic
      if (data.logic?.length > 0) {
        result += `🧠 Logical Issues:\n${data.logic.join("\n")}\n\n`;
      }

      // ⚡ Performance
      if (data.performance?.length > 0) {
        result += `⚡ Performance Issues:\n${data.performance.join("\n")}\n\n`;
      }

      // 🔒 Security
      if (data.security?.length > 0) {
        result += `🔒 Security Issues:\n${data.security.join("\n")}\n\n`;
      }

      // 🤖 AI
      if (data.ai_explanation) {
        result += `🤖 AI Explanation:\n${data.ai_explanation}`;
      }

      setOutput(result);

    } catch (error) {
      console.error(error);

      setOutput(
        "❌ Server is still waking up...\n\n" +
        "👉 Please wait 20–40 seconds and try again.\n" +
        "👉 This is normal for free hosting (Render)."
      );
    }

    setLoading(false);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  const clearAll = () => {
    setCode("");
    setOutput("");
  };

  return (
    <div style={{
      backgroundColor: "#121212",
      color: "white",
      minHeight: "100vh",
      padding: "30px",
      fontFamily: "Arial"
    }}>

      <h1 style={{ textAlign: "center" }}>🚀 AI Code Debugger</h1>

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
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>

        <CodeMirror
          value={code}
          height="200px"
          theme={oneDark}
          onChange={(value) => setCode(value)}
        />

        <div style={{ marginTop: 15 }}>
          <button onClick={runDebug} disabled={loading} style={btn("#007bff")}>
            {loading ? "Analyzing..." : "Debug Code"}
          </button>

          <button onClick={copyOutput} style={btn("#28a745")}>
            Copy Output
          </button>

          <button onClick={clearAll} style={btn("#dc3545")}>
            Clear
          </button>
        </div>

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

const btn = (color) => ({
  padding: "10px 15px",
  marginRight: 10,
  backgroundColor: color,
  color: "white",
  border: "none",
  cursor: "pointer",
  borderRadius: "5px"
});

export default App;R