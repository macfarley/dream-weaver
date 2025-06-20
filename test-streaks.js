/**
 * Test script for sleep streak calculations
 * Run this to verify the streak logic works correctly
 */

import { calculateSleepStreaks, formatStreakDisplay } from './src/utils/sleep/sleepStreaks.js';

// Test data - mock sleep sessions
const mockSleepSessions = [
  {
    _id: "1",
    createdAt: "2025-06-20T23:30:00Z", // Today at 11:30 PM (counts as today)
    wakeUps: [{ awakenAt: "2025-06-21T08:00:00Z" }]
  },
  {
    _id: "2", 
    createdAt: "2025-06-19T23:00:00Z", // Yesterday at 11:00 PM (counts as yesterday)
    wakeUps: [{ awakenAt: "2025-06-20T07:30:00Z" }]
  },
  {
    _id: "3",
    createdAt: "2025-06-18T22:45:00Z", // Two days ago at 10:45 PM (counts as June 18)
    wakeUps: [{ awakenAt: "2025-06-19T07:00:00Z" }]
  },
  {
    _id: "4",
    createdAt: "2025-06-17T23:15:00Z", // Three days ago at 11:15 PM (counts as June 17)
    wakeUps: [{ awakenAt: "2025-06-18T08:15:00Z" }]
  },
  // Gap here - should break streak (no session on June 16)
  {
    _id: "5",
    createdAt: "2025-06-15T00:30:00Z", // Five days ago at 12:30 AM (counts as June 14)
    wakeUps: [{ awakenAt: "2025-06-15T07:45:00Z" }]
  },
  {
    _id: "6",
    createdAt: "2025-06-14T01:00:00Z", // Six days ago at 1:00 AM (counts as June 13)
    wakeUps: [{ awakenAt: "2025-06-14T08:00:00Z" }]
  },
  {
    _id: "7",
    createdAt: "2025-06-13T02:30:00Z", // Seven days ago at 2:30 AM (counts as June 12)
    wakeUps: [{ awakenAt: "2025-06-13T09:00:00Z" }]
  }
];

console.log('Testing Sleep Streak Calculations');
console.log('================================');

// Let's debug what dates we're getting
function getSleepDay(dateStr) {
  const date = new Date(dateStr);
  const hour = date.getHours();
  
  // If session started before 4am, it's part of the previous day
  if (hour < 4) {
    const prevDay = new Date(date);
    prevDay.setDate(prevDay.getDate() - 1);
    return new Date(prevDay.getFullYear(), prevDay.getMonth(), prevDay.getDate());
  }
  
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

console.log('Sleep days from sessions:');
mockSleepSessions.forEach((session, i) => {
  const sleepDay = getSleepDay(session.createdAt);
  console.log(`Session ${i + 1} (${session.createdAt}): Sleep day ${sleepDay.toISOString().slice(0, 10)}`);
});

const today = new Date();
console.log(`Today is: ${today.toISOString().slice(0, 10)}`);

const streakStats = calculateSleepStreaks(mockSleepSessions);
console.log('Raw streak stats:', streakStats);

const displayInfo = formatStreakDisplay(streakStats);
console.log('Formatted display:', displayInfo);

console.log('\nExpected Results:');
console.log('- Current Streak: 4 days (June 20, 19, 18, 17)');
console.log('- Longest Streak: 4 days (should be the current streak)');
console.log('- Total Sessions: 7');

// Test edge cases
console.log('\n\nTesting Edge Cases:');
console.log('==================');

// Empty array
const emptyStats = calculateSleepStreaks([]);
console.log('Empty array:', emptyStats);

// Single session
const singleSession = [{
  createdAt: "2025-06-20T01:00:00Z",
  wakeUps: [{ awakenAt: "2025-06-20T08:00:00Z" }]
}];
const singleStats = calculateSleepStreaks(singleSession);
console.log('Single session:', singleStats);

// No completed sessions (no wake-ups)
const incompleteSession = [{
  createdAt: "2025-06-20T01:00:00Z",
  wakeUps: []
}];
const incompleteStats = calculateSleepStreaks(incompleteSession);
console.log('Incomplete session:', incompleteStats);
