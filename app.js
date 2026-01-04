// skill-matrix-v17.js - Complete JavaScript for Sidney Apparels OPS v17

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDocs, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, Timestamp, where } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD-kUUKaIP5h6uXCiSYYCePf0pWmf6QcwY",
    authDomain: "skill-matrix-3be5a.firebaseapp.com",
    projectId: "skill-matrix-3be5a",
    storageBucket: "skill-matrix-3be5a.firebasestorage.app",
    messagingSenderId: "614498722664",
    appId: "1:614498722664:web:e2a602f71b0ecb59c4acdd",
    measurementId: "G-60LG5FH4WB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Application state
let operators = [];
let performanceData = [];
let selectedOperatorId = null;
let lineDetails = JSON.parse(localStorage.getItem('lineDetails')) || {};
let operatorMachineSkills = JSON.parse(localStorage.getItem('operatorMachineSkills')) || {};
let lastAddedOperatorId = null;

// Supervisor mapping
const supervisorMapping = {
    'S-01': 'WASANA-1',
    'S-01A': 'WASANA-2',
    'S-02': 'SOHRAB',
    'S-03': 'SOHEL',
    'S-04': 'AHMAD',
    'S-05': 'OMAR FARUK',
    'S-06': 'SUMI',
    'S-07': 'NAGENDRA',
    'S-07A': 'KAMAL-2',
    'S-08': 'BALISTER',
    'S-09': 'MONJURUL',
    'S-10': 'RAJKUMAR',
    'S-11': 'KAMAL-1',
    'S-12': 'DARMENDRAH',
    'S-13': 'SUMON',
    'S-14': 'SHARIF',
    'S-15': 'MUNSEF',
    'S-16': 'RAHMAN',
    'S-17': 'MASUM',
    'S-18': 'DIANA',
    'S-19': 'ALAMGIR',
    'S-20': 'KAZAL',
    'S-21': 'DEVRAJ',
    'S-22': 'ASHARFUL',
    'S-23': 'RUMA',
    'S-24': 'NASIR',
    'S-25': 'AKBAR',
    'S-26': 'HIMAYAT',
    'S-28': 'ROOP NARAYAN',
    'S-29': 'SUBA',
    'S-30': 'RAJIB',
    'S-31': 'AKASH',
    'S-32': 'KALU CHARAN'
};

// Stopwatch variables
let stopwatchRunning = false;
let stopwatchStartTime = 0;
let stopwatchTotalElapsed = 0;
let lapStartTime = 0;
let lapElapsed = 0;
let lapCounter = 0;
let lapTimes = [];
let stopwatchInterval = null;
let cycleCount = 3;

// Dashboard charts
let efficiencyChart = null;
let linePerformanceChart = null;
let machinePerformanceChart = null;
let skillDistributionChart = null;

// Machine allowance mapping - Updated with all machines (default 7% for all)
const machineAllowances = {
    'FLATLOCK_CYLINDER_BED_FABRIC_CUTTER_MACHINE': 7,
    '5_HEAD_HEAT_TRANSFER_PRESS_MACHINE': 7,
    'AUTO_POCKET_HEM_MACHINE': 7,
    'AUTO_POCKET_WELT_MACHINE': 7,
    'AUTO_RIVET_MACHINE': 7,
    'AUTOMATIC_BELT_LOOP_ATTACH_MACHINE': 7,
    'AUTOMATIC_FLAT_BOTTOM_HEMMING_MACHINES': 7,
    'AUTOMATIC_LABEL_ASSEMBLY_MACHINE': 7,
    'AUTOMATIC_LABEL_FIXING_MACHINE': 7,
    'AUTOMATIC_POCKET_FACING_STITCHING_MACHINE': 7,
    'AUTOMATIC_POCKET_SETTER_MACHINE': 7,
    'AUTOMATIC_STRING_THRUSTING_MACHINE': 7,
    'BARTACKING_MACHINE': 7,
    'BLIND_HEM_MACHINE': 7,
    'BLIND_LOOP_MAKING_MACHINE': 7,
    'BOTTOM_HEM_MACHINE': 7,
    'BUTTON_ATTACH_MACHINE': 7,
    'DOUBLE_NEEDLE_CHAIN_STITCH_MACHINE': 7,
    'DOUBLE_NEEDLE_LOCK_STITCH_MACHINE': 7,
    'DOUBLE_NEEDLE_SPLIT_BAR_MACHINE': 7,
    'EYELET_BUTTONHOLING_MACHINE': 7,
    'FEED_OF_ARM_MACHINE': 7,
    'FLATLOCK_CYLINDER_BED_MACHINE': 7,
    'FLATLOCK_BABY_CYLINDER_BED_MACHINE': 7,
    'FLATLOCK_CYLINDERBED_ELASTIC_ATTACH_MACHINE': 7,
    'FLATLOCK_FLATBED_MACHINE': 7,
    'FLATLOCK_FLATBED_TOP_FEED_MACHINE': 7,
    'FLATSEAMER_MACHINE': 7,
    'HANG_TAG_STRING_INSERTION_MACHINE': 7,
    'HEAT_TRANSFER_PRESS_MACHINE': 7,
    'INSEAM_IRON': 7,
    'IRON_TABLE': 7,
    'MINI_PATTERN_SEAMER_MACHINE': 7,
    'MULTI_NEEDLE_MACHINE': 7,
    'NORMAL_BUTTON_HOLE_MACHINE': 7,
    'OVERLOCK_CUFF_ATTACH_MACHINE': 7,
    'OVERLOCK_CYLINDER_BED_MACHINE': 7,
    'OVERLOCK_MACHINE': 7,
    'OVERLOCK_MACHINE_AND_BACK_LATCH_STITCH': 7,
    'OVERLOCK_NECK_RIB_ATTACH_MACHINE': 7,
    'PATTERN_SEWER_MACHINE': 7,
    'POLO_SHIRT_PLACKET_AUTOMATION_MACHINE': 7,
    'QUILTING_MACHINE': 7,
    'SINGLE_NEEDLE_EDGE_CUTTER_MACHINE': 7,
    'SINGLE_NEEDLE_FEED_MACHINE': 7,
    'SINGLE_NEEDLE_LOCK_STITCH_MACHINE': 7,
    'SNAP_ATTACH_MACHINE': 7,
    'ZIGZAG_STITCH_MACHINE': 7,
    'Others': 7
};

// Complete machine list for dropdowns
const completeMachineList = [
    'FLATLOCK_CYLINDER_BED_FABRIC_CUTTER_MACHINE',
    '5_HEAD_HEAT_TRANSFER_PRESS_MACHINE',
    'AUTO_POCKET_HEM_MACHINE',
    'AUTO_POCKET_WELT_MACHINE',
    'AUTO_RIVET_MACHINE',
    'AUTOMATIC_BELT_LOOP_ATTACH_MACHINE',
    'AUTOMATIC_FLAT_BOTTOM_HEMMING_MACHINES',
    'AUTOMATIC_LABEL_ASSEMBLY_MACHINE',
    'AUTOMATIC_LABEL_FIXING_MACHINE',
    'AUTOMATIC_POCKET_FACING_STITCHING_MACHINE',
    'AUTOMATIC_POCKET_SETTER_MACHINE',
    'AUTOMATIC_STRING_THRUSTING_MACHINE',
    'BARTACKING_MACHINE',
    'BLIND_HEM_MACHINE',
    'BLIND_LOOP_MAKING_MACHINE',
    'BOTTOM_HEM_MACHINE',
    'BUTTON_ATTACH_MACHINE',
    'DOUBLE_NEEDLE_CHAIN_STITCH_MACHINE',
    'DOUBLE_NEEDLE_LOCK_STITCH_MACHINE',
    'DOUBLE_NEEDLE_SPLIT_BAR_MACHINE',
    'EYELET_BUTTONHOLING_MACHINE',
    'FEED_OF_ARM_MACHINE',
    'FLATLOCK_CYLINDER_BED_MACHINE',
    'FLATLOCK_BABY_CYLINDER_BED_MACHINE',
    'FLATLOCK_CYLINDERBED_ELASTIC_ATTACH_MACHINE',
    'FLATLOCK_FLATBED_MACHINE',
    'FLATLOCK_FLATBED_TOP_FEED_MACHINE',
    'FLATSEAMER_MACHINE',
    'HANG_TAG_STRING_INSERTION_MACHINE',
    'HEAT_TRANSFER_PRESS_MACHINE',
    'INSEAM_IRON',
    'IRON_TABLE',
    'MINI_PATTERN_SEAMER_MACHINE',
    'MULTI_NEEDLE_MACHINE',
    'NORMAL_BUTTON_HOLE_MACHINE',
    'OVERLOCK_CUFF_ATTACH_MACHINE',
    'OVERLOCK_CYLINDER_BED_MACHINE',
    'OVERLOCK_MACHINE',
    'OVERLOCK_MACHINE_AND_BACK_LATCH_STITCH',
    'OVERLOCK_NECK_RIB_ATTACH_MACHINE',
    'PATTERN_SEWER_MACHINE',
    'POLO_SHIRT_PLACKET_AUTOMATION_MACHINE',
    'QUILTING_MACHINE',
    'SINGLE_NEEDLE_EDGE_CUTTER_MACHINE',
    'SINGLE_NEEDLE_FEED_MACHINE',
    'SINGLE_NEEDLE_LOCK_STITCH_MACHINE',
    'SNAP_ATTACH_MACHINE',
    'ZIGZAG_STITCH_MACHINE',
    'Others'
];

// Personal and contingency allowances (fixed)
const PERSONAL_ALLOWANCE = 11;
const CONTINGENCY_ALLOWANCE = 2;

// DOM Elements
const elements = {
    loadingOverlay: document.getElementById('loadingOverlay'),
    sidebarCurrentTime: document.getElementById('sidebarCurrentTime'),
    sidebarLastUpdated: document.getElementById('sidebarLastUpdated'),
    headerLastSync: document.getElementById('headerLastSync'),
    headerTotalOps: document.getElementById('headerTotalOps'),
    headerActiveLines: document.getElementById('headerActiveLines'),
    dataVersion: document.getElementById('dataVersion'),
    lastSync: document.getElementById('lastSync'),
    totalOperators: document.getElementById('totalOperators'),
    groupACount: document.getElementById('operatorsGroupACount'),
    groupBCount: document.getElementById('operatorsGroupBCount'),
    groupCCount: document.getElementById('operatorsGroupCCount'),
    groupDCount: document.getElementById('operatorsGroupDCount'),
    performanceRecords: document.getElementById('performanceRecords'),
    performanceAvgEfficiency: document.getElementById('performanceAvgEfficiency'),
    performanceTotalOps: document.getElementById('performanceTotalOps'),
    timeStudies: document.getElementById('timeStudies'),
    timeStudyAvgCycle: document.getElementById('timeStudyAvgCycle'),
    timeStudyCompleted: document.getElementById('timeStudyCompleted'),
    avgEfficiency: document.getElementById('avgEfficiency'),
    avgSMV: document.getElementById('avgSMV'),
    avgWorkingSMV: document.getElementById('avgWorkingSMV'),
    totalOperations: document.getElementById('totalOperations'),
    analysisSummary: document.getElementById('analysisSummary'),
    activeLines: document.getElementById('activeLines'),
    avgSMVDiff: document.getElementById('avgSMVDiff'),
    searchInput: document.getElementById('searchInput'),
    skillFilter: document.getElementById('skillFilter'),
    lineFilter: document.getElementById('lineFilter'),
    operatorsBody: document.getElementById('operatorsBody'),
    performanceBody: document.getElementById('performanceBody'),
    notificationToast: document.getElementById('notificationToast'),
    toastMessage: document.getElementById('toastMessage'),
    stopwatchDisplay: document.getElementById('stopwatchDisplay'),
    lapDisplay: document.getElementById('lapDisplay'),
    lapsList: document.getElementById('lapsList'),
    machineUsageStats: document.getElementById('machineUsageStats'),
    groupOperatorsList: document.getElementById('groupOperatorsList'),
    groupModalTitle: document.getElementById('groupModalTitle'),
    groupOperatorCount: document.getElementById('groupOperatorCount'),
    groupAvgEfficiency: document.getElementById('groupAvgEfficiency'),
    groupDescription: document.getElementById('groupDescription'),
    // Dashboard elements v16
    dashboardTotalOperators: document.getElementById('dashboardTotalOperators'),
    dashboardGroupACount: document.getElementById('dashboardGroupACount'),
    dashboardGroupBCount: document.getElementById('dashboardGroupBCount'),
    dashboardGroupCCount: document.getElementById('dashboardGroupCCount'),
    dashboardGroupDCount: document.getElementById('dashboardGroupDCount'),
    dashboardAvgEfficiency: document.getElementById('dashboardAvgEfficiency'),
    dashboardAvgSMV: document.getElementById('dashboardAvgSMV'),
    dashboardAvgWorkingSMV: document.getElementById('dashboardAvgWorkingSMV'),
    dashboardTotalOperations: document.getElementById('dashboardTotalOperations'),
    dashboardActiveLines: document.getElementById('dashboardActiveLines'),
    dashboardMachineUsage: document.getElementById('dashboardMachineUsage'),
    skillGroupACount: document.getElementById('skillGroupACount'),
    skillGroupBCount: document.getElementById('skillGroupBCount'),
    skillGroupCCount: document.getElementById('skillGroupCCount'),
    skillGroupDCount: document.getElementById('skillGroupDCount'),
    // Garment SMV elements v16 (smaller cards)
    totalStandardSMV: document.getElementById('totalStandardSMV'),
    totalWorkingSMV: document.getElementById('totalWorkingSMV'),
    standardSMVLineSelect: document.getElementById('standardSMVLineSelect'),
    standardSMVStyleSelect: document.getElementById('standardSMVStyleSelect'),
    workingSMVLineSelect: document.getElementById('workingSMVLineSelect'),
    workingSMVStyleSelect: document.getElementById('workingSMVStyleSelect'),
    // Time study elements
    studyLineNo: document.getElementById('studyLineNo'),
    studyStyleNo: document.getElementById('studyStyleNo'),
    studyProductDesc: document.getElementById('studyProductDesc'),
    // Allowance display elements
    allowanceInfo: document.getElementById('allowanceInfo'),
    personalAllowanceDisplay: document.getElementById('personalAllowanceDisplay'),
    contingencyAllowanceDisplay: document.getElementById('contingencyAllowanceDisplay'),
    machineAllowanceDisplay: document.getElementById('machineAllowanceDisplay'),
    totalAllowanceDisplay: document.getElementById('totalAllowanceDisplay'),
    // New Edit Existing Details button in operators tab
    editExistingDetailsBtn: document.getElementById('editExistingDetailsBtn'),
    // Mobile menu
    mobileMenuToggle: document.getElementById('mobileMenuToggle'),
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    // Other machines custom input
    otherMachineCustomInput: document.getElementById('otherMachineCustomInput'),
    customOtherMachineName: document.getElementById('customOtherMachineName'),
    perfOtherMachineCustomInput: document.getElementById('perfOtherMachineCustomInput'),
    perfCustomOtherMachineName: document.getElementById('perfCustomOtherMachineName'),
    // Combined SMV in dashboard v16
    dashboardAvgStdSMV: document.getElementById('dashboardAvgStdSMV'),
    dashboardAvgWorkSMV: document.getElementById('dashboardAvgWorkSMV')
};

// Update real-time clock
function updateRealTimeClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    const dateString = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    elements.sidebarCurrentTime.textContent = timeString;
    elements.sidebarLastUpdated.textContent = dateString;
    elements.headerLastSync.textContent = timeString;
    elements.lastSync.textContent = timeString;
    elements.dataVersion.textContent = '17.0.0';
}

