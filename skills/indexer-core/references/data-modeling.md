# Data Modeling: Monetary and Large-Number Fields

## BigDecimal with DECIMAL128

When indexing fields that represent token amounts, stakes, balances, or any large integer values from smart contract events, use `BigDecimal` with MongoDB's native `DECIMAL128` field type — never `String`.

### Model pattern

```kotlin
import java.math.BigDecimal
import org.springframework.data.mongodb.core.mapping.Field
import org.springframework.data.mongodb.core.mapping.FieldType

@Document(collection = "my_collection")
data class MyEntity(
    @Field(targetType = FieldType.DECIMAL128) val amount: BigDecimal,
    @Field(targetType = FieldType.DECIMAL128) val totalStaked: BigDecimal,
)
```

### Why DECIMAL128 over String

- MongoDB stores the value as a native numeric type, enabling aggregation queries (`$sum`, `$avg`, comparison operators)
- No precision loss for values up to 34 significant digits (covers all uint256 values in practice)
- Jackson serializes BigDecimal to JSON numbers without quotes, matching API consumer expectations
- Existing pattern used by `AppDailyActionSummary.totalRewardAmount` and navigator models

### Service pattern — parsing event params

Event parameters arrive as strings. Parse to BigDecimal with null-safe fallback:

```kotlin
// Extension for nullable strings from event params
private fun String?.toBigDecimalOrZero(): BigDecimal =
    this?.toBigDecimalOrNull() ?: BigDecimal.ZERO

// Usage in event handler
val stake = ev.params.getAsString("stakeAmount").toBigDecimalOrZero()
```

### Service pattern — arithmetic

Use BigDecimal operators directly (Kotlin overloads `+`, `-`, comparison):

```kotlin
val newTotal = nav.totalDelegated + amount         // addition
val remaining = nav.stake - slashAmount             // subtraction
val clamped = maxOf(BigDecimal.ZERO, nav.stake - amount)  // non-negative
```

### API pattern — serialization

When returning BigDecimal in aggregate DTOs where you want a string representation (e.g., overview endpoints), use `toPlainString()` to avoid scientific notation:

```kotlin
data class Overview(
    val totalStaked: String,  // "125000000000000000000" not "1.25E+20"
)

// In service:
return Overview(totalStaked = sum.toPlainString())
```

### VersionedDocument fields

For stateful entities using `VersionedDocument` + `BaseStatefulProcessor`, BigDecimal fields with DECIMAL128 are fully compatible with the inline versioning system (`_previousVersions` array, rollback, etc.). No special handling needed.
