import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import { useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import PositionValue from '../common/components/PositionValue';
import { useTranslation } from '../common/components/LocalizationProvider';
import CloseIcon from '../resources/images/nav/close-x2.svg?react';

const useStyles = makeStyles()((theme) => ({
  sheet: {
    position: 'fixed',
    zIndex: 5,
    bottom: theme.spacing(16),
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 64px)',
    maxWidth: 1216,
    maxHeight: 320,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: 16,
    overflow: 'hidden',
  },
  head: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 1),
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
  },
  body: {
    overflow: 'auto',
  },
  cell: {
    whiteSpace: 'nowrap',
  },
}));

const columns = [
  { key: 'fixTime', label: 'positionFixTime' },
  { key: 'longitude', label: 'positionLongitude' },
  { key: 'latitude', label: 'positionLatitude' },
  { key: 'course', label: 'positionCourse' },
  { key: 'speed', label: 'positionSpeed' },
  { key: 'valid', label: 'positionValid' },
  { key: 'address', label: 'positionAddress' },
];

const ReplayDetailsSheet = ({ tab, onTabChange, positions, onClose }) => {
  const t = useTranslation();
  const { classes } = useStyles();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const sorted =
    tab === 'speed' ? [...positions].sort((a, b) => b.speed - a.speed) : positions;
  const rows = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const rowIndex = (row) => sorted.indexOf(row);

  return (
    <div className={classes.sheet}>
      <div className={classes.head}>
        <Tabs
          value={tab}
          onChange={(_, value) => {
            onTabChange(value);
            setPage(0);
          }}
        >
          <Tab value="details" label={t('replayDetails')} />
          <Tab value="speed" label={t('positionSpeed')} />
          <Tab value="tasklist" label={t('replayTaskList')} disabled />
        </Tabs>
        <IconButton onClick={onClose}>
          <CloseIcon width={18} height={18} />
        </IconButton>
      </div>
      <div className={classes.body}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell className={classes.cell}>No.</TableCell>
              {columns.map((column) => (
                <TableCell key={column.key} className={classes.cell}>
                  {t(column.label)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((position) => (
              <TableRow key={position.id}>
                <TableCell className={classes.cell}>{rowIndex(position) + 1}</TableCell>
                {columns.map((column) => (
                  <TableCell key={column.key} className={classes.cell}>
                    <PositionValue position={position} property={column.key} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        component="div"
        count={sorted.length}
        page={page}
        onPageChange={(_, value) => setPage(value)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[25, 50, 100]}
      />
    </div>
  );
};

export default ReplayDetailsSheet;