// Setup sidebar navigation - UPDATED for v16
function setupSidebarNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Filter out Skill Allocation tab if it exists
    const filteredNavItems = Array.from(navItems).filter(item => {
        const tabId = item.getAttribute('data-tab');
        return tabId !== 'skill-allocation';
    });
    
    filteredNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');
            
            // Remove Skill Allocation tab content if it exists
            const skillAllocationTab = document.getElementById('skill-allocation');
            if (skillAllocationTab) {
                skillAllocationTab.remove();
            }
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show active tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                    
                    // Load specific data for each tab
                    if (tabId === 'dashboard') {
                        updateDashboard();
                        createDashboardCharts();
                        updateGarmentSMVSelectors();
                    } else if (tabId === 'performance') {
                        updateMachineUsageStats();
                    }
                }
            });
            
            // Close mobile sidebar if open
            if (window.innerWidth <= 768) {
                closeMobileSidebar();
            }
        });
    });
    
    // Make summary cards clickable (excluding removed cards)
    document.querySelectorAll('.stat-card.clickable').forEach(card => {
        if (!card.id.includes('TotalOperatorsCard')) {
            card.addEventListener('click', () => {
                const tab = card.getAttribute('data-tab');
                const navItem = document.querySelector(`.nav-item[data-tab="${tab}"]`);
                if (navItem) {
                    navItem.click();
                }
            });
        }
    });
}

// Setup mobile menu for v16
function setupMobileMenu() {
    if (elements.mobileMenuToggle) {
        elements.mobileMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMobileSidebar();
        });
    }
    
    if (elements.sidebarOverlay) {
        elements.sidebarOverlay.addEventListener('click', () => {
            closeMobileSidebar();
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (elements.sidebar && !elements.sidebar.contains(e.target) && 
                elements.mobileMenuToggle && !elements.mobileMenuToggle.contains(e.target)) {
                closeMobileSidebar();
            }
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            // Reset sidebar for desktop
            if (elements.sidebar) {
                elements.sidebar.style.transform = 'translateX(0)';
                elements.sidebar.style.width = '240px';
            }
            if (elements.sidebarOverlay) {
                elements.sidebarOverlay.classList.remove('active');
            }
            if (elements.mobileMenuToggle) {
                elements.mobileMenuToggle.classList.remove('active');
            }
        } else {
            // Ensure sidebar is hidden on mobile initially
            if (elements.sidebar) {
                elements.sidebar.style.transform = 'translateX(-100%)';
                elements.sidebar.style.width = '240px';
            }
        }
        
        // Adjust dashboard layout for mobile
        adjustDashboardForMobile();
    });
}

function toggleMobileSidebar() {
    if (!elements.sidebar) return;
    
    if (elements.sidebar.style.transform === 'translateX(0px)' || elements.sidebar.style.transform === '') {
        openMobileSidebar();
    } else {
        closeMobileSidebar();
    }
}

function openMobileSidebar() {
    if (elements.sidebar) {
        elements.sidebar.style.transform = 'translateX(0)';
    }
    if (elements.sidebarOverlay) {
        elements.sidebarOverlay.classList.add('active');
    }
    if (elements.mobileMenuToggle) {
        elements.mobileMenuToggle.classList.add('active');
    }
}

function closeMobileSidebar() {
    if (elements.sidebar) {
        elements.sidebar.style.transform = 'translateX(-100%)';
    }
    if (elements.sidebarOverlay) {
        elements.sidebarOverlay.classList.remove('active');
    }
    if (elements.mobileMenuToggle) {
        elements.mobileMenuToggle.classList.remove('active');
    }
}

// Adjust dashboard layout for mobile
function adjustDashboardForMobile() {
    const dashboardGrid = document.querySelector('.dashboard-grid-v16');
    const skillGroupsGrid = document.querySelector('.skill-groups-grid');
    const garmentSmvContainer = document.querySelector('.garment-smv-container');
    
    if (!dashboardGrid || !skillGroupsGrid || !garmentSmvContainer) return;
    
    if (window.innerWidth <= 768) {
        // Stack cards vertically on mobile
        dashboardGrid.style.gridTemplateColumns = '1fr';
        garmentSmvContainer.style.gridTemplateColumns = '1fr';
        
        // Make skill groups 2 columns on mobile
        skillGroupsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        skillGroupsGrid.style.gap = '10px';
        
        // Adjust font sizes for mobile
        document.querySelectorAll('.skill-group-card .count').forEach(el => {
            el.style.fontSize = '1.8rem';
        });
        
        // Make tables scrollable horizontally
        document.querySelectorAll('.data-table-wrapper, .performance-table-wrapper').forEach(el => {
            el.style.overflowX = 'auto';
        });
    } else if (window.innerWidth <= 900) {
        // Tablet layout
        dashboardGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
        garmentSmvContainer.style.gridTemplateColumns = '1fr';
        skillGroupsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    } else {
        // Desktop layout - Updated for v17: Better grid layout
        dashboardGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(350px, 1fr))';
        garmentSmvContainer.style.gridTemplateColumns = '1fr 1fr';
        skillGroupsGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
    }
}

// Update Garment SMV selectors for v16 (smaller cards) - FIXED for v17
function updateGarmentSMVSelectors() {
    // Get unique lines from performance data
    const lines = new Set();
    const stylesByLine = {};
    
    performanceData.forEach(record => {
        if (record.lineNo) {
            lines.add(record.lineNo);
            if (!stylesByLine[record.lineNo]) {
                stylesByLine[record.lineNo] = new Set();
            }
            if (record.styleNo) {
                stylesByLine[record.lineNo].add(record.styleNo);
            }
        }
    });
    
    // Populate line selectors (excluding removed filters)
    const lineSelectors = [
        elements.standardSMVLineSelect,
        elements.workingSMVLineSelect,
        document.getElementById('dashboardLineSelect'),
        document.getElementById('lineFilter'),
        document.getElementById('perfLineFilter')
    ].filter(el => el); // Filter out null elements
    
    lineSelectors.forEach(select => {
        if (select) {
            // Clear existing options except the first one
            const firstOption = select.options[0];
            select.innerHTML = '';
            if (firstOption) select.appendChild(firstOption);
            
            // Add line options
            Array.from(lines).sort().forEach(line => {
                const option = document.createElement('option');
                option.value = line;
                option.textContent = line;
                select.appendChild(option);
            });
        }
    });
    
    // Update line datalist for time study and performance forms
    const lineNoList = document.getElementById('lineNoList');
    if (lineNoList) {
        lineNoList.innerHTML = '';
        Array.from(lines).sort().forEach(line => {
            const option = document.createElement('option');
            option.value = line;
            lineNoList.appendChild(option);
        });
    }
    
    // Add operators' sew lines to datalist
    operators.forEach(operator => {
        if (operator.sewLine && !Array.from(lines).includes(operator.sewLine)) {
            const option = document.createElement('option');
            option.value = operator.sewLine;
            if (lineNoList) lineNoList.appendChild(option);
        }
    });
    
    // Add event listeners for style dropdown updates
    if (elements.standardSMVLineSelect) {
        elements.standardSMVLineSelect.addEventListener('change', function() {
            updateStyleDropdown(this.value, elements.standardSMVStyleSelect);
            calculateGarmentSMV('standard');
        });
    }
    
    if (elements.workingSMVLineSelect) {
        elements.workingSMVLineSelect.addEventListener('change', function() {
            updateStyleDropdown(this.value, elements.workingSMVStyleSelect);
            calculateGarmentSMV('working');
        });
    }
    
    if (elements.standardSMVStyleSelect) {
        elements.standardSMVStyleSelect.addEventListener('change', () => calculateGarmentSMV('standard'));
    }
    
    if (elements.workingSMVStyleSelect) {
        elements.workingSMVStyleSelect.addEventListener('change', () => calculateGarmentSMV('working'));
    }
    
    // Initial calculation
    calculateGarmentSMV('standard');
    calculateGarmentSMV('working');
}

// Auto-fill style and product from the latest record for the line
function autoFillStyleAndProduct(lineNo, type = 'study') {
    if (!lineNo) return;
    
    // Find ALL performance records for this line and sort by timestamp (newest first)
    const lineRecords = performanceData
        .filter(record => record.lineNo === lineNo)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (lineRecords.length > 0) {
        // Always use the latest record (most recent timestamp)
        const latestRecord = lineRecords[0];
        
        if (type === 'study') {
            elements.studyStyleNo.value = latestRecord.styleNo || '';
            elements.studyProductDesc.value = latestRecord.productDesc || '';
        } else {
            const perfStyleNo = document.getElementById('perfStyleNo');
            const perfProductDesc = document.getElementById('perfProductDesc');
            if (perfStyleNo) perfStyleNo.value = latestRecord.styleNo || '';
            if (perfProductDesc) perfProductDesc.value = latestRecord.productDesc || '';
        }
        
        // Show toast notification about auto-fill
        showToast(`Auto-filled Style & Description from latest record for Line ${lineNo}`);
    } else {
        // Clear fields if no records found
        if (type === 'study') {
            elements.studyStyleNo.value = '';
            elements.studyProductDesc.value = '';
        } else {
            const perfStyleNo = document.getElementById('perfStyleNo');
            const perfProductDesc = document.getElementById('perfProductDesc');
            if (perfStyleNo) perfStyleNo.value = '';
            if (perfProductDesc) perfProductDesc.value = '';
        }
    }
}

// Update style dropdown based on selected line
function updateStyleDropdown(line, styleSelect) {
    if (!styleSelect) return;
    
    // Clear existing options except the first one
    const firstOption = styleSelect.options[0];
    styleSelect.innerHTML = '';
    if (firstOption) styleSelect.appendChild(firstOption);
    
    if (!line) {
        styleSelect.disabled = true;
        return;
    }
    
    // Get styles for the selected line
    const styles = new Set();
    performanceData.forEach(record => {
        if (record.lineNo === line && record.styleNo) {
            styles.add(record.styleNo);
        }
    });
    
    if (styles.size === 0) {
        styleSelect.disabled = true;
        return;
    }
    
    styleSelect.disabled = false;
    
    // Add style options
    Array.from(styles).sort().forEach(style => {
        const option = document.createElement('option');
        option.value = style;
        option.textContent = style;
        styleSelect.appendChild(option);
    });
}

// Calculate Garment SMV for v16 - FIXED for v17
function calculateGarmentSMV(type) {
    const lineSelect = type === 'standard' ? elements.standardSMVLineSelect : elements.workingSMVLineSelect;
    const styleSelect = type === 'standard' ? elements.standardSMVStyleSelect : elements.workingSMVStyleSelect;
    const totalElement = type === 'standard' ? elements.totalStandardSMV : elements.totalWorkingSMV;
    
    if (!lineSelect || !styleSelect || !totalElement) return;
    
    const line = lineSelect.value;
    const style = styleSelect.value;
    
    if (!line) {
        totalElement.textContent = '0.00';
        return;
    }
    
    // Filter performance data by line and style
    let filteredData = performanceData.filter(record => record.lineNo === line);
    
    if (style) {
        filteredData = filteredData.filter(record => record.styleNo === style);
    }
    
    if (filteredData.length === 0) {
        totalElement.textContent = '0.00';
        return;
    }
    
    // Calculate total SMV
    let totalSMV = 0;
    filteredData.forEach(record => {
        if (type === 'standard') {
            totalSMV += record.standardSMV || 0;
        } else {
            totalSMV += record.workingSMV || 0;
        }
    });
    
    totalElement.textContent = totalSMV.toFixed(2);
    
    // Add description tooltip
    const description = style 
        ? `Total ${type === 'standard' ? 'Standard' : 'Working'} SMV for Line ${line}, Style ${style}`
        : `Total ${type === 'standard' ? 'Standard' : 'Working'} SMV for Line ${line}`;
    
    totalElement.title = description;
}

// Stopwatch functions with machine-specific allowance
function formatTime(milliseconds) {
    const totalSeconds = milliseconds / 1000;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const ms = Math.floor((milliseconds % 1000) / 10);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

function startStopwatch() {
    if (!stopwatchRunning) {
        const now = Date.now();
        stopwatchStartTime = now - stopwatchTotalElapsed;
        lapStartTime = now - lapElapsed;
        
        stopwatchInterval = setInterval(() => {
            const currentTime = Date.now();
            stopwatchTotalElapsed = currentTime - stopwatchStartTime;
            lapElapsed = currentTime - lapStartTime;
            
            elements.stopwatchDisplay.textContent = formatTime(stopwatchTotalElapsed);
            elements.lapDisplay.textContent = `Lap: ${formatTime(lapElapsed)}`;
        }, 10);
        
        stopwatchRunning = true;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        document.getElementById('lapBtn').disabled = false;
        document.getElementById('resetBtn').disabled = true;
    }
}

function stopStopwatch() {
    if (stopwatchRunning) {
        clearInterval(stopwatchInterval);
        stopwatchRunning = false;
        document.getElementById('stopBtn').disabled = true;
        document.getElementById('lapBtn').disabled = true;
        document.getElementById('startBtn').disabled = false;
        document.getElementById('resetBtn').disabled = false;
        
        // Record final lap if we have a lap in progress
        if (lapElapsed > 0 && lapCounter < cycleCount) {
            recordLap();
        }
    }
}

function recordLap() {
    if (lapCounter < cycleCount) {
        lapCounter++;
        const lapTimeSeconds = lapElapsed / 1000;
        lapTimes.push(lapTimeSeconds);
        
        // Add lap to display
        const lapItem = document.createElement('div');
        lapItem.className = 'lap-item';
        lapItem.innerHTML = `
            <div class="lap-number">Cycle ${lapCounter}</div>
            <div class="lap-time">${lapTimeSeconds.toFixed(3)} sec</div>
        `;
        elements.lapsList.appendChild(lapItem);
        
        // Reset lap timer for next lap
        lapStartTime = Date.now();
        lapElapsed = 0;
        elements.lapDisplay.textContent = 'Lap: 00:00:00.00';
        
        // Check if we've reached the maximum cycles
        if (lapCounter >= cycleCount) {
            stopStopwatch();
            calculateResults();
        }
    }
}

function resetStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchRunning = false;
    stopwatchTotalElapsed = 0;
    lapElapsed = 0;
    lapCounter = 0;
    lapTimes = [];
    
    elements.stopwatchDisplay.textContent = '00:00:00.000';
    elements.lapDisplay.textContent = 'Lap: 00:00:00.000';
    elements.lapsList.innerHTML = '';
    
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('lapBtn').disabled = true;
    document.getElementById('resetBtn').disabled = true;
    
    document.getElementById('avgCycleTime').textContent = '0.00';
    document.getElementById('totalCycleTime').textContent = '0.00';
    document.getElementById('workingSMVResult').textContent = '0.00';
    document.getElementById('efficiencyResult').textContent = '0%';
}

// Get machine allowance percentage - UPDATED for v17 with new machine list
function getMachineAllowance(machineName) {
    // Handle custom machine names
    if (machineName === 'Others') {
        const customMachine = document.getElementById('customMachineName')?.value || 
                             document.getElementById('perfCustomMachineName')?.value;
        if (customMachine) {
            // Check if custom machine name matches any known machine
            const machineKey = Object.keys(machineAllowances).find(key => 
                customMachine.toUpperCase().includes(key)
            );
            return machineKey ? machineAllowances[machineKey] : machineAllowances['Others'];
        }
        return machineAllowances['Others'];
    }
    
    return machineAllowances[machineName] || machineAllowances['Others'];
}

