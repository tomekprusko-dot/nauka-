// Simple Leitner-box spaced repetition. Box 0 = new/failed, box 4 = mastered.
const BOX_INTERVAL_DAYS = [0, 1, 2, 4, 8, 16];

export function initialBox() {
  return { box: 0, nextReviewAt: new Date().toISOString() };
}

export function nextSchedule(currentBox, quality) {
  // quality: 'again' | 'good' | 'easy'
  let box = currentBox;
  if (quality === 'again') box = 0;
  else if (quality === 'good') box = Math.min(currentBox + 1, BOX_INTERVAL_DAYS.length - 1);
  else if (quality === 'easy') box = Math.min(currentBox + 2, BOX_INTERVAL_DAYS.length - 1);

  const days = BOX_INTERVAL_DAYS[box];
  const nextReviewAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  return { box, nextReviewAt };
}
