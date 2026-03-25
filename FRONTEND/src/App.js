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
  console.log("Button clicked");

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

console.log("Backend Response:", data);

// =====================
// 📊 ADD THIS HERE
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

// =====================
// 🎯 OVERALL SCORE
// =====================
let overallScore = Math.round(
  (syntaxScore + logicScore + performanceScore + securityScore) / 4
);

let grade = "";

if (overallScore >= 90) grade = "A+ (Excellent)";
else if (overallScore >= 75) grade = "A (Good)";
else if (overallScore >= 60) grade = "B (Average)";
else if (overallScore >= 40) grade = "C (Needs Improvement)";
else grade = "D (Poor)";

result += `📊 Grade: ${grade}\n\n`;

// Prevent negative values
logicScore = Math.max(logicScore, 40);
performanceScore = Math.max(performanceScore, 40);
securityScore = Math.max(securityScore, 40);

   let result = "";

// 📏 Lines
result += `📏 Lines of Code: ${lines}\n\n`;
result += `🏆 Overall Code Score: ${overallScore}/100\n\n`;

// =====================
// 🧩 SYNTAX ANALYSIS
// =====================
if (data.syntax_error) {
  result += `❌ Syntax Analysis:\n`;
  result += `Error: ${data.syntax_error}\n`;
  result += `📍 Line: ${data.line || "N/A"}\n`;
  result += `📊 Accuracy: 0%\n\n`;
} else {
  result += `🧩 Syntax Analysis:\n`;
  result += `✔ No syntax errors found\n`;
  result += `📊 Accuracy: 100%\n\n`;
}

// =====================
// 💥 RUNTIME ERROR
// =====================
if (data.runtime_error) {
  result += `💥 Runtime Error:\n${data.runtime_error}\n\n`;
}

// =====================
// 🧠 LOGICAL ANALYSIS
// =====================
if (data.syntax_error) {
  result += `🧠 Logical Analysis:\n⚠ Cannot evaluate due to syntax error\n\n`;
} else if (data.logic?.length > 0) {
  result += `🧠 Logical Issues:\n${data.logic.join("\n")}\n`;
  result += `📊 Confidence: ${logicScore}%\n\n`;
} else {
  result += `🧠 Logical Analysis:\n✔ No logical issues detected\n`;
  result += `📊 Confidence: ${logicScore}%\n\n`;
}

// =====================
// ⚡ PERFORMANCE
// =====================
if (data.syntax_error) {
  result += `⚡ Performance Analysis:\n⚠ Cannot evaluate due to syntax error\n\n`;
} else if (data.performance?.length > 0) {
  result += `⚡ Performance Issues:\n${data.performance.join("\n")}\n`;
  result += `📊 Efficiency Score: ${performanceScore}%\n\n`;
} else {
  result += `⚡ Performance Analysis:\n✔ No performance issues detected\n`;
  result += `📊 Efficiency Score: ${performanceScore}%\n\n`;
}

// =====================
// 🔒 SECURITY
// =====================
if (data.syntax_error) {
  result += `🔒 Security Analysis:\n⚠ Cannot evaluate due to syntax error\n\n`;
} else if (data.security?.length > 0) {
  result += `🔒 Security Issues:\n${data.security.join("\n")}\n`;
  result += `📊 Safety Score: ${securityScore}%\n\n`;
} else {
  result += `🔒 Security Analysis:\n✔ No security risks detected\n`;
  result += `📊 Safety Score: ${securityScore}%\n\n`;
}

// =====================
// 🎉 FINAL VERDICT
// =====================
if (
  !data.syntax_error &&
  !data.runtime_error &&
  !data.logic?.length &&
  !data.performance?.length &&
  !data.security?.length
) {
  result += `🎉 Final Verdict:\nYour code is clean and optimized.\n\n`;
}

// =====================
// 🤖 AI EXPLANATION
// =====================
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

export default App;
