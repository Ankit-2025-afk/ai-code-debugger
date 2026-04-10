import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";

function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [outputData, setOutputData] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = "https://ai-code-debugger-m9w8.onrender.com";

  const runDebug = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/debug`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code, language })
      });

      const data = await res.json();
      console.log("Backend Response:", data);

      setOutputData(data);

    } catch (error) {
      console.error(error);
      setOutputData({
        error: "❌ Failed to connect to backend"
      });
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={{ textAlign: "center" }}>🚀 AI Code Debugger</h1>

      <div style={styles.box}>

        {/* Language Selector */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={styles.select}
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
        </select>

        {/* Code Editor */}
        <CodeMirror
          value={code}
          height="200px"
          theme={oneDark}
          onChange={(value) => setCode(value)}
        />

        {/* Button */}
        <button onClick={runDebug} style={styles.button}>
          {loading ? "Analyzing..." : "Debug Code"}
        </button>

        {/* OUTPUT UI */}
        <div style={{ marginTop: 20 }}>

          {/* Error */}
          {outputData?.error && (
            <Card title="❌ Error">
              {outputData.error}
            </Card>
          )}

          {/* Test Message */}
          {outputData?.test_message && (
            <Card title="🧪 Status">
              {outputData.test_message}
            </Card>
          )}

          {/* ML Score */}
          {outputData?.ml_score !== undefined && (
            <Card title="🏆 ML Score">
              <Progress value={outputData.ml_score} />
            </Card>
          )}

          {/* Syntax */}
          <Card title="🧩 Syntax">
            {outputData?.syntax_error
              ? outputData.syntax_error
              : outputData?.syntax || "No syntax errors"}
          </Card>

          {/* Runtime */}
          {outputData?.runtime_error && (
            <Card title="💥 Runtime Error">
              {outputData.runtime_error}
            </Card>
          )}

          {/* Logic */}
          <Card title="🧠 Logic">
            {outputData?.logic?.length > 0
              ? outputData.logic.join(", ")
              : "No logical issues"}
          </Card>

        </div>
      </div>
    </div>
  );
}

//////////////////////////////////////////////
// 🎨 UI COMPONENTS
//////////////////////////////////////////////

const Card = ({ title, children }) => (
  <div style={{
    background: "#1e1e1e",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.3)"
  }}>
    <h3 style={{ marginBottom: 10 }}>{title}</h3>
    <p>{children}</p>
  </div>
);

const Progress = ({ value }) => {
  const getColor = () => {
    if (value >= 80) return "#28a745";
    if (value >= 60) return "#ffc107";
    return "#dc3545";
  };

  return (
    <div>
      <div style={{
        height: "10px",
        background: "#333",
        borderRadius: "5px"
      }}>
        <div style={{
          width: `${value}%`,
          height: "100%",
          background: getColor(),
          borderRadius: "5px"
        }} />
      </div>
      <p>{value}%</p>
    </div>
  );
};

//////////////////////////////////////////////
// 🎨 STYLES
//////////////////////////////////////////////

const styles = {
  container: {
    backgroundColor: "#121212",
    color: "white",
    minHeight: "100vh",
    padding: "30px",
    fontFamily: "Arial"
  },
  box: {
    maxWidth: "900px",
    margin: "auto",
    background: "#1e1e1e",
    padding: "20px",
    borderRadius: "10px"
  },
  select: {
    padding: 10,
    marginBottom: 15,
    width: "100%"
  },
  button: {
    marginTop: 15,
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px"
  }
};

export default App;