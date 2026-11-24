import { RoleConfig } from '../types';

export const PRESET_ROLES: RoleConfig[] = [
  {
    id: 'swe-intern',
    title: 'Software Engineer Intern',
    subtitle: 'Debugging, system fundamentals, collaboration, and code quality',
    rubric: [
      {
        key: 'Relevance',
        label: 'Relevance',
        summary: 'Directly answers the engineering prompt without drifting off-topic.',
        level1: 'Talks generally about coding classes or unrelated tools instead of the question asked.',
        level3: 'Addresses the core prompt, though part of the response drifts into background setup.',
        level5: 'Stays tightly focused on the exact scenario, technical constraint, or behavioral prompt.',
      },
      {
        key: 'Clarity & Structure',
        label: 'Clarity & Structure',
        summary: 'Organizes technical or STAR steps logically so listeners can follow easily.',
        level1: 'Jumps between symptoms, files, and teammates without clear sequence or takeaway.',
        level3: 'Follows a recognizable sequence (e.g., setup, action, result) with minor pacing gaps.',
        level5: 'Crisp progression from context and root cause through implementation and verified outcome.',
      },
      {
        key: 'Reasoning',
        label: 'Reasoning',
        summary: 'Explains why choices or trade-offs were made, not just what happened.',
        level1: 'Lists actions taken ("I restarted it" or "I used React") with no technical rationale.',
        level3: 'Mentions a reason for one decision but skips alternatives, edge cases, or complexity.',
        level5: 'Compares alternatives clearly, explains trade-offs, and justifies root-cause thinking.',
      },
      {
        key: 'Use of Specific Examples',
        label: 'Use of Specific Examples',
        summary: 'Grounds claims in concrete code, bugs, metrics, and personal ownership.',
        level1: 'Relies on vague "we worked on a project" statements with no concrete artifacts.',
        level3: 'Includes a real project or bug, but omits measurable impact or exact individual contribution.',
        level5: 'Names exact components, debugging steps, personal actions, and measurable results.',
      },
    ],
    questions: [
      {
        id: 'swe-1',
        category: 'Behavioral',
        prompt: 'Tell me about a challenging bug you tracked down in a project. How did you isolate the root cause and verify your fix?',
        focusHint: 'Interviewers look for systematic hypothesis testing, personal ownership, and verification.',
        demoWeakAnswer:
          'Last semester we had a really annoying bug in our web app where the page kept crashing when users clicked save. Everyone on my team was confused and we spent a long time trying different things in the code. I looked at Stack Overflow and changed a few lines in the backend and cleared the cache, and eventually it started working again. It taught me that debugging takes patience and teamwork.',
        demoStrongAnswer:
          'In a 4-person React and Express course project, our task-submission endpoint began returning intermittent 500 errors whenever users submitted forms with empty optional fields. I reproduced the failure locally using curl and server logs, then traced the crash to an unguarded `.trim()` call inside our validation middleware that assumed every field was a string. Rather than wrapping the route in a broad try/catch, I added a strict schema check with explicit default empty strings so malformed payloads returned a 400 with field-level errors instead of crashing. To verify the fix, I wrote three Jest integration tests covering missing, null, and valid payloads and confirmed zero 500 errors across our staging test run.',
      },
      {
        id: 'swe-2',
        category: 'Technical',
        prompt: 'How would you choose between a hash map and a balanced binary search tree for storing and querying in-memory records? Walk through the trade-offs.',
        focusHint: 'Focus on time complexity, ordering guarantees, memory overhead, and real workload patterns.',
        demoWeakAnswer:
          'I would usually just use a hash map because it is faster and easier to write in Python or JavaScript. Hash maps are O(1) so they are always better for looking things up quickly. Binary search trees are mostly for algorithm interviews and take more code to set up.',
        demoStrongAnswer:
          'I choose based on whether the workload needs ordering or strictly point lookups. A hash map gives average O(1) inserts and lookups, which makes it ideal for session caches or deduplication where keys are unordered, though worst-case hash collisions and resizing spikes can affect tail latency. A balanced BST such as a red-black tree trades O(log n) lookup time for sorted iteration, predecessor/successor queries, and efficient range scans like finding all timestamps between T1 and T2. In practice, if I only check exact membership I pick a hash map; if I need sorted output or range queries without re-sorting on every read, I pick a balanced BST.',
      },
      {
        id: 'swe-3',
        category: 'Behavioral',
        prompt: 'Describe a time you received critical feedback on your code or design. How did you respond and what changed afterward?',
        focusHint: 'Show openness to review, objective evaluation of the critique, and concrete follow-through.',
        demoWeakAnswer:
          'During a group project my teammate said my pull request was messy and hard to read. At first I felt bad because I worked hard on it over the weekend and it worked fine. After talking about it I agreed to clean up some variable names and add a few comments so we could merge it before the deadline.',
        demoStrongAnswer:
          'In my first PR for an open-source CLI tool, a maintainer flagged that my 180-line parser function mixed file I/O with business validation, making unit testing impossible without touching disk. Instead of defending it because the output worked, I asked for an example of their preferred module boundary and refactored the parser into a pure function taking string input plus a thin file-reader wrapper. That cut the test setup from temporary fixtures to direct string assertions and raised branch coverage on that module from 42% to 94%. Since then, I separate I/O boundaries from core logic before opening PRs.',
      },
      {
        id: 'swe-4',
        category: 'Technical',
        prompt: 'A web API endpoint your team owns suddenly becomes 5x slower in production. Walk through how you would investigate and narrow down the bottleneck.',
        focusHint: 'Structure your triage across telemetry, database/network, application code, and mitigation.',
        demoWeakAnswer:
          'First I would restart the server to see if it fixes the slowdown. If it is still slow I would check the code I recently pushed and look at the database to see if something is stuck. Maybe we need to upgrade the server CPU or add caching so it runs faster.',
        demoStrongAnswer:
          'I would start by checking metrics to isolate whether latency spiked across all endpoints or only this route, and whether it correlates with a recent deploy or traffic surge. Next, I would inspect distributed traces or timing logs to split total latency across network, application compute, and downstream database or third-party calls. If database time dominates, I would examine slow query logs and run EXPLAIN ANALYZE to check for missing indexes, lock contention, or N+1 query loops introduced by recent ORM changes. Before tuning hardware, I would verify whether a bad deploy can be rolled back immediately to restore SLA while fixing the root cause.',
      },
      {
        id: 'swe-5',
        category: 'Behavioral',
        prompt: 'Tell me about a time you had to learn an unfamiliar technology quickly to deliver a feature or fix.',
        focusHint: 'Highlight how you scoped what to learn, avoided rabbit holes, and delivered safely.',
        demoWeakAnswer:
          'I had to learn Docker for a hackathon because nobody else knew it. I watched a couple of YouTube tutorials and copied a Dockerfile from GitHub until the app ran on my laptop. It was stressful with the time limit, but we got it running in time for the demo.',
        demoStrongAnswer:
          'Two weeks before a student research showcase, our team needed automated deployment because manual environment setup was breaking teammate demos, and none of us had used Docker Compose. I spent the first two hours reading the official multi-stage build docs to learn only what we needed: pinning Python dependencies, passing env vars safely, and networking the API container to Postgres. I built a minimal compose file with healthchecks, tested a clean build on a teammate’s Windows machine to catch line-ending issues, and documented three setup commands in our README. Onboarding time for new contributors dropped from roughly 45 minutes to under 3 minutes.',
      },
    ],
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    subtitle: 'Metric rigor, SQL reasoning, data hygiene, and stakeholder storytelling',
    rubric: [
      {
        key: 'Relevance',
        label: 'Relevance',
        summary: 'Targets the specific business question, metric anomaly, or analytical prompt.',
        level1: 'Describes general dashboards or tools used without answering the analytical question.',
        level3: 'Addresses the main question but includes tangential tool background or extra metrics.',
        level5: 'Stays laser-focused on the business decision, data issue, or analytical scenario asked.',
      },
      {
        key: 'Clarity & Structure',
        label: 'Clarity & Structure',
        summary: 'Presents hypotheses, methodology, and findings in an executive-ready sequence.',
        level1: 'Rambles through datasets and charts without stating the hypothesis or conclusion clearly.',
        level3: 'Clear enough to follow, though the conclusion is buried after technical details.',
        level5: 'Leads with the core insight or framework, then walks cleanly through checks and action.',
      },
      {
        key: 'Reasoning',
        label: 'Reasoning',
        summary: 'Demonstrates statistical thinking, confounding checks, and causal caution.',
        level1: 'Jumps straight from a correlation or chart dip to an unproven cause.',
        level3: 'Identifies a plausible cause and one check, but misses segmentation or data integrity.',
        level5: 'Separates tracking bugs, seasonality, mix shift, and true behavioral change systematically.',
      },
      {
        key: 'Use of Specific Examples',
        label: 'Use of Specific Examples',
        summary: 'Cites real tables, metrics, sample sizes, SQL logic, or business outcomes.',
        level1: 'Uses generic phrases like "I analyzed the data in Excel and made insights."',
        level3: 'Names a dataset or project and action taken, but omits numbers or decision impact.',
        level5: 'Quantifies baselines, deltas, SQL/analysis steps, and concrete stakeholder decisions driven.',
      },
    ],
    questions: [
      {
        id: 'da-1',
        category: 'Technical',
        prompt: 'Weekly active users on a product stayed flat, but average session duration dropped by 22% this week. How would you diagnose what happened?',
        focusHint: 'Check tracking/instrumentation first, then segment by platform, cohort, and feature mix.',
        demoWeakAnswer:
          'If session duration dropped by 22% that probably means users do not like the new update and are leaving the app faster. I would make a dashboard showing session duration over time and tell the product team to improve engagement or add better onboarding so people stay longer.',
        demoStrongAnswer:
          'Before assuming user dissatisfaction, I would verify instrumentation by checking whether a recent app release changed session-timeout rules or heartbeat events. Next, I would segment the 22% drop across iOS, Android, and web, as well as new versus returning cohorts, to see if one segment drove the average down—for example, a spike in fast mobile notifications could lower mean duration even while core desktop engagement rises. I would also inspect median session duration alongside the 90th percentile to rule out outlier power users dropping off, then cross-reference task completion rates to check whether shorter sessions actually reflect faster workflows rather than churn.',
      },
      {
        id: 'da-2',
        category: 'Behavioral',
        prompt: 'Tell me about a time your analysis uncovered a surprising or unpopular finding. How did you communicate it to stakeholders?',
        focusHint: 'Show how you validated your numbers, framed the trade-off neutrally, and drove action.',
        demoWeakAnswer:
          'At my internship the marketing team thought their email campaign was doing great, but when I looked at the spreadsheet the numbers were actually pretty bad. I showed them a bar chart in our weekly meeting and told them we should stop sending those emails because people were not clicking.',
        demoStrongAnswer:
          'During a retail analytics project, the marketing team believed a 15% discount email drove strong revenue because attributed sales rose 18% week-over-week. When I joined order logs with historical purchase cohorts in SQL, I found 74% of discount redemptions came from repeat buyers who had purchased full-price within the prior 30 days, eroding net margin by 6%. Knowing this challenged their flagship campaign, I walked the marketing lead through the cohort query ahead of the group review and paired the finding with an alternative: restricting promo codes to lapsed 90-day accounts. We ran a 2-week holdout test that preserved 91% of incremental orders while recovering 4.2 points of margin.',
      },
      {
        id: 'da-3',
        category: 'Technical',
        prompt: 'You are asked to measure the success of a new search autocomplete feature. Which primary metric and guardrail metrics would you choose, and why?',
        focusHint: 'Balance conversion/efficiency gains against latency, error rates, and false clicks.',
        demoWeakAnswer:
          'I would track how many people click on the autocomplete suggestions and total searches per day. If more people click autocomplete, that means the feature is successful and helping users find things.',
        demoStrongAnswer:
          'Clicking an autocomplete suggestion alone can be misleading if users click wrong suggestions and immediately re-search. I would choose Search-to-Conversion Rate (or Successful Result Click within 60 seconds with no immediate reformulation) as the primary metric because it measures whether users actually find what they need faster. For guardrails, I would track p95 autocomplete API latency so typing stays responsive, Zero-Result Search Rate to catch overly aggressive suggestion matching, and Search Reformulation Rate within 30 seconds to detect misleading suggestions.',
      },
      {
        id: 'da-4',
        category: 'Behavioral',
        prompt: 'Describe a messy dataset you had to clean before analysis. What quality issues did you find and how did you prevent silent errors?',
        focusHint: 'Detail concrete anomalies (duplicates, nulls, timezone drift) and reproducible validation checks.',
        demoWeakAnswer:
          'I worked with a customer CSV that had lots of missing values and weird dates. I opened it in Python and dropped all the rows with NaNs and formatted the dates so my charts would run without throwing errors.',
        demoStrongAnswer:
          'While analyzing 420,000 support tickets exported from two regional CRM tools, I found three silent issues: duplicate ticket IDs across timezone boundaries, blank resolution timestamps for auto-closed chats, and inconsistent status labels ("Closed" vs "closed_auto"). Dropping null rows would have removed 19% of valid chat volume and skewed resolution times downward. Instead, I standardized timestamps to UTC, deduplicated by keeping the latest status-change event via a SQL `ROW_NUMBER()` window function, and flagged auto-closed tickets as a separate category rather than imputing zero duration. I also added an automated row-count and null-rate assertion script so weekly refreshes fail loudly if null rates exceed 2%.',
      },
      {
        id: 'da-5',
        category: 'Technical',
        prompt: 'Explain the difference between a `LEFT JOIN` filter in the `ON` clause versus the `WHERE` clause in SQL, and give an example where mixing them breaks an analysis.',
        focusHint: 'Explain how `WHERE` filters turn a `LEFT JOIN` into an implicit `INNER JOIN`.',
        demoWeakAnswer:
          'A LEFT JOIN keeps everything from the left table and matching rows from the right table. Using ON or WHERE basically filters the rows you want, though usually people put conditions in WHERE because it is cleaner to read.',
        demoStrongAnswer:
          'In a `LEFT JOIN`, conditions inside the `ON` clause filter the right table before rows are matched, preserving every row from the left table with `NULL`s when no match exists. Moving a right-table filter into the `WHERE` clause evaluates after the join, discarding all rows where the right table columns are `NULL` and silently converting the `LEFT JOIN` into an `INNER JOIN`. For example, if you want all signed-up users and their count of completed orders in January, placing `orders.status = \'completed\'` in `WHERE` drops every user with zero orders, artificially inflating average orders per user. Keeping `orders.status = \'completed\'` inside `ON` preserves zero-order users for an accurate conversion denominator.',
      },
    ],
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    subtitle: 'User problem framing, prioritization trade-offs, metrics, and execution alignment',
    rubric: [
      {
        key: 'Relevance',
        label: 'Relevance',
        summary: 'Centers on the exact user problem, strategic trade-off, or stakeholder conflict asked.',
        level1: 'Gives generic PM buzzwords ("delight users", "synergy") disconnected from the prompt.',
        level3: 'Answers the prompt sensibly, though skips user segment nuance or constraints.',
        level5: 'Directly addresses the target user, business constraint, and core tension in the question.',
      },
      {
        key: 'Clarity & Structure',
        label: 'Clarity & Structure',
        summary: 'Frames user, goal, options, trade-offs, and decision cleanly for cross-functional teams.',
        level1: 'Lists scattered feature ideas without anchoring to a user problem or priority order.',
        level3: 'Organized around goals and solutions, though prioritization criteria feel implicit.',
        level5: 'Crisply structured from problem and hypothesis through trade-offs, success metrics, and rollout.',
      },
      {
        key: 'Reasoning',
        label: 'Reasoning',
        summary: 'Evaluates opportunity cost, risks, edge cases, and second-order effects.',
        level1: 'Picks a feature or decision purely on intuition without weighing costs or alternatives.',
        level3: 'Considers effort vs. impact broadly, but misses downstream risks or counter-metrics.',
        level5: 'Articulates explicit trade-offs, falsifiable assumptions, risks, and why alternatives were cut.',
      },
      {
        key: 'Use of Specific Examples',
        label: 'Use of Specific Examples',
        summary: 'Supports points with real user research, launch metrics, experiments, or team decisions.',
        level1: 'Speaks entirely in hypotheticals or vague "we launched a feature and users liked it."',
        level3: 'Describes a real initiative and role, with partial qualitative or quantitative evidence.',
        level5: 'Cites specific user friction, exact metrics moved, scope cuts made, and post-launch learnings.',
      },
    ],
    questions: [
      {
        id: 'pm-1',
        category: 'Behavioral',
        prompt: 'Tell me about a time you had to say no to a feature request from an important stakeholder or customer. How did you handle it?',
        focusHint: 'Show empathy for the underlying need, objective criteria, and alignment without burning trust.',
        demoWeakAnswer:
          'Last year a sales manager really wanted us to build a custom export button for one big client right before launch. We did not have time because engineering was busy with other things, so I told them we could not do it right now and put it in the backlog for next quarter. They were disappointed at first, but they understood.',
        demoStrongAnswer:
          'Two weeks before a B2B workflow launch, our enterprise sales lead requested a custom PDF report builder for a prospective $40k deal. Instead of rejecting it flatly on capacity, I joined a 20-minute discovery call with the prospect and learned they only needed three monthly compliance totals for an audit, not an open-ended report builder. Building the custom builder would have delayed core permissions work by three weeks for 120 existing accounts. I shared the engineering opportunity cost transparently with sales and proposed a two-hour CSV export endpoint covering those exact fields as an interim bridge. Sales closed the deal, our core launch shipped on schedule, and we later validated that only 4% of accounts wanted custom PDF layouts.',
      },
      {
        id: 'pm-2',
        category: 'Technical',
        prompt: 'How would you prioritize fixing technical debt versus shipping a user-facing growth feature ahead of a quarterly target?',
        focusHint: 'Connect tech debt to user/velocity risk quantitatively rather than treating it as binary.',
        demoWeakAnswer:
          'I always try to balance both because tech debt slows engineers down, even though stakeholders want new features. Usually I let engineers spend maybe 20% of the sprint on tech debt while we build the growth feature so everyone stays happy.',
        demoStrongAnswer:
          'I avoid an arbitrary percentage split and instead translate technical debt into measurable user or delivery risk so both items sit on the same decision rubric. For example, if a legacy checkout service is causing a 2.5% payment timeout rate or adding four days of QA regression per release, fixing it directly unlocks growth conversion and feature velocity. I would evaluate the growth feature’s expected lift against the cost of shipping onto fragile infrastructure: if the new feature touches that brittle path, I sequence a targeted refactor of the critical boundary first and cut non-blocking polish from the growth scope. If the debt sits in an isolated low-traffic module, I schedule the growth experiment first with clear error-budget thresholds that trigger immediate remediation if exceeded.',
      },
      {
        id: 'pm-3',
        category: 'Behavioral',
        prompt: 'Describe a product launch or experiment that did not perform as expected. What did you learn and what did you change next?',
        focusHint: 'Own the hypothesis flaw objectively and explain the follow-up decision.',
        demoWeakAnswer:
          'We added an onboarding checklist because we thought new users did not understand the product. After we launched it, retention did not really go up like we expected. We realized users probably just wanted a faster product, so we moved on to other improvements.',
        demoStrongAnswer:
          'I led an experiment adding an interactive 5-step onboarding checklist to raise Day-7 activation from 28% to 35%. After two weeks across 8,000 new signups, checklist completion hit 41%, yet Day-7 retention stayed flat at 27.6%. Watching 15 session replays revealed users were clicking through dummy template tasks just to clear the progress bar without importing their own data. Our hypothesis mistook UI completion for real value discovery. I deprecated the checklist, replaced it with a single pre-populated sample workspace plus a one-click CSV importer, and Day-7 activation rose to 33.4% in the follow-up test.',
      },
      {
        id: 'pm-4',
        category: 'Technical',
        prompt: 'A food-delivery app sees order cancellation rates spike in one city during Friday evenings. How would you investigate and design an intervention?',
        focusHint: 'Separate supply, demand, ETA accuracy, and pricing friction before jumping to UI fixes.',
        demoWeakAnswer:
          'If people are cancelling orders on Friday night, they are probably waiting too long or changing their minds. I would add a popup offering a $5 coupon when someone clicks cancel, and tell operations to hire more drivers.',
        demoStrongAnswer:
          'First, I would segment Friday evening cancellations by stage—pre-restaurant acceptance, post-acceptance pre-pickup, and post-pickup—plus cancellation reason codes to pinpoint where the funnel breaks. If cancellations spike before pickup alongside rising courier-assignment times, the root cause is courier supply shortage or underestimated prep-time predictions rather than buyer remorse. Throwing a blanket cancel-flow coupon would burn margin without creating driver capacity. Instead, I would tighten ETA padding during peak windows so expectations match reality, surface "fastest nearby" restaurants first, and trigger targeted peak-zone courier incentives 45 minutes before the surge, measuring net completed orders and support contact rate as guardrails.',
      },
      {
        id: 'pm-5',
        category: 'Behavioral',
        prompt: 'Walk me through how you aligned engineering, design, and analytics around an ambiguous product goal.',
        focusHint: 'Focus on how you turned vague direction into shared success metrics and clear trade-offs.',
        demoWeakAnswer:
          'Leadership told us to improve user engagement in Q3, which was pretty broad. I set up a kickoff meeting with engineering, design, and data so we could brainstorm ideas together. We picked the best ideas on a whiteboard and broke them into Jira tickets so everyone knew what to build.',
        demoStrongAnswer:
          'When asked to "improve collaboration" for a team notes app with no fixed scope, design pushed for real-time cursor presence while engineering flagged websocket scaling costs. Before picking solutions, I partnered with analytics to audit existing sharing funnels and found 62% of shared links were never opened twice because permissions defaulted to view-only and comments were hidden behind a menu. I anchored the kickoff around a single measurable goal: doubling weekly active multi-user documents within 6 weeks. Seeing the funnel data convinced design and engineering to defer costly live cursors and instead ship frictionless comment notifications plus one-click editor invites in three weeks, lifting multi-user weekly documents by 1.8x.',
      },
    ],
  },
];
