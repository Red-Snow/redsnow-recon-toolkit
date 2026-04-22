import { Tool } from './types';

export const TOOLS: Tool[] = [
  {
    id: 'nmap',
    name: 'Nmap',
    description: 'The Network Mapper. Industry standard for network discovery and security auditing.',
    baseCommand: 'nmap',
    category: 'General',
    options: [
      { flag: '-sS', name: 'SYN Scan', description: 'Stealthy TCP scan.', category: 'Discovery' },
      { flag: '-sV', name: 'Service Version', description: 'Determine service/version info.', category: 'Service' },
      { flag: '-O', name: 'OS Detection', description: 'Enable OS detection.', category: 'OS' },
      { flag: '-A', name: 'Aggressive', description: 'OS, Version, Scripts, Traceroute.', category: 'OS' },
      { flag: '--script vuln', name: 'Vulnerability Scan', description: 'Scan for known vulnerabilities using NSE.', category: 'Security' },
      { flag: '--script exploit', name: 'Exploit Check', description: 'Check if targets are exploitable.', category: 'Security' },
      { flag: '--script auth', name: 'Auth Check', description: 'Check for default credentials.', category: 'Security' },
      { flag: '-Pn', name: 'No Ping', description: 'Skip host discovery.', category: 'Discovery' },
      { flag: '-p-', name: 'All Ports', description: 'Scan all 65535 ports.', category: 'Discovery' },
    ]
  },
  {
    id: 'msfconsole',
    name: 'Metasploit',
    description: 'Advanced exploitation framework. Deploy payloads and gain remote access to vulnerable systems.',
    baseCommand: 'msfconsole',
    category: 'Exploitation',
    options: [
      { flag: '-q', name: 'Quiet Mode', description: 'Skip banner.', category: 'Config' },
      { flag: '-x "run"', name: 'Auto Run', description: 'Execute exploit immediately.', category: 'Automation' },
    ]
  },
  {
    id: 'hping3',
    name: 'Hping3',
    description: 'TCP/IP packet assembler/analyzer. Great for custom packet crafting and firewall testing.',
    baseCommand: 'hping3',
    category: 'Packet Crafting',
    options: [
      { flag: '-S', name: 'SYN Flag', description: 'Set SYN flag.', category: 'Flags' },
      { flag: '-A', name: 'ACK Flag', description: 'Set ACK flag.', category: 'Flags' },
      { flag: '-F', name: 'FIN Flag', description: 'Set FIN flag.', category: 'Flags' },
      { flag: '-p 80', name: 'Port 80', description: 'Target port 80.', category: 'Target' },
      { flag: '-c 3', name: 'Count 3', description: 'Send 3 packets.', category: 'Timing' },
      { flag: '--scan 1-100', name: 'Scan 1-100', description: 'Scan ports 1-100.', category: 'Discovery' },
    ]
  },
  {
    id: 'masscan',
    name: 'Masscan',
    description: 'The fastest port scanner. Can scan the entire Internet in 6 minutes.',
    baseCommand: 'masscan',
    category: 'Speed',
    options: [
      { flag: '-p80,443', name: 'Common Ports', description: 'Scan 80 and 443.', category: 'Target' },
      { flag: '--rate 1000', name: 'Rate 1000', description: '1000 packets per second.', category: 'Timing' },
      { flag: '--banners', name: 'Banners', description: 'Get banner information.', category: 'Service' },
      { flag: '--echo', name: 'Echo', description: 'Show current configuration.', category: 'Output' },
    ]
  },
  {
    id: 'netdiscover',
    name: 'Netdiscover',
    description: 'Active/passive address reconnaissance tool using ARP requests.',
    baseCommand: 'netdiscover',
    category: 'ARP',
    options: [
      { flag: '-i eth0', name: 'Interface eth0', description: 'Use eth0 interface.', category: 'Config' },
      { flag: '-p', name: 'Passive Mode', description: 'Do not send anything, just sniff.', category: 'Discovery' },
      { flag: '-f', name: 'Fast Mode', description: 'Scan common ranges quickly.', category: 'Timing' },
    ]
  },
  {
    id: 'wafw00f',
    name: 'WafW00f',
    description: 'Identifies and fingerprints Web Application Firewalls (WAF) products protecting a website.',
    baseCommand: 'wafw00f',
    category: 'Firewall',
    options: [
      { flag: '-a', name: 'Find All', description: 'Find all WAFs which match the signatures.', category: 'Discovery' },
      { flag: '-v', name: 'Verbose', description: 'Enable verbosity.', category: 'Output' },
    ]
  },
  {
    id: 'theharvester',
    name: 'theHarvester',
    description: 'OSINT tool to gather emails, subdomains, hosts, employee names, open ports and banners.',
    baseCommand: 'theHarvester',
    category: 'OSINT',
    options: [
      { flag: '-b all', name: 'All Sources', description: 'Use all supported search engines/sources.', category: 'Source' },
      { flag: '-l 500', name: 'Limit: 500', description: 'Limit the number of search results.', category: 'Config' },
    ]
  },
  {
    id: 'amass',
    name: 'Amass',
    description: 'In-depth Attack Surface Mapping and Asset Discovery (FQDN, Cloud, Servers).',
    baseCommand: 'amass enum',
    category: 'OSINT',
    options: [
      { flag: '-brute', name: 'Bruteforce', description: 'Execute brute forcing after search.', category: 'Discovery' },
      { flag: '-src', name: 'Sources', description: 'Print data sources for the discovered names.', category: 'Output' },
    ]
  },
  {
    id: 'whatweb',
    name: 'WhatWeb',
    description: 'Next generation web scanner. Identifies CMS, hosting platforms, servers, and tech stacks.',
    baseCommand: 'whatweb',
    category: 'Web Recon',
    options: [
      { flag: '-v', name: 'Verbose', description: 'Verbose output. Includes plugin/version details.', category: 'Output' },
      { flag: '-a 3', name: 'Aggression 3', description: 'Aggressive scanning level.', category: 'Discovery' },
    ]
  },
  {
    id: 'geoiplookup',
    name: 'GeoIP Lookup',
    description: 'Find geographic location, AS Number, and network topology of IP addresses.',
    baseCommand: 'geoiplookup',
    category: 'GeoLocation',
    options: [
      { flag: '-f /usr/share/GeoIP/GeoIP.dat', name: 'Use DB', description: 'Specify custom GeoIP database.', category: 'Config' },
    ]
  },
  {
    id: 'lbd',
    name: 'LBD',
    description: 'Load Balancer Detector. Detects if a given domain uses DNS and/or HTTP Load-Balancing.',
    baseCommand: 'lbd',
    category: 'Infrastructure',
    options: []
  },
  {
    id: 'whois',
    name: 'Whois',
    description: 'Query the WHOIS database for domain registration and organizational details.',
    baseCommand: 'whois',
    category: 'OSINT',
    options: [
      { flag: '-H', name: 'Hide Disclaimers', description: 'Hide legal disclaimers.', category: 'Output' }
    ]
  },
  {
    id: 'dig',
    name: 'Dig',
    description: 'Domain Information Groper for querying DNS nameservers and infrastructure.',
    baseCommand: 'dig',
    category: 'Infrastructure',
    options: [
      { flag: 'ANY', name: 'All Records', description: 'Query all DNS record types.', category: 'Query' },
      { flag: '+short', name: 'Short Output', description: 'Provide brief output.', category: 'Output' }
    ]
  }
];

