# Schema Design Document: Solana Trading Bot  

## Overview  
This document outlines the database schema design for the Solana Trading Bot. The schema is optimized for storing and retrieving trading data, configuration settings, and performance metrics. It supports key features such as token tracking, trade logs, user configurations, and notifications.

---

## Database Technology  
- **Relational Database**: PostgreSQL (recommended for structured and relational data).
- **NoSQL Alternative**: MongoDB (optional for flexible and hierarchical data).

---

## Entities and Relationships  

### Core Entities  
1. **Tokens**  
   - Represents the tokens being tracked and traded.  
2. **Trades**  
   - Logs all executed buy/sell trades.  
3. **User Settings**  
   - Stores user-configurable trading preferences.  
4. **Notifications**  
   - Tracks and queues user notifications.  
5. **Performance Metrics**  
   - Monitors bot performance and trading efficiency.

---

## Schema Details  

### 1. **Tokens Table**  
**Purpose**: Store information about tokens being monitored and traded.  

| Column Name         | Data Type   | Constraints              | Description                                  |  
|---------------------|-------------|--------------------------|----------------------------------------------|  
| `token_id`          | UUID        | Primary Key              | Unique identifier for each token.           |  
| `symbol`            | VARCHAR(10) | Not Null, Unique         | Token symbol (e.g., SOL, RAY).              |  
| `name`              | VARCHAR(50) |                          | Full name of the token.                     |  
| `pool_address`      | TEXT        | Not Null                 | Solana pool address for liquidity.          |  
| `current_price`     | DECIMAL(18,8)|                          | Latest fetched price of the token.          |  
| `price_updated_at`  | TIMESTAMP   |                          | Timestamp of the last price update.         |  
| `created_at`        | TIMESTAMP   | Default: CURRENT_TIMESTAMP | Record creation time.                       |  

---

### 2. **Trades Table**  
**Purpose**: Log details of executed trades for tracking and analytics.  

| Column Name         | Data Type   | Constraints              | Description                                  |  
|---------------------|-------------|--------------------------|----------------------------------------------|  
| `trade_id`          | UUID        | Primary Key              | Unique identifier for each trade.           |  
| `token_id`          | UUID        | Foreign Key (Tokens.token_id) | Token associated with the trade.            |  
| `trade_type`        | ENUM        | Not Null                 | Type of trade: 'BUY' or 'SELL'.             |  
| `quantity`          | DECIMAL(18,8)| Not Null                 | Quantity of tokens traded.                  |  
| `price`             | DECIMAL(18,8)| Not Null                 | Price at which the trade was executed.      |  
| `profit_loss`       | DECIMAL(18,8)|                          | Calculated profit or loss for the trade.    |  
| `executed_at`       | TIMESTAMP   | Default: CURRENT_TIMESTAMP | Time of trade execution.                    |  

---

### 3. **User Settings Table**  
**Purpose**: Store user-specific configuration for the bot.  

| Column Name         | Data Type   | Constraints              | Description                                  |  
|---------------------|-------------|--------------------------|----------------------------------------------|  
| `user_id`           | UUID        | Primary Key              | Unique identifier for the user.             |  
| `profit_threshold`  | DECIMAL(5,2)| Default: 10.00           | Percentage profit to trigger sell action.   |  
| `loss_threshold`    | DECIMAL(5,2)| Default: 5.00            | Percentage loss to trigger stop-loss action.|  
| `holding_timer`     | INTERVAL    | Default: '1 HOUR'        | Time to hold tokens before evaluating sale. |  
| `slippage_tolerance`| DECIMAL(5,2)| Default: 1.00            | Maximum allowed slippage for transactions.  |  

---

### 4. **Notifications Table**  
**Purpose**: Track and manage notifications sent to users.  

| Column Name         | Data Type   | Constraints              | Description                                  |  
|---------------------|-------------|--------------------------|----------------------------------------------|  
| `notification_id`   | UUID        | Primary Key              | Unique identifier for the notification.     |  
| `user_id`           | UUID        | Foreign Key (User Settings.user_id) | User associated with the notification.       |  
| `message`           | TEXT        | Not Null                 | Notification message content.               |  
| `status`            | ENUM        | Default: 'PENDING'       | Notification status: 'PENDING', 'SENT', 'FAILED'. |  
| `created_at`        | TIMESTAMP   | Default: CURRENT_TIMESTAMP | Time of notification creation.              |  

---

### 5. **Performance Metrics Table**  
**Purpose**: Monitor and analyze bot performance over time.  

| Column Name         | Data Type   | Constraints              | Description                                  |  
|---------------------|-------------|--------------------------|----------------------------------------------|  
| `metric_id`         | UUID        | Primary Key              | Unique identifier for the metric record.    |  
| `user_id`           | UUID        | Foreign Key (User Settings.user_id) | User associated with the metric.           |  
| `total_trades`      | INTEGER     | Default: 0               | Total number of trades executed.            |  
| `successful_trades` | INTEGER     | Default: 0               | Count of profitable trades.                 |  
| `failed_trades`     | INTEGER     | Default: 0               | Count of failed trades.                     |  
| `profit_loss_ratio` | DECIMAL(10,4)|                          | Ratio of total profit to total loss.        |  
| `updated_at`        | TIMESTAMP   | Default: CURRENT_TIMESTAMP | Time of last update to metrics.             |  

---

## Relationships  

1. **Tokens ↔ Trades**  
   - One token can be associated with multiple trades.  
2. **User Settings ↔ Trades**  
   - A user’s settings influence the trades executed by the bot.  
3. **User Settings ↔ Notifications**  
   - Notifications are sent based on user preferences and trade actions.  
4. **User Settings ↔ Performance Metrics**  
   - Performance metrics are tracked per user.  

---

## Indexing  

### Primary Indexes  
- `token_id` on **Tokens**.  
- `trade_id` on **Trades**.  
- `user_id` on **User Settings** and related tables.  

### Secondary Indexes  
- `symbol` on **Tokens** for fast lookup.  
- `executed_at` on **Trades** for querying recent trades.  
- `status` on **Notifications** for managing pending messages.  

---

## Normalization  

The schema is normalized to 3NF to:  
1. Eliminate redundant data.  
2. Ensure efficient data retrieval.  
3. Maintain data integrity across relationships.  

---