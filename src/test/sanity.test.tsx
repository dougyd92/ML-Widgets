import { render, screen } from '@testing-library/react'
import App from '../App'

// Mock heavy visualization components to avoid jsdom limitations (Canvas, Recharts, ResizeObserver)
vi.mock('../visualizations/gradient-descent/GradientDescentPage', () => ({
  GradientDescentPage: () => <div data-testid="gradient-descent-page">GradientDescentPage</div>,
}))

vi.mock('../visualizations/decision-boundary/DecisionBoundaryPage', () => ({
  DecisionBoundaryPage: () => <div data-testid="decision-boundary-page">DecisionBoundaryPage</div>,
}))

vi.mock('../visualizations/regularization-geometry/RegularizationGeometryPage', () => ({
  RegularizationGeometryPage: () => <div data-testid="regularization-geometry-page">RegularizationGeometryPage</div>,
}))

function setPath(path: string) {
  Object.defineProperty(window, 'location', {
    value: { pathname: path },
    writable: true,
  })
}

describe('App routing', () => {
  it('renders HomePage at "/"', () => {
    setPath('/')
    render(<App />)
    expect(screen.getByText('Interactive visualizations for machine learning concepts.')).toBeInTheDocument()
    expect(screen.getByText('Gradient Descent Step-by-Step')).toBeInTheDocument()
  })

  it('renders gradient descent page at "/viz/gradient-descent"', () => {
    setPath('/viz/gradient-descent')
    render(<App />)
    expect(screen.getByText('Gradient Descent Step-by-Step')).toBeInTheDocument()
    expect(screen.getByTestId('gradient-descent-page')).toBeInTheDocument()
  })

  it('renders decision boundary page at "/viz/decision_boundary"', () => {
    setPath('/viz/decision_boundary')
    render(<App />)
    expect(screen.getByText('Decision Boundary Explorer')).toBeInTheDocument()
    expect(screen.getByTestId('decision-boundary-page')).toBeInTheDocument()
  })

  it('renders regularization geometry page at "/viz/regularization-geometry"', () => {
    setPath('/viz/regularization-geometry')
    render(<App />)
    expect(screen.getByText('Regularization Geometry')).toBeInTheDocument()
    expect(screen.getByTestId('regularization-geometry-page')).toBeInTheDocument()
  })

  it('falls through to HomePage for unknown paths', () => {
    setPath('/foo/bar')
    render(<App />)
    expect(screen.getByText('Interactive visualizations for machine learning concepts.')).toBeInTheDocument()
  })

  it('renders the nav bar with "ML Widgets" on every page', () => {
    setPath('/')
    render(<App />)
    expect(screen.getByText('ML Widgets')).toBeInTheDocument()
  })
})
