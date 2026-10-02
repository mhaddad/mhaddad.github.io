---
title: "2020 vs. 2026: a day in the life of a software developer"
description: "The same developer on two Tuesdays, in 2020 and in 2026: what left his hands, what took its place and what AI did not replace."
pubDate: 2026-09-29
category: ai
lang: en
translationKey: 2020-x-2026-um-dia-na-vida-de-um-desenvolvedor-de-software
originalUrl: https://www.linkedin.com/pulse/2020-x-2026-um-dia-na-vida-de-desenvolvedor-software-matheus-haddad-dsbne/
draft: false
---

![On the left, a developer seen from behind at two monitors full of code, in an office where the team talks in front of a board of sticky notes; on the right, the same developer facing holographic panels with diagrams, charts and checklists, flanked by two small robots](../../../assets/articles/2020-x-2026-um-dia-na-vida-de-um-desenvolvedor-de-software/capa.png)

*2020 vs. 2026 - the nature of a software developer's work has changed (image created by ChatGPT)*

Almost every discussion about artificial intelligence in software development revolves around tools: which agent, which model, which harness, how many percentage points of gain... I prefer a different question, one that seems more revealing to me. What has changed in the workday of the people who build software?

This article tries to answer by recording two days in the life of the same developer, six years apart. In 2020, he spends almost the entire day typing in a code editor. In 2026, he types very little: he reads, decides, talks and waits for the results of processes that run without him. It is in the schedule of an ordinary day that you can see what left his hands, what took that space and what technology did not replace.

The character's name is Jeff. He is fictional, but none of the scenes were invented from scratch: they all come from situations I have observed in real projects at [Ateliê de Software](https://br.linkedin.com/company/atelie-de-software).

---

## Tuesday, September 29, 2020

Sixth day of a two-week sprint.

The team has 4 software developers, a designer, a person in the product leadership role (product owner) and a facilitator (scrum master) who splits attention with other teams.

09:05 - Daily meeting

Everyone gathers in front of a kanban board with the columns To Do, In Progress, Code Review, QA and Done. Each person shares what they did yesterday, what they will do today and any impediments. The burndown chart has been above the projected line since Friday. That's fifteen minutes dedicated to inspecting and adapting the work in progress.

09:25 - Jeff pulls the next story from the queue

"Export a period's orders to a spreadsheet," estimated at five points during a refinement session that took an hour and a half of the team's time the week before. He still has another story sitting in Code Review since yesterday, which in practice means two pieces of work open at the same time.

09:40 - First question, first wait

The acceptance criteria use the "given... when... then..." format. Jeff reads the text and spots the first question: should the export use the customer's time zone or the server's? He messages the Product Owner, who is in a meeting, and switches to another task while he waits. The answer arrives forty minutes later, interrupting a different line of thought.

10:30 - New branch created in the repository

Pairing with another developer, Jeff writes the first test, watches it fail, implements the solution and runs the suite of 1,400 tests. That takes twenty minutes of waiting. Then the continuous integration pipeline runs again for another twenty minutes. They use the time to grab a coffee in the company cafeteria.

12:10 - Merge conflict

Another developer changed the same orders module during the morning. Jeff spends half an hour resolving the conflict and, unsure about one of the decisions, calls his colleague over to check that nothing was undone.

14:00 - A gap in the prototype

Jeff notices that the prototype doesn't cover the scenario where there are no orders in the period. The designer is assigned to another discovery effort and only replies the next day. Jeff implements a temporary solution, adds a comment to the code and creates a technical task in the backlog, the kind that tends to grow old without ever getting priority.

15:00 - Pull request opened

Jeff opens a pull request and fills out the checklist the team requires: tests written, coverage maintained and documentation updated. The PR review only happens at the end of the afternoon, when a colleague finishes their own task. There are two architecture comments and four style comments. Manual validation happens the next day, in the staging environment, following a hand-written test script. The release is scheduled for Thursday, alongside nine other items.

18:00 - End of the day

