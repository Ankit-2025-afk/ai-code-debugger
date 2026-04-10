import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";

function App() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState(null);
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
        body: JSON.stringify({ code, language: "python" })
      });

      const data = await res.json();
      console.log(data);
      setOutput(data);

    } catch (err) {
      setOutput({ error: "Failed to connect backend" });
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1>🚀 AI Code Debugger</h1>

      <CodeMirror
        value={code}
        height="200px"
        theme={oneDark}
        onChange={(value) => setCode(value)}
      />

      <button onClick={runDebug} style={styles.button}>
        {loading ? "Analyzing..." : "Debug Code"}
      </button>

      {output && (
        <div style={styles.resultBox}>

          {/* STATUS */}
          <Card title="🧪 Status">
            {output.test_message}
          </Card>

          {/* SCORE */}
          {output.scores && (
            <Card title="🏆 Overall Score">
              <Progress value={output.scores.overall} />
            </Card>
          )}

          {/* SCORE BREAKDOWN */}
          {output.scores && (
            <Card title="📊 Score Breakdown">
              <Progress label="Syntax" value={output.scores.syntax} />
              <Progress label="Logic" value={output.scores.logic} />
              <Progress label="Performance" value={output.scores.performance} />
              <Progress label="Security" value={output.scores.security} />
            </Card>
          )}

          {/* SYNTAX */}
          <Card title="🧩 Syntax">
            {output.syntax_error || output.syntax}
          </Card>

          {/* LOGIC */}
          <Card title="🧠 Logic Issues">
            {output.logic?.length ? output.logic.join(", ") : "No issues"}
          </Card>

          {/* PERFORMANCE */}
          <Card title="⚡ Performance">
            {output.performance?.length ? output.performance.join(", ") : "No issues"}
          </Card>

          {/* SECURITY */}
          <Card title="🔒 Security">
            {output.security?.length ? output.security.join(", ") : "No issues"}
          </Card>

          {/* AI */}
          <Card title="🤖 AI Explanation">
            {output.ai_explanation}
          </Card>

        </div>
      )}
    </div>
  );
}

////////////////////////////////////////
// UI COMPONENTS
////////////////////////////////////////

const Card = ({ title, children }) => (
  <div style={{
    background: "#1e1e1e",
    padding: "15px",
    borderRadius: "10px",
    marginTop: "10px"
  }}>
    <h3>{title}</h3>
    <p>{children}</p>
  </div>
);

const Progress = ({ value, label }) => {
  const getColor = () => {
    if (value >= 80) return "#28a745";
    if (value >= 60) return "#ffc107";
    return "#dc3545";
  };

  return (
    <div style={{ marginBottom: 10 }}>
      {label && <p>{label}</p>}
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
      <small>{value}%</small>
    </div>
  );
};

////////////////////////////////////////
// STYLES
////////////////////////////////////////

const styles = {
  container: {
    backgroundColor: "#121212",
    color: "white",
    minHeight: "100vh",
    padding: "20px",
    fontFamily: "Arial"
  },
  button: {
    marginTop: 15,
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px"
  },
  resultBox: {
    marginTop: 20
  }
};

export default App;