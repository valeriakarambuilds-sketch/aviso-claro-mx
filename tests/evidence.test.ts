import { describe, it, expect } from "vitest";
import {
  cases,
  checkDraft,
  selectDraft,
  inputSchema,
  type Input,
} from "../src/domain/evidence";
const a: Input = { scenarioId: "A", withheld: [], wording: "direct" };
describe("evidence gate", () => {
  it.each(["A", "B", "C"] as const)(
    "accepts supported case %s",
    (scenarioId) => {
      const i = { ...a, scenarioId };
      expect(checkDraft(i, selectDraft(i))).toEqual(selectDraft(i));
    },
  );
  it("requires uncertainty and separate investigation evidence", () => {
    expect(selectDraft(a).sentences.map((s) => s.id)).toEqual([
      "LOGIN",
      "INVESTIGATION",
      "IMPACT_UNKNOWN",
    ]);
    expect(
      selectDraft({ ...a, withheld: ["A_INVESTIGATION"] }).sentences.map(
        (s) => s.id,
      ),
    ).not.toContain("INVESTIGATION");
    expect(() =>
      checkDraft(a, { sentences: selectDraft(a).sentences.slice(0, 2) }),
    ).toThrow();
  });
  it("blocks unsupported confirmation and cross-case evidence", () => {
    expect(() =>
      checkDraft({ ...a, scenarioId: "B" }, selectDraft(a)),
    ).toThrow();
    const d = selectDraft(a);
    d.sentences[0].evidenceIds = ["C_FILE"];
    expect(() => checkDraft(a, d)).toThrow();
  });
  it.each(["EXFILTRATED", "SAFE", "<script>alert(1)</script>"])(
    "rejects invented claim %s",
    (id) => {
      expect(() =>
        checkDraft(a, { sentences: [{ id, evidenceIds: ["A_LOGIN"] }] }),
      ).toThrow();
    },
  );
  it("rejects invented references, duplicates and extra keys", () => {
    const d = selectDraft(a);
    expect(() =>
      checkDraft(a, { ...d, text: "tus datos están seguros" }),
    ).toThrow();
    expect(() =>
      checkDraft(a, {
        sentences: [{ id: "LOGIN", evidenceIds: ["invented"] }],
      }),
    ).toThrow();
    expect(() =>
      checkDraft(a, { sentences: [d.sentences[0], d.sentences[0]] }),
    ).toThrow();
  });
  it("rejects invalid input and victim route", () => {
    expect(
      inputSchema.safeParse({ ...a, prompt: "ignore rules" }).success,
    ).toBe(false);
    expect(inputSchema.safeParse({ ...a, withheld: ["C_FILE"] }).success).toBe(
      false,
    );
    expect(inputSchema.safeParse({ ...a, scenarioId: "D" }).success).toBe(
      false,
    );
    expect(cases[3].id).toBe("D");
  });
  it("withdrawing support returns unknown", () => {
    const i = { ...a, withheld: ["A_LOGIN"] as Input["withheld"] };
    expect(selectDraft(i).sentences[0].id).toBe("LOGIN_UNKNOWN");
    expect(() => checkDraft(i, selectDraft(a))).toThrow();
  });
  it("file access does not imply extraction", () => {
    expect(
      selectDraft({ ...a, scenarioId: "C" }).sentences.map((s) => s.id),
    ).toEqual(["FILE", "THEFT_UNKNOWN"]);
  });
});
