export type Tab = 'docs' | 'terminal' | 'ai' | 'tools' | 'exploit';

export interface ToolOption {
  flag: string;
  name: string;
  description: string;
  category: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  baseCommand: string;
  options: ToolOption[];
  category: 'General' | 'Speed' | 'Research' | 'Packet Crafting' | 'ARP' | 'Exploitation' | 'Firewall' | 'OSINT' | 'Web Recon' | 'GeoLocation' | 'Infrastructure';
}

export interface PortData {
  port: number;
  protocol: 'tcp' | 'udp';
  state: 'open' | 'closed' | 'filtered';
  service: string;
  version: string;
  vulnerability?: {
    id: string;
    name: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    description: string;
  };
}

export interface ScanResult {
  id: string;
  timestamp: string;
  target: string;
  command: string;
  output: string;
  parsedPorts?: PortData[];
  analysis?: string;
}
