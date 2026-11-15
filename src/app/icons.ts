import type { PowerId } from "../game/domain";
const paths: Record<PowerId, string> = {
  alien: "M3 14Q12 7 21 14Q12 22 3 14ZM7 11Q12 1 17 11M8 17V20M16 17V20",
  earthquake: "M2 14L7 11L10 17L14 7L17 13L22 10M3 21H21",
  meteor: "M5 2L12 8M11 2L17 7M3 7L8 13M13 9A6 6 0 1 1 8 15Q8 10 13 9Z",
  tornado:
    "M3 4Q12 0 21 4M5 9Q12 6 19 9M7 14Q12 11 17 14M10 19Q13 17 15 19M13 22H15",
  volcano: "M2 21L9 10L12 14L15 9L22 21ZM10 7L9 3M14 6L16 2M5 9L3 6",
  lightning: "M14 2L5 14H11L10 22L20 9H13Z",
};
export function icon(id: PowerId) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${`<path d="${paths[id]}"/>`}</svg>`;
}
