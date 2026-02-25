/**
 * Loads and decorates the banner block.
 * Expected rows:
 *   Row 1: Heading text
 *   Row 2: Body paragraph/description
 *   Row 3+: CTA links (first gets button style, rest remain text links)
 *   Last row (optional): Image/illustration (if row contains only a picture)
 * @param {Element} block The banner block element
 */
export default function decorate(block) {
  const content = document.createElement('div');
  content.className = 'banner-content';

  let imageCell = null;

  // Check if any row is an image-only row
  [...block.children].forEach((row) => {
    const cell = row.firstElementChild;
    if (cell && cell.querySelector('picture') && cell.children.length === 1 && !cell.querySelector('p:not(:has(picture))')) {
      imageCell = cell;
    }
  });

  // Move all non-image rows into content div
  [...block.children].forEach((row) => {
    if (row.firstElementChild === imageCell) return;
    [...row.children].forEach((cell) => {
      while (cell.firstElementChild) content.append(cell.firstElementChild);
    });
    row.remove();
  });

  // Wrap all .button-wrapper elements in a shared actions row
  const actions = document.createElement('div');
  actions.className = 'banner-actions';
  content.querySelectorAll('.button-wrapper').forEach((bw) => actions.append(bw));
  if (actions.children.length) content.append(actions);

  const wrapper = document.createElement('div');
  wrapper.append(content);

  // Add illustration column if present
  if (imageCell) {
    imageCell.className = 'banner-image';
    wrapper.append(imageCell);
    imageCell.closest('.banner > div')?.remove();
  }

  block.textContent = '';
  block.append(wrapper);
}
