import { markdownToBlocks } from '@instantish/martian';
import { parse } from 'rss-to-json';
import TurndownService from 'turndown';
import timeDifference from './helpers';
import { getFeedUrlsFromNotion } from './notion';

async function getNewFeedItemsFrom(feedUrl) {
  const rss = await parse(feedUrl);
  const todaysDate = new Date().getTime() / 1000;
  return rss.items.filter((item) => {
    const blogPublishedDate = new Date(item.published).getTime() / 1000;
    const { diffInDays } = timeDifference(todaysDate, blogPublishedDate);
    return diffInDays === 0;
  });
}

export default async function getNewFeedItems() {
  let allNewFeedItems = [];

  const feeds = await getFeedUrlsFromNotion();

  for (let i = 0; i < feeds.length; i++) {
    const { feedUrl } = feeds[i];
    const feedItems = await getNewFeedItemsFrom(feedUrl);
    allNewFeedItems = [...allNewFeedItems, ...feedItems];
  }

  return allNewFeedItems;
}

function htmlToMarkdown(htmlContent) {
  const turndownService = new TurndownService();
  return turndownService.turndown(htmlContent);
}

function jsonToNotionBlocks(markdownContent) {
  const notionBlocks = markdownToBlocks(markdownContent);
  return notionBlocks;
}

export function htmlToNotionBlocks(htmlContent) {
  const markdownContent = htmlToMarkdown(htmlContent);
  const notionBlocks = jsonToNotionBlocks(markdownContent);
  return notionBlocks;
}
