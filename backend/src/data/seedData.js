import bcrypt from 'bcryptjs';

const hashPassword = (password) => bcrypt.hashSync(password, 10);

export const getInitialData = () => {
  const now = new Date();
  
  // Time helper offsets
  const hoursAgo = (h) => new Date(now.getTime() - h * 3600 * 1000).toISOString();
  const hoursAhead = (h) => new Date(now.getTime() + h * 3600 * 1000).toISOString();
  const daysAgo = (d) => new Date(now.getTime() - d * 86400 * 1000).toISOString();
  const daysAhead = (d) => new Date(now.getTime() + d * 86400 * 1000).toISOString();

  const departments = [
    { id: 'dept-1', name: 'IT Hardware & Facilities', code: 'HW-FAC', description: 'Hardware diagnostics, repairs, and classroom facilities' },
    { id: 'dept-2', name: 'Enterprise Software Support', code: 'SW-SUP', description: 'ERP, OS, licenses, developer tools and cloud access' },
    { id: 'dept-3', name: 'Campus Network & Infrastructure', code: 'NET-INF', description: 'Wi-Fi, switches, routers, VPN and firewall management' },
    { id: 'dept-4', name: 'IT Assets & Procurement', code: 'AST-PRO', description: 'Asset allocation, auditing, procurement and disposal' },
    { id: 'dept-5', name: 'Information Science & Engineering', code: 'DEPT-ISE', description: 'Academic department of Information Science' }
  ];

  const defaultPassword = hashPassword('password123');

  const users = [
    {
      id: 'usr-admin',
      name: 'Mrs. Poornima GJ (Admin)',
      email: 'admin@bmsit.ac.in',
      password: defaultPassword,
      role: 'admin',
      department: 'IT Assets & Procurement',
      phone: '+91 98450 11001',
      employeeId: 'EMP-ADM-01',
      createdAt: daysAgo(30)
    },
    {
      id: 'usr-supervisor',
      name: 'Puneethgouda Patil (Supervisor)',
      email: 'supervisor@bmsit.ac.in',
      password: defaultPassword,
      role: 'supervisor',
      department: 'IT Hardware & Facilities',
      phone: '+91 98450 11002',
      employeeId: 'EMP-SUP-02',
      createdAt: daysAgo(30)
    },
    {
      id: 'usr-agent-sw',
      name: 'Pracheth Kashyap (Software Agent)',
      email: 'agent@bmsit.ac.in',
      password: defaultPassword,
      role: 'agent',
      department: 'Enterprise Software Support',
      phone: '+91 98450 11003',
      employeeId: 'EMP-AGT-03',
      createdAt: daysAgo(30)
    },
    {
      id: 'usr-agent-hw',
      name: 'Pranab Bhardwaj (Hardware Agent)',
      email: 'hardware.agent@bmsit.ac.in',
      password: defaultPassword,
      role: 'agent',
      department: 'IT Hardware & Facilities',
      phone: '+91 98450 11004',
      employeeId: 'EMP-AGT-04',
      createdAt: daysAgo(30)
    },
    {
      id: 'usr-employee',
      name: 'Pavan R Bhat (Student/Employee)',
      email: 'employee@bmsit.ac.in',
      password: defaultPassword,
      role: 'employee',
      department: 'Information Science & Engineering',
      phone: '+91 98450 11005',
      employeeId: '1BY23IS145',
      createdAt: daysAgo(30)
    }
  ];

  const assets = [
    {
      id: 'ast-101',
      assetTag: 'BMSIT-LAP-042',
      name: 'Dell Latitude 5440 i7',
      category: 'Laptop',
      serialNumber: 'DL5440-98834-IN',
      model: 'Latitude 5440 (16GB RAM, 512GB NVMe)',
      vendor: 'Dell Enterprise Direct',
      purchaseDate: daysAgo(180),
      warrantyExpiryDate: daysAhead(540),
      status: 'assigned',
      assignedToId: 'usr-employee',
      assignedToName: 'Pavan R Bhat',
      department: 'Information Science & Engineering',
      location: 'ISE Dept - Lab 3 Workstation 12',
      ipAddress: '192.168.10.42',
      macAddress: '00:1A:2B:3C:4D:5E',
      maintenanceHistory: [
        {
          id: 'mnt-1',
          date: daysAgo(45),
          serviceType: 'RAM Upgrade',
          technician: 'Pranab Bhardwaj',
          notes: 'Upgraded from 8GB to 16GB for AI modeling practicals.',
          cost: 3500
        }
      ],
      createdAt: daysAgo(180)
    },
    {
      id: 'ast-102',
      assetTag: 'BMSIT-PRJ-015',
      name: 'Epson EB-2250U 3LCD Projector',
      category: 'Peripheral',
      serialNumber: 'EP2250-48291-KA',
      model: 'EB-2250U Full HD 5000 Lumens',
      vendor: 'Epson Commercial India',
      purchaseDate: daysAgo(360),
      warrantyExpiryDate: daysAhead(180),
      status: 'assigned',
      assignedToId: 'usr-admin',
      assignedToName: 'Mrs. Poornima GJ',
      department: 'Information Science & Engineering',
      location: 'Seminar Hall 204',
      maintenanceHistory: [
        {
          id: 'mnt-2',
          date: daysAgo(20),
          serviceType: 'Lamp Replacement & Lens Cleaning',
          technician: 'Pranab Bhardwaj',
          notes: 'Replaced projection lamp module after 2500 operating hours.',
          cost: 8200
        }
      ],
      createdAt: daysAgo(360)
    },
    {
      id: 'ast-103',
      assetTag: 'BMSIT-SW-008',
      name: 'Cisco Catalyst 2960-X Gigabit Switch',
      category: 'Network',
      serialNumber: 'CS2960X-77123',
      model: 'WS-C2960X-48FPS-L (48 PoE+ ports)',
      vendor: 'Cisco Networking Systems',
      purchaseDate: daysAgo(600),
      warrantyExpiryDate: daysAhead(120),
      status: 'assigned',
      assignedToId: 'usr-supervisor',
      assignedToName: 'Puneethgouda Patil',
      department: 'Campus Network & Infrastructure',
      location: 'Rack B, Central Server Room',
      ipAddress: '192.168.1.10',
      maintenanceHistory: [],
      createdAt: daysAgo(600)
    },
    {
      id: 'ast-104',
      assetTag: 'BMSIT-WS-022',
      name: 'HP Z4 G4 Workstation (NVIDIA RTX A4000)',
      category: 'Desktop',
      serialNumber: 'HPZ4-33291-BLR',
      model: 'Z4 G4 Xeon W-2245, 64GB DDR4, RTX A4000 16GB',
      vendor: 'HP Enterprise Store',
      purchaseDate: daysAgo(240),
      warrantyExpiryDate: daysAhead(480),
      status: 'in_stock',
      assignedToId: null,
      assignedToName: null,
      department: 'IT Hardware & Facilities',
      location: 'Hardware Inventory Room 102',
      maintenanceHistory: [],
      createdAt: daysAgo(240)
    },
    {
      id: 'ast-105',
      assetTag: 'BMSIT-SVR-003',
      name: 'PowerEdge R750 Rack Server',
      category: 'Server',
      serialNumber: 'PER750-99412-SRV',
      model: 'Dell PowerEdge R750 (2x Intel Xeon Gold, 128GB)',
      vendor: 'Dell Enterprise Direct',
      purchaseDate: daysAgo(400),
      warrantyExpiryDate: daysAhead(700),
      status: 'assigned',
      assignedToId: 'usr-admin',
      assignedToName: 'System Core Infrastructure',
      department: 'Campus Network & Infrastructure',
      location: 'Data Center Rack 01',
      ipAddress: '192.168.1.5',
      maintenanceHistory: [
        {
          id: 'mnt-3',
          date: daysAgo(10),
          serviceType: 'RAID Controller Firmware Patch',
          technician: 'Puneethgouda Patil',
          notes: 'Upgraded PERC H755 firmware to v52.16.1.',
          cost: 0
        }
      ],
      createdAt: daysAgo(400)
    },
    {
      id: 'ast-106',
      assetTag: 'BMSIT-LAP-077',
      name: 'Lenovo ThinkPad E14 Gen 4',
      category: 'Laptop',
      serialNumber: 'LNTP-55219-IN',
      model: 'ThinkPad E14 Ryzen 7 (16GB RAM, 512GB SSD)',
      vendor: 'Lenovo Commercial',
      purchaseDate: daysAgo(90),
      warrantyExpiryDate: daysAhead(640),
      status: 'under_maintenance',
      assignedToId: null,
      assignedToName: null,
      department: 'IT Hardware & Facilities',
      location: 'Repair Bench Lab 2',
      maintenanceHistory: [
        {
          id: 'mnt-4',
          date: daysAgo(2),
          serviceType: 'Display Backlight Diagnosis',
          technician: 'Pranab Bhardwaj',
          notes: 'Flickering panel reported. Awaiting replacement LCD cable from OEM.',
          cost: 1800
        }
      ],
      createdAt: daysAgo(90)
    }
  ];

  const tickets = [
    {
      id: 'tkt-001',
      ticketNumber: 'TKT-2026-001',
      title: 'Lab 3 Dell Workstation failing to boot (Kernel Panic)',
      description: 'The workstation in ISE Lab 3 halts during boot with a storage I/O read error. Multiple students need this machine for project simulations.',
      category: 'hardware',
      priority: 'urgent',
      status: 'in_progress',
      department: 'IT Hardware & Facilities',
      assignedAgentId: 'usr-agent-hw',
      assignedAgentName: 'Pranab Bhardwaj',
      createdById: 'usr-employee',
      createdByName: 'Pavan R Bhat',
      createdByEmail: 'employee@bmsit.ac.in',
      relatedAssetId: 'ast-101',
      relatedAssetTag: 'BMSIT-LAP-042',
      slaHours: 12,
      createdAt: hoursAgo(5),
      slaDeadline: hoursAhead(7),
      isBreached: false,
      isWarning: false,
      isEscalated: false,
      escalatedAt: null,
      escalatedToSupervisor: false,
      resolutionNotes: '',
      history: [
        { action: 'Ticket Created', by: 'Pavan R Bhat', timestamp: hoursAgo(5) },
        { action: 'Auto-routed to IT Hardware & Facilities', by: 'System SLA & Routing Engine', timestamp: hoursAgo(5) },
        { action: 'Assigned to Pranab Bhardwaj', by: 'System SLA & Routing Engine', timestamp: hoursAgo(5) }
      ]
    },
    {
      id: 'tkt-002',
      ticketNumber: 'TKT-2026-002',
      title: 'CRITICAL: Core Switch Port flap causing campus Wi-Fi outage',
      description: 'The Cisco Catalyst 2960 switch in Building B is flapping ports 12-24, knocking offline all Wi-Fi access points for the 2nd and 3rd floors.',
      category: 'network',
      priority: 'critical',
      status: 'escalated',
      department: 'Campus Network & Infrastructure',
      assignedAgentId: 'usr-supervisor',
      assignedAgentName: 'Puneethgouda Patil (Supervisor)',
      createdById: 'usr-employee',
      createdByName: 'Pavan R Bhat',
      createdByEmail: 'employee@bmsit.ac.in',
      relatedAssetId: 'ast-103',
      relatedAssetTag: 'BMSIT-SW-008',
      slaHours: 4,
      createdAt: hoursAgo(5.5),
      slaDeadline: hoursAgo(1.5), // SLA exceeded 1.5 hours ago!
      isBreached: true,
      isWarning: true,
      isEscalated: true,
      escalatedAt: hoursAgo(1.5),
      escalatedToSupervisor: true,
      resolutionNotes: 'Supervisor stepped in due to SLA breach. Initiating VLAN reboot and physical cable loop inspection.',
      history: [
        { action: 'Ticket Created with CRITICAL priority', by: 'Pavan R Bhat', timestamp: hoursAgo(5.5) },
        { action: 'Auto-assigned to Campus Network & Infrastructure', by: 'System Routing Engine', timestamp: hoursAgo(5.5) },
        { action: 'SLA 75% Warning Threshold Reached (1 hr remaining)', by: 'SLA Engine', timestamp: hoursAgo(2.5) },
        { action: 'SLA BREACH DETECTED (Exceeded 4.0 hrs)', by: 'SLA Engine', timestamp: hoursAgo(1.5) },
        { action: 'AUTO-ESCALATED TO SUPERVISOR & Re-prioritized to Top of Queue (FR-6)', by: 'SLA Escalation Engine', timestamp: hoursAgo(1.5) }
      ]
    },
    {
      id: 'tkt-003',
      ticketNumber: 'TKT-2026-003',
      title: 'Request MATLAB & JetBrains Enterprise License activation',
      description: 'Need activation keys for MATLAB Deep Learning Toolbox and IntelliJ IDEA Ultimate for the BCS703B course laboratory assignments.',
      category: 'software',
      priority: 'routine',
      status: 'open',
      department: 'Enterprise Software Support',
      assignedAgentId: 'usr-agent-sw',
      assignedAgentName: 'Pracheth Kashyap',
      createdById: 'usr-employee',
      createdByName: 'Pavan R Bhat',
      createdByEmail: 'employee@bmsit.ac.in',
      relatedAssetId: null,
      relatedAssetTag: null,
      slaHours: 48,
      createdAt: hoursAgo(12),
      slaDeadline: hoursAhead(36),
      isBreached: false,
      isWarning: false,
      isEscalated: false,
      escalatedAt: null,
      escalatedToSupervisor: false,
      resolutionNotes: '',
      history: [
        { action: 'Ticket Created', by: 'Pavan R Bhat', timestamp: hoursAgo(12) },
        { action: 'Auto-routed to Enterprise Software Support', by: 'System Routing Engine', timestamp: hoursAgo(12) },
        { action: 'Assigned to Pracheth Kashyap', by: 'System Routing Engine', timestamp: hoursAgo(12) }
      ]
    },
    {
      id: 'tkt-004',
      ticketNumber: 'TKT-2026-004',
      title: 'Seminar Hall 204 Projector HDMI handshake failure',
      description: 'Epson Projector displays "No Signal" intermittent sync over HDMI wall plate when presenting from student laptops.',
      category: 'hardware',
      priority: 'urgent',
      status: 'resolved',
      department: 'IT Hardware & Facilities',
      assignedAgentId: 'usr-agent-hw',
      assignedAgentName: 'Pranab Bhardwaj',
      createdById: 'usr-admin',
      createdByName: 'Mrs. Poornima GJ',
      createdByEmail: 'admin@bmsit.ac.in',
      relatedAssetId: 'ast-102',
      relatedAssetTag: 'BMSIT-PRJ-015',
      slaHours: 12,
      createdAt: daysAgo(2),
      slaDeadline: daysAgo(1.5),
      isBreached: false,
      isWarning: false,
      isEscalated: false,
      escalatedAt: null,
      escalatedToSupervisor: false,
      resolvedAt: daysAgo(1.7),
      resolutionNotes: 'Replaced faulty 15m high-speed HDMI patch cable inside podium cable conduit. Tested with 3 different laptops at 1080p 60Hz. Resolution verified.',
      history: [
        { action: 'Ticket Created', by: 'Mrs. Poornima GJ', timestamp: daysAgo(2) },
        { action: 'Assigned to Pranab Bhardwaj', by: 'System Routing Engine', timestamp: daysAgo(2) },
        { action: 'Status changed to In Progress', by: 'Pranab Bhardwaj', timestamp: daysAgo(1.9) },
        { action: 'Ticket Resolved within SLA (Duration: 7.2 hrs)', by: 'Pranab Bhardwaj', timestamp: daysAgo(1.7) }
      ]
    },
    {
      id: 'tkt-005',
      ticketNumber: 'TKT-2026-005',
      title: 'New Asset Request: High-RAM Workstation for AI Capstone',
      description: 'Requesting allocation of an HP Z4 Workstation or high-memory desktop to run large language model fine-tuning experiments for department project.',
      category: 'new_asset',
      priority: 'routine',
      status: 'open',
      department: 'IT Assets & Procurement',
      assignedAgentId: 'usr-admin',
      assignedAgentName: 'Mrs. Poornima GJ (Admin)',
      createdById: 'usr-employee',
      createdByName: 'Pavan R Bhat',
      createdByEmail: 'employee@bmsit.ac.in',
      relatedAssetId: 'ast-104',
      relatedAssetTag: 'BMSIT-WS-022',
      slaHours: 48,
      createdAt: hoursAgo(2),
      slaDeadline: hoursAhead(46),
      isBreached: false,
      isWarning: false,
      isEscalated: false,
      escalatedAt: null,
      escalatedToSupervisor: false,
      resolutionNotes: '',
      history: [
        { action: 'Asset Service Request Submitted', by: 'Pavan R Bhat', timestamp: hoursAgo(2) },
        { action: 'Auto-routed to IT Assets & Procurement', by: 'System Routing Engine', timestamp: hoursAgo(2) }
      ]
    }
  ];

  const assetRequests = [
    {
      id: 'req-001',
      requestNumber: 'REQ-2026-001',
      requestedById: 'usr-employee',
      requestedByName: 'Pavan R Bhat',
      department: 'Information Science & Engineering',
      assetType: 'Desktop Workstation',
      priority: 'critical',
      justification: 'Required for running local GPU training clusters for autonomous agent research and BEA mini-project evaluation.',
      status: 'pending',
      reviewedById: null,
      reviewedByName: null,
      reviewedAt: null,
      reviewNotes: '',
      allocatedAssetId: null,
      createdAt: hoursAgo(6)
    },
    {
      id: 'req-002',
      requestNumber: 'REQ-2026-002',
      requestedById: 'usr-agent-sw',
      requestedByName: 'Pracheth Kashyap',
      department: 'Enterprise Software Support',
      assetType: 'External 4K Monitor',
      priority: 'routine',
      justification: 'Multi-screen setup required for monitoring ITSM microservices logs and concurrent debug sessions.',
      status: 'approved',
      reviewedById: 'usr-admin',
      reviewedByName: 'Mrs. Poornima GJ',
      reviewedAt: daysAgo(1),
      reviewNotes: 'Approved. Dispatched Dell 27-inch 4K monitor from central store.',
      allocatedAssetId: 'ast-104',
      createdAt: daysAgo(3)
    }
  ];

  const notifications = [
    {
      id: 'notif-1',
      userId: 'usr-supervisor',
      type: 'sla_breach',
      title: '🚨 SLA Breach Alert: TKT-2026-002 Escalated',
      message: 'Critical Ticket TKT-2026-002 (Campus Wi-Fi Outage) has exceeded its 4-hour SLA threshold and has been escalated to you.',
      ticketId: 'tkt-002',
      read: false,
      createdAt: hoursAgo(1.5)
    },
    {
      id: 'notif-2',
      userId: 'usr-agent-hw',
      type: 'ticket_assigned',
      title: 'New Ticket Auto-Assigned: TKT-2026-001',
      message: 'Urgent ticket for Lab 3 Dell Workstation failing to boot has been auto-assigned to you per category rules.',
      ticketId: 'tkt-001',
      read: true,
      createdAt: hoursAgo(5)
    },
    {
      id: 'notif-3',
      userId: 'usr-employee',
      type: 'ticket_update',
      title: 'Ticket TKT-2026-004 Resolved',
      message: 'Your ticket regarding Seminar Hall Projector HDMI has been resolved by Pranab Bhardwaj.',
      ticketId: 'tkt-004',
      read: true,
      createdAt: daysAgo(1.7)
    },
    {
      id: 'notif-4',
      userId: 'usr-admin',
      type: 'asset_request',
      title: 'New Critical Asset Request REQ-2026-001',
      message: 'Pavan R Bhat submitted a Critical Priority request for a Desktop Workstation requiring your review.',
      requestId: 'req-001',
      read: false,
      createdAt: hoursAgo(6)
    }
  ];

  const auditLogs = [
    {
      id: 'log-1',
      action: 'USER_LOGIN',
      userId: 'usr-admin',
      userName: 'Mrs. Poornima GJ',
      ip: '192.168.1.100',
      details: 'Administrator logged in successfully',
      timestamp: hoursAgo(1)
    },
    {
      id: 'log-2',
      action: 'SLA_AUTO_ESCALATION',
      userId: 'system',
      userName: 'SLA Engine',
      ip: '127.0.0.1',
      details: 'Ticket TKT-2026-002 auto-escalated to supervisor due to SLA breach',
      timestamp: hoursAgo(1.5)
    },
    {
      id: 'log-3',
      action: 'TICKET_AUTO_ROUTED',
      userId: 'system',
      userName: 'Routing Engine',
      ip: '127.0.0.1',
      details: 'Ticket TKT-2026-001 routed to IT Hardware & Facilities based on category hardware',
      timestamp: hoursAgo(5)
    }
  ];

  return { departments, users, assets, tickets, assetRequests, notifications, auditLogs };
};

