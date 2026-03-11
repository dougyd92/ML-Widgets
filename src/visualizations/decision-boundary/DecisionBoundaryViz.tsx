import { useState } from 'react';
import { Slider } from '@/components/ui/Slider';

const DecisionBoundaryViz = () => {
  const [w0, setW0] = useState(-3);
  const [w1, setW1] = useState(0.02);
  const [w2, setW2] = useState(0.03);

  // Generate sample data points
  const generateData = () => {
    const data = [];
    // Class 1 (admitted - blue dots)
    for (let i = 0; i < 30; i++) {
      const x1 = Math.random() * 200 + 100;
      const x2 = Math.random() * 200 + 100;
      if (w0 + w1 * x1 + w2 * x2 > -10) {
        data.push({ x1, x2, label: 1 });
      }
    }
    // Class 0 (rejected - red dots)
    for (let i = 0; i < 30; i++) {
      const x1 = Math.random() * 200;
      const x2 = Math.random() * 200;
      if (w0 + w1 * x1 + w2 * x2 < 10) {
        data.push({ x1, x2, label: 0 });
      }
    }
    return data;
  };

  const [data] = useState(generateData());

  // Calculate decision boundary line
  // w0 + w1*x1 + w2*x2 = 0
  // x2 = -(w0 + w1*x1) / w2
  const getBoundaryY = (x1: number) => {
    if (Math.abs(w2) < 0.001) return 150;
    return -(w0 + w1 * x1) / w2;
  };

  // Sigmoid function
  const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

  // SVG dimensions
  const width = 600;
  const height = 500;
  const margin = 50;
  const plotWidth = width - 2 * margin;
  const plotHeight = height - 2 * margin - 50;

  // Scale functions
  const scaleX = (x: number) => margin + (x / 300) * plotWidth;
  const scaleY = (y: number) => height - margin - 50 - (y / 300) * plotHeight;

  // Create grid for shaded regions
  const createGrid = () => {
    const regions = [];
    const step = 15;
    for (let x = 0; x <= 300; x += step) {
      for (let y = 0; y <= 300; y += step) {
        const z = w0 + w1 * x + w2 * y;
        const prob = sigmoid(z);
        regions.push({
          x,
          y,
          prob,
          color: prob > 0.5 ? `rgba(59, 130, 246, ${prob * 0.3})` : `rgba(239, 68, 68, ${(1 - prob) * 0.3})`
        });
      }
    }
    return regions;
  };

  const regions = createGrid();

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-6 space-y-4 bg-gray-50 p-4 rounded-lg">
        <div>
          <label className="block text-sm font-medium mb-2">
            Bias (w&#x2080;): {w0.toFixed(2)}
          </label>
          <Slider
            value={[w0]}
            onValueChange={(val) => setW0(val[0])}
            min={-10}
            max={10}
            step={0.5}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Weight for Feature 1 (w&#x2081;): {w1.toFixed(3)}
          </label>
          <Slider
            value={[w1 * 1000]}
            onValueChange={(val) => setW1(val[0] / 1000)}
            min={-50}
            max={50}
            step={1}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Weight for Feature 2 (w&#x2082;): {w2.toFixed(3)}
          </label>
          <Slider
            value={[w2 * 1000]}
            onValueChange={(val) => setW2(val[0] / 1000)}
            min={-50}
            max={50}
            step={1}
            className="w-full"
          />
        </div>

        <div className="text-sm text-gray-600 bg-white p-3 rounded">
          <strong>Decision boundary equation:</strong><br/>
          {w0.toFixed(2)} + {w1.toFixed(3)}&middot;x&#x2081; + {w2.toFixed(3)}&middot;x&#x2082; = 0
        </div>
      </div>

      <svg width={width} height={height} className="border border-gray-300 rounded-lg">
        {/* Shaded regions */}
        {regions.map((region, i) => (
          <rect
            key={i}
            x={scaleX(region.x)}
            y={scaleY(region.y + 15)}
            width={scaleX(15) - scaleX(0)}
            height={scaleY(0) - scaleY(15)}
            fill={region.color}
          />
        ))}

        {/* Axes */}
        <line
          x1={margin}
          y1={scaleY(0)}
          x2={width - margin}
          y2={scaleY(0)}
          stroke="black"
          strokeWidth="2"
        />
        <line
          x1={margin}
          y1={margin}
          x2={margin}
          y2={scaleY(0)}
          stroke="black"
          strokeWidth="2"
        />

        {/* Axis labels */}
        <text x={width / 2} y={height - 10} textAnchor="middle" className="text-sm font-medium">
          Feature 1 (Test Score 1)
        </text>
        <text
          x={20}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90, 20, ${height / 2})`}
          className="text-sm font-medium"
        >
          Feature 2 (Test Score 2)
        </text>

        {/* Tick marks and labels */}
        {[0, 100, 200, 300].map((val) => (
          <g key={`x-${val}`}>
            <line
              x1={scaleX(val)}
              y1={scaleY(0)}
              x2={scaleX(val)}
              y2={scaleY(0) + 5}
              stroke="black"
            />
            <text
              x={scaleX(val)}
              y={scaleY(0) + 20}
              textAnchor="middle"
              className="text-xs"
            >
              {val}
            </text>
          </g>
        ))}
        {[0, 100, 200, 300].map((val) => (
          <g key={`y-${val}`}>
            <line
              x1={margin - 5}
              y1={scaleY(val)}
              x2={margin}
              y2={scaleY(val)}
              stroke="black"
            />
            <text
              x={margin - 10}
              y={scaleY(val) + 4}
              textAnchor="end"
              className="text-xs"
            >
              {val}
            </text>
          </g>
        ))}

        {/* Decision boundary line */}
        <line
          x1={scaleX(0)}
          y1={scaleY(getBoundaryY(0))}
          x2={scaleX(300)}
          y2={scaleY(getBoundaryY(300))}
          stroke="black"
          strokeWidth="3"
          strokeDasharray="5,5"
        />

        {/* Data points */}
        {data.map((point, i) => (
          <circle
            key={i}
            cx={scaleX(point.x1)}
            cy={scaleY(point.x2)}
            r="5"
            fill={point.label === 1 ? '#3b82f6' : '#ef4444'}
            stroke="white"
            strokeWidth="1.5"
          />
        ))}

        {/* Legend */}
        <g transform={`translate(${width - 150}, 20)`}>
          <rect x="0" y="0" width="140" height="80" fill="white" stroke="gray" rx="5" />
          <circle cx="15" cy="20" r="5" fill="#3b82f6" stroke="white" strokeWidth="1.5" />
          <text x="30" y="24" className="text-sm">Class 1 (Admitted)</text>

          <circle cx="15" cy="45" r="5" fill="#ef4444" stroke="white" strokeWidth="1.5" />
          <text x="30" y="49" className="text-sm">Class 0 (Rejected)</text>

          <line x1="10" y1="65" x2="25" y2="65" stroke="black" strokeWidth="2" strokeDasharray="3,3" />
          <text x="30" y="69" className="text-sm">Decision Boundary</text>
        </g>
      </svg>

      <div className="mt-6 space-y-2 text-sm text-gray-700">
        <p><strong>Try this:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Adjust w&#x2081; and w&#x2082; to see how the decision boundary rotates</li>
          <li>When w&#x2081; &asymp; 0, the boundary becomes horizontal</li>
          <li>When w&#x2082; &asymp; 0, the boundary becomes vertical</li>
          <li>Change w&#x2080; (bias) to shift the boundary parallel to itself</li>
          <li>The shaded regions show prediction confidence (darker = more confident)</li>
        </ul>
      </div>
    </div>
  );
};

export default DecisionBoundaryViz;
