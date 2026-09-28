const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const Asset = require('../models/Asset');
const Inspection = require('../models/Inspection');
const WorkOrder = require('../models/WorkOrder');
const Contractor = require('../models/Contractor');
const Notification = require('../models/Notification');
const LifecycleEvent = require('../models/LifecycleEvent');
const User = require('../models/User');

const { contractorsData, usersData, assetsData, daysAgo, daysFromNow } = require('./seedData');

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('❌ MONGO_URI is missing in environment variables');
  process.exit(1);
}

async function seedDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB at:', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB:', mongoose.connection.name);

    // 1. Clear existing collections
    console.log('🧹 Clearing existing Gujarat R&B demo collections...');
    await Promise.all([
      Asset.deleteMany({}),
      Inspection.deleteMany({}),
      WorkOrder.deleteMany({}),
      Contractor.deleteMany({}),
      Notification.deleteMany({}),
      LifecycleEvent.deleteMany({}),
      User.deleteMany({}),
    ]);
    console.log('✅ Collections cleared.');

    // 2. Insert Contractors
    console.log('🏗️ Inserting Contractors...');
    const contractors = await Contractor.insertMany(contractorsData);
    console.log(`✅ Seeded ${contractors.length} contractors.`);

    const contractorMap = {};
    contractors.forEach((c) => {
      contractorMap[c.name] = c;
    });

    // 3. Insert Users
    console.log('👥 Inserting Users...');
    const users = await User.insertMany(usersData);
    console.log(`✅ Seeded ${users.length} users.`);

    // 4. Insert Assets
    console.log('🏛️ Inserting Infrastructure Assets...');
    const assets = await Asset.insertMany(assetsData);
    console.log(`✅ Seeded ${assets.length} assets across Gujarat.`);

    const assetMap = {};
    assets.forEach((a) => {
      assetMap[a.assetId] = a;
    });

    // 5. Generate Inspections
    console.log('📋 Generating Inspections...');
    const inspectionsData = [
      {
        inspectionId: 'INS-00001',
        assetId: assetMap['BR-GJ-AHM-00001']._id,
        assetRef: 'BR-GJ-AHM-00001',
        inspectorName: 'Er. Rajesh V. Solanki',
        inspectionDate: daysAgo(20),
        type: 'Structural',
        physicalRating: 2,
        safetyRating: 2,
        defects: [
          { type: 'Structural damage', severity: 'Critical', description: 'Deep diagonal shear fissures and water ingress along Pier 4 & Pier 5 footing.' },
          { type: 'Corrosion', severity: 'High', description: 'Exposed reinforced steel rebar oxidation beneath eastern cantilever deck.' }
        ],
        overallSeverity: 'Critical',
        remarks: 'Immediate structural jacketing, epoxy grouting, and load capacity downgrade to 20T recommended.',
        recommendedAction: 'Emergency intervention',
        conditionBefore: { score: 45, status: 'Poor' },
        conditionAfter: { score: 32, status: 'Critical' },
        status: 'Completed'
      },
      {
        inspectionId: 'INS-00002',
        assetId: assetMap['CV-GJ-AHM-00001']._id,
        assetRef: 'CV-GJ-AHM-00001',
        inspectorName: 'Er. Rajesh V. Solanki',
        inspectionDate: daysAgo(15),
        type: 'Routine',
        physicalRating: 1,
        safetyRating: 2,
        defects: [
          { type: 'Structural damage', severity: 'Critical', description: 'Top slab deflection of 42mm with progressive longitudinal cracking.' },
          { type: 'Drainage issue', severity: 'High', description: 'Heavy silt accumulation choking 60% of northern culvert barrel.' }
        ],
        overallSeverity: 'Critical',
        remarks: 'Structural risk of localized slab punch-through under peak truck axle loading.',
        recommendedAction: 'Major rehabilitation',
        conditionBefore: { score: 40, status: 'Poor' },
        conditionAfter: { score: 28, status: 'Critical' },
        status: 'Completed'
      },
      {
        inspectionId: 'INS-00003',
        assetId: assetMap['CV-GJ-VDR-00004']._id,
        assetRef: 'CV-GJ-VDR-00004',
        inspectorName: 'Er. Sneha M. Joshi',
        inspectionDate: daysAgo(18),
        type: 'Structural',
        physicalRating: 2,
        safetyRating: 2,
        defects: [
          { type: 'Structural damage', severity: 'Critical', description: 'Severe soil erosion and piping cavity under south-east return wing wall.' }
        ],
        overallSeverity: 'Critical',
        remarks: 'Urgent plum concrete backfilling and cutoff wall repair required before monsoon high flow.',
        recommendedAction: 'Repair',
        conditionBefore: { score: 48, status: 'Poor' },
        conditionAfter: { score: 35, status: 'Critical' },
        status: 'Completed'
      },
      {
        inspectionId: 'INS-00004',
        assetId: assetMap['RD-GJ-BRC-00007']._id,
        assetRef: 'RD-GJ-BRC-00007',
        inspectorName: 'Er. Hardik Dave',
        inspectionDate: daysAgo(30),
        type: 'Routine',
        physicalRating: 2,
        safetyRating: 3,
        defects: [
          { type: 'Surface deterioration', severity: 'High', description: 'Severe 35mm wheel track rutting on right-hand slow lane due to laden chemical tankers.' },
          { type: 'Pothole', severity: 'Medium', description: 'Intermittent edge raveling and pothole clusters near Vilayat junction.' }
        ],
        overallSeverity: 'High',
        remarks: 'Milling of upper 50mm wearing coat and high-modulus asphalt overlay required.',
        recommendedAction: 'Repair',
        conditionBefore: { score: 55, status: 'Fair' },
        conditionAfter: { score: 44, status: 'Poor' },
        status: 'Completed'
      },
      {
        inspectionId: 'INS-00005',
        assetId: assetMap['BR-GJ-VDR-00008']._id,
        assetRef: 'BR-GJ-VDR-00008',
        inspectorName: 'Er. Sneha M. Joshi',
        inspectionDate: daysAgo(35),
        type: 'Safety',
        physicalRating: 2,
        safetyRating: 3,
        defects: [
          { type: 'Crack', severity: 'Medium', description: 'Failed elastomeric expansion joints allowing water leakage onto pier caps.' },
          { type: 'Surface deterioration', severity: 'Medium', description: 'Spalling on pedestrian walkway curb stones.' }
        ],
        overallSeverity: 'Medium',
        remarks: 'Replace expansion joints with strip seal system; apply anti-carbonation coat.',
        recommendedAction: 'Routine maintenance',
        conditionBefore: { score: 58, status: 'Fair' },
        conditionAfter: { score: 52, status: 'Poor' },
        status: 'Completed'
      },
      {
        inspectionId: 'INS-00006',
        assetId: assetMap['BR-GJ-AHM-00002']._id,
        assetRef: 'BR-GJ-AHM-00002',
        inspectorName: 'Er. Rajesh V. Solanki',
        inspectionDate: daysAgo(60),
        type: 'Routine',
        physicalRating: 5,
        safetyRating: 5,
        defects: [],
        overallSeverity: 'None',
        remarks: 'Superstructure in pristine condition. Cable damping tension within 100% tolerance.',
        recommendedAction: 'No action',
        conditionBefore: { score: 92, status: 'Good' },
        conditionAfter: { score: 92, status: 'Good' },
        status: 'Completed'
      },
      {
        inspectionId: 'INS-00007',
        assetId: assetMap['BLD-GJ-GNR-00001']._id,
        assetRef: 'BLD-GJ-GNR-00001',
        inspectorName: 'Mansi Shah',
        inspectionDate: daysAgo(30),
        type: 'Routine',
        physicalRating: 5,
        safetyRating: 5,
        defects: [],
        overallSeverity: 'None',
        remarks: 'Executive building and life-safety systems fully compliant with NBC 2016 norms.',
        recommendedAction: 'No action',
        conditionBefore: { score: 95, status: 'Good' },
        conditionAfter: { score: 95, status: 'Good' },
        status: 'Completed'
      }
    ];

    const inspections = await Inspection.insertMany(inspectionsData);
    console.log(`✅ Seeded ${inspections.length} inspections.`);

    // 6. Generate Work Orders
    console.log('🛠️ Generating Maintenance Work Orders...');
    const workOrdersData = [
      {
        workOrderId: 'WO-2026-00001',
        assetId: assetMap['BR-GJ-AHM-00001']._id,
        assetRef: 'BR-GJ-AHM-00001',
        assetName: assetMap['BR-GJ-AHM-00001'].name,
        issue: 'Subhash Bridge Pier 4 & 5 High-Pressure Epoxy Grouting & Underwater Jacketing',
        issueCategory: 'Structural',
        priority: 'Critical',
        recommendedAction: 'Emergency intervention',
        estimatedCost: 185.0,
        actualCost: 65.0,
        contractor: contractorMap['Patel Infrastructure Pvt Ltd']?._id,
        contractorName: 'Patel Infrastructure Pvt Ltd',
        startDate: daysAgo(10),
        expectedCompletion: daysFromNow(45),
        description: 'Executing pressure injection of low-viscosity structural epoxy into pier micro-cracks and applying micro-concrete encasement collar.',
        status: 'In Progress',
        statusHistory: [
          { status: 'Planned', changedAt: daysAgo(18), note: 'Emergency tender issued' },
          { status: 'Assigned', changedAt: daysAgo(14), note: 'Awarded to Patel Infrastructure Pvt Ltd' },
          { status: 'In Progress', changedAt: daysAgo(10), note: 'Scaffolding and diver sonar inspection underway' }
        ]
      },
      {
        workOrderId: 'WO-2026-00002',
        assetId: assetMap['CV-GJ-AHM-00001']._id,
        assetRef: 'CV-GJ-AHM-00001',
        assetName: assetMap['CV-GJ-AHM-00001'].name,
        issue: 'Khari Cut Canal Culvert Top Slab Strengthening & Hydro-Desilting',
        issueCategory: 'Civil',
        priority: 'Critical',
        recommendedAction: 'Major rehabilitation',
        estimatedCost: 68.5,
        contractor: contractorMap['Cube Construction Engineering Ltd']?._id,
        contractorName: 'Cube Construction Engineering Ltd',
        startDate: daysAgo(5),
        expectedCompletion: daysFromNow(25),
        description: 'Temporary bypass channel creation, sediment dredging, and casting carbon-fiber reinforced polymer (CFRP) on underside of top slab.',
        status: 'Assigned',
        statusHistory: [
          { status: 'Planned', changedAt: daysAgo(12), note: 'Sanctioned by Chief Engineer' },
          { status: 'Assigned', changedAt: daysAgo(5), note: 'Work order handed to Cube Construction' }
        ]
      },
      {
        workOrderId: 'WO-2026-00003',
        assetId: assetMap['RD-GJ-BRC-00007']._id,
        assetRef: 'RD-GJ-BRC-00007',
        assetName: assetMap['RD-GJ-BRC-00007'].name,
        issue: 'Bharuch-Dahej Expressway KM 14-22 Pavement Cold Milling & Resurfacing',
        issueCategory: 'Surface',
        priority: 'High',
        recommendedAction: 'Repair',
        estimatedCost: 220.0,
        contractor: contractorMap['Sadbhav Engineering Ltd']?._id,
        contractorName: 'Sadbhav Engineering Ltd',
        startDate: daysAgo(35),
        expectedCompletion: daysAgo(5), // Due date passed -> Delayed!
        description: 'Cold milling of rutted surface, tack coat application, and 50mm Stone Matrix Asphalt (SMA) paving with modified binder.',
        status: 'Delayed',
        statusHistory: [
          { status: 'Planned', changedAt: daysAgo(45), note: 'Annual corridor maintenance program' },
          { status: 'In Progress', changedAt: daysAgo(35), note: 'Milling commenced' },
          { status: 'Delayed', changedAt: daysAgo(5), note: 'Delayed due to intermittent monsoonal showers and unseasonal rainfall' }
        ]
      },
      {
        workOrderId: 'WO-2026-00004',
        assetId: assetMap['BR-GJ-VDR-00008']._id,
        assetRef: 'BR-GJ-VDR-00008',
        assetName: assetMap['BR-GJ-VDR-00008'].name,
        issue: 'Vishwamitri Overbridge Strip Seal Expansion Joint Replacement',
        issueCategory: 'Structural',
        priority: 'High',
        recommendedAction: 'Routine maintenance',
        estimatedCost: 45.0,
        contractor: contractorMap['Patel Infrastructure Pvt Ltd']?._id,
        contractorName: 'Patel Infrastructure Pvt Ltd',
        startDate: daysAgo(8),
        expectedCompletion: daysFromNow(20),
        description: 'Removal of decayed joints, chemical anchoring of replacement steel armor beam, and high-performance elastomeric sealing.',
        status: 'In Progress',
        statusHistory: [
          { status: 'Planned', changedAt: daysAgo(20), note: 'Inspection recommendation processed' },
          { status: 'In Progress', changedAt: daysAgo(8), note: 'Night shifts initiated to minimize traffic disruption' }
        ]
      },
      {
        workOrderId: 'WO-2026-00005',
        assetId: assetMap['RD-GJ-SRT-00003']._id,
        assetRef: 'RD-GJ-SRT-00003',
        assetName: assetMap['RD-GJ-SRT-00003'].name,
        issue: 'Surat-Dumas Coastal Road Storm Drainage Clearing and Shoulder Paving',
        issueCategory: 'Drainage',
        priority: 'Medium',
        recommendedAction: 'Preventive maintenance',
        estimatedCost: 32.0,
        contractor: contractorMap['Dilip Buildcon Gujarat Division']?._id,
        contractorName: 'Dilip Buildcon Gujarat Division',
        startDate: daysFromNow(5),
        expectedCompletion: daysFromNow(30),
        description: 'Excavation of silt deposits from side drains, repair of perforated catch basins, and paver shoulder realignment.',
        status: 'Planned',
        statusHistory: [
          { status: 'Planned', changedAt: daysAgo(2), note: 'Annual pre-monsoon work order created' }
        ]
      },
      {
        workOrderId: 'WO-2026-00006',
        assetId: assetMap['RD-GJ-GNR-00006']._id,
        assetRef: 'RD-GJ-GNR-00006',
        assetName: assetMap['RD-GJ-GNR-00006'].name,
        issue: 'Gandhinagar-Koba Aerodrome Corridor Thermoplastic Marking & Cat-Eye Studs',
        issueCategory: 'Safety',
        priority: 'Low',
        recommendedAction: 'Routine maintenance',
        estimatedCost: 18.0,
        actualCost: 17.5,
        contractor: contractorMap['Sadbhav Engineering Ltd']?._id,
        contractorName: 'Sadbhav Engineering Ltd',
        startDate: daysAgo(40),
        expectedCompletion: daysAgo(10),
        completedDate: daysAgo(8),
        description: 'Applied reflective thermoplastic white/yellow lane markings and installed 1,800 solar road safety studs.',
        status: 'Completed',
        statusHistory: [
          { status: 'Planned', changedAt: daysAgo(45), note: 'Quarterly safety schedule' },
          { status: 'In Progress', changedAt: daysAgo(40), note: 'Work commenced' },
          { status: 'Completed', changedAt: daysAgo(8), note: 'Final inspection passed and accepted' }
        ]
      }
    ];

    const workOrders = await WorkOrder.insertMany(workOrdersData);
    console.log(`✅ Seeded ${workOrders.length} maintenance work orders.`);

    // 7. Generate Lifecycle Events
    console.log('📜 Generating Historical Lifecycle Events...');
    const lifecycleEventsData = [];

    assets.forEach((a) => {
      // Creation event
      lifecycleEventsData.push({
        assetId: a._id,
        assetRef: a.assetId,
        eventType: 'Created',
        date: a.construction?.commissioningDate || daysAgo(365 * 3),
        description: `Asset ${a.assetId} officially registered in Gujarat R&B Digital Registry.`,
        performedBy: 'Government of Gujarat',
        cost: a.construction?.originalCost || 0
      });
      // Commissioning event
      lifecycleEventsData.push({
        assetId: a._id,
        assetRef: a.assetId,
        eventType: 'Commissioned',
        date: a.construction?.commissioningDate || daysAgo(365 * 3),
        description: `${a.name} commissioned for public infrastructure service in ${a.administrative.district}.`,
        performedBy: a.ownership?.managingAuthority || 'R&B Department, Gujarat'
      });
    });

    // Add recent events for assets with inspections or maintenance
    inspections.forEach((insp) => {
      lifecycleEventsData.push({
        assetId: insp.assetId,
        assetRef: insp.assetRef,
        eventType: 'Inspected',
        date: insp.inspectionDate,
        description: `Condition assessment conducted by ${insp.inspectorName}. Condition Score: ${insp.conditionAfter?.score} (${insp.conditionAfter?.status}).`,
        performedBy: insp.inspectorName
      });
    });

    workOrders.forEach((wo) => {
      lifecycleEventsData.push({
        assetId: wo.assetId,
        assetRef: wo.assetRef,
        eventType: 'Work Order Created',
        date: wo.createdAt || daysAgo(10),
        description: `Work Order ${wo.workOrderId} created: ${wo.issue} (Priority: ${wo.priority}). Est Cost: ₹${wo.estimatedCost} Lakhs.`,
        performedBy: 'System',
        cost: wo.estimatedCost
      });
    });

    const lifecycleEvents = await LifecycleEvent.insertMany(lifecycleEventsData);
    console.log(`✅ Seeded ${lifecycleEvents.length} lifecycle events.`);

    // 8. Generate System Notifications
    console.log('🔔 Generating System Notifications...');
    const notificationsData = [
      {
        type: 'Critical',
        title: 'Critical Structural Alert: Subhash Bridge (BR-GJ-AHM-00001)',
        message: 'Condition score dropped to 32 (Critical). Shear fissures detected at Pier 4 footing. Work Order WO-2026-00001 is In Progress.',
        assetId: assetMap['BR-GJ-AHM-00001']._id,
        assetRef: 'BR-GJ-AHM-00001',
        workOrderId: workOrders.find((w) => w.assetRef === 'BR-GJ-AHM-00001')?._id,
        read: false
      },
      {
        type: 'Critical',
        title: 'Immediate Attention: Khari Cut Box Culvert (CV-GJ-AHM-00001)',
        message: 'Condition score 28 (Critical). Deflection detected on top slab. Rehabilitation work order WO-2026-00002 has been assigned.',
        assetId: assetMap['CV-GJ-AHM-00001']._id,
        assetRef: 'CV-GJ-AHM-00001',
        workOrderId: workOrders.find((w) => w.assetRef === 'CV-GJ-AHM-00001')?._id,
        read: false
      },
      {
        type: 'InspectionOverdue',
        title: 'Inspection Overdue: Ellis Bridge Heritage Overpass',
        message: 'Routine bi-annual structural safety inspection for BR-GJ-AHM-00003 is overdue by 10 days.',
        assetId: assetMap['BR-GJ-AHM-00003']._id,
        assetRef: 'BR-GJ-AHM-00003',
        read: false
      },
      {
        type: 'InspectionOverdue',
        title: 'Inspection Overdue: Bharuch-Dahej Freight Expressway',
        message: 'Pavement condition inspection for RD-GJ-BRC-00007 is overdue by 8 days.',
        assetId: assetMap['RD-GJ-BRC-00007']._id,
        assetRef: 'RD-GJ-BRC-00007',
        read: false
      },
      {
        type: 'DelayedWork',
        title: 'Maintenance Delayed: WO-2026-00003',
        message: 'Pavement milling on Bharuch-Dahej Expressway missed expected completion deadline.',
        assetId: assetMap['RD-GJ-BRC-00007']._id,
        assetRef: 'RD-GJ-BRC-00007',
        workOrderId: workOrders.find((w) => w.workOrderId === 'WO-2026-00003')?._id,
        read: false
      },
      {
        type: 'Info',
        title: 'New Infrastructure Registered',
        message: 'Atal Pedestrian Bridge and SG Highway Corridor successfully indexed in Gujarat Command Center.',
        assetId: assetMap['BR-GJ-AHM-00002']._id,
        assetRef: 'BR-GJ-AHM-00002',
        read: true
      }
    ];

    const notifications = await Notification.insertMany(notificationsData);
    console.log(`✅ Seeded ${notifications.length} notifications.`);

    console.log('\n=========================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log(`🏛️ Assets: ${assets.length}`);
    console.log(`🏗️ Contractors: ${contractors.length}`);
    console.log(`👥 Users: ${users.length}`);
    console.log(`📋 Inspections: ${inspections.length}`);
    console.log(`🛠️ Work Orders: ${workOrders.length}`);
    console.log(`📜 Lifecycle Events: ${lifecycleEvents.length}`);
    console.log(`🔔 Notifications: ${notifications.length}`);
    console.log('=========================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
