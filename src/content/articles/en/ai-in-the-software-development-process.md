---
title: "AI in the software development process"
description: "\"Adopting AI\" doesn't describe a way of working. Four modes, from no AI to agent orchestration, and how to choose the right one for each activity."
pubDate: 2026-09-22
category: ai
lang: en
translationKey: ia-no-processo-de-desenvolvimento-de-software
originalUrl: https://www.linkedin.com/pulse/ia-processo-de-desenvolvimento-software-matheus-haddad-zkwxe/
draft: false
---

![Four illustrations side by side, one for each way of working: a developer alone among tangled wires, a developer with a robot assistant in the editor, two people defining specifications on a holographic screen, and a person supervising a factory of AI agents](../../../assets/articles/ia-no-processo-de-desenvolvimento-de-software/capa.jpg)

When electricity reached American factories at the end of the 19th century, industrialists made the most sensible move in the world: they replaced the steam engine with a large electric motor and kept everything else. The motor still turned the same central shaft that ran across the shop floor, which still moved the same belts hanging from the ceiling, which still drove the same machines arranged the same way, close to the shaft, because close to the shaft was where the power was.

The math worked on paper, and productivity didn't budge for decades. The gain only showed up when someone realized it was possible to put a small motor in each machine, and that this freed the factory floor from the shaft. Machines could be arranged in the order of the work, not in the order of power transmission. That's when productivity went up.

**I see a similar movement in the adoption of artificial intelligence in the software development process.**

Almost every company I know has already bought the "motor." Licenses for AI agents and models have been handed out, usage is high, developers like it and nobody wants to go back. But when someone asks what has changed in the project, the answer gets vague, and the conversation slides into numbers that measure activity: accepted suggestions, lines of code generated, pull requests opened, and so on.

Part of the discomfort comes from imprecise vocabulary. Saying that a team has adopted AI tells you as little as saying that a factory has adopted electricity. It might mean that people turned on an assistant in the editor and keep working as before. It might mean that the team started writing executable specifications and delegates the implementation. It might also mean that there is a set of agents operating inside a system of permissions, checks and review gates.

These are distinct ways of organizing work, each with its own costs, risks and prerequisites, and the decision that matters is rarely which one to adopt once and for everything. It is which one to use for each type of work.

In this article I present four possible ways of organizing work. I start with the process without AI, then move on to AI assistance in the editor, spec-driven development and agent orchestration.

## A teaching example

Consider an online electronics store that needs to let customers cancel an order from the app itself.

It sounds trivial, but it isn't. Canceling an order touches almost everything:

- up to what point cancellation is allowed, given that the order may already have been picked or be out for delivery;
- what happens when the payment has already gone through, with different rules for card, Pix and boleto;
- how the refund is recorded for financial reconciliation, including when there was a coupon or conditional free shipping;
- how stock is returned and what to do when the item has already been sold again;
- who can cancel on behalf of whom, among customer, customer service and administrator;
- what the customer sees in each state, with deadlines that depend on the payment method;
- what the fraud prevention system needs to record about repeated cancellations.

It is a medium-sized story, with business rules, money involved and legal consequences if it goes wrong. It is exactly the kind of work where productivity promises meet reality.

This same demand will go through all four ways of working, with the same four people on stage: the one who looks after the product, the one who designs the experience, the one who develops and the one who coordinates the project. What changes from one arrangement to the next is what each of them does and where human judgment needs to be.

## Mode 1: without AI, the "traditional" process

![Diagram of mode 1, without AI: across the six stages of work, people do everything and exercise judgment at every stage; the machine only runs tests, static analysis and deployment; work gets stuck on writing the code and reviewing it; context is almost entirely tacit.](../../../assets/articles/ia-no-processo-de-desenvolvimento-de-software/modo-1-sem-ia.png)

*All the judgment and almost all the knowledge sit with people, and the work gets stuck on writing the code and then being able to review it.*

Let's start with the established way of developing software, because that is where a good share of teams still operate most of the time.

The **product manager** gathers the rules by talking to customer service, finance and logistics, writes the story with acceptance criteria in running text and defends its priority.

The **designer** draws the flows, covers the "happy path," the deadline notices and the error states they can anticipate, and delivers the handoff with spacing and behavior annotated.

The **software developer** reads everything, studies the order service, discovers that there is already a partial refund routine written for another flow, writes the code and the tests and opens the pull request. Someone else reviews the entire diff.

The **project manager** coordinates dependencies, negotiates the window with the payments team and keeps the board up to date by asking people where they are.

Automation exists: automated tests, static analysis and deployment have been done by machines for a long time. The difference is that this automation is deterministic and runs after someone has decided everything.

Where the work gets stuck: in implementation and, right after that, in the capacity to review what was implemented. The scarce resource is skilled human execution.

From a business standpoint, this mode has a property that tends to be underestimated: capacity is linear and predictable. Doubling delivery requires doubling the team, with all the coordination cost that brings. On the other hand, knowledge remains almost entirely tacit, spread across conversations, team memory and sparse documentation. That is why the departure of two senior people changes the performance of an entire team.

