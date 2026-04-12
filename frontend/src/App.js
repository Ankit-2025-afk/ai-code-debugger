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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: "python" })
      });

      const data = await res.json();
      setOutput(data);
    } catch {
      setOutput({ error: "Backend error" });
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>🧠 AI Code Debugger</h2>
      </header>

      <div style={styles.main}>

        {/* LEFT SIDE */}
        <div style={styles.left}>
          <h3>Code Editor</h3>

          <CodeMirror
            value={code}
            height="300px"
            theme={oneDark}
            onChange={(value) => setCode(value)}
          />

          <button style={styles.button} onClick={runDebug}>
            {loading ? "Analyzing..." : "Debug Code"}
          </button>
        </div>

        {/* RIGHT SIDE */}
        <div style={styles.right}>
          {output && (
            <>
              <div style={styles.scoreCard}>
                <h3>Score</h3>
                <h1>{output.ml_score || output.scores?.overall || 0}</h1>
              </div>

              <Section title="Errors">
                {output.syntax_error || output.runtime_error || "No errors"}
              </Section>

              <Section title="Logical Issues">
                {output.logic?.length ? output.logic.join(", ") : "None"}
              </Section>

              <Section title="Performance">
                {output.performance?.length ? output.performance.join(", ") : "Good"}
              </Section>

              <Section title="Security">
                {output.security?.length ? output.security.join(", ") : "Safe"}
              </Section>

              <Section title="AI Explanation">
                {output.ai_explanation}
              </Section>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

/* COMPONENT */
const Section = ({ title, children }) => (
  <div style={styles.card}>
    <h4>{title}</h4>
    <p>{children}</p>
  </div>
);

/* STYLES */
const styles = {
  container: {
    fontFamily: "Arial",
    background: "#f5f7fb",
    minHeight: "100vh"
  },
  header: {
    background: "#fff",
    padding: "15px 30px",
    borderBottom: "1px solid #ddd"
  },
  main: {
    display: "flex",
    gap: "20px",
    padding: "20px"
  },
  left: {
    flex: 2,
    background: "#fff",
    padding: "20px",
    borderRadius: "10px"
  },
  right: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  button: {
    marginTop: "15px",
    padding: "10px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },
  card: {
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
  },
  scoreCard: {
    background: "#eef2ff",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center"
  }
};

export default App;