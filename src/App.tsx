import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { GradientDescentPage } from "./visualizations/gradient-descent/GradientDescentPage";
import { DecisionBoundaryPage } from "./visualizations/decision-boundary/DecisionBoundaryPage";

function App() {
  const path = window.location.pathname;

  if (path.startsWith("/viz/gradient-descent")) {
    return (
      <Layout title="Gradient Descent Step-by-Step">
        <GradientDescentPage />
      </Layout>
    );
  }

  if (path.startsWith("/viz/decision_boundary")) {
    return (
      <Layout title="Decision Boundary Explorer">
        <DecisionBoundaryPage />
      </Layout>
    );
  }

  return (
    <Layout>
      <HomePage />
    </Layout>
  );
}

export default App;
