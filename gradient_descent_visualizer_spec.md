# Gradient Descent Step-by-Step Visualizer — Spec

## Context

This is for a 20-session, 10-week Machine Learning Foundations bootcamp (Codecademy Live Learning). The instructor (Doug) teaches live over Zoom; many students watch session recordings asynchronously. Students range from complete beginners to those with some technical background, including non-native English speakers and students without prior university experience.

Students have encountered gradient descent conceptually (verbal descriptions, abstract GIF) and implicitly (calling `.fit()` in sklearn). They have **not** seen the step-by-step mechanics: how individual gradients are computed, how parameters update, how the loss decreases. This visualization fills that gap.

This component will first be used in **Session 12** (Classical ML Review) to build deep understanding before the neural networks block begins in Session 13.

---

## Purpose

Build an interactive React component that walks through gradient descent **one step at a time**, showing:

1. The current parameter values
2. Which data point(s) are being used
3. The prediction for that point
4. The residual (error)
5. The gradient computation
6. The parameter update
7. The resulting new parameters and loss

The user clicks "Next Step" to advance through the process. They can also step backward, reset, or let it auto-play.

---

## Design Principles

### Reusability and Extensibility

This is **not** a one-off visualization. The same visual framework will be reused across multiple sessions:

| Session | Variant | What changes |
|---------|---------|-------------|
| 12 | Vanilla SGD (one sample at a time) | First introduction |
| 14 | Mini-batch GD | Multiple samples highlighted per step |
| 14 | Momentum, Adam | Update rule panel shows additional terms (velocity, etc.) |
| 13–14 | 2-layer neural network | Computation panel shows forward pass through layers, then backprop |

The architecture should make it straightforward to swap in different:
- **Update rules** (SGD → momentum → Adam)
- **Models** (linear regression → logistic regression → simple neural net)
- **Batch strategies** (single sample → mini-batch → full batch)

This doesn't mean building all variants now. It means the code structure should separate the computation logic from the visualization layout so future variants don't require rewriting the UI.

### Visual Consistency

All variants should share:
- The same overall layout (plot on one side, computation panel on the other)
- The same color scheme
- The same step controls (Next, Previous, Reset, Auto-play)
- The same animation/transition style

### Audience

- Beginners who may not have calculus background
- The math should be shown but also translated to plain language
- Numbers should be rounded to 2–3 decimal places for readability
- The visualization should be self-explanatory enough that an async student can use it without the instructor present

---

## Layout

Two-panel layout:

### Left Panel: Data + Model Visualization

- **Scatter plot** of the training data (small synthetic dataset, ~8-12 points)
- **Current regression line** drawn through the data, updating as parameters change
- **Active data point** highlighted (larger, different color) — this is the point being used for the current gradient computation
- **Residual** shown as a vertical dashed line from the active point to the regression line
- Axis labels, clean styling

### Right Panel: Computation Panel

This is the key pedagogical element. It shows the math for the current step in a structured, readable format:

```
Step 3 of 96  |  Epoch 1, Sample 3

Current parameters:
  w₀ = 0.124    w₁ = 0.532

Forward pass (prediction):
  ŷ = w₀ + w₁·x = 0.124 + 0.532 · 2.5 = 1.454

Error:
  residual = ŷ - y = 1.454 - 2.1 = -0.646

Gradients:
  ∂L/∂w₀ = 2(ŷ - y) = 2(-0.646) = -1.292
  ∂L/∂w₁ = 2(ŷ - y)·x = 2(-0.646)·2.5 = -3.230

Parameter update (learning rate α = 0.01):
  w₀ ← 0.124 - 0.01·(-1.292) = 0.137
  w₁ ← 0.532 - 0.01·(-3.230) = 0.564
```

This panel should use a clean monospace-ish layout with clear visual hierarchy. The key values (predictions, gradients, new parameters) should be visually prominent. Consider color-coding: e.g., the residual value matches the color of the dashed residual line on the plot.

### Bottom: Controls and Summary

