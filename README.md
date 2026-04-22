# 🔥 RedSnow Reconnaissance & OSINT Toolkit

> An advanced browser-based reconnaissance and OSINT simulation environment for Cybersecurity Researchers. Features interactive threat analysis, simulated network probes, and an AI-powered Cyber Mentor.

🌐 **Live Demo:** [https://red-snow.github.io/redsnow-recon-toolkit/](https://red-snow.github.io/redsnow-recon-toolkit/)

<br>

<div align="center">
  <img src="screenshot1.png" alt="Security Terminal & Operations Center" width="100%">
  <br>
  <em>Security Terminal & Operations Center</em>
</div>

<br>

<div align="center">
  <img src="screenshot2.png" alt="Vector Analysis Map & Exploit Sequences" width="100%">
  <br>
  <em>Vector Analysis Map & Exploit Sequences</em>
</div>

<br>

## 📖 Overview

The **RedSnow Reconnaissance & OSINT Toolkit** is a sleek, unified, browser-based simulation environment crafted for execution and visualization of network attacks, intelligence gathering, and infrastructure topography. Originally conceptualized as an advanced CEH (Certified Ethical Hacker) Lab, this terminal empowers researchers to run multi-vector probes, analyze vulnerabilities, generate expert tactical intel reports, and perform highly-targeted Open Source Intelligence (OSINT).

Built with an ultra-responsive dark-mode interface, it replicates authentic terminal latency, interactive exploitation (Metasploit), and live topological data parsing logic. This project utilizes a "Bring Your Own Key" (BYOK) architecture to securely integrate with the Google Gemini API for threat analysis directly on the client-side.

## 🚀 Key Features

### 🛡️ 1. Multi-Vector Security Terminal
Deploy simulated probes across various protocols to identify host vulnerabilities and service signatures. Includes rich interactive simulations of the industry's top scanning tools.
- **Nmap**: Port scanning, OS fingerprinting, and NSE vulnerability scanning checks.
- **Hping3**: Custom TCP/IP packet crafting & firewall/IDS evasion testing.
- **Masscan**: Large-scale asynchronous TCP port scanner simulation.
- **Netdiscover**: Active/passive ARP reconnaissance mapping.
- **Metasploit Interactive (`msfconsole`)**: Fully simulated exploitation shell. Interact directly with targeted nodes using commands like `use`, `set RHOSTS`, and `exploit`.

### 🌐 2. Advanced OSINT & Infrastructure Topography
Gather comprehensive open-source intelligence directly from the Operations Center.
- **TheHarvester**: Simulates footprinting of emails, subdomains, and hosts.
- **Amass**: Attack surface mapping, FQDN resolution, and ASNs.
- **WafW00f**: Detects and fingerprints Cloudflare and Web Application Firewalls (WAF).
- **WhatWeb**: Deep host enumeration, tech stack profiling, and CMS detection.
- **GeoIP Lookup**: Topology tracing, determining exact GEO coordinates and ISP logic.
- **LBD (Load Balancer Detector)**: DNS & HTTP Load-Balancing recognition.
- **Whois & Dig**: Direct domain profiling and automated DNS interrogations (MX, TXT, A records).

### 📊 3. Visual Vector Analysis
Visualizes network vulnerabilities with live React-rendered charts.
- **Port Profiling Map**: Generates charts representing exposed ports.
- **Severity Badge Injection**: Translates vulnerabilities directly to critical/high/medium badges.
- **Exploit Launching**: Directly transition from the visual analysis interface to a reverse shell sequence. 

### 📑 4. "Authorized Eyes Only" Intelligence Reports
One-click generation of professional PDF reports.
- Aggregates multi-pass scan history.
- Includes simulated AI-derived intelligence analysis block.
- Generates a fully paginated, heavily styled tactical Mission Report ready for professional delivery.

### 🤖 5. Embedded AI Cyber Mentor
Ask standard hacking and network vulnerability questions to the built-in AI interface powered by Google Gemini, ensuring in-lab tactical guidance.

## 🛠️ Technology Stack
- **Frontend Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS (Custom Dark/Neon-Green Cyber Theme)
- **Animations:** Motion (Framer Motion)
- **Charts:** Recharts
- **PDF Generation:** jsPDF
- **AI Integration:** `@google/genai` (For analysis & chatbot features)
- **Markdown Handling:** `react-markdown` + `remark-gfm`

## ⚙️ Local Development Setup

To run this platform locally via Vite:

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd redsnow-recon-toolkit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file at the root level and add your Gemini API Key if you wish to use the AI capabilities:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Navigate to `localhost:3000` to launch the terminal.

## 👤 Author 
- **Lead Researcher:** Red_Snow (CEH v13)
- **Clearance Level:** LEVEL_4_PRO

---
*Disclaimer: This platform is a sophisticated visual front-end and simulator designed for authorized educational environments and research training. It does not blindly execute destructive network commands natively out of the box against external targets.*
