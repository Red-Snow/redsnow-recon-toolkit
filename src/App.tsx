import React, { useState, useEffect, useRef } from 'react';
import { Search, Terminal, BookOpen, Shield, Cpu, MessageSquare, ChevronRight, Play, RotateCcw, Copy, Check, Info, Download, Zap, Database, Globe, Lock, Activity, Settings, X, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Tab, Tool, ScanResult, PortData } from './types';
import { TOOLS, MODULE_3_DOCS } from './constants';
import { analyzeScan, getScanningAdvice } from './services/gemini';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('terminal');
  const [selectedTool, setSelectedTool] = useState<Tool>(TOOLS[0]);
  const [target, setTarget] = useState('192.168.1.1');
  const [selectedOptions, setSelectedOptions] = useState<string[]>(['-sS', '-sV', '-O', '-T4']);
  const [isScanning, setIsScanning] = useState(false);
  const [scanOutput, setScanOutput] = useState<string>('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [msfHistory, setMsfHistory] = useState<{ cmd: string, output: string }[]>([]);
  const [msfTarget, setMsfTarget] = useState<PortData | null>(null);
  const [exploitPrompt, setExploitPrompt] = useState('msf6 > ');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('REDSNOW_GEMINI_KEY') || '');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Update selected options when tool changes
  useEffect(() => {
    if (selectedTool.id === 'nmap') {
      setSelectedOptions(['-sS', '-sV', '-O', '-T4']);
    } else if (selectedTool.id === 'hping3') {
      setSelectedOptions(['-S', '-p 80', '-c 3']);
    } else if (selectedTool.id === 'masscan') {
      setSelectedOptions(['-p80,443', '--rate 1000']);
    } else if (selectedTool.id === 'netdiscover') {
      setSelectedOptions(['-i eth0']);
    } else if (selectedTool.id === 'wafw00f') {
      setSelectedOptions(['-a']);
    } else if (selectedTool.id === 'theharvester') {
      setSelectedOptions(['-b all']);
    } else if (selectedTool.id === 'amass') {
      setSelectedOptions(['-brute']);
    } else if (selectedTool.id === 'whatweb') {
      setSelectedOptions(['-v']);
    } else if (selectedTool.id === 'geoiplookup') {
      setSelectedOptions(['-f /usr/share/GeoIP/GeoIP.dat']);
    } else if (selectedTool.id === 'lbd') {
      setSelectedOptions([]);
    } else if (selectedTool.id === 'whois') {
      setSelectedOptions(['-H']);
    } else if (selectedTool.id === 'dig') {
      setSelectedOptions(['ANY', '+short']);
    }
  }, [selectedTool]);

  const toggleOption = (flag: string) => {
    setSelectedOptions(prev => 
      prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]
    );
  };

  const fullCommand = `${selectedTool.baseCommand} ${selectedOptions.join(' ')} ${target}`;

  const [msfCommand, setMsfCommand] = useState('');

  const handleMsfCommand = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && msfCommand.trim()) {
      const cmd = msfCommand.trim();
      setMsfCommand('');
      setScanOutput(prev => prev + `msf6 > ${cmd}\n[*] Executing tactical sequence for: ${cmd}...\n`);
      
      // Simulate typical MSF responses for flair
      setTimeout(() => {
        if (cmd.includes('use')) setScanOutput(prev => prev + `[*] Matching module found. Setting context...\n`);
        else if (cmd.includes('set')) setScanOutput(prev => prev + `[+] Value assigned to global variable.\n`);
        else if (cmd.includes('exploit') || cmd.includes('run')) simulateScan();
        else setScanOutput(prev => prev + `[-] Unknown command: ${cmd}. Type 'help' for tactical options.\n`);
      }, 500);
    }
  };

  const startExploit = (port: PortData) => {
    setMsfTarget(port);
    setSelectedTool(TOOLS.find(t => t.id === 'msfconsole') || TOOLS[0]);
    setActiveTab('terminal');
    setScanOutput('');
    setScanResult(null);
  };

  const simulateScan = async () => {
    setIsScanning(true);
    setScanOutput('');
    setScanResult(null);
    setAiAnalysis(null);

    let lines: string[] = [];
    const parsedPorts: PortData[] = [];
    
    if (selectedTool.id === 'nmap') {
      const isVulnScan = selectedOptions.includes('--script vuln');
      
      parsedPorts.push(
        { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.2p1' },
        { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache httpd 2.4.41' },
        { port: 443, protocol: 'tcp', state: 'open', service: 'ssl/http', version: 'Apache httpd 2.4.41' },
        { port: 3306, protocol: 'tcp', state: 'open', service: 'mysql', version: 'MySQL 8.0.28' },
        { port: 8080, protocol: 'tcp', state: 'open', service: 'http-proxy', version: 'Squid 4.10' }
      );

      if (isVulnScan) {
        parsedPorts[1].vulnerability = { 
          id: 'CVE-2021-41773', 
          name: 'Apache Path Traversal', 
          severity: 'Critical',
          description: 'A flaw was found in a change made to path normalization in Apache HTTP Server 2.4.49.' 
        };
        parsedPorts[3].vulnerability = { 
          id: 'CVE-2022-21449', 
          name: 'MySQL Authentication Bypass', 
          severity: 'High',
          description: 'Vulnerability in the MySQL Server product of Oracle MySQL (component: Server: Security: Privileges).' 
        };
      }

      lines = [
        `Starting Nmap 7.94 ( https://nmap.org ) at ${new Date().toISOString().replace('T', ' ').split('.')[0]} UTC`,
        `NSE: Loaded 155 scripts for scanning.`,
        isVulnScan ? `NSE: [vuln] category scripts selected.` : ``,
        `Initiating ARP Ping Scan at ${new Date().toLocaleTimeString()}`,
        `Scanning ${target} [1 port]`,
        `Completed ARP Ping Scan at ${new Date().toLocaleTimeString()}, 0.01s elapsed (1 total hosts)`,
        `Initiating SYN Stealth Scan at ${new Date().toLocaleTimeString()}`,
        `Scanning ${target} [1000 ports]`,
        ...parsedPorts.map(p => `Discovered open port ${p.port}/${p.protocol} on ${target}`),
        `Completed SYN Stealth Scan at ${new Date().toLocaleTimeString()}, 1.24s elapsed (1000 total ports)`,
        `Initiating Service scan at ${new Date().toLocaleTimeString()}`,
        `Completed Service scan at ${new Date().toLocaleTimeString()}, 6.12s elapsed`,
        isVulnScan ? `Initiating NSE vulnerability scripts...` : ``,
        isVulnScan ? `| http-vuln-cve2021-41773: \n|   VULNERABLE:\n|   Apache HTTP Server 2.4.49 path traversal\n|     State: VULNERABLE\n|     IDs:  CVE:CVE-2021-41773` : ``,
        `Nmap scan report for ${target}`,
        `Host is up (0.0012s latency).`,
        `PORT     STATE SERVICE     VERSION`,
        ...parsedPorts.map(p => `${(p.port + '/' + p.protocol).padEnd(8)} open  ${p.service.padEnd(11)} ${p.version}`),
        isVulnScan ? `\n# Vulnerabilities detected! Check the analysis panel for deep intelligence.` : ``,
        `Nmap done: 1 IP address (1 host up) scanned in 12.45 seconds`
      ].filter(Boolean);
    } else if (selectedTool.id === 'msfconsole') {
      lines = [
        `msf6 > use exploit/multi/http/apache_normalize_path_traversal`,
        `[*] Using configured payload linux/x64/meterpreter/reverse_tcp`,
        `msf6 exploit(apache_normalize_path_traversal) > set RHOSTS ${target}`,
        `RHOSTS => ${target}`,
        `msf6 exploit(apache_normalize_path_traversal) > check`,
        `[*] ${target}:80 - The target is vulnerable.`,
        `msf6 exploit(apache_normalize_path_traversal) > exploit`,
        `[*] Started reverse TCP handler on 192.168.1.50:4444`,
        `[*] Command shell session 1 opened (192.168.1.50:4444 -> ${target}:80) at ${new Date().toLocaleString()}`,
        `meterpreter > getuid`,
        `Server username: root (0)`,
        `meterpreter > sysinfo`,
        `Computer     : Target-Host`,
        `OS           : Ubuntu 20.04.3 LTS (Linux 5.4.0-101-generic)`,
        `Architecture : x64`,
        `Meterpreter  : x64/linux`,
        `meterpreter > exit`,
        `[*] Shutting down Meterpreter...`,
        `[*] 192.168.1.1 - Command shell session 1 closed. Reason: User exit`
      ];
    } else if (selectedTool.id === 'wafw00f') {
      lines = [
        `[*] Checking https://${target}`,
        `[+] The site ${target} is behind Cloudflare (Cloudflare Inc.) WAF.`,
        `[+] Number of requests: 12`
      ];
    } else if (selectedTool.id === 'theharvester') {
      lines = [
        `*******************************************************************`,
        `*  theHarvester 4.4.0                                             *`,
        `*******************************************************************`,
        `[*] Target: ${target}`,
        `[*] Searching Bing...`,
        `[*] Searching LinkedIn...`,
        `[+] Emails found:`,
        `admin@${target}`,
        `security@${target}`,
        `[+] Hosts found:`,
        `mail.${target}: 192.168.1.10`,
        `vpn.${target}: 192.168.1.11`
      ];
    } else if (selectedTool.id === 'amass') {
      lines = [
        `[Google] www.${target}`,
        `[VirusTotal] dev.${target}`,
        `[Route53] cloud.${target} (AWS)`,
        `ASN: 13335 - CLOUDFLARENET`
      ];
    } else if (selectedTool.id === 'whatweb') {
      lines = [
        `http://${target} [200 OK] Apache[2.4.41], Country[UNITED STATES][US], HTTPServer[Ubuntu Linux], IP[192.168.1.1], X-Powered-By[PHP/7.4], WordPress[5.8.1]`
      ];
    } else if (selectedTool.id === 'geoiplookup') {
      lines = [
        `GeoIP Country Edition: US, United States`,
        `GeoIP City Edition, Rev 1: US, CA, California, San Francisco, 94107, 37.7765, -122.3922`,
        `GeoIP ASNum Edition: AS15169 Google LLC`
      ];
    } else if (selectedTool.id === 'lbd') {
      lines = [
        `lbd - load balancer detector 0.4`,
        `Checking for DNS-Loadbalancing: FOUND`,
        `${target} has multiple A records (192.168.1.1, 192.168.1.2)`,
        `Checking for HTTP-Loadbalancing: NOT FOUND`
      ];
    } else if (selectedTool.id === 'whois') {
      lines = [
        `WHOIS Server: whois.markmonitor.com`,
        `Registrar: MarkMonitor Inc.`,
        `Creation Date: 1997-09-15T04:00:00Z`,
        `Updated Date: 2023-08-14T09:00:00Z`,
        `Registry Expiry Date: 2028-09-14T04:00:00Z`,
        `Registrant Organization: Google LLC`,
        `Registrant State/Province: CA`,
        `Registrant Country: US`,
        `Name Server: ns1.google.com`,
        `Name Server: ns2.google.com`,
        `DNSSEC: unsigned`
      ];
    } else if (selectedTool.id === 'dig') {
      lines = [
        `; <<>> DiG 9.16.1-Ubuntu <<>> ${selectedOptions.join(' ')} ${target}`,
        `;; global options: +cmd`,
        `;; Got answer:`,
        `;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 49213`,
        `;; flags: qr rd ra; QUERY: 1, ANSWER: 4, AUTHORITY: 0, ADDITIONAL: 1`,
        ``,
        `;; QUESTION SECTION:`,
        `;${target}.				IN	ANY`,
        ``,
        `;; ANSWER SECTION:`,
        `${target}.			300	IN	A	192.168.1.1`,
        `${target}.			300	IN	A	192.168.1.2`,
        `${target}.			300	IN	MX	10 mail.${target}.`,
        `${target}.			300	IN	TXT	"v=spf1 include:_spf.${target} ~all"`,
        ``,
        `;; Query time: 14 msec`,
        `;; SERVER: 8.8.8.8#53(8.8.8.8)`
      ];
    } else {
      lines = [`Scanning ${target} with ${selectedTool.name}...`, `Done.`];
    }

    setScanOutput('');
    let simulatedOutput = '';

    for (const line of lines) {
      simulatedOutput += line + '\n';
      setScanOutput(simulatedOutput);
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
      // Introduce variable delay for a realistic typing/processing effect
      const currentLag = Math.random() > 0.85 ? 400 + Math.random() * 300 : 20 + Math.random() * 60;
      await new Promise(resolve => setTimeout(resolve, currentLag));
    }

    const newScan = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleString(),
      target,
      command: fullCommand,
      output: simulatedOutput,
      parsedPorts: parsedPorts.length > 0 ? parsedPorts : undefined
    };

    setScanResult(newScan);
    setScanHistory(prev => [...prev, newScan]);
    setIsScanning(false);
  };

  const handleAnalyze = async () => {
    if (!scanResult) return;
    setIsAnalyzing(true);
    const analysis = await analyzeScan(scanResult.command, scanResult.output, geminiApiKey);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const exportReport = () => {
    if (scanHistory.length === 0) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let margin = 20;

    // PAGE 1: COVER
    doc.setFillColor(20, 20, 20); // Dark border top
    doc.rect(0, 0, pageWidth, 15, 'F');
    doc.setFillColor(255, 50, 50); // Red accent
    doc.rect(0, 15, pageWidth, 2, 'F');
    
    doc.setTextColor(200, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.text('OFFENSIVE SECURITY', pageWidth / 2, 80, { align: 'center' });
    doc.text('ASSESSMENT REPORT', pageWidth / 2, 95, { align: 'center' });

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(14);
    doc.text('Restricted Distribution // For Authorized Eyes Only', pageWidth / 2, 110, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(`Primary Target Identifier: `, margin, 150);
    doc.setFont('helvetica', 'bold');
    doc.text(`${scanResult?.target || target}`, margin + 60, 150);

    doc.setFont('helvetica', 'normal');
    doc.text(`Time of Assessment: `, margin, 160);
    doc.setFont('helvetica', 'bold');
    doc.text(`${new Date().toLocaleString()}`, margin + 60, 160);

    doc.setFont('helvetica', 'normal');
    doc.text(`Lead Researcher: `, margin, 170);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(200, 0, 0);
    doc.text(`Red_Snow (LEVEL_4_PRO)`, margin + 60, 170);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`Disclaimer: Confidential and proprietary. Unauthorized disclosure`, pageWidth / 2, 270, { align: 'center' });
    doc.text(`is strictly prohibited and may violate local or international law.`, pageWidth / 2, 275, { align: 'center' });

    // PAGE 2: AI SUMMARY (IF EXISTS)
    let y = 20;
    if (aiAnalysis) {
      doc.addPage();
      doc.setFillColor(20, 20, 20);
      doc.rect(0, 0, pageWidth, 15, 'F');
      
      doc.setFontSize(16);
      doc.setTextColor(200, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('1. EXECUTIVE SUMMARY & EXPERT ANALYSIS', margin, 35);
      
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.setFont('helvetica', 'normal');
      
      y = 45;
      const aiLines = doc.splitTextToSize(aiAnalysis, pageWidth - margin * 2);
      for(let line of aiLines) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += 5;
      }
    }

    // PAGE 3+: TOOL LOGS
    doc.addPage();
    doc.setFillColor(20, 20, 20);
    doc.rect(0, 0, pageWidth, 15, 'F');
    
    doc.setFontSize(16);
    doc.setTextColor(200, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('2. RECONNAISSANCE & ATTACK VECTOR LOGS', margin, 35);
    
    y = 50;

    scanHistory.forEach((scan, index) => {
      if (y > 250) { 
        doc.addPage(); 
        y = 35; 
      }

      // Scan Action Block Header
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, y - 5, pageWidth - margin * 2, 10, 'F');
      doc.setFillColor(200, 0, 0);
      doc.rect(margin, y - 5, 2, 10, 'F'); // Red left border

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      doc.text(`[Phase ${index + 1}] CMD: ${scan.command}`, margin + 5, y + 2);
      
      y += 15;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Time Executed: ${scan.timestamp}`, margin, y - 4);

      // Raw Output Box
      doc.setFont('courier', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 30, 30);
      
      const splitOutput = doc.splitTextToSize(scan.output, pageWidth - margin * 2 - 5);
      
      splitOutput.forEach((line: string) => {
        if (y > 275) {
          doc.addPage();
          y = 30;
          doc.setFont('courier', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(30, 30, 30);
        }
        doc.text(line, margin + 2, y);
        y += 4;
      });
      
      y += 15; // Space before next log
    });

    doc.save(`RED_SNOW_REPORT_${target.replace(/\./g, '_')}.pdf`);
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatting(true);
    
    const aiMsg = await getScanningAdvice(userMsg, geminiApiKey);
    setChatHistory(prev => [...prev, { role: 'ai', text: aiMsg || 'No response from AI.' }]);
    setIsChatting(false);
  };

  const saveApiKey = (key: string) => {
    setGeminiApiKey(key);
    localStorage.setItem('REDSNOW_GEMINI_KEY', key);
    setIsSettingsOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#030303] text-[#E0E0E0] font-sans selection:bg-[#00FF00]/30 overflow-hidden relative">
      {/* Sidebar */}
      <aside className="w-80 border-r border-[#00FF00]/10 flex flex-col bg-[#050505] z-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00FF00]/5 to-transparent pointer-events-none" />
        
        <div className="p-10 border-b border-[#00FF00]/10 relative">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-10 h-10 cyber-panel flex items-center justify-center group">
              <Shield className="text-[#00FF00] group-hover:scale-110 transition-transform" size={24} />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl tracking-tighter text-[#00FF00] uppercase glitch-text">CEH Lab</h1>
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#00FF00]/40 font-mono -mt-1">Terminal Active</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-6">
            <div className="flex-1 h-[2px] bg-gradient-to-r from-[#00FF00] to-transparent opacity-20" />
            <div className="w-2 h-2 rounded-full bg-[#00FF00] animate-ping" />
          </div>
        </div>
        
        <nav className="flex-1 py-10 px-4 space-y-2">
          <SidebarItem 
            icon={<Terminal size={18} />} 
            label="Security Terminal" 
            active={activeTab === 'terminal'} 
            onClick={() => setActiveTab('terminal')} 
          />
          <SidebarItem 
            icon={<BookOpen size={18} />} 
            label="Module Manual" 
            active={activeTab === 'docs'} 
            onClick={() => setActiveTab('docs')} 
          />
          <SidebarItem 
            icon={<MessageSquare size={18} />} 
            label="AI Cyber Mentor" 
            active={activeTab === 'ai'} 
            onClick={() => setActiveTab('ai')} 
          />
          <SidebarItem 
            icon={<Database size={18} />} 
            label="Vector Analysis" 
            active={activeTab === 'tools'} 
            onClick={() => setActiveTab('tools')} 
          />
          <SidebarItem 
            icon={<Settings size={18} />} 
            label="API Config" 
            active={isSettingsOpen} 
            onClick={() => setIsSettingsOpen(true)} 
          />
        </nav>

        <div className="p-8 border-t border-[#00FF00]/10 bg-[#020202]">
          <div className="mb-6 flex flex-col gap-4">
            <span className="text-[10px] font-mono text-[#00FF00]/40 uppercase tracking-widest flex items-center gap-2">
              <Globe size={10} /> Research Author
            </span>
            <div className="cyber-panel p-4 bg-[#0A0A0A]/50 border-red-500/20 relative group">
              <div className="absolute inset-0 pointer-events-none opacity-50 z-0">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="snow-flake" style={{
                    left: `${Math.random() * 100}%`,
                    width: `${Math.random() * 3 + 1}px`,
                    height: `${Math.random() * 3 + 1}px`,
                    animation: `fall ${Math.random() * 3 + 2}s linear infinite`,
                    animationDelay: `-${Math.random() * 2}s`
                  }} />
                ))}
              </div>
              <div className="relative z-10 text-[11px] font-bold text-red-500 tracking-tighter uppercase whitespace-pre-wrap">Red_Snow</div>
              <div className="relative z-10 flex items-center justify-between mt-1">
                <span className="text-[9px] text-red-400/60 font-mono break-all">Lead Researcher</span>
                <span className="text-[9px] text-red-400/60 font-mono">CEH v13</span>
              </div>
              <div className="relative z-10 mt-3 h-[1px] bg-red-500/10 w-full" />
              <div className="relative z-10 mt-2 text-[8px] uppercase tracking-widest text-[#E0E0E0]/30 font-mono flex justify-between">
                <span>Clearance:</span> <span className="text-red-500/80">LEVEL_4_PRO</span>
              </div>
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#00FF00]/40 uppercase tracking-widest flex items-center gap-2">
              <Activity size={10} className="animate-pulse" /> System Diagnostics
            </span>
            <div className="flex gap-1">
              <div className="w-1 h-3 bg-[#00FF00]/20" />
              <div className="w-1 h-3 bg-[#00FF00]/40" />
              <div className="w-1 h-3 bg-[#00FF00]/60 animate-bounce" />
            </div>
          </div>
          <div className="space-y-3 font-mono text-[9px] opacity-60">
            <div className="flex justify-between items-center group cursor-default">
              <span>STATUS</span>
              <span className="text-[#00FF00] group-hover:glow-green transition-all">DECRYPTED</span>
            </div>
            <div className="flex justify-between items-center group cursor-default">
              <span>LATENCY</span>
              <span className="text-[#00FF00] font-bold">0.002MS</span>
            </div>
            <div className="flex justify-between items-center group cursor-default">
              <span>PROTO</span>
              <span className="text-[#00FF00]">TLS 1.3 / E2EE</span>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-[#00FF00]/5 flex justify-between items-center opacity-30 text-[8px] font-mono">
            <span>SES_ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
            <span>v4.22.0</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
        <div className="absolute inset-0 bg-[#00FF00]/[0.01] pointer-events-none" />
        <AnimatePresence mode="wait">
          {activeTab === 'terminal' && (
            <motion.div 
              key="terminal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-12 max-w-[1600px] mx-auto"
            >
              <header className="mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-[2px] bg-[#00FF00]" />
                    <span className="text-[10px] uppercase tracking-[0.5em] text-[#00FF00]/60 font-mono">Operations Center</span>
                  </div>
                  <h2 className="text-5xl font-display font-bold text-[#00FF00] tracking-tighter uppercase whitespace-pre-wrap">Network Scan Console</h2>
                  <p className="text-xs text-[#00FF00]/40 mt-3 font-mono max-w-xl">
                    Multi-vector reconnaissance engine. Deploy probes to identify host vulnerabilities and service signatures.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={exportReport}
                    disabled={scanHistory.length === 0}
                    className={`group relative flex items-center gap-3 px-8 py-3 cyber-panel transition-all text-[10px] uppercase tracking-widest font-bold overflow-hidden ${scanHistory.length === 0 ? 'opacity-50 cursor-not-allowed border-[#00FF00]/10' : 'hover:border-[#00FF00]/60'}`}
                  >
                    <div className="absolute inset-0 bg-[#00FF00]/5 translate-y-full group-hover:translate-y-0 transition-transform" />
                    <Download size={14} className={scanHistory.length === 0 ? 'text-[#00FF00]/40' : 'text-[#00FF00]'} /> 
                    <span className="relative">Export Mission ({scanHistory.length})</span>
                  </button>
                  <div className="hidden lg:flex items-center gap-2 px-6 py-3 border border-[#00FF00]/5 rounded text-[10px] font-mono text-[#00FF00]/30">
                    <Database size={12} /> SCAN_CACHE: 12.4GB
                  </div>
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Configuration Panel */}
                <div className="lg:col-span-4 space-y-8">
                  {/* Tool Selection */}
                  <div className="cyber-panel p-8 space-y-8 relative group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#00FF00]/[0.02] -mr-12 -mt-12 rounded-full blur-2xl" />
                    
                    <section>
                      <label className="block text-[10px] uppercase tracking-[0.3em] font-bold text-[#00FF00]/60 mb-6 flex items-center gap-2">
                        <Cpu size={12} /> Hardware Logic
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {TOOLS.map(tool => (
                          <button 
                            key={tool.id}
                            onClick={() => setSelectedTool(tool)}
                            className={cn(
                              "p-4 text-left border transition-all text-[11px] font-mono uppercase tracking-wider relative overflow-hidden group/btn",
                              selectedTool.id === tool.id 
                                ? "bg-[#00FF00]/10 border-[#00FF00] text-[#00FF00] shadow-[0_0_15px_rgba(0,255,0,0.1)]" 
                                : "bg-transparent border-[#00FF00]/10 text-[#00FF00]/30 hover:border-[#00FF00]/30"
                            )}
                          >
                            <span className="relative z-10">{tool.name}</span>
                            {selectedTool.id === tool.id && (
                              <motion.div 
                                layoutId="tool-active"
                                className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00FF00]"
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    </section>

                    <section>
                      <label className="block text-[10px] uppercase tracking-[0.3em] font-bold text-[#00FF00]/60 mb-6 flex items-center gap-2">
                        <Globe size={12} /> Target Vector
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00FF00]/30 font-mono text-lg">›</div>
                        <input 
                          type="text" 
                          value={target}
                          onChange={(e) => setTarget(e.target.value)}
                          className="w-full bg-[#030303] border border-[#00FF00]/20 pl-10 pr-4 py-4 font-mono text-sm focus:outline-none focus:border-[#00FF00] transition-colors text-[#00FF00] placeholder:text-[#00FF00]/10 rounded-xs"
                          placeholder="0.0.0.0 / DOMAIN"
                        />
                      </div>
                    </section>

                    <section>
                      <label className="block text-[10px] uppercase tracking-[0.3em] font-bold text-[#00FF00]/60 mb-6 flex items-center gap-2">
                        <Zap size={12} /> Injection Flags
                      </label>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {selectedTool.options.map(opt => (
                          <button 
                            key={opt.flag}
                            onClick={() => toggleOption(opt.flag)}
                            className={cn(
                              "w-full flex items-center gap-4 p-4 text-left border rounded-xs transition-all relative group/opt",
                              selectedOptions.includes(opt.flag) 
                                ? "bg-[#00FF00]/5 border-[#00FF00]/40 text-[#00FF00]" 
                                : "bg-transparent border-[#00FF00]/5 hover:border-[#00FF00]/20 text-[#E0E0E0]/40"
                            )}
                          >
                            <div className={cn(
                              "w-12 h-8 rounded-xs flex items-center justify-center font-mono text-[9px] border transition-colors",
                              selectedOptions.includes(opt.flag) ? "bg-[#00FF00] text-[#0A0A0A] border-[#00FF00]" : "bg-[#0A0A0A] border-[#00FF00]/10 text-[#00FF00]/30"
                            )}>
                              {opt.flag}
                            </div>
                            <div className="flex-1">
                              <div className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1 group-hover/opt:text-[#00FF00] transition-colors">{opt.name}</div>
                              <div className="text-[9px] opacity-40 font-mono line-clamp-1">{opt.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className="cyber-panel p-8 bg-[#00FF00] group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                    <div className="flex justify-between items-center mb-6 relative">
                      <label className="text-[9px] uppercase tracking-[0.4em] font-bold text-[#0A0A0A]/60">Command String</label>
                      <button 
                        onClick={() => navigator.clipboard.writeText(fullCommand)}
                        className="p-2 hover:scale-110 transition-transform text-[#0A0A0A]"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                    <div className="font-mono text-sm font-bold break-all mb-8 leading-tight text-[#0A0A0A] relative min-h-[40px]">
                      {fullCommand}
                    </div>
                    <button 
                      onClick={simulateScan}
                      disabled={isScanning}
                      className="w-full py-5 bg-[#0A0A0A] text-[#00FF00] rounded-xs hover:tracking-[0.3em] transition-all flex items-center justify-center gap-3 font-bold uppercase tracking-[0.2em] text-[10px] relative overflow-hidden group/run disabled:opacity-50"
                    >
                      <div className="absolute inset-0 bg-[#00FF00]/10 -translate-x-full group-hover/run:translate-x-0 transition-transform duration-500" />
                      {isScanning ? <RotateCcw className="animate-spin" size={14} /> : <Play size={14} />}
                      <span className="relative">{isScanning ? 'UPLINK ACTIVE' : 'Initiate Sequence'}</span>
                    </button>
                  </div>
                </div>

                {/* Terminal & Analysis Panel */}
                <div className="lg:col-span-8 space-y-10">
                  {scanResult?.parsedPorts && (
                    <NetworkVisuals 
                      ports={scanResult.parsedPorts} 
                      target={scanResult.target} 
                      onExploit={startExploit}
                    />
                  )}
                  
                  <div className="cyber-panel flex flex-col h-[750px] group">
                    <div className="px-6 py-3 bg-[#0A0A0A]/80 border-b border-[#00FF00]/10 flex justify-between items-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00FF00]/30 to-transparent" />
                      <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#333] border border-white/5" />
                        <div className="w-2 h-2 rounded-full bg-[#333] border border-white/5" />
                        <div className="w-2 h-2 rounded-full bg-[#333] border border-white/5" />
                      </div>
                      <div className="text-[10px] font-mono text-[#00FF00]/40 uppercase tracking-[0.3em] flex items-center gap-3">
                        <div className="w-1 h-3 bg-[#00FF00]/40 animate-pulse" />
                        ROOT_SHELL: {selectedTool.id}.sh
                      </div>
                      <div className="text-[9px] font-mono text-[#00FF00]/20">TTY_0: {target}</div>
                    </div>
                    
                    <div 
                      ref={terminalRef}
                      className="flex-1 p-10 font-mono text-[12px] overflow-y-auto bg-[#020202] text-[#00FF00] leading-relaxed custom-scrollbar relative"
                    >
                      {scanOutput ? (
                        <div className="relative z-10">
                          <pre className="whitespace-pre-wrap">{scanOutput}</pre>
                          {selectedTool.id === 'msfconsole' && !isScanning && (
                            <div className="flex gap-2 items-center mt-2 group/prompt">
                              <span className="text-[#00FF00] font-bold animate-pulse">msf6 &gt;</span>
                              <input 
                                type="text"
                                value={msfCommand}
                                onChange={(e) => setMsfCommand(e.target.value)}
                                onKeyDown={handleMsfCommand}
                                className="bg-transparent border-none outline-none text-[#00FF00] w-full caret-[#00FF00]"
                                placeholder="type exploit command (e.g. 'exploit')..."
                                autoFocus
                              />
                            </div>
                          )}
                          <span className="inline-block w-2 h-4 bg-[#00FF00] animate-pulse ml-1" />
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-10 text-center relative z-10">
                          <Terminal size={80} strokeWidth={1} className="mb-8" />
                          <p className="uppercase tracking-[0.5em] text-[10px]">Awaiting Uplink Initialization</p>
                        </div>
                      )}
                    </div>

                    <AnimatePresence>
                      {scanResult && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-6 bg-[#0A0A0A]/50 border-t border-[#00FF00]/10"
                        >
                          <button 
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="w-full py-4 cyber-panel border-[#00FF00]/30 hover:border-[#00FF00] text-[#00FF00] text-[10px] uppercase tracking-[0.3em] font-bold transition-all flex items-center justify-center gap-3 relative overflow-hidden group/ai"
                          >
                            <div className="absolute inset-0 bg-[#00FF00]/5 -translate-y-full group-hover/ai:translate-y-0 transition-transform" />
                            {isAnalyzing ? <RotateCcw className="animate-spin" size={14} /> : <Cpu size={14} />}
                            <span className="relative font-display">{isAnalyzing ? 'Processing Intelligence...' : 'Request AI Intelligence Audit'}</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {aiAnalysis && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="cyber-panel p-12 relative group"
                    >
                      <div className="absolute top-0 right-10 -translate-y-1/2 flex items-center gap-2">
                        <div className="px-5 py-2 bg-[#00FF00] text-[#0A0A0A] text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 skew-x-[-15deg]">
                          <Lock size={12} /> <span className="skew-x-[15deg]">Intelligence Audit</span>
                        </div>
                      </div>
                      <div className="prose prose-invert max-w-none relative z-10 markdown-body">
                        <Markdown remarkPlugins={[remarkGfm]}>{aiAnalysis}</Markdown>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'docs' && (
            <motion.div 
              key="docs"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="p-16 max-w-5xl mx-auto"
            >
              <header className="mb-16 flex flex-col md:flex-row md:justify-between md:items-end gap-8 relative">
                <div className="absolute -left-10 top-0 w-1 h-full bg-[#00FF00]/20" />
                <div>
                  <h2 className="text-6xl font-display font-bold text-[#00FF00] tracking-tighter uppercase mb-4">Security Protocol</h2>
                  <p className="text-xs text-[#00FF00]/40 font-mono flex items-center gap-2">
                    <Lock size={12} /> CLASSIFIED // CEH_v13_REV_03
                  </p>
                </div>
                <button 
                  onClick={() => {
                    const blob = new Blob([MODULE_3_DOCS], { type: 'text/plain;charset=utf-8' });
                    saveAs(blob, 'CEHv13_Module03_LabManual.txt');
                  }}
                  className="px-8 py-3 cyber-panel hover:border-[#00FF00] text-[#00FF00] text-[10px] uppercase tracking-widest font-bold transition-all relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-[#00FF00]/5 translate-y-full group-hover:translate-y-0 transition-transform" />
                  <span className="relative flex items-center gap-2">
                    <Download size={14} /> Local Repository Fetch
                  </span>
                </button>
              </header>
              <div className="cyber-panel p-16 bg-[#020202] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00FF00]/[0.02] -mr-32 -mt-32 rounded-full blur-3xl opacity-50" />
                <div className="markdown-body relative z-10">
                  <Markdown remarkPlugins={[remarkGfm]}>{MODULE_3_DOCS}</Markdown>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div 
              key="ai"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-12 max-w-6xl mx-auto h-full flex flex-col"
            >
              <header className="mb-12 flex items-center gap-10">
                <div className="w-20 h-20 cyber-panel flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-[#00FF00]/10 animate-pulse" />
                  <Cpu size={40} className="text-[#00FF00] relative z-10" />
                </div>
                <div>
                  <h2 className="text-5xl font-display font-bold text-[#00FF00] tracking-tighter uppercase">Mentor Neural Link</h2>
                  <p className="text-xs text-[#00FF00]/40 mt-2 font-mono flex items-center gap-2">
                    <Activity size={12} /> SYNC_STATE: STABLE // ENCRYPTED_UPLINK
                  </p>
                </div>
              </header>

              <div className="flex-1 cyber-panel bg-[#020202] mb-8 p-10 flex flex-col overflow-hidden relative">
                <div className="flex-1 overflow-y-auto space-y-10 pr-6 custom-scrollbar relative z-10">
                  {chatHistory.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 text-center">
                      <MessageSquare size={100} strokeWidth={1} className="mb-8" />
                      <p className="uppercase tracking-[0.5em] text-[10px] max-w-xs">Establishing communications with security advisor...</p>
                    </div>
                  )}
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={cn(
                      "flex gap-6",
                      msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                    )}>
                      <div className={cn(
                        "w-10 h-10 rounded-xs flex items-center justify-center flex-shrink-0 text-[10px] font-mono",
                        msg.role === 'user' ? "bg-[#00FF00] text-[#0A0A0A]" : "bg-[#1A1A1A] text-[#00FF00]/60 border border-[#00FF00]/10"
                      )}>
                        {msg.role === 'user' ? 'STU' : 'AI'}
                      </div>
                      <div className={cn(
                        "max-w-[75%] space-y-2",
                        msg.role === 'user' ? "text-right" : "text-left"
                      )}>
                        <div className={cn(
                          "p-6 rounded-xs text-sm leading-relaxed relative overflow-hidden",
                          msg.role === 'user' ? "bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30" : "bg-[#111111] border border-[#00FF00]/10 text-[#E0E0E0]"
                        )}>
                          {msg.role === 'ai' ? (
                            <div className="markdown-body prose prose-invert prose-sm max-w-none">
                              <Markdown remarkPlugins={[remarkGfm]}>{msg.text}</Markdown>
                            </div>
                          ) : msg.text}
                          <div className={cn(
                            "absolute bottom-0 w-8 h-[1px]",
                            msg.role === 'user' ? "right-0 bg-[#00FF00]/40" : "left-0 bg-[#00FF00]/40"
                          )} />
                        </div>
                        <span className="block text-[8px] uppercase tracking-[0.3em] font-mono opacity-30">
                          {msg.role === 'user' ? 'STUDENT_01' : 'MENTOR_AGENT'} // 07:55:49
                        </span>
                      </div>
                    </div>
                  ))}
                  {isChatting && (
                    <div className="flex gap-6">
                      <div className="w-10 h-10 bg-[#1A1A1A] text-[#00FF00]/60 border border-[#00FF00]/10 flex items-center justify-center flex-shrink-0 animate-pulse">
                        AI
                      </div>
                      <div className="bg-[#111111]/40 border border-[#00FF00]/10 p-4 rounded-xs text-[10px] font-mono text-[#00FF00]/40 flex items-center gap-3 italic">
                        <RotateCcw className="animate-spin" size={12} />
                        Synthesizing intelligence...
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleChat} className="relative group">
                <div className="absolute -inset-1 bg-[#00FF00]/10 rounded-xs blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Query mentor about network vectors..."
                  className="relative w-full bg-[#050505] border border-[#00FF00]/20 p-6 pr-20 rounded-xs focus:outline-none focus:border-[#00FF00] transition-all text-sm font-mono text-[#E0E0E0] placeholder:text-[#E0E0E0]/10"
                />
                <button 
                  type="submit"
                  disabled={isChatting || !chatInput.trim()}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-[#00FF00] hover:scale-110 transition-all disabled:opacity-20"
                >
                  <ChevronRight size={32} strokeWidth={1.5} />
                </button>
                <div className="absolute bottom-2 right-12 text-[8px] font-mono opacity-20 uppercase tracking-widest">
                  CMD_SUBMIT [ENTER]
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'tools' && (
            <motion.div 
              key="tools"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-16 max-w-[1700px] mx-auto"
            >
              <header className="mb-20 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-3 px-4 py-1 border border-[#00FF00]/20 rounded-full text-[9px] font-mono text-[#00FF00]/60 uppercase tracking-[0.4em] mb-6">
                  <Database size={10} /> Arsenal Database
                </div>
                <h2 className="text-7xl font-display font-bold text-[#00FF00] tracking-tighter uppercase glitch-text">Tactical Toolkit</h2>
                <p className="text-sm text-[#00FF00]/40 mt-4 font-mono max-w-2xl uppercase tracking-widest leading-loose">
                  Verified CLI instrumentation for perimeter breaches and node discovery.
                </p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                {TOOLS.map((tool, i) => (
                  <motion.div 
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="cyber-panel p-10 group relative h-full flex flex-col"
                  >
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00FF00]/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                    
                    <div className="flex justify-between items-start mb-10">
                      <div className="text-[9px] uppercase tracking-[0.4em] text-[#00FF00]/40 font-mono px-3 py-1 bg-[#00FF00]/5 border border-[#00FF00]/10 rounded-full">
                        {tool.category}
                      </div>
                      <div className="w-10 h-10 border border-[#00FF00]/10 rounded flex items-center justify-center text-[#00FF00]/20 group-hover:text-[#00FF00] transition-colors">
                        <Terminal size={20} strokeWidth={1} />
                      </div>
                    </div>

                    <h3 className="text-3xl font-display font-bold text-[#00FF00] mb-6 tracking-tight uppercase group-hover:tracking-wider transition-all">{tool.name}</h3>
                    <p className="text-xs text-[#E0E0E0]/50 leading-loose mb-10 font-sans flex-1">
                      {tool.description}
                    </p>

                    <button 
                      onClick={() => {
                        setSelectedTool(tool);
                        setActiveTab('terminal');
                      }}
                      className="w-full py-4 border border-[#00FF00]/30 text-[#00FF00] text-[10px] font-bold uppercase tracking-[0.4em] group-hover:bg-[#00FF00] group-hover:text-[#0A0A0A] transition-all flex items-center justify-center gap-3 overflow-hidden relative"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      <span className="relative flex items-center gap-2">
                        EQUIP TOOL <ChevronRight size={12} />
                      </span>
                    </button>
                    
                    <div className="mt-6 flex justify-between items-center opacity-10 font-mono text-[8px] uppercase tracking-widest">
                      <span>DOC_LOAD: OK</span>
                      <span>HASH: {tool.id.substring(0,6).toUpperCase()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <section className="mt-32 cyber-panel bg-gradient-to-r from-[#00FF00]/10 to-transparent p-16 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#00FF00] animate-pulse" />
                <div className="flex flex-col lg:flex-row gap-12 items-center relative z-10">
                  <div className="w-24 h-24 cyber-panel border-[#00FF00]/40 flex items-center justify-center flex-shrink-0 animate-spin-slow">
                    <Shield className="text-[#00FF00]" size={40} />
                  </div>
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <Lock className="text-[#00FF00]/60" size={16} />
                      <h3 className="text-3xl font-display font-bold text-[#00FF00] tracking-tighter uppercase">Academic Verification Node</h3>
                    </div>
                    <p className="text-sm text-[#E0E0E0]/70 leading-loose max-w-4xl font-sans uppercase tracking-widest text-[11px]">
                      The instrumentation listed above integrates core pedagogy for **Certified Ethical Hacker (CEH) v13**. These modules are deployed in high-security validation labs including **OSCP**, **GPEN**, and CISSP-P practical frameworks. Academic integrity maintained by leading global cybersecurity research institutions.
                    </p>
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#050505] border border-[#00FF00]/20 max-w-lg w-full relative cyber-panel overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00FF00] to-transparent opacity-50" />
              
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-[#00FF00] tracking-tighter uppercase flex items-center gap-3">
                      <Key size={20} /> AI Core Configuration
                    </h2>
                    <p className="text-[#00FF00]/50 font-mono text-[10px] uppercase mt-2">Bring Your Own Key (BYOK) - Client Side Storage</p>
                  </div>
                  <button onClick={() => setIsSettingsOpen(false)} className="text-[#00FF00]/50 hover:text-[#00FF00] transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="p-4 border border-yellow-500/20 bg-yellow-500/5 rounded-xs">
                    <p className="text-yellow-500/80 text-xs flex flex-col gap-3">
                      <span className="flex items-start gap-3">
                        <Info size={16} className="shrink-0 mt-0.5" />
                        To enable the AI Cyber Mentor and automated intelligence reports, please provide your own Google Gemini API key. Your key is securely stored in your browser's local storage and is never transmitted anywhere except directly to Google's API.
                      </span>
                      <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-[#00FF00] hover:underline font-bold"
                      >
                        <Globe size={14} /> Get your API Key from Google AI Studio
                      </a>
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-[#00FF00]/80 uppercase mb-2">Gemini API Key</label>
                    <input 
                      type="password"
                      placeholder="AIzaSy..."
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      className="w-full bg-[#020202] border border-[#00FF00]/20 px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#00FF00]/60 text-[#00FF00] placeholder:text-[#00FF00]/20"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-[#00FF00]/10">
                    <button 
                      onClick={() => setIsSettingsOpen(false)}
                      className="px-6 py-2 text-[10px] font-mono uppercase tracking-widest text-[#00FF00]/50 hover:text-[#00FF00]"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => saveApiKey(geminiApiKey)}
                      className="px-6 py-2 bg-[#00FF00]/10 hover:bg-[#00FF00]/20 border border-[#00FF00]/40 text-[#00FF00] text-[10px] font-mono uppercase tracking-widest transition-colors flex items-center gap-2"
                    >
                      <Check size={14} /> Update Core
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NetworkVisuals({ ports, target, onExploit }: { ports: PortData[], target: string, onExploit: (p: PortData) => void }) {
  const data = ports.map(p => ({
    port: p.port,
    service: p.service,
    severity: p.vulnerability ? (p.vulnerability.severity === 'Critical' ? 100 : p.vulnerability.severity === 'High' ? 75 : 50) : 10,
    isVuln: !!p.vulnerability
  }));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-panel p-8 space-y-8 bg-[#020202]"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-display font-bold text-[#00FF00] uppercase tracking-tighter">Vector Analysis Map</h3>
        <span className="text-[10px] font-mono opacity-40 uppercase tracking-widest">NETWORK_SNAPSHOT // {target}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-12 h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#111" vertical={false} />
              <XAxis dataKey="port" stroke="#00FF0033" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#050505', border: '1px solid #00FF0022', borderRadius: '2px' }}
                itemStyle={{ color: '#00FF00', fontSize: '10px' }}
                cursor={{ fill: '#00FF0005' }}
              />
              <Bar dataKey="severity" radius={[2, 2, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isVuln ? '#00FF00' : '#00FF0011'} 
                    className={entry.isVuln ? 'animate-pulse' : ''}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ports.filter(p => p.vulnerability).map(p => (
            <div key={p.port} className="p-5 border border-[#00FF00]/10 bg-[#00FF00]/[0.02] rounded-xs flex flex-col gap-3 group/node">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono text-[#00FF00]/60">{p.vulnerability?.id}</span>
                <span className={cn(
                  "px-2 py-0.5 text-[#0A0A0A] text-[8px] font-bold uppercase rounded-xs",
                  p.vulnerability?.severity === 'Critical' ? 'bg-red-500' : 'bg-[#00FF00]'
                )}>
                  {p.vulnerability?.severity}
                </span>
              </div>
              <div>
                <div className="text-sm font-display font-bold uppercase tracking-tight text-[#00FF00]">{p.vulnerability?.name}</div>
                <div className="text-[10px] text-[#E0E0E0]/40 font-mono mt-1">NODE: {p.port}/{p.protocol} ({p.service})</div>
              </div>
              <button 
                className="mt-2 py-3 w-full bg-[#00FF00]/5 border border-[#00FF00]/20 text-[#00FF00] text-[9px] font-bold uppercase tracking-[0.3em] hover:bg-[#00FF00] hover:text-[#0A0A0A] transition-all flex items-center justify-center gap-2"
                onClick={() => onExploit(p)}
              >
                <Play size={10} /> Exploit Sequence
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-5 px-6 py-4 transition-all relative group overflow-hidden rounded-xs",
        active 
          ? "text-[#00FF00] bg-[#00FF00]/5" 
          : "text-[#E0E0E0]/30 hover:text-[#E0E0E0] hover:bg-white/[0.02]"
      )}
    >
      {active && (
        <motion.div 
          layoutId="sidebar-active-pill"
          className="absolute left-0 w-[3px] h-3/5 bg-[#00FF00] rounded-r-full"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <div className={cn(
        "transition-transform group-hover:scale-110",
        active ? "text-[#00FF00]" : "opacity-40"
      )}>
        {icon}
      </div>
      <span className="uppercase tracking-[0.3em] text-[9px] font-mono flex-1 text-left">{label}</span>
      <div className={cn(
        "w-1 h-1 rounded-full transition-opacity duration-500",
        active ? "bg-[#00FF00] opacity-100" : "bg-white/10 opacity-0 group-hover:opacity-100"
      )} />
    </button>
  );
}
