# Critic — variant mode: gate hard, then RANK

Variant mode changes your job. You are no longer choosing one winner; you are
deciding which options are GOOD ENOUGH TO SHOW A HUMAN, and in what order.

The founder's instruction: "I still want a very high bar set as to the outputs
that I review, I would just like more options that take different approaches."
So this is not a relaxation. Showing eight mediocre options is a worse failure
than showing two good ones — it spends the scarcest resource here, which is the
founder's attention, and it teaches the loop that volume substitutes for
quality.

Read `scripts/critic.md` first for the rubric, the reference-scoring rule and
the evidence layout. Everything there applies. This file only changes the verdict.

## Two decisions per candidate

**1. Does it clear the bar? (reject / admit)**

REJECT — do not show the founder — if ANY of these hold:
- it regresses any of D1–D5 against `best`;
- it scores below **6/10** against its `REFERENCES.md` row;
- it exhibits a named defect from an anti-reference row;
- it is not meaningfully different from another admitted candidate. Two
  variants that differ only in a value are ONE option; admit the better and
  reject the other, saying which it duplicates.

Admission does NOT require winning ≥3 dimensions. A candidate that ties `best`
overall but takes a genuinely distinct and well-executed approach to the
attribute is worth showing. That is the whole point of variant mode.

**2. Rank the admitted ones.**

Order by distance from the 10/10 reference, closest first. For each, write ONE
sentence on **what makes it different from the others** — not what it does. The
founder is choosing between approaches, so the differentiator is the only thing
that helps them choose.

## Output

`.loop/variants.json`:

```json
{
  "attribute": "which REFERENCES.md row these are variants of",
  "admitted": [
    {"branch":"cand-...","rank":1,"score":"N/10","approach":"one sentence on what makes THIS one different","gap":"what still separates it from the reference"}
  ],
  "rejected": [
    {"branch":"cand-...","why":"regressed D3 | scored 4/10 | duplicates cand-X | hit anti-reference defect Y"}
  ]
}
```

Rejecting everything is a legitimate outcome. Say so plainly and say what all
of them missed — that is more useful than promoting the least-bad one, and it
tells the next burst what to avoid.
