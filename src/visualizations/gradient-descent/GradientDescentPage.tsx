import { GDPageShell } from "./GDPageShell";
import { linearRegressionKit } from "./linearRegressionKit";

export function GradientDescentPage() {
  return <GDPageShell kit={linearRegressionKit} />;
}
