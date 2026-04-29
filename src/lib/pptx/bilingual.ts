// Bilingual font helper: splits text into Latin (Arial) and CJK (Microsoft JhengHei)
// runs so PowerPoint renders each script with the correct font.

export const FONT_EN = "Arial";
export const FONT_ZH = "Microsoft JhengHei";

export type Run = { text: string; options: { fontFace: string } };

export function bi(text: string): Run[] {
  const isCJK = (ch: string) => /[⺀-鿿豈-﫿　-〿]/.test(ch);
  const runs: Run[] = [];
  if (!text) return [{ text: "", options: { fontFace: FONT_EN } }];

  let buf = text[0];
  let cjk = isCJK(text[0]);

  for (let i = 1; i < text.length; i++) {
    const c = isCJK(text[i]);
    if (c !== cjk) {
      runs.push({ text: buf, options: { fontFace: cjk ? FONT_ZH : FONT_EN } });
      buf = text[i];
      cjk = c;
    } else {
      buf += text[i];
    }
  }
  runs.push({ text: buf, options: { fontFace: cjk ? FONT_ZH : FONT_EN } });
  return runs;
}
