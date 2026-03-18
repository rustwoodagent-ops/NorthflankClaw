const { notion, PARENT_PAGE_ID, createPage, createDatabase } = require('../lib/notion');

async function setupNotionWorkspace() {
  console.log('Setting up Howard Operator OS Notion workspace...\n');

  try {
    // 1. Create Operating Dashboard
    console.log('1. Creating Operating Dashboard...');
    const dashboard = await createPage('📊 Operating Dashboard', [
      'Real-time status of all active workstreams.',
      '',
      '## Current Status',
      '- Last updated: ' + new Date().toISOString(),
      '',
      '## Active Workstreams',
      '- Howard Operator OS — Starter Kit (launch prep)',
      '- PDF Value Ladder (products 1-5 in development)',
      '- Local AI in Plain English (lead magnet ready)',
      '',
      '## Blockers',
      '- None currently',
      '',
      '## Decisions Pending',
      '- Launch approval for Starter Kit'
    ]);
    console.log('   ✅ Dashboard created:', dashboard.id);

    // 2. Create Knowledge Base
    console.log('2. Creating Knowledge Base...');
    const knowledgeBase = await createPage('📚 Knowledge Base', [
      'Standard Operating Procedures and system documentation.',
      '',
      '## SOPs',
      '- Newsroom Publishing Protocol',
      '- Product Launch Checklist',
      '- Customer Fulfilment Process',
      '',
      '## System Architecture',
      '- GitHub: Code and websites',
      '- Google Drive: Files and PDFs',
      '- Notion: Operations and memory'
    ]);
    console.log('   ✅ Knowledge Base created:', knowledgeBase.id);

    // 3. Create Launch Assets
    console.log('3. Creating Launch Assets...');
    const launchAssets = await createPage('🚀 Launch Assets', [
      'Product planning and launch tracking.',
      '',
      '## PDF Value Ladder',
      '1. Local AI in Plain English (FREE) — ✅ Ready',
      '2. Your First AI Workflow (FREE) — 🔄 In Progress',
      '3. 7 AI Workflows That Actually Work ($19) — 📋 Planned',
      '4. Build Your Operator System ($29) — 📋 Planned',
      '5. Self-Hosted AI Operations Guide ($49) — 📋 Planned',
      '',
      '## Core Product',
      '- Howard Operator OS — Starter Kit ($299) — ✅ Ready for launch'
    ]);
    console.log('   ✅ Launch Assets created:', launchAssets.id);

    // 4. Create Fulfilment Log
    console.log('4. Creating Fulfilment Log...');
    const fulfilmentLog = await createDatabase('📦 Fulfilment Log', {
      'Customer': { title: {} },
      'Product': { select: { options: [
        { name: 'Local AI in Plain English', color: 'blue' },
        { name: 'Your First AI Workflow', color: 'green' },
        { name: 'Howard Operator OS — Starter Kit', color: 'purple' }
      ]}},
      'Status': { select: { options: [
        { name: 'Pending', color: 'yellow' },
        { name: 'Invited', color: 'blue' },
        { name: 'Complete', color: 'green' }
      ]}},
      'Order Date': { date: {} },
      'GitHub Username': { rich_text: {} },
      'Notes': { rich_text: {} }
    });
    console.log('   ✅ Fulfilment Log created:', fulfilmentLog.id);

    // 5. Create Work Journal
    console.log('5. Creating Work Journal...');
    const workJournal = await createDatabase('📝 Work Journal', {
      'Date': { title: {} },
      'Type': { select: { options: [
        { name: 'Daily Log', color: 'blue' },
        { name: 'Weekly Review', color: 'green' },
        { name: 'Monthly Retro', color: 'purple' }
      ]}},
      'Summary': { rich_text: {} },
      'Accomplishments': { rich_text: {} },
      'Blockers': { rich_text: {} },
      'Next Steps': { rich_text: {} }
    });
    console.log('   ✅ Work Journal created:', workJournal.id);

    // 6. Create Product Documents
    console.log('6. Creating Product Documents...');
    const productDocs = await createPage('📄 Product Documents', [
      'Living documents for Howard Operator OS products.',
      '',
      '## Howard Operator OS — Starter Kit',
      '- Positioning: Self-hosted AI operations for technical operators',
      '- Price: $299 AUD one-time',
      '- Delivery: GitHub repository + documentation',
      '- Status: Ready for launch',
      '',
      '## Lead Magnets',
      'See Launch Assets for PDF Value Ladder details.'
    ]);
    console.log('   ✅ Product Documents created:', productDocs.id);

    console.log('\n✅ Notion workspace setup complete!');
    console.log('\nCreated:');
    console.log('  - 📊 Operating Dashboard');
    console.log('  - 📚 Knowledge Base');
    console.log('  - 🚀 Launch Assets');
    console.log('  - 📦 Fulfilment Log (database)');
    console.log('  - 📝 Work Journal (database)');
    console.log('  - 📄 Product Documents');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  setupNotionWorkspace();
}

module.exports = { setupNotionWorkspace };
