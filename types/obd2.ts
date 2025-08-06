export interface DTCCode {
  id: string;
  code: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

export interface Vehicle {
  brand: string;
  model: string;
  year: string;
}

export interface BluetoothDevice {
  id: string;
  name: string;
  address: string;
  connected: boolean;
}

export interface ScanSession {
  id: string;
  timestamp: Date;
  vehicle: Vehicle;
  codes: DTCCode[];
  duration: number;
}