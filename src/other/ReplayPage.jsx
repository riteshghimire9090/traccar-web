import { useState, useEffect, useRef, useCallback } from 'react';
import dayjs from 'dayjs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MapView from '../map/core/MapView';
import MapRoutePath from '../map/MapRoutePath';
import MapRoutePoints from '../map/MapRoutePoints';
import MapPositionMarkers from '../map/MapPositionMarkers';
import PoiMap from '../map/main/PoiMap';
import MapRuler from '../map/control/MapRuler';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useCatchCallback } from '../reactHelper';
import MapCamera from '../map/MapCamera';
import MapFollowCamera from '../map/MapFollowCamera';
import MapGeofence from '../map/MapGeofence';
import StatusCard from '../common/components/StatusCard';
import MapScale from '../map/MapScale';
import fetchOrThrow from '../common/util/fetchOrThrow';
import MapOverlay from '../map/overlay/MapOverlay';
import ReplayHeader from './ReplayHeader';
import ReplayPlaybackBar from './ReplayPlaybackBar';
import ReplayDetailsSheet from './ReplayDetailsSheet';

const quickRange = (key) => {
  const now = dayjs();
  switch (key) {
    case 'yesterday': {
      const day = now.subtract(1, 'day');
      return [day.startOf('day').toISOString(), day.endOf('day').toISOString()];
    }
    case 'week':
      return [now.startOf('week').toISOString(), now.endOf('week').toISOString()];
    case 'lastWeek': {
      const week = now.subtract(1, 'week');
      return [week.startOf('week').toISOString(), week.endOf('week').toISOString()];
    }
    case 'today':
    default:
      return [now.startOf('day').toISOString(), now.endOf('day').toISOString()];
  }
};

const ReplayPage = () => {
  const t = useTranslation();
  const navigate = useNavigate();
  const timerRef = useRef();

  const [searchParams, setSearchParams] = useSearchParams();

  const defaultDeviceId = useSelector((state) => state.devices.selectedId);

  const urlDeviceId = searchParams.get('deviceId');
  const urlFrom = searchParams.get('from');
  const urlTo = searchParams.get('to');

  const [positions, setPositions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selectedDeviceId, setSelectedDeviceId] = useState(
    urlDeviceId ? Number(urlDeviceId) : defaultDeviceId,
  );
  const [showCard, setShowCard] = useState(false);
  const [quickKey, setQuickKey] = useState(urlFrom && urlTo ? null : 'today');
  const [range, setRange] = useState(() =>
    urlFrom && urlTo ? [urlFrom, urlTo] : quickRange('today'),
  );
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speed, setSpeed] = useState(5);
  const [detailsTab, setDetailsTab] = useState(null);
  const [rulerActive, setRulerActive] = useState(false);

  const loaded = Boolean(!loading && positions.length);

  useEffect(() => {
    if (playing && positions.length > 0) {
      timerRef.current = setInterval(() => {
        setIndex((i) => i + 1);
      }, 500 / speed);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, positions, speed]);

  useEffect(() => {
    if (index >= positions.length - 1) {
      clearInterval(timerRef.current);
      setPlaying(false);
    }
  }, [index, positions]);

  const onPointClick = useCallback((_, pointIndex) => {
    setIndex(pointIndex);
  }, []);

  const onMarkerClick = useCallback((positionId) => {
    setShowCard(!!positionId);
  }, []);

  const load = useCatchCallback(
    async (deviceId, from, to) => {
      setLoading(true);
      setSelectedDeviceId(deviceId);
      setRange([from, to]);
      setSearchParams({ deviceId, from, to }, { replace: true });
      const query = new URLSearchParams({ deviceId, from, to });
      try {
        const response = await fetchOrThrow(`/api/positions?${query.toString()}`);
        setIndex(0);
        const data = await response.json();
        setPositions(data);
        if (!data.length) {
          throw Error(t('sharedNoData'));
        }
      } finally {
        setLoading(false);
      }
    },
    [t, setSearchParams],
  );

  const initialLoadRef = useRef(false);
  useEffect(() => {
    if (!initialLoadRef.current && selectedDeviceId && urlFrom && urlTo) {
      initialLoadRef.current = true;
      load(selectedDeviceId, urlFrom, urlTo);
    }
  }, [load, selectedDeviceId, urlFrom, urlTo]);

  const onQuickSelect = (key) => {
    setQuickKey(key);
    const [from, to] = quickRange(key);
    load(selectedDeviceId, from, to);
  };

  const onCustomApply = (customRange) => {
    setQuickKey(null);
    load(selectedDeviceId, customRange[0], customRange[1]);
  };

  const onDeviceChange = (deviceId) => {
    load(deviceId, range[0], range[1]);
  };

  const handleDownload = () => {
    const query = new URLSearchParams({ deviceId: selectedDeviceId, from: range[0], to: range[1] });
    window.location.assign(`/api/positions/kml?${query.toString()}`);
  };

  return (
    <div style={{ height: '100%' }}>
      <MapView>
        <MapOverlay />
        <MapGeofence />
        <PoiMap />
        <MapRoutePath positions={positions} />
        <MapRoutePoints positions={positions} onClick={onPointClick} showSpeedControl />
        {index < positions.length && (
          <MapPositionMarkers
            positions={[positions[index]]}
            onMarkerClick={onMarkerClick}
            titleField="fixTime"
            disabled={rulerActive}
          />
        )}
        <MapRuler positions={positions} onActiveChange={setRulerActive} />
      </MapView>
      <MapScale />
      <MapCamera positions={positions} />
      <MapFollowCamera
        latitude={positions[index]?.latitude}
        longitude={positions[index]?.longitude}
      />

      <ReplayHeader
        deviceId={selectedDeviceId}
        onDeviceChange={onDeviceChange}
        quickKey={quickKey}
        onQuickSelect={onQuickSelect}
        range={range}
        onCustomApply={onCustomApply}
        positions={positions}
        onClose={() => navigate(-1)}
      />

      {loaded && (
        <ReplayPlaybackBar
          positions={positions}
          index={index}
          onIndexChange={setIndex}
          playing={playing}
          onPlayPause={() => setPlaying(!playing)}
          speed={speed}
          onSpeedChange={setSpeed}
          detailsTab={detailsTab}
          onOpenDetails={setDetailsTab}
          onDownload={handleDownload}
        />
      )}

      {detailsTab && (
        <ReplayDetailsSheet
          positions={positions}
          index={index}
          onRowClick={setIndex}
          onClose={() => setDetailsTab(null)}
        />
      )}

      {showCard && index < positions.length && (
        <StatusCard
          deviceId={selectedDeviceId}
          position={positions[index]}
          onClose={() => setShowCard(false)}
          disableActions
        />
      )}
    </div>
  );
};

export default ReplayPage;