Jeff wrote four hundred lines of code and solved a real problem, but spent much of his time waiting for answers from other people. By the time the feature reaches the user, nine days will have passed since development started, with about six hours of actual work on the problem.

The process worked exactly as it was designed to. Scrum, kanban and the agile practices around them were designed to coordinate scarce human specialists and reduce the risk of handing work off between them. The bottleneck was waiting time and the time people needed to execute, and almost everything in the process existed to deal with that.

---

## Tuesday, September 29, 2026

The team is now lean: Jeff and a designer. There are no sprints. Work flows continuously in episodes that start from a signal and end with evidence of results.

09:00 - Checking the AI agents' overnight run

There is no daily meeting.

Jeff looks at the project dashboard and checks what ran overnight. Seven development episodes were executed in isolated environments. Each agent session was logged with its context, the tools it used, its attempts and its costs.

Five episodes completed the automated verification chain: syntax and type checks, structural analysis, architecture validation, security checks, accessibility and project policies. Last came a review by another agent. These five items are already serving 10% of users behind a feature flag, with metrics being monitored.

Two episodes stopped the flow. The first failed an architecture test because of direct database access from the billing module. The second was held back by the privacy policy after it detected phone numbers in email attachments.

The human decision queue holds only three items, classified as high impact, high uncertainty or hard to reverse. Everything else moved forward automatically, with an audit trail.

09:20 - Deciding on the blocked episodes

Jeff and the designer review the issues and agree on a solution in ten minutes: they replace the attachment with an authenticated link inside the system. The decision is documented and becomes part of the agents' context, so the mistake isn't repeated.

09:40 - Reviewing the spec for a new feature

The need to let users create a new purchase order becomes a business priority, and the initial spec is versioned in the project repository. Jeff and the designer define the agent's execution contract together: screen states, accessibility rules, design system components, technical constraints and success criteria. A question about recurring orders gets settled right there, during the conversation.

10:30 - The execution plan comes back

The agent returns the plan with the affected files, migrations and required tests. Jeff spots that the order date would be stored in the server's time zone, which would distort every report by period, and fixes the parameter before any code is generated.

11:00 - Exploring alternatives

AI agents run four possible solutions in parallel for evaluation: a minimal change, a structural solution, a search for existing functionality and an operational impact analysis, each with a cost estimate. Cross-referencing the data turns up half of the needed functionality, written two years earlier in another module by someone who has since left the team.

11:40 - Conversation with the client

In fifteen minutes, half of the planned scope is dropped based on the morning's findings. In 2020, this discovery would have shown up in the third week, with the code already half written.

12:00 - Implementation of the development episode begins

With the scope reduced by the conversation with the client, the spec is approved and reviewed together. It stops being a document and becomes a development episode: the intent, the context, the constraints, the success criteria and the level of autonomy allowed for that piece of work. The episode enters the orchestrator's queue, which selects the agents, sets up the execution environment and distributes the implementation and testing steps. From then on, the work runs without Jeff, who takes the chance to go to lunch. He comes back to it when there is evidence of results or when something requires a human decision.

13:30 - Maintaining the AI agents' environment

Jeff spends part of the afternoon on the system that produces the software, not on the software itself. He turns the architecture rule that failed in the morning into a permanent structural test. He standardizes the migration template into a reusable skill for the agents. He creates a behavior test that fails any run that invents fields that don't exist in the report. And he adjusts the agents' permissions, restricting direct deployments to production and access to the payments module.

15:00 - Review by exception

Two pull requests made by agents are waiting. Jeff approves the first one based on the evidence from automated verification and reviews only the second one line by line, because it changes the boundary between two modules.

16:00 - A fix written by hand

Since last week, some customers have been receiving the weekly report twice. To handle the volume, the system runs on four servers that poll the same queue of scheduled sends. At eight o'clock on Monday morning, two of them poll the queue at the same instant, find the same pending send, and both send the email.

Jeff had delegated this fix to an agent on Friday. The code came back well written and passed every test, but the bug kept happening in production, because the project's tests run one server at a time and none of them reproduce the failure.

