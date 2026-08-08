# Daily Mystery

## Overview
Daily Mystery is a deduction game you play inside Reddit. Each day presents a new
crime: a short scenario, five suspects, and their alibis. You study the suspects
under a timer, then reveal clues one at a time and accuse the culprit. The obvious
suspect is not always guilty — you have to reason from the clues. The fewer clues
you use before a correct accusation, the higher your score.

Players climb a leaderboard based on their total score across cases. There is also
a case creator: players can build their own mystery — pick suspects, write the
statements and clues, mark the culprit — and share it for other players to solve.

**Who it's for:** anyone who enjoys short daily puzzle games like Wordle, or
detective/deduction games. No account setup needed beyond Reddit.

**Critical operational notes:** the game runs entirely within a Reddit post. Player
progress, scores, and community-created cases are stored using Devvit's built-in
Redis. A player's own created case does not add to their leaderboard score (to
prevent self-scoring).

## How to configure and deploy
1. Install Node.js (v22.2.0 or later).
2. Clone the project and run `npm install`.
3. Log in with `npx devvit login`.
4. Test locally with `npm run dev`, which installs the app on a test subreddit and
   opens a playtest URL.
5. Publish for review with `npx devvit publish`.
6. Once approved, install the app on a subreddit you moderate to create a game post.

## How to play (full feature set)
- **Start Investigation:** read the crime scenario, then study the five suspects and
  their statements during the examination timer (you can skip when ready).
- **Reveal clues:** clues appear one at a time. Fewer clues used = higher score.
- **Accuse:** pick the suspect you believe is guilty. The solution is revealed after,
  win or lose, so you can see the reasoning.
- **Leaderboard:** your total score ranks you against other players.
- **Create Your Own Mystery:** build a case from the suspect library and share it.
- **Play community cases:** solve mysteries created by other players.