## Mode 2: AI assistance in the editor

![Diagram of mode 2, assistance: people still exercise judgment at every stage; the machine suggests snippets, tests and explanations during implementation and runs the usual pipeline during verification; work gets stuck on reviewing everything that is now being produced; the only recorded context is what is open in the editor.](../../../assets/articles/ia-no-processo-de-desenvolvimento-de-software/modo-2-assistencia.png)

*AI speeds up implementation, but the process around it stays the same and the bottleneck shifts to review.*

This is the most widespread form of AI use in software development, the cheapest one to start with and the one that least disturbs how work is organized.

Technically, what happens is more interesting than the suggestion that shows up on screen. The extension installed in the environment assembles a context package with the open file, the cursor position, snippets from related files and, when they exist, the instructions the team has recorded in the repository in files like AGENTS.md or equivalent. This package goes to a service that decides which model handles the request, based on complexity, cost and acceptable latency, and the response comes back as suggested text. Whoever is writing decides whether it goes into the code.

In our example, the **software developer** opens the order service, starts writing the cancellation method and gets suggestions consistent with the project's style. They ask the assistant which test scenarios make sense and get a reasonable list, which includes the coupon case and forgets the case of the item that was already resold. They ask for an explanation of the legacy refund routine and save half an hour of reading.

The other roles change little. The **product manager** uses AI to summarize customer service tickets and draft the story. The **designer** generates layout variations and interface copy. The **project manager** keeps asking people where they are.

The evidence about the gain is more ambiguous than the marketing suggests. Assistance speeds up the production of new code in familiar territory quite a bit, and helps little when the work is understanding a mature system before touching it. Our order cancellation is the second case.

For whoever decides the budget, there are three consequences. The license is cheap and the return is real, but local. Speeding up implementation gets the work faster to the next bottleneck, which becomes review. And measuring adoption by accepted suggestions or generated lines measures activity, not results.

## Mode 3: spec-driven development

![Diagram of mode 3, the specification as a contract: people describe the intent, approve the specification, the plan and each increment, review by sampling and accept the delivery; the machine proposes the specification and plan, implements in small increments, runs tests and delivers with evidence; work gets stuck on describing well what needs to happen; recorded context includes intent, acceptance criteria, plan and decisions, all versioned.](../../../assets/articles/ia-no-processo-de-desenvolvimento-de-software/modo-3-especificacoes.png)

*The agent implements from the specification, and human judgment is concentrated at three gates: specification, plan and acceptance of the delivery.*

Here human effort moves away from writing code and toward writing intent. This is **spec-driven development**, in which a versioned document describes the expected behavior and serves as a contract for the agent that will implement it.

The cycle has three moments with human review between them. First the **specification**, in natural language, with acceptance criteria and explicit limits. Then the **technical plan**, which states which files will be touched, in what order, with what risks and alternatives. Only then the **implementation**, in small increments, verified at each step.

In our example, this means that the seven questions at the beginning of this text need to be answered before any code exists. It is a productive discomfort: the agent doesn't ask when it's in doubt, it fills the gap with the most likely guess. A specification that doesn't say what to do when the item has already been resold will produce an implementation that decides that on its own, with a rule that is plausible and wrong.

What each role does really changes in this mode.

The **product manager** stops writing stories and starts writing contracts. Acceptance criteria stop being a list of intentions and become verifiable conditions, in a format a test can check. The work of figuring out the rule with customer service and finance stays the same, and becomes more visible when it is incomplete.

The **designer** comes in before, not after. Empty states, loading, errors, content limits, focus order and contrast start being written as constraints alongside the business rules. In the cancellation, it is the designer who makes sure the specification says what the customer sees when the deadline has passed, when the refund takes five business days and when they don't have permission. That is exactly the material that tends to be missing when only the "happy path" exists.

The **software developer** reviews two new artifacts before looking at any diff, and gains a skill that used to be optional: describing behavior without ambiguity. They keep programming, and deliberately choose what to write by hand. The delicate part of the refund, which deals with money, will probably still be written by a person.

The **project manager** stops asking where things stand. The state becomes readable in the artifacts: the spec is approved, the plan is approved, three increments have passed verification. The job becomes keeping batches small and looking after the *gates*.

Two warnings. The first is historical: treating the specification as the source of truth is not a new idea. The CASE tools of the 90s and Model Driven Architecture in the 2000s tried something close and largely failed because keeping the high-level artifact in sync with the real system required a discipline that doesn't survive deadline pressure. What has changed is that the consumer of the specification is no longer a deterministic generator but a model capable of dealing with ambiguity and with existing code. That makes the problem more tractable, but doesn't eliminate it. An outdated specification feeding an agent produces errors that look like compliance.

The second is economic: specifying well takes time. For a two-line fix, writing the specification costs more than making the change. For our cancellation, it pays for itself before any agent comes on stage, because it forces the conversation the team had been putting off.

## Mode 4: agent orchestration (the AI software factory)

