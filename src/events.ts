export const EVENTS = {
  UPLOAD: {
    FILES_UPLOADED: 'jrv:upload:file-uploaded',
    FILES_PROCESSED: 'jrv:upload:files-processed',
    STATUS_UPDATE: 'jrv:upload:status-update',
    GIST_INPUT_FOCUS: 'jrv:upload:gist-input-focus',
    GIST_INPUT_BLUR: 'jrv:upload:gist-input-blur',
  },
  SETTINGS: {
    BENCHMARK_SELECTION_CHANGED: 'jrv:settings:benchmark-selection-changed',
    SHOW_FQCN_CHANGED: 'jrv:settings:show-fqcn-changed',
    SHOW_RESULTS_TABLE_CHANGED: 'jrv:settings:show-results-table-changed',
  },
  CHART: {
    CHART_TYPE_CHANGED: 'jrv:chart:chart-type-changed',
    DOWNLOAD_CLICKED: 'jrv:chart:download-clicked',
    SHOW_INSIGHTS_CLICKED: 'jrv:chart:show-insights-clicked',
  },
  FILTERS: {
    CHANGED: 'jrv:filters:changed',
  },
  MENU: {
    HAMBURGER_BUTTON_CLICKED: 'jrv:menu:hamburger-button-clicked',
    SETTINGS_BUTTON_CLICKED: 'jrv:menu:settings-button-clicked',
  },
} as const;