// Update allowance display
function updateAllowanceDisplay(machineName) {
    if (!machineName || !elements.allowanceInfo) {
        if (elements.allowanceInfo) {
            elements.allowanceInfo.style.display = 'none';
        }
        return;
    }
    
    const machineAllowance = getMachineAllowance(machineName);
    const totalAllowance = PERSONAL_ALLOWANCE + CONTINGENCY_ALLOWANCE + machineAllowance;
    
    // Update display elements
    elements.personalAllowanceDisplay.textContent = PERSONAL_ALLOWANCE + '%';
    elements.contingencyAllowanceDisplay.textContent = CONTINGENCY_ALLOWANCE + '%';
    elements.machineAllowanceDisplay.textContent = machineAllowance + '%';
    elements.totalAllowanceDisplay.textContent = totalAllowance + '%';
    
    // Show the allowance info
    elements.allowanceInfo.style.display = 'block';
}

// Calculate results with machine-specific allowance
function calculateResults() {
    if (lapTimes.length === 0) return;
    
    const totalTime = lapTimes.reduce((a, b) => a + b, 0);
    const avgTime = totalTime / lapTimes.length;
    
    // Get machine allowance
    const machineName = document.getElementById('studyMachine')?.value;
    const machineAllowance = machineName ? getMachineAllowance(machineName) : 0;
    const totalAllowance = PERSONAL_ALLOWANCE + CONTINGENCY_ALLOWANCE + machineAllowance;
    
    const workingSMV = (avgTime / 60) * (1 + totalAllowance/100);
    const standardSMV = parseFloat(document.getElementById('standardSMV')?.value) || 0;
    const efficiency = standardSMV > 0 ? (standardSMV / workingSMV) * 100 : 0;
    
    document.getElementById('avgCycleTime').textContent = avgTime.toFixed(2);
    document.getElementById('totalCycleTime').textContent = totalTime.toFixed(2);
    document.getElementById('workingSMVResult').textContent = workingSMV.toFixed(2);
    document.getElementById('efficiencyResult').textContent = efficiency.toFixed(1) + '%';
    
    // Color code efficiency
    const efficiencyElem = document.getElementById('efficiencyResult');
    if (efficiencyElem) {
        efficiencyElem.className = 'result-value ';
        if (efficiency >= 85) {
            efficiencyElem.classList.add('efficiency-high');
        } else if (efficiency >= 70) {
            efficiencyElem.classList.add('efficiency-medium');
        } else {
            efficiencyElem.classList.add('efficiency-low');
        }
    }
}

// Calculate manual cycle times with machine-specific allowance
function calculateManualCycles() {
    const manualTimes = [];
    document.querySelectorAll('.manual-cycle-time').forEach(input => {
        const value = parseFloat(input.value);
        if (!isNaN(value) && value > 0) {
            manualTimes.push(value);
        }
    });
    
    if (manualTimes.length === 0) {
        showToast('Please enter at least one valid cycle time', 'error');
        return;
    }
    
    lapTimes = manualTimes;
    lapCounter = manualTimes.length;
    
    // Update laps display
    elements.lapsList.innerHTML = '';
    manualTimes.forEach((time, index) => {
        const lapItem = document.createElement('div');
        lapItem.className = 'lap-item';
        lapItem.innerHTML = `
            <div class="lap-number">Cycle ${index + 1}</div>
            <div class="lap-time">${time.toFixed(3)} sec</div>
        `;
        elements.lapsList.appendChild(lapItem);
    });
    
    calculateResults();
    showToast(`Calculated ${manualTimes.length} manual cycle times`);
}

// Load data from Firestore
async function loadData() {
    try {
        // Load operators with real-time updates
        const operatorsQuery = query(collection(db, 'operators'), orderBy('operatorId'));
        onSnapshot(operatorsQuery, (snapshot) => {
            operators = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                operators.push({
                    id: doc.id,
                    operatorId: data.operatorId || '',
                    name: data.name || '',
                    sewLine: data.sewLine || '',
                    skillLevel: data.skillLevel || '',
                    skillScore: data.skillScore || 0,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    lastUpdated: data.lastUpdated?.toDate() || new Date()
                });
            });
            renderOperatorsTable();
            updateDashboardStats();
            populateOperatorDropdowns();
            populateLineFilter();
            populateDashboardLineSelect();
            updateGarmentSMVSelectors();
            updateActiveLinesCount();
            elements.headerTotalOps.textContent = operators.length;
            
            showToast(`${operators.length} operators loaded successfully!`);
        });
        
        // Load performance data
        const performanceQuery = query(collection(db, 'performance'), orderBy('timestamp', 'desc'));
        onSnapshot(performanceQuery, (snapshot) => {
            performanceData = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                performanceData.push({
                    id: doc.id,
                    operatorId: data.operatorId || '',
                    operatorName: data.operatorName || '',
                    lineNo: data.lineNo || '',
                    styleNo: data.styleNo || '',
                    productDesc: data.productDesc || '',
                    operation: data.operation || '',
                    machineName: data.machineName || '',
                    customMachineName: data.customMachineName || '',
                    standardSMV: data.standardSMV || 0,
                    workingSMV: data.workingSMV || 0,
                    efficiency: data.efficiency || 0,
                    cycleTimes: data.cycleTimes || [],
                    otherMachines: data.otherMachines || '',
                    otherMachineEfficiencies: data.otherMachineEfficiencies || '',
                    allowance: data.allowance || 13,
                    timestamp: data.timestamp?.toDate() || new Date(),
                    lastUpdated: data.lastUpdated?.toDate() || new Date()
                });
            });
            renderPerformanceTable();
            updateDashboardStats();
            updateMachineUsageStats();
            updateGarmentSMVSelectors();
            updateActiveLinesCount();
            
            // Update dashboard if active
            if (document.getElementById('dashboard')?.classList.contains('active')) {
                updateDashboard();
                createDashboardCharts();
            }
        });
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading data: ' + error.message, 'error');
        if (elements.loadingOverlay) {
            elements.loadingOverlay.style.display = 'none';
        }
    }
}

// Update active lines count for v16
function updateActiveLinesCount() {
    const activeLinesSet = new Set();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Count lines with operators assigned
    operators.forEach(operator => {
        if (operator.sewLine) {
            activeLinesSet.add(operator.sewLine);
        }
    });
    
    // Count lines with performance data in last 7 days
    performanceData.forEach(record => {
        if (record.lineNo && record.timestamp) {
            const recordDate = new Date(record.timestamp);
            if (recordDate >= sevenDaysAgo) {
                activeLinesSet.add(record.lineNo);
            }
        }
    });
    
    const activeLinesCount = activeLinesSet.size;
    elements.headerActiveLines.textContent = activeLinesCount;
    elements.dashboardActiveLines.textContent = activeLinesCount;
    
    return activeLinesCount;
}

// Load operator machine skills
function loadOperatorMachineSkills() {
    const skills = localStorage.getItem('operatorMachineSkills');
    if (skills) {
        operatorMachineSkills = JSON.parse(skills);
    }
}

// Save operator machine skills
function saveOperatorMachineSkills() {
    localStorage.setItem('operatorMachineSkills', JSON.stringify(operatorMachineSkills));
}

// Update operator machine skill based on performance
function updateOperatorMachineSkill(operatorId, machineName, efficiency) {
    if (!operatorMachineSkills[operatorId]) {
        operatorMachineSkills[operatorId] = {};
    }
    
    if (!operatorMachineSkills[operatorId][machineName]) {
        operatorMachineSkills[operatorId][machineName] = {
            operations: new Set(),
            efficiencies: [],
            lastUpdated: new Date()
        };
    }
    
    // Add operation to set (unique operations)
    const operation = document.getElementById('studyOperation')?.value || 
                    document.getElementById('perfOperation')?.value || 'Unknown';
    operatorMachineSkills[operatorId][machineName].operations.add(operation);
    
    // Add efficiency to array
    operatorMachineSkills[operatorId][machineName].efficiencies.push(efficiency);
    
    // Keep only last 10 efficiencies
    if (operatorMachineSkills[operatorId][machineName].efficiencies.length > 10) {
        operatorMachineSkills[operatorId][machineName].efficiencies.shift();
    }
    
    operatorMachineSkills[operatorId][machineName].lastUpdated = new Date();
    saveOperatorMachineSkills();
}

// Calculate skill level for a machine based on performance
function calculateMachineSkillLevel(operatorId, machineName) {
    if (!operatorMachineSkills[operatorId] || !operatorMachineSkills[operatorId][machineName]) {
        return 'D';
    }
    
    const data = operatorMachineSkills[operatorId][machineName];
    const avgEfficiency = data.efficiencies.length > 0 ? 
        data.efficiencies.reduce((a, b) => a + b, 0) / data.efficiencies.length : 0;
    const operationCount = data.operations.size;
    
    // Determine skill level based on new logic
    if (operationCount >= 3 && avgEfficiency >= 85) {
        return 'A';
    } else if (operationCount >= 3 && avgEfficiency >= 70) {
        return 'B';
    } else if (operationCount >= 2 && avgEfficiency >= 50) {
        return 'C';
    } else {
        return 'D';
    }
}

// Get all machines for an operator (from performance data)
function getOperatorMachines(operatorId) {
    const machines = new Set();
    
    // Get machines from performance data
    performanceData.forEach(record => {
        if (record.operatorId === operatorId && record.machineName) {
            let machineName = record.machineName;
            if (record.machineName === 'Others' && record.customMachineName) {
                machineName = record.customMachineName;
            }
            machines.add(machineName);
        }
    });
    
    return Array.from(machines);
}

// Calculate multi-skill grade based on new logic
function calculateMultiSkillGrade(operatorId) {
    const machines = getOperatorMachines(operatorId);
    const machineCount = machines.length;
    
    if (machineCount === 0) {
        return 'Group D';
    }
    
    // Get skill levels for each machine
    const machineSkillLevels = machines.map(machine => 
        calculateMachineSkillLevel(operatorId, machine)
    );
    
    // Count machines by skill level
    const levelCounts = {
        'A': machineSkillLevels.filter(level => level === 'A').length,
        'B': machineSkillLevels.filter(level => level === 'B').length,
        'C': machineSkillLevels.filter(level => level === 'C').length,
        'D': machineSkillLevels.filter(level => level === 'D').length
    };
    
    // Apply new multi-skill logic
    if (machineCount >= 3 && levelCounts['A'] >= 1 && 
        (levelCounts['B'] >= 1 || levelCounts['C'] >= 1)) {
        return 'Group A';
    } else if (machineCount >= 2 && levelCounts['B'] >= 1 && 
              (levelCounts['C'] >= 1 || machineCount === 2)) {
        return 'Group B';
    } else if (machineCount >= 2 && levelCounts['C'] >= 2) {
        return 'Group C';
    } else {
        return 'Group D';
    }
}

// Populate operator dropdowns - UPDATED for v16
function populateOperatorDropdowns() {
    const studyOperatorId = document.getElementById('studyOperatorId');
    const perfOperatorId = document.getElementById('perfOperatorId');
    
    // Clear existing options except the first one
    if (studyOperatorId) {
        studyOperatorId.innerHTML = '<option value="">Select Operator</option>';
    }
    if (perfOperatorId) {
        perfOperatorId.innerHTML = '<option value="">Select Operator</option>';
    }
    
    operators.forEach(operator => {
        if (studyOperatorId) {
            const option1 = document.createElement('option');
            option1.value = operator.operatorId;
            option1.textContent = `${operator.operatorId} - ${operator.name}`;
            studyOperatorId.appendChild(option1);
        }
        
        if (perfOperatorId) {
            const option2 = document.createElement('option');
            option2.value = operator.operatorId;
            option2.textContent = `${operator.operatorId} - ${operator.name}`;
            perfOperatorId.appendChild(option2);
        }
    });
    
    // Update operator selection in time study
    if (studyOperatorId) {
        studyOperatorId.addEventListener('change', function() {
            const operatorId = this.value;
            if (operatorId) {
                const operator = operators.find(op => op.operatorId === operatorId);
                if (operator && operator.sewLine) {
                    elements.studyLineNo.value = operator.sewLine;
                    // Also trigger auto-fill for the line
                    setTimeout(() => {
                        autoFillStyleAndProduct(operator.sewLine, 'study');
                    }, 100);
                }
            }
        });
    }
}

// Populate line filter for v16
function populateLineFilter() {
    const lineFilter = document.getElementById('lineFilter');
    const perfLineFilter = document.getElementById('perfLineFilter');
    
    // Clear and add default option
    if (lineFilter) {
        lineFilter.innerHTML = '<option value="">Filter by Sew Line...</option>';
    }
    if (perfLineFilter) {
        perfLineFilter.innerHTML = '<option value="">Filter by Line...</option>';
    }
    
    // Collect unique sew lines from supervisor mapping
    const sewLines = Object.keys(supervisorMapping).sort();
    
    // Add options
    sewLines.forEach(line => {
        if (lineFilter) {
            const option1 = document.createElement('option');
            option1.value = line;
            option1.textContent = line;
            lineFilter.appendChild(option1);
        }
        
        if (perfLineFilter) {
            const option2 = document.createElement('option');
            option2.value = line;
            option2.textContent = line;
            perfLineFilter.appendChild(option2);
        }
    });
}

// Populate dashboard line select
function populateDashboardLineSelect() {
    const dashboardLineSelect = document.getElementById('dashboardLineSelect');
    
    if (!dashboardLineSelect) return;
    
    // Clear existing options
    dashboardLineSelect.innerHTML = '<option value="">All Lines</option>';
    
    // Collect unique lines from supervisor mapping
    const lines = Object.keys(supervisorMapping).sort();
    
    // Add options
    lines.forEach(line => {
        const option = document.createElement('option');
        option.value = line;
        option.textContent = line;
        dashboardLineSelect.appendChild(option);
    });
}

// Update machine usage statistics for dashboard v16
function updateMachineUsageStats() {
    const machineUsage = {};
    
    performanceData.forEach(record => {
        let machineName = record.machineName || 'Unknown';
        if (record.machineName === 'Others' && record.customMachineName) {
            machineName = record.customMachineName;
        }
        
        if (!machineUsage[machineName]) {
            machineUsage[machineName] = 0;
        }
        machineUsage[machineName]++;
    });
    
    // Sort by count descending
    const sortedMachines = Object.entries(machineUsage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5); // Top 5 machines for dashboard
    
    // Update dashboard machine usage
    updateDashboardMachineUsage(sortedMachines);
}

// Update dashboard machine usage
function updateDashboardMachineUsage(sortedMachines) {
    if (!elements.dashboardMachineUsage) return;
    
    if (sortedMachines.length === 0) {
        elements.dashboardMachineUsage.innerHTML = `
            <div class="machine-usage-item">
                <span class="machine-name">No data available</span>
                <span class="machine-count">0</span>
            </div>
        `;
        return;
    }
    
    let machineHTML = '';
    sortedMachines.forEach(([machine, count]) => {
        machineHTML += `
            <div class="machine-usage-item">
                <span class="machine-name">${machine}</span>
                <span class="machine-count">${count}</span>
            </div>
        `;
    });
    
    elements.dashboardMachineUsage.innerHTML = machineHTML;
}

// Update dashboard v16 - Updated for new layout without Weekly Trend and Recent Activity
function updateDashboard() {
    updateDashboardStats();
    createDashboardCharts();
    updateGarmentSMVSelectors();
    updateActiveLinesCount();
    updateCombinedSMVInDashboard();
}

