export const DTC_DESCRIPTIONS: Record<string, { description: string; severity: 'low' | 'medium' | 'high' | 'critical' }> = {
  'P0000': { description: 'No codes detected', severity: 'low' },
  'P0001': { description: 'Fuel Volume Regulator Control Circuit/Open', severity: 'medium' },
  'P0010': { description: 'Camshaft Position Actuator Circuit (Bank 1)', severity: 'medium' },
  'P0020': { description: 'Camshaft Position Actuator Circuit (Bank 2)', severity: 'medium' },
  'P0030': { description: 'HO2S Heater Control Circuit (Bank 1 Sensor 1)', severity: 'medium' },
  'P0101': { description: 'Mass or Volume Air Flow Circuit Range/Performance Problem', severity: 'high' },
  'P0171': { description: 'System Too Lean (Bank 1)', severity: 'high' },
  'P0172': { description: 'System Too Rich (Bank 1)', severity: 'high' },
  'P0300': { description: 'Random/Multiple Cylinder Misfire Detected', severity: 'critical' },
  'P0301': { description: 'Cylinder 1 Misfire Detected', severity: 'high' },
  'P0302': { description: 'Cylinder 2 Misfire Detected', severity: 'high' },
  'P0303': { description: 'Cylinder 3 Misfire Detected', severity: 'high' },
  'P0304': { description: 'Cylinder 4 Misfire Detected', severity: 'high' },
  'P0420': { description: 'Catalyst System Efficiency Below Threshold (Bank 1)', severity: 'medium' },
  'P0442': { description: 'Evaporative Emission Control System Leak Detected (small leak)', severity: 'medium' },
  'P0446': { description: 'Evaporative Emission Control System Vent Control Circuit Malfunction', severity: 'medium' },
  'P0500': { description: 'Vehicle Speed Sensor Malfunction', severity: 'high' },
  'P0506': { description: 'Idle Control System RPM Lower Than Expected', severity: 'medium' },
  'P0507': { description: 'Idle Control System RPM Higher Than Expected', severity: 'medium' },
  'P0700': { description: 'Transmission Control System Malfunction', severity: 'critical' },
  'P0750': { description: 'Shift Solenoid A Malfunction', severity: 'high' },
  'B0001': { description: 'Driver Airbag Squib Circuit Short to Battery', severity: 'critical' },
  'C0001': { description: 'Vehicle Speed Sensor Circuit', severity: 'medium' },
  'U0001': { description: 'High Speed CAN Communication Bus', severity: 'medium' },
};

export const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'low': return '#22c55e';
    case 'medium': return '#f59e0b';
    case 'high': return '#ef4444';
    case 'critical': return '#dc2626';
    default: return '#6b7280';
  }
};