// ============================================================================
// CHIBI MYSTERY — 20 CASES (v4)
// ----------------------------------------------------------------------------
// RULES:
//  - SCENARIO: states the crime and who was present. NO hints, NO "look again",
//    NO nudging toward or away from anyone. Zero spoilers.
//  - CLUES: short, factual, oblique. Never explain the reasoning. Never reuse the
//    exact words from a suspect's statement. The player connects them.
//  - MIX (so no pattern can be exploited):
//      * TYPE A cases: the OBVIOUS suspect IS guilty — but clues create doubt, so
//        the player must confirm rather than assume.
//      * TYPE B cases: the obvious suspect is a RED HERRING — a subtler culprit.
//    Types are shuffled so players can never guess by pattern.
//  - SOLUTION: shown only AFTER the accusation.
// ============================================================================

export type CaseSuspect = { id: string; name: string; imageUrl: string; statement: string; };
export type MysteryCase = {
  id: string; title: string; scenario: string;
  suspects: CaseSuspect[]; clues: string[]; culpritId: string;
  examSeconds: 20 | 30 | 45 | 60; solution: string;
};

export const CASES: MysteryCase[] = [
  // ── 1 · TYPE B (red herring: librarian) ─────────────────────────────────
  {
    id: 'c1-missing-page',
    title: 'The Missing Page',
    scenario: 'A page was cut from a first-edition book in the manor study. Five people were in the room that hour.',
    suspects: [
      { id: 's1', name: 'Miss Dale', imageUrl: '/suspects/librarian.png', statement: 'I was reshelving in the next room the whole hour.' },
      { id: 's2', name: 'Prof. Ainsley', imageUrl: '/suspects/professor.png', statement: 'I only gave my lecture by the fireplace. I never touched the books.' },
      { id: 's3', name: 'Rex Cole', imageUrl: '/suspects/pickpocket.png', statement: 'I dozed off in the armchair across the room.' },
      { id: 's4', name: 'Lady Verne', imageUrl: '/suspects/aristocrat_fan.png', statement: 'I browsed the art prints on the far wall.' },
      { id: 's5', name: 'Silas Penn', imageUrl: '/suspects/goldrings_dealer.png', statement: 'I admired the globes by the window.' },
    ],
    clues: [
      'The cut was slow and careful. No tearing.',
      'Wet ink smeared the desk edge.',
      'The chair at the desk was warm.',
    ],
    culpritId: 's2',
    examSeconds: 30,
    solution: 'Wet ink means someone had been writing, not reading — and the warm chair puts them at the desk. Dale was in the next room, Cole across the room, Verne at the far wall, Penn at the window. Only Ainsley was at the desk with pen in hand, preparing his lecture. His "never touched the books" was the lie. The culprit is Prof. Ainsley.',
  },

  // ── 2 · TYPE A (obvious IS guilty: gardener) ────────────────────────────
  {
    id: 'c2-greenhouse',
    title: 'The Greenhouse Theft',
    scenario: 'A rare orchid vanished from the locked greenhouse during the evening party. Five guests had been near it.',
    suspects: [
      { id: 's1', name: 'Old Fen', imageUrl: '/suspects/gardener.png', statement: 'I locked up at dusk and went straight to the buffet.' },
      { id: 's2', name: 'Miss Quill', imageUrl: '/suspects/curator.png', statement: 'I catalogued the plants at noon and returned the key.' },
      { id: 's3', name: 'Lady Ashcroft', imageUrl: '/suspects/lady_red.png', statement: 'I never left the ballroom.' },
      { id: 's4', name: 'Andre', imageUrl: '/suspects/waiter.png', statement: 'I served drinks indoors all evening.' },
      { id: 's5', name: 'Mr. Vance', imageUrl: '/suspects/businessman_grey2.png', statement: 'I took calls in the lobby.' },
    ],
    clues: [
      'The lock was opened, not forced.',
      'Wet soil tracked from the beds into the hall.',
      'The thief lifted the orchid without bruising one leaf.',
    ],
    culpritId: 's1',
    examSeconds: 30,
    solution: 'A key opened it — Quill returned hers, so only the keeper still held one. Wet soil means someone walked the beds; only one came in with muddy boots. And lifting a delicate orchid unharmed takes practiced hands. All three point to Old Fen, whose "straight to the buffet" was a lie. Sometimes the obvious suspect really did it. The culprit is Old Fen.',
  },

  // ── 3 · TYPE B (red herring: chef) ──────────────────────────────────────
  {
    id: 'c3-ruined-cake',
    title: 'The Ruined Cake',
    scenario: "The bake-off's winning cake was ruined — its sugar swapped for salt. Five people were backstage.",
    suspects: [
      { id: 's1', name: 'Baker Nan', imageUrl: '/suspects/chef.png', statement: 'I was at my station icing my own tarts.' },
      { id: 's2', name: 'Mr. Vance', imageUrl: '/suspects/businessman_grey2.png', statement: 'I stepped into the pantry to check my sponsorship crates.' },
      { id: 's3', name: 'Old Fen', imageUrl: '/suspects/gardener.png', statement: 'I was outside with the flower displays.' },
      { id: 's4', name: 'Miss Dale', imageUrl: '/suspects/librarian.png', statement: 'I judged the recipe essays in the tent.' },
      { id: 's5', name: 'Rex Cole', imageUrl: '/suspects/pickpocket.png', statement: 'I ran the scoreboard out front.' },
    ],
    clues: [
      'The salt came from the shared supply room.',
      'The jar was clean — no icing, no flour.',
      'It took several unwatched minutes indoors.',
    ],
    culpritId: 's2',
    examSeconds: 30,
    solution: 'The floured baker is the easy guess — but the jar was clean of icing and flour, and she was in full view at her station. The salt came from the shared supply room, which the outdoor and front-desk staff never entered, and Dale was in the tent. Only Vance admits going into that room, alone. The culprit is Mr. Vance.',
  },

  // ── 4 · TYPE A (obvious IS guilty: security chief) ──────────────────────
  {
    id: 'c4-erased-footage',
    title: 'The Erased Footage',
    scenario: 'Security tapes were wiped from inside the locked control room during a theft. Five staff were on shift.',
    suspects: [
      { id: 's1', name: 'Chief Groves', imageUrl: '/suspects/security.png', statement: 'I was patrolling the outer galleries all shift.' },
      { id: 's2', name: 'Prof. Ainsley', imageUrl: '/suspects/professor.png', statement: 'I consulted on the archive system that morning, then left.' },
      { id: 's3', name: 'Chef Marco', imageUrl: '/suspects/chef.png', statement: 'I was in the café doing paperwork.' },
      { id: 's4', name: 'Toby', imageUrl: '/suspects/pickpocket.png', statement: 'I was by the vending machines.' },
      { id: 's5', name: 'Lady Verne', imageUrl: '/suspects/aristocrat_fan.png', statement: 'I was in the powder room.' },
    ],
    clues: [
      'The control room door opens only to a wired staff channel.',
      'No camera recorded the galleries during the wipe.',
      'The consultant signed out an hour before it happened.',
    ],
    culpritId: 's1',
    examSeconds: 30,
    solution: 'The consultant looks technical — but he signed out an hour early. The door needs the wired staff channel; only one person wears an earpiece. And his own alibi collapses: the galleries had no footage during the wipe, because he was the one erasing it. Groves faked his patrol. The culprit is Chief Groves.',
  },

  // ── 5 · TYPE B (red herring: jeweler) ───────────────────────────────────
  {
    id: 'c5-necklace-swap',
    title: 'The Necklace Swap',
    scenario: 'A diamond necklace was swapped for paste during a fitting. Five people were in the house.',
    suspects: [
      { id: 's1', name: 'Silas Penn', imageUrl: '/suspects/goldrings_dealer.png', statement: 'I appraised it, then greeted guests at the door.' },
      { id: 's2', name: 'Andre', imageUrl: '/suspects/waiter.png', statement: 'I carried the tray between the vault and the fitting room.' },
      { id: 's3', name: 'Mrs. Holt', imageUrl: '/suspects/aristocrat_fan.png', statement: 'I watched the fitting from across the room.' },
      { id: 's4', name: 'Old Fen', imageUrl: '/suspects/gardener.png', statement: 'I watered the lobby plants.' },
      { id: 's5', name: 'Chief Groves', imageUrl: '/suspects/security.png', statement: 'I stood at the vault door.' },
    ],
    clues: [
      'The real necklace left the vault. The paste arrived at the fitting.',
      'The door was crowded with guests the whole time.',
      'Only one pair of hands held the tray in between.',
    ],
    culpritId: 's2',
    examSeconds: 30,
    solution: 'The swap happened in transit — the real one left the vault, the fake arrived. The jeweler was at the crowded door in full view. Groves stayed at the vault, Holt across the room, Fen in the lobby. Only Andre carried the tray between the two points, alone. The culprit is Andre.',
  },

  // ── 6 · TYPE A (obvious IS guilty: pickpocket) ──────────────────────────
  {
    id: 'c6-lifted-wallet',
    title: 'The Lifted Wallet',
    scenario: 'A wallet was taken from a guest in the crowded gallery. Five people were on the floor.',
    suspects: [
      { id: 's1', name: 'Rex Cole', imageUrl: '/suspects/pickpocket.png', statement: 'I was near the crowd, but I never touched anyone.' },
      { id: 's2', name: 'Miss Quill', imageUrl: '/suspects/curator.png', statement: 'I gave a tour by the sculptures.' },
      { id: 's3', name: 'Lady Ashcroft', imageUrl: '/suspects/lady_red.png', statement: 'I stayed away from the press of people.' },
      { id: 's4', name: 'Prof. Ainsley', imageUrl: '/suspects/professor.png', statement: 'I read one plaque the entire visit.' },
      { id: 's5', name: 'Chef Marco', imageUrl: '/suspects/chef.png', statement: 'I set up the catering table.' },
    ],
    clues: [
      'The lift left no prints on the leather.',
      'It happened in the thick of the crowd, shoulder to shoulder.',
      'The fingers that did it were bare. The palms were not.',
    ],
    culpritId: 's1',
    examSeconds: 30,
    solution: 'Bare fingers, covered palms — fingerless gloves. No prints, but the touch of a practiced hand, and it happened deep in the crowd where only one suspect stood. Quill was at the sculptures, Ashcroft away from people, Ainsley at a plaque, Marco at the table. This time the obvious suspect was the right one. The culprit is Rex Cole.',
  },

  // ── 7 · TYPE B (red herring: pickpocket) ────────────────────────────────
  {
    id: 'c7-lifted-brooch',
    title: 'The Lifted Brooch',
    scenario: 'A diamond brooch was unpinned from a guest at the ball. Five people were near her.',
    suspects: [
      { id: 's1', name: 'Toby', imageUrl: '/suspects/pickpocket.png', statement: 'I was dancing in the middle of the floor.' },
      { id: 's2', name: 'Lady Verne', imageUrl: '/suspects/aristocrat_fan.png', statement: 'I embraced her to offer congratulations, then stepped away.' },
      { id: 's3', name: 'Andre', imageUrl: '/suspects/waiter.png', statement: 'I served champagne along the far wall.' },
      { id: 's4', name: 'Captain Mercer', imageUrl: '/suspects/captain.png', statement: 'I stood by the terrace doors.' },
      { id: 's5', name: 'Miss Quill', imageUrl: '/suspects/curator.png', statement: 'I studied the portraits in the alcove.' },
    ],
    clues: [
      'The pin was undone by hands within arm\'s reach of her chest.',
      'Dozens watched the dance floor all evening.',
      'She was touched by exactly one person that hour.',
    ],
    culpritId: 's2',
    examSeconds: 30,
    solution: 'The known thief is the easy pick — but dozens watched him dance. The brooch needed hands at her chest, and only one person made physical contact: Lady Verne, whose warm embrace was the cover. Andre was at the wall, Mercer at the doors, Quill in the alcove. The culprit is Lady Verne.',
  },

  // ── 8 · TYPE A (obvious IS guilty: dockworker) ──────────────────────────
  {
    id: 'c8-pried-crate',
    title: 'The Pried Crate',
    scenario: 'A shipping crate was forced open on the dock and its contents taken. Five workers were on shift.',
    suspects: [
      { id: 's1', name: 'Rusty Doyle', imageUrl: '/suspects/docworker.png', statement: 'I was on the far pier all morning. My tools stayed in my belt.' },
      { id: 's2', name: 'Captain Mercer', imageUrl: '/suspects/captain.png', statement: 'I checked the tide tables in the harbor office.' },
      { id: 's3', name: 'Miss Dale', imageUrl: '/suspects/librarian.png', statement: 'I logged the manifests in the shed.' },
      { id: 's4', name: 'Mr. Vance', imageUrl: '/suspects/businessman_grey2.png', statement: 'I inspected the paperwork from the truck cab.' },
      { id: 's5', name: 'Toby', imageUrl: '/suspects/pickpocket.png', statement: 'I swept the loading bay.' },
    ],
    clues: [
      'The lid was levered, not cut. Metal on metal.',
      'A wrench-shaped dent scored the crate rim.',
      'Grease from the same tool marked the lid.',
    ],
    culpritId: 's1',
    examSeconds: 30,
    solution: 'A wrench dented the rim, and its grease marked the lid — only one man carries a wrench, and his hands and face still show the grime. His claim that his tools "stayed in his belt" fails: the tool marks are his. This time the obvious one is guilty. The culprit is Rusty Doyle.',
  },

  // ── 9 · TYPE B (red herring: dockworker) ────────────────────────────────
  {
    id: 'c9-jammed-vault',
    title: 'The Jammed Vault',
    scenario: 'A gold medallion was taken from the museum vault. The vault showed tool marks. Five people were on site.',
    suspects: [
      { id: 's1', name: 'Rusty Doyle', imageUrl: '/suspects/docworker.png', statement: 'I lent my wrench to the handyman an hour before.' },
      { id: 's2', name: 'Chief Groves', imageUrl: '/suspects/security.png', statement: 'I did the final vault check alone before closing.' },
      { id: 's3', name: 'Lady Ashcroft', imageUrl: '/suspects/lady_red.png', statement: 'I admired the chandelier from the balcony.' },
      { id: 's4', name: 'Miss Quill', imageUrl: '/suspects/curator.png', statement: 'I read the placards by the entrance.' },
      { id: 's5', name: 'Mr. Vance', imageUrl: '/suspects/businessman_grey2.png', statement: 'I took a call in the corner.' },
    ],
    clues: [
      'The lock logged a correct code before the tool marks were made.',
      'The scratches sit on top of an already-open door.',
      'The wrench was in another man\'s hands at the time.',
    ],
    culpritId: 's2',
    examSeconds: 30,
    solution: 'The tool marks were staged — the lock logged the correct code first, and the scratches sit on a door already open. The wrench-carrier had lent his tool away. Only one person had the code and was alone with the vault: Groves faked a break-in to hide an inside job. The culprit is Chief Groves.',
  },

  // ── 10 · TYPE A (obvious IS guilty: aristocrat) ─────────────────────────
  {
    id: 'c10-dropped-fan',
    title: 'The Dropped Clue',
    scenario: 'A brooch was stolen from the powder room during the ball. Five guests were nearby.',
    suspects: [
      { id: 's1', name: 'Mrs. Holt', imageUrl: '/suspects/aristocrat_fan.png', statement: 'I never left the dance floor.' },
      { id: 's2', name: 'Silas Penn', imageUrl: '/suspects/goldrings_dealer.png', statement: 'I was at the bar all evening.' },
      { id: 's3', name: 'Miss Quill', imageUrl: '/suspects/curator.png', statement: 'I viewed the portrait hall.' },
      { id: 's4', name: 'Captain Mercer', imageUrl: '/suspects/captain.png', statement: 'I stepped onto the terrace for air.' },
      { id: 's5', name: 'Rex Cole', imageUrl: '/suspects/pickpocket.png', statement: 'I watched the band up front.' },
    ],
    clues: [
      'Something delicate and folded lay outside the powder room door.',
      'It was lace, hand-painted, costly.',
      'Only one guest arrived carrying such a thing.',
    ],
    culpritId: 's1',
    examSeconds: 30,
    solution: 'A costly lace fan lay outside the powder room — and only one guest carried a fan all evening. Her claim of never leaving the dance floor is broken by the thing she dropped fleeing. The obvious suspect, caught by her own belonging. The culprit is Mrs. Holt.',
  },

  // ── 11 · TYPE B (red herring: nervous guard) ────────────────────────────
  {
    id: 'c11-forged-vote',
    title: 'The Forged Vote',
    scenario: 'Forged ballots were slipped into the sealed election box. Five members handled it that evening.',
    suspects: [
      { id: 's1', name: 'Officer Bell', imageUrl: '/suspects/guard.png', statement: 'I carried the box to the table before voting started, then stood aside.' },
      { id: 's2', name: 'Miss Dale', imageUrl: '/suspects/librarian.png', statement: 'I minded the box alone during the dinner break.' },
      { id: 's3', name: 'Silas Penn', imageUrl: '/suspects/goldrings_dealer.png', statement: 'I voted first and left for the lounge.' },
      { id: 's4', name: 'Captain Mercer', imageUrl: '/suspects/captain.png', statement: 'I poured drinks at the bar.' },
      { id: 's5', name: 'Mrs. Holt', imageUrl: '/suspects/aristocrat_fan.png', statement: 'I counted the tally in front of witnesses.' },
    ],
    clues: [
      'The forgeries were among the sealed ballots, not the loose ones.',
      'The box was empty when it was carried in.',
      'For twenty minutes, no one watched it.',
    ],
    culpritId: 's2',
    examSeconds: 30,
    solution: 'The sweating guard only touched an empty box — nothing to forge yet. The tally was counted before witnesses. The forgeries were inside the sealed box, added during the twenty unwatched minutes — and only one person was alone with it then. Her volunteering was the setup. The culprit is Miss Dale.',
  },

  // ── 12 · TYPE A (obvious IS guilty: chef) ───────────────────────────────
  {
    id: 'c12-spoiled-punch',
    title: 'The Spoiled Punch',
    scenario: 'The party punch was ruined with vinegar just before the toast. Five people were on the lawn.',
    suspects: [
      { id: 's1', name: 'Baker Nan', imageUrl: '/suspects/chef.png', statement: 'I topped up the bowl right before the toast, then stepped back.' },
      { id: 's2', name: 'Mrs. Holt', imageUrl: '/suspects/aristocrat_fan.png', statement: 'I sat under the shade tent all afternoon.' },
      { id: 's3', name: 'Old Fen', imageUrl: '/suspects/gardener.png', statement: 'I pruned the far hedges.' },
      { id: 's4', name: 'Rex Cole', imageUrl: '/suspects/pickpocket.png', statement: 'I greeted arrivals at the gate.' },
      { id: 's5', name: 'Mr. Vance', imageUrl: '/suspects/businessman_grey2.png', statement: 'I took calls in the study.' },
    ],
    clues: [
      'The vinegar was poured in slowly, minutes before the toast.',
      'Whoever did it stood over the bowl without drawing a glance.',
      'They had every reason to be holding a ladle.',
    ],
    culpritId: 's1',
    examSeconds: 30,
    solution: 'The vinegar went in minutes before the toast — exactly when she topped up the bowl. Standing over it with a ladle drew no attention at all; that was the point. Holt was under the tent, Fen at the hedges, Cole at the gate, Vance in the study. The obvious hand was the guilty one. The culprit is Baker Nan.',
  },

  // ── 13 · TYPE B (red herring: curator) ──────────────────────────────────
  {
    id: 'c13-stolen-portrait',
    title: 'The Stolen Portrait',
    scenario: 'A small portrait was lifted from a private viewing without tripping the wire alarm. Five attendees were present.',
    suspects: [
      { id: 's1', name: 'Miss Quill', imageUrl: '/suspects/curator.png', statement: 'I discussed brushwork with the owner by the entrance.' },
      { id: 's2', name: 'Lady Verne', imageUrl: '/suspects/aristocrat_fan.png', statement: 'I drifted between the rooms, but touched nothing.' },
      { id: 's3', name: 'Mr. Vance', imageUrl: '/suspects/businessman_grey2.png', statement: 'I took a call in the side room.' },
      { id: 's4', name: 'Prof. Ainsley', imageUrl: '/suspects/professor.png', statement: 'I stood before the big landscape the whole hour.' },
      { id: 's5', name: 'Silas Penn', imageUrl: '/suspects/goldrings_dealer.png', statement: 'I looked only at the sculptures in the far hall.' },
    ],
    clues: [
      'The wire was lifted, not cut. Someone knew where it ran.',
      'Everyone else stayed rooted to one spot.',
      'The frame came off the wall in under a minute, unhurried.',
    ],
    culpritId: 's2',
    examSeconds: 30,
    solution: 'The curator knows the wiring — but she was pinned at the entrance with the owner. Vance was in the side room, Ainsley fixed at one painting, Penn in the far hall. Only Lady Verne moved freely between rooms, unwatched, long enough to lift the wire and the frame. "Touched nothing" was the lie. The culprit is Lady Verne.',
  },

  // ── 14 · TYPE A (obvious IS guilty: professor) ──────────────────────────
  {
    id: 'c14-swapped-map',
    title: 'The Swapped Map',
    scenario: 'A priceless antique map was replaced with a modern copy in the archive. Five people had access that day.',
    suspects: [
      { id: 's1', name: 'Prof. Ainsley', imageUrl: '/suspects/professor.png', statement: 'I studied the map for hours, then handed it back myself.' },
      { id: 's2', name: 'Miss Dale', imageUrl: '/suspects/librarian.png', statement: 'I shelved journals in the next aisle.' },
      { id: 's3', name: 'Chief Groves', imageUrl: '/suspects/security.png', statement: 'I stood at the archive door.' },
      { id: 's4', name: 'Toby', imageUrl: '/suspects/pickpocket.png', statement: 'I mopped the corridor outside.' },
      { id: 's5', name: 'Lady Ashcroft', imageUrl: '/suspects/lady_red.png', statement: 'I toured the reading room briefly.' },
    ],
    clues: [
      'The copy was aged to match — creases in the right places.',
      'Making it required hours with the original, uninterrupted.',
      'Only one person ever had it in their hands.',
    ],
    culpritId: 's1',
    examSeconds: 30,
    solution: 'The forgery was creased to match the original — that takes hours alone with it. Only one person held the map at all, studied it for hours, and handed back what everyone assumed was the same sheet. His openness was the cover. The culprit is Prof. Ainsley.',
  },

  // ── 15 · TYPE B (red herring: captain) ──────────────────────────────────
  {
    id: 'c15-harbor-crate',
    title: 'The Harbor Heist',
    scenario: 'A crate of rare goods vanished from the ship\'s hold overnight. Five crew were aboard.',
    suspects: [
      { id: 's1', name: 'Captain Mercer', imageUrl: '/suspects/captain.png', statement: 'I slept in my cabin, far from the hold.' },
      { id: 's2', name: 'Silas Penn', imageUrl: '/suspects/goldrings_dealer.png', statement: 'I checked the manifest in the hold before turning in.' },
      { id: 's3', name: 'Miss Dale', imageUrl: '/suspects/librarian.png', statement: 'I filed papers in the deck office.' },
      { id: 's4', name: 'Rex Cole', imageUrl: '/suspects/pickpocket.png', statement: 'I kept watch at the gangway.' },
      { id: 's5', name: 'Old Fen', imageUrl: '/suspects/gardener.png', statement: 'I loaded the supply cart ashore.' },
    ],
    clues: [
      'One crate of forty was taken. The right one.',
      'No stranger crossed the gangway.',
      'Someone had been counting in the hold that night.',
    ],
    culpritId: 's2',
    examSeconds: 30,
    solution: 'Forty crates, and only the valuable one taken — the thief knew exactly which. No outsider boarded. Someone had been down in the hold counting: Penn, who checked the manifest and learned the value. The captain slept far off, Dale was in the office, Fen ashore, Cole at the rail. The culprit is Silas Penn.',
  },

  // ── 16 · TYPE A (obvious IS guilty: security chief) ─────────────────────
  {
    id: 'c16-emptied-box',
    title: 'The Emptied Box',
    scenario: 'The museum donation box was emptied inside a staff-only room. Five people were in the building.',
    suspects: [
      { id: 's1', name: 'Chief Groves', imageUrl: '/suspects/security.png', statement: 'I checked the staff room at close, as I do nightly.' },
      { id: 's2', name: 'Officer Bell', imageUrl: '/suspects/guard.png', statement: 'I did the front rounds and never went to the back.' },
      { id: 's3', name: 'Chef Marco', imageUrl: '/suspects/chef.png', statement: 'I was in the café kitchen.' },
      { id: 's4', name: 'Toby', imageUrl: '/suspects/pickpocket.png', statement: 'I stayed outside the whole day.' },
      { id: 's5', name: 'Prof. Ainsley', imageUrl: '/suspects/professor.png', statement: 'I lectured in the east hall.' },
    ],
    clues: [
      'The staff room opens only to a badge on the security channel.',
      'It happened after close, when the halls were empty.',
      'The last person in the room signed no log.',
    ],
    culpritId: 's1',
    examSeconds: 30,
    solution: 'The badge and the security channel narrow it to two guards — but Bell stayed at the front, and the theft happened after close, when only one man makes the final check. He was last in the room and logged nothing. His routine was the cover. The culprit is Chief Groves.',
  },

  // ── 17 · TYPE B (red herring: waiter's gloves) ──────────────────────────
  {
    id: 'c17-smudged-case',
    title: 'The Smudged Case',
    scenario: 'A jeweled goblet was taken from its glass case at the banquet. No prints were found. Five people were in the hall.',
    suspects: [
      { id: 's1', name: 'Andre', imageUrl: '/suspects/waiter.png', statement: 'I served the far tables all night.' },
      { id: 's2', name: 'Mrs. Holt', imageUrl: '/suspects/aristocrat_fan.png', statement: 'I sat beside the case admiring the goblet for an hour.' },
      { id: 's3', name: 'Old Fen', imageUrl: '/suspects/gardener.png', statement: 'I tended the pots outside.' },
      { id: 's4', name: 'Rex Cole', imageUrl: '/suspects/pickpocket.png', statement: 'I stood at the coat rack.' },
      { id: 's5', name: 'Chief Groves', imageUrl: '/suspects/security.png', statement: 'I watched the front door.' },
    ],
    clues: [
      'No prints, but no gloves were needed either — the hands wore lace.',
      'The thief never left their seat before the theft.',
      'The far tables, the door, the coat rack, and the garden are all across the hall.',
    ],
    culpritId: 's2',
    examSeconds: 30,
    solution: 'White gloves are the obvious answer — but the hands wore lace, and the thief never left their seat, which rules out the moving waiter. Everyone else was across the hall. Only Mrs. Holt sat beside the case for an hour, her lace gloves leaving no prints. The culprit is Mrs. Holt.',
  },

  // ── 18 · TYPE A (obvious IS guilty: curator) ────────────────────────────
  {
    id: 'c18-authenticated-fake',
    title: 'The Authenticated Fake',
    scenario: 'A masterpiece sold at auction turned out to be a fake. Five people handled it before the sale.',
    suspects: [
      { id: 's1', name: 'Miss Quill', imageUrl: '/suspects/curator.png', statement: 'I authenticated it alone and sealed the crate myself.' },
      { id: 's2', name: 'Silas Penn', imageUrl: '/suspects/goldrings_dealer.png', statement: 'I valued the frame only, never the canvas.' },
      { id: 's3', name: 'Andre', imageUrl: '/suspects/waiter.png', statement: 'I carried the crate, sealed, to the floor.' },
      { id: 's4', name: 'Mr. Vance', imageUrl: '/suspects/businessman_grey2.png', statement: 'I handled the paperwork.' },
      { id: 's5', name: 'Captain Mercer', imageUrl: '/suspects/captain.png', statement: 'I shipped it, crate unopened.' },
    ],
    clues: [
      'The crate\'s seal was never broken after it left the study.',
      'The swap happened before the seal went on.',
      'Only one person was alone with the canvas.',
    ],
    culpritId: 's1',
    examSeconds: 30,
    solution: 'The seal was never broken after the study, so the swap happened before it was sealed — and only one person was alone with the canvas then, and sealed the crate herself. The very expert trusted to verify it was the one who switched it. The culprit is Miss Quill.',
  },

  // ── 19 · TYPE B (red herring: businessman) ──────────────────────────────
  {
    id: 'c19-leaked-bid',
    title: 'The Leaked Bid',
    scenario: 'A sealed bid was leaked to a rival before the auction. Five people knew of it.',
    suspects: [
      { id: 's1', name: 'Mr. Vance', imageUrl: '/suspects/businessman_grey2.png', statement: 'I was on my phone in the lobby all morning.' },
      { id: 's2', name: 'Miss Dale', imageUrl: '/suspects/librarian.png', statement: 'I filed the sealed envelopes in the records room.' },
      { id: 's3', name: 'Lady Ashcroft', imageUrl: '/suspects/lady_red.png', statement: 'I waited in the salon.' },
      { id: 's4', name: 'Toby', imageUrl: '/suspects/pickpocket.png', statement: 'I ran errands between floors.' },
      { id: 's5', name: 'Captain Mercer', imageUrl: '/suspects/captain.png', statement: 'I read the paper in the hall.' },
    ],
    clues: [
      'The rival knew the exact figure, not a rumour of it.',
      'The envelopes never left the records room.',
      'One seal had been steamed and re-glued.',
    ],
    culpritId: 's2',
    examSeconds: 30,
    solution: 'The phone-glued businessman is the easy guess — but the rival knew the exact figure, which meant reading the sealed paper itself. The envelopes never left the records room, and one seal was steamed open and re-glued. Only one person was in that room with them. The culprit is Miss Dale.',
  },

  // ── 20 · TYPE A (obvious IS guilty: jeweler) ────────────────────────────
  {
    id: 'c20-vanished-ring',
    title: 'The Vanished Ring',
    scenario: 'A diamond ring disappeared from a velvet tray at a private showing. Five clients were at the counter.',
    suspects: [
      { id: 's1', name: 'Silas Penn', imageUrl: '/suspects/goldrings_dealer.png', statement: 'I tried several rings on, then set them all back.' },
      { id: 's2', name: 'Lady Verne', imageUrl: '/suspects/aristocrat_fan.png', statement: 'I pointed at pieces but never reached the tray.' },
      { id: 's3', name: 'Captain Mercer', imageUrl: '/suspects/captain.png', statement: 'I kept my hands in my coat by the door.' },
      { id: 's4', name: 'Toby', imageUrl: '/suspects/pickpocket.png', statement: 'I stayed at the far watch case.' },
      { id: 's5', name: 'Mr. Vance', imageUrl: '/suspects/businessman_grey2.png', statement: 'I signed papers at the desk.' },
    ],
    clues: [
      'The ring left the tray while a hand was openly among the pieces.',
      'The tray was counted after; one was missing, one finger richer.',
      'No one else came within reach of the velvet.',
    ],
    culpritId: 's1',
    examSeconds: 30,
    solution: 'The known pickpocket was across the room, and no one else reached the velvet. The ring vanished while a hand was openly among the pieces — a hand already covered in rings, where one more drew no notice. The obvious suspect, hiding in plain sight. The culprit is Silas Penn.',
  },
];