# Consensus Mechanism

The CORTEX platform employs a democratic consensus model to ensure that all actions taken by the autonomous swarm are the result of collective deliberation. This mechanism prevents any single agent from making unilateral decisions that could jeopardize the portfolio.

## Voting Fundamentals

Every agent in the 10-member swarm participates in every voting cycle. The process is governed by three primary vote types:

1.  **YES (Affirmative)**: The agent supports the proposal as it aligns with its strategic objectives.
2.  **NO (Negative)**: The agent opposes the proposal because it conflicts with its goals or introduces unacceptable risk.
3.  **ABSTAIN**: The agent is neutral or the proposal does not fall within its primary domain of expertise.

## The Consensus Algorithm

For a proposal to be approved for on-chain execution, it must meet the following criteria:

-   **Simple Majority**: The number of "YES" votes must be strictly greater than the number of "NO" votes.
-   **Quorum**: While all agents are asked to vote, the system is designed to handle "ABSTAIN" votes gracefully. Abstentions do not count toward the majority but reduce the total pool of active voters for that specific proposal.
-   **Tie-Breaking**: In the event of a tie (e.g., 5 YES, 5 NO), the proposal is automatically **REJECTED**. The system defaults to a conservative "Hold" state to protect user capital.

## Coalition Dynamics

The interaction between specialized agents often leads to the formation of informal coalitions based on shared interests:

### The Growth Coalition
Typically includes **YieldNeuron**, **AirdropNeuron**, and **TrendNeuron**. These agents generally favor action and expansion into high-opportunity sectors.

### The Safety Coalition
Typically includes **RiskNeuron**, **LiquidityNeuron**, and **GasOptimizer**. These agents prioritize stability, low fees, and security, acting as a check on the Growth Coalition.

### The Swing Voters
Agents like **StrategistNeuron**, **SentimentNeuron**, **WhaleWatcher**, and **RebalancerNeuron** often serve as the deciding factor, casting their votes based on broader market context and portfolio health.

## Example Voting Scenario

**Proposal**: Move 50 SOL from a 5% APY Marinade pool to a 12% APY Orca liquidity pool.

-   **YieldNeuron**: YES (Significant increase in APY)
-   **AirdropNeuron**: YES (Orca interaction increases future rewards)
-   **RiskNeuron**: NO (Orca LP involves impermanent loss risk)
-   **LiquidityNeuron**: YES (Orca SOL/USDC pool has high TVL)
-   **TrendNeuron**: YES (Market is bullish on SOL ecosystem)
-   **GasOptimizer**: YES (Current transaction fees are low)
-   **StrategistNeuron**: YES (Portfolio is currently underweight in LP positions)
-   **SentimentNeuron**: YES (Orca has high community trust)
-   **RebalancerNeuron**: ABSTAIN (Does not significantly impact overall asset weights)
-   **WhaleWatcher**: YES (Large wallets are moving toward Orca)

**Result**: 8 YES, 1 NO, 1 ABSTAIN.
**Action**: **PASSED**. The Orchestrator initiates the transaction.

---

Next document: [Technical Implementation](./technical-implementation.md)