// Update dashboard statistics v16 - Updated for new layout
function updateDashboardStats() {
    // Total operators
    const selectedLine = document.getElementById('dashboardLineSelect')?.value;
    let filteredOperators = operators;
    
    if (selectedLine) {
        filteredOperators = filteredOperators.filter(op => op.sewLine === selectedLine);
    }
    
    if (elements.dashboardTotalOperators) {
        elements.dashboardTotalOperators.textContent = filteredOperators.length;
    }
    
    // Calculate groups using new multi-skill logic
    let groupACount = 0;
    let groupBCount = 0;
    let groupCCount = 0;
    let groupDCount = 0;
    
    filteredOperators.forEach(operator => {
        const multiSkillGrade = calculateMultiSkillGrade(operator.operatorId);
        
        if (multiSkillGrade === 'Group A') groupACount++;
        else if (multiSkillGrade === 'Group B') groupBCount++;
        else if (multiSkillGrade === 'Group C') groupCCount++;
        else if (multiSkillGrade === 'Group D') groupDCount++;
    });
    
    // Update group cards in the new layout
    if (elements.dashboardGroupACount) elements.dashboardGroupACount.textContent = groupACount;
    if (elements.dashboardGroupBCount) elements.dashboardGroupBCount.textContent = groupBCount;
    if (elements.dashboardGroupCCount) elements.dashboardGroupCCount.textContent = groupCCount;
    if (elements.dashboardGroupDCount) elements.dashboardGroupDCount.textContent = groupDCount;
    
    // Update skill distribution card
    if (elements.skillGroupACount) elements.skillGroupACount.textContent = groupACount;
    if (elements.skillGroupBCount) elements.skillGroupBCount.textContent = groupBCount;
    if (elements.skillGroupCCount) elements.skillGroupCCount.textContent = groupCCount;
    if (elements.skillGroupDCount) elements.skillGroupDCount.textContent = groupDCount;
    
    // Performance metrics
    let filteredPerformance = performanceData;
    const dateRange = document.getElementById('dashboardDateRange')?.value;
    const now = new Date();
    
    if (dateRange && dateRange !== 'all') {
        filteredPerformance = filteredPerformance.filter(record => {
            const recordDate = new Date(record.timestamp);
            switch (dateRange) {
                case 'today':
                    return recordDate.toDateString() === now.toDateString();
                case 'week':
                    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                    return recordDate >= weekStart;
                case 'month':
                    return recordDate.getMonth() === now.getMonth() &&
                           recordDate.getFullYear() === now.getFullYear();
                default:
                    return true;
            }
        });
    }
    
    if (selectedLine) {
        filteredPerformance = filteredPerformance.filter(record => record.lineNo === selectedLine);
    }
    
    const totalOps = filteredPerformance.length;
    if (totalOps === 0) {
        if (elements.dashboardAvgEfficiency) elements.dashboardAvgEfficiency.textContent = '0%';
        if (elements.dashboardAvgSMV) elements.dashboardAvgSMV.textContent = '0.00';
        if (elements.dashboardAvgWorkingSMV) elements.dashboardAvgWorkingSMV.textContent = '0.00';
        if (elements.dashboardTotalOperations) elements.dashboardTotalOperations.textContent = '0';
        return;
    }
    
    const totalEfficiency = filteredPerformance.reduce((sum, record) => sum + (record.efficiency || 0), 0);
    const totalStdSMV = filteredPerformance.reduce((sum, record) => sum + (record.standardSMV || 0), 0);
    const totalWorkingSMV = filteredPerformance.reduce((sum, record) => sum + (record.workingSMV || 0), 0);
    
    if (elements.dashboardAvgEfficiency) elements.dashboardAvgEfficiency.textContent = (totalEfficiency / totalOps).toFixed(1) + '%';
    if (elements.dashboardAvgSMV) elements.dashboardAvgSMV.textContent = (totalStdSMV / totalOps).toFixed(2);
    if (elements.dashboardAvgWorkingSMV) elements.dashboardAvgWorkingSMV.textContent = (totalWorkingSMV / totalOps).toFixed(2);
    if (elements.dashboardTotalOperations) elements.dashboardTotalOperations.textContent = totalOps;
}

// Update Combined SMV in Dashboard v16 - FIXED for v17
function updateCombinedSMVInDashboard() {
    const totalStdSMV = performanceData.reduce((sum, record) => sum + (record.standardSMV || 0), 0);
    const totalWorkingSMV = performanceData.reduce((sum, record) => sum + (record.workingSMV || 0), 0);
    const avgStdSMV = performanceData.length > 0 ? totalStdSMV / performanceData.length : 0;
    const avgWorkingSMV = performanceData.length > 0 ? totalWorkingSMV / performanceData.length : 0;
    
    // Update dashboard combined SMV elements if they exist
    if (elements.dashboardAvgStdSMV) {
        elements.dashboardAvgStdSMV.textContent = avgStdSMV.toFixed(2);
    }
    if (elements.dashboardAvgWorkSMV) {
        elements.dashboardAvgWorkSMV.textContent = avgWorkingSMV.toFixed(2);
    }
}

// Create dashboard charts - UPDATED v16: Remove Weekly Trend Chart
function createDashboardCharts() {
    // Destroy existing charts if they exist
    if (efficiencyChart) efficiencyChart.destroy();
    if (linePerformanceChart) linePerformanceChart.destroy();
    if (machinePerformanceChart) machinePerformanceChart.destroy();
    if (skillDistributionChart) skillDistributionChart.destroy();
    
    // 1. Efficiency Distribution Chart
    const efficiencyCtx = document.getElementById('efficiencyChart')?.getContext('2d');
    if (efficiencyCtx) {
        const efficiencyRanges = {
            'Below 70%': 0,
            '70-85%': 0,
            'Above 85%': 0
        };
        
        const selectedLine = document.getElementById('dashboardLineSelect')?.value;
        let filteredPerformance = performanceData;
        
        if (selectedLine) {
            filteredPerformance = filteredPerformance.filter(record => record.lineNo === selectedLine);
        }
        
        filteredPerformance.forEach(record => {
            const efficiency = record.efficiency || 0;
            if (efficiency < 70) efficiencyRanges['Below 70%']++;
            else if (efficiency < 85) efficiencyRanges['70-85%']++;
            else efficiencyRanges['Above 85%']++;
        });
        
        efficiencyChart = new Chart(efficiencyCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(efficiencyRanges),
                datasets: [{
                    data: Object.values(efficiencyRanges),
                    backgroundColor: [
                        'rgba(248, 150, 30, 0.8)',
                        'rgba(67, 97, 238, 0.8)',
                        'rgba(76, 201, 240, 0.8)'
                    ],
                    borderColor: [
                        'rgba(248, 150, 30, 1)',
                        'rgba(67, 97, 238, 1)',
                        'rgba(76, 201, 240, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'white',
                            padding: 20
                        }
                    }
                }
            }
        });
    }
    
    // 2. Line Performance Chart
    const lineCtx = document.getElementById('linePerformanceChart')?.getContext('2d');
    if (lineCtx) {
        const linePerformance = {};
        
        performanceData.forEach(record => {
            if (record.lineNo && record.efficiency) {
                if (!linePerformance[record.lineNo]) {
                    linePerformance[record.lineNo] = { total: 0, count: 0 };
                }
                linePerformance[record.lineNo].total += record.efficiency || 0;
                linePerformance[record.lineNo].count++;
            }
        });
        
        const linesArray = Object.entries(linePerformance).map(([line, data]) => ({
            line,
            avgEfficiency: data.total / data.count
        }));
        
        linesArray.sort((a, b) => b.avgEfficiency - a.avgEfficiency);
        const topLines = linesArray.slice(0, 8);
        
        linePerformanceChart = new Chart(lineCtx, {
            type: 'bar',
            data: {
                labels: topLines.map(l => l.line),
                datasets: [{
                    label: 'Average Efficiency %',
                    data: topLines.map(l => l.avgEfficiency),
                    backgroundColor: topLines.map(l => {
                        if (l.avgEfficiency >= 85) return 'rgba(76, 201, 240, 0.8)';
                        if (l.avgEfficiency >= 70) return 'rgba(67, 97, 238, 0.8)';
                        return 'rgba(248, 150, 30, 0.8)';
                    }),
                    borderColor: topLines.map(l => {
                        if (l.avgEfficiency >= 85) return 'rgba(76, 201, 240, 1)';
                        if (l.avgEfficiency >= 70) return 'rgba(67, 97, 238, 1)';
                        return 'rgba(248, 150, 30, 1)';
                    }),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: 'white'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'white'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                }
            }
        });
    }
    
    // 3. Machine Performance Chart - Can show >100%
    const machineCtx = document.getElementById('machinePerformanceChart')?.getContext('2d');
    if (machineCtx) {
        const machinePerformance = {};
        
        performanceData.forEach(record => {
            let machineName = record.machineName;
            if (record.machineName === 'Others' && record.customMachineName) {
                machineName = record.customMachineName;
            }
            
            if (machineName && record.efficiency) {
                if (!machinePerformance[machineName]) {
                    machinePerformance[machineName] = { total: 0, count: 0 };
                }
                machinePerformance[machineName].total += record.efficiency;
                machinePerformance[machineName].count++;
            }
        });
        
        const machinesArray = Object.entries(machinePerformance).map(([name, data]) => ({
            name,
            avgEfficiency: data.total / data.count
        }));
        
        machinesArray.sort((a, b) => b.avgEfficiency - a.avgEfficiency);
        const topMachines = machinesArray.slice(0, 8);
        
        // Calculate max value for y-axis (allow for values above 100%)
        const maxEfficiency = Math.max(...topMachines.map(m => m.avgEfficiency));
        const yAxisMax = Math.max(100, Math.ceil(maxEfficiency / 10) * 10);
        
        machinePerformanceChart = new Chart(machineCtx, {
            type: 'bar',
            data: {
                labels: topMachines.map(m => m.name),
                datasets: [{
                    label: 'Average Efficiency %',
                    data: topMachines.map(m => m.avgEfficiency),
                    backgroundColor: 'rgba(248, 37, 133, 0.8)',
                    borderColor: 'rgba(248, 37, 133, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        max: yAxisMax,
                        ticks: {
                            color: 'white'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: 'white'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                }
            }
        });
    }
    
    // 4. Skill Distribution Chart
    const skillCtx = document.getElementById('skillDistributionChart')?.getContext('2d');
    if (skillCtx) {
        const skillDistribution = {
            'Group A': 0,
            'Group B': 0,
            'Group C': 0,
            'Group D': 0
        };
        
        operators.forEach(operator => {
            const multiSkillGrade = calculateMultiSkillGrade(operator.operatorId);
            skillDistribution[multiSkillGrade]++;
        });
        
        skillDistributionChart = new Chart(skillCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(skillDistribution),
                datasets: [{
                    data: Object.values(skillDistribution),
                    backgroundColor: [
                        'rgba(76, 201, 240, 0.8)',
                        'rgba(67, 97, 238, 0.8)',
                        'rgba(248, 150, 30, 0.8)',
                        'rgba(183, 23, 158, 0.8)'
                    ],
                    borderColor: [
                        'rgba(76, 201, 240, 1)',
                        'rgba(67, 97, 238, 1)',
                        'rgba(248, 150, 30, 1)',
                        'rgba(183, 23, 158, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'white',
                            padding: 15,
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    }
}

// Render operators table with new multi-skill logic - UPDATED v16
function renderOperatorsTable(filteredData = operators) {
    if (!elements.operatorsBody) return;
    
    elements.operatorsBody.innerHTML = '';
    
    if (filteredData.length === 0) {
        elements.operatorsBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 50px;">
                    <i class="fas fa-users" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 15px; display: block;"></i>
                    <h3 style="color: var(--text-secondary); margin-bottom: 10px;">No Operators Found</h3>
                    <p style="color: var(--text-secondary);">Add your first operator to get started</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Show all operators with scroll
    filteredData.forEach(operator => {
        // Calculate multi-skill grade using new logic
        const multiSkillGrade = calculateMultiSkillGrade(operator.operatorId);
        const skillClass = `skill-group-${multiSkillGrade.charAt(multiSkillGrade.length - 1).toLowerCase()}`;
        
        // Calculate skill score based on overall efficiency
        const skillScore = calculateSkillScore(operator.operatorId);
        const skillScoreClass = getSkillScoreClass(skillScore);
        
        // Check if this is the newly added operator
        const isNewOperator = lastAddedOperatorId === operator.operatorId;
        const rowClass = isNewOperator ? 'new-operator-highlight' : '';
        
        const row = document.createElement('tr');
        row.className = rowClass;
        row.innerHTML = `
            <td class="operator-id">${operator.operatorId || ''}</td>
            <td>${operator.name || ''}</td>
            <td style="text-align: center;">${operator.sewLine || '-'}</td>
            <td>
                ${multiSkillGrade ?
                    `<span class="skill-level ${skillClass}">${multiSkillGrade}</span>` :
                    '-'
                }
            </td>
            <td>
                <span class="skill-score ${skillScoreClass}">
                    ${skillScore > 0 ? skillScore.toFixed(2) : '0.00'}
                </span>
            </td>
            <td>
                <div class="action-buttons-small">
                    <button class="btn-icon edit-operator" data-id="${operator.operatorId}" title="Edit Operator">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-operator" data-id="${operator.operatorId}" title="Delete Operator">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-icon view-performance" data-id="${operator.operatorId}" title="View Performance Records">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon edit-existing-details" data-id="${operator.operatorId}" title="Edit Existing Details">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="btn-icon btn-icon-timer time-study-operator" data-id="${operator.operatorId}" title="Start Time Study for this Operator">
                        <i class="fas fa-stopwatch"></i>
                    </button>
                </div>
            </td>
        `;
        elements.operatorsBody.appendChild(row);
    });
    
    // Add event listeners for action buttons
    document.querySelectorAll('.edit-operator').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const operatorId = e.target.closest('button').getAttribute('data-id');
            openEditModal(operatorId);
        });
    });
    
    document.querySelectorAll('.delete-operator').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const operatorId = e.target.closest('button').getAttribute('data-id');
            deleteOperator(operatorId);
        });
    });
    
    document.querySelectorAll('.view-performance').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const operatorId = e.target.closest('button').getAttribute('data-id');
            viewOperatorPerformance(operatorId);
        });
    });
    
    // NEW: Edit Existing Details button
    document.querySelectorAll('.edit-existing-details').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const operatorId = e.target.closest('button').getAttribute('data-id');
            openEditExistingDetailsModal(operatorId);
        });
    });
    
    document.querySelectorAll('.time-study-operator').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const operatorId = e.target.closest('button').getAttribute('data-id');
            startTimeStudyForOperator(operatorId);
        });
    });
    
    // Remove highlight after 5 seconds
    if (lastAddedOperatorId) {
        setTimeout(() => {
            document.querySelectorAll('.new-operator-highlight').forEach(row => {
                row.classList.remove('new-operator-highlight');
            });
            lastAddedOperatorId = null;
        }, 5000);
    }
}

