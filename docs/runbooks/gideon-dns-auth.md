# Runbook: GIDEON DNS/Auth Validation

**Owner:** GIDEON (subagent)  
**Oversight:** Howard (main)  
**Created:** 2026-03-08  

---

## 1. Objective
Validate DNS configuration and authentication flow for the OpenClaw platform. Identify and resolve bottlenecks in the auth pipeline.

## 2. Current State
- Validation in progress; checkpoint expected at 22:10.
- DNS and auth surfaces have been inventoried but not fully verified.

## 3. Procedures

### 3.1 DNS Validation
1. Enumerate all DNS records (A, CNAME, TXT, MX) for relevant domains.
2. Verify propagation using `dig` / `nslookup` against multiple resolvers.
3. Confirm TTL values are appropriate (low for migration, standard for steady state).
4. Check for stale/orphaned records.
5. Document findings in `docs/gideon/dns-validation-report.md`.

### 3.2 Auth Flow Validation
1. Map the full authentication flow (login → token issue → token refresh → logout).
2. Test each step: valid credentials, invalid credentials, expired tokens, revoked tokens.
3. Verify secret rotation policies are in place and functioning.
4. Check for common auth misconfigurations (open redirects, token leakage, missing CSRF).
5. Document findings in `docs/gideon/auth-validation-report.md`.

### 3.3 Bottleneck Resolution
1. Identify latency or failure points from validation reports.
2. Propose fixes with estimated effort and risk.
3. Implement fixes in a staging/test environment first.
4. Retest after fixes; confirm no regressions.

## 4. Rollback Plan
- DNS: Revert records to pre-change snapshot (keep backup of current zone file before any changes).
- Auth: Revert config changes via git; rotate any exposed secrets immediately.

## 5. Success Criteria
- All DNS records resolve correctly from ≥3 external resolvers.
- Auth flow passes all test cases (valid, invalid, expired, revoked).
- No open bottlenecks or unresolved findings.
- Runbook and validation reports committed to workspace.

## 6. Escalation
- Blockers → Howard (main) → Aaron.
- Security incidents → immediate escalation to Aaron.
