# ML Widgets — AI Agent Guide

Interactive browser-based visualizations for machine learning concepts. React 19 + TypeScript + Vite + Tailwind CSS.

## Quick Start

```bash
npm run dev      # Start dev server
npm run build    # Type-check (tsc) then bundle (vite)
npm run test     # Run all tests (Vitest)
npm run lint     # ESLint
```

**After every incremental feature change**, run `npm run test` to confirm all tests pass. **Always run `npm run test` before committing** — do not commit with failing tests.

## Project Structure

```
src/
├── App.tsx                         # Client-side routing via window.location.pathname
├── main.tsx                        # React entry point
├── index.css                       # Tailwind import + body reset
├── components/
│   ├── Layout.tsx                  # Full-height shell with nav bar
│   └── ui/Slider.tsx               # Range input wrapper
├── pages/
│   └── HomePage.tsx                # Landing page with viz cards
├── engine/                         # ML engine (model-agnostic)
│   ├── types.ts                    # Core interfaces: Model, UpdateRule, BatchStrategy, StepResult
│   ├── engine.ts                   # GDEngine class — orchestrates training steps
│   ├── data.ts                     # Synthetic data generator (y = 2x + 1 + noise)
│   ├── seed.ts                     # Mulberry32 deterministic PRNG
│   ├── models/
│   │   └── linearRegression.ts     # ŷ = w₀ + w₁·x, gradients, forward pass descriptions
│   ├── updateRules/
│   │   └── vanillaSgd.ts           # w ← w - lr·∇L
│   └── batchStrategies/
│       └── singleSample.ts        # One sample per step, Fisher-Yates shuffle per epoch
└── visualizations/
    ├── gradient-descent/           # Step-by-step SGD trainer (see detailed section below)
    ├── decision-boundary/          # Interactive weight sliders → 2D boundary (raw SVG)
    └── regularization-geometry/    # L1 vs L2 constraint shapes on loss contours (Canvas 2D)
```

## Key Architecture Patterns

### Engine / UI separation
The `src/engine/` directory contains pure computation with no React dependencies. Models, update rules, and batch strategies are pluggable via TypeScript interfaces defined in `types.ts`. The engine exposes a `step()` method that returns a `StepResult` containing everything the UI needs.

### Pluggable ML components
To add a new model, implement the `Model` interface (see `types.ts`). Same for `UpdateRule` and `BatchStrategy`. The engine and UI don't know about concrete implementations.

### Visualization conventions
Each visualization lives in `src/visualizations/<name>/` and follows this pattern:
- **`<Name>Page.tsx`** — Top-level page component, manages state, passed to `Layout`
- **Custom hooks** (`hooks/`) — Business logic separated from rendering
- **Sub-components** — Pure presentational components receiving props

### Rendering approaches used
- **Recharts** (`recharts` package) — Scatter plots in gradient descent viz
- **Raw SVG** — Decision boundary viz, computation graph, loss sparkline
- **Canvas 2D** — Regularization geometry viz

### Routing
Manual client-side routing in `App.tsx` via `window.location.pathname`. No router library. A `_redirects` file exists for Netlify SPA support.

### Styling
Tailwind CSS utility classes for layout and static styles. Inline `style` props for dynamic SVG/Canvas values. The path alias `@/` maps to `./src/`.

## Gradient Descent Visualization — Deep Dive

This is the most complex visualization. Here's how data flows:

### State management
`useGradientDescent` hook (`hooks/useGradientDescent.ts`) owns all training state:
- `history: StepResult[]` — every computed step, supports replay
- `currentStepIndex` — position in history (-1 = initial state)
- `subStep` — 0-4, progressive disclosure within each step

Navigation: `next()` advances subStep first (0→1→2→3→4), then moves to the next training step (resetting subStep to 0). `prev()` does the reverse. History enables full backward traversal.

### Sub-step system
Each training step has 5 phases shown progressively:

| subStep | Phase      | What's shown |
|---------|------------|-------------|
| 0       | `params`   | Current w₀, w₁ values |
| 1       | `forward`  | Prediction: ŷ = w₀ + w₁·x |
| 2       | `residual` | Error: ŷ - y |
| 3       | `gradient` | ∂L/∂w₀, ∂L/∂w₁ |
| 4       | `update`   | New parameter values |

Phases are defined as `ComputationPhase` type in `types.ts`. The `visibleComputationSteps` are filtered from `StepResult.computationSteps` by slicing `PHASE_ORDER`.

### Computation graph
The SVG computation graph (`ComputationGraph.tsx`) is **topology-agnostic**:
- Graph structure is declared as data (`ComputationGraphDef` — nodes + edges)
- Visual state per sub-step is computed by `computeHighlightState()` in `linearRegressionGraph.ts`
- The renderer auto-lays-out nodes in columns by `GraphNodeKind`
- To add a new model graph, create a new `ComputationGraphDef` and highlight function

### Component hierarchy
```
GradientDescentPage
├── ConfigPanel (learning rate, speed sliders)
├── GDVisualizer
│   ├── ScatterPlot (Recharts — data points, regression line, residuals)
│   └── ComputationPanel (w-[420px] right panel)
│       ├── ComputationGraph (SVG — nodes, edges, highlights)
│       └── MathLine[] (text computation steps)
└── Bottom bar
    ├── StepControls (reset, prev, next, play/pause)
    ├── LossTracker (MSE + SVG sparkline)
    └── EpochIndicator (epoch counter + progress bar)
```

### Training data
10 synthetic points from `y = 2x + 1 + noise`, x in [0.5, 4.5], deterministic seed 42. Single-sample SGD with Fisher-Yates shuffle each epoch, 12 epochs = 120 total steps.

### Learning rate changes
When the user changes LR mid-training, `useGradientDescent` truncates forward history from the current position. Future steps use the new LR, creating a branch in the training trajectory.

## Dependencies

Only 4 runtime dependencies: `react`, `react-dom`, `recharts`, `tailwindcss`. The project deliberately minimizes external dependencies.