// NEW: Open Edit Existing Details Modal - COMPLETELY REVAMPED for v17
function openEditExistingDetailsModal(operatorId) {
    const operator = operators.find(op => op.operatorId === operatorId);
    if (!operator) {
        showToast('Operator not found!', 'error');
        return;
    }
    
    // Get all performance records for this operator
    const operatorRecords = performanceData.filter(record => record.operatorId === operatorId);
    
    if (operatorRecords.length === 0) {
        showToast('No performance records found for this operator', 'error');
        return;
    }
    
    // Create modal for editing existing details - COMPLETELY REVAMPED UI
    const modalId = 'editExistingDetailsModal';
    let modal = document.getElementById(modalId);
    
    if (!modal) {
        // Create modal if it doesn't exist
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 1000px; max-height: 90vh;">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> Edit Performance Details for ${operator.name} (${operatorId})</h3>
                    <span class="close-modal" data-modal="${modalId}">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="edit-info" style="margin-bottom: 20px; padding: 20px; background: linear-gradient(135deg, rgba(67, 97, 238, 0.1), rgba(76, 201, 240, 0.05)); border-radius: 12px; border-left: 4px solid var(--primary-color);">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                            <div>
                                <div style="font-size: 0.85rem; color: var(--text-secondary);">Total Records</div>
                                <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color);">${operatorRecords.length}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.85rem; color: var(--text-secondary);">Current Grade</div>
                                <div style="font-size: 1.5rem; font-weight: 700; color: var(--success-color);">${calculateMultiSkillGrade(operatorId)}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.85rem; color: var(--text-secondary);">Average Efficiency</div>
                                <div style="font-size: 1.5rem; font-weight: 700; color: var(--accent-color);">${getOperatorAverageEfficiency(operatorId).toFixed(1)}%</div>
                            </div>
                            <div>
                                <div style="font-size: 0.85rem; color: var(--text-secondary);">Sew Line</div>
                                <div style="font-size: 1.5rem; font-weight: 700; color: var(--warning-color);">${operator.sewLine || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="performance-table-wrapper" style="max-height: 400px; margin-bottom: 20px;">
                        <table class="performance-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Operation</th>
                                    <th>Machine</th>
                                    <th>Other Machines</th>
                                    <th>Other Machines Efficiency</th>
                                    <th>Std SMV</th>
                                    <th>Working SMV</th>
                                    <th>Efficiency</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="editExistingDetailsBody">
                            </tbody>
                        </table>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.1);">
                        <h4 style="margin-bottom: 15px; color: var(--text-primary);"><i class="fas fa-lightbulb"></i> Quick Tips</h4>
                        <ul style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; padding-left: 20px;">
                            <li>Click on any cell to edit the value</li>
                            <li>For Other Machines, use format: "Machine1, Machine2, Machine3"</li>
                            <li>For Other Machines Efficiency, use format: "Eff1%, Eff2%, Eff3%"</li>
                            <li>Changes are saved automatically when you click "Save Changes" button</li>
                        </ul>
                    </div>
                </div>
                <div class="modal-footer" style="padding: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1); display: flex; justify-content: space-between; align-items: center;">
                    <div style="color: var(--text-secondary); font-size: 0.9rem;">
                        <i class="fas fa-info-circle" style="color: var(--primary-color); margin-right: 5px;"></i>
                        Editing ${operatorRecords.length} performance records
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-secondary" id="closeEditExistingModal">
                            <i class="fas fa-times"></i> Close
                        </button>
                        <button class="btn btn-primary" id="saveAllChangesBtn">
                            <i class="fas fa-save"></i> Save All Changes
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add close event
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.classList.remove('active');
        });
        
        // Add close button event
        modal.querySelector('#closeEditExistingModal').addEventListener('click', () => {
            modal.classList.remove('active');
        });
        
        // Add save all changes button event
        modal.querySelector('#saveAllChangesBtn').addEventListener('click', async () => {
            await saveAllEditedRecords(modal, operatorId);
        });
    }
    
    // Populate table with operator's performance records
    const tbody = modal.querySelector('#editExistingDetailsBody');
    tbody.innerHTML = '';
    
    operatorRecords.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.timestamp ? record.timestamp.toLocaleString() : 'N/A'}</td>
            <td><input type="text" class="edit-field" data-field="operation" data-id="${record.id}" value="${record.operation || ''}" style="width: 100%; padding: 8px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; color: var(--text-primary);"></td>
            <td>
                <select class="edit-field" data-field="machineName" data-id="${record.id}" style="width: 100%; padding: 8px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; color: var(--text-primary);">
                    <option value="">Select Machine</option>
                    ${completeMachineList.map(machine => 
                        `<option value="${machine}" ${record.machineName === machine ? 'selected' : ''}>${machine.replace(/_/g, ' ')}</option>`
                    ).join('')}
                </select>
            </td>
            <td><input type="text" class="edit-field" data-field="otherMachines" data-id="${record.id}" value="${record.otherMachines || ''}" placeholder="Machine1, Machine2, Machine3" style="width: 100%; padding: 8px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; color: var(--text-primary);"></td>
            <td><input type="text" class="edit-field" data-field="otherMachineEfficiencies" data-id="${record.id}" value="${record.otherMachineEfficiencies || ''}" placeholder="85%, 70%, 60%" style="width: 100%; padding: 8px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; color: var(--text-primary);"></td>
            <td><input type="number" step="0.01" class="edit-field" data-field="standardSMV" data-id="${record.id}" value="${record.standardSMV || 0}" style="width: 100%; padding: 8px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; color: var(--text-primary);"></td>
            <td><input type="number" step="0.01" class="edit-field" data-field="workingSMV" data-id="${record.id}" value="${record.workingSMV || 0}" style="width: 100%; padding: 8px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; color: var(--text-primary);"></td>
            <td><input type="number" step="0.1" class="edit-field" data-field="efficiency" data-id="${record.id}" value="${record.efficiency || 0}" style="width: 100%; padding: 8px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; color: var(--text-primary);"></td>
            <td>
                <button class="btn-icon save-single-edit" data-id="${record.id}" title="Save This Record" style="background: rgba(76, 201, 240, 0.2); border-color: rgba(76, 201, 240, 0.3); color: var(--success-color);">
                    <i class="fas fa-save"></i>
                </button>
                <button class="btn-icon recalculate-efficiency" data-id="${record.id}" title="Recalculate Efficiency" style="background: rgba(67, 97, 238, 0.2); border-color: rgba(67, 97, 238, 0.3); color: var(--primary-color);">
                    <i class="fas fa-calculator"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Add event listeners for edit buttons
    tbody.querySelectorAll('.save-single-edit').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const recordId = e.target.closest('button').getAttribute('data-id');
            await saveEditedRecord(recordId, modal, operatorId);
        });
    });
    
    tbody.querySelectorAll('.recalculate-efficiency').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const recordId = e.target.closest('button').getAttribute('data-id');
            await recalculateEfficiency(recordId, modal);
        });
    });
    
    // Show modal
    modal.classList.add('active');
}

// NEW: Save edited record - UPDATED for v17 with other machine efficiencies
async function saveEditedRecord(recordId, modal, operatorId) {
    try {
        const record = performanceData.find(r => r.id === recordId);
        if (!record) {
            showToast('Record not found!', 'error');
            return;
        }
        
        // Get all edited fields for this record
        const row = modal.querySelector(`[data-id="${recordId}"]`).closest('tr');
        const editedData = {};
        
        row.querySelectorAll('.edit-field').forEach(field => {
            const fieldName = field.getAttribute('data-field');
            let value = field.value;
            
            // Convert numeric fields
            if (['standardSMV', 'workingSMV', 'efficiency'].includes(fieldName)) {
                value = parseFloat(value) || 0;
            }
            
            editedData[fieldName] = value;
        });
        
        // Update machine skill if machine name changed
        if (editedData.machineName && editedData.machineName !== record.machineName) {
            const efficiency = editedData.efficiency || record.efficiency || 0;
            updateOperatorMachineSkill(record.operatorId, editedData.machineName, efficiency);
        }
        
        // Update record in Firestore
        const recordRef = doc(db, 'performance', recordId);
        await updateDoc(recordRef, {
            operation: editedData.operation || record.operation,
            machineName: editedData.machineName || record.machineName,
            otherMachines: editedData.otherMachines || record.otherMachines,
            otherMachineEfficiencies: editedData.otherMachineEfficiencies || record.otherMachineEfficiencies,
            standardSMV: editedData.standardSMV || record.standardSMV,
            workingSMV: editedData.workingSMV || record.workingSMV,
            efficiency: editedData.efficiency || record.efficiency,
            lastUpdated: serverTimestamp()
        });
        
        showToast('Record updated successfully!');
        
        // Update operator grade
        updateOperatorGrade(record.operatorId);
        
    } catch (error) {
        console.error('Error saving edited record:', error);
        showToast('Error saving record: ' + error.message, 'error');
    }
}

// NEW: Save all edited records
async function saveAllEditedRecords(modal, operatorId) {
    try {
        const records = modal.querySelectorAll('#editExistingDetailsBody tr');
        let saveCount = 0;
        
        for (const row of records) {
            const recordId = row.querySelector('.save-single-edit')?.getAttribute('data-id');
            if (recordId) {
                await saveEditedRecord(recordId, modal, operatorId);
                saveCount++;
            }
        }
        
        showToast(`Successfully saved ${saveCount} records!`);
        
        // Close modal after a delay
        setTimeout(() => {
            modal.classList.remove('active');
        }, 1500);
        
    } catch (error) {
        console.error('Error saving all records:', error);
        showToast('Error saving records: ' + error.message, 'error');
    }
}

// NEW: Recalculate efficiency based on standard and working SMV
async function recalculateEfficiency(recordId, modal) {
    try {
        const record = performanceData.find(r => r.id === recordId);
        if (!record) {
            showToast('Record not found!', 'error');
            return;
        }
        
        const row = modal.querySelector(`[data-id="${recordId}"]`).closest('tr');
        const standardSMVInput = row.querySelector('[data-field="standardSMV"]');
        const workingSMVInput = row.querySelector('[data-field="workingSMV"]');
        const efficiencyInput = row.querySelector('[data-field="efficiency"]');
        
        const standardSMV = parseFloat(standardSMVInput.value) || 0;
        const workingSMV = parseFloat(workingSMVInput.value) || 0;
        
        if (standardSMV > 0 && workingSMV > 0) {
            const efficiency = (standardSMV / workingSMV) * 100;
            efficiencyInput.value = efficiency.toFixed(1);
            showToast('Efficiency recalculated!');
        } else {
            showToast('Please enter valid SMV values', 'error');
        }
    } catch (error) {
        console.error('Error recalculating efficiency:', error);
        showToast('Error recalculating efficiency: ' + error.message, 'error');
    }
}

// Highlight new operator after adding
function highlightNewOperator(operatorId) {
    lastAddedOperatorId = operatorId;
    
    // Switch to operators tab
    const operatorsTab = document.querySelector('.nav-item[data-tab="operators"]');
    if (operatorsTab) operatorsTab.click();
    
    // Scroll to the operator
    setTimeout(() => {
        const rows = document.querySelectorAll('#operatorsBody tr');
        rows.forEach(row => {
            const operatorIdCell = row.querySelector('.operator-id');
            if (operatorIdCell && operatorIdCell.textContent === operatorId) {
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                row.classList.add('new-operator-highlight');
                
                // Remove highlight after 5 seconds
                setTimeout(() => {
                    row.classList.remove('new-operator-highlight');
                    lastAddedOperatorId = null;
                }, 5000);
            }
        });
    }, 500);
}

// Show group operators modal v16
function showGroupOperators(group, source = 'dashboard') {
    let filteredOperators = operators.filter(operator => {
        const multiSkillGrade = calculateMultiSkillGrade(operator.operatorId);
        return multiSkillGrade === group;
    });
    
    // Apply line filter if selected
    const lineFilterId = source === 'dashboard' ? 'dashboardLineSelect' : 'operatorsLineFilter';
    const selectedLine = document.getElementById(lineFilterId)?.value;
    
    if (selectedLine) {
        filteredOperators = filteredOperators.filter(op => op.sewLine === selectedLine);
    }
    
    if (filteredOperators.length === 0) {
        showToast(`No operators found in ${group}${selectedLine ? ` for line ${selectedLine}` : ''}`, 'error');
        return;
    }
    
    // Calculate average efficiency for the group
    let totalEfficiency = 0;
    let efficiencyCount = 0;
    
    filteredOperators.forEach(operator => {
        const operatorEfficiency = getOperatorAverageEfficiency(operator.operatorId);
        if (operatorEfficiency > 0) {
            totalEfficiency += operatorEfficiency;
            efficiencyCount++;
        }
    });
    
    const avgEfficiency = efficiencyCount > 0 ? (totalEfficiency / efficiencyCount) : 0;
    
    // Update modal title and info
    elements.groupModalTitle.textContent = `${group} Operators${selectedLine ? ` - Line ${selectedLine}` : ''}`;
    elements.groupOperatorCount.textContent = filteredOperators.length;
    elements.groupAvgEfficiency.textContent = avgEfficiency.toFixed(1) + '%';
    
    // Set group description
    let description = '';
    if (group === 'Group A') {
        description = 'Grade A: 3+ machine types, with at least 1 machine at A grade, others at B or C';
    } else if (group === 'Group B') {
        description = 'Grade B: 2+ machine types, with at least 1 machine at B grade, the other at C';
    } else if (group === 'Group C') {
        description = 'Grade C: 2 machine types, both at C grade';
    } else {
        description = 'Grade D: Only manual operations, but can handle 1 machine at D grade';
    }
    elements.groupDescription.textContent = description;
    
    // Render group operators
    renderGroupOperatorsList(filteredOperators, 'skillScore');
    
    // Show modal
    document.getElementById('groupOperatorsModal').classList.add('active');
}

// Render group operators list with sorting
function renderGroupOperatorsList(operatorsList, sortBy = 'skillScore') {
    if (!elements.groupOperatorsList) return;
    
    // Sort operators
    let sortedOperators = [...operatorsList];
    
    switch (sortBy) {
        case 'skillScore':
            sortedOperators.sort((a, b) => {
                const scoreA = calculateSkillScore(a.operatorId);
                const scoreB = calculateSkillScore(b.operatorId);
                return scoreB - scoreA;
            });
            break;
        case 'efficiency':
            sortedOperators.sort((a, b) => {
                const effA = getOperatorAverageEfficiency(a.operatorId);
                const effB = getOperatorAverageEfficiency(b.operatorId);
                return effB - effA;
            });
            break;
        case 'name':
            sortedOperators.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'line':
            sortedOperators.sort((a, b) => (a.sewLine || '').localeCompare(b.sewLine || ''));
            break;
    }
    
    // Apply search filter
    const searchInput = document.getElementById('groupSearchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    if (searchTerm) {
        sortedOperators = sortedOperators.filter(operator =>
            (operator.operatorId && operator.operatorId.toLowerCase().includes(searchTerm)) ||
            (operator.name && operator.name.toLowerCase().includes(searchTerm)) ||
            (operator.sewLine && operator.sewLine.toLowerCase().includes(searchTerm))
        );
    }
    
    // Populate operators list
    elements.groupOperatorsList.innerHTML = '';
    
    if (sortedOperators.length === 0) {
        elements.groupOperatorsList.innerHTML = `
            <div style="text-align: center; padding: 30px; color: var(--text-secondary);">
                <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                <p>No operators found matching your criteria</p>
            </div>
        `;
        return;
    }
    
    sortedOperators.forEach(operator => {
        const operatorEfficiency = getOperatorAverageEfficiency(operator.operatorId);
        const efficiencyClass = operatorEfficiency >= 85 ? 'high' :
                             operatorEfficiency >= 70 ? 'medium' : 'low';
        const skillScore = calculateSkillScore(operator.operatorId);
        
        const operatorItem = document.createElement('div');
        operatorItem.className = 'group-operator-item';
        operatorItem.innerHTML = `
            <div class="group-operator-info">
                <div class="group-operator-id">${operator.operatorId}</div>
                <div class="group-operator-name">${operator.name}</div>
                <div class="group-operator-line">${operator.sewLine || 'No line assigned'}</div>
            </div>
            <div class="group-operator-stats">
                <div class="group-operator-efficiency ${efficiencyClass}">
                    ${operatorEfficiency.toFixed(1)}%
                </div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">
                    Score: ${skillScore.toFixed(2)}
                </div>
                <button class="btn-icon time-study-operator" data-id="${operator.operatorId}" title="Start Time Study">
                    <i class="fas fa-stopwatch"></i>
                </button>
            </div>
        `;
        elements.groupOperatorsList.appendChild(operatorItem);
    });
    
    // Add event listeners for time study buttons
    document.querySelectorAll('#groupOperatorsList .time-study-operator').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const operatorId = e.target.closest('button').getAttribute('data-id');
            closeModal('groupOperatorsModal');
            startTimeStudyForOperator(operatorId);
        });
    });
}