![Diagram of mode 4, agent orchestration: the machine works at all six stages, capturing signals, exploring alternatives, executing in isolated environments, verifying in layers, rolling out progressively and accumulating evidence; people define the signal, constraints and acceptable risk, choose the alternative and the level of autonomy, decide the exceptions and learn from the evidence; work gets stuck on verification capacity and available human attention; recorded context covers code, architecture, decisions, tickets, telemetry, design system and policies.](../../../assets/articles/ia-no-processo-de-desenvolvimento-de-software/modo-4-orquestracao.png)

*The system executes and verifies, people step in by exception, and delegating at this level requires that almost all the context be recorded outside the team's heads.*

The fourth mode is the most recent and the least established. Instead of one person talking to one agent, there is a set of agents carrying out tasks inside an architecture that decides what each one receives, what it can do and how the result is verified.

An **orchestrator** receives the demand, breaks it down and distributes it. Specialized **agents** carry out specific slices in isolated environments, with declared permissions, along the lines of "can run the test suite" and "cannot touch production infrastructure." A **governance** layer defines quality *gates*, audit trails and the points at which a person needs to approve. And there is a **context** layer, which brings together the repository, tickets, architecture decisions, build results and observability, usually combining a graph database for explicit relationships, linking commit, task, service and incident, and a vector database for search by similarity of meaning.

In our example, the "order cancellation" episode generates parallel runs: implementing the flow, a migration to record the cancellation reason, contract tests with the payment gateway, adjusting the screen and the message, a security review of the permission to cancel on someone else's behalf, updating the reconciliation documentation. Each run produces evidence. A person steps in where the risk justifies it, not at every stage.

The roles change once again.

The **product manager** starts working with intent and outcomes, and gains something that used to be expensive: exploring alternatives. Before committing to the implementation, they can ask for the minimal change, the complete architectural solution, a search for equivalent functionality that already exists and an estimate of operational impact, along with the option of not building it. The decision is still human, with more material on the table.

The **designer** goes through the biggest change. The design system stops being documentation and becomes executable context. With Figma's MCP server, for example, an agent reads real components, variables and tokens and generates an implementation that references the actual design system, instead of reproducing the look of a screenshot. Figma has also started allowing agents to write directly on the canvas. The practical consequence is that part of visual review becomes automated verification: token compliance, contrast, target size and focus order are properties that a sensor can check. The designer reviews by exception and spends the time left over on what the machine doesn't do, which is understanding the user and deciding whether the flow solves the problem.

The **software developer** runs several executions in parallel, defines what each agent may touch and reads evidence instead of reading the whole diff. When the agent makes a mistake, the question is no longer how to fix it, but which control is missing from the environment so that the mistake doesn't come back. The answer might be an example, a lint rule, a contract test, an architecture fitness function or a tighter permission. This work has a name in recent literature: *harness engineering*.

The **project manager** stops coordinating the allocation of people to tasks and starts managing three new things: the level of autonomy granted to each type of work, the queue of exceptions that need a human decision and the cost per development episode, which now includes tokens and execution infrastructure.

The strongest account of this mode comes from OpenAI, published in February 2026: a team that started with three engineers and grew to seven built a product with about a million lines and roughly 1,500 merged pull requests, without a single line written by hand, under the rule that humans steer and agents execute.

For decision makers, this mode has a characteristic that changes the budget conversation: cost stops being mostly a per-person license and gains a variable component per run. This brings software development closer to the unit-cost logic the business already knows from other areas, and requires measuring cost per delivered episode, not cost per person.

## Risk, verification and context

The four arrangements can coexist in the same project and even in the same delivery, and in all of them **AI amplifies the existing work system**. Teams that know why they are building something, record their decisions and have a reliable path to production get better in any mode, while teams that don't know why they are building will find out that AI speeds up the production of software nobody asked for. That is why the useful decision happens activity by activity, and three criteria help make it.

The first is the **risk of the action**, measured by impact, uncertainty and irreversibility. Changing a piece of interface copy and running a migration that touches refunds don't call for the same autonomy, and the higher the cost of undoing the mistake, the earlier human judgment needs to come in and the smaller the batch handed to the agent should be.

The second is the **verifiability of the result**, which answers whether there is a cheap and reliable way to know the work came out right without someone reading all of it. Where there are meaningful tests, interface contracts or behavior observable in production, you can delegate more. Where verification depends on someone experienced looking at the code, delegation only moves the effort somewhere else, and usually increases it.

The third is the **cost of describing the intent**. Work that is cheap to describe and expensive to execute favors specification, while work that is expensive to describe and cheap to execute favors assistance. In our cancellation example, the refund rule calls for specification, the screen copy adjustment calls for assistance and the documentation update can be fully delegated, all within the same delivery.

That cost depends on how much context has already left people's heads. The more autonomy you want to grant in an activity, the more knowledge needs to be recorded in a way that is readable by both people and machines, which stops being bureaucracy and becomes a prerequisite for safe delegation.

## Food for thought

1. In which of your team's activities does judgment need to happen before execution, and in which can it happen afterward?
2. How much of the context you use to make decisions is recorded somewhere that a newcomer, or an agent, could read?
3. And when someone says your team has adopted AI, can you say which mode is switched on in each activity, or only that the motor was replaced?
