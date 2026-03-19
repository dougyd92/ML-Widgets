import { GDPageShell } from "./GDPageShell";
import { neuralNetworkKit } from "./neuralNetworkKit";

export function NNGradientDescentPage() {
  return <GDPageShell kit={neuralNetworkKit} />;
}
