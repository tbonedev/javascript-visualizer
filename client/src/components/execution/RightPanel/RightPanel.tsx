import { Visualizer } from '@/lib/visualizer/components/Visualizer';
import Console from './Console/Console';

interface RightPanelProps {
  executionStep: any;
}
export default function RightPanel({ executionStep }: RightPanelProps) {
  return (
    <div className='h-full relative'>
      <Visualizer executionStep={executionStep} />
      {executionStep && <Console />}
    </div>
  );
}
