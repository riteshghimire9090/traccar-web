import { useMemo, useState } from 'react';
import { Tabs, Tab, Select, MenuItem, FormControl, InputLabel, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';
import dayjs from 'dayjs';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from './LocalizationProvider';
import { useAsyncTask } from '../../reactHelper';
import useAttributeUnits from '../util/useAttributeUnits';
import { attributeUnitString, formatAttributeNumber } from '../util/attributeUnits';
import { formatNumericHours } from '../util/formatter';
import fetchOrThrow from '../util/fetchOrThrow';

const useStyles = makeStyles()((theme) => ({
  tabs: {
    minHeight: 40,
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(2),
  },
  controls: {
    display: 'flex',
    gap: theme.spacing(2),
    flexWrap: 'wrap',
    marginBottom: theme.spacing(2),
  },
  control: {
    minWidth: 170,
  },
  chartBox: {
    height: 360,
    width: '100%',
  },
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: theme.palette.text.secondary,
  },
}));

const PERIOD_KEYS = [
  'today',
  'yesterday',
  'thisWeek',
  'previousWeek',
  'thisMonth',
  'previousMonth',
  'last7Days',
  'last30Days',
];

const periodLabelKey = {
  today: 'reportToday',
  yesterday: 'reportYesterday',
  thisWeek: 'reportThisWeek',
  previousWeek: 'reportPreviousWeek',
  thisMonth: 'reportThisMonth',
  previousMonth: 'reportPreviousMonth',
  last7Days: 'analyticsLast7Days',
  last30Days: 'analyticsLast30Days',
};

const periodRange = (key) => {
  const now = dayjs();
  switch (key) {
    case 'yesterday': {
      const d = now.subtract(1, 'day');
      return [d.startOf('day'), d.endOf('day')];
    }
    case 'thisWeek':
      return [now.startOf('week'), now.endOf('week')];
    case 'previousWeek': {
      const d = now.subtract(1, 'week');
      return [d.startOf('week'), d.endOf('week')];
    }
    case 'thisMonth':
      return [now.startOf('month'), now.endOf('month')];
    case 'previousMonth': {
      const d = now.subtract(1, 'month');
      return [d.startOf('month'), d.endOf('month')];
    }
    case 'last7Days':
      return [now.subtract(6, 'day').startOf('day'), now.endOf('day')];
    case 'last30Days':
      return [now.subtract(29, 'day').startOf('day'), now.endOf('day')];
    case 'today':
    default:
      return [now.startOf('day'), now.endOf('day')];
  }
};

const bucketStart = (time, granularity) => {
  const d = dayjs(time);
  if (granularity === 'hour') return d.startOf('hour');
  if (granularity === 'week') return d.startOf('week');
  if (granularity === 'month') return d.startOf('month');
  return d.startOf('day');
};

const bucketFormat = (granularity) => {
  switch (granularity) {
    case 'hour':
      return 'MMM D HH:mm';
    case 'week':
      return 'MMM D';
    case 'month':
      return 'MMM YYYY';
    default:
      return 'MMM D';
  }
};

