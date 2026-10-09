export interface FourLeds {
  current_increase: number;
  voltage_increase: number;
  power_increase: number;
  shared_red_warning: number;
}

export interface TelemetrySample {
  timestamp: string;
  timestamp_iso?: string;
  current: number;
  previous_current: number;
  change_current?: number;
  current_change?: number;
  change_a?: number;
  voltage: number;
  previous_voltage?: number;
  change_voltage?: number;
  power: number;
  previous_power?: number;
  change_power?: number;
  direction?: 'INCREASE' | 'DECREASE' | 'NONE';
  change_direction?: 'INCREASE' | 'DECREASE' | 'NONE';
  event_type: string;
  severity: 'NORMAL' | 'WARNING' | 'CRITICAL' | string;
  explanation: string;
  led_current?: number;
  led_voltage?: number;
  led_power?: number;
  led_shared_red?: number;
  white_led?: number;
  red_led?: number;
  status: string;
  event_count: number;
  scenario?: string;
  health_score?: number;
  anomaly_score?: number;
  threshold?: number;
  mode?: string;
  anomaly_pattern?: string;
  anomaly_severity?: string;
  anomaly_explanation?: string;
  z_score?: number;
}

export type TelemetryRecord = TelemetrySample;

export interface CurrentChangeEvent {
  id?: string;
  event_id?: string;
  session_id?: string;
  count?: number;
  event_count: number;
  timestamp: string;
  timestamp_iso?: string;
  timestamp_local?: string;
  previous_current: number;
  prev_current?: number;
  new_current: number;
  current_now?: number;
  voltage_now?: number;
  prev_voltage?: number;
  power_now?: number;
  prev_power?: number;
  change_magnitude: number;
  change_a?: number;
  change_current?: number;
  change_voltage?: number;
  change_power?: number;
  direction: 'INCREASE' | 'DECREASE' | 'NONE';
  event_type: string;
  severity: 'NORMAL' | 'WARNING' | 'CRITICAL' | string;
  explanation: string;
  led_current?: number;
  led_voltage?: number;
  led_power?: number;
  led_shared_red?: number;
  white_led?: number;
  red_led?: number;
  led_state?: {
    white: number;
    red: number;
    current?: number;
    voltage?: number;
    power?: number;
    shared_red?: number;
  };
  status?: string;
  scenario?: string;
}

export type ChangeEventRecord = CurrentChangeEvent;

export interface IncidentAlert {
  id: string;
  timestamp: string;
  type: string;
  severity: string;
  message?: string;
  reason?: string;
  current?: number;
}

export interface IndicatorMetric {
  id: number;
  name: string;
  value: number;
  unit: string;
}

export interface EnergyMetrics {
  cumulative_kwh: number;
  session_cost: number;
  avg_power_watts: number;
  peak_power_watts: number;
  hourly_projected_cost: number;
  daily_projected_cost: number;
  runtime_str: string;
  carbon_footprint_kg: number;
}

export interface BackendStatus {
  simulation_active: boolean;
  simulation_paused: boolean;
  scenario: string;
  current_threshold: number;
  threshold_normal_change?: number;
  threshold_heavy_change?: number;
  tol_current?: number;
  tol_voltage?: number;
  tol_power?: number;
  serial_port: string;
  baud_rate: number;
  esp32_connected: boolean;
  latest: TelemetrySample | null;
  history: TelemetrySample[];
  events?: CurrentChangeEvent[];
  total_events?: number;
  normal_changes_count?: number;
  heavy_changes_count?: number;
  overcurrent_count?: number;
  avg_current?: number;
  max_current?: number;
  change_metrics?: {
    total_events?: number;
    normal_change_count?: number;
    heavy_change_count?: number;
    overcurrent_count?: number;
    max_observed_current?: number;
    average_current?: number;
  };
  energy?: EnergyMetrics;
  four_leds?: FourLeds;
  update_interval?: number;
  next_update_in?: number;
  mode?: string;
}