// Get operator average efficiency
function getOperatorAverageEfficiency(operatorId) {
    const operatorRecords = performanceData.filter(record => record.operatorId === operatorId);
    if (operatorRecords.length === 0) return 0;
    
    const totalEfficiency = operatorRecords.reduce((sum, record) => sum + (record.efficiency || 0), 0);
    return totalEfficiency / operatorRecords.length;
}

// Start time study for specific operator
function startTimeStudyForOperator(operatorId) {
    const operator = operators.find(op => op.operatorId === operatorId);
    if (!operator) {
        showToast('Operator not found!', 'error');
        return;
    }
    
    // Switch to time study tab
    const timeStudyTab = document.querySelector('.nav-item[data-tab="time-study"]');
    if (timeStudyTab) timeStudyTab.click();
    
    // Set the operator in the dropdown
    const studyOperatorId = document.getElementById('studyOperatorId');
    if (studyOperatorId) {
        studyOperatorId.value = operatorId;
    }
    
    // Set the line number if operator has a sew line
    if (operator.sewLine) {
        elements.studyLineNo.value = operator.sewLine;
    }
    
    // Focus on operation name field
    const studyOperation = document.getElementById('studyOperation');
    if (studyOperation) studyOperation.focus();
    
    showToast(`Time study ready for ${operator.name}. Enter line number and operation details to begin.`, 'success');
}

// Calculate skill score based on overall efficiency
function calculateSkillScore(operatorId) {
    const operatorPerformances = performanceData.filter(p => p.operatorId === operatorId);
    if (operatorPerformances.length === 0) return 0;
    
    let totalEfficiency = 0;
    let count = 0;
    
    operatorPerformances.forEach(perf => {
        if (perf.efficiency) {
            totalEfficiency += perf.efficiency;
            count++;
        }
    });
    
    const avgEfficiency = count > 0 ? totalEfficiency / count : 0;
    
    // Convert efficiency to skill score (0.0 - 1.0)
    if (avgEfficiency >= 90) return 0.9 + (avgEfficiency - 90) * 0.01;
    else if (avgEfficiency >= 80) return 0.7 + (avgEfficiency - 80) * 0.02;
    else if (avgEfficiency >= 70) return 0.4 + (avgEfficiency - 70) * 0.03;
    else if (avgEfficiency >= 60) return 0.2 + (avgEfficiency - 60) * 0.02;
    else return avgEfficiency * 0.0033;
}

// Get skill score class based on value
function getSkillScoreClass(score) {
    if (score >= 0.67) return 'group-a';
    else if (score >= 0.34) return 'group-b';
    else if (score >= 0.1) return 'group-c';
    else return 'group-d';
}

// Render performance table with edit button v16 - UPDATED for v17: Action buttons in dropdown
function renderPerformanceTable(filteredData = performanceData) {
    if (!elements.performanceBody) return;
    
    elements.performanceBody.innerHTML = '';
    
    if (filteredData.length === 0) {
        elements.performanceBody.innerHTML = `
            <tr>
                <td colspan="14" style="text-align: center; padding: 50px;">
                    <i class="fas fa-chart-line" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 15px; display: block;"></i>
                    <h3 style="color: var(--text-secondary); margin-bottom: 10px;">No Performance Data Found</h3>
                    <p style="color: var(--text-secondary);">Add your first performance record to get started</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Show all performance records with scroll
    filteredData.forEach(record => {
        const formattedDate = record.timestamp ? record.timestamp.toLocaleString() : 'N/A';
        const efficiency = record.efficiency || 0;
        const efficiencyClass = efficiency >= 85 ? 'efficiency-high' :
                              efficiency >= 70 ? 'efficiency-medium' : 'efficiency-low';
        
        // Get machine name
        let machineName = record.machineName || '-';
        if (record.machineName === 'Others' && record.customMachineName) {
            machineName = record.customMachineName;
        }
        
        // Get other machines
        const otherMachines = record.otherMachines || '-';
        const otherMachineEfficiencies = record.otherMachineEfficiencies || '-';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${record.lineNo || '-'}</td>
            <td>${record.styleNo || '-'}</td>
            <td>${record.productDesc || '-'}</td>
            <td>${record.operatorId || '-'}</td>
            <td>${record.operatorName || '-'}</td>
            <td>${record.operation || '-'}</td>
            <td>${machineName}</td>
            <td>${otherMachines}</td>
            <td>${record.standardSMV ? record.standardSMV.toFixed(2) : '-'}</td>
            <td class="working-smv-cell">
                <button class="working-smv-btn" data-id="${record.id}">
                    ${record.workingSMV ? record.workingSMV.toFixed(2) : '0.00'}
                </button>
            </td>
            <td class="${efficiencyClass}">${efficiency ? efficiency.toFixed(1) + '%' : '-'}</td>
            <td>${otherMachineEfficiencies}</td>
            <td>
                <div class="action-dropdown">
                    <button class="btn-icon action-dropdown-toggle" title="Actions">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="action-dropdown-menu">
                        <button class="action-dropdown-item delete-perf-btn" data-id="${record.id}">
                            <i class="fas fa-trash"></i> Delete Record
                        </button>
                        <button class="action-dropdown-item edit-perf-btn" data-id="${record.id}">
                            <i class="fas fa-edit"></i> Edit Record
                        </button>
                    </div>
                </div>
            </td>
        `;
        elements.performanceBody.appendChild(row);
    });
    
    // Add event listeners
    document.querySelectorAll('.working-smv-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const recordId = e.target.closest('button').getAttribute('data-id');
            showCycleTimesDetail(recordId);
        });
    });
    
    // Setup action dropdowns
    document.querySelectorAll('.action-dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = toggle.nextElementSibling;
            const isVisible = dropdown.style.display === 'block';
            
            // Hide all other dropdowns
            document.querySelectorAll('.action-dropdown-menu').forEach(menu => {
                menu.style.display = 'none';
            });
            
            // Toggle this dropdown
            dropdown.style.display = isVisible ? 'none' : 'block';
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.action-dropdown-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    });
    
    // Add event listeners for dropdown items
    document.querySelectorAll('.delete-perf-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.closest('button').getAttribute('data-id');
            if (confirm('Are you sure you want to delete this performance record?')) {
                await deletePerformanceRecord(id);
            }
        });
    });
    
    document.querySelectorAll('.edit-perf-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const recordId = e.target.closest('button').getAttribute('data-id');
            openEditPerformanceModal(recordId);
        });
    });
}

// Open edit performance modal
function openEditPerformanceModal(recordId) {
    const record = performanceData.find(r => r.id === recordId);
    if (!record) return;
    
    const editRecordId = document.getElementById('editRecordId');
    const editRecordOperator = document.getElementById('editRecordOperator');
    const editRecordStdSMV = document.getElementById('editRecordStdSMV');
    const editRecordWorkingSMV = document.getElementById('editRecordWorkingSMV');
    const editRecordCycleTimes = document.getElementById('editRecordCycleTimes');
    
    if (editRecordId) editRecordId.textContent = recordId;
    if (editRecordOperator) editRecordOperator.textContent = `${record.operatorName} (${record.operatorId})`;
    if (editRecordStdSMV) editRecordStdSMV.value = record.standardSMV || 0;
    if (editRecordWorkingSMV) editRecordWorkingSMV.value = record.workingSMV || 0;
    if (editRecordCycleTimes) editRecordCycleTimes.value = record.cycleTimes ? record.cycleTimes.join(', ') : '';
    
    document.getElementById('editPerformanceModal').classList.add('active');
}

// Open edit modal
function openEditModal(operatorId) {
    const operator = operators.find(op => op.operatorId === operatorId);
    if (!operator) {
        showToast('Operator not found!', 'error');
        return;
    }
    
    selectedOperatorId = operatorId;
    const editOperatorId = document.getElementById('editOperatorId');
    const editOperatorName = document.getElementById('editOperatorName');
    const editSewLine = document.getElementById('editSewLine');
    const editSkillLevel = document.getElementById('editSkillLevel');
    const editSkillScore = document.getElementById('editSkillScore');
    const scoreSlider = document.getElementById('scoreSlider');
    
    if (editOperatorId) editOperatorId.textContent = operatorId;
    if (editOperatorName) editOperatorName.textContent = operator.name || '';
    if (editSewLine) editSewLine.value = operator.sewLine || '';
    
    // Calculate multi-skill grade
    const multiSkillGrade = calculateMultiSkillGrade(operatorId);
    if (editSkillLevel) editSkillLevel.value = multiSkillGrade;
    
    // Calculate and set skill score
    const skillScore = calculateSkillScore(operatorId);
    if (editSkillScore) editSkillScore.value = skillScore.toFixed(2);
    if (scoreSlider) scoreSlider.value = Math.round(skillScore * 100);
    
    document.getElementById('editCellModal').classList.add('active');
}

// View operator performance records
function viewOperatorPerformance(operatorId) {
    const operator = operators.find(op => op.operatorId === operatorId);
    if (!operator) {
        showToast('Operator not found!', 'error');
        return;
    }
    
    const operatorRecords = performanceData.filter(record => record.operatorId === operatorId);
    
    if (operatorRecords.length === 0) {
        showToast(`No performance records found for operator ${operator.name}. Create one in the time study tab.`, 'error');
        return;
    }
    
    // Switch to performance tab
    const performanceTab = document.querySelector('.nav-item[data-tab="performance"]');
    if (performanceTab) performanceTab.click();
    
    // Filter by operator
    const searchPerformance = document.getElementById('searchPerformance');
    if (searchPerformance) {
        searchPerformance.value = operatorId;
        filterPerformanceData();
    }
    
    // Highlight the records
    setTimeout(() => {
        const rows = document.querySelectorAll('#performanceBody tr');
        rows.forEach((row, index) => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 4 && cells[4].textContent === operatorId) {
                row.classList.add('highlight-row');
                
                // Remove highlight after 3 seconds
                setTimeout(() => {
                    row.classList.remove('highlight-row');
                }, 3000);
            }
        });
        
        showToast(`Showing ${operatorRecords.length} performance records for ${operator.name}`, 'success');
    }, 500);
}

// Filter operators v16
function filterOperators() {
    let filtered = operators;
    const searchTerm = elements.searchInput ? elements.searchInput.value.toLowerCase() : '';
    const skillLevel = elements.skillFilter ? elements.skillFilter.value : '';
    const sewLine = elements.lineFilter ? elements.lineFilter.value : '';
    
    if (searchTerm) {
        filtered = filtered.filter(operator =>
            (operator.operatorId && operator.operatorId.toLowerCase().includes(searchTerm)) ||
            (operator.name && operator.name.toLowerCase().includes(searchTerm)) ||
            (operator.sewLine && operator.sewLine.toLowerCase().includes(searchTerm))
        );
    }
    
    if (skillLevel) {
        filtered = filtered.filter(operator => {
            const multiSkillGrade = calculateMultiSkillGrade(operator.operatorId);
            return multiSkillGrade === skillLevel;
        });
    }
    
    if (sewLine) {
        filtered = filtered.filter(operator =>
            operator.sewLine && operator.sewLine.toLowerCase().includes(sewLine.toLowerCase())
        );
    }
    
    renderOperatorsTable(filtered);
}

// Filter performance data v16
function filterPerformanceData() {
    const searchTerm = document.getElementById('searchPerformance')?.value.toLowerCase() || '';
    const lineFilter = document.getElementById('perfLineFilter')?.value || '';
    const dateFilter = document.getElementById('dateFilter')?.value || '';
    
    let filtered = performanceData;
    
    if (searchTerm) {
        filtered = filtered.filter(record =>
            (record.operatorId && record.operatorId.toLowerCase().includes(searchTerm)) ||
            (record.operatorName && record.operatorName.toLowerCase().includes(searchTerm)) ||
            (record.styleNo && record.styleNo.toLowerCase().includes(searchTerm)) ||
            (record.productDesc && record.productDesc.toLowerCase().includes(searchTerm))
        );
    }
    
    if (lineFilter) {
        filtered = filtered.filter(record => record.lineNo === lineFilter);
    }
    
    if (dateFilter) {
        const now = new Date();
        filtered = filtered.filter(record => {
            const recordDate = new Date(record.timestamp);
            switch (dateFilter) {
                case 'today':
                    return recordDate.toDateString() === now.toDateString();
                case 'week':
                    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                    return recordDate >= weekStart;
                case 'month':
                    return recordDate.getMonth() === now.getMonth() &&
                           recordDate.getFullYear() === now.getFullYear();
                default:
                    return true;
            }
        });
    }
    
    renderPerformanceTable(filtered);
}

// Save operator with skill score
async function saveOperator(operatorData, isEdit = false) {
    try {
        let result;
        
        if (isEdit) {
            // Find the operator document
            const operator = operators.find(op => op.operatorId === selectedOperatorId);
            if (!operator) {
                throw new Error('Operator not found');
            }
            
            const operatorRef = doc(db, 'operators', operator.id);
            
            // Calculate skill score from performance
            const skillScore = calculateSkillScore(selectedOperatorId);
            
            result = await updateDoc(operatorRef, {
                sewLine: operatorData.sewLine,
                skillLevel: operatorData.skillLevel,
                skillScore: skillScore,
                lastUpdated: serverTimestamp()
            });
            
            showToast('Operator updated successfully!');
        } else {
            // Check if operator ID already exists
            const existingOperator = operators.find(op => op.operatorId === operatorData.operatorId);
            if (existingOperator) {
                throw new Error('Operator ID already exists!');
            }
            
            const docRef = doc(collection(db, 'operators'));
            result = await setDoc(docRef, {
                operatorId: operatorData.operatorId,
                name: operatorData.name,
                sewLine: operatorData.sewLine || null,
                skillLevel: operatorData.skillLevel || null,
                skillScore: 0,
                createdAt: serverTimestamp(),
                lastUpdated: serverTimestamp()
            });
            
            // Set last added operator for highlighting
            lastAddedOperatorId = operatorData.operatorId;
            
            showToast('Operator added successfully!');
        }
        
        return true;
    } catch (error) {
        console.error('Error saving operator:', error);
        showToast('Error: ' + error.message, 'error');
        return false;
    }
}

// Update operator grade in operators table
function updateOperatorGrade(operatorId) {
    // This will be reflected when the operators table is re-rendered
    renderOperatorsTable();
    updateDashboardStats();
}

// Delete operator
async function deleteOperator(operatorId) {
    if (!confirm(`Are you sure you want to delete operator ${operatorId}?`)) {
        return;
    }
    
    try {
        const operator = operators.find(op => op.operatorId === operatorId);
        if (!operator) {
            throw new Error('Operator not found');
        }
        
        await deleteDoc(doc(db, 'operators', operator.id));
        showToast('Operator deleted successfully!');
    } catch (error) {
        console.error('Error deleting operator:', error);
        showToast('Error deleting operator: ' + error.message, 'error');
    }
}