So he takes over. He starts with the missing test, which fires two simultaneous sends against the same schedule, and runs it until the failure shows up consistently. The fix comes in two parts: the first server to pick up a send marks it as "processing," and the others skip it; after it goes out, the send is recorded as completed for that week, so that a retry after a network failure doesn't turn into a second email.

That's forty lines and an hour and a half of work. Jeff writes it by hand because, for this kind of problem, the code is his reasoning. At the end, he turns the concurrent execution test into a project rule, so that any scheduled task written by an agent has to pass it.

17:40 - Progressive exposure

The previous day's delivery goes from 10% to 30% of users, with an alert set to roll back automatically if the error rate goes over the threshold. Releasing stopped being a Thursday event and became an observed flow.

18:00 - End of the day

There is no status meeting.

The state of the work is inferred from the evidence generated by people, agents and tools, and the client follows the same dashboard as the team. The kanban board still exists, because it's a good way for a person to see the flow, but it has become just a digital projection.

Jeff wrote about a hundred lines of code and made eleven decisions (all of them properly recorded).

---

## Changes in the nature of the work

Comparing the two Tuesdays reveals five shifts:

1. From production to formulation. In 2020, the core of the work was writing the solution. In 2026, it is defining the problem well, describing the intent without leaving room for guesswork and choosing between alternatives. Notice that the most valuable decision of the 2026 day happened at 11:40, when half the scope was dropped in a fifteen-minute conversation. No line of code would have produced that result.
2. From manual review to designing verification. Reading all the code line by line works as long as a person is writing that code. When seven episodes run overnight, reading everything becomes a bottleneck. The work becomes turning quality criteria into automated checks, as Jeff did when he turned an architecture rule into a structural test. Human review still exists, but now it is decided by risk.
3. From executing tasks to building the environment. A good part of the 2026 afternoon went into the system that produces the software, not the software itself. This work doesn't show up in story points or in any delivery metric, and it is precisely what determines how much the team can get done the following week.
4. From reported status to inferred state. In 2020, the team met at 9:05 to find out the state of each other's work. In 2026, that state is derived from the evidence that people, agents and tools already produce. This changes the meaning of the daily meeting, the board and the status report, which stop being the source of truth and become ways of visualizing it.
5. From distributed attention to concentrated attention. In 2020, Jeff gave the same care to everything that passed through his hands. In 2026, attention grows with impact, uncertainty and difficulty of reversal, and shrinks when there is reliable evidence. A small, reversible change goes through on its own. Critical or irreversible changes escalate to a person.

Even so, some things haven't changed: responsibility for the outcome, the conversation with the client and the judgment about what is worth building. AI doesn't take any of that away from the developer. What it does is make visible how much of the old work was execution, and how much of the process around it existed only to manage that execution.

---

## The Role of the Forward Deployed Engineer

The profile Jeff shows in 2026 comes close to the role known as [Forward Deployed Engineer (FDE)](https://en.wikipedia.org/wiki/Forward_deployed_engineer).

Popularized by companies that operate in highly complex scenarios with unstructured data, the role brings together activities that used to be isolated: investigation, architecture, development, testing and tracking impact in production.

Unlike the traditional flow, where the developer receives a closed item to code, the FDE works across the full cycle of the problem. The growing capacity to generate code increases the need for a systemic view and for integration with the client's context.

This profile combines three essential fronts:

- Understanding of the business and the client: the ability to navigate the problem domain and its real constraints.
- Product vision: a focus on user experience and on delivering value.
- Platform and agent engineering: command of the automation environment, context flows and control mechanisms.

The challenge for organizations lies in making sure that what is learned in each project is built into the system in the form of reusable patterns, checks and tools, avoiding dependence on individuals and duplicated effort.

---

## Food for thought

1. At what moments in your work week do you see processes closer to the 2020 model, and where do you see progress toward the 2026 model?
2. Which of your team's activities are clear enough to run with more automated autonomy today?
3. As operational execution stops being the main bottleneck, how does your organization intend to redirect the technical capacity it has?
