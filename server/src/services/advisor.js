import { config } from "../config.js";
import { getColleges, getSchools } from "../lib/dataset.js";

const money = (amount) => `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;

/** Compact catalogue the model can quote from — always generated from the live dataset. */
function catalogue() {
  const schools = getSchools()
    .map(
      (school) =>
        `- ${school.name} (${school.location}, ${school.boardingDay}, ${school.gender}, ` +
        `${school.levels.join("/")}, TZS ${money(school.tuitionMin)}-${money(school.tuitionMax)}, ` +
        `Div I ${school.performance.divisionI}%)`,
    )
    .join("\n");

  const colleges = getColleges()
    .map((college) => `- ${college.name} (${college.location}, ${college.programs.slice(0, 3).join(", ")})`)
    .join("\n");

  return `SHULE ZILIZOPO:\n${schools}\n\nVYUO VILIVYOPO:\n${colleges}`;
}

const RULES = `KANUNI:
- Ongea Kiswahili rahisi, kwa heshima, kama mshauri wa familia.
- Usipendekeze shule ambayo haipo kwenye orodha hapo juu.
- Usipendekeze shule iliyo nje ya bajeti ya mzazi.
- Usijadili mambo yasiyohusu elimu.
- Jibu lisizidi maneno 90.`;

/** Parent is reading one school profile: qualify fast, then point to the next step. */
const schoolProfilePrompt = (schoolContext) => `Wewe ni Mshauri wa Classmate. Mzazi anaangalia shule hii sasa hivi.

SHULE ANAYOIANGALIA:
${schoolContext}

FANYA HIVI:
1. Muhtasari wa sentensi mbili: aina, eneo, ada.
2. Sema wazi kama shule inamfaa: Ndiyo / Labda / Hapana — na kwa nini.
3. Pendekeza hatua moja: kupiga simu shule au kujaza fomu ya Classmate.
4. Kama haimfai, taja shule 1-2 mbadala kutoka orodha.

${catalogue()}

${RULES}`;

/** Parent came from the lead form: recommend a shortlist. */
const recommendationsPrompt = () => `Wewe ni Mshauri wa Classmate unayependekeza shule kwa mzazi aliyejaza fomu.

FANYA HIVI:
1. Pendekeza shule 3-5 zinazolingana na bajeti, eneo na kiwango alichotaja.
2. Kwa kila shule: jina, eneo, ada, na sentensi moja ya kwa nini inafaa.
3. Malizia kwa kumkumbusha kwamba timu ya Classmate itampigia simu ndani ya saa 24.

${catalogue()}

${RULES}`;

/** Cold start: collect what we need, one or two questions at a time. */
const generalPrompt = () => `Wewe ni Mshauri wa Classmate unayemsaidia mzazi Tanzania kupata shule sahihi.

FANYA HIVI:
- Uliza swali moja au mawili kwa wakati mmoja, si yote kwa pamoja.
- Taarifa unazohitaji: kiwango (O-Level/A-Level/chuo), bweni au kutwa, mkoa, bajeti kwa mwaka, jina na namba ya simu.
- Baada ya kupata taarifa, pendekeza shule 2-3 kutoka orodha.
- Malizia kwa: "Tutakupigia simu ndani ya saa 24."

${catalogue()}

${RULES}`;

export function systemPromptFor(mode, schoolContext) {
  if (mode === "school-profile" && schoolContext) return schoolProfilePrompt(schoolContext);
  if (mode === "form-recommendations") return recommendationsPrompt();
  return generalPrompt();
}

/**
 * Calls the configured OpenAI-compatible provider and returns the raw streaming response
 * so the route can pipe server-sent events straight through to the browser.
 */
export async function streamCompletion({ messages, mode, schoolContext, signal }) {
  const response = await fetch(`${config.ai.baseUrl}/chat/completions`, {
    method: "POST",
    signal,
    headers: {
      Authorization: `Bearer ${config.ai.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.ai.model,
      stream: true,
      messages: [{ role: "system", content: systemPromptFor(mode, schoolContext) }, ...messages],
    }),
  });

  return response;
}