// Reset time study form
function resetTimeStudyForm() {
    // Don't clear line number, style, and product desc
    // Let them be auto-filled when user enters line number
    
    const studyOperatorId = document.getElementById('studyOperatorId');
    const studyOperation = document.getElementById('studyOperation');
    const studyMachine = document.getElementById('studyMachine');
    const customMachineName = document.getElementById('customMachineName');
    const customMachineRow = document.getElementById('customMachineRow');
    const standardSMV = document.getElementById('standardSMV');
    
    if (studyOperatorId) studyOperatorId.value = '';
    // Keep line number field for auto-fill
    if (studyOperation) studyOperation.value = '';
    if (studyMachine) studyMachine.value = '';
    if (customMachineName) customMachineName.value = '';
    if (customMachineRow) customMachineRow.style.display = 'none';
    if (standardSMV) standardSMV.value = '';
    
    // Clear other machines
    const selectedOtherMachines = document.getElementById('selectedOtherMachines');
    if (selectedOtherMachines) selectedOtherMachines.innerHTML = '';
    
    // Reset stopwatch
    resetStopwatch();
    
    // Reset manual inputs
    const manualCycleInputs = document.getElementById('manualCycleInputs');
    if (manualCycleInputs) manualCycleInputs.style.display = 'none';
    
    document.querySelectorAll('.manual-cycle-time').forEach(input => {
        input.value = '';
    });
    
    // Hide allowance info
    if (elements.allowanceInfo) {
        elements.allowanceInfo.style.display = 'none';
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    if (!elements.notificationToast || !elements.toastMessage) return;
    
    elements.toastMessage.textContent = message;
    const toast = elements.notificationToast;
    const icon = toast.querySelector('i');
    
    toast.className = 'toast';
    if (type === 'error') {
        toast.classList.add('toast-error');
        icon.className = 'fas fa-exclamation-circle';
    } else {
        toast.classList.add('toast-success');
        icon.className = 'fas fa-check-circle';
    }
    
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Enhanced Working SMV breakdown modal
function showCycleTimesDetail(recordId) {
    const record = performanceData.find(r => r.id === recordId);
    if (!record) return;
    
    // Populate modal with data
    const detailOperatorName = document.getElementById('detailOperatorName');
    const detailOperation = document.getElementById('detailOperation');
    const detailStdSMV = document.getElementById('detailStdSMV');
    const detailWorkingSMV = document.getElementById('detailWorkingSMV');
    const detailEfficiency = document.getElementById('detailEfficiency');
    const detailVariance = document.getElementById('detailVariance');
    const cycleTimesList = document.getElementById('cycleTimesList');
    
    if (detailOperatorName) detailOperatorName.textContent = record.operatorName || 'Unknown';
    if (detailOperation) detailOperation.textContent = record.operation || 'Unknown';
    if (detailStdSMV) detailStdSMV.textContent = record.standardSMV ? record.standardSMV.toFixed(2) : '0.00';
    if (detailWorkingSMV) detailWorkingSMV.textContent = record.workingSMV ? record.workingSMV.toFixed(2) : '0.00';
    if (detailEfficiency) detailEfficiency.textContent = record.efficiency ? record.efficiency.toFixed(1) + '%' : '0%';
    
    // Calculate variance
    const variance = record.standardSMV > 0 ? 
        ((record.workingSMV - record.standardSMV) / record.standardSMV) * 100 : 0;
    if (detailVariance) detailVariance.textContent = variance.toFixed(1) + '%';
    
    // Populate cycle times list
    if (cycleTimesList) {
        cycleTimesList.innerHTML = '';
        
        if (record.cycleTimes && record.cycleTimes.length > 0) {
            let totalTime = 0;
            record.cycleTimes.forEach((time, index) => {
                totalTime += time;
                const row = document.createElement('div');
                row.className = 'lap-item';
                row.innerHTML = `
                    <div class="lap-number">Cycle ${index + 1}</div>
                    <div class="lap-time">${time.toFixed(3)} seconds</div>
                `;
                cycleTimesList.appendChild(row);
            });
            
            // Add average
            const avgRow = document.createElement('div');
            avgRow.className = 'lap-item';
            avgRow.style.backgroundColor = 'rgba(76, 201, 240, 0.1)';
            avgRow.innerHTML = `
                <div class="lap-number"><strong>Average</strong></div>
                <div class="lap-time"><strong>${(totalTime / record.cycleTimes.length).toFixed(3)} seconds</strong></div>
            `;
            cycleTimesList.appendChild(avgRow);
        } else {
            cycleTimesList.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 20px;">No cycle time data available</div>';
        }
    }
    
    // Show modal
    document.getElementById('cycleDetailModal').classList.add('active');
}

// Setup multi-select for other machines - UPDATED for v17 with all machines
function setupMultiSelect() {
    // Setup for time study
    const otherMachinesOptions = document.getElementById('otherMachinesOptions');
    const perfOtherMachinesOptions = document.getElementById('perfOtherMachinesOptions');
    const editPerfOtherMachinesOptions = document.getElementById('editPerfOtherMachinesOptions');
    
    // Clear existing options
    if (otherMachinesOptions) otherMachinesOptions.innerHTML = '';
    if (perfOtherMachinesOptions) perfOtherMachinesOptions.innerHTML = '';
    if (editPerfOtherMachinesOptions) editPerfOtherMachinesOptions.innerHTML = '';
    
    // Add all machines from the complete list
    completeMachineList.forEach(machine => {
        const displayName = machine.replace(/_/g, ' ');
        
        // Time study
        if (otherMachinesOptions) {
            const option1 = document.createElement('div');
            option1.className = 'multi-select-option';
            option1.innerHTML = `
                <input type="checkbox" value="${machine}">
                <span>${displayName}</span>
            `;
            otherMachinesOptions.appendChild(option1);
        }
        
        // Performance modal
        if (perfOtherMachinesOptions) {
            const option2 = document.createElement('div');
            option2.className = 'multi-select-option';
            option2.innerHTML = `
                <input type="checkbox" value="${machine}">
                <span>${displayName}</span>
            `;
            perfOtherMachinesOptions.appendChild(option2);
        }
        
        // Edit performance modal
        if (editPerfOtherMachinesOptions) {
            const option3 = document.createElement('div');
            option3.className = 'multi-select-option';
            option3.innerHTML = `
                <input type="checkbox" value="${machine}">
                <span>${displayName}</span>
            `;
            editPerfOtherMachinesOptions.appendChild(option3);
        }
    });
    
    // Add event listeners for multi-select
    setupMultiSelectEvents('otherMachinesSelect', 'otherMachinesOptions', 'selectedOtherMachines');
    setupMultiSelectEvents('perfOtherMachinesSelect', 'perfOtherMachinesOptions', 'perfSelectedOtherMachines');
    setupMultiSelectEvents('editPerfOtherMachinesSelect', 'editPerfOtherMachinesOptions', 'editPerfSelectedOtherMachines');
}

function setupMultiSelectEvents(selectId, optionsId, selectedId) {
    const select = document.getElementById(selectId);
    const options = document.getElementById(optionsId);
    const selected = document.getElementById(selectedId);
    
    if (!select || !options || !selected) return;
    
    const display = select.querySelector('.multi-select-display');
    if (display) {
        display.addEventListener('click', () => {
            options.classList.toggle('show');
        });
    }
    
    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!select.contains(e.target)) {
            options.classList.remove('show');
        }
    });
    
    // Handle checkbox changes
    options.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            const value = e.target.value;
            const checked = e.target.checked;
            
            if (checked) {
                // Add tag
                const tag = document.createElement('div');
                tag.className = 'selected-tag';
                tag.innerHTML = `
                    ${value.replace(/_/g, ' ')}
                    <i class="fas fa-times" data-value="${value}"></i>
                `;
                selected.appendChild(tag);
            } else {
                // Remove tag
                const tag = selected.querySelector(`.selected-tag i[data-value="${value}"]`)?.parentElement;
                if (tag) {
                    tag.remove();
                }
            }
        }
    });
    
    // Handle tag removal
    selected.addEventListener('click', (e) => {
        if (e.target.classList.contains('fa-times')) {
            const value = e.target.getAttribute('data-value');
            const checkbox = options.querySelector(`input[value="${value}"]`);
            if (checkbox) {
                checkbox.checked = false;
            }
            e.target.parentElement.remove();
        }
    });
}

// Modal close functions
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Setup manual cycle inputs
function setupManualCycleInputs(count) {
    const manualCycleGrid = document.getElementById('manualCycleGrid');
    if (!manualCycleGrid) return;
    
    manualCycleGrid.innerHTML = '';
    
    for (let i = 1; i <= count; i++) {
        const cycleDiv = document.createElement('div');
        cycleDiv.className = 'cycle-input-group';
        cycleDiv.innerHTML = `
            <label>Cycle ${i} (seconds)</label>
            <input type="number" class="manual-cycle-time" step="0.001" placeholder="e.g., 25.345">
        `;
        manualCycleGrid.appendChild(cycleDiv);
    }
}

// Save performance data from time study WITH MACHINE-SPECIFIC ALLOWANCE
async function saveTimeStudyData() {
    try {
        const operatorId = document.getElementById('studyOperatorId')?.value;
        const operator = operators.find(op => op.operatorId === operatorId);
        if (!operator) {
            showToast('Please select a valid operator', 'error');
            return false;
        }
        
        if (lapTimes.length === 0) {
            showToast('Please record at least one cycle time', 'error');
            return false;
        }
        
        const avgTime = lapTimes.reduce((a, b) => a + b, 0) / lapTimes.length;
        
        // Get machine allowance
        const machineName = document.getElementById('studyMachine')?.value;
        const machineAllowance = machineName ? getMachineAllowance(machineName) : 0;
        const totalAllowance = PERSONAL_ALLOWANCE + CONTINGENCY_ALLOWANCE + machineAllowance;
        
        const workingSMV = (avgTime / 60) * (1 + totalAllowance/100);
        const standardSMV = parseFloat(document.getElementById('standardSMV')?.value);
        
        if (!standardSMV || standardSMV <= 0) {
            showToast('Please enter a valid Standard SMV', 'error');
            return false;
        }
        
        const efficiency = (standardSMV / workingSMV) * 100;
        
        // Get custom machine name if applicable
        let customMachineName = '';
        if (machineName === 'Others') {
            customMachineName = document.getElementById('customMachineName')?.value.trim() || '';
            if (!customMachineName) {
                showToast('Please enter a custom machine name', 'error');
                return false;
            }
        }
        
        // Get other machines with efficiencies
        const otherMachines = [];
        const otherMachineEfficiencies = [];
        const selectedOtherMachines = document.getElementById('selectedOtherMachines');
        if (selectedOtherMachines) {
            selectedOtherMachines.querySelectorAll('.selected-tag').forEach(tag => {
                otherMachines.push(tag.textContent.trim().replace('×', '').replace(/ /g, '_'));
            });
        }
        
        // For each other machine, get efficiency if provided
        // In a real implementation, you would need input fields for each machine's efficiency
        // For now, we'll use a default value or prompt the user
        
        // Update operator machine skill
        updateOperatorMachineSkill(operatorId, machineName === 'Others' ? customMachineName : machineName, efficiency);
        
        // Save performance record
        const docRef = doc(collection(db, 'performance'));
        await setDoc(docRef, {
            timestamp: serverTimestamp(),
            lineNo: elements.studyLineNo?.value || '',
            styleNo: elements.studyStyleNo?.value || '',
            productDesc: elements.studyProductDesc?.value || '',
            operatorId: operatorId,
            operatorName: operator.name,
            operation: document.getElementById('studyOperation')?.value || '',
            machineName: machineName,
            customMachineName: customMachineName,
            standardSMV: standardSMV,
            workingSMV: workingSMV,
            efficiency: efficiency,
            otherMachines: otherMachines.join(', '),
            otherMachineEfficiencies: otherMachineEfficiencies.join(', '),
            cycleTimes: lapTimes,
            avgCycleTime: avgTime,
            personalAllowance: PERSONAL_ALLOWANCE,
            contingencyAllowance: CONTINGENCY_ALLOWANCE,
            machineAllowance: machineAllowance,
            totalAllowance: totalAllowance
        });
        
        showToast('Performance data saved successfully!');
        resetTimeStudyForm();
        return true;
    } catch (error) {
        console.error('Error saving performance data:', error);
        showToast('Error saving data: ' + error.message, 'error');
        return false;
    }
}

// Update performance record with machine-specific allowance
async function updatePerformanceRecord(recordId, formData) {
    try {
        const recordRef = doc(db, 'performance', recordId);
        const record = performanceData.find(r => r.id === recordId);
        
        if (!record) {
            throw new Error('Record not found');
        }
        
        // Parse cycle times
        const cycleTimes = formData.cycleTimes
            .split(',')
            .map(time => parseFloat(time.trim()))
            .filter(time => !isNaN(time));
        
        // Calculate machine allowance
        const machineName = record.machineName || '';
        let machineAllowance = record.machineAllowance || getMachineAllowance(machineName);
        
        // If it's a custom machine, try to get allowance
        if (machineName === 'Others' && record.customMachineName) {
            machineAllowance = getMachineAllowance('Others');
        }
        
        // Recalculate working SMV and efficiency with machine-specific allowance
        const avgTime = cycleTimes.length > 0 ? 
            cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length : 0;
        const totalAllowance = PERSONAL_ALLOWANCE + CONTINGENCY_ALLOWANCE + machineAllowance;
        const workingSMV = (avgTime / 60) * (1 + totalAllowance/100);
        const efficiency = formData.standardSMV > 0 ? 
            (formData.standardSMV / workingSMV) * 100 : 0;
        
        await updateDoc(recordRef, {
            standardSMV: formData.standardSMV,
            workingSMV: workingSMV,
            efficiency: efficiency,
            cycleTimes: cycleTimes,
            avgCycleTime: avgTime,
            personalAllowance: PERSONAL_ALLOWANCE,
            contingencyAllowance: CONTINGENCY_ALLOWANCE,
            machineAllowance: machineAllowance,
            totalAllowance: totalAllowance,
            lastUpdated: serverTimestamp()
        });
        
        showToast('Performance record updated successfully!');
        return true;
    } catch (error) {
        console.error('Error updating record:', error);
        showToast('Error updating record: ' + error.message, 'error');
        return false;
    }
}

// Delete performance record
async function deletePerformanceRecord(id) {
    try {
        await deleteDoc(doc(db, 'performance', id));
        showToast('Performance record deleted successfully!');
    } catch (error) {
        console.error('Error deleting record:', error);
        showToast('Error deleting record: ' + error.message, 'error');
    }
}

