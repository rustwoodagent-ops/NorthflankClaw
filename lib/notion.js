const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const PARENT_PAGE_ID = process.env.NOTION_PARENT_PAGE_ID;

/**
 * Create a new page in Notion
 */
async function createPage(title, content, parentId = PARENT_PAGE_ID) {
  try {
    const response = await notion.pages.create({
      parent: { page_id: parentId },
      properties: {
        title: {
          title: [{ text: { content: title } }]
        }
      },
      children: content.map(text => ({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ text: { content: text } }]
        }
      }))
    });
    return response;
  } catch (error) {
    console.error('Error creating page:', error.message);
    throw error;
  }
}

/**
 * Create a database in Notion
 */
async function createDatabase(title, properties, parentId = PARENT_PAGE_ID) {
  try {
    const response = await notion.databases.create({
      parent: { page_id: parentId },
      title: [{ text: { content: title } }],
      properties: properties
    });
    return response;
  } catch (error) {
    console.error('Error creating database:', error.message);
    throw error;
  }
}

/**
 * Query a database
 */
async function queryDatabase(databaseId, filter = {}) {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: filter
    });
    return response.results;
  } catch (error) {
    console.error('Error querying database:', error.message);
    throw error;
  }
}

/**
 * Add entry to database
 */
async function addDatabaseEntry(databaseId, properties) {
  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: properties
    });
    return response;
  } catch (error) {
    console.error('Error adding database entry:', error.message);
    throw error;
  }
}

/**
 * Get page by ID
 */
async function getPage(pageId) {
  try {
    const response = await notion.pages.retrieve({ page_id: pageId });
    return response;
  } catch (error) {
    console.error('Error retrieving page:', error.message);
    throw error;
  }
}

module.exports = {
  notion,
  PARENT_PAGE_ID,
  createPage,
  createDatabase,
  queryDatabase,
  addDatabaseEntry,
  getPage
};