const buildMetrics = (t) => ({
  speed: {
    label: t('positionSpeed'),
    chart: 'line',
    source: 'position',
    attribute: 'speed',
    dataType: 'speed',
    granularities: ['hour', 'day', 'week', 'month'],
  },
  mileage: {
    label: t('sharedDistance'),
    chart: 'bar',
    source: 'summary',
    field: 'distance',
    dataType: 'distance',
    granularities: ['day', 'week', 'month'],
  },
  fuel: {
    label: t('reportSpentFuel'),
    chart: 'bar',
    source: 'summary',
    field: 'spentFuel',
    dataType: 'volume',
    granularities: ['day', 'week', 'month'],
  },
  tripCount: {
    label: t('reportTrips'),
    chart: 'bar',
    source: 'trips',
    granularities: ['hour', 'day', 'week', 'month'],
  },
  parking: {
    label: t('reportStops'),
    chart: 'bar',
    source: 'stops',
    granularities: ['hour', 'day', 'week', 'month'],
  },
  alarm: {
    label: t('eventAlarm'),
    chart: 'bar',
    source: 'events',
    eventType: 'alarm',
    granularities: ['hour', 'day', 'week', 'month'],
  },
  speeding: {
    label: t('alarmOverspeed'),
    chart: 'bar',
    source: 'events',
    eventType: 'alarm',
    alarm: 'overspeed',
    granularities: ['hour', 'day', 'week', 'month'],
  },
  acc: {
    label: t('positionIgnition'),
    chart: 'bar',
    source: 'summary',
    field: 'engineHours',
    dataType: 'hours',
    granularities: ['day', 'week', 'month'],
  },
  temp: {
    label: t('positionDeviceTemp'),
    chart: 'line',
    source: 'position',
    attribute: 'deviceTemp',
    granularities: ['hour', 'day', 'week', 'month'],
  },
  voltage: {
    label: t('positionPower'),
    chart: 'line',
    source: 'position',
    attribute: 'power',
    dataType: 'voltage',
    granularities: ['hour', 'day', 'week', 'month'],
  },
  battery: {
    label: t('positionBatteryLevel'),
    chart: 'line',
    source: 'position',
    attribute: 'batteryLevel',
    dataType: 'percentage',
    granularities: ['hour', 'day', 'week', 'month'],
  },
});

