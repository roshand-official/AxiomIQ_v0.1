# Security Policy

At **AxiomIQ**, the security and integrity of financial ledgers, recurring subscription contracts, and customer billing identities are our highest priority. We take all vulnerability reports seriously and appreciate the efforts of the security research community.

---

## Supported Versions

Only active, mainline releases receive security patches. Please refer to the table below:

| Version | Supported | Security Patch Status |
|:---|:---:|:---|
| `v0.1.x` (Main / Latest) | :white_check_mark: | Actively supported with high-priority patches |
| `< 0.1.0` | :x: | End of Life (EOL) |

---

## Reporting a Vulnerability

> [!IMPORTANT]
> **Please do not report security vulnerabilities via public GitHub issues, discussions, or social media.**

### Private Disclosure Channels

To report a vulnerability privately, use one of the following methods:

1. **GitHub Private Security Advisory (Preferred)**:
   - Go to [AxiomIQ Security Advisories](https://github.com/roshand-official/AxiomIQ_v0.1/security/advisories/new)
   - Click **"Report a vulnerability"** to submit private details directly to our core security team.

2. **Security Email**:
   - Send encrypted or detailed reports to **`security@axiomiq.io`**.
   - If reporting sensitive reproduction steps, please request our PGP public key beforehand.

---

## What to Include in Your Report

To help us investigate and reproduce the issue rapidly, please provide:
- A descriptive summary of the vulnerability (e.g., IDOR in invoice endpoints, JWT bypass, SQL injection via Prisma query filter).
- Clear, step-by-step reproduction instructions or a Proof of Concept (PoC) script.
- Potential impact and affected endpoints/components.
- Suggested mitigations or code patches, if identified.

---

## Response & Resolution SLA

- **Initial Acknowledgment**: Within **24–48 hours** of report receipt.
- **Triage & Severity Assessment**: Within **3 business days**.
- **Remediation & Patch**:
  - **Critical (CVSS 9.0–10.0)**: Targeted patch within **7 business days**.
  - **High (CVSS 7.0–8.9)**: Targeted patch within **14 business days**.
  - **Medium / Low**: Next scheduled release cycle.

---

## Safe Harbor Policy

We consider security research conducted under this policy to be authorized. We will not pursue legal action against researchers who:
- Make a good-faith effort to avoid privacy violations, data destruction, and service interruption.
- Give AxiomIQ reasonable time to remediate issues before making details public.
- Do not access, modify, or exfiltrate private customer or corporate financial data.
