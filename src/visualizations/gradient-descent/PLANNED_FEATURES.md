# Gradient Descent Visualization — Planned Features

## Neural Network Extension
- Add a 1-hidden-layer neural network model (2 inputs → N hidden units with ReLU → sigmoid output)
- Define a new `ComputationGraphDef` with hidden-layer nodes and activation function nodes
- Implement `computeHighlightState` for NN showing layer-by-layer forward pass and backpropagation
- Extend the engine's `Model` interface to support multi-layer architectures
- Show weight matrices rather than individual weights when the network gets large

## Backpropagation Visualization
- Animate gradient flow backward through the computation graph, layer by layer
- Show chain rule decomposition at each node (local gradient x upstream gradient)
- Color-code gradient magnitudes (gradient heatmap on edges)
- Visualize vanishing/exploding gradients by scaling edge thickness with gradient magnitude

## Batch Strategies
- Add mini-batch SGD (configurable batch size)
- Add full-batch gradient descent
- Show batch composition in the UI (which samples are in the current batch)
- Compare convergence behavior between strategies

## Optimizer Variants
- SGD with momentum — show velocity vectors on weight nodes
- Adam optimizer — show first and second moment estimates
- RMSProp
- Visual comparison mode: run two optimizers side-by-side on the same data

## Loss Landscape
- 3D surface plot of loss as a function of w₀ and w₁
- Show the optimizer's trajectory on the loss surface
- Contour plot view (2D projection) as an alternative
- Mark current position, show gradient direction as an arrow

## Data & Model Configuration
- Let users add/remove/drag data points interactively
- Support polynomial regression (higher-degree features)
- Configurable number of features for linear regression
- Show the effect of feature scaling / normalization

## Learning Rate Exploration
- Learning rate schedule visualization (step decay, cosine annealing, warmup)
- Interactive LR finder (plot loss vs LR)
- Show instability/divergence when LR is too high

## UI Enhancements
- Collapsible/expandable computation graph panel
- Zoom and pan on the computation graph for larger networks
- Dark mode
- Export training trajectory as animation (GIF/video)
- Keyboard shortcuts for stepping (arrow keys)
- Mobile-responsive layout