export const MODULE_3_DOCS = `
# CEH v13 Module 03: Scanning Networks

## 1. Tactical Overview
Network scanning refers to a set of procedures used for identifying hosts, ports, and services in a network. Network scanning is one of the most important components of intelligence gathering for an ethical hacker, allowing the researcher to create a profile of the target organization.

## 2. Scanning Methodology
A professional scanning engagement follows a rigid sequence to ensure maximum coverage with minimum detection profile:

### Phase A: Check for Live Systems
*   **ICMP Scanning**: Using ICMP Echo requests to determine if a target is alive.
*   **ARP Scanning**: More reliable for local network segments as it bypasses firewall rules that block ICMP.

### Phase B: Check for Open Ports
*   **TCP SYN Scan (-sS)**: The default and most popular scan. It is "stealthy" as it never completes the TCP handshake.
*   **TCP Connect Scan (-sT)**: Uses the OS system calls to complete the handshake. More visible in logs.
*   **UDP Scanning (-sU)**: Essential for discovering services like DNS, SNMP, and VoIP.

### Phase C: Identification of Services
*   **Service Versioning (-sV)**: Probes open ports to determine what service and version are actually running.
*   **Banner Grabbing**: Connecting to a service to see the initial welcome string.

### Phase D: Vulnerability Research
*   **NSE Scripts**: Using Nmap Scripting Engine (\`--script vuln\`) to automatically check for known CVEs.
*   **OS Fingerprinting (-O)**: Analyzing TCP/IP stack responses to guess the underlying Operating System.

## 3. Tool Arsenal

This endpoint provides a comprehensive, multi-vector analysis suite equipped with both traditional network scanners and advanced OSINT/Infrastructure utilities.

### 3.1 Network Discovery & Security
| Tool | Core Features | Official Source |
| :--- | :--- | :--- |
| **Nmap** | Port scanning, OS fingerprinting, Vulnerability scanning via NSE scripts. | [nmap.org](https://nmap.org/) |
| **Hping3** | Custom TCP/IP packet crafting, firewall testing, DoS simulation. | [kali.org/tools/hping3](https://www.kali.org/tools/hping3/) |
| **Masscan** | Asynchronous TCP port scanner capable of scanning the entire internet in under 6 minutes. | [github.com/robertdavidgraham/masscan](https://github.com/robertdavidgraham/masscan) |
| **Netdiscover** | Active/passive ARP reconnaissance tool for finding hidden devices on local segments. | [github.com/netdiscover-scanner/netdiscover](https://github.com/netdiscover-scanner/netdiscover) |
| **Metasploit** | Penetration testing framework containing integrated exploit modules, payloads, and handlers. | [metasploit.com](https://www.metasploit.com/) |

### 3.2 OSINT & Infrastructure Topography
| Tool | Core Features | Official Source |
| :--- | :--- | :--- |
| **TheHarvester** | Gathers emails, subdomains, hosts, and employee names from Bing, LinkedIn, Google, etc. | [github.com/laramies/theHarvester](https://github.com/laramies/theHarvester) |
| **Amass** | In-depth attack surface mapping and external asset discovery (FQDN, ASNs). | [github.com/owasp-amass/amass](https://github.com/owasp-amass/amass) |
| **WafW00f** | Identifies and fingerprints Web Application Firewall (WAF) products protecting a site. | [github.com/EnableSecurity/wafw00f](https://github.com/EnableSecurity/wafw00f) |
| **WhatWeb** | Next-generation web scanner identifying CMS platforms, hosting, tech stacks, and servers. | [github.com/urbanadventurer/WhatWeb](https://github.com/urbanadventurer/WhatWeb) |
| **GeoIP Lookup** | Resolves geographic locations, AS Numbers, and ISP network topology from target IPs. | [dev.maxmind.com/geoip](https://dev.maxmind.com/geoip) |
| **LBD** | Load Balancer Detector; detects if a given domain uses DNS and/or HTTP Load-Balancing. | [kali.org/tools/lbd](https://www.kali.org/tools/lbd/) |
| **Whois** | Queries the public WHOIS registry for domain registration dates, servers, and ownership. | [linux.die.net/man/1/whois](https://linux.die.net/man/1/whois) |
| **Dig** | Domain Information Groper used for interrogating DNS name servers for detailed records. | [isc.org/bind](https://www.isc.org/bind/) |

## 4. Evasion Techniques
*   **Fragmentation**: Splitting the TCP header over several packets to bypass simple packet filters.
*   **Decoys (-D)**: Mixing your IP with other "decoy" IPs to hide the origin of the scan.
*   **Timing Optimization**: Adjusting delays (\`-T0\` through \`-T5\`) to stay under detection thresholds.

## 5. Security Countermeasures
1.  **Strict Egress/Ingress Filtering**: Only allow necessary traffic.
2.  **Stateful Inspection**: Block unsolicited incoming SYN/ACK packets.
3.  **Modern IDS/IPS**: Implement behavioral analysis to detect scanning patterns.
4.  **Network Segmentation**: Limiting the "blast radius" if a host is discovered.

---

> [!IMPORTANT]
> **Operational Integrity**: All labs must be performed within the designated virtual private network. Any attempt to scan external production assets will result in immediate revocation of credentials.
`;
