import { getStatusClass } from '../utils/helpers';

export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${getStatusClass(status)}`}>
      {status}
    </span>
  );
}