// Setup event listeners v16 - Updated with all changes for v17
function setupEventListeners() {
    // Setup mobile menu
    setupMobileMenu();
    
    // Dashboard Tab v16
    const dashboardLineSelect = document.getElementById('dashboardLineSelect');
    if (dashboardLineSelect) {
        dashboardLineSelect.addEventListener('change', () => {
            updateDashboard();
        });
    }
    
    const dashboardDateRange = document.getElementById('dashboardDateRange');
    if (dashboardDateRange) {
        dashboardDateRange.addEventListener('change', () => {
            updateDashboard();
        });
    }
    
    const refreshDashboardBtn = document.getElementById('refreshDashboardBtn');
    if (refreshDashboardBtn) {
        refreshDashboardBtn.addEventListener('click', () => {
            updateDashboard();
            showToast('Dashboard refreshed!');
        });
    }
    
    // Clickable Total Operators card
    const dashboardTotalOperatorsCard = document.getElementById('dashboardTotalOperatorsCard');
    if (dashboardTotalOperatorsCard) {
        dashboardTotalOperatorsCard.addEventListener('click', () => {
            showAllOperatorsModal('dashboard');
        });
    }
    
    // Clickable Skill Group Cards
    const dashboardGroupACard = document.getElementById('dashboardGroupACard');
    const dashboardGroupBCard = document.getElementById('dashboardGroupBCard');
    const dashboardGroupCCard = document.getElementById('dashboardGroupCCard');
    const dashboardGroupDCard = document.getElementById('dashboardGroupDCard');
    
    if (dashboardGroupACard) dashboardGroupACard.addEventListener('click', () => showGroupOperators('Group A', 'dashboard'));
    if (dashboardGroupBCard) dashboardGroupBCard.addEventListener('click', () => showGroupOperators('Group B', 'dashboard'));
    if (dashboardGroupCCard) dashboardGroupCCard.addEventListener('click', () => showGroupOperators('Group C', 'dashboard'));
    if (dashboardGroupDCard) dashboardGroupDCard.addEventListener('click', () => showGroupOperators('Group D', 'dashboard'));
    
    // Operators Tab v16
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', filterOperators);
    }
    
    if (elements.skillFilter) {
        elements.skillFilter.addEventListener('change', filterOperators);
    }
    
    if (elements.lineFilter) {
        elements.lineFilter.addEventListener('change', filterOperators);
    }
    
    // Performance Tab
    const searchPerformance = document.getElementById('searchPerformance');
    if (searchPerformance) {
        searchPerformance.addEventListener('input', filterPerformanceData);
    }
    
    const perfLineFilter = document.getElementById('perfLineFilter');
    if (perfLineFilter) {
        perfLineFilter.addEventListener('change', filterPerformanceData);
    }
    
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        dateFilter.addEventListener('change', filterPerformanceData);
    }
    
    // Action buttons v16 (removed import/export buttons)
    const addOperatorBtn = document.getElementById('addOperatorBtn');
    if (addOperatorBtn) {
        addOperatorBtn.addEventListener('click', () => {
            document.getElementById('addOperatorModal').classList.add('active');
            document.getElementById('newOperatorId').focus();
        });
    }
    
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            showToast('All changes saved to cloud!');
        });
    }
    
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadData();
            showToast('Refreshing data...');
        });
    }
    
    const addPerformanceBtn = document.getElementById('addPerformanceBtn');
    if (addPerformanceBtn) {
        addPerformanceBtn.addEventListener('click', () => {
            document.getElementById('addPerformanceModal').classList.add('active');
            document.getElementById('perfOperatorId').focus();
        });
    }
    
    // Stopwatch event listeners
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const lapBtn = document.getElementById('lapBtn');
    const resetBtn = document.getElementById('resetBtn');
    const savePerformanceData = document.getElementById('savePerformanceData');
    const resetStopwatchBtn = document.getElementById('resetStopwatch');
    
    if (startBtn) startBtn.addEventListener('click', startStopwatch);
    if (stopBtn) stopBtn.addEventListener('click', stopStopwatch);
    if (lapBtn) lapBtn.addEventListener('click', recordLap);
    if (resetBtn) resetBtn.addEventListener('click', resetStopwatch);
    if (savePerformanceData) savePerformanceData.addEventListener('click', async () => {
        await saveTimeStudyData();
    });
    if (resetStopwatchBtn) resetStopwatchBtn.addEventListener('click', () => {
        resetStopwatch();
        elements.lapsList.innerHTML = '';
        document.getElementById('avgCycleTime').textContent = '0.00';
        document.getElementById('totalCycleTime').textContent = '0.00';
        document.getElementById('workingSMVResult').textContent = '0.00';
        document.getElementById('efficiencyResult').textContent = '0%';
    });
    
    // Cycle count selection
    document.querySelectorAll('input[name="cycleCount"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const value = e.target.value;
            cycleCount = value === 'manual' ? 0 : parseInt(value);
            
            if (value === 'manual') {
                const manualCycleInputs = document.getElementById('manualCycleInputs');
                if (manualCycleInputs) {
                    manualCycleInputs.style.display = 'block';
                }
                // Set up manual inputs
                setupManualCycleInputs(cycleCount);
            } else {
                const manualCycleInputs = document.getElementById('manualCycleInputs');
                if (manualCycleInputs) {
                    manualCycleInputs.style.display = 'none';
                }
                if (lapCounter > 0) {
                    if (confirm('Changing cycle count will reset the current measurements. Continue?')) {
                        resetStopwatch();
                    } else {
                        // Revert to previous selection
                        const previousValue = lapCounter >= 3 ? '3' : '5';
                        const previousRadio = document.querySelector(`input[name="cycleCount"][value="${previousValue}"]`);
                        if (previousRadio) previousRadio.checked = true;
                    }
                }
            }
        });
    });
    
    // Manual cycle calculation
    const calculateManualBtn = document.getElementById('calculateManualBtn');
    if (calculateManualBtn) {
        calculateManualBtn.addEventListener('click', calculateManualCycles);
    }
    
    const addManualCycleBtn = document.getElementById('addManualCycleBtn');
    if (addManualCycleBtn) {
        addManualCycleBtn.addEventListener('click', () => {
            const cycleNum = document.querySelectorAll('.manual-cycle-time').length + 1;
            const cycleDiv = document.createElement('div');
            cycleDiv.className = 'cycle-input-group';
            cycleDiv.innerHTML = `
                <label>Cycle ${cycleNum} (seconds)</label>
                <input type="number" class="manual-cycle-time" step="0.001" placeholder="e.g., 25.345">
            `;
            document.getElementById('manualCycleGrid').appendChild(cycleDiv);
        });
    }
    
    // Machine dropdown with custom option - Show allowance when machine is selected
    const studyMachine = document.getElementById('studyMachine');
    if (studyMachine) {
        studyMachine.addEventListener('change', (e) => {
            if (e.target.value === 'Others') {
                const customMachineRow = document.getElementById('customMachineRow');
                if (customMachineRow) {
                    customMachineRow.style.display = 'block';
                }
            } else {
                const customMachineRow = document.getElementById('customMachineRow');
                if (customMachineRow) {
                    customMachineRow.style.display = 'none';
                }
                const customMachineName = document.getElementById('customMachineName');
                if (customMachineName) customMachineName.value = '';
            }
            
            // Update allowance display when machine is selected
            updateAllowanceDisplay(e.target.value);
        });
    }
    
    // Update allowance display when custom machine name is entered
    const customMachineName = document.getElementById('customMachineName');
    if (customMachineName) {
        customMachineName.addEventListener('input', () => {
            updateAllowanceDisplay('Others');
        });
    }
    
    const perfMachine = document.getElementById('perfMachine');
    if (perfMachine) {
        perfMachine.addEventListener('change', (e) => {
            if (e.target.value === 'Others') {
                const perfCustomMachineRow = document.getElementById('perfCustomMachineRow');
                if (perfCustomMachineRow) {
                    perfCustomMachineRow.style.display = 'block';
                }
            } else {
                const perfCustomMachineRow = document.getElementById('perfCustomMachineRow');
                if (perfCustomMachineRow) {
                    perfCustomMachineRow.style.display = 'none';
                }
                const perfCustomMachineName = document.getElementById('perfCustomMachineName');
                if (perfCustomMachineName) perfCustomMachineName.value = '';
            }
        });
    }
    
    // Group modal search and sort
    const groupSearchInput = document.getElementById('groupSearchInput');
    const groupSortBy = document.getElementById('groupSortBy');
    
    if (groupSearchInput) {
        groupSearchInput.addEventListener('input', () => {
            const sortBy = groupSortBy ? groupSortBy.value : 'skillScore';
            const currentGroup = document.getElementById('groupModalTitle')?.textContent.replace(' Operators', '').split(' - ')[0];
            if (currentGroup) showGroupOperators(currentGroup);
        });
    }
    
    if (groupSortBy) {
        groupSortBy.addEventListener('change', (e) => {
            const sortBy = e.target.value;
            const currentGroup = document.getElementById('groupModalTitle')?.textContent.replace(' Operators', '').split(' - ')[0];
            if (currentGroup) showGroupOperators(currentGroup);
        });
    }
    
    // Add operator form
    const addOperatorForm = document.getElementById('addOperatorForm');
    if (addOperatorForm) {
        addOperatorForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newOperatorId = document.getElementById('newOperatorId');
            const newOperatorName = document.getElementById('newOperatorName');
            const newSewLine = document.getElementById('newSewLine');
            const newSkillLevel = document.getElementById('newSkillLevel');
            
            if (!newOperatorId || !newOperatorName || !newSewLine || !newSkillLevel) return;
            
            const operatorData = {
                operatorId: newOperatorId.value.trim(),
                name: newOperatorName.value.trim(),
                sewLine: newSewLine.value.trim() || null,
                skillLevel: newSkillLevel.value || null
            };
            
            if (await saveOperator(operatorData, false)) {
                addOperatorForm.reset();
                closeModal('addOperatorModal');
                populateOperatorDropdowns();
                populateLineFilter();
                populateDashboardLineSelect();
                updateGarmentSMVSelectors();
            }
        });
    }
    
    // Edit operator form
    const editCellForm = document.getElementById('editCellForm');
    if (editCellForm) {
        editCellForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const editSewLine = document.getElementById('editSewLine');
            const editSkillLevel = document.getElementById('editSkillLevel');
            
            if (!editSewLine || !editSkillLevel) return;
            
            const operatorData = {
                sewLine: editSewLine.value.trim() || null,
                skillLevel: editSkillLevel.value || null
            };
            
            if (await saveOperator(operatorData, true)) {
                closeModal('editCellModal');
            }
        });
    }

    // Edit performance form with machine-specific allowance
    const editPerformanceForm = document.getElementById('editPerformanceForm');
    if (editPerformanceForm) {
        editPerformanceForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const editRecordId = document.getElementById('editRecordId');
            const editRecordStdSMV = document.getElementById('editRecordStdSMV');
            const editRecordWorkingSMV = document.getElementById('editRecordWorkingSMV');
            const editRecordCycleTimes = document.getElementById('editRecordCycleTimes');
            
            if (!editRecordId || !editRecordStdSMV || !editRecordWorkingSMV || !editRecordCycleTimes) return;
            
            const recordId = editRecordId.textContent;
            const formData = {
                standardSMV: parseFloat(editRecordStdSMV.value),
                workingSMV: parseFloat(editRecordWorkingSMV.value),
                cycleTimes: editRecordCycleTimes.value
            };
            
            if (await updatePerformanceRecord(recordId, formData)) {
                editPerformanceForm.reset();
                closeModal('editPerformanceModal');
            }
        });
    }
       
    // Score slider sync
    const editSkillScoreInput = document.getElementById('editSkillScore');
    const scoreSlider = document.getElementById('scoreSlider');
    
    if (editSkillScoreInput && scoreSlider) {
        scoreSlider.addEventListener('input', (e) => {
            editSkillScoreInput.value = (e.target.value / 100).toFixed(2);
        });
        
        editSkillScoreInput.addEventListener('input', (e) => {
            const value = Math.min(1, Math.max(0, parseFloat(e.target.value) || 0));
            scoreSlider.value = Math.round(value * 100);
            editSkillScoreInput.value = value.toFixed(2);
        });
    }
    
    // Close modals
    document.querySelectorAll('.close-modal, .btn-secondary[data-modal]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.target.getAttribute('data-modal') || 
                           e.target.closest('.close-modal')?.getAttribute('data-modal');
            if (modalId) {
                closeModal(modalId);
            }
        });
    });
    
    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
    
    // Setup multi-select after DOM is loaded
    setTimeout(() => {
        setupMultiSelect();
    }, 1000);
    
    // Escape key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
        }
    });
    
    // Auto-fill style and product when line number is entered
    if (elements.studyLineNo) {
        elements.studyLineNo.addEventListener('change', (e) => {
            const lineNo = e.target.value;
            if (lineNo) {
                autoFillStyleAndProduct(lineNo, 'study');
            }
        });
    }
    
    const perfLineNo = document.getElementById('perfLineNo');
    if (perfLineNo) {
        perfLineNo.addEventListener('change', (e) => {
            const lineNo = e.target.value;
            if (lineNo) {
                autoFillStyleAndProduct(lineNo, 'performance');
            }
        });
    }
    
    // Group modal export button
    const exportGroupBtn = document.getElementById('exportGroupBtn');
    if (exportGroupBtn) {
        exportGroupBtn.addEventListener('click', () => {
            const group = document.getElementById('groupModalTitle')?.textContent.replace(' Operators', '').split(' - ')[0];
            if (group) {
                exportGroupOperators(group);
            }
        });
    }
}

// Show all operators modal
function showAllOperatorsModal(source) {
    const totalOperators = operators.length;
    const avgEfficiency = performanceData.length > 0 ? 
        (performanceData.reduce((sum, record) => sum + (record.efficiency || 0), 0) / performanceData.length).toFixed(1) : 0;
    
    // Update modal title and info
    elements.groupModalTitle.textContent = `All Operators (${source})`;
    elements.groupOperatorCount.textContent = totalOperators;
    elements.groupAvgEfficiency.textContent = avgEfficiency + '%';
    elements.groupDescription.textContent = `Complete list of all ${totalOperators} operators in the system`;
    
    // Render all operators
    renderGroupOperatorsList(operators, 'skillScore');
    
    // Show modal
    document.getElementById('groupOperatorsModal').classList.add('active');
}

// Export group operators to Excel (kept for backward compatibility, though import/export is removed)
function exportGroupOperators(group) {
    const filteredOperators = operators.filter(operator => {
        const multiSkillGrade = calculateMultiSkillGrade(operator.operatorId);
        return multiSkillGrade === group;
    });
    
    const data = filteredOperators.map(operator => {
        const operatorEfficiency = getOperatorAverageEfficiency(operator.operatorId);
        const skillScore = calculateSkillScore(operator.operatorId);
        
        return {
            'Operator ID': operator.operatorId,
            'Operator Name': operator.name,
            'Sew Line': operator.sewLine || '',
            'Skill Level': group,
            'Average Efficiency': operatorEfficiency.toFixed(1) + '%',
            'Skill Score': skillScore.toFixed(2),
            'Multi-Skill Grade': group
        };
    });
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, group);
    
    const filename = `${group}_Operators_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);
    showToast(`${group} operators exported successfully!`);
}

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    // Remove Skill Allocation tab from DOM if it exists
    const skillAllocationTab = document.querySelector('.nav-item[data-tab="skill-allocation"]');
    if (skillAllocationTab) {
        skillAllocationTab.remove();
    }
    
    // Remove Skill Allocation content if it exists
    const skillAllocationContent = document.getElementById('skill-allocation');
    if (skillAllocationContent) {
        skillAllocationContent.remove();
    }
    
    await loadData();
    setupEventListeners();
    setupSidebarNavigation();
    updateRealTimeClock();
    loadOperatorMachineSkills();
    
    // Start real-time clock
    setInterval(updateRealTimeClock, 1000);
    
    // Hide loading overlay
    setTimeout(() => {
        if (elements.loadingOverlay) {
            elements.loadingOverlay.style.display = 'none';
        }
    }, 1500);
    
    // Check for last added operator highlight
    if (lastAddedOperatorId) {
        setTimeout(() => {
            highlightNewOperator(lastAddedOperatorId);
        }, 1000);
    }
    
    // Adjust dashboard for mobile on load
    adjustDashboardForMobile();
});