const DeviceAnalyticsPanel = ({ deviceId }) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const t = useTranslation();
  const units = useAttributeUnits();

  const metrics = useMemo(() => buildMetrics(t), [t]);
  const metricKeys = Object.keys(metrics);

  const [metric, setMetric] = useState('speed');
  const [period, setPeriod] = useState('today');
  const [granularity, setGranularity] = useState('hour');
  const [points, setPoints] = useState(null);
  const [loading, setLoading] = useState(false);

  const definition = metrics[metric];

  const changeMetric = (key) => {
    setMetric(key);
    if (!metrics[key].granularities.includes(granularity)) {
      setGranularity(metrics[key].granularities[0]);
    }
  };

  useAsyncTask(
    async ({ signal }) => {
      if (!deviceId) {
        return;
      }
      setLoading(true);
      try {
        const [from, to] = periodRange(period);
        const query = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() });
        query.append('deviceId', deviceId);
        const buckets = new Map();
        if (definition.source === 'position') {
          const response = await fetchOrThrow(`/api/reports/route?${query.toString()}`, {
            signal,
            headers: { Accept: 'application/json' },
          });
          (await response.json()).forEach((position) => {
            const raw =
              position[definition.attribute] ?? position.attributes?.[definition.attribute];
            if (raw == null) {
              return;
            }
            const key = bucketStart(position.fixTime, granularity).valueOf();
            const entry = buckets.get(key) || { sum: 0, count: 0 };
            entry.sum += raw;
            entry.count += 1;
            buckets.set(key, entry);
          });
          setPoints(
            Array.from(buckets.entries())
              .sort(([a], [b]) => a - b)
              .map(([time, entry]) => ({ time, value: entry.sum / entry.count })),
          );
        } else if (definition.source === 'summary') {
          query.set('daily', 'true');
          const response = await fetchOrThrow(`/api/reports/summary?${query.toString()}`, {
            signal,
            headers: { Accept: 'application/json' },
          });
          (await response.json()).forEach((row) => {
            const raw = row[definition.field];
            if (raw == null) {
              return;
            }
            const key = bucketStart(row.startTime, granularity).valueOf();
            buckets.set(key, (buckets.get(key) || 0) + raw);
          });
          setPoints(
            Array.from(buckets.entries())
              .sort(([a], [b]) => a - b)
              .map(([time, value]) => ({ time, value })),
          );
        } else if (definition.source === 'trips' || definition.source === 'stops') {
          const endpoint = definition.source;
          const response = await fetchOrThrow(`/api/reports/${endpoint}?${query.toString()}`, {
            signal,
            headers: { Accept: 'application/json' },
          });
          (await response.json()).forEach((row) => {
            const key = bucketStart(row.startTime, granularity).valueOf();
            buckets.set(key, (buckets.get(key) || 0) + 1);
          });
          setPoints(
            Array.from(buckets.entries())
              .sort(([a], [b]) => a - b)
              .map(([time, value]) => ({ time, value })),
          );
        } else if (definition.source === 'events') {
          query.append('type', definition.eventType);
          if (definition.alarm) {
            query.append('alarm', definition.alarm);
          }
          const response = await fetchOrThrow(`/api/reports/events?${query.toString()}`, {
            signal,
            headers: { Accept: 'application/json' },
          });
          (await response.json()).forEach((row) => {
            const key = bucketStart(row.eventTime, granularity).valueOf();
            buckets.set(key, (buckets.get(key) || 0) + 1);
          });
          setPoints(
            Array.from(buckets.entries())
              .sort(([a], [b]) => a - b)
              .map(([time, value]) => ({ time, value })),
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [deviceId, period, granularity, definition],
  );

  const formatValue = (value) => {
    if (value == null) {
      return '';
    }
    if (definition.dataType === 'hours') {
      return formatNumericHours(value, t);
    }
    if (definition.dataType) {
      return formatAttributeNumber(value, definition.dataType, units);
    }
    return Math.round(value * 100) / 100;
  };

  const unitSuffix =
    definition.dataType && definition.dataType !== 'hours'
      ? attributeUnitString(definition.dataType, units, t)
      : null;

  const chartPoints = (points || []).map((point) => ({
    ...point,
    label: dayjs(point.time).format(bucketFormat(granularity)),
  }));

  const ChartComponent = definition.chart === 'line' ? LineChart : BarChart;

  return (
    <div>
      <Tabs
        className={classes.tabs}
        value={metric}
        onChange={(_, value) => changeMetric(value)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {metricKeys.map((key) => (
          <Tab key={key} value={key} label={metrics[key].label} />
        ))}
      </Tabs>
      <div className={classes.controls}>
        <FormControl size="small" className={classes.control}>
          <InputLabel>{t('reportPeriod')}</InputLabel>
          <Select
            label={t('reportPeriod')}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            {PERIOD_KEYS.map((key) => (
              <MenuItem key={key} value={key}>
                {t(periodLabelKey[key])}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" className={classes.control}>
          <InputLabel>{t('analyticsGranularity')}</InputLabel>
          <Select
            label={t('analyticsGranularity')}
            value={granularity}
            onChange={(e) => setGranularity(e.target.value)}
          >
            {definition.granularities.map((key) => (
              <MenuItem key={key} value={key}>
                {t(`analytics${key.charAt(0).toUpperCase()}${key.slice(1)}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <div className={classes.chartBox}>
        {loading ? (
          <Typography className={classes.empty}>{t('sharedLoading')}</Typography>
        ) : !chartPoints.length ? (
          <Typography className={classes.empty}>{t('analyticsNoData')}</Typography>
        ) : (
          <ResponsiveContainer>
            <ChartComponent data={chartPoints} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid stroke={theme.palette.divider} strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke={theme.palette.text.primary} />
              <YAxis
                stroke={theme.palette.text.primary}
                tickFormatter={(value) => formatValue(value)}
                label={
                  unitSuffix ? { value: unitSuffix, angle: -90, position: 'insideLeft' } : undefined
                }
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.default,
                  color: theme.palette.text.primary,
                }}
                formatter={(value) => [
                  `${formatValue(value)}${unitSuffix ? ` ${unitSuffix}` : ''}`,
                  definition.label,
                ]}
              />
              {definition.chart === 'line' ? (
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={theme.palette.primary.main}
                  dot={false}
                  connectNulls
                />
              ) : (
                <Bar dataKey="value" fill={theme.palette.primary.main} />
              )}
            </ChartComponent>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default DeviceAnalyticsPanel;
