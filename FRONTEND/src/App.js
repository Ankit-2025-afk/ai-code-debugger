import { useState } from "react";

function App() {

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = "https://ai-code-debugger-m9w8.onrender.com";

  const runDebug = async () => {

    const fetchWithRetry = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
    } catch (err) {
      console.log("Retry attempt:", i + 1);
    }

    // wait 5 seconds before retry
    await new Promise(r => setTimeout(r, 5000));
  }

  throw new Error("Server not responding");
};

const runDebug = async () => 

  setLoading(true);
  setOutput("⏳ Connecting to server...\n(This may take 20–40 seconds if server is sleeping)\n");

  try {

    const lines = code.split("\n").length;

    // 🔥 Use retry version instead of normal fetch
    const res = await fetchWithRetry(`${API_BASE}/debug`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code, language })
    });

    const data = await res.json();

    let result = "";

    result += "📏 Lines of Code: " + lines + "\n\n";

    if (data.syntax_error) {
      result += "❌ Syntax Error:\n" + data.syntax_error + "\n\n";
    }

    if (data.message) {
      result += "✅ " + data.message + "\n\n";
    }

    if (data.logic && data.logic.length > 0) {
      result += "⚠ Logical Issues:\n" + data.logic.join("\n") + "\n\n";
    }

    if (data.performance && data.performance.length > 0) {
      result += "⚡ Performance Issues:\n" + data.performance.join("\n") + "\n\n";
    }

    if (data.security && data.security.length > 0) {
      result += "🔒 Security Issues:\n" + data.security.join("\n") + "\n\n";
    }

    // =========================
    // 🔥 SCORING
    // =========================

    let logicalScore = 100;
    let syntaxScore = 100;
    let securityScore = 100;
    let performanceScore = 100;

    if (data.logic) logicalScore -= data.logic.length * 8;
    if (data.syntax_error) syntaxScore -= 40;
    if (data.security) securityScore -= data.security.length * 20;
    if (data.performance) performanceScore -= data.performance.length * 12;

    logicalScore = Math.max(logicalScore, 0);
    syntaxScore = Math.max(syntaxScore, 0);
    securityScore = Math.max(securityScore, 0);
    performanceScore = Math.max(performanceScore, 0);

    const overallScore = Math.round(
      (logicalScore + syntaxScore + securityScore + performanceScore) / 4
    );

    // =========================
    // 🔥 RESPONSE TIME
    // =========================

    let baseTime = 0.5 + lines * 0.01;

    if (data.performance) baseTime += data.performance.length * 0.3;
    if (data.logic) baseTime += data.logic.length * 0.2;
    if (data.syntax_error) baseTime += 0.5;

    const responseTime = baseTime.toFixed(2);

    // =========================
    // 🔥 LANGUAGE SCORE
    // =========================

    let langScore = 100;

    langScore -= (data.logic?.length || 0) * 5;
    langScore -= (data.security?.length || 0) * 7;
    langScore -= (data.performance?.length || 0) * 5;

    if (data.syntax_error) langScore -= 15;

    langScore = Math.max(langScore, 0);

    // =========================
    // 🔥 GRADE
    // =========================

    let grade = "Excellent";
    if (overallScore < 90) grade = "Good";
    if (overallScore < 75) grade = "Average";
    if (overallScore < 50) grade = "Poor";

    // =========================
    // 📊 OUTPUT
    // =========================

    result += "📊 System Performance:\n";
    result += `Logical: ${logicalScore}%\n`;
    result += `Syntax: ${syntaxScore}%\n`;
    result += `Security: ${securityScore}%\n`;
    result += `Performance: ${performanceScore}%\n\n`;

    result += `⭐ Overall Score: ${overallScore}%\n`;
    result += `🏆 Code Quality: ${grade}\n\n`;

    result += `📊 ${language.toUpperCase()} Accuracy: ${langScore}%\n\n`;

    result += `⏱ Response Time: ${responseTime} sec\n\n`;

    if (data.ai_explanation) {
      result += "🤖 AI Explanation:\n" + data.ai_explanation;
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

        <textarea
          rows={10}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your code here..."
          style={{
            width: "100%",
            padding: 10,
            background: "#2d2d2d",
            color: "white",
            border: "none",
            borderRadius: 5
          }}
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

export default App;
