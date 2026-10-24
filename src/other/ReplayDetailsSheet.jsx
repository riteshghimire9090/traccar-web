import { Table, TableBody, TableCell, TableHead, TableRow, IconButton } from '@mui/material';
import { useEffect, useRef } from 'react';
import { makeStyles } from 'tss-react/mui';
import PositionValue from '../common/components/PositionValue';
import { useTranslation } from '../common/components/LocalizationProvider';
import CloseIcon from '../resources/images/nav/close-x2.svg?react';

export const SHEET_HEIGHT = 240;

const useStyles = makeStyles()((theme) => ({
  sheet: {
    position: 'fixed',
    zIndex: 5,
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    borderTop: `1px solid ${theme.palette.grey[300]}`,
  },
  head: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0.5, 1),
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
    flexShrink: 0,
  },
  body: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
  },
  cell: {
    whiteSpace: 'nowrap',
  },
  headCell: {
    '&&': {
      backgroundColor: 'white',
      zIndex: 2,
    },
  },
  rowActive: {
    backgroundColor: theme.palette.info.lightest || '#f2faff',
  },
}));

const columns = [
  { key: 'fixTime', label: 'positionFixTime' },
  { key: 'longitude', label: 'positionLongitude' },
  { key: 'latitude', label: 'positionLatitude' },
  { key: 'course', label: 'positionCourse' },
  { key: 'speed', label: 'positionSpeed' },
  { key: 'valid', label: 'replayPositioningMode' },
  { key: 'address', label: 'replayPosition' },
];

const ReplayDetailsSheet = ({ positions, index, onRowClick, onClose }) => {
  const t = useTranslation();
  const { classes, cx } = useStyles();

  const activeRowRef = useRef(null);

  useEffect(() => {
    activeRowRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [index]);

  return (
    <div className={classes.sheet}>
      <div className={classes.head}>
        <IconButton onClick={onClose}>
          <CloseIcon width={18} height={18} />
        </IconButton>
      </div>
      <div className={classes.body}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell className={cx(classes.cell, classes.headCell)}>No.</TableCell>
              {columns.map((column) => (
                <TableCell key={column.key} className={cx(classes.cell, classes.headCell)}>
                  {t(column.label)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {positions.map((position, rowIndex) => {
              const active = rowIndex === index;
              return (
                <TableRow
                  key={position.id}
                  ref={active ? activeRowRef : undefined}
                  hover
                  selected={active}
                  className={cx(active && classes.rowActive)}
                  onClick={() => onRowClick(rowIndex)}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell className={classes.cell}>{rowIndex + 1}</TableCell>
                  {columns.map((column) => (
                    <TableCell key={column.key} className={classes.cell}>
                      <PositionValue position={position} property={column.key} />
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReplayDetailsSheet;
