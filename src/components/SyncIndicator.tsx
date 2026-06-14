import { Tooltip, IconButton, CircularProgress, Chip } from '@mui/material';
import { CloudDone, CloudOff, ErrorOutline, Sync } from '@mui/icons-material';
import { useSync } from '../contexts/SyncContext';

export default function SyncIndicator() {
  const { syncStatus, pendingCount, triggerSync } = useSync();

  if (syncStatus === 'offline') {
    return (
      <Tooltip title="Offline – data saved locally">
        <Chip icon={<CloudOff fontSize="small" />} label="Offline" size="small" color="warning" onClick={triggerSync} sx={{ fontWeight: 600 }} />
      </Tooltip>
    );
  }
  if (syncStatus === 'syncing') {
    return (
      <Tooltip title="Syncing...">
        <Chip icon={<CircularProgress size={12} />} label="Syncing" size="small" color="info" sx={{ fontWeight: 600 }} />
      </Tooltip>
    );
  }
  if (syncStatus === 'error') {
    return (
      <Tooltip title="Sync error – click to retry">
        <IconButton size="small" color="error" onClick={triggerSync}><ErrorOutline fontSize="small" /></IconButton>
      </Tooltip>
    );
  }
  if (pendingCount > 0) {
    return (
      <Tooltip title={`${pendingCount} records pending sync`}>
        <Chip icon={<Sync fontSize="small" />} label={`${pendingCount} pending`} size="small" color="warning" onClick={triggerSync} sx={{ fontWeight: 600 }} />
      </Tooltip>
    );
  }
  return (
    <Tooltip title="All data synced">
      <Chip icon={<CloudDone fontSize="small" />} label="Synced" size="small" color="success" sx={{ fontWeight: 600 }} />
    </Tooltip>
  );
}
