# Division

A division between two numbers with the same base and exponents $n$ which $n > 0$  will result in keeping the base and subtracting the exponents
$$\frac{x^a}{x^b} = x^{a - b}$$

_Example:_
$$
\frac{2^7}{2^3} = 2^{7 - 3} = 2^4 = 16
$$

## Why this happens?

For example, we'll use this fraction:
$$
\frac{x^3}{x ^ 5}
$$

To understand the rule, under the hood, just expand it

$$
\frac{x^5}{x^3} = \frac{x \times x \times x \times x \times x}{x \times x \times x}
$$
$$
\frac{x^5}{x^3} = \frac{x \times x \times \cancel{\left(x \times x \times x\right)}}{\cancel{\left(x \times x \times x\right)}}
$$
$$
\frac{x^5}{x^3} = x \times x = x^2
$$

# Multiplication 

A multiplication follows the same rule than the division, but with inverted operations. For a multiplication between two numbers with the same base and exponents $n$ which $n > 0$ will result in keeping the base and adding the exponents
$${x^a} \times {x^b} = x^{a+b}$$

_Example:_
$$
3^2 \times 3^2 = 3^{2 + 2} = 3^4 = 81
$$

As in division, this happens stacking the operations together

$$
{x^3} \times {x^7} = (x \times x \times x) \times (x \times x \times x \times x \times x \times x \times x)
$$
$$
x \times x \times x \times x \times x \times x \times x \times x \times x \times x = x^{10}
$$


# Power of Power

We can raise exponential to another power, or take a power of a power. The result is a single exponential where the power is the product of the original exponents

$$
(x^a)^b = x^{a \times b}
$$

_Example:_

$$
\left(2^5\right)^3 = 2^{5 \times 3} = 2^{15} = 32768
$$

# Power of a Product

If we take the power of a product, we can distribute the exponent over the different factors

$$
(xy)^a = x^a \cdot y^a
$$

_Example:_

$$
\left(4 \cdot 7\right)^2 = 4^2 \cdot 7^2 = 16 \cdot 49 = 784
$$

# Changing the sign of exponents

Changing the sign of a exponent gives the reciprocal, so

$$
x^{-a} = \frac{1}{x^a}
$$

_Example:_

$$
2^{-7} = \frac{1}{2^7} = \frac{1}{128} = 0.0078125
$$

# Fractional Exponent

The power of power rule allows us to define fractional exponents. For example, rule tells us that 

$$
9^{\frac12} = (3^2)^{1/2} = 3^1 = 3
$$

Since $(x^n)^{1/n} = x^1 = x$, so we can consider

$$
x^{n/2} = \sqrt[n]{x}
$$

---

# Refs

> Exponentiation Rules
> > [Math Insight](https://mathinsight.org/exponentiation_basic_rules)