- **Step controls:** ◀ Previous | Next ▶ | ⏮ Reset | ▶ Auto-play
- **Loss tracker:** Current MSE loss, displayed as a number and optionally as a small sparkline/loss curve that builds up over steps
- **Epoch indicator:** "Epoch 1 of 12" with progress

### Top: Configuration (collapsible or in a settings panel)

- **Learning rate** slider (0.001 to 0.1)
- **Speed** control for auto-play
- These should have sensible defaults so the component works immediately without configuration

---

## Data

Use a small synthetic dataset for the initial version:

- ~8-12 points
- Simple linear relationship with some noise: y = 2x + 1 + noise
- Fixed seed for reproducibility
- Points should be spread enough that the regression line visibly improves over iterations
- Initial parameters should be obviously wrong (e.g., w₀ = 0, w₁ = 0) so the improvement is dramatic in early steps

---

## Interaction Model

### Step-by-step mode (default)

1. Component loads showing the initial state: all data points, the initial (bad) regression line, and the computation panel showing "Step 0: Initial parameters"
2. User clicks "Next Step"
3. One data point is highlighted on the scatter plot
4. The computation panel populates with the forward pass, residual, gradients, and update for that point
5. The regression line updates to reflect the new parameters
6. The loss value updates
7. User clicks "Next Step" again → next data point
8. After all points are processed → "Epoch 1 complete" → cycle back to first point with updated parameters
9. Continue for a configurable number of epochs

### Auto-play mode

- Steps advance automatically at a configurable speed (e.g., 1 step per second)
- User can pause at any time
- Useful for showing the overall convergence behavior without clicking through every step

### Previous step

- Steps backward through the history
- Parameters, line, and highlighted point all revert
- Important for "wait, let me see that again" moments in class

### Reset

- Returns to initial state (step 0, initial parameters)

---

## Technical Notes

### Framework

- React (single .jsx file, Tailwind for styling)
- All computation happens client-side in JavaScript
- No external dependencies beyond what's available in the Claude artifact environment (React, Tailwind, recharts if needed for the loss curve)
- Should also work as a standalone HTML file for eventual hosting

### State Management

- All parameter history should be stored so Previous works without recomputation
- State: `{ step, w0, w1, loss, history: [...] }`

### Responsiveness

- Should work well at typical screen widths (1200px+)
- The two-panel layout can stack vertically on narrow screens, but this is low priority — it will primarily be used on desktop (Zoom screen share or student laptop)

---

## What NOT to Build (Yet)

These will be added in future sessions — just keep the architecture clean enough that they're feasible:

- Mini-batch gradient descent (Session 14)
- Momentum / Adam variants (Session 14)
- Logistic regression variant (could be useful but not planned)
- Neural network forward/backward pass (Sessions 13–14)
- 3D loss surface visualization (nice-to-have, not essential)

---

## Example Walkthrough

Here's what a student should experience when they open this:

1. They see a scatter plot with ~10 points and a flat/wrong line (w₀=0, w₁=0). The computation panel says "Initial state. Click Next to begin."
2. They click Next. Point 1 lights up. The panel shows: "Prediction: ŷ = 0 + 0·(1.2) = 0. Actual: 3.5. Residual: -3.5." Then the gradients, then the update. The line shifts slightly.
3. They click Next again. Point 2 lights up. New prediction with the updated parameters. The line shifts again.
4. After 10 steps (one epoch), they've seen every point used once. The line is noticeably better. Loss has dropped.
5. They keep going. By epoch 3-4, the line is close to the true relationship. The gradients are getting smaller. The updates are getting smaller.
6. By epoch 8-10, the line has converged. Gradients are near zero. The student understands: gradient descent iteratively improves parameters by computing how wrong we are and adjusting proportionally.

---

## Success Criteria

A student who uses this visualization should be able to:

- Explain what "a gradient" is in concrete terms (it's the derivative of the loss with respect to a parameter — it tells you which direction to adjust and by how much)
- Trace through one step of gradient descent by hand given a data point and current parameters
- Explain why the learning rate matters (too big = overshoot, too small = slow)
- Connect `.fit()` in sklearn to "it's doing this loop internally"
- Understand why this same process applies to any model with learnable parameters (setting up neural networks)
