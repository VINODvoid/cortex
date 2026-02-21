# Agent Specializations

The CORTEX swarm is composed of ten specialized agents, each designed to monitor and optimize a specific aspect of the DeFi ecosystem. This document details the roles, objectives, and voting behaviors of each agent.

## 1. YieldNeuron
-   **Primary Objective**: Maximization of Annual Percentage Yield (APY).
-   **Focus Area**: Identifying the highest-earning opportunities across integrated lending protocols and liquidity pools.
-   **Voting Behavior**: Strongly favors proposals that increase returns, even if they involve slightly higher risk profiles.

## 2. RiskNeuron
-   **Primary Objective**: Capital preservation and risk mitigation.
-   **Focus Area**: Analyzing protocol security, smart contract audits, and market volatility. It monitors for "rug pulls" and excessive slippage.
-   **Voting Behavior**: Acts as a conservative check on the swarm, frequently voting against high-risk proposals.

## 3. AirdropNeuron
-   **Primary Objective**: Protocol participation for future rewards.
-   **Focus Area**: Identifying new and emerging protocols on Solana that are likely to distribute tokens to early users.
-   **Voting Behavior**: Favors providing liquidity or interacting with new protocols that have high "airdrop potential," even if the immediate yield is lower.

## 4. StrategistNeuron
-   **Primary Objective**: Meta-level coordination and portfolio balance.
-   **Focus Area**: Ensuring that the overall portfolio remains diversified and aligned with long-term strategic goals.
-   **Voting Behavior**: Evaluates proposals based on their impact on the total portfolio structure rather than isolated metrics.

## 5. LiquidityNeuron
-   **Primary Objective**: Execution stability and exit liquidity.
-   **Focus Area**: Monitoring Total Value Locked (TVL) and daily volume to ensure that the portfolio can enter or exit positions without significant price impact.
-   **Voting Behavior**: Rejects proposals involving illiquid pools or protocols with declining TVL.

## 6. TrendNeuron
-   **Primary Objective**: Market momentum analysis.
-   **Focus Area**: Analyzing technical indicators and price trends to determine if the market is in a bullish, bearish, or neutral state.
-   **Voting Behavior**: Supports aggressive strategies in bullish markets and defensive strategies during downtrends.

## 7. SentimentNeuron
-   **Primary Objective**: Social and community analysis.
-   **Focus Area**: Evaluating the reputation of protocols by analyzing social media sentiment and community activity.
-   **Voting Behavior**: Opposes protocols with declining community trust or negative social signals, regardless of technical metrics.

## 8. RebalancerNeuron
-   **Primary Objective**: Optimal asset allocation.
-   **Focus Area**: Ensuring that the portfolio maintains its target asset weights as market prices fluctuate.
-   **Voting Behavior**: Proposes and supports actions that bring the portfolio back into alignment with its intended distribution.

## 9. WhaleWatcher
-   **Primary Objective**: Large-scale movement tracking.
-   **Focus Area**: Monitoring the activity of high-net-worth wallets ("whales") to identify early signals of market shifts or protocol exits.
-   **Voting Behavior**: Adjusts its stance based on whether institutional or whale capital is entering or leaving a specific sector.

## 10. GasOptimizer
-   **Primary Objective**: Transaction cost efficiency.
-   **Focus Area**: Monitoring Solana network congestion and optimizing the timing and batching of transactions to minimize priority fees and gas costs.
-   **Voting Behavior**: Rejects or delays proposals that are economically inefficient due to high transaction costs relative to the expected gain.

---

Next document: [Consensus Mechanism](./consensus-mechanism.md)
