const { notion, addDatabaseEntry } = require('../lib/notion');

async function firstSync() {
  console.log('Performing first data sync to Notion...\n');

  try {
    // 1. Add entry to Work Journal
    console.log('1. Adding Work Journal entry...');
    const journalDb = await notion.search({ query: 'Work Journal' });
    if (journalDb.results.length > 0) {
      await addDatabaseEntry(journalDb.results[0].id, {
        'Date': { title: [{ text: { content: '2026-03-18' } }] },
        'Type': { select: { name: 'Daily Log' } },
        'Summary': { rich_text: [{ text: { content: 'Completed Local AI in Plain English lead magnet. Set up Notion workspace. Activated Mercury for workflow draft.' } }] },
        'Accomplishments': { rich_text: [{ text: { content: '- Finalized 12-page lead magnet\n- Created print-ready HTML\n- Set up 6 Notion workspace sections\n- Mercury delivered workflow draft' } }] },
        'Blockers': { rich_text: [{ text: { content: 'None' } }] },
        'Next Steps': { rich_text: [{ text: { content: '- Deploy landing page\n- Refine workflow draft\n- Create $19 product outline' } }] }
      });
      console.log('   ✅ Work Journal entry added');
    }

    // 2. Add entry to Fulfilment Log (test entry)
    console.log('2. Adding test Fulfilment Log entry...');
    const fulfilDb = await notion.search({ query: 'Fulfilment Log' });
    if (fulfilDb.results.length > 0) {
      await addDatabaseEntry(fulfilDb.results[0].id, {
        'Customer': { title: [{ text: { content: 'test@example.com' } }] },
        'Product': { select: { name: 'Local AI in Plain English' } },
        'Status': { select: { name: 'Pending' } },
        'Order Date': { date: { start: '2026-03-18' } },
        'GitHub Username': { rich_text: [{ text: { content: 'Not provided yet' } }] },
        'Notes': { rich_text: [{ text: { content: 'Test entry for system validation' } }] }
      });
      console.log('   ✅ Fulfilment Log test entry added');
    }

    console.log('\n✅ First sync complete!');

  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    process.exit(1);
  }
}

firstSync();
