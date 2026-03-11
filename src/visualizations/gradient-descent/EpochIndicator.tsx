interface Props {
  epoch: number;
  totalEpochs: number;
  sampleIndex: number;
  samplesPerEpoch: number;
}

export function EpochIndicator({
  epoch,
  totalEpochs,
  sampleIndex,
  samplesPerEpoch,
}: Props) {
  const overallProgress =
    ((epoch * samplesPerEpoch + sampleIndex) /
      (totalEpochs * samplesPerEpoch)) *
    100;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
        Epoch {epoch + 1} of {totalEpochs}
      </span>
      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${overallProgress}%` }}
        />
      </div>
    </div>
  );
}
