const visualizations = [
  {
    title: "Gradient Descent Step-by-Step",
    description: "Watch vanilla SGD optimize a linear regression, one sample at a time.",
    path: "/viz/gradient-descent",
    color: "from-blue-500 to-indigo-600",
  },
  {
    title: "Decision Boundary Explorer",
    description: "Adjust model weights and see how the decision boundary shifts in 2D.",
    path: "/viz/decision_boundary",
    color: "from-rose-500 to-orange-500",
  },
  {
    title: "Regularization Geometry",
    description: "See why L1 produces sparsity and L2 doesn't — constraint shapes meet loss contours.",
    path: "/viz/regularization-geometry",
    color: "from-violet-500 to-purple-600",
  },
];

export function HomePage() {
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto">
        <p className="text-gray-500 mb-8">
          Interactive visualizations for machine learning concepts.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {visualizations.map((viz) => (
            <a
              key={viz.path}
              href={viz.path}
              className="group block rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className={`h-32 bg-gradient-to-br ${viz.color}`} />
              <div className="p-4">
                <h2 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {viz.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">{viz.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
