
import { selectionColumn } from './selection-column';
import { actionsColumn } from './actions-column';
import { timekeeperColumn } from './timekeeper-column';
import { serviceDateColumn } from './service-date-column';
import { taskCodeColumn } from './task-code-column';
import { activityCodeColumn } from './activity-code-column';
import { hoursColumn } from './hours-column';
import { rateColumn } from './rate-column';
import { amountColumn } from './amount-column';
import { narrativeColumn } from './narrative-column';
import { statusColumn } from './status-column';
import { GetColumnsProps } from '../types';

export const getColumns = (props: GetColumnsProps) => [
  selectionColumn(),
  actionsColumn(props),
  timekeeperColumn(props),
  serviceDateColumn(props),
  taskCodeColumn(props),
  activityCodeColumn(props),
  hoursColumn(props),
  rateColumn(props),
  amountColumn(props),
  narrativeColumn(props),
  statusColumn(props),
];
